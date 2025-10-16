/**
 * External API Rate Limiter
 * Limits calls to external APIs (Kiwi, Booking.com, Mapbox) per user
 */

const logger = require('../utils/logger');

class ExternalAPILimiter {
  constructor() {
    this.limits = new Map();
    this.cleanupInterval = 60000; // 1 minute
    
    // API limits configuration
    this.config = {
      kiwi: {
        requestsPerMinute: 5,
        requestsPerHour: 50
      },
      bookingCom: {
        requestsPerMinute: 5,
        requestsPerHour: 50
      },
      mapbox: {
        requestsPerMinute: 10,
        requestsPerHour: 100
      }
    };
    
    this.startCleanup();
    logger.info('🚦 External API Limiter initialized');
  }

  /**
   * Check if request is allowed
   * @param {string} userId - User ID
   * @param {string} api - API name (kiwi, bookingCom, mapbox)
   * @returns {Object} Result
   */
  checkLimit(userId, api) {
    const key = `${userId}:${api}`;
    const now = Date.now();
    
    // Get or create user limits
    if (!this.limits.has(key)) {
      this.limits.set(key, {
        minute: [],
        hour: []
      });
    }
    
    const userLimits = this.limits.get(key);
    const apiConfig = this.config[api];
    
    if (!apiConfig) {
      logger.warn('⚠️ Unknown API', { api });
      return {
        allowed: true,
        warning: `Unknown API: ${api}`
      };
    }
    
    // Clean old entries
    userLimits.minute = userLimits.minute.filter(t => now - t < 60000);
    userLimits.hour = userLimits.hour.filter(t => now - t < 3600000);
    
    // Check minute limit
    if (userLimits.minute.length >= apiConfig.requestsPerMinute) {
      const oldestMinute = userLimits.minute[0];
      const retryAfter = Math.ceil((60000 - (now - oldestMinute)) / 1000);
      
      logger.warn('⚠️ Minute limit exceeded', {
        userId,
        api,
        limit: apiConfig.requestsPerMinute,
        retryAfter
      });
      
      return {
        allowed: false,
        error: 'Rate limit exceeded (per minute)',
        retryAfter,
        limit: apiConfig.requestsPerMinute,
        window: '1 minute'
      };
    }
    
    // Check hour limit
    if (userLimits.hour.length >= apiConfig.requestsPerHour) {
      const oldestHour = userLimits.hour[0];
      const retryAfter = Math.ceil((3600000 - (now - oldestHour)) / 1000);
      
      logger.warn('⚠️ Hour limit exceeded', {
        userId,
        api,
        limit: apiConfig.requestsPerHour,
        retryAfter
      });
      
      return {
        allowed: false,
        error: 'Rate limit exceeded (per hour)',
        retryAfter,
        limit: apiConfig.requestsPerHour,
        window: '1 hour'
      };
    }
    
    // Record request
    userLimits.minute.push(now);
    userLimits.hour.push(now);
    
    return {
      allowed: true,
      remaining: {
        minute: apiConfig.requestsPerMinute - userLimits.minute.length,
        hour: apiConfig.requestsPerHour - userLimits.hour.length
      }
    };
  }

  /**
   * Express middleware
   * @param {string} api - API name
   * @returns {Function} Middleware function
   */
  middleware(api) {
    return (req, res, next) => {
      const userId = req.user?.id || req.ip;
      
      const result = this.checkLimit(userId, api);
      
      if (!result.allowed) {
        return res.status(429).json({
          success: false,
          error: result.error,
          retryAfter: result.retryAfter,
          limit: result.limit,
          window: result.window
        });
      }
      
      // Add rate limit info to response headers
      if (result.remaining) {
        res.setHeader('X-RateLimit-Remaining-Minute', result.remaining.minute);
        res.setHeader('X-RateLimit-Remaining-Hour', result.remaining.hour);
      }
      
      next();
    };
  }

  /**
   * Cleanup old entries
   */
  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, limits] of this.limits.entries()) {
      limits.minute = limits.minute.filter(t => now - t < 60000);
      limits.hour = limits.hour.filter(t => now - t < 3600000);
      
      // Remove empty entries
      if (limits.minute.length === 0 && limits.hour.length === 0) {
        this.limits.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      logger.info('🧹 External API limits cleaned', { cleaned });
    }
  }

  /**
   * Start cleanup interval
   */
  startCleanup() {
    setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  /**
   * Get user stats
   * @param {string} userId - User ID
   * @returns {Object} Stats
   */
  getUserStats(userId) {
    const stats = {};
    
    for (const api of Object.keys(this.config)) {
      const key = `${userId}:${api}`;
      const limits = this.limits.get(key);
      
      if (limits) {
        stats[api] = {
          usedMinute: limits.minute.length,
          usedHour: limits.hour.length,
          limitMinute: this.config[api].requestsPerMinute,
          limitHour: this.config[api].requestsPerHour
        };
      } else {
        stats[api] = {
          usedMinute: 0,
          usedHour: 0,
          limitMinute: this.config[api].requestsPerMinute,
          limitHour: this.config[api].requestsPerHour
        };
      }
    }
    
    return stats;
  }

  /**
   * Reset user limits
   * @param {string} userId - User ID
   * @param {string} api - API name (optional)
   */
  resetUserLimits(userId, api = null) {
    if (api) {
      const key = `${userId}:${api}`;
      this.limits.delete(key);
      logger.info('🔄 User API limits reset', { userId, api });
    } else {
      // Reset all APIs for user
      for (const apiName of Object.keys(this.config)) {
        const key = `${userId}:${apiName}`;
        this.limits.delete(key);
      }
      logger.info('🔄 All user API limits reset', { userId });
    }
  }
}

module.exports = new ExternalAPILimiter();
