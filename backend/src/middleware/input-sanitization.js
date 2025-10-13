/**
 * Input Sanitization Middleware
 * Protects against XSS, SQL injection, and other injection attacks
 * 
 * @module middleware/input-sanitization
 */

const createDOMPurify = require('isomorphic-dompurify');
const validator = require('validator');

/**
 * Sanitize string input to prevent XSS attacks
 * @param {string} input - Raw user input
 * @returns {string} Sanitized input
 */
function sanitizeString(input) {
  if (typeof input !== 'string') return input;
  
  // Remove HTML tags
  let sanitized = createDOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [] 
  });
  
  // Escape special characters
  sanitized = validator.escape(sanitized);
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
}

/**
 * Recursively sanitize all strings in an object
 * @param {Object|Array|string} obj - Object to sanitize
 * @returns {Object|Array|string} Sanitized object
 */
function sanitizeObject(obj) {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (obj !== null && typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize both key and value
      const sanitizedKey = sanitizeString(key);
      sanitized[sanitizedKey] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * Express middleware to sanitize request body, query, and params
 * Apply this middleware AFTER body parsing
 */
function sanitizeInput(req, res, next) {
  try {
    // Sanitize body
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }
    
    // Sanitize query parameters
    if (req.query) {
      req.query = sanitizeObject(req.query);
    }
    
    // Sanitize URL parameters
    if (req.params) {
      req.params = sanitizeObject(req.params);
    }
    
    next();
  } catch (error) {
    console.error('Input sanitization error:', error);
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: 'Invalid input format'
      }
    });
  }
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
function isValidEmail(email) {
  return validator.isEmail(email, {
    allow_utf8_local_part: false,
    require_tld: true
  });
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid
 */
function isValidURL(url) {
  return validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true,
    require_valid_protocol: true
  });
}

/**
 * Validate phone number (international format)
 * @param {string} phone - Phone to validate
 * @returns {boolean} True if valid
 */
function isValidPhone(phone) {
  return validator.isMobilePhone(phone, 'any', { strictMode: false });
}

/**
 * Validate and sanitize SQL identifiers (table names, column names)
 * Prevents SQL injection in dynamic queries
 * @param {string} identifier - SQL identifier
 * @returns {string|null} Sanitized identifier or null if invalid
 */
function sanitizeSQLIdentifier(identifier) {
  // Only allow alphanumeric characters and underscores
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(identifier)) {
    return null;
  }
  
  // Prevent SQL keywords
  const sqlKeywords = [
    'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE',
    'ALTER', 'TRUNCATE', 'EXEC', 'EXECUTE', 'UNION', 'JOIN'
  ];
  
  if (sqlKeywords.includes(identifier.toUpperCase())) {
    return null;
  }
  
  return identifier;
}

/**
 * Rate limiting helper - check if request should be blocked
 * @param {string} key - Identifier (IP, user ID, etc.)
 * @param {number} maxRequests - Max requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @param {Object} cache - Cache instance (NodeCache, Redis, etc.)
 * @returns {Object} { allowed: boolean, remaining: number, resetAt: Date }
 */
function checkRateLimit(key, maxRequests, windowMs, cache) {
  const now = Date.now();
  const cacheKey = `ratelimit:${key}`;
  
  // Get current request count
  let record = cache.get(cacheKey) || { count: 0, resetAt: now + windowMs };
  
  // Reset if window expired
  if (now >= record.resetAt) {
    record = { count: 0, resetAt: now + windowMs };
  }
  
  // Increment count
  record.count++;
  
  // Save to cache
  cache.set(cacheKey, record, Math.ceil(windowMs / 1000));
  
  // Check if limit exceeded
  const allowed = record.count <= maxRequests;
  const remaining = Math.max(0, maxRequests - record.count);
  
  return {
    allowed,
    remaining,
    resetAt: new Date(record.resetAt)
  };
}

module.exports = {
  sanitizeInput,
  sanitizeString,
  sanitizeObject,
  isValidEmail,
  isValidURL,
  isValidPhone,
  sanitizeSQLIdentifier,
  checkRateLimit
};

