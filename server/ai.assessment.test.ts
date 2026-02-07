import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock OpenRouter API
global.fetch = vi.fn();

describe("AI Assessment", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create a mock context
    const mockContext: TrpcContext = {
      user: null,
      req: {} as any,
      res: {} as any,
    };

    caller = appRouter.createCaller(mockContext);
  });

  it("should analyze career assessment with OpenRouter", async () => {
    // Mock successful OpenRouter response
    const mockAIResponse = {
      careerLevel: "Mechatronics Technician",
      careerLevelDescription: "Entry-level role combining mechanical and electronic systems",
      salaryRange: "$55k-$75k",
      timeline: "6-12 months",
      hiddenQualifications: "Your manufacturing background provides hands-on experience with production systems. This translates directly to mechatronics troubleshooting and maintenance roles.",
      recommendedPath: "Start with a 6-month mechatronics certificate program while working. Focus on PLC programming and industrial automation. Target entry-level technician roles at automotive or aerospace manufacturers.",
      nextSteps: [
        "Enroll in a mechatronics certificate program (FAME, SME, or community college)",
        "Learn basic PLC programming (Allen-Bradley or Siemens)",
        "Get OSHA 30 and basic electrical safety certifications",
        "Network with local manufacturers and attend industry meetups",
        "Apply for apprenticeship programs at major manufacturers"
      ]
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{
          message: {
            content: JSON.stringify(mockAIResponse)
          }
        }]
      })
    });

    const result = await caller.ai.assessCareer({
      answers: {
        "1": "manufacturing",
        "2": "high_school",
        "3": "3-5",
        "4": "hands_on",
        "5": "short"
      }
    });

    expect(result.careerLevel).toBe("Mechatronics Technician");
    expect(result.salaryRange).toBe("$55k-$75k");
    expect(result.timeline).toBe("6-12 months");
    expect(result.nextSteps).toHaveLength(5);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://openrouter.ai/api/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Authorization": expect.stringContaining("Bearer"),
          "Content-Type": "application/json"
        })
      })
    );
  });

  it("should handle military veteran background", async () => {
    const mockAIResponse = {
      careerLevel: "Controls Engineer",
      careerLevelDescription: "Mid-level role designing and implementing automated control systems",
      salaryRange: "$75k-$95k",
      timeline: "12-18 months",
      hiddenQualifications: "Military experience provides discipline, systems thinking, and troubleshooting skills. Electronics training translates directly to industrial control systems.",
      recommendedPath: "Leverage GI Bill for bachelor's in mechatronics engineering technology. Focus on control systems and automation. Target defense contractors and aerospace companies that value military experience.",
      nextSteps: [
        "Use GI Bill benefits for degree program in mechatronics or electrical engineering",
        "Get PLC programming certifications (Rockwell, Siemens)",
        "Apply for SkillBridge or apprenticeship programs",
        "Network with veteran-friendly employers (Boeing, Lockheed, Northrop Grumman)",
        "Highlight security clearance and systems experience in applications"
      ]
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{
          message: {
            content: JSON.stringify(mockAIResponse)
          }
        }]
      })
    });

    const result = await caller.ai.assessCareer({
      answers: {
        "1": "military",
        "2": "some_college",
        "3": "6-10",
        "4": "technical",
        "5": "medium"
      }
    });

    expect(result.careerLevel).toBe("Controls Engineer");
    expect(result.salaryRange).toBe("$75k-$95k");
    expect(result.hiddenQualifications).toContain("Military experience");
  });

  it("should handle career changers with no experience", async () => {
    const mockAIResponse = {
      careerLevel: "Mechatronics Apprentice",
      careerLevelDescription: "Entry-level trainee position with earn-while-you-learn model",
      salaryRange: "$45k-$55k",
      timeline: "18-24 months",
      hiddenQualifications: "Problem-solving skills and willingness to learn are highly valued. Many successful mechatronics professionals started with no technical background.",
      recommendedPath: "Apply for FAME or SME apprenticeship programs that provide full training. Start with fundamentals: basic electronics, mechanical systems, and safety. Build hands-on experience through structured program.",
      nextSteps: [
        "Research FAME apprenticeship programs in your area",
        "Take free online courses in basic electronics and mechanics",
        "Visit local manufacturers and express interest in apprenticeships",
        "Get basic certifications: OSHA 10, forklift, basic hand tools",
        "Consider community college mechatronics certificate while applying"
      ]
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{
          message: {
            content: JSON.stringify(mockAIResponse)
          }
        }]
      })
    });

    const result = await caller.ai.assessCareer({
      answers: {
        "1": "other",
        "2": "high_school",
        "3": "0-2",
        "4": "learning",
        "5": "long"
      }
    });

    expect(result.careerLevel).toBe("Mechatronics Apprentice");
    expect(result.timeline).toBe("18-24 months");
    expect(result.nextSteps.length).toBeGreaterThan(0);
    // Check that at least one next step mentions apprenticeship or training
    const hasTrainingMention = result.nextSteps.some((step: string) => 
      step.toLowerCase().includes('apprentice') || 
      step.toLowerCase().includes('training') ||
      step.toLowerCase().includes('program')
    );
    expect(hasTrainingMention).toBe(true);
  });

  it("should handle API errors gracefully", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => "Internal Server Error"
    });

    await expect(
      caller.ai.assessCareer({
        answers: {
          "1": "manufacturing",
          "2": "high_school",
          "3": "3-5",
          "4": "hands_on",
          "5": "short"
        }
      })
    ).rejects.toThrow("Failed to analyze assessment");
  });

  it("should handle missing API key", async () => {
    const originalKey = process.env.OPENROUTER_API_KEY;
    delete process.env.OPENROUTER_API_KEY;

    await expect(
      caller.ai.assessCareer({
        answers: {
          "1": "manufacturing",
          "2": "high_school",
          "3": "3-5",
          "4": "hands_on",
          "5": "short"
        }
      })
    ).rejects.toThrow("OpenRouter API key not configured");

    process.env.OPENROUTER_API_KEY = originalKey;
  });
});
