import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, index, decimal, tinyint } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // Trial System
  trialStatus: mysqlEnum("trialStatus", ["active", "expired", "converted", "none"]).default("none").notNull(),
  trialStartedAt: timestamp("trialStartedAt"),
  trialExpiresAt: timestamp("trialExpiresAt"),
  trialApiCallsUsed: int("trialApiCallsUsed").default(0).notNull(),
  trialScansUsed: int("trialScansUsed").default(0).notNull(),
  // Rewards & Credits System
  creditsBalance: decimal("creditsBalance", { precision: 10, scale: 2 }).default("0.00").notNull(),
  lifetimeCreditsEarned: decimal("lifetimeCreditsEarned", { precision: 10, scale: 2 }).default("0.00").notNull(),
  lifetimeCreditsSpent: decimal("lifetimeCreditsSpent", { precision: 10, scale: 2 }).default("0.00").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Topic categories for organizing research content
 */
export const topics = mysqlTable("topics", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Topic = typeof topics.$inferSelect;
export type InsertTopic = typeof topics.$inferInsert;

/**
 * Q&A pairs - the core research content
 */
export const qaItems = mysqlTable("qaItems", {
  id: int("id").autoincrement().primaryKey(),
  topicId: int("topicId").notNull(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  sortOrder: int("sortOrder").default(0).notNull(),
  viewCount: int("viewCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  topicIdx: index("topic_idx").on(table.topicId),
  slugIdx: index("slug_idx").on(table.slug),
}));

export type QAItem = typeof qaItems.$inferSelect;
export type InsertQAItem = typeof qaItems.$inferInsert;

/**
 * Related questions linking
 */
export const relatedQuestions = mysqlTable("relatedQuestions", {
  id: int("id").autoincrement().primaryKey(),
  qaItemId: int("qaItemId").notNull(),
  relatedQaItemId: int("relatedQaItemId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  qaItemIdx: index("qa_item_idx").on(table.qaItemId),
}));

export type RelatedQuestion = typeof relatedQuestions.$inferSelect;
export type InsertRelatedQuestion = typeof relatedQuestions.$inferInsert;

/**
 * Resources directory (training programs, certifications, etc.)
 */
export const resources = mysqlTable("resources", {
  id: int("id").autoincrement().primaryKey(),
  category: mysqlEnum("category", ["training", "certification", "government", "free_learning", "other"]).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  url: varchar("url", { length: 500 }),
  tags: text("tags"),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  categoryIdx: index("category_idx").on(table.category),
}));

export type Resource = typeof resources.$inferSelect;
export type InsertResource = typeof resources.$inferInsert;

/**
 * Statistics data for visualizations
 */
export const statistics = mysqlTable("statistics", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["salary", "growth", "shortage", "training"]).notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  value: varchar("value", { length: 100 }).notNull(),
  metadata: text("metadata"),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  typeIdx: index("type_idx").on(table.type),
}));

export type Statistic = typeof statistics.$inferSelect;
export type InsertStatistic = typeof statistics.$inferInsert;

/**
 * Sources for research attribution
 */
export const sources = mysqlTable("sources", {
  id: int("id").autoincrement().primaryKey(),
  citation: text("citation").notNull(),
  url: varchar("url", { length: 500 }),
  type: varchar("type", { length: 50 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Source = typeof sources.$inferSelect;
export type InsertSource = typeof sources.$inferInsert;

/**
 * Geographic locations with opportunity data
 */
export const locations = mysqlTable("locations", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 50 }).notNull(),
  region: varchar("region", { length: 50 }),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  population: int("population"),
  description: text("description"),
  opportunityScore: int("opportunityScore").default(0).notNull(), // 0-100
  demandLevel: mysqlEnum("demandLevel", ["low", "medium", "high", "very_high"]).default("medium").notNull(),
  averageSalary: int("averageSalary"),
  medianRent: int("medianRent"),
  costOfLivingIndex: int("costOfLivingIndex").default(100).notNull(), // 100 = national average
  jobOpenings: int("jobOpenings").default(0).notNull(),
  majorEmployers: text("majorEmployers"), // JSON array
  industries: text("industries"), // JSON array
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Location = typeof locations.$inferSelect;
export type InsertLocation = typeof locations.$inferInsert;

/**
 * Relocation checklist items (pre-departure and post-arrival)
 */
export const relocationSteps = mysqlTable("relocationSteps", {
  id: int("id").autoincrement().primaryKey(),
  locationId: int("locationId"),
  phase: mysqlEnum("phase", ["pre_departure", "post_arrival"]).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // e.g., "Training", "Housing", "Networking"
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  estimatedCost: int("estimatedCost"),
  estimatedTime: varchar("estimatedTime", { length: 100 }), // e.g., "2-4 weeks"
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  resources: text("resources"), // JSON array of links/contacts
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RelocationStep = typeof relocationSteps.$inferSelect;
export type InsertRelocationStep = typeof relocationSteps.$inferInsert;

/**
 * Training programs and certifications with job probability impact
 */
export const trainingPrograms = mysqlTable("trainingPrograms", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  provider: varchar("provider", { length: 255 }),
  type: mysqlEnum("type", ["certification", "apprenticeship", "degree", "bootcamp", "online_course"]).notNull(),
  duration: varchar("duration", { length: 100 }),
  cost: int("cost"),
  description: text("description"),
  skillsGained: text("skillsGained"), // JSON array
  jobProbabilityBoost: int("jobProbabilityBoost").default(0).notNull(), // Percentage increase
  salaryImpact: int("salaryImpact").default(0).notNull(), // Dollar amount increase
  url: varchar("url", { length: 500 }),
  availableOnline: tinyint("availableOnline").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TrainingProgram = typeof trainingPrograms.$inferSelect;
export type InsertTrainingProgram = typeof trainingPrograms.$inferInsert;

/**
 * Job probability factors and calculations
 */
export const jobProbabilityFactors = mysqlTable("jobProbabilityFactors", {
  id: int("id").autoincrement().primaryKey(),
  locationId: int("locationId").notNull(),
  experienceLevel: mysqlEnum("experienceLevel", ["entry", "mid", "senior", "expert"]).notNull(),
  hasApprenticeship: tinyint("hasApprenticeship").default(0).notNull(),
  hasCertification: tinyint("hasCertification").default(0).notNull(),
  hasDegree: tinyint("hasDegree").default(0).notNull(),
  baseProbability: int("baseProbability").notNull(), // Base percentage
  timeToHire: varchar("timeToHire", { length: 100 }), // e.g., "2-6 weeks"
  expectedSalaryRange: varchar("expectedSalaryRange", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type JobProbabilityFactor = typeof jobProbabilityFactors.$inferSelect;
export type InsertJobProbabilityFactor = typeof jobProbabilityFactors.$inferInsert;

/**
 * User bookmarks for saving favorite Q&A pairs
 */
export const bookmarks = mysqlTable("bookmarks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  qaItemId: int("qaItemId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  qaItemIdx: index("qa_item_bookmark_idx").on(table.qaItemId),
  uniqueBookmark: index("unique_bookmark").on(table.userId, table.qaItemId),
}));

export type Bookmark = typeof bookmarks.$inferSelect;
export type InsertBookmark = typeof bookmarks.$inferInsert;

/**
 * User relocation plans - tracks which city a user is planning to relocate to
 */
export const relocationPlans = mysqlTable("relocationPlans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  locationId: int("locationId").notNull(),
  targetMoveDate: timestamp("targetMoveDate"),
  currentStatus: mysqlEnum("currentStatus", ["planning", "preparing", "relocating", "settled", "cancelled"]).default("planning").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("relocation_user_idx").on(table.userId),
  locationIdx: index("relocation_location_idx").on(table.locationId),
}));

export type RelocationPlan = typeof relocationPlans.$inferSelect;
export type InsertRelocationPlan = typeof relocationPlans.$inferInsert;

/**
 * User progress on relocation steps
 */
export const stepProgress = mysqlTable("stepProgress", {
  id: int("id").autoincrement().primaryKey(),
  relocationPlanId: int("relocationPlanId").notNull(),
  stepId: int("stepId").notNull(), // References relocationSteps.id
  isCompleted: tinyint("isCompleted").default(0).notNull(),
  completedAt: timestamp("completedAt"),
  dueDate: timestamp("dueDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  planIdx: index("step_progress_plan_idx").on(table.relocationPlanId),
  stepIdx: index("step_progress_step_idx").on(table.stepId),
  uniqueProgress: index("unique_step_progress").on(table.relocationPlanId, table.stepId),
}));

export type StepProgress = typeof stepProgress.$inferSelect;
export type InsertStepProgress = typeof stepProgress.$inferInsert;

/**
 * Uploaded documents for relocation steps (certifications, housing docs, etc.)
 */
export const stepDocuments = mysqlTable("stepDocuments", {
  id: int("id").autoincrement().primaryKey(),
  stepProgressId: int("stepProgressId").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileUrl: varchar("fileUrl", { length: 500 }).notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(), // S3 key for deletion
  fileSize: int("fileSize"), // in bytes
  mimeType: varchar("mimeType", { length: 100 }),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
}, (table) => ({
  progressIdx: index("document_progress_idx").on(table.stepProgressId),
}));

export type StepDocument = typeof stepDocuments.$inferSelect;
export type InsertStepDocument = typeof stepDocuments.$inferInsert;

/**
 * Employers in each target city
 */
export const employers = mysqlTable("employers", {
  id: int("id").autoincrement().primaryKey(),
  locationId: int("locationId").notNull(),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  industry: varchar("industry", { length: 100 }),
  companySize: varchar("companySize", { length: 50 }), // e.g., "50-200 employees"
  website: varchar("website", { length: 500 }),
  description: text("description"),
  benefits: text("benefits"), // JSON or text list
  logoUrl: varchar("logoUrl", { length: 500 }),
  address: varchar("address", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  locationIdx: index("employer_location_idx").on(table.locationId),
}));

export type Employer = typeof employers.$inferSelect;
export type InsertEmployer = typeof employers.$inferInsert;

/**
 * Job openings at employers
 */
export const jobOpenings = mysqlTable("jobOpenings", {
  id: int("id").autoincrement().primaryKey(),
  employerId: int("employerId").notNull(),
  locationId: int("locationId").notNull(),
  jobTitle: varchar("jobTitle", { length: 255 }).notNull(),
  jobType: mysqlEnum("jobType", ["full-time", "part-time", "contract", "apprenticeship"]).default("full-time").notNull(),
  experienceLevel: mysqlEnum("experienceLevel", ["entry", "mid", "senior", "expert"]).notNull(),
  salaryMin: int("salaryMin"),
  salaryMax: int("salaryMax"),
  description: text("description"),
  requirements: text("requirements"),
  applyUrl: varchar("applyUrl", { length: 500 }),
  isActive: tinyint("isActive").default(1).notNull(),
  postedDate: timestamp("postedDate").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  employerIdx: index("job_employer_idx").on(table.employerId),
  locationIdx: index("job_location_idx").on(table.locationId),
  activeIdx: index("job_active_idx").on(table.isActive),
}));

export type JobOpening = typeof jobOpenings.$inferSelect;
export type InsertJobOpening = typeof jobOpenings.$inferInsert;

/**
 * Content versions - tracks iterations with color coding
 */
export const contentVersions = mysqlTable("contentVersions", {
  id: int("id").autoincrement().primaryKey(),
  contentType: mysqlEnum("contentType", ["qa", "statistic", "resource", "location"]).notNull(),
  contentId: int("contentId").notNull(), // ID of the related content
  iterationColor: mysqlEnum("iterationColor", ["red", "blue", "yellow", "green"]).notNull(),
  versionNumber: int("versionNumber").notNull(),
  changeDescription: text("changeDescription"),
  addedBy: int("addedBy"), // user ID
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  contentIdx: index("content_version_idx").on(table.contentType, table.contentId),
  colorIdx: index("iteration_color_idx").on(table.iterationColor),
}));

export type ContentVersion = typeof contentVersions.$inferSelect;
export type InsertContentVersion = typeof contentVersions.$inferInsert;

/**
 * Fact verification tracking
 */
export const factVerifications = mysqlTable("factVerifications", {
  id: int("id").autoincrement().primaryKey(),
  contentType: mysqlEnum("contentType", ["qa", "statistic", "resource", "location"]).notNull(),
  contentId: int("contentId").notNull(),
  verificationStatus: mysqlEnum("verificationStatus", ["pending", "verified", "needs_review", "failed"]).default("pending").notNull(),
  verifiedBy: int("verifiedBy"), // user ID
  verificationNotes: text("verificationNotes"),
  sourceUrls: text("sourceUrls"), // JSON array of source URLs
  lastCheckedAt: timestamp("lastCheckedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  contentIdx: index("fact_content_idx").on(table.contentType, table.contentId),
  statusIdx: index("fact_status_idx").on(table.verificationStatus),
}));

export type FactVerification = typeof factVerifications.$inferSelect;
export type InsertFactVerification = typeof factVerifications.$inferInsert;

/**
 * Link health tracking
 */
export const linkHealthChecks = mysqlTable("linkHealthChecks", {
  id: int("id").autoincrement().primaryKey(),
  url: varchar("url", { length: 1000 }).notNull(),
  contentType: mysqlEnum("contentType", ["qa", "statistic", "resource", "location"]).notNull(),
  contentId: int("contentId").notNull(),
  statusCode: int("statusCode"),
  isWorking: tinyint("isWorking").default(1).notNull(),
  errorMessage: text("errorMessage"),
  lastCheckedAt: timestamp("lastCheckedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  urlIdx: index("link_url_idx").on(table.url),
  contentIdx: index("link_content_idx").on(table.contentType, table.contentId),
  statusIdx: index("link_status_idx").on(table.isWorking),
}));

export type LinkHealthCheck = typeof linkHealthChecks.$inferSelect;
export type InsertLinkHealthCheck = typeof linkHealthChecks.$inferInsert;

/**
 * User feature suggestions and feedback
 */
export const featureSuggestions = mysqlTable("featureSuggestions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"), // Nullable - allow anonymous suggestions
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  suggestionType: mysqlEnum("suggestionType", ["feature", "bug", "improvement", "content"]).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description").notNull(),
  status: mysqlEnum("status", ["new", "reviewing", "planned", "in_progress", "completed", "declined"]).default("new").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  upvotes: int("upvotes").default(0).notNull(),
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("suggestion_user_idx").on(table.userId),
  statusIdx: index("suggestion_status_idx").on(table.status),
  typeIdx: index("suggestion_type_idx").on(table.suggestionType),
}));

export type FeatureSuggestion = typeof featureSuggestions.$inferSelect;
export type InsertFeatureSuggestion = typeof featureSuggestions.$inferInsert;

/**
 * HEADHUNTER/RECRUITMENT MODULE
 * Tracks candidate placements, commissions, retention milestones, and partner relationships
 */

/**
 * Candidates in the recruitment pipeline
 */
export const candidates = mysqlTable("candidates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"), // Links to users table if they have an account
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  locationId: int("locationId"), // Current or target location
  resumeUrl: varchar("resumeUrl", { length: 500 }),
  resumeKey: varchar("resumeKey", { length: 500 }), // S3 key for deletion
  linkedinUrl: varchar("linkedinUrl", { length: 500 }),
  currentRole: varchar("currentRole", { length: 255 }),
  experienceLevel: mysqlEnum("experienceLevel", ["entry", "mid", "senior", "expert"]).default("entry").notNull(),
  certifications: text("certifications"), // JSON array of certification names
  trainingCompleted: text("trainingCompleted"), // JSON array of training program IDs
  skills: text("skills"), // JSON array of skills
  salaryExpectation: int("salaryExpectation"),
  availableStartDate: timestamp("availableStartDate"),
  willingToRelocate: tinyint("willingToRelocate").default(0).notNull(),
  status: mysqlEnum("status", ["new", "screening", "training", "ready", "placed", "inactive"]).default("new").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  emailIdx: index("candidate_email_idx").on(table.email),
  statusIdx: index("candidate_status_idx").on(table.status),
  locationIdx: index("candidate_location_idx").on(table.locationId),
}));

export type Candidate = typeof candidates.$inferSelect;
export type InsertCandidate = typeof candidates.$inferInsert;

/**
 * Partner organizations (manufacturers, training providers, grant providers)
 */
export const partners = mysqlTable("partners", {
  id: int("id").autoincrement().primaryKey(),
  partnerType: mysqlEnum("partnerType", ["manufacturer", "training_provider", "grant_provider", "certification_body", "industry_org", "security_training", "phishing_simulation", "compliance_platform", "software_vendor", "apprenticeship_program"]).notNull(),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  contactName: varchar("contactName", { length: 255 }),
  contactEmail: varchar("contactEmail", { length: 320 }),
  contactPhone: varchar("contactPhone", { length: 50 }),
  website: varchar("website", { length: 500 }),
  address: varchar("address", { length: 500 }),
  locationId: int("locationId"), // Primary location
  description: text("description"),
  partnershipStatus: mysqlEnum("partnershipStatus", ["prospect", "contacted", "negotiating", "active", "paused", "inactive"]).default("prospect").notNull(),
  contractStartDate: timestamp("contractStartDate"),
  contractEndDate: timestamp("contractEndDate"),
  commissionRate: decimal("commissionRate", { precision: 5, scale: 2 }), // e.g., 25.00 for 25%
  retentionBonusStructure: text("retentionBonusStructure"), // JSON: {30: 5000, 90: 10000, 180: 15000}
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  typeIdx: index("partner_type_idx").on(table.partnerType),
  statusIdx: index("partner_status_idx").on(table.partnershipStatus),
  emailIdx: index("partner_email_idx").on(table.contactEmail),
}));

export type Partner = typeof partners.$inferSelect;
export type InsertPartner = typeof partners.$inferInsert;

/**
 * Placements - successful candidate hires
 */
export const placements = mysqlTable("placements", {
  id: int("id").autoincrement().primaryKey(),
  candidateId: int("candidateId").notNull(),
  partnerId: int("partnerId").notNull(), // The employer/manufacturer
  jobOpeningId: int("jobOpeningId"), // Links to jobOpenings table if applicable
  jobTitle: varchar("jobTitle", { length: 255 }).notNull(),
  jobType: mysqlEnum("jobType", ["full-time", "part-time", "contract", "apprenticeship"]).default("full-time").notNull(),
  locationId: int("locationId").notNull(),
  startDate: timestamp("startDate").notNull(),
  annualSalary: int("annualSalary").notNull(),
  commissionRate: decimal("commissionRate", { precision: 5, scale: 2 }).notNull(), // e.g., 25.00 for 25%
  baseFee: int("baseFee").notNull(), // Calculated: annualSalary * (commissionRate / 100)
  retentionBonusStructure: text("retentionBonusStructure"), // JSON: {30: 5000, 90: 10000, 180: 15000, 365: 20000}
  placementStatus: mysqlEnum("placementStatus", ["pending", "confirmed", "active", "terminated", "completed"]).default("pending").notNull(),
  terminationDate: timestamp("terminationDate"),
  terminationReason: text("terminationReason"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  candidateIdx: index("placement_candidate_idx").on(table.candidateId),
  partnerIdx: index("placement_partner_idx").on(table.partnerId),
  statusIdx: index("placement_status_idx").on(table.placementStatus),
  startDateIdx: index("placement_start_date_idx").on(table.startDate),
}));

export type Placement = typeof placements.$inferSelect;
export type InsertPlacement = typeof placements.$inferInsert;

/**
 * Retention milestones - tracks candidate retention and triggers bonuses
 */
export const retentionMilestones = mysqlTable("retentionMilestones", {
  id: int("id").autoincrement().primaryKey(),
  placementId: int("placementId").notNull(),
  milestoneDays: int("milestoneDays").notNull(), // 30, 90, 180, 365
  milestoneDate: timestamp("milestoneDate").notNull(), // Calculated: startDate + milestoneDays
  bonusAmount: int("bonusAmount").notNull(),
  milestoneStatus: mysqlEnum("milestoneStatus", ["pending", "achieved", "missed", "waived"]).default("pending").notNull(),
  achievedDate: timestamp("achievedDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  placementIdx: index("milestone_placement_idx").on(table.placementId),
  statusIdx: index("milestone_status_idx").on(table.milestoneStatus),
  dateIdx: index("milestone_date_idx").on(table.milestoneDate),
}));

export type RetentionMilestone = typeof retentionMilestones.$inferSelect;
export type InsertRetentionMilestone = typeof retentionMilestones.$inferInsert;

/**
 * Commissions - tracks all fees earned from placements
 */
export const commissions = mysqlTable("commissions", {
  id: int("id").autoincrement().primaryKey(),
  placementId: int("placementId").notNull(),
  milestoneId: int("milestoneId"), // Null for base fee, set for retention bonuses
  commissionType: mysqlEnum("commissionType", ["base_fee", "retention_bonus"]).notNull(),
  amount: int("amount").notNull(),
  dueDate: timestamp("dueDate").notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "invoiced", "paid", "overdue", "waived"]).default("pending").notNull(),
  invoiceNumber: varchar("invoiceNumber", { length: 100 }),
  invoiceDate: timestamp("invoiceDate"),
  paidDate: timestamp("paidDate"),
  paymentMethod: varchar("paymentMethod", { length: 100 }), // e.g., "ACH", "Wire", "Check"
  transactionId: varchar("transactionId", { length: 255 }), // Stripe/Plaid transaction ID
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  placementIdx: index("commission_placement_idx").on(table.placementId),
  statusIdx: index("commission_status_idx").on(table.paymentStatus),
  dueDateIdx: index("commission_due_date_idx").on(table.dueDate),
  invoiceIdx: index("commission_invoice_idx").on(table.invoiceNumber),
}));

export type Commission = typeof commissions.$inferSelect;
export type InsertCommission = typeof commissions.$inferInsert;

/**
 * Candidate stipends - payments to candidates for retention milestones
 */
export const candidateStipends = mysqlTable("candidateStipends", {
  id: int("id").autoincrement().primaryKey(),
  candidateId: int("candidateId").notNull(),
  placementId: int("placementId").notNull(),
  milestoneId: int("milestoneId").notNull(),
  amount: int("amount").notNull(),
  stipendType: mysqlEnum("stipendType", ["retention", "relocation", "training", "bonus"]).default("retention").notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "processing", "paid", "failed", "cancelled"]).default("pending").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 100 }).default("ACH").notNull(), // Plaid ACH
  bankAccountLast4: varchar("bankAccountLast4", { length: 4 }),
  transactionId: varchar("transactionId", { length: 255 }), // Plaid transaction ID
  scheduledDate: timestamp("scheduledDate").notNull(),
  paidDate: timestamp("paidDate"),
  failureReason: text("failureReason"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  candidateIdx: index("stipend_candidate_idx").on(table.candidateId),
  placementIdx: index("stipend_placement_idx").on(table.placementId),
  statusIdx: index("stipend_status_idx").on(table.paymentStatus),
  scheduledIdx: index("stipend_scheduled_idx").on(table.scheduledDate),
}));

export type CandidateStipend = typeof candidateStipends.$inferSelect;
export type InsertCandidateStipend = typeof candidateStipends.$inferInsert;

/**
 * Partner communications - tracks outreach and conversations
 */
export const partnerCommunications = mysqlTable("partnerCommunications", {
  id: int("id").autoincrement().primaryKey(),
  partnerId: int("partnerId").notNull(),
  communicationType: mysqlEnum("communicationType", ["email", "phone", "meeting", "contract", "other"]).notNull(),
  subject: varchar("subject", { length: 500 }),
  summary: text("summary"),
  outcome: varchar("outcome", { length: 255 }), // e.g., "Scheduled follow-up", "Contract signed"
  nextFollowUpDate: timestamp("nextFollowUpDate"),
  attachments: text("attachments"), // JSON array of file URLs
  createdBy: int("createdBy"), // user ID
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  partnerIdx: index("comm_partner_idx").on(table.partnerId),
  typeIdx: index("comm_type_idx").on(table.communicationType),
  followUpIdx: index("comm_follow_up_idx").on(table.nextFollowUpDate),
}));

export type PartnerCommunication = typeof partnerCommunications.$inferSelect;
export type InsertPartnerCommunication = typeof partnerCommunications.$inferInsert;

/**
 * Placement interviews - tracks interview process
 */
export const placementInterviews = mysqlTable("placementInterviews", {
  id: int("id").autoincrement().primaryKey(),
  candidateId: int("candidateId").notNull(),
  partnerId: int("partnerId").notNull(),
  jobOpeningId: int("jobOpeningId"),
  interviewDate: timestamp("interviewDate").notNull(),
  interviewType: mysqlEnum("interviewType", ["phone_screen", "technical", "behavioral", "panel", "final"]).notNull(),
  interviewerName: varchar("interviewerName", { length: 255 }),
  interviewStatus: mysqlEnum("interviewStatus", ["scheduled", "completed", "cancelled", "no_show"]).default("scheduled").notNull(),
  outcome: mysqlEnum("outcome", ["pending", "passed", "failed", "offer_extended", "offer_accepted", "offer_declined"]),
  feedback: text("feedback"),
  nextSteps: text("nextSteps"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  candidateIdx: index("interview_candidate_idx").on(table.candidateId),
  partnerIdx: index("interview_partner_idx").on(table.partnerId),
  dateIdx: index("interview_date_idx").on(table.interviewDate),
  statusIdx: index("interview_status_idx").on(table.interviewStatus),
}));

export type PlacementInterview = typeof placementInterviews.$inferSelect;
export type InsertPlacementInterview = typeof placementInterviews.$inferInsert;


// ============================================================================
// TAX MODULE SCHEMA (Multi-App Reusable)
// ============================================================================

/**
 * Tax entities - contractors, clients, businesses
 */
export const taxEntities = mysqlTable("taxEntities", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"), // Optional: link to user table if applicable
  entityType: mysqlEnum("entityType", ["contractor", "client", "business", "self"]).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  tin: varchar("tin", { length: 20 }), // SSN or EIN
  tinType: mysqlEnum("tinType", ["ssn", "ein"]),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  zipCode: varchar("zipCode", { length: 10 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("tax_entity_user_idx").on(table.userId),
  typeIdx: index("tax_entity_type_idx").on(table.entityType),
  tinIdx: index("tax_entity_tin_idx").on(table.tin),
}));

export type TaxEntity = typeof taxEntities.$inferSelect;
export type InsertTaxEntity = typeof taxEntities.$inferInsert;

/**
 * 1099 forms - tracks all 1099 filings
 */
export const form1099s = mysqlTable("form1099s", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"), // Payer
  recipientId: int("recipientId").notNull(), // Links to taxEntities
  taxYear: int("taxYear").notNull(),
  formType: mysqlEnum("formType", ["1099-NEC", "1099-MISC", "1099-K", "1099-INT", "1099-DIV"]).notNull(),
  box1Amount: decimal("box1Amount", { precision: 10, scale: 2 }), // Non-employee compensation (NEC) or Rents (MISC)
  box2Amount: decimal("box2Amount", { precision: 10, scale: 2 }), // Royalties (MISC)
  box3Amount: decimal("box3Amount", { precision: 10, scale: 2 }), // Other income (MISC)
  box4Amount: decimal("box4Amount", { precision: 10, scale: 2 }), // Federal income tax withheld
  box5Amount: decimal("box5Amount", { precision: 10, scale: 2 }), // Fishing boat proceeds (MISC)
  box6Amount: decimal("box6Amount", { precision: 10, scale: 2 }), // Medical/health care payments (MISC)
  box7Amount: decimal("box7Amount", { precision: 10, scale: 2 }), // Nonemployee compensation (MISC - pre-2020)
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  filingStatus: mysqlEnum("filingStatus", ["draft", "ready", "filed", "corrected"]).default("draft").notNull(),
  filedDate: timestamp("filedDate"),
  correctionOf: int("correctionOf"), // Links to another form1099s.id if this is a correction
  pdfUrl: text("pdfUrl"), // S3 URL for generated PDF
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("form1099_user_idx").on(table.userId),
  recipientIdx: index("form1099_recipient_idx").on(table.recipientId),
  yearIdx: index("form1099_year_idx").on(table.taxYear),
  statusIdx: index("form1099_status_idx").on(table.filingStatus),
}));

export type Form1099 = typeof form1099s.$inferSelect;
export type InsertForm1099 = typeof form1099s.$inferInsert;

/**
 * Expenses - all business expenses
 */
export const expenses = mysqlTable("expenses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  date: timestamp("date").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // e.g., "Software", "Travel", "Meals", "Office Supplies"
  subcategory: varchar("subcategory", { length: 100 }), // e.g., "SaaS", "Airfare", "Client Meals"
  vendor: varchar("vendor", { length: 255 }),
  description: text("description"),
  receiptId: int("receiptId"), // Links to receipts table
  paymentMethod: varchar("paymentMethod", { length: 50 }), // e.g., "Credit Card", "Cash", "Check"
  isRecurring: boolean("isRecurring").default(false).notNull(),
  recurringFrequency: mysqlEnum("recurringFrequency", ["monthly", "quarterly", "annually"]),
  taxDeductible: boolean("taxDeductible").default(true).notNull(),
  deductiblePercentage: int("deductiblePercentage").default(100).notNull(), // e.g., 50 for meals
  approvalStatus: mysqlEnum("approvalStatus", ["pending", "approved", "rejected"]).default("approved").notNull(),
  approvedBy: int("approvedBy"), // Links to users table
  approvedAt: timestamp("approvedAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("expense_user_idx").on(table.userId),
  dateIdx: index("expense_date_idx").on(table.date),
  categoryIdx: index("expense_category_idx").on(table.category),
  vendorIdx: index("expense_vendor_idx").on(table.vendor),
}));

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = typeof expenses.$inferInsert;

/**
 * Receipts - uploaded receipts with OCR data
 */
export const receipts = mysqlTable("receipts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  imageUrl: text("imageUrl").notNull(), // S3 URL
  ocrText: text("ocrText"), // Extracted text from OCR
  ocrDate: timestamp("ocrDate"), // Date extracted from receipt
  ocrVendor: varchar("ocrVendor", { length: 255 }), // Vendor extracted from receipt
  ocrAmount: decimal("ocrAmount", { precision: 10, scale: 2 }), // Amount extracted from receipt
  ocrCategory: varchar("ocrCategory", { length: 100 }), // AI-suggested category
  ocrConfidence: decimal("ocrConfidence", { precision: 5, scale: 2 }), // Confidence score (0-100)
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
  processedAt: timestamp("processedAt"), // When OCR completed
  linkedToExpenseId: int("linkedToExpenseId"), // Links to expenses table
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("receipt_user_idx").on(table.userId),
  dateIdx: index("receipt_date_idx").on(table.ocrDate),
  vendorIdx: index("receipt_vendor_idx").on(table.ocrVendor),
  expenseIdx: index("receipt_expense_idx").on(table.linkedToExpenseId),
}));

export type Receipt = typeof receipts.$inferSelect;
export type InsertReceipt = typeof receipts.$inferInsert;

/**
 * Deductions - specific tax deductions
 */
export const deductions = mysqlTable("deductions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  taxYear: int("taxYear").notNull(),
  deductionType: varchar("deductionType", { length: 100 }).notNull(), // e.g., "Mileage", "Home Office", "Equipment"
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  calculationMethod: varchar("calculationMethod", { length: 100 }), // e.g., "Standard Rate", "Actual Expenses", "Simplified Method"
  calculationDetails: text("calculationDetails"), // JSON with calculation breakdown
  supportingDocuments: text("supportingDocuments"), // JSON array of receipt IDs or URLs
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("deduction_user_idx").on(table.userId),
  yearIdx: index("deduction_year_idx").on(table.taxYear),
  typeIdx: index("deduction_type_idx").on(table.deductionType),
}));

export type Deduction = typeof deductions.$inferSelect;
export type InsertDeduction = typeof deductions.$inferInsert;

/**
 * Quarterly tax estimates - tracks estimated tax payments
 */
export const quarterlyEstimates = mysqlTable("quarterlyEstimates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  taxYear: int("taxYear").notNull(),
  quarter: int("quarter").notNull(), // 1, 2, 3, 4
  dueDate: timestamp("dueDate").notNull(),
  estimatedIncome: decimal("estimatedIncome", { precision: 10, scale: 2 }).notNull(),
  estimatedDeductions: decimal("estimatedDeductions", { precision: 10, scale: 2 }).notNull(),
  estimatedTaxableIncome: decimal("estimatedTaxableIncome", { precision: 10, scale: 2 }).notNull(),
  federalTaxOwed: decimal("federalTaxOwed", { precision: 10, scale: 2 }).notNull(),
  stateTaxOwed: decimal("stateTaxOwed", { precision: 10, scale: 2 }).notNull(),
  selfEmploymentTaxOwed: decimal("selfEmploymentTaxOwed", { precision: 10, scale: 2 }).notNull(),
  totalTaxOwed: decimal("totalTaxOwed", { precision: 10, scale: 2 }).notNull(),
  amountPaid: decimal("amountPaid", { precision: 10, scale: 2 }).default("0.00").notNull(),
  paidDate: timestamp("paidDate"),
  paymentMethod: varchar("paymentMethod", { length: 50 }), // e.g., "EFTPS", "Check", "Credit Card"
  confirmationNumber: varchar("confirmationNumber", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("quarterly_user_idx").on(table.userId),
  yearIdx: index("quarterly_year_idx").on(table.taxYear),
  quarterIdx: index("quarterly_quarter_idx").on(table.quarter),
  dueIdx: index("quarterly_due_idx").on(table.dueDate),
}));

export type QuarterlyEstimate = typeof quarterlyEstimates.$inferSelect;
export type InsertQuarterlyEstimate = typeof quarterlyEstimates.$inferInsert;

/**
 * Tax liability tracking - overall tax owed/paid
 */
export const taxLiabilities = mysqlTable("taxLiabilities", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  taxYear: int("taxYear").notNull(),
  totalIncome: decimal("totalIncome", { precision: 10, scale: 2 }).notNull(),
  totalDeductions: decimal("totalDeductions", { precision: 10, scale: 2 }).notNull(),
  taxableIncome: decimal("taxableIncome", { precision: 10, scale: 2 }).notNull(),
  federalTaxOwed: decimal("federalTaxOwed", { precision: 10, scale: 2 }).notNull(),
  federalTaxPaid: decimal("federalTaxPaid", { precision: 10, scale: 2 }).default("0.00").notNull(),
  federalTaxRefund: decimal("federalTaxRefund", { precision: 10, scale: 2 }).default("0.00").notNull(),
  stateTaxOwed: decimal("stateTaxOwed", { precision: 10, scale: 2 }).notNull(),
  stateTaxPaid: decimal("stateTaxPaid", { precision: 10, scale: 2 }).default("0.00").notNull(),
  stateTaxRefund: decimal("stateTaxRefund", { precision: 10, scale: 2 }).default("0.00").notNull(),
  selfEmploymentTaxOwed: decimal("selfEmploymentTaxOwed", { precision: 10, scale: 2 }).notNull(),
  selfEmploymentTaxPaid: decimal("selfEmploymentTaxPaid", { precision: 10, scale: 2 }).default("0.00").notNull(),
  penaltiesOwed: decimal("penaltiesOwed", { precision: 10, scale: 2 }).default("0.00").notNull(),
  interestOwed: decimal("interestOwed", { precision: 10, scale: 2 }).default("0.00").notNull(),
  filingStatus: mysqlEnum("filingStatus", ["not_filed", "filed", "amended"]).default("not_filed").notNull(),
  filedDate: timestamp("filedDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("liability_user_idx").on(table.userId),
  yearIdx: index("liability_year_idx").on(table.taxYear),
  statusIdx: index("liability_status_idx").on(table.filingStatus),
}));

export type TaxLiability = typeof taxLiabilities.$inferSelect;
export type InsertTaxLiability = typeof taxLiabilities.$inferInsert;

/**
 * Tax audit trail - logs all changes for compliance
 */
export const taxAuditLog = mysqlTable("taxAuditLog", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tableName: varchar("tableName", { length: 100 }).notNull(), // e.g., "expenses", "form1099s"
  recordId: int("recordId").notNull(),
  action: mysqlEnum("action", ["create", "update", "delete"]).notNull(),
  oldValues: text("oldValues"), // JSON of previous values
  newValues: text("newValues"), // JSON of new values
  changedBy: int("changedBy").notNull(), // Links to users table
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("audit_user_idx").on(table.userId),
  tableIdx: index("audit_table_idx").on(table.tableName),
  recordIdx: index("audit_record_idx").on(table.recordId),
  timestampIdx: index("audit_timestamp_idx").on(table.timestamp),
}));

export type TaxAuditLog = typeof taxAuditLog.$inferSelect;
export type InsertTaxAuditLog = typeof taxAuditLog.$inferInsert;

/**
 * Tax notifications - spending alerts and reminders
 */
export const taxNotifications = mysqlTable("taxNotifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", [
    "anomaly",           // Unusual spending pattern detected
    "budget_threshold",  // Budget limit reached
    "duplicate",         // Possible duplicate expense
    "large_purchase",    // Large purchase alert ($500+)
    "weekly_summary",    // Weekly spending summary
    "tax_deadline",      // Upcoming tax deadline
    "missing_receipt",   // Expense missing receipt
    "deduction_opportunity" // Potential deduction found
  ]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  severity: mysqlEnum("severity", ["info", "warning", "critical"]).default("info").notNull(),
  relatedExpenseId: int("relatedExpenseId"), // Links to expenses table
  relatedData: text("relatedData"), // JSON with additional context
  isRead: boolean("isRead").default(false).notNull(),
  readAt: timestamp("readAt"),
  actionTaken: varchar("actionTaken", { length: 100 }), // e.g., "dismissed", "resolved", "expense_edited"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("notification_user_idx").on(table.userId),
  typeIdx: index("notification_type_idx").on(table.type),
  isReadIdx: index("notification_read_idx").on(table.isRead),
  createdIdx: index("notification_created_idx").on(table.createdAt),
}));

export type TaxNotification = typeof taxNotifications.$inferSelect;
export type InsertTaxNotification = typeof taxNotifications.$inferInsert;

/**
 * Expense categories - predefined IRS Schedule C categories
 */
export const expenseCategories = mysqlTable("expenseCategories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  scheduleCLine: varchar("scheduleCLine", { length: 50 }), // e.g., Line 8, Line 9, Line 25
  description: text("description"),
  deductiblePercentage: int("deductiblePercentage").default(100).notNull(), // e.g., 50 for meals
  requiresReceipt: boolean("requiresReceipt").default(true).notNull(),
  exampleExpenses: text("exampleExpenses"), // JSON array of examples
  aiKeywords: text("aiKeywords"), // JSON array of keywords for AI categorization
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  nameIdx: index("category_name_idx").on(table.name),
  activeIdx: index("category_active_idx").on(table.isActive),
}));

export type ExpenseCategory = typeof expenseCategories.$inferSelect;
export type InsertExpenseCategory = typeof expenseCategories.$inferInsert;

/**
 * User spending patterns - for anomaly detection
 */
export const spendingPatterns = mysqlTable("spendingPatterns", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  avgMonthlyAmount: decimal("avgMonthlyAmount", { precision: 10, scale: 2 }).notNull(),
  stdDeviation: decimal("stdDeviation", { precision: 10, scale: 2 }).notNull(),
  minAmount: decimal("minAmount", { precision: 10, scale: 2 }).notNull(),
  maxAmount: decimal("maxAmount", { precision: 10, scale: 2 }).notNull(),
  transactionCount: int("transactionCount").notNull(),
  lastCalculated: timestamp("lastCalculated").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("pattern_user_idx").on(table.userId),
  categoryIdx: index("pattern_category_idx").on(table.category),
  userCategoryIdx: index("pattern_user_category_idx").on(table.userId, table.category),
}));

export type SpendingPattern = typeof spendingPatterns.$inferSelect;
export type InsertSpendingPattern = typeof spendingPatterns.$inferInsert;


/**
 * Security tools catalog - open-source and SaaS security products
 */
export const securityTools = mysqlTable("securityTools", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  category: mysqlEnum("category", [
    "network_security",
    "vulnerability_scanning",
    "endpoint_protection",
    "identity_management",
    "firewall",
    "penetration_testing",
    "incident_response",
    "cloud_security",
    "api_security",
    "ai_security"
  ]).notNull(),
  type: mysqlEnum("type", ["open_source", "saas", "hybrid"]).notNull(),
  description: text("description").notNull(),
  benefits: text("benefits"), // JSON array of key benefits
  features: text("features"), // JSON array of features
  useCases: text("useCases"), // JSON array of use cases
  installationGuide: text("installationGuide"),
  documentationUrl: varchar("documentationUrl", { length: 500 }),
  githubUrl: varchar("githubUrl", { length: 500 }),
  websiteUrl: varchar("websiteUrl", { length: 500 }),
  logoUrl: varchar("logoUrl", { length: 500 }),
  pricing: text("pricing"), // JSON object with pricing tiers
  hasAffiliate: boolean("hasAffiliate").default(false).notNull(),
  affiliateUrl: varchar("affiliateUrl", { length: 500 }),
  affiliateCommission: varchar("affiliateCommission", { length: 100 }),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  reviewCount: int("reviewCount").default(0).notNull(),
  isPopular: boolean("isPopular").default(false).notNull(),
  isEmerging: boolean("isEmerging").default(false).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  slugIdx: index("tool_slug_idx").on(table.slug),
  categoryIdx: index("tool_category_idx").on(table.category),
  typeIdx: index("tool_type_idx").on(table.type),
  affiliateIdx: index("tool_affiliate_idx").on(table.hasAffiliate),
}));

export type SecurityTool = typeof securityTools.$inferSelect;
export type InsertSecurityTool = typeof securityTools.$inferInsert;

/**
 * Security assessments - vulnerability scans and risk assessments
 */
export const securityAssessments = mysqlTable("securityAssessments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  organizationName: varchar("organizationName", { length: 255 }),
  assessmentType: mysqlEnum("assessmentType", [
    "vulnerability_scan",
    "risk_assessment",
    "compliance_check",
    "penetration_test",
    "security_audit"
  ]).notNull(),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "failed"]).default("pending").notNull(),
  score: int("score"), // 0-100 security score
  findings: text("findings"), // JSON array of security findings
  recommendations: text("recommendations"), // JSON array of remediation steps
  complianceFramework: varchar("complianceFramework", { length: 100 }), // NIST, ISO 27001, etc.
  scanResults: text("scanResults"), // JSON object with detailed scan results
  reportUrl: varchar("reportUrl", { length: 500 }),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("assessment_user_idx").on(table.userId),
  statusIdx: index("assessment_status_idx").on(table.status),
  typeIdx: index("assessment_type_idx").on(table.assessmentType),
}));

export type SecurityAssessment = typeof securityAssessments.$inferSelect;
export type InsertSecurityAssessment = typeof securityAssessments.$inferInsert;

/**
 * Security training courses - KnowBe4, Curricula, etc.
 */
export const securityTrainingCourses = mysqlTable("securityTrainingCourses", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  provider: varchar("provider", { length: 100 }).notNull(), // KnowBe4, Curricula, etc.
  category: mysqlEnum("category", [
    "phishing_awareness",
    "password_security",
    "social_engineering",
    "data_protection",
    "compliance",
    "incident_response",
    "cloud_security",
    "general_awareness"
  ]).notNull(),
  description: text("description").notNull(),
  duration: int("duration"), // minutes
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]).notNull(),
  objectives: text("objectives"), // JSON array of learning objectives
  content: text("content"), // JSON object with course content
  quizQuestions: text("quizQuestions"), // JSON array of quiz questions
  certificateAvailable: boolean("certificateAvailable").default(false).notNull(),
  externalUrl: varchar("externalUrl", { length: 500 }),
  thumbnailUrl: varchar("thumbnailUrl", { length: 500 }),
  isActive: boolean("isActive").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  slugIdx: index("course_slug_idx").on(table.slug),
  providerIdx: index("course_provider_idx").on(table.provider),
  categoryIdx: index("course_category_idx").on(table.category),
  activeIdx: index("course_active_idx").on(table.isActive),
}));

export type SecurityTrainingCourse = typeof securityTrainingCourses.$inferSelect;
export type InsertSecurityTrainingCourse = typeof securityTrainingCourses.$inferInsert;

/**
 * User training progress - track completion of security training
 */
export const userTrainingProgress = mysqlTable("userTrainingProgress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  courseId: int("courseId").notNull(),
  status: mysqlEnum("status", ["not_started", "in_progress", "completed", "failed"]).default("not_started").notNull(),
  progress: int("progress").default(0).notNull(), // 0-100 percentage
  quizScore: int("quizScore"), // 0-100 percentage
  attempts: int("attempts").default(0).notNull(),
  certificateUrl: varchar("certificateUrl", { length: 500 }),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  expiresAt: timestamp("expiresAt"), // for certifications that expire
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("progress_user_idx").on(table.userId),
  courseIdx: index("progress_course_idx").on(table.courseId),
  statusIdx: index("progress_status_idx").on(table.status),
  userCourseIdx: index("progress_user_course_idx").on(table.userId, table.courseId),
}));

export type UserTrainingProgress = typeof userTrainingProgress.$inferSelect;
export type InsertUserTrainingProgress = typeof userTrainingProgress.$inferInsert;

/**
 * Affiliate program tracking - track clicks, conversions, and commissions
 */
export const affiliateClicks = mysqlTable("affiliateClicks", {
  id: int("id").autoincrement().primaryKey(),
  toolId: int("toolId").notNull(),
  userId: int("userId"), // optional - track which user clicked
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  referrer: varchar("referrer", { length: 500 }),
  clickedAt: timestamp("clickedAt").defaultNow().notNull(),
}, (table) => ({
  toolIdx: index("click_tool_idx").on(table.toolId),
  userIdx: index("click_user_idx").on(table.userId),
  dateIdx: index("click_date_idx").on(table.clickedAt),
}));

export type AffiliateClick = typeof affiliateClicks.$inferSelect;
export type InsertAffiliateClick = typeof affiliateClicks.$inferInsert;

/**
 * Affiliate conversions - track successful referrals and commissions
 */
export const affiliateConversions = mysqlTable("affiliateConversions", {
  id: int("id").autoincrement().primaryKey(),
  toolId: int("toolId").notNull(),
  clickId: int("clickId"), // link back to the original click
  userId: int("userId"), // user who made the conversion
  conversionType: mysqlEnum("conversionType", ["trial", "purchase", "subscription"]).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }), // sale amount
  commission: decimal("commission", { precision: 10, scale: 2 }), // commission earned
  status: mysqlEnum("status", ["pending", "approved", "paid", "rejected"]).default("pending").notNull(),
  externalId: varchar("externalId", { length: 255 }), // affiliate network's conversion ID
  notes: text("notes"),
  convertedAt: timestamp("convertedAt").defaultNow().notNull(),
  approvedAt: timestamp("approvedAt"),
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  toolIdx: index("conversion_tool_idx").on(table.toolId),
  clickIdx: index("conversion_click_idx").on(table.clickId),
  userIdx: index("conversion_user_idx").on(table.userId),
  statusIdx: index("conversion_status_idx").on(table.status),
  dateIdx: index("conversion_date_idx").on(table.convertedAt),
}));

export type AffiliateConversion = typeof affiliateConversions.$inferSelect;
export type InsertAffiliateConversion = typeof affiliateConversions.$inferInsert;

/**
 * AI Career Assessments - store AI-powered career matching results
 */
export const aiCareerAssessments = mysqlTable("aiCareerAssessments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  currentRole: varchar("currentRole", { length: 255 }),
  currentIndustry: varchar("currentIndustry", { length: 255 }),
  yearsExperience: int("yearsExperience"),
  educationLevel: varchar("educationLevel", { length: 100 }),
  skills: text("skills"), // JSON array of skills
  interests: text("interests"), // JSON array of interests
  assessmentInput: text("assessmentInput"), // raw user input (conversation)
  aiResponse: text("aiResponse"), // AI-generated career recommendations
  recommendedPaths: text("recommendedPaths"), // JSON array of career paths with confidence scores
  topMatch: varchar("topMatch", { length: 255 }), // highest confidence match
  confidenceScore: decimal("confidenceScore", { precision: 5, scale: 2 }), // 0-100
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("ai_assessment_user_idx").on(table.userId),
  dateIdx: index("ai_assessment_date_idx").on(table.createdAt),
}));

export type AICareerAssessment = typeof aiCareerAssessments.$inferSelect;
export type InsertAICareerAssessment = typeof aiCareerAssessments.$inferInsert;

/**
 * AI Skills Gap Analysis - identify training needs for career transitions
 */
export const aiSkillsGapAnalysis = mysqlTable("aiSkillsGapAnalysis", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  assessmentId: int("assessmentId"), // link to career assessment
  currentSkills: text("currentSkills"), // JSON array
  targetRole: varchar("targetRole", { length: 255 }).notNull(),
  requiredSkills: text("requiredSkills"), // JSON array
  missingSkills: text("missingSkills"), // JSON array with priority levels
  transferableSkills: text("transferableSkills"), // JSON array
  recommendedTraining: text("recommendedTraining"), // JSON array of courses/certs
  estimatedTimeToReady: int("estimatedTimeToReady"), // months
  estimatedCost: decimal("estimatedCost", { precision: 10, scale: 2 }),
  aiAnalysis: text("aiAnalysis"), // detailed AI explanation
  progressPercentage: decimal("progressPercentage", { precision: 5, scale: 2 }).default("0"), // 0-100
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("ai_gap_user_idx").on(table.userId),
  assessmentIdx: index("ai_gap_assessment_idx").on(table.assessmentId),
}));

export type AISkillsGapAnalysis = typeof aiSkillsGapAnalysis.$inferSelect;
export type InsertAISkillsGapAnalysis = typeof aiSkillsGapAnalysis.$inferInsert;

/**
 * AI Opportunity Alerts - discovered opportunities matching user profile
 */
export const aiOpportunityAlerts = mysqlTable("aiOpportunityAlerts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  opportunityType: mysqlEnum("opportunityType", ["job", "training", "certification", "location", "emerging_role"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  matchScore: decimal("matchScore", { precision: 5, scale: 2 }), // 0-100
  matchReason: text("matchReason"), // AI explanation of why this matches
  salaryRange: varchar("salaryRange", { length: 100 }),
  location: varchar("location", { length: 255 }),
  url: varchar("url", { length: 500 }),
  source: varchar("source", { length: 255 }), // where AI found this
  userResponse: mysqlEnum("userResponse", ["interested", "not_interested", "applied", "dismissed"]),
  isRead: boolean("isRead").default(false).notNull(),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("ai_opportunity_user_idx").on(table.userId),
  typeIdx: index("ai_opportunity_type_idx").on(table.opportunityType),
  scoreIdx: index("ai_opportunity_score_idx").on(table.matchScore),
  readIdx: index("ai_opportunity_read_idx").on(table.isRead),
}));

export type AIOpportunityAlert = typeof aiOpportunityAlerts.$inferSelect;
export type InsertAIOpportunityAlert = typeof aiOpportunityAlerts.$inferInsert;

/**
 * AI Career Coach Conversations - chat history with AI career coach
 */
export const aiCoachConversations = mysqlTable("aiCoachConversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  sessionId: varchar("sessionId", { length: 100 }).notNull(),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  context: text("context"), // JSON with user profile, assessment data, etc.
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("ai_coach_user_idx").on(table.userId),
  sessionIdx: index("ai_coach_session_idx").on(table.sessionId),
  dateIdx: index("ai_coach_date_idx").on(table.createdAt),
}));

export type AICoachConversation = typeof aiCoachConversations.$inferSelect;
export type InsertAICoachConversation = typeof aiCoachConversations.$inferInsert;

/**
 * AI ROI Calculations - personalized career transition ROI analysis
 */
export const aiRoiCalculations = mysqlTable("aiRoiCalculations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  assessmentId: int("assessmentId"),
  gapAnalysisId: int("gapAnalysisId"),
  currentSalary: decimal("currentSalary", { precision: 10, scale: 2 }).notNull(),
  targetSalary: decimal("targetSalary", { precision: 10, scale: 2 }).notNull(),
  trainingCosts: decimal("trainingCosts", { precision: 10, scale: 2 }).notNull(),
  opportunityCost: decimal("opportunityCost", { precision: 10, scale: 2 }), // lost wages during training
  timeToTransition: int("timeToTransition"), // months
  breakEvenMonths: int("breakEvenMonths"),
  fiveYearGain: decimal("fiveYearGain", { precision: 12, scale: 2 }),
  tenYearGain: decimal("tenYearGain", { precision: 12, scale: 2 }),
  lifetimeGain: decimal("lifetimeGain", { precision: 12, scale: 2 }),
  riskFactors: text("riskFactors"), // JSON array of identified risks
  aiInsights: text("aiInsights"), // AI-generated insights and recommendations
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("ai_roi_user_idx").on(table.userId),
  assessmentIdx: index("ai_roi_assessment_idx").on(table.assessmentId),
}));

export type AIRoiCalculation = typeof aiRoiCalculations.$inferSelect;
export type InsertAIRoiCalculation = typeof aiRoiCalculations.$inferInsert;

/**
 * Module 02: Neurodivergent UI Adapter
 * User accessibility preferences and neurodivergent profiles
 */
export const neurodivergentProfiles = mysqlTable("neurodivergentProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  profileType: mysqlEnum("profileType", ["adhd", "autism", "anxiety", "dyslexia", "vampire", "none"]).notNull(),
  uiComplexity: mysqlEnum("uiComplexity", ["minimal", "standard", "detailed"]).default("standard").notNull(),
  languageTone: mysqlEnum("languageTone", ["simple", "professional", "technical"]).default("simple").notNull(),
  colorScheme: mysqlEnum("colorScheme", ["light", "dark", "auto"]).default("auto").notNull(),
  reducedAnimations: boolean("reducedAnimations").default(false).notNull(),
  highContrast: boolean("highContrast").default(false).notNull(),
  largeText: boolean("largeText").default(false).notNull(),
  focusMode: boolean("focusMode").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("neurodivergent_user_idx").on(table.userId),
}));

export type NeurodivergentProfile = typeof neurodivergentProfiles.$inferSelect;
export type InsertNeurodivergentProfile = typeof neurodivergentProfiles.$inferInsert;

/**
 * Module 05: Stripe Commerce Engine
 * Products, orders, subscriptions for training programs and certifications
 */
export const commerceProducts = mysqlTable("commerceProducts", {
  id: int("id").autoincrement().primaryKey(),
  stripeProductId: varchar("stripeProductId", { length: 255 }).notNull().unique(),
  stripePriceId: varchar("stripePriceId", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", ["training", "certification", "subscription", "tool"]).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("usd").notNull(),
  billingPeriod: mysqlEnum("billingPeriod", ["one_time", "monthly", "yearly"]).default("one_time").notNull(),
  features: text("features"), // JSON array
  isActive: boolean("isActive").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  categoryIdx: index("commerce_product_category_idx").on(table.category),
  activeIdx: index("commerce_product_active_idx").on(table.isActive),
}));

export type CommerceProduct = typeof commerceProducts.$inferSelect;
export type InsertCommerceProduct = typeof commerceProducts.$inferInsert;

export const commerceOrders = mysqlTable("commerceOrders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stripeSessionId: varchar("stripeSessionId", { length: 255 }).notNull().unique(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  productId: int("productId").notNull(),
  items: text("items").notNull(), // JSON string of order items
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("usd").notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  metadata: text("metadata"), // JSON
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
}, (table) => ({
  userIdx: index("commerce_order_user_idx").on(table.userId),
  productIdx: index("commerce_order_product_idx").on(table.productId),
  statusIdx: index("commerce_order_status_idx").on(table.status),
}));

export type CommerceOrder = typeof commerceOrders.$inferSelect;
export type InsertCommerceOrder = typeof commerceOrders.$inferInsert;

export const commerceSubscriptions = mysqlTable("commerceSubscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }).notNull().unique(),
  productId: int("productId").notNull(),
  status: mysqlEnum("status", ["active", "paused", "canceled", "past_due"]).default("active").notNull(),
  currentPeriodStart: timestamp("currentPeriodStart").notNull(),
  currentPeriodEnd: timestamp("currentPeriodEnd").notNull(),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("commerce_subscription_user_idx").on(table.userId),
  productIdx: index("commerce_subscription_product_idx").on(table.productId),
  statusIdx: index("commerce_subscription_status_idx").on(table.status),
}));

export type CommerceSubscription = typeof commerceSubscriptions.$inferSelect;
export type InsertCommerceSubscription = typeof commerceSubscriptions.$inferInsert;

export const commercePendingOrders = mysqlTable("commercePendingOrders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  checkoutSessionId: varchar("checkoutSessionId", { length: 255 }).notNull().unique(),
  stripeSessionId: varchar("stripeSessionId", { length: 255 }).notNull().unique(),
  productId: int("productId").notNull(),
  items: text("items").notNull(), // JSON string of cart items
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  pausedAt: timestamp("pausedAt").defaultNow().notNull(),
  resumeToken: varchar("resumeToken", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
}, (table) => ({
  userIdx: index("commerce_pending_user_idx").on(table.userId),
  tokenIdx: index("commerce_pending_token_idx").on(table.resumeToken),
}));

export type CommercePendingOrder = typeof commercePendingOrders.$inferSelect;
export type InsertCommercePendingOrder = typeof commercePendingOrders.$inferInsert;

/**
 * Universal API Stack
 * Modular API system for reusable features across applications
 */
export const apiCustomers = mysqlTable("apiCustomers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Link to user table
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  apiKey: varchar("apiKey", { length: 64 }).notNull().unique(),
  status: mysqlEnum("status", ["active", "suspended", "canceled"]).default("active").notNull(),
  tier: mysqlEnum("tier", ["free", "starter", "pro", "enterprise"]).default("free").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  emailIdx: index("api_customer_email_idx").on(table.email),
  apiKeyIdx: index("api_customer_key_idx").on(table.apiKey),
}));

export type APICustomer = typeof apiCustomers.$inferSelect;
export type InsertAPICustomer = typeof apiCustomers.$inferInsert;

export const apiModules = mysqlTable("apiModules", {
  id: int("id").autoincrement().primaryKey(),
  moduleKey: varchar("moduleKey", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  version: varchar("version", { length: 20 }).notNull(),
  basePrice: decimal("basePrice", { precision: 10, scale: 2 }).notNull(),
  pricePerRequest: decimal("pricePerRequest", { precision: 10, scale: 6 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  moduleKeyIdx: index("api_module_key_idx").on(table.moduleKey),
}));

export type APIModule = typeof apiModules.$inferSelect;
export type InsertAPIModule = typeof apiModules.$inferInsert;

export const customerModules = mysqlTable("customerModules", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull(),
  moduleId: varchar("moduleId", { length: 100 }).notNull(),
  status: mysqlEnum("status", ["active", "paused", "canceled"]).default("active").notNull(),
  monthlyQuota: int("monthlyQuota"),
  usedThisMonth: int("usedThisMonth").default(0).notNull(),
  overageRate: decimal("overageRate", { precision: 10, scale: 6 }),
  activatedAt: timestamp("activatedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
}, (table) => ({
  customerIdx: index("customer_module_customer_idx").on(table.customerId),
  moduleIdx: index("customer_module_module_idx").on(table.moduleId),
}));

export type CustomerModule = typeof customerModules.$inferSelect;
export type InsertCustomerModule = typeof customerModules.$inferInsert;

export const apiUsage = mysqlTable("apiUsage", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull(),
  moduleId: varchar("moduleId", { length: 100 }).notNull(),
  action: varchar("action", { length: 100 }),
  endpoint: varchar("endpoint", { length: 255 }).notNull(),
  requestCount: int("requestCount").default(1).notNull(),
  success: boolean("success").default(true),
  responseTime: int("responseTime"), // milliseconds
  cost: decimal("cost", { precision: 10, scale: 6 }),
  statusCode: int("statusCode"),
  errorMessage: text("errorMessage"),
  metadata: text("metadata"), // JSON string
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  customerIdx: index("api_usage_customer_idx").on(table.customerId),
  moduleIdx: index("api_usage_module_idx").on(table.moduleId),
  dateIdx: index("api_usage_date_idx").on(table.createdAt),
}));

export type APIUsage = typeof apiUsage.$inferSelect;
export type InsertAPIUsage = typeof apiUsage.$inferInsert;

export const apiBilling = mysqlTable("apiBilling", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull(),
  billingPeriodStart: timestamp("billingPeriodStart").notNull(),
  billingPeriodEnd: timestamp("billingPeriodEnd").notNull(),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  baseCharges: decimal("baseCharges", { precision: 10, scale: 2 }).notNull(),
  overageCharges: decimal("overageCharges", { precision: 10, scale: 2 }).default("0.00").notNull(),
  status: mysqlEnum("status", ["pending", "paid", "overdue", "canceled"]).default("pending").notNull(),
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  customerIdx: index("api_billing_customer_idx").on(table.customerId),
  statusIdx: index("api_billing_status_idx").on(table.status),
}));

export type APIBilling = typeof apiBilling.$inferSelect;
export type InsertAPIBilling = typeof apiBilling.$inferInsert;

// Universal API - Affiliate Tracking
export const affiliateTracking = mysqlTable("affiliateTracking", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull(),
  moduleId: varchar("moduleId", { length: 100 }).notNull(),
  affiliateProgram: varchar("affiliateProgram", { length: 255 }).notNull(),
  event: varchar("event", { length: 100 }).notNull(), // click, signup, conversion, etc.
  eventData: text("eventData"), // JSON string
  commission: decimal("commission", { precision: 10, scale: 2 }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
  customerIdx: index("affiliate_tracking_customer_idx").on(table.customerId),
  moduleIdx: index("affiliate_tracking_module_idx").on(table.moduleId),
  programIdx: index("affiliate_tracking_program_idx").on(table.affiliateProgram),
  dateIdx: index("affiliate_tracking_date_idx").on(table.timestamp),
}));

export type AffiliateTracking = typeof affiliateTracking.$inferSelect;
export type InsertAffiliateTracking = typeof affiliateTracking.$inferInsert;

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
}, (table) => ({
  userIdx: index("rewards_user_idx").on(table.userId),
  createdIdx: index("rewards_created_idx").on(table.createdAt),
}));

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
}, (table) => ({
  userIdx: index("credits_tx_user_idx").on(table.userId),
  typeIdx: index("credits_tx_type_idx").on(table.type),
  createdIdx: index("credits_tx_created_idx").on(table.createdAt),
}));

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
}, (table) => ({
  promoCodeIdx: index("promo_redemption_code_idx").on(table.promoCodeId),
  userIdx: index("promo_redemption_user_idx").on(table.userId),
}));

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

// ============================================================================
// ADVERTISING & AFFILIATE MODULE
// ============================================================================

/**
 * Advertising Affiliates - Partners who promote The Alt Text
 */
export const advertisingAffiliates = mysqlTable("advertising_affiliates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id"), // Link to user table if they're also a user
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  company: varchar("company", { length: 255 }),
  affiliateCode: varchar("affiliate_code", { length: 50 }).notNull().unique(),
  referralLink: text("referral_link").notNull(),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).notNull().default("0.20"),
  domainCommissionRate: decimal("domain_commission_rate", { precision: 5, scale: 2 }).notNull().default("0.15"),
  status: mysqlEnum("status", ["pending", "active", "suspended"]).notNull().default("pending"),
  approvedAt: timestamp("approved_at"),
  paypalEmail: varchar("paypal_email", { length: 320 }),
  stripeAccountId: varchar("stripe_account_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type AdvertisingAffiliate = typeof advertisingAffiliates.$inferSelect;
export type InsertAdvertisingAffiliate = typeof advertisingAffiliates.$inferInsert;

/**
 * Advertising Affiliate Clicks - Track every click on affiliate links
 */
export const adAffiliateClicks = mysqlTable("advertising_affiliate_clicks", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliate_id").notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  landingPage: text("landing_page"),
  converted: int("converted").notNull().default(0),
  conversionId: varchar("conversion_id", { length: 255 }),
  clickedAt: timestamp("clicked_at").defaultNow().notNull(),
});

export type AdvertisingAffiliateClick = typeof adAffiliateClicks.$inferSelect;
export type InsertAdvertisingAffiliateClick = typeof adAffiliateClicks.$inferInsert;

/**
 * Advertising Affiliate Commissions - Track earnings
 */
export const advertisingAffiliateCommissions = mysqlTable("advertising_affiliate_commissions", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliate_id").notNull(),
  type: mysqlEnum("type", ["subscription", "domain_sale", "one_time"]).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  rate: decimal("rate", { precision: 5, scale: 2 }).notNull(),
  sourceId: varchar("source_id", { length: 255 }).notNull(),
  sourceType: mysqlEnum("source_type", ["subscription", "domain"]).notNull(),
  status: mysqlEnum("status", ["pending", "paid", "cancelled"]).notNull().default("pending"),
  paidAt: timestamp("paid_at"),
  paymentMethod: mysqlEnum("payment_method", ["paypal", "stripe"]),
  transactionId: varchar("transaction_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AdvertisingAffiliateCommission = typeof advertisingAffiliateCommissions.$inferSelect;
export type InsertAdvertisingAffiliateCommission = typeof advertisingAffiliateCommissions.$inferInsert;

/**
 * Ad Campaigns - Marketing campaigns
 */
export const adCampaigns = mysqlTable("ad_campaigns", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["draft", "active", "paused", "completed"]).notNull().default("draft"),
  budget: decimal("budget", { precision: 10, scale: 2 }).notNull(),
  spent: decimal("spent", { precision: 10, scale: 2 }).notNull().default("0.00"),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).notNull().default("0.00"),
  platforms: text("platforms").notNull(),
  targetAudience: text("target_audience"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  createdBy: int("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type AdCampaign = typeof adCampaigns.$inferSelect;
export type InsertAdCampaign = typeof adCampaigns.$inferInsert;

/**
 * Ads - Individual ads within campaigns
 */
export const ads = mysqlTable("ads", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaign_id").notNull(),
  headline: varchar("headline", { length: 255 }).notNull(),
  body: text("body").notNull(),
  cta: varchar("cta", { length: 100 }).notNull(),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  landingPageUrl: text("landing_page_url").notNull(),
  linkedinAdId: varchar("linkedin_ad_id", { length: 255 }),
  facebookAdId: varchar("facebook_ad_id", { length: 255 }),
  tiktokAdId: varchar("tiktok_ad_id", { length: 255 }),
  impressions: int("impressions").notNull().default(0),
  clicks: int("clicks").notNull().default(0),
  conversions: int("conversions").notNull().default(0),
  spent: decimal("spent", { precision: 10, scale: 2 }).notNull().default("0.00"),
  variant: varchar("variant", { length: 10 }),
  status: mysqlEnum("status", ["draft", "active", "paused", "completed"]).notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Ad = typeof ads.$inferSelect;
export type InsertAd = typeof ads.$inferInsert;

/**
 * Landing Pages - Custom landing pages for campaigns
 */
export const landingPages = mysqlTable("landing_pages", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  content: text("content").notNull(),
  logoUrl: text("logo_url"),
  heroImageUrl: text("hero_image_url"),
  videoUrl: text("video_url"),
  views: int("views").notNull().default(0),
  conversions: int("conversions").notNull().default(0),
  variant: varchar("variant", { length: 10 }),
  parentPageId: int("parent_page_id"),
  status: mysqlEnum("status", ["draft", "published", "archived"]).notNull().default("draft"),
  publishedAt: timestamp("published_at"),
  createdBy: int("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type LandingPage = typeof landingPages.$inferSelect;
export type InsertLandingPage = typeof landingPages.$inferInsert;

/**
 * Email Campaigns - Automated email marketing
 */
export const emailCampaigns = mysqlTable("email_campaigns", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  previewText: text("preview_text"),
  htmlContent: text("html_content").notNull(),
  textContent: text("text_content"),
  recipientList: text("recipient_list").notNull(),
  scheduledAt: timestamp("scheduled_at"),
  sentAt: timestamp("sent_at"),
  sent: int("sent").notNull().default(0),
  opened: int("opened").notNull().default(0),
  clicked: int("clicked").notNull().default(0),
  converted: int("converted").notNull().default(0),
  status: mysqlEnum("status", ["draft", "scheduled", "sending", "sent"]).notNull().default("draft"),
  createdBy: int("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type EmailCampaign = typeof emailCampaigns.$inferSelect;
export type InsertEmailCampaign = typeof emailCampaigns.$inferInsert;

/**
 * Domain Sales - Track Manus domain sales for commission
 */
export const domainSales = mysqlTable("domain_sales", {
  id: int("id").autoincrement().primaryKey(),
  domainName: varchar("domain_name", { length: 255 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  buyerEmail: varchar("buyer_email", { length: 320 }).notNull(),
  buyerName: varchar("buyer_name", { length: 255 }),
  affiliateId: int("affiliate_id"),
  affiliateCommission: decimal("affiliate_commission", { precision: 10, scale: 2 }),
  manusOrderId: varchar("manus_order_id", { length: 255 }),
  status: mysqlEnum("status", ["pending", "completed", "refunded"]).notNull().default("pending"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type DomainSale = typeof domainSales.$inferSelect;
export type InsertDomainSale = typeof domainSales.$inferInsert;

// ============================================================================
// THE ALT TEXT - CORE PLATFORM (thealttext.com)
// ============================================================================

/**
 * Subscriptions - Customer subscription plans
 */
export const altTextSubscriptions = mysqlTable("alttext_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  plan: mysqlEnum("plan", ["starter", "professional", "enterprise"]).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  stripePriceId: varchar("stripe_price_id", { length: 255 }),
  maxScansPerMonth: int("max_scans_per_month").notNull(),
  maxPagesPerScan: int("max_pages_per_scan").notNull(),
  maxImagesPerMonth: int("max_images_per_month").notNull(),
  scansUsedThisMonth: int("scans_used_this_month").notNull().default(0),
  pagesScannedThisMonth: int("pages_scanned_this_month").notNull().default(0),
  imagesFixedThisMonth: int("images_fixed_this_month").notNull().default(0),
  status: mysqlEnum("status", ["active", "cancelled", "past_due", "trialing"]).notNull().default("active"),
  trialEndsAt: timestamp("trial_ends_at"),
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  cancelledAt: timestamp("cancelled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type AltTextSubscription = typeof altTextSubscriptions.$inferSelect;
export type InsertAltTextSubscription = typeof altTextSubscriptions.$inferInsert;

/**
 * Website Scans - Track all website accessibility scans
 */
export const altTextScans = mysqlTable("alttext_scans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  subscriptionId: int("subscription_id").notNull(),
  websiteUrl: varchar("website_url", { length: 500 }).notNull(),
  scanType: mysqlEnum("scan_type", ["full", "single_page", "custom"]).notNull().default("full"),
  maxPages: int("max_pages").notNull().default(50),
  includeSubdomains: boolean("include_subdomains").notNull().default(false),
  customUrls: text("custom_urls"),
  pagesScanned: int("pages_scanned").notNull().default(0),
  imagesFound: int("images_found").notNull().default(0),
  imagesMissingAlt: int("images_missing_alt").notNull().default(0),
  imagesWithEmptyAlt: int("images_with_empty_alt").notNull().default(0),
  imagesWithGoodAlt: int("images_with_good_alt").notNull().default(0),
  complianceScore: decimal("compliance_score", { precision: 5, scale: 2 }).notNull().default("0.00"),
  wcagLevel: mysqlEnum("wcag_level", ["A", "AA", "AAA"]).notNull().default("AA"),
  violationsFound: int("violations_found").notNull().default(0),
  status: mysqlEnum("status", ["pending", "scanning", "completed", "failed"]).notNull().default("pending"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type AltTextScan = typeof altTextScans.$inferSelect;
export type InsertAltTextScan = typeof altTextScans.$inferInsert;

/**
 * Scan Results - Detailed results for each page scanned
 */
export const altTextScanResults = mysqlTable("alttext_scan_results", {
  id: int("id").autoincrement().primaryKey(),
  scanId: int("scan_id").notNull(),
  pageUrl: varchar("page_url", { length: 500 }).notNull(),
  pageTitle: varchar("page_title", { length: 500 }),
  httpStatus: int("http_status").notNull(),
  imagesFound: int("images_found").notNull().default(0),
  imagesMissingAlt: int("images_missing_alt").notNull().default(0),
  imagesWithEmptyAlt: int("images_with_empty_alt").notNull().default(0),
  complianceScore: decimal("compliance_score", { precision: 5, scale: 2 }).notNull().default("0.00"),
  violationsFound: int("violations_found").notNull().default(0),
  scannedAt: timestamp("scanned_at").defaultNow().notNull(),
});

export type AltTextScanResult = typeof altTextScanResults.$inferSelect;
export type InsertAltTextScanResult = typeof altTextScanResults.$inferInsert;

/**
 * Image Analysis - AI-generated alt text for each image
 */
export const altTextImageAnalysis = mysqlTable("alttext_image_analysis", {
  id: int("id").autoincrement().primaryKey(),
  scanResultId: int("scan_result_id").notNull(),
  imageUrl: varchar("image_url", { length: 1000 }).notNull(),
  imageSelector: varchar("image_selector", { length: 500 }),
  currentAltText: text("current_alt_text"),
  generatedAltText: text("generated_alt_text").notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull(),
  imageType: mysqlEnum("image_type", ["photo", "illustration", "logo", "icon", "diagram", "chart", "screenshot", "decorative"]),
  width: int("width"),
  height: int("height"),
  fileSize: int("file_size"),
  format: varchar("format", { length: 20 }),
  surroundingText: text("surrounding_text"),
  pageContext: text("page_context"),
  status: mysqlEnum("status", ["pending", "analyzed", "approved", "rejected"]).notNull().default("pending"),
  reviewedBy: int("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  analyzedAt: timestamp("analyzed_at").defaultNow().notNull(),
});

export type AltTextImageAnalysis = typeof altTextImageAnalysis.$inferSelect;
export type InsertAltTextImageAnalysis = typeof altTextImageAnalysis.$inferInsert;

/**
 * Fixes Applied - Track automated fixes applied to websites
 */
export const altTextFixes = mysqlTable("alttext_fixes", {
  id: int("id").autoincrement().primaryKey(),
  scanId: int("scan_id").notNull(),
  imageAnalysisId: int("image_analysis_id").notNull(),
  fixType: mysqlEnum("fix_type", ["add_alt", "update_alt", "add_aria_label", "mark_decorative"]).notNull(),
  beforeValue: text("before_value"),
  afterValue: text("after_value").notNull(),
  method: mysqlEnum("method", ["api", "manual", "plugin", "script"]).notNull(),
  appliedBy: int("applied_by"),
  status: mysqlEnum("status", ["pending", "applied", "failed", "reverted"]).notNull().default("pending"),
  errorMessage: text("error_message"),
  appliedAt: timestamp("applied_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AltTextFix = typeof altTextFixes.$inferSelect;
export type InsertAltTextFix = typeof altTextFixes.$inferInsert;

/**
 * Compliance Reports - Generated reports for customers
 */
export const altTextReports = mysqlTable("alttext_reports", {
  id: int("id").autoincrement().primaryKey(),
  scanId: int("scan_id").notNull(),
  userId: int("user_id").notNull(),
  reportType: mysqlEnum("report_type", ["summary", "detailed", "executive", "technical"]).notNull().default("summary"),
  format: mysqlEnum("format", ["pdf", "html", "json"]).notNull().default("pdf"),
  summary: text("summary").notNull(),
  violations: text("violations").notNull(),
  recommendations: text("recommendations").notNull(),
  estimatedLawsuitRisk: decimal("estimated_lawsuit_risk", { precision: 10, scale: 2 }),
  estimatedCostSavings: decimal("estimated_cost_savings", { precision: 10, scale: 2 }),
  roiPercentage: decimal("roi_percentage", { precision: 10, scale: 2 }),
  fileUrl: varchar("file_url", { length: 500 }),
  fileSize: int("file_size"),
  status: mysqlEnum("status", ["generating", "completed", "failed"]).notNull().default("generating"),
  generatedAt: timestamp("generated_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AltTextReport = typeof altTextReports.$inferSelect;
export type InsertAltTextReport = typeof altTextReports.$inferInsert;

/**
 * API Keys - Customer API keys for programmatic access
 */
export const altTextApiKeys = mysqlTable("alttext_api_keys", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  keyName: varchar("key_name", { length: 255 }).notNull(),
  keyHash: varchar("key_hash", { length: 255 }).notNull().unique(),
  keyPrefix: varchar("key_prefix", { length: 20 }).notNull(),
  permissions: text("permissions").notNull(),
  rateLimit: int("rate_limit").notNull().default(100),
  requestsThisHour: int("requests_this_hour").notNull().default(0),
  lastRequestAt: timestamp("last_request_at"),
  status: mysqlEnum("status", ["active", "revoked", "expired"]).notNull().default("active"),
  expiresAt: timestamp("expires_at"),
  revokedAt: timestamp("revoked_at"),
  revokedReason: text("revoked_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUsedAt: timestamp("last_used_at"),
});

export type AltTextApiKey = typeof altTextApiKeys.$inferSelect;
export type InsertAltTextApiKey = typeof altTextApiKeys.$inferInsert;

/**
 * API Usage Logs - Track API usage for billing and analytics
 */
export const altTextApiLogs = mysqlTable("alttext_api_logs", {
  id: int("id").autoincrement().primaryKey(),
  apiKeyId: int("api_key_id").notNull(),
  userId: int("user_id").notNull(),
  endpoint: varchar("endpoint", { length: 255 }).notNull(),
  method: varchar("method", { length: 10 }).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  statusCode: int("status_code").notNull(),
  responseTime: int("response_time").notNull(),
  errorMessage: text("error_message"),
  imagesProcessed: int("images_processed").notNull().default(0),
  pagesScanned: int("pages_scanned").notNull().default(0),
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
});

export type AltTextApiLog = typeof altTextApiLogs.$inferSelect;
export type InsertAltTextApiLog = typeof altTextApiLogs.$inferInsert;

/**
 * Webhooks - Customer webhook endpoints for notifications
 */
export const altTextWebhooks = mysqlTable("alttext_webhooks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  secret: varchar("secret", { length: 255 }).notNull(),
  events: text("events").notNull(),
  status: mysqlEnum("status", ["active", "disabled", "failed"]).notNull().default("active"),
  failureCount: int("failure_count").notNull().default(0),
  lastFailureAt: timestamp("last_failure_at"),
  lastSuccessAt: timestamp("last_success_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type AltTextWebhook = typeof altTextWebhooks.$inferSelect;
export type InsertAltTextWebhook = typeof altTextWebhooks.$inferInsert;
