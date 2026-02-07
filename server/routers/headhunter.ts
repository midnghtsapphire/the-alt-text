import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "../db";

/**
 * Headhunter/Recruitment Module Router
 * Handles candidate pipeline, placements, commissions, and partner management
 */

// ============================================================================
// CANDIDATE PROCEDURES
// ============================================================================

const candidateRouter = router({
  create: protectedProcedure
    .input(z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      email: z.string().email(),
      phone: z.string().optional(),
      locationId: z.number().optional(),
      resumeUrl: z.string().optional(),
      resumeKey: z.string().optional(),
      linkedinUrl: z.string().optional(),
      currentRole: z.string().optional(),
      experienceLevel: z.enum(["entry", "mid", "senior", "expert"]).default("entry"),
      certifications: z.string().optional(), // JSON string
      trainingCompleted: z.string().optional(), // JSON string
      skills: z.string().optional(), // JSON string
      salaryExpectation: z.number().optional(),
      availableStartDate: z.string().optional(),
      willingToRelocate: z.boolean().default(false),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Check for existing candidate with same email
      const existing = await db.getCandidateByEmail(input.email);
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Candidate with this email already exists",
        });
      }

      const candidate = await db.createCandidate({
        ...input,
        userId: ctx.user.id,
        willingToRelocate: input.willingToRelocate ? 1 : 0,
        availableStartDate: input.availableStartDate ? new Date(input.availableStartDate) : undefined,
      });

      return candidate;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const candidate = await db.getCandidateById(input.id);
      if (!candidate) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Candidate not found",
        });
      }
      return candidate;
    }),

  list: protectedProcedure
    .input(z.object({
      status: z.enum(["new", "screening", "training", "ready", "placed", "inactive"]).optional(),
      locationId: z.number().optional(),
      experienceLevel: z.enum(["entry", "mid", "senior", "expert"]).optional(),
    }).optional())
    .query(async ({ input }) => {
      return db.listCandidates(input);
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      locationId: z.number().optional(),
      resumeUrl: z.string().optional(),
      resumeKey: z.string().optional(),
      linkedinUrl: z.string().optional(),
      currentRole: z.string().optional(),
      experienceLevel: z.enum(["entry", "mid", "senior", "expert"]).optional(),
      certifications: z.string().optional(),
      trainingCompleted: z.string().optional(),
      skills: z.string().optional(),
      salaryExpectation: z.number().optional(),
      availableStartDate: z.string().optional(),
      willingToRelocate: z.boolean().optional(),
      status: z.enum(["new", "screening", "training", "ready", "placed", "inactive"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      
      const processedUpdates: any = { ...updates };
      if (updates.willingToRelocate !== undefined) {
        processedUpdates.willingToRelocate = updates.willingToRelocate ? 1 : 0;
      }
      if (updates.availableStartDate) {
        processedUpdates.availableStartDate = new Date(updates.availableStartDate);
      }
      
      return db.updateCandidate(id, processedUpdates);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return db.deleteCandidate(input.id);
    }),
});

// ============================================================================
// PARTNER PROCEDURES
// ============================================================================

const partnerRouter = router({
  create: protectedProcedure
    .input(z.object({
      partnerType: z.enum(["manufacturer", "training_provider", "grant_provider", "certification_body", "industry_org", "security_training", "phishing_simulation", "compliance_platform", "software_vendor", "apprenticeship_program"]),
      companyName: z.string().min(1),
      contactName: z.string().optional(),
      contactEmail: z.string().email().optional(),
      contactPhone: z.string().optional(),
      website: z.string().optional(),
      address: z.string().optional(),
      locationId: z.number().optional(),
      description: z.string().optional(),
      commissionRate: z.number().optional(), // e.g., 25.00 for 25%
      retentionBonusStructure: z.string().optional(), // JSON: {30: 5000, 90: 10000}
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return db.createPartner({
        ...input,
        commissionRate: input.commissionRate?.toString(),
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const partner = await db.getPartnerById(input.id);
      if (!partner) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Partner not found",
        });
      }
      return partner;
    }),

  list: protectedProcedure
    .input(z.object({
      partnerType: z.enum(["manufacturer", "training_provider", "grant_provider", "certification_body", "industry_org", "security_training", "phishing_simulation", "compliance_platform", "software_vendor", "apprenticeship_program"]).optional(),
      partnershipStatus: z.enum(["prospect", "contacted", "negotiating", "active", "paused", "inactive"]).optional(),
    }).optional())
    .query(async ({ input }) => {
      return db.listPartners(input);
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      companyName: z.string().optional(),
      contactName: z.string().optional(),
      contactEmail: z.string().email().optional(),
      contactPhone: z.string().optional(),
      website: z.string().optional(),
      address: z.string().optional(),
      locationId: z.number().optional(),
      description: z.string().optional(),
      partnershipStatus: z.enum(["prospect", "contacted", "negotiating", "active", "paused", "inactive"]).optional(),
      contractStartDate: z.string().optional(),
      contractEndDate: z.string().optional(),
      commissionRate: z.number().optional(),
      retentionBonusStructure: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      
      const processedUpdates: any = { ...updates };
      if (updates.commissionRate !== undefined) {
        processedUpdates.commissionRate = updates.commissionRate.toString();
      }
      if (updates.contractStartDate) {
        processedUpdates.contractStartDate = new Date(updates.contractStartDate);
      }
      if (updates.contractEndDate) {
        processedUpdates.contractEndDate = new Date(updates.contractEndDate);
      }
      
      return db.updatePartner(id, processedUpdates);
    }),
});

// ============================================================================
// PLACEMENT PROCEDURES
// ============================================================================

const placementRouter = router({
  create: protectedProcedure
    .input(z.object({
      candidateId: z.number(),
      partnerId: z.number(),
      jobOpeningId: z.number().optional(),
      jobTitle: z.string().min(1),
      jobType: z.enum(["full-time", "part-time", "contract", "apprenticeship"]).default("full-time"),
      locationId: z.number(),
      startDate: z.string(),
      annualSalary: z.number(),
      commissionRate: z.number(), // e.g., 25.00 for 25%
      retentionBonusStructure: z.string().optional(), // JSON: {30: 5000, 90: 10000, 180: 15000}
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      // Calculate base fee
      const baseFee = Math.floor(input.annualSalary * (input.commissionRate / 100));
      
      const placement = await db.createPlacement({
        ...input,
        startDate: new Date(input.startDate),
        commissionRate: input.commissionRate.toString(),
        baseFee,
      });
      
      // Update candidate status to "placed"
      await db.updateCandidate(input.candidateId, { status: "placed" });
      
      return placement;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const placement = await db.getPlacementById(input.id);
      if (!placement) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Placement not found",
        });
      }
      
      // Get related data
      const candidate = await db.getCandidateById(placement.candidateId);
      const partner = await db.getPartnerById(placement.partnerId);
      const milestones = await db.getRetentionMilestones(placement.id);
      const commissions = await db.listCommissions({ placementId: placement.id });
      
      return {
        placement,
        candidate,
        partner,
        milestones,
        commissions,
      };
    }),

  list: protectedProcedure
    .input(z.object({
      candidateId: z.number().optional(),
      partnerId: z.number().optional(),
      placementStatus: z.enum(["pending", "confirmed", "active", "terminated", "completed"]).optional(),
    }).optional())
    .query(async ({ input }) => {
      return db.listPlacements(input);
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      placementStatus: z.enum(["pending", "confirmed", "active", "terminated", "completed"]).optional(),
      terminationDate: z.string().optional(),
      terminationReason: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      
      const processedUpdates: any = { ...updates };
      if (updates.terminationDate) {
        processedUpdates.terminationDate = new Date(updates.terminationDate);
      }
      
      return db.updatePlacement(id, processedUpdates);
    }),
});

// ============================================================================
// RETENTION MILESTONE PROCEDURES
// ============================================================================

const milestoneRouter = router({
  list: protectedProcedure
    .input(z.object({ placementId: z.number() }))
    .query(async ({ input }) => {
      return db.getRetentionMilestones(input.placementId);
    }),

  achieve: protectedProcedure
    .input(z.object({
      id: z.number(),
      achievedDate: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const achievedDate = input.achievedDate ? new Date(input.achievedDate) : new Date();
      
      return db.updateRetentionMilestone(input.id, {
        milestoneStatus: "achieved",
        achievedDate,
        notes: input.notes,
      });
    }),

  miss: protectedProcedure
    .input(z.object({
      id: z.number(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return db.updateRetentionMilestone(input.id, {
        milestoneStatus: "missed",
        notes: input.notes,
      });
    }),
});

// ============================================================================
// COMMISSION PROCEDURES
// ============================================================================

const commissionRouter = router({
  list: protectedProcedure
    .input(z.object({
      placementId: z.number().optional(),
      paymentStatus: z.enum(["pending", "invoiced", "paid", "overdue", "waived"]).optional(),
    }).optional())
    .query(async ({ input }) => {
      return db.listCommissions(input);
    }),

  summary: protectedProcedure
    .query(async () => {
      return db.getCommissionSummary();
    }),

  markInvoiced: protectedProcedure
    .input(z.object({
      id: z.number(),
      invoiceNumber: z.string(),
      invoiceDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return db.updateCommission(input.id, {
        paymentStatus: "invoiced",
        invoiceNumber: input.invoiceNumber,
        invoiceDate: input.invoiceDate ? new Date(input.invoiceDate) : new Date(),
      });
    }),

  markPaid: protectedProcedure
    .input(z.object({
      id: z.number(),
      paidDate: z.string().optional(),
      paymentMethod: z.string().optional(),
      transactionId: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return db.updateCommission(input.id, {
        paymentStatus: "paid",
        paidDate: input.paidDate ? new Date(input.paidDate) : new Date(),
        paymentMethod: input.paymentMethod,
        transactionId: input.transactionId,
      });
    }),
});

// ============================================================================
// STIPEND PROCEDURES
// ============================================================================

const stipendRouter = router({
  list: protectedProcedure
    .input(z.object({
      candidateId: z.number().optional(),
      paymentStatus: z.enum(["pending", "processing", "paid", "failed", "cancelled"]).optional(),
    }).optional())
    .query(async ({ input }) => {
      return db.listCandidateStipends(input);
    }),

  markPaid: protectedProcedure
    .input(z.object({
      id: z.number(),
      paidDate: z.string().optional(),
      transactionId: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return db.updateCandidateStipend(input.id, {
        paymentStatus: "paid",
        paidDate: input.paidDate ? new Date(input.paidDate) : new Date(),
        transactionId: input.transactionId,
      });
    }),

  markFailed: protectedProcedure
    .input(z.object({
      id: z.number(),
      failureReason: z.string(),
    }))
    .mutation(async ({ input }) => {
      return db.updateCandidateStipend(input.id, {
        paymentStatus: "failed",
        failureReason: input.failureReason,
      });
    }),
});

// ============================================================================
// COMMUNICATION PROCEDURES
// ============================================================================

const communicationRouter = router({
  create: protectedProcedure
    .input(z.object({
      partnerId: z.number(),
      communicationType: z.enum(["email", "phone", "meeting", "contract", "other"]),
      subject: z.string().optional(),
      summary: z.string().optional(),
      outcome: z.string().optional(),
      nextFollowUpDate: z.string().optional(),
      attachments: z.string().optional(), // JSON array
    }))
    .mutation(async ({ input, ctx }) => {
      return db.createPartnerCommunication({
        ...input,
        nextFollowUpDate: input.nextFollowUpDate ? new Date(input.nextFollowUpDate) : undefined,
        createdBy: ctx.user.id,
      });
    }),

  list: protectedProcedure
    .input(z.object({ partnerId: z.number() }))
    .query(async ({ input }) => {
      return db.listPartnerCommunications(input.partnerId);
    }),
});

// ============================================================================
// INTERVIEW PROCEDURES
// ============================================================================

const interviewRouter = router({
  create: protectedProcedure
    .input(z.object({
      candidateId: z.number(),
      partnerId: z.number(),
      jobOpeningId: z.number().optional(),
      interviewDate: z.string(),
      interviewType: z.enum(["phone_screen", "technical", "behavioral", "panel", "final"]),
      interviewerName: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return db.createPlacementInterview({
        ...input,
        interviewDate: new Date(input.interviewDate),
      });
    }),

  list: protectedProcedure
    .input(z.object({
      candidateId: z.number().optional(),
      partnerId: z.number().optional(),
      interviewStatus: z.enum(["scheduled", "completed", "cancelled", "no_show"]).optional(),
    }).optional())
    .query(async ({ input }) => {
      return db.listPlacementInterviews(input);
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      interviewStatus: z.enum(["scheduled", "completed", "cancelled", "no_show"]).optional(),
      outcome: z.enum(["pending", "passed", "failed", "offer_extended", "offer_accepted", "offer_declined"]).optional(),
      feedback: z.string().optional(),
      nextSteps: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      return db.updatePlacementInterview(id, updates);
    }),
});

// ============================================================================
// ANALYTICS PROCEDURES
// ============================================================================

const analyticsRouter = router({
  dashboard: protectedProcedure
    .query(async () => {
      return db.getHeadhunterDashboardStats();
    }),
});

// ============================================================================
// MAIN HEADHUNTER ROUTER
// ============================================================================

export const headhunterRouter = router({
  candidates: candidateRouter,
  partners: partnerRouter,
  placements: placementRouter,
  milestones: milestoneRouter,
  commissions: commissionRouter,
  stipends: stipendRouter,
  communications: communicationRouter,
  interviews: interviewRouter,
  analytics: analyticsRouter,
});
