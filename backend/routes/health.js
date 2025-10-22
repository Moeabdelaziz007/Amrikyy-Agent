/**
 * Health Check & Monitoring Routes
 * Provides health status, metrics, and monitoring endpoints
 */

const express = require('express');
const router = express.Router();
const { healthCheck, metricsCollector } = require('../config/monitoring');

/**
 * @route   GET /health
 * @desc    Basic health check endpoint
 * @access  Public
 */
router.get('/', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
    };

    res.json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @route   GET /health/detailed
 * @desc    Detailed health check with all service statuses
 * @access  Public (consider protecting in production)
 */
router.get('/detailed', async (req, res) => {
  try {
    const checks = {};
    
    // Run all health checks in parallel
    const checkPromises = Object.entries(healthCheck.checks).map(
      async ([name, checkFn]) => {
        try {
          const result = await checkFn();
          checks[name] = result;
        } catch (error) {
          checks[name] = {
            status: 'error',
            error: error.message,
          };
        }
      }
    );

    await Promise.all(checkPromises);

    // Determine overall status
    const allHealthy = Object.values(checks).every(
      check => check.status === 'healthy' || check.status === 'degraded'
    );

    res.json({
      status: allHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks,
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @route   GET /health/metrics
 * @desc    Application metrics
 * @access  Protected (should require API key in production)
 */
router.get('/metrics', (req, res) => {
  // Simple API key authentication
  const apiKey = req.headers['x-api-key'];
  if (process.env.METRICS_API_KEY && apiKey !== process.env.METRICS_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const metrics = metricsCollector.getMetrics();
    
    res.json({
      timestamp: new Date().toISOString(),
      ...metrics,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @route   GET /health/ready
 * @desc    Readiness probe for Kubernetes/Railway
 * @access  Public
 */
router.get('/ready', async (req, res) => {
  try {
    // Check critical services
    const { checks } = healthCheck;
    
    const dbHealth = await checks.database();
    
    if (dbHealth.status === 'unhealthy') {
      return res.status(503).json({
        ready: false,
        reason: 'Database unavailable',
      });
    }

    res.json({
      ready: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      ready: false,
      error: error.message,
    });
  }
});

/**
 * @route   GET /health/live
 * @desc    Liveness probe for Kubernetes/Railway
 * @access  Public
 */
router.get('/live', (req, res) => {
  res.json({
    alive: true,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @route   POST /health/metrics/reset
 * @desc    Reset metrics (admin only)
 * @access  Protected
 */
router.post('/metrics/reset', (req, res) => {
  const apiKey = req.headers['x-api-key'];
  if (!process.env.METRICS_API_KEY || apiKey !== process.env.METRICS_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    metricsCollector.reset();
    res.json({
      success: true,
      message: 'Metrics reset successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
