/**
 * Sentry Initialization - Error Tracking & Performance Monitoring
 * Secure configuration with proper secret handling
 */

const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');

/**
 * Initialize Sentry with secure configuration
 */
function initializeSentry() {
  // Validate DSN exists
  if (!process.env.SENTRY_DSN) {
    console.warn('⚠️ SENTRY_DSN not configured - error tracking disabled');
    return false;
  }

  try {
    Sentry.init({
      // DSN from environment (never hardcode)
      dsn: process.env.SENTRY_DSN,
      
      // Environment
      environment: process.env.NODE_ENV || 'development',
      
      // Release tracking
      release: `amrikyy-backend@${process.env.npm_package_version || '2.0.0'}`,
      
      // Performance Monitoring
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      
      // Profiling
      profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      
      // Integrations
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new ProfilingIntegration(),
        // Console logging integration
        Sentry.consoleIntegration({ levels: ['error', 'warn'] }),
      ],
      
      // Enable structured logging
      _experiments: {
        enableLogs: true,
      },
      
      // Error filtering - CRITICAL for security
      beforeSend(event, hint) {
        // Never send errors in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Sentry Error (dev mode):', hint.originalException || hint.syntheticException);
          return null;
        }
        
        // Scrub sensitive data from error messages
        if (event.message) {
          event.message = scrubSensitiveData(event.message);
        }
        
        // Scrub sensitive data from exception values
        if (event.exception?.values) {
          event.exception.values = event.exception.values.map(exception => ({
            ...exception,
            value: scrubSensitiveData(exception.value || ''),
          }));
        }
        
        // Scrub sensitive data from breadcrumbs
        if (event.breadcrumbs) {
          event.breadcrumbs = event.breadcrumbs.map(breadcrumb => ({
            ...breadcrumb,
            message: scrubSensitiveData(breadcrumb.message || ''),
            data: scrubSensitiveObject(breadcrumb.data || {}),
          }));
        }
        
        // Scrub request data
        if (event.request) {
          event.request = scrubRequestData(event.request);
        }
        
        // Filter out known non-critical errors
        const error = hint.originalException;
        if (error && error.message) {
          const ignorePatterns = [
            'NavigationDuplicated',
            'Request aborted',
            'socket hang up',
            'ECONNREFUSED',
            'ETIMEDOUT',
          ];
          
          if (ignorePatterns.some(pattern => error.message.includes(pattern))) {
            return null;
          }
        }
        
        return event;
      },
      
      // Breadcrumb filtering
      beforeBreadcrumb(breadcrumb, hint) {
        // Don't log health check requests
        if (breadcrumb.category === 'http' && 
            breadcrumb.data?.url?.includes('/health')) {
          return null;
        }
        
        // Scrub sensitive data from HTTP breadcrumbs
        if (breadcrumb.category === 'http' && breadcrumb.data) {
          breadcrumb.data = scrubSensitiveObject(breadcrumb.data);
        }
        
        return breadcrumb;
      },
      
      // Ignore specific errors
      ignoreErrors: [
        'Non-Error promise rejection captured',
        'ResizeObserver loop limit exceeded',
        'NavigationDuplicated',
        'Network request failed',
        'Failed to fetch',
      ],
      
      // Ignore specific URLs (never send localhost data)
      denyUrls: [
        /localhost/i,
        /127\.0\.0\.1/i,
        /0\.0\.0\.0/i,
      ],
      
      // Sample rate
      sampleRate: 1.0,
      
      // Max breadcrumbs
      maxBreadcrumbs: 50,
      
      // Attach stacktrace
      attachStacktrace: true,
      
      // Debug mode (only in development)
      debug: process.env.NODE_ENV === 'development',
      
      // Initial scope with tags
      initialScope: {
        tags: {
          service: 'amrikyy-backend',
          version: '2.0.0',
          node_version: process.version,
        },
      },
    });

    console.log('✅ Sentry initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Sentry:', error.message);
    return false;
  }
}

/**
 * Scrub sensitive data from strings
 * Removes API keys, tokens, passwords, etc.
 */
function scrubSensitiveData(text) {
  if (!text || typeof text !== 'string') return text;
  
  const patterns = [
    // API Keys
    { pattern: /AIzaSy[A-Za-z0-9_-]{33}/g, replacement: '[REDACTED_GEMINI_KEY]' },
    { pattern: /sk_test_[A-Za-z0-9]{24,}/g, replacement: '[REDACTED_STRIPE_KEY]' },
    { pattern: /sk_live_[A-Za-z0-9]{24,}/g, replacement: '[REDACTED_STRIPE_KEY]' },
    { pattern: /pk_test_[A-Za-z0-9]{24,}/g, replacement: '[REDACTED_STRIPE_KEY]' },
    { pattern: /pk_live_[A-Za-z0-9]{24,}/g, replacement: '[REDACTED_STRIPE_KEY]' },
    
    // Tokens
    { pattern: /Bearer\s+[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, replacement: 'Bearer [REDACTED_JWT]' },
    { pattern: /[0-9]{10}:[A-Za-z0-9_-]{35}/g, replacement: '[REDACTED_TELEGRAM_TOKEN]' },
    
    // Passwords
    { pattern: /"password"\s*:\s*"[^"]+"/g, replacement: '"password":"[REDACTED]"' },
    { pattern: /'password'\s*:\s*'[^']+'/g, replacement: "'password':'[REDACTED]'" },
    
    // Database URLs
    { pattern: /postgres:\/\/[^@]+@[^/]+\/[^\s]+/g, replacement: 'postgres://[REDACTED]' },
    { pattern: /mongodb:\/\/[^@]+@[^/]+\/[^\s]+/g, replacement: 'mongodb://[REDACTED]' },
    { pattern: /redis:\/\/[^@]+@[^/]+/g, replacement: 'redis://[REDACTED]' },
    
    // Credit Cards
    { pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, replacement: '[REDACTED_CARD]' },
    
    // Email addresses (partial redaction)
    { pattern: /([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, replacement: '$1@[REDACTED]' },
  ];
  
  let scrubbedText = text;
  patterns.forEach(({ pattern, replacement }) => {
    scrubbedText = scrubbedText.replace(pattern, replacement);
  });
  
  return scrubbedText;
}

/**
 * Scrub sensitive data from objects
 */
function scrubSensitiveObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sensitiveKeys = [
    'password',
    'token',
    'secret',
    'apiKey',
    'api_key',
    'authorization',
    'cookie',
    'session',
    'jwt',
    'bearer',
    'credit_card',
    'card_number',
    'cvv',
    'ssn',
  ];
  
  const scrubbed = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    
    // Check if key is sensitive
    if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
      scrubbed[key] = '[REDACTED]';
    } else if (typeof value === 'string') {
      scrubbed[key] = scrubSensitiveData(value);
    } else if (typeof value === 'object' && value !== null) {
      scrubbed[key] = scrubSensitiveObject(value);
    } else {
      scrubbed[key] = value;
    }
  }
  
  return scrubbed;
}

/**
 * Scrub sensitive data from HTTP requests
 */
function scrubRequestData(request) {
  const scrubbed = { ...request };
  
  // Scrub headers
  if (scrubbed.headers) {
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];
    scrubbed.headers = { ...scrubbed.headers };
    
    for (const header of sensitiveHeaders) {
      if (scrubbed.headers[header]) {
        scrubbed.headers[header] = '[REDACTED]';
      }
    }
  }
  
  // Scrub query string
  if (scrubbed.query_string) {
    scrubbed.query_string = scrubSensitiveData(scrubbed.query_string);
  }
  
  // Scrub POST data
  if (scrubbed.data) {
    scrubbed.data = scrubSensitiveObject(scrubbed.data);
  }
  
  return scrubbed;
}

/**
 * Capture exception with context
 */
function captureException(error, context = {}) {
  if (!Sentry.isInitialized()) {
    console.error('Sentry not initialized:', error);
    return;
  }
  
  Sentry.withScope((scope) => {
    // Add context
    if (context.user) {
      scope.setUser(scrubSensitiveObject(context.user));
    }
    
    if (context.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }
    
    if (context.extra) {
      scope.setExtras(scrubSensitiveObject(context.extra));
    }
    
    // Capture exception
    Sentry.captureException(error);
  });
}

/**
 * Create custom span for performance tracking
 */
function startSpan(options, callback) {
  if (!Sentry.isInitialized()) {
    return callback();
  }
  
  return Sentry.startSpan(options, callback);
}

/**
 * Get Sentry logger
 */
function getLogger() {
  return Sentry.logger || console;
}

module.exports = {
  initializeSentry,
  captureException,
  startSpan,
  getLogger,
  Sentry,
};
