/**
 * Health Monitoring Middleware
 * Tracks all requests and integrates with SmartHealthMonitor
 */

const SmartHealthMonitor = require('../src/monitoring/SmartHealthMonitor');

// Create singleton instance
const monitor = new SmartHealthMonitor({
  checkInterval: 30000, // 30 seconds
  cpuThreshold: 80,
  memoryThreshold: 85,
  responseTimeThreshold: 1000,
  errorRateThreshold: 0.05
});

/**
 * Middleware to track request metrics
 */
function healthMonitoringMiddleware(req, res, next) {
  const startTime = Date.now();

  // Track response
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Record metrics
    monitor.recordRequest(duration, statusCode, req.path);

    // Emit event for slow requests
    if (duration > 1000) {
      monitor.emit('slow-request', {
        path: req.path,
        duration,
        method: req.method
      });
    }

    // Call original send
    return originalSend.call(this, data);
  };

  next();
}

/**
 * Health check endpoint handler
 */
async function healthCheckHandler(req, res) {
  try {
    const health = monitor.getStatus();
    const statusCode = health.overall === 'critical' ? 503 : 200;

    res.status(statusCode).json({
      status: health.overall,
      score: health.healthScore,
      timestamp: health.lastCheck,
      uptime: health.uptime,
      components: {
        cpu: health.components.system?.cpu,
        memory: health.components.memory,
        database: health.components.database,
        performance: health.components.performance,
        errors: health.components.errors
      },
      predictions: health.predictions
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
}

/**
 * Detailed health report endpoint
 */
async function healthReportHandler(req, res) {
  try {
    const report = monitor.getReport();
    
    res.json({
      success: true,
      report: {
        current: report.current,
        trends: report.trends,
        predictions: report.predictions,
        recommendations: report.recommendations
      },
      generatedAt: Date.now()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Metrics endpoint for Prometheus/monitoring tools
 */
function metricsHandler(req, res) {
  const status = monitor.getStatus();
  const recent = monitor.metrics.requests.slice(-1000);

  // Prometheus-compatible metrics format
  const metrics = `
# HELP maya_health_score Overall system health score (0-100)
# TYPE maya_health_score gauge
maya_health_score ${status.healthScore || 0}

# HELP maya_uptime System uptime in seconds
# TYPE maya_uptime counter
maya_uptime ${status.uptime || 0}

# HELP maya_cpu_usage CPU usage percentage
# TYPE maya_cpu_usage gauge
maya_cpu_usage ${status.components.system?.cpu?.usage || 0}

# HELP maya_memory_usage Memory usage percentage
# TYPE maya_memory_usage gauge
maya_memory_usage ${status.components.memory?.percent || 0}

# HELP maya_db_latency Database latency in milliseconds
# TYPE maya_db_latency gauge
maya_db_latency ${status.components.database?.latency || 0}

# HELP maya_request_count Total request count
# TYPE maya_request_count counter
maya_request_count ${recent.length}

# HELP maya_error_count Total error count
# TYPE maya_error_count counter
maya_error_count ${monitor.metrics.errors.length}

# HELP maya_error_rate Error rate (0-1)
# TYPE maya_error_rate gauge
maya_error_rate ${status.components.errors?.errorRate || 0}
  `.trim();

  res.set('Content-Type', 'text/plain; version=0.0.4');
  res.send(metrics);
}

// Export monitor instance and middleware
module.exports = {
  monitor,
  healthMonitoringMiddleware,
  healthCheckHandler,
  healthReportHandler,
  metricsHandler
};

