/**
 * Amrikyy Agent - Production Express Application
 * Consolidates all Phase 2 components into production-ready API
 * 
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-22
 * @phase 2
 */

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');

// Middleware
const {
  authenticate,
  optionalAuth,
  requireAdmin,
  requirePremium,
  requirePermission,
  enrichUserContext,
  logAuthenticatedRequest
} = require('./middleware/agentAuth');

const {
  globalLimiter,
  dynamicRateLimiter,
  adminLimiter
} = require('./middleware/agentRateLimit');

// Routes
const healthRoutes = require('./routes/health');
const metricsRoutes = require('./routes/metrics');
const agentManagementRoutes = require('./routes/agentManagement');
const agentStreamingRoutes = require('./routes/agentStreaming');
const coordinatorRoutes = require('./routes/coordinator');

// Utilities
const logger = require('./utils/logger');

/**
 * Create Express application
 */
function createApp() {
  const app = express();

  // =====================================
  // Security & Performance Middleware
  // =====================================

  // Security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));

  // CORS
  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-request-id']
  }));

  // Compression
  app.use(compression());

  // Body parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Request logging
  if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined'));
  } else {
    app.use(morgan('dev'));
  }

  // Request ID middleware
  app.use((req, res, next) => {
    req.id = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    res.setHeader('x-request-id', req.id);
    next();
  });

  // =====================================
  // Public Routes (No Auth Required)
  // =====================================

  // Health checks
  app.use('/api', healthRoutes);

  // Metrics (can be protected via internal network in production)
  if (process.env.METRICS_PUBLIC === 'true') {
    app.use('/api', metricsRoutes);
  } else {
    app.use('/api', authenticate, requirePermission('agent:stats'), metricsRoutes);
  }

  // Basic info endpoint
  app.get('/api', (req, res) => {
    res.json({
      service: 'Amrikyy AI Agent Platform',
      version: '2.0.0',
      phase: 'Phase 2 - Production APIs',
      status: 'operational',
      timestamp: new Date().toISOString(),
      features: [
        'LangSmith Tracing',
        'SSE Streaming',
        'Multi-Agent Coordination',
        'Agent Management API',
        'RBAC Authentication',
        'Redis-Backed Rate Limiting',
        'Prometheus Metrics'
      ],
      endpoints: {
        health: '/api/health',
        metrics: '/api/metrics',
        agents: '/api/agents',
        streaming: '/api/stream',
        coordinator: '/api/coordinator'
      }
    });
  });

  // =====================================
  // Authentication & Authorization
  // =====================================

  // Try to authenticate all requests (optional)
  app.use('/api/agents', optionalAuth);
  app.use('/api/stream', optionalAuth);
  app.use('/api/coordinator', optionalAuth);

  // Enrich user context with usage info
  app.use('/api/agents', enrichUserContext);
  app.use('/api/stream', enrichUserContext);
  app.use('/api/coordinator', enrichUserContext);

  // Log authenticated requests
  app.use('/api/agents', logAuthenticatedRequest);
  app.use('/api/stream', logAuthenticatedRequest);
  app.use('/api/coordinator', logAuthenticatedRequest);

  // =====================================
  // Rate Limiting
  // =====================================

  // Global rate limit (100 req/min)
  app.use('/api', globalLimiter);

  // =====================================
  // Protected Routes
  // =====================================

  // Agent Management API
  // GET /api/agents/list, /overview, /:agent/health, /:agent/status, etc.
  app.use('/api/agents',
    authenticate,
    dynamicRateLimiter,
    agentManagementRoutes
  );

  // Agent Streaming API
  // POST /api/stream/blog, /api/stream/itinerary, etc.
  app.use('/api/stream',
    authenticate,
    dynamicRateLimiter,
    agentStreamingRoutes
  );

  // Multi-Agent Coordinator API
  // POST /api/coordinator/sequential, /parallel, /hierarchical
  app.use('/api/coordinator',
    authenticate,
    requirePermission('agent:execute'),
    adminLimiter,
    coordinatorRoutes
  );

  // =====================================
  // 404 Handler
  // =====================================

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: 'Endpoint not found',
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  });

  // =====================================
  // Error Handler
  // =====================================

  app.use((error, req, res, next) => {
    // Log error
    logger.error('[APP] Error:', {
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      path: req.path,
      method: req.method,
      userId: req.user?.id,
      requestId: req.id
    });

    // Rate limit error
    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        retryAfter: error.retryAfter,
        requestId: req.id
      });
    }

    // Validation error
    if (error.name === 'ValidationError' || error.isJoi) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details || error.message,
        requestId: req.id
      });
    }

    // Authentication error
    if (error.name === 'UnauthorizedError' || error.status === 401) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: error.message,
        requestId: req.id
      });
    }

    // Authorization error
    if (error.name === 'ForbiddenError' || error.status === 403) {
      return res.status(403).json({
        success: false,
        error: 'Permission denied',
        message: error.message,
        requestId: req.id
      });
    }

    // Payload too large
    if (error.type === 'entity.too.large') {
      return res.status(413).json({
        success: false,
        error: 'Payload too large',
        limit: '1mb',
        requestId: req.id
      });
    }

    // Generic error
    const statusCode = error.status || error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      requestId: req.id
    });
  });

  return app;
}

module.exports = createApp;
