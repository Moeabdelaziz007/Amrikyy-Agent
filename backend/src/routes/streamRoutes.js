/**
 * API Routes for Streaming
 * 
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-23
 */

const express = require('express');
const router = express.Router();
const streamController = require('../controllers/streamController');
const { validateStreamRequest, sanitizeInput } = require('../middleware/validation');

// Note: Authentication and rate limiting are applied at the app level in server.js
// app.use('/api/stream', authenticateToken, aiLimiter, streamRoutes);

/**
 * @route GET /api/stream/:agent
 * @description Stream responses from a specified agent.
 * @access Private (protected by authenticateToken + aiLimiter in server.js)
 */
router.get(
    '/:agent',
    sanitizeInput,
    validateStreamRequest,
    streamController.streamAgentResponse
);

/**
 * @route GET /api/stream/stats/:agent?
 * @description Get streaming statistics.
 * @access Private (protected by authenticateToken in server.js)
 */
router.get(
    '/stats/:agent?',
    streamController.getStreamingStats
);

module.exports = router;
