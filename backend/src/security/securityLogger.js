/**
 * Security Event Logger
 * CRITICAL: Logs all security-related events for monitoring and auditing
 */

const winston = require('winston');
const path = require('path');

// Create security-specific logger
const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'security-monitor' },
  transports: [
    // Security log file
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/security.log'),
      level: 'info',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true,
    }),
    // Critical security events
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/security-critical.log'),
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 10,
      tailable: true,
    }),
  ],
});

// Add console transport for development
if (process.env.NODE_ENV === 'development') {
  securityLogger.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    })
  );
}

class SecurityLogger {
  /**
   * Log API key access
   */
  logKeyAccess(keyName, context = {}) {
    securityLogger.warn('API key accessed', {
      event: 'key_access',
      keyName,
      context,
      timestamp: new Date().toISOString(),
      severity: 'medium',
    });
  }

  /**
   * Log authentication failure
   */
  logAuthFailure(reason, ip, userAgent) {
    securityLogger.error('Authentication failed', {
      event: 'auth_failure',
      reason,
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
      severity: 'high',
    });
  }

  /**
   * Log suspicious activity
   */
  logSuspiciousActivity(activity, details) {
    securityLogger.error('Suspicious activity detected', {
      event: 'suspicious_activity',
      activity,
      details,
      timestamp: new Date().toISOString(),
      severity: 'critical',
    });
  }

  /**
   * Log environment validation failure
   */
  logEnvValidationFailure(errors) {
    securityLogger.error('Environment validation failed', {
      event: 'env_validation_failure',
      errors,
      timestamp: new Date().toISOString(),
      severity: 'critical',
    });
  }

  /**
   * Log secret detection
   */
  logSecretDetection(filePath, secretType) {
    securityLogger.error('Secret detected in code', {
      event: 'secret_detection',
      filePath,
      secretType,
      timestamp: new Date().toISOString(),
      severity: 'critical',
    });
  }

  /**
   * Log rate limit exceeded
   */
  logRateLimitExceeded(ip, endpoint, limit) {
    securityLogger.warn('Rate limit exceeded', {
      event: 'rate_limit_exceeded',
      ip,
      endpoint,
      limit,
      timestamp: new Date().toISOString(),
      severity: 'medium',
    });
  }

  /**
   * Log security configuration change
   */
  logSecurityConfigChange(config, changedBy) {
    securityLogger.info('Security configuration changed', {
      event: 'security_config_change',
      config,
      changedBy,
      timestamp: new Date().toISOString(),
      severity: 'info',
    });
  }

  /**
   * Log system startup
   */
  logSystemStartup(version, environment) {
    securityLogger.info('System startup', {
      event: 'system_startup',
      version,
      environment,
      timestamp: new Date().toISOString(),
      severity: 'info',
    });
  }

  /**
   * Log system shutdown
   */
  logSystemShutdown(reason) {
    securityLogger.info('System shutdown', {
      event: 'system_shutdown',
      reason,
      timestamp: new Date().toISOString(),
      severity: 'info',
    });
  }

  /**
   * Get security metrics
   */
  async getSecurityMetrics(timeframe = '24h') {
    // This would typically query a database or log aggregation service
    return {
      totalEvents: 0,
      criticalEvents: 0,
      authFailures: 0,
      rateLimitExceeded: 0,
      suspiciousActivities: 0,
      timeframe,
    };
  }
}

// Export singleton instance
const securityLoggerInstance = new SecurityLogger();

module.exports = {
  SecurityLogger,
  securityLogger: securityLoggerInstance,
  // Convenience methods
  logKeyAccess: (keyName, context) => securityLoggerInstance.logKeyAccess(keyName, context),
  logAuthFailure: (reason, ip, userAgent) =>
    securityLoggerInstance.logAuthFailure(reason, ip, userAgent),
  logSuspiciousActivity: (activity, details) =>
    securityLoggerInstance.logSuspiciousActivity(activity, details),
  logEnvValidationFailure: (errors) => securityLoggerInstance.logEnvValidationFailure(errors),
  logSecretDetection: (filePath, secretType) =>
    securityLoggerInstance.logSecretDetection(filePath, secretType),
  logRateLimitExceeded: (ip, endpoint, limit) =>
    securityLoggerInstance.logRateLimitExceeded(ip, endpoint, limit),
  logSecurityConfigChange: (config, changedBy) =>
    securityLoggerInstance.logSecurityConfigChange(config, changedBy),
  logSystemStartup: (version, environment) =>
    securityLoggerInstance.logSystemStartup(version, environment),
  logSystemShutdown: (reason) => securityLoggerInstance.logSystemShutdown(reason),
};
