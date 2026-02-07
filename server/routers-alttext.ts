import { z } from "zod";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import {
  altTextSubscriptions,
  altTextScans,
  altTextScanResults,
  altTextImageAnalysis,
  altTextFixes,
  altTextReports,
  altTextApiKeys,
  altTextApiLogs,
  altTextWebhooks,
} from "../drizzle/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { ALT_TEXT_PLANS, calculateROI } from "./alttext-products";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-12-15.clover",
});

/**
 * THE ALT TEXT - CORE API ROUTER
 * thealttext.com
 */
export const altTextRouter = router({
  // ============================================================================
  // SHOPPING CART & SUBSCRIPTION
  // ============================================================================

  /**
   * Get all available plans
   */
  getPlans: publicProcedure.query(async () => {
    return {
      plans: Object.entries(ALT_TEXT_PLANS).map(([key, plan]) => ({
        id: key,
        ...plan,
      })),
    };
  }),

  /**
   * Create Stripe checkout session for subscription
   */
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        plan: z.enum(["starter", "professional", "enterprise"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });
      }

      const plan = ALT_TEXT_PLANS[input.plan];

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        customer_email: ctx.user.email || undefined,
        client_reference_id: ctx.user.id.toString(),
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: plan.priceId,
            quantity: 1,
          },
        ],
        subscription_data: {
          trial_period_days:
            input.plan === "starter" ? 7 : input.plan === "professional" ? 14 : 30,
          metadata: {
            user_id: ctx.user.id.toString(),
            plan: input.plan,
          },
        },
        metadata: {
          user_id: ctx.user.id.toString(),
          plan: input.plan,
        },
        success_url: `${ctx.req.headers.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${ctx.req.headers.origin}/pricing`,
        allow_promotion_codes: true,
      });

      return {
        checkoutUrl: session.url,
        sessionId: session.id,
      };
    }),

  /**
   * Get user's current subscription
   */
  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database unavailable",
      });
    }

    const [subscription] = await db
      .select()
      .from(altTextSubscriptions)
      .where(eq(altTextSubscriptions.userId, ctx.user.id))
      .orderBy(desc(altTextSubscriptions.createdAt))
      .limit(1);

    return subscription || null;
  }),

  /**
   * Cancel subscription
   */
  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database unavailable",
      });
    }

    const [subscription] = await db
      .select()
      .from(altTextSubscriptions)
      .where(
        and(
          eq(altTextSubscriptions.userId, ctx.user.id),
          eq(altTextSubscriptions.status, "active")
        )
      )
      .limit(1);

    if (!subscription) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No active subscription found",
      });
    }

    // Cancel Stripe subscription
    if (subscription.stripeSubscriptionId) {
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
    }

    // Update database
    await db
      .update(altTextSubscriptions)
      .set({
        status: "cancelled",
        cancelledAt: new Date(),
      })
      .where(eq(altTextSubscriptions.id, subscription.id));

    return { success: true };
  }),

  // ============================================================================
  // WEBSITE SCANNING
  // ============================================================================

  /**
   * Start website accessibility scan
   */
  startScan: protectedProcedure
    .input(
      z.object({
        websiteUrl: z.string().url(),
        scanType: z.enum(["full", "single_page", "custom"]).default("full"),
        maxPages: z.number().default(50),
        includeSubdomains: z.boolean().default(false),
        customUrls: z.array(z.string().url()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });
      }

      // Get user's subscription
      const [subscription] = await db
        .select()
        .from(altTextSubscriptions)
        .where(
          and(
            eq(altTextSubscriptions.userId, ctx.user.id),
            eq(altTextSubscriptions.status, "active")
          )
        )
        .limit(1);

      if (!subscription) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Active subscription required",
        });
      }

      // Check usage limits
      if (
        subscription.maxScansPerMonth !== -1 &&
        subscription.scansUsedThisMonth >= subscription.maxScansPerMonth
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Monthly scan limit reached",
        });
      }

      // Create scan record
      const [scan] = await db.insert(altTextScans).values({
        userId: ctx.user.id,
        subscriptionId: subscription.id,
        websiteUrl: input.websiteUrl,
        scanType: input.scanType,
        maxPages: Math.min(input.maxPages, subscription.maxPagesPerScan),
        includeSubdomains: input.includeSubdomains,
        customUrls: input.customUrls ? JSON.stringify(input.customUrls) : null,
        status: "pending",
      });

      // Update subscription usage
      await db
        .update(altTextSubscriptions)
        .set({
          scansUsedThisMonth: subscription.scansUsedThisMonth + 1,
        })
        .where(eq(altTextSubscriptions.id, subscription.id));

      // TODO: Trigger background job to perform scan
      // This would use Playwright to crawl the website and analyze images

      return {
        scanId: scan.insertId,
        status: "pending",
      };
    }),

  /**
   * Get scan status and results
   */
  getScan: protectedProcedure
    .input(
      z.object({
        scanId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });
      }

      const [scan] = await db
        .select()
        .from(altTextScans)
        .where(
          and(
            eq(altTextScans.id, input.scanId),
            eq(altTextScans.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!scan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Scan not found",
        });
      }

      // Get scan results
      const results = await db
        .select()
        .from(altTextScanResults)
        .where(eq(altTextScanResults.scanId, input.scanId))
        .orderBy(desc(altTextScanResults.scannedAt));

      return {
        scan,
        results,
      };
    }),

  /**
   * List user's scans
   */
  listScans: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });
      }

      const scans = await db
        .select()
        .from(altTextScans)
        .where(eq(altTextScans.userId, ctx.user.id))
        .orderBy(desc(altTextScans.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return scans;
    }),

  // ============================================================================
  // AI ALT TEXT GENERATION
  // ============================================================================

  /**
   * Generate alt text for an image
   */
  generateAltText: protectedProcedure
    .input(
      z.object({
        imageUrl: z.string().url(),
        pageContext: z.string().optional(),
        surroundingText: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // TODO: Use invokeLLM with vision model to analyze image
      // For now, return placeholder
      const generatedAltText = `AI-generated description for ${input.imageUrl}`;
      const confidence = 85;

      return {
        generatedAltText,
        confidence,
        imageType: "photo" as const,
      };
    }),

  /**
   * Get image analysis for a scan
   */
  getImageAnalysis: protectedProcedure
    .input(
      z.object({
        scanId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });
      }

      // Verify scan belongs to user
      const [scan] = await db
        .select()
        .from(altTextScans)
        .where(
          and(
            eq(altTextScans.id, input.scanId),
            eq(altTextScans.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!scan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Scan not found",
        });
      }

      // Get all image analysis for this scan
      const analysis = await db
        .select()
        .from(altTextImageAnalysis)
        .where(
          sql`${altTextImageAnalysis.scanResultId} IN (
            SELECT id FROM ${altTextScanResults} WHERE scan_id = ${input.scanId}
          )`
        )
        .orderBy(desc(altTextImageAnalysis.analyzedAt));

      return analysis;
    }),

  // ============================================================================
  // COMPLIANCE REPORTS
  // ============================================================================

  /**
   * Generate compliance report
   */
  generateReport: protectedProcedure
    .input(
      z.object({
        scanId: z.number(),
        reportType: z
          .enum(["summary", "detailed", "executive", "technical"])
          .default("summary"),
        format: z.enum(["pdf", "html", "json"]).default("pdf"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });
      }

      // Get scan
      const [scan] = await db
        .select()
        .from(altTextScans)
        .where(
          and(
            eq(altTextScans.id, input.scanId),
            eq(altTextScans.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!scan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Scan not found",
        });
      }

      // Calculate ROI
      const roi = calculateROI({
        imagesMissingAlt: scan.imagesMissingAlt,
        pagesScanned: scan.pagesScanned,
      });

      // Create report record
      const [report] = await db.insert(altTextReports).values({
        scanId: input.scanId,
        userId: ctx.user.id,
        reportType: input.reportType,
        format: input.format,
        summary: JSON.stringify({
          totalImages: scan.imagesFound,
          imagesMissingAlt: scan.imagesMissingAlt,
          imagesWithEmptyAlt: scan.imagesWithEmptyAlt,
          imagesWithGoodAlt: scan.imagesWithGoodAlt,
          complianceScore: scan.complianceScore,
          pagesScanned: scan.pagesScanned,
        }),
        violations: JSON.stringify([]), // TODO: Populate with actual violations
        recommendations: JSON.stringify([]), // TODO: Populate with recommendations
        estimatedLawsuitRisk: roi.estimatedLawsuitRisk.toString(),
        estimatedCostSavings: roi.estimatedCostSavings.toString(),
        roiPercentage: roi.roiPercentage.toString(),
        status: "generating",
      });

      // TODO: Trigger background job to generate PDF/HTML report

      return {
        reportId: report.insertId,
        status: "generating",
        roi,
      };
    }),

  /**
   * Get report
   */
  getReport: protectedProcedure
    .input(
      z.object({
        reportId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });
      }

      const [report] = await db
        .select()
        .from(altTextReports)
        .where(
          and(
            eq(altTextReports.id, input.reportId),
            eq(altTextReports.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!report) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Report not found",
        });
      }

      return report;
    }),

  // ============================================================================
  // API KEY MANAGEMENT
  // ============================================================================

  /**
   * Create API key
   */
  createApiKey: protectedProcedure
    .input(
      z.object({
        keyName: z.string().min(1),
        permissions: z.array(z.enum(["scan", "fix", "report"])),
        rateLimit: z.number().default(100),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });
      }

      // Generate API key
      const apiKey = `alt_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      const keyHash = Buffer.from(apiKey).toString("base64"); // TODO: Use proper hashing
      const keyPrefix = apiKey.substring(0, 8);

      // Create API key record
      const [key] = await db.insert(altTextApiKeys).values({
        userId: ctx.user.id,
        keyName: input.keyName,
        keyHash,
        keyPrefix,
        permissions: JSON.stringify(input.permissions),
        rateLimit: input.rateLimit,
        status: "active",
      });

      return {
        apiKey, // Only returned once!
        keyId: key.insertId,
        keyPrefix,
      };
    }),

  /**
   * List API keys
   */
  listApiKeys: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database unavailable",
      });
    }

    const keys = await db
      .select()
      .from(altTextApiKeys)
      .where(eq(altTextApiKeys.userId, ctx.user.id))
      .orderBy(desc(altTextApiKeys.createdAt));

    return keys;
  }),

  /**
   * Revoke API key
   */
  revokeApiKey: protectedProcedure
    .input(
      z.object({
        keyId: z.number(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });
      }

      await db
        .update(altTextApiKeys)
        .set({
          status: "revoked",
          revokedAt: new Date(),
          revokedReason: input.reason,
        })
        .where(
          and(
            eq(altTextApiKeys.id, input.keyId),
            eq(altTextApiKeys.userId, ctx.user.id)
          )
        );

      return { success: true };
    }),

  // ============================================================================
  // ADMIN PANEL PROCEDURES
  // ============================================================================

  /**
   * Get pending AI-generated alt text reviews (admin only)
   */
  getPendingReviews: adminProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const reviews = await db
      .select()
      .from(altTextImageAnalysis)
      .where(eq(altTextImageAnalysis.status, "pending"))
      .orderBy(desc(altTextImageAnalysis.analyzedAt))
      .limit(50);
    
    return reviews;
  }),

  /**
   * Get all users with subscription info (admin only)
   */
  getAllUsers: adminProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const users = await db
      .select({
        id: altTextSubscriptions.userId,
        email: sql<string>`(SELECT email FROM user WHERE id = ${altTextSubscriptions.userId})`,
        planType: altTextSubscriptions.plan,
        scansUsed: altTextSubscriptions.scansUsedThisMonth,
        scansLimit: altTextSubscriptions.maxScansPerMonth,
        totalRevenue: altTextSubscriptions.price,
        createdAt: altTextSubscriptions.createdAt,
        status: altTextSubscriptions.status,
      })
      .from(altTextSubscriptions)
      .orderBy(desc(altTextSubscriptions.createdAt));
    
    return users;
  }),

  /**
   * Get system health status (admin only)
   */
  getSystemHealth: adminProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    
    // Check API status
    const apiStatus = "healthy"; // TODO: Implement actual health check
    
    // Check database status
    let databaseStatus = "healthy";
    try {
      if (db) await db.select().from(altTextSubscriptions).limit(1);
    } catch (error) {
      databaseStatus = "unhealthy";
    }
    
    // Check job queue status
    const queueStatus = "healthy"; // TODO: Implement BullMQ health check
    
    // Get external API status
    const externalApis = [
      { name: "OpenRouter Vision API", status: "healthy", responseTime: 250 },
      { name: "Playwright Scanner", status: "healthy", responseTime: 150 },
      { name: "Puppeteer Reporter", status: "healthy", responseTime: 300 },
      { name: "CodeRabbit API", status: "healthy", responseTime: 200 },
    ];
    
    // Get recent errors
    const recentErrors: any[] = []; // TODO: Implement error logging
    
    return {
      apiStatus,
      databaseStatus,
      queueStatus,
      externalApis,
      recentErrors,
    };
  }),

  /**
   * Approve AI-generated alt text (admin only)
   */
  approveAltText: adminProcedure
    .input(z.object({ imageId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      
      if (!db) throw new Error('Database not available');
      await db
        .update(altTextImageAnalysis)
        .set({ status: "approved", reviewedAt: new Date() })
        .where(eq(altTextImageAnalysis.id, input.imageId));
      
      return { success: true };
    }),

  /**
   * Reject AI-generated alt text (admin only)
   */
  rejectAltText: adminProcedure
    .input(z.object({ imageId: z.number(), reason: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      
      if (!db) throw new Error('Database not available');
      await db
        .update(altTextImageAnalysis)
        .set({ 
          status: "rejected",
          reviewedAt: new Date() 
        })
        .where(eq(altTextImageAnalysis.id, input.imageId));
      
      return { success: true };
    }),

  /**
   * Get admin statistics (admin only)
   */
  adminGetStats: adminProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    
    // Count total users
    if (!db) throw new Error('Database not available');
    const [{ count: totalUsers }] = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${altTextSubscriptions.userId})` })
      .from(altTextSubscriptions);
    
    // Count active scans
    if (!db) throw new Error('Database not available');
    const [{ count: activeScans }] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(altTextScans)
      .where(sql`${altTextScans.status} = 'in_progress'`);
    
    // Calculate monthly revenue
    if (!db) throw new Error('Database not available');
    const [{ sum: monthlyRevenue }] = await db
      .select({ sum: sql<number>`SUM(CAST(${altTextSubscriptions.price} AS DECIMAL))` })
      .from(altTextSubscriptions)
      .where(eq(altTextSubscriptions.status, "active"));
    
    // Count pending reviews
    if (!db) throw new Error('Database not available');
    const [{ count: pendingReviews }] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(altTextImageAnalysis)
      .where(eq(altTextImageAnalysis.status, "pending"));
    
    return {
      totalUsers: Number(totalUsers) || 0,
      activeScans: Number(activeScans) || 0,
      monthlyRevenue: Number(monthlyRevenue) || 0,
      pendingReviews: Number(pendingReviews) || 0,
    };
  }),
});
