/**
 * Stream Service
 * Handles Server-Sent Events (SSE) streaming with LangSmith tracing and metrics
 * 
 * Features:
 * - SSE streaming integration with AgentStreaming
 * - LangSmith distributed tracing
 * - Prometheus metrics tracking
 * - Client disconnect handling
 * - Resource cleanup
 * 
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-23
 */

const { v4: uuidv4 } = require('uuid');
const AgentStreaming = require('../utils/AgentStreaming');
const { wrapLLMCall } = require('../utils/langsmith_helpers');
const metricsService = require('./metricsService');
const logger = require('../utils/logger');

class StreamService {
  constructor() {
    this.activeStreams = new Map();
  }

  /**
   * Stream with SSE (Server-Sent Events)
   * @param {Object} params - Streaming parameters
   * @param {Request} params.req - Express request
   * @param {Response} params.res - Express response
   * @param {string} params.prompt - User prompt
   * @param {Object} params.model - Gemini model instance
   * @param {Object} params.options - Streaming options
   * @param {Object} params.meta - Metadata (userId, agentName, etc.)
   * @returns {Object} { cancel: Function }
   */
  async streamWithSSE({ req, res, prompt, model, options = {}, meta = {} }) {
    const streamId = uuidv4();
    const agentName = meta.agentName || 'unknown';
    const userId = meta.userId || req.user?.id || 'anonymous';
    const startTime = Date.now();

    // Initialize SSE streaming
    const streamer = new AgentStreaming(agentName);
    streamer.initializeStream(res, streamId);

    // Track active stream
    this.activeStreams.set(streamId, {
      streamId,
      userId,
      agentName,
      startTime,
      streamer,
      cancelled: false
    });

    // Update metrics - stream started
    metricsService.recordStreamStart(agentName);

    // Create cancel function for cleanup
    let cancelled = false;
    const cancel = () => {
      if (cancelled) return;
      cancelled = true;

      const streamInfo = this.activeStreams.get(streamId);
      if (streamInfo) {
        streamInfo.cancelled = true;
        const duration = (Date.now() - startTime) / 1000;
        
        // Close the stream
        streamer.closeStream(streamId, 'cancelled');
        
        // Update metrics
        metricsService.recordStreamFailed(agentName, duration);
        
        // Remove from active streams
        this.activeStreams.delete(streamId);
        
        logger.info(`[StreamService] Stream ${streamId} cancelled after ${duration.toFixed(2)}s`);
      }
    };

    // Handle client disconnect
    req.on('close', () => {
      if (!cancelled) {
        logger.info(`[StreamService] Client disconnected for stream ${streamId}`);
        cancel();
      }
    });

    // Start streaming asynchronously
    this._executeStream({
      streamId,
      streamer,
      prompt,
      model,
      agentName,
      startTime,
      cancel,
      options
    }).catch(error => {
      logger.error(`[StreamService] Stream execution error:`, error);
    });

    // Return cancel function
    return { cancel };
  }

  /**
   * Execute the actual streaming
   * @private
   */
  async _executeStream({ streamId, streamer, prompt, model, agentName, startTime, cancel, options }) {
    try {
      // Wrap the Gemini call with LangSmith tracing
      const modelName = model.model || 'gemini-2.0-flash-exp';
      const tracedGenerate = wrapLLMCall(
        async () => {
          return await model.generateContentStream(prompt);
        },
        modelName
      );

      // Send status update
      streamer.sendStatus(streamId, 'generating', { 
        message: 'Starting generation...', 
        model: modelName 
      });

      // Execute traced function
      const result = await tracedGenerate();

      let fullText = '';
      let chunkIndex = 0;

      // Stream each chunk
      for await (const chunk of result.stream) {
        // Check if cancelled
        const streamInfo = this.activeStreams.get(streamId);
        if (!streamInfo || streamInfo.cancelled) {
          logger.info(`[StreamService] Stream ${streamId} was cancelled, stopping iteration`);
          break;
        }

        const chunkText = chunk.text();
        fullText += chunkText;

        // Send chunk to client
        streamer.sendChunk(streamId, chunkText, chunkIndex);

        // Track metrics - chunk sent
        metricsService.recordStreamChunk(agentName);

        // Send progress estimate
        const progress = Math.min(95, (chunkIndex + 1) * 10);
        streamer.sendProgress(streamId, progress);

        chunkIndex++;
      }

      // Check if completed or cancelled
      const streamInfo = this.activeStreams.get(streamId);
      if (!streamInfo || streamInfo.cancelled) {
        return; // Already handled by cancel()
      }

      // Get final response with usage info
      const response = await result.response;
      const duration = (Date.now() - startTime) / 1000;

      // Send completion
      streamer.sendComplete(streamId, {
        fullText,
        chunks: chunkIndex,
        usage: {
          promptTokens: response.usageMetadata?.promptTokenCount || 0,
          completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: response.usageMetadata?.totalTokenCount || 0
        }
      });

      // Update metrics - stream completed
      metricsService.recordStreamComplete(agentName, duration);

      // Track LLM metrics
      metricsService.recordLLMCall(
        modelName,
        agentName,
        'success',
        duration,
        response.usageMetadata?.promptTokenCount || 0,
        response.usageMetadata?.candidatesTokenCount || 0,
        0 // cost calculation can be added later
      );

      // Clean up
      this.activeStreams.delete(streamId);

      logger.info(`[StreamService] Stream ${streamId} completed successfully in ${duration.toFixed(2)}s`);

    } catch (error) {
      const streamInfo = this.activeStreams.get(streamId);
      if (streamInfo && !streamInfo.cancelled) {
        const duration = (Date.now() - startTime) / 1000;

        logger.error(`[StreamService] Stream ${streamId} failed:`, error);

        // Send error to client
        streamer.sendError(streamId, error, false);

        // Update metrics - stream failed
        metricsService.recordStreamFailed(agentName, duration);

        // Clean up
        this.activeStreams.delete(streamId);
      }
    }
  }

  /**
   * Get active stream count
   */
  getActiveStreamCount() {
    return this.activeStreams.size;
  }

  /**
   * Get active streams info
   */
  getActiveStreams() {
    const streams = [];
    for (const [streamId, info] of this.activeStreams.entries()) {
      streams.push({
        streamId,
        agentName: info.agentName,
        userId: info.userId,
        duration: Date.now() - info.startTime
      });
    }
    return streams;
  }

  /**
   * Cancel all active streams
   */
  cancelAllStreams() {
    const count = this.activeStreams.size;
    for (const streamId of this.activeStreams.keys()) {
      const streamInfo = this.activeStreams.get(streamId);
      if (streamInfo && streamInfo.streamer) {
        streamInfo.streamer.closeStream(streamId, 'service_shutdown');
      }
    }
    this.activeStreams.clear();
    logger.info(`[StreamService] Cancelled ${count} active streams`);
    return count;
  }
}

// Export singleton instance
const streamService = new StreamService();

module.exports = streamService;
