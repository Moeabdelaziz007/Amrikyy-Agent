/**
 * Multi-Agent Coordinator Routes
 * Production API for multi-agent workflows
 *
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-22
 */

const express = require('express');
const router = express.Router();
const MultiAgentCoordinator = require('../utils/MultiAgentCoordinator');
const metricsService = require('../services/metricsService');
const {
  validateCoordinatorWorkflow,
  validateSequentialWorkflow,
  validateParallelWorkflow,
  validateHierarchicalWorkflow
} = require('../middleware/agentValidation');

// Create coordinator instance
const coordinator = new MultiAgentCoordinator();

/**
 * POST /api/coordinator/sequential
 * Execute sequential workflow (A → B → C)
 */
router.post('/sequential', validateSequentialWorkflow, async (req, res) => {
  const start = Date.now();
  try {
    const { steps, input, transformers } = req.body;

    const result = await coordinator.executeSequential(steps, input, transformers);

    const duration = (Date.now() - start) / 1000;
    metricsService.recordCoordinatorWorkflow('sequential', 'success', duration);

    res.json({
      success: true,
      strategy: 'sequential',
      result,
      duration: `${duration.toFixed(2)}s`,
      steps: steps.length
    });
  } catch (error) {
    const duration = (Date.now() - start) / 1000;
    metricsService.recordCoordinatorWorkflow('sequential', 'failed', duration);

    res.status(500).json({
      success: false,
      error: error.message,
      strategy: 'sequential'
    });
  }
});

/**
 * POST /api/coordinator/parallel
 * Execute parallel workflow (A + B + C simultaneously)
 */
router.post('/parallel', validateParallelWorkflow, async (req, res) => {
  const start = Date.now();
  try {
    const { tasks, input } = req.body;

    const results = await coordinator.executeParallel(tasks, input);

    const duration = (Date.now() - start) / 1000;
    metricsService.recordCoordinatorWorkflow('parallel', 'success', duration);

    res.json({
      success: true,
      strategy: 'parallel',
      results,
      duration: `${duration.toFixed(2)}s`,
      tasks: tasks.length
    });
  } catch (error) {
    const duration = (Date.now() - start) / 1000;
    metricsService.recordCoordinatorWorkflow('parallel', 'failed', duration);

    res.status(500).json({
      success: false,
      error: error.message,
      strategy: 'parallel'
    });
  }
});

/**
 * POST /api/coordinator/hierarchical
 * Execute hierarchical workflow (master → subs)
 */
router.post('/hierarchical', validateHierarchicalWorkflow, async (req, res) => {
  const start = Date.now();
  try {
    const { master, subAgents, input, aggregator } = req.body;

    const result = await coordinator.executeHierarchical(master, subAgents, input, aggregator);

    const duration = (Date.now() - start) / 1000;
    metricsService.recordCoordinatorWorkflow('hierarchical', 'success', duration);

    res.json({
      success: true,
      strategy: 'hierarchical',
      result,
      duration: `${duration.toFixed(2)}s`,
      master,
      subAgents: subAgents.length
    });
  } catch (error) {
    const duration = (Date.now() - start) / 1000;
    metricsService.recordCoordinatorWorkflow('hierarchical', 'failed', duration);

    res.status(500).json({
      success: false,
      error: error.message,
      strategy: 'hierarchical'
    });
  }
});

/**
 * POST /api/coordinator/workflow
 * Execute predefined workflow
 */
router.post('/workflow', validateCoordinatorWorkflow, async (req, res) => {
  const start = Date.now();
  try {
    const { workflowName, input } = req.body;

    const result = await coordinator.executeWorkflow(workflowName, input);

    const duration = (Date.now() - start) / 1000;
    const workflow = coordinator.workflows.get(workflowName);
    metricsService.recordCoordinatorWorkflow(workflow?.strategy || 'unknown', 'success', duration);

    res.json({
      success: true,
      workflow: workflowName,
      result,
      duration: `${duration.toFixed(2)}s`
    });
  } catch (error) {
    const duration = (Date.now() - start) / 1000;
    metricsService.recordCoordinatorWorkflow('unknown', 'failed', duration);

    res.status(500).json({
      success: false,
      error: error.message,
      workflow: req.body.workflowName
    });
  }
});

/**
 * GET /api/coordinator/workflows
 * List all registered workflows
 */
router.get('/workflows', (req, res) => {
  try {
    const workflows = [];

    for (const [name, workflow] of coordinator.workflows.entries()) {
      workflows.push({
        name,
        strategy: workflow.strategy,
        description: workflow.description || 'No description',
        steps: workflow.steps?.length || workflow.tasks?.length || 0
      });
    }

    res.json({
      success: true,
      workflows,
      total: workflows.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/coordinator/agents
 * List all registered agents
 */
router.get('/agents', (req, res) => {
  try {
    const agents = [];

    for (const [name, agent] of coordinator.agents.entries()) {
      agents.push({
        name,
        type: agent.constructor.name,
        methods: Object.getOwnPropertyNames(Object.getPrototypeOf(agent)).filter(
          (m) => m !== 'constructor' && typeof agent[m] === 'function'
        )
      });
    }

    res.json({
      success: true,
      agents,
      total: agents.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/coordinator/stats
 * Get coordinator statistics
 */
router.get('/stats', (req, res) => {
  try {
    const stats = coordinator.getStats();

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/coordinator/stats/reset
 * Reset coordinator statistics
 */
router.post('/stats/reset', (req, res) => {
  try {
    coordinator.clearStats();

    res.json({
      success: true,
      message: 'Coordinator statistics reset'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
