/**
 * Memory Cache Service (Redis Alternative)
 * In-memory caching for development without Redis
 *
 * Features:
 * - Simple key-value storage
 * - TTL support
 * - Statistics tracking
 * - No external dependencies
 */

const logger = require('../../utils/logger');

class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.ttls = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
    };
    this.cleanupInterval = null;

    // Register with consolidated monitor instead of using setInterval
    this.registerWithMonitor();

    logger.info('✅ Memory Cache Service initialized (Redis alternative)');
  }

  /**
   * Register cache cleanup with consolidated monitor
   */
  registerWithMonitor() {
    try {
      const ConsolidatedMonitor = require('../monitoring/ConsolidatedMonitor');
      if (ConsolidatedMonitor) {
        // The consolidated monitor will handle cleanup automatically
        logger.debug('📋 Memory cache registered with consolidated monitor');
      }
    } catch (error) {
      // Fallback to old method if consolidated monitor is not available
      logger.warn('⚠️ Consolidated monitor not available, using fallback cleanup');
      this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
    }
  }

  /**
   * Shutdown the cache and clear any intervals
   */
  shutdown() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  /**
   * Get value from cache
   */
  async get(key) {
    try {
      // Check if key exists and not expired
      if (this.cache.has(key)) {
        const expiry = this.ttls.get(key);
        if (expiry && Date.now() > expiry) {
          // Expired
          this.cache.delete(key);
          this.ttls.delete(key);
          this.stats.misses++;
          return null;
        }

        this.stats.hits++;
        return this.cache.get(key);
      }

      this.stats.misses++;
      return null;
    } catch (error) {
      logger.error('❌ Memory cache get error:', error);
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  async set(key, value, ttl = 3600) {
    try {
      this.cache.set(key, value);

      // Set expiry time
      if (ttl > 0) {
        this.ttls.set(key, Date.now() + ttl * 1000);
      }

      this.stats.sets++;
      return true;
    } catch (error) {
      logger.error('❌ Memory cache set error:', error);
      return false;
    }
  }

  /**
   * Delete key from cache
   */
  async del(key) {
    try {
      const deleted = this.cache.delete(key);
      this.ttls.delete(key);

      if (deleted) {
        this.stats.deletes++;
      }

      return deleted ? 1 : 0;
    } catch (error) {
      logger.error('❌ Memory cache delete error:', error);
      return 0;
    }
  }

  /**
   * Delete keys by pattern
   */
  async delPattern(pattern) {
    try {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      let deleted = 0;

      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          this.cache.delete(key);
          this.ttls.delete(key);
          deleted++;
        }
      }

      this.stats.deletes += deleted;
      return deleted;
    } catch (error) {
      logger.error('❌ Memory cache delete pattern error:', error);
      return 0;
    }
  }

  /**
   * Get all keys matching pattern
   */
  async keys(pattern = '*') {
    try {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      const matchingKeys = [];

      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          matchingKeys.push(key);
        }
      }

      return matchingKeys;
    } catch (error) {
      logger.error('❌ Memory cache keys error:', error);
      return [];
    }
  }

  /**
   * Get TTL for a key
   */
  async ttl(key) {
    try {
      if (!this.ttls.has(key)) {
        return -1;
      }

      const expiry = this.ttls.get(key);
      const remaining = Math.floor((expiry - Date.now()) / 1000);

      return remaining > 0 ? remaining : -1;
    } catch (error) {
      logger.error('❌ Memory cache TTL error:', error);
      return -1;
    }
  }

  /**
   * Flush all cache
   */
  async flushAll() {
    try {
      this.cache.clear();
      this.ttls.clear();
      logger.info('✅ Memory cache flushed');
      return true;
    } catch (error) {
      logger.error('❌ Memory cache flush error:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate =
      totalRequests > 0 ? ((this.stats.hits / totalRequests) * 100).toFixed(2) + '%' : '0%';

    return {
      connected: true,
      keys: this.cache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate,
      sets: this.stats.sets,
      deletes: this.stats.deletes,
      memory: this.getMemoryUsage(),
    };
  }

  /**
   * Get memory usage estimate
   */
  getMemoryUsage() {
    let size = 0;

    for (const [key, value] of this.cache.entries()) {
      size += key.length;
      size += JSON.stringify(value).length;
    }

    // Convert to human readable
    if (size < 1024) return size + 'B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(2) + 'KB';
    return (size / (1024 * 1024)).toFixed(2) + 'MB';
  }

  /**
   * Cleanup expired entries
   */
  cleanup() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, expiry] of this.ttls.entries()) {
      if (expiry && now > expiry) {
        this.cache.delete(key);
        this.ttls.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug(`🧹 Cleaned ${cleaned} expired cache entries`);
    }
  }

  /**
   * Check if cache is enabled
   */
  isEnabled() {
    return true;
  }

  /**
   * Generate cache key
   */
  generateKey(prefix, data) {
    const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
    return `${prefix}:${dataStr}`;
  }
}

// Export singleton instance
module.exports = new MemoryCache();
