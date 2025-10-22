/**
 * Agent Streaming Routes
 * API endpoints for streaming agent responses
 * 
 * Uses controller-service pattern with:
 * - LangSmith tracing
 * - Prometheus metrics
 * - Resource cleanup on disconnect
 *
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-22
 */

const express = require('express');
const router = express.Router();
const streamController = require('../../controllers/streamController');

/**
 * Stream blog post generation
 * POST /api/stream/blog
 * 
 * Body: { topic, tone?, length? }
 */
router.post('/blog', streamController.streamBlog);

/**
 * Stream itinerary generation
 * POST /api/stream/itinerary
 * 
 * Body: { destination, days, budget }
 */
router.post('/itinerary', streamController.streamItinerary);

/**
 * Stream travel recommendations
 * POST /api/stream/recommendations
 * 
 * Body: { interests, budget }
 */
router.post('/recommendations', streamController.streamRecommendations);

/**
 * Stream social media posts
 * POST /api/stream/social
 * 
 * Body: { topic, platforms }
 */
router.post('/social', streamController.streamSocial);

/**
 * Get streaming statistics
 * GET /api/stream/stats/:agent
 * 
 * Params: agent (travel|content)
 */
router.get('/stats/:agent', streamController.getStats);

/**
 * Cleanup inactive streams
 * POST /api/stream/cleanup
 */
router.post('/cleanup', streamController.cleanup);

// Cleanup streams every 5 minutes
const streamService = require('../services/streamService');
setInterval(() => {
  streamService.cleanupAllStreams();
}, 300000);

module.exports = router;
