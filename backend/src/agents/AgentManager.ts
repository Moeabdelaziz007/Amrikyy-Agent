
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { BaseAgent, AgentCapability } from './BaseAgent'; // Assuming a BaseAgent class exists
import { TravelAgent } from './TravelAgent'; // The new consolidated agent
import { StudioAgent } from './StudioAgent'; // Example of another specialized agent
import logger from '../utils/logger';
import redisClient from '../utils/redisClient'; // Assuming Redis client is centralized

// Define the structure of a task in the queue
interface Task {
  taskId: string;
  requestId: string;
  taskType: string; // e.g., 'plan_trip', 'generate_image', 'analyze_market_data'
  params: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: number;
}

// The central nervous system for all AI agents
class AgentManager extends EventEmitter {
  private agents: Map<string, BaseAgent> = new Map();
  private taskQueue: Task[] = [];
  private activeTasks: Map<string, Task> = new Map();

  constructor() {
    super();
    this.registerAgents();
    this.setupListeners();
    setInterval(() => this.processTaskQueue(), 5000); // Process queue every 5 seconds
    logger.info('🚀 AgentManager initialized and processing queue.');
  }

  // Register all available specialized agents
  private registerAgents() {
    const travelAgent = new TravelAgent();
    const studioAgent = new StudioAgent();

    this.agents.set(travelAgent.getName(), travelAgent);
    this.agents.set(studioAgent.getName(), studioAgent);

    logger.info(`Registered agents: ${Array.from(this.agents.keys()).join(', ')}`);
  }

  // Listen for internal events
  private setupListeners() {
    this.on('taskCompleted', (task, result) => {
      logger.info(`✅ Task ${task.taskId} completed successfully.`);
      this.activeTasks.delete(task.taskId);
      // Further actions: notify user, trigger next task in a workflow, etc.
    });

    this.on('taskFailed', (task, error) => {
      logger.error(`❌ Task ${task.taskId} failed: ${error.message}`);
      this.activeTasks.delete(task.taskId);
      // Further actions: retry logic, notify user of failure, etc.
    });
  }

  /**
   * Entry point for all incoming requests from the frontend/API
   * @param requestType The primary action requested, e.g., 'full_travel_plan'
   * @param params The data associated with the request
   * @returns The unique ID for the overarching request
   */
  public async submitRequest(requestType: string, params: Record<string, any>): Promise<string> {
    const requestId = `req_${uuidv4()}`;
    logger.info(`📥 Received new request ${requestId} of type ${requestType}`);

    // In a real scenario, a "WorkflowEngine" would create this task sequence.
    // For now, we'll create a single task.
    const task: Task = {
      taskId: `task_${uuidv4()}`,
      requestId,
      taskType: requestType, // The requestType directly maps to a taskType for now
      params,
      status: 'pending',
      createdAt: Date.now(),
    };

    this.taskQueue.push(task);
    await redisClient.set(`request:${requestId}`, JSON.stringify({ status: 'queued', tasks: [task.taskId] }));

    this.emit('requestQueued', { requestId, task });
    return requestId;
  }

  // The main loop that processes tasks from the queue
  private async processTaskQueue() {
    if (this.taskQueue.length === 0) {
      return;
    }

    const task = this.taskQueue.shift();
    if (!task) return;

    const capableAgent = this.findCapableAgent(task.taskType);

    if (capableAgent) {
      try {
        task.status = 'processing';
        this.activeTasks.set(task.taskId, task);
        logger.info(`Processing task ${task.taskId} with agent ${capableAgent.getName()}`);

        const result = await capableAgent.execute(task.taskType, task.params);
        
        task.status = 'completed';
        this.emit('taskCompleted', task, result);

      } catch (error) {
        task.status = 'failed';
        this.emit('taskFailed', task, error);
      }
    } else {
      logger.warn(`No capable agent found for task type: ${task.taskType}`);
      task.status = 'failed';
      this.emit('taskFailed', task, new Error('No capable agent available.'));
    }
  }

  // Find an agent that has the required capability
  private findCapableAgent(taskType: string): BaseAgent | undefined {
    for (const agent of this.agents.values()) {
      if (agent.getCapabilities().some(cap => cap.taskType === taskType)) {
        return agent;
      }
    }
    return undefined;
  }

  // Get the status of a specific request
  public async getRequestStatus(requestId: string): Promise<any> {
    const requestData = await redisClient.get(`request:${requestId}`);
    return requestData ? JSON.parse(requestData) : null;
  }
}

// Export a singleton instance
export const agentManager = new AgentManager();
