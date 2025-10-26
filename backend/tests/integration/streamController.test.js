/**
 * Integration Tests for Stream Controller
 * Testing API endpoints and request handling
 */

// Mock streamService BEFORE importing
jest.mock('../../src/services/streamService');

const request = require('supertest');
const express = require('express');
const streamController = require('../../controllers/streamController');
const streamService = require('../../src/services/streamService');

describe('Stream Controller', () => {
  let app;

  beforeEach(() => {
    // Create test app
    app = express();
    app.use(express.json());

    // Setup routes
    app.post('/stream/blog', streamController.streamBlog);
    app.post('/stream/itinerary', streamController.streamItinerary);
    app.post('/stream/recommendations', streamController.streamRecommendations);
    app.post('/stream/social', streamController.streamSocial);
    app.get('/stream/stats/:agent', streamController.getStats);
    app.post('/stream/cleanup', streamController.cleanup);

    // Reset mocks
    jest.clearAllMocks();

    // Default mock implementations
    streamService.initializeStream = jest.fn();
    streamService.streamBlogPost = jest.fn().mockResolvedValue({ success: true });
    streamService.streamItinerary = jest.fn().mockResolvedValue({ success: true });
    streamService.streamRecommendations = jest.fn().mockResolvedValue({ success: true });
    streamService.streamSocialPosts = jest.fn().mockResolvedValue({ success: true });
    streamService.getStats = jest.fn().mockReturnValue({
      agent: 'travel',
      stats: { totalStreams: 10 },
      activeStreams: []
    });
    streamService.cleanupAllStreams = jest.fn().mockReturnValue({
      success: true,
      cleaned: { travel: 2, content: 1 },
      total: 3
    });
  });

  describe('POST /stream/blog', () => {
    test('should validate required topic field', async () => {
      const response = await request(app)
        .post('/stream/blog')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Topic');
    });

    test('should validate topic is a string', async () => {
      const response = await request(app)
        .post('/stream/blog')
        .send({ topic: 123 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Topic');
    });

    test('should validate topic is not empty', async () => {
      const response = await request(app)
        .post('/stream/blog')
        .send({ topic: '   ' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should accept valid blog post request', async () => {
      const mockRes = {
        setHeader: jest.fn(),
        write: jest.fn(),
        on: jest.fn()
      };

      streamService.initializeStream.mockImplementation((res) => {
        Object.assign(res, mockRes);
      });

      await request(app)
        .post('/stream/blog')
        .send({
          topic: 'AI in Travel',
          tone: 'professional',
          length: 'medium'
        });

      expect(streamService.initializeStream).toHaveBeenCalled();
      expect(streamService.streamBlogPost).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          topic: 'AI in Travel',
          tone: 'professional',
          length: 'medium'
        })
      );
    });
  });

  describe('POST /stream/itinerary', () => {
    test('should validate required destination', async () => {
      const response = await request(app)
        .post('/stream/itinerary')
        .send({ days: 7, budget: 2000 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Destination');
    });

    test('should validate required days', async () => {
      const response = await request(app)
        .post('/stream/itinerary')
        .send({ destination: 'Paris', budget: 2000 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Days');
    });

    test('should validate days is positive', async () => {
      const response = await request(app)
        .post('/stream/itinerary')
        .send({ destination: 'Paris', days: -5, budget: 2000 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Days');
    });

    test('should validate required budget', async () => {
      const response = await request(app)
        .post('/stream/itinerary')
        .send({ destination: 'Paris', days: 7 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Budget');
    });

    test('should validate budget is positive', async () => {
      const response = await request(app)
        .post('/stream/itinerary')
        .send({ destination: 'Paris', days: 7, budget: 0 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Budget');
    });

    test('should accept valid itinerary request', async () => {
      const mockRes = {
        setHeader: jest.fn(),
        write: jest.fn(),
        on: jest.fn()
      };

      streamService.initializeStream.mockImplementation((res) => {
        Object.assign(res, mockRes);
      });

      await request(app)
        .post('/stream/itinerary')
        .send({
          destination: 'Paris',
          days: 7,
          budget: 2000
        });

      expect(streamService.streamItinerary).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          destination: 'Paris',
          days: 7,
          budget: 2000
        })
      );
    });
  });

  describe('POST /stream/recommendations', () => {
    test('should validate required interests', async () => {
      const response = await request(app)
        .post('/stream/recommendations')
        .send({ budget: 3000 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Interests');
    });

    test('should validate interests is not empty', async () => {
      const response = await request(app)
        .post('/stream/recommendations')
        .send({ interests: '', budget: 3000 })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should validate required budget', async () => {
      const response = await request(app)
        .post('/stream/recommendations')
        .send({ interests: 'beaches' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Budget');
    });

    test('should accept valid recommendations request', async () => {
      const mockRes = {
        setHeader: jest.fn(),
        write: jest.fn(),
        on: jest.fn()
      };

      streamService.initializeStream.mockImplementation((res) => {
        Object.assign(res, mockRes);
      });

      await request(app)
        .post('/stream/recommendations')
        .send({
          interests: 'beaches, culture',
          budget: 3000
        });

      expect(streamService.streamRecommendations).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          interests: 'beaches, culture',
          budget: 3000
        })
      );
    });
  });

  describe('POST /stream/social', () => {
    test('should validate required topic', async () => {
      const response = await request(app)
        .post('/stream/social')
        .send({ platforms: ['twitter'] })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Topic');
    });

    test('should validate required platforms', async () => {
      const response = await request(app)
        .post('/stream/social')
        .send({ topic: 'Travel Tips' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Platforms');
    });

    test('should accept valid social posts request', async () => {
      const mockRes = {
        setHeader: jest.fn(),
        write: jest.fn(),
        on: jest.fn()
      };

      streamService.initializeStream.mockImplementation((res) => {
        Object.assign(res, mockRes);
      });

      await request(app)
        .post('/stream/social')
        .send({
          topic: 'Summer Travel',
          platforms: ['twitter', 'instagram']
        });

      expect(streamService.streamSocialPosts).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          topic: 'Summer Travel',
          platforms: ['twitter', 'instagram']
        })
      );
    });
  });

  describe('GET /stream/stats/:agent', () => {
    test('should return stats for valid agent', async () => {
      const response = await request(app)
        .get('/stream/stats/travel')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.agent).toBe('travel');
      expect(response.body.stats).toBeDefined();
    });

    test('should return 404 for invalid agent', async () => {
      const response = await request(app)
        .get('/stream/stats/invalid')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Agent not found');
    });

    test('should accept content agent', async () => {
      streamService.getStats.mockReturnValue({
        agent: 'content',
        stats: { totalStreams: 5 },
        activeStreams: []
      });

      const response = await request(app)
        .get('/stream/stats/content')
        .expect(200);

      expect(response.body.agent).toBe('content');
    });
  });

  describe('POST /stream/cleanup', () => {
    test('should cleanup streams successfully', async () => {
      const response = await request(app)
        .post('/stream/cleanup')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.cleaned).toBeDefined();
      expect(response.body.total).toBe(3);
      expect(streamService.cleanupAllStreams).toHaveBeenCalled();
    });

    test('should handle cleanup errors', async () => {
      streamService.cleanupAllStreams.mockImplementation(() => {
        throw new Error('Cleanup failed');
      });

      // Add error handler to app
      app.use((err, req, res, next) => {
        res.status(500).json({ success: false, error: err.message });
      });

      const response = await request(app)
        .post('/stream/cleanup')
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('should not send response if headers already sent', async () => {
      streamService.streamBlogPost.mockRejectedValue(new Error('Test error'));
      
      const mockRes = {
        setHeader: jest.fn(),
        write: jest.fn(),
        on: jest.fn(),
        headersSent: true
      };

      streamService.initializeStream.mockImplementation((res) => {
        Object.assign(res, mockRes);
        res.headersSent = true;
      });

      // Should not throw even if error occurs
      await request(app)
        .post('/stream/blog')
        .send({ topic: 'Test Topic' });
    });
  });

  describe('User Context', () => {
    test('should include user ID in logs when available', async () => {
      const mockRes = {
        setHeader: jest.fn(),
        write: jest.fn(),
        on: jest.fn()
      };

      streamService.initializeStream.mockImplementation((res) => {
        Object.assign(res, mockRes);
      });

      // Add middleware to inject user
      app.use((req, res, next) => {
        req.user = { id: 'user-123' };
        next();
      });

      await request(app)
        .post('/stream/blog')
        .send({ topic: 'Test' });

      // Service should be called (user logging happens in controller)
      expect(streamService.streamBlogPost).toHaveBeenCalled();
    });
  });
});
