const client = require('prom-client');
const logger = require('../utils/logger');

/**
 * @fileoverview Enhanced Metrics Service for Prometheus
 *
 * This service centralizes the management of Prometheus metrics for:
 * - Stream sessions (SSE)
 * - LLM API calls
 * - Multi-agent workflows
 * - API requests
 * - Cache operations
 * - Rate limiting
 *
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-22
 * @phase 2
 */

class MetricsService {
  constructor() {
    this.register = new client.Registry();
    this.collectDefaultMetrics = client.collectDefaultMetrics;
    
    // Collect default Node.js metrics (CPU, memory, etc.)
    this.collectDefaultMetrics({ 
      register: this.register,
      prefix: 'amrikyy_',
    });

    this.defineMetrics();
    
    logger.info('[MetricsService] Initialized with Prometheus registry');
  }

  /**
   * Defines all custom metrics for the application
   */
  defineMetrics() {
    this.metrics = {
      // ==========================================
      // STREAMING METRICS
      // ==========================================
      
      stream_chunks_sent: new client.Counter({
        name: 'amrikyy_stream_chunks_sent_total',
        help: 'Total number of stream chunks sent to clients',
        labelNames: ['agent', 'model'],
        registers: [this.register],
      }),
      
      stream_sessions_completed: new client.Counter({
        name: 'amrikyy_stream_sessions_completed_total',
        help: 'Total number of completed stream sessions',
        labelNames: ['agent', 'model'],
        registers: [this.register],
      }),
      
      stream_sessions_failed: new client.Counter({
        name: 'amrikyy_stream_sessions_failed_total',
        help: 'Total number of failed stream sessions',
        labelNames: ['agent', 'model', 'error_type'],
        registers: [this.register],
      }),
      
      stream_sessions_cancelled: new client.Counter({
        name: 'amrikyy_stream_sessions_cancelled_total',
        help: 'Total number of cancelled stream sessions',
        labelNames: ['agent', 'reason'],
        registers: [this.register],
      }),
      
      stream_duration_seconds: new client.Histogram({
        name: 'amrikyy_stream_duration_seconds',
        help: 'Duration of stream sessions in seconds',
        labelNames: ['agent', 'model', 'status'],
        buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60],
        registers: [this.register],
      }),
      
      active_streams: new client.Gauge({
        name: 'amrikyy_active_streams',
        help: 'Number of currently active stream sessions',
        labelNames: ['agent'],
        registers: [this.register],
      }),
      
      // ==========================================
      // LLM CALL METRICS
      // ==========================================
      
      llm_calls_total: new client.Counter({
        name: 'amrikyy_llm_calls_total',
        help: 'Total number of calls to LLM APIs',
        labelNames: ['model', 'status', 'agent'],
        registers: [this.register],
      }),
      
      llm_call_duration_seconds: new client.Histogram({
        name: 'amrikyy_llm_call_duration_seconds',
        help: 'Duration of LLM API calls in seconds',
        labelNames: ['model', 'agent'],
        buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
        registers: [this.register],
      }),
      
      llm_tokens_used: new client.Counter({
        name: 'amrikyy_llm_tokens_used_total',
        help: 'Total number of tokens used in LLM calls',
        labelNames: ['model', 'agent', 'token_type'], // token_type: input, output
        registers: [this.register],
      }),
      
      llm_cost_usd: new client.Counter({
        name: 'amrikyy_llm_cost_usd_total',
        help: 'Total estimated cost of LLM calls in USD',
        labelNames: ['model', 'agent'],
        registers: [this.register],
      }),
      
      // ==========================================
      // API REQUEST METRICS
      // ==========================================
      
      api_requests_total: new client.Counter({
        name: 'amrikyy_api_requests_total',
        help: 'Total number of API requests',
        labelNames: ['method', 'route', 'status_code'],
        registers: [this.register],
      }),
      
      api_request_duration_seconds: new client.Histogram({
        name: 'amrikyy_api_request_duration_seconds',
        help: 'Duration of API requests in seconds',
        labelNames: ['method', 'route', 'status_code'],
        buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
        registers: [this.register],
      }),
      
      // ==========================================
      // WORKFLOW METRICS
      // ==========================================
      
      workflow_executions_total: new client.Counter({
        name: 'amrikyy_workflow_executions_total',
        help: 'Total number of multi-agent workflow executions',
        labelNames: ['workflow_name', 'strategy', 'status'],
        registers: [this.register],
      }),
      
      workflow_duration_seconds: new client.Histogram({
        name: 'amrikyy_workflow_duration_seconds',
        help: 'Duration of workflow executions in seconds',
        labelNames: ['workflow_name', 'strategy'],
        buckets: [0.5, 1, 2, 5, 10, 30, 60],
        registers: [this.register],
      }),
      
      active_workflows: new client.Gauge({
        name: 'amrikyy_active_workflows',
        help: 'Number of currently active workflows',
        labelNames: ['strategy'],
        registers: [this.register],
      }),
      
      // ==========================================
      // CACHE METRICS
      // ==========================================
      
      cache_operations_total: new client.Counter({
        name: 'amrikyy_cache_operations_total',
        help: 'Total number of cache operations',
        labelNames: ['operation', 'status'], // operation: get, set, delete, clear
        registers: [this.register],
      }),
      
      cache_hit_rate: new client.Gauge({
        name: 'amrikyy_cache_hit_rate',
        help: 'Cache hit rate (0-1)',
        registers: [this.register],
      }),
      
      // ==========================================
      // RATE LIMITING METRICS
      // ==========================================
      
      rate_limit_hits_total: new client.Counter({
        name: 'amrikyy_rate_limit_hits_total',
        help: 'Total number of rate limit hits (429 responses)',
        labelNames: ['route', 'api_key_prefix'],
        registers: [this.register],
      }),
      
      // ==========================================
      // AUTHENTICATION METRICS
      // ==========================================
      
      auth_attempts_total: new client.Counter({
        name: 'amrikyy_auth_attempts_total',
        help: 'Total number of authentication attempts',
        labelNames: ['method', 'status'], // method: api_key, jwt; status: success, failure
        registers: [this.register],
      }),
    };
    
    logger.info('[MetricsService] Defined 20 custom metrics');
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  /**
   * Increments a counter metric
   * @param {string} name - Metric name (without prefix)
   * @param {object} [labels={}] - Metric labels
   * @param {number} [value=1] - Increment value
   */
  increment(name, labels = {}, value = 1) {
    try {
      if (this.metrics[name]) {
        this.metrics[name].inc(labels, value);
      } else {
        logger.warn(`[MetricsService] Metric not found: ${name}`);
      }
    } catch (error) {
      logger.error(`[MetricsService] Error incrementing ${name}:`, error);
    }
  }

  /**
   * Observes a value for histogram/summary metrics
   * @param {string} name - Metric name
   * @param {object} labels - Metric labels
   * @param {number} value - Value to observe
   */
  observe(name, labels, value) {
    try {
      if (this.metrics[name] && this.metrics[name].observe) {
        this.metrics[name].observe(labels, value);
      } else {
        logger.warn(`[MetricsService] Histogram metric not found: ${name}`);
      }
    } catch (error) {
      logger.error(`[MetricsService] Error observing ${name}:`, error);
    }
  }

  /**
   * Sets a gauge metric value
   * @param {string} name - Metric name
   * @param {object} labels - Metric labels
   * @param {number} value - Value to set
   */
  setGauge(name, labels, value) {
    try {
      if (this.metrics[name] && this.metrics[name].set) {
        this.metrics[name].set(labels, value);
      } else {
        logger.warn(`[MetricsService] Gauge metric not found: ${name}`);
      }
    } catch (error) {
      logger.error(`[MetricsService] Error setting gauge ${name}:`, error);
    }
  }

  /**
   * Increments a gauge metric
   * @param {string} name - Metric name
   * @param {object} labels - Metric labels
   * @param {number} [value=1] - Increment value
   */
  incGauge(name, labels, value = 1) {
    try {
      if (this.metrics[name] && this.metrics[name].inc) {
        this.metrics[name].inc(labels, value);
      } else {
        logger.warn(`[MetricsService] Gauge metric not found: ${name}`);
      }
    } catch (error) {
      logger.error(`[MetricsService] Error incrementing gauge ${name}:`, error);
    }
  }

  /**
   * Decrements a gauge metric
   * @param {string} name - Metric name
   * @param {object} labels - Metric labels
   * @param {number} [value=1] - Decrement value
   */
  decGauge(name, labels, value = 1) {
    try {
      if (this.metrics[name] && this.metrics[name].dec) {
        this.metrics[name].dec(labels, value);
      } else {
        logger.warn(`[MetricsService] Gauge metric not found: ${name}`);
      }
    } catch (error) {
      logger.error(`[MetricsService] Error decrementing gauge ${name}:`, error);
    }
  }

  // ==========================================
  // CONVENIENCE METHODS FOR SPECIFIC METRICS
  // ==========================================

  /**
   * Records a stream event
   * @param {string} event - Event type (started, chunk, completed, failed, cancelled)
   * @param {object} data - Event data
   */
  recordStreamEvent(event, data = {}) {
    const { agent = 'unknown', model = 'unknown', error_type, reason } = data;

    switch (event) {
      case 'started':
        this.incGauge('active_streams', { agent });
        break;

      case 'chunk':
        this.increment('stream_chunks_sent', { agent, model });
        break;

      case 'completed':
        this.increment('stream_sessions_completed', { agent, model });
        this.decGauge('active_streams', { agent });
        if (data.duration) {
          this.observe('stream_duration_seconds', { agent, model, status: 'success' }, data.duration);
        }
        break;

      case 'failed':
        this.increment('stream_sessions_failed', { agent, model, error_type: error_type || 'unknown' });
        this.decGauge('active_streams', { agent });
        if (data.duration) {
          this.observe('stream_duration_seconds', { agent, model, status: 'failed' }, data.duration);
        }
        break;

      case 'cancelled':
        this.increment('stream_sessions_cancelled', { agent, reason: reason || 'client_disconnect' });
        this.decGauge('active_streams', { agent });
        if (data.duration) {
          this.observe('stream_duration_seconds', { agent, model, status: 'cancelled' }, data.duration);
        }
        break;

      default:
        logger.warn(`[MetricsService] Unknown stream event: ${event}`);
    }
  }

  /**
   * Records an LLM API call
   * @param {object} data - Call data
   */
  recordLLMCall(data = {}) {
    const {
      model = 'unknown',
      agent = 'unknown',
      status = 'success', // success, failure
      duration,
      inputTokens = 0,
      outputTokens = 0,
      cost = 0,
    } = data;

    this.increment('llm_calls_total', { model, status, agent });

    if (duration !== undefined) {
      this.observe('llm_call_duration_seconds', { model, agent }, duration);
    }

    if (inputTokens > 0) {
      this.increment('llm_tokens_used', { model, agent, token_type: 'input' }, inputTokens);
    }

    if (outputTokens > 0) {
      this.increment('llm_tokens_used', { model, agent, token_type: 'output' }, outputTokens);
    }

    if (cost > 0) {
      this.increment('llm_cost_usd', { model, agent }, cost);
    }
  }

  /**
   * Records a coordinator workflow
   * @param {string} strategy - Workflow strategy
   * @param {string} status - Workflow status
   * @param {number} duration - Duration in seconds
   * @param {string} workflowName - Workflow name
   */
  recordCoordinatorWorkflow(strategy, status, duration, workflowName = 'unnamed') {
    this.increment('workflow_executions_total', {
      workflow_name: workflowName,
      strategy,
      status,
    });

    if (duration !== undefined) {
      this.observe('workflow_duration_seconds', {
        workflow_name: workflowName,
        strategy,
      }, duration);
    }
  }

  /**
   * Express middleware for tracking HTTP requests
   * @returns {Function} Express middleware
   */
  middleware() {
    return (req, res, next) => {
      const start = Date.now();

      // Capture response finish event
      res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        const route = req.route?.path || req.path || 'unknown';
        const method = req.method;
        const status_code = res.statusCode;

        this.increment('api_requests_total', { method, route, status_code: String(status_code) });
        this.observe('api_request_duration_seconds', {
          method,
          route,
          status_code: String(status_code),
        }, duration);

        // Track rate limit hits
        if (status_code === 429) {
          const apiKeyPrefix = req.headers['x-api-key']?.substring(0, 8) || 'anonymous';
          this.increment('rate_limit_hits_total', { route, api_key_prefix: apiKeyPrefix });
        }
      });

      next();
    };
  }

  // ==========================================
  // EXPORT METHODS
  // ==========================================

  /**
   * Exposes metrics in Prometheus text format
   * @returns {Promise<string>} Prometheus formatted metrics
   */
  async exposePrometheus() {
    try {
      return await this.register.metrics();
    } catch (error) {
      logger.error('[MetricsService] Error exposing Prometheus metrics:', error);
      throw error;
    }
  }

  /**
   * Provides a JSON snapshot of all metrics
   * @returns {Promise<Array>} Array of metric objects
   */
  async snapshot() {
    try {
      return await this.register.getMetricsAsJSON();
    } catch (error) {
      logger.error('[MetricsService] Error getting JSON snapshot:', error);
      throw error;
    }
  }

  /**
   * Resets all metrics (useful for testing)
   */
  reset() {
    this.register.resetMetrics();
    logger.info('[MetricsService] All metrics reset');
  }

  /**
   * Gets the Prometheus content type
   * @returns {string} Content type header value
   */
  getContentType() {
    return this.register.contentType;
  }
}

// Export a singleton instance
module.exports = new MetricsService();