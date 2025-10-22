/**
 * Error Handling Middleware
 * Standardizes error responses across the application
 */

const logger = require('../utils/logger');

/**
 * Standard error response format
 */
class ApiError extends Error {
  constructor(statusCode, message, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Create standardized error response
 */
function createErrorResponse(statusCode, message, errors = null) {
  return {
    success: false,
    error: message,
    errors: errors,
    timestamp: new Date().toISOString()
  };
}

/**
 * Create standardized success response
 */
function createSuccessResponse(data, message = null) {
  const response = {
    success: true,
    data: data,
    timestamp: new Date().toISOString()
  };
  
  if (message) {
    response.message = message;
  }
  
  return response;
}

/**
 * 404 Not Found handler
 */
function notFoundHandler(req, res, next) {
  logger.warn('404 Not Found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip
  });
  
  res.status(404).json(
    createErrorResponse(
      404,
      `Endpoint not found: ${req.method} ${req.originalUrl}`
    )
  );
}

/**
 * Global error handler
 */
function globalErrorHandler(err, req, res, next) {
  // Default to 500 if no status code is set
  const statusCode = err.statusCode || 500;
  
  // Log error
  if (statusCode >= 500) {
    logger.error('Server error', {
      error: err.message,
      stack: err.stack,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip
    });
  } else {
    logger.warn('Client error', {
      error: err.message,
      statusCode: statusCode,
      method: req.method,
      url: req.originalUrl
    });
  }
  
  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production' && statusCode >= 500
    ? 'Internal server error'
    : err.message;
  
  res.status(statusCode).json(
    createErrorResponse(statusCode, message, err.errors)
  );
}

/**
 * Async handler wrapper
 * Catches errors in async route handlers
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Validation error handler
 */
function handleValidationError(errors) {
  return new ApiError(400, 'Validation failed', errors);
}

/**
 * Authentication error handler
 */
function handleAuthError(message = 'Authentication failed') {
  return new ApiError(401, message);
}

/**
 * Authorization error handler
 */
function handleAuthorizationError(message = 'Access denied') {
  return new ApiError(403, message);
}

/**
 * Not found error handler
 */
function handleNotFoundError(resource = 'Resource') {
  return new ApiError(404, `${resource} not found`);
}

/**
 * Conflict error handler
 */
function handleConflictError(message = 'Resource already exists') {
  return new ApiError(409, message);
}

/**
 * Rate limit error handler
 */
function handleRateLimitError(message = 'Too many requests') {
  return new ApiError(429, message);
}

/**
 * Database error handler
 */
function handleDatabaseError(err) {
  logger.error('Database error', { error: err.message });
  
  // Don't expose database errors in production
  if (process.env.NODE_ENV === 'production') {
    return new ApiError(500, 'Database operation failed');
  }
  
  return new ApiError(500, `Database error: ${err.message}`);
}

/**
 * External API error handler
 */
function handleExternalApiError(service, err) {
  logger.error(`External API error: ${service}`, { error: err.message });
  
  return new ApiError(
    502,
    `External service error: ${service} is currently unavailable`
  );
}

/**
 * Payment error handler
 */
function handlePaymentError(err) {
  logger.error('Payment error', { error: err.message });
  
  return new ApiError(
    402,
    `Payment failed: ${err.message}`
  );
}

/**
 * File upload error handler
 */
function handleFileUploadError(err) {
  logger.error('File upload error', { error: err.message });
  
  return new ApiError(
    400,
    `File upload failed: ${err.message}`
  );
}

/**
 * Request timeout handler
 */
function handleTimeoutError() {
  return new ApiError(408, 'Request timeout');
}

/**
 * Service unavailable handler
 */
function handleServiceUnavailable(service = 'Service') {
  return new ApiError(503, `${service} is temporarily unavailable`);
}

module.exports = {
  ApiError,
  createErrorResponse,
  createSuccessResponse,
  notFoundHandler,
  globalErrorHandler,
  asyncHandler,
  handleValidationError,
  handleAuthError,
  handleAuthorizationError,
  handleNotFoundError,
  handleConflictError,
  handleRateLimitError,
  handleDatabaseError,
  handleExternalApiError,
  handlePaymentError,
  handleFileUploadError,
  handleTimeoutError,
  handleServiceUnavailable
};
