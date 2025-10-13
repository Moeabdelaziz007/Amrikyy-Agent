/**
 * Kelo AI Integration Tests
 * Comprehensive test suite for Kelo AI functionality
 */

const request = require('supertest');
const app = require('../../server');
const OpenRouterClient = require('../../src/ai/openRouterClient');
const ContextManager = require('../../src/ai/contextManager');
const ModelSwitcher = require('../../src/ai/modelSwitcher');

// Mock external dependencies
jest.mock('../../src/ai/openRouterClient');
jest.mock('../../src/ai/contextManager');
jest.mock('../../src/ai/modelSwitcher');

describe('Kelo AI Integration Tests', () => {
  let mockOpenRouterClient;
  let mockContextManager;
  let mockModelSwitcher;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mock implementations
    mockOpenRouterClient = {
      chatCompletion: jest.fn(),
      healthCheck: jest.fn(),
      generateTravelRecommendations: jest.fn(),
      analyzeTravelData: jest.fn(),
      generateRevenueInsights: jest.fn()
    };
    
    mockContextManager = {
      storeProjectContext: jest.fn(),
      getProjectContext: jest.fn(),
      compressContext: jest.fn(),
      trackUsage: jest.fn()
    };
    
    mockModelSwitcher = {
      selectModel: jest.fn(),
      trackPerformance: jest.fn()
    };

    // Apply mocks
    OpenRouterClient.mockImplementation(() => mockOpenRouterClient);
    ContextManager.mockImplementation(() => mockContextManager);
    ModelSwitcher.mockImplementation(() => mockModelSwitcher);
  });

  describe('Kelo API Endpoints', () => {
    describe('POST /api/kelo/chat', () => {
      it('should handle chat completion successfully', async () => {
        const mockResponse = {
          content: 'Hello! How can I help you with your travel plans?',
          usage: { total_tokens: 50 },
          model: 'meta-llama/llama-3.1-8b-instruct:free',
          cost: 0
        };

        mockOpenRouterClient.chatCompletion.mockResolvedValue(mockResponse);

        const response = await request(app)
          .post('/api/kelo/chat')
          .send({
            message: 'Hello',
            context: 'travel',
            temperature: 0.7,
            maxTokens: 1000
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.response).toEqual(mockResponse);
        expect(mockOpenRouterClient.chatCompletion).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ role: 'system' }),
            expect.objectContaining({ role: 'user', content: 'Hello' })
          ]),
          expect.objectContaining({
            temperature: 0.7,
            maxTokens: 1000,
            budget: 'free'
          })
        );
      });

      it('should handle chat completion errors', async () => {
        mockOpenRouterClient.chatCompletion.mockRejectedValue(
          new Error('API Error')
        );

        const response = await request(app)
          .post('/api/kelo/chat')
          .send({
            message: 'Hello'
          })
          .expect(500);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Chat completion failed');
      });

      it('should validate required message parameter', async () => {
        const response = await request(app)
          .post('/api/kelo/chat')
          .send({})
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Message is required');
      });
    });

    describe('POST /api/kelo/analyze', () => {
      it('should analyze data successfully', async () => {
        const mockAnalysis = {
          insights: ['Positive trend detected', 'Growth opportunity identified'],
          recommendations: ['Focus on high-value customers', 'Optimize pricing strategy']
        };

        mockOpenRouterClient.chatCompletion.mockResolvedValue({
          content: JSON.stringify(mockAnalysis),
          usage: { total_tokens: 200 },
          cost: 0.0002
        });

        const response = await request(app)
          .post('/api/kelo/analyze')
          .send({
            data: { revenue: 10000, customers: 100 },
            analysisType: 'revenue',
            insights: true,
            recommendations: true
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.analysis).toBeDefined();
      });

      it('should validate required data parameter', async () => {
        const response = await request(app)
          .post('/api/kelo/analyze')
          .send({
            analysisType: 'revenue'
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Data is required for analysis');
      });
    });

    describe('POST /api/kelo/recommend', () => {
      it('should generate recommendations successfully', async () => {
        const mockRecommendations = {
          destinations: ['Paris', 'Tokyo', 'New York'],
          activities: ['Museums', 'Food tours', 'Shopping'],
          budget: '$2000-3000'
        };

        mockOpenRouterClient.chatCompletion.mockResolvedValue({
          content: JSON.stringify(mockRecommendations),
          usage: { total_tokens: 300 },
          cost: 0.0003
        });

        const response = await request(app)
          .post('/api/kelo/recommend')
          .send({
            type: 'travel',
            preferences: { budget: 2500, duration: 7 },
            destination: 'Europe'
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.recommendations).toBeDefined();
      });
    });

    describe('GET /api/kelo/status', () => {
      it('should return health status', async () => {
        const mockHealth = {
          status: 'healthy',
          model: 'meta-llama/llama-3.1-8b-instruct:free',
          cost: 0,
          provider: 'OpenRouter'
        };

        mockOpenRouterClient.healthCheck.mockResolvedValue(mockHealth);

        const response = await request(app)
          .get('/api/kelo/status')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.status).toBe('healthy');
      });

      it('should handle health check errors', async () => {
        mockOpenRouterClient.healthCheck.mockRejectedValue(
          new Error('Health check failed')
        );

        const response = await request(app)
          .get('/api/kelo/status')
          .expect(500);

        expect(response.body.success).toBe(false);
        expect(response.body.status).toBe('unhealthy');
      });
    });

    describe('GET /api/kelo/models', () => {
      it('should return available models', async () => {
        const response = await request(app)
          .get('/api/kelo/models')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.models).toBeDefined();
        expect(Array.isArray(response.body.models)).toBe(true);
      });
    });
  });

  describe('Revenue API Integration', () => {
    describe('GET /api/revenue/opportunities', () => {
      it('should generate revenue opportunities', async () => {
        const mockOpportunities = [
          {
            id: 'revenue_1',
            title: 'Premium Travel Packages',
            potential_revenue: '$50,000/month'
          }
        ];

        mockOpenRouterClient.chatCompletion.mockResolvedValue({
          content: JSON.stringify(mockOpportunities),
          usage: { total_tokens: 400 },
          cost: 0.0004
        });

        const response = await request(app)
          .get('/api/revenue/opportunities')
          .query({
            period: 'monthly',
            category: 'all',
            limit: 10
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.opportunities).toBeDefined();
      });
    });

    describe('POST /api/revenue/analyze', () => {
      it('should analyze revenue data', async () => {
        const mockAnalysis = {
          insights: ['Revenue growing 15% monthly'],
          recommendations: ['Focus on premium customers']
        };

        mockOpenRouterClient.chatCompletion.mockResolvedValue({
          content: JSON.stringify(mockAnalysis),
          usage: { total_tokens: 300 },
          cost: 0.0003
        });

        const response = await request(app)
          .post('/api/revenue/analyze')
          .send({
            data: { monthly_revenue: 50000, growth_rate: 0.15 },
            metrics: ['revenue', 'growth'],
            timeframe: '30d'
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.analysis).toBeDefined();
      });
    });
  });

  describe('Cost Optimization', () => {
    it('should use free models for simple tasks', async () => {
      mockModelSwitcher.selectModel.mockReturnValue({
        modelId: 'meta-llama/llama-3.1-8b-instruct:free',
        tier: 'free',
        reason: 'Simple task, using free tier'
      });

      mockOpenRouterClient.chatCompletion.mockResolvedValue({
        content: 'Simple response',
        cost: 0
      });

      await request(app)
        .post('/api/kelo/chat')
        .send({
          message: 'Hello',
          task: 'simple_greeting'
        })
        .expect(200);

      expect(mockModelSwitcher.selectModel).toHaveBeenCalledWith(
        'simple_greeting',
        'free',
        0
      );
    });

    it('should escalate to budget models for complex tasks', async () => {
      mockModelSwitcher.selectModel.mockReturnValue({
        modelId: 'meta-llama/llama-3.1-70b-instruct',
        tier: 'budget',
        reason: 'Complex task, using budget tier'
      });

      mockOpenRouterClient.chatCompletion.mockResolvedValue({
        content: 'Complex analysis response',
        cost: 0.0009
      });

      await request(app)
        .post('/api/kelo/analyze')
        .send({
          data: { complex_data: 'value' },
          task: 'complex_analysis',
          budget: 'budget'
        })
        .expect(200);

      expect(mockModelSwitcher.selectModel).toHaveBeenCalledWith(
        'complex_analysis',
        'budget',
        0
      );
    });
  });

  describe('Context Management', () => {
    it('should compress context for cost savings', async () => {
      mockContextManager.compressContext.mockReturnValue('Compressed context');
      mockOpenRouterClient.chatCompletion.mockResolvedValue({
        content: 'Response',
        cost: 0
      });

      await request(app)
        .post('/api/kelo/chat')
        .send({
          message: 'Test message with long context that should be compressed'
        })
        .expect(200);

      expect(mockContextManager.compressContext).toHaveBeenCalled();
    });

    it('should use Memory Bank references', async () => {
      mockContextManager.getProjectContext.mockReturnValue('Stored context');
      mockOpenRouterClient.chatCompletion.mockResolvedValue({
        content: 'Response',
        cost: 0
      });

      await request(app)
        .post('/api/kelo/chat')
        .send({
          message: '@src/components/UserProfile.tsx:45-67'
        })
        .expect(200);

      expect(mockContextManager.getProjectContext).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle API rate limits', async () => {
      mockOpenRouterClient.chatCompletion.mockRejectedValue(
        new Error('Rate limit exceeded')
      );

      const response = await request(app)
        .post('/api/kelo/chat')
        .send({
          message: 'Test message'
        })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Chat completion failed');
    });

    it('should handle invalid model selection', async () => {
      mockModelSwitcher.selectModel.mockReturnValue({
        modelId: 'invalid-model',
        tier: 'free',
        reason: 'Invalid model'
      });

      mockOpenRouterClient.chatCompletion.mockRejectedValue(
        new Error('Model not found')
      );

      const response = await request(app)
        .post('/api/kelo/chat')
        .send({
          message: 'Test message'
        })
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Performance Tests', () => {
    it('should respond within acceptable time limits', async () => {
      mockOpenRouterClient.chatCompletion.mockResolvedValue({
        content: 'Fast response',
        cost: 0
      });

      const startTime = Date.now();
      
      await request(app)
        .post('/api/kelo/chat')
        .send({
          message: 'Performance test'
        })
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(5000); // 5 seconds max
    });

    it('should handle concurrent requests', async () => {
      mockOpenRouterClient.chatCompletion.mockResolvedValue({
        content: 'Concurrent response',
        cost: 0
      });

      const requests = Array(10).fill().map(() =>
        request(app)
          .post('/api/kelo/chat')
          .send({ message: 'Concurrent test' })
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });
  });
});