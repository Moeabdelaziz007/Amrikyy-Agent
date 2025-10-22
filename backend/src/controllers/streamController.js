/**
 * Stream Controller
 * 
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-23
 */

const { v4: uuidv4 } = require('uuid');
const AgentStreaming = require('../utils/AgentStreaming');
const TravelAgencyAgent = require('../agents/TravelAgencyAgent');
const ContentCreatorAgent = require('../agents/ContentCreatorAgent');
const logger = require('../utils/logger');

// Initialize agents
const agentInstances = {
  travel: new TravelAgencyAgent(),
  content: new ContentCreatorAgent(),
};

// Initialize streaming managers for each agent
const streamingManagers = {
  travel: new AgentStreaming('TravelAgent'),
  content: new AgentStreaming('ContentAgent'),
};

/**
 * Generic agent streaming handler
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
  const streamId = uuidv4();

  const agent = agentInstances[agentName];
  const streamer = streamingManagers[agentName];

  if (!agent || !streamer) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    // Initialize SSE stream
    streamer.initializeStream(res, streamId);

    // Use the agent's model to stream the response
    const result = await streamer.streamGeminiResponse(
      streamId,
      agent.model,
      prompt
    );

    if (!result.success) {
      // The error is already sent to the stream, but we log it here
      logger.error(`[StreamController] Streaming failed for agent ${agentName} (stream ${streamId}): ${result.error}`);
    }
  } catch (error) {
    logger.error(`[StreamController] Unhandled error for agent ${agentName} (stream ${streamId}):`, error);
    // If the stream is still active, send an error. Otherwise, it's already closed.
    if (streamer.isStreamActive(streamId)) {
      streamer.sendError(streamId, error, false);
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
