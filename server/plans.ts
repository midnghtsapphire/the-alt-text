export type Plan = {
  id: "free" | "pro" | "enterprise";
  name: string;
  price: number;
  priceLabel: string;
  description: string;
  imagesPerMonth: number;
  bulkUploadsPerMonth: number;
  apiCallsPerMonth: number;
  features: string[];
  highlighted?: boolean;
  cta: string;
};

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    priceLabel: "$0/mo",
    description: "Get started with basic alt text generation",
    imagesPerMonth: 50,
    bulkUploadsPerMonth: 0,
    apiCallsPerMonth: 0,
    features: [
      "50 images per month",
      "Single image upload",
      "WCAG 2.1 AA compliance",
      "Basic alt text generation",
      "Download results as CSV",
      "Community support",
    ],
    cta: "Start Free",
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    priceLabel: "$29/mo",
    description: "For growing businesses and agencies",
    imagesPerMonth: 2000,
    bulkUploadsPerMonth: 50,
    apiCallsPerMonth: 5000,
    features: [
      "2,000 images per month",
      "Bulk upload (up to 100 images)",
      "API access (5,000 calls/mo)",
      "WCAG 2.1 AA + AAA compliance",
      "Priority AI processing",
      "Compliance reports",
      "Email support",
      "Custom page context",
    ],
    highlighted: true,
    cta: "Start Pro Trial",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 99,
    priceLabel: "$99/mo",
    description: "For large organizations with compliance needs",
    imagesPerMonth: 25000,
    bulkUploadsPerMonth: 500,
    apiCallsPerMonth: 50000,
    features: [
      "25,000 images per month",
      "Unlimited bulk uploads",
      "API access (50,000 calls/mo)",
      "WCAG 2.1 AA + AAA + Section 508",
      "Dedicated AI processing",
      "Compliance audit reports",
      "Priority support + SLA",
      "Custom integrations",
      "Team management",
      "White-label options",
    ],
    cta: "Contact Sales",
  },
];
