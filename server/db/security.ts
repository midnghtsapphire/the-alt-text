import { eq, and, desc, sql, like } from "drizzle-orm";
import { getDb } from "../db";
import {
  securityTools,
  securityAssessments,
  securityTrainingCourses,
  userTrainingProgress,
  affiliateClicks,
  affiliateConversions,
} from "../../drizzle/schema";

/**
 * Security Tools
 */

export async function getAllSecurityTools() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(securityTools).orderBy(desc(securityTools.isPopular), securityTools.sortOrder);
}

export async function getSecurityToolsByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(securityTools).where(eq(securityTools.category, category as any)).orderBy(securityTools.sortOrder);
}

export async function getSecurityToolsByType(type: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(securityTools).where(eq(securityTools.type, type as any)).orderBy(securityTools.sortOrder);
}

export async function getSecurityToolBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const results = await db.select().from(securityTools).where(eq(securityTools.slug, slug)).limit(1);
  return results[0] || null;
}

export async function searchSecurityTools(query: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(securityTools).where(
    sql`${securityTools.name} LIKE ${`%${query}%`} OR ${securityTools.description} LIKE ${`%${query}%`}`
  ).orderBy(desc(securityTools.isPopular), securityTools.sortOrder);
}

export async function getPopularSecurityTools(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(securityTools).where(eq(securityTools.isPopular, true)).orderBy(securityTools.sortOrder).limit(limit);
}

export async function getEmergingSecurityTools(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(securityTools).where(eq(securityTools.isEmerging, true)).orderBy(securityTools.sortOrder).limit(limit);
}

export async function getAffiliateSecurityTools() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(securityTools).where(eq(securityTools.hasAffiliate, true)).orderBy(desc(securityTools.isPopular), securityTools.sortOrder);
}

export async function createSecurityTool(data: typeof securityTools.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(securityTools).values(data);
  return { id: Number(result[0].insertId) };
}

export async function updateSecurityTool(id: number, data: Partial<typeof securityTools.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(securityTools).set(data).where(eq(securityTools.id, id));
}

/**
 * Security Assessments
 */

export async function getUserSecurityAssessments(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(securityAssessments).where(eq(securityAssessments.userId, userId)).orderBy(desc(securityAssessments.createdAt));
}

export async function getSecurityAssessmentById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const results = await db.select().from(securityAssessments).where(eq(securityAssessments.id, id)).limit(1);
  return results[0] || null;
}

export async function createSecurityAssessment(data: typeof securityAssessments.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(securityAssessments).values(data);
  return { id: Number(result[0].insertId) };
}

export async function updateSecurityAssessment(id: number, data: Partial<typeof securityAssessments.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(securityAssessments).set(data).where(eq(securityAssessments.id, id));
}

export async function getAssessmentStats(userId: number) {
  const db = await getDb();
  if (!db) return { totalAssessments: 0, completedAssessments: 0, avgScore: 0 };
  const results = await db.select({
    totalAssessments: sql<number>`COUNT(*)`,
    completedAssessments: sql<number>`SUM(CASE WHEN ${securityAssessments.status} = 'completed' THEN 1 ELSE 0 END)`,
    avgScore: sql<number>`AVG(CASE WHEN ${securityAssessments.score} IS NOT NULL THEN ${securityAssessments.score} ELSE 0 END)`,
  }).from(securityAssessments).where(eq(securityAssessments.userId, userId));
  return results[0];
}

/**
 * Security Training
 */

export async function getAllTrainingCourses() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(securityTrainingCourses).where(eq(securityTrainingCourses.isActive, true)).orderBy(securityTrainingCourses.sortOrder);
}

export async function getTrainingCoursesByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(securityTrainingCourses).where(
    and(
      eq(securityTrainingCourses.category, category as any),
      eq(securityTrainingCourses.isActive, true)
    )
  ).orderBy(securityTrainingCourses.sortOrder);
}

export async function getTrainingCourseBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const results = await db.select().from(securityTrainingCourses).where(eq(securityTrainingCourses.slug, slug)).limit(1);
  return results[0] || null;
}

export async function getUserTrainingProgress(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    progress: userTrainingProgress,
    course: securityTrainingCourses,
  }).from(userTrainingProgress)
    .leftJoin(securityTrainingCourses, eq(userTrainingProgress.courseId, securityTrainingCourses.id))
    .where(eq(userTrainingProgress.userId, userId))
    .orderBy(desc(userTrainingProgress.updatedAt));
}

export async function getUserCourseProgress(userId: number, courseId: number) {
  const db = await getDb();
  if (!db) return null;
  const results = await db.select().from(userTrainingProgress).where(
    and(
      eq(userTrainingProgress.userId, userId),
      eq(userTrainingProgress.courseId, courseId)
    )
  ).limit(1);
  return results[0] || null;
}

export async function createOrUpdateTrainingProgress(data: typeof userTrainingProgress.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getUserCourseProgress(data.userId, data.courseId);
  
  if (existing) {
    await db.update(userTrainingProgress).set(data).where(eq(userTrainingProgress.id, existing.id));
    return { id: existing.id };
  } else {
    const result = await db.insert(userTrainingProgress).values(data);
    return { id: Number(result[0].insertId) };
  }
}

export async function getTrainingStats(userId: number) {
  const db = await getDb();
  if (!db) return { totalCourses: 0, completedCourses: 0, inProgressCourses: 0, avgQuizScore: 0 };
  const results = await db.select({
    totalCourses: sql<number>`COUNT(*)`,
    completedCourses: sql<number>`SUM(CASE WHEN ${userTrainingProgress.status} = 'completed' THEN 1 ELSE 0 END)`,
    inProgressCourses: sql<number>`SUM(CASE WHEN ${userTrainingProgress.status} = 'in_progress' THEN 1 ELSE 0 END)`,
    avgQuizScore: sql<number>`AVG(CASE WHEN ${userTrainingProgress.quizScore} IS NOT NULL THEN ${userTrainingProgress.quizScore} ELSE 0 END)`,
  }).from(userTrainingProgress).where(eq(userTrainingProgress.userId, userId));
  return results[0];
}

/**
 * Affiliate Tracking
 */

export async function trackAffiliateClick(data: typeof affiliateClicks.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(affiliateClicks).values(data);
  return { id: Number(result[0].insertId) };
}

export async function getAffiliateClickStats(toolId?: number) {
  const db = await getDb();
  if (!db) return [];
  const query = db.select({
    toolId: affiliateClicks.toolId,
    totalClicks: sql<number>`COUNT(*)`,
    uniqueUsers: sql<number>`COUNT(DISTINCT ${affiliateClicks.userId})`,
  }).from(affiliateClicks).groupBy(affiliateClicks.toolId);
  
  if (toolId) {
    return query.where(eq(affiliateClicks.toolId, toolId));
  }
  
  return query;
}

export async function createAffiliateConversion(data: typeof affiliateConversions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(affiliateConversions).values(data);
  return { id: Number(result[0].insertId) };
}

export async function updateAffiliateConversion(id: number, data: Partial<typeof affiliateConversions.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(affiliateConversions).set(data).where(eq(affiliateConversions.id, id));
}

export async function getAffiliateConversionStats(toolId?: number) {
  const db = await getDb();
  if (!db) return [];
  const query = db.select({
    toolId: affiliateConversions.toolId,
    totalConversions: sql<number>`COUNT(*)`,
    totalAmount: sql<number>`SUM(${affiliateConversions.amount})`,
    totalCommission: sql<number>`SUM(${affiliateConversions.commission})`,
    pendingCommission: sql<number>`SUM(CASE WHEN ${affiliateConversions.status} = 'pending' THEN ${affiliateConversions.commission} ELSE 0 END)`,
    approvedCommission: sql<number>`SUM(CASE WHEN ${affiliateConversions.status} = 'approved' THEN ${affiliateConversions.commission} ELSE 0 END)`,
    paidCommission: sql<number>`SUM(CASE WHEN ${affiliateConversions.status} = 'paid' THEN ${affiliateConversions.commission} ELSE 0 END)`,
  }).from(affiliateConversions).groupBy(affiliateConversions.toolId);
  
  if (toolId) {
    return query.where(eq(affiliateConversions.toolId, toolId));
  }
  
  return query;
}

export async function getRecentConversions(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    conversion: affiliateConversions,
    tool: securityTools,
  }).from(affiliateConversions)
    .leftJoin(securityTools, eq(affiliateConversions.toolId, securityTools.id))
    .orderBy(desc(affiliateConversions.convertedAt))
    .limit(limit);
}
