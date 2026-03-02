import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';

/**
 * The Alt Text - Compliance API Database Schema
 * 
 * 10 tables for comprehensive accessibility compliance tracking
 */

// 1. Compliance Scans
export const complianceScans = sqliteTable('compliance_scans', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull(),
  websiteUrl: text('website_url').notNull(),
  scanDate: integer('scan_date', { mode: 'timestamp' }).notNull(),
  complianceScore: integer('compliance_score').notNull(), // 0-100
  wcagLevel: text('wcag_level').notNull(), // 'A', 'AA', 'AAA'
  totalIssues: integer('total_issues').notNull(),
  criticalIssues: integer('critical_issues').notNull(),
  warnings: integer('warnings').notNull(),
  passedChecks: integer('passed_checks').notNull(),
  scanDurationMs: integer('scan_duration_ms').notNull(),
  status: text('status').notNull(), // 'pending', 'completed', 'failed'
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// 2. Compliance Issues
export const complianceIssues = sqliteTable('compliance_issues', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  scanId: text('scan_id').notNull(),
  issueType: text('issue_type').notNull(), // 'missing_alt_text', 'color_contrast', 'keyboard_nav', etc.
  severity: text('severity').notNull(), // 'critical', 'high', 'medium', 'low'
  wcagCriterion: text('wcag_criterion').notNull(), // e.g., '1.1.1', '1.4.3'
  elementSelector: text('element_selector'), // CSS selector
  pageUrl: text('page_url').notNull(),
  description: text('description').notNull(),
  remediationSuggestion: text('remediation_suggestion').notNull(),
  codeSnippet: text('code_snippet'),
  status: text('status').notNull(), // 'open', 'fixed', 'ignored'
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// 3. Accessibility Laws
export const accessibilityLaws = sqliteTable('accessibility_laws', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  jurisdiction: text('jurisdiction').notNull(), // 'federal', 'state', 'international'
  stateCode: text('state_code'), // 'CA', 'NY', 'FL', etc. (null for federal/international)
  lawName: text('law_name').notNull(), // 'ADA Title III', 'Section 508', etc.
  effectiveDate: integer('effective_date', { mode: 'timestamp' }).notNull(),
  requirements: text('requirements').notNull(), // JSON string
  penalties: text('penalties'),
  lastUpdated: integer('last_updated', { mode: 'timestamp' }).notNull(),
  sourceUrl: text('source_url'),
});

// 4. Lawsuit Database
export const lawsuitDatabase = sqliteTable('lawsuit_database', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  caseNumber: text('case_number').notNull(),
  filingDate: integer('filing_date', { mode: 'timestamp' }).notNull(),
  courtJurisdiction: text('court_jurisdiction').notNull(),
  plaintiffName: text('plaintiff_name').notNull(),
  defendantCompany: text('defendant_company').notNull(),
  defendantIndustry: text('defendant_industry').notNull(),
  outcome: text('outcome').notNull(), // 'settled', 'won', 'lost', 'pending'
  settlementAmount: real('settlement_amount'), // in USD
  legalFees: real('legal_fees'), // in USD
  plaintiffAttorney: text('plaintiff_attorney'),
  caseSummary: text('case_summary'),
  sourceUrl: text('source_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// 5. Business Risk Scores
export const businessRiskScores = sqliteTable('business_risk_scores', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull(),
  websiteUrl: text('website_url').notNull(),
  industry: text('industry').notNull(),
  state: text('state').notNull(),
  employeeCount: integer('employee_count'),
  annualRevenue: real('annual_revenue'), // in USD
  complianceScore: integer('compliance_score').notNull(), // 0-100
  lawsuitRiskScore: integer('lawsuit_risk_score').notNull(), // 0-100
  riskLevel: text('risk_level').notNull(), // 'low', 'medium', 'high', 'critical'
  calculatedDate: integer('calculated_date', { mode: 'timestamp' }).notNull(),
  factors: text('factors').notNull(), // JSON string - breakdown of risk factors
});

// 6. ROI Calculations
export const roiCalculations = sqliteTable('roi_calculations', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull(),
  lawsuitPreventionValue: real('lawsuit_prevention_value').notNull(), // in USD
  seoBoostValue: real('seo_boost_value').notNull(), // in USD
  customerExpansionValue: real('customer_expansion_value').notNull(), // in USD
  co2SavingsKg: real('co2_savings_kg').notNull(), // in kilograms
  co2SavingsValue: real('co2_savings_value').notNull(), // in USD (carbon credit value)
  totalRoi: real('total_roi').notNull(), // in USD
  calculationDate: integer('calculation_date', { mode: 'timestamp' }).notNull(),
  assumptions: text('assumptions').notNull(), // JSON string
});

// 7. Alt Text Generations
export const altTextGenerations = sqliteTable('alt_text_generations', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull(),
  imageUrl: text('image_url').notNull(),
  generatedAltText: text('generated_alt_text').notNull(),
  confidenceScore: real('confidence_score').notNull(), // 0-1
  modelUsed: text('model_used').notNull(), // 'gpt-4-vision', 'claude-3-vision', etc.
  wcagCompliant: integer('wcag_compliant', { mode: 'boolean' }).notNull(),
  characterCount: integer('character_count').notNull(),
  keywords: text('keywords').notNull(), // JSON array
  generationDate: integer('generation_date', { mode: 'timestamp' }).notNull(),
});

// 8. Image Optimizations
export const imageOptimizations = sqliteTable('image_optimizations', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull(),
  originalImageUrl: text('original_image_url').notNull(),
  optimizedImageUrl: text('optimized_image_url').notNull(),
  originalSizeBytes: integer('original_size_bytes').notNull(),
  optimizedSizeBytes: integer('optimized_size_bytes').notNull(),
  compressionRatio: real('compression_ratio').notNull(), // 0-1 (e.g., 0.5 = 50% reduction)
  formatOriginal: text('format_original').notNull(), // 'jpg', 'png', 'gif', etc.
  formatOptimized: text('format_optimized').notNull(), // 'webp', 'avif', etc.
  co2SavedKg: real('co2_saved_kg').notNull(), // CO2 savings from reduced bandwidth
  optimizationDate: integer('optimization_date', { mode: 'timestamp' }).notNull(),
});

// 9. Domain Registrations
export const domainRegistrations = sqliteTable('domain_registrations', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull(),
  domainName: text('domain_name').notNull(),
  registrationDate: integer('registration_date', { mode: 'timestamp' }).notNull(),
  expirationDate: integer('expiration_date', { mode: 'timestamp' }).notNull(),
  platformOrderId: text('platform_order_id'), // Reference to platform order
  pricePaid: real('price_paid').notNull(), // in USD
  autoRenew: integer('auto_renew', { mode: 'boolean' }).notNull(),
  status: text('status').notNull(), // 'active', 'expired', 'cancelled'
});

// 10. Compliance Subscriptions
export const complianceSubscriptions = sqliteTable('compliance_subscriptions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull(),
  planTier: text('plan_tier').notNull(), // 'starter', 'professional', 'enterprise'
  monthlyPrice: real('monthly_price').notNull(), // in USD
  imageLimit: integer('image_limit'), // null = unlimited
  pageLimit: integer('page_limit'), // null = unlimited
  scanFrequency: text('scan_frequency').notNull(), // 'monthly', 'weekly', 'daily'
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  nextBillingDate: integer('next_billing_date', { mode: 'timestamp' }).notNull(),
  status: text('status').notNull(), // 'active', 'cancelled', 'past_due'
  stripeSubscriptionId: text('stripe_subscription_id'),
});

// Indexes for performance
export const complianceScansIndexes = {
  userIdIdx: 'compliance_scans_user_id_idx',
  websiteUrlIdx: 'compliance_scans_website_url_idx',
  scanDateIdx: 'compliance_scans_scan_date_idx',
};

export const complianceIssuesIndexes = {
  scanIdIdx: 'compliance_issues_scan_id_idx',
  issueTypeIdx: 'compliance_issues_issue_type_idx',
  severityIdx: 'compliance_issues_severity_idx',
};

export const lawsuitDatabaseIndexes = {
  defendantIndustryIdx: 'lawsuit_database_defendant_industry_idx',
  courtJurisdictionIdx: 'lawsuit_database_court_jurisdiction_idx',
  outcomeIdx: 'lawsuit_database_outcome_idx',
};

export const businessRiskScoresIndexes = {
  userIdIdx: 'business_risk_scores_user_id_idx',
  industryIdx: 'business_risk_scores_industry_idx',
  riskLevelIdx: 'business_risk_scores_risk_level_idx',
};
