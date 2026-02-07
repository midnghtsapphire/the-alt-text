/**
 * Free Images API Router
 * 
 * Provides access to Unsplash and Pexels free stock photos/videos
 * with automatic attribution
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  searchUnsplash,
  getRandomUnsplash,
  trackUnsplashDownload,
  generateAttributionFooter as generateUnsplashAttribution,
} from "./modules/free-images/unsplash";
import {
  searchPexels,
  searchPexelsVideos,
  getCuratedPexels,
  generateAttributionFooter as generatePexelsAttribution,
} from "./modules/free-images/pexels";

export const freeImagesRouter = router({
  /**
   * Search Unsplash for images
   */
  searchUnsplash: publicProcedure
    .input(z.object({
      query: z.string(),
      page: z.number().min(1).default(1),
      perPage: z.number().min(1).max(30).default(10),
      orientation: z.enum(['landscape', 'portrait', 'squarish']).optional(),
      color: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const images = await searchUnsplash(input);
      const attributionFooter = generateUnsplashAttribution(images);

      return {
        images,
        attributionFooter,
        total: images.length,
        page: input.page,
      };
    }),

  /**
   * Get random Unsplash image
   */
  getRandomUnsplash: publicProcedure
    .input(z.object({
      query: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const image = await getRandomUnsplash(input.query);

      return {
        image,
        attribution: image.attribution,
        attributionHtml: image.attributionHtml,
      };
    }),

  /**
   * Track Unsplash download (required by API guidelines)
   */
  trackUnsplashDownload: publicProcedure
    .input(z.object({
      downloadUrl: z.string().url(),
    }))
    .mutation(async ({ input }) => {
      await trackUnsplashDownload(input.downloadUrl);

      return {
        success: true,
        message: 'Download tracked successfully',
      };
    }),

  /**
   * Search Pexels for images
   */
  searchPexels: publicProcedure
    .input(z.object({
      query: z.string(),
      page: z.number().min(1).default(1),
      perPage: z.number().min(1).max(80).default(15),
      orientation: z.enum(['landscape', 'portrait', 'square']).optional(),
      size: z.enum(['large', 'medium', 'small']).optional(),
      color: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const images = await searchPexels(input);
      const attributionFooter = generatePexelsAttribution(images);

      return {
        images,
        attributionFooter,
        total: images.length,
        page: input.page,
      };
    }),

  /**
   * Search Pexels for videos
   */
  searchPexelsVideos: publicProcedure
    .input(z.object({
      query: z.string(),
      page: z.number().min(1).default(1),
      perPage: z.number().min(1).max(80).default(15),
      orientation: z.enum(['landscape', 'portrait', 'square']).optional(),
      size: z.enum(['large', 'medium', 'small']).optional(),
    }))
    .query(async ({ input }) => {
      const videos = await searchPexelsVideos(input);
      const attributionFooter = generatePexelsAttribution(videos);

      return {
        videos,
        attributionFooter,
        total: videos.length,
        page: input.page,
      };
    }),

  /**
   * Get curated (popular) Pexels images
   */
  getCuratedPexels: publicProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      perPage: z.number().min(1).max(80).default(15),
    }))
    .query(async ({ input }) => {
      const images = await getCuratedPexels(input.page, input.perPage);
      const attributionFooter = generatePexelsAttribution(images);

      return {
        images,
        attributionFooter,
        total: images.length,
        page: input.page,
      };
    }),

  /**
   * Search both Unsplash and Pexels (combined results)
   */
  searchAll: publicProcedure
    .input(z.object({
      query: z.string(),
      page: z.number().min(1).default(1),
      perPage: z.number().min(1).max(20).default(10),
    }))
    .query(async ({ input }) => {
      // Search both platforms in parallel
      const [unsplashImages, pexelsImages] = await Promise.all([
        searchUnsplash({
          query: input.query,
          page: input.page,
          perPage: Math.ceil(input.perPage / 2),
        }),
        searchPexels({
          query: input.query,
          page: input.page,
          perPage: Math.ceil(input.perPage / 2),
        }),
      ]);

      // Combine results
      const allImages = [
        ...unsplashImages.map(img => ({ ...img, source: 'unsplash' })),
        ...pexelsImages.map(img => ({ ...img, source: 'pexels' })),
      ];

      // Generate combined attribution
      const unsplashAttribution = generateUnsplashAttribution(unsplashImages);
      const pexelsAttribution = generatePexelsAttribution(pexelsImages);
      const combinedAttribution = `${unsplashAttribution}\n${pexelsAttribution}`;

      return {
        images: allImages,
        attributionFooter: combinedAttribution,
        total: allImages.length,
        page: input.page,
        sources: {
          unsplash: unsplashImages.length,
          pexels: pexelsImages.length,
        },
      };
    }),
});
