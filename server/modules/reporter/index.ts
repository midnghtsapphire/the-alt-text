import puppeteer, { Browser } from "puppeteer";
import { getDb } from "../../db";
import {
  altTextScans,
  altTextReports,
  altTextScanResults,
  altTextImageAnalysis,
} from "../../../drizzle/schema";
import { eq } from "drizzle-orm";
import { calculateROI } from "../../alttext-products";
import { storagePut } from "../../storage";

/**
 * REPORTER MODULE
 * Generate compliance reports with ROI calculations and PDF export
 */

export interface ReportConfig {
  scanId: number;
  userId: number;
  reportType: "summary" | "detailed" | "executive" | "technical";
  format: "pdf" | "html" | "json";
  includeROI: boolean;
  industryType?: string;
  brandLogo?: string;
  brandColor?: string;
}

export interface ReportData {
  reportId: number;
  scanId: number;
  summary: ReportSummary;
  violations: Violation[];
  recommendations: Recommendation[];
  roi: ROICalculation;
  fileUrl?: string;
}

export interface ReportSummary {
  websiteUrl: string;
  scanDate: Date;
  pagesScanned: number;
  totalImages: number;
  imagesMissingAlt: number;
  imagesWithEmptyAlt: number;
  imagesWithGoodAlt: number;
  complianceScore: number;
  wcagLevel: string;
  violationsFound: number;
}

export interface Violation {
  severity: "critical" | "high" | "medium" | "low";
  type: string;
  description: string;
  pageUrl: string;
  imageUrl: string;
  wcagCriterion: string;
  count: number;
}

export interface Recommendation {
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  impact: string;
  effort: string;
  wcagCriterion: string;
}

export interface ROICalculation {
  estimatedLawsuitRisk: number;
  estimatedCostSavings: number;
  roiPercentage: number;
  riskLevel: "high" | "medium" | "low";
  complianceValue: number;
  timeToCompliance: string;
}

export class ReporterModule {
  private browser: Browser | null = null;

  async initialize() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
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
   * Generate compliance report
   */
  async generateReport(config: ReportConfig): Promise<ReportData> {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    // Get scan data
    const [scan] = await db
      .select()
      .from(altTextScans)
      .where(eq(altTextScans.id, config.scanId))
      .limit(1);

    if (!scan) {
      throw new Error("Scan not found");
    }

    // Get scan results
    const scanResults = await db
      .select()
      .from(altTextScanResults)
      .where(eq(altTextScanResults.scanId, config.scanId));

    // Get image analysis
    const imageAnalysis = await db
      .select()
      .from(altTextImageAnalysis)
      .where(
        eq(altTextImageAnalysis.scanResultId, scanResults[0]?.id || 0)
      );

    // Build report summary
    const summary: ReportSummary = {
      websiteUrl: scan.websiteUrl,
      scanDate: scan.createdAt,
      pagesScanned: scan.pagesScanned,
      totalImages: scan.imagesFound,
      imagesMissingAlt: scan.imagesMissingAlt,
      imagesWithEmptyAlt: scan.imagesWithEmptyAlt,
      imagesWithGoodAlt: scan.imagesWithGoodAlt,
      complianceScore: parseFloat(scan.complianceScore),
      wcagLevel: scan.wcagLevel,
      violationsFound: scan.violationsFound,
    };

    // Build violations list
    const violations = this.buildViolations(scanResults, imageAnalysis);

    // Build recommendations
    const recommendations = this.buildRecommendations(summary, violations);

    // Calculate ROI
    const roi = this.calculateROI(summary, config.industryType);

    // Create report record
    const [reportRecord] = await db.insert(altTextReports).values({
      scanId: config.scanId,
      userId: config.userId,
      reportType: config.reportType,
      format: config.format,
      summary: JSON.stringify(summary),
      violations: JSON.stringify(violations),
      recommendations: JSON.stringify(recommendations),
      estimatedLawsuitRisk: roi.estimatedLawsuitRisk.toString(),
      estimatedCostSavings: roi.estimatedCostSavings.toString(),
      roiPercentage: roi.roiPercentage.toString(),
      status: "generating",
    });

    const reportId = reportRecord.insertId;

    // Generate file based on format
    let fileUrl: string | undefined;

    if (config.format === "pdf") {
      fileUrl = await this.generatePDF(reportId, summary, violations, recommendations, roi, config);
    } else if (config.format === "html") {
      fileUrl = await this.generateHTML(reportId, summary, violations, recommendations, roi, config);
    }

    // Update report with file URL
    if (fileUrl) {
      await db
        .update(altTextReports)
        .set({
          fileUrl,
          status: "completed",
          generatedAt: new Date(),
        })
        .where(eq(altTextReports.id, reportId));
    }

    return {
      reportId,
      scanId: config.scanId,
      summary,
      violations,
      recommendations,
      roi,
      fileUrl,
    };
  }

  /**
   * Build violations list from scan results
   */
  private buildViolations(
    scanResults: any[],
    imageAnalysis: any[]
  ): Violation[] {
    const violations: Violation[] = [];

    // Group violations by type
    const missingAltImages = imageAnalysis.filter(
      (img) => !img.currentAltText || img.currentAltText.trim() === ""
    );

    if (missingAltImages.length > 0) {
      violations.push({
        severity: "critical",
        type: "Missing Alt Text",
        description: `${missingAltImages.length} images are missing alt text, making them inaccessible to screen readers.`,
        pageUrl: scanResults[0]?.pageUrl || "",
        imageUrl: missingAltImages[0]?.imageUrl || "",
        wcagCriterion: "WCAG 2.1 Level A - 1.1.1 Non-text Content",
        count: missingAltImages.length,
      });
    }

    const emptyAltImages = imageAnalysis.filter(
      (img) => img.currentAltText === ""
    );

    if (emptyAltImages.length > 0) {
      violations.push({
        severity: "high",
        type: "Empty Alt Text",
        description: `${emptyAltImages.length} images have empty alt text. Empty alt should only be used for decorative images.`,
        pageUrl: scanResults[0]?.pageUrl || "",
        imageUrl: emptyAltImages[0]?.imageUrl || "",
        wcagCriterion: "WCAG 2.1 Level A - 1.1.1 Non-text Content",
        count: emptyAltImages.length,
      });
    }

    return violations;
  }

  /**
   * Build recommendations based on violations
   */
  private buildRecommendations(
    summary: ReportSummary,
    violations: Violation[]
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    if (summary.imagesMissingAlt > 0) {
      recommendations.push({
        priority: "high",
        title: "Add Alt Text to All Images",
        description: `Add descriptive alt text to ${summary.imagesMissingAlt} images missing accessibility descriptions. Use our AI-powered alt text generator to automate this process.`,
        impact: "Critical - Prevents legal risk and improves accessibility",
        effort: "Low - Automated with The Alt Text platform",
        wcagCriterion: "WCAG 2.1 Level A - 1.1.1",
      });
    }

    if (summary.imagesWithEmptyAlt > 0) {
      recommendations.push({
        priority: "medium",
        title: "Review Empty Alt Text Usage",
        description: `${summary.imagesWithEmptyAlt} images have empty alt text. Verify these are truly decorative images. If not, add descriptive alt text.`,
        impact: "Medium - Improves user experience for screen reader users",
        effort: "Low - Manual review or automated analysis",
        wcagCriterion: "WCAG 2.1 Level A - 1.1.1",
      });
    }

    if (summary.complianceScore < 100) {
      recommendations.push({
        priority: "high",
        title: "Achieve 100% Compliance",
        description: `Your current compliance score is ${summary.complianceScore.toFixed(1)}%. Implement all recommended fixes to achieve full WCAG ${summary.wcagLevel} compliance.`,
        impact: "High - Eliminates legal risk and maximizes accessibility",
        effort: "Medium - Requires systematic implementation",
        wcagCriterion: `WCAG 2.1 Level ${summary.wcagLevel}`,
      });
    }

    return recommendations;
  }

  /**
   * Calculate ROI with industry-specific factors
   */
  private calculateROI(
    summary: ReportSummary,
    industryType?: string
  ): ROICalculation {
    const baseROI = calculateROI({
      imagesMissingAlt: summary.imagesMissingAlt,
      pagesScanned: summary.pagesScanned,
      industryType,
    });

    // Estimate time to compliance
    const totalViolations = summary.imagesMissingAlt + summary.imagesWithEmptyAlt;
    const timeToCompliance =
      totalViolations < 100
        ? "1-2 weeks"
        : totalViolations < 500
        ? "2-4 weeks"
        : "1-2 months";

    // Calculate compliance value (brand reputation, SEO benefits)
    const complianceValue = baseROI.estimatedCostSavings * 0.2; // 20% additional value

    return {
      ...baseROI,
      riskLevel: baseROI.riskLevel as "high" | "medium" | "low",
      complianceValue,
      timeToCompliance,
    };
  }

  /**
   * Generate PDF report using Puppeteer
   */
  private async generatePDF(
    reportId: number,
    summary: ReportSummary,
    violations: Violation[],
    recommendations: Recommendation[],
    roi: ROICalculation,
    config: ReportConfig
  ): Promise<string> {
    await this.initialize();

    const page = await this.browser!.newPage();

    // Generate HTML content
    const htmlContent = this.generateHTMLContent(
      summary,
      violations,
      recommendations,
      roi,
      config
    );

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "15mm",
        bottom: "20mm",
        left: "15mm",
      },
    });

    await page.close();

    // Upload to S3
    const fileName = `report-${reportId}-${Date.now()}.pdf`;
    const { url } = await storagePut(
      `reports/${fileName}`,
      Buffer.from(pdfBuffer),
      "application/pdf"
    );

    return url;
  }

  /**
   * Generate HTML report
   */
  private async generateHTML(
    reportId: number,
    summary: ReportSummary,
    violations: Violation[],
    recommendations: Recommendation[],
    roi: ROICalculation,
    config: ReportConfig
  ): Promise<string> {
    const htmlContent = this.generateHTMLContent(
      summary,
      violations,
      recommendations,
      roi,
      config
    );

    // Upload to S3
    const fileName = `report-${reportId}-${Date.now()}.html`;
    const { url } = await storagePut(
      `reports/${fileName}`,
      htmlContent,
      "text/html"
    );

    return url;
  }

  /**
   * Generate HTML content for report
   */
  private generateHTMLContent(
    summary: ReportSummary,
    violations: Violation[],
    recommendations: Recommendation[],
    roi: ROICalculation,
    config: ReportConfig
  ): string {
    const brandColor = config.brandColor || "#2563EB";

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessibility Compliance Report - ${summary.websiteUrl}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1f2937; line-height: 1.6; }
    .container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
    .header { background: linear-gradient(135deg, ${brandColor} 0%, #1e40af 100%); color: white; padding: 60px 40px; border-radius: 12px; margin-bottom: 40px; }
    .header h1 { font-size: 36px; font-weight: 700; margin-bottom: 12px; }
    .header p { font-size: 18px; opacity: 0.9; }
    .score-card { background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 30px; margin-bottom: 30px; }
    .score-big { font-size: 72px; font-weight: 700; color: ${brandColor}; margin-bottom: 8px; }
    .score-label { font-size: 18px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
    .stat-card { background: #f9fafb; border-radius: 8px; padding: 20px; }
    .stat-value { font-size: 32px; font-weight: 700; color: #111827; margin-bottom: 4px; }
    .stat-label { font-size: 14px; color: #6b7280; }
    .section { margin-bottom: 40px; }
    .section-title { font-size: 24px; font-weight: 700; margin-bottom: 20px; color: #111827; }
    .violation { background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 8px; margin-bottom: 16px; }
    .violation-title { font-size: 18px; font-weight: 600; color: #991b1b; margin-bottom: 8px; }
    .violation-desc { color: #7f1d1d; margin-bottom: 12px; }
    .violation-meta { font-size: 14px; color: #991b1b; }
    .recommendation { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px; margin-bottom: 16px; }
    .recommendation-title { font-size: 18px; font-weight: 600; color: #1e40af; margin-bottom: 8px; }
    .recommendation-desc { color: #1e3a8a; margin-bottom: 12px; }
    .recommendation-meta { font-size: 14px; color: #3b82f6; }
    .roi-section { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px; border-radius: 12px; margin-bottom: 40px; }
    .roi-title { font-size: 28px; font-weight: 700; margin-bottom: 24px; }
    .roi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
    .roi-card { background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(10px); border-radius: 8px; padding: 20px; }
    .roi-value { font-size: 36px; font-weight: 700; margin-bottom: 4px; }
    .roi-label { font-size: 14px; opacity: 0.9; }
    .footer { text-align: center; padding: 40px 20px; color: #6b7280; font-size: 14px; }
    .footer-attribution { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Accessibility Compliance Report</h1>
      <p>${summary.websiteUrl}</p>
      <p style="opacity: 0.8; margin-top: 8px;">Generated on ${new Date(summary.scanDate).toLocaleDateString()}</p>
    </div>

    <div class="score-card" style="text-align: center;">
      <div class="score-big">${summary.complianceScore.toFixed(1)}%</div>
      <div class="score-label">Compliance Score</div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${summary.pagesScanned}</div>
        <div class="stat-label">Pages Scanned</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${summary.totalImages}</div>
        <div class="stat-label">Total Images</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${summary.imagesMissingAlt}</div>
        <div class="stat-label">Missing Alt Text</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${summary.violationsFound}</div>
        <div class="stat-label">Total Violations</div>
      </div>
    </div>

    <div class="roi-section">
      <div class="roi-title">Return on Investment</div>
      <div class="roi-grid">
        <div class="roi-card">
          <div class="roi-value">$${roi.estimatedLawsuitRisk.toLocaleString()}</div>
          <div class="roi-label">Estimated Lawsuit Risk</div>
        </div>
        <div class="roi-card">
          <div class="roi-value">$${roi.estimatedCostSavings.toLocaleString()}</div>
          <div class="roi-label">Potential Cost Savings</div>
        </div>
        <div class="roi-card">
          <div class="roi-value">${roi.roiPercentage.toLocaleString()}%</div>
          <div class="roi-label">ROI Percentage</div>
        </div>
        <div class="roi-card">
          <div class="roi-value">${roi.timeToCompliance}</div>
          <div class="roi-label">Time to Compliance</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">Violations Found (${violations.length})</h2>
      ${violations.map(v => `
        <div class="violation">
          <div class="violation-title">${v.type} (${v.count} instances)</div>
          <div class="violation-desc">${v.description}</div>
          <div class="violation-meta">
            <strong>Severity:</strong> ${v.severity.toUpperCase()} | 
            <strong>WCAG:</strong> ${v.wcagCriterion}
          </div>
        </div>
      `).join('')}
    </div>

    <div class="section">
      <h2 class="section-title">Recommendations (${recommendations.length})</h2>
      ${recommendations.map(r => `
        <div class="recommendation">
          <div class="recommendation-title">${r.title}</div>
          <div class="recommendation-desc">${r.description}</div>
          <div class="recommendation-meta">
            <strong>Impact:</strong> ${r.impact} | 
            <strong>Effort:</strong> ${r.effort} | 
            <strong>WCAG:</strong> ${r.wcagCriterion}
          </div>
        </div>
      `).join('')}
    </div>

    <div class="footer">
      <p><strong>The Alt Text</strong> - AI-Powered Accessibility Compliance Platform</p>
      <p>thealttext.com</p>
      <div class="footer-attribution">
        Report generated using AI-powered analysis provided by free sources and APIs
      </div>
    </div>
  </div>
</body>
</html>
    `;
  }
}

// Export singleton instance
export const reporter = new ReporterModule();
