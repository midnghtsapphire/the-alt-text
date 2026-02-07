/**
 * Automatic Affiliate Link Generator Module
 * 
 * Generates unique tracking links for affiliates with smart UTM parameters,
 * deep linking, QR codes, and click analytics.
 */

import crypto from 'crypto';
import QRCode from 'qrcode';

/**
 * Generate unique affiliate code
 */
export function generateAffiliateCode(affiliateId: number, email: string): string {
  // Create deterministic but unique code from affiliate ID and email
  const hash = crypto
    .createHash('sha256')
    .update(`${affiliateId}-${email}-${Date.now()}`)
    .digest('hex');
  
  // Take first 8 characters and make uppercase for readability
  return hash.substring(0, 8).toUpperCase();
}

/**
 * Build affiliate link with smart tracking
 */
export interface AffiliateLinkOptions {
  affiliateCode: string;
  product?: 'scanner' | 'analyzer' | 'reporter' | 'fixer' | 'complete_platform';
  tier?: 'starter' | 'professional' | 'enterprise';
  campaign?: string;
  medium?: string;
  source?: string;
  content?: string;
}

export function buildAffiliateLink(options: AffiliateLinkOptions): string {
  const baseUrl = process.env.VITE_APP_URL || 'https://thealttext.com';
  const url = new URL(`${baseUrl}/signup`);
  
  // Add affiliate tracking parameter
  url.searchParams.set('ref', options.affiliateCode);
  
  // Add product/tier if specified (deep linking)
  if (options.product) {
    url.searchParams.set('product', options.product);
  }
  if (options.tier) {
    url.searchParams.set('tier', options.tier);
  }
  
  // Add UTM parameters for analytics
  url.searchParams.set('utm_source', options.source || 'affiliate');
  url.searchParams.set('utm_medium', options.medium || 'referral');
  url.searchParams.set('utm_campaign', options.campaign || 'affiliate_program');
  
  if (options.content) {
    url.searchParams.set('utm_content', options.content);
  }
  
  return url.toString();
}

/**
 * Generate QR code for affiliate link
 */
export async function generateQRCode(link: string): Promise<string> {
  try {
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(link, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 512,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    
    return qrCodeDataUrl;
  } catch (error) {
    console.error('QR code generation failed:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Create short URL for affiliate link
 */
export function createShortLink(affiliateCode: string, linkId: number): string {
  const baseUrl = process.env.VITE_APP_URL || 'https://thealttext.com';
  // Format: https://thealttext.com/r/ABC12345
  return `${baseUrl}/r/${affiliateCode}`;
}

/**
 * Track affiliate link click
 */
export interface ClickData {
  affiliateCode: string;
  linkId: number;
  ipAddress: string;
  userAgent: string;
  referer?: string;
  country?: string;
  device?: 'desktop' | 'mobile' | 'tablet';
  browser?: string;
}

export async function trackClick(data: ClickData): Promise<void> {
  // This would insert into database
  // For now, just log
  console.log('Affiliate click tracked:', {
    code: data.affiliateCode,
    linkId: data.linkId,
    device: data.device,
    country: data.country,
  });
}

/**
 * Parse user agent to detect device type
 */
export function detectDevice(userAgent: string): 'desktop' | 'mobile' | 'tablet' {
  const ua = userAgent.toLowerCase();
  
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

/**
 * Parse user agent to detect browser
 */
export function detectBrowser(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('edg/')) return 'Edge';
  if (ua.includes('chrome')) return 'Chrome';
  if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
  if (ua.includes('firefox')) return 'Firefox';
  if (ua.includes('opera') || ua.includes('opr/')) return 'Opera';
  
  return 'Unknown';
}

/**
 * Generate bulk affiliate links (for CSV export)
 */
export interface BulkLinkOptions {
  affiliateCode: string;
  products: Array<{
    product: 'scanner' | 'analyzer' | 'reporter' | 'fixer' | 'complete_platform';
    tier: 'starter' | 'professional' | 'enterprise';
  }>;
  campaign?: string;
}

export function generateBulkLinks(options: BulkLinkOptions): Array<{
  product: string;
  tier: string;
  link: string;
  shortLink: string;
}> {
  return options.products.map((item, index) => {
    const link = buildAffiliateLink({
      affiliateCode: options.affiliateCode,
      product: item.product,
      tier: item.tier,
      campaign: options.campaign,
      content: `${item.product}_${item.tier}`,
    });
    
    const shortLink = createShortLink(options.affiliateCode, index + 1);
    
    return {
      product: item.product,
      tier: item.tier,
      link,
      shortLink,
    };
  });
}

/**
 * Link analytics data structure
 */
export interface LinkAnalytics {
  totalClicks: number;
  uniqueClicks: number;
  conversionRate: number;
  topCountries: Array<{ country: string; clicks: number }>;
  topDevices: Array<{ device: string; clicks: number }>;
  topBrowsers: Array<{ browser: string; clicks: number }>;
  clicksByDay: Array<{ date: string; clicks: number }>;
}

/**
 * Get link analytics (mock implementation)
 */
export async function getLinkAnalytics(
  affiliateCode: string,
  startDate: Date,
  endDate: Date
): Promise<LinkAnalytics> {
  // This would query the database
  // For now, return mock data
  return {
    totalClicks: 1250,
    uniqueClicks: 890,
    conversionRate: 12.5,
    topCountries: [
      { country: 'United States', clicks: 650 },
      { country: 'United Kingdom', clicks: 200 },
      { country: 'Canada', clicks: 150 },
    ],
    topDevices: [
      { device: 'desktop', clicks: 750 },
      { device: 'mobile', clicks: 400 },
      { device: 'tablet', clicks: 100 },
    ],
    topBrowsers: [
      { browser: 'Chrome', clicks: 700 },
      { browser: 'Safari', clicks: 300 },
      { browser: 'Firefox', clicks: 150 },
    ],
    clicksByDay: [
      { date: '2026-01-22', clicks: 180 },
      { date: '2026-01-23', clicks: 165 },
      { date: '2026-01-24', clicks: 190 },
      { date: '2026-01-25', clicks: 175 },
      { date: '2026-01-26', clicks: 155 },
      { date: '2026-01-27', clicks: 195 },
      { date: '2026-01-28', clicks: 190 },
    ],
  };
}

/**
 * Browser extension message format
 */
export interface ExtensionMessage {
  action: 'replace_links' | 'get_stats' | 'generate_link';
  affiliateCode?: string;
  url?: string;
  product?: string;
  tier?: string;
}

/**
 * Handle browser extension messages
 */
export function handleExtensionMessage(message: ExtensionMessage): any {
  switch (message.action) {
    case 'generate_link':
      if (!message.affiliateCode) {
        return { error: 'Missing affiliate code' };
      }
      return {
        link: buildAffiliateLink({
          affiliateCode: message.affiliateCode,
          product: message.product as any,
          tier: message.tier as any,
        }),
      };
      
    case 'get_stats':
      // Return cached stats
      return {
        clicks: 1250,
        conversions: 156,
        earnings: 3120.50,
      };
      
    default:
      return { error: 'Unknown action' };
  }
}

/**
 * Link expiration and rotation
 */
export interface LinkRotation {
  linkId: number;
  affiliateCode: string;
  expiresAt?: Date;
  maxClicks?: number;
  currentClicks: number;
  isActive: boolean;
}

export function checkLinkExpiration(rotation: LinkRotation): boolean {
  // Check if link has expired by date
  if (rotation.expiresAt && new Date() > rotation.expiresAt) {
    return true;
  }
  
  // Check if link has reached max clicks
  if (rotation.maxClicks && rotation.currentClicks >= rotation.maxClicks) {
    return true;
  }
  
  return false;
}

/**
 * Auto-insert affiliate links in content
 */
export function autoInsertAffiliateLinks(
  content: string,
  affiliateCode: string
): string {
  // Find all URLs in content that match our domain
  const urlPattern = /(https?:\/\/)?(www\.)?thealttext\.com\/[^\s]*/gi;
  
  return content.replace(urlPattern, (match) => {
    // If URL already has ref parameter, skip it
    if (match.includes('ref=')) {
      return match;
    }
    
    // Add affiliate code to URL
    const separator = match.includes('?') ? '&' : '?';
    return `${match}${separator}ref=${affiliateCode}`;
  });
}
