/**
 * 🤖 Agent API Routes
 * HTTP endpoints for interacting with the Agent Manager
 * Part of Amrikyy-Agent Phase 1: Unified Backend
 * 
 * @version 2.0.0
 */

import { Router, Request, Response } from 'express';
import { AgentManager } from '../agents/AgentManager';
import logger from '../utils/logger';

const router = Router();

// Global AgentManager instance (singleton)
// This will be set when the server initializes
let agentManager: AgentManager | null = null;

/**
 * Set the AgentManager instance
 * Called by server.ts during initialization
 */
export function setAgentManager(manager: AgentManager) {
  agentManager = manager;
  logger.info('AgentManager set for API routes');
}

/**
 * Middleware to ensure AgentManager is available
 */
function requireAgentManager(req: Request, res: Response, next: any) {
  if (!agentManager) {
    return res.status(503).json({
      success: false,
      error: 'Agent Manager not initialized',
    });
  }
  (req as any).agentManager = agentManager;
  next();
}

// Apply middleware to all routes
router.use(requireAgentManager);

/**
 * GET /api/agents
 * List all registered agents
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const agents = agentManager!.listAgents();
    
    res.json({
      success: true,
      count: agents.length,
      agents,
    });
  } catch (error: any) {
    logger.error('Error listing agents:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/agents/stats
 * Get overall Agent Manager statistics
 */
router.get('/stats', (req: Request, res: Response) => {
  try {
    const stats = agentManager!.getStats();
    
    res.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    logger.error('Error getting stats:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/agents/:name
 * Get specific agent details
 */
router.get('/:name', (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const agent = agentManager!.getAgent(name);
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: `Agent '${name}' not found`,
      });
    }

    const stats = agentManager!.getAgentStats(name);
    const metadata = agent.getMetadata();
    const capabilities = agent.getCapabilities();
    const agentStats = agent.getStats();

    res.json({
      success: true,
      agent: {
        name: agent.name,
        id: agent.id,
        metadata,
        capabilities,
        stats: agentStats,
        managerStats: stats,
      },
    });
  } catch (error: any) {
    logger.error('Error getting agent:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/agents/:name/capabilities
 * Get agent capabilities
 */
router.get('/:name/capabilities', (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const agent = agentManager!.getAgent(name);
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: `Agent '${name}' not found`,
      });
    }

    const capabilities = agent.getCapabilities();

    res.json({
      success: true,
      agent: name,
      capabilities,
    });
  } catch (error: any) {
    logger.error('Error getting capabilities:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/agents/:name/execute
 * Execute a task synchronously
 */
router.post('/:name/execute', async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const { request, context } = req.body;

    if (!request) {
      return res.status(400).json({
        success: false,
        error: 'Request body is required',
      });
    }

    const agent = agentManager!.getAgent(name);
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: `Agent '${name}' not found`,
      });
    }

    logger.info(`Executing task synchronously for agent: ${name}`);

    const result = await agentManager!.executeTaskSync(name, request, context);

    res.json({
      success: result.success,
      data: result.data,
      error: result.error,
      executionTime: result.executionTime,
      metadata: result.metadata,
      warnings: result.warnings,
    });
  } catch (error: any) {
    logger.error('Error executing task:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/agents/:name/tasks
 * Create an async task (queued)
 */
router.post('/:name/tasks', async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const { request, context, priority, maxRetries } = req.body;

    if (!request) {
      return res.status(400).json({
        success: false,
        error: 'Request body is required',
      });
    }

    const agent = agentManager!.getAgent(name);
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: `Agent '${name}' not found`,
      });
    }

    logger.info(`Creating async task for agent: ${name}`);

    const task = await agentManager!.createTask(name, request, {
      context,
      priority: priority || 'normal',
      maxRetries: maxRetries || 3,
    });

    res.status(202).json({
      success: true,
      taskId: task.id,
      status: task.status,
      priority: task.priority,
      message: 'Task created and queued for processing',
      checkStatusUrl: `/api/agents/tasks/${task.id}`,
    });
  } catch (error: any) {
    logger.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/agents/tasks/:taskId
 * Get task status
 */
router.get('/tasks/:taskId', async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    
    logger.info(`Getting task status: ${taskId}`);
    
    const task = await agentManager!.getTask(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: `Task '${taskId}' not found`,
      });
    }

    res.json({
      success: true,
      task: {
        id: task.id,
        agent: task.agent,
        status: task.status,
        priority: task.priority,
        createdAt: task.createdAt,
        startedAt: task.startedAt,
        completedAt: task.completedAt,
        result: task.result,
        error: task.error,
        retryCount: task.retryCount,
        maxRetries: task.maxRetries,
      },
    });
  } catch (error: any) {
    logger.error('Error getting task:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/agents/:name/health
 * Agent health check
 */
router.get('/:name/health', async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const agent = agentManager!.getAgent(name);
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: `Agent '${name}' not found`,
      });
    }

    const health = await agent.healthCheck();

    res.json({
      success: true,
      agent: name,
      health,
    });
  } catch (error: any) {
    logger.error('Error checking agent health:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
