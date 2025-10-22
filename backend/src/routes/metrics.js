/**
 * Metrics Routes
 * Exposes Prometheus and JSON metrics
 * 
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-22
 */

const express = require('express');
const router = express.Router();
const metricsService = require('../services/metricsService');

/**
 * GET /api/metrics
 * Prometheus metrics endpoint
 */
router.get('/metrics', async (req, res) => {
  try {
    const metrics = await metricsService.exposePrometheus();
    res.set('Content-Type', metricsService.contentType);
    res.send(metrics);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/metrics/json
 * JSON metrics endpoint (for dashboards)
 */
router.get('/metrics/json', async (req, res) => {
  try {
    const snapshot = await metricsService.snapshot();
    res.json({
      success: true,
      ...snapshot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/metrics/reset
 * Reset all metrics (admin only)
 */
router.post('/metrics/reset', (req, res) => {
  try {
    metricsService.reset();
    res.json({
      success: true,
      message: 'All metrics reset'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
