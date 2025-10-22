/**
 * Security API Routes
 * Token management and security endpoints
 */

const express = require('express');
const router = express.Router();
const {
  generateTokenHandler,
  revokeTokenHandler,
  tokenInfoHandler
} = require('../middleware/mcpAuth');
const TokenManager = require('../src/security/TokenManager');
const ExternalAPILimiter = require('../middleware/externalAPILimiter');
const logger = require('../utils/logger');

/**
 * POST /api/security/tokens/generate
 * Generate ephemeral token
 */
router.post('/tokens/generate', generateTokenHandler);

/**
 * POST /api/security/tokens/revoke
 * Revoke token
 */
router.post('/tokens/revoke', revokeTokenHandler);

/**
 * GET /api/security/tokens/info
 * Get token information
 */
router.get('/tokens/info', tokenInfoHandler);

/**
 * GET /api/security/tokens/stats
 * Get token statistics
 */
router.get('/tokens/stats', (req, res) => {
  try {
    const stats = TokenManager.getStats();
    
    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Failed to get token stats', {
      error: error.message
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to get statistics',
      message: error.message
    });
  }
});

/**
 * GET /api/security/rate-limits/:userId
 * Get user rate limit stats
 */
router.get('/rate-limits/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    const stats = ExternalAPILimiter.getUserStats(userId);
    
    res.json({
      success: true,
      userId,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Failed to get rate limit stats', {
      error: error.message
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to get rate limits',
      message: error.message
    });
  }
});

/**
 * POST /api/security/rate-limits/:userId/reset
 * Reset user rate limits
 */
router.post('/rate-limits/:userId/reset', (req, res) => {
  try {
    const { userId } = req.params;
    const { api } = req.body;
    
    ExternalAPILimiter.resetUserLimits(userId, api);
    
    res.json({
      success: true,
      message: api 
        ? `Rate limits reset for ${api}` 
        : 'All rate limits reset',
      userId
    });
  } catch (error) {
    logger.error('❌ Failed to reset rate limits', {
      error: error.message
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to reset rate limits',
      message: error.message
    });
  }
});

/**
 * GET /api/security/scopes
 * Get available scopes
 */
router.get('/scopes', (req, res) => {
  const scopes = [
    {
      name: 'flights:read',
      description: 'Read flight information'
    },
    {
      name: 'flights:write',
      description: 'Create flight bookings'
    },
    {
      name: 'hotels:read',
      description: 'Read hotel information'
    },
    {
      name: 'hotels:write',
      description: 'Create hotel bookings'
    },
    {
      name: 'maps:read',
      description: 'Access maps and geocoding'
    },
    {
      name: 'mcp:call',
      description: 'Call MCP tools'
    },
    {
      name: 'agents:execute',
      description: 'Execute AI agents'
    }
  ];
  
  res.json({
    success: true,
    scopes,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
