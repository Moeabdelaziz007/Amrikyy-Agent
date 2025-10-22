/**
 * Agent Streaming - Server-Sent Events (SSE) support for real-time responses
 * Enables streaming for long-form content generation
 * 
 * Features:
 * - Server-Sent Events (SSE) for real-time streaming
 * - Token-by-token output for better UX
 * - Progress tracking and status updates
 * - Automatic error handling and recovery
 * - Client connection management
 * 
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-22
 */

const logger = require('./logger');

class AgentStreaming {
  constructor(agentName) {
    this.agentName = agentName;
    this.activeStreams = new Map();
    
    // Statistics
    this.stats = {
      totalStreams: 0,
      activeStreams: 0,
      completedStreams: 0,
      failedStreams: 0,
      avgDuration: 0,
      totalDuration: 0
    };
  }

  /**
   * Initialize SSE stream
   */
  initializeStream(res, streamId) {
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
    
    // Create stream object
    const stream = {
      id: streamId,
      res,
      startTime: Date.now(),
      endTime: null,
      status: 'active',
      messageCount: 0,
      lastMessage: null
    };
    
    this.activeStreams.set(streamId, stream);
    this.stats.totalStreams++;
    this.stats.activeStreams++;
    
    // Send initial connection message
    this.sendEvent(streamId, 'connected', {
      streamId,
      agent: this.agentName,
      timestamp: Date.now()
    });
    
    // Handle client disconnect
    res.on('close', () => {
      this.closeStream(streamId, 'client_disconnect');
    });
    
    logger.debug(`[Streaming] Stream initialized: ${streamId}`);
    
    return stream;
  }

  /**
   * Send event to client
   */
  sendEvent(streamId, event, data) {
    const stream = this.activeStreams.get(streamId);
    
    if (!stream || stream.status !== 'active') {
      logger.warn(`[Streaming] Cannot send to inactive stream: ${streamId}`);
      return false;
    }
    
    try {
      // Format SSE message
      const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
      
      stream.res.write(message);
      stream.messageCount++;
      stream.lastMessage = Date.now();
      
      return true;
      
    } catch (error) {
      logger.error(`[Streaming] Error sending event to ${streamId}:`, error);
      this.closeStream(streamId, 'error');
      return false;
    }
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
   * Send token (for streaming text generation)
   */
  sendToken(streamId, token, metadata = {}) {
    return this.sendEvent(streamId, 'token', {
      token,
      ...metadata,
      timestamp: Date.now()
    });
  }

  /**
   * Send chunk (for streaming content)
   */
  sendChunk(streamId, chunk, chunkIndex = 0) {
    return this.sendEvent(streamId, 'chunk', {
      chunk,
      index: chunkIndex,
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
      this.closeStream(streamId, 'error');
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
   * Close stream
   */
  closeStream(streamId, reason = 'unknown') {
    const stream = this.activeStreams.get(streamId);
    
    if (!stream) {
      return;
    }
    
    // Update stream status
    stream.status = 'closed';
    stream.endTime = Date.now();
    const duration = stream.endTime - stream.startTime;
    
    // Update statistics
    this.stats.activeStreams--;
    this.stats.totalDuration += duration;
    this.stats.avgDuration = Math.round(this.stats.totalDuration / this.stats.totalStreams);
    
    if (reason === 'complete') {
      this.stats.completedStreams++;
    } else if (reason === 'error') {
      this.stats.failedStreams++;
    }
    
    // Send final event
    try {
      const message = `event: close\ndata: ${JSON.stringify({
        streamId,
        reason,
        duration,
        messageCount: stream.messageCount
      })}\n\n`;
      
      stream.res.write(message);
      stream.res.end();
    } catch (error) {
      // Client already disconnected
    }
    
    // Remove from active streams
    this.activeStreams.delete(streamId);
    
    logger.debug(`[Streaming] Stream closed: ${streamId} (${reason}, ${duration}ms)`);
  }

  /**
   * Stream Gemini response
   */
  async streamGeminiResponse(streamId, geminiModel, prompt, options = {}) {
    try {
      this.sendStatus(streamId, 'generating', { message: 'Starting generation...' });
      
      // Use Gemini's streaming API
      const result = await geminiModel.generateContentStream(prompt);
      
      let fullText = '';
      let chunkIndex = 0;
      
      // Stream each chunk
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
        
        // Send chunk to client
        this.sendChunk(streamId, chunkText, chunkIndex);
        
        // Send progress (estimate based on chunks)
        const progress = Math.min(95, (chunkIndex + 1) * 10);
        this.sendProgress(streamId, progress);
        
        chunkIndex++;
      }
      
      // Get final response with usage info
      const response = await result.response;
      
      // Send completion
      this.sendComplete(streamId, {
        fullText,
        chunks: chunkIndex,
        usage: {
          promptTokens: response.usageMetadata?.promptTokenCount || 0,
          completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: response.usageMetadata?.totalTokenCount || 0
        }
      });
      
      return {
        success: true,
        text: fullText,
        chunks: chunkIndex
      };
      
    } catch (error) {
      logger.error(`[Streaming] Gemini streaming error:`, error);
      this.sendError(streamId, error, false);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Stream with progress simulation (for non-streaming APIs)
   */
  async streamWithProgress(streamId, operation, progressCallback) {
    try {
      // Send initial status
      this.sendStatus(streamId, 'starting', { operation });
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        const stream = this.activeStreams.get(streamId);
        if (!stream || stream.status !== 'active') {
          clearInterval(progressInterval);
          return;
        }
        
        // Random progress increase (more realistic feel)
        const currentProgress = Math.random() * 20 + 10;
        this.sendProgress(streamId, currentProgress);
      }, 500);
      
      // Execute operation
      const result = await operation();
      
      // Clear progress updates
      clearInterval(progressInterval);
      
      // Send final progress
      this.sendProgress(streamId, 100, 'Complete');
      
      // Send result
      if (progressCallback) {
        await progressCallback(streamId, result);
      }
      
      this.sendComplete(streamId, result);
      
      return result;
      
    } catch (error) {
      logger.error(`[Streaming] Operation error:`, error);
      this.sendError(streamId, error, false);
      throw error;
    }
  }

  /**
   * Stream JSON generation with incremental updates
   */
  async streamJSONGeneration(streamId, geminiModel, prompt, expectedFields = []) {
    try {
      this.sendStatus(streamId, 'generating', { 
        message: 'Generating structured data...',
        expectedFields 
      });
      
      // Stream response
      const result = await geminiModel.generateContentStream(prompt);
      
      let fullText = '';
      let partialJSON = {};
      
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
        
        // Try to parse partial JSON
        try {
          // Extract JSON from markdown if present
          const jsonMatch = fullText.match(/```json\n([\s\S]*?)\n```/);
          const jsonText = jsonMatch ? jsonMatch[1] : fullText;
          
          partialJSON = JSON.parse(jsonText);
          
          // Send partial result
          this.sendEvent(streamId, 'partial', {
            data: partialJSON,
            complete: expectedFields.every(field => field in partialJSON)
          });
          
        } catch (e) {
          // JSON not complete yet, continue
        }
        
        this.sendChunk(streamId, chunkText);
      }
      
      // Final parse
      const response = await result.response;
      const finalText = response.text();
      
      // Parse final JSON
      const jsonMatch = finalText.match(/```json\n([\s\S]*?)\n```/);
      const finalJSON = JSON.parse(jsonMatch ? jsonMatch[1] : finalText);
      
      this.sendComplete(streamId, {
        data: finalJSON,
        usage: {
          promptTokens: response.usageMetadata?.promptTokenCount || 0,
          completionTokens: response.usageMetadata?.candidatesTokenCount || 0
        }
      });
      
      return {
        success: true,
        data: finalJSON
      };
      
    } catch (error) {
      logger.error(`[Streaming] JSON streaming error:`, error);
      this.sendError(streamId, error, false);
      
      return {
        success: false,
        error: error.message
      };
    }
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
      avgDuration: `${this.stats.avgDuration}ms`
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
    return stream && stream.status === 'active';
  }

  /**
   * Cleanup inactive streams
   */
  cleanupStreams(maxAge = 300000) { // 5 minutes default
    const now = Date.now();
    let cleaned = 0;
    
    for (const [streamId, stream] of this.activeStreams.entries()) {
      const age = now - (stream.lastMessage || stream.startTime);
      
      if (age > maxAge) {
        this.closeStream(streamId, 'timeout');
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      logger.info(`[Streaming] Cleaned up ${cleaned} inactive streams`);
    }
    
    return cleaned;
  }
}

module.exports = AgentStreaming;
