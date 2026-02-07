/**
 * Module 02: Neurodivergent UI Adapter - tRPC Router
 * 
 * Handles neurodivergent profile creation, retrieval, and UI customization.
 */

import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { neurodivergentProfiles } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const neurodivergentRouter = router({
  /**
   * Get current user's neurodivergent profile
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const [profile] = await db
      .select()
      .from(neurodivergentProfiles)
      .where(eq(neurodivergentProfiles.userId, ctx.user.id))
      .limit(1);
    
    return profile || null;
  }),

  /**
   * Create or update neurodivergent profile
   */
  upsertProfile: protectedProcedure
    .input(
      z.object({
        profileType: z.enum(["adhd", "autism", "anxiety", "dyslexia", "vampire", "none"]),
        uiComplexity: z.enum(["minimal", "standard", "detailed"]).default("standard"),
        languageTone: z.enum(["simple", "professional", "technical"]).default("simple"),
        colorScheme: z.enum(["light", "dark", "auto"]).default("auto"),
        reducedAnimations: z.boolean().default(false),
        highContrast: z.boolean().default(false),
        largeText: z.boolean().default(false),
        focusMode: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Check if profile exists
      const [existing] = await db
        .select()
        .from(neurodivergentProfiles)
        .where(eq(neurodivergentProfiles.userId, ctx.user.id))
        .limit(1);
      
      if (existing) {
        // Update existing profile
        await db
          .update(neurodivergentProfiles)
          .set({
            ...input,
            updatedAt: new Date(),
          })
          .where(eq(neurodivergentProfiles.userId, ctx.user.id));
      } else {
        // Create new profile
        await db.insert(neurodivergentProfiles).values({
          userId: ctx.user.id,
          ...input,
        });
      }
      
      return { success: true };
    }),

  /**
   * Delete neurodivergent profile
   */
  deleteProfile: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    await db
      .delete(neurodivergentProfiles)
      .where(eq(neurodivergentProfiles.userId, ctx.user.id));
    
    return { success: true };
  }),
});

// Export as both "neurodivergent" and "profile" for compatibility
export const profileRouter = neurodivergentRouter;
