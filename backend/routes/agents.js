const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const { AIXManager } = require('../src/aix/AIXManager');
const { logger } = require('../src/utils/logger');

const log = logger.child('AgentRegistry');

// Initialize AIX Manager
const aixManager = new AIXManager({
  agentsDirectory: path.join(__dirname, '../agents'),
  enableQuantum: true,
  enableTopology: true,
  enableSimulation: true
});

/**
 * GET /api/agents
 * List all available AI agents
 */
router.get('/', async (req, res) => {
  try {
    log.info('Fetching all agents');
    
    const agentsDir = path.join(__dirname, '../agents');
    const files = await fs.readdir(agentsDir);
    const aixFiles = files.filter(f => f.endsWith('.aix'));
    
    const agents = [];
    
    for (const file of aixFiles) {
      try {
        const agentPath = path.join(agentsDir, file);
        const config = await aixManager.loadAgent(agentPath);
        
        // Transform to API response format
        agents.push({
          id: config.id,
          name: config.name,
          nickname: config.metadata?.nickname || config.name,
          role: config.metadata?.role || 'AI Assistant',
          status: 'active', // TODO: Get real status from runtime
          avatar: config.metadata?.avatar || `/avatars/${config.id}.svg`,
          color: config.metadata?.color || '#3B82F6',
          description: config.metadata?.description || config.purpose,
          age: config.identity?.age || 'Unknown',
          born: config.identity?.birth_date || 'Unknown',
          skills: config.skills?.map(skill => ({
            name: skill.name,
            level: skill.proficiency || 0
          })) || [],
          personality: config.personality?.traits?.map(trait => ({
            trait: trait.name,
            value: trait.value || 0.5
          })) || [],
          mission: config.purpose,
          creator: config.identity?.creator || 'Amrikyy Platform',
          topology: config.quantum_topology || null
        });
      } catch (error) {
        log.warn(`Failed to load agent from ${file}: ${error.message}`);
      }
    }
    
    log.success(`Loaded ${agents.length} agents`);
    res.json({
      success: true,
      agents,
      total: agents.length
    });
    
  } catch (error) {
    log.error(`Failed to fetch agents: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agents',
      message: error.message
    });
  }
});

/**
 * GET /api/agents/:id
 * Get detailed information about a specific agent
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    log.info(`Fetching agent: ${id}`);
    
    const agentsDir = path.join(__dirname, '../agents');
    const files = await fs.readdir(agentsDir);
    const agentFile = files.find(f => f.includes(id) && f.endsWith('.aix'));
    
    if (!agentFile) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found',
        message: `No agent found with ID: ${id}`
      });
    }
    
    const agentPath = path.join(agentsDir, agentFile);
    const config = await aixManager.loadAgent(agentPath);
    
    // Full agent details
    const agentDetails = {
      id: config.id,
      name: config.name,
      version: config.version,
      metadata: config.metadata,
      identity: config.identity,
      personality: config.personality,
      skills: config.skills,
      purpose: config.purpose,
      behavior: config.behavior,
      quantum_topology: config.quantum_topology,
      simulation: config.simulation,
      tools: config.tools,
      memory: config.memory,
      communication: config.communication,
      created_at: config.created_at,
      updated_at: config.updated_at
    };
    
    log.success(`Agent ${id} fetched successfully`);
    res.json({
      success: true,
      agent: agentDetails
    });
    
  } catch (error) {
    log.error(`Failed to fetch agent ${req.params.id}: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agent details',
      message: error.message
    });
  }
});

/**
 * POST /api/agents/:id/activate
 * Activate an agent (load into runtime)
 */
router.post('/:id/activate', async (req, res) => {
  try {
    const { id } = req.params;
    log.info(`Activating agent: ${id}`);
    
    // TODO: Implement agent activation
    // This would load the agent into the runtime AIX system
    
    res.json({
      success: true,
      message: `Agent ${id} activated`,
      agent: { id, status: 'active' }
    });
    
  } catch (error) {
    log.error(`Failed to activate agent ${req.params.id}: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to activate agent',
      message: error.message
    });
  }
});

/**
 * POST /api/agents/:id/deactivate
 * Deactivate an agent
 */
router.post('/:id/deactivate', async (req, res) => {
  try {
    const { id } = req.params;
    log.info(`Deactivating agent: ${id}`);
    
    // TODO: Implement agent deactivation
    
    res.json({
      success: true,
      message: `Agent ${id} deactivated`,
      agent: { id, status: 'idle' }
    });
    
  } catch (error) {
    log.error(`Failed to deactivate agent ${req.params.id}: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to deactivate agent',
      message: error.message
    });
  }
});

/**
 * GET /api/agents/:id/status
 * Get real-time status of an agent
 */
router.get('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: Get real status from runtime
    // For now, return mock status
    const status = {
      id,
      status: 'active',
      current_task: null,
      memory_usage: 0,
      uptime: 0,
      last_activity: new Date().toISOString()
    };
    
    res.json({
      success: true,
      status
    });
    
  } catch (error) {
    log.error(`Failed to get agent status ${req.params.id}: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to get agent status',
      message: error.message
    });
  }
});

/**
 * GET /api/agents/topology/network
 * Get the current agent topology network
 */
router.get('/topology/network', async (req, res) => {
  try {
    log.info('Fetching agent topology network');
    
    // TODO: Get real topology from runtime
    // For now, return example topology
    const topology = {
      nodes: [
        { id: 'amrikyy-001', type: 'orchestrator', connections: ['safar-001', 'thrifty-001', 'thaqafa-001'] },
        { id: 'safar-001', type: 'specialist', connections: ['amrikyy-001'] },
        { id: 'thrifty-001', type: 'specialist', connections: ['amrikyy-001'] },
        { id: 'thaqafa-001', type: 'specialist', connections: ['amrikyy-001'] }
      ],
      edges: [
        { from: 'amrikyy-001', to: 'safar-001', type: 'coordinates' },
        { from: 'amrikyy-001', to: 'thrifty-001', type: 'coordinates' },
        { from: 'amrikyy-001', to: 'thaqafa-001', type: 'coordinates' }
      ],
      quantum_state: {
        entangled_pairs: [
          ['safar-001', 'thrifty-001']
        ],
        superposition_active: true
      }
    };
    
    res.json({
      success: true,
      topology
    });
    
  } catch (error) {
    log.error(`Failed to fetch topology: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch topology',
      message: error.message
    });
  }
});

module.exports = router;

