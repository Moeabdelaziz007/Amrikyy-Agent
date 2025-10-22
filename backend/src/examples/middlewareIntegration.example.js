/**
 * Example: Using Agent Middleware
 * Shows how to integrate validation, rate limiting, and auth
 *
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-22
 */

const express = require('express');
const app = express();

// Import middleware
const {
  validateTravelAgent,
  validateContentAgent,
  validateAgentName,
  validatePagination,
  validateCacheClear,
  validateCacheWarm,
  customValidators,
} = require('../middleware/agentValidation');

const {
  globalLimiter,
  getAgentLimiter,
  getOperationLimiter,
  adminLimiter,
  dynamicRateLimiter,
} = require('../middleware/agentRateLimit');

const {
  authenticate,
  optionalAuth,
  requireAdmin,
  requirePremium,
  requirePermission,
  enrichUserContext,
  logAuthenticatedRequest,
} = require('../middleware/agentAuth');

// Apply global middleware
app.use(express.json());
app.use(optionalAuth); // Try to authenticate but don't require
app.use(enrichUserContext); // Enrich user context if authenticated
app.use(logAuthenticatedRequest); // Log authenticated requests

/**
 * Example 1: Public endpoint with rate limiting only
 * GET /api/agents/list
 */
app.get(
  '/api/agents/list',
  globalLimiter, // Apply global rate limit
  (req, res) => {
    res.json({
      success: true,
      agents: ['travel', 'content', 'innovation'],
    });
  }
);

/**
 * Example 2: Authenticated endpoint with validation
 * POST /api/agents/travel/search/flights
 */
app.post(
  '/api/agents/travel/search/flights',
  authenticate, // Require authentication
  getOperationLimiter('travel', 'searchFlights'), // Operation-specific rate limit
  validateTravelAgent.searchFlights, // Validate input
  customValidators.futureDate, // Custom validation
  customValidators.returnAfterDeparture, // Custom validation
  async (req, res) => {
    try {
      // Your agent logic here
      const result = await travelAgent.searchFlights(req.body);

      res.json({
        success: true,
        result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

/**
 * Example 3: Premium-only endpoint
 * POST /api/agents/content/blog/generate
 */
app.post(
  '/api/agents/content/blog/generate',
  authenticate,
  requirePremium, // Require premium subscription
  getOperationLimiter('content', 'generateBlogPost'),
  validateContentAgent.generateBlogPost,
  async (req, res) => {
    try {
      const result = await contentAgent.generateBlogPost(req.body);

      res.json({
        success: true,
        result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

/**
 * Example 4: Admin-only endpoint
 * POST /api/agents/:agent/cache/clear
 */
app.post(
  '/api/agents/:agent/cache/clear',
  authenticate,
  requireAdmin, // Admin only
  validateAgentName, // Validate agent parameter
  adminLimiter, // Admin-specific rate limit
  validateCacheClear, // Validate request body
  async (req, res) => {
    try {
      const { agent } = req.params;
      const { pattern } = req.body;

      // Clear cache logic
      const cleared = await clearAgentCache(agent, pattern);

      res.json({
        success: true,
        agent,
        cleared,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

/**
 * Example 5: Permission-based endpoint
 * GET /api/agents/:agent/metrics
 */
app.get(
  '/api/agents/:agent/metrics',
  authenticate,
  requirePermission('agent:stats'), // Require specific permission
  validateAgentName,
  getAgentLimiter((req) => req.params.agent), // Dynamic rate limit
  validatePagination,
  async (req, res) => {
    try {
      const { agent } = req.params;
      const metrics = await getAgentMetrics(agent);

      res.json({
        success: true,
        metrics,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

/**
 * Example 6: Multiple validation + rate limiting
 * POST /api/agents/travel/itinerary/generate
 */
app.post(
  '/api/agents/travel/itinerary/generate',
  authenticate,
  getOperationLimiter('travel', 'generateItinerary'),
  validateTravelAgent.generateItinerary,
  customValidators.reasonableBudget, // Check if budget is reasonable
  async (req, res) => {
    try {
      const result = await travelAgent.generateItinerary(req.body);

      res.json({
        success: true,
        result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

/**
 * Example 7: Cache warming (admin + validation)
 * POST /api/agents/:agent/cache/warm
 */
app.post(
  '/api/agents/:agent/cache/warm',
  authenticate,
  requireAdmin,
  validateAgentName,
  adminLimiter,
  validateCacheWarm,
  async (req, res) => {
    try {
      const { agent } = req.params;
      const { queries } = req.body;

      const result = await warmAgentCache(agent, queries);

      res.json({
        success: true,
        agent,
        warmed: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

/**
 * Example 8: Dynamic rate limiting based on route
 */
app.all(
  '/api/agents/:agent/:operation?',
  dynamicRateLimiter, // Automatically selects correct rate limiter
  (req, res, next) => {
    // Your route logic
    next();
  }
);

/**
 * Example 9: Error handling middleware
 */
app.use((error, req, res, next) => {
  // Log error
  logger.error('[API] Error:', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
  });

  // Rate limit error
  if (error.status === 429) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests',
      retryAfter: error.retryAfter,
    });
  }

  // Validation error
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.details,
    });
  }

  // Auth error
  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
  }

  // Generic error
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

/**
 * Example middleware composition patterns
 */

// Pattern 1: Public agent endpoints (minimal protection)
const publicAgentMiddleware = [globalLimiter, optionalAuth];

// Pattern 2: Standard agent endpoints (auth + rate limit + validation)
const standardAgentMiddleware = (agent, operation) => [
  authenticate,
  getOperationLimiter(agent, operation),
  // Add validation based on agent and operation
];

// Pattern 3: Admin endpoints (strict protection)
const adminAgentMiddleware = [authenticate, requireAdmin, adminLimiter];

// Pattern 4: Premium endpoints (premium features)
const premiumAgentMiddleware = (agent, operation) => [
  authenticate,
  requirePremium,
  getOperationLimiter(agent, operation),
];

/**
 * Apply middleware patterns
 */

// Public endpoints
app.get('/api/agents/health', ...publicAgentMiddleware, (req, res) => {
  res.json({ status: 'healthy' });
});

// Standard endpoints
app.post(
  '/api/agents/travel/search',
  ...standardAgentMiddleware('travel', 'searchFlights'),
  validateTravelAgent.searchFlights,
  async (req, res) => {
    // Handler
  }
);

// Admin endpoints
app.post('/api/agents/reset', ...adminAgentMiddleware, async (req, res) => {
  // Handler
});

// Premium endpoints
app.post(
  '/api/agents/content/premium',
  ...premiumAgentMiddleware('content', 'generateBlogPost'),
  validateContentAgent.generateBlogPost,
  async (req, res) => {
    // Handler
  }
);

/**
 * Start server
 */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log('Middleware stack:');
  console.log('  - Validation (Joi schemas)');
  console.log('  - Rate Limiting (Redis-backed)');
  console.log('  - Authentication (JWT + API keys)');
  console.log('  - Authorization (RBAC)');
  console.log('  - Logging');
});

module.exports = app;
