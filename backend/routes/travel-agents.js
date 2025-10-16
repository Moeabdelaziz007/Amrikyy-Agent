/**
 * Travel Agents API Routes
 * Coordinated AI agents for travel planning
 */

const express = require('express');
const router = express.Router();
const AgentCoordinator = require('../src/agents/AgentCoordinator');
const { aiLimiter } = require('../middleware/rateLimiter');
const logger = require('../utils/logger');

/**
 * POST /api/travel-agents/request
 * Submit a travel request to be handled by coordinated agents
 */
router.post('/request', aiLimiter, async (req, res) => {
  try {
    const request = req.body;

    // Validate request type
    const validTypes = ['plan_trip', 'optimize_budget', 'find_deals', 'full_service'];
    if (!request.type || !validTypes.includes(request.type)) {
      return res.status(400).json({
        success: false,
        error: `Invalid request type. Must be one of: ${validTypes.join(', ')}`
      });
    }

    logger.info('🎯 Travel agent request received', {
      type: request.type,
      userId: req.user?.id
    });

    const response = await AgentCoordinator.handleTravelRequest(request);

    res.json(response);

  } catch (error) {
    logger.error('❌ Travel agent request failed', {
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Failed to process travel request',
      message: error.message
    });
  }
});

/**
 * GET /api/travel-agents/capabilities
 * Get capabilities of all agents
 */
router.get('/capabilities', async (req, res) => {
  try {
    const capabilities = AgentCoordinator.getAllCapabilities();

    res.json({
      success: true,
      agents: capabilities,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Failed to get agent capabilities', {
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: 'Failed to get capabilities',
      message: error.message
    });
  }
});

/**
 * GET /api/travel-agents/active-requests
 * Get list of active requests
 */
router.get('/active-requests', async (req, res) => {
  try {
    const activeRequests = AgentCoordinator.getActiveRequests();

    res.json({
      success: true,
      requests: activeRequests,
      count: activeRequests.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Failed to get active requests', {
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: 'Failed to get active requests',
      message: error.message
    });
  }
});

module.exports = router;
