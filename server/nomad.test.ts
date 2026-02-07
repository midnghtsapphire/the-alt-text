import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createTestContext(): TrpcContext {
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

describe("nomad.locations", () => {
  it("returns list of locations ordered by opportunity score", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const locations = await caller.nomad.locations();

    expect(Array.isArray(locations)).toBe(true);
    expect(locations.length).toBeGreaterThan(0);
    
    // Check that locations are ordered by opportunity score descending
    for (let i = 0; i < locations.length - 1; i++) {
      expect(locations[i]!.opportunityScore).toBeGreaterThanOrEqual(locations[i + 1]!.opportunityScore);
    }
    
    // Check that each location has required fields
    const firstLocation = locations[0];
    expect(firstLocation).toHaveProperty("id");
    expect(firstLocation).toHaveProperty("slug");
    expect(firstLocation).toHaveProperty("city");
    expect(firstLocation).toHaveProperty("state");
    expect(firstLocation).toHaveProperty("opportunityScore");
    expect(firstLocation).toHaveProperty("demandLevel");
  });
});

describe("nomad.locationBySlug", () => {
  it("returns location details for valid slug", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const location = await caller.nomad.locationBySlug({ slug: "detroit-mi" });

    expect(location).toBeDefined();
    expect(location?.city).toBe("Detroit");
    expect(location?.state).toBe("Michigan");
    expect(location?.opportunityScore).toBeGreaterThan(0);
  });

  it("returns undefined for invalid slug", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const location = await caller.nomad.locationBySlug({ slug: "nonexistent-city" });

    expect(location).toBeUndefined();
  });
});

describe("nomad.relocationSteps", () => {
  it("returns pre-departure steps for location", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // First get a location
    const locations = await caller.nomad.locations();
    const firstLocation = locations[0];
    expect(firstLocation).toBeDefined();

    const steps = await caller.nomad.relocationSteps({
      locationId: firstLocation!.id,
      phase: "pre_departure"
    });

    expect(Array.isArray(steps)).toBe(true);
    expect(steps.length).toBeGreaterThan(0);
    
    // All steps should be pre_departure phase
    steps.forEach(step => {
      expect(step.phase).toBe("pre_departure");
      expect(step).toHaveProperty("title");
      expect(step).toHaveProperty("description");
      expect(step).toHaveProperty("category");
      expect(step).toHaveProperty("priority");
    });
  });

  it("returns post-arrival steps for location", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const locations = await caller.nomad.locations();
    const firstLocation = locations[0];

    const steps = await caller.nomad.relocationSteps({
      locationId: firstLocation!.id,
      phase: "post_arrival"
    });

    expect(Array.isArray(steps)).toBe(true);
    expect(steps.length).toBeGreaterThan(0);
    
    steps.forEach(step => {
      expect(step.phase).toBe("post_arrival");
    });
  });

  it("returns all steps when phase not specified", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const locations = await caller.nomad.locations();
    const firstLocation = locations[0];

    const allSteps = await caller.nomad.relocationSteps({
      locationId: firstLocation!.id
    });

    const preSteps = await caller.nomad.relocationSteps({
      locationId: firstLocation!.id,
      phase: "pre_departure"
    });

    const postSteps = await caller.nomad.relocationSteps({
      locationId: firstLocation!.id,
      phase: "post_arrival"
    });

    expect(allSteps.length).toBe(preSteps.length + postSteps.length);
  });
});

describe("nomad.trainingPrograms", () => {
  it("returns list of training programs ordered by job probability boost", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const programs = await caller.nomad.trainingPrograms();

    expect(Array.isArray(programs)).toBe(true);
    expect(programs.length).toBeGreaterThan(0);
    
    // Check ordering by jobProbabilityBoost descending
    for (let i = 0; i < programs.length - 1; i++) {
      expect(programs[i]!.jobProbabilityBoost).toBeGreaterThanOrEqual(programs[i + 1]!.jobProbabilityBoost);
    }
    
    // Check required fields
    const firstProgram = programs[0];
    expect(firstProgram).toHaveProperty("name");
    expect(firstProgram).toHaveProperty("type");
    expect(firstProgram).toHaveProperty("jobProbabilityBoost");
    expect(firstProgram).toHaveProperty("salaryImpact");
  });
});

describe("nomad.calculateJobProbability", () => {
  it("calculates job probability for entry level with no credentials", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const locations = await caller.nomad.locations();
    const firstLocation = locations[0];

    const probability = await caller.nomad.calculateJobProbability({
      locationId: firstLocation!.id,
      experienceLevel: "entry",
      hasApprenticeship: false,
      hasCertification: false,
      hasDegree: false
    });

    expect(probability).toBeDefined();
    expect(probability?.baseProbability).toBeGreaterThan(0);
    expect(probability?.baseProbability).toBeLessThanOrEqual(100);
    expect(probability).toHaveProperty("timeToHire");
    expect(probability).toHaveProperty("expectedSalaryRange");
  });

  it("shows higher probability for senior level with all credentials", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const locations = await caller.nomad.locations();
    const firstLocation = locations[0];

    const entryProb = await caller.nomad.calculateJobProbability({
      locationId: firstLocation!.id,
      experienceLevel: "entry",
      hasApprenticeship: false,
      hasCertification: false,
      hasDegree: false
    });

    const seniorProb = await caller.nomad.calculateJobProbability({
      locationId: firstLocation!.id,
      experienceLevel: "senior",
      hasApprenticeship: true,
      hasCertification: true,
      hasDegree: true
    });

    expect(seniorProb?.baseProbability).toBeGreaterThan(entryProb?.baseProbability || 0);
  });

  it("returns undefined for invalid location", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const probability = await caller.nomad.calculateJobProbability({
      locationId: 99999,
      experienceLevel: "mid",
      hasApprenticeship: false,
      hasCertification: false,
      hasDegree: false
    });

    expect(probability).toBeUndefined();
  });
});
