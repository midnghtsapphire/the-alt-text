import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import * as securityDb from "../db/security";
import { performSecurityAssessment, getComplianceFrameworks } from "../_core/securityScanner";

export const securityRouter = router({
  // Security Tools
  getAllTools: publicProcedure.query(async () => {
    return await securityDb.getAllSecurityTools();
  }),

  getToolsByCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ input }) => {
      return await securityDb.getSecurityToolsByCategory(input.category);
    }),

  getToolsByType: publicProcedure
    .input(z.object({ type: z.string() }))
    .query(async ({ input }) => {
      return await securityDb.getSecurityToolsByType(input.type);
    }),

  getToolBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return await securityDb.getSecurityToolBySlug(input.slug);
    }),

  searchTools: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      return await securityDb.searchSecurityTools(input.query);
    }),

  getPopularTools: publicProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async ({ input }) => {
      return await securityDb.getPopularSecurityTools(input?.limit);
    }),

  getEmergingTools: publicProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async ({ input }) => {
      return await securityDb.getEmergingSecurityTools(input?.limit);
    }),

  getAffiliateTools: publicProcedure.query(async () => {
    return await securityDb.getAffiliateSecurityTools();
  }),

  // Security Assessments
  getMyAssessments: protectedProcedure.query(async ({ ctx }) => {
    return await securityDb.getUserSecurityAssessments(ctx.user.id);
  }),

  getAssessmentById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await securityDb.getSecurityAssessmentById(input.id);
    }),

  createAssessment: protectedProcedure
    .input(
      z.object({
        organizationName: z.string().optional(),
        assessmentType: z.enum([
          "vulnerability_scan",
          "risk_assessment",
          "compliance_check",
          "penetration_test",
          "security_audit",
        ]),
        complianceFramework: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await securityDb.createSecurityAssessment({
        userId: ctx.user.id,
        ...input,
        status: "pending",
      });
    }),

  updateAssessment: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z
          .enum(["pending", "in_progress", "completed", "failed"])
          .optional(),
        score: z.number().optional(),
        findings: z.string().optional(),
        recommendations: z.string().optional(),
        scanResults: z.string().optional(),
        reportUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await securityDb.updateSecurityAssessment(id, data);
      return { success: true };
    }),

  getAssessmentStats: protectedProcedure.query(async ({ ctx }) => {
    return await securityDb.getAssessmentStats(ctx.user.id);
  }),

  // Training Courses
  getAllCourses: publicProcedure.query(async () => {
    return await securityDb.getAllTrainingCourses();
  }),

  getCoursesByCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ input }) => {
      return await securityDb.getTrainingCoursesByCategory(input.category);
    }),

  getCourseBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return await securityDb.getTrainingCourseBySlug(input.slug);
    }),

  getMyTrainingProgress: protectedProcedure.query(async ({ ctx }) => {
    return await securityDb.getUserTrainingProgress(ctx.user.id);
  }),

  getMyCourseProgress: protectedProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ ctx, input }) => {
      return await securityDb.getUserCourseProgress(ctx.user.id, input.courseId);
    }),

  updateCourseProgress: protectedProcedure
    .input(
      z.object({
        courseId: z.number(),
        status: z
          .enum(["not_started", "in_progress", "completed", "failed"])
          .optional(),
        progress: z.number().optional(),
        quizScore: z.number().optional(),
        attempts: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { courseId, ...data } = input;
      return await securityDb.createOrUpdateTrainingProgress({
        userId: ctx.user.id,
        courseId,
        ...data,
      });
    }),

  getTrainingStats: protectedProcedure.query(async ({ ctx }) => {
    return await securityDb.getTrainingStats(ctx.user.id);
  }),

  // Affiliate Tracking
  trackClick: publicProcedure
    .input(
      z.object({
        toolId: z.number(),
        userId: z.number().optional(),
        ipAddress: z.string().optional(),
        userAgent: z.string().optional(),
        referrer: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await securityDb.trackAffiliateClick(input);
    }),

  getClickStats: publicProcedure
    .input(z.object({ toolId: z.number().optional() }).optional())
    .query(async ({ input }) => {
      return await securityDb.getAffiliateClickStats(input?.toolId);
    }),

  getConversionStats: publicProcedure
    .input(z.object({ toolId: z.number().optional() }).optional())
    .query(async ({ input }) => {
      return await securityDb.getAffiliateConversionStats(input?.toolId);
    }),

  getRecentConversions: publicProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async ({ input }) => {
      return await securityDb.getRecentConversions(input?.limit);
    }),

  // Security Scanner
  runSecurityScan: protectedProcedure
    .input(
      z.object({
        domain: z.string(),
        scanVulnerabilities: z.boolean().default(true),
        checkCompliance: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await performSecurityAssessment(input.domain, {
        scanVulnerabilities: input.scanVulnerabilities,
        checkCompliance: input.checkCompliance,
      });

      // Save assessment to database
      const assessment = await securityDb.createSecurityAssessment({
        userId: ctx.user.id,
        organizationName: input.domain,
        assessmentType: "vulnerability_scan",
        status: "completed",
        score: result.overallScore,
        findings: JSON.stringify(result),
      });

      return {
        assessmentId: assessment.id,
        ...result,
      };
    }),

  getComplianceFrameworks: publicProcedure.query(async () => {
    return getComplianceFrameworks();
  }),
});
