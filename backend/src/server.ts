/**
 * 🚀 Amrikyy Agent Platform - Unified Backend Server
 * Main entry point for the unified backend system
 * Part of Amrikyy-Agent Phase 1: Core Foundation and Coordination
 * 
 * @version 2.0.0
 * @author Mohamed H Abdelaziz / AMRIKYY AI Solutions
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { createServer, Server as HTTPServer } from 'http';

// Import environment config with validation
import { config, validateRequiredEnv } from './config/env';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requestLogger, performanceMonitor } from './middleware/requestLogger';
import { 
  apiRateLimiter, 
  authRateLimiter, 
  aiRateLimiter,
  paymentRateLimiter 
} from './middleware/rateLimiter';

// Import existing routes
import aiRoutes from '../routes/ai';
import authRoutes from '../routes/auth';
import tripsRoutes from '../routes/trips';
import flightsRoutes from '../routes/flights';
import hotelsRoutes from '../routes/hotels';
import profileRoutes from '../routes/profile';
import notificationsRoutes from '../routes/notifications';
import destinationsRoutes from '../routes/destinations';
import analyticsRoutes from '../routes/analytics';
import dashboardRoutes from '../routes/dashboard';
import mcpRoutes from '../routes/mcp';
import bookingsRoutes from '../routes/bookings';
import expensesRoutes from '../routes/expenses';
import telegramRoutes from '../routes/telegram-integration';
import whatsappRoutes from '../routes/whatsapp';
import paymentRoutes from '../routes/payment';

// Import new TypeScript routes
import agentsRoutes, { setAgentManager } from './routes/agents';

// Import services
import { AgentManager } from './agents/AgentManager';
import logger from './utils/logger';

// Validate environment before starting
validateRequiredEnv();

/**
 * Main server class
 */
class AmrikyyServer {
  private app: Express;
  private httpServer: HTTPServer;
  private agentManager: AgentManager;
  private port: number;

  constructor() {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.port = config.port;
    this.agentManager = new AgentManager();
    
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeServices();
    this.initializeErrorHandling();
  }

  /**
   * Initialize all middleware
   */
  private initializeMiddleware(): void {
    logger.info('Initializing middleware...');

    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }));

    // CORS configuration
    const corsOrigins = config.corsOrigin.split(',').map(origin => origin.trim());
    this.app.use(cors({
      origin: corsOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    }));

    // Compression
    this.app.use(compression());

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    this.app.use(cookieParser());

    // Request logging (Morgan for HTTP logs)
    if (config.nodeEnv !== 'test') {
      this.app.use(morgan('combined', {
        stream: { 
          write: (message) => logger.info(message.trim()) 
        }
      }));
    }

    // Custom request logger with request ID
    this.app.use(requestLogger);
    this.app.use(performanceMonitor);

    logger.info('✅ Middleware initialized successfully');
  }

  /**
   * Initialize all routes
   */
  private initializeRoutes(): void {
    logger.info('Initializing routes...');

    // ========================================
    // HEALTH CHECK (no rate limiting)
    // ========================================
    this.app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        service: 'Amrikyy Agent Platform',
        version: '2.0.0',
        environment: config.nodeEnv,
        uptime: process.uptime(),
        agents: {
          registered: this.agentManager.listAgents().length,
          stats: this.agentManager.getStats(),
        },
      });
    });

    // ========================================
    // AUTHENTICATION ROUTES (strict rate limiting)
    // ========================================
    this.app.use('/api/auth', authRateLimiter, authRoutes);

    // ========================================
    // AI ROUTES (AI-specific rate limiting)
    // ========================================
    this.app.use('/api/ai', aiRateLimiter, aiRoutes);
    this.app.use('/api/agents', aiRateLimiter, agentsRoutes);
    this.app.use('/api/mcp', aiRateLimiter, mcpRoutes);

    // ========================================
    // PAYMENT ROUTES (payment rate limiting)
    // ========================================
    this.app.use('/api/payment', paymentRateLimiter, paymentRoutes);

    // ========================================
    // GENERAL API ROUTES (standard rate limiting)
    // ========================================
    this.app.use('/api/', apiRateLimiter); // Apply to all remaining routes
    
    this.app.use('/api/trips', tripsRoutes);
    this.app.use('/api/flights', flightsRoutes);
    this.app.use('/api/hotels', hotelsRoutes);
    this.app.use('/api/profile', profileRoutes);
    this.app.use('/api/notifications', notificationsRoutes);
    this.app.use('/api/destinations', destinationsRoutes);
    this.app.use('/api/analytics', analyticsRoutes);
    this.app.use('/api/dashboard', dashboardRoutes);
    this.app.use('/api/bookings', bookingsRoutes);
    this.app.use('/api/expenses', expensesRoutes);
    this.app.use('/api/telegram', telegramRoutes);
    this.app.use('/api/whatsapp', whatsappRoutes);

    // ========================================
    // 404 HANDLER
    // ========================================
    this.app.use(notFoundHandler);

    logger.info('✅ Routes initialized successfully');
  }

  /**
   * Initialize services
   */
  private async initializeServices(): Promise<void> {
    try {
      logger.info('Initializing services...');

      // Initialize Agent Manager
      // Set AgentManager instance for routes
      setAgentManager(this.agentManager);
      logger.info('✅ Agent Manager initialized');

      // Initialize WebSocket server (if exists)
      try {
        const { setupWebSocketServer } = await import('./websocket/ws-server');
        setupWebSocketServer(this.httpServer);
        logger.info('✅ WebSocket server initialized');
      } catch (error) {
        logger.warn('WebSocket server not available:', error);
      }

      // Initialize Redis connection (already done in AgentManager)
      logger.info('✅ Redis connection established via AgentManager');

      // Initialize Supabase connection (passive - client is imported in routes)
      logger.info('✅ Supabase client configured');

      logger.info('✅ All services initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize services:', error);
      throw error;
    }
  }

  /**
   * Initialize error handling
   */
  private initializeErrorHandling(): void {
    // Global error handler (must be last)
    this.app.use(errorHandler);

    // Unhandled rejection handler
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      logger.error('Unhandled Rejection:', {
        reason: reason?.message || reason,
        stack: reason?.stack,
        promise: promise.toString(),
      });
    });

    // Uncaught exception handler
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', {
        error: error.message,
        stack: error.stack,
      });
      this.gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    // Shutdown handlers
    process.on('SIGTERM', () => this.gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => this.gracefulShutdown('SIGINT'));

    logger.info('✅ Error handling initialized');
  }

  /**
   * Graceful shutdown
   */
  private async gracefulShutdown(signal: string): Promise<void> {
    logger.info(`${signal} received, starting graceful shutdown...`);

    // Stop accepting new connections
    this.httpServer.close(async () => {
      logger.info('HTTP server closed');

      try {
        // Disconnect services
        await this.agentManager.disconnect();
        logger.info('Agent Manager disconnected');

        logger.info('✅ Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown:', error);
        process.exit(1);
      }
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      logger.error('Forceful shutdown after timeout');
      process.exit(1);
    }, 30000);
  }

  /**
   * Start the server
   */
  public start(): void {
    this.httpServer.listen(this.port, () => {
      logger.info('');
      logger.info('════════════════════════════════════════════════════════');
      logger.info('🚀 Amrikyy Agent Platform - Unified Backend Server');
      logger.info('════════════════════════════════════════════════════════');
      logger.info(`📡 Server running on port ${this.port}`);
      logger.info(`🌍 Environment: ${config.nodeEnv}`);
      logger.info(`🔗 Health check: http://localhost:${this.port}/health`);
      logger.info(`🤖 AI Endpoints: http://localhost:${this.port}/api/ai/*`);
      logger.info(`👥 Agent Manager: Active`);
      logger.info(`📊 Agents registered: ${this.agentManager.listAgents().length}`);
      logger.info('════════════════════════════════════════════════════════');
      logger.info('');
    });
  }

  /**
   * Get Express app instance (for testing)
   */
  public getApp(): Express {
    return this.app;
  }

  /**
   * Get AgentManager instance
   */
  public getAgentManager(): AgentManager {
    return this.agentManager;
  }
}

// ============================================
// START SERVER
// ============================================

// Only start server if this file is run directly (not imported)
if (require.main === module) {
  const server = new AmrikyyServer();
  server.start();
}

// Export for testing and external use
export default AmrikyyServer;
