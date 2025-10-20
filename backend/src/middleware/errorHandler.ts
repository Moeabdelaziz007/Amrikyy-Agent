/**
 * 🔥 Global Error Handler Middleware
 * Centralized error handling for the entire application
 * Part of Amrikyy-Agent Phase 1: Unified Backend
 */

import { Request, Response, NextFunction } from 'express';

// Import logger (will be created if doesn't exist)
let logger: any;
try {
  logger = require('../utils/logger');
  if (logger.default) logger = logger.default;
} catch {
  // Fallback to console if logger doesn't exist yet
  logger = {
    error: console.error,
    warn: console.warn,
    info: console.info,
  };
}

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: string;
}

/**
 * Global error handler middleware
 * Catches all errors and formats them appropriately
 */
export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log the error
  logger.error('Global error handler caught error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    timestamp: new Date().toISOString(),
  });

  // Determine status code
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  const isOperational = err.isOperational !== false; // Default to true

  // Prepare error response
  const errorResponse: any = {
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
    path: req.path,
  };

  // Add stack trace in development mode
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    errorResponse.details = {
      code: err.code,
      isOperational,
    };
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
}

/**
 * 404 Not Found Handler
 * Catches requests to non-existent routes
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const error: AppError = new Error(`Route not found: ${req.method} ${req.path}`);
  error.statusCode = 404;
  error.isOperational = true;
  next(error);
}

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Create custom error
 */
export function createError(
  message: string,
  statusCode: number = 500,
  isOperational: boolean = true
): AppError {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = isOperational;
  return error;
}
