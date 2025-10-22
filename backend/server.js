// ============================================
// AMRIKYY TRAVEL AGENT - PRODUCTION BACKEND SERVER
// Complete Express.js server with all routes registered
// © 2025 Mohamed H Abdelaziz / AMRIKYY AI Solutions
// ============================================

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (simple)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    service: 'Amrikyy Travel Agent',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

// ============================================
// ROUTE REGISTRATION
// ============================================

// Helper function to safely load routes
function loadRoute(routePath, routeName) {
  try {
    return require(routePath);
  } catch (error) {
    console.warn(`⚠️  Warning: Could not load ${routeName} route: ${error.message}`);
    // Return a placeholder router that returns a 503 (Service Unavailable)
    const express = require('express');
    const router = express.Router();
    router.all('*', (req, res) => {
      res.status(503).json({
        error: 'Service Unavailable',
        message: `The ${routeName} service is not available. Missing configuration or dependencies.`,
        route: routeName
      });
    });
    return router;
  }
}

// Import all route modules with error handling
const routes = {
  agents: loadRoute('./routes/agents', 'agents'),
  ai: loadRoute('./routes/ai', 'ai'),
  analytics: loadRoute('./routes/analytics', 'analytics'),
  auth: loadRoute('./routes/auth', 'auth'),
  automation: loadRoute('./routes/automation', 'automation'),
  bookings: loadRoute('./routes/bookings', 'bookings'),
  cache: loadRoute('./routes/cache', 'cache'),
  cryptoPayments: loadRoute('./routes/crypto-payments', 'crypto-payments'),
  dashboard: loadRoute('./routes/dashboard', 'dashboard'),
  destinations: loadRoute('./routes/destinations', 'destinations'),
  discord: loadRoute('./routes/discord', 'discord'),
  email: loadRoute('./routes/email', 'email'),
  enhancedAi: loadRoute('./routes/enhanced-ai', 'enhanced-ai'),
  expenses: loadRoute('./routes/expenses', 'expenses'),
  flights: loadRoute('./routes/flights', 'flights'),
  hotels: loadRoute('./routes/hotels', 'hotels'),
  ivr: loadRoute('./routes/ivr', 'ivr'),
  kelo: loadRoute('./routes/kelo', 'kelo'),
  mcp: loadRoute('./routes/mcp', 'mcp'),
  messenger: loadRoute('./routes/messenger', 'messenger'),
  miniapp: loadRoute('./routes/miniapp', 'miniapp'),
  notifications: loadRoute('./routes/notifications', 'notifications'),
  payment: loadRoute('./routes/payment', 'payment'),
  profile: loadRoute('./routes/profile', 'profile'),
  qdrant: loadRoute('./routes/qdrant', 'qdrant'),
  revenue: loadRoute('./routes/revenue', 'revenue'),
  security: loadRoute('./routes/security', 'security'),
  smartDocumentation: loadRoute('./routes/smart-documentation', 'smart-documentation'),
  stripeWebhook: loadRoute('./routes/stripe-webhook', 'stripe-webhook'),
  telegramIntegration: loadRoute('./routes/telegram-integration', 'telegram-integration'),
  travelAgents: loadRoute('./routes/travel-agents', 'travel-agents'),
  trips: loadRoute('./routes/trips', 'trips'),
  voiceNoteTaker: loadRoute('./routes/voice_note_taker', 'voice-note-taker'),
  webExplorer: loadRoute('./routes/web-explorer', 'web-explorer'),
  whatsapp: loadRoute('./routes/whatsapp', 'whatsapp'),
  youtube: loadRoute('./routes/youtube', 'youtube'),
};

// Register all routes with their respective paths
app.use('/api/agents', routes.agents);
app.use('/api/ai', routes.ai);
app.use('/api/analytics', routes.analytics);
app.use('/api/auth', routes.auth);
app.use('/api/automation', routes.automation);
app.use('/api/bookings', routes.bookings);
app.use('/api/cache', routes.cache);
app.use('/api/crypto-payments', routes.cryptoPayments);
app.use('/api/dashboard', routes.dashboard);
app.use('/api/destinations', routes.destinations);
app.use('/api/discord', routes.discord);
app.use('/api/email', routes.email);
app.use('/api/enhanced-ai', routes.enhancedAi);
app.use('/api/expenses', routes.expenses);
app.use('/api/flights', routes.flights);
app.use('/api/hotels', routes.hotels);
app.use('/api/ivr', routes.ivr);
app.use('/api/kelo', routes.kelo);
app.use('/api/mcp', routes.mcp);
app.use('/api/messenger', routes.messenger);
app.use('/api/miniapp', routes.miniapp);
app.use('/api/notifications', routes.notifications);
app.use('/api/payment', routes.payment);
app.use('/api/profile', routes.profile);
app.use('/api/qdrant', routes.qdrant);
app.use('/api/revenue', routes.revenue);
app.use('/api/security', routes.security);
app.use('/api/smart-documentation', routes.smartDocumentation);
app.use('/api/stripe-webhook', routes.stripeWebhook);
app.use('/api/telegram-integration', routes.telegramIntegration);
app.use('/api/travel-agents', routes.travelAgents);
app.use('/api/trips', routes.trips);
app.use('/api/voice-note-taker', routes.voiceNoteTaker);
app.use('/api/web-explorer', routes.webExplorer);
app.use('/api/whatsapp', routes.whatsapp);
app.use('/api/youtube', routes.youtube);

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
    availableEndpoints: '/api/health for server status',
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global Error:', err);
  res.status(err.status || 500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong on our end' 
      : err.message,
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log('='.repeat(80));
  console.log(`🚀 Amrikyy Travel Agent Server - Production Mode`);
  console.log('='.repeat(80));
  console.log(`📡 Server running on port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log('');
  console.log('📋 Registered API Routes (36 modules, 182 endpoints):');
  console.log('   • /api/agents         - AI Agent management');
  console.log('   • /api/ai             - AI chat and interactions');
  console.log('   • /api/analytics      - Analytics and metrics');
  console.log('   • /api/auth           - Authentication');
  console.log('   • /api/automation     - Automation workflows');
  console.log('   • /api/bookings       - Booking management');
  console.log('   • /api/cache          - Cache operations');
  console.log('   • /api/crypto-payments - Crypto payment processing');
  console.log('   • /api/dashboard      - Dashboard data');
  console.log('   • /api/destinations   - Destination information');
  console.log('   • /api/discord        - Discord integration');
  console.log('   • /api/email          - Email services');
  console.log('   • /api/enhanced-ai    - Enhanced AI features');
  console.log('   • /api/expenses       - Expense tracking');
  console.log('   • /api/flights        - Flight search and booking');
  console.log('   • /api/hotels         - Hotel search and booking');
  console.log('   • /api/ivr            - Interactive Voice Response');
  console.log('   • /api/kelo           - Kelo AI assistant');
  console.log('   • /api/mcp            - Model Context Protocol');
  console.log('   • /api/messenger      - Messenger integration');
  console.log('   • /api/miniapp        - Mini app features');
  console.log('   • /api/notifications  - Notification services');
  console.log('   • /api/payment        - Payment processing');
  console.log('   • /api/profile        - User profile management');
  console.log('   • /api/qdrant         - Vector database operations');
  console.log('   • /api/revenue        - Revenue tracking');
  console.log('   • /api/security       - Security features');
  console.log('   • /api/smart-documentation - Documentation AI');
  console.log('   • /api/stripe-webhook - Stripe webhooks');
  console.log('   • /api/telegram-integration - Telegram bot');
  console.log('   • /api/travel-agents  - Travel agent services');
  console.log('   • /api/trips          - Trip management');
  console.log('   • /api/voice-note-taker - Voice note services');
  console.log('   • /api/web-explorer   - Web exploration tools');
  console.log('   • /api/whatsapp       - WhatsApp integration');
  console.log('   • /api/youtube        - YouTube integration');
  console.log('='.repeat(80));
});

module.exports = app;
