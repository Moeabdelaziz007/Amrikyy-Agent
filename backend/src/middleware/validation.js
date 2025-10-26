/**
 * Input Validation Middleware
 * 
 * Validates and sanitizes all API inputs to prevent:
 * - SQL injection
 * - XSS attacks
 * - Invalid data types
 * - Malformed requests
 * 
 * Uses express-validator for robust validation
 * 
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-23
 */

const { body, query, param, validationResult } = require('express-validator');
const logger = require('../utils/logger');

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    logger.warn('[Validation] Request validation failed:', {
      path: req.path,
      errors: errors.array()
    });
    
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  
  next();
};

/**
 * Streaming Request Validation
 */
const validateStreamRequest = [
  param('agent')
    .isIn(['travel', 'content', 'health', 'finance', 'general'])
    .withMessage('Invalid agent type'),
  
  query('prompt')
    .notEmpty()
    .withMessage('Prompt is required')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Prompt must be between 1 and 2000 characters')
    .trim()
    .escape(),
  
  query('userId')
    .optional()
    .isString()
    .withMessage('User ID must be a string')
    .isLength({ max: 100 })
    .withMessage('User ID too long'),
  
  query('context')
    .optional()
    .isJSON()
    .withMessage('Context must be valid JSON'),
  
  handleValidationErrors
];

/**
 * Coordinator Request Validation
 */
const validateCoordinatorAnalyze = [
  body('prompt')
    .notEmpty()
    .withMessage('Prompt is required')
    .isLength({ min: 1, max: 5000 })
    .withMessage('Prompt must be between 1 and 5000 characters')
    .trim(),
  
  body('context')
    .optional()
    .isObject()
    .withMessage('Context must be an object'),
  
  body('userId')
    .optional()
    .isString()
    .withMessage('User ID must be a string'),
  
  handleValidationErrors
];

const validateCoordinatorExecute = [
  body('prompt')
    .notEmpty()
    .withMessage('Prompt is required')
    .isLength({ min: 1, max: 5000 })
    .withMessage('Prompt must be between 1 and 5000 characters')
    .trim(),
  
  body('agents')
    .optional()
    .isArray()
    .withMessage('Agents must be an array'),
  
  body('agents.*')
    .optional()
    .isIn(['travel', 'content', 'health', 'finance', 'general'])
    .withMessage('Invalid agent type'),
  
  body('strategy')
    .optional()
    .isIn(['sequential', 'parallel', 'hierarchical'])
    .withMessage('Invalid strategy'),
  
  body('context')
    .optional()
    .isObject()
    .withMessage('Context must be an object'),
  
  handleValidationErrors
];

const validateCoordinatorStatus = [
  param('taskId')
    .notEmpty()
    .withMessage('Task ID is required')
    .isUUID()
    .withMessage('Task ID must be a valid UUID'),
  
  handleValidationErrors
];

/**
 * Health Check Validation
 */
const validateHealthCheck = [
  query('detailed')
    .optional()
    .isBoolean()
    .withMessage('Detailed must be a boolean'),
  
  handleValidationErrors
];

/**
 * Metrics Validation
 */
const validateMetricsQuery = [
  query('format')
    .optional()
    .isIn(['json', 'prometheus'])
    .withMessage('Format must be json or prometheus'),
  
  query('filter')
    .optional()
    .isString()
    .withMessage('Filter must be a string'),
  
  handleValidationErrors
];

/**
 * Authentication Validation
 */
const validateLogin = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  
  handleValidationErrors
];

const validateRegister = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
  
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .trim()
    .escape(),
  
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .trim()
    .escape(),
  
  handleValidationErrors
];

/**
 * Agent Management Validation
 */
const validateAgentCreate = [
  body('name')
    .notEmpty()
    .withMessage('Agent name is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Agent name must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Agent name can only contain letters, numbers, hyphens, and underscores'),
  
  body('type')
    .notEmpty()
    .withMessage('Agent type is required')
    .isIn(['travel', 'content', 'health', 'finance', 'general'])
    .withMessage('Invalid agent type'),
  
  body('config')
    .optional()
    .isObject()
    .withMessage('Config must be an object'),
  
  handleValidationErrors
];

/**
 * Pagination Validation
 */
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
  
  query('sort')
    .optional()
    .isString()
    .withMessage('Sort must be a string'),
  
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be asc or desc'),
  
  handleValidationErrors
];

/**
 * File Upload Validation
 */
const validateFileUpload = [
  body('fileName')
    .optional()
    .isString()
    .withMessage('File name must be a string')
    .isLength({ max: 255 })
    .withMessage('File name too long'),
  
  body('fileType')
    .optional()
    .isIn(['image', 'document', 'audio', 'video'])
    .withMessage('Invalid file type'),
  
  handleValidationErrors
];

/**
 * Search Validation
 */
const validateSearch = [
  query('q')
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Search query must be between 1 and 200 characters')
    .trim(),
  
  query('type')
    .optional()
    .isIn(['all', 'agents', 'tasks', 'users'])
    .withMessage('Invalid search type'),
  
  handleValidationErrors
];

/**
 * Webhook Validation
 */
const validateWebhook = [
  body('event')
    .notEmpty()
    .withMessage('Event type is required')
    .isString()
    .withMessage('Event must be a string'),
  
  body('data')
    .notEmpty()
    .withMessage('Event data is required')
    .isObject()
    .withMessage('Data must be an object'),
  
  body('timestamp')
    .optional()
    .isISO8601()
    .withMessage('Timestamp must be ISO 8601 format'),
  
  handleValidationErrors
];

/**
 * Custom sanitization middleware
 */
const sanitizeInput = (req, res, next) => {
  // Remove any potential XSS from all string inputs
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    }
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        obj[key] = sanitize(obj[key]);
      }
    }
    return obj;
  };
  
  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);
  
  next();
};

module.exports = {
  // Core
  handleValidationErrors,
  sanitizeInput,
  
  // Streaming
  validateStreamRequest,
  
  // Coordinator
  validateCoordinatorAnalyze,
  validateCoordinatorExecute,
  validateCoordinatorStatus,
  
  // System
  validateHealthCheck,
  validateMetricsQuery,
  
  // Authentication
  validateLogin,
  validateRegister,
  
  // Agent Management
  validateAgentCreate,
  
  // Utilities
  validatePagination,
  validateFileUpload,
  validateSearch,
  validateWebhook
};
