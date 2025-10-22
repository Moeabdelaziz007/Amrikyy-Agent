/**
 * Coordinator Controller
 * HTTP handlers for multi-agent workflow coordination
 * 
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-23
 */

const coordinatorService = require('../services/coordinatorService');
const logger = require('../utils/logger');

/**
 * Run a named workflow
 * @route POST /api/coordinator/workflow
 */
const runWorkflow = async (req, res) => {
  try {
    const { workflowName, input } = req.body;

    // Validate input
    if (!workflowName) {
      return res.status(400).json({
        success: false,
        error: 'workflowName is required'
      });
    }

    if (!input) {
      return res.status(400).json({
        success: false,
        error: 'input is required'
      });
    }

    // Execute workflow
    const result = await coordinatorService.executeWorkflow(
      workflowName,
      input,
      {},
      { userId: req.user?.id }
    );

    res.json(result);

  } catch (error) {
    logger.error('[CoordinatorController] Workflow execution failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      workflow: req.body.workflowName
    });
  }
};

/**
 * Run sequential workflow
 * @route POST /api/coordinator/sequential
 */
const runSequential = async (req, res) => {
  try {
    const { steps, input, transformers } = req.body;

    // Validate input
    if (!steps || !Array.isArray(steps)) {
      return res.status(400).json({
        success: false,
        error: 'steps array is required'
      });
    }

    if (!input) {
      return res.status(400).json({
        success: false,
        error: 'input is required'
      });
    }

    // Execute sequential workflow
    const result = await coordinatorService.executeSequential(
      steps,
      input,
      transformers,
      { userId: req.user?.id }
    );

    res.json({
      success: true,
      strategy: 'sequential',
      result,
      steps: steps.length
    });

  } catch (error) {
    logger.error('[CoordinatorController] Sequential workflow failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      strategy: 'sequential'
    });
  }
};

/**
 * Run parallel workflow
 * @route POST /api/coordinator/parallel
 */
const runParallel = async (req, res) => {
  try {
    const { tasks, input } = req.body;

    // Validate input
    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({
        success: false,
        error: 'tasks array is required'
      });
    }

    if (!input) {
      return res.status(400).json({
        success: false,
        error: 'input is required'
      });
    }

    // Execute parallel workflow
    const result = await coordinatorService.executeParallel(
      tasks,
      input,
      { userId: req.user?.id }
    );

    res.json({
      success: true,
      strategy: 'parallel',
      results: result.results,
      tasks: tasks.length
    });

  } catch (error) {
    logger.error('[CoordinatorController] Parallel workflow failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      strategy: 'parallel'
    });
  }
};

/**
 * Run hierarchical workflow
 * @route POST /api/coordinator/hierarchical
 */
const runHierarchical = async (req, res) => {
  try {
    const { master, subAgents, input, aggregator } = req.body;

    // Validate input
    if (!master || !master.name || !master.method) {
      return res.status(400).json({
        success: false,
        error: 'master with name and method is required'
      });
    }

    if (!subAgents || !Array.isArray(subAgents)) {
      return res.status(400).json({
        success: false,
        error: 'subAgents array is required'
      });
    }

    if (!input) {
      return res.status(400).json({
        success: false,
        error: 'input is required'
      });
    }

    // Execute hierarchical workflow
    const result = await coordinatorService.executeHierarchical(
      master,
      subAgents,
      input,
      aggregator,
      { userId: req.user?.id }
    );

    res.json({
      success: true,
      strategy: 'hierarchical',
      result,
      master: master.name,
      subAgents: subAgents.length
    });

  } catch (error) {
    logger.error('[CoordinatorController] Hierarchical workflow failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      strategy: 'hierarchical'
    });
  }
};

/**
 * Get all workflows
 * @route GET /api/coordinator/workflows
 */
const getWorkflows = (req, res) => {
  try {
    const workflows = coordinatorService.getWorkflows();

    res.json({
      success: true,
      workflows,
      total: workflows.length
    });

  } catch (error) {
    logger.error('[CoordinatorController] Failed to get workflows:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get all registered agents
 * @route GET /api/coordinator/agents
 */
const getAgents = (req, res) => {
  try {
    const agents = coordinatorService.getAgents();

    res.json({
      success: true,
      agents,
      total: agents.length
    });

  } catch (error) {
    logger.error('[CoordinatorController] Failed to get agents:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get coordinator statistics
 * @route GET /api/coordinator/stats
 */
const getStats = (req, res) => {
  try {
    const stats = coordinatorService.getStats();

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    logger.error('[CoordinatorController] Failed to get stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Reset coordinator statistics
 * @route POST /api/coordinator/stats/reset
 */
const resetStats = (req, res) => {
  try {
    coordinatorService.clearStats();

    res.json({
      success: true,
      message: 'Coordinator statistics reset'
    });

  } catch (error) {
    logger.error('[CoordinatorController] Failed to reset stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  runWorkflow,
  runSequential,
  runParallel,
  runHierarchical,
  getWorkflows,
  getAgents,
  getStats,
  resetStats
};
