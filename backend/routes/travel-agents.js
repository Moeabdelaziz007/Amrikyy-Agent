/**
 * Travel Agents API Routes
 * Coordinated AI agents for travel planning
 */

const express = require('express');
const router = express.Router();
const AgentManager = require('../src/services/agents/AgentManager').default;
const { aiLimiter } = require('../middleware/rateLimiter');
const logger = require('../utils/logger');

/**
 * POST /api/travel-agents/request
 * Submit a request to be handled by a specialized agent.
 */
router.post('/request', aiLimiter, async (req, res) => {
  try {
    const { miniAppId, action, data } = req.body;

    // Validate request body
    if (!miniAppId || !action) {
      return res.status(400).json({
        success: false,
        error: `Invalid request body. Must include 'miniAppId' and 'action'.`
      });
    }

    logger.info('🎯 Agent request received', {
      miniAppId,
      action,
      userId: req.user?.id
    });

    const { taskId } = await AgentManager.processMiniAppRequest(miniAppId, action, data);

    // Respond immediately with the task ID for tracking
    res.status(202).json({ 
      success: true, 
      message: 'Request received and is being processed.',
      taskId 
    });

  } catch (error) {
    logger.error('❌ Agent request failed', {
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Failed to process agent request',
      message: error.message
    });
  }
});

/**
 * GET /api/travel-agents/task/:taskId
 * Get the status of a specific task.
 */
router.get('/task/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const taskStatus = AgentManager.getTaskStatus(taskId);

    if (taskStatus) {
      res.json({ success: true, task: taskStatus });
    } else {
      res.status(404).json({ success: false, error: 'Task not found or already completed.' });
    }
  } catch (error) {
    logger.error('❌ Failed to get task status', {
      error: error.message
    });
    res.status(500).json({
      success: false,
      error: 'Failed to get task status',
      message: error.message
    });
  }
});

/*
// The /capabilities and /active-requests endpoints are deprecated in the new model.
// This functionality can be rebuilt if needed by querying the AgentManager.

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
*/

module.exports = router;
