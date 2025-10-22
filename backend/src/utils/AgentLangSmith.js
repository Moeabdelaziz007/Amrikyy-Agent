/**
 * Agent LangSmith Integration - Performance tracking and observability
 * Tracks Gemini API calls, costs, latency, and agent performance
 *
 * Features:
 * - API call tracing with timing
 * - Cost tracking per agent/operation
 * - Token usage monitoring
 * - Performance analytics
 * - Export to LangSmith (optional)
 * - Event sampling and aggregation for high-frequency events
 * - PII redaction for secure logging
 *
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-22
 * @updated 2025-10-22 (Issue #107 - Sampling & Aggregation)
 */

const logger = require('./logger');

class AgentLangSmith {
  constructor(agentName) {
    this.agentName = agentName;

    // Pricing configuration (Gemini pricing as of 2025)
    this.pricing = {
      'gemini-2.0-flash-exp': {
        inputPer1M: 0, // Free during preview
        outputPer1M: 0,
      },
      'gemini-2.5-pro': {
        inputPer1M: 0, // Free with Student Pack
        outputPer1M: 0,
      },
      'gemini-1.5-pro': {
        inputPer1M: 3.5,
        outputPer1M: 10.5,
      },
      'gemini-1.5-flash': {
        inputPer1M: 0.075,
        outputPer1M: 0.3,
      },
    };

    // Tracing configuration
    this.config = {
      enabled: true,
      logToConsole: process.env.NODE_ENV === 'development',
      exportToLangSmith: !!process.env.LANGSMITH_API_KEY,
      maxTraces: 1000, // Keep last 1000 traces in memory
      // Sampling configuration for high-frequency events
      sampling: {
        enabled: process.env.LANGSMITH_SAMPLING_ENABLED !== 'false',
        chunkSampleRate: parseInt(process.env.LANGSMITH_CHUNK_SAMPLE_RATE) || 10, // Sample every Nth chunk
        tokenSampleRate: parseInt(process.env.LANGSMITH_TOKEN_SAMPLE_RATE) || 10,
        progressSampleRate: parseInt(process.env.LANGSMITH_PROGRESS_SAMPLE_RATE) || 5,
      },
      // PII redaction patterns
      redaction: {
        enabled: process.env.LANGSMITH_REDACT_PII !== 'false',
        patterns: [
          { name: 'email', regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, replace: '[EMAIL_REDACTED]' },
          { name: 'phone', regex: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, replace: '[PHONE_REDACTED]' },
          { name: 'ssn', regex: /\b\d{3}-\d{2}-\d{4}\b/g, replace: '[SSN_REDACTED]' },
          { name: 'credit_card', regex: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, replace: '[CARD_REDACTED]' },
          { name: 'api_key', regex: /\b[A-Za-z0-9_-]{32,}\b/g, replace: '[API_KEY_REDACTED]' },
        ],
      },
    };

    // Traces storage
    this.traces = [];

    // Spans storage (for span-based tracking)
    this.spans = new Map();

    // Event aggregation storage (per span)
    this.eventAggregations = new Map();

    // Aggregated statistics
    this.stats = {
      totalCalls: 0,
      totalTokens: {
        input: 0,
        output: 0,
      },
      totalCost: 0,
      totalLatency: 0,
      byModel: {},
      byOperation: {},
      errors: 0,
      // Sampling statistics
      sampling: {
        totalEvents: 0,
        sampledEvents: 0,
        aggregatedEvents: 0,
      },
    };
  }

  /**
   * Start a span for tracking an operation
   * @param {Object} options - Span options
   * @param {string} options.name - Span name (e.g., 'api.stream', 'api.workflow')
   * @param {string} options.operation - Operation type
   * @param {string} options.model - Model name
   * @param {Object} options.params - Additional parameters
   * @param {Object} options.metadata - Additional metadata
   * @returns {Object} - Span object with methods to manage the span
   */
  startSpan(options = {}) {
    const {
      name,
      operation = 'unknown',
      model = 'gemini-2.0-flash-exp',
      params = {},
      metadata = {},
    } = options;

    const spanId = `${this.agentName}_${operation}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const span = {
      spanId,
      name: name || operation,
      agent: this.agentName,
      operation,
      model,
      params,
      startTime: Date.now(),
      endTime: null,
      latency: null,
      tokens: {
        input: 0,
        output: 0,
        total: 0,
      },
      cost: 0,
      success: null,
      error: null,
      metadata,
      events: [],
    };

    // Initialize event aggregation for this span
    this.eventAggregations.set(spanId, {
      chunk: { count: 0, sampledCount: 0, totalTokens: 0, lastSampled: 0 },
      token: { count: 0, sampledCount: 0, totalTokens: 0, lastSampled: 0 },
      progress: { count: 0, sampledCount: 0, lastSampled: 0 },
    });

    this.spans.set(spanId, span);

    if (this.config.logToConsole) {
      logger.debug(`[LangSmith] Span started: ${spanId} (${name})`);
    }

    // Return span object with helper methods
    return {
      spanId,
      span,
      addEvent: (eventName, payload) => this.addEvent(span, eventName, payload),
      addRedactedEvent: (eventName, payload) => this.addRedactedEvent(span, eventName, payload),
      finish: (result = {}) => this.finishSpan(spanId, result),
      getAggregatedData: () => this.getAggregatedData(spanId),
    };
  }

  /**
   * Add an event to a span with sampling and aggregation logic
   * @param {Object} span - The span object
   * @param {string} eventName - Event name (e.g., 'chunk', 'token', 'progress', 'status')
   * @param {Object} payload - Event payload
   * @returns {Object} - Aggregated data for this event type
   */
  addEvent(span, eventName, payload = {}) {
    if (!this.config.enabled) {
      return null;
    }

    const aggregation = this.eventAggregations.get(span.spanId);
    if (!aggregation) {
      logger.warn(`[LangSmith] No aggregation found for span: ${span.spanId}`);
      return null;
    }

    this.stats.sampling.totalEvents++;

    // Check if this is a high-frequency event that should be sampled
    const highFrequencyEvents = ['chunk', 'token', 'progress'];
    const isHighFrequency = highFrequencyEvents.includes(eventName);

    let shouldSample = !isHighFrequency; // Always log non-high-frequency events
    let eventAgg = null;

    if (isHighFrequency && this.config.sampling.enabled) {
      // Apply sampling logic based on event type
      const sampleRate = this.config.sampling[`${eventName}SampleRate`] || 10;
      
      if (aggregation[eventName]) {
        eventAgg = aggregation[eventName];
        eventAgg.count++;

        // Update aggregated data based on event type
        if (eventName === 'chunk' || eventName === 'token') {
          // Extract token count from payload
          const tokenCount = payload.tokenCount || payload.tokens || 
                           (payload.chunk ? payload.chunk.length / 4 : 0); // Rough estimate
          eventAgg.totalTokens += tokenCount;
        }

        // Determine if we should sample this event
        shouldSample = (eventAgg.count % sampleRate) === 0;
        
        if (shouldSample) {
          eventAgg.sampledCount++;
          eventAgg.lastSampled = eventAgg.count;
        } else {
          this.stats.sampling.aggregatedEvents++;
        }
      }
    }

    // Log the event if we should sample it
    if (shouldSample) {
      const event = {
        name: eventName,
        timestamp: Date.now(),
        payload,
      };

      span.events.push(event);
      this.stats.sampling.sampledEvents++;

      // Export to LangSmith if enabled
      if (this.config.exportToLangSmith) {
        this.logEvent(span.spanId, eventName, payload);
      }

      if (this.config.logToConsole && eventName !== 'chunk' && eventName !== 'token') {
        logger.debug(`[LangSmith] Event logged: ${eventName} (span: ${span.spanId})`);
      }
    }

    // Return aggregated data for this event type
    return eventAgg || { count: 1, sampledCount: shouldSample ? 1 : 0 };
  }

  /**
   * Add a redacted event to strip PII/secrets before logging
   * @param {Object} span - The span object
   * @param {string} eventName - Event name
   * @param {Object} payload - Event payload (will be redacted)
   * @returns {Object} - Aggregated data for this event type
   */
  addRedactedEvent(span, eventName, payload = {}) {
    if (!this.config.redaction.enabled) {
      return this.addEvent(span, eventName, payload);
    }

    // Deep clone the payload to avoid modifying the original
    const redactedPayload = JSON.parse(JSON.stringify(payload));

    // Recursively redact sensitive data
    this.redactSensitiveData(redactedPayload);

    return this.addEvent(span, eventName, redactedPayload);
  }

  /**
   * Recursively redact sensitive data from an object
   * @param {Object} obj - Object to redact
   * @returns {Object} - Redacted object
   */
  redactSensitiveData(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        // Apply redaction patterns
        let redactedValue = value;
        for (const pattern of this.config.redaction.patterns) {
          redactedValue = redactedValue.replace(pattern.regex, pattern.replace);
        }
        obj[key] = redactedValue;
      } else if (typeof value === 'object' && value !== null) {
        // Recursively redact nested objects
        this.redactSensitiveData(value);
      }
    }

    return obj;
  }

  /**
   * Get aggregated data for a span
   * @param {string} spanId - Span ID
   * @returns {Object} - Aggregated event data
   */
  getAggregatedData(spanId) {
    const aggregation = this.eventAggregations.get(spanId);
    if (!aggregation) {
      return null;
    }

    return {
      chunk: {
        totalCount: aggregation.chunk.count,
        sampledCount: aggregation.chunk.sampledCount,
        totalTokens: aggregation.chunk.totalTokens,
        samplingRate: aggregation.chunk.count > 0 
          ? (aggregation.chunk.sampledCount / aggregation.chunk.count * 100).toFixed(2) + '%'
          : '0%',
      },
      token: {
        totalCount: aggregation.token.count,
        sampledCount: aggregation.token.sampledCount,
        totalTokens: aggregation.token.totalTokens,
        samplingRate: aggregation.token.count > 0
          ? (aggregation.token.sampledCount / aggregation.token.count * 100).toFixed(2) + '%'
          : '0%',
      },
      progress: {
        totalCount: aggregation.progress.count,
        sampledCount: aggregation.progress.sampledCount,
        samplingRate: aggregation.progress.count > 0
          ? (aggregation.progress.sampledCount / aggregation.progress.count * 100).toFixed(2) + '%'
          : '0%',
      },
    };
  }

  /**
   * Finish a span and record results
   * @param {string} spanId - Span ID
   * @param {Object} result - Result data
   * @returns {Object} - Completed span
   */
  finishSpan(spanId, result = {}) {
    const span = this.spans.get(spanId);
    if (!span) {
      logger.warn(`[LangSmith] Span not found: ${spanId}`);
      return null;
    }

    // Calculate timing
    span.endTime = Date.now();
    span.latency = span.endTime - span.startTime;

    // Get aggregated data
    const aggregatedData = this.getAggregatedData(spanId);

    // Extract tokens from result or use aggregated data
    if (result.usage) {
      span.tokens.input = result.usage.promptTokens || 0;
      span.tokens.output = result.usage.completionTokens || 0;
      span.tokens.total = result.usage.totalTokens || span.tokens.input + span.tokens.output;
    } else if (aggregatedData) {
      // Use aggregated token count from chunks/tokens
      span.tokens.total = aggregatedData.chunk.totalTokens + aggregatedData.token.totalTokens;
      span.tokens.output = span.tokens.total; // Assume all aggregated tokens are output
    }

    // Calculate cost
    span.cost = this.calculateCost(span.model, span.tokens.input, span.tokens.output);

    // Record success/error
    span.success = !result.error && !result.cancelled;
    span.error = result.error || null;

    // Store metadata (including aggregated data)
    span.metadata = {
      ...span.metadata,
      ...(result.metadata || {}),
      aggregatedEvents: aggregatedData,
      cancelled: result.cancelled || false,
    };

    // Convert to trace format for storage
    const trace = { ...span, traceId: spanId };
    this.traces.push(trace);

    // Limit trace history
    if (this.traces.length > this.config.maxTraces) {
      this.traces.shift();
    }

    // Update statistics
    this.updateStats(trace);

    // Export to LangSmith if enabled
    if (this.config.exportToLangSmith) {
      this.exportTrace(trace);
    }

    // Clean up
    this.spans.delete(spanId);
    this.eventAggregations.delete(spanId);

    if (this.config.logToConsole) {
      logger.debug(
        `[LangSmith] Span finished: ${spanId} (${span.latency}ms, ${span.tokens.total} tokens, $${span.cost.toFixed(4)})`
      );
    }

    return span;
  }

  /**
   * Log an event to LangSmith (placeholder for actual LangSmith SDK integration)
   * @param {string} spanId - Span ID
   * @param {string} eventName - Event name
   * @param {Object} payload - Event payload
   */
  async logEvent(spanId, eventName, payload) {
    try {
      // Note: This would require actual LangSmith SDK integration
      // For now, we log to console in debug mode
      if (process.env.LANGSMITH_API_KEY) {
        logger.debug('[LangSmith] Log event:', {
          spanId,
          eventName,
          payload: typeof payload === 'object' ? JSON.stringify(payload).substring(0, 100) : payload,
        });
      }
    } catch (error) {
      logger.error('[LangSmith] Event logging error:', error);
    }
  }

  /**
   * Start tracing an agent operation (legacy method, maintained for backwards compatibility)
   */
  startTrace(operation, params = {}, model = 'gemini-2.0-flash-exp') {
    const traceId = `${this.agentName}_${operation}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const trace = {
      traceId,
      agent: this.agentName,
      operation,
      model,
      params,
      startTime: Date.now(),
      endTime: null,
      latency: null,
      tokens: {
        input: 0,
        output: 0,
        total: 0,
      },
      cost: 0,
      success: null,
      error: null,
      metadata: {},
    };

    this.traces.push(trace);

    // Limit trace history
    if (this.traces.length > this.config.maxTraces) {
      this.traces.shift();
    }

    if (this.config.logToConsole) {
      logger.debug(`[LangSmith] Trace started: ${traceId}`);
    }

    return traceId;
  }

  /**
   * End tracing and record results
   */
  endTrace(traceId, result = {}) {
    const trace = this.traces.find((t) => t.traceId === traceId);

    if (!trace) {
      logger.warn(`[LangSmith] Trace not found: ${traceId}`);
      return;
    }

    // Calculate timing
    trace.endTime = Date.now();
    trace.latency = trace.endTime - trace.startTime;

    // Extract tokens from result
    if (result.usage) {
      trace.tokens.input = result.usage.promptTokens || 0;
      trace.tokens.output = result.usage.completionTokens || 0;
      trace.tokens.total = result.usage.totalTokens || trace.tokens.input + trace.tokens.output;
    }

    // Calculate cost
    trace.cost = this.calculateCost(trace.model, trace.tokens.input, trace.tokens.output);

    // Record success/error
    trace.success = !result.error;
    trace.error = result.error || null;

    // Store metadata
    trace.metadata = result.metadata || {};

    // Update statistics
    this.updateStats(trace);

    // Export to LangSmith if enabled
    if (this.config.exportToLangSmith) {
      this.exportTrace(trace);
    }

    if (this.config.logToConsole) {
      logger.debug(
        `[LangSmith] Trace ended: ${traceId} (${trace.latency}ms, ${trace.tokens.total} tokens, $${trace.cost.toFixed(4)})`
      );
    }

    return trace;
  }

  /**
   * Trace a complete operation (wrapper)
   */
  async trace(operation, params, model, fn) {
    const traceId = this.startTrace(operation, params, model);

    try {
      const result = await fn();

      this.endTrace(traceId, {
        usage: result.usage,
        metadata: result.metadata,
      });

      return result;
    } catch (error) {
      this.endTrace(traceId, {
        error: error.message,
        metadata: { stack: error.stack },
      });

      throw error;
    }
  }

  /**
   * Calculate cost for API call
   */
  calculateCost(model, inputTokens, outputTokens) {
    const pricing = this.pricing[model] || this.pricing['gemini-2.0-flash-exp'];

    const inputCost = (inputTokens / 1000000) * pricing.inputPer1M;
    const outputCost = (outputTokens / 1000000) * pricing.outputPer1M;

    return inputCost + outputCost;
  }

  /**
   * Update aggregated statistics
   */
  updateStats(trace) {
    this.stats.totalCalls++;
    this.stats.totalTokens.input += trace.tokens.input;
    this.stats.totalTokens.output += trace.tokens.output;
    this.stats.totalCost += trace.cost;
    this.stats.totalLatency += trace.latency;

    if (!trace.success) {
      this.stats.errors++;
    }

    // By model
    if (!this.stats.byModel[trace.model]) {
      this.stats.byModel[trace.model] = {
        calls: 0,
        tokens: { input: 0, output: 0 },
        cost: 0,
        latency: 0,
        errors: 0,
      };
    }

    const modelStats = this.stats.byModel[trace.model];
    modelStats.calls++;
    modelStats.tokens.input += trace.tokens.input;
    modelStats.tokens.output += trace.tokens.output;
    modelStats.cost += trace.cost;
    modelStats.latency += trace.latency;
    if (!trace.success) {
      modelStats.errors++;
    }

    // By operation
    if (!this.stats.byOperation[trace.operation]) {
      this.stats.byOperation[trace.operation] = {
        calls: 0,
        tokens: { input: 0, output: 0 },
        cost: 0,
        latency: 0,
        errors: 0,
      };
    }

    const opStats = this.stats.byOperation[trace.operation];
    opStats.calls++;
    opStats.tokens.input += trace.tokens.input;
    opStats.tokens.output += trace.tokens.output;
    opStats.cost += trace.cost;
    opStats.latency += trace.latency;
    if (!trace.success) {
      opStats.errors++;
    }
  }

  /**
   * Export trace to LangSmith
   */
  async exportTrace(trace) {
    try {
      // Note: This would require LangSmith SDK installation
      // For now, we log to console
      if (process.env.LANGSMITH_API_KEY) {
        logger.debug('[LangSmith] Export trace:', {
          traceId: trace.traceId,
          agent: trace.agent,
          operation: trace.operation,
          latency: trace.latency,
          cost: trace.cost,
        });
      }
    } catch (error) {
      logger.error('[LangSmith] Export error:', error);
    }
  }

  /**
   * Get all statistics (including sampling stats)
   */
  getStats() {
    const avgLatency =
      this.stats.totalCalls > 0 ? Math.round(this.stats.totalLatency / this.stats.totalCalls) : 0;

    const successRate =
      this.stats.totalCalls > 0
        ? (((this.stats.totalCalls - this.stats.errors) / this.stats.totalCalls) * 100).toFixed(2)
        : 100;

    const samplingEfficiency = this.stats.sampling.totalEvents > 0
      ? ((this.stats.sampling.aggregatedEvents / this.stats.sampling.totalEvents) * 100).toFixed(2)
      : 0;

    return {
      agent: this.agentName,
      totalCalls: this.stats.totalCalls,
      totalTokens: this.stats.totalTokens,
      totalCost: this.stats.totalCost.toFixed(4),
      avgLatency: `${avgLatency}ms`,
      successRate: `${successRate}%`,
      errors: this.stats.errors,
      sampling: {
        enabled: this.config.sampling.enabled,
        totalEvents: this.stats.sampling.totalEvents,
        sampledEvents: this.stats.sampling.sampledEvents,
        aggregatedEvents: this.stats.sampling.aggregatedEvents,
        efficiency: `${samplingEfficiency}%`, // Percentage of events that were aggregated (not logged)
        rates: {
          chunk: this.config.sampling.chunkSampleRate,
          token: this.config.sampling.tokenSampleRate,
          progress: this.config.sampling.progressSampleRate,
        },
      },
      byModel: this.formatModelStats(),
      byOperation: this.formatOperationStats(),
    };
  }

  /**
   * Format model statistics
   */
  formatModelStats() {
    const formatted = {};

    for (const [model, stats] of Object.entries(this.stats.byModel)) {
      const avgLatency = stats.calls > 0 ? Math.round(stats.latency / stats.calls) : 0;

      formatted[model] = {
        calls: stats.calls,
        tokens: stats.tokens,
        cost: stats.cost.toFixed(4),
        avgLatency: `${avgLatency}ms`,
        errors: stats.errors,
      };
    }

    return formatted;
  }

  /**
   * Format operation statistics
   */
  formatOperationStats() {
    const formatted = {};

    for (const [operation, stats] of Object.entries(this.stats.byOperation)) {
      const avgLatency = stats.calls > 0 ? Math.round(stats.latency / stats.calls) : 0;

      const avgTokens =
        stats.calls > 0 ? Math.round((stats.tokens.input + stats.tokens.output) / stats.calls) : 0;

      formatted[operation] = {
        calls: stats.calls,
        avgTokens,
        cost: stats.cost.toFixed(4),
        avgLatency: `${avgLatency}ms`,
        errors: stats.errors,
      };
    }

    return formatted;
  }

  /**
   * Get recent traces
   */
  getRecentTraces(limit = 10) {
    return this.traces
      .slice(-limit)
      .reverse()
      .map((trace) => ({
        traceId: trace.traceId,
        operation: trace.operation,
        latency: `${trace.latency}ms`,
        tokens: trace.tokens.total,
        cost: trace.cost.toFixed(4),
        success: trace.success,
        timestamp: new Date(trace.startTime).toISOString(),
      }));
  }

  /**
   * Get cost breakdown
   */
  getCostBreakdown() {
    return {
      agent: this.agentName,
      total: this.stats.totalCost.toFixed(4),
      byModel: Object.entries(this.stats.byModel).map(([model, stats]) => ({
        model,
        cost: stats.cost.toFixed(4),
        percentage: ((stats.cost / this.stats.totalCost) * 100).toFixed(2) + '%',
      })),
      byOperation: Object.entries(this.stats.byOperation).map(([operation, stats]) => ({
        operation,
        cost: stats.cost.toFixed(4),
        percentage: ((stats.cost / this.stats.totalCost) * 100).toFixed(2) + '%',
      })),
    };
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    const avgLatency =
      this.stats.totalCalls > 0 ? Math.round(this.stats.totalLatency / this.stats.totalCalls) : 0;

    const avgTokensPerCall =
      this.stats.totalCalls > 0
        ? Math.round(
            (this.stats.totalTokens.input + this.stats.totalTokens.output) / this.stats.totalCalls
          )
        : 0;

    const avgCostPerCall =
      this.stats.totalCalls > 0 ? (this.stats.totalCost / this.stats.totalCalls).toFixed(4) : 0;

    return {
      agent: this.agentName,
      avgLatency: `${avgLatency}ms`,
      avgTokensPerCall,
      avgCostPerCall: `$${avgCostPerCall}`,
      successRate: `${(((this.stats.totalCalls - this.stats.errors) / this.stats.totalCalls) * 100).toFixed(2)}%`,
      callsPerMinute: this.calculateCallsPerMinute(),
      tokensPerMinute: this.calculateTokensPerMinute(),
    };
  }

  /**
   * Calculate calls per minute
   */
  calculateCallsPerMinute() {
    if (this.traces.length < 2) {
      return 0;
    }

    const firstTrace = this.traces[0];
    const lastTrace = this.traces[this.traces.length - 1];
    const minutes = (lastTrace.startTime - firstTrace.startTime) / 60000;

    return minutes > 0 ? Math.round(this.traces.length / minutes) : 0;
  }

  /**
   * Calculate tokens per minute
   */
  calculateTokensPerMinute() {
    if (this.traces.length < 2) {
      return 0;
    }

    const firstTrace = this.traces[0];
    const lastTrace = this.traces[this.traces.length - 1];
    const minutes = (lastTrace.startTime - firstTrace.startTime) / 60000;
    const totalTokens = this.stats.totalTokens.input + this.stats.totalTokens.output;

    return minutes > 0 ? Math.round(totalTokens / minutes) : 0;
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.traces = [];
    this.spans.clear();
    this.eventAggregations.clear();
    this.stats = {
      totalCalls: 0,
      totalTokens: { input: 0, output: 0 },
      totalCost: 0,
      totalLatency: 0,
      byModel: {},
      byOperation: {},
      errors: 0,
      sampling: {
        totalEvents: 0,
        sampledEvents: 0,
        aggregatedEvents: 0,
      },
    };

    logger.info(`[LangSmith] Statistics reset for ${this.agentName}`);
  }

  /**
   * Export statistics to JSON
   */
  exportStats() {
    return {
      agent: this.agentName,
      timestamp: new Date().toISOString(),
      stats: this.getStats(),
      cost: this.getCostBreakdown(),
      performance: this.getPerformanceMetrics(),
      recentTraces: this.getRecentTraces(20),
    };
  }
}

module.exports = AgentLangSmith;
