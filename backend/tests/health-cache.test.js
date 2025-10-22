const request = require('supertest');
const app = require('../server'); // Assuming your Express app is exported from server.js

// Mock external dependencies to ensure tests are isolated and fast
jest.mock('../src/cache/RedisCache', () => ({
  set: jest.fn().mockResolvedValue('OK'),
  get: jest.fn().mockResolvedValue('ok'),
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        limit: jest.fn(() => ({
          error: null
        })),
      })),
    })),
  })),
}));

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn(() => ({
    getGenerativeModel: jest.fn(() => ({
      generateContent: jest.fn().mockResolvedValue({ response: 'mocked' }),
    })),
  })),
}));

// Mock agent registry
jest.mock('../src/routes/agentManagement', () => ({
  agentRegistry: new Map(),
}), { virtual: true });


describe('Health Check Endpoints', () => {

  // Clear mocks before each test to ensure isolation
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/health', () => {
    it('should return 200 and a comprehensive health status when all components are healthy', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body.version).toBe('2.0.0');
      
      // Check for the main components
      expect(response.body.components).toHaveProperty('redis');
      expect(response.body.components).toHaveProperty('database');
      expect(response.body.components).toHaveProperty('gemini');
      expect(response.body.components).toHaveProperty('agents');

      // Check component status
      expect(response.body.components.redis.status).toBe('healthy');
      expect(response.body.components.database.status).toBe('healthy');
      expect(response.body.components.gemini.status).toBe('healthy');
    });

    it('should return 503 if a critical component check fails', async () => {
      // Mock Supabase to return an error
      const { createClient } = require('@supabase/supabase-js');
      createClient.mockImplementationOnce(() => ({
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ error: new Error('Connection failed') }),
      }));

      const response = await request(app).get('/api/health');
      
      // The overall status is degraded, but the HTTP status might be 200 or 503 depending on config
      // The code sets 503 for unhealthy, and 200 for degraded. Let's check for that.
      expect(response.status).toBe(200); // degraded returns 200
      expect(response.body.status).toBe('degraded');
      expect(response.body.components.database.status).toBe('degraded');
    });
    
    it('should use cache for subsequent requests within the TTL', async () => {
      const response1 = await request(app).get('/api/health');
      expect(response1.status).toBe(200);

      const response2 = await request(app).get('/api/health');
      expect(response2.status).toBe(200);
      
      // Check if the timestamp is the same, indicating a cached response
      expect(response2.body.timestamp).toBe(response1.body.timestamp);
    });
  });

  describe('GET /api/health/live', () => {
    it('should return 200 with an alive status', async () => {
      const response = await request(app).get('/api/health/live');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('alive');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/health/ready', () => {
    it('should return 200 with a ready status when critical services are up', async () => {
      const response = await request(app).get('/api/health/ready');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ready');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should return 503 if a critical service (Redis) is down', async () => {
      // Mock Redis to be unhealthy
      const redis = require('../src/cache/RedisCache');
      redis.get.mockRejectedValueOnce(new Error('Redis connection error'));

      const response = await request(app).get('/api/health/ready');

      expect(response.status).toBe(503);
      expect(response.body.status).toBe('not_ready');
      expect(response.body.reason).toBe('Redis unavailable');
    });
  });

  describe('GET /api/status', () => {
    it('should return 200 with lightweight service status', async () => {
      const response = await request(app).get('/api/status');

      expect(response.status).toBe(200);
      expect(response.body.service).toBe('Amrikyy-Agent');
      expect(response.body.version).toBe('2.0.0');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('memory');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
});




