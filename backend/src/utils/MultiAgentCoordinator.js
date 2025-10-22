/**
 * Generic Multi-Agent Coordinator
 * Enables complex workflows with any registered agents
 *
 * Features:
 * - Sequential workflows (Agent A → Agent B → Agent C)
 * - Parallel workflows (Agent A + Agent B + Agent C simultaneously)
 * - Hierarchical workflows (Master agent delegates to sub-agents)
 * - Agent-to-agent communication
 * - Result aggregation and transformation
 * - Error handling and recovery
 * - Performance tracking
 *
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-22
 */

const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

class MultiAgentCoordinator {
  constructor(name = 'Coordinator') {
    this.name = name;
    this.agents = new Map();
    this.workflows = new Map();
    this.activeWorkflows = new Map();

    // Statistics
    this.stats = {
      totalWorkflows: 0,
      completedWorkflows: 0,
      failedWorkflows: 0,
      activeWorkflows: 0,
      avgDuration: 0,
      totalDuration: 0,
      byStrategy: {
        sequential: 0,
        parallel: 0,
        hierarchical: 0,
      },
    };
  }

  /**
   * Register an agent
   */
  registerAgent(name, agent) {
    if (this.agents.has(name)) {
      logger.warn(`[Coordinator] Agent ${name} already registered, overwriting`);
    }

    this.agents.set(name, {
      name,
      instance: agent,
      registeredAt: Date.now(),
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
    });

    logger.info(`[Coordinator] Registered agent: ${name}`);

    return this;
  }

  /**
   * Unregister an agent
   */
  unregisterAgent(name) {
    const removed = this.agents.delete(name);

    if (removed) {
      logger.info(`[Coordinator] Unregistered agent: ${name}`);
    }

    return removed;
  }

  /**
   * Get agent instance
   */
  getAgent(name) {
    const agent = this.agents.get(name);

    if (!agent) {
      throw new Error(
        `Agent ${name} not found. Available: ${Array.from(this.agents.keys()).join(', ')}`
      );
    }

    return agent.instance;
  }

  /**
   * Define a workflow
   */
  defineWorkflow(name, config) {
    this.workflows.set(name, {
      name,
      ...config,
      createdAt: Date.now(),
    });

    logger.info(`[Coordinator] Defined workflow: ${name}`);

    return this;
  }

  /**
   * Execute workflow - Sequential
   * Agents run one after another, passing results forward
   */
  async executeSequential(steps, initialInput) {
    const workflowId = uuidv4();
    const startTime = Date.now();

    try {
      logger.info(`[Coordinator] Starting sequential workflow ${workflowId}`);

      let currentInput = initialInput;
      const results = [];

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const { agent: agentName, method, transform } = step;

        logger.debug(`[Coordinator] Step ${i + 1}/${steps.length}: ${agentName}.${method}`);

        // Get agent
        const agent = this.getAgent(agentName);
        const agentInfo = this.agents.get(agentName);

        // Execute step
        const stepStartTime = Date.now();

        try {
          agentInfo.totalCalls++;

          // Call agent method
          const result = await agent[method](currentInput);

          agentInfo.successfulCalls++;

          const stepDuration = Date.now() - stepStartTime;

          // Store result
          results.push({
            step: i + 1,
            agent: agentName,
            method,
            input: currentInput,
            output: result,
            duration: stepDuration,
            success: true,
          });

          // Transform result for next step
          currentInput = transform ? transform(result, currentInput) : result;
        } catch (error) {
          agentInfo.failedCalls++;

          logger.error(`[Coordinator] Step ${i + 1} failed:`, error);

          results.push({
            step: i + 1,
            agent: agentName,
            method,
            input: currentInput,
            error: error.message,
            duration: Date.now() - stepStartTime,
            success: false,
          });

          throw error;
        }
      }

      const duration = Date.now() - startTime;

      this.updateStats('sequential', duration, true);

      logger.info(`[Coordinator] Sequential workflow ${workflowId} completed in ${duration}ms`);

      return {
        workflowId,
        success: true,
        strategy: 'sequential',
        results,
        finalResult: currentInput,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      this.updateStats('sequential', duration, false);

      logger.error(`[Coordinator] Sequential workflow ${workflowId} failed:`, error);

      throw error;
    }
  }

  /**
   * Execute workflow - Parallel
   * All agents run simultaneously
   */
  async executeParallel(tasks, input) {
    const workflowId = uuidv4();
    const startTime = Date.now();

    try {
      logger.info(
        `[Coordinator] Starting parallel workflow ${workflowId} with ${tasks.length} tasks`
      );

      // Execute all tasks in parallel
      const promises = tasks.map(async (task, index) => {
        const { agent: agentName, method, input: taskInput } = task;
        const actualInput = taskInput || input;

        logger.debug(`[Coordinator] Task ${index + 1}: ${agentName}.${method}`);

        const agent = this.getAgent(agentName);
        const agentInfo = this.agents.get(agentName);

        const taskStartTime = Date.now();

        try {
          agentInfo.totalCalls++;

          const result = await agent[method](actualInput);

          agentInfo.successfulCalls++;

          return {
            task: index + 1,
            agent: agentName,
            method,
            input: actualInput,
            output: result,
            duration: Date.now() - taskStartTime,
            success: true,
          };
        } catch (error) {
          agentInfo.failedCalls++;

          logger.error(`[Coordinator] Task ${index + 1} failed:`, error);

          return {
            task: index + 1,
            agent: agentName,
            method,
            input: actualInput,
            error: error.message,
            duration: Date.now() - taskStartTime,
            success: false,
          };
        }
      });

      // Wait for all tasks
      const results = await Promise.allSettled(promises);

      const duration = Date.now() - startTime;

      // Check if all succeeded
      const allSucceeded = results.every((r) => r.status === 'fulfilled' && r.value.success);

      this.updateStats('parallel', duration, allSucceeded);

      logger.info(`[Coordinator] Parallel workflow ${workflowId} completed in ${duration}ms`);

      return {
        workflowId,
        success: allSucceeded,
        strategy: 'parallel',
        results: results.map((r) =>
          r.status === 'fulfilled' ? r.value : { success: false, error: r.reason }
        ),
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      this.updateStats('parallel', duration, false);

      logger.error(`[Coordinator] Parallel workflow ${workflowId} failed:`, error);

      throw error;
    }
  }

  /**
   * Execute workflow - Hierarchical
   * Master agent delegates to sub-agents
   */
  async executeHierarchical(masterAgent, subAgents, input, aggregator) {
    const workflowId = uuidv4();
    const startTime = Date.now();

    try {
      logger.info(`[Coordinator] Starting hierarchical workflow ${workflowId}`);

      // Step 1: Master agent analyzes and delegates
      const master = this.getAgent(masterAgent.name);
      const masterInfo = this.agents.get(masterAgent.name);

      logger.debug(`[Coordinator] Master: ${masterAgent.name}.${masterAgent.method}`);

      masterInfo.totalCalls++;

      const masterResult = await master[masterAgent.method](input);

      masterInfo.successfulCalls++;

      // Step 2: Execute sub-agents based on master's decision
      const subTasks = subAgents.map((subAgent) => ({
        agent: subAgent.name,
        method: subAgent.method,
        input: subAgent.inputTransform
          ? subAgent.inputTransform(masterResult, input)
          : masterResult,
      }));

      // Execute sub-agents in parallel
      const parallelResult = await this.executeParallel(subTasks);

      // Step 3: Aggregate results
      const finalResult = aggregator
        ? aggregator(masterResult, parallelResult.results)
        : { master: masterResult, sub: parallelResult.results };

      const duration = Date.now() - startTime;

      this.updateStats('hierarchical', duration, parallelResult.success);

      logger.info(`[Coordinator] Hierarchical workflow ${workflowId} completed in ${duration}ms`);

      return {
        workflowId,
        success: parallelResult.success,
        strategy: 'hierarchical',
        masterResult,
        subResults: parallelResult.results,
        finalResult,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      this.updateStats('hierarchical', duration, false);

      logger.error(`[Coordinator] Hierarchical workflow ${workflowId} failed:`, error);

      throw error;
    }
  }

  /**
   * Execute named workflow
   */
  async executeWorkflow(name, input) {
    const workflow = this.workflows.get(name);

    if (!workflow) {
      throw new Error(
        `Workflow ${name} not found. Available: ${Array.from(this.workflows.keys()).join(', ')}`
      );
    }

    const { strategy } = workflow;

    switch (strategy) {
      case 'sequential':
        return this.executeSequential(workflow.steps, input);

      case 'parallel':
        return this.executeParallel(workflow.tasks, input);

      case 'hierarchical':
        return this.executeHierarchical(
          workflow.master,
          workflow.subAgents,
          input,
          workflow.aggregator
        );

      default:
        throw new Error(`Unknown strategy: ${strategy}`);
    }
  }

  /**
   * Update statistics
   */
  updateStats(strategy, duration, success) {
    this.stats.totalWorkflows++;
    this.stats.totalDuration += duration;
    this.stats.avgDuration = Math.round(this.stats.totalDuration / this.stats.totalWorkflows);
    this.stats.byStrategy[strategy]++;

    if (success) {
      this.stats.completedWorkflows++;
    } else {
      this.stats.failedWorkflows++;
    }
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      ...this.stats,
      successRate:
        this.stats.totalWorkflows > 0
          ? ((this.stats.completedWorkflows / this.stats.totalWorkflows) * 100).toFixed(2) + '%'
          : '0%',
      avgDuration: `${this.stats.avgDuration}ms`,
      agents: Array.from(this.agents.entries()).map(([name, agent]) => ({
        name,
        totalCalls: agent.totalCalls,
        successfulCalls: agent.successfulCalls,
        failedCalls: agent.failedCalls,
        successRate:
          agent.totalCalls > 0
            ? ((agent.successfulCalls / agent.totalCalls) * 100).toFixed(2) + '%'
            : '0%',
      })),
    };
  }

  /**
   * Get registered agents
   */
  getAgents() {
    return Array.from(this.agents.keys());
  }

  /**
   * Get defined workflows
   */
  getWorkflows() {
    return Array.from(this.workflows.keys());
  }

  /**
   * Clear statistics
   */
  clearStats() {
    this.stats = {
      totalWorkflows: 0,
      completedWorkflows: 0,
      failedWorkflows: 0,
      activeWorkflows: 0,
      avgDuration: 0,
      totalDuration: 0,
      byStrategy: {
        sequential: 0,
        parallel: 0,
        hierarchical: 0,
      },
    };

    // Reset agent stats
    for (const agent of this.agents.values()) {
      agent.totalCalls = 0;
      agent.successfulCalls = 0;
      agent.failedCalls = 0;
    }

    logger.info('[Coordinator] Statistics cleared');
  }
}

module.exports = MultiAgentCoordinator;
