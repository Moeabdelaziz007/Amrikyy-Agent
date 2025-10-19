/**
 * Intelligent Cache Service
 * Multi-level caching system with Redis and memory
 */

const { logger } = require('../utils/logger');

class IntelligentCache {
  constructor() {
    this.memoryCache = new Map();
    this.redisClient = null;
    this.isRedisAvailable = false;
    this.defaultTTL = 300; // 5 minutes
  }

  async initialize() {
    try {
      // Try to connect to Redis if available
      if (process.env.REDIS_URL) {
        const Redis = require('ioredis');
        this.redisClient = new Redis(process.env.REDIS_URL);
        this.isRedisAvailable = true;
        logger.info('✅ Redis cache connected');
      } else {
        logger.warn('⚠️ Redis not configured - using memory cache only');
      }
    } catch (error) {
      logger.warn('⚠️ Redis connection failed - using memory cache only:', error.message);
      this.isRedisAvailable = false;
    }

    logger.info('✅ Intelligent Cache Service initialized');
  }

  async get(key) {
    try {
      // Try Redis first if available
      if (this.isRedisAvailable && this.redisClient) {
        const value = await this.redisClient.get(key);
        if (value) {
          return JSON.parse(value);
        }
      }

      // Fallback to memory cache
      const value = this.memoryCache.get(key);
      if (value && value.expires > Date.now()) {
        return value.data;
      } else if (value) {
        this.memoryCache.delete(key);
      }

      return null;
    } catch (error) {
      logger.error('❌ Cache get error:', error.message);
      return null;
    }
  }

  async set(key, value, ttl = this.defaultTTL) {
    try {
      const expires = Date.now() + ttl * 1000;

      // Set in Redis if available
      if (this.isRedisAvailable && this.redisClient) {
        await this.redisClient.setex(key, ttl, JSON.stringify(value));
      }

      // Also set in memory cache
      this.memoryCache.set(key, {
        data: value,
        expires: expires,
      });

      return true;
    } catch (error) {
      logger.error('❌ Cache set error:', error.message);
      return false;
    }
  }

  async delete(key) {
    try {
      // Delete from Redis if available
      if (this.isRedisAvailable && this.redisClient) {
        await this.redisClient.del(key);
      }

      // Delete from memory cache
      this.memoryCache.delete(key);

      return true;
    } catch (error) {
      logger.error('❌ Cache delete error:', error.message);
      return false;
    }
  }

  async clear() {
    try {
      // Clear Redis if available
      if (this.isRedisAvailable && this.redisClient) {
        await this.redisClient.flushdb();
      }

      // Clear memory cache
      this.memoryCache.clear();

      return true;
    } catch (error) {
      logger.error('❌ Cache clear error:', error.message);
      return false;
    }
  }

  getStats() {
    return {
      memoryCacheSize: this.memoryCache.size,
      redisAvailable: this.isRedisAvailable,
      defaultTTL: this.defaultTTL,
    };
  }
}

// Singleton instance
const intelligentCache = new IntelligentCache();

module.exports = intelligentCache;
