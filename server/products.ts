/**
 * Module 05: Stripe Commerce Engine - Product Definitions
 * 
 * This file defines all products available for purchase in Mechatropolis.
 * Products include training programs, certifications, tools, and subscriptions.
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // in cents
  currency: string;
  type: "one_time" | "subscription";
  interval?: "month" | "year"; // for subscriptions
  category: "training" | "certification" | "tool" | "subscription";
  features: string[];
  stripePriceId?: string; // Stripe Price ID (set after creating in Stripe)
  image?: string;
  popular?: boolean;
}

/**
 * Training Programs
 * Based on FAME program and other training opportunities
 */
export const trainingProducts: Product[] = [
  {
    id: "fame-apprenticeship",
    name: "FAME Apprenticeship Program",
    description: "Earn while you learn! $30k starting salary with full benefits, leading to $102k total compensation.",
    price: 0, // Free to apply, but we can add a premium placement service
    currency: "usd",
    type: "one_time",
    category: "training",
    features: [
      "Earn $30k while learning",
      "$102k total compensation potential",
      "Full benefits package",
      "Hands-on training with industry leaders",
      "Job placement guarantee",
      "No upfront cost"
    ],
    popular: true,
  },
  {
    id: "cnc-machining-course",
    name: "CNC Machining Fundamentals",
    description: "12-week intensive course covering CNC programming, setup, and operation.",
    price: 2999_00, // $2,999
    currency: "usd",
    type: "one_time",
    category: "training",
    features: [
      "12 weeks of hands-on training",
      "CNC programming (G-code, CAM software)",
      "Machine setup and operation",
      "Blueprint reading",
      "Quality control basics",
      "Job placement assistance"
    ],
  },
  {
    id: "cad-design-course",
    name: "CAD Design for Tool & Die",
    description: "8-week course covering SolidWorks, AutoCAD, and design principles for tool and die applications.",
    price: 1999_00, // $1,999
    currency: "usd",
    type: "one_time",
    category: "training",
    features: [
      "8 weeks of instruction",
      "SolidWorks certification prep",
      "AutoCAD fundamentals",
      "3D modeling for manufacturing",
      "Design for manufacturability (DFM)",
      "Portfolio projects"
    ],
  },
  {
    id: "welding-certification-prep",
    name: "Welding Certification Prep",
    description: "6-week course preparing you for AWS (American Welding Society) certification exams.",
    price: 1499_00, // $1,499
    currency: "usd",
    type: "one_time",
    category: "training",
    features: [
      "6 weeks of intensive practice",
      "AWS certification exam prep",
      "MIG, TIG, and stick welding",
      "Welding inspection basics",
      "Safety certification",
      "Exam fee included"
    ],
  },
];

/**
 * Certifications
 * Industry-recognized certifications to boost career prospects
 */
export const certificationProducts: Product[] = [
  {
    id: "nims-machining-level-1",
    name: "NIMS Machining Level 1 Certification",
    description: "National Institute for Metalworking Skills (NIMS) Level 1 certification exam and study materials.",
    price: 499_00, // $499
    currency: "usd",
    type: "one_time",
    category: "certification",
    features: [
      "NIMS Level 1 exam voucher",
      "Study guide and practice tests",
      "Video tutorials",
      "Exam scheduling assistance",
      "Nationally recognized credential",
      "Lifetime certification"
    ],
  },
  {
    id: "solidworks-associate",
    name: "CSWA (Certified SolidWorks Associate)",
    description: "Official SolidWorks certification exam and prep course.",
    price: 399_00, // $399
    currency: "usd",
    type: "one_time",
    category: "certification",
    features: [
      "CSWA exam voucher",
      "Official prep course",
      "Practice exams",
      "Certificate upon passing",
      "Industry-recognized credential",
      "Resume boost"
    ],
  },
  {
    id: "osha-30-manufacturing",
    name: "OSHA 30-Hour Manufacturing Safety",
    description: "OSHA 30-hour safety certification for manufacturing environments.",
    price: 299_00, // $299
    currency: "usd",
    type: "one_time",
    category: "certification",
    features: [
      "30-hour online course",
      "OSHA 30 card upon completion",
      "Hazard recognition training",
      "PPE requirements",
      "Machine guarding",
      "10-year validity"
    ],
  },
];

/**
 * Subscriptions
 * Recurring access to premium features and resources
 */
export const subscriptionProducts: Product[] = [
  {
    id: "premium-monthly",
    name: "Mechatropolis Premium (Monthly)",
    description: "Unlock all premium features, exclusive content, and personalized career coaching.",
    price: 29_00, // $29/month
    currency: "usd",
    type: "subscription",
    interval: "month",
    category: "subscription",
    features: [
      "Unlimited access to all training materials",
      "Personalized career roadmap",
      "Monthly 1-on-1 coaching session",
      "Exclusive job board access",
      "Priority support",
      "Cancel anytime"
    ],
    popular: true,
  },
  {
    id: "premium-annual",
    name: "Mechatropolis Premium (Annual)",
    description: "Save 20% with annual billing. All premium features included.",
    price: 279_00, // $279/year (saves $69)
    currency: "usd",
    type: "subscription",
    interval: "year",
    category: "subscription",
    features: [
      "Everything in Monthly plan",
      "Save $69 per year",
      "Annual career assessment",
      "Certification discount vouchers",
      "Early access to new features",
      "Cancel anytime"
    ],
  },
];

/**
 * Tools & Resources
 * Digital tools and resources for career development
 */
export const toolProducts: Product[] = [
  {
    id: "salary-negotiation-guide",
    name: "Salary Negotiation Masterclass",
    description: "Learn how to negotiate your salary like a pro. Includes templates, scripts, and video lessons.",
    price: 49_00, // $49
    currency: "usd",
    type: "one_time",
    category: "tool",
    features: [
      "12 video lessons",
      "Negotiation scripts and templates",
      "Salary research tools",
      "Email templates",
      "Counteroffer strategies",
      "Lifetime access"
    ],
  },
  {
    id: "resume-review-service",
    name: "Professional Resume Review",
    description: "Get your resume reviewed by industry experts with personalized feedback and rewrite suggestions.",
    price: 99_00, // $99
    currency: "usd",
    type: "one_time",
    category: "tool",
    features: [
      "Expert resume review",
      "Personalized feedback",
      "ATS optimization tips",
      "Keyword suggestions",
      "Before/after examples",
      "48-hour turnaround"
    ],
  },
  {
    id: "interview-prep-package",
    name: "Interview Preparation Package",
    description: "Comprehensive interview prep including mock interviews, common questions, and feedback.",
    price: 149_00, // $149
    currency: "usd",
    type: "one_time",
    category: "tool",
    features: [
      "2 mock interview sessions",
      "100+ common interview questions",
      "STAR method training",
      "Body language tips",
      "Follow-up email templates",
      "Personalized feedback report"
    ],
  },
];

/**
 * All products combined
 */
export const allProducts: Product[] = [
  ...trainingProducts,
  ...certificationProducts,
  ...subscriptionProducts,
  ...toolProducts,
];

/**
 * Get product by ID
 */
export function getProductById(id: string): Product | undefined {
  return allProducts.find(p => p.id === id);
}

/**
 * Get products by category
 */
export function getProductsByCategory(category: Product["category"]): Product[] {
  return allProducts.filter(p => p.category === category);
}

/**
 * Get popular products
 */
export function getPopularProducts(): Product[] {
  return allProducts.filter(p => p.popular);
}
