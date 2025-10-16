/**
 * Analytics Middleware
 * Automatically tracks all API requests and responses
 * 
 * Features:
 * - Automatic request tracking
 * - Response time measurement
 * - User identification
 * - Error tracking
 * - Performance monitoring
 */

const dataCollector = require('../src/analytics/DataCollector');
const logger = require('../utils/logger');

/**
 * Main analytics middleware
 * Tracks every request that passes through the API
 */
function analyticsMiddleware(req, res, next) {
  const startTime = Date.now();
  
  // Extract user information
  const userId = extractUserId(req);
  const action = `${req.method} ${req.path}`;
  
  // Track user action
  dataCollector.trackUserAction(userId, action, {
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    sessionId: req.session?.id || null,
    timestamp: new Date().toISOString()
  });

  // Track response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const success = res.statusCode < 400;
    
    // Track performance
    dataCollector.trackPerformance(action, duration, {
      statusCode: res.statusCode,
      success,
      method: req.method,
      path: req.path,
      userId
    });

    // Log slow requests
    if (duration > 1000) {
      logger.warn(`⚠️ Slow request: ${action} took ${duration}ms`);
    }
  });

  next();
}

/**
 * Track search queries
 * Use this middleware on search endpoints
 */
function trackSearchMiddleware(searchType) {
  return (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);
    
    // Override json method to capture response
    res.json = function(data) {
      // Track search if successful
      if (data.success && data.data) {
        const userId = extractUserId(req);
        const resultsCount = Array.isArray(data.data) 
          ? data.data.length 
          : data.data.results?.length || 0;
        
        dataCollector.trackSearch(userId, searchType, req.body || req.query, resultsCount, {
          timestamp: new Date().toISOString(),
          path: req.path
        });
      }
      
      // Call original json method
      return originalJson(data);
    };
    
    next();
  };
}

/**
 * Track booking attempts
 * Use this middleware on booking endpoints
 */
function trackBookingMiddleware(bookingType) {
  return (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);
    
    // Override json method to capture response
    res.json = function(data) {
      // Track booking if attempted
      if (data.booking || data.data?.booking) {
        const userId = extractUserId(req);
        const booking = data.booking || data.data.booking;
        
        dataCollector.trackBooking(
          userId,
          bookingType,
          booking.amount || booking.price || 0,
          data.success === true,
          {
            bookingId: booking.id,
            currency: booking.currency || 'USD',
            failureReason: data.error || null,
            timestamp: new Date().toISOString()
          }
        );
      }
      
      // Call original json method
      return originalJson(data);
    };
    
    next();
  };
}

/**
 * Track API calls to external services
 * Use this to wrap external API calls
 */
function trackExternalAPICall(service, endpoint, promise) {
  const startTime = Date.now();
  
  return promise
    .then(response => {
      const duration = Date.now() - startTime;
      
      dataCollector.trackAPICall(service, endpoint, duration, true, {
        statusCode: response.status || 200,
        timestamp: new Date().toISOString()
      });
      
      return response;
    })
    .catch(error => {
      const duration = Date.now() - startTime;
      
      dataCollector.trackAPICall(service, endpoint, duration, false, {
        statusCode: error.response?.status || 500,
        errorMessage: error.message,
        timestamp: new Date().toISOString()
      });
      
      throw error;
    });
}

/**
 * Error tracking middleware
 * Should be added after all routes
 */
function errorTrackingMiddleware(err, req, res, next) {
  // Track error
  dataCollector.trackError(
    err.name || 'Error',
    err.message,
    err.stack,
    {
      userId: extractUserId(req),
      path: req.path,
      method: req.method,
      statusCode: err.statusCode || 500,
      timestamp: new Date().toISOString()
    }
  );

  // Pass to next error handler
  next(err);
}

/**
 * Extract user ID from request
 */
function extractUserId(req) {
  // Try multiple sources for user ID
  return (
    req.user?.id ||                    // From auth middleware
    req.user?.user_id ||               // Alternative auth format
    req.headers['x-user-id'] ||        // Custom header
    req.session?.userId ||             // From session
    req.query.userId ||                // From query params
    req.body?.userId ||                // From body
    'anonymous'                        // Default
  );
}

/**
 * Analytics summary endpoint middleware
 * Adds analytics data to response
 */
function addAnalyticsSummary(req, res, next) {
  // Store original json method
  const originalJson = res.json.bind(res);
  
  // Override json method to add analytics
  res.json = function(data) {
    // Add analytics summary if requested
    if (req.query.includeAnalytics === 'true') {
      const summary = dataCollector.getAnalyticsSummary('1h');
      data._analytics = {
        summary,
        timestamp: new Date().toISOString()
      };
    }
    
    // Call original json method
    return originalJson(data);
  };
  
  next();
}

/**
 * Rate limit analytics
 * Track rate limit hits
 */
function trackRateLimitHit(req, res, next) {
  // Check if rate limit was hit
  if (res.statusCode === 429) {
    const userId = extractUserId(req);
    
    dataCollector.trackUserAction(userId, 'RATE_LIMIT_HIT', {
      path: req.path,
      method: req.method,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
  }
  
  next();
}

/**
 * Create custom tracking middleware
 */
function createCustomTracker(eventType, extractData) {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);
    
    res.json = function(data) {
      try {
        const customData = extractData(req, res, data);
        if (customData) {
          const userId = extractUserId(req);
          dataCollector.trackUserAction(userId, eventType, customData);
        }
      } catch (error) {
        logger.error(`Error in custom tracker: ${error.message}`);
      }
      
      return originalJson(data);
    };
    
    next();
  };
}

module.exports = {
  analyticsMiddleware,
  trackSearchMiddleware,
  trackBookingMiddleware,
  trackExternalAPICall,
  errorTrackingMiddleware,
  addAnalyticsSummary,
  trackRateLimitHit,
  createCustomTracker,
  extractUserId
};
