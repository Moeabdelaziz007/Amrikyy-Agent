/**
 * Agent Authentication Middleware
 * Handles authentication and authorization for agent endpoints
 *
 * Features:
 * - JWT token authentication
 * - API key authentication
 * - Role-based access control (RBAC)
 * - Admin endpoint protection
 * - User context injection
 *
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-22
 */

const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const API_KEY_HEADER = 'x-api-key';

/**
 * User roles
 */
const ROLES = {
  USER: 'user',
  PREMIUM: 'premium',
  ADMIN: 'admin',
  INTERNAL: 'internal',
};

/**
 * Permissions by role
 */
const PERMISSIONS = {
  [ROLES.USER]: ['agent:read', 'agent:execute'],
  [ROLES.PREMIUM]: ['agent:read', 'agent:execute', 'agent:priority', 'agent:streaming'],
  [ROLES.ADMIN]: [
    'agent:read',
    'agent:execute',
    'agent:priority',
    'agent:streaming',
    'agent:manage',
    'agent:stats',
    'cache:manage',
  ],
  [ROLES.INTERNAL]: [
    '*', // All permissions
  ],
};

/**
 * Verify JWT token
 */
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, decoded };
  } catch (error) {
    logger.warn('[Auth] JWT verification failed:', error.message);
    return { valid: false, error: error.message };
  }
}

/**
 * Verify API key
 */
function verifyApiKey(apiKey) {
  // In production, check against database
  const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];

  if (validApiKeys.includes(apiKey)) {
    return { valid: true };
  }

  return { valid: false, error: 'Invalid API key' };
}

/**
 * Extract token from request
 */
function extractToken(req) {
  // Check Authorization header (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check query parameter
  if (req.query.token) {
    return req.query.token;
  }

  // Check cookie
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }

  return null;
}

/**
 * Extract API key from request
 */
function extractApiKey(req) {
  return req.headers[API_KEY_HEADER] || req.query.apiKey;
}

/**
 * Authenticate middleware
 * Verifies JWT token or API key
 */
function authenticate(req, res, next) {
  // Try API key first
  const apiKey = extractApiKey(req);
  if (apiKey) {
    const apiKeyResult = verifyApiKey(apiKey);

    if (apiKeyResult.valid) {
      req.user = {
        id: 'api-key-user',
        role: ROLES.USER,
        authMethod: 'api-key',
      };
      return next();
    }
  }

  // Try JWT token
  const token = extractToken(req);
  if (!token) {
    logger.warn('[Auth] No authentication credentials provided', {
      ip: req.ip,
      path: req.path,
    });

    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      message: 'Please provide a valid JWT token or API key',
    });
  }

  const tokenResult = verifyToken(token);

  if (!tokenResult.valid) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      message: tokenResult.error,
    });
  }

  // Inject user into request
  req.user = {
    ...tokenResult.decoded,
    authMethod: 'jwt',
  };

  next();
}

/**
 * Optional authentication middleware
 * Allows unauthenticated requests but injects user if token provided
 */
function optionalAuth(req, res, next) {
  const apiKey = extractApiKey(req);
  const token = extractToken(req);

  if (apiKey) {
    const apiKeyResult = verifyApiKey(apiKey);
    if (apiKeyResult.valid) {
      req.user = {
        id: 'api-key-user',
        role: ROLES.USER,
        authMethod: 'api-key',
      };
    }
  } else if (token) {
    const tokenResult = verifyToken(token);
    if (tokenResult.valid) {
      req.user = {
        ...tokenResult.decoded,
        authMethod: 'jwt',
      };
    }
  }

  next();
}

/**
 * Check if user has permission
 */
function hasPermission(user, permission) {
  if (!user || !user.role) {
    return false;
  }

  const rolePermissions = PERMISSIONS[user.role] || [];

  // Check for wildcard permission
  if (rolePermissions.includes('*')) {
    return true;
  }

  // Check for specific permission
  return rolePermissions.includes(permission);
}

/**
 * Require specific permission
 */
function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    if (!hasPermission(req.user, permission)) {
      logger.warn('[Auth] Permission denied', {
        userId: req.user.id,
        role: req.user.role,
        required: permission,
        path: req.path,
      });

      return res.status(403).json({
        success: false,
        error: 'Permission denied',
        required: permission,
        userRole: req.user.role,
      });
    }

    next();
  };
}

/**
 * Require specific role
 */
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    if (req.user.role !== role) {
      logger.warn('[Auth] Role requirement not met', {
        userId: req.user.id,
        userRole: req.user.role,
        required: role,
        path: req.path,
      });

      return res.status(403).json({
        success: false,
        error: 'Insufficient privileges',
        required: role,
        current: req.user.role,
      });
    }

    next();
  };
}

/**
 * Require any of the specified roles
 */
function requireAnyRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient privileges',
        required: roles,
        current: req.user.role,
      });
    }

    next();
  };
}

/**
 * Admin only middleware
 */
const requireAdmin = requireAnyRole(ROLES.ADMIN, ROLES.INTERNAL);

/**
 * Premium user or higher
 */
const requirePremium = requireAnyRole(ROLES.PREMIUM, ROLES.ADMIN, ROLES.INTERNAL);

/**
 * Generate JWT token
 */
function generateToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Refresh token
 */
function refreshToken(req, res) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
  }

  // Generate new token
  const newToken = generateToken({
    id: req.user.id,
    email: req.user.email,
    role: req.user.role,
  });

  res.json({
    success: true,
    token: newToken,
    expiresIn: '7d',
  });
}

/**
 * User context middleware
 * Enriches user object with additional info
 */
async function enrichUserContext(req, res, next) {
  if (!req.user) {
    return next();
  }

  try {
    // Add usage tracking
    req.user.requestCount = (req.user.requestCount || 0) + 1;
    req.user.lastAccess = Date.now();

    // Add rate limit info
    req.user.rateLimit = {
      remaining: res.getHeader('X-RateLimit-Remaining'),
      limit: res.getHeader('X-RateLimit-Limit'),
      reset: res.getHeader('X-RateLimit-Reset'),
    };

    next();
  } catch (error) {
    logger.error('[Auth] Error enriching user context:', error);
    next();
  }
}

/**
 * Log authenticated requests
 */
function logAuthenticatedRequest(req, res, next) {
  if (req.user) {
    logger.info('[Auth] Authenticated request', {
      userId: req.user.id,
      role: req.user.role,
      method: req.method,
      path: req.path,
      ip: req.ip,
    });
  }

  next();
}

module.exports = {
  ROLES,
  PERMISSIONS,
  authenticate,
  optionalAuth,
  hasPermission,
  requirePermission,
  requireRole,
  requireAnyRole,
  requireAdmin,
  requirePremium,
  generateToken,
  refreshToken,
  enrichUserContext,
  logAuthenticatedRequest,
  verifyToken,
  verifyApiKey,
};
