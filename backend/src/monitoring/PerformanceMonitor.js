/**
 * Performance Monitoring Service
 * Real-time performance tracking and optimization
 *
 * Features:
 * - Request/response time tracking
 * - Memory usage monitoring
 * - CPU usage tracking
 * - Database query performance
 * - API endpoint analytics
 * - Performance alerts
 */

const { logger } = require('../utils/logger');
const os = require('os');
const EventEmitter = require('events');

class PerformanceMonitor extends EventEmitter {
  constructor(config = {}) {
    super();

    this.config = {
      enableRequestTracking: config.enableRequestTracking !== false,
      enableMemoryMonitoring: config.enableMemoryMonitoring !== false,
      enableCPUMonitoring: config.enableCPUMonitoring !== false,
      enableDatabaseMonitoring: config.enableDatabaseMonitoring !== false,
      alertThresholds: {
        responseTime: config.responseTimeThreshold || 1000, // 1 second
        memoryUsage: config.memoryThreshold || 0.8, // 80%
        cpuUsage: config.cpuThreshold || 0.8, // 80%
        errorRate: config.errorRateThreshold || 0.05, // 5%
        ...config.alertThresholds,
      },
      ...config,
    };

    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        averageResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
      },
      memory: {
        current: 0,
        peak: 0,
        average: 0,
        heapUsed: 0,
        heapTotal: 0,
        external: 0,
      },
      cpu: {
        current: 0,
        average: 0,
        peak: 0,
      },
      database: {
        queries: 0,
        averageQueryTime: 0,
        slowQueries: 0,
        connectionPool: {
          active: 0,
          idle: 0,
          total: 0,
        },
      },
      system: {
        uptime: 0,
        loadAverage: [0, 0, 0],
        freeMemory: 0,
        totalMemory: 0,
      },
    };

    this.requestTimes = [];
    this.queryTimes = [];
    this.alerts = [];
    this.isMonitoring = false;
    this.monitoringInterval = null;

    this.startMonitoring();
    logger.info('✅ Performance Monitor initialized');
  }

  /**
   * Start performance monitoring
   */
  startMonitoring() {
    if (this.isMonitoring) {
      logger.warn('⚠️ Performance monitoring is already running');
      return;
    }

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, 5000); // Collect metrics every 5 seconds

    // Initial metrics collection
    this.collectMetrics();

    logger.info('🚀 Performance monitoring started');
    this.emit('monitor:started');
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring() {
    if (!this.isMonitoring) {
      logger.warn('⚠️ Performance monitoring is not running');
      return;
    }

    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    logger.info('🛑 Performance monitoring stopped');
    this.emit('monitor:stopped');
  }

  /**
   * Track HTTP request
   */
  trackRequest(req, res, next) {
    if (!this.config.enableRequestTracking) {
      return next();
    }

    const startTime = Date.now();
    const requestId = this.generateRequestId();

    // Add request ID to headers
    res.setHeader('X-Request-ID', requestId);

    // Track request start
    req.performanceStart = startTime;
    req.requestId = requestId;

    // Override res.end to track response
    const originalEnd = res.end;
    res.end = function (chunk, encoding) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Track the request
      this.trackRequestMetrics(req, res, responseTime);

      // Call original end
      originalEnd.call(this, chunk, encoding);
    }.bind(this);

    next();
  }

  /**
   * Track request metrics
   */
  trackRequestMetrics(req, res, responseTime) {
    this.metrics.requests.total++;

    if (res.statusCode >= 200 && res.statusCode < 400) {
      this.metrics.requests.successful++;
    } else {
      this.metrics.requests.failed++;
    }

    // Track response times
    this.requestTimes.push(responseTime);

    // Keep only last 1000 requests for performance
    if (this.requestTimes.length > 1000) {
      this.requestTimes = this.requestTimes.slice(-1000);
    }

    // Calculate percentiles
    this.calculateResponseTimePercentiles();

    // Check for performance alerts
    this.checkPerformanceAlerts('responseTime', responseTime);

    // Emit request event
    this.emit('request:completed', {
      requestId: req.requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    });
  }

  /**
   * Track database query
   */
  trackQuery(query, params, executionTime) {
    if (!this.config.enableDatabaseMonitoring) {
      return;
    }

    this.metrics.database.queries++;
    this.queryTimes.push(executionTime);

    // Keep only last 1000 queries
    if (this.queryTimes.length > 1000) {
      this.queryTimes = this.queryTimes.slice(-1000);
    }

    // Calculate average query time
    this.metrics.database.averageQueryTime =
      this.queryTimes.reduce((sum, time) => sum + time, 0) / this.queryTimes.length;

    // Track slow queries
    if (executionTime > 1000) {
      // Queries slower than 1 second
      this.metrics.database.slowQueries++;

      this.emit('query:slow', {
        query,
        params,
        executionTime,
        timestamp: Date.now(),
      });
    }

    // Check for database performance alerts
    this.checkPerformanceAlerts('database', executionTime);

    this.emit('query:completed', {
      query: query.substring(0, 100), // Truncate for privacy
      executionTime,
      timestamp: Date.now(),
    });
  }

  /**
   * Collect system metrics
   */
  collectMetrics() {
    // Memory metrics
    if (this.config.enableMemoryMonitoring) {
      this.collectMemoryMetrics();
    }

    // CPU metrics
    if (this.config.enableCPUMonitoring) {
      this.collectCPUMetrics();
    }

    // System metrics
    this.collectSystemMetrics();

    // Check for alerts
    this.checkSystemAlerts();

    // Emit metrics event
    this.emit('metrics:collected', this.metrics);
  }

  /**
   * Collect memory metrics
   */
  collectMemoryMetrics() {
    const memUsage = process.memoryUsage();
    const systemMem = {
      free: os.freemem(),
      total: os.totalmem(),
    };

    this.metrics.memory = {
      current: memUsage.rss,
      peak: Math.max(this.metrics.memory.peak, memUsage.rss),
      average: this.calculateAverage(this.metrics.memory.average, memUsage.rss),
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      systemFree: systemMem.free,
      systemTotal: systemMem.total,
      heapUsagePercent: (memUsage.heapUsed / memUsage.heapTotal) * 100,
    };

    // Check memory alerts
    const memoryUsagePercent = memUsage.rss / systemMem.total;
    this.checkPerformanceAlerts('memory', memoryUsagePercent);
  }

  /**
   * Collect CPU metrics
   */
  collectCPUMetrics() {
    const cpuUsage = process.cpuUsage();
    const currentCPU = (cpuUsage.user + cpuUsage.system) / 1000000; // Convert to seconds

    this.metrics.cpu = {
      current: currentCPU,
      average: this.calculateAverage(this.metrics.cpu.average, currentCPU),
      peak: Math.max(this.metrics.cpu.peak, currentCPU),
      user: cpuUsage.user,
      system: cpuUsage.system,
    };

    // Check CPU alerts
    this.checkPerformanceAlerts('cpu', currentCPU);
  }

  /**
   * Collect system metrics
   */
  collectSystemMetrics() {
    this.metrics.system = {
      uptime: process.uptime(),
      loadAverage: os.loadavg(),
      freeMemory: os.freemem(),
      totalMemory: os.totalmem(),
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
    };
  }

  /**
   * Calculate response time percentiles
   */
  calculateResponseTimePercentiles() {
    if (this.requestTimes.length === 0) return;

    const sorted = [...this.requestTimes].sort((a, b) => a - b);
    const len = sorted.length;

    this.metrics.requests.averageResponseTime =
      this.requestTimes.reduce((sum, time) => sum + time, 0) / len;

    this.metrics.requests.p95ResponseTime = sorted[Math.floor(len * 0.95)];
    this.metrics.requests.p99ResponseTime = sorted[Math.floor(len * 0.99)];
  }

  /**
   * Calculate running average
   */
  calculateAverage(currentAverage, newValue) {
    if (currentAverage === 0) return newValue;
    return currentAverage * 0.9 + newValue * 0.1; // Exponential moving average
  }

  /**
   * Check performance alerts
   */
  checkPerformanceAlerts(type, value) {
    const thresholds = this.config.alertThresholds;
    let alert = null;

    switch (type) {
      case 'responseTime':
        if (value > thresholds.responseTime) {
          alert = {
            type: 'response_time',
            severity: 'warning',
            message: `Response time ${value}ms exceeds threshold ${thresholds.responseTime}ms`,
            value,
            threshold: thresholds.responseTime,
            timestamp: Date.now(),
          };
        }
        break;

      case 'memory':
        if (value > thresholds.memoryUsage) {
          alert = {
            type: 'memory_usage',
            severity: 'critical',
            message: `Memory usage ${(value * 100).toFixed(2)}% exceeds threshold ${
              thresholds.memoryUsage * 100
            }%`,
            value,
            threshold: thresholds.memoryUsage,
            timestamp: Date.now(),
          };
        }
        break;

      case 'cpu':
        if (value > thresholds.cpuUsage) {
          alert = {
            type: 'cpu_usage',
            severity: 'warning',
            message: `CPU usage ${(value * 100).toFixed(2)}% exceeds threshold ${
              thresholds.cpuUsage * 100
            }%`,
            value,
            threshold: thresholds.cpuUsage,
            timestamp: Date.now(),
          };
        }
        break;

      case 'database':
        if (value > 1000) {
          // 1 second threshold for database queries
          alert = {
            type: 'slow_query',
            severity: 'warning',
            message: `Slow database query detected: ${value}ms`,
            value,
            threshold: 1000,
            timestamp: Date.now(),
          };
        }
        break;
    }

    if (alert) {
      this.alerts.push(alert);

      // Keep only last 100 alerts
      if (this.alerts.length > 100) {
        this.alerts = this.alerts.slice(-100);
      }

      this.emit('alert', alert);
      logger.warn(`🚨 Performance Alert: ${alert.message}`);
    }
  }

  /**
   * Check system alerts
   */
  checkSystemAlerts() {
    const loadAvg = this.metrics.system.loadAverage[0];
    const cpuCount = os.cpus().length;

    if (loadAvg > cpuCount * 0.8) {
      const alert = {
        type: 'high_load',
        severity: 'warning',
        message: `High system load detected: ${loadAvg.toFixed(2)} (CPUs: ${cpuCount})`,
        value: loadAvg,
        threshold: cpuCount * 0.8,
        timestamp: Date.now(),
      };

      this.alerts.push(alert);
      this.emit('alert', alert);
    }
  }

  /**
   * Generate unique request ID
   */
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      alerts: this.alerts.slice(-10), // Last 10 alerts
      isMonitoring: this.isMonitoring,
      config: this.config,
    };
  }

  /**
   * Get performance summary
   */
  getSummary() {
    const errorRate =
      this.metrics.requests.total > 0
        ? (this.metrics.requests.failed / this.metrics.requests.total) * 100
        : 0;

    return {
      status: this.isMonitoring ? 'active' : 'inactive',
      uptime: this.metrics.system.uptime,
      requests: {
        total: this.metrics.requests.total,
        successRate: `${(100 - errorRate).toFixed(2)}%`,
        averageResponseTime: `${this.metrics.requests.averageResponseTime.toFixed(2)}ms`,
        p95ResponseTime: `${this.metrics.requests.p95ResponseTime.toFixed(2)}ms`,
      },
      memory: {
        usage: this.formatBytes(this.metrics.memory.current),
        heapUsage: `${this.metrics.memory.heapUsagePercent.toFixed(2)}%`,
      },
      database: {
        queries: this.metrics.database.queries,
        averageQueryTime: `${this.metrics.database.averageQueryTime.toFixed(2)}ms`,
        slowQueries: this.metrics.database.slowQueries,
      },
      alerts: this.alerts.length,
    };
  }

  /**
   * Format bytes to human readable
   */
  formatBytes(bytes) {
    if (bytes < 1024) return bytes + 'B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + 'KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + 'MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + 'GB';
  }

  /**
   * Clear metrics
   */
  clearMetrics() {
    this.metrics.requests.total = 0;
    this.metrics.requests.successful = 0;
    this.metrics.requests.failed = 0;
    this.metrics.requests.averageResponseTime = 0;
    this.metrics.requests.p95ResponseTime = 0;
    this.metrics.requests.p99ResponseTime = 0;

    this.metrics.database.queries = 0;
    this.metrics.database.averageQueryTime = 0;
    this.metrics.database.slowQueries = 0;

    this.requestTimes = [];
    this.queryTimes = [];
    this.alerts = [];

    logger.info('🧹 Performance metrics cleared');
  }
}

// Export singleton instance
module.exports = new PerformanceMonitor();
