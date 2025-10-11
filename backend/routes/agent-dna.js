/**
 * AgentDNA API Routes
 * Endpoints for creating and managing AI agent DNA profiles
 */

const express = require('express');
const router = express.Router();
const agentDNAService = require('../src/dna/AgentDNAService');
const logger = require('../src/utils/logger');

/**
 * Create a new agent with DNA profile
 * POST /api/agent-dna/create
 */
router.post('/create', async (req, res) => {
  try {
    const agent = await agentDNAService.createAgent(req.body);
    res.json({
      success: true,
      agent: agent.toJSON()
    });
  } catch (error) {
    logger.error('Agent creation error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

/**
 * Get agent by ID
 * GET /api/agent-dna/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const agent = await agentDNAService.getAgent(req.params.id);
    
    if (!agent) {
      return res.status(404).json({ 
        success: false,
        error: 'Agent not found' 
      });
    }
    
    res.json({ 
      success: true,
      agent: agent.toJSON() 
    });
  } catch (error) {
    logger.error('Get agent error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

/**
 * Update agent
 * PUT /api/agent-dna/:id
 */
router.put('/:id', async (req, res) => {
  try {
    const agent = await agentDNAService.updateAgent(req.params.id, req.body);
    res.json({ 
      success: true,
      agent: agent.toJSON() 
    });
  } catch (error) {
    logger.error('Update agent error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

/**
 * Delete agent
 * DELETE /api/agent-dna/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    await agentDNAService.deleteAgent(req.params.id);
    res.json({ 
      success: true,
      message: 'Agent deleted successfully' 
    });
  } catch (error) {
    logger.error('Delete agent error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

/**
 * Get all agents
 * GET /api/agent-dna
 */
router.get('/', async (req, res) => {
  try {
    const agents = await agentDNAService.getAllAgents();
    res.json({
      success: true,
      count: agents.length,
      agents: agents.map(a => a.toJSON())
    });
  } catch (error) {
    logger.error('Get all agents error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

/**
 * Get dashboard statistics
 * GET /api/agent-dna/dashboard/stats
 */
router.get('/dashboard/stats', async (req, res) => {
  try {
    const dashboard = await agentDNAService.getDashboard();
    res.json({ 
      success: true,
      dashboard 
    });
  } catch (error) {
    logger.error('Dashboard stats error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

/**
 * Update agent performance
 * POST /api/agent-dna/:id/performance
 */
router.post('/:id/performance', async (req, res) => {
  try {
    const agent = await agentDNAService.updatePerformance(req.params.id, req.body);
    res.json({ 
      success: true,
      agent: agent.toJSON() 
    });
  } catch (error) {
    logger.error('Update performance error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

/**
 * Get agents by type
 * GET /api/agent-dna/by-type/:type
 */
router.get('/by-type/:type', async (req, res) => {
  try {
    const agents = await agentDNAService.getAgentsByType(req.params.type);
    res.json({
      success: true,
      count: agents.length,
      agents: agents.map(a => a.toJSON())
    });
  } catch (error) {
    logger.error('Get agents by type error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

module.exports = router;

