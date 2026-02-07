import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import Stripe from "stripe";
import * as db from "../db";
import {
  createPlacementFeeProduct,
  createRetentionBonusFeeProduct,
} from "../stripe-products";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

export const stripeHeadhunterRouter = router({
  /**
   * Create a Stripe checkout session for a placement fee
   */
  createPlacementFeeCheckout: protectedProcedure
    .input(
      z.object({
        commissionId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Get commission details
      let commissions = await db.listCommissions({});
      commissions = commissions.filter((c: any) => c.id === input.commissionId);
      if (commissions.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Commission not found",
        });
      }

      const commission = commissions[0];

      // Verify commission is pending
      if (commission.paymentStatus !== "pending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Commission is already ${commission.paymentStatus}`,
        });
      }

      // Get placement details
      const placement = await db.getPlacementById(commission.placementId);
      if (!placement) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Placement not found",
        });
      }
      
      // Get candidate and partner
      const candidate = await db.getCandidateById(placement.candidateId);
      const partner = await db.getPartnerById(placement.partnerId);

      // Create product
      const product = createPlacementFeeProduct({
        placementId: commission.placementId,
        commissionId: commission.id,
        candidateName: candidate
          ? `${candidate.firstName} ${candidate.lastName}`
          : "Unknown Candidate",
        jobTitle: placement.jobTitle,
        partnerName: partner?.companyName || "Unknown Partner",
        amount: commission.amount,
      });

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: product.currency,
              product_data: {
                name: product.name,
                description: product.description,
                metadata: product.metadata,
              },
              unit_amount: product.amount,
            },
            quantity: 1,
          },
        ],
        customer_email: partner?.contactEmail || ctx.user.email || undefined,
        client_reference_id: commission.id.toString(),
        metadata: {
          commissionId: commission.id.toString(),
          placementId: commission.placementId.toString(),
          userId: ctx.user.id.toString(),
          type: "placement_fee",
        },
        success_url: `${ctx.req.headers.origin}/headhunter/payments/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${ctx.req.headers.origin}/headhunter/payments/cancel`,
        allow_promotion_codes: true,
      });

      return {
        checkoutUrl: session.url,
        sessionId: session.id,
      };
    }),

  /**
   * Create a Stripe checkout session for a retention bonus fee
   */
  createRetentionBonusCheckout: protectedProcedure
    .input(
      z.object({
        commissionId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Get commission details
      let commissions = await db.listCommissions({});
      commissions = commissions.filter((c: any) => c.id === input.commissionId);
      if (commissions.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Commission not found",
        });
      }

      const commission = commissions[0];

      // Verify commission is pending
      if (commission.paymentStatus !== "pending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Commission is already ${commission.paymentStatus}`,
        });
      }

      // Verify this is a retention bonus
      if (commission.commissionType !== "retention_bonus" || !commission.milestoneId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This commission is not a retention bonus",
        });
      }

      // Get placement and milestone details
      const placement = await db.getPlacementById(commission.placementId);
      if (!placement) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Placement not found",
        });
      }
      
      // Get candidate and partner
      const candidate = await db.getCandidateById(placement.candidateId);
      const partner = await db.getPartnerById(placement.partnerId);

      const milestones = await db.getRetentionMilestones(commission.placementId);
      const milestone = milestones.find((m: any) => m.id === commission.milestoneId);
      if (!milestone) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Milestone not found",
        });
      }

      // Create product
      const product = createRetentionBonusFeeProduct({
        placementId: commission.placementId,
        commissionId: commission.id,
        milestoneId: milestone.id,
        candidateName: candidate
          ? `${candidate.firstName} ${candidate.lastName}`
          : "Unknown Candidate",
        milestoneDays: milestone.milestoneDays,
        partnerName: partner?.companyName || "Unknown Partner",
        amount: commission.amount,
      });

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: product.currency,
              product_data: {
                name: product.name,
                description: product.description,
                metadata: product.metadata,
              },
              unit_amount: product.amount,
            },
            quantity: 1,
          },
        ],
        customer_email: partner?.contactEmail || ctx.user.email || undefined,
        client_reference_id: commission.id.toString(),
        metadata: {
          commissionId: commission.id.toString(),
          placementId: commission.placementId.toString(),
          milestoneId: milestone.id.toString(),
          userId: ctx.user.id.toString(),
          type: "retention_bonus",
        },
        success_url: `${ctx.req.headers.origin}/headhunter/payments/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${ctx.req.headers.origin}/headhunter/payments/cancel`,
        allow_promotion_codes: true,
      });

      return {
        checkoutUrl: session.url,
        sessionId: session.id,
      };
    }),

  /**
   * Get payment history for a commission
   */
  getPaymentHistory: protectedProcedure
    .input(
      z.object({
        commissionId: z.number().optional(),
        placementId: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      // List commissions with filters
      let commissions = await db.listCommissions({
        placementId: input.placementId,
      });
      
      // Filter by ID if provided
      if (input.commissionId) {
        commissions = commissions.filter((c: any) => c.id === input.commissionId);
      }

      return commissions.map((commission: any) => ({
        id: commission.id,
        placementId: commission.placementId,
        commissionType: commission.commissionType,
        amount: commission.amount,
        paymentStatus: commission.paymentStatus,
        invoiceNumber: commission.invoiceNumber,
        invoiceDate: commission.invoiceDate,
        paidDate: commission.paidDate,
        paymentMethod: commission.paymentMethod,
        transactionId: commission.transactionId,
        createdAt: commission.createdAt,
      }));
    }),

  /**
   * Verify Stripe checkout session and update commission status
   */
  verifyCheckoutSession: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // Retrieve session from Stripe
      const session = await stripe.checkout.sessions.retrieve(input.sessionId);

      if (session.payment_status !== "paid") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Payment not completed",
        });
      }

      const commissionId = parseInt(session.metadata?.commissionId || "0");
      if (!commissionId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid commission ID in session metadata",
        });
      }

      // Update commission status
      await db.updateCommission(commissionId, {
        paymentStatus: "paid",
        paidDate: new Date(),
        paymentMethod: "stripe",
        transactionId: session.payment_intent as string,
      });

      return {
        success: true,
        commissionId,
        amountPaid: session.amount_total ? session.amount_total / 100 : 0,
      };
    }),
});
