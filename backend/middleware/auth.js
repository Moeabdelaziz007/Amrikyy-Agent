/**
 * JWT Authentication Middleware for Amrikyy Travel Agent API
 * Handles JWT token validation and user authentication
 */

const jwt = require('jsonwebtoken');

// CRITICAL: Ensure JWT_SECRET is defined
if (!process.env.JWT_SECRET) {
  throw new Error('FATAL_ERROR: JWT_SECRET is not defined in the environment variables. This is a critical security risk.');
}
const SupabaseDB = require('../database/supabase');

/**
 * Middleware to verify JWT token and attach user to request
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access token required',
        code: 'TOKEN_MISSING'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        error: 'Invalid token format',
        code: 'TOKEN_INVALID'
      });
    }

    // Get user profile from database
    const db = new SupabaseDB();
    const userProfile = await db.getUserProfile(decoded.userId);

    if (!userProfile) {
      return res.status(401).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Attach user to request object
    req.user = {
      telegramId: decoded.userId,
      profile: userProfile
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        code: 'TOKEN_INVALID'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    console.error('Authentication error:', error);
    res.status(500).json({
      error: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Middleware to verify user owns the resource or is admin
 */
const verifyOwnership = (resourceUserIdField = 'telegramId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const resourceUserId = req.body[resourceUserIdField] ||
                          req.params[resourceUserIdField] ||
                          req.query[resourceUserIdField];

    if (!resourceUserId) {
      return res.status(400).json({
        error: 'Resource user ID required',
        code: 'RESOURCE_USER_ID_MISSING'
      });
    }

    // Check if user owns the resource
    if (req.user.telegramId.toString() !== resourceUserId.toString()) {
      return res.status(403).json({
        error: 'Access denied: resource ownership required',
        code: 'ACCESS_DENIED'
      });
    }

    next();
  };
};

/**
 * Optional authentication - attaches user if token is present but doesn't fail if not
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded && decoded.userId) {
      const db = new SupabaseDB();
      const userProfile = await db.getUserProfile(decoded.userId);

      if (userProfile) {
        req.user = {
          telegramId: decoded.userId,
          profile: userProfile
        };
      }
    }

    next();
  } catch (error) {
    // For optional auth, we ignore errors and continue without user
    req.user = null;
    next();
  }
};

/**
 * Generate JWT token for user
 */
const generateToken = (telegramId, expiresIn = '7d') => {
  return jwt.sign(
    { userId: telegramId },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

/**
 * Middleware to refresh token if it's about to expire
 */
const refreshTokenIfNeeded = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });

      // If token expires in less than 1 hour, send new token in response headers
      const expiresIn = Math.floor((decoded.exp * 1000 - Date.now()) / 1000);
      if (expiresIn < 3600 && expiresIn > 0) {
        const newToken = generateToken(decoded.userId);
        res.setHeader('X-New-Token', newToken);
      }
    }

    next();
  } catch (error) {
    // Ignore errors in token refresh
    next();
  }
};

module.exports = {
  authenticateToken,
  verifyOwnership,
  optionalAuth,
  generateToken,
  refreshTokenIfNeeded
};