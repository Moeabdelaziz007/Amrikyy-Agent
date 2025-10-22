/**
 * Unit Tests for Error Handler Middleware
 * Tests standardized error responses and error handling
 */

const {
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
} = require('../middleware/errorHandler');

// Mock logger
jest.mock('../utils/logger', () => ({
  warn: jest.fn(),
  error: jest.fn()
}));

describe('Error Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      method: 'GET',
      originalUrl: '/api/test',
      ip: '127.0.0.1'
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('ApiError', () => {
    it('should create ApiError with statusCode and message', () => {
      const error = new ApiError(400, 'Bad Request');

      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Bad Request');
      expect(error.timestamp).toBeDefined();
    });

    it('should create ApiError with errors array', () => {
      const errors = [
        { field: 'email', message: 'Invalid email' },
        { field: 'password', message: 'Too short' }
      ];
      const error = new ApiError(400, 'Validation failed', errors);

      expect(error.errors).toEqual(errors);
    });

    it('should be instance of Error', () => {
      const error = new ApiError(404, 'Not found');

      expect(error instanceof Error).toBe(true);
    });
  });

  describe('createErrorResponse()', () => {
    it('should create standardized error response', () => {
      const response = createErrorResponse(404, 'Resource not found');

      expect(response).toEqual({
        success: false,
        error: 'Resource not found',
        errors: null,
        timestamp: expect.any(String)
      });
    });

    it('should include errors array if provided', () => {
      const errors = [{ field: 'email', message: 'Required' }];
      const response = createErrorResponse(400, 'Validation failed', errors);

      expect(response.errors).toEqual(errors);
    });

    it('should have ISO timestamp', () => {
      const response = createErrorResponse(500, 'Server error');
      const timestamp = new Date(response.timestamp);

      expect(timestamp.toISOString()).toBe(response.timestamp);
    });
  });

  describe('createSuccessResponse()', () => {
    it('should create standardized success response', () => {
      const data = { id: 1, name: 'Test' };
      const response = createSuccessResponse(data);

      expect(response).toEqual({
        success: true,
        data: data,
        timestamp: expect.any(String)
      });
    });

    it('should include optional message', () => {
      const data = { id: 1 };
      const response = createSuccessResponse(data, 'Created successfully');

      expect(response.message).toBe('Created successfully');
    });

    it('should handle null data', () => {
      const response = createSuccessResponse(null);

      expect(response.success).toBe(true);
      expect(response.data).toBeNull();
    });
  });

  describe('notFoundHandler()', () => {
    it('should return 404 for unknown routes', () => {
      req.method = 'POST';
      req.originalUrl = '/api/unknown';

      notFoundHandler(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('POST /api/unknown')
        })
      );
    });

    it('should log warning for 404', () => {
      const logger = require('../utils/logger');

      notFoundHandler(req, res, next);

      expect(logger.warn).toHaveBeenCalledWith(
        '404 Not Found',
        expect.objectContaining({
          method: 'GET',
          url: '/api/test',
          ip: '127.0.0.1'
        })
      );
    });
  });

  describe('globalErrorHandler()', () => {
    it('should handle errors with statusCode', () => {
      const error = new ApiError(400, 'Bad Request');

      globalErrorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Bad Request'
        })
      );
    });

    it('should default to 500 for errors without statusCode', () => {
      const error = new Error('Unexpected error');

      globalErrorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should log server errors (>= 500)', () => {
      const logger = require('../utils/logger');
      const error = new Error('Database connection failed');

      globalErrorHandler(error, req, res, next);

      expect(logger.error).toHaveBeenCalledWith(
        'Server error',
        expect.objectContaining({
          error: 'Database connection failed'
        })
      );
    });

    it('should log client errors (< 500) as warnings', () => {
      const logger = require('../utils/logger');
      const error = new ApiError(400, 'Invalid input');

      globalErrorHandler(error, req, res, next);

      expect(logger.warn).toHaveBeenCalledWith(
        'Client error',
        expect.objectContaining({
          error: 'Invalid input',
          statusCode: 400
        })
      );
    });

    it('should hide error details in production for 500 errors', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new Error('Database credentials leaked');
      error.statusCode = 500;

      globalErrorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Internal server error'
        })
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('should show error details in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new Error('Specific error message');
      error.statusCode = 500;

      globalErrorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Specific error message'
        })
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('should include errors array if present', () => {
      const errors = [{ field: 'email', message: 'Invalid' }];
      const error = new ApiError(400, 'Validation failed', errors);

      globalErrorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: errors
        })
      );
    });
  });

  describe('asyncHandler()', () => {
    it('should handle successful async operations', async () => {
      const asyncFn = async (req, res) => {
        res.json({ success: true });
      };

      const wrappedFn = asyncHandler(asyncFn);
      await wrappedFn(req, res, next);

      expect(res.json).toHaveBeenCalledWith({ success: true });
      expect(next).not.toHaveBeenCalled();
    });

    it('should catch async errors and pass to next', async () => {
      const error = new Error('Async error');
      const asyncFn = async () => {
        throw error;
      };

      const wrappedFn = asyncHandler(asyncFn);
      await wrappedFn(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle rejected promises', async () => {
      const error = new Error('Promise rejected');
      const asyncFn = async () => {
        return Promise.reject(error);
      };

      const wrappedFn = asyncHandler(asyncFn);
      await wrappedFn(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('Specialized Error Handlers', () => {
    it('handleValidationError should create 400 error', () => {
      const errors = [{ field: 'email', message: 'Invalid' }];
      const error = handleValidationError(errors);

      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Validation failed');
      expect(error.errors).toEqual(errors);
    });

    it('handleAuthError should create 401 error', () => {
      const error = handleAuthError('Invalid token');

      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Invalid token');
    });

    it('handleAuthError should use default message', () => {
      const error = handleAuthError();

      expect(error.message).toBe('Authentication failed');
    });

    it('handleAuthorizationError should create 403 error', () => {
      const error = handleAuthorizationError('Insufficient permissions');

      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('Insufficient permissions');
    });

    it('handleNotFoundError should create 404 error', () => {
      const error = handleNotFoundError('User');

      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('User not found');
    });

    it('handleConflictError should create 409 error', () => {
      const error = handleConflictError('Email already exists');

      expect(error.statusCode).toBe(409);
      expect(error.message).toBe('Email already exists');
    });

    it('handleRateLimitError should create 429 error', () => {
      const error = handleRateLimitError('Rate limit exceeded');

      expect(error.statusCode).toBe(429);
      expect(error.message).toBe('Rate limit exceeded');
    });

    it('handleDatabaseError should create 500 error', () => {
      const dbError = new Error('Connection timeout');
      const error = handleDatabaseError(dbError);

      expect(error.statusCode).toBe(500);
    });

    it('handleDatabaseError should hide details in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const dbError = new Error('SELECT * FROM users WHERE password=...');
      const error = handleDatabaseError(dbError);

      expect(error.message).toBe('Database operation failed');

      process.env.NODE_ENV = originalEnv;
    });

    it('handleExternalApiError should create 502 error', () => {
      const apiError = new Error('Timeout');
      const error = handleExternalApiError('Stripe', apiError);

      expect(error.statusCode).toBe(502);
      expect(error.message).toContain('Stripe');
      expect(error.message).toContain('unavailable');
    });

    it('handlePaymentError should create 402 error', () => {
      const paymentError = new Error('Card declined');
      const error = handlePaymentError(paymentError);

      expect(error.statusCode).toBe(402);
      expect(error.message).toContain('Payment failed');
      expect(error.message).toContain('Card declined');
    });

    it('handleFileUploadError should create 400 error', () => {
      const uploadError = new Error('File too large');
      const error = handleFileUploadError(uploadError);

      expect(error.statusCode).toBe(400);
      expect(error.message).toContain('File upload failed');
    });

    it('handleTimeoutError should create 408 error', () => {
      const error = handleTimeoutError();

      expect(error.statusCode).toBe(408);
      expect(error.message).toBe('Request timeout');
    });

    it('handleServiceUnavailable should create 503 error', () => {
      const error = handleServiceUnavailable('Email');

      expect(error.statusCode).toBe(503);
      expect(error.message).toContain('Email');
      expect(error.message).toContain('temporarily unavailable');
    });
  });

  describe('Error Response Format Consistency', () => {
    it('should have consistent error response structure', () => {
      const errors = [
        handleAuthError(),
        handleNotFoundError('Resource'),
        handleValidationError([]),
        handleConflictError(),
        handleRateLimitError()
      ];

      errors.forEach(error => {
        expect(error).toHaveProperty('statusCode');
        expect(error).toHaveProperty('message');
        expect(error).toBeInstanceOf(ApiError);
      });
    });

    it('should maintain timestamp in all responses', () => {
      const response1 = createErrorResponse(400, 'Error 1');
      const response2 = createSuccessResponse({ data: 'test' });

      expect(response1.timestamp).toBeDefined();
      expect(response2.timestamp).toBeDefined();
      expect(new Date(response1.timestamp)).toBeInstanceOf(Date);
      expect(new Date(response2.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('Edge Cases', () => {
    it('should handle error with no message', () => {
      const error = new Error();

      globalErrorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });

    it('should handle error with special characters in message', () => {
      const error = new ApiError(400, 'Error: <script>alert("xss")</script>');

      globalErrorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('<script>')
        })
      );
    });

    it('should handle very long error messages', () => {
      const longMessage = 'A'.repeat(10000);
      const error = new ApiError(400, longMessage);

      globalErrorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: longMessage
        })
      );
    });

    it('should handle circular reference in errors array', () => {
      const circularError = { field: 'test' };
      circularError.self = circularError;

      // Should not throw
      expect(() => {
        handleValidationError([circularError]);
      }).not.toThrow();
    });
  });

  describe('Logging Behavior', () => {
    it('should log with request context', () => {
      const logger = require('../utils/logger');
      const error = new Error('Test error');

      req.method = 'POST';
      req.originalUrl = '/api/bookings';
      req.ip = '192.168.1.1';

      globalErrorHandler(error, req, res, next);

      expect(logger.error).toHaveBeenCalledWith(
        'Server error',
        expect.objectContaining({
          method: 'POST',
          url: '/api/bookings',
          ip: '192.168.1.1'
        })
      );
    });

    it('should include error stack in logs', () => {
      const logger = require('../utils/logger');
      const error = new Error('Test error');

      globalErrorHandler(error, req, res, next);

      expect(logger.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          stack: expect.stringContaining('Error: Test error')
        })
      );
    });

    it('should not log 404 errors as server errors', () => {
      const logger = require('../utils/logger');

      notFoundHandler(req, res, next);

      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalled();
    });
  });
});
