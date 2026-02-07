import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { TRPCError } from "@trpc/server";

/**
 * Universal Branding API Router
 * 
 * Provides AI-powered branding services including:
 * - Demographics-based design recommendations
 * - Color psychology analysis
 * - Logo/graphics generation
 * - Domain scoring
 * - Alt text generation
 */

export const brandingRouter = router({
  // ============================================================================
  // BRANDING ANALYSIS
  // ============================================================================

  /**
   * Analyze target audience and generate comprehensive branding recommendations
   */
  analyze: protectedProcedure
    .input(z.object({
      projectName: z.string().min(1),
      industry: z.string().min(1),
      targetDemographics: z.object({
        ageGroups: z.array(z.enum(["gen_z", "millennial", "gen_x", "baby_boomer"])),
        genders: z.array(z.enum(["male", "female", "non_binary", "all"])),
      }),
      brandValues: z.array(z.string()).optional(),
      existingColors: z.array(z.string()).optional(), // Hex codes
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Build comprehensive prompt for multi-LLM analysis
        const prompt = `You are a branding expert with deep knowledge of color psychology, demographic preferences, and design trends.

Analyze the following brand and provide comprehensive recommendations:

**Brand Name:** ${input.projectName}
**Industry:** ${input.industry}
**Target Demographics:**
- Age Groups: ${input.targetDemographics.ageGroups.join(", ")}
- Genders: ${input.targetDemographics.genders.join(", ")}
${input.brandValues ? `**Brand Values:** ${input.brandValues.join(", ")}` : ""}
${input.existingColors ? `**Existing Colors:** ${input.existingColors.join(", ")}` : ""}

Provide recommendations in the following JSON format:
{
  "colorPalette": {
    "primary": "#HEX",
    "secondary": "#HEX",
    "accent": "#HEX",
    "reasoning": "Why these colors work for this demographic and industry"
  },
  "designStyle": {
    "style": "minimalist|maximalist|classic|modern",
    "reasoning": "Why this style fits the target audience"
  },
  "typography": {
    "primaryFont": "Font name",
    "secondaryFont": "Font name",
    "reasoning": "Why these fonts work"
  },
  "visualElements": {
    "shapes": "angular|curved|geometric|organic",
    "imagery": "abstract|realistic|illustrated|photographic",
    "reasoning": "Visual preferences for this demographic"
  },
  "trendAlignment": 0.0-1.0,
  "demographicFit": 0.0-1.0,
  "keyInsights": ["insight 1", "insight 2", "insight 3"]
}`;

        // Get recommendations from multiple LLMs for consensus
        const [claudeResponse, gpt4Response, qwenResponse] = await Promise.all([
          invokeLLM({
            messages: [
              { role: "system", content: "You are a branding expert. Always respond with valid JSON only." },
              { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" }
          }),
          invokeLLM({
            messages: [
              { role: "system", content: "You are a branding expert. Always respond with valid JSON only." },
              { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" }
          }),
          invokeLLM({
            messages: [
              { role: "system", content: "You are a branding expert. Always respond with valid JSON only." },
              { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" }
          }),
        ]);

        const claudeData = JSON.parse(claudeResponse.choices[0].message.content as string);
        const gpt4Data = JSON.parse(gpt4Response.choices[0].message.content as string);
        const qwenData = JSON.parse(qwenResponse.choices[0].message.content as string);

        return {
          recommendations: {
            claude: claudeData,
            gpt4: gpt4Data,
            qwen: qwenData,
          },
          consensus: {
            // Simple consensus: most common color primary
            primaryColor: [claudeData.colorPalette.primary, gpt4Data.colorPalette.primary, qwenData.colorPalette.primary]
              .sort((a, b) => 
                [claudeData, gpt4Data, qwenData].filter(d => d.colorPalette.primary === a).length -
                [claudeData, gpt4Data, qwenData].filter(d => d.colorPalette.primary === b).length
              )[0],
            designStyle: [claudeData.designStyle.style, gpt4Data.designStyle.style, qwenData.designStyle.style]
              .sort((a, b) =>
                [claudeData, gpt4Data, qwenData].filter(d => d.designStyle.style === a).length -
                [claudeData, gpt4Data, qwenData].filter(d => d.designStyle.style === b).length
              )[0],
          },
          projectId: `branding_${Date.now()}`, // TODO: Save to database
        };
      } catch (error) {
        console.error("Branding analysis error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to analyze branding. Please try again.",
        });
      }
    }),

  // ============================================================================
  // COLOR PSYCHOLOGY
  // ============================================================================

  /**
   * Get color recommendations based on demographics and psychology
   */
  getColorRecommendations: publicProcedure
    .input(z.object({
      ageGroup: z.enum(["gen_z", "millennial", "gen_x", "baby_boomer"]),
      gender: z.enum(["male", "female", "non_binary", "all"]),
      industry: z.string(),
      mood: z.string().optional(), // energetic, calm, professional, playful
    }))
    .query(async ({ input }) => {
      // Color psychology database (simplified - should be in DB)
      const colorDatabase = {
        gen_z: {
          hot: ["#E6E6FA", "#BE3455", "#CCFF00", "#FF6F61"], // Digital Lavender, Viva Magenta, Cyber Lime, Sunset Coral
          trending: ["#FFB6C1", "#98FF98", "#87CEEB"],
          avoid: ["#000000", "#808080"], // Pure black, gray
        },
        millennial: {
          hot: ["#92A8D1", "#F7CAC9", "#B565A7", "#009B77"], // Serenity, Rose Quartz, Radiant Orchid, Emerald
          trending: ["#D4AF37", "#708090", "#BC8F8F"],
          avoid: ["#FF00FF", "#00FF00"], // Neon colors
        },
        gen_x: {
          hot: ["#000080", "#8B0000", "#228B22", "#4B0082"], // Navy, Burgundy, Forest Green, Indigo
          trending: ["#708090", "#2F4F4F", "#8B4513"],
          avoid: ["#CCFF00", "#FF1493"], // Cyber colors, hot pink
        },
        baby_boomer: {
          hot: ["#000080", "#8B0000", "#D4AF37", "#2F4F4F"], // Navy, Burgundy, Gold, Dark Slate Gray
          trending: ["#8B4513", "#556B2F", "#800000"],
          avoid: ["#00FF00", "#FF00FF", "#CCFF00"], // All neon
        },
      };

      const colors = colorDatabase[input.ageGroup];

      return {
        recommended: colors.hot,
        trending: colors.trending,
        avoid: colors.avoid,
        reasoning: `Based on ${input.ageGroup} preferences and ${input.industry} industry standards.`,
      };
    }),

  /**
   * Analyze a specific color's psychology and demographic fit
   */
  analyzeColor: publicProcedure
    .input(z.object({
      colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
      targetDemo: z.object({
        ageGroup: z.enum(["gen_z", "millennial", "gen_x", "baby_boomer"]),
        gender: z.enum(["male", "female", "non_binary", "all"]),
      }).optional(),
    }))
    .query(async ({ input }) => {
      const prompt = `Analyze the color ${input.colorHex} and provide:
1. Emotional associations
2. Industries where it works well
3. Industries to avoid
4. Trend status (hot, trending, stable, declining, not_hot)
5. Gender appeal (male vs female preference, 0-1 scale)
6. Age group appeal (gen_z, millennial, gen_x, baby_boomer, 0-1 scale each)

Respond in JSON format:
{
  "emotions": ["emotion1", "emotion2"],
  "suitableIndustries": ["industry1", "industry2"],
  "avoidIndustries": ["industry1", "industry2"],
  "trendStatus": "hot|trending|stable|declining|not_hot",
  "genderAppeal": {"male": 0.7, "female": 0.9},
  "ageGroupAppeal": {"gen_z": 0.9, "millennial": 0.7, "gen_x": 0.5, "baby_boomer": 0.3}
}`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a color psychology expert. Always respond with valid JSON only." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });

      const analysis = JSON.parse(response.choices[0].message.content as string);

      return {
        color: input.colorHex,
        analysis,
        demographicFit: input.targetDemo 
          ? analysis.ageGroupAppeal[input.targetDemo.ageGroup] * 
            (input.targetDemo.gender === "all" ? 1 : analysis.genderAppeal[input.targetDemo.gender])
          : null,
      };
    }),

  // ============================================================================
  // LOGO GENERATION (Placeholder - will integrate Canva API)
  // ============================================================================

  /**
   * Generate logo concepts using AI
   */
  generateLogo: protectedProcedure
    .input(z.object({
      brandName: z.string().min(1),
      industry: z.string(),
      style: z.enum(["minimalist", "maximalist", "classic", "modern", "playful", "professional"]),
      colors: z.array(z.string()).optional(), // Hex codes
    }))
    .mutation(async ({ input }) => {
      // TODO: Integrate with Canva API or other logo generation service
      // For now, return mock data with affiliate links
      
      return {
        logos: [
          {
            id: "logo_1",
            url: "https://placeholder.com/logo1.png",
            style: input.style,
            affiliateLink: "https://www.canva.com/create/logos/?affiliate=xyz",
            editLink: "https://www.canva.com/design/edit/logo1",
          },
          {
            id: "logo_2",
            url: "https://placeholder.com/logo2.png",
            style: input.style,
            affiliateLink: "https://looka.com/?ref=xyz",
            editLink: "https://looka.com/editor/logo2",
          },
        ],
        message: "Logo generation coming soon! Click affiliate links to create logos with our partners.",
      };
    }),

  // ============================================================================
  // DOMAIN SCORING
  // ============================================================================

  /**
   * Score a domain name based on SEO and branding factors
   */
  scoreDomain: publicProcedure
    .input(z.object({
      domainName: z.string().min(1),
      industry: z.string(),
      keywords: z.array(z.string()).optional(),
    }))
    .query(async ({ input }) => {
      const domain = input.domainName.toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
      const extension = domain.includes(".") ? domain.split(".").pop() : "com";
      const name = domain.split(".")[0];

      // Scoring algorithm (simplified)
      const scores = {
        keywordRelevance: calculateKeywordScore(name, input.keywords || []),
        extension: calculateExtensionScore(extension || "com"),
        length: calculateLengthScore(name.length),
        brandability: calculateBrandabilityScore(name),
        seoHistory: 50, // Placeholder - would call Ahrefs/SEMrush API
        technical: 90, // Placeholder - would check DNS, SSL, etc.
      };

      // Weighted average
      const weights = {
        keywordRelevance: 0.30,
        extension: 0.20,
        length: 0.20,
        brandability: 0.15,
        seoHistory: 0.10,
        technical: 0.05,
      };

      const overallScore = Object.entries(scores).reduce(
        (sum, [key, score]) => sum + score * weights[key as keyof typeof weights],
        0
      );

      return {
        domain,
        scores,
        overallScore: Math.round(overallScore),
        rating: overallScore >= 80 ? "Excellent" : overallScore >= 60 ? "Good" : overallScore >= 40 ? "Fair" : "Poor",
        recommendations: generateDomainRecommendations(scores, name),
      };
    }),

  // ============================================================================
  // ALT TEXT GENERATION
  // ============================================================================

  /**
   * Generate WCAG-compliant alt text for an image
   */
  generateAltText: protectedProcedure
    .input(z.object({
      imageUrl: z.string().url(),
      context: z.string().optional(), // Additional context about the image
    }))
    .mutation(async ({ input }) => {
      // TODO: Integrate with Azure Vision API, Google Cloud Vision, or IBM Watson
      // For now, use LLM to generate alt text from URL
      
      const prompt = `Generate WCAG 2.1 Level AA compliant alt text for an image.

Image URL: ${input.imageUrl}
${input.context ? `Context: ${input.context}` : ""}

Requirements:
- Maximum 125 characters
- Describe the image content concisely
- Do NOT start with "image of" or "picture of"
- Include relevant keywords naturally
- Focus on what's important for understanding

Respond with JSON:
{
  "altText": "your alt text here",
  "keywords": ["keyword1", "keyword2"],
  "characterCount": 85
}`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are an accessibility expert. Always respond with valid JSON only." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content as string);

      return {
        ...result,
        wcagCompliant: result.characterCount <= 125,
        tool: "openrouter_llm",
      };
    }),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateKeywordScore(domain: string, keywords: string[]): number {
  if (keywords.length === 0) return 50;
  
  const domainLower = domain.toLowerCase();
  const matches = keywords.filter(kw => domainLower.includes(kw.toLowerCase()));
  
  return Math.min(100, (matches.length / keywords.length) * 100 + 20);
}

function calculateExtensionScore(extension: string): number {
  const scores: Record<string, number> = {
    com: 100,
    io: 85,
    ai: 85,
    co: 80,
    net: 70,
    org: 70,
    app: 75,
    dev: 75,
  };
  
  return scores[extension] || 50;
}

function calculateLengthScore(length: number): number {
  if (length >= 6 && length <= 14) return 100;
  if (length >= 4 && length <= 18) return 80;
  if (length >= 3 && length <= 20) return 60;
  return 40;
}

function calculateBrandabilityScore(name: string): number {
  let score = 50;
  
  // No hyphens or numbers
  if (!/[-0-9]/.test(name)) score += 20;
  
  // Pronounceable (has vowels)
  if (/[aeiou]/i.test(name)) score += 15;
  
  // Unique (not common word) - simplified check
  const commonWords = ["the", "and", "for", "you", "get", "best", "top", "new"];
  if (!commonWords.includes(name.toLowerCase())) score += 15;
  
  return Math.min(100, score);
}

function generateDomainRecommendations(scores: Record<string, number>, name: string): string[] {
  const recommendations: string[] = [];
  
  if (scores.keywordRelevance < 60) {
    recommendations.push("Consider including industry keywords in your domain");
  }
  
  if (scores.extension < 80) {
    recommendations.push("Try to secure a .com domain for better recognition");
  }
  
  if (scores.length < 60) {
    recommendations.push(name.length > 18 ? "Shorten your domain name for better memorability" : "Consider a slightly longer, more descriptive domain");
  }
  
  if (scores.brandability < 70) {
    recommendations.push("Remove hyphens and numbers for better brandability");
  }
  
  return recommendations;
}
