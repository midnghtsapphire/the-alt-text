/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

// ============================================================================
// APP-SPECIFIC TYPES
// ============================================================================
export type PlanId = "free" | "pro" | "enterprise";

export type AltTextResult = {
  id?: number;
  altText: string;
  confidence: number;
  imageType: string;
  wcagCompliance: string;
  processingTimeMs: number;
};

export type DashboardStats = {
  totalImages: number;
  completedImages: number;
  failedImages: number;
  avgConfidence: number;
  plan: string;
  imagesPerMonth: number;
  imagesUsedThisMonth: number;
  complianceScore: number;
};
