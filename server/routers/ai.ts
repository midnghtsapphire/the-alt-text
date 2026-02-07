/**
 * AI Router - AI-powered features
 * 
 * Handles AI-driven career assessments, recommendations, and analysis.
 */

import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { invokeLLM } from "../_core/llm";

export const aiRouter = router({
  /**
   * Assess career fit based on user responses
   */
  assessCareer: publicProcedure
    .input(
      z.object({
        responses: z.record(z.string(), z.any()),
        backgrounds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { responses, backgrounds } = input;
      
      // Build assessment prompt
      const prompt = `You are a career counselor specializing in the tool and die industry. 
      
Based on the following assessment responses, provide a detailed career fit analysis:

${Object.entries(responses)
  .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
  .join("\n")}

${backgrounds && backgrounds.length > 0 ? `\nBackgrounds: ${backgrounds.join(", ")}` : ""}

Provide:
1. Overall career fit score (0-100)
2. Key strengths for this career path
3. Areas for development
4. Recommended next steps
5. Specific role recommendations in the tool & die industry

Format your response as JSON with these fields: score, strengths (array), development_areas (array), next_steps (array), recommended_roles (array).`;

      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are a career assessment expert. Provide detailed, actionable career guidance.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "career_assessment",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  score: {
                    type: "number",
                    description: "Career fit score from 0-100",
                  },
                  strengths: {
                    type: "array",
                    items: { type: "string" },
                    description: "Key strengths for this career",
                  },
                  development_areas: {
                    type: "array",
                    items: { type: "string" },
                    description: "Areas that need development",
                  },
                  next_steps: {
                    type: "array",
                    items: { type: "string" },
                    description: "Recommended next steps",
                  },
                  recommended_roles: {
                    type: "array",
                    items: { type: "string" },
                    description: "Specific job roles in tool & die industry",
                  },
                },
                required: ["score", "strengths", "development_areas", "next_steps", "recommended_roles"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0].message.content;
        const result = JSON.parse(typeof content === 'string' ? content : "{}");
        
        return {
          success: true,
          assessment: result,
        };
      } catch (error) {
        console.error("AI assessment error:", error);
        throw new Error("Failed to generate career assessment");
      }
    }),
});
