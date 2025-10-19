import { Router, Request, Response } from 'express';
import { AgentManager } from '../agents/AgentManager';

export const createAgentRoutes = (agentManager: AgentManager) => {
  const router = Router();

  /**
   * @route   POST /api/v2/agents/tasks
   * @desc    Create a new task for an agent
   * @access  Public
   */
  router.post('/tasks', async (req: Request, res: Response) => {
    const { agentName, request } = req.body;

    if (!agentName || !request) {
      return res.status(400).json({ success: false, error: 'agentName and request are required' });
    }

    try {
      const task = await agentManager.createTask(agentName, request);
      res
        .status(202)
        .json({ success: true, message: 'Task created successfully', taskId: task.id });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * @route   GET /api/v2/agents/tasks/:id
   * @desc    Get the status and result of a task
   * @access  Public
   */
  router.get('/tasks/:id', async (req: Request, res: Response) => {
    const taskId = req.params.id;
    // In a real application, we would fetch the task from Redis
    // For now, this is a conceptual endpoint. The AgentManager processes tasks asynchronously.
    // A proper implementation would involve checking the Redis store: `redisClient.get(`task:${taskId}`)`

    // This is a simplified mock response.
    const taskStatus = {
      taskId,
      status: 'pending', // or "processing", "completed", "failed"
      message: 'Task status would be retrieved from Redis here.',
    };

    res.json({ success: true, task: taskStatus });
  });

  /**
   * @route   GET /api/v2/agents
   * @desc    List all registered agents and their capabilities
   * @access  Public
   */
  router.get('/', (req: Request, res: Response) => {
    try {
      const agents = agentManager.listAgents();
      res.json({ success: true, agents });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
};
