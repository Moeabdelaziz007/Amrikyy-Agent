/**
 * API Endpoints Tests
 * Tests all API routes with supertest
 */

const request = require('supertest');
const express = require('express');

// Mock app setup
const app = express();
app.use(express.json());

// Import routes
const mcpRoutes = require('../../routes/mcp');
const securityRoutes = require('../../routes/security');
const travelAgentsRoutes = require('../../routes/travel-agents');

app.use('/api/mcp', mcpRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/travel-agents', travelAgentsRoutes);

describe('API Endpoints', () => {
  describe('MCP Routes', () => {
    describe('GET /api/mcp/tools', () => {
      test('should list all MCP tools', async () => {
        const response = await request(app)
          .get('/api/mcp/tools')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.tools).toBeDefined();
        expect(Array.isArray(response.body.tools)).toBe(true);
        expect(response.body.count).toBeGreaterThan(0);
      });
    });

    describe('POST /api/mcp/call', () => {
      test('should reject request without tool name', async () => {
        const response = await request(app)
          .post('/api/mcp/call')
          .send({})
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain('tool');
      });

      test('should call analyze_budget tool', async () => {
        const response = await request(app)
          .post('/api/mcp/call')
          .send({
            tool: 'analyze_budget',
            params: {
              destination: 'Paris',
              budget: 2000,
              duration: 5,
              travelers: 2
            }
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.tool).toBe('analyze_budget');
        expect(response.body.result).toBeDefined();
      });

      test('should reject invalid tool name', async () => {
        const response = await request(app)
          .post('/api/mcp/call')
          .send({
            tool: 'invalid_tool',
            params: {}
          })
          .expect(400);

        expect(response.body.success).toBe(false);
      });
    });

    describe('POST /api/mcp/analyze-budget', () => {
      test('should analyze budget', async () => {
        const response = await request(app)
          .post('/api/mcp/analyze-budget')
          .send({
            destination: 'London',
            budget: 3000,
            duration: 7,
            travelers: 2
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.analysis).toBeDefined();
        expect(response.body.analysis.breakdown).toBeDefined();
      });
    });

    describe('GET /api/mcp/health', () => {
      test('should return health status', async () => {
        const response = await request(app)
          .get('/api/mcp/health')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.service).toBe('MCP Travel Server');
      });
    });
  });

  describe('Security Routes', () => {
    describe('POST /api/security/tokens/generate', () => {
      test('should generate token', async () => {
        const response = await request(app)
          .post('/api/security/tokens/generate')
          .send({
            userId: 'test-user',
            scope: ['flights:read', 'mcp:call'],
            expiresIn: '15m'
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.token).toBeDefined();
        expect(response.body.expiresAt).toBeDefined();
        expect(response.body.scope).toEqual(['flights:read', 'mcp:call']);
      });

      test('should reject without userId', async () => {
        const response = await request(app)
          .post('/api/security/tokens/generate')
          .send({
            scope: ['flights:read']
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain('userId');
      });

      test('should reject invalid scope', async () => {
        const response = await request(app)
          .post('/api/security/tokens/generate')
          .send({
            userId: 'test-user',
            scope: ['invalid:scope']
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain('scope');
      });
    });

    describe('GET /api/security/scopes', () => {
      test('should list available scopes', async () => {
        const response = await request(app)
          .get('/api/security/scopes')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.scopes).toBeDefined();
        expect(Array.isArray(response.body.scopes)).toBe(true);
        expect(response.body.scopes.length).toBeGreaterThan(0);
      });
    });

    describe('GET /api/security/tokens/stats', () => {
      test('should return token statistics', async () => {
        const response = await request(app)
          .get('/api/security/tokens/stats')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.stats).toBeDefined();
        expect(response.body.stats).toHaveProperty('total');
        expect(response.body.stats).toHaveProperty('active');
        expect(response.body.stats).toHaveProperty('expired');
      });
    });

    describe('GET /api/security/rate-limits/:userId', () => {
      test('should return user rate limits', async () => {
        const response = await request(app)
          .get('/api/security/rate-limits/test-user')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.userId).toBe('test-user');
        expect(response.body.stats).toBeDefined();
        expect(response.body.stats).toHaveProperty('kiwi');
        expect(response.body.stats).toHaveProperty('bookingCom');
        expect(response.body.stats).toHaveProperty('mapbox');
      });
    });
  });

  describe('Travel Agents Routes', () => {
    describe('GET /api/travel-agents/capabilities', () => {
      test('should return all agent capabilities', async () => {
        const response = await request(app)
          .get('/api/travel-agents/capabilities')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.agents).toBeDefined();
        expect(response.body.agents).toHaveProperty('luna');
        expect(response.body.agents).toHaveProperty('karim');
        expect(response.body.agents).toHaveProperty('scout');
      });
    });

    describe('GET /api/travel-agents/active-requests', () => {
      test('should return active requests', async () => {
        const response = await request(app)
          .get('/api/travel-agents/active-requests')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.requests).toBeDefined();
        expect(Array.isArray(response.body.requests)).toBe(true);
        expect(response.body.count).toBeDefined();
      });
    });

    describe('POST /api/travel-agents/request', () => {
      test('should reject invalid request type', async () => {
        const response = await request(app)
          .post('/api/travel-agents/request')
          .send({
            type: 'invalid_type'
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain('type');
      });

      test('should accept valid request type', async () => {
        const response = await request(app)
          .post('/api/travel-agents/request')
          .send({
            type: 'plan_trip',
            destination: 'Paris',
            origin: 'New York',
            departureDate: '01/12/2025',
            returnDate: '08/12/2025',
            budget: 3000,
            travelers: 2
          });

        // May fail due to missing API keys, but should not be 400
        expect(response.status).not.toBe(400);
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/mcp/call')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);
    });

    test('should handle missing Content-Type', async () => {
      const response = await request(app)
        .post('/api/mcp/call')
        .send('data')
        .expect(400);
    });
  });
});
