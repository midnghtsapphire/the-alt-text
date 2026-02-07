import { int, mysqlTable, text, timestamp, varchar, decimal, mysqlEnum, boolean } from "drizzle-orm/mysql-core";

/**
 * THE ALT TEXT - CORE PLATFORM SCHEMA
 * AI-Powered Accessibility Compliance Platform
 */

/**
 * Subscriptions - Customer subscription plans
 */
export const altTextSubscriptions = mysqlTable("alttext_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(), // Link to users table
  
  // Plan details
  plan: mysqlEnum("plan", ["starter", "professional", "enterprise"]).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(), // Monthly price
  
  // Stripe integration
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  stripePriceId: varchar("stripe_price_id", { length: 255 }),
  
  // Limits based on plan
  maxScansPerMonth: int("max_scans_per_month").notNull(), // Starter: 10, Pro: 100, Enterprise: unlimited (-1)
  maxPagesPerScan: int("max_pages_per_scan").notNull(), // Starter: 50, Pro: 500, Enterprise: unlimited (-1)
  maxImagesPerMonth: int("max_images_per_month").notNull(), // Starter: 500, Pro: 5000, Enterprise: unlimited (-1)
  
  // Usage tracking
  scansUsedThisMonth: int("scans_used_this_month").notNull().default(0),
  pagesScannedThisMonth: int("pages_scanned_this_month").notNull().default(0),
  imagesFixedThisMonth: int("images_fixed_this_month").notNull().default(0),
  
  // Status
  status: mysqlEnum("status", ["active", "cancelled", "past_due", "trialing"]).notNull().default("active"),
  trialEndsAt: timestamp("trial_ends_at"),
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  cancelledAt: timestamp("cancelled_at"),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

/**
 * Website Scans - Track all website accessibility scans
 */
export const altTextScans = mysqlTable("alttext_scans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  subscriptionId: int("subscription_id").notNull(),
  
  // Scan details
  websiteUrl: varchar("website_url", { length: 500 }).notNull(),
  scanType: mysqlEnum("scan_type", ["full", "single_page", "custom"]).notNull().default("full"),
  
  // Scan configuration
  maxPages: int("max_pages").notNull().default(50),
  includeSubdomains: boolean("include_subdomains").notNull().default(false),
  customUrls: text("custom_urls"), // JSON array of specific URLs to scan
  
  // Scan results
  pagesScanned: int("pages_scanned").notNull().default(0),
  imagesFound: int("images_found").notNull().default(0),
  imagesMissingAlt: int("images_missing_alt").notNull().default(0),
  imagesWithEmptyAlt: int("images_with_empty_alt").notNull().default(0),
  imagesWithGoodAlt: int("images_with_good_alt").notNull().default(0),
  
  // Compliance metrics
  complianceScore: decimal("compliance_score", { precision: 5, scale: 2 }).notNull().default("0.00"), // 0-100
  wcagLevel: mysqlEnum("wcag_level", ["A", "AA", "AAA"]).notNull().default("AA"),
  violationsFound: int("violations_found").notNull().default(0),
  
  // Status
  status: mysqlEnum("status", ["pending", "scanning", "completed", "failed"]).notNull().default("pending"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  errorMessage: text("error_message"),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

/**
 * Scan Results - Detailed results for each page scanned
 */
export const altTextScanResults = mysqlTable("alttext_scan_results", {
  id: int("id").autoincrement().primaryKey(),
  scanId: int("scan_id").notNull(),
  
  // Page details
  pageUrl: varchar("page_url", { length: 500 }).notNull(),
  pageTitle: varchar("page_title", { length: 500 }),
  httpStatus: int("http_status").notNull(),
  
  // Page metrics
  imagesFound: int("images_found").notNull().default(0),
  imagesMissingAlt: int("images_missing_alt").notNull().default(0),
  imagesWithEmptyAlt: int("images_with_empty_alt").notNull().default(0),
  
  // Compliance
  complianceScore: decimal("compliance_score", { precision: 5, scale: 2 }).notNull().default("0.00"),
  violationsFound: int("violations_found").notNull().default(0),
  
  // Metadata
  scannedAt: timestamp("scanned_at").defaultNow().notNull(),
});

/**
 * Image Analysis - AI-generated alt text for each image
 */
export const altTextImageAnalysis = mysqlTable("alttext_image_analysis", {
  id: int("id").autoincrement().primaryKey(),
  scanResultId: int("scan_result_id").notNull(),
  
  // Image details
  imageUrl: varchar("image_url", { length: 1000 }).notNull(),
  imageSelector: varchar("image_selector", { length: 500 }), // CSS selector or XPath
  currentAltText: text("current_alt_text"), // Existing alt text (if any)
  
  // AI analysis
  generatedAltText: text("generated_alt_text").notNull(), // AI-generated alt text
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull(), // 0-100
  imageType: mysqlEnum("image_type", ["photo", "illustration", "logo", "icon", "diagram", "chart", "screenshot", "decorative"]),
  
  // Image properties
  width: int("width"),
  height: int("height"),
  fileSize: int("file_size"), // bytes
  format: varchar("format", { length: 20 }), // jpg, png, svg, webp, etc.
  
  // Context
  surroundingText: text("surrounding_text"), // Text around the image for context
  pageContext: text("page_context"), // Page title, headings, etc.
  
  // Status
  status: mysqlEnum("status", ["pending", "analyzed", "approved", "rejected"]).notNull().default("pending"),
  reviewedBy: int("reviewed_by"), // User ID who reviewed
  reviewedAt: timestamp("reviewed_at"),
  
  // Metadata
  analyzedAt: timestamp("analyzed_at").defaultNow().notNull(),
});

/**
 * Fixes Applied - Track automated fixes applied to websites
 */
export const altTextFixes = mysqlTable("alttext_fixes", {
  id: int("id").autoincrement().primaryKey(),
  scanId: int("scan_id").notNull(),
  imageAnalysisId: int("image_analysis_id").notNull(),
  
  // Fix details
  fixType: mysqlEnum("fix_type", ["add_alt", "update_alt", "add_aria_label", "mark_decorative"]).notNull(),
  beforeValue: text("before_value"), // Original alt text or empty
  afterValue: text("after_value").notNull(), // New alt text
  
  // Application method
  method: mysqlEnum("method", ["api", "manual", "plugin", "script"]).notNull(),
  appliedBy: int("applied_by"), // User ID
  
  // Status
  status: mysqlEnum("status", ["pending", "applied", "failed", "reverted"]).notNull().default("pending"),
  errorMessage: text("error_message"),
  
  // Metadata
  appliedAt: timestamp("applied_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Compliance Reports - Generated reports for customers
 */
export const altTextReports = mysqlTable("alttext_reports", {
  id: int("id").autoincrement().primaryKey(),
  scanId: int("scan_id").notNull(),
  userId: int("user_id").notNull(),
  
  // Report details
  reportType: mysqlEnum("report_type", ["summary", "detailed", "executive", "technical"]).notNull().default("summary"),
  format: mysqlEnum("format", ["pdf", "html", "json"]).notNull().default("pdf"),
  
  // Report content (JSON)
  summary: text("summary").notNull(), // JSON: { totalImages, fixedImages, complianceScore, etc. }
  violations: text("violations").notNull(), // JSON array of violations
  recommendations: text("recommendations").notNull(), // JSON array of recommendations
  
  // ROI calculation
  estimatedLawsuitRisk: decimal("estimated_lawsuit_risk", { precision: 10, scale: 2 }), // USD
  estimatedCostSavings: decimal("estimated_cost_savings", { precision: 10, scale: 2 }), // USD
  roiPercentage: decimal("roi_percentage", { precision: 10, scale: 2 }), // ROI %
  
  // File storage
  fileUrl: varchar("file_url", { length: 500 }), // S3 URL for PDF/HTML
  fileSize: int("file_size"), // bytes
  
  // Status
  status: mysqlEnum("status", ["generating", "completed", "failed"]).notNull().default("generating"),
  generatedAt: timestamp("generated_at"),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * API Keys - Customer API keys for programmatic access
 */
export const altTextApiKeys = mysqlTable("alttext_api_keys", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  
  // API key details
  keyName: varchar("key_name", { length: 255 }).notNull(),
  keyHash: varchar("key_hash", { length: 255 }).notNull().unique(), // Hashed API key
  keyPrefix: varchar("key_prefix", { length: 20 }).notNull(), // First 8 chars for display
  
  // Permissions
  permissions: text("permissions").notNull(), // JSON array: ["scan", "fix", "report"]
  
  // Rate limiting
  rateLimit: int("rate_limit").notNull().default(100), // Requests per hour
  requestsThisHour: int("requests_this_hour").notNull().default(0),
  lastRequestAt: timestamp("last_request_at"),
  
  // Status
  status: mysqlEnum("status", ["active", "revoked", "expired"]).notNull().default("active"),
  expiresAt: timestamp("expires_at"),
  revokedAt: timestamp("revoked_at"),
  revokedReason: text("revoked_reason"),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUsedAt: timestamp("last_used_at"),
});

/**
 * API Usage Logs - Track API usage for billing and analytics
 */
export const altTextApiLogs = mysqlTable("alttext_api_logs", {
  id: int("id").autoincrement().primaryKey(),
  apiKeyId: int("api_key_id").notNull(),
  userId: int("user_id").notNull(),
  
  // Request details
  endpoint: varchar("endpoint", { length: 255 }).notNull(),
  method: varchar("method", { length: 10 }).notNull(), // GET, POST, etc.
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  
  // Response details
  statusCode: int("status_code").notNull(),
  responseTime: int("response_time").notNull(), // milliseconds
  errorMessage: text("error_message"),
  
  // Resource usage
  imagesProcessed: int("images_processed").notNull().default(0),
  pagesScanned: int("pages_scanned").notNull().default(0),
  
  // Metadata
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
});

/**
 * Webhooks - Customer webhook endpoints for notifications
 */
export const altTextWebhooks = mysqlTable("alttext_webhooks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  
  // Webhook details
  url: varchar("url", { length: 500 }).notNull(),
  secret: varchar("secret", { length: 255 }).notNull(), // For HMAC signature
  
  // Events to trigger
  events: text("events").notNull(), // JSON array: ["scan.completed", "fix.applied", "report.generated"]
  
  // Status
  status: mysqlEnum("status", ["active", "disabled", "failed"]).notNull().default("active"),
  failureCount: int("failure_count").notNull().default(0),
  lastFailureAt: timestamp("last_failure_at"),
  lastSuccessAt: timestamp("last_success_at"),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
