/**
 * Sentry Configuration for Error Tracking
 * 
 * Setup Instructions:
 * 1. Create account at https://sentry.io
 * 2. Create new project for Node.js
 * 3. Copy DSN to .env: SENTRY_DSN=your-dsn-here
 * 4. Configure environment (production/staging/development)
 */

const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');

const sentryConfig = {
  // DSN from environment
  dsn: process.env.SENTRY_DSN,
  
  // Environment
  environment: process.env.NODE_ENV || 'development',
  
  // Release tracking (use git commit SHA)
  release: process.env.VERCEL_GIT_COMMIT_SHA || 
           process.env.RAILWAY_GIT_COMMIT_SHA || 
           'development',
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Profiling
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Integrations
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new ProfilingIntegration(),
  ],
  
  // Error filtering
  beforeSend(event, hint) {
    // Don't send errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Sentry Error (not sent in dev):', hint.originalException || hint.syntheticException);
      return null;
    }
    
    // Filter out known errors
    const error = hint.originalException;
    if (error && error.message) {
      const ignorePatterns = [
        'NavigationDuplicated',
        'Request aborted',
        'socket hang up',
        'ECONNREFUSED',
      ];
      
      if (ignorePatterns.some(pattern => error.message.includes(pattern))) {
        return null;
      }
    }
    
    return event;
  },
  
  // Breadcrumbs
  beforeBreadcrumb(breadcrumb, hint) {
    // Don't log HTTP breadcrumbs for health checks
    if (breadcrumb.category === 'http' && 
        breadcrumb.data?.url?.includes('/health')) {
      return null;
    }
    return breadcrumb;
  },
  
  // Ignore specific errors
  ignoreErrors: [
    'Non-Error promise rejection captured',
    'ResizeObserver loop limit exceeded',
    'NavigationDuplicated',
  ],
  
  // Ignore specific URLs
  denyUrls: [
    /localhost/i,
    /127\.0\.0\.1/i,
  ],
  
  // Sample rate for sessions
  sampleRate: 1.0,
  
  // Max breadcrumbs
  maxBreadcrumbs: 50,
  
  // Attach stacktrace
  attachStacktrace: true,
  
  // Debug mode
  debug: process.env.NODE_ENV === 'development',
  
  // Tags
  initialScope: {
    tags: {
      service: 'amrikyy-backend',
      version: '2.0.0',
    },
  },
};

module.exports = sentryConfig;
