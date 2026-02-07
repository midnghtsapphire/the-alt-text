/**
 * Universal API tRPC Router
 * Exposes the Universal API Gateway through tRPC
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { handleAPIRequest, MODULE_REGISTRY, validateAPIKey } from "../universal-api-gateway";
import { getDb } from "../db";
import { apiCustomers, apiModules, customerModules } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const universalApiRouter = router({
  /**
   * Execute any API module action
   */
  execute: publicProcedure
    .input(
      z.object({
        apiKey: z.string(),
        module: z.string(),
        action: z.string(),
        params: z.any().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return handleAPIRequest(
        input.apiKey,
        input.module,
        input.action,
        input.params || {}
      );
    }),

  /**
   * Get all available modules
   */
  listModules: publicProcedure.query(async () => {
    return Object.values(MODULE_REGISTRY).map((module) => ({
      id: module.id,
      name: module.name,
      description: module.description,
      category: module.category,
      price: module.price,
      monthlyQuota: module.monthlyQuota,
      overageCost: module.overageCost,
      hasAffiliateLinks: module.hasAffiliateLinks,
      affiliateCommission: module.affiliateCommission,
      actions: module.actions,
    }));
  }),

  /**
   * Get module details
   */
  getModule: publicProcedure
    .input(z.object({ moduleId: z.string() }))
    .query(async ({ input }) => {
      const module = MODULE_REGISTRY[input.moduleId as keyof typeof MODULE_REGISTRY];
      if (!module) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Module not found",
        });
      }
      return module;
    }),

  /**
   * Create API customer (sign up)
   */
  createCustomer: protectedProcedure
    .input(
      z.object({
        companyName: z.string(),
        contactName: z.string(),
        contactEmail: z.string().email(),
        type: z.enum(["individual", "agency", "enterprise"]).default("individual"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Generate API key
      const apiKey = `sk_${Date.now()}_${Math.random().toString(36).substr(2, 32)}`;

      // Generate affiliate ID
      const affiliateId = `aff_${ctx.user.id}_${Date.now()}`;

      // Create customer
      const [customer] = await db.insert(apiCustomers).values({
        userId: ctx.user.id,
        name: input.companyName,
        email: input.contactEmail,
        apiKey,
        status: "active",
        tier: input.type === "enterprise" ? "enterprise" : input.type === "agency" ? "pro" : "free",
      });

      return {
        customerId: customer.insertId,
        apiKey,
        affiliateId,
        message: "API customer created successfully",
      };
    }),

  /**
   * Get customer info (for logged-in users)
   */
  getCustomer: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const [customer] = await db
      .select()
      .from(apiCustomers)
      .where(eq(apiCustomers.userId, ctx.user.id))
      .limit(1);

    return customer || null;
  }),

  /**
   * Activate module for customer
   */
  activateModule: protectedProcedure
    .input(z.object({ moduleId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get customer
      const [customer] = await db
        .select()
        .from(apiCustomers)
        .where(eq(apiCustomers.userId, ctx.user.id))
        .limit(1);

      if (!customer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "API customer not found. Please sign up first.",
        });
      }

      // Get module config
      const moduleConfig = MODULE_REGISTRY[input.moduleId as keyof typeof MODULE_REGISTRY];
      if (!moduleConfig) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Module not found",
        });
      }

      // Check if already activated
      const [existing] = await db
        .select()
        .from(customerModules)
        .where(eq(customerModules.customerId, customer.id))
        .limit(1);

      if (existing && existing.status === "active") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Module already activated",
        });
      }

      // Activate module
      await db.insert(customerModules).values({
        customerId: customer.id,
        moduleId: input.moduleId,
        status: "active",
        usedThisMonth: 0,
        monthlyQuota: moduleConfig.monthlyQuota,
        overageRate: "0.01", // Default overage rate
      });

      return {
        success: true,
        moduleId: input.moduleId,
        message: "Module activated successfully",
      };
    }),

  /**
   * Get customer's activated modules
   */
  getActivatedModules: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get customer
    const [customer] = await db
      .select()
      .from(apiCustomers)
      .where(eq(apiCustomers.userId, ctx.user.id))
      .limit(1);

    if (!customer) {
      return [];
    }

    // Get activated modules
    const modules = await db
      .select()
      .from(customerModules)
      .where(eq(customerModules.customerId, customer.id));

    return modules;
  }),
});
