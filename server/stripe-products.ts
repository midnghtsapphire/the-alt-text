/**
 * Stripe Products Configuration for Headhunter Module
 * 
 * Placement fees are calculated dynamically based on:
 * - Candidate salary
 * - Commission rate (20-40%)
 * - Retention bonus structure
 * 
 * This file defines product templates for Stripe checkout.
 */

export interface PlacementFeeProduct {
  name: string;
  description: string;
  amount: number; // in cents
  currency: string;
  metadata: {
    placementId: string;
    commissionId: string;
    candidateName: string;
    jobTitle: string;
    partnerName: string;
  };
}

/**
 * Create a Stripe product for a placement fee
 */
export function createPlacementFeeProduct(params: {
  placementId: number;
  commissionId: number;
  candidateName: string;
  jobTitle: string;
  partnerName: string;
  amount: number; // in dollars
}): PlacementFeeProduct {
  return {
    name: `Placement Fee - ${params.candidateName}`,
    description: `${params.jobTitle} placement at ${params.partnerName}`,
    amount: Math.round(params.amount * 100), // Convert to cents
    currency: "usd",
    metadata: {
      placementId: params.placementId.toString(),
      commissionId: params.commissionId.toString(),
      candidateName: params.candidateName,
      jobTitle: params.jobTitle,
      partnerName: params.partnerName,
    },
  };
}

/**
 * Create a Stripe product for a retention bonus fee
 */
export function createRetentionBonusFeeProduct(params: {
  placementId: number;
  commissionId: number;
  milestoneId: number;
  candidateName: string;
  milestoneDays: number;
  partnerName: string;
  amount: number; // in dollars
}): PlacementFeeProduct {
  return {
    name: `Retention Bonus - ${params.candidateName} (${params.milestoneDays} days)`,
    description: `${params.milestoneDays}-day retention bonus for ${params.candidateName} at ${params.partnerName}`,
    amount: Math.round(params.amount * 100), // Convert to cents
    currency: "usd",
    metadata: {
      placementId: params.placementId.toString(),
      commissionId: params.commissionId.toString(),
      candidateName: params.candidateName,
      jobTitle: `${params.milestoneDays}-day retention bonus`,
      partnerName: params.partnerName,
    },
  };
}

/**
 * Standard commission rate tiers
 */
export const COMMISSION_RATE_TIERS = {
  entry: { min: 40000, max: 60000, rate: 0.20 }, // 20%
  mid: { min: 60000, max: 80000, rate: 0.25 }, // 25%
  specialized: { min: 80000, max: 120000, rate: 0.30 }, // 30%
  highNA: { min: 120000, max: 200000, rate: 0.35 }, // 35-40%
};

/**
 * Calculate commission amount based on salary
 */
export function calculateCommission(salary: number, customRate?: number): number {
  if (customRate) {
    return salary * customRate;
  }

  // Determine tier based on salary
  if (salary < 60000) return salary * COMMISSION_RATE_TIERS.entry.rate;
  if (salary < 80000) return salary * COMMISSION_RATE_TIERS.mid.rate;
  if (salary < 120000) return salary * COMMISSION_RATE_TIERS.specialized.rate;
  return salary * COMMISSION_RATE_TIERS.highNA.rate;
}

/**
 * Standard retention bonus structure
 */
export const STANDARD_RETENTION_BONUSES = {
  30: 5000, // $5k at 30 days
  90: 10000, // $10k at 90 days
  180: 15000, // $15k at 180 days
  365: 20000, // $20k at 365 days
};
