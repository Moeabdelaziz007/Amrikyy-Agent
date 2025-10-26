/**
 * Coordinator Service - Business logic for Multi-Agent Workflows
 * Handles workflow execution with tracing and metrics
 * 
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-22
 */

const MultiAgentCoordinator = require('../utils/MultiAgentCoordinator');
const AgentLangSmith = require('../utils/AgentLangSmith');
const metricsService = require('./metricsService');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

// Singleton coordinator instance
const coordinator = new MultiAgentCoordinator('MainCoordinator');

// LangSmith tracer for coordinator
const langsmith = new AgentLangSmith('CoordinatorService');

/**
 * Execute a workflow with full tracing and metrics
 * 
 * @param {string} workflowName - Name of the workflow to execute
 * @param {object} inputs - Input data for the workflow
 * @param {object} options - Optional execution options
 * @param {object} meta - Metadata (user, requestId, etc.)
 * @returns {Promise<object>} - Workflow execution result
 */
async function executeWorkflow(workflowName, inputs, options = {}, meta = {}) {
  const workflowId = uuidv4();
  const startTime = Date.now();
  
  // Start LangSmith trace
  const traceId = langsmith.startTrace('api.workflow', {
    workflowName,
    workflowId,
    inputs: typeof inputs === 'string' ? inputs.substring(0, 100) : JSON.stringify(inputs).substring(0, 100),
    options,
    meta
  });
  
  logger.info(`[CoordinatorService] Starting workflow: ${workflowName} (${workflowId})`, {
    workflowName,
    workflowId,
    meta
  });
  
  try {
    // Get workflow info if it exists
    const workflow = coordinator.workflows.get(workflowName);
    const strategy = workflow?.strategy || 'unknown';
    
    // Execute workflow via MultiAgentCoordinator
    const result = await coordinator.executeWorkflow(workflowName, inputs);
    
    const duration = (Date.now() - startTime) / 1000;
    
    // Update metrics - successful execution
    metricsService.recordCoordinatorWorkflow(strategy, 'success', duration);
    
    // End LangSmith trace with success
    langsmith.endTrace(traceId, {
      usage: {
        totalTokens: 0 // Workflows don't directly use tokens
      },
      metadata: {
        workflowId,
        strategy,
        duration,
        success: true
      }
    });
    
    logger.info(`[CoordinatorService] Workflow completed: ${workflowName} (${workflowId}) in ${duration.toFixed(2)}s`, {
      workflowName,
      workflowId,
      duration,
      success: true
    });
    
    // Return enhanced result
    return {
      success: true,
      workflowId,
      workflowName,
      strategy,
      result,
      duration,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    const duration = (Date.now() - startTime) / 1000;
    const workflow = coordinator.workflows.get(workflowName);
    const strategy = workflow?.strategy || 'unknown';
    
    // Update metrics - failed execution
    metricsService.recordCoordinatorWorkflow(strategy, 'failed', duration);
    
    // End LangSmith trace with error
    langsmith.endTrace(traceId, {
      error: error.message,
      metadata: {
        workflowId,
        strategy,
        duration,
        success: false,
        stack: error.stack
      }
    });
    
    logger.error(`[CoordinatorService] Workflow failed: ${workflowName} (${workflowId})`, {
      workflowName,
      workflowId,
      error: error.message,
      duration
    });
    
    // Re-throw with enhanced error
    const enhancedError = new Error(`Workflow execution failed: ${error.message}`);
    enhancedError.workflowId = workflowId;
    enhancedError.workflowName = workflowName;
    enhancedError.originalError = error;
    throw enhancedError;
  }
}

/**
 * Get coordinator instance (for route access)
 */
function getCoordinator() {
  return coordinator;
}

/**
 * Get workflow status (for long-running workflow tracking - stretch goal)
 * 
 * @param {string} workflowId - Workflow ID to check
 * @returns {object} - Workflow status
 */
function getWorkflowStatus(workflowId) {
  const activeWorkflow = coordinator.activeWorkflows.get(workflowId);
  
  if (activeWorkflow) {
    return {
      workflowId,
      status: 'running',
      startTime: activeWorkflow.startTime,
      duration: Date.now() - activeWorkflow.startTime
    };
  }
  
  return {
    workflowId,
    status: 'not_found',
    message: 'Workflow not found or already completed'
  };
}

module.exports = {
  executeWorkflow,
  getCoordinator,
  getWorkflowStatus
};
