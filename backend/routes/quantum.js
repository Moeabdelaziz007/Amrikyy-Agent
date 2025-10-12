/**
 * Quantum System API Routes
 * Agent DNA Engine + Country Agent Network endpoints
 */

const express = require('express');
const router = express.Router();
const agentDNAEngine = require('../src/quantum/AgentDNAEngine');
const countryAgentNetwork = require('../src/agents/CountryAgentNetwork');
const deploymentEngine = require('../src/quantum/DeploymentEngine');
const logger = require('../src/utils/logger');

/**
 * Calculate DNA Score for agent configuration
 * POST /api/quantum/calculate-dna
 */
router.post('/calculate-dna', async (req, res) => {
  try {
    const { personality, skills, behavior, specialization } = req.body;

    const dnaScore = agentDNAEngine.calculateDNAScore({
      personality,
      skills,
      behavior,
      specialization
    });

    res.json({
      success: true,
      dnaScore
    });
  } catch (error) {
    logger.error('DNA calculation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Generate system prompt from DNA
 * POST /api/quantum/generate-prompt
 */
router.post('/generate-prompt', async (req, res) => {
  try {
    const agent = req.body;
    const systemPrompt = agentDNAEngine.generateSystemPrompt(agent);

    res.json({
      success: true,
      systemPrompt
    });
  } catch (error) {
    logger.error('Prompt generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get all agent presets
 * GET /api/quantum/presets
 */
router.get('/presets', async (req, res) => {
  try {
    const presets = agentDNAEngine.getAllPresets();

    res.json({
      success: true,
      count: presets.length,
      presets
    });
  } catch (error) {
    logger.error('Presets fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get specific preset
 * GET /api/quantum/presets/:key
 */
router.get('/presets/:key', async (req, res) => {
  try {
    const preset = agentDNAEngine.getPreset(req.params.key);

    if (!preset) {
      return res.status(404).json({
        success: false,
        error: 'Preset not found'
      });
    }

    const dnaScore = agentDNAEngine.calculateDNAScore(preset);

    res.json({
      success: true,
      preset: {
        ...preset,
        dnaScore
      }
    });
  } catch (error) {
    logger.error('Preset fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Initialize Country Agent Network
 * POST /api/quantum/network/initialize
 */
router.post('/network/initialize', async (req, res) => {
  try {
    await countryAgentNetwork.initialize();

    res.json({
      success: true,
      message: 'Country Agent Network initialized',
      status: countryAgentNetwork.getNetworkStatus()
    });
  } catch (error) {
    logger.error('Network initialization error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Query Country Agent Network
 * POST /api/quantum/network/query
 */
router.post('/network/query', async (req, res) => {
  try {
    const { query, context } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required'
      });
    }

    // Initialize network if not already
    if (!countryAgentNetwork.isInitialized) {
      await countryAgentNetwork.initialize();
    }

    const response = await countryAgentNetwork.routeQuery(query, context || {});

    res.json({
      success: true,
      ...response
    });
  } catch (error) {
    logger.error('Network query error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get network status
 * GET /api/quantum/network/status
 */
router.get('/network/status', async (req, res) => {
  try {
    const status = countryAgentNetwork.getNetworkStatus();

    res.json({
      success: true,
      ...status
    });
  } catch (error) {
    logger.error('Network status error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get specific country agent status
 * GET /api/quantum/network/agents/:key
 */
router.get('/network/agents/:key', async (req, res) => {
  try {
    const agent = countryAgentNetwork.getAgent(req.params.key);

    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found'
      });
    }

    res.json({
      success: true,
      agent: agent.getStatus()
    });
  } catch (error) {
    logger.error('Agent status error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Deploy an agent
 * POST /api/quantum/deploy
 */
router.post('/deploy', async (req, res) => {
  try {
    const result = await deploymentEngine.deployAgent(req.body);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error('Deployment error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Quick deploy from preset
 * POST /api/quantum/deploy/preset/:key
 */
router.post('/deploy/preset/:key', async (req, res) => {
  try {
    const result = await deploymentEngine.deployFromPreset(
      req.params.key,
      req.body
    );

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error('Preset deployment error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Undeploy an agent
 * DELETE /api/quantum/deploy/:id
 */
router.delete('/deploy/:id', async (req, res) => {
  try {
    const result = await deploymentEngine.undeployAgent(req.params.id);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error('Undeploy error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get deployment status
 * GET /api/quantum/deploy/:id
 */
router.get('/deploy/:id', async (req, res) => {
  try {
    const deployment = deploymentEngine.getDeployment(req.params.id);

    if (!deployment) {
      return res.status(404).json({
        success: false,
        error: 'Deployment not found'
      });
    }

    res.json({
      success: true,
      deployment
    });
  } catch (error) {
    logger.error('Deployment status error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get all active deployments
 * GET /api/quantum/deployments
 */
router.get('/deployments', async (req, res) => {
  try {
    const deployments = deploymentEngine.getActiveDeployments();

    res.json({
      success: true,
      count: deployments.length,
      deployments
    });
  } catch (error) {
    logger.error('Deployments fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get deployment history
 * GET /api/quantum/deployments/history
 */
router.get('/deployments/history', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;
    const history = deploymentEngine.getDeploymentHistory(limit);

    res.json({
      success: true,
      count: history.length,
      history
    });
  } catch (error) {
    logger.error('Deployment history error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get deployment statistics
 * GET /api/quantum/deployments/stats
 */
router.get('/deployments/stats', async (req, res) => {
  try {
    const stats = deploymentEngine.getStatistics();

    res.json({
      success: true,
      statistics: stats
    });
  } catch (error) {
    logger.error('Deployment stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Batch deploy agents
 * POST /api/quantum/deploy/batch
 */
router.post('/deploy/batch', async (req, res) => {
  try {
    const { agents } = req.body;

    if (!agents || !Array.isArray(agents)) {
      return res.status(400).json({
        success: false,
        error: 'agents array is required'
      });
    }

    const result = await deploymentEngine.batchDeploy(agents);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error('Batch deployment error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Health check
 * GET /api/quantum/health
 */
router.get('/health', async (req, res) => {
  try {
    const status = {
      dnaEngine: 'operational',
      deploymentEngine: 'operational',
      network: countryAgentNetwork.isInitialized ? 'active' : 'inactive',
      agents: countryAgentNetwork.agents.size,
      activeDeployments: deploymentEngine.getActiveDeployments().length,
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      status: 'healthy',
      ...status
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: error.message
    });
  }
});

module.exports = router;
