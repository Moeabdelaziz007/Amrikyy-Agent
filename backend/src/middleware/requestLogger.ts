/**
 * 📝 Request Logger Middleware
 * Logs incoming requests with performance tracking
 * Part of Amrikyy-Agent Phase 1: Unified Backend
 */

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Import logger
let logger: any;
try {
  logger = require('../utils/logger');
  if (logger.default) logger = logger.default;
} catch {
  logger = {
    info: console.info,
    warn: console.warn,
    error: console.error,
  };
}

/**
 * Request logger middleware
 * Adds request ID and logs request/response details
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Generate unique request ID
  const requestId = uuidv4();
  (req as any).requestId = requestId;

  // Capture start time
  const startTime = Date.now();

  // Log incoming request
  logger.info('Incoming request', {
    requestId,
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Capture response
  const originalSend = res.send;
  res.send = function (data: any): Response {
    const duration = Date.now() - startTime;
    
    // Log response
    logger.info('Outgoing response', {
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });

    // Warn on slow requests (>5 seconds)
    if (duration > 5000) {
      logger.warn('Slow request detected', {
        requestId,
        method: req.method,
        path: req.path,
        duration: `${duration}ms`,
      });
    }

    // Call original send
    return originalSend.call(this, data);
  };

  next();
}

/**
 * Performance monitoring middleware
 * Tracks request performance and alerts on issues
 */
export function performanceMonitor(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const startTime = Date.now();
  const startMemory = process.memoryUsage();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const endMemory = process.memoryUsage();
    const memoryDiff = {
      rss: endMemory.rss - startMemory.rss,
      heapUsed: endMemory.heapUsed - startMemory.heapUsed,
    };

    // Log performance metrics for slow or memory-intensive requests
    if (duration > 3000 || memoryDiff.heapUsed > 50 * 1024 * 1024) {
      logger.warn('Performance alert', {
        requestId: (req as any).requestId,
        path: req.path,
        duration: `${duration}ms`,
        memoryIncrease: `${Math.round(memoryDiff.heapUsed / 1024 / 1024)}MB`,
      });
    }
  });

  next();
}
