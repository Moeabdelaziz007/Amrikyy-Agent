// ═══════════════════════════════════════════════════════════════
// 🛣️ REWARD ENGINE API ROUTES
// Express routes for Quantum Reward Engine
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();

/**
 * Initialize reward routes with reward integration instance
 */
const createRewardRoutes = (rewardIntegration) => {
  // Get system metrics
  router.get('/metrics', async (req, res) => {
    try {
      const metrics = rewardIntegration.getSystemMetrics();
      res.json({
        success: true,
        data: metrics,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Process interaction and award rewards
  router.post('/process', async (req, res) => {
    try {
      const { agentId, action, result, context, collaboratingAgents } = req.body;
      
      if (!agentId || !action || !result) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: agentId, action, result',
          timestamp: new Date().toISOString()
        });
      }

      const rewardResult = await rewardIntegration.processAIXInteraction(
        agentId, action, result, context
      );

      res.json({
        success: true,
        data: rewardResult,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Process Telegram interaction
  router.post('/telegram', async (req, res) => {
    try {
      const { message, response, agentId } = req.body;
      
      if (!message || !response) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: message, response',
          timestamp: new Date().toISOString()
        });
      }

      const rewardResult = await rewardIntegration.processTelegramInteraction(
        message, response, agentId
      );

      res.json({
        success: true,
        data: rewardResult,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Process voice interaction
  router.post('/voice', async (req, res) => {
    try {
      const { transcript, response, agentId } = req.body;
      
      if (!transcript || !response) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: transcript, response',
          timestamp: new Date().toISOString()
        });
      }

      const rewardResult = await rewardIntegration.processVoiceInteraction(
        transcript, response, agentId
      );

      res.json({
        success: true,
        data: rewardResult,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Process collaboration
  router.post('/collaboration', async (req, res) => {
    try {
      const { primaryAgent, collaboratingAgents, task, result } = req.body;
      
      if (!primaryAgent || !collaboratingAgents || !task || !result) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: primaryAgent, collaboratingAgents, task, result',
          timestamp: new Date().toISOString()
        });
      }

      const rewardResult = await rewardIntegration.processCollaboration(
        primaryAgent, collaboratingAgents, task, result
      );

      res.json({
        success: true,
        data: rewardResult,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Get agent recommendations
  router.post('/recommend', async (req, res) => {
    try {
      const { taskType, taskContext } = req.body;
      
      const recommendations = rewardIntegration.getAgentRecommendations(
        taskType, taskContext
      );

      res.json({
        success: true,
        data: recommendations,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Get specific agent state
  router.get('/agent/:agentId', async (req, res) => {
    try {
      const { agentId } = req.params;
      const agent = rewardIntegration.getAgentState(agentId);
      
      if (!agent) {
        return res.status(404).json({
          success: false,
          error: 'Agent not found',
          timestamp: new Date().toISOString()
        });
      }

      res.json({
        success: true,
        data: agent,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Update agent state (admin/testing)
  router.put('/agent/:agentId', async (req, res) => {
    try {
      const { agentId } = req.params;
      const { updates } = req.body;
      
      if (!updates) {
        return res.status(400).json({
          success: false,
          error: 'Missing updates object',
          timestamp: new Date().toISOString()
        });
      }

      const success = await rewardIntegration.forceUpdateAgent(agentId, updates);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Agent not found or update failed',
          timestamp: new Date().toISOString()
        });
      }

      res.json({
        success: true,
        message: 'Agent updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Reset all agents (admin/testing)
  router.post('/reset', async (req, res) => {
    try {
      const success = await rewardIntegration.resetAllAgents();
      
      res.json({
        success: success,
        message: success ? 'All agents reset successfully' : 'Reset failed',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Health check
  router.get('/health', async (req, res) => {
    try {
      const metrics = rewardIntegration.getSystemMetrics();
      const isHealthy = metrics.error ? false : true;
      
      res.json({
        success: true,
        healthy: isHealthy,
        data: {
          status: isHealthy ? 'operational' : 'error',
          initialized: rewardIntegration.initialized,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        healthy: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  return router;
};

module.exports = { createRewardRoutes };
