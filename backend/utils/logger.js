/**
 * ULTRA-SMART Enterprise Logger for Amrikyy Travel Agent
 * 
 * Features:
 * - Separate console/file control for production performance
 * - Async file writing with buffering (non-blocking)
 * - Log sampling to reduce high-frequency logs
 * - Log aggregation for similar messages
 * - Performance monitoring and health checks
 * - Smart batching for efficient writes
 * - Memory management to prevent leaks
 * - Structured JSON output for machine parsing
 * - Automatic log compression
 * - Zero-overhead when disabled
 * 
 * Environment Variables:
 * - LOG_LEVEL: ERROR, WARN, INFO, DEBUG (default: INFO)
 * - LOG_TO_CONSOLE: true/false (default: true in dev, false in prod)
 * - LOG_TO_FILE: true/false (default: true)
 * - LOG_SAMPLING_RATE: 0.0-1.0 (default: 1.0 = log everything)
 * - LOG_BATCH_SIZE: number of logs to batch (default: 100)
 * - LOG_FLUSH_INTERVAL: ms between flushes (default: 5000)
 * - LOG_FORMAT: json/text (default: text)
 * - LOG_COMPRESS: true/false (default: true)
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const zlib = require('zlib');

const appendFile = promisify(fs.appendFile);
const gzip = promisify(zlib.gzip);

class Logger {
  constructor() {
    // Log levels
    this.logLevels = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3,
    };

    // Configuration from environment
    this.currentLevel = process.env.LOG_LEVEL
      ? this.logLevels[process.env.LOG_LEVEL.toUpperCase()]
      : this.logLevels.INFO;

    // Console/File control
    this.logToConsole = process.env.LOG_TO_CONSOLE !== undefined
      ? process.env.LOG_TO_CONSOLE === 'true'
      : process.env.NODE_ENV !== 'production'; // Auto-disable in production

    this.logToFile = process.env.LOG_TO_FILE !== 'false'; // Default: true

    // Performance features
    this.samplingRate = parseFloat(process.env.LOG_SAMPLING_RATE || '1.0');
    this.batchSize = parseInt(process.env.LOG_BATCH_SIZE || '100', 10);
    this.flushInterval = parseInt(process.env.LOG_FLUSH_INTERVAL || '5000', 10);
    this.logFormat = process.env.LOG_FORMAT || 'text'; // 'json' or 'text'
    this.compressLogs = process.env.LOG_COMPRESS !== 'false';

    // Buffers and state
    this.logBuffer = [];
    this.aggregationMap = new Map(); // For aggregating similar logs
    this.lastFlush = Date.now();
    this.isFlushingInProgress = false;

    // Performance metrics
    this.metrics = {
      totalLogs: 0,
      sampledLogs: 0,
      aggregatedLogs: 0,
      consoleWrites: 0,
      fileWrites: 0,
      flushes: 0,
      errors: 0,
      avgFlushTime: 0,
    };

    // Setup
    this.logDir = path.join(__dirname, '../logs');
    this.ensureLogDirectory();

    // Colors for console
    this.colors = {
      ERROR: '\x1b[31m', // Red
      WARN: '\x1b[33m', // Yellow
      INFO: '\x1b[36m', // Cyan
      DEBUG: '\x1b[90m', // Gray
      RESET: '\x1b[0m',
    };

    // Start flush interval
    this.startFlushInterval();

    // Graceful shutdown
    this.setupGracefulShutdown();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  // Sampling: Only log a percentage of messages
  shouldSample() {
    if (this.samplingRate >= 1.0) return true;
    if (this.samplingRate <= 0.0) return false;
    return Math.random() < this.samplingRate;
  }

  // Aggregation: Combine similar messages
  getAggregationKey(level, message) {
    // Create key from level + first 50 chars of message
    return `${level}:${message.substring(0, 50)}`;
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    
    if (this.logFormat === 'json') {
      // Structured JSON format
      return {
        timestamp,
        level,
        message,
        meta,
        formatted: JSON.stringify({
          timestamp,
          level,
          message,
          ...meta,
        }),
      };
    } else {
      // Human-readable text format
      const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
      return {
        timestamp,
        level,
        message,
        meta,
        formatted: `[${timestamp}] [${level}] ${message} ${metaStr}`,
      };
    }
  }

  // Async file writing with buffering
  async writeToFileAsync(level, formattedLog) {
    if (!this.logToFile) return;

    const logFile = path.join(this.logDir, `${level.toLowerCase()}.log`);
    const allLogsFile = path.join(this.logDir, 'all.log');

    try {
      await Promise.all([
        appendFile(logFile, formattedLog.formatted + '\n'),
        appendFile(allLogsFile, formattedLog.formatted + '\n'),
      ]);
      this.metrics.fileWrites++;
    } catch (error) {
      this.metrics.errors++;
      // Fallback to console if file write fails
      if (this.logToConsole) {
        console.error('Failed to write to log file:', error);
      }
    }
  }

  // Flush buffer to files
  async flushBuffer() {
    if (this.isFlushingInProgress || this.logBuffer.length === 0) {
      return;
    }

    this.isFlushingInProgress = true;
    const startTime = Date.now();

    try {
      // Get all logs to flush
      const logsToFlush = [...this.logBuffer];
      this.logBuffer = [];

      // Group by level for efficient writing
      const logsByLevel = {};
      logsToFlush.forEach((log) => {
        if (!logsByLevel[log.level]) {
          logsByLevel[log.level] = [];
        }
        logsByLevel[log.level].push(log.formatted);
      });

      // Write all logs
      const writePromises = [];
      
      // Write to level-specific files
      for (const [level, logs] of Object.entries(logsByLevel)) {
        const logFile = path.join(this.logDir, `${level.toLowerCase()}.log`);
        const content = logs.join('\n') + '\n';
        writePromises.push(appendFile(logFile, content));
      }

      // Write to all.log
      const allLogsFile = path.join(this.logDir, 'all.log');
      const allContent = logsToFlush.map(log => log.formatted).join('\n') + '\n';
      writePromises.push(appendFile(allLogsFile, allContent));

      await Promise.all(writePromises);

      // Update metrics
      this.metrics.flushes++;
      const flushTime = Date.now() - startTime;
      this.metrics.avgFlushTime = 
        (this.metrics.avgFlushTime * (this.metrics.flushes - 1) + flushTime) / this.metrics.flushes;
      this.lastFlush = Date.now();

    } catch (error) {
      this.metrics.errors++;
      if (this.logToConsole) {
        console.error('Failed to flush log buffer:', error);
      }
    } finally {
      this.isFlushingInProgress = false;
    }
  }

  // Start automatic flush interval
  startFlushInterval() {
    this.flushIntervalId = setInterval(() => {
      this.flushBuffer();
    }, this.flushInterval);
  }

  // Graceful shutdown
  setupGracefulShutdown() {
    const shutdown = async () => {
      await this.flushBuffer();
      if (this.flushIntervalId) {
        clearInterval(this.flushIntervalId);
      }
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    process.on('beforeExit', shutdown);
  }

  log(level, message, meta = {}) {
    // Check log level
    if (this.logLevels[level] > this.currentLevel) {
      return;
    }

    // Update metrics
    this.metrics.totalLogs++;

    // Sampling check
    if (!this.shouldSample()) {
      this.metrics.sampledLogs++;
      return;
    }

    // Aggregation check
    const aggKey = this.getAggregationKey(level, message);
    const now = Date.now();
    
    if (this.aggregationMap.has(aggKey)) {
      const aggData = this.aggregationMap.get(aggKey);
      
      // If same message within 1 second, aggregate
      if (now - aggData.lastSeen < 1000) {
        aggData.count++;
        aggData.lastSeen = now;
        this.metrics.aggregatedLogs++;
        return;
      } else {
        // Log aggregated count if > 1
        if (aggData.count > 1) {
          const aggMeta = { ...meta, aggregated_count: aggData.count };
          const formattedLog = this.formatMessage(level, message + ` (×${aggData.count})`, aggMeta);
          
          if (this.logToConsole) {
            const color = this.colors[level] || this.colors.RESET;
            console.log(`${color}${formattedLog.formatted}${this.colors.RESET}`);
            this.metrics.consoleWrites++;
          }
          
          if (this.logToFile) {
            this.logBuffer.push({ level, ...formattedLog });
          }
        }
        
        // Reset aggregation
        this.aggregationMap.delete(aggKey);
      }
    }

    // Create new aggregation entry
    this.aggregationMap.set(aggKey, {
      count: 1,
      lastSeen: now,
    });

    // Format log
    const formattedLog = this.formatMessage(level, message, meta);

    // Console output (if enabled)
    if (this.logToConsole) {
      const color = this.colors[level] || this.colors.RESET;
      console.log(`${color}${formattedLog.formatted}${this.colors.RESET}`);
      this.metrics.consoleWrites++;
    }

    // File output (buffered)
    if (this.logToFile) {
      this.logBuffer.push({ level, ...formattedLog });
      
      // Flush if buffer is full
      if (this.logBuffer.length >= this.batchSize) {
        this.flushBuffer();
      }
    }
  }

  error(message, error = null, meta = {}) {
    const errorMeta = {
      ...meta,
      error: error
        ? {
            message: error.message,
            stack: error.stack,
            name: error.name,
          }
        : null,
    };
    this.log('ERROR', message, errorMeta);
  }

  warn(message, meta = {}) {
    this.log('WARN', message, meta);
  }

  info(message, meta = {}) {
    this.log('INFO', message, meta);
  }

  debug(message, meta = {}) {
    this.log('DEBUG', message, meta);
  }

  // Specialized logging methods
  apiCall(method, url, status, duration, meta = {}) {
    this.info(`API ${method} ${url}`, {
      ...meta,
      status,
      duration_ms: duration,
    });
  }

  userAction(userId, action, meta = {}) {
    this.info(`User action: ${action}`, {
      ...meta,
      user_id: userId,
      action,
    });
  }

  botMessage(userId, direction, message, meta = {}) {
    this.debug(`Bot ${direction}: ${message.substring(0, 100)}`, {
      ...meta,
      user_id: userId,
      direction,
      message_length: message.length,
    });
  }

  performance(operation, duration, meta = {}) {
    const level = duration > 1000 ? 'WARN' : 'INFO';
    this.log(level, `Performance: ${operation}`, {
      ...meta,
      duration_ms: duration,
      slow: duration > 1000,
    });
  }

  // Get logger health and performance metrics
  getMetrics() {
    return {
      ...this.metrics,
      bufferSize: this.logBuffer.length,
      aggregationMapSize: this.aggregationMap.size,
      config: {
        logToConsole: this.logToConsole,
        logToFile: this.logToFile,
        samplingRate: this.samplingRate,
        batchSize: this.batchSize,
        flushInterval: this.flushInterval,
        logFormat: this.logFormat,
        compressLogs: this.compressLogs,
      },
      performance: {
        samplingEfficiency: this.metrics.totalLogs > 0 
          ? (this.metrics.sampledLogs / this.metrics.totalLogs * 100).toFixed(2) + '%'
          : '0%',
        aggregationEfficiency: this.metrics.totalLogs > 0
          ? (this.metrics.aggregatedLogs / this.metrics.totalLogs * 100).toFixed(2) + '%'
          : '0%',
        avgFlushTimeMs: this.metrics.avgFlushTime.toFixed(2),
      },
    };
  }

  // Health check
  healthCheck() {
    const health = {
      status: 'healthy',
      issues: [],
    };

    // Check buffer size
    if (this.logBuffer.length > this.batchSize * 2) {
      health.status = 'degraded';
      health.issues.push('Log buffer is growing too large');
    }

    // Check aggregation map size
    if (this.aggregationMap.size > 1000) {
      health.status = 'degraded';
      health.issues.push('Aggregation map is too large');
    }

    // Check error rate
    const errorRate = this.metrics.totalLogs > 0
      ? this.metrics.errors / this.metrics.totalLogs
      : 0;
    
    if (errorRate > 0.1) {
      health.status = 'unhealthy';
      health.issues.push(`High error rate: ${(errorRate * 100).toFixed(2)}%`);
    }

    // Check last flush time
    const timeSinceLastFlush = Date.now() - this.lastFlush;
    if (timeSinceLastFlush > this.flushInterval * 2) {
      health.status = 'degraded';
      health.issues.push('Flush interval exceeded');
    }

    return health;
  }

  // Compress old log files
  async compressOldLogs() {
    if (!this.compressLogs) return;

    try {
      const files = fs.readdirSync(this.logDir);
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

      for (const file of files) {
        // Skip already compressed files
        if (file.endsWith('.gz')) continue;

        const filePath = path.join(this.logDir, file);
        const stats = fs.statSync(filePath);

        // Compress files older than 1 day
        if (stats.mtimeMs < oneDayAgo) {
          const content = fs.readFileSync(filePath);
          const compressed = await gzip(content);
          fs.writeFileSync(filePath + '.gz', compressed);
          fs.unlinkSync(filePath);
          
          if (this.logToConsole) {
            console.log(`Compressed log file: ${file}`);
          }
        }
      }
    } catch (error) {
      this.metrics.errors++;
      if (this.logToConsole) {
        console.error('Failed to compress logs:', error);
      }
    }
  }

  // Rotate logs (keep last 7 days, compress old ones)
  async rotateLogs() {
    try {
      // First, compress old logs
      await this.compressOldLogs();

      // Then delete very old logs
      const files = fs.readdirSync(this.logDir);
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

      files.forEach((file) => {
        const filePath = path.join(this.logDir, file);
        const stats = fs.statSync(filePath);

        if (stats.mtimeMs < sevenDaysAgo) {
          fs.unlinkSync(filePath);
          this.info(`Rotated old log file: ${file}`);
        }
      });
    } catch (error) {
      this.metrics.errors++;
      if (this.logToConsole) {
        console.error('Failed to rotate logs:', error);
      }
    }
  }

  // Clean up aggregation map periodically
  cleanupAggregationMap() {
    const now = Date.now();
    const fiveSecondsAgo = now - 5000;

    for (const [key, data] of this.aggregationMap.entries()) {
      if (data.lastSeen < fiveSecondsAgo) {
        this.aggregationMap.delete(key);
      }
    }
  }
}

// Singleton instance
const logger = new Logger();

// Rotate logs daily
setInterval(
  () => {
    logger.rotateLogs();
  },
  24 * 60 * 60 * 1000
);

// Clean up aggregation map every 10 seconds
setInterval(
  () => {
    logger.cleanupAggregationMap();
  },
  10 * 1000
);

// Export logger with utility methods
module.exports = logger;

// Export metrics and health check for monitoring
module.exports.getMetrics = () => logger.getMetrics();
module.exports.healthCheck = () => logger.healthCheck();
