/**
 * Prometheus Metrics Fix
 * Fixes metrics duplication and registry conflicts
 * Provides proper metrics cleanup and namespace isolation
 */

const client = require('prom-client');
const winston = require('winston');

class PrometheusMetricsFix {
  constructor(config = {}) {
    this.config = {
      port: config.port || 9091, // Use different port to avoid conflicts
      endpoint: config.endpoint || '/metrics',
      namespace: config.namespace || 'maya_travel_agent',
      ...config
    };

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'backend/logs/prometheus-fix.log' }),
        new winston.transports.Console()
      ]
    });

    this.initializeMetrics();
  }

  /**
   * Initialize metrics with proper cleanup
   */
  initializeMetrics() {
    try {
      // Clear existing default metrics to prevent duplication
      client.register.clear();

      // Create new registry with namespace
      this.register = new client.Registry();

      // Set default labels for all metrics
      this.register.setDefaultLabels({
        namespace: this.config.namespace,
        service: 'maya-travel-agent'
      });

      // Collect default metrics with custom registry
      client.collectDefaultMetrics({
        register: this.register,
        prefix: `${this.config.namespace}_`,
        timeout: 5000,
        gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5]
      });

      this.logger.info('✅ Prometheus metrics initialized with proper cleanup', {
        namespace: this.config.namespace,
        port: this.config.port
      });

    } catch (error) {
      this.logger.error('❌ Failed to initialize Prometheus metrics', {
        error: error.message
      });
    }
  }

  /**
   * Create custom metrics with proper namespacing
   */
  createCustomMetrics() {
    try {
      // Agent execution metrics
      this.agentExecutionCounter = new client.Counter({
        name: `${this.config.namespace}_agent_executions_total`,
        help: 'Total number of agent executions',
        labelNames: ['agent_name', 'status', 'task_type'],
        registers: [this.register]
      });

      this.agentExecutionDuration = new client.Histogram({
        name: `${this.config.namespace}_agent_execution_duration_seconds`,
        help: 'Agent execution duration in seconds',
        labelNames: ['agent_name', 'task_type'],
        buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60],
        registers: [this.register]
      });

      // API request metrics
      this.apiRequestCounter = new client.Counter({
        name: `${this.config.namespace}_api_requests_total`,
        help: 'Total number of API requests',
        labelNames: ['method', 'endpoint', 'status_code'],
        registers: [this.register]
      });

      this.apiRequestDuration = new client.Histogram({
        name: `${this.config.namespace}_api_request_duration_seconds`,
        help: 'API request duration in seconds',
        labelNames: ['method', 'endpoint'],
        buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
        registers: [this.register]
      });

      // Tool usage metrics
      this.toolUsageCounter = new client.Counter({
        name: `${this.config.namespace}_tool_usage_total`,
        help: 'Total number of tool usages',
        labelNames: ['tool_name', 'status'],
        registers: [this.register]
      });

      // Memory usage metrics
      this.memoryUsageGauge = new client.Gauge({
        name: `${this.config.namespace}_memory_usage_bytes`,
        help: 'Memory usage in bytes',
        labelNames: ['type'],
        registers: [this.register]
      });

      this.logger.info('✅ Custom metrics created successfully');

    } catch (error) {
      this.logger.error('❌ Failed to create custom metrics', {
        error: error.message
      });
    }
  }

  /**
   * Record agent execution metrics
   */
  recordAgentExecution(agentName, taskType, status, duration) {
    try {
      this.agentExecutionCounter.inc({
        agent_name: agentName,
        task_type: taskType,
        status: status
      });

      this.agentExecutionDuration.observe({
        agent_name: agentName,
        task_type: taskType
      }, duration / 1000); // Convert to seconds

    } catch (error) {
      this.logger.error('Failed to record agent execution metrics', {
        error: error.message,
        agentName,
        taskType
      });
    }
  }

  /**
   * Record API request metrics
   */
  recordApiRequest(method, endpoint, statusCode, duration) {
    try {
      this.apiRequestCounter.inc({
        method: method,
        endpoint: endpoint,
        status_code: statusCode
      });

      this.apiRequestDuration.observe({
        method: method,
        endpoint: endpoint
      }, duration / 1000); // Convert to seconds

    } catch (error) {
      this.logger.error('Failed to record API request metrics', {
        error: error.message,
        method,
        endpoint
      });
    }
  }

  /**
   * Record tool usage metrics
   */
  recordToolUsage(toolName, status) {
    try {
      this.toolUsageCounter.inc({
        tool_name: toolName,
        status: status
      });
    } catch (error) {
      this.logger.error('Failed to record tool usage metrics', {
        error: error.message,
        toolName
      });
    }
  }

  /**
   * Update memory usage metrics
   */
  updateMemoryMetrics() {
    try {
      const memUsage = process.memoryUsage();
      
      this.memoryUsageGauge.set({ type: 'rss' }, memUsage.rss);
      this.memoryUsageGauge.set({ type: 'heapTotal' }, memUsage.heapTotal);
      this.memoryUsageGauge.set({ type: 'heapUsed' }, memUsage.heapUsed);
      this.memoryUsageGauge.set({ type: 'external' }, memUsage.external);

    } catch (error) {
      this.logger.error('Failed to update memory metrics', {
        error: error.message
      });
    }
  }

  /**
   * Get metrics endpoint handler
   */
  getMetricsHandler() {
    return async (req, res) => {
      try {
        res.set('Content-Type', this.register.contentType);
        const metrics = await this.register.metrics();
        res.end(metrics);
      } catch (error) {
        this.logger.error('Error generating metrics', { error: error.message });
        res.status(500).end('Error generating metrics');
      }
    };
  }

  /**
   * Cleanup method
   */
  cleanup() {
    try {
      if (this.register) {
        this.register.clear();
      }
      this.logger.info('✅ Prometheus metrics cleaned up');
    } catch (error) {
      this.logger.error('Failed to cleanup metrics', { error: error.message });
    }
  }

  /**
   * Periodic memory metrics update
   */
  startPeriodicUpdates() {
    // Update memory metrics every 30 seconds
    setInterval(() => {
      this.updateMemoryMetrics();
    }, 30000);

    this.logger.info('✅ Periodic metrics updates started');
  }
}

module.exports = PrometheusMetricsFix;
