import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";
import * as db from "./db";

// Mock context for protected procedures
const mockUser = {
  id: 1,
  openId: "test-user",
  name: "Test User",
  email: "test@example.com",
  avatar: null,
  role: "admin" as const,
};

const mockContext: Context = {
  user: mockUser,
  req: {} as any,
  res: {} as any,
};

const publicContext: Context = {
  user: null,
  req: {} as any,
  res: {} as any,
};

// Test data
let testCandidateId: number;
let testPartnerId: number;
let testPlacementId: number;
let testMilestoneId: number;
let testCommissionId: number;
let testStipendId: number;
let testCommunicationId: number;
let testInterviewId: number;

describe("Headhunter Module - Candidates", () => {
  it("should create a new candidate", async () => {
    const caller = appRouter.createCaller(mockContext);
    const result = await caller.headhunter.candidates.create({
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "+1234567890",
      currentRole: "CNC Operator",
      experienceLevel: "mid",
      salaryExpectation: 65000,
      willingToRelocate: true,
      skills: JSON.stringify(["CNC", "CAD", "Blueprint Reading"]),
      notes: "Strong candidate for machinist roles",
    });

    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
    testCandidateId = result.id;
  });

  it("should prevent duplicate candidate email", async () => {
    const caller = appRouter.createCaller(mockContext);
    await expect(
      caller.headhunter.candidates.create({
        firstName: "Jane",
        lastName: "Doe",
        email: "john.doe@example.com", // Same email as above
        experienceLevel: "entry",
      })
    ).rejects.toThrow("already exists");
  });

  it("should get candidate by ID", async () => {
    const caller = appRouter.createCaller(mockContext);
    const result = await caller.headhunter.candidates.getById({
      id: testCandidateId,
    });

    expect(result).toHaveProperty("id", testCandidateId);
    expect(result).toHaveProperty("firstName", "John");
    expect(result).toHaveProperty("lastName", "Doe");
    expect(result).toHaveProperty("email", "john.doe@example.com");
  });

  it("should list all candidates", async () => {
    const caller = appRouter.createCaller(mockContext);
    const result = await caller.headhunter.candidates.list();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("should filter candidates by status", async () => {
    const caller = appRouter.createCaller(mockContext);
    const result = await caller.headhunter.candidates.list({
      status: "new",
    });

    expect(Array.isArray(result)).toBe(true);
    result.forEach((candidate) => {
      expect(candidate.status).toBe("new");
    });
  });

  it("should update candidate information", async () => {
    const caller = appRouter.createCaller(mockContext);
    const result = await caller.headhunter.candidates.update({
      id: testCandidateId,
      status: "screening",
      notes: "Completed initial phone screen",
    });

    expect(result).toHaveProperty("success", true);

    const updated = await caller.headhunter.candidates.getById({
      id: testCandidateId,
    });
    expect(updated.status).toBe("screening");
  });
});

describe("Headhunter Module - Partners", () => {
  it("should create a new partner", async () => {
    const caller = appRouter.createCaller(mockContext);
    const result = await caller.headhunter.partners.create({
      partnerType: "manufacturer",
      companyName: "TSMC Arizona",
      contactName: "Jane Smith",
      contactEmail: "jane.smith@tsmc.com",
      contactPhone: "+1-480-555-0100",
      website: "https://www.tsmc.com",
      description: "Leading semiconductor manufacturer",
      commissionRate: 25.0,
      retentionBonusStructure: JSON.stringify({ 30: 5000, 90: 10000, 180: 15000 }),
    });

    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
    testPartnerId = result.id;
  });

  it("should get partner by ID", async () => {
    const caller = appRouter.createCaller(mockContext);
    const result = await caller.headhunter.partners.getById({
      id: testPartnerId,
    });

    expect(result).toHaveProperty("id", testPartnerId);
    expect(result).toHaveProperty("companyName", "TSMC Arizona");
    expect(result).toHaveProperty("partnerType", "manufacturer");
  });

  it("should list partners by type", async () => {
    const caller = appRouter.createCaller(mockContext);
    const result = await caller.headhunter.partners.list({
      partnerType: "manufacturer",
    });

    expect(Array.isArray(result)).toBe(true);
    result.forEach((partner) => {
      expect(partner.partnerType).toBe("manufacturer");
    });
  });

  it("should update partner status", async () => {
    const caller = appRouter.createCaller(mockContext);
    const result = await caller.headhunter.partners.update({
      id: testPartnerId,
      partnershipStatus: "active",
      contractStartDate: new Date().toISOString(),
    });

    expect(result).toHaveProperty("success", true);
  });
});

describe("Headhunter Module - Placements", () => {
  it("should create a new placement", async () => {
    const caller = appRouter.createCaller(mockContext);
    
    // First update candidate to "ready" status
    await caller.headhunter.candidates.update({
      id: testCandidateId,
      status: "ready",
    });

    const result = await caller.headhunter.placements.create({
      candidateId: testCandidateId,
      partnerId: testPartnerId,
      jobTitle: "CNC Machinist",
      jobType: "full-time",
      locationId: 1, // Assuming location exists
      startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      annualSalary: 65000,
      commissionRate: 25.0,
      retentionBonusStructure: JSON.stringify({ 30: 5000, 90: 10000, 180: 15000 }),
    });

    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
    testPlacementId = result.id;
  });

  it("should auto-create base commission on placement", async () => {
    const caller = appRouter.createCaller(mockContext);
    const commissions = await caller.headhunter.commissions.list({
      placementId: testPlacementId,
    });

    expect(commissions.length).toBeGreaterThan(0);
    const baseCommission = commissions.find((c) => c.commissionType === "base_fee");
    expect(baseCommission).toBeDefined();
    expect(baseCommission?.amount).toBe(16250); // 25% of $65,000
    testCommissionId = baseCommission!.id;
  });

  it("should auto-create retention milestones on placement", async () => {
    const caller = appRouter.createCaller(mockContext);
    const milestones = await caller.headhunter.milestones.list({
      placementId: testPlacementId,
    });

    expect(milestones.length).toBe(3); // 30, 90, 180 days
    expect(milestones[0].milestoneDays).toBe(30);
    expect(milestones[0].bonusAmount).toBe(5000);
    expect(milestones[1].milestoneDays).toBe(90);
    expect(milestones[1].bonusAmount).toBe(10000);
    expect(milestones[2].milestoneDays).toBe(180);
    expect(milestones[2].bonusAmount).toBe(15000);
    testMilestoneId = milestones[0].id;
  });

  it("should update candidate status to 'placed' after placement", async () => {
    const caller = appRouter.createCaller(mockContext);
    const candidate = await caller.headhunter.candidates.getById({
      id: testCandidateId,
    });

    expect(candidate.status).toBe("placed");
  });

  it("should get placement with related data", async () => {
    const caller = appRouter.createCaller(mockContext);
    const result = await caller.headhunter.placements.getById({
      id: testPlacementId,
    });

    expect(result).toHaveProperty("placement");
    expect(result).toHaveProperty("candidate");
    expect(result).toHaveProperty("partner");
    expect(result).toHaveProperty("milestones");
    expect(result).toHaveProperty("commissions");
    expect(result.placement.id).toBe(testPlacementId);
    expect(result.candidate?.id).toBe(testCandidateId);
    expect(result.partner?.id).toBe(testPartnerId);
  });

  it("should list placements by partner", async () => {
    const caller = appRouter.createCaller(mockContext);
    const result = await caller.headhunter.placements.list({
      partnerId: testPartnerId,
    });

    expect(Array.isArray(result)).toBe(true);
    result.forEach((placement) => {
      expect(placement.partnerId).toBe(testPartnerId);
    });
  });

  it("should update placement status", async () => {
    const caller = appRouter.createCaller(mockContext);
    const result = await caller.headhunter.placements.update({
      id: testPlacementId,
      placementStatus: "confirmed",
      notes: "Offer accepted, start date confirmed",
    });

    expect(result).toHaveProperty("success", true);
  });
});

describe("Headhunter Module - Retention Milestones", () => {
  it("should achieve a retention milestone", async () => {
    const caller = appRouter.createCaller(mockContext);
    const result = await caller.headhunter.milestones.achieve({
      id: testMilestoneId,
      achievedDate: new Date().toISOString(),
      notes: "Candidate completed 30-day milestone successfully",
    });

    expect(result).toHaveProperty("success", true);
  });

  it("should auto-create retention bonus commission when milestone achieved", async () => {
    const caller = appRouter.createCaller(mockContext);
    const commissions = await caller.headhunter.commissions.list({
      placementId: testPlacementId,
    });

    const retentionCommission = commissions.find(
      (c) => c.commissionType === "retention_bonus" && c.milestoneId === testMilestoneId
    );
    expect(retentionCommission).toBeDefined();
    expect(retentionCommission?.amount).toBe(5000);
  });

  it("should auto-create candidate stipend when milestone achieved", async () => {
    const caller = appRouter.createCaller(mockContext);
    const stipends = await caller.headhunter.stipends.list({
      candidateId: testCandidateId,
    });

    const milestoneStipend = stipends.find((s) => s.milestoneId === testMilestoneId);
    expect(milestoneStipend).toBeDefined();
    expect(milestoneStipend?.amount).toBe(1000); // 20% of $5,000 bonus
    testStipendId = milestoneStipend!.id;
  });

  it("should mark milestone as missed", async () => {
    const caller = appRouter.createCaller(mockContext);
    const milestones = await caller.headhunter.milestones.list({
      placementId: testPlacementId,
    });
    const secondMilestone = milestones[1]; // 90-day milestone

    const result = await caller.headhunter.milestones.miss({
      id: secondMilestone.id,
      notes: "Candidate terminated before 90-day milestone",
    });

    expect(result).toHaveProperty("success", true);
  });
});

describe("Headhunter Module - Commissions", () => {
  it("should list all commissions", async () => {
    const caller = appRouter.createCaller(mockContext);
    const result = await caller.headhunter.commissions.list();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("should get commission summary", async () => {
    const caller = appRouter.createCaller(mockContext);
    const result = await caller.headhunter.commissions.summary();

    expect(result).toHaveProperty("pending");
    expect(result).toHaveProperty("invoiced");
    expect(result).toHaveProperty("paid");
    expect(result).toHaveProperty("total");
    expect(typeof result.total).toBe("number");
  });

  it("should mark commission as invoiced", async () => {
    const caller = appRouter.createCaller(mockContext);
    const result = await caller.headhunter.commissions.markInvoiced({
      id: testCommissionId,
      invoiceNumber: "INV-2026-001",
      invoiceDate: new Date().toISOString(),
    });

    expect(result).toHaveProperty("success", true);
  });

  it("should mark commission as paid", async () => {
    const caller = appRouter.createCaller(mockContext);
    const result = await caller.headhunter.commissions.markPaid({
      id: testCommissionId,
      paidDate: new Date().toISOString(),
      paymentMethod: "ACH",
      transactionId: "TXN-123456",
    });

    expect(result).toHaveProperty("success", true);
  });
});

describe("Headhunter Module - Candidate Stipends", () => {
  it("should list candidate stipends", async () => {
    const caller = appRouter.createCaller(mockContext);
    const result = await caller.headhunter.stipends.list({
      candidateId: testCandidateId,
    });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("should mark stipend as paid", async () => {
    const caller = appRouter.createCaller(mockContext);
    const result = await caller.headhunter.stipends.markPaid({
      id: testStipendId,
      paidDate: new Date().toISOString(),
      transactionId: "PLAID-TXN-789",
    });

    expect(result).toHaveProperty("success", true);
  });

  it("should mark stipend as failed", async () => {
    const caller = appRouter.createCaller(mockContext);
    
    // Create another stipend for testing failure
    const milestones = await caller.headhunter.milestones.list({
      placementId: testPlacementId,
    });
    const thirdMilestone = milestones[2]; // 180-day milestone
    
    await caller.headhunter.milestones.achieve({
      id: thirdMilestone.id,
      achievedDate: new Date().toISOString(),
    });

    const stipends = await caller.headhunter.stipends.list({
      candidateId: testCandidateId,
    });
    const newStipend = stipends.find((s) => s.milestoneId === thirdMilestone.id);

    const result = await caller.headhunter.stipends.markFailed({
      id: newStipend!.id,
      failureReason: "Invalid bank account information",
    });

    expect(result).toHaveProperty("success", true);
  });
});

describe("Headhunter Module - Partner Communications", () => {
  it("should create partner communication", async () => {
    const caller = appRouter.createCaller(mockContext);
    const result = await caller.headhunter.communications.create({
      partnerId: testPartnerId,
      communicationType: "email",
      subject: "Q1 2026 Hiring Needs",
      summary: "Discussed upcoming hiring needs for Q1 2026",
      outcome: "Partner needs 10 CNC machinists by March",
      nextFollowUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
    testCommunicationId = result.id;
  });

  it("should list partner communications", async () => {
    const caller = appRouter.createCaller(mockContext);
    const result = await caller.headhunter.communications.list({
      partnerId: testPartnerId,
    });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].partnerId).toBe(testPartnerId);
  });
});

describe("Headhunter Module - Placement Interviews", () => {
  it("should create placement interview", async () => {
    const caller = appRouter.createCaller(mockContext);
    
    // Create a new candidate for interview
    const newCandidate = await caller.headhunter.candidates.create({
      firstName: "Alice",
      lastName: "Johnson",
      email: "alice.johnson@example.com",
      experienceLevel: "senior",
    });

    const result = await caller.headhunter.interviews.create({
      candidateId: newCandidate.id,
      partnerId: testPartnerId,
      interviewDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      interviewType: "technical",
      interviewerName: "Bob Smith",
      notes: "Technical interview for senior machinist role",
    });

    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
    testInterviewId = result.id;
  });

  it("should list interviews by candidate", async () => {
    const caller = appRouter.createCaller(mockContext);
    const interviews = await caller.headhunter.interviews.list();
    const candidateId = interviews[0].candidateId;

    const result = await caller.headhunter.interviews.list({
      candidateId,
    });

    expect(Array.isArray(result)).toBe(true);
    result.forEach((interview) => {
      expect(interview.candidateId).toBe(candidateId);
    });
  });

  it("should update interview status and outcome", async () => {
    const caller = appRouter.createCaller(mockContext);
    const result = await caller.headhunter.interviews.update({
      id: testInterviewId,
      interviewStatus: "completed",
      outcome: "passed",
      feedback: "Strong technical skills, good culture fit",
      nextSteps: "Schedule final interview with hiring manager",
    });

    expect(result).toHaveProperty("success", true);
  });
});

describe("Headhunter Module - Analytics", () => {
  it("should get dashboard statistics", async () => {
    const caller = appRouter.createCaller(mockContext);
    const result = await caller.headhunter.analytics.dashboard();

    expect(result).toHaveProperty("candidateStats");
    expect(result).toHaveProperty("placementStats");
    expect(result).toHaveProperty("commissionSummary");
    expect(result).toHaveProperty("partnerStats");
    expect(result).toHaveProperty("upcomingMilestones");

    expect(Array.isArray(result.candidateStats)).toBe(true);
    expect(Array.isArray(result.placementStats)).toBe(true);
    expect(Array.isArray(result.partnerStats)).toBe(true);
    expect(Array.isArray(result.upcomingMilestones)).toBe(true);

    expect(result.commissionSummary).toHaveProperty("total");
    expect(typeof result.commissionSummary.total).toBe("number");
  });
});

describe("Headhunter Module - Authorization", () => {
  it("should require authentication for protected procedures", async () => {
    const caller = appRouter.createCaller(publicContext);

    await expect(
      caller.headhunter.candidates.list()
    ).rejects.toThrow();
  });
});
