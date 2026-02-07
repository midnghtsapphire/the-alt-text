/**
 * OZ Image Helper
 * 
 * Helper functions for integrating free images with OZ Marketing content
 */

import { searchUnsplash } from './free-images/unsplash';
import { searchPexels } from './free-images/pexels';

export interface ImageData {
  url: string;
  attribution: string;
  photographer: string;
  platform: 'unsplash' | 'pexels';
}

/**
 * Fetch a single image from Unsplash or Pexels
 */
export async function fetchImageForContent(
  query: string,
  platform: 'unsplash' | 'pexels' | 'auto' = 'auto'
): Promise<ImageData | null> {
  try {
    if (platform === 'unsplash' || platform === 'auto') {
      const images = await searchUnsplash({ query, perPage: 1 });
      if (images.length > 0) {
        return {
          url: images[0].url,
          attribution: images[0].attributionHtml,
          photographer: images[0].photographer.name,
          platform: 'unsplash',
        };
      }
    }

    if (platform === 'pexels' || platform === 'auto') {
      const images = await searchPexels({ query, perPage: 1 });
      if (images.length > 0) {
        return {
          url: images[0].url,
          attribution: images[0].attributionHtml,
          photographer: images[0].photographer,
          platform: 'pexels',
        };
      }
    }

    return null;
  } catch (error) {
    console.error('[OZ Image Helper] Error fetching image:', error);
    return null;
  }
}

/**
 * Generate image markdown with attribution
 */
export function formatImageMarkdown(imageData: ImageData): string {
  return `![Photo by ${imageData.photographer}](${imageData.url})

${imageData.attribution}`;
}

/**
 * Generate image HTML with attribution
 */
export function formatImageHTML(imageData: ImageData, alt?: string): string {
  return `<img src="${imageData.url}" alt="${alt || `Photo by ${imageData.photographer}`}" style="max-width: 100%; height: auto;" />
<p style="font-size: 12px; color: #666;">${imageData.attribution}</p>`;
}
