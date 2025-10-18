const winston = require('winston');

// Create logger for performance monitoring
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'maya-travel-agent' },
  transports: [
    new winston.transports.File({ filename: 'logs/performance.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ],
});

// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
  const startTime = Date.now();
  const requestId = generateRequestId();

  // Add request ID to response headers
  res.setHeader('X-Request-ID', requestId);

  // Log request start
  logger.info('Request started', {
    requestId,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Override res.json to capture response
  const originalJson = res.json;
  res.json = function(body) {
    const duration = Date.now() - startTime;

    // Log response
    logger.info('Request completed', {
      requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      responseSize: JSON.stringify(body).length,
      timestamp: new Date().toISOString()
    });

    // Performance alerts
    if (duration > 5000) {
      logger.warn('Slow request detected', {
        requestId,
        duration: `${duration}ms`,
        url: req.url,
        method: req.method
      });
    }

    if (res.statusCode >= 400) {
      logger.error('Error response', {
        requestId,
        statusCode: res.statusCode,
        error: body.error || 'Unknown error',
        url: req.url
      });
    }

    return originalJson.call(this, body);
  };

  next();
};

// Generate unique request ID
function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Error monitoring middleware
const errorMonitor = (err, req, res, next) => {
  const requestId = req.get('X-Request-ID') || generateRequestId();

  logger.error('Unhandled error', {
    requestId,
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Send error to external monitoring service (if configured)
  if (process.env.ERROR_WEBHOOK_URL) {
    fetch(process.env.ERROR_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requestId,
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
      })
    }).catch(monitoringError => {
      console.error('Failed to send error to monitoring service:', monitoringError);
    });
  }

  next(err);
};

// Cache performance metrics
const cacheMetrics = {
  hits: 0,
  misses: 0,
  errors: 0,

  recordHit: () => {
    cacheMetrics.hits++;
  },

  recordMiss: () => {
    cacheMetrics.misses++;
  },

  recordError: () => {
    cacheMetrics.errors++;
  },

  getStats: () => {
    const total = cacheMetrics.hits + cacheMetrics.misses;
    return {
      hits: cacheMetrics.hits,
      misses: cacheMetrics.misses,
      errors: cacheMetrics.errors,
      hitRate: total > 0 ? (cacheMetrics.hits / total * 100).toFixed(2) + '%' : '0%'
    };
  }
};

// Export middleware and utilities
module.exports = {
  performanceMonitor,
  errorMonitor,
  cacheMetrics,
  logger
};
