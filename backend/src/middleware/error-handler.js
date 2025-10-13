/**
 * Centralized Error Handling Middleware
 * Provides consistent error responses and Sentry integration
 * 
 * @module middleware/error-handler
 */

const Sentry = require('@sentry/node');

/**
 * Custom Application Error Class
 * Use this for all operational errors (expected errors)
 */
class AppError extends Error {
  constructor(message, statusCode, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true; // Flag to distinguish from programming errors
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Pre-defined error types for common scenarios
 */
class BadRequestError extends AppError {
  constructor(message = 'Bad Request', details = null) {
    super(message, 400, 'BAD_REQUEST', details);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', details = null) {
    super(message, 401, 'UNAUTHORIZED', details);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', details = null) {
    super(message, 403, 'FORBIDDEN', details);
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource', details = null) {
    super(`${resource} not found`, 404, 'NOT_FOUND', details);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource already exists', details = null) {
    super(message, 409, 'CONFLICT', details);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed', details = null) {
    super(message, 422, 'VALIDATION_ERROR', details);
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Too many requests', details = null) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', details);
  }
}

class ServiceUnavailableError extends AppError {
  constructor(message = 'Service temporarily unavailable', details = null) {
    super(message, 503, 'SERVICE_UNAVAILABLE', details);
  }
}

/**
 * Error logger - logs errors to console and Sentry
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 */
function logError(err, req) {
  const errorInfo = {
    message: err.message,
    code: err.code,
    statusCode: err.statusCode,
    stack: err.stack,
    url: req?.originalUrl,
    method: req?.method,
    ip: req?.ip,
    userId: req?.user?.id
  };
  
  // Log to console (development)
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', errorInfo);
  }
  
  // Log to Sentry (production/staging)
  if (!err.isOperational && process.env.NODE_ENV !== 'development') {
    Sentry.captureException(err, {
      contexts: {
        request: {
          url: req?.originalUrl,
          method: req?.method,
          headers: req?.headers,
          query: req?.query,
          body: req?.body
        },
        user: req?.user ? {
          id: req.user.id,
          email: req.user.email
        } : undefined
      },
      tags: {
        error_code: err.code,
        error_type: err.name
      }
    });
  }
}

/**
 * Main error handling middleware
 * Place this as the last middleware in your Express app
 */
function errorHandler(err, req, res, next) {
  // Set default values
  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'An unexpected error occurred';
  let details = err.details || null;
  
  // Handle specific error types
  
  // Mongoose validation errors
  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 422;
    code = 'VALIDATION_ERROR';
    details = Object.keys(err.errors).map(key => ({
      field: key,
      message: err.errors[key].message
    }));
  }
  
  // Mongoose cast errors (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_ID';
    message = `Invalid ${err.path}: ${err.value}`;
  }
  
  // Mongoose duplicate key errors
  if (err.code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_RESOURCE';
    const field = Object.keys(err.keyPattern)[0];
    message = `${field} already exists`;
    details = { field, value: err.keyValue[field] };
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid authentication token';
  }
  
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Authentication token has expired';
  }
  
  // Multer file upload errors
  if (err.name === 'MulterError') {
    statusCode = 400;
    code = 'FILE_UPLOAD_ERROR';
    message = err.message;
  }
  
  // Log the error
  logError(err, req);
  
  // Send error response
  const errorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        rawError: err
      })
    }
  };
  
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  
  res.status(statusCode).json(errorResponse);
}

/**
 * 404 Not Found handler
 * Place this before the error handler
 */
function notFoundHandler(req, res, next) {
  const error = new NotFoundError('Endpoint', {
    url: req.originalUrl,
    method: req.method
  });
  next(error);
}

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors automatically
 * 
 * Usage:
 * router.get('/endpoint', asyncHandler(async (req, res) => {
 *   const data = await someAsyncOperation();
 *   res.json(data);
 * }));
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  // Error classes
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  RateLimitError,
  ServiceUnavailableError,
  
  // Middleware
  errorHandler,
  notFoundHandler,
  asyncHandler,
  
  // Utilities
  logError
};

