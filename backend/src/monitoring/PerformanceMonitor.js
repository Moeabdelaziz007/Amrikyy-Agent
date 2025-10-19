/**
 * Performance Monitor
 * Real-time performance monitoring and alerting
 */

const { logger } = require('../utils/logger');

class PerformanceMonitor {
  constructor() {
    this.isRunning = false;
    this.metrics = {
      requests: 0,
      responseTime: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      errors: 0
    };
    this.thresholds = {
      cpuUsage: 80,
      memoryUsage: 90,
      responseTime: 5000,
      errorRate: 5
    };
  }

  startMonitoring() {
    if (this.isRunning) {
      logger.warn('⚠️ Performance monitoring is already running');
      return;
    }

    this.isRunning = true;
    logger.info('🚀 Performance monitoring started');

    // Monitor every 30 seconds
    this.monitorInterval = setInterval(() => {
      this.collectMetrics();
      this.checkThresholds();
    }, 30000);

    logger.info('✅ Performance Monitor initialized');
  }

  stopMonitoring() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
    this.isRunning = false;
    logger.info('🛑 Performance monitoring stopped');
  }

  collectMetrics() {
    const memUsage = process.memoryUsage();
    this.metrics.memoryUsage = Math.round(memUsage.heapUsed / 1024 / 1024); // MB
    this.metrics.cpuUsage = this.getCpuUsage();
  }

  getCpuUsage() {
    const cpus = require('os').cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach(cpu => {
      for (let type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });

    return Math.round(100 - (100 * totalIdle / totalTick));
  }

  checkThresholds() {
    const { cpuUsage, memoryUsage, responseTime, errorRate } = this.thresholds;
    const { cpuUsage: currentCpu, memoryUsage: currentMem } = this.metrics;

    if (currentCpu > cpuUsage) {
      logger.warn(`🚨 Performance Alert: CPU usage ${currentCpu}% exceeds threshold ${cpuUsage}%`);
    }

    if (currentMem > memoryUsage) {
      logger.warn(`🚨 Performance Alert: Memory usage ${currentMem}MB exceeds threshold ${memoryUsage}MB`);
    }
  }

  recordRequest(responseTime) {
    this.metrics.requests++;
    this.metrics.responseTime = responseTime;
  }

  recordError() {
    this.metrics.errors++;
  }

  getMetrics() {
    return { ...this.metrics };
  }
}

// Singleton instance
const performanceMonitor = new PerformanceMonitor();

module.exports = performanceMonitor;