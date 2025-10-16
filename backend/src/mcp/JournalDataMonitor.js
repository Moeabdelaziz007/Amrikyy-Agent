/**
 * Journal Data Monitor - Monitors journal data collection and health
 * Tracks data flow between pattern engine and journal storage
 */

const EventEmitter = require('events');
const winston = require('winston');

class JournalDataMonitor extends EventEmitter {
  constructor(journalClient, patternAdapter) {
    super();

    this.journalClient = journalClient;
    this.patternAdapter = patternAdapter;

    this.monitor_id = "journal_data_monitor";
    this.version = "1.0.0";

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/journal-data-monitor.log' }),
        new winston.transports.Console()
      ]
    });

    // Monitoring state
    this.monitoringActive = false;
    this.monitoringInterval = null;
    this.fastCheckInterval = 5000; // 5 seconds
    this.slowCheckInterval = 30000; // 30 seconds

    // Data collection metrics
    this.metrics = {
      patternsStored: 0,
      interactionsStored: 0,
      storageFailures: 0,
      retrievalCount: 0,
      retrievalFailures: 0,
      dataQualityScore: 100,
      lastStorageTime: null,
      lastRetrievalTime: null,
      averageStorageLatency: 0,
      averageRetrievalLatency: 0
    };

    // Health tracking
    this.healthStatus = {
      journal_connection: 'unknown',
      storage_performance: 'unknown',
      data_quality: 'unknown',
      last_health_check: null
    };

    // Alert thresholds
    this.alertThresholds = {
      maxStorageFailures: 5,
      maxRetrievalFailures: 3,
      minDataQualityScore: 80,
      maxLatencyMs: 5000,
      minUptimePercent: 95
    };

    // Active alerts
    this.activeAlerts = new Map();

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Listen to journal client events
    if (this.journalClient) {
      this.journalClient.on('connected', () => {
        this.updateHealthStatus('journal_connection', 'healthy');
        this.clearAlert('journal_connection_lost');
      });

      this.journalClient.on('disconnected', () => {
        this.updateHealthStatus('journal_connection', 'degraded');
        this.createAlert('journal_connection_lost', 'Journal connection lost', 'high');
      });
    }
  }

  /**
   * Start monitoring
   */
  startMonitoring() {
    if (this.monitoringActive) {
      this.logger.warn('Monitoring already active');
      return;
    }

    this.logger.info('Starting journal data monitoring...');
    this.monitoringActive = true;

    // Start monitoring intervals
    this.startHealthChecks();
    this.startMetricsCollection();
    this.startAlertMonitoring();

    this.logger.info('Journal data monitoring started');
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (!this.monitoringActive) {
      return;
    }

    this.logger.info('Stopping journal data monitoring...');
    this.monitoringActive = false;

    // Clear intervals
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    if (this.alertCheckInterval) {
      clearInterval(this.alertCheckInterval);
      this.alertCheckInterval = null;
    }

    this.logger.info('Journal data monitoring stopped');
  }

  startHealthChecks() {
    // Fast health checks for real-time monitoring
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, this.fastCheckInterval);

    this.logger.info('Health checks started');
  }

  startMetricsCollection() {
    // Slower metrics collection
    this.metricsInterval = setInterval(() => {
      this.collectMetrics();
    }, this.slowCheckInterval);

    this.logger.info('Metrics collection started');
  }

  startAlertMonitoring() {
    // Alert monitoring
    this.alertCheckInterval = setInterval(() => {
      this.checkAlerts();
    }, this.fastCheckInterval);

    this.logger.info('Alert monitoring started');
  }

  async performHealthCheck() {
    try {
      const healthData = {
        timestamp: new Date().toISOString(),
        journal_connection: await this.checkJournalConnection(),
        storage_performance: await this.checkStoragePerformance(),
        data_quality: this.checkDataQuality(),
        overall: 'healthy'
      };

      // Determine overall health
      const statuses = Object.values(healthData).filter(s => typeof s === 'string');
      if (statuses.includes('error')) {
        healthData.overall = 'error';
      } else if (statuses.includes('degraded')) {
        healthData.overall = 'degraded';
      }

      // Update health status
      this.healthStatus = {
        ...healthData,
        last_health_check: healthData.timestamp
      };

      this.emit('health_check_completed', healthData);

      return healthData;

    } catch (error) {
      this.logger.error('Health check failed', { error: error.message });

      this.healthStatus = {
        ...this.healthStatus,
        overall: 'error',
        last_error: error.message,
        last_health_check: new Date().toISOString()
      };

      return this.healthStatus;
    }
  }

  async checkJournalConnection() {
    if (!this.journalClient) {
      return 'error';
    }

    try {
      const health = await this.journalClient.healthCheck();

      if (health.status === 'healthy') {
        return 'healthy';
      } else {
        return 'degraded';
      }
    } catch (error) {
      this.logger.warn('Journal connection check failed', { error: error.message });
      return 'error';
    }
  }

  async checkStoragePerformance() {
    if (!this.journalClient) {
      return 'error';
    }

    try {
      const startTime = Date.now();

      // Test storage with a small test entry
      const testData = {
        type: 'test_entry',
        data: { test: true, timestamp: new Date().toISOString() },
        metadata: { test_entry: true }
      };

      await this.journalClient.store(testData);

      const latency = Date.now() - startTime;

      // Clean up test entry
      // Note: In production, you might want to use a specific test entry ID

      if (latency > this.alertThresholds.maxLatencyMs) {
        return 'degraded';
      }

      return 'healthy';

    } catch (error) {
      this.logger.warn('Storage performance check failed', { error: error.message });
      return 'error';
    }
  }

  checkDataQuality() {
    const recentFailures = this.metrics.storageFailures + this.metrics.retrievalFailures;
    const totalOperations = this.metrics.patternsStored + this.metrics.interactionsStored + this.metrics.retrievalCount;

    if (totalOperations === 0) {
      return 'unknown';
    }

    const failureRate = (recentFailures / totalOperations) * 100;

    if (failureRate > 20) {
      return 'error';
    } else if (failureRate > 10) {
      return 'degraded';
    }

    return 'healthy';
  }

  collectMetrics() {
    // Calculate derived metrics
    const totalOperations = this.metrics.patternsStored + this.metrics.interactionsStored + this.metrics.retrievalCount;

    if (totalOperations > 0) {
      const failureRate = ((this.metrics.storageFailures + this.metrics.retrievalFailures) / totalOperations) * 100;
      this.metrics.dataQualityScore = Math.max(0, 100 - failureRate);
    }

    // Calculate uptime percentage (simplified)
    const uptimePercent = this.healthStatus.journal_connection === 'healthy' ? 100 : 50;
    this.metrics.uptimePercent = uptimePercent;

    this.emit('metrics_updated', { ...this.metrics });
  }

  checkAlerts() {
    // Check storage failure rate
    if (this.metrics.storageFailures >= this.alertThresholds.maxStorageFailures) {
      this.createAlert(
        'high_storage_failures',
        `High storage failure rate: ${this.metrics.storageFailures} failures`,
        'high'
      );
    } else {
      this.clearAlert('high_storage_failures');
    }

    // Check retrieval failure rate
    if (this.metrics.retrievalFailures >= this.alertThresholds.maxRetrievalFailures) {
      this.createAlert(
        'high_retrieval_failures',
        `High retrieval failure rate: ${this.metrics.retrievalFailures} failures`,
        'high'
      );
    } else {
      this.clearAlert('high_retrieval_failures');
    }

    // Check data quality
    if (this.metrics.dataQualityScore < this.alertThresholds.minDataQualityScore) {
      this.createAlert(
        'low_data_quality',
        `Low data quality score: ${this.metrics.dataQualityScore}%`,
        'medium'
      );
    } else {
      this.clearAlert('low_data_quality');
    }

    // Check latency
    if (this.metrics.averageStorageLatency > this.alertThresholds.maxLatencyMs) {
      this.createAlert(
        'high_storage_latency',
        `High storage latency: ${this.metrics.averageStorageLatency}ms`,
        'medium'
      );
    } else {
      this.clearAlert('high_storage_latency');
    }

    // Check uptime
    if (this.metrics.uptimePercent < this.alertThresholds.minUptimePercent) {
      this.createAlert(
        'low_uptime',
        `Low uptime: ${this.metrics.uptimePercent}%`,
        'high'
      );
    } else {
      this.clearAlert('low_uptime');
    }
  }

  createAlert(alertId, message, severity = 'medium') {
    if (this.activeAlerts.has(alertId)) {
      return; // Alert already active
    }

    const alert = {
      id: alertId,
      message,
      severity,
      created_at: new Date().toISOString(),
      status: 'active'
    };

    this.activeAlerts.set(alertId, alert);

    this.logger.warn('Alert created', { alertId, severity, message });

    this.emit('alert_created', alert);
  }

  clearAlert(alertId) {
    const alert = this.activeAlerts.get(alertId);
    if (alert) {
      alert.resolved_at = new Date().toISOString();
      alert.status = 'resolved';

      this.activeAlerts.delete(alertId);

      this.logger.info('Alert cleared', { alertId });

      this.emit('alert_resolved', alert);
    }
  }

  /**
   * Record storage operation
   */
  recordStorageOperation(success, latency, operationType = 'pattern') {
    if (success) {
      if (operationType === 'pattern') {
        this.metrics.patternsStored++;
      } else if (operationType === 'interaction') {
        this.metrics.interactionsStored++;
      }

      // Update average latency
      const currentAvg = this.metrics.averageStorageLatency;
      const newCount = (operationType === 'pattern' ? this.metrics.patternsStored : this.metrics.interactionsStored);
      this.metrics.averageStorageLatency = (currentAvg * (newCount - 1) + latency) / newCount;

      this.metrics.lastStorageTime = new Date().toISOString();
    } else {
      this.metrics.storageFailures++;
    }

    this.emit('storage_operation_recorded', {
      success,
      latency,
      operationType,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Record retrieval operation
   */
  recordRetrievalOperation(success, latency, resultCount = 0) {
    if (success) {
      this.metrics.retrievalCount++;
      this.metrics.lastRetrievalTime = new Date().toISOString();

      // Update average latency
      const currentAvg = this.metrics.averageRetrievalLatency;
      const newCount = this.metrics.retrievalCount;
      this.metrics.averageRetrievalLatency = (currentAvg * (newCount - 1) + latency) / newCount;
    } else {
      this.metrics.retrievalFailures++;
    }

    this.emit('retrieval_operation_recorded', {
      success,
      latency,
      resultCount,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get comprehensive monitoring report
   */
  getMonitoringReport() {
    return {
      monitor_info: {
        monitor_id: this.monitor_id,
        version: this.version,
        monitoring_active: this.monitoringActive,
        uptime: this.getMonitorUptime()
      },

      health_status: this.healthStatus,

      metrics: this.metrics,

      active_alerts: Array.from(this.activeAlerts.values()),

      recommendations: this.generateRecommendations(),

      timestamp: new Date().toISOString()
    };
  }

  getMonitorUptime() {
    // Calculate monitor uptime (simplified)
    return process.uptime ? Math.round(process.uptime()) : 0;
  }

  generateRecommendations() {
    const recommendations = [];

    // Storage failure recommendations
    if (this.metrics.storageFailures > 0) {
      recommendations.push({
        type: 'storage_improvement',
        priority: 'high',
        message: 'Consider reviewing storage configuration and network connectivity',
        actionable: true
      });
    }

    // Retrieval failure recommendations
    if (this.metrics.retrievalFailures > 0) {
      recommendations.push({
        type: 'retrieval_improvement',
        priority: 'high',
        message: 'Check query patterns and journal server performance',
        actionable: true
      });
    }

    // Data quality recommendations
    if (this.metrics.dataQualityScore < 90) {
      recommendations.push({
        type: 'data_quality',
        priority: 'medium',
        message: 'Review data transformation and validation processes',
        actionable: true
      });
    }

    // Performance recommendations
    if (this.metrics.averageStorageLatency > 2000) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        message: 'Consider optimizing storage operations or upgrading journal server',
        actionable: true
      });
    }

    return recommendations;
  }

  /**
   * Get data flow statistics
   */
  getDataFlowStats() {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);

    // Calculate recent activity (simplified)
    const recentStorage = this.metrics.patternsStored + this.metrics.interactionsStored;
    const recentRetrieval = this.metrics.retrievalCount;

    return {
      storage_rate_per_hour: recentStorage,
      retrieval_rate_per_hour: recentRetrieval,
      failure_rate: this.calculateFailureRate(),
      average_latency: {
        storage: this.metrics.averageStorageLatency,
        retrieval: this.metrics.averageRetrievalLatency
      },
      data_quality_trend: this.getDataQualityTrend(),
      timestamp: new Date().toISOString()
    };
  }

  calculateFailureRate() {
    const totalOperations = this.metrics.patternsStored + this.metrics.interactionsStored + this.metrics.retrievalCount;

    if (totalOperations === 0) return 0;

    return ((this.metrics.storageFailures + this.metrics.retrievalFailures) / totalOperations) * 100;
  }

  getDataQualityTrend() {
    // Simplified trend calculation
    // In production, track historical data quality scores
    if (this.metrics.dataQualityScore >= 95) {
      return 'improving';
    } else if (this.metrics.dataQualityScore >= 85) {
      return 'stable';
    } else {
      return 'declining';
    }
  }

  /**
   * Export monitoring data
   */
  exportMonitoringData(options = {}) {
    const exportData = {
      report: this.getMonitoringReport(),
      data_flow: this.getDataFlowStats(),
      health_history: this.getHealthHistory(options.historyLimit || 24),
      alert_history: this.getAlertHistory(options.historyLimit || 24)
    };

    this.logger.info('Monitoring data exported', {
      dataSize: JSON.stringify(exportData).length,
      timeRange: options.timeRange || 'current'
    });

    return exportData;
  }

  getHealthHistory(limit = 24) {
    // Simplified health history
    // In production, maintain a rolling history of health checks
    return [{
      timestamp: this.healthStatus.last_health_check,
      status: this.healthStatus.overall,
      components: this.healthStatus
    }];
  }

  getAlertHistory(limit = 24) {
    // Return recent alerts (simplified)
    return Array.from(this.activeAlerts.values()).slice(0, limit);
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics = {
      patternsStored: 0,
      interactionsStored: 0,
      storageFailures: 0,
      retrievalCount: 0,
      retrievalFailures: 0,
      dataQualityScore: 100,
      lastStorageTime: null,
      lastRetrievalTime: null,
      averageStorageLatency: 0,
      averageRetrievalLatency: 0
    };

    this.logger.info('Metrics reset');
  }

  /**
   * Update alert thresholds
   */
  updateAlertThresholds(newThresholds) {
    this.alertThresholds = {
      ...this.alertThresholds,
      ...newThresholds
    };

    this.logger.info('Alert thresholds updated', { thresholds: this.alertThresholds });
  }

  /**
   * Get monitor status
   */
  getMonitorStatus() {
    return {
      monitor_id: this.monitor_id,
      version: this.version,
      monitoring_active: this.monitoringActive,
      intervals: {
        fast_check: this.fastCheckInterval,
        slow_check: this.slowCheckInterval
      },
      thresholds: this.alertThresholds,
      active_alerts_count: this.activeAlerts.size,
      last_activity: new Date().toISOString()
    };
  }

  /**
   * Cleanup method
   */
  destroy() {
    this.stopMonitoring();
    this.removeAllListeners();

    // Clear any remaining alerts
    this.activeAlerts.clear();

    this.logger.info('Journal Data Monitor destroyed');
  }
}

module.exports = JournalDataMonitor;