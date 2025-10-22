/**
 * Agent Cache Manager - Advanced caching for AI agents
 * Optimizes performance and reduces API costs
 *
 * Features:
 * - Redis caching with automatic fallback
 * - Semantic cache matching for similar queries
 * - Cache statistics and monitoring
 * - Smart TTL management
 * - Cache warming and preloading
 *
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-23
 */

const redisCache = require('../cache/RedisCache');
const logger = require('./logger');
const crypto = require('crypto');

class AgentCacheManager {
  constructor(agentName) {
    this.agentName = agentName;

    // Cache configuration per agent type
    this.ttlConfig = {
      travel_agency_agent: {
        flight_search: 300, // 5 minutes
        hotel_search: 3600, // 1 hour
        itinerary_planning: 1800, // 30 minutes
        destination_recommendations: 86400, // 24 hours
        visa_requirements: 604800, // 1 week
        complete_package: 1800, // 30 minutes
      },
      content_creator_agent: {
        blog_post: 3600, // 1 hour
        social_posts: 1800, // 30 minutes
        video_script: 3600, // 1 hour
        content_calendar: 86400, // 24 hours
        research: 7200, // 2 hours
      },
      innovation_agent: {
        idea_generation: 7200, // 2 hours
        trend_analysis: 86400, // 24 hours
        competitive_analysis: 43200, // 12 hours
        idea_validation: 3600, // 1 hour
        business_model_canvas: 7200, // 2 hours
      },
      default: 1800, // 30 minutes default
    };

    // Cache statistics
    this.stats = {
      hits: 0,
      misses: 0,
      writes: 0,
      errors: 0,
      semanticMatches: 0,
    };
  }

  /**
   * Get cache key for agent operation
   */
  getCacheKey(operation, params) {
    const paramsString = JSON.stringify(params, Object.keys(params).sort());
    const hash = crypto.createHash('sha256').update(paramsString).digest('hex').substring(0, 16);

    return `agent:${this.agentName}:${operation}:${hash}`;
  }

  /**
   * Get cached response
   */
  async get(operation, params) {
    try {
      const cacheKey = this.getCacheKey(operation, params);
      const cached = await redisCache.get(cacheKey);

      if (cached) {
        this.stats.hits++;
        logger.debug(`${this.agentName}: Cache HIT for ${operation}`);

        return {
          success: true,
          data: typeof cached === 'string' ? JSON.parse(cached) : cached,
          cached: true,
          cacheKey,
        };
      }

      this.stats.misses++;
      logger.debug(`${this.agentName}: Cache MISS for ${operation}`);

      return null;
    } catch (error) {
      this.stats.errors++;
      logger.error(`${this.agentName}: Cache get error:`, error);
      return null;
    }
  }

  /**
   * Set cached response
   */
  async set(operation, params, data) {
    try {
      const cacheKey = this.getCacheKey(operation, params);
      const ttl = this.getTTL(operation);

      await redisCache.set(cacheKey, JSON.stringify(data), ttl);

      this.stats.writes++;
      logger.debug(`${this.agentName}: Cached ${operation} for ${ttl}s`);

      // Store metadata for semantic matching
      await this.storeMetadata(operation, params, cacheKey, ttl);

      return true;
    } catch (error) {
      this.stats.errors++;
      logger.error(`${this.agentName}: Cache set error:`, error);
      return false;
    }
  }

  /**
   * Get TTL for operation
   */
  getTTL(operation) {
    const agentConfig = this.ttlConfig[this.agentName] || this.ttlConfig.default;
    return agentConfig[operation] || this.ttlConfig.default;
  }

  /**
   * Store metadata for semantic matching
   */
  async storeMetadata(operation, params, cacheKey, ttl) {
    try {
      const metadataKey = `agent:${this.agentName}:metadata:${operation}`;

      // Get existing metadata
      let metadata = await redisCache.get(metadataKey);
      metadata = metadata ? JSON.parse(metadata) : [];

      // Add new entry
      metadata.push({
        params,
        cacheKey,
        timestamp: Date.now(),
        ttl,
      });

      // Keep only last 100 entries per operation
      if (metadata.length > 100) {
        metadata = metadata.slice(-100);
      }

      // Store metadata with longer TTL
      await redisCache.set(
        metadataKey,
        JSON.stringify(metadata),
        ttl * 2 // Metadata lives twice as long
      );
    } catch (error) {
      logger.error(`${this.agentName}: Metadata storage error:`, error);
    }
  }

  /**
   * Find semantically similar cached responses
   */
  async findSemantic(operation, params, similarity = 0.8) {
    try {
      const metadataKey = `agent:${this.agentName}:metadata:${operation}`;
      const metadata = await redisCache.get(metadataKey);

      if (!metadata) {
        return null;
      }

      const entries = JSON.parse(metadata);

      // Find similar entries
      for (const entry of entries.reverse()) {
        const score = this.calculateSimilarity(params, entry.params);

        if (score >= similarity) {
          // Check if cache entry still exists
          const cached = await redisCache.get(entry.cacheKey);

          if (cached) {
            this.stats.semanticMatches++;
            logger.debug(
              `${this.agentName}: Semantic match found with ${(score * 100).toFixed(1)}% similarity`
            );

            return {
              success: true,
              data: typeof cached === 'string' ? JSON.parse(cached) : cached,
              cached: true,
              semantic: true,
              similarity: score,
              cacheKey: entry.cacheKey,
            };
          }
        }
      }

      return null;
    } catch (error) {
      logger.error(`${this.agentName}: Semantic search error:`, error);
      return null;
    }
  }

  /**
   * Calculate similarity between parameter sets
   */
  calculateSimilarity(params1, params2) {
    const keys1 = Object.keys(params1);
    const keys2 = Object.keys(params2);

    // Check key overlap
    const allKeys = new Set([...keys1, ...keys2]);
    const commonKeys = keys1.filter((k) => keys2.includes(k));
    const keyScore = commonKeys.length / allKeys.size;

    if (keyScore < 0.5) {
      return 0;
    }

    // Check value similarity for common keys
    let matchingValues = 0;
    const totalValues = commonKeys.length;

    for (const key of commonKeys) {
      const val1 = params1[key];
      const val2 = params2[key];

      // Exact match
      if (val1 === val2) {
        matchingValues++;
        continue;
      }

      // String similarity
      if (typeof val1 === 'string' && typeof val2 === 'string') {
        const stringSimilarity = this.calculateStringSimilarity(val1, val2);
        matchingValues += stringSimilarity;
        continue;
      }

      // Array similarity
      if (Array.isArray(val1) && Array.isArray(val2)) {
        const arrayOverlap = val1.filter((v) => val2.includes(v)).length;
        matchingValues += arrayOverlap / Math.max(val1.length, val2.length);
        continue;
      }
    }

    const valueScore = matchingValues / totalValues;

    // Combined score (70% values, 30% keys)
    return valueScore * 0.7 + keyScore * 0.3;
  }

  /**
   * Calculate string similarity (Levenshtein distance)
   */
  calculateStringSimilarity(str1, str2) {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();

    if (s1 === s2) {
      return 1;
    }

    const len1 = s1.length;
    const len2 = s2.length;

    if (len1 === 0 || len2 === 0) {
      return 0;
    }

    // Levenshtein distance
    const matrix = Array(len2 + 1)
      .fill(null)
      .map(() => Array(len1 + 1).fill(null));

    for (let i = 0; i <= len1; i++) {
      matrix[0][i] = i;
    }
    for (let j = 0; j <= len2; j++) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= len2; j++) {
      for (let i = 1; i <= len1; i++) {
        const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    const distance = matrix[len2][len1];
    const maxLen = Math.max(len1, len2);

    return 1 - distance / maxLen;
  }

  /**
   * Invalidate cache for operation
   */
  async invalidate(operation, params = null) {
    try {
      if (params) {
        // Invalidate specific entry
        const cacheKey = this.getCacheKey(operation, params);
        await redisCache.del(cacheKey);
        logger.debug(`${this.agentName}: Invalidated cache for ${operation}`);
      } else {
        // Invalidate all entries for operation
        // Note: This would require SCAN in Redis - pattern: agent:${agentName}:${operation}:*
        logger.warn(`${this.agentName}: Bulk invalidation not yet implemented`);
      }

      return true;
    } catch (error) {
      logger.error(`${this.agentName}: Cache invalidation error:`, error);
      return false;
    }
  }

  /**
   * Warm cache with common queries
   */
  async warmCache(operation, commonParams = []) {
    logger.info(`${this.agentName}: Warming cache for ${operation}...`);

    let warmed = 0;

    for (const params of commonParams) {
      try {
        // Check if already cached
        const cached = await this.get(operation, params);

        if (!cached) {
          // Cache needs warming - this would trigger actual agent call
          logger.debug(`${this.agentName}: Cache warming needed for`, params);
          warmed++;
        }
      } catch (error) {
        logger.error(`${this.agentName}: Cache warming error:`, error);
      }
    }

    logger.info(`${this.agentName}: Cache warming complete. ${warmed} entries needed refresh.`);
    return warmed;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? ((this.stats.hits / total) * 100).toFixed(2) : 0;

    return {
      ...this.stats,
      total,
      hitRate: `${hitRate}%`,
      semanticMatchRate:
        total > 0 ? ((this.stats.semanticMatches / total) * 100).toFixed(2) + '%' : '0%',
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      hits: 0,
      misses: 0,
      writes: 0,
      errors: 0,
      semanticMatches: 0,
    };

    logger.info(`${this.agentName}: Cache statistics reset`);
  }

  /**
   * Get cache health
   */
  async getHealth() {
    try {
      const health = {
        agent: this.agentName,
        redisAvailable: await redisCache.isAvailable(),
        stats: this.getStats(),
        ttlConfig: this.ttlConfig[this.agentName] || this.ttlConfig.default,
      };

      return health;
    } catch (error) {
      return {
        agent: this.agentName,
        healthy: false,
        error: error.message,
      };
    }
  }
}

module.exports = AgentCacheManager;
