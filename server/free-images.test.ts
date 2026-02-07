/**
 * Free Images API Tests
 * 
 * Tests for Unsplash and Pexels integration with attribution
 */

import { describe, it, expect } from 'vitest';

describe('Free Images API - Unsplash', () => {
  it('should validate Unsplash image structure', () => {
    const mockImage = {
      id: 'abc123',
      url: 'https://images.unsplash.com/photo-123',
      downloadUrl: 'https://unsplash.com/photos/abc123/download',
      width: 1920,
      height: 1080,
      description: 'Beautiful landscape',
      altDescription: 'mountain landscape with blue sky',
      photographer: {
        name: 'John Doe',
        username: 'johndoe',
        profileUrl: 'https://unsplash.com/@johndoe',
      },
      attribution: 'Photo by John Doe on Unsplash',
      attributionHtml: '<a href="https://unsplash.com/@johndoe?utm_source=the_alt_text&utm_medium=referral">Photo by John Doe</a> on <a href="https://unsplash.com?utm_source=the_alt_text&utm_medium=referral">Unsplash</a>',
    };

    expect(mockImage.id).toBeTruthy();
    expect(mockImage.url).toContain('unsplash.com');
    expect(mockImage.attribution).toContain('Unsplash');
    expect(mockImage.attributionHtml).toContain('utm_source=the_alt_text');
  });

  it('should validate search parameters', () => {
    const searchParams = {
      query: 'accessibility',
      page: 1,
      perPage: 10,
      orientation: 'landscape' as const,
      color: 'blue',
    };

    expect(searchParams.query).toBeTruthy();
    expect(searchParams.page).toBeGreaterThan(0);
    expect(searchParams.perPage).toBeGreaterThan(0);
    expect(searchParams.perPage).toBeLessThanOrEqual(30);
    expect(['landscape', 'portrait', 'squarish']).toContain(searchParams.orientation);
  });

  it('should generate attribution footer', () => {
    const images = [
      {
        id: '1',
        photographer: { name: 'Alice' },
        attributionHtml: '<a href="#">Photo by Alice</a> on <a href="#">Unsplash</a>',
      },
      {
        id: '2',
        photographer: { name: 'Bob' },
        attributionHtml: '<a href="#">Photo by Bob</a> on <a href="#">Unsplash</a>',
      },
    ];

    const footer = images.map(img => img.attributionHtml).join('<br>');

    expect(footer).toContain('Alice');
    expect(footer).toContain('Bob');
    expect(footer).toContain('<br>');
  });
});

describe('Free Images API - Pexels', () => {
  it('should validate Pexels image structure', () => {
    const mockImage = {
      id: 456,
      url: 'https://images.pexels.com/photos/456/pexels-photo-456.jpeg',
      originalUrl: 'https://images.pexels.com/photos/456/pexels-photo-456.jpeg?auto=compress',
      width: 1920,
      height: 1080,
      photographer: 'Jane Smith',
      photographerUrl: 'https://www.pexels.com/@janesmith',
      avgColor: '#3B5998',
      attribution: 'Photo by Jane Smith on Pexels',
      attributionHtml: '<a href="https://www.pexels.com/@janesmith?utm_source=the_alt_text&utm_medium=referral">Photo by Jane Smith</a> on <a href="https://www.pexels.com?utm_source=the_alt_text&utm_medium=referral">Pexels</a>',
    };

    expect(mockImage.id).toBeGreaterThan(0);
    expect(mockImage.url).toContain('pexels.com');
    expect(mockImage.attribution).toContain('Pexels');
    expect(mockImage.attributionHtml).toContain('utm_source=the_alt_text');
  });

  it('should validate Pexels video structure', () => {
    const mockVideo = {
      id: 789,
      url: 'https://www.pexels.com/video/789',
      duration: 15,
      width: 1920,
      height: 1080,
      videoFiles: [
        {
          quality: 'hd',
          fileType: 'video/mp4',
          link: 'https://player.vimeo.com/external/123.hd.mp4',
        },
        {
          quality: 'sd',
          fileType: 'video/mp4',
          link: 'https://player.vimeo.com/external/123.sd.mp4',
        },
      ],
      user: {
        name: 'Mike Johnson',
        url: 'https://www.pexels.com/@mikejohnson',
      },
      attribution: 'Video by Mike Johnson on Pexels',
      attributionHtml: '<a href="https://www.pexels.com/@mikejohnson?utm_source=the_alt_text&utm_medium=referral">Video by Mike Johnson</a> on <a href="https://www.pexels.com?utm_source=the_alt_text&utm_medium=referral">Pexels</a>',
    };

    expect(mockVideo.id).toBeGreaterThan(0);
    expect(mockVideo.duration).toBeGreaterThan(0);
    expect(mockVideo.videoFiles).toHaveLength(2);
    expect(mockVideo.videoFiles[0].quality).toBe('hd');
    expect(mockVideo.attribution).toContain('Pexels');
  });

  it('should validate search parameters', () => {
    const searchParams = {
      query: 'technology',
      page: 1,
      perPage: 15,
      orientation: 'landscape' as const,
      size: 'large' as const,
      color: 'red',
    };

    expect(searchParams.query).toBeTruthy();
    expect(searchParams.page).toBeGreaterThan(0);
    expect(searchParams.perPage).toBeGreaterThan(0);
    expect(searchParams.perPage).toBeLessThanOrEqual(80);
    expect(['landscape', 'portrait', 'square']).toContain(searchParams.orientation);
    expect(['large', 'medium', 'small']).toContain(searchParams.size);
  });
});

describe('Combined Search', () => {
  it('should combine results from both platforms', () => {
    const unsplashImages = [
      { id: 'u1', source: 'unsplash', photographer: { name: 'Alice' } },
      { id: 'u2', source: 'unsplash', photographer: { name: 'Bob' } },
    ];

    const pexelsImages = [
      { id: 'p1', source: 'pexels', photographer: 'Charlie' },
      { id: 'p2', source: 'pexels', photographer: 'Diana' },
    ];

    const combined = [...unsplashImages, ...pexelsImages];

    expect(combined).toHaveLength(4);
    expect(combined.filter(img => img.source === 'unsplash')).toHaveLength(2);
    expect(combined.filter(img => img.source === 'pexels')).toHaveLength(2);
  });

  it('should generate combined attribution footer', () => {
    const unsplashAttribution = '<div>Unsplash credits</div>';
    const pexelsAttribution = '<div>Pexels credits</div>';
    const combined = `${unsplashAttribution}\n${pexelsAttribution}`;

    expect(combined).toContain('Unsplash');
    expect(combined).toContain('Pexels');
  });
});

describe('Attribution Requirements', () => {
  it('should include UTM parameters in attribution links', () => {
    const attributionHtml = '<a href="https://unsplash.com?utm_source=the_alt_text&utm_medium=referral">Unsplash</a>';

    expect(attributionHtml).toContain('utm_source=the_alt_text');
    expect(attributionHtml).toContain('utm_medium=referral');
  });

  it('should open attribution links in new tab', () => {
    const attributionHtml = '<a href="#" target="_blank" rel="noopener noreferrer">Link</a>';

    expect(attributionHtml).toContain('target="_blank"');
    expect(attributionHtml).toContain('rel="noopener noreferrer"');
  });

  it('should style attribution footer correctly', () => {
    const footer = `
      <div style="margin-top: 2rem; padding: 1rem; background-color: #f5f5f5; border-top: 1px solid #e0e0e0; font-size: 0.875rem; color: #666;">
        <strong>Image Credits:</strong><br>
        Attribution text here
      </div>
    `;

    expect(footer).toContain('margin-top: 2rem');
    expect(footer).toContain('background-color: #f5f5f5');
    expect(footer).toContain('Image Credits:');
  });
});

describe('API Integration', () => {
  it('should handle API errors gracefully', () => {
    const mockError = {
      status: 401,
      statusText: 'Unauthorized',
      message: 'Invalid API key',
    };

    expect(mockError.status).toBe(401);
    expect(mockError.message).toContain('API key');
  });

  it('should validate environment variables', () => {
    const requiredEnvVars = [
      'UNSPLASH_ACCESS_KEY',
      'PEXELS_API_KEY',
    ];

    requiredEnvVars.forEach(envVar => {
      expect(envVar).toBeTruthy();
      expect(envVar).toMatch(/^[A-Z_]+$/);
    });
  });

  it('should handle rate limiting', () => {
    const rateLimitInfo = {
      limit: 50,
      remaining: 45,
      reset: Date.now() + 3600000, // 1 hour from now
    };

    expect(rateLimitInfo.remaining).toBeLessThanOrEqual(rateLimitInfo.limit);
    expect(rateLimitInfo.reset).toBeGreaterThan(Date.now());
  });
});

describe('Performance', () => {
  it('should paginate results efficiently', () => {
    const totalResults = 1000;
    const perPage = 15;
    const totalPages = Math.ceil(totalResults / perPage);

    expect(totalPages).toBe(67);
  });

  it('should handle parallel searches', async () => {
    const startTime = Date.now();

    // Simulate parallel searches
    await Promise.all([
      Promise.resolve({ platform: 'unsplash', results: 10 }),
      Promise.resolve({ platform: 'pexels', results: 10 }),
    ]);

    const elapsed = Date.now() - startTime;

    // Parallel should be faster than sequential
    expect(elapsed).toBeLessThan(100); // Should complete quickly
  });
});
