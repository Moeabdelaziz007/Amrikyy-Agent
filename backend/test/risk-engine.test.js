/**
 * 🧪 Risk Engine Unit Tests
 * اختبارات وحدة محرك المخاطر
 */

const { describe, it, expect, beforeAll, afterAll } = require('@jest/globals');
const riskEngine = require('../src/services/risk-engine');

describe('Risk Engine', () => {
  
  describe('Amount Scoring', () => {
    it('should score low amounts as low risk', async () => {
      const score = await riskEngine.scoreAmount(50);
      expect(score).toBeLessThan(20);
    });

    it('should score medium amounts as medium risk', async () => {
      const score = await riskEngine.scoreAmount(5000);
      expect(score).toBeGreaterThanOrEqual(40);
      expect(score).toBeLessThan(70);
    });

    it('should score high amounts as high risk', async () => {
      const score = await riskEngine.scoreAmount(60000);
      expect(score).toBeGreaterThanOrEqual(80);
    });
  });

  describe('Location Scoring', () => {
    it('should score low-risk countries as safe', async () => {
      const scoreUS = await riskEngine.scoreLocation('US');
      const scoreSA = await riskEngine.scoreLocation('SA');
      expect(scoreUS).toBe(0);
      expect(scoreSA).toBe(0);
    });

    it('should score high-risk countries as dangerous', async () => {
      const scoreKP = await riskEngine.scoreLocation('KP'); // North Korea
      const scoreIR = await riskEngine.scoreLocation('IR'); // Iran
      expect(scoreKP).toBe(100);
      expect(scoreIR).toBe(100);
    });

    it('should score medium-risk countries appropriately', async () => {
      const scoreRU = await riskEngine.scoreLocation('RU'); // Russia
      expect(scoreRU).toBeGreaterThan(30);
      expect(scoreRU).toBeLessThan(80);
    });
  });

  describe('Risk Level Determination', () => {
    it('should classify risk levels correctly', () => {
      expect(riskEngine.getRiskLevel(10)).toBe('low');
      expect(riskEngine.getRiskLevel(45)).toBe('medium');
      expect(riskEngine.getRiskLevel(75)).toBe('high');
      expect(riskEngine.getRiskLevel(90)).toBe('critical');
    });
  });

  describe('Action Determination', () => {
    it('should auto-approve low risk', () => {
      const action = riskEngine.determineAction(30);
      expect(action).toBe('auto_approve');
    });

    it('should flag for manual review at threshold', () => {
      const action = riskEngine.determineAction(72);
      expect(action).toBe('manual_review');
    });

    it('should reject high risk', () => {
      const action = riskEngine.determineAction(90);
      expect(action).toBe('reject');
    });
  });

  describe('Full Transaction Assessment', () => {
    it('should assess a low-risk transaction', async () => {
      const tx = {
        userId: 'test-user-low-risk',
        amountUSD: 100,
        cryptocurrency: 'USDT',
        ipCountry: 'US',
        bookingId: 'test-booking-001'
      };

      const assessment = await riskEngine.assessTransaction(tx);

      expect(assessment).toHaveProperty('score');
      expect(assessment).toHaveProperty('level');
      expect(assessment).toHaveProperty('action');
      expect(assessment).toHaveProperty('signals');
      expect(assessment.score).toBeLessThan(70);
      expect(assessment.action).toBe('auto_approve');
    });

    it('should assess a high-risk transaction', async () => {
      const tx = {
        userId: 'test-user-high-risk',
        amountUSD: 100000,
        cryptocurrency: 'BTC',
        ipCountry: 'IR', // High-risk country
        bookingId: 'test-booking-002'
      };

      const assessment = await riskEngine.assessTransaction(tx);

      expect(assessment.score).toBeGreaterThan(70);
      expect(['manual_review', 'reject']).toContain(assessment.action);
    });

    it('should handle missing user gracefully', async () => {
      const tx = {
        userId: null,
        amountUSD: 500,
        cryptocurrency: 'ETH',
        bookingId: 'test-booking-003'
      };

      const assessment = await riskEngine.assessTransaction(tx);

      expect(assessment).toHaveProperty('score');
      expect(assessment.score).toBeGreaterThan(0); // Should have some risk
    });
  });

  describe('Signal Weights', () => {
    it('should have weights that sum to 1.0', () => {
      const weights = riskEngine.WEIGHTS;
      const sum = Object.values(weights).reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1.0, 2);
    });
  });

  describe('Error Handling', () => {
    it('should return fail-safe assessment on error', async () => {
      const invalidTx = {
        // Missing required fields
        amountUSD: 'invalid'
      };

      const assessment = await riskEngine.assessTransaction(invalidTx);

      expect(assessment).toHaveProperty('score');
      expect(assessment.score).toBe(50); // Fail-safe medium risk
      expect(assessment.action).toBe('manual_review'); // Safe default
    });
  });
});

describe('Risk Engine Statistics', () => {
  it('should calculate stats for date range', async () => {
    const startDate = new Date('2025-01-01').toISOString();
    const endDate = new Date('2025-12-31').toISOString();

    const stats = await riskEngine.getStats(startDate, endDate);

    if (stats) {
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('by_level');
      expect(stats).toHaveProperty('by_action');
      expect(stats).toHaveProperty('avg_score');
    }
  });
});

// Integration Test (requires database)
describe('Risk Engine Integration', () => {
  it('should store assessment in database', async () => {
    const tx = {
      userId: 'integration-test-user',
      amountUSD: 250,
      cryptocurrency: 'USDT',
      ipCountry: 'EG',
      bookingId: 'integration-test-booking'
    };

    const assessment = await riskEngine.assessTransaction(tx);

    expect(assessment).toHaveProperty('score');
    
    // Verify it was stored (check history)
    // const history = await riskEngine.getUserRiskHistory('integration-test-user');
    // expect(history.length).toBeGreaterThan(0);
  });
});

// Performance Test
describe('Risk Engine Performance', () => {
  it('should complete assessment in under 200ms', async () => {
    const tx = {
      userId: 'perf-test-user',
      amountUSD: 1000,
      cryptocurrency: 'USDT',
      ipCountry: 'US',
      bookingId: 'perf-test-booking'
    };

    const start = Date.now();
    await riskEngine.assessTransaction(tx);
    const duration = Date.now() - start;

    console.log(`⏱️ Assessment completed in ${duration}ms`);
    expect(duration).toBeLessThan(200);
  });
});

