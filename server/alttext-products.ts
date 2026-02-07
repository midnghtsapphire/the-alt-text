/**
 * THE ALT TEXT - SUBSCRIPTION PLANS
 * thealttext.com
 */

export const ALT_TEXT_PLANS = {
  starter: {
    name: "Starter",
    price: 99, // USD per month
    priceId: process.env.STRIPE_PRICE_STARTER || "price_starter",
    features: [
      "10 website scans per month",
      "Up to 50 pages per scan",
      "500 images analyzed per month",
      "AI-powered alt text generation",
      "Basic compliance reports (PDF)",
      "Email support",
      "7-day free trial",
    ],
    limits: {
      maxScansPerMonth: 10,
      maxPagesPerScan: 50,
      maxImagesPerMonth: 500,
    },
  },
  professional: {
    name: "Professional",
    price: 299, // USD per month
    priceId: process.env.STRIPE_PRICE_PROFESSIONAL || "price_professional",
    features: [
      "100 website scans per month",
      "Up to 500 pages per scan",
      "5,000 images analyzed per month",
      "AI-powered alt text generation",
      "Advanced compliance reports (PDF + HTML)",
      "Automated fix injection",
      "API access (100 requests/hour)",
      "Priority email support",
      "14-day free trial",
    ],
    limits: {
      maxScansPerMonth: 100,
      maxPagesPerScan: 500,
      maxImagesPerMonth: 5000,
    },
  },
  enterprise: {
    name: "Enterprise",
    price: 999, // USD per month
    priceId: process.env.STRIPE_PRICE_ENTERPRISE || "price_enterprise",
    features: [
      "Unlimited website scans",
      "Unlimited pages per scan",
      "Unlimited images analyzed",
      "AI-powered alt text generation",
      "Executive compliance reports (all formats)",
      "Automated fix injection",
      "Full API access (unlimited)",
      "Webhook notifications",
      "Dedicated account manager",
      "Phone + email support",
      "Custom integrations",
      "30-day free trial",
    ],
    limits: {
      maxScansPerMonth: -1, // -1 = unlimited
      maxPagesPerScan: -1,
      maxImagesPerMonth: -1,
    },
  },
};

/**
 * ROI Calculator - Estimate lawsuit risk and cost savings
 */
export function calculateROI(params: {
  imagesMissingAlt: number;
  pagesScanned: number;
  industryType?: string;
}) {
  const { imagesMissingAlt, pagesScanned, industryType = "general" } = params;

  // Average ADA lawsuit settlement: $10,000 - $75,000
  // Source: https://www.adatitleiii.com/
  const avgLawsuitCost = 40000;

  // Risk multiplier based on violations
  const violationRisk = imagesMissingAlt / Math.max(pagesScanned, 1);
  const riskMultiplier = Math.min(violationRisk * 2, 1); // Cap at 100%

  // Industry risk factors
  const industryRiskFactors: Record<string, number> = {
    ecommerce: 1.5, // Higher risk due to transactions
    healthcare: 1.3,
    education: 1.2,
    government: 1.4,
    finance: 1.5,
    general: 1.0,
  };

  const industryFactor = industryRiskFactors[industryType] || 1.0;

  // Estimated lawsuit risk
  const estimatedLawsuitRisk = avgLawsuitCost * riskMultiplier * industryFactor;

  // Cost savings = lawsuit risk - subscription cost
  const subscriptionCost = 99; // Starter plan minimum
  const estimatedCostSavings = estimatedLawsuitRisk - subscriptionCost;

  // ROI percentage
  const roiPercentage =
    subscriptionCost > 0
      ? ((estimatedCostSavings - subscriptionCost) / subscriptionCost) * 100
      : 0;

  return {
    estimatedLawsuitRisk: Math.round(estimatedLawsuitRisk),
    estimatedCostSavings: Math.round(estimatedCostSavings),
    roiPercentage: Math.round(roiPercentage),
    riskLevel:
      riskMultiplier > 0.7
        ? "high"
        : riskMultiplier > 0.3
        ? "medium"
        : "low",
  };
}
