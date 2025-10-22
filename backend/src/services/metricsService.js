/**
 * Prometheus Metrics Service
 * Exposes system metrics in Prometheus format + JSON
 * 
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-22
 */

const client = require('prom-client');

/**
 * Metrics registry
 */
const register = new client.Registry();

// Add default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

/**
 * Custom metrics
 */

// API Request Counter
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register]
});

// API Request Duration
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  registers: [register]
});

// Streaming Metrics
const streamSessionsTotal = new client.Counter({
  name: 'stream_sessions_total',
  help: 'Total number of streaming sessions',
  labelNames: ['agent', 'status'],
  registers: [register]
});

const streamChunksSent = new client.Counter({
  name: 'stream_chunks_sent_total',
  help: 'Total number of chunks sent via streaming',
  labelNames: ['agent'],
  registers: [register]
});

const streamSessionDuration = new client.Histogram({
  name: 'stream_session_duration_seconds',
  help: 'Streaming session duration in seconds',
  labelNames: ['agent', 'status'],
  buckets: [1, 5, 10, 30, 60, 120],
  registers: [register]
});

const activeStreams = new client.Gauge({
  name: 'stream_sessions_active',
  help: 'Number of currently active streaming sessions',
  labelNames: ['agent'],
  registers: [register]
});

// LLM API Metrics
const llmCallsTotal = new client.Counter({
  name: 'llm_calls_total',
  help: 'Total number of LLM API calls',
  labelNames: ['model', 'agent', 'status'],
  registers: [register]
});

const llmTokensUsed = new client.Counter({
  name: 'llm_tokens_used_total',
  help: 'Total number of tokens used',
  labelNames: ['model', 'agent', 'type'],
  registers: [register]
});

const llmCostDollars = new client.Counter({
  name: 'llm_cost_dollars_total',
  help: 'Total cost in USD for LLM calls',
  labelNames: ['model', 'agent'],
  registers: [register]
});

const llmCallDuration = new client.Histogram({
  name: 'llm_call_duration_seconds',
  help: 'LLM API call duration in seconds',
  labelNames: ['model', 'agent', 'status'],
  buckets: [0.5, 1, 2, 5, 10, 30],
  registers: [register]
});

// Agent Metrics
const agentExecutionsTotal = new client.Counter({
  name: 'agent_executions_total',
  help: 'Total number of agent executions',
  labelNames: ['agent', 'operation', 'status'],
  registers: [register]
});

const agentExecutionDuration = new client.Histogram({
  name: 'agent_execution_duration_seconds',
  help: 'Agent execution duration in seconds',
  labelNames: ['agent', 'operation', 'status'],
  buckets: [0.5, 1, 2, 5, 10, 30, 60],
  registers: [register]
});

// Cache Metrics
const cacheOperationsTotal = new client.Counter({
  name: 'cache_operations_total',
  help: 'Total number of cache operations',
  labelNames: ['operation', 'status'],
  registers: [register]
});

const cacheHitRate = new client.Gauge({
  name: 'cache_hit_rate',
  help: 'Cache hit rate (0-1)',
  registers: [register]
});

// Coordinator Metrics
const coordinatorWorkflowsTotal = new client.Counter({
  name: 'coordinator_workflows_total',
  help: 'Total number of coordinator workflows',
  labelNames: ['strategy', 'status'],
  registers: [register]
});

const coordinatorWorkflowDuration = new client.Histogram({
  name: 'coordinator_workflow_duration_seconds',
  help: 'Coordinator workflow duration in seconds',
  labelNames: ['strategy', 'status'],
  buckets: [1, 5, 10, 30, 60, 120, 300],
  registers: [register]
});

// Rate Limiting Metrics
const rateLimitHits = new client.Counter({
  name: 'rate_limit_hits_total',
  help: 'Total number of rate limit hits',
  labelNames: ['agent', 'operation'],
  registers: [register]
});

// Authentication Metrics
const authAttemptsTotal = new client.Counter({
  name: 'auth_attempts_total',
  help: 'Total number of authentication attempts',
  labelNames: ['method', 'status'],
  registers: [register]
});

/**
 * Metrics Service
 */
class MetricsService {
  constructor() {
    this.contentType = register.contentType;
  }

  /**
   * Expose Prometheus metrics
   */
  async exposePrometheus() {
    return await register.metrics();
  }

  /**
   * Get JSON snapshot of metrics
   */
  async snapshot() {
    const metrics = await register.getMetricsAsJSON();
    return {
      timestamp: new Date().toISOString(),
      metrics
    };
  }

  /**
   * Record HTTP request
   */
  recordHttpRequest(method, route, status, duration) {
    httpRequestsTotal.inc({ method, route, status });
    httpRequestDuration.observe({ method, route, status }, duration);
  }

  /**
   * Record streaming session
   */
  recordStreamStart(agent) {
    streamSessionsTotal.inc({ agent, status: 'started' });
    activeStreams.inc({ agent });
  }

  recordStreamComplete(agent, duration) {
    streamSessionsTotal.inc({ agent, status: 'completed' });
    streamSessionDuration.observe({ agent, status: 'completed' }, duration);
    activeStreams.dec({ agent });
  }

  recordStreamFailed(agent, duration) {
    streamSessionsTotal.inc({ agent, status: 'failed' });
    streamSessionDuration.observe({ agent, status: 'failed' }, duration);
    activeStreams.dec({ agent });
  }

  recordStreamChunk(agent) {
    streamChunksSent.inc({ agent });
  }

  /**
   * Record LLM call
   */
  recordLLMCall(model, agent, status, duration, inputTokens, outputTokens, cost) {
    llmCallsTotal.inc({ model, agent, status });
    llmCallDuration.observe({ model, agent, status }, duration);
    
    if (inputTokens) {
      llmTokensUsed.inc({ model, agent, type: 'input' }, inputTokens);
    }
    if (outputTokens) {
      llmTokensUsed.inc({ model, agent, type: 'output' }, outputTokens);
    }
    if (cost) {
      llmCostDollars.inc({ model, agent }, cost);
    }
  }

  /**
   * Record agent execution
   */
  recordAgentExecution(agent, operation, status, duration) {
    agentExecutionsTotal.inc({ agent, operation, status });
    agentExecutionDuration.observe({ agent, operation, status }, duration);
  }

  /**
   * Record cache operation
   */
  recordCacheOperation(operation, status) {
    cacheOperationsTotal.inc({ operation, status });
  }

  updateCacheHitRate(rate) {
    cacheHitRate.set(rate);
  }

  /**
   * Record coordinator workflow
   */
  recordCoordinatorWorkflow(strategy, status, duration) {
    coordinatorWorkflowsTotal.inc({ strategy, status });
    coordinatorWorkflowDuration.observe({ strategy, status }, duration);
  }

  /**
   * Record rate limit hit
   */
  recordRateLimitHit(agent, operation) {
    rateLimitHits.inc({ agent, operation });
  }

  /**
   * Record authentication attempt
   */
  recordAuthAttempt(method, status) {
    authAttemptsTotal.inc({ method, status });
  }

  /**
   * Reset all metrics
   */
  reset() {
    register.resetMetrics();
  }

  /**
   * Get specific metric
   */
  getMetric(name) {
    return register.getSingleMetric(name);
  }

  /**
   * Middleware for automatic request tracking
   */
  middleware() {
    return (req, res, next) => {
      const start = Date.now();
      
      // Capture response
      res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        const route = req.route?.path || req.path;
        this.recordHttpRequest(req.method, route, res.statusCode, duration);
      });
      
      next();
    };
  }
}

// Export singleton instance
const metricsService = new MetricsService();

module.exports = metricsService;
