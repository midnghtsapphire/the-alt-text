import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";

// ============================================================================
// CORE USER TABLE
// ============================================================================
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================================
// SUBSCRIPTIONS
// ============================================================================
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  plan: mysqlEnum("plan", ["free", "pro", "enterprise"]).notNull().default("free"),
  status: mysqlEnum("status", ["active", "cancelled", "past_due", "trialing"]).notNull().default("active"),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  stripePriceId: varchar("stripePriceId", { length: 255 }),
  // Usage limits
  imagesPerMonth: int("imagesPerMonth").notNull().default(50),
  imagesUsedThisMonth: int("imagesUsedThisMonth").notNull().default(0),
  bulkUploadsPerMonth: int("bulkUploadsPerMonth").notNull().default(0),
  apiCallsPerMonth: int("apiCallsPerMonth").notNull().default(0),
  apiCallsUsedThisMonth: int("apiCallsUsedThisMonth").notNull().default(0),
  // Billing
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  cancelledAt: timestamp("cancelledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

// ============================================================================
// IMAGE ANALYSES
// ============================================================================
export const imageAnalyses = mysqlTable("image_analyses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  imageUrl: text("imageUrl").notNull(),
  imageFileName: varchar("imageFileName", { length: 500 }),
  // Generated results
  generatedAltText: text("generatedAltText"),
  confidence: decimal("confidence", { precision: 5, scale: 2 }),
  imageType: mysqlEnum("imageType", ["photo", "illustration", "icon", "chart", "screenshot", "decorative", "unknown"]).default("unknown"),
  wcagCompliance: mysqlEnum("wcagCompliance", ["pass", "fail", "warning"]).default("warning"),
  // Context
  pageContext: text("pageContext"),
  surroundingText: text("surroundingText"),
  // Processing
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).notNull().default("pending"),
  processingTimeMs: int("processingTimeMs"),
  errorMessage: text("errorMessage"),
  // Metadata
  modelUsed: varchar("modelUsed", { length: 100 }),
  tokensUsed: int("tokensUsed"),
  batchId: varchar("batchId", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ImageAnalysis = typeof imageAnalyses.$inferSelect;
export type InsertImageAnalysis = typeof imageAnalyses.$inferInsert;

// ============================================================================
// API KEYS
// ============================================================================
export const apiKeys = mysqlTable("api_keys", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  keyHash: varchar("keyHash", { length: 255 }).notNull().unique(),
  keyPrefix: varchar("keyPrefix", { length: 12 }).notNull(), // e.g. "tat_live_abc"
  // Limits
  rateLimit: int("rateLimit").notNull().default(60), // per minute
  monthlyLimit: int("monthlyLimit").notNull().default(1000),
  monthlyUsed: int("monthlyUsed").notNull().default(0),
  // Status
  isActive: int("isActive").notNull().default(1),
  lastUsedAt: timestamp("lastUsedAt"),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;

// ============================================================================
// API USAGE LOGS
// ============================================================================
export const apiUsageLogs = mysqlTable("api_usage_logs", {
  id: int("id").autoincrement().primaryKey(),
  apiKeyId: int("apiKeyId").notNull(),
  userId: int("userId").notNull(),
  endpoint: varchar("endpoint", { length: 255 }).notNull(),
  method: varchar("method", { length: 10 }).notNull(),
  statusCode: int("statusCode").notNull(),
  responseTimeMs: int("responseTimeMs"),
  imageUrl: text("imageUrl"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ApiUsageLog = typeof apiUsageLogs.$inferSelect;
export type InsertApiUsageLog = typeof apiUsageLogs.$inferInsert;

// ============================================================================
// BATCH JOBS (bulk processing)
// ============================================================================
export const batchJobs = mysqlTable("batch_jobs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }),
  totalImages: int("totalImages").notNull().default(0),
  processedImages: int("processedImages").notNull().default(0),
  failedImages: int("failedImages").notNull().default(0),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed", "cancelled"]).notNull().default("pending"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BatchJob = typeof batchJobs.$inferSelect;
export type InsertBatchJob = typeof batchJobs.$inferInsert;
