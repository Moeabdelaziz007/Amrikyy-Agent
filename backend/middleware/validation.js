/**
 * Request Validation Middleware
 * Validates incoming requests against defined schemas
 */

const logger = require('../utils/logger');

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
function isValidPassword(password) {
  return password && password.length >= 6;
}

/**
 * Validate required fields
 */
function validateRequired(fields, data) {
  const missing = [];
  
  for (const field of fields) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      missing.push(field);
    }
  }
  
  return missing;
}

/**
 * Signup validation middleware
 */
function validateSignup(req, res, next) {
  const { email, password, fullName } = req.body;
  
  // Check required fields
  const missing = validateRequired(['email', 'password'], req.body);
  if (missing.length > 0) {
    logger.warn('Signup validation failed: missing fields', { missing });
    return res.status(400).json({
      success: false,
      error: `Missing required fields: ${missing.join(', ')}`
    });
  }
  
  // Validate email
  if (!isValidEmail(email)) {
    logger.warn('Signup validation failed: invalid email', { email });
    return res.status(400).json({
      success: false,
      error: 'Invalid email format'
    });
  }
  
  // Validate password
  if (!isValidPassword(password)) {
    logger.warn('Signup validation failed: weak password');
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 6 characters long'
    });
  }
  
  next();
}

/**
 * Login validation middleware
 */
function validateLogin(req, res, next) {
  const { email, password } = req.body;
  
  // Check required fields
  const missing = validateRequired(['email', 'password'], req.body);
  if (missing.length > 0) {
    logger.warn('Login validation failed: missing fields', { missing });
    return res.status(400).json({
      success: false,
      error: `Missing required fields: ${missing.join(', ')}`
    });
  }
  
  // Validate email
  if (!isValidEmail(email)) {
    logger.warn('Login validation failed: invalid email', { email });
    return res.status(400).json({
      success: false,
      error: 'Invalid email format'
    });
  }
  
  next();
}

/**
 * Booking creation validation middleware
 */
function validateBooking(req, res, next) {
  const { flightDetails, travelerInfo, totalPrice } = req.body;
  
  // Check required top-level fields
  const missing = validateRequired(['flightDetails', 'travelerInfo', 'totalPrice'], req.body);
  if (missing.length > 0) {
    logger.warn('Booking validation failed: missing fields', { missing });
    return res.status(400).json({
      success: false,
      error: `Missing required fields: ${missing.join(', ')}`
    });
  }
  
  // Validate flight details
  if (!flightDetails.origin || !flightDetails.destination || !flightDetails.departureDate) {
    logger.warn('Booking validation failed: incomplete flight details');
    return res.status(400).json({
      success: false,
      error: 'Flight details must include origin, destination, and departureDate'
    });
  }
  
  // Validate traveler info
  if (!travelerInfo.firstName || !travelerInfo.lastName || !travelerInfo.email) {
    logger.warn('Booking validation failed: incomplete traveler info');
    return res.status(400).json({
      success: false,
      error: 'Traveler info must include firstName, lastName, and email'
    });
  }
  
  // Validate email
  if (!isValidEmail(travelerInfo.email)) {
    logger.warn('Booking validation failed: invalid email', { email: travelerInfo.email });
    return res.status(400).json({
      success: false,
      error: 'Invalid email format in traveler info'
    });
  }
  
  // Validate total price
  if (typeof totalPrice !== 'number' || totalPrice <= 0) {
    logger.warn('Booking validation failed: invalid price', { totalPrice });
    return res.status(400).json({
      success: false,
      error: 'Total price must be a positive number'
    });
  }
  
  next();
}

/**
 * Password reset validation middleware
 */
function validatePasswordReset(req, res, next) {
  const { email } = req.body;
  
  if (!email) {
    logger.warn('Password reset validation failed: missing email');
    return res.status(400).json({
      success: false,
      error: 'Email is required'
    });
  }
  
  if (!isValidEmail(email)) {
    logger.warn('Password reset validation failed: invalid email', { email });
    return res.status(400).json({
      success: false,
      error: 'Invalid email format'
    });
  }
  
  next();
}

/**
 * Token refresh validation middleware
 */
function validateTokenRefresh(req, res, next) {
  const { refresh_token } = req.body;
  
  if (!refresh_token) {
    logger.warn('Token refresh validation failed: missing token');
    return res.status(400).json({
      success: false,
      error: 'Refresh token is required'
    });
  }
  
  next();
}

/**
 * Authorization header validation middleware
 */
function validateAuthHeader(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    logger.warn('Auth validation failed: missing authorization header');
    return res.status(401).json({
      success: false,
      error: 'Authorization header is required'
    });
  }
  
  if (!authHeader.startsWith('Bearer ')) {
    logger.warn('Auth validation failed: invalid authorization format');
    return res.status(401).json({
      success: false,
      error: 'Authorization header must be in format: Bearer <token>'
    });
  }
  
  const token = authHeader.split(' ')[1];
  if (!token) {
    logger.warn('Auth validation failed: missing token');
    return res.status(401).json({
      success: false,
      error: 'Token is required'
    });
  }
  
  next();
}

/**
 * Booking ID validation middleware
 */
function validateBookingId(req, res, next) {
  const { id } = req.params;
  
  if (!id) {
    logger.warn('Booking ID validation failed: missing ID');
    return res.status(400).json({
      success: false,
      error: 'Booking ID is required'
    });
  }
  
  // Validate booking ID format (BK-XXXXXX-XXXXXX)
  const bookingIdRegex = /^BK-[A-Z0-9]+-[A-Z0-9]+$/;
  if (!bookingIdRegex.test(id)) {
    logger.warn('Booking ID validation failed: invalid format', { id });
    return res.status(400).json({
      success: false,
      error: 'Invalid booking ID format'
    });
  }
  
  next();
}

/**
 * User ID validation middleware
 */
function validateUserId(req, res, next) {
  const { userId } = req.params;
  
  if (!userId) {
    logger.warn('User ID validation failed: missing ID');
    return res.status(400).json({
      success: false,
      error: 'User ID is required'
    });
  }
  
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    logger.warn('User ID validation failed: invalid format', { userId });
    return res.status(400).json({
      success: false,
      error: 'Invalid user ID format'
    });
  }
  
  next();
}

/**
 * Pagination validation middleware
 */
function validatePagination(req, res, next) {
  const { limit, offset } = req.query;
  
  if (limit !== undefined) {
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      logger.warn('Pagination validation failed: invalid limit', { limit });
      return res.status(400).json({
        success: false,
        error: 'Limit must be a number between 1 and 100'
      });
    }
  }
  
  if (offset !== undefined) {
    const offsetNum = parseInt(offset);
    if (isNaN(offsetNum) || offsetNum < 0) {
      logger.warn('Pagination validation failed: invalid offset', { offset });
      return res.status(400).json({
        success: false,
        error: 'Offset must be a non-negative number'
      });
    }
  }
  
  next();
}

/**
 * Refund amount validation middleware
 */
function validateRefund(req, res, next) {
  const { amount } = req.body;
  
  if (amount !== undefined && amount !== null) {
    if (typeof amount !== 'number' || amount <= 0) {
      logger.warn('Refund validation failed: invalid amount', { amount });
      return res.status(400).json({
        success: false,
        error: 'Refund amount must be a positive number'
      });
    }
  }
  
  next();
}

module.exports = {
  validateSignup,
  validateLogin,
  validateBooking,
  validatePasswordReset,
  validateTokenRefresh,
  validateAuthHeader,
  validateBookingId,
  validateUserId,
  validatePagination,
  validateRefund,
  isValidEmail,
  isValidPassword,
  validateRequired
};
