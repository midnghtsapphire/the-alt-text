import { mysqlTable, int, varchar, text, decimal, timestamp, mysqlEnum, boolean } from "drizzle-orm/mysql-core";

/**
 * Rewards & Credits System Schema
 * 
 * Allows users to earn credits for testing, contributions, and referrals.
 * Credits can be used to offset API usage costs or cashed out.
 */

/**
 * User credits balance (extend users table)
 * This will be added to the main users table
 */
export const userCreditsExtension = {
  creditsBalance: decimal("creditsBalance", { precision: 10, scale: 2 }).default("0.00").notNull(),
  lifetimeCreditsEarned: decimal("lifetimeCreditsEarned", { precision: 10, scale: 2 }).default("0.00").notNull(),
  lifetimeCreditsSpent: decimal("lifetimeCreditsSpent", { precision: 10, scale: 2 }).default("0.00").notNull(),
};

/**
 * Rewards actions that earn credits
 */
export const rewards = mysqlTable("rewards", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  action: varchar("action", { length: 100 }).notNull(), // e.g., "test_new_feature", "bug_report", "referral"
  description: text("description"), // Details about what they did
  creditsEarned: decimal("creditsEarned", { precision: 10, scale: 2 }).notNull(),
  metadata: text("metadata"), // JSON data about the action
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Reward = typeof rewards.$inferSelect;
export type InsertReward = typeof rewards.$inferInsert;

/**
 * Credits transactions (all credits in/out)
 */
export const creditsTransactions = mysqlTable("creditsTransactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["earned", "spent", "refunded", "cashed_out", "promo_code"]).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(), // Positive for earned, negative for spent
  balanceAfter: decimal("balanceAfter", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  relatedId: int("relatedId"), // ID of related reward, API usage, or promo code
  relatedType: varchar("relatedType", { length: 50 }), // "reward", "api_usage", "promo_code", "cashout"
  metadata: text("metadata"), // JSON data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CreditsTransaction = typeof creditsTransactions.$inferSelect;
export type InsertCreditsTransaction = typeof creditsTransactions.$inferInsert;

/**
 * Promo codes for giving free credits
 */
export const promoCodes = mysqlTable("promoCodes", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  credits: decimal("credits", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  maxUses: int("maxUses"), // null = unlimited
  currentUses: int("currentUses").default(0).notNull(),
  expiresAt: timestamp("expiresAt"),
  isActive: boolean("isActive").default(true).notNull(),
  createdBy: int("createdBy"), // Admin user who created it
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PromoCode = typeof promoCodes.$inferSelect;
export type InsertPromoCode = typeof promoCodes.$inferInsert;

/**
 * Promo code redemptions (track who used which codes)
 */
export const promoCodeRedemptions = mysqlTable("promoCodeRedemptions", {
  id: int("id").autoincrement().primaryKey(),
  promoCodeId: int("promoCodeId").notNull(),
  userId: int("userId").notNull(),
  creditsAwarded: decimal("creditsAwarded", { precision: 10, scale: 2 }).notNull(),
  redeemedAt: timestamp("redeemedAt").defaultNow().notNull(),
});

export type PromoCodeRedemption = typeof promoCodeRedemptions.$inferSelect;
export type InsertPromoCodeRedemption = typeof promoCodeRedemptions.$inferInsert;

/**
 * Cash out requests (when users want to convert credits to money)
 */
export const cashoutRequests = mysqlTable("cashoutRequests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  creditsAmount: decimal("creditsAmount", { precision: 10, scale: 2 }).notNull(),
  cashAmount: decimal("cashAmount", { precision: 10, scale: 2 }).notNull(), // USD amount
  paymentMethod: varchar("paymentMethod", { length: 50 }).notNull(), // "paypal", "stripe", "bank_transfer"
  paymentDetails: text("paymentDetails"), // Email, account info (encrypted)
  status: mysqlEnum("status", ["pending", "processing", "completed", "rejected"]).default("pending").notNull(),
  processedBy: int("processedBy"), // Admin who processed it
  processedAt: timestamp("processedAt"),
  notes: text("notes"), // Admin notes
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CashoutRequest = typeof cashoutRequests.$inferSelect;
export type InsertCashoutRequest = typeof cashoutRequests.$inferInsert;

/**
 * Reward action types configuration
 */
export const rewardActions = mysqlTable("rewardActions", {
  id: int("id").autoincrement().primaryKey(),
  action: varchar("action", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  creditsAmount: decimal("creditsAmount", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  maxPerUser: int("maxPerUser"), // null = unlimited
  maxPerDay: int("maxPerDay"), // null = unlimited
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RewardAction = typeof rewardActions.$inferSelect;
export type InsertRewardAction = typeof rewardActions.$inferInsert;
