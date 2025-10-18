
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { BaseAgent, AgentTask } from '../../interfaces/agent';
import logger from '../../utils/logger';
import { TravelAgent } from './specialized/TravelAgent';

// The new central orchestrator for the SAAAAS platform.
// This class replaces the monolithic AgentCoordinator.js.

class AgentManager {
    private agents: Map<string, BaseAgent> = new Map();
    private taskQueue: AgentTask[] = [];
    private activeTasks: Map<string, AgentTask> = new Map();
    private eventBus: EventEmitter = new EventEmitter();

    constructor() {
        this.setupDefaultAgents();
        this.listenForEvents();
        logger.info('🚀 AgentManager initialized and is listening for agent events.');
    }

    // Register the initial set of specialized agents.
    // In the future, this could be dynamic.
    private setupDefaultAgents(): void {
        const travelAgent = new TravelAgent();
        this.registerAgent(travelAgent);

        // Register other agents here as they are created
        // e.g., this.registerAgent(new ContentAgent());
    }

    // Listen for events emitted by agents to orchestrate workflows.
    private listenForEvents(): void {
        this.eventBus.on('taskCompleted', (taskId: string, result: any) => {
            const task = this.activeTasks.get(taskId);
            if (task) {
                logger.info(`✅ Task ${taskId} completed for mini-app: ${task.miniAppId}`);
                task.status = 'completed';
                task.result = result;
                this.activeTasks.delete(taskId);
                // Here you could trigger another agent, notify the user, etc.
            }
        });

        this.eventBus.on('taskFailed', (taskId: string, error: Error) => {
            const task = this.activeTasks.get(taskId);
            if (task) {
                logger.error(`❌ Task ${taskId} failed for mini-app: ${task.miniAppId}`, { error: error.message });
                task.status = 'failed';
                task.result = { error: error.message };
                this.activeTasks.delete(taskId);
            }
        });
    }

    // Registers a new agent with the manager.
    public registerAgent(agent: BaseAgent): void {
        if (this.agents.has(agent.capability)) {
            logger.warn(`Agent with capability '${agent.capability}' is already registered. Overwriting.`);
        }
        this.agents.set(agent.capability, agent);
        logger.info(`Agent registered with capability: ${agent.capability}`);
    }

    // The main entry point for handling requests from the frontend (QuantumOS).
    public async processMiniAppRequest(miniAppId: string, action: string, data: any): Promise<{ taskId: string }> {
        const agent = this.agents.get(miniAppId);
        if (!agent) {
            logger.error(`No agent found for mini-app: ${miniAppId}`);
            throw new Error(`No agent found for mini-app: ${miniAppId}`);
        }

        const task: AgentTask = {
            id: uuidv4(),
            miniAppId,
            action,
            data,
            status: 'queued',
            createdAt: new Date(),
        };

        this.taskQueue.push(task);
        logger.info(`Task ${task.id} queued for mini-app: ${miniAppId}`);
        
        // For simplicity, process the queue immediately.
        // In a real scenario, this would be a separate worker process.
        this.processTaskQueue();

        return { taskId: task.id };
    }

    // Processes tasks from the queue.
    private async processTaskQueue(): Promise<void> {
        while (this.taskQueue.length > 0) {
            const task = this.taskQueue.shift();
            if (task) {
                this.activeTasks.set(task.id, task);
                task.status = 'processing';
                
                const agent = this.agents.get(task.miniAppId);
                if (agent) {
                    logger.info(`🚀 Processing task ${task.id} with agent: ${agent.capability}`);
                    try {
                        // Each agent is responsible for its own execution logic.
                        // The agent will emit 'taskCompleted' or 'taskFailed' on the eventBus.
                        await agent.execute(task, this.eventBus);
                    } catch (error) {
                        this.eventBus.emit('taskFailed', task.id, error);
                    }
                }
            }
        }
    }

    // Get the status of a specific task.
    public getTaskStatus(taskId: string): AgentTask | undefined {
        return this.activeTasks.get(taskId);
    }
}

export default new AgentManager();
