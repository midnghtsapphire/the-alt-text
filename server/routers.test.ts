import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "test",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Topics Router", () => {
  it("should list all topics", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const topics = await caller.topics.list();
    
    expect(Array.isArray(topics)).toBe(true);
    expect(topics.length).toBeGreaterThan(0);
    expect(topics[0]).toHaveProperty("id");
    expect(topics[0]).toHaveProperty("name");
    expect(topics[0]).toHaveProperty("slug");
  });

  it("should get topic by slug", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const topic = await caller.topics.bySlug({ slug: "industry-overview" });
    
    expect(topic).toBeDefined();
    if (topic) {
      expect(topic.slug).toBe("industry-overview");
      expect(topic).toHaveProperty("name");
    }
  });
});

describe("Q&A Router", () => {
  it("should list all Q&A items", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const qaItems = await caller.qa.list();
    
    expect(Array.isArray(qaItems)).toBe(true);
    expect(qaItems.length).toBeGreaterThan(0);
    expect(qaItems[0]).toHaveProperty("id");
    expect(qaItems[0]).toHaveProperty("question");
    expect(qaItems[0]).toHaveProperty("answer");
  });

  it("should search Q&A items", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const results = await caller.qa.search({ query: "tool" });
    
    expect(Array.isArray(results)).toBe(true);
    // Results may be empty if no matches, but should be an array
  });

  it("should filter Q&A items by topic", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const qaItems = await caller.qa.byTopic({ topicId: 1 });
    
    expect(Array.isArray(qaItems)).toBe(true);
    qaItems.forEach(item => {
      expect(item.topicId).toBe(1);
    });
  });
});

describe("Resources Router", () => {
  it("should list all resources", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const resources = await caller.resources.list();
    
    expect(Array.isArray(resources)).toBe(true);
    expect(resources.length).toBeGreaterThan(0);
    expect(resources[0]).toHaveProperty("id");
    expect(resources[0]).toHaveProperty("name");
    expect(resources[0]).toHaveProperty("category");
  });

  it("should filter resources by category", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const resources = await caller.resources.byCategory({ category: "training" });
    
    expect(Array.isArray(resources)).toBe(true);
    resources.forEach(resource => {
      expect(resource.category).toBe("training");
    });
  });
});

describe("Statistics Router", () => {
  it("should list all statistics", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const stats = await caller.statistics.all();
    
    expect(Array.isArray(stats)).toBe(true);
    expect(stats.length).toBeGreaterThan(0);
    expect(stats[0]).toHaveProperty("type");
    expect(stats[0]).toHaveProperty("label");
    expect(stats[0]).toHaveProperty("value");
  });

  it("should filter statistics by type", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const stats = await caller.statistics.byType({ type: "salary" });
    
    expect(Array.isArray(stats)).toBe(true);
    stats.forEach(stat => {
      expect(stat.type).toBe("salary");
    });
  });
});

describe("Sources Router", () => {
  it("should list all sources", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const sources = await caller.sources.list();
    
    expect(Array.isArray(sources)).toBe(true);
    // Sources may be empty if not seeded yet
    if (sources.length > 0) {
      expect(sources[0]).toHaveProperty("id");
      expect(sources[0]).toHaveProperty("citation");
    }
  });
});

describe("Bookmarks Router", () => {
  it("should require authentication to list bookmarks", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    await expect(caller.bookmarks.list()).rejects.toThrow();
  });

  it("should list bookmarks for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const bookmarks = await caller.bookmarks.list();
    
    expect(Array.isArray(bookmarks)).toBe(true);
  });

  it("should add and remove bookmarks", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    // Add bookmark
    const addResult = await caller.bookmarks.add({ qaItemId: 1 });
    expect(addResult.success).toBe(true);
    
    // Check if bookmarked
    const isBookmarked = await caller.bookmarks.isBookmarked({ qaItemId: 1 });
    expect(isBookmarked).toBe(true);
    
    // Remove bookmark
    const removeResult = await caller.bookmarks.remove({ qaItemId: 1 });
    expect(removeResult.success).toBe(true);
    
    // Check if no longer bookmarked
    const isStillBookmarked = await caller.bookmarks.isBookmarked({ qaItemId: 1 });
    expect(isStillBookmarked).toBe(false);
  });
});

describe("Auth Router", () => {
  it("should return null for unauthenticated user", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const user = await caller.auth.me();
    
    expect(user).toBeNull();
  });

  it("should return user data for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const user = await caller.auth.me();
    
    expect(user).toBeDefined();
    expect(user?.email).toBe("test@example.com");
  });
});
