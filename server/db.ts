import { eq, like, or, sql, and, inArray, desc, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, topics, qaItems, resources, statistics, sources, bookmarks, relatedQuestions, locations, relocationSteps, trainingPrograms, jobProbabilityFactors, relocationPlans, stepProgress, stepDocuments, employers, jobOpenings, contentVersions, factVerifications, linkHealthChecks, featureSuggestions, InsertFeatureSuggestion, candidates, partners, placements, retentionMilestones, commissions, candidateStipends, partnerCommunications, placementInterviews, InsertCandidate, InsertPartner, InsertPlacement, InsertRetentionMilestone, InsertCommission, InsertCandidateStipend, InsertPartnerCommunication, InsertPlacementInterview, aiCareerAssessments } from "../drizzle/schema";
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

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
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

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Topics
export async function getAllTopics() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(topics).orderBy(topics.sortOrder);
}

export async function getTopicBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(topics).where(eq(topics.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Q&A Items
export async function getAllQAItems() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(qaItems).orderBy(qaItems.sortOrder);
}

export async function getQAItemsByTopic(topicId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(qaItems).where(eq(qaItems.topicId, topicId)).orderBy(qaItems.sortOrder);
}

export async function getQAItemBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(qaItems).where(eq(qaItems.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function searchQAItems(query: string, topicId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [
    or(
      like(qaItems.question, `%${query}%`),
      like(qaItems.answer, `%${query}%`)
    )
  ];
  
  if (topicId) {
    conditions.push(eq(qaItems.topicId, topicId));
  }
  
  return db.select().from(qaItems).where(and(...conditions)).orderBy(qaItems.sortOrder);
}

export async function incrementQAViewCount(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(qaItems).set({ viewCount: sql`${qaItems.viewCount} + 1` }).where(eq(qaItems.id, id));
}

// Related Questions
export async function getRelatedQuestions(qaItemId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const related = await db
    .select()
    .from(relatedQuestions)
    .where(eq(relatedQuestions.qaItemId, qaItemId));
  
  if (related.length === 0) return [];
  
  const relatedIds = related.map(r => r.relatedQaItemId);
  return db.select().from(qaItems).where(inArray(qaItems.id, relatedIds));
}

// Resources
export async function getAllResources() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(resources).orderBy(resources.sortOrder);
}

export async function getResourcesByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(resources).where(eq(resources.category, category as any)).orderBy(resources.sortOrder);
}

// Statistics
export async function getStatisticsByType(type: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(statistics).where(eq(statistics.type, type as any)).orderBy(statistics.sortOrder);
}

export async function getAllStatistics() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(statistics).orderBy(statistics.sortOrder);
}

// Sources
export async function getAllSources() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sources).orderBy(sources.sortOrder);
}

// Bookmarks
export async function getUserBookmarks(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const userBookmarks = await db
    .select()
    .from(bookmarks)
    .where(eq(bookmarks.userId, userId));
  
  if (userBookmarks.length === 0) return [];
  
  const qaItemIds = userBookmarks.map(b => b.qaItemId);
  return db.select().from(qaItems).where(inArray(qaItems.id, qaItemIds));
}

export async function addBookmark(userId: number, qaItemId: number) {
  const db = await getDb();
  if (!db) return;
  
  try {
    await db.insert(bookmarks).values({ userId, qaItemId });
  } catch (error) {
    // Ignore duplicate key errors
    console.warn("[Database] Bookmark already exists");
  }
}

export async function removeBookmark(userId: number, qaItemId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(bookmarks).where(
    and(
      eq(bookmarks.userId, userId),
      eq(bookmarks.qaItemId, qaItemId)
    )
  );
}

export async function isBookmarked(userId: number, qaItemId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db
    .select()
    .from(bookmarks)
    .where(
      and(
        eq(bookmarks.userId, userId),
        eq(bookmarks.qaItemId, qaItemId)
      )
    )
    .limit(1);
  
  return result.length > 0;
}

// Nomad Opportunity Map queries
export async function getAllLocations() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(locations).orderBy(desc(locations.opportunityScore));
}

export async function getLocationBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(locations).where(eq(locations.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getRelocationStepsByLocation(locationId: number, phase?: "pre_departure" | "post_arrival") {
  const db = await getDb();
  if (!db) return [];
  
  if (phase) {
    return await db.select().from(relocationSteps)
      .where(and(eq(relocationSteps.locationId, locationId), eq(relocationSteps.phase, phase)))
      .orderBy(asc(relocationSteps.sortOrder));
  }
  
  return await db.select().from(relocationSteps)
    .where(eq(relocationSteps.locationId, locationId))
    .orderBy(asc(relocationSteps.sortOrder));
}

export async function getAllTrainingPrograms() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(trainingPrograms).orderBy(desc(trainingPrograms.jobProbabilityBoost));
}

export async function getJobProbability(params: {
  locationId: number;
  experienceLevel: "entry" | "mid" | "senior" | "expert";
  hasApprenticeship: boolean;
  hasCertification: boolean;
  hasDegree: boolean;
}) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(jobProbabilityFactors)
    .where(
      and(
        eq(jobProbabilityFactors.locationId, params.locationId),
        eq(jobProbabilityFactors.experienceLevel, params.experienceLevel),
        eq(jobProbabilityFactors.hasApprenticeship, params.hasApprenticeship ? 1 : 0),
        eq(jobProbabilityFactors.hasCertification, params.hasCertification ? 1 : 0),
        eq(jobProbabilityFactors.hasDegree, params.hasDegree ? 1 : 0)
      )
    )
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

// ========== Relocation Progress Tracker ==========

export async function createRelocationPlan(userId: number, locationId: number, targetMoveDate?: Date) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.insert(relocationPlans).values({
    userId,
    locationId,
    targetMoveDate,
    currentStatus: "planning",
  });
  
  return result[0]?.insertId;
}

export async function getUserRelocationPlans(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(relocationPlans)
    .where(eq(relocationPlans.userId, userId))
    .orderBy(desc(relocationPlans.createdAt));
}

export async function getRelocationPlanById(planId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(relocationPlans)
    .where(eq(relocationPlans.id, planId))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function updateRelocationPlanStatus(planId: number, status: "planning" | "preparing" | "relocating" | "settled" | "cancelled") {
  const db = await getDb();
  if (!db) return;
  
  await db.update(relocationPlans)
    .set({ currentStatus: status, updatedAt: new Date() })
    .where(eq(relocationPlans.id, planId));
}

export async function getStepProgressForPlan(planId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(stepProgress)
    .where(eq(stepProgress.relocationPlanId, planId))
    .orderBy(asc(stepProgress.stepId));
}

export async function upsertStepProgress(data: {
  relocationPlanId: number;
  stepId: number;
  isCompleted?: boolean;
  completedAt?: Date | null;
  dueDate?: Date | null;
  notes?: string | null;
}) {
  const db = await getDb();
  if (!db) return;
  
  const existing = await db.select().from(stepProgress)
    .where(
      and(
        eq(stepProgress.relocationPlanId, data.relocationPlanId),
        eq(stepProgress.stepId, data.stepId)
      )
    )
    .limit(1);
  
  if (existing.length > 0) {
    const updateData: any = { updatedAt: new Date() };
    if (data.isCompleted !== undefined) updateData.isCompleted = data.isCompleted ? 1 : 0;
    if (data.completedAt !== undefined) updateData.completedAt = data.completedAt;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;
    if (data.notes !== undefined) updateData.notes = data.notes;
    
    await db.update(stepProgress)
      .set(updateData)
      .where(eq(stepProgress.id, existing[0]!.id));
    
    return existing[0]!.id;
  } else {
    const result = await db.insert(stepProgress).values({
      relocationPlanId: data.relocationPlanId,
      stepId: data.stepId,
      isCompleted: data.isCompleted ? 1 : 0,
      completedAt: data.completedAt,
      dueDate: data.dueDate,
      notes: data.notes,
    });
    
    return result[0]?.insertId;
  }
}

export async function addStepDocument(data: {
  stepProgressId: number;
  fileName: string;
  fileUrl: string;
  fileKey: string;
  fileSize?: number;
  mimeType?: string;
}) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.insert(stepDocuments).values(data);
  return result[0]?.insertId;
}

export async function getDocumentsForStepProgress(stepProgressId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(stepDocuments)
    .where(eq(stepDocuments.stepProgressId, stepProgressId))
    .orderBy(desc(stepDocuments.uploadedAt));
}

export async function deleteStepDocument(documentId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(stepDocuments)
    .where(eq(stepDocuments.id, documentId));
}

// Employer and job opening queries
export async function getAllEmployers() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(employers)
    .orderBy(employers.companyName);
}

export async function getEmployersByLocation(locationId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(employers)
    .where(eq(employers.locationId, locationId))
    .orderBy(employers.companyName);
}

export async function getEmployerById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(employers)
    .where(eq(employers.id, id))
    .limit(1);
  
  return result[0];
}

export async function getAllJobOpenings() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(jobOpenings)
    .where(eq(jobOpenings.isActive, 1))
    .orderBy(desc(jobOpenings.postedDate));
}

export async function getJobOpeningsByLocation(locationId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(jobOpenings)
    .where(and(
      eq(jobOpenings.locationId, locationId),
      eq(jobOpenings.isActive, 1)
    ))
    .orderBy(desc(jobOpenings.postedDate));
}

export async function getJobOpeningsByEmployer(employerId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(jobOpenings)
    .where(and(
      eq(jobOpenings.employerId, employerId),
      eq(jobOpenings.isActive, 1)
    ))
    .orderBy(desc(jobOpenings.postedDate));
}

export async function searchJobOpenings(params: {
  locationId?: number;
  experienceLevel?: string;
  jobType?: string;
  searchTerm?: string;
}) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(jobOpenings.isActive, 1)];
  
  if (params.locationId) {
    conditions.push(eq(jobOpenings.locationId, params.locationId));
  }
  
  if (params.experienceLevel) {
    conditions.push(eq(jobOpenings.experienceLevel, params.experienceLevel as any));
  }
  
  if (params.jobType) {
    conditions.push(eq(jobOpenings.jobType, params.jobType as any));
  }
  
  if (params.searchTerm) {
    conditions.push(
      or(
        like(jobOpenings.jobTitle, `%${params.searchTerm}%`),
        like(jobOpenings.description, `%${params.searchTerm}%`)
      )!
    );
  }
  
  return await db.select().from(jobOpenings)
    .where(and(...conditions))
    .orderBy(desc(jobOpenings.postedDate));
}

// ===== Changelog Functions =====

export async function getContentVersions(color?: "red" | "blue" | "yellow" | "green") {
  const db = await getDb();
  if (!db) return [];
  
  if (color) {
    return await db.select().from(contentVersions)
      .where(eq(contentVersions.iterationColor, color))
      .orderBy(desc(contentVersions.createdAt));
  }
  
  return await db.select().from(contentVersions)
    .orderBy(desc(contentVersions.createdAt));
}

export async function getContentVersionsByContent(
  contentType: "qa" | "statistic" | "resource" | "location",
  contentId: number
) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(contentVersions)
    .where(and(
      eq(contentVersions.contentType, contentType),
      eq(contentVersions.contentId, contentId)
    ))
    .orderBy(desc(contentVersions.versionNumber));
}

// ===== Admin Dashboard Functions =====

export async function getVerificationStatus() {
  const db = await getDb();
  if (!db) return {
    total: 0,
    pending: 0,
    verified: 0,
    needsReview: 0,
    failed: 0,
    byType: {}
  };
  
  const allVerifications = await db.select().from(factVerifications);
  
  const stats = {
    total: allVerifications.length,
    pending: allVerifications.filter(v => v.verificationStatus === "pending").length,
    verified: allVerifications.filter(v => v.verificationStatus === "verified").length,
    needsReview: allVerifications.filter(v => v.verificationStatus === "needs_review").length,
    failed: allVerifications.filter(v => v.verificationStatus === "failed").length,
    byType: {
      qa: allVerifications.filter(v => v.contentType === "qa").length,
      statistic: allVerifications.filter(v => v.contentType === "statistic").length,
      resource: allVerifications.filter(v => v.contentType === "resource").length,
      location: allVerifications.filter(v => v.contentType === "location").length,
    }
  };
  
  return stats;
}

export async function getLinkHealthStatus() {
  const db = await getDb();
  if (!db) return {
    total: 0,
    working: 0,
    broken: 0,
    recentChecks: []
  };
  
  const allLinks = await db.select().from(linkHealthChecks)
    .orderBy(desc(linkHealthChecks.lastCheckedAt))
    .limit(100);
  
  return {
    total: allLinks.length,
    working: allLinks.filter(l => l.isWorking === 1).length,
    broken: allLinks.filter(l => l.isWorking === 0).length,
    recentChecks: allLinks.slice(0, 20)
  };
}

export async function updateFactVerification(
  contentType: "qa" | "statistic" | "resource" | "location",
  contentId: number,
  status: "pending" | "verified" | "needs_review" | "failed",
  notes?: string
) {
  const db = await getDb();
  if (!db) return null;
  
  // Check if verification exists
  const existing = await db.select().from(factVerifications)
    .where(and(
      eq(factVerifications.contentType, contentType),
      eq(factVerifications.contentId, contentId)
    ))
    .limit(1);
  
  if (existing.length > 0) {
    // Update existing
    await db.update(factVerifications)
      .set({
        verificationStatus: status,
        verificationNotes: notes,
        lastCheckedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(factVerifications.id, existing[0]!.id));
    
    return existing[0];
  } else {
    // Insert new
    await db.insert(factVerifications).values({
      contentType,
      contentId,
      verificationStatus: status,
      verificationNotes: notes,
      lastCheckedAt: new Date(),
    });
    
    return { contentType, contentId, verificationStatus: status };
  }
}

// ===== Feature Suggestions Functions =====

export async function getFeatureSuggestions(status?: "new" | "reviewing" | "planned" | "in_progress" | "completed" | "declined") {
  const db = await getDb();
  if (!db) return [];
  
  if (status) {
    return await db.select().from(featureSuggestions)
      .where(eq(featureSuggestions.status, status))
      .orderBy(desc(featureSuggestions.upvotes), desc(featureSuggestions.createdAt));
  }
  
  return await db.select().from(featureSuggestions)
    .orderBy(desc(featureSuggestions.upvotes), desc(featureSuggestions.createdAt));
}

export async function createFeatureSuggestion(data: {
  userId?: number;
  name?: string;
  email?: string;
  suggestionType: "feature" | "bug" | "improvement" | "content";
  title: string;
  description: string;
}) {
  const db = await getDb();
  if (!db) return null;
  
  await db.insert(featureSuggestions).values({
    userId: data.userId,
    name: data.name,
    email: data.email,
    suggestionType: data.suggestionType,
    title: data.title,
    description: data.description,
    status: "new",
    priority: "medium",
    upvotes: 0,
  });
  
  // Return the created suggestion
  const created = await db.select().from(featureSuggestions)
    .where(and(
      eq(featureSuggestions.title, data.title),
      eq(featureSuggestions.suggestionType, data.suggestionType)
    ))
    .orderBy(desc(featureSuggestions.createdAt))
    .limit(1);
  
  return created[0] || null;
}

export async function upvoteFeatureSuggestion(suggestionId: number) {
  const db = await getDb();
  if (!db) return null;
  
  await db.update(featureSuggestions)
    .set({
      upvotes: sql`${featureSuggestions.upvotes} + 1`,
    })
    .where(eq(featureSuggestions.id, suggestionId));
  
  const updated = await db.select().from(featureSuggestions)
    .where(eq(featureSuggestions.id, suggestionId))
    .limit(1);
  
  return updated[0] || null;
}


/**
 * HEADHUNTER/RECRUITMENT MODULE DATABASE HELPERS
 */

// ============================================================================
// CANDIDATES
// ============================================================================

export async function createCandidate(candidate: InsertCandidate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(candidates).values(candidate);
  return { id: Number(result[0].insertId) };
}

export async function getCandidateById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(candidates).where(eq(candidates.id, id)).limit(1);
  return result[0] || null;
}

export async function getCandidateByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(candidates).where(eq(candidates.email, email)).limit(1);
  return result[0] || null;
}

export async function listCandidates(filters?: { status?: string; locationId?: number; experienceLevel?: string }) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(candidates);
  
  const conditions = [];
  if (filters?.status) conditions.push(eq(candidates.status, filters.status as any));
  if (filters?.locationId) conditions.push(eq(candidates.locationId, filters.locationId));
  if (filters?.experienceLevel) conditions.push(eq(candidates.experienceLevel, filters.experienceLevel as any));
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  return query.orderBy(desc(candidates.createdAt));
}

export async function updateCandidate(id: number, updates: Partial<InsertCandidate>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(candidates).set(updates).where(eq(candidates.id, id));
  return { success: true };
}

export async function deleteCandidate(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(candidates).where(eq(candidates.id, id));
  return { success: true };
}

// ============================================================================
// PARTNERS
// ============================================================================

export async function createPartner(partner: InsertPartner) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(partners).values(partner);
  return { id: Number(result[0].insertId) };
}

export async function getPartnerById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(partners).where(eq(partners.id, id)).limit(1);
  return result[0] || null;
}

export async function listPartners(filters?: { partnerType?: string; partnershipStatus?: string }) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(partners);
  
  const conditions = [];
  if (filters?.partnerType) conditions.push(eq(partners.partnerType, filters.partnerType as any));
  if (filters?.partnershipStatus) conditions.push(eq(partners.partnershipStatus, filters.partnershipStatus as any));
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  return query.orderBy(desc(partners.createdAt));
}

export async function updatePartner(id: number, updates: Partial<InsertPartner>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(partners).set(updates).where(eq(partners.id, id));
  return { success: true };
}

// ============================================================================
// PLACEMENTS
// ============================================================================

export async function createPlacement(placement: InsertPlacement) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(placements).values(placement);
  const placementId = Number(result[0].insertId);
  
  // Auto-create retention milestones based on retentionBonusStructure
  if (placement.retentionBonusStructure) {
    try {
      const bonusStructure = JSON.parse(placement.retentionBonusStructure);
      const startDate = new Date(placement.startDate);
      
      for (const [days, amount] of Object.entries(bonusStructure)) {
        const milestoneDate = new Date(startDate);
        milestoneDate.setDate(milestoneDate.getDate() + parseInt(days));
        
        await db.insert(retentionMilestones).values({
          placementId,
          milestoneDays: parseInt(days),
          milestoneDate,
          bonusAmount: Number(amount),
          milestoneStatus: "pending",
        });
      }
    } catch (error) {
      console.error("Failed to create retention milestones:", error);
    }
  }
  
  // Create base commission
  await db.insert(commissions).values({
    placementId,
    milestoneId: null,
    commissionType: "base_fee",
    amount: placement.baseFee,
    dueDate: new Date(placement.startDate), // Due on start date
    paymentStatus: "pending",
  });
  
  return { id: placementId };
}

export async function getPlacementById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(placements).where(eq(placements.id, id)).limit(1);
  return result[0] || null;
}

export async function listPlacements(filters?: { candidateId?: number; partnerId?: number; placementStatus?: string }) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(placements);
  
  const conditions = [];
  if (filters?.candidateId) conditions.push(eq(placements.candidateId, filters.candidateId));
  if (filters?.partnerId) conditions.push(eq(placements.partnerId, filters.partnerId));
  if (filters?.placementStatus) conditions.push(eq(placements.placementStatus, filters.placementStatus as any));
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  return query.orderBy(desc(placements.startDate));
}

export async function updatePlacement(id: number, updates: Partial<InsertPlacement>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(placements).set(updates).where(eq(placements.id, id));
  return { success: true };
}

// ============================================================================
// RETENTION MILESTONES
// ============================================================================

export async function getRetentionMilestones(placementId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(retentionMilestones)
    .where(eq(retentionMilestones.placementId, placementId))
    .orderBy(asc(retentionMilestones.milestoneDays));
}

export async function updateRetentionMilestone(id: number, updates: Partial<InsertRetentionMilestone>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(retentionMilestones).set(updates).where(eq(retentionMilestones.id, id));
  
  // If milestone achieved, create retention bonus commission and candidate stipend
  if (updates.milestoneStatus === "achieved" && updates.achievedDate) {
    const milestone = await db.select().from(retentionMilestones).where(eq(retentionMilestones.id, id)).limit(1);
    if (milestone[0]) {
      const placement = await getPlacementById(milestone[0].placementId);
      if (placement) {
        // Create commission for retention bonus
        await db.insert(commissions).values({
          placementId: milestone[0].placementId,
          milestoneId: id,
          commissionType: "retention_bonus",
          amount: milestone[0].bonusAmount,
          dueDate: updates.achievedDate,
          paymentStatus: "pending",
        });
        
        // Create stipend payment for candidate (assume 20% of bonus goes to candidate)
        const candidateStipendAmount = Math.floor(milestone[0].bonusAmount * 0.2);
        await db.insert(candidateStipends).values({
          candidateId: placement.candidateId,
          placementId: milestone[0].placementId,
          milestoneId: id,
          amount: candidateStipendAmount,
          stipendType: "retention",
          paymentStatus: "pending",
          scheduledDate: updates.achievedDate,
        });
      }
    }
  }
  
  return { success: true };
}

// ============================================================================
// COMMISSIONS
// ============================================================================

export async function listCommissions(filters?: { placementId?: number; paymentStatus?: string }) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(commissions);
  
  const conditions = [];
  if (filters?.placementId) conditions.push(eq(commissions.placementId, filters.placementId));
  if (filters?.paymentStatus) conditions.push(eq(commissions.paymentStatus, filters.paymentStatus as any));
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  return query.orderBy(desc(commissions.dueDate));
}

export async function updateCommission(id: number, updates: Partial<InsertCommission>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(commissions).set(updates).where(eq(commissions.id, id));
  return { success: true };
}

export async function getCommissionSummary() {
  const db = await getDb();
  if (!db) return { pending: 0, invoiced: 0, paid: 0, total: 0 };
  
  const result = await db.select({
    paymentStatus: commissions.paymentStatus,
    total: sql<number>`SUM(${commissions.amount})`,
  }).from(commissions).groupBy(commissions.paymentStatus);
  
  const summary = { pending: 0, invoiced: 0, paid: 0, overdue: 0, total: 0 };
  
  result.forEach((row) => {
    const amount = Number(row.total) || 0;
    summary[row.paymentStatus as keyof typeof summary] = amount;
    summary.total += amount;
  });
  
  return summary;
}

// ============================================================================
// CANDIDATE STIPENDS
// ============================================================================

export async function listCandidateStipends(filters?: { candidateId?: number; paymentStatus?: string }) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(candidateStipends);
  
  const conditions = [];
  if (filters?.candidateId) conditions.push(eq(candidateStipends.candidateId, filters.candidateId));
  if (filters?.paymentStatus) conditions.push(eq(candidateStipends.paymentStatus, filters.paymentStatus as any));
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  return query.orderBy(desc(candidateStipends.scheduledDate));
}

export async function updateCandidateStipend(id: number, updates: Partial<InsertCandidateStipend>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(candidateStipends).set(updates).where(eq(candidateStipends.id, id));
  return { success: true };
}

// ============================================================================
// PARTNER COMMUNICATIONS
// ============================================================================

export async function createPartnerCommunication(communication: InsertPartnerCommunication) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(partnerCommunications).values(communication);
  return { id: Number(result[0].insertId) };
}

export async function listPartnerCommunications(partnerId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(partnerCommunications)
    .where(eq(partnerCommunications.partnerId, partnerId))
    .orderBy(desc(partnerCommunications.createdAt));
}

// ============================================================================
// PLACEMENT INTERVIEWS
// ============================================================================

export async function createPlacementInterview(interview: InsertPlacementInterview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(placementInterviews).values(interview);
  return { id: Number(result[0].insertId) };
}

export async function listPlacementInterviews(filters?: { candidateId?: number; partnerId?: number; interviewStatus?: string }) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(placementInterviews);
  
  const conditions = [];
  if (filters?.candidateId) conditions.push(eq(placementInterviews.candidateId, filters.candidateId));
  if (filters?.partnerId) conditions.push(eq(placementInterviews.partnerId, filters.partnerId));
  if (filters?.interviewStatus) conditions.push(eq(placementInterviews.interviewStatus, filters.interviewStatus as any));
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  return query.orderBy(desc(placementInterviews.interviewDate));
}

export async function updatePlacementInterview(id: number, updates: Partial<InsertPlacementInterview>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(placementInterviews).set(updates).where(eq(placementInterviews.id, id));
  return { success: true };
}

// ============================================================================
// ANALYTICS & REPORTING
// ============================================================================

export async function getHeadhunterDashboardStats() {
  const db = await getDb();
  if (!db) return null;
  
  // Total candidates by status
  const candidateStats = await db.select({
    status: candidates.status,
    count: sql<number>`COUNT(*)`,
  }).from(candidates).groupBy(candidates.status);
  
  // Total placements by status
  const placementStats = await db.select({
    status: placements.placementStatus,
    count: sql<number>`COUNT(*)`,
  }).from(placements).groupBy(placements.placementStatus);
  
  // Commission summary
  const commissionSummary = await getCommissionSummary();
  
  // Active partners by type
  const partnerStats = await db.select({
    type: partners.partnerType,
    count: sql<number>`COUNT(*)`,
  }).from(partners)
    .where(eq(partners.partnershipStatus, "active"))
    .groupBy(partners.partnerType);
  
  // Upcoming milestones (next 30 days)
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);
  
  const upcomingMilestones = await db.select().from(retentionMilestones)
    .where(
      and(
        eq(retentionMilestones.milestoneStatus, "pending"),
        sql`${retentionMilestones.milestoneDate} BETWEEN ${today} AND ${thirtyDaysFromNow}`
      )
    )
    .orderBy(asc(retentionMilestones.milestoneDate))
    .limit(10);
  
  return {
    candidateStats,
    placementStats,
    commissionSummary,
    partnerStats,
    upcomingMilestones,
  };
}


// Career Assessment Functions
export async function createCareerAssessment(data: {
  userId?: number;
  currentRole: string;
  currentIndustry: string;
  yearsExperience: number;
  educationLevel: string;
  skills: string[];
  careerGoals: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(aiCareerAssessments).values({
    userId: data.userId ?? 0, // Use 0 for anonymous users
    currentRole: data.currentRole,
    currentIndustry: data.currentIndustry,
    yearsExperience: data.yearsExperience,
    educationLevel: data.educationLevel,
    skills: JSON.stringify(data.skills),
    interests: null,
    assessmentInput: data.careerGoals,
    aiResponse: null, // Will be populated by AI analysis
    recommendedPaths: null, // Will be populated by AI analysis
    topMatch: null,
    confidenceScore: null,
  });

  const rows = await db.select({ id: aiCareerAssessments.id })
    .from(aiCareerAssessments)
    .orderBy(desc(aiCareerAssessments.id))
    .limit(1);
  
  return rows[0]?.id ?? 0;
}

export async function getCareerAssessmentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(aiCareerAssessments).where(eq(aiCareerAssessments.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserCareerAssessments(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(aiCareerAssessments)
    .where(eq(aiCareerAssessments.userId, userId))
    .orderBy(desc(aiCareerAssessments.createdAt));
}

export async function updateCareerAssessmentAnalysis(
  id: number,
  analysis: {
    aiResponse: string;
    recommendedPaths: string;
    topMatch: string;
    confidenceScore: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(aiCareerAssessments)
    .set(analysis)
    .where(eq(aiCareerAssessments.id, id));
}
