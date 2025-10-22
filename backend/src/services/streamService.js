/**
 * Stream Service - Business logic for agent streaming
 * Handles streaming operations with LangSmith tracing and metrics
 * 
 * Features:
 * - Integration with AgentStreaming utility
 * - LangSmith tracing for all streaming operations
 * - Prometheus metrics tracking
 * - Resource cleanup on client disconnect
 * - Multi-agent support
 * 
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-22
 */

const AgentStreaming = require('../utils/AgentStreaming');
const metricsService = require('./metricsService');
const logger = require('../utils/logger');
const { traceable } = require('langsmith/traceable');

// Import agents
const TravelAgencyAgent = require('../agents/TravelAgencyAgent');
const ContentCreatorAgent = require('../agents/ContentCreatorAgent');

/**
 * StreamService class
 * Manages streaming operations for different agents
 */
class StreamService {
  constructor() {
    // Initialize agents
    this.agents = {
      travel: new TravelAgencyAgent(),
      content: new ContentCreatorAgent()
    };

    // Initialize streaming managers
    this.streamingManagers = {
      travel: new AgentStreaming('TravelAgent'),
      content: new AgentStreaming('ContentAgent')
    };

    // Track active streams for cleanup
    this.activeStreams = new Map();

    logger.info('[StreamService] Initialized with Travel and Content agents');
  }

  /**
   * Initialize a stream and setup cleanup handlers
   * @param {Object} res - Express response object
   * @param {string} streamId - Unique stream identifier
   * @param {string} agentType - Agent type (travel, content)
   * @returns {Object} Stream object
   */
  initializeStream(res, streamId, agentType) {
    const manager = this.streamingManagers[agentType];
    if (!manager) {
      throw new Error(`Unknown agent type: ${agentType}`);
    }

    // Initialize SSE stream
    const stream = manager.initializeStream(res, streamId);

    // Track metrics
    metricsService.recordStreamEvent('started', { 
      agent: agentType,
      model: this.agents[agentType]?.model?.model || 'unknown'
    });

    // Store stream reference for cleanup
    this.activeStreams.set(streamId, {
      streamId,
      agentType,
      manager,
      startTime: Date.now(),
      res
    });

    // Setup disconnect handler with resource cleanup
    res.on('close', () => {
      this.handleClientDisconnect(streamId, agentType);
    });

    return stream;
  }

  /**
   * Handle client disconnect - cleanup resources
   * @param {string} streamId - Stream identifier
   * @param {string} agentType - Agent type
   */
  handleClientDisconnect(streamId, agentType) {
    const streamInfo = this.activeStreams.get(streamId);
    
    if (!streamInfo) {
      return;
    }

    const duration = (Date.now() - streamInfo.startTime) / 1000;

    logger.info(`[StreamService] Client disconnected: ${streamId}`, {
      agentType,
      duration: `${duration}s`
    });

    // Track metrics
    metricsService.recordStreamEvent('cancelled', {
      agent: agentType,
      model: this.agents[agentType]?.model?.model || 'unknown',
      reason: 'client_disconnect',
      duration
    });

    // Remove from active streams
    this.activeStreams.delete(streamId);
  }

  /**
   * Stream blog post generation
   * @param {string} streamId - Stream identifier
   * @param {Object} params - Generation parameters
   * @returns {Promise<Object>} Result object
   */
  streamBlogPost = traceable(
    async function(streamId, params) {
      const { topic, tone = 'professional', length = 'medium' } = params;
      const agentType = 'content';
      const manager = this.streamingManagers[agentType];
      const agent = this.agents[agentType];

      try {
        logger.info(`[StreamService] Starting blog post stream: ${streamId}`, { topic, tone, length });

        const prompt = `Write a ${length} blog post about "${topic}" in a ${tone} tone.`;

        // Track LLM call start
        const llmStartTime = Date.now();

        // Stream with Gemini
        const result = await manager.streamGeminiResponse(
          streamId,
          agent.model,
          prompt
        );

        // Track LLM call metrics
        const llmDuration = (Date.now() - llmStartTime) / 1000;
        
        if (result.success) {
          metricsService.recordLLMCall({
            model: agent.model?.model || 'gemini-pro',
            agent: agentType,
            status: 'success',
            duration: llmDuration,
            inputTokens: result.usage?.promptTokens || 0,
            outputTokens: result.usage?.completionTokens || 0
          });

          // Track stream completion
          const streamInfo = this.activeStreams.get(streamId);
          if (streamInfo) {
            const totalDuration = (Date.now() - streamInfo.startTime) / 1000;
            metricsService.recordStreamEvent('completed', {
              agent: agentType,
              model: agent.model?.model || 'gemini-pro',
              duration: totalDuration
            });
          }

          logger.info(`[StreamService] Blog post stream completed: ${streamId}`);
        } else {
          throw new Error(result.error);
        }

        return result;

      } catch (error) {
        logger.error(`[StreamService] Blog post stream failed: ${streamId}`, error);

        // Track failure metrics
        metricsService.recordStreamEvent('failed', {
          agent: agentType,
          model: agent.model?.model || 'gemini-pro',
          error_type: error.name || 'UnknownError'
        });

        metricsService.recordLLMCall({
          model: agent.model?.model || 'gemini-pro',
          agent: agentType,
          status: 'failure'
        });

        manager.sendError(streamId, error, false);
        throw error;
      }
    },
    {
      name: 'stream_blog_post',
      tags: ['streaming', 'content', 'blog'],
      metadata: { service: 'StreamService' }
    }
  );

  /**
   * Stream itinerary generation
   * @param {string} streamId - Stream identifier
   * @param {Object} params - Generation parameters
   * @returns {Promise<Object>} Result object
   */
  streamItinerary = traceable(
    async function(streamId, params) {
      const { destination, days, budget } = params;
      const agentType = 'travel';
      const manager = this.streamingManagers[agentType];
      const agent = this.agents[agentType];

      try {
        logger.info(`[StreamService] Starting itinerary stream: ${streamId}`, { destination, days, budget });

        const result = await manager.streamWithProgress(
          streamId,
          async () => {
            // Send status updates
            manager.sendStatus(streamId, 'researching', {
              message: `Researching ${destination}...`
            });
            manager.sendProgress(streamId, 25);

            // Generate itinerary
            const itinerary = await agent.generateItinerary({
              destination,
              duration: parseInt(days),
              budget: parseFloat(budget)
            });

            manager.sendProgress(streamId, 75);
            return itinerary;
          },
          async (streamId, itinerary) => {
            // Send result
            manager.sendEvent(streamId, 'result', { itinerary });
          }
        );

        // Track completion
        const streamInfo = this.activeStreams.get(streamId);
        if (streamInfo) {
          const totalDuration = (Date.now() - streamInfo.startTime) / 1000;
          metricsService.recordStreamEvent('completed', {
            agent: agentType,
            model: agent.model?.model || 'gemini-pro',
            duration: totalDuration
          });
        }

        logger.info(`[StreamService] Itinerary stream completed: ${streamId}`);
        return result;

      } catch (error) {
        logger.error(`[StreamService] Itinerary stream failed: ${streamId}`, error);

        metricsService.recordStreamEvent('failed', {
          agent: agentType,
          model: agent.model?.model || 'gemini-pro',
          error_type: error.name || 'UnknownError'
        });

        manager.sendError(streamId, error, false);
        throw error;
      }
    },
    {
      name: 'stream_itinerary',
      tags: ['streaming', 'travel', 'itinerary'],
      metadata: { service: 'StreamService' }
    }
  );

  /**
   * Stream recommendations as JSON
   * @param {string} streamId - Stream identifier
   * @param {Object} params - Generation parameters
   * @returns {Promise<Object>} Result object
   */
  streamRecommendations = traceable(
    async function(streamId, params) {
      const { interests, budget } = params;
      const agentType = 'travel';
      const manager = this.streamingManagers[agentType];
      const agent = this.agents[agentType];

      try {
        logger.info(`[StreamService] Starting recommendations stream: ${streamId}`, { interests, budget });

        const prompt = `Generate destination recommendations in JSON format:
{
  "destinations": [
    {
      "name": "string",
      "country": "string",
      "bestFor": "string",
      "estimatedCost": number,
      "highlights": ["string"]
    }
  ]
}

User interests: ${interests}
Budget: $${budget}

Return 5 recommendations.`;

        const expectedFields = ['destinations'];

        const result = await manager.streamJSONGeneration(
          streamId,
          agent.model,
          prompt,
          expectedFields
        );

        // Track completion
        const streamInfo = this.activeStreams.get(streamId);
        if (streamInfo) {
          const totalDuration = (Date.now() - streamInfo.startTime) / 1000;
          metricsService.recordStreamEvent('completed', {
            agent: agentType,
            model: agent.model?.model || 'gemini-pro',
            duration: totalDuration
          });
        }

        logger.info(`[StreamService] Recommendations stream completed: ${streamId}`);
        return result;

      } catch (error) {
        logger.error(`[StreamService] Recommendations stream failed: ${streamId}`, error);

        metricsService.recordStreamEvent('failed', {
          agent: agentType,
          model: agent.model?.model || 'gemini-pro',
          error_type: error.name || 'UnknownError'
        });

        manager.sendError(streamId, error, false);
        throw error;
      }
    },
    {
      name: 'stream_recommendations',
      tags: ['streaming', 'travel', 'recommendations'],
      metadata: { service: 'StreamService' }
    }
  );

  /**
   * Stream social media posts
   * @param {string} streamId - Stream identifier
   * @param {Object} params - Generation parameters
   * @returns {Promise<void>}
   */
  streamSocialPosts = traceable(
    async function(streamId, params) {
      const { topic, platforms } = params;
      const agentType = 'content';
      const manager = this.streamingManagers[agentType];
      const agent = this.agents[agentType];

      try {
        logger.info(`[StreamService] Starting social posts stream: ${streamId}`, { topic, platforms });

        // Step 1: Research
        manager.sendStatus(streamId, 'researching', {
          message: 'Researching topic...'
        });
        manager.sendProgress(streamId, 10);

        await new Promise(resolve => setTimeout(resolve, 500));

        // Step 2: Generate content
        manager.sendStatus(streamId, 'generating', {
          message: 'Creating social media posts...'
        });
        manager.sendProgress(streamId, 40);

        const platformList = typeof platforms === 'string' 
          ? platforms.split(',').map(p => p.trim())
          : platforms;

        const posts = await agent.generateSocialPosts({
          topic,
          platforms: platformList
        });

        // Step 3: Send results
        manager.sendProgress(streamId, 70);

        for (let i = 0; i < posts.length; i++) {
          manager.sendEvent(streamId, 'post', {
            platform: posts[i].platform,
            content: posts[i].content,
            index: i
          });

          await new Promise(resolve => setTimeout(resolve, 200));
        }

        // Complete
        manager.sendProgress(streamId, 100);
        manager.sendComplete(streamId, {
          totalPosts: posts.length,
          platforms: posts.map(p => p.platform)
        });

        // Track completion
        const streamInfo = this.activeStreams.get(streamId);
        if (streamInfo) {
          const totalDuration = (Date.now() - streamInfo.startTime) / 1000;
          metricsService.recordStreamEvent('completed', {
            agent: agentType,
            model: agent.model?.model || 'gemini-pro',
            duration: totalDuration
          });
        }

        logger.info(`[StreamService] Social posts stream completed: ${streamId}`);

      } catch (error) {
        logger.error(`[StreamService] Social posts stream failed: ${streamId}`, error);

        metricsService.recordStreamEvent('failed', {
          agent: agentType,
          model: agent.model?.model || 'gemini-pro',
          error_type: error.name || 'UnknownError'
        });

        manager.sendError(streamId, error, false);
        throw error;
      }
    },
    {
      name: 'stream_social_posts',
      tags: ['streaming', 'content', 'social'],
      metadata: { service: 'StreamService' }
    }
  );

  /**
   * Get streaming statistics for an agent
   * @param {string} agentType - Agent type
   * @returns {Object} Statistics object
   */
  getStats(agentType) {
    const manager = this.streamingManagers[agentType];
    if (!manager) {
      throw new Error(`Unknown agent type: ${agentType}`);
    }

    return {
      agent: agentType,
      stats: manager.getStats(),
      activeStreams: manager.getActiveStreams()
    };
  }

  /**
   * Cleanup inactive streams for an agent
   * @param {string} agentType - Agent type
   * @returns {number} Number of cleaned streams
   */
  cleanupStreams(agentType) {
    const manager = this.streamingManagers[agentType];
    if (!manager) {
      throw new Error(`Unknown agent type: ${agentType}`);
    }

    return manager.cleanupStreams();
  }

  /**
   * Cleanup all inactive streams
   * @returns {Object} Cleanup results
   */
  cleanupAllStreams() {
    const results = {};
    let total = 0;

    for (const [agentType, manager] of Object.entries(this.streamingManagers)) {
      const cleaned = manager.cleanupStreams();
      results[agentType] = cleaned;
      total += cleaned;
    }

    if (total > 0) {
      logger.info(`[StreamService] Cleaned up ${total} inactive streams`, results);
    }

    return {
      success: true,
      cleaned: results,
      total
    };
  }
}

// Export singleton instance
module.exports = new StreamService();
