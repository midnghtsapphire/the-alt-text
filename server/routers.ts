import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "./_core/llm";
import { nanoid } from "nanoid";
import { createHash } from "crypto";
import {
  getOrCreateSubscription, updateSubscription,
  createImageAnalysis, updateImageAnalysis, getUserImageAnalyses, getUserStats,
  createApiKey, getUserApiKeys, deactivateApiKey,
  createBatchJob, getUserBatchJobs, updateBatchJob,
  getAdminStats,
} from "./db";
import { PLANS } from "./plans";

// ============================================================================
// HELPER: Hash API key
// ============================================================================
function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

// ============================================================================
// ALT TEXT GENERATION (OpenRouter via built-in LLM)
// ============================================================================
async function generateAltTextFromImage(imageUrl: string, pageContext?: string, surroundingText?: string) {
  const startTime = Date.now();

  const systemPrompt = `You are an expert accessibility specialist. Generate concise, descriptive alt text for images following WCAG 2.1 AA guidelines.

Rules:
- Be descriptive but concise (typically 10-125 characters)
- Describe the content and function of the image
- Don't start with "Image of" or "Picture of"
- Include relevant text visible in the image
- For decorative images, indicate they are decorative
- Consider the surrounding page context when provided
- Return a JSON object with: altText, confidence (0-100), imageType (photo|illustration|icon|chart|screenshot|decorative|unknown), wcagCompliance (pass|fail|warning)`;

  const userContent: Array<{ type: string; text?: string; image_url?: { url: string; detail: string } }> = [
    {
      type: "image_url",
      image_url: { url: imageUrl, detail: "high" },
    },
    {
      type: "text",
      text: `Generate alt text for this image.${pageContext ? ` Page context: ${pageContext}` : ""}${surroundingText ? ` Surrounding text: ${surroundingText}` : ""}`,
    },
  ];

  const result = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent as any },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "alt_text_result",
        strict: true,
        schema: {
          type: "object",
          properties: {
            altText: { type: "string", description: "The generated alt text" },
            confidence: { type: "number", description: "Confidence score 0-100" },
            imageType: { type: "string", enum: ["photo", "illustration", "icon", "chart", "screenshot", "decorative", "unknown"] },
            wcagCompliance: { type: "string", enum: ["pass", "fail", "warning"] },
          },
          required: ["altText", "confidence", "imageType", "wcagCompliance"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = result.choices[0]?.message?.content;
  const parsed = JSON.parse(typeof content === "string" ? content : "{}");
  const processingTimeMs = Date.now() - startTime;
  const tokensUsed = result.usage?.total_tokens || 0;

  return {
    altText: parsed.altText || "Unable to generate alt text",
    confidence: parsed.confidence || 0,
    imageType: parsed.imageType || "unknown",
    wcagCompliance: parsed.wcagCompliance || "warning",
    processingTimeMs,
    tokensUsed,
    modelUsed: result.model || "gemini-2.5-flash",
  };
}

// ============================================================================
// ROUTERS
// ============================================================================
export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============================================================================
  // SUBSCRIPTION MANAGEMENT
  // ============================================================================
  subscription: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const sub = await getOrCreateSubscription(ctx.user.id);
      return sub;
    }),

    getPlans: publicProcedure.query(() => {
      return PLANS;
    }),

    upgrade: protectedProcedure
      .input(z.object({ plan: z.enum(["pro", "enterprise"]) }))
      .mutation(async ({ input, ctx }) => {
        const planConfig = PLANS.find(p => p.id === input.plan);
        if (!planConfig) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid plan" });

        // In production, this would create a Stripe checkout session
        // For now, update the subscription directly
        await updateSubscription(ctx.user.id, {
          plan: input.plan,
          status: "active",
          imagesPerMonth: planConfig.imagesPerMonth,
          bulkUploadsPerMonth: planConfig.bulkUploadsPerMonth,
          apiCallsPerMonth: planConfig.apiCallsPerMonth,
        });

        return { success: true, plan: input.plan };
      }),

    cancel: protectedProcedure.mutation(async ({ ctx }) => {
      await updateSubscription(ctx.user.id, {
        plan: "free",
        status: "active",
        imagesPerMonth: 50,
        bulkUploadsPerMonth: 0,
        apiCallsPerMonth: 0,
        cancelledAt: new Date(),
      });
      return { success: true };
    }),
  }),

  // ============================================================================
  // AI ALT TEXT GENERATION
  // ============================================================================
  alttext: router({
    generate: protectedProcedure
      .input(z.object({
        imageUrl: z.string().url(),
        pageContext: z.string().optional(),
        surroundingText: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Check subscription limits
        const sub = await getOrCreateSubscription(ctx.user.id);
        if (!sub) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Subscription not found" });

        if (sub.imagesUsedThisMonth >= sub.imagesPerMonth) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Monthly image limit reached. Please upgrade your plan." });
        }

        // Create analysis record
        const record = await createImageAnalysis({
          userId: ctx.user.id,
          imageUrl: input.imageUrl,
          pageContext: input.pageContext || null,
          surroundingText: input.surroundingText || null,
          status: "processing",
        });

        try {
          const result = await generateAltTextFromImage(input.imageUrl, input.pageContext, input.surroundingText);

          // Update record with results
          if (record) {
            await updateImageAnalysis(record.id, {
              generatedAltText: result.altText,
              confidence: result.confidence.toString(),
              imageType: result.imageType as any,
              wcagCompliance: result.wcagCompliance as any,
              processingTimeMs: result.processingTimeMs,
              tokensUsed: result.tokensUsed,
              modelUsed: result.modelUsed,
              status: "completed",
            });
          }

          // Increment usage
          await updateSubscription(ctx.user.id, {
            imagesUsedThisMonth: sub.imagesUsedThisMonth + 1,
          });

          return {
            id: record?.id,
            altText: result.altText,
            confidence: result.confidence,
            imageType: result.imageType,
            wcagCompliance: result.wcagCompliance,
            processingTimeMs: result.processingTimeMs,
          };
        } catch (error: any) {
          if (record) {
            await updateImageAnalysis(record.id, {
              status: "failed",
              errorMessage: error.message,
            });
          }
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to generate alt text: " + error.message });
        }
      }),

    history: protectedProcedure
      .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }))
      .query(async ({ input, ctx }) => {
        return getUserImageAnalyses(ctx.user.id, input.limit, input.offset);
      }),

    stats: protectedProcedure.query(async ({ ctx }) => {
      const stats = await getUserStats(ctx.user.id);
      const sub = await getOrCreateSubscription(ctx.user.id);
      return {
        ...stats,
        plan: sub?.plan || "free",
        imagesPerMonth: sub?.imagesPerMonth || 50,
        imagesUsedThisMonth: sub?.imagesUsedThisMonth || 0,
        complianceScore: stats.completedImages > 0
          ? Math.round((stats.completedImages / Math.max(stats.totalImages, 1)) * 100)
          : 100,
      };
    }),
  }),

  // ============================================================================
  // BULK PROCESSING
  // ============================================================================
  bulk: router({
    create: protectedProcedure
      .input(z.object({
        imageUrls: z.array(z.string().url()).min(1).max(100),
        pageContext: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const sub = await getOrCreateSubscription(ctx.user.id);
        if (!sub) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Subscription not found" });

        if (sub.plan === "free") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Bulk processing requires a Pro or Enterprise plan." });
        }

        const remaining = sub.imagesPerMonth - sub.imagesUsedThisMonth;
        if (input.imageUrls.length > remaining) {
          throw new TRPCError({ code: "FORBIDDEN", message: `Only ${remaining} images remaining this month.` });
        }

        const batchId = nanoid(16);
        const job = await createBatchJob({
          userId: ctx.user.id,
          name: `Batch ${new Date().toISOString().split("T")[0]}`,
          totalImages: input.imageUrls.length,
          processedImages: 0,
          failedImages: 0,
          status: "processing",
          startedAt: new Date(),
        });

        // Process images sequentially (in production, use a job queue)
        const results: Array<{ imageUrl: string; altText: string; confidence: number; status: string }> = [];

        for (const imageUrl of input.imageUrls) {
          try {
            const record = await createImageAnalysis({
              userId: ctx.user.id,
              imageUrl,
              pageContext: input.pageContext || null,
              status: "processing",
              batchId,
            });

            const result = await generateAltTextFromImage(imageUrl, input.pageContext);

            if (record) {
              await updateImageAnalysis(record.id, {
                generatedAltText: result.altText,
                confidence: result.confidence.toString(),
                imageType: result.imageType as any,
                wcagCompliance: result.wcagCompliance as any,
                processingTimeMs: result.processingTimeMs,
                tokensUsed: result.tokensUsed,
                modelUsed: result.modelUsed,
                status: "completed",
              });
            }

            results.push({ imageUrl, altText: result.altText, confidence: result.confidence, status: "completed" });

            if (job) {
              await updateBatchJob(job.id, { processedImages: results.length });
            }
          } catch (error: any) {
            results.push({ imageUrl, altText: "", confidence: 0, status: "failed" });
            if (job) {
              await updateBatchJob(job.id, { failedImages: (job as any).failedImages + 1 });
            }
          }
        }

        // Update subscription usage
        const successCount = results.filter(r => r.status === "completed").length;
        await updateSubscription(ctx.user.id, {
          imagesUsedThisMonth: sub.imagesUsedThisMonth + successCount,
        });

        if (job) {
          await updateBatchJob(job.id, {
            status: "completed",
            completedAt: new Date(),
            processedImages: successCount,
            failedImages: results.filter(r => r.status === "failed").length,
          });
        }

        return { batchId, results, jobId: job?.id };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserBatchJobs(ctx.user.id);
    }),
  }),

  // ============================================================================
  // API KEY MANAGEMENT
  // ============================================================================
  apikeys: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserApiKeys(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({ name: z.string().min(1).max(100) }))
      .mutation(async ({ input, ctx }) => {
        const sub = await getOrCreateSubscription(ctx.user.id);
        if (!sub || sub.plan === "free") {
          throw new TRPCError({ code: "FORBIDDEN", message: "API access requires a Pro or Enterprise plan." });
        }

        const rawKey = `tat_live_${nanoid(32)}`;
        const keyHash = hashApiKey(rawKey);
        const keyPrefix = rawKey.substring(0, 12);

        const planConfig = PLANS.find(p => p.id === sub.plan);

        await createApiKey({
          userId: ctx.user.id,
          name: input.name,
          keyHash,
          keyPrefix,
          rateLimit: sub.plan === "enterprise" ? 120 : 60,
          monthlyLimit: planConfig?.apiCallsPerMonth || 1000,
        });

        // Return the raw key only once
        return { key: rawKey, prefix: keyPrefix };
      }),

    revoke: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await deactivateApiKey(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // ============================================================================
  // ADMIN DASHBOARD
  // ============================================================================
  admin: router({
    stats: adminProcedure.query(async () => {
      return getAdminStats();
    }),
  }),
});

export type AppRouter = typeof appRouter;
