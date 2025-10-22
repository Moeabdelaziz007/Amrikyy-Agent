/**
 * Stream Controller
 * 
 * Handles HTTP requests for streaming endpoints.
 * Uses streamService for core streaming logic with LangSmith integration.
 * 
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-23
 * @updated 2025-10-22 (Issue #104, #107 - streamService integration)
 */

const { v4: uuidv4 } = require('uuid');
const streamService = require('../services/streamService');
const AgentStreaming = require('../utils/AgentStreaming');
const TravelAgencyAgent = require('../agents/TravelAgencyAgent');
const ContentCreatorAgent = require('../agents/ContentCreatorAgent');
const logger = require('../utils/logger');

// Initialize agents
const agentInstances = {
  travel: new TravelAgencyAgent(),
  content: new ContentCreatorAgent(),
};

// Initialize streaming managers for each agent (for stats)
const streamingManagers = {
  travel: new AgentStreaming('TravelAgent'),
  content: new AgentStreaming('ContentAgent'),
};

/**
 * Generic agent streaming handler with LangSmith integration
 * @route GET /api/stream/:agent
 * @group Streaming - Agent response streaming
 * @param {string} agent.params.required - The name of the agent to use (e.g., 'travel', 'content')
 * @param {string} prompt.query.required - The prompt to send to the agent
 * @returns {object} 200 - SSE stream
 * @returns {Error}  400 - Invalid input
 * @returns {Error}  404 - Agent not found
 * @returns {Error}  500 - Internal server error
 */
const streamAgentResponse = async (req, res) => {
  const { agent: agentName } = req.params;
  const { prompt } = req.query;

  const agent = agentInstances[agentName];

  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    // Set SSE Headers (streamService will initialize the stream)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

    // Optional: Send headers immediately
    if (res.flushHeaders) {
      res.flushHeaders();
    }

    // Use streamService for comprehensive tracking and streaming
    const { cancel, cancelled, error, result } = await streamService.streamWithSSE({
      req,
      res,
      prompt,
      model: agent.model,
      agentName: agentName.charAt(0).toUpperCase() + agentName.slice(1) + 'Agent',
      options: {},
      meta: {
        endpoint: req.path,
        method: req.method,
        userAgent: req.get('user-agent'),
      },
    });

    // Handle client disconnect - critical for resource cleanup
    req.on('close', () => {
      if (cancel && !cancelled) {
        cancel();
        logger.info(`[StreamController] Client disconnected, stream cancelled for ${agentName}`);
      }
    });

    if (error) {
      logger.error(`[StreamController] Streaming failed for agent ${agentName}: ${error}`);
    } else if (result) {
      logger.info(`[StreamController] Streaming completed for agent ${agentName}: ${result.chunks} chunks, ${result.usage?.totalTokens || 0} tokens`);
    }

  } catch (error) {
    logger.error(`[StreamController] Unhandled error for agent ${agentName}:`, error);
    
    // If headers not sent, send error response
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
};

/**
 * Get streaming statistics for a specific agent or all agents
 * @route GET /api/stream/stats/:agent?
 * @group Streaming - Agent response streaming
 * @param {string} agent.params - The name of the agent (e.g., 'travel', 'content'). If omitted, returns stats for all.
 * @returns {object} 200 - Streaming statistics
 * @returns {Error}  404 - Agent not found
 */
const getStreamingStats = (req, res) => {
    const { agent: agentName } = req.params;

    if (agentName) {
        const streamer = streamingManagers[agentName];
        if (!streamer) {
            return res.status(404).json({ error: 'Agent not found' });
        }
        return res.json({
            agent: agentName,
            ...streamer.getStats(),
            activeStreams: streamer.getActiveStreams(),
        });
    }

    // If no agent is specified, return stats for all
    const allStats = {};
    for (const [name, streamer] of Object.entries(streamingManagers)) {
        allStats[name] = {
            ...streamer.getStats(),
            activeStreams: streamer.getActiveStreams(),
        };
    }
    res.json(allStats);
};


module.exports = {
  streamAgentResponse,
  getStreamingStats,
};
