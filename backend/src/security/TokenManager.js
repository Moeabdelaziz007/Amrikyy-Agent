/**
 * Token Manager
 * Manages ephemeral tokens for MCP tool access
 */

const crypto = require('crypto');
const logger = require('../utils/logger');

class TokenManager {
  constructor() {
    this.tokens = new Map();
    this.cleanupInterval = 60000; // 1 minute
    
    // Start cleanup interval
    this.startCleanup();
    
    logger.info('🔐 Token Manager initialized');
  }

  /**
   * Generate ephemeral token
   * @param {Object} options - Token options
   * @returns {Object} Token data
   */
  generateToken(options = {}) {
    const {
      userId,
      scope = [],
      expiresIn = '15m', // 15 minutes default
      metadata = {}
    } = options;

    // Generate random token
    const token = crypto.randomBytes(32).toString('hex');

    // Calculate expiration
    const expiresAt = this.calculateExpiration(expiresIn);

    // Store token data
    const tokenData = {
      token,
      userId,
      scope,
      expiresAt,
      createdAt: Date.now(),
      metadata,
      usageCount: 0,
      lastUsed: null
    };

    this.tokens.set(token, tokenData);

    logger.info('🔑 Token generated', {
      userId,
      scope,
      expiresIn,
      expiresAt: new Date(expiresAt).toISOString()
    });

    return {
      token,
      expiresAt,
      expiresIn
    };
  }

  /**
   * Validate token
   * @param {string} token - Token to validate
   * @param {string} requiredScope - Required scope
   * @returns {Object} Validation result
   */
  validateToken(token, requiredScope = null) {
    const tokenData = this.tokens.get(token);

    if (!tokenData) {
      logger.warn('⚠️ Token not found', { token: token.substring(0, 8) + '...' });
      return {
        valid: false,
        error: 'Token not found'
      };
    }

    // Check expiration
    if (Date.now() > tokenData.expiresAt) {
      logger.warn('⚠️ Token expired', {
        token: token.substring(0, 8) + '...',
        expiresAt: new Date(tokenData.expiresAt).toISOString()
      });
      
      this.tokens.delete(token);
      
      return {
        valid: false,
        error: 'Token expired'
      };
    }

    // Check scope
    if (requiredScope && !tokenData.scope.includes(requiredScope)) {
      logger.warn('⚠️ Insufficient scope', {
        token: token.substring(0, 8) + '...',
        required: requiredScope,
        available: tokenData.scope
      });
      
      return {
        valid: false,
        error: 'Insufficient scope'
      };
    }

    // Update usage
    tokenData.usageCount++;
    tokenData.lastUsed = Date.now();

    logger.info('✅ Token validated', {
      userId: tokenData.userId,
      usageCount: tokenData.usageCount
    });

    return {
      valid: true,
      userId: tokenData.userId,
      scope: tokenData.scope,
      metadata: tokenData.metadata
    };
  }

  /**
   * Revoke token
   * @param {string} token - Token to revoke
   * @returns {boolean} Success
   */
  revokeToken(token) {
    const existed = this.tokens.has(token);
    
    if (existed) {
      this.tokens.delete(token);
      logger.info('🔒 Token revoked', {
        token: token.substring(0, 8) + '...'
      });
    }
    
    return existed;
  }

  /**
   * Revoke all tokens for user
   * @param {string} userId - User ID
   * @returns {number} Number of tokens revoked
   */
  revokeUserTokens(userId) {
    let count = 0;
    
    for (const [token, data] of this.tokens.entries()) {
      if (data.userId === userId) {
        this.tokens.delete(token);
        count++;
      }
    }
    
    if (count > 0) {
      logger.info('🔒 User tokens revoked', { userId, count });
    }
    
    return count;
  }

  /**
   * Get token info
   * @param {string} token - Token
   * @returns {Object|null} Token data
   */
  getTokenInfo(token) {
    const tokenData = this.tokens.get(token);
    
    if (!tokenData) {
      return null;
    }
    
    return {
      userId: tokenData.userId,
      scope: tokenData.scope,
      expiresAt: tokenData.expiresAt,
      createdAt: tokenData.createdAt,
      usageCount: tokenData.usageCount,
      lastUsed: tokenData.lastUsed,
      isExpired: Date.now() > tokenData.expiresAt
    };
  }

  /**
   * Calculate expiration timestamp
   * @param {string} expiresIn - Expiration string (e.g., '15m', '1h', '1d')
   * @returns {number} Expiration timestamp
   */
  calculateExpiration(expiresIn) {
    const now = Date.now();
    
    // Parse expiration string
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    
    if (!match) {
      throw new Error(`Invalid expiresIn format: ${expiresIn}`);
    }
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    const multipliers = {
      s: 1000,           // seconds
      m: 60 * 1000,      // minutes
      h: 60 * 60 * 1000, // hours
      d: 24 * 60 * 60 * 1000 // days
    };
    
    return now + (value * multipliers[unit]);
  }

  /**
   * Cleanup expired tokens
   */
  cleanup() {
    const now = Date.now();
    let count = 0;
    
    for (const [token, data] of this.tokens.entries()) {
      if (now > data.expiresAt) {
        this.tokens.delete(token);
        count++;
      }
    }
    
    if (count > 0) {
      logger.info('🧹 Expired tokens cleaned up', { count });
    }
  }

  /**
   * Start cleanup interval
   */
  startCleanup() {
    setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
    
    logger.info('🧹 Token cleanup interval started', {
      interval: this.cleanupInterval
    });
  }

  /**
   * Get statistics
   * @returns {Object} Statistics
   */
  getStats() {
    const now = Date.now();
    let active = 0;
    let expired = 0;
    
    for (const data of this.tokens.values()) {
      if (now > data.expiresAt) {
        expired++;
      } else {
        active++;
      }
    }
    
    return {
      total: this.tokens.size,
      active,
      expired
    };
  }
}

module.exports = new TokenManager();
