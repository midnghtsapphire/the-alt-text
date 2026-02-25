import { eq, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  subscriptions, InsertSubscription,
  imageAnalyses, InsertImageAnalysis,
  apiKeys, InsertApiKey,
  apiUsageLogs, InsertApiUsageLog,
  batchJobs, InsertBatchJob,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================================================
// USER HELPERS
// ============================================================================
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// SUBSCRIPTION HELPERS
// ============================================================================
export async function getOrCreateSubscription(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const [existing] = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
  if (existing) return existing;
  // Create free tier
  await db.insert(subscriptions).values({
    userId,
    plan: "free",
    status: "active",
    imagesPerMonth: 50,
    imagesUsedThisMonth: 0,
    bulkUploadsPerMonth: 0,
    apiCallsPerMonth: 0,
    apiCallsUsedThisMonth: 0,
  });
  const [created] = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
  return created || null;
}

export async function updateSubscription(userId: number, data: Partial<InsertSubscription>) {
  const db = await getDb();
  if (!db) return;
  await db.update(subscriptions).set(data).where(eq(subscriptions.userId, userId));
}

// ============================================================================
// IMAGE ANALYSIS HELPERS
// ============================================================================
export async function createImageAnalysis(data: InsertImageAnalysis) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(imageAnalyses).values(data).$returningId();
  return result;
}

export async function updateImageAnalysis(id: number, data: Partial<InsertImageAnalysis>) {
  const db = await getDb();
  if (!db) return;
  await db.update(imageAnalyses).set(data).where(eq(imageAnalyses.id, id));
}

export async function getUserImageAnalyses(userId: number, limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(imageAnalyses)
    .where(eq(imageAnalyses.userId, userId))
    .orderBy(desc(imageAnalyses.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getUserStats(userId: number) {
  const db = await getDb();
  if (!db) return { totalImages: 0, completedImages: 0, failedImages: 0, avgConfidence: 0 };

  const [stats] = await db.select({
    totalImages: sql<number>`COUNT(*)`,
    completedImages: sql<number>`SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)`,
    failedImages: sql<number>`SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END)`,
    avgConfidence: sql<number>`AVG(CASE WHEN confidence IS NOT NULL THEN confidence ELSE NULL END)`,
  }).from(imageAnalyses).where(eq(imageAnalyses.userId, userId));

  return {
    totalImages: Number(stats?.totalImages || 0),
    completedImages: Number(stats?.completedImages || 0),
    failedImages: Number(stats?.failedImages || 0),
    avgConfidence: Number(stats?.avgConfidence || 0),
  };
}

// ============================================================================
// API KEY HELPERS
// ============================================================================
export async function createApiKey(data: InsertApiKey) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(apiKeys).values(data).$returningId();
  return result;
}

export async function getUserApiKeys(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: apiKeys.id,
    name: apiKeys.name,
    keyPrefix: apiKeys.keyPrefix,
    rateLimit: apiKeys.rateLimit,
    monthlyLimit: apiKeys.monthlyLimit,
    monthlyUsed: apiKeys.monthlyUsed,
    isActive: apiKeys.isActive,
    lastUsedAt: apiKeys.lastUsedAt,
    createdAt: apiKeys.createdAt,
  }).from(apiKeys).where(eq(apiKeys.userId, userId)).orderBy(desc(apiKeys.createdAt));
}

export async function getApiKeyByHash(keyHash: string) {
  const db = await getDb();
  if (!db) return null;
  const [key] = await db.select().from(apiKeys).where(eq(apiKeys.keyHash, keyHash)).limit(1);
  return key || null;
}

export async function deactivateApiKey(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(apiKeys).set({ isActive: 0 }).where(and(eq(apiKeys.id, id), eq(apiKeys.userId, userId)));
}

// ============================================================================
// BATCH JOB HELPERS
// ============================================================================
export async function createBatchJob(data: InsertBatchJob) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(batchJobs).values(data).$returningId();
  return result;
}

export async function getUserBatchJobs(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(batchJobs).where(eq(batchJobs.userId, userId)).orderBy(desc(batchJobs.createdAt));
}

export async function updateBatchJob(id: number, data: Partial<InsertBatchJob>) {
  const db = await getDb();
  if (!db) return;
  await db.update(batchJobs).set(data).where(eq(batchJobs.id, id));
}

// ============================================================================
// API USAGE LOG HELPERS
// ============================================================================
export async function logApiUsage(data: InsertApiUsageLog) {
  const db = await getDb();
  if (!db) return;
  await db.insert(apiUsageLogs).values(data);
}

// ============================================================================
// ADMIN HELPERS
// ============================================================================
export async function getAdminStats() {
  const db = await getDb();
  if (!db) return null;

  const [userCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(users);
  const [subCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(subscriptions).where(eq(subscriptions.status, "active"));
  const [imgCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(imageAnalyses);
  const [apiKeyCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(apiKeys).where(eq(apiKeys.isActive, 1));

  return {
    totalUsers: Number(userCount?.count || 0),
    activeSubscriptions: Number(subCount?.count || 0),
    totalImagesProcessed: Number(imgCount?.count || 0),
    activeApiKeys: Number(apiKeyCount?.count || 0),
  };
}
