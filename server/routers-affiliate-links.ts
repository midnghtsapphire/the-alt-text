/**
 * Affiliate Link API Router
 * 
 * tRPC endpoints for automatic affiliate link generation, tracking, and analytics
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  generateAffiliateCode,
  buildAffiliateLink,
  generateQRCode,
  createShortLink,
  trackClick,
  detectDevice,
  detectBrowser,
  generateBulkLinks,
  getLinkAnalytics,
  autoInsertAffiliateLinks,
  checkLinkExpiration,
} from "./modules/affiliate-links";

export const affiliateLinkRouter = router({
  /**
   * Generate unique affiliate code for new affiliate
   */
  generateCode: protectedProcedure
    .input(z.object({
      affiliateId: z.number(),
      email: z.string().email(),
    }))
    .mutation(async ({ input }) => {
      const code = generateAffiliateCode(input.affiliateId, input.email);
      return { code };
    }),

  /**
   * Build affiliate link with tracking parameters
   */
  buildLink: protectedProcedure
    .input(z.object({
      affiliateCode: z.string(),
      product: z.enum(['scanner', 'analyzer', 'reporter', 'fixer', 'complete_platform']).optional(),
      tier: z.enum(['starter', 'professional', 'enterprise']).optional(),
      campaign: z.string().optional(),
      medium: z.string().optional(),
      source: z.string().optional(),
      content: z.string().optional(),
    }))
    .query(({ input }) => {
      const link = buildAffiliateLink(input);
      const shortLink = createShortLink(input.affiliateCode, Date.now());
      
      return {
        link,
        shortLink,
      };
    }),

  /**
   * Generate QR code for affiliate link
   */
  generateQR: protectedProcedure
    .input(z.object({
      link: z.string().url(),
    }))
    .mutation(async ({ input }) => {
      const qrCodeDataUrl = await generateQRCode(input.link);
      return { qrCode: qrCodeDataUrl };
    }),

  /**
   * Track affiliate link click
   */
  trackClick: publicProcedure
    .input(z.object({
      affiliateCode: z.string(),
      linkId: z.number(),
      ipAddress: z.string(),
      userAgent: z.string(),
      referer: z.string().optional(),
      country: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const device = detectDevice(input.userAgent);
      const browser = detectBrowser(input.userAgent);
      
      await trackClick({
        ...input,
        device,
        browser,
      });
      
      return { success: true };
    }),

  /**
   * Generate bulk affiliate links for CSV export
   */
  generateBulk: protectedProcedure
    .input(z.object({
      affiliateCode: z.string(),
      products: z.array(z.object({
        product: z.enum(['scanner', 'analyzer', 'reporter', 'fixer', 'complete_platform']),
        tier: z.enum(['starter', 'professional', 'enterprise']),
      })),
      campaign: z.string().optional(),
    }))
    .query(({ input }) => {
      const links = generateBulkLinks(input);
      return { links };
    }),

  /**
   * Get link analytics
   */
  getAnalytics: protectedProcedure
    .input(z.object({
      affiliateCode: z.string(),
      startDate: z.string().transform(str => new Date(str)),
      endDate: z.string().transform(str => new Date(str)),
    }))
    .query(async ({ input }) => {
      const analytics = await getLinkAnalytics(
        input.affiliateCode,
        input.startDate,
        input.endDate
      );
      return analytics;
    }),

  /**
   * Auto-insert affiliate links in content
   */
  autoInsert: protectedProcedure
    .input(z.object({
      content: z.string(),
      affiliateCode: z.string(),
    }))
    .mutation(({ input }) => {
      const modifiedContent = autoInsertAffiliateLinks(input.content, input.affiliateCode);
      return { content: modifiedContent };
    }),

  /**
   * Check link expiration status
   */
  checkExpiration: protectedProcedure
    .input(z.object({
      linkId: z.number(),
      affiliateCode: z.string(),
      expiresAt: z.string().optional().transform(str => str ? new Date(str) : undefined),
      maxClicks: z.number().optional(),
      currentClicks: z.number(),
      isActive: z.boolean(),
    }))
    .query(({ input }) => {
      const isExpired = checkLinkExpiration(input);
      return { isExpired };
    }),

  /**
   * Get affiliate link preview with stats
   */
  getLinkPreview: protectedProcedure
    .input(z.object({
      affiliateCode: z.string(),
      product: z.enum(['scanner', 'analyzer', 'reporter', 'fixer', 'complete_platform']).optional(),
      tier: z.enum(['starter', 'professional', 'enterprise']).optional(),
    }))
    .query(async ({ input }) => {
      const link = buildAffiliateLink(input);
      const shortLink = createShortLink(input.affiliateCode, Date.now());
      const qrCode = await generateQRCode(link);
      
      // Mock stats (would come from database)
      const stats = {
        clicks: 0,
        conversions: 0,
        earnings: 0,
      };
      
      return {
        link,
        shortLink,
        qrCode,
        stats,
      };
    }),
});
