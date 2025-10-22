/**
 * Multi-Agent Coordinator Routes
 * Production API for multi-agent workflows
 * 
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-22
 */

const express = require('express');
const router = express.Router();
const coordinatorController = require('../controllers/coordinatorController');
const { authenticate, rateLimiter } = require('../middleware/auth');
const {
  validateCoordinatorWorkflow,
  validateSequentialWorkflow,
  validateParallelWorkflow,
  validateHierarchicalWorkflow
} = require('../middleware/agentValidation');

/**
 * POST /api/coordinator/sequential
 * Execute sequential workflow (A → B → C)
 */
router.post('/sequential',
  authenticate,
  rateLimiter,
  validateSequentialWorkflow,
  coordinatorController.runSequential
);

/**
 * POST /api/coordinator/parallel
 * Execute parallel workflow (A + B + C simultaneously)
 */
router.post('/parallel',
  authenticate,
  rateLimiter,
  validateParallelWorkflow,
  coordinatorController.runParallel
);

/**
 * POST /api/coordinator/hierarchical
 * Execute hierarchical workflow (master → subs)
 */
router.post('/hierarchical',
  authenticate,
  rateLimiter,
  validateHierarchicalWorkflow,
  coordinatorController.runHierarchical
);

/**
 * POST /api/coordinator/workflow
 * Execute predefined workflow
 */
router.post('/workflow',
  authenticate,
  rateLimiter,
  validateCoordinatorWorkflow,
  coordinatorController.runWorkflow
);

/**
 * GET /api/coordinator/workflows
 * List all registered workflows
 */
router.get('/workflows',
  authenticate,
  coordinatorController.getWorkflows
);

/**
 * GET /api/coordinator/agents
 * List all registered agents
 */
router.get('/agents',
  authenticate,
  coordinatorController.getAgents
);

/**
 * GET /api/coordinator/stats
 * Get coordinator statistics
 */
router.get('/stats',
  authenticate,
  coordinatorController.getStats
);

/**
 * POST /api/coordinator/stats/reset
 * Reset coordinator statistics
 */
router.post('/stats/reset',
  authenticate,
  coordinatorController.resetStats
);

module.exports = router;
