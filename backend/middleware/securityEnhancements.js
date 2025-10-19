/**
 * Security Enhancements Middleware for Amrikyy Travel Agent
 * CRITICAL: Addresses identified security vulnerabilities
 *
 * Issues Fixed:
 * 1. CORS configuration hardening
 * 2. Enhanced input validation
 * 3. API key security improvements
 * 4. Error sanitization
 * 5. Rate limiting enhancements
 */

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const validator = require('validator');
const { EnvironmentValidator } = require('../src/security/envValidator');
const SecurityManager = require('../src/security/SecurityManager');

// تهيئة مدير الأمان
const securityManager = new SecurityManager();
const envValidator = new EnvironmentValidator();

/**
 * Enhanced CORS Configuration
 * Fixes: Overly permissive CORS settings
 */
const secureCORS = (req, res, next) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'https://amrikyy-travel.vercel.app',
    'https://amrikyy-travel.netlify.app',
  ];

  // Add production domains from environment
  if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
  }

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else if (process.env.NODE_ENV === 'development') {
    // Allow localhost in development only
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  }

  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With, X-API-Key'
  );
  res.header('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  next();
};

/**
 * Enhanced Input Validation Middleware
 * Fixes: Missing comprehensive input validation
 */
const validateInput = (schema) => {
  return (req, res, next) => {
    const errors = [];

    // Validate request body
    if (req.body && typeof req.body === 'object') {
      for (const [key, value] of Object.entries(req.body)) {
        const fieldSchema = schema[key];
        if (fieldSchema) {
          const validation = validateField(key, value, fieldSchema);
          if (validation.error) {
            errors.push(validation.error);
          }
        }
      }
    }

    // Validate query parameters
    if (req.query && typeof req.query === 'object') {
      for (const [key, value] of Object.entries(req.query)) {
        const fieldSchema = schema[key];
        if (fieldSchema) {
          const validation = validateField(key, value, fieldSchema);
          if (validation.error) {
            errors.push(validation.error);
          }
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors: errors,
        timestamp: new Date().toISOString(),
      });
    }

    next();
  };
};

/**
 * Field validation helper
 */
const validateField = (fieldName, value, schema) => {
  // Required field check
  if (schema.required && (value === undefined || value === null || value === '')) {
    return { error: `${fieldName} is required` };
  }

  if (value === undefined || value === null) return { valid: true };

  // Type validation
  if (schema.type === 'string' && typeof value !== 'string') {
    return { error: `${fieldName} must be a string` };
  }
  if (schema.type === 'number' && typeof value !== 'number') {
    return { error: `${fieldName} must be a number` };
  }
  if (schema.type === 'boolean' && typeof value !== 'boolean') {
    return { error: `${fieldName} must be a boolean` };
  }

  // String validations
  if (schema.type === 'string') {
    // Length validation
    if (schema.minLength && value.length < schema.minLength) {
      return { error: `${fieldName} must be at least ${schema.minLength} characters` };
    }
    if (schema.maxLength && value.length > schema.maxLength) {
      return { error: `${fieldName} must be no more than ${schema.maxLength} characters` };
    }

    // Pattern validation
    if (schema.pattern && !schema.pattern.test(value)) {
      return { error: `${fieldName} format is invalid` };
    }

    // Email validation
    if (schema.format === 'email' && !validator.isEmail(value)) {
      return { error: `${fieldName} must be a valid email address` };
    }

    // URL validation
    if (schema.format === 'url' && !validator.isURL(value)) {
      return { error: `${fieldName} must be a valid URL` };
    }

    // Sanitize string input
    if (schema.sanitize) {
      return { valid: true, sanitizedValue: sanitizeString(value) };
    }
  }

  // Number validations
  if (schema.type === 'number') {
    if (schema.min !== undefined && value < schema.min) {
      return { error: `${fieldName} must be at least ${schema.min}` };
    }
    if (schema.max !== undefined && value > schema.max) {
      return { error: `${fieldName} must be no more than ${schema.max}` };
    }
  }

  return { valid: true };
};

/**
 * String sanitization using Security Manager
 * Fixes: Potential XSS and injection attacks
 */
const sanitizeString = (input) => {
  return securityManager.sanitizeInput(input, 'string');
};

/**
 * Advanced Input Validation with Security Manager
 */
const advancedInputValidation = (req, res, next) => {
  try {
    // فحص IP المحظور
    if (securityManager.isIPBlocked(req.ip)) {
      securityManager.logSecurityEvent('blocked_ip_access', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        endpoint: req.path
      });
      
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        timestamp: new Date().toISOString()
      });
    }

    // تنظيف جميع المدخلات
    if (req.body) {
      req.body = securityManager.sanitizeInput(req.body, 'string');
    }
    
    if (req.query) {
      req.query = securityManager.sanitizeInput(req.query, 'string');
    }
    
    if (req.params) {
      req.params = securityManager.sanitizeInput(req.params, 'string');
    }

    next();
  } catch (error) {
    securityManager.logSecurityEvent('input_validation_error', {
      error: error.message,
      ip: req.ip,
      endpoint: req.path
    });
    
    res.status(400).json({
      success: false,
      error: 'Invalid input',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * SQL Injection Protection
 */
const sqlInjectionProtection = (req, res, next) => {
  const sqlPatterns = [
    /union\s+select/i,
    /drop\s+table/i,
    /delete\s+from/i,
    /insert\s+into/i,
    /update\s+set/i,
    /alter\s+table/i,
    /create\s+table/i,
    /exec\s*\(/i,
    /execute\s*\(/i
  ];

  const checkForSQLInjection = (obj) => {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        for (const pattern of sqlPatterns) {
          if (pattern.test(value)) {
            securityManager.logSecurityEvent('sql_injection_attempt', {
              ip: req.ip,
              userAgent: req.get('User-Agent'),
              endpoint: req.path,
              maliciousInput: value,
              pattern: pattern.toString()
            });
            
            return res.status(400).json({
              success: false,
              error: 'Invalid input detected',
              timestamp: new Date().toISOString()
            });
          }
        }
      }
    }
    return null;
  };

  // فحص جميع المدخلات
  if (req.body && checkForSQLInjection(req.body)) return;
  if (req.query && checkForSQLInjection(req.query)) return;
  if (req.params && checkForSQLInjection(req.params)) return;

  next();
};

/**
 * XSS Protection
 */
const xssProtection = (req, res, next) => {
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /<object[^>]*>.*?<\/object>/gi,
    /<embed[^>]*>/gi
  ];

  const checkForXSS = (obj) => {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        for (const pattern of xssPatterns) {
          if (pattern.test(value)) {
            securityManager.logSecurityEvent('xss_attempt', {
              ip: req.ip,
              userAgent: req.get('User-Agent'),
              endpoint: req.path,
              maliciousInput: value,
              pattern: pattern.toString()
            });
            
            return res.status(400).json({
              success: false,
              error: 'Invalid input detected',
              timestamp: new Date().toISOString()
            });
          }
        }
      }
    }
    return null;
  };

  // فحص جميع المدخلات
  if (req.body && checkForXSS(req.body)) return;
  if (req.query && checkForXSS(req.query)) return;
  if (req.params && checkForXSS(req.params)) return;

  next();
};

/**
 * Enhanced API Key Security
 * Fixes: API key exposure and validation
 */
const validateAPIKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization'];

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'API key required',
      timestamp: new Date().toISOString(),
    });
  }

  // Extract key from Bearer token if present
  const key = apiKey.startsWith('Bearer ') ? apiKey.slice(7) : apiKey;

  // Validate API key format
  if (!validator.isLength(key, { min: 32, max: 128 })) {
    return res.status(401).json({
      success: false,
      error: 'Invalid API key format',
      timestamp: new Date().toISOString(),
    });
  }

  // Add key to request for downstream use
  req.apiKey = key;
  next();
};

/**
 * Enhanced Error Sanitization
 * Fixes: Information disclosure in error messages
 */
const sanitizeErrors = (err, req, res, next) => {
  // Log full error for debugging
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Don't expose internal errors to client
  const isDevelopment = process.env.NODE_ENV === 'development';

  const errorResponse = {
    success: false,
    error: isDevelopment ? err.message : 'An internal error occurred',
    timestamp: new Date().toISOString(),
    requestId: req.id || 'unknown',
  };

  // Add additional info only in development
  if (isDevelopment) {
    errorResponse.stack = err.stack;
    errorResponse.details = err.details;
  }

  res.status(err.status || 500).json(errorResponse);
};

/**
 * Enhanced Rate Limiting
 * Fixes: Insufficient rate limiting protection
 */
const createSecureRateLimit = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes
    max: options.max || 100,
    message: {
      success: false,
      error: 'Too many requests from this IP',
      retryAfter: Math.ceil((options.windowMs || 15 * 60 * 1000) / 1000),
      timestamp: new Date().toISOString(),
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    skipFailedRequests: options.skipFailedRequests || false,
    keyGenerator: (req) => {
      // Use API key if available, otherwise IP
      return req.apiKey || req.ip;
    },
    handler: (req, res) => {
      console.warn(`Rate limit exceeded for ${req.apiKey || req.ip}`);
      res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
        timestamp: new Date().toISOString(),
      });
    },
  });
};

/**
 * Security Headers Enhancement
 * Fixes: Missing security headers
 */
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      connectSrc: ["'self'", 'https://api.supabase.co', 'https://api.openai.com'],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

/**
 * Request ID Middleware
 * Adds unique request ID for tracking
 */
const requestId = (req, res, next) => {
  req.id = require('crypto').randomUUID();
  res.setHeader('X-Request-ID', req.id);
  next();
};

/**
 * Environment Validation Middleware
 * Validates environment on startup
 */
const validateEnvironment = (req, res, next) => {
  try {
    envValidator.validate();
    next();
  } catch (error) {
    console.error('Environment validation failed:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server configuration error',
      timestamp: new Date().toISOString(),
    });
  }
};

module.exports = {
  secureCORS,
  validateInput,
  validateAPIKey,
  sanitizeErrors,
  createSecureRateLimit,
  securityHeaders,
  requestId,
  validateEnvironment,
  sanitizeString,
  advancedInputValidation,
  sqlInjectionProtection,
  xssProtection,
  securityManager,
  envValidator
};
