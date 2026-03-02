import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { PLANS } from "./plans";
import { COOKIE_NAME, UNAUTHED_ERR_MSG, NOT_ADMIN_ERR_MSG } from "../shared/const";
import type { TrpcContext } from "./_core/context";

// ============================================================================
// MOCK DATABASE FUNCTIONS
// ============================================================================
vi.mock("./db", () => {
  const mockSubscription = {
    id: 1,
    userId: 1,
    plan: "pro",
    status: "active",
    imagesPerMonth: 2000,
    imagesUsedThisMonth: 10,
    bulkUploadsPerMonth: 50,
    apiCallsPerMonth: 5000,
    apiCallsUsedThisMonth: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockFreeSubscription = {
    ...mockSubscription,
    plan: "free",
    imagesPerMonth: 50,
    imagesUsedThisMonth: 0,
    bulkUploadsPerMonth: 0,
    apiCallsPerMonth: 0,
  };

  const mockMaxedSubscription = {
    ...mockSubscription,
    imagesUsedThisMonth: 2000,
  };

  return {
    getOrCreateSubscription: vi.fn().mockResolvedValue(mockSubscription),
    updateSubscription: vi.fn().mockResolvedValue(undefined),
    createImageAnalysis: vi.fn().mockResolvedValue({ id: 1 }),
    updateImageAnalysis: vi.fn().mockResolvedValue(undefined),
    getUserImageAnalyses: vi.fn().mockResolvedValue([
      { id: 1, imageUrl: "https://example.com/img.jpg", generatedAltText: "A test image", confidence: "95", status: "completed", createdAt: new Date() },
    ]),
    getUserStats: vi.fn().mockResolvedValue({
      totalImages: 100,
      completedImages: 95,
      failedImages: 5,
      avgConfidence: 92.5,
    }),
    createApiKey: vi.fn().mockResolvedValue({ id: 1 }),
    getUserApiKeys: vi.fn().mockResolvedValue([
      { id: 1, name: "Test Key", keyPrefix: "tat_live_abc", rateLimit: 60, monthlyLimit: 5000, monthlyUsed: 100, isActive: 1, createdAt: new Date() },
    ]),
    deactivateApiKey: vi.fn().mockResolvedValue(undefined),
    getApiKeyByHash: vi.fn().mockResolvedValue(null),
    createBatchJob: vi.fn().mockResolvedValue({ id: 1 }),
    getUserBatchJobs: vi.fn().mockResolvedValue([]),
    updateBatchJob: vi.fn().mockResolvedValue(undefined),
    logApiUsage: vi.fn().mockResolvedValue(undefined),
    getAdminStats: vi.fn().mockResolvedValue({
      totalUsers: 50,
      activeSubscriptions: 30,
      totalImagesProcessed: 5000,
      activeApiKeys: 15,
    }),
    // re-export originals that aren't mocked
    getDb: vi.fn().mockResolvedValue(null),
    upsertUser: vi.fn().mockResolvedValue(undefined),
    getUserByOpenId: vi.fn().mockResolvedValue(undefined),
  };
});

// Mock invokeLLM
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{
      message: {
        content: JSON.stringify({
          altText: "A golden retriever sitting on green grass",
          confidence: 95,
          imageType: "photo",
          wcagCompliance: "pass",
        }),
      },
    }],
    usage: { total_tokens: 150 },
    model: "gemini-2.5-flash",
  }),
}));

// ============================================================================
// HELPERS
// ============================================================================
type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createUser(overrides: Partial<AuthenticatedUser> = {}): AuthenticatedUser {
  return {
    id: 1,
    openId: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "oauth",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };
}

function createAdminUser(): AuthenticatedUser {
  return createUser({ id: 2, openId: "admin-123", role: "admin", name: "Admin User", email: "admin@example.com" });
}

type CookieCall = { name: string; options: Record<string, unknown> };

function createContext(user: AuthenticatedUser | null = null): { ctx: TrpcContext; clearedCookies: CookieCall[] } {
  const clearedCookies: CookieCall[] = [];
  return {
    ctx: {
      user,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {
        clearCookie: (name: string, options: Record<string, unknown>) => {
          clearedCookies.push({ name, options });
        },
      } as TrpcContext["res"],
    },
    clearedCookies,
  };
}

// ============================================================================
// TESTS
// ============================================================================

describe("Plans configuration", () => {
  it("has exactly 3 plans: free, pro, enterprise", () => {
    expect(PLANS).toHaveLength(3);
    expect(PLANS.map(p => p.id)).toEqual(["free", "pro", "enterprise"]);
  });

  it("free plan has correct limits", () => {
    const free = PLANS.find(p => p.id === "free")!;
    expect(free.price).toBe(0);
    expect(free.imagesPerMonth).toBe(50);
    expect(free.bulkUploadsPerMonth).toBe(0);
    expect(free.apiCallsPerMonth).toBe(0);
  });

  it("pro plan has correct limits", () => {
    const pro = PLANS.find(p => p.id === "pro")!;
    expect(pro.price).toBe(29);
    expect(pro.imagesPerMonth).toBe(2000);
    expect(pro.bulkUploadsPerMonth).toBe(50);
    expect(pro.apiCallsPerMonth).toBe(5000);
    expect(pro.highlighted).toBe(true);
  });

  it("enterprise plan has correct limits", () => {
    const ent = PLANS.find(p => p.id === "enterprise")!;
    expect(ent.price).toBe(99);
    expect(ent.imagesPerMonth).toBe(25000);
    expect(ent.bulkUploadsPerMonth).toBe(500);
    expect(ent.apiCallsPerMonth).toBe(50000);
  });

  it("all plans have required fields", () => {
    for (const plan of PLANS) {
      expect(plan.name).toBeTruthy();
      expect(plan.priceLabel).toBeTruthy();
      expect(plan.description).toBeTruthy();
      expect(plan.features.length).toBeGreaterThan(0);
      expect(plan.cta).toBeTruthy();
    }
  });
});

describe("auth.me", () => {
  it("returns null for unauthenticated user", async () => {
    const { ctx } = createContext(null);
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user data for authenticated user", async () => {
    const user = createUser();
    const { ctx } = createContext(user);
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toMatchObject({ id: 1, email: "test@example.com", name: "Test User" });
  });
});

describe("auth.logout", () => {
  it("clears session cookie and returns success", async () => {
    const { ctx, clearedCookies } = createContext(createUser());
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
    expect(clearedCookies[0]?.options).toMatchObject({ maxAge: -1 });
  });
});

describe("subscription.getPlans", () => {
  it("returns all plans (public procedure)", async () => {
    const { ctx } = createContext(null);
    const caller = appRouter.createCaller(ctx);
    const plans = await caller.subscription.getPlans();
    expect(plans).toHaveLength(3);
    expect(plans[0].id).toBe("free");
  });
});

describe("subscription.get", () => {
  it("requires authentication", async () => {
    const { ctx } = createContext(null);
    const caller = appRouter.createCaller(ctx);
    await expect(caller.subscription.get()).rejects.toThrow(UNAUTHED_ERR_MSG);
  });

  it("returns subscription for authenticated user", async () => {
    const { ctx } = createContext(createUser());
    const caller = appRouter.createCaller(ctx);
    const sub = await caller.subscription.get();
    expect(sub).toMatchObject({ plan: "pro", status: "active" });
  });
});

describe("subscription.upgrade", () => {
  it("requires authentication", async () => {
    const { ctx } = createContext(null);
    const caller = appRouter.createCaller(ctx);
    await expect(caller.subscription.upgrade({ plan: "pro" })).rejects.toThrow(UNAUTHED_ERR_MSG);
  });

  it("upgrades to pro plan", async () => {
    const { ctx } = createContext(createUser());
    const caller = appRouter.createCaller(ctx);
    const result = await caller.subscription.upgrade({ plan: "pro" });
    expect(result).toEqual({ success: true, plan: "pro" });
  });

  it("upgrades to enterprise plan", async () => {
    const { ctx } = createContext(createUser());
    const caller = appRouter.createCaller(ctx);
    const result = await caller.subscription.upgrade({ plan: "enterprise" });
    expect(result).toEqual({ success: true, plan: "enterprise" });
  });
});

describe("subscription.cancel", () => {
  it("cancels subscription", async () => {
    const { ctx } = createContext(createUser());
    const caller = appRouter.createCaller(ctx);
    const result = await caller.subscription.cancel();
    expect(result).toEqual({ success: true });
  });
});

describe("alttext.generate", () => {
  it("requires authentication", async () => {
    const { ctx } = createContext(null);
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.alttext.generate({ imageUrl: "https://example.com/img.jpg" })
    ).rejects.toThrow(UNAUTHED_ERR_MSG);
  });

  it("generates alt text for an image", async () => {
    const { ctx } = createContext(createUser());
    const caller = appRouter.createCaller(ctx);
    const result = await caller.alttext.generate({ imageUrl: "https://example.com/img.jpg" });
    expect(result).toMatchObject({
      altText: "A golden retriever sitting on green grass",
      confidence: 95,
      imageType: "photo",
      wcagCompliance: "pass",
    });
    expect(result.processingTimeMs).toBeGreaterThanOrEqual(0);
  });

  it("accepts optional page context", async () => {
    const { ctx } = createContext(createUser());
    const caller = appRouter.createCaller(ctx);
    const result = await caller.alttext.generate({
      imageUrl: "https://example.com/img.jpg",
      pageContext: "Product page for dog toys",
      surroundingText: "Our best-selling chew toy",
    });
    expect(result.altText).toBeTruthy();
  });

  it("rejects when monthly limit is reached", async () => {
    const db = await import("./db");
    (db.getOrCreateSubscription as any).mockResolvedValueOnce({
      id: 1, userId: 1, plan: "pro", status: "active",
      imagesPerMonth: 2000, imagesUsedThisMonth: 2000,
    });

    const { ctx } = createContext(createUser());
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.alttext.generate({ imageUrl: "https://example.com/img.jpg" })
    ).rejects.toThrow("Monthly image limit reached");
  });

  it("validates image URL format", async () => {
    const { ctx } = createContext(createUser());
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.alttext.generate({ imageUrl: "not-a-url" })
    ).rejects.toThrow();
  });
});

describe("alttext.history", () => {
  it("returns user image history", async () => {
    const { ctx } = createContext(createUser());
    const caller = appRouter.createCaller(ctx);
    const history = await caller.alttext.history({ limit: 50, offset: 0 });
    expect(Array.isArray(history)).toBe(true);
    expect(history.length).toBeGreaterThan(0);
    expect(history[0]).toMatchObject({ generatedAltText: "A test image" });
  });
});

describe("alttext.stats", () => {
  it("returns user statistics", async () => {
    const { ctx } = createContext(createUser());
    const caller = appRouter.createCaller(ctx);
    const stats = await caller.alttext.stats();
    expect(stats).toMatchObject({
      totalImages: 100,
      completedImages: 95,
      failedImages: 5,
      plan: "pro",
      imagesPerMonth: 2000,
    });
    expect(stats.complianceScore).toBeGreaterThan(0);
  });
});

describe("bulk.create", () => {
  it("requires authentication", async () => {
    const { ctx } = createContext(null);
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.bulk.create({ imageUrls: ["https://example.com/1.jpg"] })
    ).rejects.toThrow(UNAUTHED_ERR_MSG);
  });

  it("rejects free plan users", async () => {
    const db = await import("./db");
    (db.getOrCreateSubscription as any).mockResolvedValueOnce({
      id: 1, userId: 1, plan: "free", status: "active",
      imagesPerMonth: 50, imagesUsedThisMonth: 0,
      bulkUploadsPerMonth: 0, apiCallsPerMonth: 0,
    });

    const { ctx } = createContext(createUser());
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.bulk.create({ imageUrls: ["https://example.com/1.jpg"] })
    ).rejects.toThrow("Bulk processing requires a Pro or Enterprise plan");
  });

  it("processes bulk images for pro users", async () => {
    const { ctx } = createContext(createUser());
    const caller = appRouter.createCaller(ctx);
    const result = await caller.bulk.create({
      imageUrls: ["https://example.com/1.jpg", "https://example.com/2.jpg"],
    });
    expect(result.results).toHaveLength(2);
    expect(result.results[0].status).toBe("completed");
  });

  it("validates minimum 1 image URL", async () => {
    const { ctx } = createContext(createUser());
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.bulk.create({ imageUrls: [] })
    ).rejects.toThrow();
  });
});

describe("apikeys.list", () => {
  it("returns user API keys", async () => {
    const { ctx } = createContext(createUser());
    const caller = appRouter.createCaller(ctx);
    const keys = await caller.apikeys.list();
    expect(Array.isArray(keys)).toBe(true);
    expect(keys[0]).toMatchObject({ name: "Test Key" });
  });
});

describe("apikeys.create", () => {
  it("creates an API key for pro users", async () => {
    const { ctx } = createContext(createUser());
    const caller = appRouter.createCaller(ctx);
    const result = await caller.apikeys.create({ name: "My API Key" });
    expect(result.key).toMatch(/^tat_live_/);
    expect(result.prefix).toBeTruthy();
  });

  it("rejects free plan users", async () => {
    const db = await import("./db");
    (db.getOrCreateSubscription as any).mockResolvedValueOnce({
      id: 1, userId: 1, plan: "free", status: "active",
      imagesPerMonth: 50, imagesUsedThisMonth: 0,
    });

    const { ctx } = createContext(createUser());
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.apikeys.create({ name: "My Key" })
    ).rejects.toThrow("API access requires a Pro or Enterprise plan");
  });

  it("validates name is not empty", async () => {
    const { ctx } = createContext(createUser());
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.apikeys.create({ name: "" })
    ).rejects.toThrow();
  });
});

describe("apikeys.revoke", () => {
  it("revokes an API key", async () => {
    const { ctx } = createContext(createUser());
    const caller = appRouter.createCaller(ctx);
    const result = await caller.apikeys.revoke({ id: 1 });
    expect(result).toEqual({ success: true });
  });
});

describe("admin.stats", () => {
  it("rejects non-admin users", async () => {
    const { ctx } = createContext(createUser());
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.stats()).rejects.toThrow(NOT_ADMIN_ERR_MSG);
  });

  it("rejects unauthenticated users", async () => {
    const { ctx } = createContext(null);
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.stats()).rejects.toThrow(NOT_ADMIN_ERR_MSG);
  });

  it("returns admin stats for admin users", async () => {
    const { ctx } = createContext(createAdminUser());
    const caller = appRouter.createCaller(ctx);
    const stats = await caller.admin.stats();
    expect(stats).toMatchObject({
      totalUsers: 50,
      activeSubscriptions: 30,
      totalImagesProcessed: 5000,
      activeApiKeys: 15,
    });
  });
});

describe("Industry landing pages data", () => {
  it("has 16 industries defined", async () => {
    // Import dynamically since it's a client module
    const { industries } = await import("../client/src/data/industries");
    expect(industries.length).toBe(16);
  });

  it("all industries have required fields", async () => {
    const { industries } = await import("../client/src/data/industries");
    for (const ind of industries) {
      expect(ind.slug).toBeTruthy();
      expect(ind.name).toBeTruthy();
      expect(ind.headline).toBeTruthy();
      expect(ind.subheadline).toBeTruthy();
      expect(ind.regulations.length).toBeGreaterThan(0);
      expect(ind.painPoints.length).toBeGreaterThan(0);
      expect(ind.benefits.length).toBeGreaterThan(0);
      expect(ind.stats.length).toBe(4);
      expect(ind.seoTitle).toBeTruthy();
      expect(ind.seoDescription).toBeTruthy();
    }
  });

  it("all industry slugs are unique", async () => {
    const { industries } = await import("../client/src/data/industries");
    const slugs = industries.map(i => i.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("getIndustryBySlug returns correct industry", async () => {
    const { getIndustryBySlug } = await import("../client/src/data/industries");
    const healthcare = getIndustryBySlug("healthcare");
    expect(healthcare).toBeDefined();
    expect(healthcare?.name).toBe("Healthcare");
  });

  it("getIndustryBySlug returns undefined for unknown slug", async () => {
    const { getIndustryBySlug } = await import("../client/src/data/industries");
    expect(getIndustryBySlug("nonexistent")).toBeUndefined();
  });
});
