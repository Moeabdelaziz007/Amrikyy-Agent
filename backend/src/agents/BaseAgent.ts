/**
 * 🤖 Base Agent Class - Enhanced Version
 * Abstract base class for all agents in the Amrikyy platform
 * Part of Amrikyy-Agent Phase 1: Unified Agent System
 * 
 * @version 2.0.0
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Agent capability definition
 */
export interface AgentCapability {
  name: string;
  description: string;
  parameters?: Record<string, any>;
  examples?: string[];
}

/**
 * Agent metadata
 */
export interface AgentMetadata {
  name: string;
  version: string;
  description: string;
  domain: string; // 'travel', 'general', 'finance', 'analytics', etc.
  author?: string;
  createdAt: Date;
  tags?: string[];
}

/**
 * Execution context for tracking
 */
export interface ExecutionContext {
  requestId: string;
  userId?: string;
  sessionId?: string;
  parentTaskId?: string;
  metadata?: Record<string, any>;
  timestamp?: Date;
}

/**
 * Execution result
 */
export interface ExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTime?: number;
  metadata?: Record<string, any>;
  warnings?: string[];
}

/**
 * Abstract Base Agent
 * All agents must extend this class
 */
export abstract class BaseAgent {
  readonly id: string;
  readonly name: string;
  readonly metadata: AgentMetadata;
  protected capabilities: AgentCapability[];
  protected isInitialized: boolean = false;
  protected stats = {
    totalExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0,
    totalExecutionTime: 0,
    averageExecutionTime: 0,
  };

  constructor(name: string, metadata: Partial<AgentMetadata> = {}) {
    this.id = uuidv4();
    this.name = name;
    this.metadata = {
      name,
      version: metadata.version || '1.0.0',
      description: metadata.description || `Agent: ${name}`,
      domain: metadata.domain || 'general',
      author: metadata.author || 'Amrikyy AI',
      createdAt: new Date(),
      tags: metadata.tags || [],
    };
    this.capabilities = [];
  }

  /**
   * Initialize the agent
   * Called once before first execution
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    await this.onInitialize();
    this.isInitialized = true;
  }

  /**
   * Override this for custom initialization logic
   */
  protected async onInitialize(): Promise<void> {
    // Default: no-op
    // Child classes can override
  }

  /**
   * Main execution method - must be implemented by child agents
   * @param request - The request data
   * @param context - Execution context for tracking
   */
  abstract execute(
    request: any,
    context?: ExecutionContext
  ): Promise<ExecutionResult>;

  /**
   * Register a capability
   */
  protected registerCapability(capability: AgentCapability): void {
    // Check if capability already exists
    const existing = this.capabilities.find(c => c.name === capability.name);
    if (existing) {
      console.warn(`Capability ${capability.name} already registered for ${this.name}`);
      return;
    }
    this.capabilities.push(capability);
  }

  /**
   * Register multiple capabilities at once
   */
  protected registerCapabilities(capabilities: AgentCapability[]): void {
    capabilities.forEach(cap => this.registerCapability(cap));
  }

  /**
   * Get all capabilities
   */
  getCapabilities(): AgentCapability[] {
    return this.capabilities;
  }

  /**
   * Check if agent has a specific capability
   */
  hasCapability(capabilityName: string): boolean {
    return this.capabilities.some(cap => cap.name === capabilityName);
  }

  /**
   * Get a specific capability
   */
  getCapability(capabilityName: string): AgentCapability | undefined {
    return this.capabilities.find(cap => cap.name === capabilityName);
  }

  /**
   * Get agent metadata
   */
  getMetadata(): AgentMetadata {
    return this.metadata;
  }

  /**
   * Get agent statistics
   */
  getStats() {
    return {
      ...this.stats,
      successRate: this.stats.totalExecutions > 0
        ? (this.stats.successfulExecutions / this.stats.totalExecutions) * 100
        : 0,
    };
  }

  /**
   * Update statistics after execution
   */
  protected updateStats(success: boolean, executionTime: number): void {
    this.stats.totalExecutions++;
    this.stats.totalExecutionTime += executionTime;
    this.stats.averageExecutionTime = 
      this.stats.totalExecutionTime / this.stats.totalExecutions;

    if (success) {
      this.stats.successfulExecutions++;
    } else {
      this.stats.failedExecutions++;
    }
  }

  /**
   * Execute with automatic stats tracking
   */
  async executeWithTracking(
    request: any,
    context?: ExecutionContext
  ): Promise<ExecutionResult> {
    const startTime = Date.now();

    try {
      const result = await this.execute(request, context);
      const executionTime = Date.now() - startTime;
      
      this.updateStats(result.success, executionTime);
      
      return {
        ...result,
        executionTime,
      };
    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      this.updateStats(false, executionTime);
      
      return {
        success: false,
        error: error.message || 'Unknown error',
        executionTime,
      };
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ 
    healthy: boolean; 
    message?: string;
    stats?: any;
  }> {
    return { 
      healthy: this.isInitialized,
      message: this.isInitialized ? 'Agent is operational' : 'Agent not initialized',
      stats: this.getStats(),
    };
  }

  /**
   * Validate request
   * Override this to add custom validation
   */
  protected async validateRequest(request: any): Promise<{
    valid: boolean;
    errors?: string[];
  }> {
    if (!request) {
      return {
        valid: false,
        errors: ['Request is required'],
      };
    }

    return { valid: true };
  }

  /**
   * Cleanup resources
   * Override this to add custom cleanup logic
   */
  async cleanup(): Promise<void> {
    // Default: no-op
    // Child classes can override to clean up resources
  }

  /**
   * Get agent summary
   */
  toString(): string {
    return `Agent[${this.name}](id=${this.id.substring(0, 8)}, domain=${this.metadata.domain}, capabilities=${this.capabilities.length})`;
  }
}
