/**
 * Coordinator Controller - HTTP handlers for Multi-Agent Workflows
 * Handles HTTP request/response for workflow execution
 * 
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-22
 */

const coordinatorService = require('../services/coordinatorService');
const logger = require('../utils/logger');

/**
 * Execute a workflow
 * POST /api/coordinator
 * 
 * Request body:
 * - workflowName: string (required) - Name of workflow to execute
 * - inputs: object (required) - Input data for workflow
 * - options: object (optional) - Execution options
 * - async: boolean (optional) - If true, return immediately with workflowId (202 Accepted)
 * 
 * Response:
 * - 200 OK: Workflow completed successfully (sync mode)
 * - 202 Accepted: Workflow started (async mode)
 * - 400 Bad Request: Invalid request
 * - 500 Internal Server Error: Workflow execution failed
 */
async function runWorkflow(req, res) {
  try {
    const { workflowName, inputs, options = {}, async = false } = req.body;
    
    // Validate required fields
    if (!workflowName) {
      return res.status(400).json({
        success: false,
        error: 'workflowName is required'
      });
    }
    
    if (!inputs) {
      return res.status(400).json({
        success: false,
        error: 'inputs is required'
      });
    }
    
    // Extract metadata from request
    const meta = {
      userId: req.user?.id,
      userEmail: req.user?.email,
      requestId: req.id || req.headers['x-request-id'],
      ip: req.ip
    };
    
    // Async mode: Fire and forget (for long-running workflows)
    if (async) {
      // Start workflow in background (non-blocking)
      coordinatorService.executeWorkflow(workflowName, inputs, options, meta)
        .then(result => {
          logger.info(`[CoordinatorController] Async workflow completed: ${result.workflowId}`, {
            workflowId: result.workflowId,
            workflowName,
            duration: result.duration
          });
        })
        .catch(error => {
          logger.error(`[CoordinatorController] Async workflow failed: ${workflowName}`, {
            error: error.message,
            workflowId: error.workflowId
          });
        });
      
      // Return immediately with workflowId
      return res.status(202).json({
        success: true,
        message: 'Workflow started',
        workflowName,
        async: true,
        // Note: workflowId would be available if we enhanced executeWorkflow to return it immediately
        statusEndpoint: '/api/coordinator/status'
      });
    }
    
    // Sync mode: Wait for workflow completion
    const result = await coordinatorService.executeWorkflow(workflowName, inputs, options, meta);
    
    // Return successful result
    return res.status(200).json(result);
    
  } catch (error) {
    logger.error('[CoordinatorController] Workflow execution failed', {
      error: error.message,
      workflowId: error.workflowId,
      workflowName: error.workflowName
    });
    
    return res.status(500).json({
      success: false,
      error: error.message,
      workflowId: error.workflowId,
      workflowName: error.workflowName
    });
  }
}

/**
 * Get workflow status (for async workflows)
 * GET /api/coordinator/status/:workflowId
 * 
 * Response:
 * - 200 OK: Status retrieved
 * - 404 Not Found: Workflow not found
 */
async function getStatus(req, res) {
  try {
    const { workflowId } = req.params;
    
    if (!workflowId) {
      return res.status(400).json({
        success: false,
        error: 'workflowId is required'
      });
    }
    
    const status = coordinatorService.getWorkflowStatus(workflowId);
    
    if (status.status === 'not_found') {
      return res.status(404).json({
        success: false,
        ...status
      });
    }
    
    return res.status(200).json({
      success: true,
      ...status
    });
    
  } catch (error) {
    logger.error('[CoordinatorController] Failed to get workflow status', {
      error: error.message
    });
    
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  runWorkflow,
  getStatus
};
