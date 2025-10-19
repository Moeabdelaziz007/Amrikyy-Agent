/**
 * Maya Travel Agent - Main Server
 * Multi-Model Architecture with Enhanced AI Integration
 * Version: 1.0.0
 * Author: AMRIKYY
 */

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const compression = require('compression');
const Redis = require('ioredis');
require('dotenv').config();

// --- Performance Optimizations ---
const PerformanceOptimizer = require('./src/optimization/PerformanceOptimizer');
const PerformanceMonitor = require('./src/monitoring/PerformanceMonitor');
const IntelligentCache = require('./src/cache/IntelligentCache');
const ConsolidatedMonitor = require('./src/monitoring/ConsolidatedMonitor');
const MCPServerManager = require('./src/services/MCPServerManager');

// Initialize performance optimizations
async function initializePerformanceOptimizations() {
  try {
    console.log('🚀 Initializing performance optimizations...');

    // Start consolidated monitor
    ConsolidatedMonitor.start();

    // Start performance monitor
    PerformanceMonitor.startMonitoring();

    // Initialize MCP server manager
    console.log('✅ MCP Server Manager initialized');

    console.log('✅ All performance optimizations initialized');
  } catch (error) {
    console.error('❌ Failed to initialize performance optimizations:', error);
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

// Enhanced Security Middleware
const {
  securityHeaders,
  secureCORS,
  requestId,
  validateEnvironment,
  sanitizeErrors,
  createSecureRateLimit,
  advancedInputValidation,
  sqlInjectionProtection,
  xssProtection,
  securityManager,
  envValidator,
} = require('./middleware/securityEnhancements');

// Environment validation
app.use(validateEnvironment);

// Request ID for tracking
app.use(requestId);

// Performance monitoring middleware
app.use(PerformanceMonitor.trackRequest.bind(PerformanceMonitor));

// Enhanced security headers
app.use(securityHeaders);

// Enhanced CORS configuration
app.use(secureCORS);

// Advanced Security Middleware
app.use(advancedInputValidation);
app.use(sqlInjectionProtection);
app.use(xssProtection);

// Body parsing middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Enhanced rate limiting
const generalLimiter = createSecureRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // More conservative limit
  skipSuccessfulRequests: false,
});

const aiLimiter = createSecureRateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Stricter AI limit
  skipSuccessfulRequests: false,
});

const authLimiter = createSecureRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Very strict auth limit
  skipSuccessfulRequests: true,
});

const paymentLimiter = createSecureRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Conservative payment limit
  skipFailedRequests: true,
});

app.use(generalLimiter);

// Database connection
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ MongoDB connected');
    } else {
      console.log('⚠️ MongoDB URI not configured, using Supabase only');
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
  }
};

// Initialize database connection
connectDB();

// Redis connection for caching
let redisClient = null;

const connectRedis = async () => {
  try {
    if (process.env.REDIS_URL) {
      redisClient = new Redis(process.env.REDIS_URL);
      redisClient.on('error', (err) => console.error('❌ Redis Client Error:', err));
      redisClient.on('connect', () => console.log('✅ Redis connected'));

      // Wait for connection
      await new Promise((resolve, reject) => {
        redisClient.once('ready', resolve);
        redisClient.once('error', reject);
      });

      console.log('✅ Redis cache ready');
    } else {
      console.log('⚠️ Redis not configured - caching disabled');
    }
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    redisClient = null;
  }
};

// Global cache helper functions
global.cache = {
  get: async (key) => {
    if (!redisClient) {
      return null;
    }
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  set: async (key, value, ttl = 300) => {
    // 5 minutes default
    if (!redisClient) {
      return;
    }
    try {
      await redisClient.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  },

  del: async (key) => {
    if (!redisClient) {
      return;
    }
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error('Cache del error:', error);
    }
  },

  clear: async (pattern = '*') => {
    if (!redisClient) {
      return;
    }
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  },
};

// Initialize Redis
connectRedis();

// Performance monitoring middleware
const { performanceMonitor, errorMonitor, cacheMetrics } = require('./middleware/performance');

// Add performance monitoring to all routes
app.use(performanceMonitor);

// Error monitoring middleware (should be last)
app.use(errorMonitor);

// Routes
console.log('🔄 Loading routes...');

// Core API routes
app.use('/api/auth', require('./routes/auth'));
// app.use('/api/users', require('./routes/users'));
app.use('/api/trips', require('./routes/trips'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/payments', require('./routes/payment'));
app.use('/api/destinations', require('./routes/destinations'));

// AI routes (with rate limiting)
// app.use('/api/ai', aiLimiter, require('./routes/enhanced-ai')); // Using enhanced multi-model AI routes
app.use('/api/voice-notes', aiLimiter, require('./routes/voice_note_taker')); // Voice Note Taker routes

// Agent routes
// app.use('/api/agents', require('./routes/travel-agents'));
app.use('/api/mcp', require('./routes/mcp'));

// Utility routes
app.use('/api/security', require('./routes/security'));
// app.use('/api/health', require('./routes/health'));
app.use('/api/youtube', require('./routes/youtube'));

// Quantum Explorer routes (with rate limiting)
app.use('/api/explorer', aiLimiter, require('./routes/web-explorer'));

// Smart Documentation routes (with rate limiting)
app.use('/api/docs', aiLimiter, require('./routes/smart-documentation'));

// Error handling middleware

// WebSocket routes

// --- New Agent System Initialization ---
console.log('🔄 Initializing AIX Connection Manager...');
const aixConnectionManager = new AIXConnectionManager();

// --- WhatsApp Business + MCP Integration ---
const whatsappClient = require('./src/whatsapp/whatsappClient'); // Assuming this exists

// Register the transport for sending replies back to WhatsApp
aixConnectionManager.registerTransport('whatsapp', {
  send: async (to, message) => {
    // The transport is responsible for picking the right content (text for WhatsApp)
    await whatsappClient.sendMessage(to, message.text);
  },
});

app.use('/api/whatsapp', require('./routes/whatsapp')(aixConnectionManager));
console.log('✅ WhatsApp Business MCP routes registered at /api/whatsapp');

// --- Communication Channel Expansion ---
const discordRoute = require('./routes/discord')(aixConnectionManager);
const messengerRoute = require('./routes/messenger');
const emailRoute = require('./routes/email')(aixConnectionManager);
const ivrRoute = require('./routes/ivr');

app.use('/api/discord', discordRoute);
app.use('/api/messenger', messengerRoute);
app.use('/api/email', emailRoute);
app.use('/api/ivr', ivrRoute);
console.log('✅ New communication channels (Discord, Messenger, Email, IVR) registered.');

console.log('🔄 Initializing new Agent System...');
const agentManager = new AgentManager();
agentManager.registerAgent(new TravelAgent());
app.use('/api/v2/agents', createAgentRoutes(agentManager));
console.log('✅ New Agent System routes registered at /api/v2/agents');

app.use('/api/websocket', require('./routes/websocket'));

// Static files
app.use('/uploads', express.static('uploads'));
app.use('/public', express.static('public'));

// Security endpoint
app.get('/api/security/stats', (req, res) => {
  try {
    const stats = securityManager.getSecurityStats();
    const envReport = envValidator.getSecurityReport();

    res.json({
      success: true,
      data: {
        securityStats: stats,
        environmentReport: envReport,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get security stats',
      timestamp: new Date().toISOString(),
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    features: [
      'Multi-Model AI Architecture',
      'Enhanced Model Switcher',
      'Claude Integration',
      'Trinity Fusion Engine',
      'Real-time WebSocket',
      'Advanced Security',
    ],
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Maya Travel Agent API',
    version: '1.0.0',
    description: 'Multi-Model AI Travel Assistant API',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      trips: '/api/trips',
      bookings: '/api/bookings',
      payments: '/api/payments',
      destinations: '/api/destinations',
      ai: '/api/ai',
      agents: '/api/agents',
      mcp: '/api/mcp',
      security: '/api/security',
      health: '/api/health',
      websocket: '/api/websocket',
      v2_agents: '/api/v2/agents',
    },
    features: {
      'Multi-Model AI': 'Intelligent model selection based on task analysis',
      'Enhanced Security': '7-tier security system with rate limiting',
      'Real-time Updates': 'WebSocket support for live updates',
      'Advanced Analytics': 'Comprehensive usage tracking and optimization',
    },
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
    availableEndpoints: [
      'GET /api',
      'GET /health',
      'POST /api/ai/smart-chat',
      'POST /api/ai/generate-presentation',
      'POST /api/ai/business-analysis',
      'GET /api/ai/models/status',
    ],
  });
});

// Global error handler with sanitization
app.use(sanitizeErrors);

// Start server with WebSocket support
const server = app.listen(PORT, async () => {
  console.log('\n🚀 ===========================================');
  console.log('🌟 MAYA TRAVEL AGENT - MULTI-MODEL ARCHITECTURE');
  console.log('🚀 ===========================================');
  console.log('📱 Frontend: http://localhost:3000');
  console.log(`🔧 Backend API: http://localhost:${PORT}`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
  console.log('🚀 ===========================================');
  console.log('✅ Multi-Model AI Architecture Active');
  console.log('✅ Enhanced Model Switcher Ready');

  // Initialize performance optimizations
  await initializePerformanceOptimizations();

  console.log('✅ Performance Optimizations Active');
  console.log('✅ Claude Integration Active');
  console.log('✅ Trinity Fusion Engine Ready');
  console.log('✅ Real-time WebSocket Support');
  console.log('✅ Advanced Security Enabled');
  console.log('🚀 ===========================================\n');
});

// Setup WebSocket for real-time workflow updates
const WebSocket = require('ws');
const { setupWorkflowWebSocket } = require('./src/websocket/workflowHandler');

const wss = new WebSocket.Server({ server, path: '/ws/workflow' });
setupWorkflowWebSocket(wss);
console.log('🔌 WebSocket server ready at ws://localhost:' + PORT + '/ws/workflow');

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
    process.exit(0);
  });
});

module.exports = app;
