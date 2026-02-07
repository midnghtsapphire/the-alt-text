import { invokeLLM } from "../../_core/llm";

/**
 * OZ AI Automation Module
 * Handles 50% of marketplace operations through AI automation
 */

export interface ProductModule {
  name: string;
  features: string[];
  targetAudience: string;
  competitors: string[];
}

export interface ProductDescription {
  hero: string;
  valueProp: string;
  features: { title: string; description: string }[];
  useCases: string[];
  cta: string;
}

export interface PricingTier {
  name: string;
  price: number;
  features: string[];
  limits: Record<string, number | string>;
  targetSegment: string;
}

export interface APIDocumentation {
  endpoint: string;
  method: string;
  description: string;
  parameters: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  requestExample: {
    curl: string;
    javascript: string;
  };
  responseSchema: string;
  errorCodes: Array<{
    code: number;
    description: string;
    solution: string;
  }>;
  rateLimit: string;
}

/**
 * Generate compelling product description using OZ AI
 */
export async function generateProductDescription(
  module: ProductModule
): Promise<ProductDescription> {
  const prompt = `Generate a compelling product description for the ${module.name} API:

Features: ${module.features.join(", ")}
Target Audience: ${module.targetAudience}
Competitors: ${module.competitors.join(", ")}

Output format (JSON):
{
  "hero": "Attention-grabbing headline (10-15 words)",
  "valueProp": "Why customers need this (2-3 sentences)",
  "features": [
    {"title": "Feature Name", "description": "Benefit-focused description (50-100 words)"}
  ],
  "useCases": ["Real-world example 1", "Real-world example 2", "Real-world example 3"],
  "cta": "Action-oriented button text"
}`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are a product marketing expert specializing in API products. Generate compelling, benefit-focused copy that converts developers into customers.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "product_description",
        strict: true,
        schema: {
          type: "object",
          properties: {
            hero: { type: "string" },
            valueProp: { type: "string" },
            features: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                },
                required: ["title", "description"],
                additionalProperties: false,
              },
            },
            useCases: {
              type: "array",
              items: { type: "string" },
            },
            cta: { type: "string" },
          },
          required: ["hero", "valueProp", "features", "useCases", "cta"],
          additionalProperties: false,
        },
      },
    },
  });

  const message = response.choices[0].message;
  const content = typeof message.content === 'string' ? message.content : '{}';
  return JSON.parse(content);
}

/**
 * Analyze market and recommend optimal pricing tiers
 */
export async function generatePricingRecommendations(
  module: ProductModule,
  costs: { apiCost: number; hosting: number; support: number },
  targetMargin: number
): Promise<PricingTier[]> {
  const prompt = `Analyze competitor pricing and recommend optimal tiers for ${module.name} API:

Competitors: ${module.competitors.join(", ")}
Our Costs: API $${costs.apiCost} per use, Hosting $${costs.hosting}/mo, Support $${costs.support}/mo
Target Margin: ${targetMargin}%
Segments: Freelancers, Agencies, Enterprises

Recommend 3 tiers with creative names (not Basic/Pro/Enterprise), price points that undercut competitors by 10-20%, feature limits that balance value and profitability, and clear target segments.

Output format (JSON):
{
  "tiers": [
    {
      "name": "Creative tier name",
      "price": 49,
      "features": ["Feature 1", "Feature 2"],
      "limits": {"requests": 1000, "support": "email"},
      "targetSegment": "Freelancers"
    }
  ]
}`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are a pricing strategist specializing in SaaS and API products. Recommend pricing that maximizes revenue while remaining competitive.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "pricing_tiers",
        strict: true,
        schema: {
          type: "object",
          properties: {
            tiers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  price: { type: "number" },
                  features: {
                    type: "array",
                    items: { type: "string" },
                  },
                  limits: {
                    type: "object",
                    additionalProperties: true,
                  },
                  targetSegment: { type: "string" },
                },
                required: ["name", "price", "features", "limits", "targetSegment"],
                additionalProperties: false,
              },
            },
          },
          required: ["tiers"],
          additionalProperties: false,
        },
      },
    },
  });

  const message = response.choices[0].message;
  const content = typeof message.content === 'string' ? message.content : '{"tiers":[]}';
  const result = JSON.parse(content);
  return result.tiers;
}

/**
 * Auto-generate API documentation from code
 */
export async function generateAPIDocumentation(
  endpoint: string,
  method: string,
  codeSnippet: string
): Promise<APIDocumentation> {
  const prompt = `Generate comprehensive API documentation for this endpoint:

Endpoint: ${method} ${endpoint}
Code:
\`\`\`typescript
${codeSnippet}
\`\`\`

Include:
1. Description (what it does, when to use it)
2. Parameters (name, type, required, description)
3. Request examples (curl + JavaScript)
4. Response schema (JSON)
5. Error codes (400, 401, 429, 500)
6. Rate limits

Output format (JSON):
{
  "endpoint": "/api/scanner/scan",
  "method": "POST",
  "description": "Start a new website accessibility scan",
  "parameters": [
    {"name": "websiteUrl", "type": "string", "required": true, "description": "Full URL of website to scan"}
  ],
  "requestExample": {
    "curl": "curl -X POST...",
    "javascript": "const response = await fetch..."
  },
  "responseSchema": "{\\"scanId\\": 12345, \\"status\\": \\"pending\\"}",
  "errorCodes": [
    {"code": 400, "description": "Invalid URL format", "solution": "Ensure URL includes protocol"}
  ],
  "rateLimit": "10 requests/minute"
}`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are a technical writer specializing in API documentation. Generate clear, comprehensive docs that help developers integrate quickly.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "api_documentation",
        strict: true,
        schema: {
          type: "object",
          properties: {
            endpoint: { type: "string" },
            method: { type: "string" },
            description: { type: "string" },
            parameters: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  type: { type: "string" },
                  required: { type: "boolean" },
                  description: { type: "string" },
                },
                required: ["name", "type", "required", "description"],
                additionalProperties: false,
              },
            },
            requestExample: {
              type: "object",
              properties: {
                curl: { type: "string" },
                javascript: { type: "string" },
              },
              required: ["curl", "javascript"],
              additionalProperties: false,
            },
            responseSchema: { type: "string" },
            errorCodes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  code: { type: "number" },
                  description: { type: "string" },
                  solution: { type: "string" },
                },
                required: ["code", "description", "solution"],
                additionalProperties: false,
              },
            },
            rateLimit: { type: "string" },
          },
          required: [
            "endpoint",
            "method",
            "description",
            "parameters",
            "requestExample",
            "responseSchema",
            "errorCodes",
            "rateLimit",
          ],
          additionalProperties: false,
        },
      },
    },
  });

  const message = response.choices[0].message;
  const content = typeof message.content === 'string' ? message.content : '{}';
  return JSON.parse(content);
}

/**
 * Generate SDK code examples for multiple languages
 */
export async function generateSDKExamples(
  endpoint: string,
  method: string,
  requestSchema: string,
  responseSchema: string
): Promise<Record<string, string>> {
  const prompt = `Generate SDK examples for ${method} ${endpoint} in JavaScript, Python, PHP, and Ruby.

Request: ${requestSchema}
Response: ${responseSchema}

For each language:
1. Installation instructions
2. Authentication setup
3. Basic usage example
4. Error handling
5. Async/await patterns where applicable

Output format (JSON):
{
  "javascript": "// Installation\\nnpm install @thealttext/sdk\\n\\n// Usage\\nconst client = new AltTextClient...",
  "python": "# Installation\\npip install thealttext\\n\\n# Usage\\nfrom thealttext import Client...",
  "php": "// Installation\\ncomposer require thealttext/sdk\\n\\n// Usage\\n<?php\\nuse TheAltText\\Client...",
  "ruby": "# Installation\\ngem install thealttext\\n\\n# Usage\\nrequire 'thealttext'..."
}`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are a developer advocate creating SDK examples. Generate idiomatic code for each language that follows best practices.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "sdk_examples",
        strict: true,
        schema: {
          type: "object",
          properties: {
            javascript: { type: "string" },
            python: { type: "string" },
            php: { type: "string" },
            ruby: { type: "string" },
          },
          required: ["javascript", "python", "php", "ruby"],
          additionalProperties: false,
        },
      },
    },
  });

  const message = response.choices[0].message;
  const content = typeof message.content === 'string' ? message.content : '{}';
  return JSON.parse(content);
}

/**
 * Generate landing page copy
 */
export async function generateLandingPage(
  module: ProductModule,
  pricing: PricingTier[]
): Promise<{
  hero: { headline: string; subheadline: string; cta: string };
  problem: string;
  solution: string;
  features: Array<{ title: string; description: string; icon: string }>;
  testimonials: Array<{ quote: string; author: string; company: string }>;
  faqs: Array<{ question: string; answer: string }>;
  finalCTA: string;
}> {
  const prompt = `Create a landing page for ${module.name} API targeting ${module.targetAudience}.

Features: ${module.features.join(", ")}
Pricing: ${pricing.map((t) => `${t.name} $${t.price}/mo`).join(", ")}

Include:
1. Hero section (headline + subheadline + CTA)
2. Problem statement (pain points)
3. Solution overview (how it works)
4. Features grid (4-6 features with icon suggestions)
5. Testimonials (3 realistic examples)
6. FAQ section (5-7 questions)
7. Final CTA

Tone: Professional but approachable
Keywords: accessibility, alt text, WCAG, compliance, automation`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are a conversion copywriter specializing in SaaS landing pages. Write compelling copy that converts visitors into customers.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  // Parse the response (simplified for now - would need structured output)
  const message = response.choices[0].message;
  const content = typeof message.content === 'string' ? message.content : '';
  
  // Return a structured format (this would be more sophisticated in production)
  return {
    hero: {
      headline: "Transform Your Website's Accessibility in Minutes",
      subheadline: "Automated scanning, AI-powered fixes, and compliance reports",
      cta: "Start Free Trial",
    },
    problem: content.substring(0, 200),
    solution: content.substring(200, 400),
    features: [],
    testimonials: [],
    faqs: [],
    finalCTA: "Get Started Today",
  };
}

/**
 * Customer support chatbot
 */
export async function handleSupportQuery(
  userMessage: string,
  context: { apiDocs: string; pricingInfo: string }
): Promise<{ response: string; escalate: boolean }> {
  const prompt = `You are a customer support chatbot for The Alt Text API Marketplace.

Knowledge Base:
- API Documentation: ${context.apiDocs.substring(0, 1000)}
- Pricing: ${context.pricingInfo}

Guidelines:
- Be helpful and concise
- Provide code examples when relevant
- Link to documentation for details
- Escalate billing/account issues to human support
- Never make up information - say "I don't know" if unsure

Customer Question: ${userMessage}

Respond with JSON:
{
  "response": "Your helpful response",
  "escalate": false
}`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a helpful customer support chatbot.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "support_response",
        strict: true,
        schema: {
          type: "object",
          properties: {
            response: { type: "string" },
            escalate: { type: "boolean" },
          },
          required: ["response", "escalate"],
          additionalProperties: false,
        },
      },
    },
  });

  const message = response.choices[0].message;
  const content = typeof message.content === 'string' ? message.content : '{"response":"I can help you with that.","escalate":false}';
  return JSON.parse(content);
}

/**
 * Usage analytics and recommendations
 */
export async function generateUsageInsights(usage: {
  apiCalls: number;
  limit: number;
  peakTimes: string[];
  errorRate: number;
}): Promise<{
  insights: string[];
  recommendations: string[];
  upgradePrompt?: string;
}> {
  const prompt = `Analyze API usage and provide insights:

Usage: ${usage.apiCalls}/${usage.limit} calls this month
Peak Times: ${usage.peakTimes.join(", ")}
Error Rate: ${usage.errorRate}%

Provide:
1. 2-3 key insights about usage patterns
2. 2-3 actionable recommendations
3. Upgrade prompt if near limit (>80%)

Output JSON:
{
  "insights": ["Insight 1", "Insight 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "upgradePrompt": "Optional upgrade message"
}`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a data analyst providing actionable insights.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "usage_insights",
        strict: true,
        schema: {
          type: "object",
          properties: {
            insights: {
              type: "array",
              items: { type: "string" },
            },
            recommendations: {
              type: "array",
              items: { type: "string" },
            },
            upgradePrompt: { type: "string" },
          },
          required: ["insights", "recommendations"],
          additionalProperties: false,
        },
      },
    },
  });

  const message = response.choices[0].message;
  const content = typeof message.content === 'string' ? message.content : '{"insights":[],"recommendations":[]}';
  return JSON.parse(content);
}
