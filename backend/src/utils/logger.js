/**
 * Winston-based Logger Utility
 * Centralized logging system with multiple levels and formatting
 * Used across AIX components for consistent logging
 */

const winston = require('winston');
const path = require('path');

// Define log levels and colors
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  trace: 4
};

const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'blue',
  debug: 'gray',
  trace: 'dim'
};

// Add colors to winston
winston.addColors(logColors);

// Create custom format for better readability
const customFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    const serviceStr = service ? `[${service}]` : '';
    return `${timestamp} [${level.toUpperCase()}]${serviceStr} ${message}${metaStr}`;
  })
);

// Console format with colors
const consoleFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    const serviceStr = service ? `[${service}]` : '';
    return `${timestamp} ${level}${serviceStr} ${message}${metaStr}`;
  })
);

/**
 * Create Winston logger instance
 */
function createLogger(options = {}) {
  const {
    service = 'app',
    logLevel = process.env.LOG_LEVEL || 'info',
    logToFile = true,
    logDir = path.join(__dirname, '../../logs'),
    logFile = `${service}.log`
  } = options;

  const transports = [];

  // Console transport
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: logLevel
    })
  );

  // File transport (if enabled)
  if (logToFile) {
    // Ensure log directory exists
    const fs = require('fs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    transports.push(
      new winston.transports.File({
        filename: path.join(logDir, logFile),
        format: customFormat,
        level: logLevel,
        maxsize: 5242880, // 5MB
        maxFiles: 5
      })
    );

    // Separate error file
    transports.push(
      new winston.transports.File({
        filename: path.join(logDir, `${service}-error.log`),
        level: 'error',
        format: customFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5
      })
    );
  }

  return winston.createLogger({
    level: logLevel,
    levels: logLevels,
    defaultMeta: { service },
    transports,
    exitOnError: false
  });
}

// Create default logger instance
const defaultLogger = createLogger();

/**
 * Logger class wrapper for backward compatibility
 */
class Logger {
  constructor(options = {}) {
    this.winston = createLogger(options);
  }

  error(message, meta = {}) {
    this.winston.error(message, meta);
  }

  warn(message, meta = {}) {
    this.winston.warn(message, meta);
  }

  info(message, meta = {}) {
    this.winston.info(message, meta);
  }

  debug(message, meta = {}) {
    this.winston.debug(message, meta);
  }

  trace(message, meta = {}) {
    this.winston.log('trace', message, meta);
  }

  success(message, meta = {}) {
    this.winston.info(`✅ ${message}`, meta);
  }

  child(service) {
    return new Logger({ service: `${this.winston.defaultMeta?.service || 'app'}:${service}` });
  }

  clearLogs() {
    // Clear all log files
    const fs = require('fs');
    const logDir = path.join(__dirname, '../../logs');
    
    if (fs.existsSync(logDir)) {
      const files = fs.readdirSync(logDir);
      files.forEach(file => {
        if (file.endsWith('.log')) {
          fs.unlinkSync(path.join(logDir, file));
        }
      });
    }
  }

  getLogPath() {
    return path.join(__dirname, '../../logs', `${this.winston.defaultMeta?.service || 'app'}.log`);
  }
}

// Export both class, default instance, and factory function
module.exports = Logger;
module.exports.logger = defaultLogger;
module.exports.default = defaultLogger;
module.exports.createLogger = createLogger;
