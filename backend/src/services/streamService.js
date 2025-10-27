// backend/src/services/streamService.js
const { v4: uuidv4 } = require('uuid');
const AgentStreaming = require('../utils/AgentStreaming');
const AgentLangSmith = require('../utils/AgentLangSmith');
const logger = require('../utils/logger');

// Try to import metricsService (optional dependency)
let metricsService;
try {
  metricsService = require('./metricsService');
} catch (error) {
  logger.warn('[StreamService] metricsService not available, metrics will not be tracked');
  metricsService = null;
}

/**
 * @class StreamService
 * @description Enhanced streaming with cancelation and cost protection.
 * 
 * Features:
 * - SSE streaming with proper headers
 * - Automatic cancelation on client disconnect (protects LLM costs)
 * - LangSmith tracing integration
 * - Metrics tracking
 * - Resource cleanup
 * - Error handling
 * 
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-23
 */
class StreamService {
  constructor() {
    this.activeStreams = new Map();
    this.cancelTokens = new Map(); // Track cancelation tokens
    
    // Statistics
    this.stats = {
      totalStreams: 0,
      activeStreams: 0,
      completedStreams: 0,
      canceledStreams: 0,
      failedStreams: 0,
      costSaved: 0, // Estimated cost saved by cancelation
    };
  }

  /**
   * Stream with SSE and comprehensive tracking
   *
   * @param {Object} options - Streaming options
   * @param {Object} options.req - Express request object
   * @param {Object} options.res - Express response object
   * @param {string} options.prompt - Prompt to send to the model
   * @param {Object} options.model - Gemini model instance
   * @param {string} options.agentName - Name of the agent for tracking
   * @param {Object} options.options - Additional streaming options
   * @param {Object} options.meta - Additional metadata for tracking
   * @returns {Object} - Object with cancel() function
   */
  async streamWithSSE({ req, res, prompt, model, agentName = 'UnknownAgent', options = {}, meta = {} }) {
    const streamId = uuidv4();
    const streaming = new AgentStreaming(agentName);
    const langsmith = new AgentLangSmith(agentName);

    // Start LangSmith Span
    const span = langsmith.startSpan({
      name: 'api.stream',
      operation: 'stream',
      model: model.model || 'gemini-2.0-flash-exp',
      params: { prompt: prompt.substring(0, 100) + '...' }, // Truncate for logging
      metadata: {
        ...meta,
        streamId,
        userId: req.user?.id,
        endpoint: req.path,
      },
    });

    // Track active streams metric
    if (metricsService && metricsService.activeStreams) {
      metricsService.activeStreams.inc({ agent: agentName });
    }

    // Initialize SSE stream
    streaming.initializeStream(res, streamId);

    // Track cancellation
    let cancelled = false;
    const cancelHandlers = [];

    // Handle client disconnect
    req.on('close', () => {
      if (!cancelled) {
        cancelled = true;
        logger.info(`[StreamService] Client disconnected: ${streamId}`);

        // Call all cancel handlers
        cancelHandlers.forEach(handler => {
          try {
            handler();
          } catch (error) {
            logger.error('[StreamService] Error in cancel handler:', error);
          }
        });

        // Update metrics
        if (metricsService) {
          if (metricsService.activeStreams) {
            metricsService.activeStreams.dec({ agent: agentName });
          }
          if (metricsService.streamSessionsTotal) {
            metricsService.streamSessionsTotal.inc({ agent: agentName, status: 'cancelled' });
          }
        }

        // Finish span with cancelled status
        span.finish({ cancelled: true });
      }
    });

    // Stream the response
    try {
      const result = await model.generateContentStream(prompt);
      
      let fullText = '';
      let chunkIndex = 0;
      let totalTokens = 0;

      // Process chunks
      for await (const chunk of result.stream) {
        // Check if cancelled
        if (cancelled) {
          logger.info(`[StreamService] Stream cancelled: ${streamId}`);
          break;
        }

        const chunkText = chunk.text();
        fullText += chunkText;
        
        // Estimate tokens (rough estimate: 1 token ≈ 4 characters)
        const estimatedTokens = Math.ceil(chunkText.length / 4);
        totalTokens += estimatedTokens;

        // Send chunk to client
        const chunkSent = streaming.sendChunk(streamId, chunkText, chunkIndex);
        
        if (chunkSent) {
          // Add event to LangSmith span with sampling
          // The addEvent method will handle sampling automatically
          span.addEvent('chunk', {
            chunkIndex,
            chunkSize: chunkText.length,
            tokenCount: estimatedTokens,
          });

          // Update metrics (sampled to avoid overwhelming metrics system)
          if (metricsService && metricsService.streamChunksSent && chunkIndex % 10 === 0) {
            metricsService.streamChunksSent.inc({ agent: agentName });
          }
        }

        // Send progress (estimate based on chunks)
        const progress = Math.min(95, (chunkIndex + 1) * 5);
        streaming.sendProgress(streamId, progress);
        
        chunkIndex++;
      }

      // Check if cancelled during streaming
      if (cancelled) {
        return { cancel: () => {}, cancelled: true };
      }

      // Get final response with usage info
      const response = await result.response;
      const usage = {
        promptTokens: response.usageMetadata?.promptTokenCount || 0,
        completionTokens: response.usageMetadata?.candidatesTokenCount || totalTokens,
        totalTokens: response.usageMetadata?.totalTokenCount || (response.usageMetadata?.promptTokenCount || 0) + totalTokens,
      };

      // Send completion to client
      streaming.sendComplete(streamId, {
        fullText,
        chunks: chunkIndex,
        usage,
      });

      // Update metrics
      if (metricsService) {
        if (metricsService.activeStreams) {
          metricsService.activeStreams.dec({ agent: agentName });
        }
        if (metricsService.streamSessionsTotal) {
          metricsService.streamSessionsTotal.inc({ agent: agentName, status: 'completed' });
        }
        if (metricsService.llmTokensUsed) {
          metricsService.llmTokensUsed.inc({
            model: model.model || 'gemini-2.0-flash-exp',
            agent: agentName,
            type: 'input'
          }, usage.promptTokens);
          metricsService.llmTokensUsed.inc({
            model: model.model || 'gemini-2.0-flash-exp',
            agent: agentName,
            type: 'output'
          }, usage.completionTokens);
        }
      }

      // Finish span with aggregated token count
      const aggregatedData = span.getAggregatedData();
      span.finish({
        usage,
        metadata: {
          chunks: chunkIndex,
          fullTextLength: fullText.length,
          aggregatedData,
        },
      });

      logger.info(`[StreamService] Stream completed: ${streamId} (${chunkIndex} chunks, ${usage.totalTokens} tokens)`);

      return {
        cancel: () => {
          if (!cancelled) {
            cancelled = true;
            streaming.closeStream(streamId, 'manual_cancel');
          }
        },
        cancelled: false,
        result: {
          fullText,
          chunks: chunkIndex,
          usage,
        },
      };

    } catch (error) {
      logger.error(`[StreamService] Streaming error: ${streamId}`, error);
      
      // Send error to client
      streaming.sendError(streamId, error, false);

      // Update metrics
      if (metricsService) {
        if (metricsService.activeStreams) {
          metricsService.activeStreams.dec({ agent: agentName });
        }
        if (metricsService.streamSessionsTotal) {
          metricsService.streamSessionsTotal.inc({ agent: agentName, status: 'failed' });
        }
      }

      // Finish span with error
      span.finish({
        error: error.message,
        metadata: {
          errorStack: error.stack,
        },
      });

      return {
        cancel: () => {},
        cancelled: false,
        error: error.message,
      };
    }
  }

  /**
   * Cancel function factory
   * Creates a cancel function for a stream
   *
   * @param {string} streamId - Stream ID
   * @param {Object} streaming - AgentStreaming instance
   * @param {Object} span - LangSmith span
   * @returns {Function} - Cancel function
   */
  createCancelFunction(streamId, streaming, span) {
    let cancelled = false;
    
    return () => {
      if (cancelled) {
        return;
      }
      
      cancelled = true;

      try {
        // Close the stream
        streaming.closeStream(streamId, 'cancelled');

        // Finish the span
        span.finish({ cancelled: true });

        logger.info(`[StreamService] Stream cancelled: ${streamId}`);
      } catch (error) {
        logger.error(`[StreamService] Error cancelling stream ${streamId}:`, error);
      }
    };
  }
}

// Export singleton instance
const streamService = new StreamService();

module.exports = streamService;
