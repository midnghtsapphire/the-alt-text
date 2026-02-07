import { int, mysqlTable, text, timestamp, varchar, decimal, mysqlEnum } from "drizzle-orm/mysql-core";

/**
 * Affiliates - Partners who promote The Alt Text
 */
export const affiliates = mysqlTable("affiliates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id"), // Link to user table if they're also a user
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  company: varchar("company", { length: 255 }),
  
  // Affiliate tracking
  affiliateCode: varchar("affiliate_code", { length: 50 }).notNull().unique(), // Unique code for tracking
  referralLink: text("referral_link").notNull(), // Full tracking URL
  
  // Commission settings
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).notNull().default("0.20"), // 20% default
  domainCommissionRate: decimal("domain_commission_rate", { precision: 5, scale: 2 }).notNull().default("0.15"), // 15% for domain sales
  
  // Status
  status: mysqlEnum("status", ["pending", "active", "suspended"]).notNull().default("pending"),
  approvedAt: timestamp("approved_at"),
  
  // Payout info
  paypalEmail: varchar("paypal_email", { length: 320 }),
  stripeAccountId: varchar("stripe_account_id", { length: 255 }),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

/**
 * Affiliate Clicks - Track every click on affiliate links
 */
export const affiliateClicks = mysqlTable("affiliate_clicks", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliate_id").notNull(),
  
  // Tracking data
  ipAddress: varchar("ip_address", { length: 45 }), // IPv6 max length
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  landingPage: text("landing_page"),
  
  // Conversion tracking
  converted: int("converted").notNull().default(0), // 0 = no, 1 = yes
  conversionId: varchar("conversion_id", { length: 255 }), // Links to subscription or domain sale
  
  // Metadata
  clickedAt: timestamp("clicked_at").defaultNow().notNull(),
});

/**
 * Affiliate Commissions - Track earnings
 */
export const affiliateCommissions = mysqlTable("affiliate_commissions", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliate_id").notNull(),
  
  // Commission details
  type: mysqlEnum("type", ["subscription", "domain_sale", "one_time"]).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(), // Commission amount in USD
  rate: decimal("rate", { precision: 5, scale: 2 }).notNull(), // Commission rate used (0.20 = 20%)
  
  // Source
  sourceId: varchar("source_id", { length: 255 }).notNull(), // ID of subscription or domain sale
  sourceType: mysqlEnum("source_type", ["subscription", "domain"]).notNull(),
  
  // Payout status
  status: mysqlEnum("status", ["pending", "paid", "cancelled"]).notNull().default("pending"),
  paidAt: timestamp("paid_at"),
  paymentMethod: mysqlEnum("payment_method", ["paypal", "stripe"]),
  transactionId: varchar("transaction_id", { length: 255 }),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Ad Campaigns - Marketing campaigns
 */
export const adCampaigns = mysqlTable("ad_campaigns", {
  id: int("id").autoincrement().primaryKey(),
  
  // Campaign details
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["draft", "active", "paused", "completed"]).notNull().default("draft"),
  
  // Budget & ROI
  budget: decimal("budget", { precision: 10, scale: 2 }).notNull(), // Total budget in USD
  spent: decimal("spent", { precision: 10, scale: 2 }).notNull().default("0.00"), // Amount spent so far
  revenue: decimal("revenue", { precision: 10, scale: 2 }).notNull().default("0.00"), // Revenue generated
  
  // Targeting
  platforms: text("platforms").notNull(), // JSON array: ["linkedin", "facebook", "tiktok"]
  targetAudience: text("target_audience"), // JSON object with targeting criteria
  
  // Schedule
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  
  // Metadata
  createdBy: int("created_by").notNull(), // User ID of creator
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

/**
 * Ads - Individual ads within campaigns
 */
export const ads = mysqlTable("ads", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaign_id").notNull(),
  
  // Ad content
  headline: varchar("headline", { length: 255 }).notNull(),
  body: text("body").notNull(),
  cta: varchar("cta", { length: 100 }).notNull(), // Call to action text
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  
  // Landing page
  landingPageUrl: text("landing_page_url").notNull(),
  
  // Platform-specific IDs
  linkedinAdId: varchar("linkedin_ad_id", { length: 255 }),
  facebookAdId: varchar("facebook_ad_id", { length: 255 }),
  tiktokAdId: varchar("tiktok_ad_id", { length: 255 }),
  
  // Performance metrics
  impressions: int("impressions").notNull().default(0),
  clicks: int("clicks").notNull().default(0),
  conversions: int("conversions").notNull().default(0),
  spent: decimal("spent", { precision: 10, scale: 2 }).notNull().default("0.00"),
  
  // A/B testing
  variant: varchar("variant", { length: 10 }), // A, B, C, etc.
  
  // Status
  status: mysqlEnum("status", ["draft", "active", "paused", "completed"]).notNull().default("draft"),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

/**
 * Landing Pages - Custom landing pages for campaigns
 */
export const landingPages = mysqlTable("landing_pages", {
  id: int("id").autoincrement().primaryKey(),
  
  // Page details
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(), // URL slug
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  // Content (JSON)
  content: text("content").notNull(), // JSON structure of page sections
  
  // OZ-generated assets
  logoUrl: text("logo_url"),
  heroImageUrl: text("hero_image_url"),
  videoUrl: text("video_url"),
  
  // Performance
  views: int("views").notNull().default(0),
  conversions: int("conversions").notNull().default(0),
  
  // A/B testing
  variant: varchar("variant", { length: 10 }), // A, B, C, etc.
  parentPageId: int("parent_page_id"), // For A/B test variants
  
  // Status
  status: mysqlEnum("status", ["draft", "published", "archived"]).notNull().default("draft"),
  publishedAt: timestamp("published_at"),
  
  // Metadata
  createdBy: int("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

/**
 * Email Campaigns - Automated email marketing
 */
export const emailCampaigns = mysqlTable("email_campaigns", {
  id: int("id").autoincrement().primaryKey(),
  
  // Campaign details
  name: varchar("name", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  previewText: text("preview_text"),
  
  // Content
  htmlContent: text("html_content").notNull(),
  textContent: text("text_content"),
  
  // Targeting
  recipientList: text("recipient_list").notNull(), // JSON array of email addresses or segment ID
  
  // Schedule
  scheduledAt: timestamp("scheduled_at"),
  sentAt: timestamp("sent_at"),
  
  // Performance
  sent: int("sent").notNull().default(0),
  opened: int("opened").notNull().default(0),
  clicked: int("clicked").notNull().default(0),
  converted: int("converted").notNull().default(0),
  
  // Status
  status: mysqlEnum("status", ["draft", "scheduled", "sending", "sent"]).notNull().default("draft"),
  
  // Metadata
  createdBy: int("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

/**
 * Domain Sales - Track Manus domain sales for commission
 */
export const domainSales = mysqlTable("domain_sales", {
  id: int("id").autoincrement().primaryKey(),
  
  // Domain details
  domainName: varchar("domain_name", { length: 255 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(), // Sale price in USD
  
  // Buyer info
  buyerEmail: varchar("buyer_email", { length: 320 }).notNull(),
  buyerName: varchar("buyer_name", { length: 255 }),
  
  // Affiliate tracking
  affiliateId: int("affiliate_id"),
  affiliateCommission: decimal("affiliate_commission", { precision: 10, scale: 2 }), // Commission amount
  
  // Manus integration
  manusOrderId: varchar("manus_order_id", { length: 255 }),
  
  // Status
  status: mysqlEnum("status", ["pending", "completed", "refunded"]).notNull().default("pending"),
  completedAt: timestamp("completed_at"),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
