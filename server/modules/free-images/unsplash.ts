/**
 * Unsplash API Integration
 * 
 * Free stock photos with automatic attribution
 * API: https://unsplash.com/developers
 */

export interface UnsplashImage {
  id: string;
  url: string;
  downloadUrl: string;
  width: number;
  height: number;
  description: string | null;
  altDescription: string | null;
  photographer: {
    name: string;
    username: string;
    profileUrl: string;
  };
  attribution: string;
  attributionHtml: string;
}

export interface UnsplashSearchParams {
  query: string;
  page?: number;
  perPage?: number;
  orientation?: 'landscape' | 'portrait' | 'squarish';
  color?: string;
}

/**
 * Generate mock Unsplash images for testing
 */
function getMockUnsplashImages(query: string, count: number): UnsplashImage[] {
  const mockImages: UnsplashImage[] = [];
  
  for (let i = 0; i < count; i++) {
    const id = `mock-unsplash-${i + 1}`;
    mockImages.push({
      id,
      url: `https://images.unsplash.com/photo-${id}?w=1920`,
      downloadUrl: `https://unsplash.com/photos/${id}/download`,
      width: 1920,
      height: 1080,
      description: `Mock ${query} image ${i + 1}`,
      altDescription: `${query} photo for testing`,
      photographer: {
        name: `Mock Photographer ${i + 1}`,
        username: `mockuser${i + 1}`,
        profileUrl: `https://unsplash.com/@mockuser${i + 1}`,
      },
      attribution: `Photo by Mock Photographer ${i + 1} on Unsplash`,
      attributionHtml: `<a href="https://unsplash.com/@mockuser${i + 1}?utm_source=the_alt_text&utm_medium=referral">Photo by Mock Photographer ${i + 1}</a> on <a href="https://unsplash.com?utm_source=the_alt_text&utm_medium=referral">Unsplash</a>`,
    });
  }
  
  return mockImages;
}

/**
 * Search for images on Unsplash
 */
export async function searchUnsplash(params: UnsplashSearchParams): Promise<UnsplashImage[]> {
  const apiKey = process.env.UNSPLASH_ACCESS_KEY;
  
  // Mock mode: Return sample data if no API key
  if (!apiKey) {
    console.log('[Unsplash] Running in MOCK mode - returning sample data');
    return getMockUnsplashImages(params.query, params.perPage || 10);
  }

  const url = new URL('https://api.unsplash.com/search/photos');
  url.searchParams.set('query', params.query);
  url.searchParams.set('page', String(params.page || 1));
  url.searchParams.set('per_page', String(params.perPage || 10));
  
  if (params.orientation) {
    url.searchParams.set('orientation', params.orientation);
  }
  
  if (params.color) {
    url.searchParams.set('color', params.color);
  }

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Client-ID ${apiKey}`,
      'Accept-Version': 'v1',
    },
  });

  if (!response.ok) {
    throw new Error(`Unsplash API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  return data.results.map((photo: any) => ({
    id: photo.id,
    url: photo.urls.regular,
    downloadUrl: photo.links.download,
    width: photo.width,
    height: photo.height,
    description: photo.description,
    altDescription: photo.alt_description,
    photographer: {
      name: photo.user.name,
      username: photo.user.username,
      profileUrl: photo.user.links.html,
    },
    attribution: `Photo by ${photo.user.name} on Unsplash`,
    attributionHtml: `<a href="${photo.user.links.html}?utm_source=the_alt_text&utm_medium=referral" target="_blank" rel="noopener noreferrer">Photo by ${photo.user.name}</a> on <a href="https://unsplash.com?utm_source=the_alt_text&utm_medium=referral" target="_blank" rel="noopener noreferrer">Unsplash</a>`,
  }));
}

/**
 * Get a random image from Unsplash
 */
export async function getRandomUnsplash(query?: string): Promise<UnsplashImage> {
  const apiKey = process.env.UNSPLASH_ACCESS_KEY;
  
  // Mock mode: Return sample data if no API key
  if (!apiKey) {
    console.log('[Unsplash] Running in MOCK mode - returning sample data');
    const mockImages = getMockUnsplashImages(query || 'random', 1);
    return mockImages[0];
  }

  const url = new URL('https://api.unsplash.com/photos/random');
  
  if (query) {
    url.searchParams.set('query', query);
  }

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Client-ID ${apiKey}`,
      'Accept-Version': 'v1',
    },
  });

  if (!response.ok) {
    throw new Error(`Unsplash API error: ${response.status} ${response.statusText}`);
  }

  const photo = await response.json();

  return {
    id: photo.id,
    url: photo.urls.regular,
    downloadUrl: photo.links.download,
    width: photo.width,
    height: photo.height,
    description: photo.description,
    altDescription: photo.alt_description,
    photographer: {
      name: photo.user.name,
      username: photo.user.username,
      profileUrl: photo.user.links.html,
    },
    attribution: `Photo by ${photo.user.name} on Unsplash`,
    attributionHtml: `<a href="${photo.user.links.html}?utm_source=the_alt_text&utm_medium=referral" target="_blank" rel="noopener noreferrer">Photo by ${photo.user.name}</a> on <a href="https://unsplash.com?utm_source=the_alt_text&utm_medium=referral" target="_blank" rel="noopener noreferrer">Unsplash</a>`,
  };
}

/**
 * Track download (required by Unsplash API guidelines)
 */
export async function trackUnsplashDownload(downloadUrl: string): Promise<void> {
  const apiKey = process.env.UNSPLASH_ACCESS_KEY;
  
  // Mock mode: Skip tracking if no API key
  if (!apiKey) {
    console.log('[Unsplash] Running in MOCK mode - skipping download tracking');
    return;
  }

  await fetch(downloadUrl, {
    headers: {
      'Authorization': `Client-ID ${apiKey}`,
    },
  });
}

/**
 * Generate attribution footer HTML
 */
export function generateAttributionFooter(images: UnsplashImage[]): string {
  if (images.length === 0) return '';

  const attributions = images.map(img => img.attributionHtml).join('<br>');

  return `
    <div style="margin-top: 2rem; padding: 1rem; background-color: #f5f5f5; border-top: 1px solid #e0e0e0; font-size: 0.875rem; color: #666;">
      <strong>Image Credits:</strong><br>
      ${attributions}
    </div>
  `;
}
