
const express = require('express');
const router = express.Router();
const cacheService = require('../services/cacheService');

/**
 * @swagger
 * /api/cache/clear:
 *   post:
 *     summary: Clear the application cache.
 *     tags: [Cache]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Cache cleared successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cache cleared successfully.
 *       500:
 *         description: Error clearing the cache.
 */
router.post('/clear', async (req, res) => {
  try {
    await cacheService.clear();
    res.status(200).json({ message: 'Cache cleared successfully.' });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({ message: 'Failed to clear cache.', error: error.message });
  }
});

/**
 * @swagger
 * /api/cache/status:
 *   get:
 *     summary: Get the status and statistics of the cache.
 *     tags: [Cache]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Cache status retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: number
 *                 size:
 *                   type: number
 *                 hits:
 *                   type: number
 *                 misses:
 *                   type: number
 *                 lastCleared:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Error retrieving cache status.
 */
router.get('/status', async (req, res) => {
  try {
    const status = await cacheService.status();
    res.status(200).json(status);
  } catch (error) {
    console.error('Error getting cache status:', error);
    res.status(500).json({ message: 'Failed to get cache status.', error: error.message });
  }
});

module.exports = router;
