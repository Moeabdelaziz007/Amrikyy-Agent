/**
 * 🎯 Agent Manager - Enhanced Version
 * Central coordinator for all agents with Redis queuing and LangSmith tracing
 * Part of Amrikyy-Agent Phase 1: Unified Agent System
 * 
 * @version 2.0.0
 */

import { createClient, RedisClientType } from 'redis';
import { v4 as uuidv4 } from 'uuid';
import { BaseAgent, ExecutionContext, ExecutionResult } from './BaseAgent';
import logger from '../utils/logger';

// LangSmith tracing (optional)
let langsmithClient: any = null;
try {
  const { Client } = require('langsmith');
  if (process.env.LANGCHAIN_API_KEY) {
    langsmithClient = new Client({
      apiKey: process.env.LANGCHAIN_API_KEY,
    });
    logger.info('✅ LangSmith tracing enabled');
  }
} catch (error) {
  logger.warn('LangSmith not available:', error);
}

// Task types
type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';

/**
 * Task definition
 */
interface Task {
  id: string;
  agent: string;
  request: any;
  context?: ExecutionContext;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  result?: ExecutionResult;
  error?: string;
  retryCount: number;
  maxRetries: number;
}

/**
 * Agent registration info
 */
interface AgentRegistration {
  agent: BaseAgent;
  registeredAt: Date;
  taskCount: number;
  successCount: number;
  failureCount: number;
  averageExecutionTime: number;
}

/**
 * Agent Manager
 * Manages all agents and coordinates task execution
 */
export class AgentManager {
  private agents: Map<string, AgentRegistration> = new Map();
  private redisClient: RedisClientType;
  private isRedisConnected: boolean = false;
  private isWorkerRunning: boolean = false;

  // Statistics
  private stats = {
    totalTasksProcessed: 0,
    totalTasksSucceeded: 0,
    totalTasksFailed: 0,
    averageQueueTime: 0,
  };

  constructor() {
    this.redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Redis reconnection failed after 10 attempts');
            return new Error('Redis reconnection limit exceeded');
          }
          return Math.min(retries * 100, 3000);
        },
      },
    });

    this.redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
      this.isRedisConnected = false;
    });

    this.redisClient.on('connect', () => {
      logger.info('✅ Redis client connected in AgentManager');
      this.isRedisConnected = true;
      this.startWorker();
    });

    this.redisClient.connect().catch((err) => {
      logger.error('Failed to connect Redis:', err);
    });
  }

  /**
   * Register an agent
   */
  async registerAgent(agent: BaseAgent): Promise<void> {
    if (this.agents.has(agent.name)) {
      logger.warn(`Agent ${agent.name} is already registered`);
      return;
    }

    // Initialize agent
    await agent.initialize();

    // Register
    this.agents.set(agent.name, {
      agent,
      registeredAt: new Date(),
      taskCount: 0,
      successCount: 0,
      failureCount: 0,
      averageExecutionTime: 0,
    });

    logger.info(`🚀 Agent registered: ${agent.name}`, {
      capabilities: agent.getCapabilities().length,
      domain: agent.getMetadata().domain,
    });
  }

  /**
   * Unregister an agent
   */
  async unregisterAgent(name: string): Promise<void> {
    const registration = this.agents.get(name);
    if (!registration) {
      logger.warn(`Agent ${name} is not registered`);
      return;
    }

    await registration.agent.cleanup();
    this.agents.delete(name);
    logger.info(`Agent unregistered: ${name}`);
  }

  /**
   * Get an agent by name
   */
  getAgent(name: string): BaseAgent | undefined {
    return this.agents.get(name)?.agent;
  }

  /**
   * List all registered agents
   */
  listAgents(): Array<{ 
    name: string; 
    capabilities: string[]; 
    domain: string;
    stats?: any;
  }> {
    return Array.from(this.agents.values()).map((reg) => ({
      name: reg.agent.name,
      capabilities: reg.agent.getCapabilities().map(c => c.name),
      domain: reg.agent.getMetadata().domain,
      stats: reg.agent.getStats(),
    }));
  }

  /**
   * Create a task for an agent (async execution)
   */
  async createTask(
    agentName: string,
    request: any,
    options: {
      context?: ExecutionContext;
      priority?: TaskPriority;
      maxRetries?: number;
    } = {}
  ): Promise<Task> {
    const registration = this.agents.get(agentName);
    if (!registration) {
      throw new Error(`Agent ${agentName} not found`);
    }

    const task: Task = {
      id: uuidv4(),
      agent: agentName,
      request,
      context: options.context || {
        requestId: uuidv4(),
        timestamp: new Date(),
      },
      status: 'pending',
      priority: options.priority || 'normal',
      createdAt: new Date(),
      updatedAt: new Date(),
      retryCount: 0,
      maxRetries: options.maxRetries || 3,
    };

    if (this.isRedisConnected) {
      // Store task in Redis
      await this.redisClient.set(`task:${task.id}`, JSON.stringify(task));
      
      // Add to priority queue
      const queueKey = this.getQueueKeyForPriority(task.priority);
      await this.redisClient.lPush(queueKey, task.id);
      
      logger.info(`Task created: ${task.id}`, {
        agent: agentName,
        priority: task.priority,
      });
    } else {
      logger.warn('Redis not connected. Processing task immediately...');
      await this.processTask(task);
    }

    return task;
  }

  /**
   * Execute a task synchronously (bypass queue)
   */
  async executeTaskSync(
    agentName: string,
    request: any,
    context?: ExecutionContext
  ): Promise<ExecutionResult> {
    const registration = this.agents.get(agentName);
    if (!registration) {
      throw new Error(`Agent ${agentName} not found`);
    }

    const task: Task = {
      id: uuidv4(),
      agent: agentName,
      request,
      context: context || { requestId: uuidv4(), timestamp: new Date() },
      status: 'processing',
      priority: 'urgent',
      createdAt: new Date(),
      updatedAt: new Date(),
      retryCount: 0,
      maxRetries: 0,
    };

    await this.processTask(task);
    return task.result!;
  }

  /**
   * Process a task
   */
  private async processTask(task: Task): Promise<void> {
    const registration = this.agents.get(task.agent);
    if (!registration) {
      task.status = 'failed';
      task.error = `Agent ${task.agent} not found`;
      return;
    }

    const agent = registration.agent;
    const startTime = Date.now();

    try {
      task.status = 'processing';
      task.startedAt = new Date();
      task.updatedAt = new Date();

      if (this.isRedisConnected) {
        await this.redisClient.set(`task:${task.id}`, JSON.stringify(task));
      }

      // Execute with LangSmith tracing if available
      let result: ExecutionResult;
      
      if (langsmithClient) {
        // Trace execution with LangSmith
        const runId = uuidv4();
        await langsmithClient.createRun({
          id: runId,
          name: `execute_${agent.name}`,
          run_type: 'chain',
          inputs: task.request,
          start_time: Date.now(),
        });

        try {
          result = await agent.executeWithTracking(task.request, task.context);
          
          await langsmithClient.updateRun(runId, {
            outputs: result,
            end_time: Date.now(),
            error: result.success ? undefined : result.error,
          });
        } catch (error: any) {
          await langsmithClient.updateRun(runId, {
            end_time: Date.now(),
            error: error.message,
          });
          throw error;
        }
      } else {
        // Execute without tracing
        result = await agent.executeWithTracking(task.request, task.context);
      }

      // Update task with result
      task.status = 'completed';
      task.result = result;
      task.completedAt = new Date();
      task.updatedAt = new Date();

      // Update statistics
      const executionTime = Date.now() - startTime;
      registration.taskCount++;
      registration.successCount++;
      registration.averageExecutionTime = 
        (registration.averageExecutionTime * (registration.taskCount - 1) + executionTime) / 
        registration.taskCount;

      this.stats.totalTasksProcessed++;
      this.stats.totalTasksSucceeded++;

      logger.info(`Task completed: ${task.id}`, {
        agent: task.agent,
        executionTime: `${executionTime}ms`,
        success: result.success,
      });

    } catch (error: any) {
      task.status = 'failed';
      task.error = error.message;
      task.updatedAt = new Date();

      // Update statistics
      registration.taskCount++;
      registration.failureCount++;
      this.stats.totalTasksProcessed++;
      this.stats.totalTasksFailed++;

      logger.error(`Task failed: ${task.id}`, {
        agent: task.agent,
        error: error.message,
        retryCount: task.retryCount,
      });

      // Retry logic
      if (task.retryCount < task.maxRetries) {
        task.retryCount++;
        task.status = 'pending';
        logger.info(`Retrying task: ${task.id} (attempt ${task.retryCount + 1}/${task.maxRetries + 1})`);
        
        if (this.isRedisConnected) {
          const queueKey = this.getQueueKeyForPriority(task.priority);
          await this.redisClient.lPush(queueKey, task.id);
        } else {
          await this.processTask(task);
        }
      }
    } finally {
      if (this.isRedisConnected) {
        await this.redisClient.set(`task:${task.id}`, JSON.stringify(task));
      }
    }
  }

  /**
   * Start the background worker
   */
  public startWorker(): void {
    if (!this.isRedisConnected) {
      logger.warn('Cannot start worker: Redis not connected');
      return;
    }

    if (this.isWorkerRunning) {
      logger.warn('Worker is already running');
      return;
    }

    this.isWorkerRunning = true;
    logger.info('🚀 Agent worker started, listening for tasks...');

    this.listenForTasks();
  }

  /**
   * Listen for tasks from Redis queues
   */
  private async listenForTasks(): Promise<void> {
    // Priority order: urgent > high > normal > low
    const queueKeys = [
      'task_queue:urgent',
      'task_queue:high',
      'task_queue:normal',
      'task_queue:low',
    ];

    while (this.isWorkerRunning) {
      try {
        // Try to pop from queues in priority order
        for (const queueKey of queueKeys) {
          const result = await this.redisClient.rPop(queueKey);
          
          if (result) {
            const taskId = result;
            const taskJSON = await this.redisClient.get(`task:${taskId}`);
            
            if (taskJSON) {
              const task: Task = JSON.parse(taskJSON);
              logger.info(`Processing task ${task.id} from ${queueKey}`);
              await this.processTask(task);
            }
            
            break; // Process one task at a time
          }
        }

        // Small delay to avoid tight loop
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        logger.error('Worker error:', error);
        if (this.isWorkerRunning) {
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }
  }

  /**
   * Stop the worker
   */
  public stopWorker(): void {
    if (this.isWorkerRunning) {
      logger.info('🛑 Stopping agent worker...');
      this.isWorkerRunning = false;
    }
  }

  /**
   * Get queue key for priority
   */
  private getQueueKeyForPriority(priority: TaskPriority): string {
    return `task_queue:${priority}`;
  }

  /**
   * Get task by ID
   */
  async getTask(taskId: string): Promise<Task | null> {
    if (!this.isRedisConnected) {
      return null;
    }

    const taskJSON = await this.redisClient.get(`task:${taskId}`);
    return taskJSON ? JSON.parse(taskJSON) : null;
  }

  /**
   * Get agent statistics
   */
  getAgentStats(agentName: string): Partial<AgentRegistration> | null {
    const registration = this.agents.get(agentName);
    if (!registration) {
      return null;
    }

    return {
      registeredAt: registration.registeredAt,
      taskCount: registration.taskCount,
      successCount: registration.successCount,
      failureCount: registration.failureCount,
      averageExecutionTime: registration.averageExecutionTime,
    };
  }

  /**
   * Get overall statistics
   */
  getStats() {
    return {
      ...this.stats,
      agentsRegistered: this.agents.size,
      workerRunning: this.isWorkerRunning,
      redisConnected: this.isRedisConnected,
      langsmithEnabled: !!langsmithClient,
    };
  }

  /**
   * Disconnect and cleanup
   */
  async disconnect(): Promise<void> {
    this.stopWorker();
    
    // Cleanup all agents
    for (const [name, registration] of this.agents) {
      await registration.agent.cleanup();
    }

    if (this.isRedisConnected && this.redisClient.isOpen) {
      await this.redisClient.quit();
    }

    logger.info('✅ Agent Manager disconnected');
  }
}
