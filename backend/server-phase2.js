/**
 * Amrikyy Agent - Phase 2 Production Server
 * Main entry point for Phase 2 API with graceful shutdown
 *
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-22
 */

require('dotenv').config();
const createApp = require('./src/app');
const logger = require('./src/utils/logger');
const redis = require('./src/cache/RedisCache');
const metricsService = require('./src/services/metricsService');

// Configuration
const PORT = process.env.PHASE2_PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';

// State
let server;
let isShuttingDown = false;

/**
 * Startup checks
 */
async function performStartupChecks() {
  logger.info('[SERVER] Performing startup checks...');

  const checks = {
    env: false,
    redis: false,
    database: false,
  };

  // Check environment variables
  const requiredEnv = ['GEMINI_API_KEY', 'SUPABASE_URL', 'SUPABASE_ANON_KEY', 'JWT_SECRET'];

  const missingEnv = requiredEnv.filter((key) => !process.env[key]);

  if (missingEnv.length === 0) {
    checks.env = true;
    logger.info('✓ Environment variables configured');
  } else {
    logger.warn('⚠ Missing environment variables:', missingEnv);
  }

  // Check Redis connection
  try {
    await redis.set('startup:check', 'ok', 10);
    const value = await redis.get('startup:check');

    if (value === 'ok') {
      checks.redis = true;
      logger.info('✓ Redis connection successful');
    } else {
      logger.warn('⚠ Redis connection degraded');
    }
  } catch (error) {
    logger.warn('⚠ Redis not available (will use memory cache):', error.message);
  }

  // Check database connection
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

    const { error } = await supabase.from('users').select('count').limit(1);

    if (!error) {
      checks.database = true;
      logger.info('✓ Database connection successful');
    } else {
      logger.warn('⚠ Database connection issue:', error.message);
    }
  } catch (error) {
    logger.warn('⚠ Database check failed:', error.message);
  }

  // Summary
  logger.info('[SERVER] Startup checks complete:', checks);

  return checks;
}

/**
 * Start server
 */
async function start() {
  try {
    logger.info(`[SERVER] Starting Amrikyy Agent Phase 2 (${NODE_ENV})...`);

    // Perform startup checks
    const checks = await performStartupChecks();

    // Create Express app
    const app = createApp();

    // Add metrics middleware
    app.use(metricsService.middleware());

    // Start server
    server = app.listen(PORT, HOST, () => {
      console.log('='.repeat(60));
      console.log('🚀 Amrikyy Agent Phase 2 Server Started');
      console.log('='.repeat(60));
      console.log(`Environment: ${NODE_ENV}`);
      console.log(`Server: http://${HOST}:${PORT}`);
      console.log(`Health: http://${HOST}:${PORT}/api/health`);
      console.log(`Metrics: http://${HOST}:${PORT}/api/metrics`);
      console.log(`Uptime: ${process.uptime().toFixed(2)}s`);
      console.log('='.repeat(60));
      console.log('Phase 2 Features:');
      console.log('  ✓ LangSmith Tracing');
      console.log('  ✓ SSE Streaming');
      console.log('  ✓ Multi-Agent Coordination');
      console.log('  ✓ Agent Management API');
      console.log('  ✓ RBAC Authentication');
      console.log('  ✓ Redis Rate Limiting');
      console.log('  ✓ Prometheus Metrics');
      console.log('='.repeat(60));

      // Log startup check results
      if (!checks.env) {
        console.warn('⚠ Some environment variables are missing');
      }
      if (!checks.redis) {
        console.warn('⚠ Redis not available - using memory cache fallback');
      }
      if (!checks.database) {
        console.warn('⚠ Database connection issue - some features may be limited');
      }

      console.log('✅ Server ready to accept connections');
      console.log('');
    });

    // Set timeouts
    server.timeout = 120000; // 2 minutes for long-running streams
    server.keepAliveTimeout = 65000; // Keep alive for SSE
    server.headersTimeout = 66000; // Slightly higher than keep alive

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`[SERVER] Port ${PORT} is already in use`);
      } else {
        logger.error('[SERVER] Server error:', error);
      }
      process.exit(1);
    });
  } catch (error) {
    logger.error('[SERVER] Failed to start:', error);
    process.exit(1);
  }
}

/**
 * Graceful shutdown
 */
async function gracefulShutdown(signal) {
  if (isShuttingDown) {
    logger.warn('[SERVER] Shutdown already in progress...');
    return;
  }

  isShuttingDown = true;

  logger.info(`[SERVER] Received ${signal}, starting graceful shutdown...`);

  // Stop accepting new connections
  if (server) {
    server.close(() => {
      logger.info('[SERVER] HTTP server closed');
    });
  }

  // Give existing requests time to complete
  const shutdownTimeout = setTimeout(() => {
    logger.warn('[SERVER] Shutdown timeout - forcing exit');
    process.exit(1);
  }, 30000); // 30 seconds

  try {
    // Close Redis connection
    if (redis && redis.disconnect) {
      await redis.disconnect();
      logger.info('[SERVER] Redis connection closed');
    }

    // Close database connections
    // Add any other cleanup here

    clearTimeout(shutdownTimeout);
    logger.info('[SERVER] Graceful shutdown complete');
    process.exit(0);
  } catch (error) {
    logger.error('[SERVER] Error during shutdown:', error);
    clearTimeout(shutdownTimeout);
    process.exit(1);
  }
}

/**
 * Handle uncaught errors
 */
process.on('uncaughtException', (error) => {
  logger.error('[SERVER] Uncaught exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('[SERVER] Unhandled rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

/**
 * Handle termination signals
 */
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

/**
 * Start the server
 */
if (require.main === module) {
  start();
}

module.exports = { start, gracefulShutdown };
