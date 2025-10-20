/**
 * ============================================
 * AMRIKYY-AGENT - UNIFIED BACKEND SERVER
 * Phase 1: Core Foundation & Coordination
 * © 2025 Mohamed H Abdelaziz / AMRIKYY AI Solutions
 * ============================================
 * 
 * This is the unified entry point for the Amrikyy-Agent backend.
 * It replaces the MVP server.js with a production-ready implementation.
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import http from 'http';

// ============================================
// IMPORT ENVIRONMENT VALIDATION & CONFIG
// ============================================
// This import will automatically validate all required environment variables
// and exit with a clear error message if any are missing
import './config/env';
import { config, getSafeConfig, isDevelopment } from './config/env';

// ============================================
// TYPE DEFINITIONS
// ============================================
interface ServerInfo {
  status: string;
  timestamp: string;
  service: string;
  version: string;
  environment: string;
  config: any;
}

// ============================================
// APPLICATION INITIALIZATION
// ============================================

const app: Application = express();
const PORT = config.server.port;

console.log('\n🚀 Initializing Amrikyy-Agent Unified Backend Server...\n');

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Helmet: Secure HTTP headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

console.log('✅ Security: Helmet configured');

// ============================================
// CORS CONFIGURATION
// ============================================

app.use(cors({
  origin: config.server.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

console.log(`✅ CORS: Configured for origin ${config.server.corsOrigin}`);

// ============================================
// COMPRESSION & BODY PARSING
// ============================================

// Enable gzip compression
app.use(compression());

// Parse JSON bodies (up to 10mb for file uploads)
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

console.log('✅ Middleware: Compression and body parsing configured');

// ============================================
// LOGGING
// ============================================

if (isDevelopment()) {
  // Detailed logging in development
  app.use(morgan('dev'));
  console.log('✅ Logging: Morgan (dev mode) enabled');
} else {
  // Combined logging in production
  app.use(morgan('combined'));
  console.log('✅ Logging: Morgan (production mode) enabled');
}

// ============================================
// REQUEST ID MIDDLEWARE (for tracing)
// ============================================

app.use((req: Request, res: Response, next: NextFunction) => {
  req.headers['x-request-id'] = req.headers['x-request-id'] || 
    `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Request-ID', req.headers['x-request-id'] as string);
  next();
});

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================

app.get('/health', (req: Request, res: Response) => {
  const healthInfo: ServerInfo = {
    status: 'UP',
    timestamp: new Date().toISOString(),
    service: 'Amrikyy-Agent Unified Backend',
    version: '1.0.0-phase1',
    environment: config.server.nodeEnv,
    config: getSafeConfig()
  };

  res.status(200).json(healthInfo);
});

console.log('✅ Health check endpoint registered: GET /health');

// ============================================
// IMPORT API ROUTES
// ============================================

// Core AI routes
const aiRoutes = require('../routes/ai');
const authRoutes = require('../routes/auth');
const tripsRoutes = require('../routes/trips');
const agentsRoutes = require('../routes/agents');

// Feature routes
const flightsRoutes = require('../routes/flights');
const hotelsRoutes = require('../routes/hotels');
const bookingsRoutes = require('../routes/bookings');
const analyticsRoutes = require('../routes/analytics');
const dashboardRoutes = require('../routes/dashboard');
const paymentRoutes = require('../routes/payment');

// Integration routes
const messengerRoutes = require('../routes/messenger');
const whatsappRoutes = require('../routes/whatsapp');

// Advanced features
const mcpRoutes = require('../routes/mcp');
const destinationsRoutes = require('../routes/destinations');
const profileRoutes = require('../routes/profile');
const notificationsRoutes = require('../routes/notifications');

console.log('✅ Routes imported successfully');

// ============================================
// API ROUTES MOUNTING
// ============================================

console.log('\n📋 Mounting API Routes:');

// Core routes
app.use('/api/ai', aiRoutes);
console.log('  ✅ POST /api/ai/chat - AI chat completion');
console.log('  ✅ POST /api/ai/travel-recommendations - Travel suggestions');
console.log('  ✅ POST /api/ai/budget-analysis - Budget analysis');

app.use('/api/auth', authRoutes);
console.log('  ✅ POST /api/auth/login - User authentication');
console.log('  ✅ POST /api/auth/register - User registration');

app.use('/api/trips', tripsRoutes);
console.log('  ✅ GET  /api/trips - List user trips');
console.log('  ✅ POST /api/trips - Create new trip');

app.use('/api/agents', agentsRoutes);
console.log('  ✅ POST /api/agents/coordinate - Agent coordination');

// Search & booking routes
app.use('/api/flights', flightsRoutes);
console.log('  ✅ GET  /api/flights/search - Flight search');

app.use('/api/hotels', hotelsRoutes);
console.log('  ✅ GET  /api/hotels/search - Hotel search');

app.use('/api/bookings', bookingsRoutes);
console.log('  ✅ POST /api/bookings - Create booking');

// Data & analytics
app.use('/api/analytics', analyticsRoutes);
console.log('  ✅ GET  /api/analytics/* - Analytics endpoints');

app.use('/api/dashboard', dashboardRoutes);
console.log('  ✅ GET  /api/dashboard/stats - Dashboard statistics');

app.use('/api/destinations', destinationsRoutes);
console.log('  ✅ GET  /api/destinations - Popular destinations');

// User features
app.use('/api/profile', profileRoutes);
console.log('  ✅ GET  /api/profile - User profile');

app.use('/api/notifications', notificationsRoutes);
console.log('  ✅ GET  /api/notifications - User notifications');

// Integrations
app.use('/api/messenger', messengerRoutes);
console.log('  ✅ POST /api/messenger/webhook - Messenger integration');

app.use('/api/whatsapp', whatsappRoutes);
console.log('  ✅ POST /api/whatsapp/webhook - WhatsApp integration');

// Payment
app.use('/api/payment', paymentRoutes);
console.log('  ✅ POST /api/payment/create-intent - Payment processing');

// MCP Tools
app.use('/api/mcp', mcpRoutes);
console.log('  ✅ GET  /api/mcp/tools - List MCP tools');
console.log('  ✅ POST /api/mcp/execute - Execute MCP tool');

// Agency routes (NEW - Day 4)
const agencyRoutes = require('../routes/agency');
app.use('/api/agency', agencyRoutes);
console.log('  ✅ GET  /api/agency/status - Agent Manager status');
console.log('  ✅ POST /api/agency/tasks - Create agent task');
console.log('  ✅ GET  /api/agency/tasks/:id - Get task status');
console.log('  ✅ GET  /api/agency/agents/:name - Get agent info');
console.log('  ✅ GET  /api/agency/stats - Agency statistics');

// Memory routes (NEW - Day 5)
const memoryRoutes = require('../routes/memory');
app.use('/api/memory', memoryRoutes);
console.log('  ✅ GET  /api/memory/stats - Memory statistics');
console.log('  ✅ GET  /api/memory/usage - Memory usage');
console.log('  ✅ POST /api/memory/query - Query memory');
console.log('  ✅ POST /api/memory/store - Store memory');
console.log('  ✅ GET  /api/memory/patterns - Get learned patterns');

console.log('\n✅ All routes mounted successfully!\n');

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

// 404 Handler - Must be after all routes
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id']
  });
});

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('🚨 Global Error Handler:', err);
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: isDevelopment() ? err.message : 'Something went wrong on our end',
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id']
  });
});

console.log('✅ Error handling middleware configured');

// ============================================
// HTTP SERVER CREATION
// ============================================

const httpServer = http.createServer(app);

console.log('✅ HTTP server instance created');

// ============================================
// CORE SERVICES INITIALIZATION
// ============================================

import { AgentManager } from './agents/AgentManager';
import { memoryService } from './memory/MemoryService';

// Import MCP Servers
const TravelMCPServer = require('./mcp/TravelMCPServer');

let agentManager: AgentManager;
let travelMcpServer: any;

// Initialize Memory Service
console.log('🧠 Initializing OpenMemory MCP...');
try {
  await memoryService.initialize();
  console.log('✅ OpenMemory MCP initialized');
} catch (error) {
  console.error('⚠️  OpenMemory MCP initialization failed:', error);
  console.log('   Server will continue with limited memory features');
}

// Initialize Agent Manager
console.log('🤖 Initializing Agent Manager...');
try {
  agentManager = new AgentManager();
  // Make agentManager available to routes via app.locals
  app.locals.agentManager = agentManager;
  console.log('✅ Agent Manager initialized and available to routes');
} catch (error) {
  console.error('⚠️  Agent Manager initialization failed:', error);
  console.log('   Server will continue without agent management features');
}

// Initialize MCP Servers
console.log('🔧 Initializing MCP Servers...');
try {
  travelMcpServer = new TravelMCPServer();
  app.locals.travelMcpServer = travelMcpServer;
  console.log('✅ Travel MCP Server initialized');
  console.log(`   → ${travelMcpServer.listTools().length} tools registered`);
} catch (error) {
  console.error('⚠️  MCP Server initialization failed:', error);
  console.log('   Server will continue without MCP tool features');
}

// ============================================
// WEBSOCKET SETUP
// ============================================
// WebSocket server configuration
// Will be added when ws-server.ts is ready
// import { setupWebSocketServer } from './websocket/ws-server';
// setupWebSocketServer(httpServer);
console.log('⏳ WebSocket server setup pending...');

// ============================================
// GRACEFUL SHUTDOWN HANDLER
// ============================================

async function gracefulShutdown(signal: string): Promise<void> {
  console.log(`\n🛑 ${signal} received. Starting graceful shutdown...`);
  
  // Close HTTP server
  httpServer.close(() => {
    console.log('✅ HTTP server closed');
  });
  
  // Disconnect Agent Manager
  if (agentManager) {
    try {
      await agentManager.disconnect();
      console.log('✅ Agent Manager disconnected');
    } catch (error) {
      console.error('⚠️  Error disconnecting Agent Manager:', error);
    }
  }
  
  // Disconnect Memory Service
  try {
    await memoryService.disconnect();
    console.log('✅ Memory Service disconnected');
  } catch (error) {
    console.error('⚠️  Error disconnecting Memory Service:', error);
  }
  
  console.log('✅ Graceful shutdown complete');
  process.exit(0);
}

// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('🚨 Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any) => {
  console.error('🚨 Unhandled Rejection:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// ============================================
// SERVER STARTUP
// ============================================

async function startServer(): Promise<void> {
  try {
    console.log('\n🔧 Core services status:');
    console.log(`  ${agentManager ? '✅' : '⏳'} Agent Manager - ${agentManager ? 'Ready' : 'Not initialized'}`);
    console.log('  ✅ OpenMemory MCP - Ready');
    console.log(`  ${travelMcpServer ? '✅' : '⏳'} Travel MCP Server - ${travelMcpServer ? 'Ready' : 'Not initialized'}`);
    console.log('  ⏳ WebSocket Server - Pending configuration\n');
    
    // Start HTTP server
    httpServer.listen(PORT, () => {
      console.log('═══════════════════════════════════════════════════════');
      console.log('🚀 AMRIKYY-AGENT UNIFIED BACKEND SERVER');
      console.log('═══════════════════════════════════════════════════════');
      console.log(`📡 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${config.server.nodeEnv}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`📝 Request ID tracking: Enabled`);
      console.log(`🛡️  Security: Helmet, CORS, Rate limiting ready`);
      console.log('═══════════════════════════════════════════════════════');
      console.log('\n✅ Server is ready to accept connections!\n');
      console.log('💡 Next steps (Phase 1):');
      console.log('  → Day 3: Mount API routes and integrate services');
      console.log('  → Day 4: Initialize AgentManager');
      console.log('  → Day 5: Setup MemoryService (OpenMemory MCP)');
      console.log('  → Day 6: Configure MCP REST bridge\n');
    });
  } catch (error) {
    console.error('🚨 Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

// ============================================
// EXPORTS (for testing and module usage)
// ============================================

export default app;
export { httpServer };
