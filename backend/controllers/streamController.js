/**
 * Stream Controller - HTTP handlers for streaming API
 * Handles request/response for streaming endpoints
 * 
 * Features:
 * - Request validation
 * - Error handling
 * - Client disconnect management
 * - Integration with streamService
 * 
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-22
 */

const { v4: uuidv4 } = require('uuid');
const streamService = require('../services/streamService');
const logger = require('../utils/logger');

/**
 * Stream blog post generation
 * POST /api/stream/blog
 */
exports.streamBlog = async (req, res, next) => {
  const streamId = uuidv4();

  try {
    const { topic, tone, length } = req.body;

    // Validation
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Topic is required and must be a non-empty string'
      });
    }

    logger.info(`[StreamController] Blog stream request: ${streamId}`, {
      topic,
      tone,
      length,
      userId: req.user?.id
    });

    // Initialize stream
    streamService.initializeStream(res, streamId, 'content');

    // Start streaming
    await streamService.streamBlogPost(streamId, { topic, tone, length });

  } catch (error) {
    logger.error(`[StreamController] Blog stream error: ${streamId}`, error);
    
    // If response not already sent
    if (!res.headersSent) {
      next(error);
    }
  }
};

/**
 * Stream itinerary generation
 * POST /api/stream/itinerary
 */
exports.streamItinerary = async (req, res, next) => {
  const streamId = uuidv4();

  try {
    const { destination, days, budget } = req.body;

    // Validation
    if (!destination || typeof destination !== 'string' || destination.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Destination is required and must be a non-empty string'
      });
    }

    if (!days || isNaN(parseInt(days)) || parseInt(days) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Days is required and must be a positive number'
      });
    }

    if (!budget || isNaN(parseFloat(budget)) || parseFloat(budget) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Budget is required and must be a positive number'
      });
    }

    logger.info(`[StreamController] Itinerary stream request: ${streamId}`, {
      destination,
      days,
      budget,
      userId: req.user?.id
    });

    // Initialize stream
    streamService.initializeStream(res, streamId, 'travel');

    // Start streaming
    await streamService.streamItinerary(streamId, { destination, days, budget });

  } catch (error) {
    logger.error(`[StreamController] Itinerary stream error: ${streamId}`, error);
    
    if (!res.headersSent) {
      next(error);
    }
  }
};

/**
 * Stream travel recommendations
 * POST /api/stream/recommendations
 */
exports.streamRecommendations = async (req, res, next) => {
  const streamId = uuidv4();

  try {
    const { interests, budget } = req.body;

    // Validation
    if (!interests || typeof interests !== 'string' || interests.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Interests is required and must be a non-empty string'
      });
    }

    if (!budget || isNaN(parseFloat(budget)) || parseFloat(budget) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Budget is required and must be a positive number'
      });
    }

    logger.info(`[StreamController] Recommendations stream request: ${streamId}`, {
      interests,
      budget,
      userId: req.user?.id
    });

    // Initialize stream
    streamService.initializeStream(res, streamId, 'travel');

    // Start streaming
    await streamService.streamRecommendations(streamId, { interests, budget });

  } catch (error) {
    logger.error(`[StreamController] Recommendations stream error: ${streamId}`, error);
    
    if (!res.headersSent) {
      next(error);
    }
  }
};

/**
 * Stream social media posts
 * POST /api/stream/social
 */
exports.streamSocial = async (req, res, next) => {
  const streamId = uuidv4();

  try {
    const { topic, platforms } = req.body;

    // Validation
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Topic is required and must be a non-empty string'
      });
    }

    if (!platforms) {
      return res.status(400).json({
        success: false,
        error: 'Platforms is required'
      });
    }

    logger.info(`[StreamController] Social posts stream request: ${streamId}`, {
      topic,
      platforms,
      userId: req.user?.id
    });

    // Initialize stream
    streamService.initializeStream(res, streamId, 'content');

    // Start streaming
    await streamService.streamSocialPosts(streamId, { topic, platforms });

  } catch (error) {
    logger.error(`[StreamController] Social posts stream error: ${streamId}`, error);
    
    if (!res.headersSent) {
      next(error);
    }
  }
};

/**
 * Get streaming statistics
 * GET /api/stream/stats/:agent
 */
exports.getStats = (req, res, next) => {
  try {
    const { agent } = req.params;

    if (!['travel', 'content'].includes(agent)) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found. Valid agents: travel, content'
      });
    }

    const stats = streamService.getStats(agent);

    res.json({
      success: true,
      ...stats
    });

  } catch (error) {
    logger.error('[StreamController] Get stats error:', error);
    next(error);
  }
};

/**
 * Cleanup inactive streams
 * POST /api/stream/cleanup
 */
exports.cleanup = (req, res, next) => {
  try {
    const result = streamService.cleanupAllStreams();

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    logger.error('[StreamController] Cleanup error:', error);
    next(error);
  }
};
