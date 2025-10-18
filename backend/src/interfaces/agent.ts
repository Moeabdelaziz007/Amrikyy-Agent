
import { EventEmitter } from 'events';

// Defines the structure for a single unit of work to be processed by an agent.
export interface AgentTask {
    id: string;
    miniAppId: string; // The capability of the agent that should handle this task
    action: string; // The specific action to be performed (e.g., 'createItinerary', 'summarizeText')
    data: any; // The payload for the action
    status: 'queued' | 'processing' | 'completed' | 'failed';
    createdAt: Date;
    completedAt?: Date;
    result?: any; // The output of the task
}

// Defines the contract that all specialized agents must follow.
// This allows the AgentManager to treat all agents uniformly.
export interface BaseAgent {
    // A unique identifier that matches the miniAppId from the frontend.
    // This is how the AgentManager routes tasks to the correct agent.
    capability: string;

    // The main execution method for the agent.
    // It receives the task and an event bus to communicate its completion or failure.
    execute(task: AgentTask, eventBus: EventEmitter): Promise<void>;
}
