import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as schema from "../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { getDb } from "../db";

/**
 * Rewards & Credits Router
 * 
 * Allows users to earn credits for testing, contributions, and referrals.
 * Credits can be used to offset API usage costs or cashed out.
 */

export const rewardsRouter = router({
  /**
   * Get current user's credits balance
   */
  getBalance: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const user = await db
      .select({
        creditsBalance: schema.users.creditsBalance,
        lifetimeCreditsEarned: schema.users.lifetimeCreditsEarned,
        lifetimeCreditsSpent: schema.users.lifetimeCreditsSpent,
      })
      .from(schema.users)
      .where(eq(schema.users.id, ctx.user.id))
      .limit(1);

    if (!user.length) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    return user[0];
  }),

  /**
   * Get user's rewards history
   */
  getRewardsHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const rewards = await db
        .select()
        .from(schema.rewards)
        .where(eq(schema.rewards.userId, ctx.user.id))
        .orderBy(desc(schema.rewards.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return rewards;
    }),

  /**
   * Get user's credits transactions history
   */
  getTransactionsHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const transactions = await db
        .select()
        .from(schema.creditsTransactions)
        .where(eq(schema.creditsTransactions.userId, ctx.user.id))
        .orderBy(desc(schema.creditsTransactions.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return transactions;
    }),

  /**
   * Award credits to user for completing an action
   */
  awardCredits: protectedProcedure
    .input(
      z.object({
        action: z.string().min(1).max(100),
        description: z.string().optional(),
        metadata: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      // Check if reward action exists and is active
      const rewardAction = await db
        .select()
        .from(schema.rewardActions)
        .where(
          and(
            eq(schema.rewardActions.action, input.action),
            eq(schema.rewardActions.isActive, true)
          )
        )
        .limit(1);

      if (!rewardAction.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Reward action not found or inactive",
        });
      }

      const action = rewardAction[0];

      // Check if user has reached max per user limit
      if (action.maxPerUser) {
        const userRewardsCount = await db
          .select({ count: sql<number>`count(*)`.as('count') })
          .from(schema.rewards)
          .where(
            and(
              eq(schema.rewards.userId, ctx.user.id),
              eq(schema.rewards.action, input.action)
            )
          );

        if (userRewardsCount[0].count >= action.maxPerUser) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `You've reached the maximum number of rewards for this action (${action.maxPerUser})`,
          });
        }
      }

      // Check if user has reached max per day limit
      if (action.maxPerDay) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayRewardsCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(schema.rewards)
          .where(
            and(
              eq(schema.rewards.userId, ctx.user.id),
              eq(schema.rewards.action, input.action),
              sql`${schema.rewards.createdAt} >= ${today}`
            )
          );

        if (todayRewardsCount[0].count >= action.maxPerDay) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `You've reached the maximum number of rewards for this action today (${action.maxPerDay})`,
          });
        }
      }

      // Get current balance
      const user = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, ctx.user.id))
        .limit(1);

      const currentBalance = parseFloat(user[0].creditsBalance as any);
      const creditsToAward = parseFloat(action.creditsAmount as any);
      const newBalance = currentBalance + creditsToAward;

      // Create reward record
      const [reward] = await db.insert(schema.rewards).values({
        userId: ctx.user.id,
        action: input.action,
        description: input.description || action.description || "",
        creditsEarned: action.creditsAmount,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      });

      // Create transaction record
      await db.insert(schema.creditsTransactions).values({
        userId: ctx.user.id,
        type: "earned",
        amount: action.creditsAmount,
        balanceAfter: newBalance.toString(),
        description: `Earned ${creditsToAward} credits for: ${action.name}`,
        relatedId: reward.insertId,
        relatedType: "reward",
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      });

      // Update user balance
      await db
        .update(schema.users)
        .set({
          creditsBalance: newBalance.toString(),
          lifetimeCreditsEarned: (
            parseFloat(user[0].lifetimeCreditsEarned as any) + creditsToAward
          ).toString(),
        })
        .where(eq(schema.users.id, ctx.user.id));

      return {
        success: true,
        creditsAwarded: creditsToAward,
        newBalance,
        rewardId: reward.insertId,
      };
    }),

  /**
   * Redeem a promo code
   */
  redeemPromoCode: protectedProcedure
    .input(
      z.object({
        code: z.string().min(1).max(50),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      // Find promo code
      const promoCode = await db
        .select()
        .from(schema.promoCodes)
        .where(
          and(
            eq(schema.promoCodes.code, input.code),
            eq(schema.promoCodes.isActive, true)
          )
        )
        .limit(1);

      if (!promoCode.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Promo code not found or inactive",
        });
      }

      const promo = promoCode[0];

      // Check if expired
      if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Promo code has expired",
        });
      }

      // Check if max uses reached
      if (promo.maxUses && promo.currentUses >= promo.maxUses) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Promo code has reached maximum uses",
        });
      }

      // Check if user already redeemed this code
      const existingRedemption = await db
        .select()
        .from(schema.promoCodeRedemptions)
        .where(
          and(
            eq(schema.promoCodeRedemptions.promoCodeId, promo.id),
            eq(schema.promoCodeRedemptions.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (existingRedemption.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You've already redeemed this promo code",
        });
      }

      // Get current balance
      const user = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, ctx.user.id))
        .limit(1);

      const currentBalance = parseFloat(user[0].creditsBalance as any);
      const creditsToAward = parseFloat(promo.credits as any);
      const newBalance = currentBalance + creditsToAward;

      // Create redemption record
      const redemption = await db.insert(schema.promoCodeRedemptions).values({
        promoCodeId: promo.id,
        userId: ctx.user.id,
        creditsAwarded: promo.credits,
      });

      // Create transaction record
      await db.insert(schema.creditsTransactions).values({
        userId: ctx.user.id,
        type: "promo_code",
        amount: promo.credits,
        balanceAfter: newBalance.toString(),
        description: `Redeemed promo code: ${input.code}`,
        relatedId: promo.id,
        relatedType: "promo_code",
      });

      // Update user balance
      await db
        .update(schema.users)
        .set({
          creditsBalance: newBalance.toString(),
          lifetimeCreditsEarned: (
            parseFloat(user[0].lifetimeCreditsEarned as any) + creditsToAward
          ).toString(),
        })
        .where(eq(schema.users.id, ctx.user.id));

      // Update promo code usage count
      await db
        .update(schema.promoCodes)
        .set({
          currentUses: promo.currentUses + 1,
        })
        .where(eq(schema.promoCodes.id, promo.id));

      return {
        success: true,
        creditsAwarded: creditsToAward,
        newBalance,
        redemptionId: redemption[0].insertId,
      };
    }),

  /**
   * Request cashout (convert credits to money)
   */
  requestCashout: protectedProcedure
    .input(
      z.object({
        creditsAmount: z.number().min(1),
        paymentMethod: z.enum(["paypal", "stripe", "bank_transfer"]),
        paymentDetails: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      // Get current balance
      const user = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, ctx.user.id))
        .limit(1);

      const currentBalance = parseFloat(user[0].creditsBalance as any);

      // Check if user has enough credits
      if (currentBalance < input.creditsAmount) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Insufficient credits balance",
        });
      }

      // Calculate cash amount (1 credit = $0.01 USD)
      const cashAmount = input.creditsAmount * 0.01;

      // Create cashout request
      const request = await db.insert(schema.cashoutRequests).values({
        userId: ctx.user.id,
        creditsAmount: input.creditsAmount.toString(),
        cashAmount: cashAmount.toString(),
        paymentMethod: input.paymentMethod,
        paymentDetails: input.paymentDetails,
        status: "pending",
      });

      return {
        success: true,
        requestId: request[0].insertId,
        creditsAmount: input.creditsAmount,
        cashAmount,
        status: "pending",
      };
    }),

  /**
   * Get available reward actions
   */
  getRewardActions: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const actions = await db
      .select()
      .from(schema.rewardActions)
      .where(eq(schema.rewardActions.isActive, true))
      .orderBy(desc(schema.rewardActions.creditsAmount));

    return actions;
  }),
});
