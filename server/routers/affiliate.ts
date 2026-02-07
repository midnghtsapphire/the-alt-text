import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
// Generate unique IDs
function createId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Universal Affiliate Relationship API
 * 
 * Supports multi-entity affiliate relationships with automatic link generation:
 * - Entity Types: Person, Business, Agency, Non-Profit, Service Provider
 * - Relationship Types: One-to-one, one-to-many, many-to-many, embedded
 * - Automatic affiliate link generation with unique tracking codes
 * - Commission tracking and payout management
 */

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate unique affiliate code (e.g., "AFF-JOHN-ABC123")
 */
function generateAffiliateCode(name: string): string {
  const cleanName = name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 10);
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `AFF-${cleanName}-${randomSuffix}`;
}

/**
 * Generate short tracking code for links (e.g., "abc123")
 */
function generateShortCode(): string {
  return Math.random().toString(36).substring(2, 8);
}

/**
 * Build affiliate URL with tracking parameters
 */
function buildAffiliateUrl(
  originalUrl: string,
  shortCode: string,
  utmParams?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
  }
): string {
  const url = new URL(originalUrl);
  
  // Add affiliate tracking parameter
  url.searchParams.set("ref", shortCode);
  
  // Add UTM parameters if provided
  if (utmParams) {
    if (utmParams.source) url.searchParams.set("utm_source", utmParams.source);
    if (utmParams.medium) url.searchParams.set("utm_medium", utmParams.medium);
    if (utmParams.campaign) url.searchParams.set("utm_campaign", utmParams.campaign);
    if (utmParams.content) url.searchParams.set("utm_content", utmParams.content);
    if (utmParams.term) url.searchParams.set("utm_term", utmParams.term);
  }
  
  return url.toString();
}

// ============================================================================
// AFFILIATE API ROUTER
// ============================================================================

export const affiliateRouter = router({
  // ============================================================================
  // ENTITY MANAGEMENT
  // ============================================================================

  /**
   * Register a new affiliate entity (auto-creates entity + generates affiliate code)
   */
  registerEntity: protectedProcedure
    .input(z.object({
      entityType: z.enum(["person", "business", "agency", "non_profit", "service_provider"]),
      name: z.string().min(1),
      email: z.string().email(),
      phone: z.string().optional(),
      website: z.string().url().optional(),
      businessName: z.string().optional(),
      businessType: z.enum(["llc", "corporation", "sole_proprietor", "partnership", "non_profit"]).optional(),
      taxId: z.string().optional(),
      address: z.object({
        street: z.string(),
        city: z.string(),
        state: z.string(),
        zip: z.string(),
        country: z.string(),
      }).optional(),
      paymentMethod: z.enum(["stripe", "paypal", "ach", "check"]).optional(),
      defaultCommissionRate: z.number().min(0).max(100).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Generate unique affiliate code
        const affiliateCode = generateAffiliateCode(input.name);
        
        // TODO: Save to database
        // const entity = await db.affiliateEntities.insert({...});
        
        // Auto-approve if user is admin, otherwise pending
        const status = ctx.user?.role === "admin" ? "active" : "pending";
        
        return {
          entityId: createId(),
          affiliateCode,
          status,
          message: status === "active" 
            ? "Affiliate entity registered and approved!" 
            : "Affiliate entity registered. Pending approval.",
        };
      } catch (error) {
        console.error("Entity registration error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to register affiliate entity",
        });
      }
    }),

  /**
   * Get entity details
   */
  getEntity: protectedProcedure
    .input(z.object({
      entityId: z.string().optional(),
      affiliateCode: z.string().optional(),
    }))
    .query(async ({ input }) => {
      if (!input.entityId && !input.affiliateCode) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Either entityId or affiliateCode is required",
        });
      }
      
      // TODO: Fetch from database
      return {
        entityId: input.entityId || "mock_id",
        affiliateCode: input.affiliateCode || "AFF-MOCK-123456",
        entityType: "business",
        name: "Mock Business",
        email: "mock@example.com",
        status: "active",
        totalEarnings: 1250.50,
        pendingEarnings: 350.00,
        totalClicks: 1523,
        totalConversions: 45,
      };
    }),

  /**
   * List all entities (admin only)
   */
  listEntities: protectedProcedure
    .input(z.object({
      entityType: z.enum(["person", "business", "agency", "non_profit", "service_provider", "all"]).optional(),
      status: z.enum(["pending", "active", "suspended", "terminated", "all"]).optional(),
      limit: z.number().min(1).max(100).optional(),
      offset: z.number().min(0).optional(),
    }))
    .query(async ({ input, ctx }) => {
      // TODO: Check if user is admin
      // TODO: Fetch from database with filters
      
      return {
        entities: [],
        total: 0,
        limit: input.limit || 20,
        offset: input.offset || 0,
      };
    }),

  // ============================================================================
  // RELATIONSHIP MANAGEMENT
  // ============================================================================

  /**
   * Create affiliate relationship (auto-creates relationship + generates links)
   */
  createRelationship: protectedProcedure
    .input(z.object({
      sourceEntityId: z.string(), // The affiliate/referrer
      targetEntityId: z.string().optional(), // The referred entity (optional)
      relationshipType: z.enum(["one_to_one", "one_to_many", "many_to_many", "embedded"]),
      contextType: z.enum(["product", "service", "referral", "partnership", "embedded_link"]),
      contextId: z.string().optional(),
      customCommissionRate: z.number().min(0).max(100).optional(),
      autoGenerateLinks: z.boolean().optional().default(true),
    }))
    .mutation(async ({ input }) => {
      try {
        const relationshipId = createId();
        
        // TODO: Save relationship to database
        
        // Auto-generate affiliate links if requested
        const links = [];
        if (input.autoGenerateLinks) {
          // Generate primary affiliate link
          const shortCode = generateShortCode();
          const affiliateUrl = buildAffiliateUrl(
            "https://example.com/product", // TODO: Get from contextId
            shortCode,
            {
              source: "affiliate",
              medium: "referral",
              campaign: relationshipId,
            }
          );
          
          links.push({
            linkId: createId(),
            shortCode,
            affiliateUrl,
            linkType: "standalone",
          });
        }
        
        return {
          relationshipId,
          status: "active",
          links,
          message: "Affiliate relationship created successfully!",
        };
      } catch (error) {
        console.error("Relationship creation error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create affiliate relationship",
        });
      }
    }),

  /**
   * Get relationships for an entity
   */
  getRelationships: protectedProcedure
    .input(z.object({
      entityId: z.string(),
      relationshipType: z.enum(["one_to_one", "one_to_many", "many_to_many", "embedded", "all"]).optional(),
      status: z.enum(["active", "paused", "terminated", "all"]).optional(),
    }))
    .query(async ({ input }) => {
      // TODO: Fetch from database
      return {
        relationships: [],
        total: 0,
      };
    }),

  // ============================================================================
  // AFFILIATE LINK GENERATION
  // ============================================================================

  /**
   * Generate affiliate link (standalone or embedded)
   */
  generateLink: protectedProcedure
    .input(z.object({
      entityId: z.string(),
      originalUrl: z.string().url(),
      linkType: z.enum(["embedded", "standalone", "qr_code", "deep_link"]),
      embeddedIn: z.string().optional(), // website_url, app_name, etc.
      utmParams: z.object({
        source: z.string().optional(),
        medium: z.string().optional(),
        campaign: z.string().optional(),
        content: z.string().optional(),
        term: z.string().optional(),
      }).optional(),
      expiresInDays: z.number().min(1).max(365).optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const shortCode = generateShortCode();
        const affiliateUrl = buildAffiliateUrl(input.originalUrl, shortCode, input.utmParams);
        const linkId = createId();
        
        // Calculate expiration
        const expiresAt = input.expiresInDays 
          ? new Date(Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000)
          : null;
        
        // TODO: Save to database
        
        return {
          linkId,
          affiliateUrl,
          shortCode,
          linkType: input.linkType,
          expiresAt,
          qrCodeUrl: input.linkType === "qr_code" ? `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(affiliateUrl)}&size=300x300` : undefined,
        };
      } catch (error) {
        console.error("Link generation error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate affiliate link",
        });
      }
    }),

  /**
   * Bulk generate affiliate links (for embedding in website/app)
   */
  bulkGenerateLinks: protectedProcedure
    .input(z.object({
      entityId: z.string(),
      urls: z.array(z.string().url()).min(1).max(100),
      linkType: z.enum(["embedded", "standalone"]),
      embeddedIn: z.string().optional(),
      utmCampaign: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const links = input.urls.map(url => {
          const shortCode = generateShortCode();
          const affiliateUrl = buildAffiliateUrl(url, shortCode, {
            source: "affiliate",
            medium: input.linkType,
            campaign: input.utmCampaign || "bulk_generation",
          });
          
          return {
            linkId: createId(),
            originalUrl: url,
            affiliateUrl,
            shortCode,
            linkType: input.linkType,
          };
        });
        
        // TODO: Bulk save to database
        
        return {
          links,
          total: links.length,
          message: `Generated ${links.length} affiliate links successfully!`,
        };
      } catch (error) {
        console.error("Bulk link generation error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate affiliate links",
        });
      }
    }),

  /**
   * Get links for an entity
   */
  getLinks: protectedProcedure
    .input(z.object({
      entityId: z.string(),
      linkType: z.enum(["embedded", "standalone", "qr_code", "deep_link", "all"]).optional(),
      isActive: z.boolean().optional(),
      limit: z.number().min(1).max(100).optional(),
      offset: z.number().min(0).optional(),
    }))
    .query(async ({ input }) => {
      // TODO: Fetch from database
      return {
        links: [],
        total: 0,
        limit: input.limit || 20,
        offset: input.offset || 0,
      };
    }),

  // ============================================================================
  // CLICK TRACKING
  // ============================================================================

  /**
   * Track affiliate click (public endpoint for tracking)
   */
  trackClick: publicProcedure
    .input(z.object({
      shortCode: z.string(),
      referrer: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // TODO: Lookup link by shortCode
        // TODO: Extract IP, user agent, device info from ctx.req
        // TODO: Save click to database
        // TODO: Increment click count on link
        
        // Return redirect URL
        return {
          redirectUrl: "https://example.com/product", // TODO: Get from link
          tracked: true,
        };
      } catch (error) {
        console.error("Click tracking error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to track click",
        });
      }
    }),

  /**
   * Record conversion (when affiliate link leads to sale/signup)
   */
  recordConversion: protectedProcedure
    .input(z.object({
      clickId: z.string(),
      conversionType: z.enum(["sale", "signup", "lead", "download"]),
      conversionValue: z.number().min(0),
      orderId: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        // TODO: Update click record with conversion
        // TODO: Calculate commission
        // TODO: Create commission record
        // TODO: Update entity earnings
        
        return {
          converted: true,
          commissionAmount: input.conversionValue * 0.10, // TODO: Use actual commission rate
          message: "Conversion recorded successfully!",
        };
      } catch (error) {
        console.error("Conversion recording error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to record conversion",
        });
      }
    }),

  // ============================================================================
  // ANALYTICS
  // ============================================================================

  /**
   * Get affiliate performance analytics
   */
  getAnalytics: protectedProcedure
    .input(z.object({
      entityId: z.string(),
      period: z.enum(["daily", "weekly", "monthly", "yearly"]),
      startDate: z.string().optional(), // ISO date
      endDate: z.string().optional(), // ISO date
    }))
    .query(async ({ input }) => {
      // TODO: Fetch from database
      return {
        period: input.period,
        metrics: {
          clicks: 0,
          uniqueClicks: 0,
          conversions: 0,
          conversionRate: 0,
          revenue: 0,
          commission: 0,
          averageOrderValue: 0,
        },
        topProducts: [],
        topLinks: [],
        topCountries: [],
      };
    }),

  /**
   * Get commission history
   */
  getCommissions: protectedProcedure
    .input(z.object({
      entityId: z.string(),
      status: z.enum(["pending", "approved", "paid", "reversed", "all"]).optional(),
      limit: z.number().min(1).max(100).optional(),
      offset: z.number().min(0).optional(),
    }))
    .query(async ({ input }) => {
      // TODO: Fetch from database
      return {
        commissions: [],
        total: 0,
        totalAmount: 0,
        limit: input.limit || 20,
        offset: input.offset || 0,
      };
    }),

  // ============================================================================
  // PAYOUTS
  // ============================================================================

  /**
   * Request payout
   */
  requestPayout: protectedProcedure
    .input(z.object({
      entityId: z.string(),
      amount: z.number().min(0),
      paymentMethod: z.enum(["stripe", "paypal", "ach", "check"]),
    }))
    .mutation(async ({ input }) => {
      try {
        // TODO: Check if entity has sufficient pending earnings
        // TODO: Create payout request
        // TODO: Update entity pending earnings
        
        return {
          payoutId: createId(),
          status: "pending",
          amount: input.amount,
          message: "Payout request submitted successfully!",
        };
      } catch (error) {
        console.error("Payout request error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to request payout",
        });
      }
    }),

  /**
   * Get payout history
   */
  getPayouts: protectedProcedure
    .input(z.object({
      entityId: z.string(),
      status: z.enum(["pending", "processing", "completed", "failed", "all"]).optional(),
      limit: z.number().min(1).max(100).optional(),
      offset: z.number().min(0).optional(),
    }))
    .query(async ({ input }) => {
      // TODO: Fetch from database
      return {
        payouts: [],
        total: 0,
        totalAmount: 0,
        limit: input.limit || 20,
        offset: input.offset || 0,
      };
    }),

  // ============================================================================
  // ADMIN FUNCTIONS
  // ============================================================================

  /**
   * Approve/reject affiliate entity (admin only)
   */
  approveEntity: protectedProcedure
    .input(z.object({
      entityId: z.string(),
      approved: z.boolean(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // TODO: Check if user is admin
      // TODO: Update entity status
      // TODO: Send notification to entity
      
      return {
        entityId: input.entityId,
        status: input.approved ? "active" : "rejected",
        message: input.approved ? "Entity approved!" : "Entity rejected.",
      };
    }),

  /**
   * Process payout (admin only)
   */
  processPayout: protectedProcedure
    .input(z.object({
      payoutId: z.string(),
      transactionId: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // TODO: Check if user is admin
      // TODO: Update payout status
      // TODO: Update commission statuses
      // TODO: Send notification to entity
      
      return {
        payoutId: input.payoutId,
        status: "completed",
        message: "Payout processed successfully!",
      };
    }),
});
