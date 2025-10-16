/**
 * MCP Authentication Middleware
 * Validates ephemeral tokens for MCP tool access
 */

const TokenManager = require('../src/security/TokenManager');
const logger = require('../utils/logger');

/**
 * Authenticate MCP request
 * @param {Array} requiredScopes - Required scopes
 * @returns {Function} Middleware function
 */
function authenticateMCP(requiredScopes = []) {
  return (req, res, next) => {
    try {
      // Get token from header
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        logger.warn('⚠️ MCP auth: No authorization header');
        return res.status(401).json({
          success: false,
          error: 'Authorization header required',
          message: 'Please provide a valid token'
        });
      }
      
      // Extract token
      const parts = authHeader.split(' ');
      
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        logger.warn('⚠️ MCP auth: Invalid authorization format');
        return res.status(401).json({
          success: false,
          error: 'Invalid authorization format',
          message: 'Use: Authorization: Bearer <token>'
        });
      }
      
      const token = parts[1];
      
      // Validate token
      const validation = TokenManager.validateToken(token);
      
      if (!validation.valid) {
        logger.warn('⚠️ MCP auth: Token validation failed', {
          error: validation.error
        });
        
        return res.status(401).json({
          success: false,
          error: validation.error,
          message: 'Token is invalid or expired'
        });
      }
      
      // Check required scopes
      if (requiredScopes.length > 0) {
        const hasRequiredScope = requiredScopes.some(scope =>
          validation.scope.includes(scope)
        );
        
        if (!hasRequiredScope) {
          logger.warn('⚠️ MCP auth: Insufficient scope', {
            required: requiredScopes,
            available: validation.scope
          });
          
          return res.status(403).json({
            success: false,
            error: 'Insufficient scope',
            message: `Required scope: ${requiredScopes.join(' or ')}`,
            availableScopes: validation.scope
          });
        }
      }
      
      // Attach user info to request
      req.mcpAuth = {
        userId: validation.userId,
        scope: validation.scope,
        metadata: validation.metadata
      };
      
      logger.info('✅ MCP auth: Token validated', {
        userId: validation.userId,
        scope: validation.scope
      });
      
      next();
      
    } catch (error) {
      logger.error('❌ MCP auth: Error', {
        error: error.message,
        stack: error.stack
      });
      
      res.status(500).json({
        success: false,
        error: 'Authentication error',
        message: error.message
      });
    }
  };
}

/**
 * Optional MCP authentication
 * Validates token if provided, but allows request without token
 */
function optionalMCPAuth() {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      // No token provided, continue without auth
      req.mcpAuth = null;
      return next();
    }
    
    // Token provided, validate it
    const parts = authHeader.split(' ');
    
    if (parts.length === 2 && parts[0] === 'Bearer') {
      const token = parts[1];
      const validation = TokenManager.validateToken(token);
      
      if (validation.valid) {
        req.mcpAuth = {
          userId: validation.userId,
          scope: validation.scope,
          metadata: validation.metadata
        };
      } else {
        req.mcpAuth = null;
      }
    }
    
    next();
  };
}

/**
 * Generate token endpoint handler
 */
async function generateTokenHandler(req, res) {
  try {
    const {
      userId,
      scope = [],
      expiresIn = '15m',
      metadata = {}
    } = req.body;
    
    // Validate user (in production, check if user is authenticated)
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }
    
    // Validate scope
    const validScopes = [
      'flights:read',
      'flights:write',
      'hotels:read',
      'hotels:write',
      'maps:read',
      'mcp:call',
      'agents:execute'
    ];
    
    const invalidScopes = scope.filter(s => !validScopes.includes(s));
    
    if (invalidScopes.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid scope',
        invalidScopes,
        validScopes
      });
    }
    
    // Generate token
    const tokenData = TokenManager.generateToken({
      userId,
      scope,
      expiresIn,
      metadata
    });
    
    logger.info('🔑 Token generated via API', {
      userId,
      scope,
      expiresIn
    });
    
    res.json({
      success: true,
      token: tokenData.token,
      expiresAt: tokenData.expiresAt,
      expiresIn: tokenData.expiresIn,
      scope,
      message: 'Token generated successfully'
    });
    
  } catch (error) {
    logger.error('❌ Token generation failed', {
      error: error.message
    });
    
    res.status(500).json({
      success: false,
      error: 'Token generation failed',
      message: error.message
    });
  }
}

/**
 * Revoke token endpoint handler
 */
async function revokeTokenHandler(req, res) {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'token is required'
      });
    }
    
    const revoked = TokenManager.revokeToken(token);
    
    if (revoked) {
      logger.info('🔒 Token revoked via API');
      
      res.json({
        success: true,
        message: 'Token revoked successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Token not found'
      });
    }
    
  } catch (error) {
    logger.error('❌ Token revocation failed', {
      error: error.message
    });
    
    res.status(500).json({
      success: false,
      error: 'Token revocation failed',
      message: error.message
    });
  }
}

/**
 * Token info endpoint handler
 */
async function tokenInfoHandler(req, res) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Authorization header required'
      });
    }
    
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        error: 'Invalid authorization format'
      });
    }
    
    const token = parts[1];
    const info = TokenManager.getTokenInfo(token);
    
    if (!info) {
      return res.status(404).json({
        success: false,
        error: 'Token not found'
      });
    }
    
    res.json({
      success: true,
      tokenInfo: {
        userId: info.userId,
        scope: info.scope,
        expiresAt: new Date(info.expiresAt).toISOString(),
        createdAt: new Date(info.createdAt).toISOString(),
        usageCount: info.usageCount,
        lastUsed: info.lastUsed ? new Date(info.lastUsed).toISOString() : null,
        isExpired: info.isExpired
      }
    });
    
  } catch (error) {
    logger.error('❌ Token info failed', {
      error: error.message
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to get token info',
      message: error.message
    });
  }
}

module.exports = {
  authenticateMCP,
  optionalMCPAuth,
  generateTokenHandler,
  revokeTokenHandler,
  tokenInfoHandler
};
