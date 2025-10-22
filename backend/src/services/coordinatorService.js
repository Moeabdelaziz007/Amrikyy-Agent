/**
 * Coordinator Service
 * Handles multi-agent workflow coordination with LangSmith tracing and metrics
 * 
 * Features:
 * - Sequential, parallel, and hierarchical workflow execution
 * - LangSmith distributed tracing
 * - Prometheus metrics tracking
 * - Error handling and recovery
 * 
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-23
 */

const MultiAgentCoordinator = require('../utils/MultiAgentCoordinator');
const { wrapOrchestrator } = require('../utils/langsmith_helpers');
const metricsService = require('./metricsService');
const logger = require('../utils/logger');

class CoordinatorService {
  constructor() {
    this.coordinator = new MultiAgentCoordinator('ProductionCoordinator');
    this.initialized = false;
  }

  /**
   * Initialize coordinator with agents
   * This should be called during app startup
   */
  initialize(agents = {}) {
    // Register agents
    for (const [name, agentInstance] of Object.entries(agents)) {
      this.coordinator.registerAgent(name, agentInstance);
      logger.info(`[CoordinatorService] Registered agent: ${name}`);
    }
    
    this.initialized = true;
    logger.info('[CoordinatorService] Initialized with agents:', Object.keys(agents));
  }

  /**
   * Execute a workflow
   * @param {string} workflowName - Name of the workflow to execute
   * @param {Object} inputs - Input data for the workflow
   * @param {Object} options - Execution options
   * @param {Object} meta - Metadata (userId, etc.)
   * @returns {Object} Workflow execution result
   */
  async executeWorkflow(workflowName, inputs, options = {}, meta = {}) {
    const startTime = Date.now();
    const userId = meta.userId || 'anonymous';

    logger.info(`[CoordinatorService] Executing workflow: ${workflowName}`, {
      userId,
      inputs: typeof inputs
    });

    try {
      // Wrap the workflow execution with LangSmith tracing
      const tracedExecution = wrapOrchestrator(
        async () => {
          return await this.coordinator.executeWorkflow(workflowName, inputs);
        },
        workflowName
      );

      // Execute traced workflow
      const result = await tracedExecution();

      const duration = (Date.now() - startTime) / 1000;

      // Get workflow strategy
      const workflow = this.coordinator.workflows.get(workflowName);
      const strategy = workflow?.strategy || 'unknown';

      // Update metrics
      metricsService.recordCoordinatorWorkflow(strategy, 'success', duration);

      logger.info(`[CoordinatorService] Workflow ${workflowName} completed in ${duration.toFixed(2)}s`);

      return {
        success: true,
        workflow: workflowName,
        strategy,
        result,
        duration: `${duration.toFixed(2)}s`,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;

      // Update metrics
      metricsService.recordCoordinatorWorkflow('unknown', 'failed', duration);

      logger.error(`[CoordinatorService] Workflow ${workflowName} failed:`, error);

      throw error;
    }
  }

  /**
   * Execute sequential workflow
   * @param {Array} steps - Array of steps to execute
   * @param {Object} input - Initial input
   * @param {Object} transformers - Optional transformers
   * @param {Object} meta - Metadata
   * @returns {Object} Workflow result
   */
  async executeSequential(steps, input, transformers = null, meta = {}) {
    const startTime = Date.now();
    const userId = meta.userId || 'anonymous';

    logger.info(`[CoordinatorService] Executing sequential workflow with ${steps.length} steps`, {
      userId
    });

    try {
      // Wrap with LangSmith tracing
      const tracedExecution = wrapOrchestrator(
        async () => {
          return await this.coordinator.executeSequential(steps, input, transformers);
        },
        'sequential_workflow'
      );

      const result = await tracedExecution();
      const duration = (Date.now() - startTime) / 1000;

      // Update metrics
      metricsService.recordCoordinatorWorkflow('sequential', 'success', duration);

      logger.info(`[CoordinatorService] Sequential workflow completed in ${duration.toFixed(2)}s`);

      return result;

    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      metricsService.recordCoordinatorWorkflow('sequential', 'failed', duration);
      
      logger.error('[CoordinatorService] Sequential workflow failed:', error);
      throw error;
    }
  }

  /**
   * Execute parallel workflow
   * @param {Array} tasks - Array of tasks to execute in parallel
   * @param {Object} input - Input for all tasks
   * @param {Object} meta - Metadata
   * @returns {Object} Workflow result
   */
  async executeParallel(tasks, input, meta = {}) {
    const startTime = Date.now();
    const userId = meta.userId || 'anonymous';

    logger.info(`[CoordinatorService] Executing parallel workflow with ${tasks.length} tasks`, {
      userId
    });

    try {
      // Wrap with LangSmith tracing
      const tracedExecution = wrapOrchestrator(
        async () => {
          return await this.coordinator.executeParallel(tasks, input);
        },
        'parallel_workflow'
      );

      const result = await tracedExecution();
      const duration = (Date.now() - startTime) / 1000;

      // Update metrics
      metricsService.recordCoordinatorWorkflow('parallel', 'success', duration);

      logger.info(`[CoordinatorService] Parallel workflow completed in ${duration.toFixed(2)}s`);

      return result;

    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      metricsService.recordCoordinatorWorkflow('parallel', 'failed', duration);
      
      logger.error('[CoordinatorService] Parallel workflow failed:', error);
      throw error;
    }
  }

  /**
   * Execute hierarchical workflow
   * @param {Object} master - Master agent config
   * @param {Array} subAgents - Sub-agent configs
   * @param {Object} input - Input data
   * @param {Function} aggregator - Result aggregator function
   * @param {Object} meta - Metadata
   * @returns {Object} Workflow result
   */
  async executeHierarchical(master, subAgents, input, aggregator = null, meta = {}) {
    const startTime = Date.now();
    const userId = meta.userId || 'anonymous';

    logger.info(`[CoordinatorService] Executing hierarchical workflow with master: ${master.name}`, {
      userId,
      subAgents: subAgents.length
    });

    try {
      // Wrap with LangSmith tracing
      const tracedExecution = wrapOrchestrator(
        async () => {
          return await this.coordinator.executeHierarchical(master, subAgents, input, aggregator);
        },
        'hierarchical_workflow'
      );

      const result = await tracedExecution();
      const duration = (Date.now() - startTime) / 1000;

      // Update metrics
      metricsService.recordCoordinatorWorkflow('hierarchical', 'success', duration);

      logger.info(`[CoordinatorService] Hierarchical workflow completed in ${duration.toFixed(2)}s`);

      return result;

    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      metricsService.recordCoordinatorWorkflow('hierarchical', 'failed', duration);
      
      logger.error('[CoordinatorService] Hierarchical workflow failed:', error);
      throw error;
    }
  }

  /**
   * Register a new workflow
   * @param {string} name - Workflow name
   * @param {Object} config - Workflow configuration
   */
  registerWorkflow(name, config) {
    this.coordinator.defineWorkflow(name, config);
    logger.info(`[CoordinatorService] Registered workflow: ${name}`);
  }

  /**
   * Register an agent
   * @param {string} name - Agent name
   * @param {Object} agentInstance - Agent instance
   */
  registerAgent(name, agentInstance) {
    this.coordinator.registerAgent(name, agentInstance);
    logger.info(`[CoordinatorService] Registered agent: ${name}`);
  }

  /**
   * Get coordinator statistics
   */
  getStats() {
    return this.coordinator.getStats();
  }

  /**
   * Get registered workflows
   */
  getWorkflows() {
    const workflows = [];
    for (const [name, workflow] of this.coordinator.workflows.entries()) {
      workflows.push({
        name,
        strategy: workflow.strategy,
        description: workflow.description || 'No description',
        steps: workflow.steps?.length || workflow.tasks?.length || 0
      });
    }
    return workflows;
  }

  /**
   * Get registered agents
   */
  getAgents() {
    const agents = [];
    for (const [name, agent] of this.coordinator.agents.entries()) {
      agents.push({
        name,
        type: agent.instance?.constructor?.name || 'Unknown',
        totalCalls: agent.totalCalls,
        successfulCalls: agent.successfulCalls,
        failedCalls: agent.failedCalls
      });
    }
    return agents;
  }

  /**
   * Clear statistics
   */
  clearStats() {
    this.coordinator.clearStats();
    logger.info('[CoordinatorService] Statistics cleared');
  }
}

// Export singleton instance
const coordinatorService = new CoordinatorService();

module.exports = coordinatorService;
