const { logger } = require('../utils/logger');
const { EventEmitter } = require('events');

const log = logger.child('WorkflowWebSocket');

/**
 * WorkflowEventEmitter - Central event bus for workflow updates
 * Allows backend services to emit workflow events that get broadcasted to connected clients
 */
class WorkflowEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.sessions = new Map(); // sessionId -> workflow state
  }

  createSession(sessionId, metadata = {}) {
    log.info(`Creating workflow session: ${sessionId}`);
    this.sessions.set(sessionId, {
      id: sessionId,
      metadata,
      steps: [],
      status: 'active',
      created_at: Date.now(),
      updated_at: Date.now()
    });
    return this.sessions.get(sessionId);
  }

  addStep(sessionId, step) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      log.warn(`Session not found: ${sessionId}`);
      return null;
    }

    const workflowStep = {
      ...step,
      timestamp: Date.now()
    };

    session.steps.push(workflowStep);
    session.updated_at = Date.now();

    // Emit event for WebSocket broadcasting
    this.emit('workflow:step', {
      sessionId,
      step: workflowStep
    });

    log.info(`Added step to session ${sessionId}: ${step.agent} - ${step.action}`);
    return workflowStep;
  }

  updateStep(sessionId, stepId, updates) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      log.warn(`Session not found: ${sessionId}`);
      return null;
    }

    const stepIndex = session.steps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) {
      log.warn(`Step not found: ${stepId}`);
      return null;
    }

    session.steps[stepIndex] = {
      ...session.steps[stepIndex],
      ...updates,
      updated_at: Date.now()
    };
    session.updated_at = Date.now();

    // Emit event for WebSocket broadcasting
    this.emit('workflow:update', {
      sessionId,
      stepId,
      updates: session.steps[stepIndex]
    });

    log.info(`Updated step ${stepId} in session ${sessionId}`);
    return session.steps[stepIndex];
  }

  completeSession(sessionId, result = {}) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      log.warn(`Session not found: ${sessionId}`);
      return null;
    }

    session.status = 'completed';
    session.result = result;
    session.completed_at = Date.now();
    session.updated_at = Date.now();

    // Emit event for WebSocket broadcasting
    this.emit('workflow:complete', {
      sessionId,
      result
    });

    log.success(`Completed workflow session: ${sessionId}`);
    return session;
  }

  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  deleteSession(sessionId) {
    const deleted = this.sessions.delete(sessionId);
    if (deleted) {
      log.info(`Deleted workflow session: ${sessionId}`);
    }
    return deleted;
  }
}

// Global workflow event emitter
const workflowEvents = new WorkflowEventEmitter();

/**
 * Setup WebSocket handlers for workflow updates
 * @param {WebSocket.Server} wss - WebSocket server instance
 */
function setupWorkflowWebSocket(wss) {
  log.info('Setting up workflow WebSocket handlers');

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `ws://${req.headers.host}`);
    const sessionId = url.searchParams.get('sessionId');

    if (!sessionId) {
      log.warn('WebSocket connection without sessionId');
      ws.close(1008, 'Session ID required');
      return;
    }

    log.info(`WebSocket connected for session: ${sessionId}`);

    // Send current session state if it exists
    const session = workflowEvents.getSession(sessionId);
    if (session) {
      ws.send(JSON.stringify({
        type: 'session:state',
        data: session
      }));
    }

    // Listen for workflow events and broadcast to this client
    const stepHandler = (event) => {
      if (event.sessionId === sessionId) {
        ws.send(JSON.stringify({
          type: 'workflow:step',
          data: event.step
        }));
      }
    };

    const updateHandler = (event) => {
      if (event.sessionId === sessionId) {
        ws.send(JSON.stringify({
          type: 'workflow:update',
          data: event.updates
        }));
      }
    };

    const completeHandler = (event) => {
      if (event.sessionId === sessionId) {
        ws.send(JSON.stringify({
          type: 'workflow:complete',
          data: event.result
        }));
      }
    };

    workflowEvents.on('workflow:step', stepHandler);
    workflowEvents.on('workflow:update', updateHandler);
    workflowEvents.on('workflow:complete', completeHandler);

    // Handle incoming messages
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        handleWorkflowMessage(sessionId, data, ws);
      } catch (error) {
        log.error(`Invalid WebSocket message: ${error.message}`);
        ws.send(JSON.stringify({
          type: 'error',
          error: 'Invalid message format'
        }));
      }
    });

    // Cleanup on disconnect
    ws.on('close', () => {
      log.info(`WebSocket disconnected for session: ${sessionId}`);
      workflowEvents.off('workflow:step', stepHandler);
      workflowEvents.off('workflow:update', updateHandler);
      workflowEvents.off('workflow:complete', completeHandler);
    });

    // Send connection confirmation
    ws.send(JSON.stringify({
      type: 'connected',
      sessionId,
      timestamp: Date.now()
    }));
  });
}

/**
 * Handle incoming WebSocket messages
 */
function handleWorkflowMessage(sessionId, data, ws) {
  const { type, payload } = data;

  switch (type) {
    case 'ping':
      ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
      break;

    case 'subscribe':
      // Client confirming subscription (already subscribed by default)
      log.info(`Client subscribed to session: ${sessionId}`);
      break;

    case 'request:state':
      // Client requesting current state
      const session = workflowEvents.getSession(sessionId);
      ws.send(JSON.stringify({
        type: 'session:state',
        data: session || { error: 'Session not found' }
      }));
      break;

    default:
      log.warn(`Unknown message type: ${type}`);
      ws.send(JSON.stringify({
        type: 'error',
        error: 'Unknown message type'
      }));
  }
}

/**
 * Example: Simulate a travel planning workflow
 * This shows how backend services would use the workflow system
 */
async function simulateTravelPlanningWorkflow(sessionId, userRequest) {
  log.info(`Starting travel planning workflow for session: ${sessionId}`);

  // Create workflow session
  workflowEvents.createSession(sessionId, {
    type: 'travel_planning',
    user_request: userRequest
  });

  // Step 1: Amrikyy analyzes request
  const step1 = workflowEvents.addStep(sessionId, {
    id: 'step-1',
    agent: 'Amrikyy',
    action: 'Analyzing your travel request...',
    status: 'processing'
  });

  await delay(2000);

  workflowEvents.updateStep(sessionId, 'step-1', {
    status: 'complete',
    duration: 2000,
    data: { analyzed: true }
  });

  // Step 2: Safar researches destinations
  const step2 = workflowEvents.addStep(sessionId, {
    id: 'step-2',
    agent: 'Safar',
    action: 'Researching destinations matching your criteria...',
    status: 'processing'
  });

  await delay(3000);

  workflowEvents.updateStep(sessionId, 'step-2', {
    status: 'complete',
    duration: 3000,
    data: { destinations: ['Paris', 'Rome', 'Barcelona'] }
  });

  // Step 3: Thrifty finds prices
  const step3 = workflowEvents.addStep(sessionId, {
    id: 'step-3',
    agent: 'Thrifty',
    action: 'Finding best prices for flights and hotels...',
    status: 'processing'
  });

  await delay(2500);

  workflowEvents.updateStep(sessionId, 'step-3', {
    status: 'complete',
    duration: 2500,
    data: { savings: '$450' }
  });

  // Step 4: Thaqafa checks cultural requirements
  const step4 = workflowEvents.addStep(sessionId, {
    id: 'step-4',
    agent: 'Thaqafa',
    action: 'Checking cultural guidelines and requirements...',
    status: 'processing'
  });

  await delay(2000);

  workflowEvents.updateStep(sessionId, 'step-4', {
    status: 'complete',
    duration: 2000,
    data: { guidelines: ['dress_code', 'local_customs'] }
  });

  // Step 5: Amrikyy combines results
  const step5 = workflowEvents.addStep(sessionId, {
    id: 'step-5',
    agent: 'Amrikyy',
    action: 'Combining results into perfect itinerary...',
    status: 'processing'
  });

  await delay(2000);

  workflowEvents.updateStep(sessionId, 'step-5', {
    status: 'complete',
    duration: 2000,
    data: { itinerary: 'complete' }
  });

  // Complete session
  workflowEvents.completeSession(sessionId, {
    success: true,
    itinerary_id: 'itin-123',
    total_duration: 11500
  });

  log.success(`Completed travel planning workflow for session: ${sessionId}`);
}

// Helper delay function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
  setupWorkflowWebSocket,
  workflowEvents,
  simulateTravelPlanningWorkflow
};

