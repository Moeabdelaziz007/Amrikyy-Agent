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
 *
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-22
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
    };

    // Traces storage
    this.traces = [];

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
    };
  }

  /**
   * Start tracing an agent operation
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
   * Get all statistics
   */
  getStats() {
    const avgLatency =
      this.stats.totalCalls > 0 ? Math.round(this.stats.totalLatency / this.stats.totalCalls) : 0;

    const successRate =
      this.stats.totalCalls > 0
        ? (((this.stats.totalCalls - this.stats.errors) / this.stats.totalCalls) * 100).toFixed(2)
        : 100;

    return {
      agent: this.agentName,
      totalCalls: this.stats.totalCalls,
      totalTokens: this.stats.totalTokens,
      totalCost: this.stats.totalCost.toFixed(4),
      avgLatency: `${avgLatency}ms`,
      successRate: `${successRate}%`,
      errors: this.stats.errors,
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
    this.stats = {
      totalCalls: 0,
      totalTokens: { input: 0, output: 0 },
      totalCost: 0,
      totalLatency: 0,
      byModel: {},
      byOperation: {},
      errors: 0,
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
