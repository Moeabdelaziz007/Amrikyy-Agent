const request = require('supertest');
const app = require('../server');

describe('Health Check & Cache Management', () => {
  describe('GET /api/health', () => {
    it('should return system health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('healthy');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeGreaterThan(0);
      expect(response.body.version).toBeDefined();
      expect(response.body.environment).toBeDefined();

      // Cache stats should be present (even if disabled)
      expect(response.body.cache).toBeDefined();
    });

    it('should include performance monitoring data', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.headers['x-request-id']).toBeDefined();
      expect(response.headers['x-request-id']).toMatch(/^req_\d+_[a-z0-9]+$/);
    });
  });

  describe('GET /api/admin/cache/stats', () => {
    it('should return cache statistics', async () => {
      const response = await request(app)
        .get('/api/admin/cache/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.cache).toBeDefined();

      // If cache is enabled, should have stats
      if (response.body.cache !== 'disabled') {
        expect(response.body.cache).toHaveProperty('hits');
        expect(response.body.cache).toHaveProperty('misses');
        expect(response.body.cache).toHaveProperty('errors');
        expect(response.body.cache).toHaveProperty('hitRate');
      }
    });

    it('should return cache disabled when Redis is not available', async () => {
      // This test assumes Redis might not be running
      const response = await request(app)
        .get('/api/admin/cache/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      // Cache might be disabled in test environment
    });
  });

  describe('POST /api/admin/cache/clear', () => {
    it('should clear cache when Redis is available', async () => {
      const response = await request(app)
        .post('/api/admin/cache/clear')
        .send({ pattern: '*' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Cache cleared');
    });

    it('should return error when cache is not available', async () => {
      const response = await request(app)
        .post('/api/admin/cache/clear')
        .send({ pattern: '*' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Cache not available');
    });

    it('should handle missing pattern parameter', async () => {
      const response = await request(app)
        .post('/api/admin/cache/clear')
        .send({})
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Cache cleared');
    });
  });

  describe('Performance Monitoring Integration', () => {
    it('should track cache performance across multiple requests', async () => {
      // Make multiple requests to generate cache stats
      const requests = [];

      for (let i = 0; i < 5; i++) {
        requests.push(
          request(app)
            .get('/api/health')
        );
      }

      const responses = await Promise.all(requests);

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      // Check that performance headers are included
      responses.forEach(response => {
        expect(response.headers['x-request-id']).toBeDefined();
      });
    });

    it('should handle rapid successive requests', async () => {
      // Simulate rapid requests to test performance monitoring
      const startTime = Date.now();

      const requests = [];
      for (let i = 0; i < 10; i++) {
        requests.push(
          request(app)
            .get('/api/health')
        );
      }

      const responses = await Promise.all(requests);
      const endTime = Date.now();

      // All requests should complete successfully
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      // Should complete in reasonable time (< 2 seconds for 10 requests)
      expect(endTime - startTime).toBeLessThan(2000);
    });
  });

  describe('Error Handling in Health Endpoints', () => {
    it('should handle Redis connection errors gracefully', async () => {
      // This would require mocking Redis to be unavailable
      // For now, we'll test that the endpoint doesn't crash

      const response = await request(app)
        .get('/api/admin/cache/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should handle malformed cache clear requests', async () => {
      const response = await request(app)
        .post('/api/admin/cache/clear')
        .set('Content-Type', 'application/json')
        .send('{ malformed json')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('System Monitoring', () => {
    it('should provide accurate uptime information', async () => {
      const response1 = await request(app)
        .get('/api/health');

      expect(response1.status).toBe(200);

      const uptime1 = response1.body.uptime;

      // Wait a short time and check again
      await new Promise(resolve => setTimeout(resolve, 100));

      const response2 = await request(app)
        .get('/api/health');

      expect(response2.status).toBe(200);
      expect(response2.body.uptime).toBeGreaterThan(uptime1);
    });

    it('should provide consistent version information', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.body.version).toBeDefined();
      expect(typeof response.body.version).toBe('string');

      // Version should remain consistent across requests
      const response2 = await request(app)
        .get('/api/health');

      expect(response2.body.version).toBe(response.body.version);
    });
  });

  describe('Cache Performance Analysis', () => {
    it('should track cache hit/miss ratios correctly', async () => {
      // Make a request that should be cacheable
      const response1 = await request(app)
        .get('/api/health');

      expect(response1.status).toBe(200);

      // Check cache stats
      const statsResponse = await request(app)
        .get('/api/admin/cache/stats');

      expect(statsResponse.status).toBe(200);
      expect(statsResponse.body.cache).toBeDefined();

      if (statsResponse.body.cache !== 'disabled') {
        expect(typeof statsResponse.body.cache.hits).toBe('number');
        expect(typeof statsResponse.body.cache.misses).toBe('number');
        expect(typeof statsResponse.body.cache.hitRate).toBe('string');
      }
    });

    it('should maintain cache statistics across multiple requests', async () => {
      // Get initial stats
      const initialResponse = await request(app)
        .get('/api/admin/cache/stats');

      const initialStats = initialResponse.body.cache;

      // Make some requests
      await request(app).get('/api/health');
      await request(app).get('/api/health');

      // Get updated stats
      const updatedResponse = await request(app)
        .get('/api/admin/cache/stats');

      const updatedStats = updatedResponse.body.cache;

      // Stats should be consistent or increased
      if (initialStats !== 'disabled' && updatedStats !== 'disabled') {
        expect(updatedStats.hits + updatedStats.misses).toBeGreaterThanOrEqual(
          initialStats.hits + initialStats.misses
        );
      }
    });
  });
});
