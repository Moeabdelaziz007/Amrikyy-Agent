/**
 * Simple Logger for AIX System
 * 
 * Basic logger implementation for testing and development
 */

class Logger {
  constructor(module = 'default') {
    this.module = module;
  }

  child(module) {
    return new Logger(module);
  }

  info(message, meta = {}) {
    console.log(`[INFO] [${this.module}] ${message}`, meta);
  }

  debug(message, meta = {}) {
    console.log(`[DEBUG] [${this.module}] ${message}`, meta);
  }

  error(message, meta = {}) {
    console.error(`[ERROR] [${this.module}] ${message}`, meta);
  }

  warn(message, meta = {}) {
    console.warn(`[WARN] [${this.module}] ${message}`, meta);
  }

  success(message, meta = {}) {
    console.log(`[SUCCESS] [${this.module}] ✅ ${message}`, meta);
  }
}

module.exports = {
  logger: new Logger()
};