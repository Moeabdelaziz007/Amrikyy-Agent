/**
 * MCP Tools Integration Tests
 * Tests all MCP tools with mock data
 */

const TravelMCPServer = require('../../src/mcp/TravelMCPServer');

describe('MCP Tools Integration', () => {
  describe('Tool Registration', () => {
    test('should list all registered tools', () => {
      const tools = TravelMCPServer.listTools();
      
      expect(tools).toBeDefined();
      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBeGreaterThan(0);
    });

    test('should have required tools', () => {
      const tools = TravelMCPServer.listTools();
      const toolNames = tools.map(t => t.name);
      
      expect(toolNames).toContain('search_flights');
      expect(toolNames).toContain('search_locations');
      expect(toolNames).toContain('get_flight_details');
      expect(toolNames).toContain('compare_prices');
      expect(toolNames).toContain('analyze_budget');
    });

    test('each tool should have required properties', () => {
      const tools = TravelMCPServer.listTools();
      
      tools.forEach(tool => {
        expect(tool).toHaveProperty('name');
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('inputSchema');
        expect(tool.inputSchema).toHaveProperty('type');
        expect(tool.inputSchema).toHaveProperty('properties');
      });
    });
  });

  describe('Budget Analysis Tool', () => {
    test('should analyze budget successfully', async () => {
      const params = {
        destination: 'Paris',
        budget: 2000,
        duration: 5,
        travelers: 2
      };

      const result = await TravelMCPServer.callTool('analyze_budget', params, {
        agentId: 'test',
        agentName: 'Test Agent'
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.breakdown).toBeDefined();
      expect(result.data.breakdown.flights).toBeDefined();
      expect(result.data.breakdown.accommodation).toBeDefined();
      expect(result.data.breakdown.food).toBeDefined();
      expect(result.data.breakdown.activities).toBeDefined();
    });

    test('should calculate per person budget', async () => {
      const params = {
        destination: 'London',
        budget: 3000,
        duration: 7,
        travelers: 3
      };

      const result = await TravelMCPServer.callTool('analyze_budget', params);

      expect(result.success).toBe(true);
      expect(result.data.perPerson).toBe(1000); // 3000 / 3
    });

    test('should calculate daily budget', async () => {
      const params = {
        destination: 'Tokyo',
        budget: 2800,
        duration: 7,
        travelers: 2
      };

      const result = await TravelMCPServer.callTool('analyze_budget', params);

      expect(result.success).toBe(true);
      expect(result.data.perDay).toBe(400); // 2800 / 7
    });

    test('should provide recommendations', async () => {
      const params = {
        destination: 'Barcelona',
        budget: 1500,
        duration: 5,
        travelers: 2
      };

      const result = await TravelMCPServer.callTool('analyze_budget', params);

      expect(result.success).toBe(true);
      expect(result.data.recommendations).toBeDefined();
      expect(Array.isArray(result.data.recommendations)).toBe(true);
      expect(result.data.recommendations.length).toBeGreaterThan(0);
    });

    test('should fail with missing parameters', async () => {
      const params = {
        destination: 'Paris'
        // Missing required fields
      };

      const result = await TravelMCPServer.callTool('analyze_budget', params);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Tool Validation', () => {
    test('should validate required parameters', async () => {
      const result = await TravelMCPServer.callTool('analyze_budget', {});

      expect(result.success).toBe(false);
      expect(result.error).toContain('required');
    });

    test('should handle invalid tool name', async () => {
      const result = await TravelMCPServer.callTool('invalid_tool', {});

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    test('should accept valid context', async () => {
      const params = {
        destination: 'Rome',
        budget: 2000,
        duration: 5,
        travelers: 2
      };

      const context = {
        userId: 'test-user',
        sessionId: 'test-session',
        agentId: 'luna'
      };

      const result = await TravelMCPServer.callTool('analyze_budget', params, context);

      expect(result.success).toBe(true);
    });
  });

  describe('Date Formatting', () => {
    test('should format dates correctly', () => {
      const formatted = TravelMCPServer.formatDate('2025-12-01');
      expect(formatted).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });

    test('should handle DD/MM/YYYY format', () => {
      const formatted = TravelMCPServer.formatDate('01/12/2025');
      expect(formatted).toBe('01/12/2025');
    });
  });

  describe('Health Check', () => {
    test('should perform health check', async () => {
      const health = await TravelMCPServer.healthCheck();

      expect(health).toBeDefined();
      expect(health.success).toBeDefined();
    });
  });
});
