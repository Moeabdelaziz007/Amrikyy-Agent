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
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Rate limiting
const rateLimit = require('express-rate-limit');

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // limit each IP to 60 AI requests per minute
  message: 'Too many AI requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
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

// Routes
console.log('🔄 Loading routes...');

// Core API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/trips', require('./routes/trips'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/payments', require('./routes/payment'));
app.use('/api/destinations', require('./routes/destinations'));

// AI routes (with rate limiting)
app.use('/api/ai', aiLimiter, require('./routes/ai'));
app.use('/api/ai', aiLimiter, require('./routes/enhanced-ai')); // Multi-Model Architecture

// Agent routes
app.use('/api/agents', require('./routes/travel-agents'));
app.use('/api/mcp', require('./routes/mcp'));

// Utility routes
app.use('/api/security', require('./routes/security'));
app.use('/api/health', require('./routes/health'));

// WebSocket routes
app.use('/api/websocket', require('./routes/websocket'));

// Static files
app.use('/uploads', express.static('uploads'));
app.use('/public', express.static('public'));

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
      'Advanced Security'
    ]
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
      websocket: '/api/websocket'
    },
    features: {
      'Multi-Model AI': 'Intelligent model selection based on task analysis',
      'Enhanced Security': '7-tier security system with rate limiting',
      'Real-time Updates': 'WebSocket support for live updates',
      'Advanced Analytics': 'Comprehensive usage tracking and optimization'
    }
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
      'GET /api/ai/models/status'
    ]
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global Error Handler:', error);
  
  res.status(error.status || 500).json({
    success: false,
    error: error.message || 'Internal server error',
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  });
});

// Start server with WebSocket support
const server = app.listen(PORT, () => {
  console.log('\n🚀 ===========================================');
  console.log('🌟 MAYA TRAVEL AGENT - MULTI-MODEL ARCHITECTURE');
  console.log('🚀 ===========================================');
  console.log(`📱 Frontend: http://localhost:3000`);
  console.log(`🔧 Backend API: http://localhost:${PORT}`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
  console.log('🚀 ===========================================');
  console.log('✅ Multi-Model AI Architecture Active');
  console.log('✅ Enhanced Model Switcher Ready');
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