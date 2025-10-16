/**
 * Cache Middleware
 * Provides caching functionality for API routes
 * 
 * Features:
 * - Automatic response caching
 * - Cache key generation
 * - Cache invalidation
 * - Conditional caching
 * - Cache headers
 */

const redisCache = require('../src/cache/RedisCache');
const logger = require('../utils/logger');

/**
 * Create cache middleware
 * @param {Object} options - Cache options
 * @param {number} options.ttl - Time to live in seconds
 * @param {string} options.keyPrefix - Cache key prefix
 * @param {Function} options.keyGenerator - Custom key generator
 * @param {Function} options.condition - Condition to cache
 */
function cacheMiddleware(options = {}) {
  const {
    ttl = 600,
    keyPrefix = 'api',
    keyGenerator = null,
    condition = null
  } = options;

  return async (req, res, next) => {
    // Skip if cache is disabled
    if (!redisCache.isEnabled()) {
      return next();
    }

    // Check condition
    if (condition && !condition(req)) {
      return next();
    }

    // Generate cache key
    const cacheKey = keyGenerator 
      ? keyGenerator(req)
      : generateDefaultKey(req, keyPrefix);

    try {
      // Try to get from cache
      const cachedData = await redisCache.get(cacheKey);

      if (cachedData) {
        // Cache hit
        logger.debug(`Cache HIT for ${req.path}`);
        
        // Add cache headers
        res.set('X-Cache', 'HIT');
        res.set('X-Cache-Key', cacheKey);
        
        return res.json(cachedData);
      }

      // Cache miss - intercept response
      logger.debug(`Cache MISS for ${req.path}`);
      res.set('X-Cache', 'MISS');

      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json method to cache response
      res.json = function(data) {
        // Only cache successful responses
        if (res.statusCode === 200 && data) {
          redisCache.set(cacheKey, data, ttl).catch(error => {
            logger.error('Failed to cache response:', error.message);
          });
        }

        // Call original json method
        return originalJson(data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error.message);
      next();
    }
  };
}

/**
 * Generate default cache key
 */
function generateDefaultKey(req, prefix) {
  const path = req.path;
  const method = req.method;
  
  // For GET requests, use query params
  // For POST requests, use body
  const params = method === 'GET' 
    ? JSON.stringify(req.query)
    : JSON.stringify(req.body);
  
  const userId = req.user?.id || 'anonymous';
  
  return `${prefix}:${method}:${path}:${userId}:${params}`;
}

/**
 * Cache middleware for flight searches
 */
const cacheFlightSearch = cacheMiddleware({
  ttl: parseInt(process.env.REDIS_TTL_FLIGHT || '300'),
  keyPrefix: 'flight',
  keyGenerator: (req) => {
    const query = {
      from: req.body.from || req.query.from,
      to: req.body.to || req.query.to,
      date: req.body.departureDate || req.query.departureDate,
      adults: req.body.adults || req.query.adults || 1
    };
    return redisCache.generateKey('flight', query);
  }
});

/**
 * Cache middleware for hotel searches
 */
const cacheHotelSearch = cacheMiddleware({
  ttl: parseInt(process.env.REDIS_TTL_HOTEL || '3600'),
  keyPrefix: 'hotel',
  keyGenerator: (req) => {
    const query = {
      city: req.body.city || req.query.city,
      checkIn: req.body.checkIn || req.query.checkIn,
      checkOut: req.body.checkOut || req.query.checkOut,
      guests: req.body.guests || req.query.guests || 1
    };
    return redisCache.generateKey('hotel', query);
  }
});

/**
 * Cache middleware for location searches
 */
const cacheLocationSearch = cacheMiddleware({
  ttl: parseInt(process.env.REDIS_TTL_LOCATION || '86400'),
  keyPrefix: 'location',
  keyGenerator: (req) => {
    const query = req.query.q || req.query.query || req.params.query;
    return redisCache.generateKey('location', query);
  }
});

/**
 * Cache middleware for AI responses
 */
const cacheAIResponse = cacheMiddleware({
  ttl: parseInt(process.env.REDIS_TTL_AI || '1800'),
  keyPrefix: 'ai',
  keyGenerator: (req) => {
    const message = req.body.message || '';
    const mode = req.body.mode || 'text';
    return redisCache.generateKey('ai', `${mode}:${message}`);
  },
  condition: (req) => {
    // Only cache non-personalized AI responses
    return !req.body.userId && !req.user?.id;
  }
});

/**
 * Invalidate cache middleware
 * Use this after POST/PUT/DELETE operations
 */
function invalidateCacheMiddleware(pattern) {
  return async (req, res, next) => {
    if (!redisCache.isEnabled()) {
      return next();
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to invalidate cache after response
    res.json = function(data) {
      // Invalidate cache if operation was successful
      if (res.statusCode >= 200 && res.statusCode < 300) {
        redisCache.delPattern(pattern).catch(error => {
          logger.error('Failed to invalidate cache:', error.message);
        });
      }

      // Call original json method
      return originalJson(data);
    };

    next();
  };
}

/**
 * Cache warming middleware
 * Pre-populate cache with common queries
 */
async function warmCache(queries, cacheFunction) {
  if (!redisCache.isEnabled()) {
    logger.warn('Cache warming skipped - Redis not enabled');
    return;
  }

  logger.info(`🔥 Warming cache with ${queries.length} queries...`);

  for (const query of queries) {
    try {
      await cacheFunction(query);
    } catch (error) {
      logger.error(`Failed to warm cache for query:`, error.message);
    }
  }

  logger.info('✅ Cache warming completed');
}

/**
 * Cache statistics middleware
 * Adds cache stats to response headers
 */
function cacheStatsMiddleware(req, res, next) {
  if (redisCache.isEnabled()) {
    const stats = redisCache.getStats();
    res.set('X-Cache-Stats', JSON.stringify(stats));
  }
  next();
}

/**
 * Simple cache middleware that accepts TTL
 * @param {number} ttl - Time to live in seconds
 */
function cache(ttl = 600) {
  return cacheMiddleware({ ttl });
}

module.exports = {
  cacheMiddleware,
  cache,
  cacheFlightSearch,
  cacheHotelSearch,
  cacheLocationSearch,
  cacheAIResponse,
  invalidateCacheMiddleware,
  warmCache,
  cacheStatsMiddleware
};
