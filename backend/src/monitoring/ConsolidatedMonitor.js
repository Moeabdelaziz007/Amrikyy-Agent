/**
 * Consolidated Monitor
 * Centralized monitoring system for all services
 */

const { logger } = require('../utils/logger');

class ConsolidatedMonitor {
  constructor() {
    this.tasks = [];
    this.isRunning = false;
    this.interval = null;
  }

  start(intervalMs = 60000) {
    if (this.isRunning) {
      logger.warn('⚠️ Consolidated Monitor is already running');
      return;
    }

    this.isRunning = true;
    logger.info('🚀 Consolidated Monitor started (' + intervalMs + 'ms interval)');

    this.interval = setInterval(() => {
      this.executeTasks();
    }, intervalMs);

    logger.info('✅ Consolidated Monitor initialized');
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
    logger.info('🛑 Consolidated Monitor stopped');
  }

  addTask(task) {
    this.tasks.push(task);
    logger.info('📋 Added monitoring task: ' + task.name);
  }

  executeTasks() {
    this.tasks.forEach(task => {
      try {
        if (typeof task.execute === 'function') {
          task.execute();
        }
      } catch (error) {
        logger.error('❌ Task execution failed:', task.name, error.message);
      }
    });
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      taskCount: this.tasks.length,
      tasks: this.tasks.map(task => ({
        name: task.name,
        status: task.status || 'unknown'
      }))
    };
  }
}

// Singleton instance
const consolidatedMonitor = new ConsolidatedMonitor();

// Add default monitoring tasks
consolidatedMonitor.addTask({
  name: 'Cache Cleanup',
  execute: () => {
    // Cache cleanup logic
  }
});

consolidatedMonitor.addTask({
  name: 'Health Check',
  execute: () => {
    // Health check logic
  }
});

consolidatedMonitor.addTask({
  name: 'Performance Monitoring',
  execute: () => {
    // Performance monitoring logic
  }
});

consolidatedMonitor.addTask({
  name: 'Learning Loop',
  execute: () => {
    // Learning loop logic
  }
});

consolidatedMonitor.addTask({
  name: 'Codebase Analysis',
  execute: () => {
    // Codebase analysis logic
  }
});

module.exports = consolidatedMonitor;