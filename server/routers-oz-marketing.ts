/**
 * OZ Marketing Content Generator
 * 
 * AI-powered content generation with automatic affiliate link insertion
 * for social media posts, email templates, and ads
 */

import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { buildAffiliateLink } from "./modules/affiliate-links";
import { fetchImageForContent, type ImageData } from "./modules/oz-image-helper";

export const ozMarketingRouter = router({
  /**
   * Generate social media post with affiliate links
   */
  generateSocialPost: protectedProcedure
    .input(z.object({
      affiliateCode: z.string(),
      product: z.enum(['scanner', 'analyzer', 'reporter', 'fixer', 'complete_platform']),
      tier: z.enum(['starter', 'professional', 'enterprise']),
      platform: z.enum(['linkedin', 'facebook', 'instagram', 'tiktok', 'twitter']),
      tone: z.enum(['professional', 'casual', 'enthusiastic', 'educational']).default('professional'),
      includeHashtags: z.boolean().default(true),
      includeEmojis: z.boolean().default(true),
      includeImage: z.boolean().default(false),
      imageQuery: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      // Fetch image if requested
      let imageData: ImageData | null = null;
      if (input.includeImage && input.imageQuery) {
        imageData = await fetchImageForContent(input.imageQuery);
      }
      // Generate affiliate link
      const affiliateLink = buildAffiliateLink({
        affiliateCode: input.affiliateCode,
        product: input.product,
        tier: input.tier,
        campaign: `social_${input.platform}`,
        medium: 'social',
        source: input.platform,
      });

      // Product benefits mapping
      const productBenefits: Record<string, string> = {
        scanner: 'Automated website crawling and image extraction',
        analyzer: 'AI-powered alt text generation with 95% accuracy',
        reporter: 'Compliance reports with ROI calculations',
        fixer: 'Multiple fix delivery methods (API, JS snippet, WordPress plugin)',
        complete_platform: 'All features bundled with unlimited scanning',
      };

      // Generate post content with AI
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: 'You are a social media marketing expert. Generate engaging posts that convert.',
          },
          {
            role: 'user',
            content: `Create a ${input.platform} post promoting The Alt Text ${input.product} API (${input.tier} tier).

Tone: ${input.tone}
Include hashtags: ${input.includeHashtags}
Include emojis: ${input.includeEmojis}

Product benefit: ${productBenefits[input.product]}

The post should:
1. Hook attention in first line
2. Highlight key benefit
3. Include call-to-action
4. Be platform-appropriate length
5. Include the affiliate link: ${affiliateLink}

Generate ONLY the post text, no explanations.`,
          },
        ],
      });

      const postContent = response.choices[0]?.message?.content;
      if (typeof postContent !== 'string') {
        throw new Error('Failed to generate post content');
      }

      return {
        content: postContent,
        affiliateLink,
        platform: input.platform,
        characterCount: postContent.length,
        image: imageData,
      };
    }),

  /**
   * Generate email template with affiliate links
   */
  generateEmailTemplate: protectedProcedure
    .input(z.object({
      affiliateCode: z.string(),
      product: z.enum(['scanner', 'analyzer', 'reporter', 'fixer', 'complete_platform']),
      tier: z.enum(['starter', 'professional', 'enterprise']),
      emailType: z.enum(['promotional', 'educational', 'announcement', 'follow_up']),
      recipientType: z.enum(['cold', 'warm', 'existing_customer']),
    }))
    .mutation(async ({ input }) => {
      // Generate affiliate link
      const affiliateLink = buildAffiliateLink({
        affiliateCode: input.affiliateCode,
        product: input.product,
        tier: input.tier,
        campaign: `email_${input.emailType}`,
        medium: 'email',
        source: 'affiliate_program',
      });

      // Generate email with AI
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: 'You are an email marketing expert specializing in B2B SaaS.',
          },
          {
            role: 'user',
            content: `Create a ${input.emailType} email promoting The Alt Text ${input.product} API (${input.tier} tier).

Recipient type: ${input.recipientType}
Affiliate link: ${affiliateLink}

Email should include:
1. Compelling subject line
2. Personalized greeting
3. Problem statement
4. Solution (product benefits)
5. Social proof or stats
6. Clear CTA with affiliate link
7. Professional signature

Format as JSON with subject, body, and preheader fields.`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "email_template",
            strict: true,
            schema: {
              type: "object",
              properties: {
                subject: { type: "string" },
                body: { type: "string" },
                preheader: { type: "string" },
              },
              required: ["subject", "body", "preheader"],
              additionalProperties: false,
            },
          },
        },
      });

      const emailData = response.choices[0]?.message?.content;
      if (typeof emailData !== 'string') {
        throw new Error('Failed to generate email template');
      }

      const email = JSON.parse(emailData);

      return {
        ...email,
        affiliateLink,
        emailType: input.emailType,
      };
    }),

  /**
   * Generate ad copy with affiliate links
   */
  generateAdCopy: protectedProcedure
    .input(z.object({
      affiliateCode: z.string(),
      product: z.enum(['scanner', 'analyzer', 'reporter', 'fixer', 'complete_platform']),
      tier: z.enum(['starter', 'professional', 'enterprise']),
      adPlatform: z.enum(['google_ads', 'facebook_ads', 'linkedin_ads', 'twitter_ads']),
      adFormat: z.enum(['search', 'display', 'video', 'carousel']),
      targetAudience: z.string(),
    }))
    .mutation(async ({ input }) => {
      // Generate affiliate link
      const affiliateLink = buildAffiliateLink({
        affiliateCode: input.affiliateCode,
        product: input.product,
        tier: input.tier,
        campaign: `${input.adPlatform}_${input.adFormat}`,
        medium: 'paid_ads',
        source: input.adPlatform,
      });

      // Generate ad copy with AI
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: 'You are a performance marketing expert specializing in paid advertising.',
          },
          {
            role: 'user',
            content: `Create ${input.adFormat} ad copy for ${input.adPlatform} promoting The Alt Text ${input.product} API (${input.tier} tier).

Target audience: ${input.targetAudience}
Affiliate link: ${affiliateLink}

Ad should include:
1. Attention-grabbing headline
2. Benefit-focused description
3. Strong CTA
4. Platform-specific character limits
5. A/B test variations (3 versions)

Format as JSON with headline, description, cta, and variations array.`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "ad_copy",
            strict: true,
            schema: {
              type: "object",
              properties: {
                headline: { type: "string" },
                description: { type: "string" },
                cta: { type: "string" },
                variations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      headline: { type: "string" },
                      description: { type: "string" },
                      cta: { type: "string" },
                    },
                    required: ["headline", "description", "cta"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["headline", "description", "cta", "variations"],
              additionalProperties: false,
            },
          },
        },
      });

      const adData = response.choices[0]?.message?.content;
      if (typeof adData !== 'string') {
        throw new Error('Failed to generate ad copy');
      }

      const adCopy = JSON.parse(adData);

      return {
        ...adCopy,
        affiliateLink,
        adPlatform: input.adPlatform,
        adFormat: input.adFormat,
      };
    }),

  /**
   * Generate blog post with affiliate links
   */
  generateBlogPost: protectedProcedure
    .input(z.object({
      affiliateCode: z.string(),
      product: z.enum(['scanner', 'analyzer', 'reporter', 'fixer', 'complete_platform']),
      tier: z.enum(['starter', 'professional', 'enterprise']),
      topic: z.string(),
      keywords: z.array(z.string()),
      wordCount: z.number().min(500).max(3000).default(1000),
    }))
    .mutation(async ({ input }) => {
      // Generate affiliate link
      const affiliateLink = buildAffiliateLink({
        affiliateCode: input.affiliateCode,
        product: input.product,
        tier: input.tier,
        campaign: 'blog_post',
        medium: 'content',
        source: 'blog',
      });

      // Generate blog post with AI
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: 'You are a content marketing writer specializing in SEO-optimized blog posts.',
          },
          {
            role: 'user',
            content: `Write a ${input.wordCount}-word blog post about: ${input.topic}

Target keywords: ${input.keywords.join(', ')}
Product to promote: The Alt Text ${input.product} API (${input.tier} tier)
Affiliate link: ${affiliateLink}

Blog post should include:
1. SEO-optimized title
2. Meta description
3. Introduction with hook
4. 3-5 main sections with H2 headings
5. Naturally integrated product mentions
6. Call-to-action with affiliate link
7. Conclusion

Write in markdown format.`,
          },
        ],
      });

      const blogContent = response.choices[0]?.message?.content;
      if (typeof blogContent !== 'string') {
        throw new Error('Failed to generate blog post');
      }

      return {
        content: blogContent,
        affiliateLink,
        topic: input.topic,
        wordCount: blogContent.split(/\s+/).length,
      };
    }),

  /**
   * Generate video script with affiliate links
   */
  generateVideoScript: protectedProcedure
    .input(z.object({
      affiliateCode: z.string(),
      product: z.enum(['scanner', 'analyzer', 'reporter', 'fixer', 'complete_platform']),
      tier: z.enum(['starter', 'professional', 'enterprise']),
      videoType: z.enum(['explainer', 'tutorial', 'testimonial', 'demo']),
      duration: z.enum(['30sec', '60sec', '2min', '5min']),
      platform: z.enum(['youtube', 'tiktok', 'instagram_reels', 'linkedin']),
    }))
    .mutation(async ({ input }) => {
      // Generate affiliate link
      const affiliateLink = buildAffiliateLink({
        affiliateCode: input.affiliateCode,
        product: input.product,
        tier: input.tier,
        campaign: `video_${input.videoType}`,
        medium: 'video',
        source: input.platform,
      });

      // Generate video script with AI
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: 'You are a video content creator specializing in engaging short-form content.',
          },
          {
            role: 'user',
            content: `Create a ${input.duration} ${input.videoType} video script for ${input.platform} promoting The Alt Text ${input.product} API (${input.tier} tier).

Affiliate link: ${affiliateLink}

Script should include:
1. Hook (first 3 seconds)
2. Problem statement
3. Solution demonstration
4. Key benefits
5. Call-to-action with affiliate link
6. Visual suggestions for each scene
7. On-screen text suggestions

Format as JSON with scenes array.`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "video_script",
            strict: true,
            schema: {
              type: "object",
              properties: {
                title: { type: "string" },
                hook: { type: "string" },
                scenes: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      duration: { type: "string" },
                      voiceover: { type: "string" },
                      visual: { type: "string" },
                      onScreenText: { type: "string" },
                    },
                    required: ["duration", "voiceover", "visual"],
                    additionalProperties: false,
                  },
                },
                cta: { type: "string" },
              },
              required: ["title", "hook", "scenes", "cta"],
              additionalProperties: false,
            },
          },
        },
      });

      const scriptData = response.choices[0]?.message?.content;
      if (typeof scriptData !== 'string') {
        throw new Error('Failed to generate video script');
      }

      const script = JSON.parse(scriptData);

      return {
        ...script,
        affiliateLink,
        videoType: input.videoType,
        duration: input.duration,
        platform: input.platform,
      };
    }),
});
