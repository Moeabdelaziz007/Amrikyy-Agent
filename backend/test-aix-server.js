/**
 * Minimal Test Server for AIX System
 * Run this to test AIX functionality without full backend dependencies
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5555;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Mount AIX routes
const aixRoutes = require('./routes/aix');
app.use('/api/aix', aixRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'AIX Test Server',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ═══════════════════════════════════════════════════════');
  console.log(`   AIX TEST SERVER RUNNING ON PORT ${PORT}`);
  console.log('🚀 ═══════════════════════════════════════════════════════');
  console.log('');
  console.log('📋 Available endpoints:');
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log(`   GET  http://localhost:${PORT}/api/aix/health`);
  console.log(`   POST http://localhost:${PORT}/api/aix/parse`);
  console.log(`   POST http://localhost:${PORT}/api/aix/validate`);
  console.log(`   POST http://localhost:${PORT}/api/aix/deploy`);
  console.log(`   GET  http://localhost:${PORT}/api/aix/export/:agentId`);
  console.log(`   GET  http://localhost:${PORT}/api/aix/schema`);
  console.log('');
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({ success: false, error: err.message });
});

module.exports = app;
