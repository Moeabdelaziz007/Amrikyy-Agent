/**
 * Unit Tests for Aladdin Routes
 * Testing all API endpoints, validation, error handling, and responses
 */

const request = require('supertest');
const express = require('express');
const aladdinRoutes = require('../aladdin');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/aladdin', aladdinRoutes);

describe('Aladdin Routes', () => {
  describe('GET /api/aladdin/health', () => {
    test('should return health status', async () => {
      const response = await request(app)
        .get('/api/aladdin/health')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Aladdin agent is running');
      expect(response.body).toHaveProperty('timestamp');
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });

    test('should return valid timestamp format', async () => {
      const response = await request(app)
        .get('/api/aladdin/health')
        .expect(200);

      const timestamp = response.body.timestamp;
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('POST /api/aladdin/hunt', () => {
    test('should start money hunt with valid budget', async () => {
      const response = await request(app)
        .post('/api/aladdin/hunt')
        .send({
          budget: 1000,
          preferences: { category: 'travel' }
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('opportunities');
      expect(response.body.data).toHaveProperty('totalPotentialGain');
      expect(response.body.data).toHaveProperty('confidence');
    });

    test('should return array of opportunities', async () => {
      const response = await request(app)
        .post('/api/aladdin/hunt')
        .send({ budget: 1000 })
        .expect(200);

      expect(Array.isArray(response.body.data.opportunities)).toBe(true);
      expect(response.body.data.opportunities.length).toBeGreaterThan(0);
    });

    test('should validate budget is required', async () => {
      const response = await request(app)
        .post('/api/aladdin/hunt')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('budget');
    });

    test('should validate budget is a number', async () => {
      const response = await request(app)
        .post('/api/aladdin/hunt')
        .send({ budget: 'invalid' })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('budget');
    });

    test('should validate budget is positive', async () => {
      const response = await request(app)
        .post('/api/aladdin/hunt')
        .send({ budget: -100 })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('positive');
    });

    test('should validate budget is not zero', async () => {
      const response = await request(app)
        .post('/api/aladdin/hunt')
        .send({ budget: 0 })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    test('should accept preferences as optional parameter', async () => {
      const response = await request(app)
        .post('/api/aladdin/hunt')
        .send({ budget: 1000 })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should return opportunities with correct structure', async () => {
      const response = await request(app)
        .post('/api/aladdin/hunt')
        .send({ budget: 1000 })
        .expect(200);

      const opportunity = response.body.data.opportunities[0];
      expect(opportunity).toHaveProperty('id');
      expect(opportunity).toHaveProperty('type');
      expect(opportunity).toHaveProperty('title');
    });
  });

  describe('GET /api/aladdin/opportunities', () => {
    test('should return list of opportunities', async () => {
      const response = await request(app)
        .get('/api/aladdin/opportunities')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('opportunities');
      expect(response.body.data).toHaveProperty('total');
      expect(Array.isArray(response.body.data.opportunities)).toBe(true);
    });

    test('should filter by category', async () => {
      const response = await request(app)
        .get('/api/aladdin/opportunities?category=travel')
        .expect(200);

      expect(response.body.success).toBe(true);
      const opportunities = response.body.data.opportunities;
      
      if (opportunities.length > 0) {
        opportunities.forEach(opp => {
          expect(opp.category).toBe('travel');
        });
      }
    });

    test('should filter by minimum return', async () => {
      const minReturn = 400;
      const response = await request(app)
        .get(`/api/aladdin/opportunities?minReturn=${minReturn}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      const opportunities = response.body.data.opportunities;
      
      opportunities.forEach(opp => {
        const returnValue = opp.potentialSaving || opp.potentialReturn || 0;
        expect(returnValue).toBeGreaterThanOrEqual(minReturn);
      });
    });

    test('should handle multiple query parameters', async () => {
      const response = await request(app)
        .get('/api/aladdin/opportunities?category=travel&minReturn=100')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should return total count matching filtered results', async () => {
      const response = await request(app)
        .get('/api/aladdin/opportunities')
        .expect(200);

      const { opportunities, total } = response.body.data;
      expect(total).toBe(opportunities.length);
    });

    test('should return opportunities with required fields', async () => {
      const response = await request(app)
        .get('/api/aladdin/opportunities')
        .expect(200);

      const opportunities = response.body.data.opportunities;
      
      if (opportunities.length > 0) {
        const opp = opportunities[0];
        expect(opp).toHaveProperty('id');
        expect(opp).toHaveProperty('category');
        expect(opp).toHaveProperty('title');
        expect(opp).toHaveProperty('description');
      }
    });
  });

  describe('POST /api/aladdin/analyze', () => {
    test('should analyze opportunity with valid ID', async () => {
      const response = await request(app)
        .post('/api/aladdin/analyze')
        .send({
          opportunityId: 1,
          userProfile: { riskTolerance: 'medium' }
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('opportunityId', 1);
      expect(response.body.data).toHaveProperty('suitabilityScore');
      expect(response.body.data).toHaveProperty('pros');
      expect(response.body.data).toHaveProperty('cons');
      expect(response.body.data).toHaveProperty('recommendation');
    });

    test('should require opportunity ID', async () => {
      const response = await request(app)
        .post('/api/aladdin/analyze')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('Opportunity ID');
    });

    test('should accept userProfile as optional', async () => {
      const response = await request(app)
        .post('/api/aladdin/analyze')
        .send({ opportunityId: 1 })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should return analysis with pros and cons arrays', async () => {
      const response = await request(app)
        .post('/api/aladdin/analyze')
        .send({ opportunityId: 1 })
        .expect(200);

      const analysis = response.body.data;
      expect(Array.isArray(analysis.pros)).toBe(true);
      expect(Array.isArray(analysis.cons)).toBe(true);
      expect(analysis.pros.length).toBeGreaterThan(0);
      expect(analysis.cons.length).toBeGreaterThan(0);
    });

    test('should return suitability score between 0 and 1', async () => {
      const response = await request(app)
        .post('/api/aladdin/analyze')
        .send({ opportunityId: 1 })
        .expect(200);

      const score = response.body.data.suitabilityScore;
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });

    test('should return estimated ROI', async () => {
      const response = await request(app)
        .post('/api/aladdin/analyze')
        .send({ opportunityId: 1 })
        .expect(200);

      expect(response.body.data).toHaveProperty('estimatedROI');
      expect(typeof response.body.data.estimatedROI).toBe('number');
    });
  });

  describe('GET /api/aladdin/stats', () => {
    test('should return agent statistics', async () => {
      const response = await request(app)
        .get('/api/aladdin/stats')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('totalHunts');
      expect(response.body.data).toHaveProperty('successfulFinds');
      expect(response.body.data).toHaveProperty('successRate');
      expect(response.body.data).toHaveProperty('totalMoneySaved');
      expect(response.body.data).toHaveProperty('totalMoneyEarned');
    });

    test('should return numeric statistics', async () => {
      const response = await request(app)
        .get('/api/aladdin/stats')
        .expect(200);

      const stats = response.body.data;
      expect(typeof stats.totalHunts).toBe('number');
      expect(typeof stats.successfulFinds).toBe('number');
      expect(typeof stats.successRate).toBe('number');
      expect(typeof stats.totalMoneySaved).toBe('number');
      expect(typeof stats.totalMoneyEarned).toBe('number');
    });

    test('should return success rate between 0 and 1', async () => {
      const response = await request(app)
        .get('/api/aladdin/stats')
        .expect(200);

      const successRate = response.body.data.successRate;
      expect(successRate).toBeGreaterThanOrEqual(0);
      expect(successRate).toBeLessThanOrEqual(1);
    });

    test('should return top categories array', async () => {
      const response = await request(app)
        .get('/api/aladdin/stats')
        .expect(200);

      const topCategories = response.body.data.topCategories;
      expect(Array.isArray(topCategories)).toBe(true);
      
      if (topCategories.length > 0) {
        const category = topCategories[0];
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('count');
      }
    });

    test('should calculate average return correctly', async () => {
      const response = await request(app)
        .get('/api/aladdin/stats')
        .expect(200);

      expect(response.body.data).toHaveProperty('averageReturnPerHunt');
      expect(typeof response.body.data.averageReturnPerHunt).toBe('number');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid JSON in request body', async () => {
      const response = await request(app)
        .post('/api/aladdin/hunt')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);
    });

    test('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/aladdin/nonexistent')
        .expect(404);
    });

    test('should handle server errors gracefully', async () => {
      // This would require mocking internal errors
      // For now, we verify error response structure
      const response = await request(app)
        .post('/api/aladdin/hunt')
        .send({ budget: 'invalid' })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Response Format', () => {
    test('all successful responses should have success: true', async () => {
      const endpoints = [
        { method: 'get', path: '/api/aladdin/health' },
        { method: 'get', path: '/api/aladdin/opportunities' },
        { method: 'get', path: '/api/aladdin/stats' }
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)[endpoint.method](endpoint.path);
        expect(response.body.success).toBe(true);
      }
    });

    test('all error responses should have success: false', async () => {
      const response = await request(app)
        .post('/api/aladdin/hunt')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('all responses should be valid JSON', async () => {
      const response = await request(app)
        .get('/api/aladdin/health')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(typeof response.body).toBe('object');
    });
  });
});
