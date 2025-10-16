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
    
    // Initialize agent runtime if not already initialized
    if (!global.agentRuntime) {
      const { AgentRuntime } = require('../src/aix/AgentRuntime');
      global.agentRuntime = new AgentRuntime({
        agentsDirectory: path.join(__dirname, '../agents')
      });
      await global.agentRuntime.start();
    }
    
    // Activate the agent
    const result = await global.agentRuntime.activateAgent(id, req.body);
    
    res.json({
      success: true,
      message: `Agent ${id} activated successfully`,
      agent: result
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
    
    // Check if agent runtime is available
    if (!global.agentRuntime) {
      return res.status(400).json({
        success: false,
        error: 'Agent runtime not initialized',
        message: 'Agent runtime must be started before deactivating agents'
      });
    }
    
    // Deactivate the agent
    const result = await global.agentRuntime.deactivateAgent(id);
    
    res.json({
      success: true,
      message: `Agent ${id} deactivated successfully`,
      agent: result
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
    
    // Check if agent runtime is available
    if (!global.agentRuntime) {
      return res.status(400).json({
        success: false,
        error: 'Agent runtime not initialized',
        message: 'Agent runtime must be started to get agent status'
      });
    }
    
    // Get real status from runtime
    const status = global.agentRuntime.getAgentStatus(id);
    
    if (status.error) {
      return res.status(404).json({
        success: false,
        error: status.error,
        message: `Agent ${id} not found`
      });
    }
    
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
    
    // Check if agent runtime is available
    if (!global.agentRuntime) {
      return res.status(400).json({
        success: false,
        error: 'Agent runtime not initialized',
        message: 'Agent runtime must be started to get topology'
      });
    }
    
    // Get real topology from runtime
    const systemStatus = global.agentRuntime.getSystemStatus();
    const allAgentsStatus = global.agentRuntime.getAllAgentsStatus();
    
    const topology = {
      nodes: Object.keys(allAgentsStatus).map(agentId => ({
        id: agentId,
        name: allAgentsStatus[agentId].name || agentId,
        type: 'agent',
        status: allAgentsStatus[agentId].status,
        capabilities: allAgentsStatus[agentId].capabilities || [],
        uptime: allAgentsStatus[agentId].uptime || 0
      })),
      edges: [], // Will be populated based on agent connections
      runtime_status: {
        isRunning: systemStatus.isRunning,
        totalAgents: systemStatus.totalAgents,
        activeAgents: systemStatus.activeAgents,
        uptime: systemStatus.uptime
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

/**
 * POST /api/agents/:id/execute
 * Execute a task on an agent
 */
router.post('/:id/execute', async (req, res) => {
  try {
    const { id } = req.params;
    const { task, context } = req.body;
    
    log.info(`Executing task on agent: ${id}`, { taskType: task?.type });
    
    // Check if agent runtime is available
    if (!global.agentRuntime) {
      return res.status(400).json({
        success: false,
        error: 'Agent runtime not initialized',
        message: 'Agent runtime must be started to execute tasks'
      });
    }
    
    // Validate task
    if (!task || !task.type) {
      return res.status(400).json({
        success: false,
        error: 'Invalid task',
        message: 'Task must have a type property'
      });
    }
    
    // Execute the task
    const result = await global.agentRuntime.executeAgent(id, task, context || {});
    
    res.json({
      success: true,
      message: `Task executed successfully on agent ${id}`,
      result
    });
    
  } catch (error) {
    log.error(`Failed to execute task on agent ${req.params.id}: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to execute task',
      message: error.message
    });
  }
});

/**
 * GET /api/agents/runtime/status
 * Get runtime status
 */
router.get('/runtime/status', async (req, res) => {
  try {
    log.info('Fetching runtime status');
    
    // Check if agent runtime is available
    if (!global.agentRuntime) {
      return res.status(400).json({
        success: false,
        error: 'Agent runtime not initialized',
        message: 'Agent runtime is not started'
      });
    }
    
    // Get runtime stats
    const stats = global.agentRuntime.getRuntimeStats();
    const allAgentsStatus = global.agentRuntime.getAllAgentsStatus();
    
    res.json({
      success: true,
      runtime: {
        stats,
        agents: allAgentsStatus,
        systemStatus: global.agentRuntime.getSystemStatus()
      }
    });
    
  } catch (error) {
    log.error(`Failed to get runtime status: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to get runtime status',
      message: error.message
    });
  }
});

/**
 * POST /api/agents/runtime/start
 * Start the agent runtime
 */
router.post('/runtime/start', async (req, res) => {
  try {
    log.info('Starting agent runtime');
    
    // Initialize agent runtime if not already initialized
    if (!global.agentRuntime) {
      const { AgentRuntime } = require('../src/aix/AgentRuntime');
      global.agentRuntime = new AgentRuntime({
        agentsDirectory: path.join(__dirname, '../agents')
      });
    }
    
    // Start the runtime
    await global.agentRuntime.start();
    
    res.json({
      success: true,
      message: 'Agent runtime started successfully',
      runtime: global.agentRuntime.getRuntimeStats()
    });
    
  } catch (error) {
    log.error(`Failed to start runtime: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to start runtime',
      message: error.message
    });
  }
});

/**
 * POST /api/agents/runtime/stop
 * Stop the agent runtime
 */
router.post('/runtime/stop', async (req, res) => {
  try {
    log.info('Stopping agent runtime');
    
    // Check if agent runtime is available
    if (!global.agentRuntime) {
      return res.status(400).json({
        success: false,
        error: 'Agent runtime not initialized',
        message: 'Agent runtime is not running'
      });
    }
    
    // Stop the runtime
    await global.agentRuntime.stop();
    
    res.json({
      success: true,
      message: 'Agent runtime stopped successfully'
    });
    
  } catch (error) {
    log.error(`Failed to stop runtime: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Failed to stop runtime',
      message: error.message
    });
  }
});

module.exports = router;

