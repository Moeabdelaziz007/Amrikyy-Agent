/**
 * Cache Management Routes
 * Endpoints for managing Redis cache
 */

const express = require('express');
const router = express.Router();
const redisCache = require('../src/cache/RedisCache');
const logger = require('../utils/logger');

/**
 * GET /api/cache/stats
 * Get cache statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = redisCache.getStats();
    
    res.json({
      success: true,
      stats,
      enabled: redisCache.isEnabled(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Cache stats error', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to get cache stats',
      message: error.message
    });
  }
});

/**
 * DELETE /api/cache/clear
 * Clear all cache or specific pattern
 */
router.delete('/clear', async (req, res) => {
  try {
    if (!redisCache.isEnabled()) {
      return res.status(503).json({
        success: false,
        error: 'Cache service not enabled'
      });
    }

    const { pattern } = req.query;
    
    let result;
    if (pattern) {
      result = await redisCache.delPattern(pattern);
      logger.info(`🗑️ Cache cleared for pattern: ${pattern}`);
    } else {
      result = await redisCache.flushAll();
      logger.info('🗑️ All cache cleared');
    }
    
    res.json({
      success: true,
      message: pattern ? `Cache cleared for pattern: ${pattern}` : 'All cache cleared',
      keysDeleted: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Cache clear error', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache',
      message: error.message
    });
  }
});

/**
 * GET /api/cache/keys
 * List all cache keys (with optional pattern)
 */
router.get('/keys', async (req, res) => {
  try {
    if (!redisCache.isEnabled()) {
      return res.status(503).json({
        success: false,
        error: 'Cache service not enabled'
      });
    }

    const { pattern = '*', limit = 100 } = req.query;
    
    const keys = await redisCache.keys(pattern);
    const limitedKeys = keys.slice(0, parseInt(limit));
    
    res.json({
      success: true,
      keys: limitedKeys,
      count: limitedKeys.length,
      total: keys.length,
      pattern,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Cache keys error', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to get cache keys',
      message: error.message
    });
  }
});

/**
 * GET /api/cache/key/:key
 * Get specific cache entry
 */
router.get('/key/:key', async (req, res) => {
  try {
    if (!redisCache.isEnabled()) {
      return res.status(503).json({
        success: false,
        error: 'Cache service not enabled'
      });
    }

    const { key } = req.params;
    
    const value = await redisCache.get(key);
    
    if (value === null) {
      return res.status(404).json({
        success: false,
        error: 'Cache key not found'
      });
    }
    
    const ttl = await redisCache.ttl(key);
    
    res.json({
      success: true,
      key,
      value,
      ttl,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Cache get error', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to get cache entry',
      message: error.message
    });
  }
});

/**
 * DELETE /api/cache/key/:key
 * Delete specific cache entry
 */
router.delete('/key/:key', async (req, res) => {
  try {
    if (!redisCache.isEnabled()) {
      return res.status(503).json({
        success: false,
        error: 'Cache service not enabled'
      });
    }

    const { key } = req.params;
    
    const result = await redisCache.del(key);
    
    if (result === 0) {
      return res.status(404).json({
        success: false,
        error: 'Cache key not found'
      });
    }
    
    logger.info(`🗑️ Cache key deleted: ${key}`);
    
    res.json({
      success: true,
      message: `Cache key deleted: ${key}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Cache delete error', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to delete cache entry',
      message: error.message
    });
  }
});

/**
 * GET /api/cache/health
 * Check cache service health
 */
router.get('/health', async (req, res) => {
  try {
    const isEnabled = redisCache.isEnabled();
    
    res.json({
      success: true,
      service: 'Redis Cache',
      status: isEnabled ? 'healthy' : 'disabled',
      enabled: isEnabled,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      service: 'Redis Cache',
      status: 'error',
      error: error.message
    });
  }
});

module.exports = router;
