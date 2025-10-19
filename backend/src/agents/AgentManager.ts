import { createClient, RedisClientType } from 'redis';
import { v4 as uuidv4 } from 'uuid';
import { BaseAgent } from './BaseAgent';

type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed';

interface Task {
  id: string;
  request: any;
  status: TaskStatus;
  agent: string;
  createdAt: Date;
  updatedAt: Date;
  result?: any;
  error?: string;
}

export class AgentManager {
  private agents: Map<string, BaseAgent> = new Map();
  private redisClient: RedisClientType;
  private isRedisConnected: boolean = false;
  private isWorkerRunning: boolean = false;

  constructor() {
    this.redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    this.redisClient.on('error', (err) => {
      console.error('Redis Client Error', err);
      this.isRedisConnected = false;
    });

    this.redisClient.on('connect', () => {
      console.log('✅ Redis client connected');
      this.isRedisConnected = true;
      // Automatically start the worker once Redis is connected.
      this.startWorker();
    });

    this.redisClient.connect().catch((err) => {
      console.error('Failed to connect to Redis:', err);
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
      console.warn(`Agent with name ${agent.name} is already registered.`);
      return;
    }
    this.agents.set(agent.name, agent);
    console.log(`🚀 Agent registered: ${agent.name}`);
  }

  getAgent(name: string): BaseAgent | undefined {
    return this.agents.get(name);
  }

  listAgents(): { name: string; capabilities: string[] }[] {
    return Array.from(this.agents.values()).map((agent) => ({
      name: agent.name,
      capabilities: agent.getCapabilities(),
    }));
  }

  async createTask(agentName: string, request: any): Promise<Task> {
    const agent = this.getAgent(agentName);
    if (!agent) {
      throw new Error(`Agent ${agentName} not found.`);
    }

    const task: Task = {
      id: uuidv4(),
      agent: agentName,
      request,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (this.isRedisConnected) {
      await this.redisClient.set(`task:${task.id}`, JSON.stringify(task));
      await this.redisClient.lPush('task_queue', task.id);
    } else {
      console.warn('Redis not connected. Task processing will be in-memory.');
      // In-memory fallback for processing
      this.processTask(task);
    }

    return task;
  }

  private async processTask(task: Task): Promise<void> {
    const agent = this.getAgent(task.agent);
    if (!agent) {
      task.status = 'failed';
      task.error = `Agent ${task.agent} not found during processing.`;
      return;
    }

    try {
      task.status = 'processing';
      task.updatedAt = new Date();
      if (this.isRedisConnected)
        await this.redisClient.set(`task:${task.id}`, JSON.stringify(task));

      const result = await agent.execute(task.request);

      task.status = 'completed';
      task.result = result;
      task.updatedAt = new Date();
      if (this.isRedisConnected)
        await this.redisClient.set(`task:${task.id}`, JSON.stringify(task));
    } catch (error: any) {
      task.status = 'failed';
      task.error = error.message;
      task.updatedAt = new Date();
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
          // Blocking pop from the task queue, waits indefinitely for a task
          const result = await this.redisClient.brPop('task_queue', 0);
          if (result) {
            const taskId = result.element;
            const taskJSON = await this.redisClient.get(`task:${taskId}`);
            if (taskJSON) {
              const task: Task = JSON.parse(taskJSON);
              console.log(`Processing task ${task.id} for agent ${task.agent}`);
              await this.processTask(task);
            }
          }
        } catch (error) {
          console.error('Worker error while listening for tasks:', error);
          // Avoid a tight loop on persistent errors
          if (this.isWorkerRunning) await new Promise((resolve) => setTimeout(resolve, 5000));
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
