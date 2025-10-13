/**
 * Logger Utility
 * Centralized logging system with multiple levels and formatting
 */

const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

class Logger {
  constructor(options = {}) {
    this.logLevel = options.logLevel || process.env.LOG_LEVEL || 'info';
    this.logToFile = options.logToFile !== undefined ? options.logToFile : true;
    this.logDir = options.logDir || path.join(__dirname, '../../logs');
    this.logFile = options.logFile || 'app.log';

    // Log levels with priority
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
      trace: 4,
    };

    // Ensure log directory exists
    if (this.logToFile) {
      this.ensureLogDirectory();
    }
  }

  /**
   * Ensure log directory exists
   */
  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Check if message should be logged based on level
   */
  shouldLog(level) {
    return this.levels[level] <= this.levels[this.logLevel];
  }

  /**
   * Format timestamp
   */
  getTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Format log message
   */
  formatMessage(level, message, meta = {}) {
    const timestamp = this.getTimestamp();
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  /**
   * Write to log file
   */
  writeToFile(message) {
    if (!this.logToFile) return;

    const logPath = path.join(this.logDir, this.logFile);
    fs.appendFileSync(logPath, message + '\n', 'utf8');
  }

  /**
   * Log error message
   */
  error(message, meta = {}) {
    if (!this.shouldLog('error')) return;

    const formatted = this.formatMessage('error', message, meta);
    console.error(chalk.red(formatted));
    this.writeToFile(formatted);
  }

  /**
   * Log warning message
   */
  warn(message, meta = {}) {
    if (!this.shouldLog('warn')) return;

    const formatted = this.formatMessage('warn', message, meta);
    console.warn(chalk.yellow(formatted));
    this.writeToFile(formatted);
  }

  /**
   * Log info message
   */
  info(message, meta = {}) {
    if (!this.shouldLog('info')) return;

    const formatted = this.formatMessage('info', message, meta);
    console.log(chalk.blue(formatted));
    this.writeToFile(formatted);
  }

  /**
   * Log debug message
   */
  debug(message, meta = {}) {
    if (!this.shouldLog('debug')) return;

    const formatted = this.formatMessage('debug', message, meta);
    console.log(chalk.gray(formatted));
    this.writeToFile(formatted);
  }

  /**
   * Log trace message
   */
  trace(message, meta = {}) {
    if (!this.shouldLog('trace')) return;

    const formatted = this.formatMessage('trace', message, meta);
    console.log(chalk.dim(formatted));
    this.writeToFile(formatted);
  }

  /**
   * Log success message (info level with green color)
   */
  success(message, meta = {}) {
    if (!this.shouldLog('info')) return;

    const formatted = this.formatMessage('info', message, meta);
    console.log(chalk.green(formatted));
    this.writeToFile(formatted);
  }

  /**
   * Create child logger with prefix
   */
  child(prefix) {
    const childLogger = new Logger({
      logLevel: this.logLevel,
      logToFile: this.logToFile,
      logDir: this.logDir,
      logFile: this.logFile,
    });

    // Override methods to add prefix
    ['error', 'warn', 'info', 'debug', 'trace', 'success'].forEach((method) => {
      const originalMethod = childLogger[method].bind(childLogger);
      childLogger[method] = (message, meta) => {
        originalMethod(`[${prefix}] ${message}`, meta);
      };
    });

    return childLogger;
  }

  /**
   * Clear log file
   */
  clearLogs() {
    if (!this.logToFile) return;

    const logPath = path.join(this.logDir, this.logFile);
    if (fs.existsSync(logPath)) {
      fs.unlinkSync(logPath);
    }
  }

  /**
   * Get log file path
   */
  getLogPath() {
    return path.join(this.logDir, this.logFile);
  }
}

// Create default logger instance
const defaultLogger = new Logger();

// Export both class and default instance
module.exports = Logger;
module.exports.logger = defaultLogger;
module.exports.default = defaultLogger;
