const express = require('express');
const cors = require('cors');
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

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Stripe webhook requires raw body; mount raw parser just for that route
app.use('/api/payment/webhook', bodyParser.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

// AIX Enhanced Telegram Webhook routes
const aixTelegramRoutes = require('./src/telegram/AIXTelegramBot');
app.use('/api/telegram/aix', webhookLimiter, aixTelegramRoutes);

// AIX Enhanced Telegram Bot Integration
if (process.env.TELEGRAM_BOT_TOKEN) {
  console.log('🤖 AIX Enhanced Telegram Bot integration enabled');
  console.log('🧠 AIX Agents: Luna, Karim, Zara, Leo, Kody, Scout');
  console.log('🛠️ AIX Tools: Advanced agent orchestration and self-awareness');
  console.log('👤 User Profiling: AIX-powered personalization and memory');
  
  // Initialize AIX Enhanced Cursor Manager for Telegram
  const AIXEnhancedCursorManager = require('./src/agents/AIXEnhancedCursorManager');
  const path = require('path');
  
  let aixManager;
  
  const initializeAIXManager = async () => {
    try {
      aixManager = new AIXEnhancedCursorManager({
        aixDirectory: path.join(__dirname, 'agents/aix'),
        feedbackEnabled: process.env.AIX_FEEDBACK_ENABLED !== 'false',
        quantumEnabled: process.env.AIX_QUANTUM_ENABLED !== 'false',
        memoryEnabled: process.env.AIX_MEMORY_ENABLED !== 'false',
        maxConcurrentTasks: parseInt(process.env.AIX_MAX_CONCURRENT_TASKS) || 10,
        taskTimeout: parseInt(process.env.AIX_TASK_TIMEOUT) || 30000,
        verbose: process.env.AIX_VERBOSE === 'true'
      });
      
      await aixManager.initialize();
      console.log('✅ AIX Enhanced Cursor Manager initialized for Telegram');
      console.log(`📊 Loaded ${aixManager.getAvailableAgents().length} AIX agents`);
      
      // Store manager globally for webhook access
      global.aixManager = aixManager;
      
      // Set up graceful shutdown
      process.on('SIGINT', async () => {
        console.log('\n🛑 Shutting down AIX Manager...');
        if (aixManager) {
          await aixManager.shutdown();
        }
        process.exit(0);
      });
      
      process.on('SIGTERM', async () => {
        console.log('\n🛑 Shutting down AIX Manager...');
        if (aixManager) {
          await aixManager.shutdown();
        }
        process.exit(0);
      });
      
    } catch (error) {
      console.error('❌ Failed to initialize AIX Manager:', error.message);
      console.error('🔧 Check AIX agent files and dependencies');
      console.error('📁 AIX Directory:', path.join(__dirname, 'agents/aix'));
    }
  };
  
  // Initialize AIX Manager when server starts
  initializeAIXManager();
  
} else {
  console.log('⚠️ Telegram Bot token not provided - AIX Bot integration disabled');
  console.log('💡 Set TELEGRAM_BOT_TOKEN in your .env file to enable AIX features');
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: err.message
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Maya Trips server running on port ${PORT}`);
    console.log(`📱 Frontend: http://localhost:3000`);
    console.log(`🔧 Backend API: http://localhost:${PORT}`);
});

module.exports = app;
