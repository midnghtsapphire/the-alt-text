import { Router, Request, Response } from "express";
import { createHash } from "crypto";
import { invokeLLM } from "./_core/llm";
import { getApiKeyByHash } from "./db";
import { createImageAnalysis, updateImageAnalysis, logApiUsage } from "./db";

const apiRouter = Router();

function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

// Middleware: Authenticate API key
async function authenticateApiKey(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid API key. Use: Authorization: Bearer tat_live_..." });
  }

  const rawKey = authHeader.replace("Bearer ", "").trim();
  if (!rawKey.startsWith("tat_live_")) {
    return res.status(401).json({ error: "Invalid API key format" });
  }

  const keyHash = hashApiKey(rawKey);
  const apiKey = await getApiKeyByHash(keyHash);

  if (!apiKey || !apiKey.isActive) {
    return res.status(401).json({ error: "Invalid or deactivated API key" });
  }

  if (apiKey.monthlyUsed >= apiKey.monthlyLimit) {
    return res.status(429).json({ error: "Monthly API limit reached" });
  }

  (req as any).apiKey = apiKey;
  next();
}

// POST /api/v1/generate-alt-text
apiRouter.post("/generate-alt-text", authenticateApiKey, async (req: Request, res: Response) => {
  const startTime = Date.now();
  const apiKey = (req as any).apiKey;

  try {
    const { image_url, page_context, surrounding_text } = req.body;

    if (!image_url) {
      return res.status(400).json({ error: "image_url is required" });
    }

    const systemPrompt = `You are an expert accessibility specialist. Generate concise, descriptive alt text for images following WCAG 2.1 AA guidelines. Be descriptive but concise (10-125 chars). Don't start with "Image of". Return JSON: { altText, confidence (0-100), imageType, wcagCompliance }`;

    const result = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: image_url, detail: "high" } },
            { type: "text", text: `Generate alt text.${page_context ? ` Context: ${page_context}` : ""}${surrounding_text ? ` Surrounding: ${surrounding_text}` : ""}` },
          ],
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "alt_text_result",
          strict: true,
          schema: {
            type: "object",
            properties: {
              altText: { type: "string" },
              confidence: { type: "number" },
              imageType: { type: "string", enum: ["photo", "illustration", "icon", "chart", "screenshot", "decorative", "unknown"] },
              wcagCompliance: { type: "string", enum: ["pass", "fail", "warning"] },
            },
            required: ["altText", "confidence", "imageType", "wcagCompliance"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = result.choices[0]?.message?.content;
    const parsed = JSON.parse(typeof content === "string" ? content : "{}");
    const processingTimeMs = Date.now() - startTime;

    // Log usage
    await logApiUsage({
      apiKeyId: apiKey.id,
      userId: apiKey.userId,
      endpoint: "/api/v1/generate-alt-text",
      method: "POST",
      statusCode: 200,
      responseTimeMs: processingTimeMs,
      imageUrl: image_url,
      ipAddress: req.ip || null,
      userAgent: req.headers["user-agent"] || null,
    });

    res.json({
      alt_text: parsed.altText || "Unable to generate",
      confidence: parsed.confidence || 0,
      image_type: parsed.imageType || "unknown",
      wcag_compliance: parsed.wcagCompliance || "warning",
      processing_time_ms: processingTimeMs,
      model: result.model || "gemini-2.5-flash",
    });
  } catch (error: any) {
    const processingTimeMs = Date.now() - startTime;
    await logApiUsage({
      apiKeyId: apiKey.id,
      userId: apiKey.userId,
      endpoint: "/api/v1/generate-alt-text",
      method: "POST",
      statusCode: 500,
      responseTimeMs: processingTimeMs,
      ipAddress: req.ip || null,
      userAgent: req.headers["user-agent"] || null,
    });
    res.status(500).json({ error: "Failed to generate alt text", details: error.message });
  }
});

// POST /api/v1/bulk-generate
apiRouter.post("/bulk-generate", authenticateApiKey, async (req: Request, res: Response) => {
  const apiKey = (req as any).apiKey;
  const { image_urls, page_context } = req.body;

  if (!image_urls || !Array.isArray(image_urls) || image_urls.length === 0) {
    return res.status(400).json({ error: "image_urls array is required" });
  }

  if (image_urls.length > 50) {
    return res.status(400).json({ error: "Maximum 50 images per request" });
  }

  const results = [];
  for (const url of image_urls) {
    try {
      const result = await invokeLLM({
        messages: [
          { role: "system", content: "Generate concise WCAG-compliant alt text. Return JSON: { altText, confidence, imageType, wcagCompliance }" },
          { role: "user", content: [
            { type: "image_url", image_url: { url, detail: "high" } },
            { type: "text", text: `Alt text for this image.${page_context ? ` Context: ${page_context}` : ""}` },
          ]},
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "alt_text_result",
            strict: true,
            schema: {
              type: "object",
              properties: {
                altText: { type: "string" },
                confidence: { type: "number" },
                imageType: { type: "string", enum: ["photo", "illustration", "icon", "chart", "screenshot", "decorative", "unknown"] },
                wcagCompliance: { type: "string", enum: ["pass", "fail", "warning"] },
              },
              required: ["altText", "confidence", "imageType", "wcagCompliance"],
              additionalProperties: false,
            },
          },
        },
      });
      const content = result.choices[0]?.message?.content;
      const parsed = JSON.parse(typeof content === "string" ? content : "{}");
      results.push({ image_url: url, alt_text: parsed.altText, confidence: parsed.confidence, status: "completed" });
    } catch {
      results.push({ image_url: url, alt_text: null, confidence: 0, status: "failed" });
    }
  }

  res.json({ results, total: image_urls.length, completed: results.filter(r => r.status === "completed").length });
});

// GET /api/v1/health
apiRouter.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", version: "1.0.0", service: "TheAltText API" });
});

export { apiRouter };
