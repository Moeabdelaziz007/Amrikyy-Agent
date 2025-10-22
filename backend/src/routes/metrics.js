const express = require('express');
const router = express.Router();
const metricsService = require('../services/metricsService');

/**
 * @swagger
 * /api/metrics:
 *   get:
 *     summary: Get application metrics in Prometheus format.
 *     tags: [Metrics]
 *     responses:
 *       200:
 *         description: Prometheus metrics.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       500:
 *         description: Error retrieving metrics.
 */
router.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', metricsService.register.contentType);
    res.end(await metricsService.exposePrometheus());
  } catch (error) {
    console.error('Failed to get Prometheus metrics:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/metrics/json:
 *   get:
 *     summary: Get application metrics in JSON format.
 *     tags: [Metrics]
 *     responses:
 *       200:
 *         description: JSON metrics snapshot.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Error retrieving metrics.
 */
router.get('/metrics/json', async (req, res) => {
  try {
    const metrics = await metricsService.snapshot();
    res.json(metrics);
  } catch (error) {
    console.error('Failed to get JSON metrics:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;