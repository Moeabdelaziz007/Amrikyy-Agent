
import logger from '../utils/logger';

// Defines the structure for an agent's capability
export interface AgentCapability {
  taskType: string; // The specific task an agent can perform, e.g., 'plan_trip'
  description: string; // A human-readable description of the capability
  inputSchema: Record<string, any>; // A schema defining the expected input parameters
}

/**
 * BaseAgent is the abstract class that all specialized agents must extend.
 * It provides the foundational structure and ensures compatibility with the AgentManager.
 */
export abstract class BaseAgent {
  protected name: string;
  protected capabilities: AgentCapability[];

  constructor(name: string, capabilities: AgentCapability[]) {
    this.name = name;
    this.capabilities = capabilities;
    logger.info(`Agent ${this.name} initialized.`);
  }

  /**
   * Returns the name of the agent.
   */
  public getName(): string {
    return this.name;
  }

  /**
   * Returns the list of capabilities for the agent.
   */
  public getCapabilities(): AgentCapability[] {
    return this.capabilities;
  }

  /**
   * The primary execution method for an agent.
   * The AgentManager calls this method to run a specific task.
   * @param taskType The specific task to execute.
   * @param params The parameters for the task.
   * @returns A promise that resolves with the result of the task.
   */
  public abstract execute(taskType: string, params: Record<string, any>): Promise<any>;
}
