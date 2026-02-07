import { describe, it, expect } from "vitest";
import { ENV } from "./_core/env";

describe("OpenRouter API Integration", () => {
  it("should have OPENROUTER_API_KEY configured", () => {
    expect(ENV.openRouterApiKey).toBeDefined();
    expect(ENV.openRouterApiKey.length).toBeGreaterThan(0);
    expect(ENV.openRouterApiKey).toMatch(/^sk-or-v1-/);
  });

  it("should successfully call OpenRouter API", async () => {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ENV.openRouterApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://mechatronopolis.manus.space",
        "X-Title": "Vitest Validation"
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet",
        messages: [
          {
            role: "user",
            content: "Respond with just the word 'success' in JSON format"
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 50
      })
    });

    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.choices).toBeDefined();
    expect(data.choices[0].message.content).toBeDefined();
  }, 30000); // 30 second timeout for API call
});
