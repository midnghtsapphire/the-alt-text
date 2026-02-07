import { describe, it, expect, beforeAll } from "vitest";
import { ScannerModule } from "./modules/scanner";
import { AnalyzerModule } from "./modules/analyzer";
import { ReporterModule } from "./modules/reporter";

/**
 * Alt Text Scan Workflow End-to-End Test
 * Tests the complete flow: scan → analyze → report
 */
describe("Alt Text Scan Workflow", () => {
  let scanResults: any;
  let analysisResults: any;
  let scanner: ScannerModule;
  let analyzer: AnalyzerModule;
  let reporter: ReporterModule;

  beforeAll(async () => {
    // Initialize modules
    scanner = new ScannerModule();
    analyzer = new AnalyzerModule();
    reporter = new ReporterModule();
    await scanner.initialize();
    console.log("Starting Alt Text scan workflow test...");
  });

  it("should scan a website and find images", async () => {
    // Test with a simple page
    const testUrl = "https://example.com";
    
    // Create a test scan in database first
    // For now, just test the module directly
    scanResults = await scanner.scanPage(testUrl);

    expect(scanResults).toBeDefined();
    expect(scanResults.images).toBeInstanceOf(Array);
    expect(scanResults.totalImages).toBeGreaterThanOrEqual(0);
    
    console.log(`Found ${scanResults.totalImages} images on ${testUrl}`);
  }, 30000); // 30 second timeout for Playwright

  it("should analyze images with AI", async () => {
    if (!scanResults || scanResults.images.length === 0) {
      console.log("No images to analyze, skipping test");
      return;
    }

    // Analyze first image
    const firstImage = scanResults.images[0];
    
    analysisResults = await analyzer.analyzeImage({
      imageUrl: firstImage.imageUrl,
      currentAltText: firstImage.currentAltText,
      surroundingText: firstImage.surroundingText,
      pageContext: firstImage.pageContext,
    });

    expect(analysisResults).toBeDefined();
    expect(analysisResults.altText).toBeDefined();
    expect(analysisResults.confidence).toBeGreaterThan(0);
    expect(analysisResults.imageType).toBeDefined();
    
    console.log(`Generated alt text: "${analysisResults.altText}"`);
    console.log(`Confidence: ${analysisResults.confidence}%`);
  }, 60000); // 60 second timeout for AI analysis

  it("should generate a PDF report", async () => {
    if (!scanResults || !analysisResults) {
      console.log("No scan/analysis results, skipping report test");
      return;
    }

    const reportData = {
      websiteUrl: "https://example.com",
      scanDate: new Date(),
      totalImages: scanResults.totalImages,
      imagesWithoutAlt: scanResults.images.filter((img: any) => !img.currentAltText).length,
      complianceScore: 75,
      violations: scanResults.images.filter((img: any) => !img.currentAltText).length,
      fixes: [
        {
          imageUrl: scanResults.images[0]?.url || "",
          currentAltText: "",
          generatedAltText: analysisResults.altText || "",
          confidence: analysisResults.confidence || 0,
        },
      ],
    };

    const report = await reporter.generateReport({
      scanId: 1,
      reportType: "summary",
      format: "pdf",
    });

    expect(report).toBeDefined();
    expect(report.url).toBeDefined();
    expect(report.url).toMatch(/\.pdf$/);
    
    console.log(`Report generated: ${report.url}`);
  }, 60000); // 60 second timeout for PDF generation
});
