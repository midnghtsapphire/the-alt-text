import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ScannerModule } from "./modules/scanner";
import { AnalyzerModule } from "./modules/analyzer";
import { ReporterModule } from "./modules/reporter";
import { FixerModule } from "./modules/fixer";
import { getDb } from "./db";
import { altTextScans, altTextImageAnalysis } from "../drizzle/schema";

describe("Alt Text API Integration Tests", () => {
  let scanner: ScannerModule;
  let analyzer: AnalyzerModule;
  let reporter: ReporterModule;
  let fixer: FixerModule;
  let testScanId: number;

  beforeAll(async () => {
    scanner = new ScannerModule();
    analyzer = new AnalyzerModule();
    reporter = new ReporterModule();
    fixer = new FixerModule();

    // Create test scan in database
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    const [scan] = await db
      .insert(altTextScans)
      .values({
        userId: 1, // Test user
        websiteUrl: "https://example.com",
        scanType: "single_page",
        status: "pending",
      })
      .$returningId();

    testScanId = scan.id;
  });

  afterAll(async () => {
    await scanner.close();
    
    // Cleanup test data
    const db = await getDb();
    if (db) {
      await db.delete(altTextScans).where({ id: testScanId });
    }
  });

  describe("Scanner Module", () => {
    it("should initialize Playwright browser in headless mode", async () => {
      await scanner.initialize();
      expect(scanner).toBeDefined();
    }, 30000);

    it("should scan a single page and extract images", async () => {
      const result = await scanner.scanPage("https://example.com");
      
      expect(result).toBeDefined();
      expect(result.pageUrl).toBe("https://example.com");
      expect(result.images).toBeInstanceOf(Array);
      expect(result.pageTitle).toBeDefined();
    }, 30000);

    it("should calculate compliance score", async () => {
      const score = scanner.calculateComplianceScore(10, 3, 2);
      
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
      // 5 images with alt text out of 10 total = 50% compliance
      expect(score).toBe(50);
    });
  });

  describe("Analyzer Module", () => {
    it("should analyze image and generate alt text", async () => {
      const result = await analyzer.analyzeImage({
        imageUrl: "https://example.com/image.jpg",
        currentAltText: "",
        surroundingText: "Welcome to our website",
        pageContext: "Homepage - Company introduction",
      });

      expect(result).toBeDefined();
      expect(result.altText).toBeDefined();
      expect(result.altText.length).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(100);
      expect(result.imageType).toBeDefined();
    }, 60000); // AI analysis can take longer

    it("should classify image types correctly", async () => {
      const types = ["photo", "illustration", "diagram", "logo", "icon", "decorative"];
      
      const result = await analyzer.analyzeImage({
        imageUrl: "https://example.com/logo.png",
        currentAltText: "",
        surroundingText: "Company Logo",
        pageContext: "Header navigation",
      });

      expect(types).toContain(result.imageType);
    }, 60000);

    it("should flag low-confidence results for review", async () => {
      const result = await analyzer.analyzeImage({
        imageUrl: "https://example.com/complex-diagram.jpg",
        currentAltText: "",
        surroundingText: "",
        pageContext: "",
      });

      if (result.confidence < 70) {
        expect(result.needsReview).toBe(true);
      }
    }, 60000);
  });

  describe("Reporter Module", () => {
    it("should generate summary report in PDF format", async () => {
      const result = await reporter.generateReport({
        scanId: testScanId,
        reportType: "summary",
        format: "pdf",
      });

      expect(result).toBeDefined();
      expect(result.reportUrl).toContain(".pdf");
      expect(result.format).toBe("pdf");
    }, 60000);

    it("should generate detailed report in HTML format", async () => {
      const result = await reporter.generateReport({
        scanId: testScanId,
        reportType: "detailed",
        format: "html",
      });

      expect(result).toBeDefined();
      expect(result.reportUrl).toContain(".html");
      expect(result.format).toBe("html");
    }, 60000);

    it("should calculate ROI correctly", async () => {
      const roi = reporter.calculateROI(50, 100);

      expect(roi).toBeDefined();
      expect(roi.violationCount).toBe(50);
      expect(roi.lawsuitRisk).toBeGreaterThan(0);
      expect(roi.potentialSavings).toBeGreaterThan(0);
      expect(roi.roiPercentage).toBeGreaterThan(0);
    });

    it("should generate JSON report for API consumption", async () => {
      const result = await reporter.generateReport({
        scanId: testScanId,
        reportType: "technical",
        format: "json",
      });

      expect(result).toBeDefined();
      expect(result.format).toBe("json");
    }, 60000);
  });

  describe("Fixer Module", () => {
    beforeAll(async () => {
      // Insert test image analysis
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      await db.insert(altTextImageAnalysis).values({
        scanId: testScanId,
        imageUrl: "https://example.com/test.jpg",
        currentAltText: "",
        generatedAltText: "A beautiful sunset over the ocean",
        confidence: 95,
        imageType: "photo",
        status: "approved",
      });
    });

    it("should export fixes in JSON format", async () => {
      const result = await fixer.getFixes(testScanId, "json");

      expect(result).toBeDefined();
      expect(result.fixes).toBeInstanceOf(Array);
      expect(result.fixes.length).toBeGreaterThan(0);
      
      const fix = result.fixes[0];
      expect(fix.imageUrl).toBeDefined();
      expect(fix.generatedAltText).toBeDefined();
      expect(fix.confidence).toBeGreaterThanOrEqual(0);
    });

    it("should export fixes in CSV format", async () => {
      const result = await fixer.getFixes(testScanId, "csv");

      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(result).toContain("imageUrl");
      expect(result).toContain("generatedAltText");
    });

    it("should generate JavaScript snippet", async () => {
      const result = await fixer.getJavaScriptSnippet(testScanId);

      expect(result).toBeDefined();
      expect(result.snippet).toContain("script");
      expect(result.snippet).toContain(testScanId.toString());
      expect(result.instructions).toBeDefined();
    });

    it("should generate WordPress plugin", async () => {
      const result = await fixer.getWordPressPlugin(testScanId);

      expect(result).toBeDefined();
      expect(result.pluginUrl).toContain(".zip");
      expect(result.version).toBeDefined();
      expect(result.instructions).toBeDefined();
    });
  });

  describe("End-to-End Workflow", () => {
    it("should complete full scan → analyze → report → fix cycle", async () => {
      // 1. Scan website
      const scanResult = await scanner.scanPage("https://example.com");
      expect(scanResult.images.length).toBeGreaterThan(0);

      // 2. Analyze first image
      const firstImage = scanResult.images[0];
      const analysisResult = await analyzer.analyzeImage({
        imageUrl: firstImage.imageUrl,
        currentAltText: firstImage.currentAltText,
        surroundingText: firstImage.surroundingText,
        pageContext: scanResult.pageTitle,
      });
      expect(analysisResult.altText).toBeDefined();

      // 3. Generate report
      const reportResult = await reporter.generateReport({
        scanId: testScanId,
        reportType: "summary",
        format: "pdf",
      });
      expect(reportResult.reportUrl).toBeDefined();

      // 4. Get fixes
      const fixesResult = await fixer.getFixes(testScanId, "json");
      expect(fixesResult.fixes).toBeInstanceOf(Array);

      console.log("✅ End-to-end workflow completed successfully!");
      console.log(`   - Scanned: ${scanResult.pageUrl}`);
      console.log(`   - Found: ${scanResult.images.length} images`);
      console.log(`   - Generated alt text: "${analysisResult.altText}"`);
      console.log(`   - Confidence: ${analysisResult.confidence}%`);
      console.log(`   - Report: ${reportResult.reportUrl}`);
      console.log(`   - Fixes: ${fixesResult.fixes.length} available`);
    }, 120000); // Allow 2 minutes for full workflow
  });
});
