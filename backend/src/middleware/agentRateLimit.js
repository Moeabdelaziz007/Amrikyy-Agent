/**
 * Agent Rate Limiting Middleware
 * Implements rate limiting per agent and operation
 *
 * Features:
 * - Per-agent rate limits
 * - Per-operation rate limits
 * - Per-user rate limits
 * - Redis-based distributed rate limiting
 * - Memory-based fallback
 *
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-22
 */

const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('redis');
const logger = require('../utils/logger');

// Redis client for distributed rate limiting
let redisClient = null;
let redisAvailable = false;

// Initialize Redis client
async function initializeRedis() {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        connectTimeout: 5000,
      },
    });

    await redisClient.connect();
    redisAvailable = true;

    logger.info('[RateLimit] Redis connected for distributed rate limiting');
  } catch (error) {
    logger.warn('[RateLimit] Redis not available, using memory store:', error.message);
    redisAvailable = false;
  }
}

// Initialize on module load
initializeRedis();

/**
 * Rate limit configurations by agent
 */
const rateLimitConfigs = {
  // Global rate limit (all agents combined)
  global: {
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: 'Too many requests, please try again later',
  },

  // Travel Agent
  travel: {
    default: {
      windowMs: 60 * 1000,
      max: 60, // 60 requests per minute
      message: 'Too many requests to Travel Agent',
    },
    searchFlights: {
      windowMs: 60 * 1000,
      max: 20, // 20 flight searches per minute
      message: 'Too many flight searches, please try again later',
    },
    searchHotels: {
      windowMs: 60 * 1000,
      max: 20, // 20 hotel searches per minute
      message: 'Too many hotel searches, please try again later',
    },
    generateItinerary: {
      windowMs: 60 * 1000,
      max: 10, // 10 itinerary generations per minute
      message: 'Too many itinerary requests, please try again later',
    },
  },

  // Content Agent
  content: {
    default: {
      windowMs: 60 * 1000,
      max: 30, // 30 requests per minute
      message: 'Too many requests to Content Agent',
    },
    generateBlogPost: {
      windowMs: 60 * 1000,
      max: 5, // 5 blog posts per minute (expensive operation)
      message: 'Too many blog post requests, please try again later',
    },
    generateSocialPosts: {
      windowMs: 60 * 1000,
      max: 10,
      message: 'Too many social post requests, please try again later',
    },
    generateVideoScript: {
      windowMs: 60 * 1000,
      max: 5,
      message: 'Too many video script requests, please try again later',
    },
  },

  // Innovation Agent
  innovation: {
    default: {
      windowMs: 60 * 1000,
      max: 30,
      message: 'Too many requests to Innovation Agent',
    },
    generateIdeas: {
      windowMs: 60 * 1000,
      max: 10,
      message: 'Too many idea generation requests, please try again later',
    },
    analyzeTrends: {
      windowMs: 60 * 1000,
      max: 15,
      message: 'Too many trend analysis requests, please try again later',
    },
    analyzeCompetitors: {
      windowMs: 60 * 1000,
      max: 10,
      message: 'Too many competitor analysis requests, please try again later',
    },
  },

  // Admin operations (more restrictive)
  admin: {
    windowMs: 60 * 1000,
    max: 10, // 10 admin operations per minute
    message: 'Too many admin operations, please try again later',
  },
};

/**
 * Create rate limiter
 */
function createRateLimiter(config) {
  const options = {
    windowMs: config.windowMs,
    max: config.max,
    message: {
      success: false,
      error: config.message,
      retryAfter: null, // Will be set dynamically
    },
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false,

    // Custom key generator (per-user or per-IP)
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise IP
      return req.user?.id || req.ip;
    },

    // Custom handler for rate limit exceeded
    handler: (req, res) => {
      const retryAfter = Math.ceil(config.windowMs / 1000);

      logger.warn('[RateLimit] Rate limit exceeded', {
        ip: req.ip,
        userId: req.user?.id,
        path: req.path,
        method: req.method,
      });

      res.status(429).json({
        success: false,
        error: config.message,
        retryAfter: retryAfter,
        limit: config.max,
        window: `${config.windowMs / 1000}s`,
      });
    },

    // Skip successful requests (only count failed ones)
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  };

  // Use Redis store if available
  if (redisAvailable && redisClient) {
    options.store = new RedisStore({
      client: redisClient,
      prefix: 'ratelimit:',
    });
  }

  return rateLimit(options);
}

/**
 * Global rate limiter
 */
const globalLimiter = createRateLimiter(rateLimitConfigs.global);

/**
 * Agent-specific rate limiters
 */
const agentLimiters = {
  travel: createRateLimiter(rateLimitConfigs.travel.default),
  content: createRateLimiter(rateLimitConfigs.content.default),
  innovation: createRateLimiter(rateLimitConfigs.innovation.default),
  admin: createRateLimiter(rateLimitConfigs.admin),
};

/**
 * Operation-specific rate limiters
 */
const operationLimiters = {
  travel: {
    searchFlights: createRateLimiter(rateLimitConfigs.travel.searchFlights),
    searchHotels: createRateLimiter(rateLimitConfigs.travel.searchHotels),
    generateItinerary: createRateLimiter(rateLimitConfigs.travel.generateItinerary),
  },
  content: {
    generateBlogPost: createRateLimiter(rateLimitConfigs.content.generateBlogPost),
    generateSocialPosts: createRateLimiter(rateLimitConfigs.content.generateSocialPosts),
    generateVideoScript: createRateLimiter(rateLimitConfigs.content.generateVideoScript),
  },
  innovation: {
    generateIdeas: createRateLimiter(rateLimitConfigs.innovation.generateIdeas),
    analyzeTrends: createRateLimiter(rateLimitConfigs.innovation.analyzeTrends),
    analyzeCompetitors: createRateLimiter(rateLimitConfigs.innovation.analyzeCompetitors),
  },
};

/**
 * Get rate limiter for agent
 */
function getAgentLimiter(agentName) {
  const limiter = agentLimiters[agentName];

  if (!limiter) {
    logger.warn(`[RateLimit] No limiter found for agent: ${agentName}, using global`);
    return globalLimiter;
  }

  return limiter;
}

/**
 * Get rate limiter for specific operation
 */
function getOperationLimiter(agentName, operation) {
  const limiter = operationLimiters[agentName]?.[operation];

  if (!limiter) {
    logger.warn(`[RateLimit] No limiter found for ${agentName}.${operation}, using agent default`);
    return getAgentLimiter(agentName);
  }

  return limiter;
}

/**
 * Dynamic rate limiter middleware
 * Applies the correct rate limiter based on route
 */
function dynamicRateLimiter(req, res, next) {
  const agentName = req.params.agent;
  const operation = req.params.operation;

  let limiter;

  if (operation) {
    // Use operation-specific limiter
    limiter = getOperationLimiter(agentName, operation);
  } else if (agentName) {
    // Use agent-specific limiter
    limiter = getAgentLimiter(agentName);
  } else {
    // Use global limiter
    limiter = globalLimiter;
  }

  return limiter(req, res, next);
}

/**
 * Admin operations limiter
 */
const adminLimiter = agentLimiters.admin;

/**
 * Custom rate limit for specific scenarios
 */
function createCustomLimiter(options) {
  return createRateLimiter({
    windowMs: options.windowMs || 60000,
    max: options.max || 10,
    message: options.message || 'Too many requests',
  });
}

/**
 * Bypass rate limiting for certain conditions
 */
function bypassRateLimit(req, res, next) {
  // Bypass for certain users/roles
  if (req.user?.role === 'admin' || req.user?.role === 'internal') {
    return next();
  }

  // Bypass for certain IP addresses (whitelisted)
  const whitelist = process.env.RATE_LIMIT_WHITELIST?.split(',') || [];
  if (whitelist.includes(req.ip)) {
    return next();
  }

  // Apply rate limiting
  return dynamicRateLimiter(req, res, next);
}

/**
 * Get current rate limit status for a key
 */
async function getRateLimitStatus(key) {
  if (!redisAvailable || !redisClient) {
    return {
      available: false,
      message: 'Rate limit status not available (Redis not connected)',
    };
  }

  try {
    const rateLimitKey = `ratelimit:${key}`;
    const value = await redisClient.get(rateLimitKey);

    if (!value) {
      return {
        available: true,
        remaining: 'Unknown',
        reset: 'Unknown',
      };
    }

    return {
      available: true,
      current: parseInt(value),
      remaining: 'Calculated by middleware',
      reset: 'Calculated by middleware',
    };
  } catch (error) {
    logger.error('[RateLimit] Error getting status:', error);
    return {
      available: false,
      error: error.message,
    };
  }
}

module.exports = {
  globalLimiter,
  agentLimiters,
  operationLimiters,
  getAgentLimiter,
  getOperationLimiter,
  dynamicRateLimiter,
  adminLimiter,
  createCustomLimiter,
  bypassRateLimit,
  getRateLimitStatus,
  rateLimitConfigs,
};
