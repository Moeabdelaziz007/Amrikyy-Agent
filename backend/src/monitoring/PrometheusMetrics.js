/**
 * Prometheus Metrics Collection and Export
 * Comprehensive metrics for Cursor Manager Agent and all components
 */

const client = require('prom-client');
const express = require('express');

class PrometheusMetrics {
  constructor(config = {}) {
    this.config = {
      port: config.port || 9090,
      endpoint: config.endpoint || '/metrics',
      collectDefaultMetrics: config.collectDefaultMetrics !== false,
      ...config
    };

    // Initialize Prometheus client
    this.initializeClient();

    // Create metrics registry
    this.register = new client.Registry();

    // Define custom metrics
    this.defineMetrics();

    // Setup Express server for metrics endpoint
    this.setupMetricsServer();

    this.logger = require('winston').createLogger({
      level: 'info',
      format: require('winston').format.combine(
        require('winston').format.timestamp(),
        require('winston').format.json()
      ),
      transports: [
        new require('winston').transports.File({ filename: 'backend/logs/prometheus-metrics.log' }),
        new require('winston').transports.Console()
      ]
    });

    this.logger.info('📊 Prometheus Metrics initialized', { port: this.config.port });
  }

  /**
   * Initialize Prometheus client
   */
  initializeClient() {
    if (this.config.collectDefaultMetrics) {
      client.collectDefaultMetrics({
        register: this.register,
        gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
        eventLoopMonitoringPrecision: 10
      });
    }
  }

  /**
   * Define custom metrics for Cursor Manager
   */
  defineMetrics() {
    // Request metrics
    this.requestCounter = new client.Counter({
      name: 'cursor_manager_requests_total',
      help: 'Total number of requests processed',
      labelNames: ['method', 'status', 'agent_id', 'priority'],
      registers: [this.register]
    });

    this.requestDuration = new client.Histogram({
      name: 'cursor_manager_request_duration_seconds',
      help: 'Request duration in seconds',
      labelNames: ['method', 'agent_id', 'priority'],
      buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
      registers: [this.register]
    });

    // Agent metrics
    this.agentTasksTotal = new client.Counter({
      name: 'cursor_manager_agent_tasks_total',
      help: 'Total number of tasks assigned to agents',
      labelNames: ['agent_id', 'agent_name', 'task_type', 'status'],
      registers: [this.register]
    });

    this.agentTaskDuration = new client.Histogram({
      name: 'cursor_manager_agent_task_duration_seconds',
      help: 'Agent task execution duration in seconds',
      labelNames: ['agent_id', 'agent_name', 'task_type'],
      buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60, 120, 300],
      registers: [this.register]
    });

    this.agentUtilization = new client.Gauge({
      name: 'cursor_manager_agent_utilization_ratio',
      help: 'Agent utilization ratio (0-1)',
      labelNames: ['agent_id', 'agent_name'],
      registers: [this.register]
    });

    // Circuit breaker metrics
    this.circuitBreakerState = new client.Gauge({
      name: 'cursor_manager_circuit_breaker_state',
      help: 'Circuit breaker state (0=CLOSED, 1=OPEN, 2=HALF_OPEN)',
      labelNames: ['agent_id', 'agent_name'],
      registers: [this.register]
    });

    this.circuitBreakerFailures = new client.Counter({
      name: 'cursor_manager_circuit_breaker_failures_total',
      help: 'Total circuit breaker failures',
      labelNames: ['agent_id', 'agent_name'],
      registers: [this.register]
    });

    // Queue metrics
    this.queueSize = new client.Gauge({
      name: 'cursor_manager_queue_size',
      help: 'Current task queue size',
      registers: [this.register]
    });

    this.queueProcessingTime = new client.Histogram({
      name: 'cursor_manager_queue_processing_time_seconds',
      help: 'Time spent in queue before processing',
      labelNames: ['priority'],
      buckets: [0.001, 0.01, 0.1, 0.5, 1, 2, 5, 10],
      registers: [this.register]
    });

    // Pattern learning metrics
    this.patternLearningOperations = new client.Counter({
      name: 'cursor_manager_pattern_learning_operations_total',
      help: 'Total pattern learning operations',
      labelNames: ['operation_type', 'status'],
      registers: [this.register]
    });

    this.patternLearningAccuracy = new client.Gauge({
      name: 'cursor_manager_pattern_learning_accuracy',
      help: 'Pattern learning accuracy score',
      registers: [this.register]
    });

    // Voice agent metrics
    this.voiceSessionsTotal = new client.Counter({
      name: 'cursor_manager_voice_sessions_total',
      help: 'Total voice sessions',
      labelNames: ['status'],
      registers: [this.register]
    });

    this.voiceProcessingTime = new client.Histogram({
      name: 'cursor_manager_voice_processing_time_seconds',
      help: 'Voice processing time in seconds',
      labelNames: ['operation'],
      buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
      registers: [this.register]
    });

    // System health metrics
    this.systemHealth = new client.Gauge({
      name: 'cursor_manager_system_health',
      help: 'System health status (0=unhealthy, 1=degraded, 2=healthy)',
      labelNames: ['component'],
      registers: [this.register]
    });

    this.memoryUsage = new client.Gauge({
      name: 'cursor_manager_memory_usage_bytes',
      help: 'Memory usage in bytes',
      labelNames: ['type'],
      registers: [this.register]
    });

    // Error metrics
    this.errorCounter = new client.Counter({
      name: 'cursor_manager_errors_total',
      help: 'Total number of errors',
      labelNames: ['error_type', 'component', 'severity'],
      registers: [this.register]
    });

    this.logger.info('📈 Custom metrics defined successfully');
  }

  /**
   * Setup Express server for metrics endpoint
   */
  setupMetricsServer() {
    this.app = express();

    // Metrics endpoint
    this.app.get(this.config.endpoint, async (req, res) => {
      try {
        res.set('Content-Type', this.register.contentType);
        const metrics = await this.register.metrics();
        res.end(metrics);
      } catch (error) {
        this.logger.error('Error generating metrics:', error);
        res.status(500).end('Error generating metrics');
      }
    });

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    // Start server
    this.server = this.app.listen(this.config.port, () => {
      this.logger.info(`🚀 Prometheus metrics server started on port ${this.config.port}`);
    });
  }

  /**
   * Record request metrics
   */
  recordRequest(method, status, agentId = 'unknown', priority = 'normal', duration = 0) {
    this.requestCounter.inc({
      method,
      status,
      agent_id: agentId,
      priority
    });

    if (duration > 0) {
      this.requestDuration.observe({
        method,
        agent_id: agentId,
        priority
      }, duration / 1000); // Convert to seconds
    }
  }

  /**
   * Record agent task metrics
   */
  recordAgentTask(agentId, agentName, taskType, status, duration = 0) {
    this.agentTasksTotal.inc({
      agent_id: agentId,
      agent_name: agentName,
      task_type: taskType,
      status
    });

    if (duration > 0) {
      this.agentTaskDuration.observe({
        agent_id: agentId,
        agent_name: agentName,
        task_type: taskType
      }, duration / 1000);
    }
  }

  /**
   * Update agent utilization
   */
  updateAgentUtilization(agentId, agentName, utilization) {
    this.agentUtilization.set({
      agent_id: agentId,
      agent_name: agentName
    }, utilization);
  }

  /**
   * Update circuit breaker state
   */
  updateCircuitBreakerState(agentId, agentName, state) {
    const stateValue = {
      'CLOSED': 0,
      'OPEN': 1,
      'HALF_OPEN': 2
    }[state] || 0;

    this.circuitBreakerState.set({
      agent_id: agentId,
      agent_name: agentName
    }, stateValue);
  }

  /**
   * Record circuit breaker failure
   */
  recordCircuitBreakerFailure(agentId, agentName) {
    this.circuitBreakerFailures.inc({
      agent_id: agentId,
      agent_name: agentName
    });
  }

  /**
   * Update queue metrics
   */
  updateQueueMetrics(size, processingTime = 0, priority = 'normal') {
    this.queueSize.set(size);

    if (processingTime > 0) {
      this.queueProcessingTime.observe({
        priority
      }, processingTime / 1000);
    }
  }

  /**
   * Record pattern learning metrics
   */
  recordPatternLearningOperation(operationType, status, accuracy = null) {
    this.patternLearningOperations.inc({
      operation_type: operationType,
      status
    });

    if (accuracy !== null) {
      this.patternLearningAccuracy.set(accuracy);
    }
  }

  /**
   * Record voice agent metrics
   */
  recordVoiceSession(status, processingTime = 0, operation = 'session') {
    this.voiceSessionsTotal.inc({
      status
    });

    if (processingTime > 0) {
      this.voiceProcessingTime.observe({
        operation
      }, processingTime / 1000);
    }
  }

  /**
   * Update system health metrics
   */
  updateSystemHealth(component, health) {
    const healthValue = {
      'unhealthy': 0,
      'degraded': 1,
      'healthy': 2
    }[health] || 0;

    this.systemHealth.set({
      component
    }, healthValue);
  }

  /**
   * Update memory usage metrics
   */
  updateMemoryUsage() {
    const memUsage = process.memoryUsage();
    
    this.memoryUsage.set({ type: 'rss' }, memUsage.rss);
    this.memoryUsage.set({ type: 'heapTotal' }, memUsage.heapTotal);
    this.memoryUsage.set({ type: 'heapUsed' }, memUsage.heapUsed);
    this.memoryUsage.set({ type: 'external' }, memUsage.external);
  }

  /**
   * Record error metrics
   */
  recordError(errorType, component, severity = 'error') {
    this.errorCounter.inc({
      error_type: errorType,
      component,
      severity
    });
  }

  /**
   * Get metrics summary
   */
  async getMetricsSummary() {
    try {
      const metrics = await this.register.metrics();
      const lines = metrics.split('\n');
      
      const summary = {
        totalMetrics: lines.filter(line => !line.startsWith('#')).length,
        timestamp: new Date().toISOString(),
        server: {
          port: this.config.port,
          endpoint: this.config.endpoint,
          uptime: process.uptime()
        }
      };

      return summary;
    } catch (error) {
      this.logger.error('Error getting metrics summary:', error);
      return null;
    }
  }

  /**
   * Start periodic metrics collection
   */
  startPeriodicCollection(interval = 30000) {
    this.collectionInterval = setInterval(() => {
      this.updateMemoryUsage();
      this.updateSystemHealth('cursor_manager', 'healthy');
    }, interval);

    this.logger.info('🔄 Periodic metrics collection started', { interval });
  }

  /**
   * Stop periodic metrics collection
   */
  stopPeriodicCollection() {
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
      this.collectionInterval = null;
      this.logger.info('⏹️ Periodic metrics collection stopped');
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    this.logger.info('🛑 Shutting down Prometheus metrics...');
    
    try {
      this.stopPeriodicCollection();
      
      if (this.server) {
        await new Promise((resolve) => {
          this.server.close(resolve);
        });
      }
      
      this.logger.info('✅ Prometheus metrics shut down successfully');
    } catch (error) {
      this.logger.error('❌ Error during shutdown:', error);
      throw error;
    }
  }
}

module.exports = PrometheusMetrics;
