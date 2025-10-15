/**
 * Intelligence Hub Tests
 */

const IntelligenceHub = require('../IntelligenceHub');

describe('IntelligenceHub', () => {
  let hub;

  beforeEach(() => {
    hub = new IntelligenceHub();
  });

  afterEach(() => {
    // Clean up any intervals
    if (hub) {
      hub.removeAllListeners();
    }
  });

  describe('Initialization', () => {
    it('should initialize with default configuration', () => {
      expect(hub.config).toBeDefined();
      expect(hub.config.syncInterval).toBe(30000);
      expect(hub.config.enableCrossSystemLearning).toBe(true);
    });

    it('should initialize data stores', () => {
      expect(hub.userInsights).toBeInstanceOf(Map);
      expect(hub.marketIntelligence).toBeInstanceOf(Map);
      expect(hub.performanceMetrics).toBeInstanceOf(Map);
      expect(hub.patternDatabase).toBeInstanceOf(Map);
      expect(hub.resourceOptimization).toBeInstanceOf(Map);
    });

    it('should initialize analytics', () => {
      expect(hub.analytics).toBeDefined();
      expect(hub.analytics.insightsShared).toBe(0);
      expect(hub.analytics.crossSystemOptimizations).toBe(0);
    });
  });

  describe('System Injection', () => {
    it('should inject system references', () => {
      const mockMaya = { on: jest.fn() };
      const mockMoneyHunter = { on: jest.fn() };
      const mockAutopilot = { on: jest.fn() };

      hub.injectSystems(mockMaya, mockMoneyHunter, mockAutopilot);

      expect(hub.mayaTravelAgent).toBe(mockMaya);
      expect(hub.moneyHunter).toBe(mockMoneyHunter);
      expect(hub.autopilotEngine).toBe(mockAutopilot);
    });
  });

  describe('User Preference Learning', () => {
    it('should handle user preference learned', () => {
      const preference = {
        userId: 'user123',
        type: 'budget',
        data: { budget: 3000 }
      };

      hub.handleUserPreferenceLearned(preference);

      expect(hub.userInsights.has('user123')).toBe(true);
      expect(hub.analytics.insightsShared).toBe(1);
    });

    it('should categorize user segments correctly', () => {
      expect(hub.categorizeUserSegment({ budget: 6000 })).toBe('premium');
      expect(hub.categorizeUserSegment({ budget: 3000 })).toBe('business');
      expect(hub.categorizeUserSegment({ budget: 1000 })).toBe('budget');
    });
  });

  describe('Market Intelligence', () => {
    it('should handle opportunity found', () => {
      const opportunity = {
        id: 'opp123',
        category: 'travel_services',
        title: 'Travel API Integration'
      };

      hub.handleOpportunityFound(opportunity);

      expect(hub.marketIntelligence.has('opp123')).toBe(true);
    });

    it('should assess cross-system relevance', () => {
      const travelOpp = { category: 'travel_services' };
      const relevance = hub.assessCrossSystemRelevance(travelOpp);

      expect(relevance).toBeGreaterThan(0);
    });
  });

  describe('Revenue Tracking', () => {
    it('should track daily revenue', () => {
      const revenue = {
        amount: 1000,
        opportunity: 'opp123'
      };

      hub.handleRevenueGenerated(revenue);

      const today = new Date().toDateString();
      expect(hub.performanceMetrics.has(today)).toBe(true);

      const metrics = hub.performanceMetrics.get(today);
      expect(metrics.revenue).toBe(1000);
      expect(metrics.conversions).toBe(1);
    });

    it('should get daily revenue', () => {
      const revenue = hub.getDailyRevenue();
      expect(typeof revenue).toBe('number');
    });
  });

  describe('Analytics', () => {
    it('should return unified analytics', () => {
      const analytics = hub.getUnifiedAnalytics();

      expect(analytics).toHaveProperty('intelligence');
      expect(analytics).toHaveProperty('userInsights');
      expect(analytics).toHaveProperty('marketIntelligence');
      expect(analytics).toHaveProperty('performance');
    });

    it('should calculate weekly trend', () => {
      const trend = hub.getWeeklyTrend();

      expect(trend).toHaveProperty('trend');
      expect(trend).toHaveProperty('percentage');
    });

    it('should get system health', () => {
      const health = hub.getSystemHealth();

      expect(health).toHaveProperty('maya_travel');
      expect(health).toHaveProperty('money_hunter');
      expect(health).toHaveProperty('autopilot');
    });
  });

  describe('Resource Optimization', () => {
    it('should analyze CPU patterns', () => {
      const patterns = hub.analyzeCPUPatterns();

      expect(patterns).toHaveProperty('canOptimize');
      expect(patterns).toHaveProperty('targetSystem');
    });

    it('should analyze memory patterns', () => {
      const patterns = hub.analyzeMemoryPatterns();

      expect(patterns).toHaveProperty('canOptimize');
      expect(patterns).toHaveProperty('savings');
    });

    it('should analyze resource usage', async () => {
      const analysis = await hub.analyzeResourceUsage();

      expect(analysis).toHaveProperty('recommendations');
      expect(Array.isArray(analysis.recommendations)).toBe(true);
    });
  });

  describe('Trend Impact Assessment', () => {
    it('should assess travel trend impact', () => {
      const trend = { category: 'travel' };
      const impact = hub.assessTrendImpact(trend);

      expect(impact.maya_travel).toBe(0.9);
    });

    it('should assess freelance trend impact', () => {
      const trend = { category: 'freelance' };
      const impact = hub.assessTrendImpact(trend);

      expect(impact.money_hunter).toBe(0.9);
    });
  });
});
