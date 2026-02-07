/**
 * 14-Day Free Trial System
 * 
 * Manages trial activation, usage tracking, expiration warnings,
 * and conversion to paid plans
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq, and, lt, gte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const TRIAL_DURATION_DAYS = 14;
const TRIAL_API_CALL_LIMIT = 1000;
const TRIAL_SCAN_LIMIT = 50;

export const trialRouter = router({
  /**
   * Activate trial for current user
   */
  activateTrial: protectedProcedure
    .mutation(async ({ ctx }) => {
      const user = ctx.user;

      // Check if user already has/had a trial
      if (user.trialStatus && user.trialStatus !== 'none') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Trial already activated or expired',
        });
      }

      const now = new Date();
      const expiresAt = new Date(now.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000);

      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

      await database
        .update(users)
        .set({
          trialStatus: 'active',
          trialStartedAt: now,
          trialExpiresAt: expiresAt,
          trialApiCallsUsed: 0,
          trialScansUsed: 0,
        })
        .where(eq(users.id, user.id));

      return {
        success: true,
        trialStatus: 'active',
        trialStartedAt: now.toISOString(),
        trialExpiresAt: expiresAt.toISOString(),
        daysRemaining: TRIAL_DURATION_DAYS,
        limits: {
          apiCalls: TRIAL_API_CALL_LIMIT,
          scans: TRIAL_SCAN_LIMIT,
        },
      };
    }),

  /**
   * Get trial status for current user
   */
  getTrialStatus: protectedProcedure
    .query(async ({ ctx }) => {
      const user = ctx.user;

      if (!user.trialStatus || user.trialStatus === 'none') {
        return {
          hasTrialAccess: false,
          trialStatus: 'none',
          canActivate: true,
        };
      }

      const now = new Date();
      const expiresAt = user.trialExpiresAt ? new Date(user.trialExpiresAt) : null;
      const daysRemaining = expiresAt 
        ? Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        : 0;

      // Auto-expire if past expiration date
      if (user.trialStatus === 'active' && expiresAt && now > expiresAt) {
        const database = await getDb();
        if (database) {
          await database
            .update(users)
            .set({ trialStatus: 'expired' })
            .where(eq(users.id, user.id));
        }

        return {
          hasTrialAccess: false,
          trialStatus: 'expired',
          canActivate: false,
          message: 'Your trial has expired. Please upgrade to continue using the platform.',
        };
      }

      return {
        hasTrialAccess: user.trialStatus === 'active',
        trialStatus: user.trialStatus,
        trialStartedAt: user.trialStartedAt?.toISOString(),
        trialExpiresAt: user.trialExpiresAt?.toISOString(),
        daysRemaining,
        usage: {
          apiCalls: user.trialApiCallsUsed || 0,
          scans: user.trialScansUsed || 0,
        },
        limits: {
          apiCalls: TRIAL_API_CALL_LIMIT,
          scans: TRIAL_SCAN_LIMIT,
        },
        percentUsed: {
          apiCalls: Math.round(((user.trialApiCallsUsed || 0) / TRIAL_API_CALL_LIMIT) * 100),
          scans: Math.round(((user.trialScansUsed || 0) / TRIAL_SCAN_LIMIT) * 100),
        },
        showWarning: daysRemaining <= 3,
        canActivate: false,
      };
    }),

  /**
   * Track API call usage (called internally by API endpoints)
   */
  trackApiCall: protectedProcedure
    .input(z.object({
      callType: z.enum(['scan', 'analyze', 'report', 'fix', 'other']),
    }))
    .mutation(async ({ input, ctx }) => {
      const user = ctx.user;

      if (user.trialStatus !== 'active') {
        return { success: false, message: 'Trial not active' };
      }

      // Check if trial expired
      const now = new Date();
      const expiresAt = user.trialExpiresAt ? new Date(user.trialExpiresAt) : null;
      if (expiresAt && now > expiresAt) {
        const database = await getDb();
        if (database) {
          await database
            .update(users)
            .set({ trialStatus: 'expired' })
            .where(eq(users.id, user.id));
        }

        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Trial has expired. Please upgrade to continue.',
        });
      }

      // Check limits
      const currentApiCalls = user.trialApiCallsUsed || 0;
      const currentScans = user.trialScansUsed || 0;

      if (currentApiCalls >= TRIAL_API_CALL_LIMIT) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `Trial API call limit reached (${TRIAL_API_CALL_LIMIT} calls). Please upgrade to continue.`,
        });
      }

      if (input.callType === 'scan' && currentScans >= TRIAL_SCAN_LIMIT) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `Trial scan limit reached (${TRIAL_SCAN_LIMIT} scans). Please upgrade to continue.`,
        });
      }

      // Increment usage
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

      await database
        .update(users)
        .set({
          trialApiCallsUsed: currentApiCalls + 1,
          trialScansUsed: input.callType === 'scan' ? currentScans + 1 : currentScans,
        })
        .where(eq(users.id, user.id));

      return {
        success: true,
        usage: {
          apiCalls: currentApiCalls + 1,
          scans: input.callType === 'scan' ? currentScans + 1 : currentScans,
        },
        limits: {
          apiCalls: TRIAL_API_CALL_LIMIT,
          scans: TRIAL_SCAN_LIMIT,
        },
      };
    }),

  /**
   * Convert trial to paid (called after successful payment)
   */
  convertToPaid: protectedProcedure
    .input(z.object({
      plan: z.enum(['starter', 'professional', 'enterprise']),
      stripeSubscriptionId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const user = ctx.user;

      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

      await database
        .update(users)
        .set({
          trialStatus: 'converted',
        })
        .where(eq(users.id, user.id));

      return {
        success: true,
        message: 'Trial converted to paid plan successfully',
        plan: input.plan,
      };
    }),

  /**
   * Get trial analytics (admin only)
   */
  getTrialAnalytics: protectedProcedure
    .query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Admin access required',
        });
      }

      // Get all users with trial data
      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

      const allUsers = await database.select().from(users);

      const activeTrials = allUsers.filter((u: typeof users.$inferSelect) => u.trialStatus === 'active').length;
      const expiredTrials = allUsers.filter((u: typeof users.$inferSelect) => u.trialStatus === 'expired').length;
      const convertedTrials = allUsers.filter((u: typeof users.$inferSelect) => u.trialStatus === 'converted').length;
      const totalTrials = activeTrials + expiredTrials + convertedTrials;

      const conversionRate = totalTrials > 0 
        ? Math.round((convertedTrials / totalTrials) * 100)
        : 0;

      // Calculate average usage
      const trialsWithUsage = allUsers.filter((u: typeof users.$inferSelect) => u.trialStatus !== 'none');
      const avgApiCalls = trialsWithUsage.length > 0
        ? Math.round(trialsWithUsage.reduce((sum: number, u: typeof users.$inferSelect) => sum + (u.trialApiCallsUsed || 0), 0) / trialsWithUsage.length)
        : 0;
      const avgScans = trialsWithUsage.length > 0
        ? Math.round(trialsWithUsage.reduce((sum: number, u: typeof users.$inferSelect) => sum + (u.trialScansUsed || 0), 0) / trialsWithUsage.length)
        : 0;

      return {
        totalTrials,
        activeTrials,
        expiredTrials,
        convertedTrials,
        conversionRate,
        averageUsage: {
          apiCalls: avgApiCalls,
          scans: avgScans,
        },
        limits: {
          apiCalls: TRIAL_API_CALL_LIMIT,
          scans: TRIAL_SCAN_LIMIT,
        },
      };
    }),

  /**
   * Get users expiring soon (for notifications)
   */
  getExpiringSoon: protectedProcedure
    .query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Admin access required',
        });
      }

      const now = new Date();
      const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      const database = await getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

      const expiringUsers = await database
        .select()
        .from(users)
        .where(
          and(
            eq(users.trialStatus, 'active'),
            lt(users.trialExpiresAt, threeDaysFromNow),
            gte(users.trialExpiresAt, now)
          )
        );

      return {
        users: expiringUsers.map((u: typeof users.$inferSelect) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          trialExpiresAt: u.trialExpiresAt?.toISOString(),
          daysRemaining: u.trialExpiresAt
            ? Math.ceil((new Date(u.trialExpiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            : 0,
        })),
        total: expiringUsers.length,
      };
    }),
});
