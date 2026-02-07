import { describe, it, expect } from "vitest";
import * as db from "./db";

describe("Changelog and Admin Features", () => {
  describe("Content Versions", () => {
    it("should retrieve all content versions", async () => {
      const versions = await db.getContentVersions();
      expect(Array.isArray(versions)).toBe(true);
    });

    it("should filter content versions by color", async () => {
      const redVersions = await db.getContentVersions("red");
      expect(Array.isArray(redVersions)).toBe(true);
      // All returned versions should be red
      redVersions.forEach(version => {
        expect(version.iterationColor).toBe("red");
      });
    });

    it("should retrieve versions for specific content", async () => {
      const versions = await db.getContentVersionsByContent("qa", 1);
      expect(Array.isArray(versions)).toBe(true);
    });
  });

  describe("Verification Status", () => {
    it("should retrieve verification status summary", async () => {
      const status = await db.getVerificationStatus();
      expect(status).toHaveProperty("total");
      expect(status).toHaveProperty("pending");
      expect(status).toHaveProperty("verified");
      expect(status).toHaveProperty("needsReview");
      expect(status).toHaveProperty("failed");
      expect(status).toHaveProperty("byType");
      expect(typeof status.total).toBe("number");
    });

    it("should update fact verification status", async () => {
      const result = await db.updateFactVerification(
        "qa",
        1,
        "verified",
        "Test verification note"
      );
      expect(result).toBeTruthy();
    });
  });

  describe("Link Health", () => {
    it("should retrieve link health status", async () => {
      const health = await db.getLinkHealthStatus();
      expect(health).toHaveProperty("total");
      expect(health).toHaveProperty("working");
      expect(health).toHaveProperty("broken");
      expect(health).toHaveProperty("recentChecks");
      expect(typeof health.total).toBe("number");
      expect(Array.isArray(health.recentChecks)).toBe(true);
    });
  });

  describe("Feature Suggestions", () => {
    it("should retrieve all feature suggestions", async () => {
      const suggestions = await db.getFeatureSuggestions();
      expect(Array.isArray(suggestions)).toBe(true);
    });

    it("should filter suggestions by status", async () => {
      const newSuggestions = await db.getFeatureSuggestions("new");
      expect(Array.isArray(newSuggestions)).toBe(true);
      newSuggestions.forEach(suggestion => {
        expect(suggestion.status).toBe("new");
      });
    });

    it("should create a new feature suggestion", async () => {
      const suggestion = await db.createFeatureSuggestion({
        suggestionType: "feature",
        title: "Test feature suggestion",
        description: "This is a test suggestion for vitest",
        name: "Test User",
        email: "test@example.com",
      });
      expect(suggestion).toBeTruthy();
      if (suggestion) {
        expect(suggestion.title).toBe("Test feature suggestion");
        expect(suggestion.suggestionType).toBe("feature");
      }
    });

    it("should upvote a feature suggestion", async () => {
      // First create a suggestion
      const created = await db.createFeatureSuggestion({
        suggestionType: "improvement",
        title: "Test upvote suggestion",
        description: "This is a test for upvoting",
      });
      
      expect(created).toBeTruthy();
      
      if (created && created.id) {
        // Then upvote it
        const upvoted = await db.upvoteFeatureSuggestion(created.id);
        expect(upvoted).toBeTruthy();
        if (upvoted) {
          expect(upvoted.upvotes).toBeGreaterThan(0);
        }
      }
    });

    it("should support anonymous suggestions", async () => {
      const suggestion = await db.createFeatureSuggestion({
        suggestionType: "bug",
        title: "Anonymous bug report",
        description: "This is an anonymous suggestion",
        // No name, email, or userId
      });
      expect(suggestion).toBeTruthy();
      if (suggestion) {
        expect(suggestion.title).toBe("Anonymous bug report");
      }
    });
  });
});
