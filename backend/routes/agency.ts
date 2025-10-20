/**
 * ============================================
 * AGENCY ROUTES - Agent Management & Coordination
 * Provides API endpoints for interacting with AgentManager
 * ============================================
 */

import { Router, Request, Response } from 'express';
import { AgentManager } from '../src/agents/AgentManager';

const router = Router();

/**
 * Middleware to ensure AgentManager is available
 */
router.use((req: Request, res: Response, next) => {
  if (!req.app.locals.agentManager) {
    return res.status(500).json({
      success: false,
      error: 'Agent Manager not initialized',
      message: 'The agent management system is currently unavailable'
    });
  }
  next();
});

/**
 * GET /api/agency/status
 * Get Agent Manager status and registered agents
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const agentManager: AgentManager = req.app.locals.agentManager;
    const agents = agentManager.listAgents();
    const queueLength = await agentManager.getTaskQueueLength();
    
    res.json({
      success: true,
      status: 'running',
      timestamp: new Date().toISOString(),
      agentsRegistered: agentManager.getRegisteredAgentsCount(),
      taskQueueLength: queueLength,
      agents: agents.map(agent => ({
        name: agent.name,
        capabilities: agent.capabilities,
        stats: agent.stats
      }))
    });
  } catch (error: any) {
    console.error('Error getting agency status:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/agency/tasks
 * Create a new task for an agent
 */
router.post('/tasks', async (req: Request, res: Response) => {
  try {
    const { agentName, request, priority, metadata } = req.body;
    
    // Validation
    if (!agentName || !request) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters',
        message: 'agentName and request are required'
      });
    }
    
    // Validate priority if provided
    const validPriorities = ['low', 'normal', 'high', 'urgent'];
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid priority',
        message: `Priority must be one of: ${validPriorities.join(', ')}`
      });
    }
    
    const agentManager: AgentManager = req.app.locals.agentManager;
    
    const taskId = await agentManager.processNewTask(
      agentName,
      request,
      { priority: priority || 'normal', metadata }
    );
    
    res.status(202).json({
      success: true,
      message: `Task created for agent ${agentName}`,
      taskId,
      priority: priority || 'normal',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error creating agency task:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/agency/tasks/:taskId
 * Get status of a specific task
 */
router.get('/tasks/:taskId', async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const agentManager: AgentManager = req.app.locals.agentManager;
    
    const task = await agentManager.getTaskStatus(taskId);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
        message: `No task found with ID: ${taskId}`
      });
    }
    
    res.json({
      success: true,
      task,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error getting task status:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/agency/agents/:name
 * Get specific agent information
 */
router.get('/agents/:name', (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const agentManager: AgentManager = req.app.locals.agentManager;
    
    const agent = agentManager.getAgent(name);
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: `Agent ${name} not found`
      });
    }
    
    const stats = agentManager.getAgentStats(name);
    
    res.json({
      success: true,
      agent: {
        name: agent.name,
        capabilities: agent.getCapabilities(),
        stats
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error getting agent info:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/agency/stats
 * Get overall agency statistics
 */
router.get('/stats', (req: Request, res: Response) => {
  try {
    const agentManager: AgentManager = req.app.locals.agentManager;
    const allStats = agentManager.getAgentStats();
    
    // Calculate overall statistics
    const overall = Array.isArray(allStats) ? allStats.reduce((acc, stat) => ({
      totalProcessed: acc.totalProcessed + stat.tasksProcessed,
      totalSucceeded: acc.totalSucceeded + stat.tasksSucceeded,
      totalFailed: acc.totalFailed + stat.tasksFailed,
      avgProcessingTime: (acc.avgProcessingTime + stat.averageProcessingTime) / 2
    }), {
      totalProcessed: 0,
      totalSucceeded: 0,
      totalFailed: 0,
      avgProcessingTime: 0
    }) : {
      totalProcessed: 0,
      totalSucceeded: 0,
      totalFailed: 0,
      avgProcessingTime: 0
    };
    
    res.json({
      success: true,
      overall,
      byAgent: allStats,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error getting agency stats:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
