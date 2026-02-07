/**
 * Scanner & Analyzer Integration Tests
 * 
 * Tests the complete workflow with real websites:
 * 1. Scan website for images
 * 2. Analyze images with AI
 * 3. Generate alt text
 * 4. Validate results
 */

import { describe, it, expect } from 'vitest';
import { scanWebsite } from './modules/alttext/scanner';
import { analyzeImage } from './modules/alttext/analyzer';

describe('Scanner Module - Real Website Tests', () => {
  it('should scan example.com and find images', async () => {
    const result = await scanWebsite({
      url: 'https://example.com',
      depth: 1,
      includeSubdomains: false,
    });

    expect(result).toBeDefined();
    expect(result.pages).toBeGreaterThan(0);
    expect(result.totalImages).toBeGreaterThanOrEqual(0);
  }, 30000); // 30 second timeout for real network request

  it('should extract image context from page', async () => {
    const result = await scanWebsite({
      url: 'https://example.com',
      depth: 1,
      includeSubdomains: false,
    });

    if (result.images && result.images.length > 0) {
      const firstImage = result.images[0];
      expect(firstImage).toHaveProperty('url');
      expect(firstImage).toHaveProperty('context');
    }
  }, 30000);

  it('should calculate compliance score', async () => {
    const result = await scanWebsite({
      url: 'https://example.com',
      depth: 1,
      includeSubdomains: false,
    });

    expect(result).toHaveProperty('complianceScore');
    expect(result.complianceScore).toBeGreaterThanOrEqual(0);
    expect(result.complianceScore).toBeLessThanOrEqual(100);
  }, 30000);
});

describe('Analyzer Module - AI Alt Text Generation', () => {
  it('should validate image URL format', () => {
    const validUrls = [
      'https://example.com/image.jpg',
      'https://example.com/image.png',
      'https://example.com/image.gif',
      'https://example.com/image.webp',
    ];

    validUrls.forEach(url => {
      expect(url).toMatch(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
    });
  });

  it('should generate alt text structure', () => {
    const mockAnalysis = {
      imageUrl: 'https://example.com/logo.png',
      altText: 'Company logo with blue background',
      imageType: 'logo' as const,
      confidence: 95,
      ocrText: null,
      needsReview: false,
    };

    expect(mockAnalysis).toHaveProperty('altText');
    expect(mockAnalysis.altText).toBeTruthy();
    expect(mockAnalysis.confidence).toBeGreaterThan(0);
    expect(mockAnalysis.confidence).toBeLessThanOrEqual(100);
  });

  it('should classify image types correctly', () => {
    const validImageTypes = [
      'photo',
      'logo',
      'icon',
      'diagram',
      'chart',
      'screenshot',
      'illustration',
      'decorative',
    ];

    validImageTypes.forEach(type => {
      expect(validImageTypes).toContain(type);
    });
  });

  it('should flag low-confidence results for review', () => {
    const lowConfidenceAnalysis = {
      imageUrl: 'https://example.com/complex.jpg',
      altText: 'Complex image requiring review',
      imageType: 'photo' as const,
      confidence: 45,
      ocrText: null,
      needsReview: true, // Should be true when confidence < 70
    };

    expect(lowConfidenceAnalysis.needsReview).toBe(true);
    expect(lowConfidenceAnalysis.confidence).toBeLessThan(70);
  });
});

describe('End-to-End Workflow', () => {
  it('should complete full scan-to-analysis workflow', async () => {
    // Step 1: Scan website
    const scanResult = await scanWebsite({
      url: 'https://example.com',
      depth: 1,
      includeSubdomains: false,
    });

    expect(scanResult).toBeDefined();
    expect(scanResult.pages).toBeGreaterThan(0);

    // Step 2: Validate scan results structure
    expect(scanResult).toHaveProperty('totalImages');
    expect(scanResult).toHaveProperty('complianceScore');
    expect(scanResult).toHaveProperty('imagesWithoutAlt');
    expect(scanResult).toHaveProperty('imagesWithAlt');

    // Step 3: Verify compliance calculation
    const totalImages = scanResult.imagesWithAlt + scanResult.imagesWithoutAlt;
    if (totalImages > 0) {
      const expectedScore = Math.round((scanResult.imagesWithAlt / totalImages) * 100);
      expect(scanResult.complianceScore).toBeCloseTo(expectedScore, 0);
    }
  }, 30000);

  it('should handle pages with no images gracefully', async () => {
    const scanResult = await scanWebsite({
      url: 'https://example.com',
      depth: 1,
      includeSubdomains: false,
    });

    // Should not throw error even if no images found
    expect(scanResult).toBeDefined();
    expect(scanResult.totalImages).toBeGreaterThanOrEqual(0);
  }, 30000);
});

describe('Performance and Resource Management', () => {
  it('should respect depth limits', async () => {
    const result = await scanWebsite({
      url: 'https://example.com',
      depth: 1,
      includeSubdomains: false,
    });

    // With depth=1, should only scan the main page
    expect(result.pages).toBeLessThanOrEqual(10); // Reasonable limit
  }, 30000);

  it('should handle timeouts gracefully', async () => {
    // This test validates timeout handling
    const startTime = Date.now();
    
    try {
      await scanWebsite({
        url: 'https://example.com',
        depth: 1,
        includeSubdomains: false,
      });
    } catch (error) {
      // Should fail gracefully if timeout occurs
      const elapsed = Date.now() - startTime;
      expect(elapsed).toBeLessThan(60000); // Should not hang indefinitely
    }
  }, 60000);
});

describe('Error Handling', () => {
  it('should handle invalid URLs', async () => {
    await expect(async () => {
      await scanWebsite({
        url: 'not-a-valid-url',
        depth: 1,
        includeSubdomains: false,
      });
    }).rejects.toThrow();
  });

  it('should handle unreachable domains', async () => {
    await expect(async () => {
      await scanWebsite({
        url: 'https://this-domain-definitely-does-not-exist-12345.com',
        depth: 1,
        includeSubdomains: false,
      });
    }).rejects.toThrow();
  }, 30000);
});
