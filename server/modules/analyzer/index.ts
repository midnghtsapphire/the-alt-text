import { invokeLLM } from "../../_core/llm";
import { getDb } from "../../db";
import { altTextImageAnalysis } from "../../../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * ANALYZER MODULE
 * AI-powered image analysis and alt text generation using OpenRouter Vision API
 */

export interface ImageAnalysisInput {
  imageUrl: string;
  pageContext?: string;
  surroundingText?: string;
  currentAltText?: string;
}

export interface ImageAnalysisResult {
  generatedAltText: string;
  confidence: number;
  imageType:
    | "photo"
    | "illustration"
    | "logo"
    | "icon"
    | "diagram"
    | "chart"
    | "screenshot"
    | "decorative";
  detectedText?: string;
  reasoning?: string;
}

export class AnalyzerModule {
  /**
   * Analyze a single image and generate alt text
   */
  async analyzeImage(input: ImageAnalysisInput): Promise<ImageAnalysisResult> {
    try {
      // Build context-aware prompt
      const contextInfo = [];
      if (input.pageContext) {
        contextInfo.push(`Page context: ${input.pageContext}`);
      }
      if (input.surroundingText) {
        contextInfo.push(`Surrounding text: ${input.surroundingText}`);
      }
      if (input.currentAltText) {
        contextInfo.push(`Current alt text: "${input.currentAltText}"`);
      }

      const prompt = `You are an accessibility expert analyzing images to generate descriptive alt text for screen readers.

${contextInfo.length > 0 ? contextInfo.join("\n") + "\n" : ""}
Analyze this image and provide:
1. A concise, descriptive alt text (max 125 characters)
2. Image type classification
3. Any text detected in the image
4. Brief reasoning for your description

Guidelines:
- Be specific and descriptive
- Avoid phrases like "image of" or "picture of"
- For decorative images, suggest empty alt text
- For logos, include company/brand name
- For charts/diagrams, describe the data/concept
- For icons, describe the function/meaning

Return your response in JSON format:
{
  "altText": "your generated alt text",
  "imageType": "photo|illustration|logo|icon|diagram|chart|screenshot|decorative",
  "detectedText": "any text found in image",
  "confidence": 0-100,
  "reasoning": "brief explanation"
}`;

      // Call OpenRouter Vision API
      const response = await invokeLLM({
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: input.imageUrl,
                  detail: "high",
                },
              },
            ],
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "image_analysis",
            strict: true,
            schema: {
              type: "object",
              properties: {
                altText: {
                  type: "string",
                  description: "Generated alt text for the image",
                },
                imageType: {
                  type: "string",
                  enum: [
                    "photo",
                    "illustration",
                    "logo",
                    "icon",
                    "diagram",
                    "chart",
                    "screenshot",
                    "decorative",
                  ],
                  description: "Classification of image type",
                },
                detectedText: {
                  type: "string",
                  description: "Any text detected in the image",
                },
                confidence: {
                  type: "number",
                  description: "Confidence score 0-100",
                },
                reasoning: {
                  type: "string",
                  description: "Brief explanation of the alt text choice",
                },
              },
              required: ["altText", "imageType", "confidence", "reasoning"],
              additionalProperties: false,
            },
          },
        },
      });

      // Parse response
      const content = response.choices[0]?.message?.content;
      if (!content || typeof content !== 'string') {
        throw new Error("No response from vision API");
      }

      const analysis = JSON.parse(content);

      return {
        generatedAltText: analysis.altText,
        confidence: analysis.confidence,
        imageType: analysis.imageType,
        detectedText: analysis.detectedText || undefined,
        reasoning: analysis.reasoning,
      };
    } catch (error) {
      console.error("Image analysis error:", error);

      // Fallback: basic alt text
      return {
        generatedAltText: "Image description unavailable",
        confidence: 0,
        imageType: "photo",
        reasoning: "Analysis failed, using fallback",
      };
    }
  }

  /**
   * Batch analyze multiple images
   */
  async batchAnalyze(
    inputs: ImageAnalysisInput[]
  ): Promise<ImageAnalysisResult[]> {
    const results: ImageAnalysisResult[] = [];

    // Process in parallel with rate limiting
    const batchSize = 5; // Process 5 images at a time
    for (let i = 0; i < inputs.length; i += batchSize) {
      const batch = inputs.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map((input) => this.analyzeImage(input))
      );
      results.push(...batchResults);

      // Small delay to avoid rate limiting
      if (i + batchSize < inputs.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  /**
   * Analyze all pending images for a scan
   */
  async analyzeScan(scanId: number): Promise<void> {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    // Get all pending image analysis for this scan
    const pendingAnalysis = await db
      .select()
      .from(altTextImageAnalysis)
      .where(eq(altTextImageAnalysis.status, "pending"));

    console.log(`Analyzing ${pendingAnalysis.length} images for scan ${scanId}`);

    for (const analysis of pendingAnalysis) {
      try {
        // Analyze image
        const result = await this.analyzeImage({
          imageUrl: analysis.imageUrl,
          pageContext: analysis.pageContext || undefined,
          surroundingText: analysis.surroundingText || undefined,
          currentAltText: analysis.currentAltText || undefined,
        });

        // Update database
        await db
          .update(altTextImageAnalysis)
          .set({
            generatedAltText: result.generatedAltText,
            confidence: result.confidence.toString(),
            imageType: result.imageType,
            status: "analyzed",
            analyzedAt: new Date(),
          })
          .where(eq(altTextImageAnalysis.id, analysis.id));

        console.log(
          `✓ Analyzed image ${analysis.id}: "${result.generatedAltText}"`
        );
      } catch (error) {
        console.error(`Error analyzing image ${analysis.id}:`, error);

        // Mark as failed
        await db
          .update(altTextImageAnalysis)
          .set({
            status: "rejected",
            generatedAltText: "Analysis failed",
            confidence: "0",
          })
          .where(eq(altTextImageAnalysis.id, analysis.id));
      }
    }
  }

  /**
   * Review and approve/reject AI-generated alt text
   */
  async reviewAnalysis(
    analysisId: number,
    approved: boolean,
    reviewedBy: number,
    customAltText?: string
  ): Promise<void> {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    await db
      .update(altTextImageAnalysis)
      .set({
        status: approved ? "approved" : "rejected",
        reviewedBy,
        reviewedAt: new Date(),
        generatedAltText: customAltText || undefined,
      })
      .where(eq(altTextImageAnalysis.id, analysisId));
  }

  /**
   * Get analysis statistics
   */
  async getAnalysisStats(scanId: number): Promise<{
    total: number;
    pending: number;
    analyzed: number;
    approved: number;
    rejected: number;
    avgConfidence: number;
  }> {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    const allAnalysis = await db
      .select()
      .from(altTextImageAnalysis)
      .where(
        eq(
          altTextImageAnalysis.scanResultId,
          scanId as any // TODO: Fix type
        )
      );

    const stats = {
      total: allAnalysis.length,
      pending: allAnalysis.filter((a) => a.status === "pending").length,
      analyzed: allAnalysis.filter((a) => a.status === "analyzed").length,
      approved: allAnalysis.filter((a) => a.status === "approved").length,
      rejected: allAnalysis.filter((a) => a.status === "rejected").length,
      avgConfidence: 0,
    };

    const confidenceValues = allAnalysis
      .filter((a) => a.confidence)
      .map((a) => parseFloat(a.confidence));

    if (confidenceValues.length > 0) {
      stats.avgConfidence =
        confidenceValues.reduce((sum, val) => sum + val, 0) /
        confidenceValues.length;
    }

    return stats;
  }
}

// Export singleton instance
export const analyzer = new AnalyzerModule();
