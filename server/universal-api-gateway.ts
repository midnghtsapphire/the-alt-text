/**
 * Universal API Gateway
 * Single endpoint for all 50 API modules with pay-per-module pricing
 */

import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { apiCustomers, customerModules, apiUsage, affiliateClicks, affiliateConversions, affiliateTracking } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * Module Registry - All 50 API modules defined here
 */
export const MODULE_REGISTRY = {
  quiz_campaign: {
    id: "quiz_campaign",
    name: "Quiz-to-Campaign",
    description: "AI-powered quizzes with affiliate tracking and lead generation",
    category: "business" as const,
    price: 9,
    monthlyQuota: 1000,
    overageCost: 0.01,
    hasAffiliateLinks: true,
    affiliateCommission: "40% lifetime (Marquiz)",
    actions: ["create_quiz", "submit_response", "generate_results", "track_conversion"] as string[],
    dependencies: [],
  },
  
  code_review: {
    id: "code_review",
    name: "Code Review",
    description: "Automated code quality checks with security scanning",
    category: "core" as const,
    price: 19,
    monthlyQuota: 500,
    overageCost: 0.02,
    hasAffiliateLinks: true,
    affiliateCommission: "$30/lead (CodeRabbit), Partner program (Snyk)",
    actions: ["scan_project", "validate_typescript", "check_security", "generate_report"] as string[],
    dependencies: [],
  },
  
  affiliate_marketing: {
    id: "affiliate_marketing",
    name: "Affiliate Marketing",
    description: "Generate and track affiliate links with UTM parameters",
    category: "business" as const,
    price: 9,
    monthlyQuota: 5000,
    overageCost: 0.01,
    hasAffiliateLinks: false, // This IS the affiliate module
    affiliateCommission: null,
    actions: ["generate_link", "track_click", "track_conversion", "get_analytics"] as string[],
    dependencies: [],
  },
  
  auth: {
    id: "auth",
    name: "Authentication",
    description: "Multi-provider OAuth (Google, GitHub, Microsoft, LinkedIn)",
    category: "core" as const,
    price: 9,
    monthlyQuota: 10000,
    overageCost: 0.005,
    hasAffiliateLinks: false,
    affiliateCommission: null,
    actions: ["login", "logout", "refresh_token", "get_user", "verify_token"] as string[],
    dependencies: [],
  },
  
  payment: {
    id: "payment",
    name: "Payment Processing",
    description: "Stripe + Plaid integration for payments and bank transfers",
    category: "core" as const,
    price: 14,
    monthlyQuota: 2000,
    overageCost: 0.01,
    hasAffiliateLinks: false,
    affiliateCommission: null,
    actions: ["create_checkout", "process_payment", "handle_webhook", "refund", "link_bank_account"] as string[],
    dependencies: [],
    transactionFee: 0.005, // 0.5% additional fee
  },
  
  // Add more modules here as they're built
  // social_media, email, storage, analytics, etc.
} as const;

export type ModuleId = keyof typeof MODULE_REGISTRY;

/**
 * Validate API key and return customer
 */
export async function validateAPIKey(apiKey: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [customer] = await db
    .select()
    .from(apiCustomers)
    .where(and(
      eq(apiCustomers.apiKey, apiKey),
      eq(apiCustomers.status, "active")
    ))
    .limit(1);
  
  return customer || null;
}

/**
 * Check if customer has module activated
 */
export async function getCustomerModule(customerId: number, moduleId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [customerModule] = await db
    .select()
    .from(customerModules)
    .where(and(
      eq(customerModules.customerId, customerId),
      eq(customerModules.moduleId, moduleId),
      eq(customerModules.status, "active")
    ))
    .limit(1);
  
  return customerModule || null;
}

/**
 * Track API usage
 */
export async function trackAPIUsage(data: {
  customerId: number;
  moduleId: string;
  action: string;
  timestamp: Date;
  success: boolean;
  responseTime: number;
  cost: number;
  errorMessage?: string;
  metadata?: any;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(apiUsage).values({
    customerId: data.customerId,
    moduleId: data.moduleId,
    action: data.action,
    endpoint: `/${data.moduleId}/${data.action}`,
    success: data.success,
    responseTime: data.responseTime,
    cost: data.cost.toString(),
    errorMessage: data.errorMessage,
    metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    createdAt: data.timestamp,
  });
}

/**
 * Increment call count for customer module
 */
export async function incrementCallCount(customerModuleId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(customerModules)
    .set({
      usedThisMonth: (customerModules.usedThisMonth as any) + 1,
    })
    .where(eq(customerModules.id, customerModuleId));
}

/**
 * Calculate cost of API call (overage charges)
 */
export function calculateCallCost(customerModule: any): number {
  if (!customerModule.monthlyQuota || customerModule.usedThisMonth < customerModule.monthlyQuota) {
    return 0; // Within limit, no charge
  }
  
  // Get module config
  const moduleConfig = MODULE_REGISTRY[customerModule.moduleId as ModuleId];
  if (!moduleConfig) return 0;
  
  return moduleConfig.overageCost;
}

/**
 * Track affiliate event (hidden revenue)
 */
export async function trackAffiliateEvent(data: {
  customerId: number;
  moduleId: string;
  affiliateProgram: string;
  event: "click" | "signup" | "conversion";
  eventData?: any;
  commission?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(affiliateTracking).values({
    customerId: data.customerId,
    moduleId: data.moduleId,
    affiliateProgram: data.affiliateProgram,
    event: data.event,
    eventData: data.eventData ? JSON.stringify(data.eventData) : null,
    commission: data.commission?.toString(),
    timestamp: new Date(),
  });
}

/**
 * Main API Gateway Handler
 * This is called by the tRPC endpoint
 */
export async function handleAPIRequest(
  apiKey: string,
  moduleId: string,
  action: string,
  params: any
) {
  const startTime = Date.now();
  
  try {
    // 1. Validate API key
    const customer = await validateAPIKey(apiKey);
    if (!customer) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid API key",
      });
    }
    
    // 2. Check if module exists
    const moduleConfig = MODULE_REGISTRY[moduleId as ModuleId];
    if (!moduleConfig) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Module '${moduleId}' not found`,
      });
    }
    
    // 3. Check if module is activated for customer
    const customerModule = await getCustomerModule(customer.id, moduleId);
    if (!customerModule || customerModule.status !== "active") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Module '${moduleId}' not activated. Visit marketplace to activate.`,
      });
    }
    
    // 4. Check usage limits
    if (
      customerModule.monthlyQuota &&
      customerModule.usedThisMonth >= customerModule.monthlyQuota &&
      !customerModule.overageRate
    ) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Monthly quota reached. Enable overage or upgrade plan.",
      });
    }
    
    // 5. Check if action is valid for module
    if (!moduleConfig.actions.includes(action as any)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Action '${action}' not available for module '${moduleId}'`,
      });
    }
    
    // 6. Route to module handler
    const result = await routeToModuleHandler(moduleId, action, params, customer);
    
    // 7. Track usage
    const responseTime = Date.now() - startTime;
    const cost = calculateCallCost(customerModule);
    
    await trackAPIUsage({
      customerId: customer.id,
      moduleId,
      action,
      timestamp: new Date(),
      success: true,
      responseTime,
      cost,
      metadata: { params },
    });
    
    // 8. Increment call count
    await incrementCallCount(customerModule.id);
    
    // 9. Return result with usage info
    return {
      success: true,
      module: moduleId,
      action,
      data: result,
      usage: {
        calls_this_month: customerModule.usedThisMonth + 1,
        limit: customerModule.monthlyQuota || 'unlimited',
        overage_rate: customerModule.overageRate ? `$${customerModule.overageRate}/call` : 'N/A',
      },
    };
  } catch (error) {
    // Track failed request
    const responseTime = Date.now() - startTime;
    
    if (error instanceof TRPCError) {
      throw error;
    }
    
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Route request to appropriate module handler
 */
async function routeToModuleHandler(
  moduleId: string,
  action: string,
  params: any,
  customer: any
) {
  // Import module handlers dynamically
  switch (moduleId) {
    case "quiz_campaign":
//       const quizHandler = await import("./modules/quiz-campaign-handler");
//       return quizHandler.handleAction(action, params, customer);
      throw new Error("Quiz campaign module is currently disabled");
    
    case "code_review":
      const codeReviewHandler = await import("./modules/code-review-handler");
      return codeReviewHandler.handleAction(action, params, customer);
    
    case "affiliate_marketing":
//       const affiliateHandler = await import("./modules/affiliate-marketing-handler");
//       return affiliateHandler.handleAction(action, params, customer);
      throw new Error("Affiliate marketing module is currently disabled");
    
    case "auth":
      const authHandler = await import("./modules/auth-handler");
      return authHandler.handleAction(action, params, customer);
    
    case "payment":
      const paymentHandler = await import("./modules/payment-handler");
      return paymentHandler.handleAction(action, params, customer);
    
    default:
      throw new TRPCError({
        code: "NOT_IMPLEMENTED",
        message: `Module '${moduleId}' handler not implemented yet`,
      });
  }
}

/**
 * Helper to embed affiliate links in module responses
 */
export function embedAffiliateLinks(
  moduleId: string,
  response: any,
  affiliateId: string
): any {
  const moduleConfig = MODULE_REGISTRY[moduleId as ModuleId];
  
  if (!moduleConfig?.hasAffiliateLinks) {
    return response;
  }
  
  // Add affiliate recommendations based on module
  const recommendations = [];
  
  if (moduleId === "code_review") {
    recommendations.push({
      toolName: "CodeRabbit",
      description: "AI-powered code review that catches bugs in 10 minutes",
      affiliateUrl: `https://partners.dub.co/coderabbit?ref=${affiliateId}`,
      commission: "$30/lead",
      features: [
        "Catches race conditions, null pointers, memory leaks",
        "Understands your codebase (40+ sources)",
        "One-click fixes",
        "Security vulnerability scanning",
      ],
    });
    
    recommendations.push({
      toolName: "Snyk",
      description: "Developer security platform for finding and fixing vulnerabilities",
      affiliateUrl: `https://snyk.io/?ref=${affiliateId}`,
      commission: "Partner program",
      features: [
        "Open source security",
        "Container security",
        "Infrastructure as code security",
        "Code security",
      ],
    });
  }
  
  if (moduleId === "quiz_campaign") {
    recommendations.push({
      toolName: "Marquiz",
      description: "Advanced quiz builder with conversion optimization",
      affiliateUrl: `https://marquiz.io/?ref=${affiliateId}`,
      commission: "40% lifetime",
      features: [
        "Drag-and-drop quiz builder",
        "Conditional logic",
        "CRM integrations",
        "A/B testing",
      ],
    });
  }
  
  // Add recommendations to response
  return {
    ...response,
    recommendations,
    attribution: "Powered by Universal API. Some features provided by third-party partners.",
  };
}
