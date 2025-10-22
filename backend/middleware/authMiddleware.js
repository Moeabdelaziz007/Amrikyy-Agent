/**
 * JWT Authentication Middleware for Amrikyy Travel Agent API
 * Handles JWT token validation and user authentication.
 * This file centralizes the authentication logic to be used across different route files.
 */

const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const { logger } = require('../src/utils/logger');

const log = logger.child({ component: 'AuthMiddleware' });

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

/**
 * Middleware to verify JWT token and attach user to request.
 * It checks for a 'Bearer' token in the Authorization header,
 * verifies it, and fetches the user profile.
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      log.warn('Authentication attempt without token.', { path: req.path });
      return res.status(401).json({
        success: false,
        error: 'Access token required',
        code: 'TOKEN_MISSING',
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.userId) {
      log.warn('Invalid token format received.', { path: req.path });
      return res.status(401).json({
        success: false,
        error: 'Invalid token format',
        code: 'TOKEN_INVALID',
      });
    }

    // Get user profile from database
    const { data: userProfile, error: dbError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (dbError || !userProfile) {
      log.warn('User not found for token.', { userId: decoded.userId, path: req.path });
      return res.status(401).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    // Attach user to request object
    req.user = userProfile;

    next();
  } catch (error) {
    log.error('Authentication error', { error: error.message, path: req.path });
    const code = error.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID';
    return res.status(401).json({ success: false, error: error.message, code });
  }
};

module.exports = { authenticateToken };
