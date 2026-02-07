import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";

/**
 * Universal Branding API - Database Schema
 * 
 * This schema supports the Universal Branding API with demographic targeting,
 * color psychology, graphics generation, domain scoring, and affiliate tracking.
 */

// ============================================================================
// BRANDING PROJECTS
// ============================================================================

export const brandingProjects = sqliteTable("branding_projects", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id").notNull(),
  projectName: text("project_name").notNull(),
  industry: text("industry").notNull(),
  targetDemographic: text("target_demographic").notNull(), // JSON: {ageGroups: [], genders: []}
  brandValues: text("brand_values"), // JSON array
  colorPreferences: text("color_preferences"), // JSON array
  status: text("status").notNull().default("draft"), // draft, in_progress, completed
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ============================================================================
// DEMOGRAPHIC PREFERENCES DATABASE
// ============================================================================

export const demographicPreferences = sqliteTable("demographic_preferences", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  ageGroup: text("age_group").notNull(), // gen_z, millennial, gen_x, baby_boomer
  gender: text("gender"), // male, female, non_binary, all
  preferredColors: text("preferred_colors").notNull(), // JSON array
  avoidColors: text("avoid_colors"), // JSON array
  designStyle: text("design_style").notNull(), // minimalist, maximalist, classic, modern
  uiPreferences: text("ui_preferences").notNull(), // JSON: {fontSizes, spacing, complexity}
  colorPsychology: text("color_psychology"), // JSON: emotional associations
  trendScore: real("trend_score").notNull().default(0.5), // 0-1, how trendy
  source: text("source").notNull(), // research_paper, survey, industry_report
  confidence: real("confidence").notNull().default(0.8), // 0-1, data confidence
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ============================================================================
// COLOR PSYCHOLOGY DATABASE
// ============================================================================

export const colorPsychology = sqliteTable("color_psychology", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  colorHex: text("color_hex").notNull().unique(),
  colorName: text("color_name").notNull(),
  emotionalAssociations: text("emotional_associations").notNull(), // JSON array
  industries: text("industries").notNull(), // JSON array of suitable industries
  avoidIndustries: text("avoid_industries"), // JSON array
  culturalContext: text("cultural_context"), // JSON: different meanings by culture
  trendStatus: text("trend_status").notNull(), // hot, trending, stable, declining, not_hot
  trendYear: integer("trend_year").notNull(), // Year of trend status
  genderAppeal: text("gender_appeal"), // JSON: {male: 0.7, female: 0.9}
  ageGroupAppeal: text("age_group_appeal"), // JSON: {gen_z: 0.9, millennial: 0.6}
  accessibilityScore: real("accessibility_score"), // WCAG contrast ratio
  source: text("source").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ============================================================================
// GENERATED ASSETS
// ============================================================================

export const generatedAssets = sqliteTable("generated_assets", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  projectId: text("project_id").notNull(),
  assetType: text("asset_type").notNull(), // logo, favicon, infographic, video, color_palette
  assetUrl: text("asset_url").notNull(),
  assetMetadata: text("asset_metadata"), // JSON: dimensions, format, file_size
  generationTool: text("generation_tool").notNull(), // canva, looka, piktochart, animaker
  generationPrompt: text("generation_prompt"),
  altText: text("alt_text"), // Auto-generated alt text for accessibility
  affiliateLink: text("affiliate_link"), // If user wants to edit with original tool
  downloadCount: integer("download_count").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ============================================================================
// DOMAIN ANALYSIS
// ============================================================================

export const domainAnalysis = sqliteTable("domain_analysis", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  projectId: text("project_id"),
  domainName: text("domain_name").notNull().unique(),
  extension: text("extension").notNull(), // .com, .io, .ai, etc.
  isAvailable: integer("is_available", { mode: "boolean" }).notNull(),
  
  // SEO Scoring (weighted)
  keywordRelevanceScore: real("keyword_relevance_score").notNull(), // 0-100
  extensionScore: real("extension_score").notNull(), // 0-100
  lengthScore: real("length_score").notNull(), // 0-100
  brandabilityScore: real("brandability_score").notNull(), // 0-100
  seoHistoryScore: real("seo_history_score").notNull(), // 0-100
  technicalScore: real("technical_score").notNull(), // 0-100
  overallScore: real("overall_score").notNull(), // Weighted average
  
  // Detailed SEO Data
  searchVolume: integer("search_volume"), // Monthly searches for keywords
  domainAge: integer("domain_age"), // Years
  backlinkCount: integer("backlink_count"),
  domainAuthority: integer("domain_authority"), // Moz DA
  spamScore: real("spam_score"), // 0-100
  
  // Availability
  socialHandlesAvailable: text("social_handles_available"), // JSON: {twitter: true, instagram: false}
  trademarkStatus: text("trademark_status"), // available, taken, pending
  
  // Recommendations
  recommendations: text("recommendations"), // JSON array of suggestions
  alternativeDomains: text("alternative_domains"), // JSON array
  
  analyzedAt: integer("analyzed_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ============================================================================
// AFFILIATE TRACKING
// ============================================================================

export const affiliateLinks = sqliteTable("affiliate_links", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  toolName: text("tool_name").notNull(), // canva, ahrefs, semrush, etc.
  toolCategory: text("tool_category").notNull(), // graphics, seo, analytics
  affiliateUrl: text("affiliate_url").notNull(),
  commissionRate: real("commission_rate"), // Percentage or flat amount
  commissionType: text("commission_type").notNull(), // recurring, one_time, per_sale
  clickCount: integer("click_count").notNull().default(0),
  conversionCount: integer("conversion_count").notNull().default(0),
  totalEarnings: real("total_earnings").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const affiliateClicks = sqliteTable("affiliate_clicks", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  affiliateLinkId: text("affiliate_link_id").notNull(),
  userId: text("user_id"),
  projectId: text("project_id"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  converted: integer("converted", { mode: "boolean" }).notNull().default(false),
  conversionValue: real("conversion_value"),
  clickedAt: integer("clicked_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  convertedAt: integer("converted_at", { mode: "timestamp" }),
});

// ============================================================================
// BRANDING RECOMMENDATIONS
// ============================================================================

export const brandingRecommendations = sqliteTable("branding_recommendations", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  projectId: text("project_id").notNull(),
  recommendationType: text("recommendation_type").notNull(), // color_palette, logo_style, domain, typography
  recommendation: text("recommendation").notNull(), // JSON with detailed recommendation
  reasoning: text("reasoning").notNull(), // Why this recommendation
  llmModel: text("llm_model"), // Which LLM generated this (gpt-4, claude, etc.)
  confidence: real("confidence").notNull(), // 0-1
  demographicAlignment: text("demographic_alignment"), // JSON: how well it matches target demo
  trendAlignment: real("trend_alignment"), // 0-1, how trendy
  userFeedback: text("user_feedback"), // liked, disliked, neutral
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ============================================================================
// ALT TEXT GENERATION LOG
// ============================================================================

export const altTextGeneration = sqliteTable("alt_text_generation", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  imageUrl: text("image_url").notNull(),
  generatedAltText: text("generated_alt_text").notNull(),
  generationTool: text("generation_tool").notNull(), // azure_vision, google_cloud, ibm_watson
  wcagCompliant: integer("wcag_compliant", { mode: "boolean" }).notNull(),
  characterCount: integer("character_count").notNull(),
  keywords: text("keywords"), // JSON array of detected keywords
  confidence: real("confidence"), // 0-1
  userEdited: integer("user_edited", { mode: "boolean" }).notNull().default(false),
  finalAltText: text("final_alt_text"), // After user edits
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ============================================================================
// API USAGE TRACKING
// ============================================================================

export const brandingApiUsage = sqliteTable("branding_api_usage", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id").notNull(),
  endpoint: text("endpoint").notNull(), // /api/branding/logo/generate, etc.
  requestData: text("request_data"), // JSON of request parameters
  responseStatus: integer("response_status").notNull(),
  processingTime: integer("processing_time"), // milliseconds
  creditsUsed: integer("credits_used").notNull().default(1),
  errorMessage: text("error_message"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
