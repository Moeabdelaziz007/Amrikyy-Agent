const { describe, it, expect, jest: vi, beforeEach } = require('@jest/globals');
import request from 'supertest';
import express from 'express';
import webExplorerRoutes from '../routes/web-explorer';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/explorer', webExplorerRoutes);

describe('Web Explorer API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/explorer/query', () => {
    it('handles intelligent web search with AI answers', async () => {
      const queryData = {
        question: 'What is artificial intelligence?',
        options: {
          source_count: 5,
          analysis_types: ['summary', 'keywords'],
        },
      };

      const response = await request(app).post('/api/explorer/query').send(queryData).expect(200);

      expect(response.body).toHaveProperty('job_id');
      expect(response.body).toHaveProperty('status', 'pending');
      expect(response.body).toHaveProperty('message');
    });

    it('validates required question parameter', async () => {
      const response = await request(app).post('/api/explorer/query').send({}).expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('question');
    });

    it('handles invalid question format', async () => {
      const response = await request(app)
        .post('/api/explorer/query')
        .send({ question: '' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/explorer/analyze', () => {
    it('analyzes URL with multiple perspectives', async () => {
      const analyzeData = {
        url: 'https://example.com',
        analysisTypes: ['summary', 'keywords', 'sentiment'],
      };

      const response = await request(app)
        .post('/api/explorer/analyze')
        .send(analyzeData)
        .expect(200);

      expect(response.body).toHaveProperty('url', 'https://example.com');
      expect(response.body).toHaveProperty('analysis');
    });

    it('validates URL format', async () => {
      const response = await request(app)
        .post('/api/explorer/analyze')
        .send({ url: 'invalid-url' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('handles analysis errors gracefully', async () => {
      const response = await request(app)
        .post('/api/explorer/analyze')
        .send({ url: 'https://nonexistent-domain-12345.com' })
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/explorer/search', () => {
    it('performs basic web search across engines', async () => {
      const searchData = {
        query: 'machine learning',
        engines: ['google', 'bing'],
        count: 10,
      };

      const response = await request(app).post('/api/explorer/search').send(searchData).expect(200);

      expect(response.body).toHaveProperty('results');
      expect(response.body.results).toBeInstanceOf(Array);
    });

    it('handles search without engines specified', async () => {
      const response = await request(app)
        .post('/api/explorer/search')
        .send({ query: 'test query' })
        .expect(200);

      expect(response.body).toHaveProperty('results');
    });
  });

  describe('POST /api/explorer/batch-analyze', () => {
    it('analyzes multiple URLs in batch', async () => {
      const batchData = {
        urls: ['https://example1.com', 'https://example2.com'],
        analysisTypes: ['summary'],
      };

      const response = await request(app)
        .post('/api/explorer/batch-analyze')
        .send(batchData)
        .expect(200);

      expect(response.body).toHaveProperty('results');
      expect(response.body.results).toHaveLength(2);
    });

    it('handles empty URL list', async () => {
      const response = await request(app)
        .post('/api/explorer/batch-analyze')
        .send({ urls: [] })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/explorer/health', () => {
    it('returns service health status', async () => {
      const response = await request(app).get('/api/explorer/health').expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body.status).toBe('Quantum Explorer Engine Operational');
    });
  });

  describe('POST /api/explorer/trend-analysis', () => {
    it('performs trend analysis for given topic', async () => {
      const trendData = {
        topic: 'artificial intelligence',
        timeRange: 'past_month',
        numResults: 5,
      };

      const response = await request(app)
        .post('/api/explorer/trend-analysis')
        .send(trendData)
        .expect(200);

      expect(response.body).toHaveProperty('topic', 'artificial intelligence');
      expect(response.body).toHaveProperty('trends');
      expect(response.body.trends).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/explorer/compare-topics', () => {
    it('compares two topics based on web search', async () => {
      const compareData = {
        topic1: 'machine learning',
        topic2: 'deep learning',
        numResults: 5,
      };

      const response = await request(app)
        .post('/api/explorer/compare-topics')
        .send(compareData)
        .expect(200);

      expect(response.body).toHaveProperty('topic1', 'machine learning');
      expect(response.body).toHaveProperty('topic2', 'deep learning');
      expect(response.body).toHaveProperty('comparison');
    });
  });

  describe('Rate Limiting', () => {
    it('enforces rate limits on API endpoints', async () => {
      const promises = Array(20)
        .fill()
        .map(() => request(app).post('/api/explorer/query').send({ question: 'test' }));

      const responses = await Promise.all(promises);
      const rateLimitedResponses = responses.filter((r) => r.status === 429);

      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('handles malformed JSON requests', async () => {
      const response = await request(app)
        .post('/api/explorer/query')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('handles missing Content-Type header', async () => {
      const response = await request(app)
        .post('/api/explorer/query')
        .send('{"question": "test"}')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Performance', () => {
    it('responds to health check within 100ms', async () => {
      const start = performance.now();
      await request(app).get('/api/explorer/health');
      const end = performance.now();

      expect(end - start).toBeLessThan(100);
    });

    it('handles concurrent requests efficiently', async () => {
      const start = performance.now();
      const promises = Array(10)
        .fill()
        .map(() => request(app).get('/api/explorer/health'));
      await Promise.all(promises);
      const end = performance.now();

      expect(end - start).toBeLessThan(1000);
    });
  });

  describe('Security', () => {
    it('sanitizes user input in search queries', async () => {
      const maliciousQuery = {
        question: '<script>alert("xss")</script>',
      };

      const response = await request(app)
        .post('/api/explorer/query')
        .send(maliciousQuery)
        .expect(200);

      // Should not contain script tags in response
      expect(JSON.stringify(response.body)).not.toContain('<script>');
    });

    it('validates URL schemes', async () => {
      const response = await request(app)
        .post('/api/explorer/analyze')
        .send({ url: 'javascript:alert("xss")' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
});
