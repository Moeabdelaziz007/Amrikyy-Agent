/**
 * Authentication Middleware
 * Compatibility layer for authentication and rate limiting
 * 
 * This file provides a unified interface for authentication middleware
 * Used by stream and coordinator routes
 * 
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-23
 */

const { authenticateToken } = require('../../middleware/auth');
const agentAuth = require('./agentAuth');
const agentRateLimit = require('./agentRateLimit');

/**
 * Main authentication middleware
 * Uses JWT token authentication from the main auth middleware
 */
const authenticate = authenticateToken;

/**
 * Rate limiting middleware
 * Uses the agent rate limiter
 */
const rateLimiter = agentRateLimit.createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per window
  message: 'Too many requests from this IP, please try again later.'
});

/**
 * Admin authentication middleware
 * Requires admin role
 */
const requireAdmin = agentAuth.requireAdmin;

/**
 * Premium authentication middleware
 * Requires premium or admin role
 */
const requirePremium = agentAuth.requirePremium;

module.exports = {
  authenticate,
  rateLimiter,
  requireAdmin,
  requirePremium
};
