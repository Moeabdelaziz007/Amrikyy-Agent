/**
 * Redis Cache Service
 * Provides caching functionality for API responses and data
 * 
 * Features:
 * - Flight search caching (5 minutes)
 * - Hotel search caching (1 hour)
 * - AI response caching (30 minutes)
 * - Location data caching (24 hours)
 * - User preferences caching (1 hour)
 * - Automatic expiration
 * - Cache invalidation
 * - Statistics tracking
 */

const logger = require('../../utils/logger');

class RedisCache {
  constructor() {
    this.enabled = false;
    this.client = null;
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0
    };

    // Default TTL values (in seconds)
    this.ttl = {
      flight: 300,        // 5 minutes
      hotel: 3600,        // 1 hour
      location: 86400,    // 24 hours
      ai: 1800,           // 30 minutes
      user: 3600,         // 1 hour
      default: 600        // 10 minutes
    };

    this.initialize();
  }

  /**
   * Initialize Redis connection
   */
  async initialize() {
    try {
      // Check if Redis is configured
      if (!process.env.REDIS_URL && !process.env.REDIS_HOST) {
        logger.warn('⚠️ Redis not configured - caching disabled');
        logger.info('💡 To enable caching, set REDIS_URL or REDIS_HOST in .env');
        return;
      }

      // Try to load ioredis
      let Redis;
      try {
        Redis = require('ioredis');
      } catch (error) {
        logger.warn('⚠️ ioredis not installed - caching disabled');
        logger.info('💡 Install with: npm install ioredis');
        return;
      }

      // Create Redis client
      const redisConfig = process.env.REDIS_URL || {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
        db: parseInt(process.env.REDIS_DB || '0'),
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3
      };

      this.client = new Redis(redisConfig);

      // Event handlers
      this.client.on('connect', () => {
        logger.info('✅ Redis connected successfully');
        this.enabled = true;
      });

      this.client.on('error', (error) => {
        logger.error('❌ Redis error:', error.message);
        this.stats.errors++;
        this.enabled = false;
      });

      this.client.on('close', () => {
        logger.warn('⚠️ Redis connection closed');
        this.enabled = false;
      });

      this.client.on('reconnecting', () => {
        logger.info('🔄 Redis reconnecting...');
      });

      // Test connection
      await this.client.ping();
      logger.info('🎉 Redis cache service initialized');

    } catch (error) {
      logger.error('Failed to initialize Redis:', error.message);
      this.enabled = false;
    }
  }

  /**
   * Check if cache is enabled
   */
  isEnabled() {
    return this.enabled && this.client !== null;
  }

  /**
   * Generate cache key
   */
  generateKey(prefix, data) {
    const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
    return `amrikyy:${prefix}:${dataStr}`;
  }

  /**
   * Get value from cache
   */
  async get(key) {
    if (!this.isEnabled()) return null;

    try {
      const value = await this.client.get(key);
      
      if (value) {
        this.stats.hits++;
        logger.debug(`Cache HIT: ${key}`);
        return JSON.parse(value);
      } else {
        this.stats.misses++;
        logger.debug(`Cache MISS: ${key}`);
        return null;
      }
    } catch (error) {
      logger.error(`Cache GET error for ${key}:`, error.message);
      this.stats.errors++;
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(key, value, ttl = this.ttl.default) {
    if (!this.isEnabled()) return false;

    try {
      const valueStr = JSON.stringify(value);
      await this.client.setex(key, ttl, valueStr);
      this.stats.sets++;
      logger.debug(`Cache SET: ${key} (TTL: ${ttl}s)`);
      return true;
    } catch (error) {
      logger.error(`Cache SET error for ${key}:`, error.message);
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async del(key) {
    if (!this.isEnabled()) return false;

    try {
      await this.client.del(key);
      this.stats.deletes++;
      logger.debug(`Cache DEL: ${key}`);
      return true;
    } catch (error) {
      logger.error(`Cache DEL error for ${key}:`, error.message);
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Delete keys by pattern
   */
  async delPattern(pattern) {
    if (!this.isEnabled()) return 0;

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
        this.stats.deletes += keys.length;
        logger.debug(`Cache DEL pattern: ${pattern} (${keys.length} keys)`);
        return keys.length;
      }
      return 0;
    } catch (error) {
      logger.error(`Cache DEL pattern error for ${pattern}:`, error.message);
      this.stats.errors++;
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key) {
    if (!this.isEnabled()) return false;

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Cache EXISTS error for ${key}:`, error.message);
      return false;
    }
  }

  /**
   * Get TTL for key
   */
  async ttlRemaining(key) {
    if (!this.isEnabled()) return -1;

    try {
      return await this.client.ttl(key);
    } catch (error) {
      logger.error(`Cache TTL error for ${key}:`, error.message);
      return -1;
    }
  }

  /**
   * Cache flight search results
   */
  async cacheFlightSearch(query, results) {
    const key = this.generateKey('flight', query);
    return await this.set(key, results, this.ttl.flight);
  }

  /**
   * Get cached flight search results
   */
  async getFlightSearch(query) {
    const key = this.generateKey('flight', query);
    return await this.get(key);
  }

  /**
   * Cache hotel search results
   */
  async cacheHotelSearch(query, results) {
    const key = this.generateKey('hotel', query);
    return await this.set(key, results, this.ttl.hotel);
  }

  /**
   * Get cached hotel search results
   */
  async getHotelSearch(query) {
    const key = this.generateKey('hotel', query);
    return await this.get(key);
  }

  /**
   * Cache location data
   */
  async cacheLocation(query, data) {
    const key = this.generateKey('location', query);
    return await this.set(key, data, this.ttl.location);
  }

  /**
   * Get cached location data
   */
  async getLocation(query) {
    const key = this.generateKey('location', query);
    return await this.get(key);
  }

  /**
   * Cache AI response
   */
  async cacheAIResponse(prompt, response) {
    const key = this.generateKey('ai', prompt);
    return await this.set(key, response, this.ttl.ai);
  }

  /**
   * Get cached AI response
   */
  async getAIResponse(prompt) {
    const key = this.generateKey('ai', prompt);
    return await this.get(key);
  }

  /**
   * Cache user preferences
   */
  async cacheUserPreferences(userId, preferences) {
    const key = this.generateKey('user', userId);
    return await this.set(key, preferences, this.ttl.user);
  }

  /**
   * Get cached user preferences
   */
  async getUserPreferences(userId) {
    const key = this.generateKey('user', userId);
    return await this.get(key);
  }

  /**
   * Invalidate all flight caches
   */
  async invalidateFlights() {
    return await this.delPattern('amrikyy:flight:*');
  }

  /**
   * Invalidate all hotel caches
   */
  async invalidateHotels() {
    return await this.delPattern('amrikyy:hotel:*');
  }

  /**
   * Invalidate all AI caches
   */
  async invalidateAI() {
    return await this.delPattern('amrikyy:ai:*');
  }

  /**
   * Invalidate user cache
   */
  async invalidateUser(userId) {
    const key = this.generateKey('user', userId);
    return await this.del(key);
  }

  /**
   * Clear all cache
   */
  async clearAll() {
    if (!this.isEnabled()) return false;

    try {
      await this.client.flushdb();
      logger.info('🗑️ All cache cleared');
      return true;
    } catch (error) {
      logger.error('Cache CLEAR error:', error.message);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? ((this.stats.hits / total) * 100).toFixed(2) : 0;

    return {
      enabled: this.enabled,
      hits: this.stats.hits,
      misses: this.stats.misses,
      sets: this.stats.sets,
      deletes: this.stats.deletes,
      errors: this.stats.errors,
      hitRate: `${hitRate}%`,
      total
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0
    };
    logger.info('📊 Cache statistics reset');
  }

  /**
   * Get cache info
   */
  async getInfo() {
    if (!this.isEnabled()) {
      return {
        enabled: false,
        message: 'Redis cache is not enabled'
      };
    }

    try {
      const info = await this.client.info('stats');
      const dbSize = await this.client.dbsize();
      
      return {
        enabled: true,
        dbSize,
        stats: this.getStats(),
        info: info.split('\r\n').reduce((acc, line) => {
          const [key, value] = line.split(':');
          if (key && value) acc[key] = value;
          return acc;
        }, {})
      };
    } catch (error) {
      logger.error('Cache INFO error:', error.message);
      return {
        enabled: true,
        error: error.message
      };
    }
  }

  /**
   * Close Redis connection
   */
  async close() {
    if (this.client) {
      await this.client.quit();
      logger.info('👋 Redis connection closed');
    }
  }
}

// Singleton instance
const redisCache = new RedisCache();

module.exports = redisCache;
