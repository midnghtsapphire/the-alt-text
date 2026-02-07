/**
 * Inventor Module Database Schema
 * 
 * For biocomposite/biopolymer product design, feasibility analysis,
 * patent management, BOM generation, and automated research notifications.
 */

import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";

// ============================================================================
// INVENTIONS & PRODUCTS
// ============================================================================

/**
 * Inventions - Core invention records
 */
export const inventions = sqliteTable("inventions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // e.g., "dishwasher", "packaging", "furniture", "medical_device"
  status: text("status").notNull(), // concept, design, prototype, testing, production, patented
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  userIdIdx: index("inventions_user_id_idx").on(table.userId),
  statusIdx: index("inventions_status_idx").on(table.status),
  categoryIdx: index("inventions_category_idx").on(table.category),
}));

/**
 * Product Designs - 3D models and design specifications
 */
export const productDesigns = sqliteTable("product_designs", {
  id: text("id").primaryKey(),
  inventionId: text("invention_id").notNull(),
  version: text("version").notNull(), // e.g., "v1.0", "v2.3"
  designFileUrl: text("design_file_url"), // S3 URL to STL/OBJ/CAD file
  thumbnailUrl: text("thumbnail_url"), // S3 URL to preview image
  dimensions: text("dimensions"), // JSON: { length, width, height, unit }
  weight: real("weight"), // in grams
  volume: real("volume"), // in cm³
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  inventionIdIdx: index("product_designs_invention_id_idx").on(table.inventionId),
}));

// ============================================================================
// MATERIALS & BIOCOMPOSITES
// ============================================================================

/**
 * Materials Library - Biocomposites, biopolymers, natural products
 */
export const materials = sqliteTable("materials", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // biocomposite, biopolymer, natural_fiber, reinforcement, additive
  source: text("source"), // e.g., "taro", "kui kui", "basalt", "hemp", "bamboo"
  supplier: text("supplier"),
  costPerKg: real("cost_per_kg"),
  properties: text("properties"), // JSON: { tensile_strength, flexural_modulus, density, etc. }
  biodegradable: integer("biodegradable", { mode: "boolean" }),
  compostable: integer("compostable", { mode: "boolean" }),
  recyclable: integer("recyclable", { mode: "boolean" }),
  sustainabilityScore: real("sustainability_score"), // 0-100
  dataSheetUrl: text("data_sheet_url"), // S3 URL to technical data sheet
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  typeIdx: index("materials_type_idx").on(table.type),
  sourceIdx: index("materials_source_idx").on(table.source),
}));

/**
 * Material Combinations - Recipes for biocomposite formulations
 */
export const materialCombinations = sqliteTable("material_combinations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(), // e.g., "Taro-Basalt Composite"
  description: text("description"),
  materials: text("materials"), // JSON: [{ materialId, percentage, role }]
  properties: text("properties"), // JSON: predicted/tested properties
  processingTemp: real("processing_temp"), // °C
  processingPressure: real("processing_pressure"), // MPa
  curingTime: integer("curing_time"), // minutes
  tested: integer("tested", { mode: "boolean" }),
  testResults: text("test_results"), // JSON: test data
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  nameIdx: index("material_combinations_name_idx").on(table.name),
}));

/**
 * Invention Materials - Materials used in each invention
 */
export const inventionMaterials = sqliteTable("invention_materials", {
  id: text("id").primaryKey(),
  inventionId: text("invention_id").notNull(),
  materialId: text("material_id"),
  combinationId: text("combination_id"),
  quantity: real("quantity"), // in kg or units
  purpose: text("purpose"), // e.g., "structural", "surface_finish", "reinforcement"
  notes: text("notes"),
}, (table) => ({
  inventionIdIdx: index("invention_materials_invention_id_idx").on(table.inventionId),
  materialIdIdx: index("invention_materials_material_id_idx").on(table.materialId),
}));

// ============================================================================
// 3D PRINTING & FILAMENTS
// ============================================================================

/**
 * Filaments - 3D printing filaments (commercial and custom)
 */
export const filaments = sqliteTable("filaments", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // PLA, ABS, PETG, TPU, custom_biocomposite
  materialId: text("material_id"), // Link to materials table if custom
  manufacturer: text("manufacturer"),
  diameter: real("diameter"), // 1.75mm or 2.85mm
  printTemp: real("print_temp"), // °C
  bedTemp: real("bed_temp"), // °C
  printSpeed: real("print_speed"), // mm/s
  properties: text("properties"), // JSON: mechanical properties
  costPerKg: real("cost_per_kg"),
  availability: text("availability"), // commercial, custom, experimental
  dataSheetUrl: text("data_sheet_url"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  typeIdx: index("filaments_type_idx").on(table.type),
  manufacturerIdx: index("filaments_manufacturer_idx").on(table.manufacturer),
}));

/**
 * Filament Development - Custom filament R&D tracking
 */
export const filamentDevelopment = sqliteTable("filament_development", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  combinationId: text("combination_id").notNull(),
  version: text("version").notNull(),
  status: text("status").notNull(), // concept, formulation, extrusion, testing, production
  formulation: text("formulation"), // JSON: detailed recipe
  extrusionParams: text("extrusion_params"), // JSON: temperature, speed, etc.
  testResults: text("test_results"), // JSON: mechanical tests, print tests
  issues: text("issues"), // JSON: problems encountered
  solutions: text("solutions"), // JSON: solutions implemented
  nextSteps: text("next_steps"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  statusIdx: index("filament_development_status_idx").on(table.status),
}));

// ============================================================================
// BILL OF MATERIALS (BOM)
// ============================================================================

/**
 * BOMs - Bill of Materials for each invention
 */
export const boms = sqliteTable("boms", {
  id: text("id").primaryKey(),
  inventionId: text("invention_id").notNull(),
  version: text("version").notNull(),
  status: text("status").notNull(), // draft, approved, production
  totalCost: real("total_cost"),
  currency: text("currency").default("USD"),
  generatedBy: text("generated_by"), // "oz" or userId
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  inventionIdIdx: index("boms_invention_id_idx").on(table.inventionId),
}));

/**
 * BOM Items - Individual items in a BOM
 */
export const bomItems = sqliteTable("bom_items", {
  id: text("id").primaryKey(),
  bomId: text("bom_id").notNull(),
  itemType: text("item_type").notNull(), // material, component, hardware, tool, labor
  itemId: text("item_id"), // materialId, filamentId, etc.
  name: text("name").notNull(),
  description: text("description"),
  quantity: real("quantity").notNull(),
  unit: text("unit").notNull(), // kg, pcs, hours, etc.
  unitCost: real("unit_cost"),
  totalCost: real("total_cost"),
  supplier: text("supplier"),
  leadTime: integer("lead_time"), // days
  notes: text("notes"),
}, (table) => ({
  bomIdIdx: index("bom_items_bom_id_idx").on(table.bomId),
}));

// ============================================================================
// FEASIBILITY ANALYSIS
// ============================================================================

/**
 * Feasibility Studies - OZ-powered feasibility analysis
 */
export const feasibilityStudies = sqliteTable("feasibility_studies", {
  id: text("id").primaryKey(),
  inventionId: text("invention_id").notNull(),
  version: text("version").notNull(),
  analysisType: text("analysis_type").notNull(), // material, structural, manufacturing, market, financial
  llmModel: text("llm_model"), // e.g., "claude-3.7-sonnet"
  prompt: text("prompt"),
  analysis: text("analysis"), // Full analysis text
  feasibilityScore: real("feasibility_score"), // 0-100
  risks: text("risks"), // JSON: array of risks
  recommendations: text("recommendations"), // JSON: array of recommendations
  scientificReferences: text("scientific_references"), // JSON: array of DOI/SSRN links
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  inventionIdIdx: index("feasibility_studies_invention_id_idx").on(table.inventionId),
  analysisTypeIdx: index("feasibility_studies_analysis_type_idx").on(table.analysisType),
}));

/**
 * Scientific Studies - Cached scientific research papers
 */
export const scientificStudies = sqliteTable("scientific_studies", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  authors: text("authors"),
  journal: text("journal"),
  year: integer("year"),
  doi: text("doi"),
  ssrnId: text("ssrn_id"),
  url: text("url"),
  abstract: text("abstract"),
  keywords: text("keywords"), // JSON: array
  relevantMaterials: text("relevant_materials"), // JSON: array of material names
  findings: text("findings"), // Summary of key findings
  pdfUrl: text("pdf_url"), // S3 URL if downloaded
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  doiIdx: index("scientific_studies_doi_idx").on(table.doi),
  yearIdx: index("scientific_studies_year_idx").on(table.year),
}));

// ============================================================================
// PATENTS
// ============================================================================

/**
 * Patents - Patent records (filed, pending, granted, or prior art)
 */
export const patents = sqliteTable("patents", {
  id: text("id").primaryKey(),
  inventionId: text("invention_id"), // null if prior art
  patentNumber: text("patent_number"),
  applicationNumber: text("application_number"),
  title: text("title").notNull(),
  abstract: text("abstract"),
  inventors: text("inventors"), // JSON: array
  assignee: text("assignee"),
  filingDate: integer("filing_date", { mode: "timestamp" }),
  grantDate: integer("grant_date", { mode: "timestamp" }),
  status: text("status").notNull(), // concept, filed, pending, granted, expired, abandoned, prior_art
  jurisdiction: text("jurisdiction"), // US, EP, WO, etc.
  patentOfficeUrl: text("patent_office_url"), // USPTO, Espacenet, etc.
  pdfUrl: text("pdf_url"), // S3 URL
  claims: text("claims"), // JSON: array of claims
  classifications: text("classifications"), // JSON: IPC/CPC codes
  priorArt: text("prior_art"), // JSON: array of related patents
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  inventionIdIdx: index("patents_invention_id_idx").on(table.inventionId),
  statusIdx: index("patents_status_idx").on(table.status),
  patentNumberIdx: index("patents_patent_number_idx").on(table.patentNumber),
}));

/**
 * Patent Searches - Saved patent search results
 */
export const patentSearches = sqliteTable("patent_searches", {
  id: text("id").primaryKey(),
  inventionId: text("invention_id"),
  query: text("query").notNull(),
  database: text("database").notNull(), // USPTO, Google Patents, Espacenet, WIPO
  results: text("results"), // JSON: array of patent IDs
  totalResults: integer("total_results"),
  searchDate: integer("search_date", { mode: "timestamp" }).notNull(),
}, (table) => ({
  inventionIdIdx: index("patent_searches_invention_id_idx").on(table.inventionId),
}));

// ============================================================================
// GITHUB BACKUP
// ============================================================================

/**
 * GitHub Backups - Track GitHub backups of patent/invention data
 */
export const githubBackups = sqliteTable("github_backups", {
  id: text("id").primaryKey(),
  inventionId: text("invention_id"),
  repository: text("repository").notNull(), // e.g., "username/repo"
  branch: text("branch").default("main"),
  commitHash: text("commit_hash"),
  backupType: text("backup_type").notNull(), // patent, design, bom, feasibility, all
  filesPushed: text("files_pushed"), // JSON: array of file paths
  backupDate: integer("backup_date", { mode: "timestamp" }).notNull(),
  status: text("status").notNull(), // success, failed, pending
  errorMessage: text("error_message"),
}, (table) => ({
  inventionIdIdx: index("github_backups_invention_id_idx").on(table.inventionId),
  backupDateIdx: index("github_backups_backup_date_idx").on(table.backupDate),
}));

// ============================================================================
// NOTIFICATIONS & AUTOMATION
// ============================================================================

/**
 * Research Alerts - Automated notifications for new research
 */
export const researchAlerts = sqliteTable("research_alerts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  alertType: text("alert_type").notNull(), // new_study, new_patent, new_material, new_filament
  keywords: text("keywords"), // JSON: array
  materials: text("materials"), // JSON: array of material names
  frequency: text("frequency").notNull(), // daily, weekly, monthly
  lastChecked: integer("last_checked", { mode: "timestamp" }),
  lastSent: integer("last_sent", { mode: "timestamp" }),
  active: integer("active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  userIdIdx: index("research_alerts_user_id_idx").on(table.userId),
  alertTypeIdx: index("research_alerts_alert_type_idx").on(table.alertType),
}));

/**
 * Partnership Opportunities - Potential partners for collaboration
 */
export const partnershipOpportunities = sqliteTable("partnership_opportunities", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // supplier, manufacturer, researcher, university, investor
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  website: text("website"),
  expertise: text("expertise"), // JSON: array
  materials: text("materials"), // JSON: materials they work with
  status: text("status").notNull(), // identified, contacted, in_discussion, partnered, declined
  notes: text("notes"),
  lastContactDate: integer("last_contact_date", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  typeIdx: index("partnership_opportunities_type_idx").on(table.type),
  statusIdx: index("partnership_opportunities_status_idx").on(table.status),
}));

/**
 * Automated Emails - Email automation log
 */
export const automatedEmails = sqliteTable("automated_emails", {
  id: text("id").primaryKey(),
  recipientType: text("recipient_type").notNull(), // partner, researcher, supplier, investor
  recipientId: text("recipient_id"), // partnershipOpportunityId
  recipientEmail: text("recipient_email").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  purpose: text("purpose").notNull(), // introduction, follow_up, collaboration_request, update
  sentAt: integer("sent_at", { mode: "timestamp" }),
  status: text("status").notNull(), // draft, scheduled, sent, failed, bounced, replied
  replyReceived: integer("reply_received", { mode: "boolean" }).default(false),
  replyDate: integer("reply_date", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  recipientEmailIdx: index("automated_emails_recipient_email_idx").on(table.recipientEmail),
  statusIdx: index("automated_emails_status_idx").on(table.status),
}));

// ============================================================================
// EXPERT CONSULTATIONS (OZ AGENTS)
// ============================================================================

/**
 * Expert Consultations - OZ expert agent consultations
 */
export const expertConsultations = sqliteTable("expert_consultations", {
  id: text("id").primaryKey(),
  inventionId: text("invention_id").notNull(),
  expertType: text("expert_type").notNull(), // materials, tooling, 3d_printing, robotics, patents
  llmModel: text("llm_model"), // e.g., "claude-3.7-sonnet"
  question: text("question").notNull(),
  response: text("response").notNull(),
  references: text("references"), // JSON: array of sources
  confidence: real("confidence"), // 0-1
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  inventionIdIdx: index("expert_consultations_invention_id_idx").on(table.inventionId),
  expertTypeIdx: index("expert_consultations_expert_type_idx").on(table.expertType),
}));

// ============================================================================
// PATENT FILING & JOURNAL SUBMISSIONS
// ============================================================================

/**
 * Patent Filings - Track USPTO/international patent filing submissions
 */
export const patentFilings = sqliteTable("patent_filings", {
  id: text("id").primaryKey(),
  patentId: text("patent_id").notNull(),
  filingMethod: text("filing_method").notNull(), // api, ftp, edi, manual
  filingOffice: text("filing_office").notNull(), // USPTO, EPO, WIPO, etc.
  confirmationNumber: text("confirmation_number"),
  filingDate: integer("filing_date", { mode: "timestamp" }).notNull(),
  status: text("status").notNull(), // pending, submitted, acknowledged, rejected, error
  responseData: text("response_data"), // JSON: API/EDI response
  errorMessage: text("error_message"),
  filedBy: text("filed_by"), // userId or "oz"
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  patentIdIdx: index("patent_filings_patent_id_idx").on(table.patentId),
  statusIdx: index("patent_filings_status_idx").on(table.status),
}));

/**
 * Journal Submissions - Track submissions to SSRN, arXiv, ResearchGate, etc.
 */
export const journalSubmissions = sqliteTable("journal_submissions", {
  id: text("id").primaryKey(),
  inventionId: text("invention_id"),
  studyId: text("study_id"), // scientificStudies.id
  journalPlatform: text("journal_platform").notNull(), // ssrn, arxiv, researchgate, zenodo, etc.
  title: text("title").notNull(),
  abstract: text("abstract").notNull(),
  authors: text("authors"), // JSON: array of authors
  keywords: text("keywords"), // JSON: array
  category: text("category"), // Journal-specific category/subject
  manuscriptUrl: text("manuscript_url"), // S3 URL to PDF
  submissionMethod: text("submission_method").notNull(), // api, email, web_form
  submissionId: text("submission_id"), // Platform-specific submission ID
  submittedAt: integer("submitted_at", { mode: "timestamp" }),
  status: text("status").notNull(), // draft, pending, submitted, published, rejected, error
  publicUrl: text("public_url"), // URL to published paper
  doi: text("doi"), // Assigned DOI if published
  responseData: text("response_data"), // JSON: API response
  errorMessage: text("error_message"),
  submittedBy: text("submitted_by"), // userId or "oz"
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  inventionIdIdx: index("journal_submissions_invention_id_idx").on(table.inventionId),
  platformIdx: index("journal_submissions_platform_idx").on(table.journalPlatform),
  statusIdx: index("journal_submissions_status_idx").on(table.status),
}));

/**
 * Patent Wizard Progress - Track patent creation wizard progress
 */
export const patentWizardProgress = sqliteTable("patent_wizard_progress", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  inventionId: text("invention_id").notNull(),
  currentStep: integer("current_step").notNull(), // 1-10
  totalSteps: integer("total_steps").default(10),
  stepData: text("step_data"), // JSON: data for each step
  draftPatentId: text("draft_patent_id"), // patents.id when draft created
  completed: integer("completed", { mode: "boolean" }).default(false),
  lastUpdated: integer("last_updated", { mode: "timestamp" }).notNull(),
}, (table) => ({
  userIdIdx: index("patent_wizard_progress_user_id_idx").on(table.userId),
  inventionIdIdx: index("patent_wizard_progress_invention_id_idx").on(table.inventionId),
}));

/**
 * Summary:
 * - 20 tables for comprehensive inventor module
 * - Biocomposite/biopolymer material management
 * - 3D printing filament development tracking
 * - BOM generation and cost tracking
 * - Feasibility analysis with scientific studies
 * - Patent search and storage with GitHub backup
 * - Patent filing integration (USPTO API/FTP/EDI)
 * - Journal auto-submission (SSRN, arXiv, ResearchGate)
 * - Patent creation wizard with progress tracking
 * - Automated research alerts and partnership notifications
 * - OZ expert agent consultations
 */
