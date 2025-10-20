import { createClient, RedisClientType } from 'redis';
import { v4 as uuidv4 } from 'uuid';
import { BaseAgent } from './BaseAgent';
import { config } from '../config/env';

type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed';
type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';

interface Task {
  id: string;
  request: any;
  status: TaskStatus;
  priority: TaskPriority;
  agent: string;
  createdAt: Date;
  updatedAt: Date;
  processingStartedAt?: Date;
  processingCompletedAt?: Date;
  result?: any;
  error?: string;
  metadata?: Record<string, any>;
}

interface AgentStats {
  name: string;
  tasksProcessed: number;
  tasksSucceeded: number;
  tasksFailed: number;
  averageProcessingTime: number;
  lastActive: Date | null;
}

export class AgentManager {
  private agents: Map<string, BaseAgent> = new Map();
  private agentStats: Map<string, AgentStats> = new Map();
  private redisClient: RedisClientType;
  private isRedisConnected: boolean = false;
  private isWorkerRunning: boolean = false;

  constructor() {
    this.redisClient = createClient({
      url: config.redis.url,
      password: config.redis.password,
    });

    this.redisClient.on('error', (err) => {
      console.error('🚨 AgentManager Redis Error:', err);
      this.isRedisConnected = false;
    });

    this.redisClient.on('connect', () => {
      console.log('✅ AgentManager: Redis client connected');
      this.isRedisConnected = true;
      // Automatically start the worker once Redis is connected.
      this.startWorker();
    });

    this.redisClient.connect().catch((err) => {
      console.error('🚨 AgentManager: Failed to connect to Redis:', err);
    });
  }

  public async disconnect(): Promise<void> {
    this.stopWorker();
    if (this.isRedisConnected && this.redisClient.isOpen) {
      await this.redisClient.quit();
    }
  }

  registerAgent(agent: BaseAgent): void {
    if (this.agents.has(agent.name)) {
      console.warn(`⚠️  Agent with name ${agent.name} is already registered.`);
      return;
    }
    
    this.agents.set(agent.name, agent);
    
    // Initialize statistics for this agent
    this.agentStats.set(agent.name, {
      name: agent.name,
      tasksProcessed: 0,
      tasksSucceeded: 0,
      tasksFailed: 0,
      averageProcessingTime: 0,
      lastActive: null
    });
    
    console.log(`🚀 Agent registered: ${agent.name}`);
  }

  getAgent(name: string): BaseAgent | undefined {
    return this.agents.get(name);
  }

  listAgents(): { name: string; capabilities: string[]; stats: AgentStats }[] {
    return Array.from(this.agents.values()).map((agent) => ({
      name: agent.name,
      capabilities: agent.getCapabilities(),
      stats: this.agentStats.get(agent.name)!
    }));
  }

  /**
   * Get count of registered agents
   */
  getRegisteredAgentsCount(): number {
    return this.agents.size;
  }

  /**
   * Get approximate task queue length
   */
  async getTaskQueueLength(): Promise<number> {
    if (!this.isRedisConnected) return 0;
    
    try {
      const priorities: TaskPriority[] = ['urgent', 'high', 'normal', 'low'];
      let total = 0;
      
      for (const priority of priorities) {
        const queueName = `task_queue:${priority}`;
        const length = await this.redisClient.lLen(queueName);
        total += length;
      }
      
      return total;
    } catch (error) {
      console.error('Error getting queue length:', error);
      return 0;
    }
  }

  /**
   * Get agent statistics
   */
  getAgentStats(agentName?: string): AgentStats | AgentStats[] {
    if (agentName) {
      const stats = this.agentStats.get(agentName);
      if (!stats) {
        throw new Error(`Agent ${agentName} not found`);
      }
      return stats;
    }
    
    return Array.from(this.agentStats.values());
  }

  async createTask(
    agentName: string, 
    request: any, 
    priority: TaskPriority = 'normal',
    metadata?: Record<string, any>
  ): Promise<Task> {
    const agent = this.getAgent(agentName);
    if (!agent) {
      throw new Error(`Agent ${agentName} not found.`);
    }

    const task: Task = {
      id: uuidv4(),
      agent: agentName,
      request,
      status: 'pending',
      priority,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata
    };

    if (this.isRedisConnected) {
      await this.redisClient.set(`task:${task.id}`, JSON.stringify(task));
      
      // Use priority queues
      const queueName = `task_queue:${priority}`;
      await this.redisClient.lPush(queueName, task.id);
      
      console.log(`📝 Task ${task.id} created for agent ${agentName} with priority ${priority}`);
    } else {
      console.warn('⚠️  Redis not connected. Processing task immediately in-memory...');
      // In-memory fallback for processing
      await this.processTask(task);
    }

    return task;
  }

  /**
   * Process a new task (alias for createTask for API compatibility)
   */
  async processNewTask(
    agentId: string,
    taskInput: any,
    taskConfig?: { priority?: TaskPriority; metadata?: Record<string, any> }
  ): Promise<string> {
    const task = await this.createTask(
      agentId,
      taskInput,
      taskConfig?.priority || 'normal',
      taskConfig?.metadata
    );
    return task.id;
  }

  /**
   * Get task status
   */
  async getTaskStatus(taskId: string): Promise<Task | null> {
    if (!this.isRedisConnected) {
      return null;
    }

    try {
      const taskJSON = await this.redisClient.get(`task:${taskId}`);
      return taskJSON ? JSON.parse(taskJSON) : null;
    } catch (error) {
      console.error(`Error getting task ${taskId}:`, error);
      return null;
    }
  }

  private async processTask(task: Task): Promise<void> {
    const agent = this.getAgent(task.agent);
    if (!agent) {
      task.status = 'failed';
      task.error = `Agent ${task.agent} not found during processing.`;
      return;
    }

    const startTime = Date.now();

    try {
      task.status = 'processing';
      task.processingStartedAt = new Date();
      task.updatedAt = new Date();
      if (this.isRedisConnected)
        await this.redisClient.set(`task:${task.id}`, JSON.stringify(task));

      console.log(`⚙️  Processing task ${task.id} for agent ${task.agent}...`);

      const result = await agent.execute(task.request);

      task.status = 'completed';
      task.result = result;
      task.processingCompletedAt = new Date();
      task.updatedAt = new Date();
      
      // Update statistics
      const stats = this.agentStats.get(task.agent)!;
      stats.tasksProcessed++;
      stats.tasksSucceeded++;
      stats.lastActive = new Date();
      
      const processingTime = Date.now() - startTime;
      stats.averageProcessingTime = 
        (stats.averageProcessingTime * (stats.tasksProcessed - 1) + processingTime) / stats.tasksProcessed;
      
      console.log(`✅ Task ${task.id} completed in ${processingTime}ms`);
      
      if (this.isRedisConnected)
        await this.redisClient.set(`task:${task.id}`, JSON.stringify(task));
    } catch (error: any) {
      task.status = 'failed';
      task.error = error.message;
      task.processingCompletedAt = new Date();
      task.updatedAt = new Date();
      
      // Update statistics
      const stats = this.agentStats.get(task.agent)!;
      stats.tasksProcessed++;
      stats.tasksFailed++;
      stats.lastActive = new Date();
      
      console.error(`❌ Task ${task.id} failed:`, error.message);
      
      if (this.isRedisConnected)
        await this.redisClient.set(`task:${task.id}`, JSON.stringify(task));
    }
  }

  /**
   * Starts the Redis queue worker.
   * The worker listens for tasks and processes them.
   */
  public startWorker(): void {
    if (!this.isRedisConnected) {
      console.warn('Cannot start worker, Redis is not connected.');
      return;
    }
    if (this.isWorkerRunning) {
      console.warn('Worker is already running.');
      return;
    }

    this.isWorkerRunning = true;
    console.log('🚀 Agent worker started, listening for tasks...');

    const listenForTasks = async () => {
      while (this.isWorkerRunning) {
        try {
          // Priority: urgent > high > normal > low
          const priorities: TaskPriority[] = ['urgent', 'high', 'normal', 'low'];
          let processed = false;

          for (const priority of priorities) {
            const queueName = `task_queue:${priority}`;
            const result = await this.redisClient.brPop(queueName, 0.1); // 100ms timeout
            
            if (result) {
              const taskId = result.element;
              const taskJSON = await this.redisClient.get(`task:${taskId}`);
              if (taskJSON) {
                const task: Task = JSON.parse(taskJSON);
                await this.processTask(task);
                processed = true;
                break; // Process one task then check priorities again
              }
            }
          }

          if (!processed) {
            // No tasks in any queue, wait a bit
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        } catch (error) {
          console.error('🚨 Worker error while listening for tasks:', error);
          // Avoid a tight loop on persistent errors
          if (this.isWorkerRunning) 
            await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }
    };

    listenForTasks();
  }

  /**
   * Stops the Redis queue worker.
   */
  public stopWorker(): void {
    if (this.isWorkerRunning) {
      console.log('🛑 Stopping agent worker...');
      this.isWorkerRunning = false;
    }
  }
}
