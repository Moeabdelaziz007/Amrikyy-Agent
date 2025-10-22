/**
 * Stream Service - Core Logic for Server-Sent Events (SSE) Streaming
 * 
 * This service provides the core streaming functionality with:
 * - LangSmith tracing for observability
 * - Metrics tracking for monitoring
 * - Proper resource cleanup
 * - Cancellation support
 * 
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-22
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const AgentLangSmith = require('../utils/AgentLangSmith');
const metricsService = require('./metricsService');
const logger = require('../utils/logger');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Stream with Server-Sent Events
 * @param {object} params - Streaming parameters
 * @param {object} params.req - Express request object
 * @param {object} params.res - Express response object
 * @param {string} params.prompt - The prompt to send to the model
 * @param {string} params.model - The Gemini model to use (default: 'gemini-2.0-flash-exp')
 * @param {object} params.options - Additional generation options
 * @param {object} params.meta - Metadata for tracking (agent name, etc.)
 * @returns {object} An object with a cancel function
 */
async function streamWithSSE({ req, res, prompt, model = 'gemini-2.0-flash-exp', options = {}, meta = {} }) {
  const agent = meta.agent || 'unknown';
  const startTime = Date.now();
  let isCancelled = false;
  let traceId = null;

  // Initialize LangSmith tracing
  const langSmith = new AgentLangSmith(agent);
  traceId = langSmith.startTrace('api.stream', {
    prompt: prompt.substring(0, 100) + '...',
    model,
    options,
  }, model);

  // Track stream start in metrics
  metricsService.recordStreamEvent('started', { agent, model });

  try {
    // Get Gemini model
    const geminiModel = genAI.getGenerativeModel({
      model,
      generationConfig: {
        temperature: options.temperature || 0.7,
        topP: options.topP || 0.95,
        topK: options.topK || 40,
        maxOutputTokens: options.maxOutputTokens || 2048,
      },
    });

    // Start streaming
    const result = await geminiModel.generateContentStream(prompt);

    let fullText = '';
    let chunkCount = 0;
    let inputTokens = 0;
    let outputTokens = 0;

    // Stream each chunk
    for await (const chunk of result.stream) {
      // Check if cancelled
      if (isCancelled) {
        logger.info(`[StreamService] Stream cancelled for agent ${agent}`);
        break;
      }

      const chunkText = chunk.text();
      fullText += chunkText;
      chunkCount++;

      // Send chunk to client via SSE
      const sseData = JSON.stringify({ chunk: chunkText, index: chunkCount });
      res.write(`data: ${sseData}\n\n`);

      // Track chunk in metrics
      metricsService.increment('stream_chunks_sent', { agent, model });
    }

    // Get final response with usage metadata
    const response = await result.response;
    const usageMetadata = response.usageMetadata;

    if (usageMetadata) {
      inputTokens = usageMetadata.promptTokenCount || 0;
      outputTokens = usageMetadata.candidatesTokenCount || 0;
    }

    if (isCancelled) {
      // Handle cancellation
      const duration = (Date.now() - startTime) / 1000;
      
      metricsService.recordStreamEvent('cancelled', {
        agent,
        model,
        reason: 'client_disconnect',
        duration,
      });

      langSmith.endTrace(traceId, {
        usage: { promptTokens: inputTokens, completionTokens: outputTokens },
        metadata: { cancelled: true, chunks: chunkCount },
      });

      res.end();
    } else {
      // Send completion event
      const completionData = JSON.stringify({
        complete: true,
        totalChunks: chunkCount,
        fullText,
        usage: {
          promptTokens: inputTokens,
          completionTokens: outputTokens,
          totalTokens: inputTokens + outputTokens,
        },
      });
      res.write(`data: ${completionData}\n\n`);
      res.end();

      // Track completion in metrics
      const duration = (Date.now() - startTime) / 1000;
      metricsService.recordStreamEvent('completed', {
        agent,
        model,
        duration,
      });

      // End LangSmith trace
      langSmith.endTrace(traceId, {
        usage: {
          promptTokens: inputTokens,
          completionTokens: outputTokens,
          totalTokens: inputTokens + outputTokens,
        },
        metadata: {
          chunks: chunkCount,
          duration: duration,
        },
      });

      logger.info(`[StreamService] Stream completed for agent ${agent} (${chunkCount} chunks, ${duration}s)`);
    }
  } catch (error) {
    logger.error(`[StreamService] Stream error for agent ${agent}:`, error);

    const duration = (Date.now() - startTime) / 1000;

    // Send error to client
    if (!res.headersSent) {
      const errorData = JSON.stringify({
        error: error.message || 'Streaming error',
        recoverable: false,
      });
      res.write(`data: ${errorData}\n\n`);
    }
    res.end();

    // Track failure in metrics
    metricsService.recordStreamEvent('failed', {
      agent,
      model,
      error_type: error.code || 'unknown',
      duration,
    });

    // End trace with error
    langSmith.endTrace(traceId, {
      error: error.message,
      metadata: { stack: error.stack },
    });

    throw error;
  }

  // Return cancel function
  return {
    cancel: () => {
      isCancelled = true;
      logger.info(`[StreamService] Cancellation requested for agent ${agent}`);
    },
  };
}

module.exports = {
  streamWithSSE,
};
