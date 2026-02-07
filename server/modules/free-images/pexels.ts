/**
 * Pexels API Integration
 * 
 * Free stock photos and videos with automatic attribution
 * API: https://www.pexels.com/api/
 */

export interface PexelsImage {
  id: number;
  url: string;
  originalUrl: string;
  width: number;
  height: number;
  photographer: string;
  photographerUrl: string;
  avgColor: string;
  attribution: string;
  attributionHtml: string;
}

export interface PexelsVideo {
  id: number;
  url: string;
  duration: number;
  width: number;
  height: number;
  videoFiles: Array<{
    quality: string;
    fileType: string;
    link: string;
  }>;
  user: {
    name: string;
    url: string;
  };
  attribution: string;
  attributionHtml: string;
}

export interface PexelsSearchParams {
  query: string;
  page?: number;
  perPage?: number;
  orientation?: 'landscape' | 'portrait' | 'square';
  size?: 'large' | 'medium' | 'small';
  color?: string;
}

/**
 * Search for images on Pexels
 */
/**
 * Generate mock Pexels images for testing
 */
function getMockPexelsImages(query: string, count: number): PexelsImage[] {
  const mockImages: PexelsImage[] = [];
  
  for (let i = 0; i < count; i++) {
    const id = 1000 + i;
    mockImages.push({
      id,
      url: `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg`,
      originalUrl: `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress`,
      width: 1920,
      height: 1080,
      photographer: `Mock Photographer ${i + 1}`,
      photographerUrl: `https://www.pexels.com/@mockuser${i + 1}`,
      avgColor: '#3B5998',
      attribution: `Photo by Mock Photographer ${i + 1} on Pexels`,
      attributionHtml: `<a href="https://www.pexels.com/@mockuser${i + 1}?utm_source=the_alt_text&utm_medium=referral">Photo by Mock Photographer ${i + 1}</a> on <a href="https://www.pexels.com?utm_source=the_alt_text&utm_medium=referral">Pexels</a>`,
    });
  }
  
  return mockImages;
}

/**
 * Generate mock Pexels videos for testing
 */
function getMockPexelsVideos(query: string, count: number): PexelsVideo[] {
  const mockVideos: PexelsVideo[] = [];
  
  for (let i = 0; i < count; i++) {
    const id = 2000 + i;
    mockVideos.push({
      id,
      url: `https://www.pexels.com/video/${id}`,
      duration: 15,
      width: 1920,
      height: 1080,
      videoFiles: [
        {
          quality: 'hd',
          fileType: 'video/mp4',
          link: `https://player.vimeo.com/external/${id}.hd.mp4`,
        },
      ],
      user: {
        name: `Mock Videographer ${i + 1}`,
        url: `https://www.pexels.com/@mockuser${i + 1}`,
      },
      attribution: `Video by Mock Videographer ${i + 1} on Pexels`,
      attributionHtml: `<a href="https://www.pexels.com/@mockuser${i + 1}?utm_source=the_alt_text&utm_medium=referral">Video by Mock Videographer ${i + 1}</a> on <a href="https://www.pexels.com?utm_source=the_alt_text&utm_medium=referral">Pexels</a>`,
    });
  }
  
  return mockVideos;
}

export async function searchPexels(params: PexelsSearchParams): Promise<PexelsImage[]> {
  const apiKey = process.env.PEXELS_API_KEY;
  
  // Mock mode: Return sample data if no API key
  if (!apiKey) {
    console.log('[Pexels] Running in MOCK mode - returning sample data');
    return getMockPexelsImages(params.query, params.perPage || 15);
  }

  const url = new URL('https://api.pexels.com/v1/search');
  url.searchParams.set('query', params.query);
  url.searchParams.set('page', String(params.page || 1));
  url.searchParams.set('per_page', String(params.perPage || 15));
  
  if (params.orientation) {
    url.searchParams.set('orientation', params.orientation);
  }
  
  if (params.size) {
    url.searchParams.set('size', params.size);
  }
  
  if (params.color) {
    url.searchParams.set('color', params.color);
  }

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Pexels API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  return data.photos.map((photo: any) => ({
    id: photo.id,
    url: photo.src.large,
    originalUrl: photo.src.original,
    width: photo.width,
    height: photo.height,
    photographer: photo.photographer,
    photographerUrl: photo.photographer_url,
    avgColor: photo.avg_color,
    attribution: `Photo by ${photo.photographer} on Pexels`,
    attributionHtml: `<a href="${photo.photographer_url}?utm_source=the_alt_text&utm_medium=referral" target="_blank" rel="noopener noreferrer">Photo by ${photo.photographer}</a> on <a href="https://www.pexels.com?utm_source=the_alt_text&utm_medium=referral" target="_blank" rel="noopener noreferrer">Pexels</a>`,
  }));
}

/**
 * Search for videos on Pexels
 */
export async function searchPexelsVideos(params: PexelsSearchParams): Promise<PexelsVideo[]> {
  const apiKey = process.env.PEXELS_API_KEY;
  
  // Mock mode: Return sample data if no API key
  if (!apiKey) {
    console.log('[Pexels] Running in MOCK mode - returning sample data');
    return getMockPexelsVideos(params.query, params.perPage || 15);
  }

  const url = new URL('https://api.pexels.com/videos/search');
  url.searchParams.set('query', params.query);
  url.searchParams.set('page', String(params.page || 1));
  url.searchParams.set('per_page', String(params.perPage || 15));
  
  if (params.orientation) {
    url.searchParams.set('orientation', params.orientation);
  }
  
  if (params.size) {
    url.searchParams.set('size', params.size);
  }

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Pexels API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  return data.videos.map((video: any) => ({
    id: video.id,
    url: video.url,
    duration: video.duration,
    width: video.width,
    height: video.height,
    videoFiles: video.video_files.map((file: any) => ({
      quality: file.quality,
      fileType: file.file_type,
      link: file.link,
    })),
    user: {
      name: video.user.name,
      url: video.user.url,
    },
    attribution: `Video by ${video.user.name} on Pexels`,
    attributionHtml: `<a href="${video.user.url}?utm_source=the_alt_text&utm_medium=referral" target="_blank" rel="noopener noreferrer">Video by ${video.user.name}</a> on <a href="https://www.pexels.com?utm_source=the_alt_text&utm_medium=referral" target="_blank" rel="noopener noreferrer">Pexels</a>`,
  }));
}

/**
 * Get curated (popular) images from Pexels
 */
export async function getCuratedPexels(page: number = 1, perPage: number = 15): Promise<PexelsImage[]> {
  const apiKey = process.env.PEXELS_API_KEY;
  
  // Mock mode: Return sample data if no API key
  if (!apiKey) {
    console.log('[Pexels] Running in MOCK mode - returning sample data');
    return getMockPexelsImages('curated', perPage);
  }

  const url = new URL('https://api.pexels.com/v1/curated');
  url.searchParams.set('page', String(page));
  url.searchParams.set('per_page', String(perPage));

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Pexels API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  return data.photos.map((photo: any) => ({
    id: photo.id,
    url: photo.src.large,
    originalUrl: photo.src.original,
    width: photo.width,
    height: photo.height,
    photographer: photo.photographer,
    photographerUrl: photo.photographer_url,
    avgColor: photo.avg_color,
    attribution: `Photo by ${photo.photographer} on Pexels`,
    attributionHtml: `<a href="${photo.photographer_url}?utm_source=the_alt_text&utm_medium=referral" target="_blank" rel="noopener noreferrer">Photo by ${photo.photographer}</a> on <a href="https://www.pexels.com?utm_source=the_alt_text&utm_medium=referral" target="_blank" rel="noopener noreferrer">Pexels</a>`,
  }));
}

/**
 * Generate attribution footer HTML for multiple images/videos
 */
export function generateAttributionFooter(items: Array<PexelsImage | PexelsVideo>): string {
  if (items.length === 0) return '';

  const attributions = items.map(item => item.attributionHtml).join('<br>');

  return `
    <div style="margin-top: 2rem; padding: 1rem; background-color: #f5f5f5; border-top: 1px solid #e0e0e0; font-size: 0.875rem; color: #666;">
      <strong>Media Credits:</strong><br>
      ${attributions}
    </div>
  `;
}
