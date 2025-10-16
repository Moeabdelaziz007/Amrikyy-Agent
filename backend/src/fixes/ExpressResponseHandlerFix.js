/**
 * Express Response Handler Fix
 * Fixes the "Cannot read properties of undefined (reading 'update')" error
 * Provides safe response handling and proper error management
 */

const winston = require('winston');

class ExpressResponseHandlerFix {
  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'backend/logs/express-fix.log' }),
        new winston.transports.Console()
      ]
    });
  }

  /**
   * Safe response handler middleware
   * Prevents undefined response object errors
   */
  safeResponseHandler() {
    return (req, res, next) => {
      // Ensure response object has required methods
      if (!res || typeof res !== 'object') {
        this.logger.error('Invalid response object detected', {
          url: req.url,
          method: req.method,
          timestamp: new Date().toISOString()
        });
        return next(new Error('Invalid response object'));
      }

      // Add safe response methods
      if (!res.update) {
        res.update = (data) => {
          this.logger.debug('Response update called', { data });
          return res.json(data);
        };
      }

      // Add safe status update method
      if (!res.updateStatus) {
        res.updateStatus = (status, data) => {
          this.logger.debug('Response status update called', { status, data });
          return res.status(status).json(data);
        };
      }

      // Add error handling wrapper
      const originalJson = res.json.bind(res);
      res.json = (data) => {
        try {
          return originalJson(data);
        } catch (error) {
          this.logger.error('Error in response.json', {
            error: error.message,
            url: req.url,
            method: req.method
          });
          return res.status(500).send('Internal server error');
        }
      };

      // Add timeout protection
      res.setTimeout(30000, () => {
        if (!res.headersSent) {
          this.logger.warn('Response timeout', {
            url: req.url,
            method: req.method
          });
          res.status(504).json({ error: 'Request timeout' });
        }
      });

      next();
    };
  }

  /**
   * Error handler middleware
   * Catches and handles all Express.js errors safely
   */
  errorHandler() {
    return (err, req, res, next) => {
      this.logger.error('Express error caught', {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        body: req.body,
        query: req.query,
        timestamp: new Date().toISOString()
      });

      // Don't send error response if headers already sent
      if (res.headersSent) {
        return next(err);
      }

      // Safe error response
      try {
        res.status(err.status || 500).json({
          error: 'Internal server error',
          message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
          timestamp: new Date().toISOString(),
          requestId: req.id || 'unknown'
        });
      } catch (responseError) {
        this.logger.error('Failed to send error response', {
          originalError: err.message,
          responseError: responseError.message
        });
      }
    };
  }

  /**
   * Request validation middleware
   * Validates request objects before processing
   */
  requestValidator() {
    return (req, res, next) => {
      // Validate request object
      if (!req || typeof req !== 'object') {
        this.logger.error('Invalid request object');
        return res.status(400).json({ error: 'Invalid request' });
      }

      // Validate response object
      if (!res || typeof res !== 'object') {
        this.logger.error('Invalid response object');
        return res.status(500).json({ error: 'Server configuration error' });
      }

      // Add request ID for tracking
      req.id = req.id || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      this.logger.debug('Request validated', {
        requestId: req.id,
        method: req.method,
        url: req.url
      });

      next();
    };
  }

  /**
   * Health check middleware
   * Provides system health status
   */
  healthCheck() {
    return (req, res) => {
      try {
        const health = {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          version: process.version,
          platform: process.platform
        };

        res.json(health);
      } catch (error) {
        this.logger.error('Health check failed', { error: error.message });
        res.status(500).json({
          status: 'unhealthy',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    };
  }
}

module.exports = ExpressResponseHandlerFix;
