import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: userId,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("progress.createPlan", () => {
  it("creates a relocation plan for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.progress.createPlan({
      locationId: 1,
      targetMoveDate: "2026-06-01",
    });

    expect(result).toHaveProperty("planId");
    expect(typeof result.planId).toBe("number");
  });

  it("creates a plan without target move date", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.progress.createPlan({
      locationId: 1,
    });

    expect(result).toHaveProperty("planId");
  });
});

describe("progress.myPlans", () => {
  it("returns user's relocation plans", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const plans = await caller.progress.myPlans();

    expect(Array.isArray(plans)).toBe(true);
  });
});

describe("progress.updateStepProgress", () => {
  it("updates step progress with completion status", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // First create a plan
    const { planId } = await caller.progress.createPlan({
      locationId: 1,
    });

    // Update step progress
    const result = await caller.progress.updateStepProgress({
      relocationPlanId: planId!,
      stepId: 1,
      isCompleted: true,
      completedAt: new Date().toISOString(),
    });

    expect(result).toHaveProperty("progressId");
    expect(typeof result.progressId).toBe("number");
  });

  it("updates step progress with due date", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const { planId } = await caller.progress.createPlan({
      locationId: 1,
    });

    const result = await caller.progress.updateStepProgress({
      relocationPlanId: planId!,
      stepId: 2,
      dueDate: "2026-05-01",
      notes: "Important deadline",
    });

    expect(result).toHaveProperty("progressId");
  });
});

describe("progress.getStepProgress", () => {
  it("returns step progress for a plan", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const { planId } = await caller.progress.createPlan({
      locationId: 1,
    });

    const progress = await caller.progress.getStepProgress({
      planId: planId!,
    });

    expect(Array.isArray(progress)).toBe(true);
  });
});

describe("progress.addDocument", () => {
  it("adds a document to step progress", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const { planId } = await caller.progress.createPlan({
      locationId: 1,
    });

    const { progressId } = await caller.progress.updateStepProgress({
      relocationPlanId: planId!,
      stepId: 1,
    });

    const result = await caller.progress.addDocument({
      stepProgressId: progressId!,
      fileName: "certification.pdf",
      fileUrl: "https://storage.example.com/doc.pdf",
      fileKey: "documents/test-doc.pdf",
      fileSize: 1024,
      mimeType: "application/pdf",
    });

    expect(result).toHaveProperty("documentId");
    expect(typeof result.documentId).toBe("number");
  });
});

describe("progress.getDocuments", () => {
  it("returns documents for step progress", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const { planId } = await caller.progress.createPlan({
      locationId: 1,
    });

    const { progressId } = await caller.progress.updateStepProgress({
      relocationPlanId: planId!,
      stepId: 1,
    });

    const documents = await caller.progress.getDocuments({
      stepProgressId: progressId!,
    });

    expect(Array.isArray(documents)).toBe(true);
  });
});

describe("progress.deleteDocument", () => {
  it("deletes a document", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const { planId } = await caller.progress.createPlan({
      locationId: 1,
    });

    const { progressId } = await caller.progress.updateStepProgress({
      relocationPlanId: planId!,
      stepId: 1,
    });

    const { documentId } = await caller.progress.addDocument({
      stepProgressId: progressId!,
      fileName: "test.pdf",
      fileUrl: "https://storage.example.com/test.pdf",
      fileKey: "documents/test.pdf",
    });

    const result = await caller.progress.deleteDocument({
      documentId: documentId!,
    });

    expect(result).toEqual({ success: true });
  });
});

describe("progress.updateStatus", () => {
  it("updates relocation plan status", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const { planId } = await caller.progress.createPlan({
      locationId: 1,
    });

    const result = await caller.progress.updateStatus({
      planId: planId!,
      status: "preparing",
    });

    expect(result).toEqual({ success: true });
  });
});
