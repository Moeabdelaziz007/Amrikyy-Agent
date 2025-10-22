/**
 * Stream Controller - HTTP Handling for SSE Streaming
 * 
 * This controller handles HTTP requests for streaming and ensures:
 * - Proper SSE headers
 * - Client disconnect handling
 * - Resource cleanup
 * 
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-22
 */

const streamService = require('../services/streamService');
const logger = require('../utils/logger');

/**
 * Start a new streaming session
 * @route POST /api/stream
 * @group Streaming - Server-Sent Events
 * @param {string} prompt.body.required - The prompt to send to the model
 * @param {string} model.body - The Gemini model to use (optional, defaults to gemini-2.0-flash-exp)
 * @param {object} options.body - Additional generation options (optional)
 * @param {string} agent.body - Agent name for tracking (optional, defaults to 'api')
 * @returns {object} 200 - SSE stream
 * @returns {Error}  400 - Invalid input
 * @returns {Error}  500 - Internal server error
 */
const startStream = async (req, res) => {
  const { prompt, model, options = {}, agent = 'api' } = req.body;

  // Validate input
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

    // Flush headers immediately
    if (res.flushHeaders) {
      res.flushHeaders();
    }

    logger.info(`[StreamController] Starting stream for agent ${agent}`);

    // Start streaming
    const stream = await streamService.streamWithSSE({
      req,
      res,
      prompt,
      model,
      options,
      meta: { agent },
    });

    // CRITICAL: Handle client disconnect
    req.on('close', () => {
      logger.info(`[StreamController] Client disconnected, cancelling stream for agent ${agent}`);
      if (stream && stream.cancel) {
        stream.cancel();
      }
    });

    // Handle request errors
    req.on('error', (error) => {
      logger.error(`[StreamController] Request error for agent ${agent}:`, error);
      if (stream && stream.cancel) {
        stream.cancel();
      }
    });
  } catch (error) {
    logger.error(`[StreamController] Error starting stream:`, error);

    // Only send error if headers haven't been sent yet
    if (!res.headersSent) {
      return res.status(500).json({
        error: 'Failed to start stream',
        message: error.message,
      });
    }
  }
};

module.exports = {
  startStream,
};
