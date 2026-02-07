import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { headhunterRouter } from "./routers/headhunter";
import { stripeHeadhunterRouter } from "./routers/stripe-headhunter";
import { taxRouter } from "./routes/tax";
import { securityRouter } from "./routers/security";
import { commerceRouter } from "./routers/commerce";
import { universalApiRouter } from "./routers/universal-api";
import { neurodivergentRouter, profileRouter } from "./routers/neurodivergent";
import { aiRouter } from "./routers/ai";
import { ozRouter } from "./routers/oz";
import { rewardsRouter } from "./routers/rewards";
import { brandingRouter } from "./routers/branding";
import { affiliateRouter } from "./routers/affiliate";
import { inventorRouter } from "./routers/inventor";
import { altTextRouter } from "./routers-alttext";
import { affiliateLinkRouter } from "./routers-affiliate-links";
import { ozMarketingRouter } from "./routers-oz-marketing";
import { socialAutoPosterRouter } from "./routers-social-autoposter";
import { freeImagesRouter } from "./routers-free-images";
import { trialRouter } from "./routers-trial";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  branding: brandingRouter,
  affiliate: affiliateRouter,
  inventor: inventorRouter,
  alttext: altTextRouter,
  affiliateLinks: affiliateLinkRouter,
  ozMarketing: ozMarketingRouter,
  socialAutoPoster: socialAutoPosterRouter,
  freeImages: freeImagesRouter,
  trial: trialRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  topics: router({
    list: publicProcedure.query(async () => {
      return await db.getAllTopics();
    }),
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return await db.getTopicBySlug(input.slug);
      }),
  }),

  qa: router({
    list: publicProcedure.query(async () => {
      return await db.getAllQAItems();
    }),
    byTopic: publicProcedure
      .input(z.object({ topicId: z.number() }))
      .query(async ({ input }) => {
        return await db.getQAItemsByTopic(input.topicId);
      }),
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const item = await db.getQAItemBySlug(input.slug);
        if (item) {
          await db.incrementQAViewCount(item.id);
        }
        return item;
      }),
    search: publicProcedure
      .input(z.object({ 
        query: z.string(),
        topicId: z.number().optional()
      }))
      .query(async ({ input }) => {
        return await db.searchQAItems(input.query, input.topicId);
      }),
    related: publicProcedure
      .input(z.object({ qaItemId: z.number() }))
      .query(async ({ input }) => {
        return await db.getRelatedQuestions(input.qaItemId);
      }),
  }),

  resources: router({
    list: publicProcedure.query(async () => {
      return await db.getAllResources();
    }),
    byCategory: publicProcedure
      .input(z.object({ category: z.string() }))
      .query(async ({ input }) => {
        return await db.getResourcesByCategory(input.category);
      }),
  }),

  statistics: router({
    all: publicProcedure.query(async () => {
      return await db.getAllStatistics();
    }),
    byType: publicProcedure
      .input(z.object({ type: z.string() }))
      .query(async ({ input }) => {
        return await db.getStatisticsByType(input.type);
      }),
  }),

  sources: router({
    list: publicProcedure.query(async () => {
      return await db.getAllSources();
    }),
  }),

  bookmarks: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserBookmarks(ctx.user.id);
    }),
    add: protectedProcedure
      .input(z.object({ qaItemId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.addBookmark(ctx.user.id, input.qaItemId);
        return { success: true };
      }),
    remove: protectedProcedure
      .input(z.object({ qaItemId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.removeBookmark(ctx.user.id, input.qaItemId);
        return { success: true };
      }),
    isBookmarked: protectedProcedure
      .input(z.object({ qaItemId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.isBookmarked(ctx.user.id, input.qaItemId);
      }),
  }),

  nomad: router({
    locations: publicProcedure.query(async () => {
      return await db.getAllLocations();
    }),
    locationBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return await db.getLocationBySlug(input.slug);
      }),
    relocationSteps: publicProcedure
      .input(z.object({ 
        locationId: z.number(),
        phase: z.enum(["pre_departure", "post_arrival"]).optional()
      }))
      .query(async ({ input }) => {
        return await db.getRelocationStepsByLocation(input.locationId, input.phase);
      }),
    trainingPrograms: publicProcedure.query(async () => {
      return await db.getAllTrainingPrograms();
    }),
    calculateJobProbability: publicProcedure
      .input(z.object({
        locationId: z.number(),
        experienceLevel: z.enum(["entry", "mid", "senior", "expert"]),
        hasApprenticeship: z.boolean(),
        hasCertification: z.boolean(),
        hasDegree: z.boolean()
      }))
      .query(async ({ input }) => {
        return await db.getJobProbability(input);
      }),
  }),

  progress: router({
    createPlan: protectedProcedure
      .input(z.object({
        locationId: z.number(),
        targetMoveDate: z.string().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        const targetDate = input.targetMoveDate ? new Date(input.targetMoveDate) : undefined;
        const planId = await db.createRelocationPlan(ctx.user.id, input.locationId, targetDate);
        return { planId };
      }),
    myPlans: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserRelocationPlans(ctx.user.id);
    }),
    getPlan: protectedProcedure
      .input(z.object({ planId: z.number() }))
      .query(async ({ input }) => {
        return await db.getRelocationPlanById(input.planId);
      }),
    updateStatus: protectedProcedure
      .input(z.object({
        planId: z.number(),
        status: z.enum(["planning", "preparing", "relocating", "settled", "cancelled"])
      }))
      .mutation(async ({ input }) => {
        await db.updateRelocationPlanStatus(input.planId, input.status);
        return { success: true };
      }),
    getStepProgress: protectedProcedure
      .input(z.object({ planId: z.number() }))
      .query(async ({ input }) => {
        return await db.getStepProgressForPlan(input.planId);
      }),
    updateStepProgress: protectedProcedure
      .input(z.object({
        relocationPlanId: z.number(),
        stepId: z.number(),
        isCompleted: z.boolean().optional(),
        completedAt: z.string().nullable().optional(),
        dueDate: z.string().nullable().optional(),
        notes: z.string().nullable().optional()
      }))
      .mutation(async ({ input }) => {
        const data: any = {
          relocationPlanId: input.relocationPlanId,
          stepId: input.stepId
        };
        if (input.isCompleted !== undefined) data.isCompleted = input.isCompleted;
        if (input.completedAt !== undefined) data.completedAt = input.completedAt ? new Date(input.completedAt) : null;
        if (input.dueDate !== undefined) data.dueDate = input.dueDate ? new Date(input.dueDate) : null;
        if (input.notes !== undefined) data.notes = input.notes;
        
        const progressId = await db.upsertStepProgress(data);
        return { progressId };
      }),
    addDocument: protectedProcedure
      .input(z.object({
        stepProgressId: z.number(),
        fileName: z.string(),
        fileUrl: z.string(),
        fileKey: z.string(),
        fileSize: z.number().optional(),
        mimeType: z.string().optional()
      }))
      .mutation(async ({ input }) => {
        const documentId = await db.addStepDocument(input);
        return { documentId };
      }),
    getDocuments: protectedProcedure
      .input(z.object({ stepProgressId: z.number() }))
      .query(async ({ input }) => {
        return await db.getDocumentsForStepProgress(input.stepProgressId);
      }),
    deleteDocument: protectedProcedure
      .input(z.object({ documentId: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteStepDocument(input.documentId);
        return { success: true };
      }),
  }),
  employers: router({
    list: publicProcedure.query(async () => {
      return await db.getAllEmployers();
    }),
    byLocation: publicProcedure
      .input(z.object({ locationId: z.number() }))
      .query(async ({ input }) => {
        return await db.getEmployersByLocation(input.locationId);
      }),
    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getEmployerById(input.id);
      }),
  }),
  jobs: router({
    list: publicProcedure.query(async () => {
      return await db.getAllJobOpenings();
    }),
    byLocation: publicProcedure
      .input(z.object({ locationId: z.number() }))
      .query(async ({ input }) => {
        return await db.getJobOpeningsByLocation(input.locationId);
      }),
    byEmployer: publicProcedure
      .input(z.object({ employerId: z.number() }))
      .query(async ({ input }) => {
        return await db.getJobOpeningsByEmployer(input.employerId);
      }),
    search: publicProcedure
      .input(z.object({
        locationId: z.number().optional(),
        experienceLevel: z.string().optional(),
        jobType: z.string().optional(),
        searchTerm: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.searchJobOpenings(input);
      }),
  }),
  share: router({
    generateShareLink: protectedProcedure
      .input(z.object({ planId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        // Generate a unique share token
        const shareToken = `${ctx.user.id}-${input.planId}-${Date.now()}`;
        const shareUrl = `/share/progress/${shareToken}`;
        return { shareUrl, shareToken };
      }),
    getSharedProgress: publicProcedure
      .input(z.object({ shareToken: z.string() }))
      .query(async ({ input }) => {
        // Parse share token to get planId
        const parts = input.shareToken.split('-');
        if (parts.length < 2) return null;
        
        const planId = parseInt(parts[1]!);
        const plan = await db.getRelocationPlanById(planId);
        if (!plan) return null;
        
        const progress = await db.getStepProgressForPlan(planId);
        const allLocations = await db.getAllLocations();
        const location = allLocations.find(l => l.id === plan.locationId);
        
        return { plan, progress, location };
      }),
  }),

  changelog: router({
    list: publicProcedure
      .input(z.object({ 
        color: z.enum(["red", "blue", "yellow", "green"]).optional() 
      }))
      .query(async ({ input }) => {
        return await db.getContentVersions(input.color);
      }),
    byContent: publicProcedure
      .input(z.object({ 
        contentType: z.enum(["qa", "statistic", "resource", "location"]),
        contentId: z.number()
      }))
      .query(async ({ input }) => {
        return await db.getContentVersionsByContent(input.contentType, input.contentId);
      }),
  }),

  admin: router({
    verificationStatus: publicProcedure.query(async () => {
      return await db.getVerificationStatus();
    }),
    linkHealth: publicProcedure.query(async () => {
      return await db.getLinkHealthStatus();
    }),
    updateFactVerification: publicProcedure
      .input(z.object({
        contentType: z.enum(["qa", "statistic", "resource", "location"]),
        contentId: z.number(),
        status: z.enum(["pending", "verified", "needs_review", "failed"]),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.updateFactVerification(
          input.contentType,
          input.contentId,
          input.status,
          input.notes
        );
      }),
  }),

  suggestions: router({
    list: publicProcedure
      .input(z.object({
        status: z.enum(["new", "reviewing", "planned", "in_progress", "completed", "declined"]).optional(),
      }))
      .query(async ({ input }) => {
        return await db.getFeatureSuggestions(input.status);
      }),
    create: publicProcedure
      .input(z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        suggestionType: z.enum(["feature", "bug", "improvement", "content"]),
        title: z.string().min(5).max(500),
        description: z.string().min(10),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createFeatureSuggestion({
          ...input,
          userId: ctx.user?.id,
        });
      }),
    upvote: publicProcedure
      .input(z.object({ suggestionId: z.number() }))
      .mutation(async ({ input }) => {
        return await db.upvoteFeatureSuggestion(input.suggestionId);
      }),
  }),

  // AI Career Assessment Module
  assessment: router({
    create: publicProcedure
      .input(z.object({
        currentRole: z.string(),
        currentIndustry: z.string(),
        yearsExperience: z.number(),
        educationLevel: z.string(),
        skills: z.array(z.string()),
        careerGoals: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const assessmentId = await db.createCareerAssessment({
          userId: ctx.user?.id,
          ...input,
        });
        return { id: assessmentId };
      }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getCareerAssessmentById(input.id);
      }),
    myAssessments: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserCareerAssessments(ctx.user.id);
    }),
  }),

  // Headhunter/Recruitment Module
  headhunter: headhunterRouter,
  
  // Stripe Payment Integration for Headhunter
  stripeHeadhunter: stripeHeadhunterRouter,
  
  // Tax Module - Expense Tracking & 1099 Generation
  tax: taxRouter,
  
  // Security Module - Tools, Training, Assessments & Affiliate Tracking
  security: securityRouter,
  
  // Commerce Module - Shop, Orders, Subscriptions (Module 05)
  commerce: commerceRouter,
  
  // Universal API - 50 API modules with pay-per-module pricing
  api: universalApiRouter,
  
  // Neurodivergent UI Adapter (Module 02)
  neurodivergent: neurodivergentRouter,
  profile: profileRouter,
  
  // AI-powered features (career assessment, recommendations)
  ai: aiRouter,
  
  // OZ Module - Multi-Agent Research & Analysis System
  oz: ozRouter,
  
  // Rewards & Credits System - Earn credits for testing, contributions, referrals
  rewards: rewardsRouter,
});

export type AppRouter = typeof appRouter;
