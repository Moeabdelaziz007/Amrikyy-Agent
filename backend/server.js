const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Import rate limiters
const {
  generalLimiter,
  aiLimiter,
  paymentLimiter,
  webhookLimiter,
  analyticsLimiter
} = require('./middleware/rateLimiter');

// Security middleware
app.use(helmet());
app.use(compression());

// ============================================================================
// SECURITY: CORS Configuration - Strict Origin Validation
// ============================================================================
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.TELEGRAM_WEBAPP_URL,
  'https://maya-travel-agent.com'  // Production domain
].filter(Boolean);

// Validate required origins in production
if (process.env.NODE_ENV === 'production') {
  if (!process.env.FRONTEND_URL) {
    throw new Error('❌ FATAL: FRONTEND_URL must be set in production');
  }
  console.log('✅ CORS configured for production with origins:', allowedOrigins);
}

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, server-to-server)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS BLOCKED request from unauthorized origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  maxAge: 86400, // Cache preflight for 24 hours
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Stripe webhook requires raw body; mount raw parser just for that route
app.use('/api/payment/webhook', bodyParser.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve AIX Dashboard and static files
app.use(express.static('backend/public'));
console.log('✅ AIX Dashboard available at /aix-dashboard.html');

// Apply general rate limiter to all API routes
app.use('/api/', generalLimiter);

// MongoDB Connection (Optional - using Supabase instead)
// const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/maya-trips';

// mongoose.connect(MONGODB_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// })
// .then(() => console.log('✅ Connected to MongoDB'))
// .catch(err => console.error('❌ MongoDB connection error:', err));

console.log('✅ Using Supabase as database (MongoDB not required)');

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'Maya Trips API Server',
        version: '1.0.0',
        status: 'running',
        timestamp: new Date().toISOString()
    });
});

// Public API: ping
app.get('/api/public/ping', (req, res) => {
    res.json({ ok: true, ts: Date.now() });
});

// OpenAPI spec
app.get('/api/openapi.json', (req, res) => {
    try {
        const spec = require('./openapi.json');
        res.json(spec);
    } catch (e) {
        res.status(500).json({ error: 'Spec not found' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// Aladdin Agent routes
const aladdinRoutes = require('./src/routes/aladdin');
app.use('/api/aladdin', aladdinRoutes);

// Trip routes
app.get('/api/trips', (req, res) => {
    res.json({
        trips: [],
        message: 'Trips endpoint ready'
    });
});

// AI Assistant routes
app.post('/api/ai/chat', (req, res) => {
    const { message } = req.body;
    
    // Placeholder AI response
    res.json({
        response: `مرحباً! أنا Maya، مساعد السفر الذكي الخاص بك. سأساعدك في تخطيط رحلتك المثالية. ${message}`,
        timestamp: new Date().toISOString()
    });
});

// Destinations routes
app.get('/api/destinations', (req, res) => {
    res.json({
        destinations: [
            {
                id: 1,
                name: 'Tokyo',
                country: 'Japan',
                image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400',
                rating: 4.8,
                priceRange: '$$$',
                bestTime: 'Mar-May, Sep-Nov'
            },
            {
                id: 2,
                name: 'Paris',
                country: 'France',
                image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400',
                rating: 4.9,
                priceRange: '$$$$',
                bestTime: 'Apr-Jun, Sep-Oct'
            }
        ]
    });
});

// Analytics ingestion (in-memory demo) with rate limiting
const analyticsEvents = [];
app.post('/api/analytics/events', analyticsLimiter, (req, res) => {
    const { type, userId, payload } = req.body || {};
    analyticsEvents.push({
        type: type || 'unknown',
        userId: userId || null,
        payload: payload || {},
        ts: Date.now(),
        ua: req.headers['user-agent'] || ''
    });
    res.json({ success: true });
});

app.get('/api/analytics/summary', (req, res) => {
    const byType = analyticsEvents.reduce((acc, ev) => {
        acc[ev.type] = (acc[ev.type] || 0) + 1;
        return acc;
    }, {});
    const total = analyticsEvents.length;
    res.json({ total, byType, last10: analyticsEvents.slice(-10).reverse() });
});

// Payment routes with rate limiting
const paymentRoutes = require('./routes/payment');
app.use('/api/payment', paymentLimiter, paymentRoutes);

// Stripe webhook route with webhook rate limiting
const stripeWebhook = require('./routes/stripe-webhook');
app.use('/api/payment/webhook', webhookLimiter, stripeWebhook);

// Mini App routes
const miniappRoutes = require('./routes/miniapp');
app.use('/api/telegram', miniappRoutes);

// AI routes (Z.ai GLM-4.6) with AI rate limiting
const aiRoutes = require('./routes/ai');
app.use('/api/ai', aiLimiter, aiRoutes);

// WhatsApp routes with webhook rate limiting
const whatsappRoutes = require('./routes/whatsapp');
app.use('/api/whatsapp', webhookLimiter, whatsappRoutes);

// Agent Registry routes
const agentRoutes = require('./routes/agents');
app.use('/api/agents', agentRoutes);

// Advanced Telegram Bot (only start if token is provided)
if (process.env.TELEGRAM_BOT_TOKEN) {
  const advancedTelegramBot = require('./advanced-telegram-bot');
  console.log('🤖 Advanced Maya Telegram Bot integration enabled');
  console.log('🧠 AI Persona: Maya - Professional Travel Agent');
  console.log('🛠️ MCP Tools: Weather, Flights, Hotels, Halal Restaurants, Prayer Times');
  console.log('👤 User Profiling: Advanced personalization and data collection');
} else {
  console.log('⚠️ Telegram Bot token not provided - Advanced Bot integration disabled');
}

// ============================================================================
// SECURITY: Error Handling Middleware - Sanitized Error Responses
// ============================================================================
app.use((err, req, res, next) => {
    // Always log full error server-side for debugging
    console.error('❌ Error occurred:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });
    
    const isProduction = process.env.NODE_ENV === 'production';
    
    // In production: Generic error messages only (no internal details)
    // In development: Detailed errors for debugging
    res.status(err.status || 500).json({
        error: isProduction ? 'Something went wrong!' : err.message,
        ...(isProduction ? {} : { 
            stack: err.stack,
            details: err.details 
        })
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl
    });
});

// Start server with WebSocket support
const server = app.listen(PORT, () => {
    console.log(`🚀 Maya Trips server running on port ${PORT}`);
    console.log(`📱 Frontend: http://localhost:3000`);
    console.log(`🔧 Backend API: http://localhost:${PORT}`);
});

// Setup WebSocket for real-time workflow updates
const WebSocket = require('ws');
const { setupWorkflowWebSocket } = require('./src/websocket/workflowHandler');

const wss = new WebSocket.Server({ server, path: '/ws/workflow' });
setupWorkflowWebSocket(wss);
console.log('🔌 WebSocket server ready at ws://localhost:' + PORT + '/ws/workflow');

module.exports = app;
