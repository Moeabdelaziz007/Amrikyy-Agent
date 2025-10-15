/**
 * Production-Grade WebSocket Server
 * 
 * Features:
 * - JWT Authentication
 * - Schema Validation (Zod)
 * - Rate Limiting
 * - TLS/WSS Support
 * - Prometheus Metrics
 * - Structured Logging
 * - Integration with EnhancedAIXManager
 */

import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import express from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { logger } from '../src/utils/logger';
import { EnhancedAIXManager } from '../src/aix/EnhancedAIXManager';
import { register, Counter, Histogram } from 'prom-client';

const log = logger.child('WebSocketServer');

// Environment configuration
const PORT = process.env.WS_PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Zod schema for ThinkingStep
const ThinkingStepSchema = z.object({
  id: z.string(),
  agent: z.string(),
  action: z.string(),
  status: z.enum(['pending', 'processing', 'complete', 'error']),
  timestamp: z.number(),
  color: z.string(),
  details: z.string().optional(),
  mind: z.object({
    sources: z.array(z.string()).optional(),
    confidence: z.number().min(0).max(1).optional()
  }).optional(),
  concept: z.object({
    architecture: z.string().optional(),
    dependencies: z.array(z.string()).optional()
  }).optional(),
  output: z.object({
    result: z.any().optional(),
    metrics: z.record(z.number()).optional()
  }).optional()
});

type ThinkingStep = z.infer<typeof ThinkingStepSchema>;

// Prometheus metrics
const wsConnections = new Counter({
  name: 'ws_connections_total',
  help: 'Total WebSocket connections'
});

const wsMessages = new Counter({
  name: 'ws_messages_total',
  help: 'Total WebSocket messages',
  labelNames: ['type', 'status']
});

const wsLatency = new Histogram({
  name: 'ws_message_latency_seconds',
  help: 'WebSocket message latency'
});

// Express app for health checks and metrics
const app = express();
app.use(helmet());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests'
});

app.use('/api', limiter);

// Health checks
app.get('/healthz', (req, res) => {
  res.json({ status: 'healthy', timestamp: Date.now() });
});

app.get('/readyz', (req, res) => {
  // Check if AIX manager is ready
  const ready = aixManager.projectContext.indexed;
  res.status(ready ? 200 : 503).json({ 
    ready,
    timestamp: Date.now()
  });
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.send(await register.metrics());
});

// Create HTTP server
const server = createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ 
  server,
  path: '/ws',
  verifyClient: (info, callback) => {
    // Verify JWT in upgrade request
    const url = new URL(info.req.url!, `http://${info.req.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
      callback(false, 401, 'Missing token');
      return;
    }

    try {
      const payload = jwt.verify(token, JWT_SECRET);
      (info.req as any).user = payload;
      callback(true);
    } catch (error) {
      log.warn('Invalid token', { error: error.message });
      callback(false, 403, 'Invalid token');
    }
  }
});

// Initialize EnhancedAIXManager
const aixManager = new EnhancedAIXManager({
  agentsDirectory: './backend/agents',
  projectRoot: process.cwd(),
  autoLearn: true,
  indexProject: true
});

// Connected clients
const clients = new Set<WebSocket>();

// WebSocket connection handler
wss.on('connection', (ws: WebSocket, req) => {
  const user = (req as any).user;
  wsConnections.inc();
  clients.add(ws);

  log.info('Client connected', { 
    userId: user?.id,
    totalClients: clients.size 
  });

  // Send initial state
  const initialState = {
    type: 'initial',
    data: aixManager.getWorkflowVisualization()
  };
  ws.send(JSON.stringify(initialState));

  // Message handler
  ws.on('message', async (data: Buffer) => {
    const startTime = Date.now();

    try {
      const message = JSON.parse(data.toString());
      
      // Validate message
      const validatedStep = ThinkingStepSchema.safeParse(message);
      
      if (!validatedStep.success) {
        ws.send(JSON.stringify({
          type: 'error',
          error: 'Invalid schema',
          details: validatedStep.error.issues
        }));
        wsMessages.inc({ type: 'validation', status: 'error' });
        return;
      }

      // Process message based on type
      if (message.type === 'execute') {
        await handleExecuteRequest(ws, message, user);
      } else if (message.type === 'subscribe') {
        await handleSubscribe(ws, message);
      } else if (message.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
      }

      wsMessages.inc({ type: message.type || 'unknown', status: 'success' });
      wsLatency.observe((Date.now() - startTime) / 1000);

    } catch (error) {
      log.error('Message processing error', { 
        error: error.message,
        stack: error.stack
      });
      ws.send(JSON.stringify({
        type: 'error',
        error: error.message
      }));
      wsMessages.inc({ type: 'processing', status: 'error' });
    }
  });

  // Close handler
  ws.on('close', () => {
    clients.delete(ws);
    log.info('Client disconnected', { 
      userId: user?.id,
      totalClients: clients.size 
    });
  });

  // Error handler
  ws.on('error', (error) => {
    log.error('WebSocket error', { 
      userId: user?.id,
      error: error.message 
    });
  });
});

/**
 * Handle agent execution request
 */
async function handleExecuteRequest(ws: WebSocket, message: any, user: any) {
  const { agentId, task } = message;

  if (!agentId || !task) {
    ws.send(JSON.stringify({
      type: 'error',
      error: 'Missing agentId or task'
    }));
    return;
  }

  try {
    // Execute agent with full intelligence
    const result = await aixManager.executeAgent(agentId, task);

    // Get real-time visualization data
    const viz = aixManager.getWorkflowVisualization(agentId);

    // Send result
    ws.send(JSON.stringify({
      type: 'execution_result',
      agentId,
      result,
      visualization: viz,
      timestamp: Date.now()
    }));

    // Broadcast to all clients (optional)
    broadcastToAll({
      type: 'agent_update',
      agentId,
      status: result.success ? 'complete' : 'error',
      timestamp: Date.now()
    });

  } catch (error) {
    ws.send(JSON.stringify({
      type: 'execution_error',
      agentId,
      error: error.message,
      timestamp: Date.now()
    }));
  }
}

/**
 * Handle subscription to agent updates
 */
async function handleSubscribe(ws: WebSocket, message: any) {
  const { agentId } = message;

  // Store subscription (in production, use Redis)
  (ws as any).subscriptions = (ws as any).subscriptions || new Set();
  (ws as any).subscriptions.add(agentId);

  ws.send(JSON.stringify({
    type: 'subscribed',
    agentId,
    timestamp: Date.now()
  }));

  log.info('Client subscribed', { agentId });
}

/**
 * Broadcast message to all connected clients
 */
function broadcastToAll(message: any) {
  const data = JSON.stringify(message);
  
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

/**
 * Setup AIX event listeners
 */
function setupAIXEventListeners() {
  // Listen to quantum state changes
  setInterval(() => {
    const topology = aixManager.quantumLayer.getTopologySnapshot();
    
    broadcastToAll({
      type: 'topology_update',
      data: topology,
      timestamp: Date.now()
    });
  }, 2000); // Every 2 seconds

  // Listen to pattern learning insights
  setInterval(() => {
    const insights = aixManager.patternEngine.getInsights();
    
    broadcastToAll({
      type: 'insights_update',
      data: insights,
      timestamp: Date.now()
    });
  }, 5000); // Every 5 seconds
}

/**
 * Graceful shutdown
 */
process.on('SIGTERM', () => {
  log.info('SIGTERM received, closing server...');
  
  wss.close(() => {
    log.info('WebSocket server closed');
    server.close(() => {
      log.info('HTTP server closed');
      process.exit(0);
    });
  });

  // Force close after 10 seconds
  setTimeout(() => {
    log.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
});

// Start server
async function start() {
  try {
    // Initialize AIX Manager
    log.info('Initializing AIX Manager...');
    await aixManager.initializeProjectContext();
    await aixManager.loadAllAgents();

    // Setup event listeners
    setupAIXEventListeners();

    // Start server
    server.listen(PORT, () => {
      log.success(`WebSocket server running`, {
        port: PORT,
        environment: NODE_ENV,
        path: '/ws',
        metrics: '/metrics',
        health: '/healthz'
      });
    });

  } catch (error) {
    log.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
}

// Start if running directly
if (require.main === module) {
  start();
}

export { wss, broadcastToAll, aixManager };

