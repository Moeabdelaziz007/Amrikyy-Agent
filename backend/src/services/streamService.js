/**
 * Stream Service - Enhanced streaming with cancelation and cost protection
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

const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const metricsService = require('./metricsService');
const AgentLangSmith = require('../utils/AgentLangSmith');

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
   * Initialize SSE stream with proper headers and cancelation handling
   */
  initializeStream(res, agentName, userId = 'anonymous') {
    const streamId = uuidv4();
    
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
    res.setHeader('Access-Control-Allow-Origin', '*'); // CORS for SSE
    
    // Create cancelation token
    const cancelToken = {
      canceled: false,
      reason: null,
      timestamp: null
    };
    
    // Create stream object
    const stream = {
      id: streamId,
      res,
      agentName,
      userId,
      startTime: Date.now(),
      endTime: null,
      status: 'active',
      messageCount: 0,
      chunkCount: 0,
      lastActivity: Date.now(),
      cancelToken,
      langsmith: new AgentLangSmith(agentName),
      traceId: null
    };
    
    this.activeStreams.set(streamId, stream);
    this.cancelTokens.set(streamId, cancelToken);
    this.stats.totalStreams++;
    this.stats.activeStreams++;
    
    // Record metrics
    metricsService.recordStreamStart(agentName);
    
    // Send initial connection event
    this.sendEvent(streamId, 'connected', {
      streamId,
      agent: agentName,
      timestamp: Date.now()
    });
    
    // Handle client disconnect (CRITICAL for cost protection)
    res.on('close', () => {
      this.handleClientDisconnect(streamId);
    });
    
    // Handle errors
    res.on('error', (error) => {
      logger.error(`[StreamService] Stream error ${streamId}:`, error);
      this.cancelStream(streamId, 'error');
    });
    
    logger.info(`[StreamService] Stream initialized: ${streamId} (agent: ${agentName}, user: ${userId})`);
    
    return { streamId, stream };
  }

  /**
   * Handle client disconnect - CRITICAL for LLM cost protection
   */
  handleClientDisconnect(streamId) {
    const stream = this.activeStreams.get(streamId);
    
    if (!stream) {
      return;
    }
    
    logger.info(`[StreamService] Client disconnected: ${streamId}`);
    
    // Cancel the stream immediately
    this.cancelStream(streamId, 'client_disconnect');
    
    // Estimate cost saved (if stream was in progress)
    if (stream.status === 'active' && stream.chunkCount > 0) {
      // Rough estimate: $0.001 per chunk (adjust based on your model)
      const estimatedCostSaved = stream.chunkCount * 0.001;
      this.stats.costSaved += estimatedCostSaved;
      
      logger.info(`[StreamService] Estimated cost saved by cancelation: $${estimatedCostSaved.toFixed(4)}`);
    }
  }

  /**
   * Cancel stream (sets cancelation flag)
   */
  cancelStream(streamId, reason = 'manual') {
    const cancelToken = this.cancelTokens.get(streamId);
    
    if (cancelToken && !cancelToken.canceled) {
      cancelToken.canceled = true;
      cancelToken.reason = reason;
      cancelToken.timestamp = Date.now();
      
      logger.info(`[StreamService] Stream canceled: ${streamId} (reason: ${reason})`);
      
      // Close the stream
      this.closeStream(streamId, reason);
    }
  }

  /**
   * Check if stream is canceled
   */
  isCanceled(streamId) {
    const cancelToken = this.cancelTokens.get(streamId);
    return cancelToken ? cancelToken.canceled : true;
  }

  /**
   * Send event to client
   */
  sendEvent(streamId, event, data) {
    const stream = this.activeStreams.get(streamId);
    
    if (!stream || stream.status !== 'active') {
      return false;
    }
    
    // Check if canceled
    if (this.isCanceled(streamId)) {
      logger.debug(`[StreamService] Cannot send to canceled stream: ${streamId}`);
      return false;
    }
    
    try {
      // Format SSE message
      const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
      
      stream.res.write(message);
      stream.messageCount++;
      stream.lastActivity = Date.now();
      
      return true;
      
    } catch (error) {
      logger.error(`[StreamService] Error sending event to ${streamId}:`, error);
      this.cancelStream(streamId, 'send_error');
      return false;
    }
  }

  /**
   * Send chunk with cancelation check
   */
  sendChunk(streamId, chunk, metadata = {}) {
    const stream = this.activeStreams.get(streamId);
    
    if (!stream) {
      return false;
    }
    
    // Check cancelation before sending
    if (this.isCanceled(streamId)) {
      logger.debug(`[StreamService] Chunk send aborted - stream canceled: ${streamId}`);
      return false;
    }
    
    const sent = this.sendEvent(streamId, 'chunk', {
      chunk,
      index: stream.chunkCount,
      ...metadata,
      timestamp: Date.now()
    });
    
    if (sent) {
      stream.chunkCount++;
      metricsService.recordStreamChunk(stream.agentName);
    }
    
    return sent;
  }

  /**
   * Send progress update
   */
  sendProgress(streamId, progress, message = '') {
    return this.sendEvent(streamId, 'progress', {
      progress: Math.min(100, Math.max(0, progress)),
      message,
      timestamp: Date.now()
    });
  }

  /**
   * Send status update
   */
  sendStatus(streamId, status, details = {}) {
    return this.sendEvent(streamId, 'status', {
      status,
      ...details,
      timestamp: Date.now()
    });
  }

  /**
   * Send error
   */
  sendError(streamId, error, recoverable = false) {
    const success = this.sendEvent(streamId, 'error', {
      error: error.message || error,
      recoverable,
      timestamp: Date.now()
    });
    
    if (!recoverable) {
      this.cancelStream(streamId, 'error');
    }
    
    return success;
  }

  /**
   * Send completion
   */
  sendComplete(streamId, result = {}) {
    const success = this.sendEvent(streamId, 'complete', {
      ...result,
      timestamp: Date.now()
    });
    
    this.closeStream(streamId, 'complete');
    
    return success;
  }

  /**
   * Stream Gemini response with cancelation support
   */
  async streamGeminiResponse(streamId, geminiModel, prompt, options = {}) {
    const stream = this.activeStreams.get(streamId);
    
    if (!stream) {
      throw new Error('Stream not found');
    }
    
    const modelName = options.modelName || geminiModel.model || 'gemini-2.0-flash-exp';
    
    // Start LangSmith trace
    const traceId = stream.langsmith.startTrace('stream_response', {
      prompt,
      model: modelName,
      streamId
    }, modelName);
    
    stream.traceId = traceId;
    
    try {
      this.sendStatus(streamId, 'generating', { 
        message: 'Starting generation...',
        model: modelName
      });
      
      // Generate content stream
      const result = await geminiModel.generateContentStream(prompt);
      
      let fullText = '';
      let chunkIndex = 0;
      let inputTokens = 0;
      let outputTokens = 0;
      
      // Stream each chunk with cancelation checks
      for await (const chunk of result.stream) {
        // CRITICAL: Check cancelation before processing each chunk
        if (this.isCanceled(streamId)) {
          logger.info(`[StreamService] Stream canceled during generation: ${streamId}`);
          
          // End trace with cancelation
          stream.langsmith.endTrace(traceId, {
            success: false,
            canceled: true,
            partialText: fullText,
            chunksProcessed: chunkIndex
          });
          
          return {
            success: false,
            canceled: true,
            partialText: fullText,
            chunks: chunkIndex
          };
        }
        
        const chunkText = chunk.text();
        fullText += chunkText;
        
        // Send chunk to client
        const sent = this.sendChunk(streamId, chunkText, {
          chunkIndex,
          totalLength: fullText.length
        });
        
        // If send failed, stream is closed
        if (!sent) {
          break;
        }
        
        // Send progress (estimate based on chunks)
        const progress = Math.min(95, (chunkIndex + 1) * 5);
        this.sendProgress(streamId, progress);
        
        chunkIndex++;
      }
      
      // Get final response with usage info
      const response = await result.response;
      
      inputTokens = response.usageMetadata?.promptTokenCount || 0;
      outputTokens = response.usageMetadata?.candidatesTokenCount || 0;
      const totalTokens = response.usageMetadata?.totalTokenCount || 0;
      
      // Calculate cost (example pricing for Gemini 2.0 Flash)
      const cost = (inputTokens * 0.00000) + (outputTokens * 0.00000); // Free during preview
      
      // End LangSmith trace
      stream.langsmith.endTrace(traceId, {
        success: true,
        text: fullText,
        chunks: chunkIndex,
        tokens: {
          input: inputTokens,
          output: outputTokens,
          total: totalTokens
        },
        cost
      });
      
      // Record LLM metrics
      const duration = (Date.now() - stream.startTime) / 1000;
      metricsService.recordLLMCall(
        modelName,
        stream.agentName,
        'success',
        duration,
        inputTokens,
        outputTokens,
        cost
      );
      
      // Send completion
      this.sendComplete(streamId, {
        fullText,
        chunks: chunkIndex,
        usage: {
          promptTokens: inputTokens,
          completionTokens: outputTokens,
          totalTokens
        },
        cost,
        duration
      });
      
      return {
        success: true,
        text: fullText,
        chunks: chunkIndex,
        tokens: { input: inputTokens, output: outputTokens, total: totalTokens },
        cost
      };
      
    } catch (error) {
      logger.error(`[StreamService] Gemini streaming error:`, error);
      
      // End trace with error
      if (stream.traceId) {
        stream.langsmith.endTrace(stream.traceId, {
          success: false,
          error: error.message
        });
      }
      
      // Record failed LLM call
      const duration = (Date.now() - stream.startTime) / 1000;
      metricsService.recordLLMCall(
        modelName,
        stream.agentName,
        'failed',
        duration,
        0,
        0,
        0
      );
      
      this.sendError(streamId, error, false);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Close stream and cleanup resources
   */
  closeStream(streamId, reason = 'unknown') {
    const stream = this.activeStreams.get(streamId);
    
    if (!stream) {
      return;
    }
    
    // Update stream status
    stream.status = 'closed';
    stream.endTime = Date.now();
    const duration = (stream.endTime - stream.startTime) / 1000;
    
    // Update statistics
    this.stats.activeStreams--;
    
    if (reason === 'complete') {
      this.stats.completedStreams++;
      metricsService.recordStreamComplete(stream.agentName, duration);
    } else if (reason === 'error') {
      this.stats.failedStreams++;
      metricsService.recordStreamFailed(stream.agentName, duration);
    } else {
      this.stats.canceledStreams++;
    }
    
    // Send final close event
    try {
      const message = `event: close\ndata: ${JSON.stringify({
        streamId,
        reason,
        duration,
        messageCount: stream.messageCount,
        chunkCount: stream.chunkCount
      })}\n\n`;
      
      stream.res.write(message);
      stream.res.end();
    } catch (error) {
      // Client already disconnected
    }
    
    // Cleanup
    this.activeStreams.delete(streamId);
    this.cancelTokens.delete(streamId);
    
    logger.info(`[StreamService] Stream closed: ${streamId} (${reason}, ${duration.toFixed(2)}s, ${stream.chunkCount} chunks)`);
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      ...this.stats,
      successRate: this.stats.totalStreams > 0
        ? ((this.stats.completedStreams / this.stats.totalStreams) * 100).toFixed(2) + '%'
        : '0%',
      cancelationRate: this.stats.totalStreams > 0
        ? ((this.stats.canceledStreams / this.stats.totalStreams) * 100).toFixed(2) + '%'
        : '0%',
      costSaved: `$${this.stats.costSaved.toFixed(4)}`
    };
  }

  /**
   * Get active stream IDs
   */
  getActiveStreams() {
    return Array.from(this.activeStreams.keys());
  }

  /**
   * Check if stream is active
   */
  isStreamActive(streamId) {
    const stream = this.activeStreams.get(streamId);
    return stream && stream.status === 'active' && !this.isCanceled(streamId);
  }

  /**
   * Cleanup inactive streams (run periodically)
   */
  cleanupStreams(maxAge = 300000) { // 5 minutes default
    const now = Date.now();
    let cleaned = 0;
    
    for (const [streamId, stream] of this.activeStreams.entries()) {
      const age = now - stream.lastActivity;
      
      if (age > maxAge) {
        logger.warn(`[StreamService] Cleaning up stale stream: ${streamId} (age: ${(age / 1000).toFixed(0)}s)`);
        this.cancelStream(streamId, 'timeout');
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      logger.info(`[StreamService] Cleaned up ${cleaned} stale streams`);
    }
    
    return cleaned;
  }
}

// Export singleton instance
const streamService = new StreamService();

// Start cleanup interval (every 2 minutes)
setInterval(() => {
  streamService.cleanupStreams();
}, 120000);

module.exports = streamService;
