/**
 * Intelligent Caching Service
 * Advanced caching with automatic invalidation and performance optimization
 *
 * Features:
 * - Multi-level caching (memory + Redis)
 * - Automatic cache invalidation
 * - Cache warming strategies
 * - Performance metrics
 * - Smart cache key generation
 */

const { logger } = require('../utils/logger');
const crypto = require('crypto');

class IntelligentCache {
  constructor(config = {}) {
    this.config = {
      defaultTTL: config.defaultTTL || 3600, // 1 hour
      maxMemorySize: config.maxMemorySize || 100 * 1024 * 1024, // 100MB
      enableRedis: config.enableRedis || false,
      enableMetrics: config.enableMetrics !== false,
      cacheWarming: config.cacheWarming || false,
      ...config,
    };

    this.memoryCache = new Map();
    this.cacheMetadata = new Map();
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      invalidations: 0,
      memoryUsage: 0,
    };

    this.invalidationPatterns = new Map();
    this.cacheWarmingStrategies = new Map();

    this.initializeRedis();
    this.setupCacheWarming();

    logger.info('✅ Intelligent Cache Service initialized');
  }

  /**
   * Initialize Redis connection if enabled
   */
  async initializeRedis() {
    if (this.config.enableRedis) {
      try {
        const Redis = require('ioredis');
        this.redis = new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: process.env.REDIS_PORT || 6379,
          password: process.env.REDIS_PASSWORD,
          retryDelayOnFailover: 100,
          maxRetriesPerRequest: 3,
        });

        this.redis.on('error', (error) => {
          logger.error('❌ Redis connection error:', error);
          this.redis = null;
        });

        logger.info('✅ Redis connection established');
      } catch (error) {
        logger.warn('⚠️ Redis not available, using memory-only cache');
        this.redis = null;
      }
    }
  }

  /**
   * Setup cache warming strategies
   */
  setupCacheWarming() {
    if (this.config.cacheWarming) {
      // Register common cache warming strategies
      this.registerWarmingStrategy('user_profile', this.warmUserProfiles.bind(this));
      this.registerWarmingStrategy('destinations', this.warmDestinations.bind(this));
      this.registerWarmingStrategy('pricing', this.warmPricingData.bind(this));
    }
  }

  /**
   * Generate intelligent cache key
   */
  generateKey(prefix, data, options = {}) {
    const { includeVersion = true, includeUser = false, customHash } = options;

    let keyParts = [prefix];

    if (includeVersion) {
      keyParts.push('v1');
    }

    if (includeUser && data.userId) {
      keyParts.push(`user:${data.userId}`);
    }

    if (customHash) {
      keyParts.push(customHash);
    } else {
      // Generate hash from data
      const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
      const hash = crypto.createHash('md5').update(dataStr).digest('hex').substring(0, 8);
      keyParts.push(hash);
    }

    return keyParts.join(':');
  }

  /**
   * Get value from cache with intelligent fallback
   */
  async get(key, options = {}) {
    const { fallbackFn, ttl = this.config.defaultTTL, tags = [] } = options;

    try {
      // Try memory cache first
      let value = await this.getFromMemory(key);

      if (value !== null) {
        this.metrics.hits++;
        logger.debug(`✅ Cache hit (memory): ${key}`);
        return value;
      }

      // Try Redis cache if available
      if (this.redis) {
        value = await this.getFromRedis(key);

        if (value !== null) {
          // Store in memory cache for faster access
          await this.setInMemory(key, value, ttl, tags);
          this.metrics.hits++;
          logger.debug(`✅ Cache hit (Redis): ${key}`);
          return value;
        }
      }

      // Cache miss - try fallback function
      if (fallbackFn) {
        logger.debug(`🔄 Cache miss, executing fallback: ${key}`);
        value = await fallbackFn();

        if (value !== null && value !== undefined) {
          await this.set(key, value, { ttl, tags });
        }

        return value;
      }

      this.metrics.misses++;
      logger.debug(`❌ Cache miss: ${key}`);
      return null;
    } catch (error) {
      logger.error(`❌ Cache get error for key ${key}:`, error);
      this.metrics.misses++;
      return null;
    }
  }

  /**
   * Set value in cache with intelligent distribution
   */
  async set(key, value, options = {}) {
    const { ttl = this.config.defaultTTL, tags = [], priority = 'normal' } = options;

    try {
      // Store in memory cache
      await this.setInMemory(key, value, ttl, tags);

      // Store in Redis if available and priority is high
      if (this.redis && (priority === 'high' || priority === 'critical')) {
        await this.setInRedis(key, value, ttl);
      }

      this.metrics.sets++;
      logger.debug(`✅ Cache set: ${key}`);

      return true;
    } catch (error) {
      logger.error(`❌ Cache set error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get from memory cache
   */
  async getFromMemory(key) {
    const metadata = this.cacheMetadata.get(key);

    if (!metadata) {
      return null;
    }

    // Check if expired
    if (metadata.expiry && Date.now() > metadata.expiry) {
      this.memoryCache.delete(key);
      this.cacheMetadata.delete(key);
      return null;
    }

    return this.memoryCache.get(key);
  }

  /**
   * Set in memory cache
   */
  async setInMemory(key, value, ttl, tags) {
    // Check memory limit
    if (this.getMemoryUsage() > this.config.maxMemorySize) {
      await this.evictLeastRecentlyUsed();
    }

    this.memoryCache.set(key, value);
    this.cacheMetadata.set(key, {
      expiry: ttl > 0 ? Date.now() + ttl * 1000 : null,
      tags,
      lastAccessed: Date.now(),
      size: this.calculateValueSize(value),
    });

    this.updateMemoryUsage();
  }

  /**
   * Get from Redis cache
   */
  async getFromRedis(key) {
    if (!this.redis) return null;

    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`❌ Redis get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set in Redis cache
   */
  async setInRedis(key, value, ttl) {
    if (!this.redis) return false;

    try {
      const serialized = JSON.stringify(value);
      await this.redis.setex(key, ttl, serialized);
      return true;
    } catch (error) {
      logger.error(`❌ Redis set error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Invalidate cache by pattern or tags
   */
  async invalidate(pattern, options = {}) {
    const { tags = [], cascade = false } = options;

    try {
      let invalidated = 0;

      // Invalidate by pattern
      if (pattern) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));

        for (const key of this.memoryCache.keys()) {
          if (regex.test(key)) {
            this.memoryCache.delete(key);
            this.cacheMetadata.delete(key);
            invalidated++;
          }
        }

        // Invalidate in Redis
        if (this.redis) {
          const keys = await this.redis.keys(pattern);
          if (keys.length > 0) {
            await this.redis.del(...keys);
            invalidated += keys.length;
          }
        }
      }

      // Invalidate by tags
      if (tags.length > 0) {
        for (const [key, metadata] of this.cacheMetadata.entries()) {
          if (tags.some((tag) => metadata.tags.includes(tag))) {
            this.memoryCache.delete(key);
            this.cacheMetadata.delete(key);
            invalidated++;
          }
        }
      }

      this.metrics.invalidations += invalidated;
      logger.info(`🗑️ Invalidated ${invalidated} cache entries`);

      return invalidated;
    } catch (error) {
      logger.error(`❌ Cache invalidation error:`, error);
      return 0;
    }
  }

  /**
   * Register cache warming strategy
   */
  registerWarmingStrategy(name, strategyFn) {
    this.cacheWarmingStrategies.set(name, strategyFn);
    logger.info(`📋 Registered cache warming strategy: ${name}`);
  }

  /**
   * Execute cache warming
   */
  async warmCache(strategyName, params = {}) {
    const strategy = this.cacheWarmingStrategies.get(strategyName);

    if (!strategy) {
      logger.warn(`⚠️ Cache warming strategy not found: ${strategyName}`);
      return false;
    }

    try {
      logger.info(`🔥 Warming cache with strategy: ${strategyName}`);
      await strategy(params);
      logger.info(`✅ Cache warming completed: ${strategyName}`);
      return true;
    } catch (error) {
      logger.error(`❌ Cache warming failed for ${strategyName}:`, error);
      return false;
    }
  }

  // Cache warming strategies

  /**
   * Warm user profiles cache
   */
  async warmUserProfiles(params = {}) {
    const { userIds = [], limit = 100 } = params;

    // This would integrate with your user service
    logger.debug('🔥 Warming user profiles cache');

    // Example implementation:
    // const users = await userService.getUsers({ limit });
    // for (const user of users) {
    //   await this.set(`user:${user.id}`, user, { ttl: 3600, tags: ['user', 'profile'] });
    // }
  }

  /**
   * Warm destinations cache
   */
  async warmDestinations(params = {}) {
    const { popular = true, limit = 50 } = params;

    logger.debug('🔥 Warming destinations cache');

    // This would integrate with your destinations service
    // const destinations = await destinationService.getPopularDestinations({ limit });
    // for (const dest of destinations) {
    //   await this.set(`destination:${dest.id}`, dest, { ttl: 7200, tags: ['destination', 'popular'] });
    // }
  }

  /**
   * Warm pricing data cache
   */
  async warmPricingData(params = {}) {
    const { routes = [], limit = 100 } = params;

    logger.debug('🔥 Warming pricing data cache');

    // This would integrate with your pricing service
    // for (const route of routes) {
    //   const prices = await pricingService.getPrices(route);
    //   await this.set(`pricing:${route.from}:${route.to}`, prices, { ttl: 1800, tags: ['pricing', 'route'] });
    // }
  }

  /**
   * Evict least recently used items
   */
  async evictLeastRecentlyUsed() {
    const entries = Array.from(this.cacheMetadata.entries()).sort(
      (a, b) => a[1].lastAccessed - b[1].lastAccessed
    );

    const toEvict = Math.floor(entries.length * 0.1); // Evict 10%

    for (let i = 0; i < toEvict; i++) {
      const [key] = entries[i];
      this.memoryCache.delete(key);
      this.cacheMetadata.delete(key);
    }

    logger.debug(`🧹 Evicted ${toEvict} LRU cache entries`);
  }

  /**
   * Calculate value size in bytes
   */
  calculateValueSize(value) {
    return Buffer.byteLength(JSON.stringify(value), 'utf8');
  }

  /**
   * Get current memory usage
   */
  getMemoryUsage() {
    let totalSize = 0;

    for (const [key, metadata] of this.cacheMetadata.entries()) {
      totalSize += key.length + metadata.size;
    }

    return totalSize;
  }

  /**
   * Update memory usage metrics
   */
  updateMemoryUsage() {
    this.metrics.memoryUsage = this.getMemoryUsage();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const totalRequests = this.metrics.hits + this.metrics.misses;
    const hitRate =
      totalRequests > 0 ? ((this.metrics.hits / totalRequests) * 100).toFixed(2) + '%' : '0%';

    return {
      ...this.metrics,
      hitRate,
      memoryUsage: this.formatBytes(this.metrics.memoryUsage),
      maxMemorySize: this.formatBytes(this.config.maxMemorySize),
      entries: this.memoryCache.size,
      redisConnected: !!this.redis,
      warmingStrategies: Array.from(this.cacheWarmingStrategies.keys()),
    };
  }

  /**
   * Format bytes to human readable
   */
  formatBytes(bytes) {
    if (bytes < 1024) return bytes + 'B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + 'KB';
    return (bytes / (1024 * 1024)).toFixed(2) + 'MB';
  }

  /**
   * Clear all cache
   */
  async clear() {
    this.memoryCache.clear();
    this.cacheMetadata.clear();

    if (this.redis) {
      await this.redis.flushdb();
    }

    logger.info('🗑️ All cache cleared');
  }
}

// Export singleton instance
module.exports = new IntelligentCache();
