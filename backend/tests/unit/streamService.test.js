/**
 * Unit Tests for StreamService
 * Testing streaming operations, LangSmith tracing, and metrics
 */

// Mock dependencies BEFORE importing
jest.mock('../../src/services/metricsService');
jest.mock('../../src/utils/AgentStreaming');
jest.mock('../../src/agents/TravelAgencyAgent', () => {
  return jest.fn().mockImplementation(() => ({
    model: { model: 'gemini-pro' },
    generateItinerary: jest.fn().mockResolvedValue({ itinerary: 'test' })
  }));
});
jest.mock('../../src/agents/ContentCreatorAgent', () => {
  return jest.fn().mockImplementation(() => ({
    model: { model: 'gemini-pro' },
    generateSocialPosts: jest.fn().mockResolvedValue([
      { platform: 'twitter', content: 'Post 1' },
      { platform: 'instagram', content: 'Post 2' }
    ])
  }));
});
jest.mock('langsmith/traceable', () => ({
  traceable: (fn) => fn
}));

const metricsService = require('../../src/services/metricsService');
const AgentStreaming = require('../../src/utils/AgentStreaming');

describe('StreamService', () => {
  let streamService;
  let mockRes;
  let mockManager;

  beforeAll(() => {
    // Require streamService once for all tests
    streamService = require('../../src/services/streamService');
  });

  beforeEach(() => {
    // Reset mocks but not modules
    jest.clearAllMocks();

    // Mock response object
    mockRes = {
      setHeader: jest.fn(),
      write: jest.fn(),
      end: jest.fn(),
      on: jest.fn(),
      headersSent: false
    };

    // Mock streaming manager
    mockManager = {
      initializeStream: jest.fn().mockReturnValue({
        id: 'test-stream-id',
        res: mockRes,
        startTime: Date.now(),
        status: 'active'
      }),
      sendEvent: jest.fn().mockReturnValue(true),
      sendStatus: jest.fn().mockReturnValue(true),
      sendProgress: jest.fn().mockReturnValue(true),
      sendError: jest.fn().mockReturnValue(true),
      sendComplete: jest.fn().mockReturnValue(true),
      streamGeminiResponse: jest.fn().mockResolvedValue({
        success: true,
        text: 'Generated text',
        chunks: 5,
        usage: {
          promptTokens: 100,
          completionTokens: 500,
          totalTokens: 600
        }
      }),
      streamWithProgress: jest.fn().mockImplementation(async (streamId, operation, callback) => {
        const result = await operation();
        if (callback) await callback(streamId, result);
        return result;
      }),
      streamJSONGeneration: jest.fn().mockResolvedValue({
        success: true,
        data: {
          destinations: [
            { name: 'Bali', country: 'Indonesia' }
          ]
        }
      }),
      getStats: jest.fn().mockReturnValue({
        totalStreams: 10,
        activeStreams: 2,
        completedStreams: 8,
        successRate: '80%'
      }),
      getActiveStreams: jest.fn().mockReturnValue(['stream-1', 'stream-2']),
      cleanupStreams: jest.fn().mockReturnValue(3)
    };

    // Mock AgentStreaming constructor
    AgentStreaming.mockImplementation(() => mockManager);
  });

  afterEach(() => {
    // Clean up any active streams
    streamService.activeStreams.clear();
  });

  describe('initializeStream', () => {
    test('should initialize stream with correct agent type', () => {
      const streamId = 'test-stream-123';
      const agentType = 'content';

      // Inject mock manager before calling
      streamService.streamingManagers[agentType] = mockManager;

      streamService.initializeStream(mockRes, streamId, agentType);

      expect(mockManager.initializeStream).toHaveBeenCalledWith(mockRes, streamId);
      expect(metricsService.recordStreamEvent).toHaveBeenCalledWith('started', 
        expect.objectContaining({ agent: agentType })
      );
    });

    test('should throw error for unknown agent type', () => {
      expect(() => {
        streamService.initializeStream(mockRes, 'test-id', 'unknown');
      }).toThrow('Unknown agent type: unknown');
    });

    test('should setup client disconnect handler', () => {
      const streamId = 'test-stream-123';
      const agentType = 'travel';
      
      // Inject mock manager
      streamService.streamingManagers[agentType] = mockManager;
      
      streamService.initializeStream(mockRes, streamId, agentType);

      expect(mockRes.on).toHaveBeenCalledWith('close', expect.any(Function));
    });

    test('should track active stream', () => {
      const streamId = 'test-stream-123';
      const agentType = 'content';
      
      // Inject mock manager
      streamService.streamingManagers[agentType] = mockManager;
      
      streamService.initializeStream(mockRes, streamId, agentType);

      expect(streamService.activeStreams.has(streamId)).toBe(true);
      const streamInfo = streamService.activeStreams.get(streamId);
      expect(streamInfo).toMatchObject({
        streamId,
        agentType,
        res: mockRes
      });
    });
  });

  describe('handleClientDisconnect', () => {
    test('should cleanup resources on disconnect', () => {
      const streamId = 'test-stream-123';
      const agentType = 'travel';

      // Setup stream first
      streamService.streamingManagers[agentType] = mockManager;
      streamService.initializeStream(mockRes, streamId, agentType);
      jest.clearAllMocks();

      // Trigger disconnect
      streamService.handleClientDisconnect(streamId, agentType);

      expect(metricsService.recordStreamEvent).toHaveBeenCalledWith('cancelled',
        expect.objectContaining({
          agent: agentType,
          reason: 'client_disconnect'
        })
      );

      expect(streamService.activeStreams.has(streamId)).toBe(false);
    });

    test('should handle disconnect for non-existent stream gracefully', () => {
      expect(() => {
        streamService.handleClientDisconnect('non-existent', 'travel');
      }).not.toThrow();
    });
  });

  describe('streamBlogPost', () => {
    test('should stream blog post successfully', async () => {
      const streamId = 'blog-stream-123';
      const params = {
        topic: 'AI in Travel',
        tone: 'professional',
        length: 'medium'
      };

      // Inject mock manager
      streamService.streamingManagers.content = mockManager;
      streamService.initializeStream(mockRes, streamId, 'content');

      const result = await streamService.streamBlogPost(streamId, params);

      expect(result.success).toBe(true);
      expect(mockManager.streamGeminiResponse).toHaveBeenCalled();
      expect(metricsService.recordLLMCall).toHaveBeenCalledWith(
        expect.objectContaining({
          agent: 'content',
          status: 'success'
        })
      );
    });

    test('should handle stream failure', async () => {
      const streamId = 'blog-stream-fail';
      const params = { topic: 'Test' };

      mockManager.streamGeminiResponse.mockRejectedValue(
        new Error('Stream failed')
      );

      // Inject mock manager
      streamService.streamingManagers.content = mockManager;
      streamService.initializeStream(mockRes, streamId, 'content');

      await expect(
        streamService.streamBlogPost(streamId, params)
      ).rejects.toThrow('Stream failed');

      expect(metricsService.recordStreamEvent).toHaveBeenCalledWith('failed',
        expect.objectContaining({
          agent: 'content',
          error_type: 'Error'
        })
      );
    });
  });

  describe('streamItinerary', () => {
    test('should stream itinerary with progress updates', async () => {
      const streamId = 'itinerary-stream-123';
      const params = {
        destination: 'Paris',
        days: 7,
        budget: 2000
      };

      // Inject mock manager
      streamService.streamingManagers.travel = mockManager;
      streamService.initializeStream(mockRes, streamId, 'travel');

      await streamService.streamItinerary(streamId, params);

      expect(mockManager.streamWithProgress).toHaveBeenCalled();
      expect(metricsService.recordStreamEvent).toHaveBeenCalledWith('completed',
        expect.objectContaining({ agent: 'travel' })
      );
    });
  });

  describe('streamRecommendations', () => {
    test('should stream JSON recommendations', async () => {
      const streamId = 'rec-stream-123';
      const params = {
        interests: 'beaches, culture',
        budget: 3000
      };

      // Inject mock manager
      streamService.streamingManagers.travel = mockManager;
      streamService.initializeStream(mockRes, streamId, 'travel');

      const result = await streamService.streamRecommendations(streamId, params);

      expect(result.success).toBe(true);
      expect(mockManager.streamJSONGeneration).toHaveBeenCalled();
    });
  });

  describe('streamSocialPosts', () => {
    test('should stream social posts with progress', async () => {
      const streamId = 'social-stream-123';
      const params = {
        topic: 'Summer Travel Tips',
        platforms: ['twitter', 'instagram']
      };

      // Mock the agent method
      streamService.agents.content.generateSocialPosts = jest.fn().mockResolvedValue([
        { platform: 'twitter', content: 'Post 1' },
        { platform: 'instagram', content: 'Post 2' }
      ]);

      // Inject mock manager
      streamService.streamingManagers.content = mockManager;
      streamService.initializeStream(mockRes, streamId, 'content');

      await streamService.streamSocialPosts(streamId, params);

      expect(streamService.agents.content.generateSocialPosts).toHaveBeenCalledWith({
        topic: params.topic,
        platforms: params.platforms
      });

      expect(mockManager.sendProgress).toHaveBeenCalled();
      expect(mockManager.sendComplete).toHaveBeenCalled();
    });

    test('should handle string platforms parameter', async () => {
      const streamId = 'social-stream-str';
      const params = {
        topic: 'Test',
        platforms: 'twitter,instagram,facebook'
      };

      // Mock the agent method
      streamService.agents.content.generateSocialPosts = jest.fn().mockResolvedValue([
        { platform: 'twitter', content: 'Post 1' }
      ]);

      // Inject mock manager
      streamService.streamingManagers.content = mockManager;
      streamService.initializeStream(mockRes, streamId, 'content');

      await streamService.streamSocialPosts(streamId, params);

      expect(streamService.agents.content.generateSocialPosts).toHaveBeenCalledWith(
        expect.objectContaining({
          platforms: ['twitter', 'instagram', 'facebook']
        })
      );
    });
  });

  describe('getStats', () => {
    test('should return stats for valid agent', () => {
      // Directly set the mock manager reference
      streamService.streamingManagers.travel = mockManager;
      
      const stats = streamService.getStats('travel');

      expect(stats).toMatchObject({
        agent: 'travel',
        stats: expect.any(Object),
        activeStreams: expect.any(Array)
      });
    });

    test('should throw error for invalid agent', () => {
      expect(() => {
        streamService.getStats('invalid');
      }).toThrow('Unknown agent type: invalid');
    });
  });

  describe('cleanupStreams', () => {
    test('should cleanup streams for specific agent', () => {
      // Directly set the mock manager reference
      streamService.streamingManagers.travel = mockManager;
      
      const cleaned = streamService.cleanupStreams('travel');

      expect(cleaned).toBe(3);
      expect(mockManager.cleanupStreams).toHaveBeenCalled();
    });

    test('should throw error for invalid agent type', () => {
      expect(() => {
        streamService.cleanupStreams('invalid');
      }).toThrow('Unknown agent type: invalid');
    });
  });

  describe('cleanupAllStreams', () => {
    test('should cleanup all inactive streams', () => {
      // Directly set the mock manager references
      streamService.streamingManagers.travel = mockManager;
      streamService.streamingManagers.content = mockManager;
      
      const result = streamService.cleanupAllStreams();

      expect(result.success).toBe(true);
      expect(result.total).toBeGreaterThanOrEqual(0);
      expect(result.cleaned).toHaveProperty('travel');
      expect(result.cleaned).toHaveProperty('content');
    });
  });
});
