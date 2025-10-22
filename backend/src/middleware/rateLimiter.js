
const rateLimit = require('express-rate-limit');

/**
 * @fileoverview Rate Limiting Middleware
 *
 * This file defines rate limiting rules for the API to prevent abuse.
 */

// Custom key generator to use API key if available, otherwise fall back to IP
const keyGenerator = (req) => {
  if (req.apiKey) {
    return req.apiKey;
  }
  return req.ip;
};

// Custom handler for when the rate limit is exceeded
const limitExceededHandler = (req, res, /*next*/) => {
  res.status(429).json({
    error: 'Too Many Requests',
    message: 'You have exceeded the request limit. Please try again later.',
  });
};

/**
 * Default rate limiter for most API routes.
 */
const defaultLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req) => {
    // Allow higher limits for admin users
    if (req.user && req.user.role === 'admin') {
      return 1000;
    }
    return 100;
  },
  keyGenerator,
  handler: limitExceededHandler,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Stricter rate limiter for sensitive operations like login or registration.
 */
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  keyGenerator,
  handler: limitExceededHandler,
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  defaultLimiter,
  authLimiter,
};
