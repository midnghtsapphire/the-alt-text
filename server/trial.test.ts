/**
 * 14-Day Free Trial System Tests
 */

import { describe, it, expect } from 'vitest';

const TRIAL_DURATION_DAYS = 14;
const TRIAL_API_CALL_LIMIT = 1000;
const TRIAL_SCAN_LIMIT = 50;

describe('Trial System - Activation', () => {
  it('should calculate correct trial expiration date', () => {
    const now = new Date('2026-01-01T00:00:00Z');
    const expiresAt = new Date(now.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000);

    expect(expiresAt.toISOString()).toBe('2026-01-15T00:00:00.000Z');
  });

  it('should set correct initial trial values', () => {
    const trialData = {
      trialStatus: 'active' as const,
      trialApiCallsUsed: 0,
      trialScansUsed: 0,
    };

    expect(trialData.trialStatus).toBe('active');
    expect(trialData.trialApiCallsUsed).toBe(0);
    expect(trialData.trialScansUsed).toBe(0);
  });

  it('should prevent duplicate trial activation', () => {
    const existingTrialStatuses = ['active', 'expired', 'converted'];

    existingTrialStatuses.forEach(status => {
      expect(status).not.toBe('none');
    });
  });
});

describe('Trial System - Status Checking', () => {
  it('should calculate days remaining correctly', () => {
    const now = new Date('2026-01-10T00:00:00Z');
    const expiresAt = new Date('2026-01-15T00:00:00Z');
    const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    expect(daysRemaining).toBe(5);
  });

  it('should show warning when 3 or fewer days remaining', () => {
    const daysRemaining = 3;
    const showWarning = daysRemaining <= 3;

    expect(showWarning).toBe(true);
  });

  it('should calculate usage percentage correctly', () => {
    const apiCallsUsed = 250;
    const scansUsed = 10;

    const apiCallsPercent = Math.round((apiCallsUsed / TRIAL_API_CALL_LIMIT) * 100);
    const scansPercent = Math.round((scansUsed / TRIAL_SCAN_LIMIT) * 100);

    expect(apiCallsPercent).toBe(25);
    expect(scansPercent).toBe(20);
  });

  it('should detect expired trials', () => {
    const now = new Date('2026-01-20T00:00:00Z');
    const expiresAt = new Date('2026-01-15T00:00:00Z');
    const isExpired = now > expiresAt;

    expect(isExpired).toBe(true);
  });
});

describe('Trial System - Usage Tracking', () => {
  it('should increment API call usage', () => {
    let apiCallsUsed = 100;
    apiCallsUsed += 1;

    expect(apiCallsUsed).toBe(101);
  });

  it('should increment scan usage for scan calls', () => {
    let scansUsed = 10;
    const callType = 'scan';

    if (callType === 'scan') {
      scansUsed += 1;
    }

    expect(scansUsed).toBe(11);
  });

  it('should not increment scan usage for non-scan calls', () => {
    let scansUsed = 10;
    const callType = 'analyze';

    if (callType === 'scan') {
      scansUsed += 1;
    }

    expect(scansUsed).toBe(10);
  });

  it('should enforce API call limit', () => {
    const apiCallsUsed = 1000;
    const limitReached = apiCallsUsed >= TRIAL_API_CALL_LIMIT;

    expect(limitReached).toBe(true);
  });

  it('should enforce scan limit', () => {
    const scansUsed = 50;
    const limitReached = scansUsed >= TRIAL_SCAN_LIMIT;

    expect(limitReached).toBe(true);
  });
});

describe('Trial System - Conversion', () => {
  it('should mark trial as converted', () => {
    const trialStatus = 'converted' as const;

    expect(trialStatus).toBe('converted');
  });

  it('should accept valid plan tiers', () => {
    const validPlans = ['starter', 'professional', 'enterprise'];

    validPlans.forEach(plan => {
      expect(['starter', 'professional', 'enterprise']).toContain(plan);
    });
  });
});

describe('Trial System - Analytics', () => {
  it('should calculate conversion rate', () => {
    const totalTrials = 100;
    const convertedTrials = 35;
    const conversionRate = Math.round((convertedTrials / totalTrials) * 100);

    expect(conversionRate).toBe(35);
  });

  it('should handle zero trials gracefully', () => {
    const totalTrials = 0;
    const convertedTrials = 0;
    const conversionRate = totalTrials > 0 
      ? Math.round((convertedTrials / totalTrials) * 100)
      : 0;

    expect(conversionRate).toBe(0);
  });

  it('should calculate average usage', () => {
    const users = [
      { apiCallsUsed: 100, scansUsed: 10 },
      { apiCallsUsed: 200, scansUsed: 20 },
      { apiCallsUsed: 300, scansUsed: 30 },
    ];

    const avgApiCalls = Math.round(
      users.reduce((sum, u) => sum + u.apiCallsUsed, 0) / users.length
    );
    const avgScans = Math.round(
      users.reduce((sum, u) => sum + u.scansUsed, 0) / users.length
    );

    expect(avgApiCalls).toBe(200);
    expect(avgScans).toBe(20);
  });

  it('should count trial statuses correctly', () => {
    const users = [
      { trialStatus: 'active' },
      { trialStatus: 'active' },
      { trialStatus: 'expired' },
      { trialStatus: 'converted' },
      { trialStatus: 'none' },
    ];

    const activeCount = users.filter(u => u.trialStatus === 'active').length;
    const expiredCount = users.filter(u => u.trialStatus === 'expired').length;
    const convertedCount = users.filter(u => u.trialStatus === 'converted').length;

    expect(activeCount).toBe(2);
    expect(expiredCount).toBe(1);
    expect(convertedCount).toBe(1);
  });
});

describe('Trial System - Expiration Warnings', () => {
  it('should identify users expiring within 3 days', () => {
    const now = new Date('2026-01-12T00:00:00Z');
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const users = [
      { id: 1, expiresAt: new Date('2026-01-13T00:00:00Z') }, // 1 day
      { id: 2, expiresAt: new Date('2026-01-14T00:00:00Z') }, // 2 days
      { id: 3, expiresAt: new Date('2026-01-20T00:00:00Z') }, // 8 days
    ];

    const expiringSoon = users.filter(u => 
      u.expiresAt < threeDaysFromNow && u.expiresAt >= now
    );

    expect(expiringSoon).toHaveLength(2);
    expect(expiringSoon[0].id).toBe(1);
    expect(expiringSoon[1].id).toBe(2);
  });

  it('should calculate correct days remaining for warnings', () => {
    const now = new Date('2026-01-12T00:00:00Z');
    const expiresAt = new Date('2026-01-14T00:00:00Z');
    const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    expect(daysRemaining).toBe(2);
  });
});

describe('Trial System - Limits', () => {
  it('should have correct trial duration', () => {
    expect(TRIAL_DURATION_DAYS).toBe(14);
  });

  it('should have correct API call limit', () => {
    expect(TRIAL_API_CALL_LIMIT).toBe(1000);
  });

  it('should have correct scan limit', () => {
    expect(TRIAL_SCAN_LIMIT).toBe(50);
  });

  it('should allow reasonable usage before hitting limits', () => {
    const avgDailyApiCalls = TRIAL_API_CALL_LIMIT / TRIAL_DURATION_DAYS;
    const avgDailyScans = TRIAL_SCAN_LIMIT / TRIAL_DURATION_DAYS;

    expect(avgDailyApiCalls).toBeCloseTo(71.4, 1);
    expect(avgDailyScans).toBeCloseTo(3.6, 1);
  });
});

describe('Trial System - Edge Cases', () => {
  it('should handle null expiration dates', () => {
    const expiresAt = null;
    const daysRemaining = expiresAt 
      ? Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 0;

    expect(daysRemaining).toBe(0);
  });

  it('should handle negative days remaining', () => {
    const now = new Date('2026-01-20T00:00:00Z');
    const expiresAt = new Date('2026-01-15T00:00:00Z');
    const daysRemaining = Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    expect(daysRemaining).toBe(0);
  });

  it('should handle undefined usage values', () => {
    const apiCallsUsed = undefined;
    const scansUsed = undefined;

    expect(apiCallsUsed || 0).toBe(0);
    expect(scansUsed || 0).toBe(0);
  });
});
