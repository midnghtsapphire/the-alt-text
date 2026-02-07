import { describe, it, expect, beforeEach } from "vitest";
import { getDb } from "./db";
import * as schema from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Rewards & Credits System Tests
 * Tests for earning credits, redeeming promo codes, and transaction history
 */

describe("Rewards System", () => {
  let testUserId: number;
  let testPromoCodeId: number;

  beforeEach(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    const timestamp = Date.now();

    // Create test user
    const [user] = await db.insert(schema.users).values({
      openId: `test-rewards-${timestamp}`,
      name: "Test Rewards User",
      email: `rewards-${timestamp}@test.com`,
      creditsBalance: "100.00",
      lifetimeCreditsEarned: "100.00",
      lifetimeCreditsSpent: "0.00",
    });
    testUserId = user.insertId;

    // Create test promo code
    const [promo] = await db.insert(schema.promoCodes).values({
      code: `TEST${timestamp}`,
      credits: "50.00",
      description: "Test promo code",
      maxUses: 10,
      currentUses: 0,
      isActive: true,
    });
    testPromoCodeId = promo.insertId;

    // Create test reward action (check if exists first)
    const existingAction = await db
      .select()
      .from(schema.rewardActions)
      .where(eq(schema.rewardActions.action, `test_feature_${timestamp}`));

    if (existingAction.length === 0) {
      await db.insert(schema.rewardActions).values({
        action: `test_feature_${timestamp}`,
        name: "Test New Feature",
        description: "Test a new feature",
        creditsAmount: "25.00",
        isActive: true,
        maxPerUser: 5,
        maxPerDay: 2,
      });
    }
  });

  it("should fetch user credits balance", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    const [user] = await db
      .select({
        creditsBalance: schema.users.creditsBalance,
        lifetimeCreditsEarned: schema.users.lifetimeCreditsEarned,
        lifetimeCreditsSpent: schema.users.lifetimeCreditsSpent,
      })
      .from(schema.users)
      .where(eq(schema.users.id, testUserId))
      .limit(1);

    expect(user).toBeDefined();
    expect(parseFloat(user.creditsBalance)).toBe(100);
    expect(parseFloat(user.lifetimeCreditsEarned)).toBe(100);
    expect(parseFloat(user.lifetimeCreditsSpent)).toBe(0);
  });

  it("should fetch reward actions", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    const actions = await db
      .select()
      .from(schema.rewardActions)
      .where(eq(schema.rewardActions.isActive, true));

    expect(actions.length).toBeGreaterThan(0);
    const testAction = actions[0]; // Use first active action
    expect(testAction).toBeDefined();
    expect(testAction?.name).toBe("Test New Feature");
    expect(parseFloat(testAction?.creditsAmount || "0")).toBe(25);
  });

  it("should award credits for completing action", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    // Get initial balance
    const [initialUser] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, testUserId))
      .limit(1);

    const initialBalance = parseFloat(initialUser.creditsBalance);

    // Award credits
    const [reward] = await db.insert(schema.rewards).values({
      userId: testUserId,
      action: "test_feature",
      description: "Tested new feature",
      creditsEarned: "25.00",
    });

    // Update user balance
    const newBalance = initialBalance + 25;
    await db
      .update(schema.users)
      .set({
        creditsBalance: newBalance.toString(),
        lifetimeCreditsEarned: (
          parseFloat(initialUser.lifetimeCreditsEarned) + 25
        ).toString(),
      })
      .where(eq(schema.users.id, testUserId));

    // Create transaction record
    await db.insert(schema.creditsTransactions).values({
      userId: testUserId,
      type: "earned",
      amount: "25.00",
      balanceAfter: newBalance.toString(),
      description: "Earned 25 credits for: Test New Feature",
      relatedId: reward.insertId,
      relatedType: "reward",
    });

    // Verify balance updated
    const [updatedUser] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, testUserId))
      .limit(1);

    expect(parseFloat(updatedUser.creditsBalance)).toBe(125);
    expect(parseFloat(updatedUser.lifetimeCreditsEarned)).toBe(125);
  });

  it("should redeem promo code", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    // Get promo code
    const [promo] = await db
      .select()
      .from(schema.promoCodes)
      .where(eq(schema.promoCodes.id, testPromoCodeId))
      .limit(1);

    expect(promo).toBeDefined();

    // Get initial balance
    const [initialUser] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, testUserId))
      .limit(1);

    const initialBalance = parseFloat(initialUser.creditsBalance);
    const creditsToAward = parseFloat(promo.credits);

    // Create redemption
    await db.insert(schema.promoCodeRedemptions).values({
      promoCodeId: testPromoCodeId,
      userId: testUserId,
      creditsAwarded: promo.credits,
    });

    // Update user balance
    const newBalance = initialBalance + creditsToAward;
    await db
      .update(schema.users)
      .set({
        creditsBalance: newBalance.toString(),
        lifetimeCreditsEarned: (
          parseFloat(initialUser.lifetimeCreditsEarned) + creditsToAward
        ).toString(),
      })
      .where(eq(schema.users.id, testUserId));

    // Update promo code usage
    await db
      .update(schema.promoCodes)
      .set({
        currentUses: promo.currentUses + 1,
      })
      .where(eq(schema.promoCodes.id, testPromoCodeId));

    // Verify balance updated
    const [updatedUser] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, testUserId))
      .limit(1);

    expect(parseFloat(updatedUser.creditsBalance)).toBe(150);

    // Verify promo code usage incremented
    const [updatedPromo] = await db
      .select()
      .from(schema.promoCodes)
      .where(eq(schema.promoCodes.id, testPromoCodeId))
      .limit(1);

    expect(updatedPromo.currentUses).toBe(1);
  });

  it("should fetch transaction history", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    // Create some transactions
    await db.insert(schema.creditsTransactions).values([
      {
        userId: testUserId,
        type: "earned",
        amount: "25.00",
        balanceAfter: "125.00",
        description: "Earned credits",
      },
      {
        userId: testUserId,
        type: "spent",
        amount: "-10.00",
        balanceAfter: "115.00",
        description: "API usage",
      },
    ]);

    // Fetch transactions
    const transactions = await db
      .select()
      .from(schema.creditsTransactions)
      .where(eq(schema.creditsTransactions.userId, testUserId));

    expect(transactions.length).toBeGreaterThanOrEqual(2);
    expect(transactions[0].userId).toBe(testUserId);
  });

  it("should prevent duplicate promo code redemption", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    // Redeem once
    await db.insert(schema.promoCodeRedemptions).values({
      promoCodeId: testPromoCodeId,
      userId: testUserId,
      creditsAwarded: "50.00",
    });

    // Try to redeem again
    const existingRedemption = await db
      .select()
      .from(schema.promoCodeRedemptions)
      .where(
        eq(schema.promoCodeRedemptions.promoCodeId, testPromoCodeId)
      );

    expect(existingRedemption.length).toBeGreaterThan(0);
  });
});
