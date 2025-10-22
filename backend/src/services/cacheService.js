
/**
 * @fileoverview Mock Cache Service
 *
 * This service provides a mock implementation for cache operations.
 * It's intended for use during initial development and testing before
 * a real cache solution like Redis is integrated.
 */

class CacheService {
  /**
   * Simulates checking the cache's health.
   * @returns {Promise<boolean>} A promise that resolves to true, indicating the cache is "healthy".
   */
  ping() {
    return Promise.resolve(true);
  }

  /**
   * Simulates clearing the entire cache.
   * @returns {Promise<void>} A promise that resolves when the cache is "cleared".
   */
  clear() {
    console.log('Mock cache cleared.');
    return Promise.resolve();
  }

  /**
   * Simulates retrieving cache status and statistics.
   * @returns {Promise<object>} A promise that resolves with mock cache statistics.
   */
  status() {
    return Promise.resolve({
      items: 0,
      size: 0,
      hits: 0,
      misses: 0,
      lastCleared: new Date().toISOString(),
    });
  }
}

// Export a singleton instance
module.exports = new CacheService();
