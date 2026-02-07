import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";

/**
 * Universal Affiliate Relationship API - Database Schema
 * 
 * Supports multi-entity affiliate relationships with automatic link generation:
 * - Entity Types: Person, Business, Agency, Non-Profit, Service Provider
 * - Relationship Types: One-to-one, one-to-many, many-to-many
 * - Embedded affiliate linking with unique tracking codes
 * - Commission tracking and payout management
 */

// ============================================================================
// AFFILIATE ENTITIES (Multi-Entity Support)
// ============================================================================

export const affiliateEntities = sqliteTable("affiliate_entities", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  
  // Entity Type
  entityType: text("entity_type").notNull(), // person, business, agency, non_profit, service_provider
  
  // Basic Information
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  website: text("website"),
  
  // Business/Organization Details (optional for individuals)
  businessName: text("business_name"),
  businessType: text("business_type"), // llc, corporation, sole_proprietor, partnership, non_profit
  taxId: text("tax_id"), // EIN or SSN (encrypted)
  
  // Address
  address: text("address"), // JSON: {street, city, state, zip, country}
  
  // Affiliate Program Details
  affiliateCode: text("affiliate_code").notNull().unique(), // Unique tracking code
  affiliateStatus: text("affiliate_status").notNull().default("pending"), // pending, active, suspended, terminated
  
  // Commission Settings
  defaultCommissionRate: real("default_commission_rate").notNull().default(10), // Percentage
  commissionType: text("commission_type").notNull().default("percentage"), // percentage, flat, tiered
  
  // Payment Information
  paymentMethod: text("payment_method"), // stripe, paypal, ach, check
  paymentDetails: text("payment_details"), // JSON: encrypted payment info
  minimumPayout: real("minimum_payout").notNull().default(50), // Minimum before payout
  
  // Performance Metrics
  totalClicks: integer("total_clicks").notNull().default(0),
  totalConversions: integer("total_conversions").notNull().default(0),
  totalEarnings: real("total_earnings").notNull().default(0),
  totalPaidOut: real("total_paid_out").notNull().default(0),
  pendingEarnings: real("pending_earnings").notNull().default(0),
  
  // Metadata
  metadata: text("metadata"), // JSON: custom fields
  notes: text("notes"),
  
  // Timestamps
  appliedAt: integer("applied_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  approvedAt: integer("approved_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => ({
  entityTypeIdx: index("affiliate_entities_entity_type_idx").on(table.entityType),
  statusIdx: index("affiliate_entities_status_idx").on(table.affiliateStatus),
  emailIdx: index("affiliate_entities_email_idx").on(table.email),
}));

// ============================================================================
// AFFILIATE RELATIONSHIPS (Many-to-Many Support)
// ============================================================================

export const affiliateRelationships = sqliteTable("affiliate_relationships", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  
  // Relationship Participants
  sourceEntityId: text("source_entity_id").notNull(), // The affiliate/referrer
  targetEntityId: text("target_entity_id"), // The referred entity (optional for product/service affiliates)
  
  // Relationship Type
  relationshipType: text("relationship_type").notNull(), // one_to_one, one_to_many, many_to_many, embedded
  
  // Relationship Context
  contextType: text("context_type").notNull(), // product, service, referral, partnership, embedded_link
  contextId: text("context_id"), // ID of product/service/partnership
  
  // Commission Override (optional, overrides entity default)
  customCommissionRate: real("custom_commission_rate"),
  customCommissionType: text("custom_commission_type"), // percentage, flat, tiered
  
  // Relationship Status
  status: text("status").notNull().default("active"), // active, paused, terminated
  
  // Performance Tracking
  clicks: integer("clicks").notNull().default(0),
  conversions: integer("conversions").notNull().default(0),
  revenue: real("revenue").notNull().default(0),
  commission: real("commission").notNull().default(0),
  
  // Timestamps
  startedAt: integer("started_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  endedAt: integer("ended_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => ({
  sourceIdx: index("affiliate_relationships_source_idx").on(table.sourceEntityId),
  targetIdx: index("affiliate_relationships_target_idx").on(table.targetEntityId),
  typeIdx: index("affiliate_relationships_type_idx").on(table.relationshipType),
  statusIdx: index("affiliate_relationships_status_idx").on(table.status),
}));

// ============================================================================
// AFFILIATE LINKS (Unique Tracking Links)
// ============================================================================

export const affiliateLinks = sqliteTable("affiliate_links", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  
  // Link Owner
  entityId: text("entity_id").notNull(),
  relationshipId: text("relationship_id"), // Optional: link to specific relationship
  
  // Link Details
  originalUrl: text("original_url").notNull(), // The destination URL
  affiliateUrl: text("affiliate_url").notNull().unique(), // The generated affiliate URL
  shortCode: text("short_code").notNull().unique(), // Short tracking code (e.g., "abc123")
  
  // Link Type
  linkType: text("link_type").notNull(), // embedded, standalone, qr_code, deep_link
  
  // Embedded Context (for embedded links)
  embeddedIn: text("embedded_in"), // website_url, app_name, email_campaign, social_post
  embeddedContext: text("embedded_context"), // JSON: additional context
  
  // Tracking Parameters
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  utmContent: text("utm_content"),
  utmTerm: text("utm_term"),
  
  // Performance Metrics
  clicks: integer("clicks").notNull().default(0),
  uniqueClicks: integer("unique_clicks").notNull().default(0),
  conversions: integer("conversions").notNull().default(0),
  revenue: real("revenue").notNull().default(0),
  
  // Link Status
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  expiresAt: integer("expires_at", { mode: "timestamp" }),
  
  // Timestamps
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  lastClickedAt: integer("last_clicked_at", { mode: "timestamp" }),
}, (table) => ({
  entityIdx: index("affiliate_links_entity_idx").on(table.entityId),
  shortCodeIdx: index("affiliate_links_short_code_idx").on(table.shortCode),
  typeIdx: index("affiliate_links_type_idx").on(table.linkType),
}));

// ============================================================================
// AFFILIATE CLICKS (Detailed Click Tracking)
// ============================================================================

export const affiliateClicks = sqliteTable("affiliate_clicks", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  
  // Link & Entity
  linkId: text("link_id").notNull(),
  entityId: text("entity_id").notNull(),
  relationshipId: text("relationship_id"),
  
  // Click Details
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  country: text("country"),
  city: text("city"),
  device: text("device"), // mobile, desktop, tablet
  browser: text("browser"),
  os: text("os"),
  
  // Conversion Tracking
  converted: integer("converted", { mode: "boolean" }).notNull().default(false),
  conversionValue: real("conversion_value"),
  conversionType: text("conversion_type"), // sale, signup, lead, download
  orderId: text("order_id"),
  
  // Timestamps
  clickedAt: integer("clicked_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  convertedAt: integer("converted_at", { mode: "timestamp" }),
}, (table) => ({
  linkIdx: index("affiliate_clicks_link_idx").on(table.linkId),
  entityIdx: index("affiliate_clicks_entity_idx").on(table.entityId),
  convertedIdx: index("affiliate_clicks_converted_idx").on(table.converted),
}));

// ============================================================================
// AFFILIATE COMMISSIONS (Transaction-Level Tracking)
// ============================================================================

export const affiliateCommissions = sqliteTable("affiliate_commissions", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  
  // Commission Owner
  entityId: text("entity_id").notNull(),
  relationshipId: text("relationship_id"),
  clickId: text("click_id"),
  
  // Transaction Details
  orderId: text("order_id"),
  orderValue: real("order_value").notNull(),
  commissionRate: real("commission_rate").notNull(),
  commissionAmount: real("commission_amount").notNull(),
  
  // Commission Status
  status: text("status").notNull().default("pending"), // pending, approved, paid, reversed
  
  // Payment Details
  payoutId: text("payout_id"), // Link to payout batch
  paidAt: integer("paid_at", { mode: "timestamp" }),
  
  // Metadata
  notes: text("notes"),
  
  // Timestamps
  earnedAt: integer("earned_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  approvedAt: integer("approved_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => ({
  entityIdx: index("affiliate_commissions_entity_idx").on(table.entityId),
  statusIdx: index("affiliate_commissions_status_idx").on(table.status),
  payoutIdx: index("affiliate_commissions_payout_idx").on(table.payoutId),
}));

// ============================================================================
// AFFILIATE PAYOUTS (Batch Payment Processing)
// ============================================================================

export const affiliatePayouts = sqliteTable("affiliate_payouts", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  
  // Payout Details
  entityId: text("entity_id").notNull(),
  amount: real("amount").notNull(),
  currency: text("currency").notNull().default("USD"),
  
  // Payment Method
  paymentMethod: text("payment_method").notNull(), // stripe, paypal, ach, check
  paymentDetails: text("payment_details"), // JSON: transaction details
  
  // Status
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  
  // Transaction IDs
  transactionId: text("transaction_id"), // External payment processor ID
  referenceNumber: text("reference_number"),
  
  // Timestamps
  requestedAt: integer("requested_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  processedAt: integer("processed_at", { mode: "timestamp" }),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  
  // Metadata
  notes: text("notes"),
  failureReason: text("failure_reason"),
}, (table) => ({
  entityIdx: index("affiliate_payouts_entity_idx").on(table.entityId),
  statusIdx: index("affiliate_payouts_status_idx").on(table.status),
}));

// ============================================================================
// AFFILIATE PRODUCTS/SERVICES (What Can Be Promoted)
// ============================================================================

export const affiliateProducts = sqliteTable("affiliate_products", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  
  // Product Details
  name: text("name").notNull(),
  description: text("description"),
  productType: text("product_type").notNull(), // physical, digital, service, subscription
  
  // Pricing
  price: real("price").notNull(),
  currency: text("currency").notNull().default("USD"),
  
  // Commission Structure
  commissionRate: real("commission_rate").notNull(),
  commissionType: text("commission_type").notNull(), // percentage, flat, tiered
  recurringCommission: integer("recurring_commission", { mode: "boolean" }).notNull().default(false),
  
  // Product URLs
  productUrl: text("product_url").notNull(),
  imageUrl: text("image_url"),
  
  // Availability
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  
  // Performance
  totalSales: integer("total_sales").notNull().default(0),
  totalRevenue: real("total_revenue").notNull().default(0),
  
  // Timestamps
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ============================================================================
// AFFILIATE APPROVAL WORKFLOW
// ============================================================================

export const affiliateApprovals = sqliteTable("affiliate_approvals", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  
  // Approval Request
  entityId: text("entity_id").notNull(),
  requestType: text("request_type").notNull(), // new_affiliate, relationship_request, payout_request
  
  // Request Details
  requestData: text("request_data"), // JSON: details of the request
  
  // Approval Status
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  
  // Reviewer
  reviewedBy: text("reviewed_by"),
  reviewNotes: text("review_notes"),
  
  // Timestamps
  requestedAt: integer("requested_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  reviewedAt: integer("reviewed_at", { mode: "timestamp" }),
}, (table) => ({
  entityIdx: index("affiliate_approvals_entity_idx").on(table.entityId),
  statusIdx: index("affiliate_approvals_status_idx").on(table.status),
}));

// ============================================================================
// AFFILIATE ANALYTICS (Performance Insights)
// ============================================================================

export const affiliateAnalytics = sqliteTable("affiliate_analytics", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  
  // Analytics Period
  entityId: text("entity_id").notNull(),
  period: text("period").notNull(), // daily, weekly, monthly, yearly
  periodStart: integer("period_start", { mode: "timestamp" }).notNull(),
  periodEnd: integer("period_end", { mode: "timestamp" }).notNull(),
  
  // Metrics
  clicks: integer("clicks").notNull().default(0),
  uniqueClicks: integer("unique_clicks").notNull().default(0),
  conversions: integer("conversions").notNull().default(0),
  conversionRate: real("conversion_rate").notNull().default(0),
  revenue: real("revenue").notNull().default(0),
  commission: real("commission").notNull().default(0),
  averageOrderValue: real("average_order_value").notNull().default(0),
  
  // Top Performers
  topProducts: text("top_products"), // JSON array
  topLinks: text("top_links"), // JSON array
  topCountries: text("top_countries"), // JSON array
  
  // Timestamps
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
}, (table) => ({
  entityPeriodIdx: index("affiliate_analytics_entity_period_idx").on(table.entityId, table.period),
}));
