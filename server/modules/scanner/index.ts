import { chromium, Browser, Page } from "playwright";
import * as cheerio from "cheerio";
import { getDb } from "../../db";
import {
  altTextScans,
  altTextScanResults,
  altTextImageAnalysis,
} from "../../../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * SCANNER MODULE
 * Crawls websites and extracts images for accessibility analysis
 */

export interface ScanConfig {
  scanId: number;
  websiteUrl: string;
  scanType: "full" | "single_page" | "custom";
  maxPages: number;
  includeSubdomains: boolean;
  customUrls?: string[];
  timeout?: number;
}

export interface PageResult {
  pageUrl: string;
  pageTitle: string;
  httpStatus: number;
  imagesFound: number;
  imagesMissingAlt: number;
  imagesWithEmptyAlt: number;
  images: ImageInfo[];
}

export interface ImageInfo {
  imageUrl: string;
  selector: string;
  currentAltText: string | null;
  surroundingText: string;
  pageContext: string;
  width: number | null;
  height: number | null;
}

export class ScannerModule {
  private browser: Browser | null = null;

  async initialize() {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--no-first-run",
          "--no-zygote",
          "--single-process",
        ],
      });
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Start a website scan
   */
  async startScan(config: ScanConfig): Promise<void> {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    try {
      await this.initialize();

      // Update scan status to scanning
      await db
        .update(altTextScans)
        .set({
          status: "scanning",
          startedAt: new Date(),
        })
        .where(eq(altTextScans.id, config.scanId));

      let pagesToScan: string[] = [];

      if (config.scanType === "single_page") {
        pagesToScan = [config.websiteUrl];
      } else if (config.scanType === "custom" && config.customUrls) {
        pagesToScan = config.customUrls;
      } else {
        // Full scan - crawl website
        pagesToScan = await this.crawlWebsite(
          config.websiteUrl,
          config.maxPages,
          config.includeSubdomains
        );
      }

      // Scan each page
      let totalImagesFound = 0;
      let totalImagesMissingAlt = 0;
      let totalImagesWithEmptyAlt = 0;
      let totalImagesWithGoodAlt = 0;

      for (const pageUrl of pagesToScan) {
        try {
          const pageResult = await this.scanPage(pageUrl, config.scanId);

          totalImagesFound += pageResult.imagesFound;
          totalImagesMissingAlt += pageResult.imagesMissingAlt;
          totalImagesWithEmptyAlt += pageResult.imagesWithEmptyAlt;
          totalImagesWithGoodAlt +=
            pageResult.imagesFound -
            pageResult.imagesMissingAlt -
            pageResult.imagesWithEmptyAlt;

          // Save page result
          await db.insert(altTextScanResults).values({
            scanId: config.scanId,
            pageUrl: pageResult.pageUrl,
            pageTitle: pageResult.pageTitle,
            httpStatus: pageResult.httpStatus,
            imagesFound: pageResult.imagesFound,
            imagesMissingAlt: pageResult.imagesMissingAlt,
            imagesWithEmptyAlt: pageResult.imagesWithEmptyAlt,
            complianceScore: this.calculateComplianceScore(pageResult),
            violationsFound:
              pageResult.imagesMissingAlt + pageResult.imagesWithEmptyAlt,
          });

          // Save image analysis (pending AI generation)
          const scanResultId = (await db
            .select()
            .from(altTextScanResults)
            .where(eq(altTextScanResults.scanId, config.scanId))
            .orderBy(altTextScanResults.id)
            .limit(1))[0]?.id;

          if (scanResultId) {
            for (const image of pageResult.images) {
              await db.insert(altTextImageAnalysis).values({
                scanResultId,
                imageUrl: image.imageUrl,
                imageSelector: image.selector,
                currentAltText: image.currentAltText,
                generatedAltText: "", // Will be filled by Analyzer Module
                confidence: "0",
                surroundingText: image.surroundingText,
                pageContext: image.pageContext,
                width: image.width,
                height: image.height,
                status: "pending",
              });
            }
          }
        } catch (error) {
          console.error(`Error scanning page ${pageUrl}:`, error);
        }
      }

      // Calculate overall compliance score
      const complianceScore =
        totalImagesFound > 0
          ? ((totalImagesWithGoodAlt / totalImagesFound) * 100).toFixed(2)
          : "100.00";

      // Update scan with final results
      await db
        .update(altTextScans)
        .set({
          status: "completed",
          completedAt: new Date(),
          pagesScanned: pagesToScan.length,
          imagesFound: totalImagesFound,
          imagesMissingAlt: totalImagesMissingAlt,
          imagesWithEmptyAlt: totalImagesWithEmptyAlt,
          imagesWithGoodAlt: totalImagesWithGoodAlt,
          complianceScore,
          violationsFound: totalImagesMissingAlt + totalImagesWithEmptyAlt,
        })
        .where(eq(altTextScans.id, config.scanId));
    } catch (error) {
      console.error("Scan error:", error);

      // Update scan status to failed
      await db
        .update(altTextScans)
        .set({
          status: "failed",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        })
        .where(eq(altTextScans.id, config.scanId));
    } finally {
      await this.close();
    }
  }

  /**
   * Crawl website to discover pages
   */
  private async crawlWebsite(
    startUrl: string,
    maxPages: number,
    includeSubdomains: boolean
  ): Promise<string[]> {
    const visited = new Set<string>();
    const toVisit: string[] = [startUrl];
    const pages: string[] = [];

    const baseUrl = new URL(startUrl);
    const baseDomain = baseUrl.hostname;

    while (toVisit.length > 0 && pages.length < maxPages) {
      const url = toVisit.shift()!;

      if (visited.has(url)) continue;
      visited.add(url);

      try {
        const page = await this.browser!.newPage();
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

        pages.push(url);

        // Extract links
        const links = await page.$$eval("a[href]", (anchors) =>
          anchors.map((a) => (a as HTMLAnchorElement).href)
        );

        await page.close();

        // Add new links to queue
        for (const link of links) {
          try {
            const linkUrl = new URL(link);

            // Check if link is on same domain (or subdomain if allowed)
            const isSameDomain = includeSubdomains
              ? linkUrl.hostname.endsWith(baseDomain)
              : linkUrl.hostname === baseDomain;

            if (isSameDomain && !visited.has(link) && pages.length < maxPages) {
              toVisit.push(link);
            }
          } catch {
            // Invalid URL, skip
          }
        }
      } catch (error) {
        console.error(`Error crawling ${url}:`, error);
      }
    }

    return pages;
  }

  /**
   * Scan a single page for images
   */
  private async scanPage(pageUrl: string, scanId: number): Promise<PageResult> {
    const page = await this.browser!.newPage();

    try {
      const response = await page.goto(pageUrl, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      const httpStatus = response?.status() || 0;
      const pageTitle = await page.title();

      // Extract all images
      const images = await page.$$eval("img", (imgs) =>
        imgs.map((img) => ({
          src: img.src,
          alt: img.alt,
          width: img.width,
          height: img.height,
          selector: img.tagName.toLowerCase(),
        }))
      );

      const imageInfos: ImageInfo[] = [];
      let imagesMissingAlt = 0;
      let imagesWithEmptyAlt = 0;

      for (const img of images) {
        const hasAlt = img.alt !== undefined && img.alt !== null;
        const isEmptyAlt = hasAlt && img.alt.trim() === "";

        if (!hasAlt) imagesMissingAlt++;
        else if (isEmptyAlt) imagesWithEmptyAlt++;

        // Get surrounding text for context
        const surroundingText = await this.getSurroundingText(page, img.src);

        imageInfos.push({
          imageUrl: img.src,
          selector: `img[src="${img.src}"]`,
          currentAltText: hasAlt ? img.alt : null,
          surroundingText,
          pageContext: pageTitle,
          width: img.width || null,
          height: img.height || null,
        });
      }

      await page.close();

      return {
        pageUrl,
        pageTitle,
        httpStatus,
        imagesFound: images.length,
        imagesMissingAlt,
        imagesWithEmptyAlt,
        images: imageInfos,
      };
    } catch (error) {
      await page.close();
      throw error;
    }
  }

  /**
   * Get text surrounding an image for context
   */
  private async getSurroundingText(page: Page, imageSrc: string): Promise<string> {
    try {
      const text = await page.$eval(
        `img[src="${imageSrc}"]`,
        (img) => {
          const parent = img.parentElement;
          if (!parent) return "";

          // Get text from parent and siblings
          const textContent = parent.textContent || "";
          return textContent.trim().substring(0, 200); // Limit to 200 chars
        }
      );

      return text;
    } catch {
      return "";
    }
  }

  /**
   * Calculate compliance score for a page
   */
  private calculateComplianceScore(pageResult: PageResult): string {
    if (pageResult.imagesFound === 0) return "100.00";

    const goodImages =
      pageResult.imagesFound -
      pageResult.imagesMissingAlt -
      pageResult.imagesWithEmptyAlt;

    const score = (goodImages / pageResult.imagesFound) * 100;

    return score.toFixed(2);
  }
}

// Export singleton instance
export const scanner = new ScannerModule();
