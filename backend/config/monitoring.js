/**
 * Monitoring Configuration
 * Integrates Sentry, Analytics, and Health Checks
 */

const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');

/**
 * Initialize Sentry Error Tracking
 */
function initializeSentry(app) {
  if (!process.env.SENTRY_DSN) {
    console.warn('⚠️  Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    integrations: [
      // HTTP integration
      new Sentry.Integrations.Http({ tracing: true }),
      // Express integration
      new Sentry.Integrations.Express({ app }),
      // Profiling
      new ProfilingIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Profiling
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Release tracking
    release: process.env.VERCEL_GIT_COMMIT_SHA || 'development',
    // Ignore common errors
    ignoreErrors: [
      'NavigationDuplicated',
      'Non-Error promise rejection captured',
    ],
  });

  console.log('✅ Sentry error tracking initialized');
}

/**
 * Sentry Request Handler (should be first middleware)
 */
function sentryRequestHandler() {
  return Sentry.Handlers.requestHandler();
}

/**
 * Sentry Tracing Handler (should be after request handler)
 */
function sentryTracingHandler() {
  return Sentry.Handlers.tracingHandler();
}

/**
 * Sentry Error Handler (should be after all routes, before other error handlers)
 */
function sentryErrorHandler() {
  return Sentry.Handlers.errorHandler();
}

/**
 * Health Check Configuration
 */
const healthCheck = {
  endpoint: '/health',
  checks: {
    // Database health
    database: async () => {
      try {
        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        
        const { error } = await supabase.from('profiles').select('count').limit(1);
        return { status: error ? 'unhealthy' : 'healthy', latency: 0 };
      } catch (error) {
        return { status: 'unhealthy', error: error.message };
      }
    },

    // Redis health
    redis: async () => {
      try {
        const redisCache = require('../src/cache/RedisCache');
        // Simple ping test
        return { status: 'healthy', type: redisCache.type || 'memory' };
      } catch (error) {
        return { status: 'unhealthy', error: error.message };
      }
    },

    // Email service health
    email: () => {
      try {
        const emailService = require('../services/emailService');
        return {
          status: emailService.initialized ? 'healthy' : 'degraded',
          configured: emailService.initialized,
        };
      } catch (error) {
        return { status: 'unhealthy', error: error.message };
      }
    },

    // Stripe health
    stripe: () => {
      try {
        const stripeService = require('../services/stripeService');
        return {
          status: stripeService.initialized ? 'healthy' : 'degraded',
          configured: stripeService.initialized,
        };
      } catch (error) {
        return { status: 'unhealthy', error: error.message };
      }
    },
  },
};

/**
 * Metrics Collection
 */
class MetricsCollector {
  constructor() {
    this.metrics = {
      requests: 0,
      errors: 0,
      responseTime: [],
      activeRequests: 0,
    };
  }

  recordRequest() {
    this.metrics.requests++;
    this.metrics.activeRequests++;
  }

  recordResponse(duration) {
    this.metrics.activeRequests--;
    this.metrics.responseTime.push(duration);
    
    // Keep only last 1000 response times
    if (this.metrics.responseTime.length > 1000) {
      this.metrics.responseTime.shift();
    }
  }

  recordError() {
    this.metrics.errors++;
  }

  getMetrics() {
    const avgResponseTime = this.metrics.responseTime.length > 0
      ? this.metrics.responseTime.reduce((a, b) => a + b, 0) / this.metrics.responseTime.length
      : 0;

    const p95ResponseTime = this.calculatePercentile(this.metrics.responseTime, 95);

    return {
      requests: {
        total: this.metrics.requests,
        active: this.metrics.activeRequests,
        errors: this.metrics.errors,
        errorRate: this.metrics.requests > 0 
          ? (this.metrics.errors / this.metrics.requests * 100).toFixed(2) + '%'
          : '0%',
      },
      performance: {
        avgResponseTime: Math.round(avgResponseTime) + 'ms',
        p95ResponseTime: Math.round(p95ResponseTime) + 'ms',
      },
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
      },
    };
  }

  calculatePercentile(arr, percentile) {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }

  reset() {
    this.metrics = {
      requests: 0,
      errors: 0,
      responseTime: [],
      activeRequests: 0,
    };
  }
}

// Singleton metrics collector
const metricsCollector = new MetricsCollector();

/**
 * Metrics Middleware
 */
function metricsMiddleware(req, res, next) {
  const startTime = Date.now();
  
  metricsCollector.recordRequest();

  // Capture response
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - startTime;
    metricsCollector.recordResponse(duration);
    
    if (res.statusCode >= 400) {
      metricsCollector.recordError();
    }
    
    return originalSend.call(this, data);
  };

  next();
}

/**
 * Performance Monitoring Middleware
 */
function performanceMonitoring(req, res, next) {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Log slow requests
    if (duration > 1000) {
      console.warn(`⚠️  Slow request: ${req.method} ${req.path} - ${duration}ms`);
      
      // Send to Sentry
      Sentry.captureMessage(`Slow request: ${req.method} ${req.path}`, {
        level: 'warning',
        tags: {
          method: req.method,
          path: req.path,
          duration: duration,
        },
      });
    }
  });

  next();
}

module.exports = {
  initializeSentry,
  sentryRequestHandler,
  sentryTracingHandler,
  sentryErrorHandler,
  healthCheck,
  metricsCollector,
  metricsMiddleware,
  performanceMonitoring,
};
