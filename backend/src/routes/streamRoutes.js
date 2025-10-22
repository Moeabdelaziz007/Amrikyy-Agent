/**
 * API Routes for Streaming
 * 
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-22
 */

const express = require('express');
const router = express.Router();
const streamController = require('../controllers/streamController');

/**
 * @route POST /api/stream
 * @description Start a new streaming session with Server-Sent Events (SSE)
 * @access Private (protected by requireAuth and rateLimiter in server.js)
 */
router.post('/', streamController.startStream);

module.exports = router;
