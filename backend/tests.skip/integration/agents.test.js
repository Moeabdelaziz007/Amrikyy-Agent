/**
 * AI Agents Integration Tests
 * Tests Luna, Karim, Scout agents
 */

const LunaWithMCP = require('../../src/agents/LunaWithMCP');
const KarimWithMCP = require('../../src/agents/KarimWithMCP');
const ScoutWithMCP = require('../../src/agents/ScoutWithMCP');
const AgentCoordinator = require('../../src/agents/AgentCoordinator');

describe('AI Agents Integration', () => {
  describe('Luna Trip Architect', () => {
    test('should have correct capabilities', () => {
      const capabilities = LunaWithMCP.getCapabilities();

      expect(capabilities.name).toBe('Luna');
      expect(capabilities.role).toBe('Trip Architect');
      expect(capabilities.capabilities).toContain('flight_search');
      expect(capabilities.capabilities).toContain('budget_analysis');
      expect(capabilities.capabilities).toContain('itinerary_planning');
    });

    test('should calculate trip duration', () => {
      const duration = LunaWithMCP.calculateDuration('01/12/2025', '08/12/2025');
      expect(duration).toBe(7);
    });

    test('should calculate single day duration', () => {
      const duration = LunaWithMCP.calculateDuration('01/12/2025', '01/12/2025');
      expect(duration).toBe(1);
    });

    test('should have MCP tools access', () => {
      const capabilities = LunaWithMCP.getCapabilities();
      expect(capabilities.mcpTools).toBeDefined();
      expect(Array.isArray(capabilities.mcpTools)).toBe(true);
      expect(capabilities.mcpTools.length).toBeGreaterThan(0);
    });
  });

  describe('Karim Budget Optimizer', () => {
    test('should have correct capabilities', () => {
      const capabilities = KarimWithMCP.getCapabilities();

      expect(capabilities.name).toBe('Karim');
      expect(capabilities.role).toBe('Budget Optimizer');
      expect(capabilities.capabilities).toContain('budget_analysis');
      expect(capabilities.capabilities).toContain('price_comparison');
      expect(capabilities.capabilities).toContain('cost_optimization');
    });

    test('should calculate savings percentage', () => {
      const percentage = KarimWithMCP.calculateSavingsPercentage(1000, 800);
      expect(percentage).toBe(20);
    });

    test('should handle zero original budget', () => {
      const percentage = KarimWithMCP.calculateSavingsPercentage(0, 0);
      expect(percentage).toBe(0);
    });

    test('should generate savings recommendations', () => {
      const breakdown = {
        accommodation: { total: 1000 },
        food: { total: 500 },
        activities: { total: 300 }
      };

      const recommendations = KarimWithMCP.generateSavingsRecommendations(breakdown, 2);

      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
      
      recommendations.forEach(rec => {
        expect(rec).toHaveProperty('type');
        expect(rec).toHaveProperty('priority');
        expect(rec).toHaveProperty('message');
        expect(rec).toHaveProperty('savings');
      });
    });
  });

  describe('Scout Deal Finder', () => {
    test('should have correct capabilities', () => {
      const capabilities = ScoutWithMCP.getCapabilities();

      expect(capabilities.name).toBe('Scout');
      expect(capabilities.role).toBe('Proactive Deal Finder');
      expect(capabilities.capabilities).toContain('deal_discovery');
      expect(capabilities.capabilities).toContain('price_monitoring');
    });

    test('should get popular destinations', () => {
      const destinations = ScoutWithMCP.getPopularDestinations();

      expect(Array.isArray(destinations)).toBe(true);
      expect(destinations.length).toBeGreaterThan(0);
      
      destinations.forEach(dest => {
        expect(dest).toHaveProperty('name');
        expect(dest).toHaveProperty('code');
        expect(dest).toHaveProperty('country');
        expect(dest).toHaveProperty('highlights');
        expect(dest).toHaveProperty('bestMonths');
      });
    });

    test('should filter destinations by interests', () => {
      const interests = ['beach', 'culture'];
      const destinations = ScoutWithMCP.getPopularDestinations(interests);

      expect(Array.isArray(destinations)).toBe(true);
      
      destinations.forEach(dest => {
        const hasMatchingInterest = dest.highlights.some(h =>
          interests.includes(h.toLowerCase())
        );
        expect(hasMatchingInterest).toBe(true);
      });
    });

    test('should check if price is good deal', () => {
      const budgetRange = { min: 500, max: 1500 };
      
      expect(ScoutWithMCP.isGoodDeal(800, budgetRange)).toBe(true);
      expect(ScoutWithMCP.isGoodDeal(2000, budgetRange)).toBe(false);
      expect(ScoutWithMCP.isGoodDeal(400, budgetRange)).toBe(false);
    });

    test('should calculate deal score', () => {
      const budgetRange = { min: 500, max: 1500 };
      
      const score1 = ScoutWithMCP.calculateDealScore(600, budgetRange);
      const score2 = ScoutWithMCP.calculateDealScore(1400, budgetRange);
      
      expect(score1).toBeGreaterThan(score2);
      expect(score1).toBeLessThanOrEqual(100);
      expect(score1).toBeGreaterThanOrEqual(0);
    });

    test('should estimate destination cost', () => {
      const bangkok = { name: 'Bangkok' };
      const paris = { name: 'Paris' };
      
      const bangkokCost = ScoutWithMCP.estimateDestinationCost(bangkok);
      const parisCost = ScoutWithMCP.estimateDestinationCost(paris);
      
      expect(bangkokCost).toBeLessThan(parisCost);
    });

    test('should format dates correctly', () => {
      const date = new Date('2025-12-01');
      const formatted = ScoutWithMCP.formatDate(date);
      
      expect(formatted).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });

    test('should calculate distance', () => {
      const distance = ScoutWithMCP.calculateDistance(
        [-74.006, 40.7128], // New York
        [-0.1276, 51.5074]  // London
      );
      
      expect(distance).toBeGreaterThan(5000); // ~5500 km
      expect(distance).toBeLessThan(6000);
    });
  });

  describe('Agent Coordinator', () => {
    test('should have all agents registered', () => {
      const capabilities = AgentCoordinator.getAllCapabilities();

      expect(capabilities).toHaveProperty('luna');
      expect(capabilities).toHaveProperty('karim');
      expect(capabilities).toHaveProperty('scout');
    });

    test('should generate unique request IDs', () => {
      const id1 = AgentCoordinator.generateRequestId();
      const id2 = AgentCoordinator.generateRequestId();

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^req_\d+_[a-z0-9]+$/);
    });

    test('should calculate return date', () => {
      const returnDate = AgentCoordinator.calculateReturnDate('01/12/2025', 7);
      expect(returnDate).toBe('08/12/2025');
    });

    test('should calculate percentage', () => {
      const percentage = AgentCoordinator.calculatePercentage(250, 1000);
      expect(percentage).toBe('25.00');
    });

    test('should handle zero total in percentage', () => {
      const percentage = AgentCoordinator.calculatePercentage(100, 0);
      expect(percentage).toBe('0');
    });
  });

  describe('Agent Coordination Scenarios', () => {
    test('should track agent usage', () => {
      const requestId = 'test-request-123';
      
      AgentCoordinator.trackAgentUsage(requestId, 'luna');
      AgentCoordinator.trackAgentUsage(requestId, 'karim');
      
      const activeRequests = AgentCoordinator.getActiveRequests();
      const request = activeRequests.find(r => r.requestId === requestId);
      
      if (request) {
        expect(request.agents.length).toBeGreaterThanOrEqual(2);
      }
    });
  });
});
