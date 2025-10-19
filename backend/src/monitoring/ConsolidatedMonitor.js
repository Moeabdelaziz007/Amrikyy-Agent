/**
 * Consolidated Monitoring Service
 * Replaces multiple setInterval operations with a single optimized monitor
 * 
 * Features:
 * - Single interval for all monitoring tasks
 * - Configurable task scheduling
 * - Performance metrics collection
 * - Memory leak prevention
 */

const { logger } = require('../utils/logger');
const EventEmitter = require('events');

class ConsolidatedMonitor extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      interval: config.interval || 60000, // 1 minute default
      maxConcurrentTasks: config.maxConcurrentTasks || 5,
      enableHealthCheck: config.enableHealthCheck !== false,
      enableCacheCleanup: config.enableCacheCleanup !== false,
      enablePerformanceMonitoring: config.enablePerformanceMonitoring !== false,
      enableLearningLoop: config.enableLearningLoop !== false,
      enableCodebaseAnalysis: config.enableCodebaseAnalysis !== false,
      ...config
    };

    this.tasks = new Map();
    this.isRunning = false;
    this.intervalId = null;
    this.stats = {
      totalRuns: 0,
      successfulTasks: 0,
      failedTasks: 0,
      averageExecutionTime: 0,
      lastRun: null
    };

    this.setupTasks();
    logger.info('✅ Consolidated Monitor initialized');
  }

  /**
   * Setup monitoring tasks
   */
  setupTasks() {
    // Cache cleanup task
    if (this.config.enableCacheCleanup) {
      this.addTask('cache_cleanup', {
        name: 'Cache Cleanup',
        interval: 60000, // Every minute
        handler: this.cacheCleanupTask.bind(this),
        priority: 'high'
      });
    }

    // Health check task
    if (this.config.enableHealthCheck) {
      this.addTask('health_check', {
        name: 'Health Check',
        interval: 60000, // Every minute
        handler: this.healthCheckTask.bind(this),
        priority: 'high'
      });
    }

    // Performance monitoring task
    if (this.config.enablePerformanceMonitoring) {
      this.addTask('performance_monitoring', {
        name: 'Performance Monitoring',
        interval: 30000, // Every 30 seconds
        handler: this.performanceMonitoringTask.bind(this),
        priority: 'medium'
      });
    }

    // Learning loop task
    if (this.config.enableLearningLoop) {
      this.addTask('learning_loop', {
        name: 'Learning Loop',
        interval: 300000, // Every 5 minutes
        handler: this.learningLoopTask.bind(this),
        priority: 'low'
      });
    }

    // Codebase analysis task
    if (this.config.enableCodebaseAnalysis) {
      this.addTask('codebase_analysis', {
        name: 'Codebase Analysis',
        interval: 300000, // Every 5 minutes
        handler: this.codebaseAnalysisTask.bind(this),
        priority: 'low'
      });
    }
  }

  /**
   * Add a monitoring task
   */
  addTask(taskId, taskConfig) {
    this.tasks.set(taskId, {
      id: taskId,
      name: taskConfig.name,
      interval: taskConfig.interval,
      handler: taskConfig.handler,
      priority: taskConfig.priority || 'medium',
      lastRun: 0,
      nextRun: Date.now(),
      executionCount: 0,
      averageExecutionTime: 0,
      errors: 0
    });

    logger.info(`📋 Added monitoring task: ${taskConfig.name}`);
  }

  /**
   * Start the consolidated monitor
   */
  start() {
    if (this.isRunning) {
      logger.warn('⚠️ Consolidated Monitor is already running');
      return;
    }

    this.isRunning = true;
    this.intervalId = setInterval(() => {
      this.runMonitoringCycle();
    }, this.config.interval);

    logger.info(`🚀 Consolidated Monitor started (${this.config.interval}ms interval)`);
    this.emit('monitor:started');
  }

  /**
   * Stop the consolidated monitor
   */
  stop() {
    if (!this.isRunning) {
      logger.warn('⚠️ Consolidated Monitor is not running');
      return;
    }

    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    logger.info('🛑 Consolidated Monitor stopped');
    this.emit('monitor:stopped');
  }

  /**
   * Run one monitoring cycle
   */
  async runMonitoringCycle() {
    const startTime = Date.now();
    this.stats.totalRuns++;
    this.stats.lastRun = new Date();

    const tasksToRun = this.getTasksToRun();
    
    if (tasksToRun.length === 0) {
      return;
    }

    logger.debug(`🔄 Running ${tasksToRun.length} monitoring tasks`);

    // Run tasks in parallel with concurrency limit
    const results = await this.runTasksWithConcurrencyLimit(tasksToRun);

    // Update statistics
    const executionTime = Date.now() - startTime;
    this.updateStats(results, executionTime);

    this.emit('monitor:cycle_completed', {
      tasksRun: tasksToRun.length,
      executionTime,
      results
    });
  }

  /**
   * Get tasks that should run now
   */
  getTasksToRun() {
    const now = Date.now();
    const tasksToRun = [];

    for (const [taskId, task] of this.tasks) {
      if (now >= task.nextRun) {
        tasksToRun.push(task);
        task.nextRun = now + task.interval;
      }
    }

    // Sort by priority
    return tasksToRun.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Run tasks with concurrency limit
   */
  async runTasksWithConcurrencyLimit(tasks) {
    const results = [];
    const concurrencyLimit = this.config.maxConcurrentTasks;

    for (let i = 0; i < tasks.length; i += concurrencyLimit) {
      const batch = tasks.slice(i, i + concurrencyLimit);
      const batchPromises = batch.map(task => this.runTask(task));
      const batchResults = await Promise.allSettled(batchPromises);
      
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Run a single task
   */
  async runTask(task) {
    const startTime = Date.now();
    
    try {
      logger.debug(`▶️ Running task: ${task.name}`);
      
      await task.handler();
      
      const executionTime = Date.now() - startTime;
      task.executionCount++;
      task.lastRun = Date.now();
      task.averageExecutionTime = this.calculateAverageExecutionTime(
        task.averageExecutionTime, 
        executionTime, 
        task.executionCount
      );

      this.stats.successfulTasks++;
      
      logger.debug(`✅ Task completed: ${task.name} (${executionTime}ms)`);
      
      return {
        taskId: task.id,
        success: true,
        executionTime,
        error: null
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      task.errors++;
      this.stats.failedTasks++;

      logger.error(`❌ Task failed: ${task.name}`, error);
      
      return {
        taskId: task.id,
        success: false,
        executionTime,
        error: error.message
      };
    }
  }

  /**
   * Calculate average execution time
   */
  calculateAverageExecutionTime(currentAverage, newTime, count) {
    return ((currentAverage * (count - 1)) + newTime) / count;
  }

  /**
   * Update monitoring statistics
   */
  updateStats(results, totalExecutionTime) {
    this.stats.averageExecutionTime = this.calculateAverageExecutionTime(
      this.stats.averageExecutionTime,
      totalExecutionTime,
      this.stats.totalRuns
    );

    // Emit performance metrics
    this.emit('monitor:metrics', {
      stats: this.stats,
      results,
      totalExecutionTime
    });
  }

  // Task implementations

  /**
   * Cache cleanup task
   */
  async cacheCleanupTask() {
    try {
      // Import cache service dynamically to avoid circular dependencies
      const MemoryCache = require('../cache/MemoryCache');
      
      if (MemoryCache && typeof MemoryCache.cleanup === 'function') {
        MemoryCache.cleanup();
        logger.debug('🧹 Cache cleanup completed');
      }
    } catch (error) {
      logger.error('❌ Cache cleanup failed:', error);
      throw error;
    }
  }

  /**
   * Health check task
   */
  async healthCheckTask() {
    try {
      const healthStatus = {
        timestamp: Date.now(),
        memory: process.memoryUsage(),
        uptime: process.uptime(),
        tasks: this.tasks.size,
        isRunning: this.isRunning
      };

      this.emit('monitor:health_check', healthStatus);
      logger.debug('🏥 Health check completed');
    } catch (error) {
      logger.error('❌ Health check failed:', error);
      throw error;
    }
  }

  /**
   * Performance monitoring task
   */
  async performanceMonitoringTask() {
    try {
      const performanceMetrics = {
        timestamp: Date.now(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        uptime: process.uptime(),
        stats: this.stats
      };

      this.emit('monitor:performance_metrics', performanceMetrics);
      logger.debug('📊 Performance monitoring completed');
    } catch (error) {
      logger.error('❌ Performance monitoring failed:', error);
      throw error;
    }
  }

  /**
   * Learning loop task
   */
  async learningLoopTask() {
    try {
      // This would integrate with the learning system
      logger.debug('🧠 Learning loop executed');
      this.emit('monitor:learning_loop');
    } catch (error) {
      logger.error('❌ Learning loop failed:', error);
      throw error;
    }
  }

  /**
   * Codebase analysis task
   */
  async codebaseAnalysisTask() {
    try {
      // This would integrate with the codebase analysis system
      logger.debug('🔍 Codebase analysis executed');
      this.emit('monitor:codebase_analysis');
    } catch (error) {
      logger.error('❌ Codebase analysis failed:', error);
      throw error;
    }
  }

  /**
   * Get monitoring statistics
   */
  getStats() {
    return {
      ...this.stats,
      tasks: Array.from(this.tasks.values()).map(task => ({
        id: task.id,
        name: task.name,
        executionCount: task.executionCount,
        averageExecutionTime: task.averageExecutionTime,
        errors: task.errors,
        lastRun: task.lastRun,
        nextRun: task.nextRun
      })),
      isRunning: this.isRunning,
      config: this.config
    };
  }

  /**
   * Remove a task
   */
  removeTask(taskId) {
    const task = this.tasks.get(taskId);
    if (task) {
      this.tasks.delete(taskId);
      logger.info(`🗑️ Removed monitoring task: ${task.name}`);
      return true;
    }
    return false;
  }

  /**
   * Update task configuration
   */
  updateTask(taskId, updates) {
    const task = this.tasks.get(taskId);
    if (task) {
      Object.assign(task, updates);
      logger.info(`📝 Updated monitoring task: ${task.name}`);
      return true;
    }
    return false;
  }
}

// Export singleton instance
module.exports = new ConsolidatedMonitor();
