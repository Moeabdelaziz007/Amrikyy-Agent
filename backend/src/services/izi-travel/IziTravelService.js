/**
 * izi.TRAVEL API Service
 * Integration with izi.TRAVEL Directory for tours, attractions, and museums
 * API Documentation: https://api-docs.izi.travel/#overview
 */

const axios = require('axios');
const logger = require('../../utils/logger');
const redisService = require('../redis-service');

class IziTravelService {
  constructor() {
    this.baseURL = 'https://api.izi.travel';
    this.apiVersion = '1.6'; // Using latest API version
    this.cachePrefix = 'izi:';
    this.cacheTTL = 3600; // 1 hour
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'X-IZI-API-Version': this.apiVersion
      }
    });
  }

  /**
   * Search for content (tours, museums, attractions)
   */
  async search(params) {
    try {
      const {
        query = '',
        lat,
        lon,
        radius = 10000, // 10km default
        languages = 'en,ar',
        type = 'tour,museum', // tour, museum, tourist_attraction, collection
        limit = 20,
        offset = 0,
        form = 'compact', // compact, short, full
        sort_by = 'distance', // distance, popularity, rating
        includes = 'city,country,publisher'
      } = params;

      const cacheKey = `${this.cachePrefix}search:${JSON.stringify(params)}`;
      
      // Check cache
      if (redisService.isConnected) {
        const cached = await redisService.get(cacheKey);
        if (cached) {
          logger.info('✅ izi.TRAVEL search cache hit');
          return cached;
        }
      }

      // Build query parameters
      const queryParams = {
        languages,
        type,
        limit,
        offset,
        form,
        includes
      };

      // Add search query if provided
      if (query) {
        queryParams.query = query;
      }

      // Add geo search if coordinates provided
      if (lat && lon) {
        queryParams.lat_lon = `${lat};${lon}`;
        queryParams.radius = radius;
        queryParams.sort_by = sort_by;
      }

      const response = await this.client.get('/mtg/objects/search', {
        params: queryParams
      });

      const data = response.data;

      // Cache results
      if (redisService.isConnected && data) {
        await redisService.set(cacheKey, data, this.cacheTTL);
      }

      logger.info(`✅ Found ${data.length || 0} izi.TRAVEL objects`);
      return data;
    } catch (error) {
      logger.error('izi.TRAVEL search error:', error.message);
      throw this.handleError(error);
    }
  }

  /**
   * Get detailed information about a specific object (tour, museum, attraction)
   */
  async getObject(uuid, params = {}) {
    try {
      const {
        form = 'full',
        languages = 'en,ar',
        includes = 'children,reviews,city,country,publisher'
      } = params;

      const cacheKey = `${this.cachePrefix}object:${uuid}:${form}`;
      
      // Check cache
      if (redisService.isConnected) {
        const cached = await redisService.get(cacheKey);
        if (cached) {
          logger.info(`✅ izi.TRAVEL object cache hit: ${uuid}`);
          return cached;
        }
      }

      const response = await this.client.get(`/mtg/objects/${uuid}`, {
        params: {
          form,
          languages,
          includes
        }
      });

      const data = response.data;

      // Cache result
      if (redisService.isConnected && data) {
        await redisService.set(cacheKey, data, this.cacheTTL);
      }

      logger.info(`✅ Retrieved izi.TRAVEL object: ${uuid}`);
      return data;
    } catch (error) {
      logger.error(`izi.TRAVEL object retrieval error (${uuid}):`, error.message);
      throw this.handleError(error);
    }
  }

  /**
   * Get tours near a location
   */
  async getToursNearby(lat, lon, options = {}) {
    return this.search({
      lat,
      lon,
      type: 'tour',
      radius: options.radius || 10000,
      languages: options.languages || 'en,ar',
      limit: options.limit || 20,
      form: options.form || 'compact',
      sort_by: 'distance'
    });
  }

  /**
   * Get museums near a location
   */
  async getMuseumsNearby(lat, lon, options = {}) {
    return this.search({
      lat,
      lon,
      type: 'museum',
      radius: options.radius || 10000,
      languages: options.languages || 'en,ar',
      limit: options.limit || 20,
      form: options.form || 'compact',
      sort_by: 'distance'
    });
  }

  /**
   * Get tourist attractions near a location
   */
  async getAttractionsNearby(lat, lon, options = {}) {
    return this.search({
      lat,
      lon,
      type: 'tourist_attraction',
      radius: options.radius || 10000,
      languages: options.languages || 'en,ar',
      limit: options.limit || 20,
      form: options.form || 'compact',
      sort_by: 'distance'
    });
  }

  /**
   * Get cities with content
   */
  async getCities(params = {}) {
    try {
      const {
        languages = 'en,ar',
        form = 'compact',
        limit = 100
      } = params;

      const cacheKey = `${this.cachePrefix}cities:${languages}`;
      
      if (redisService.isConnected) {
        const cached = await redisService.get(cacheKey);
        if (cached) {
          logger.info('✅ izi.TRAVEL cities cache hit');
          return cached;
        }
      }

      const response = await this.client.get('/cities', {
        params: {
          languages,
          form,
          limit
        }
      });

      const data = response.data;

      if (redisService.isConnected && data) {
        await redisService.set(cacheKey, data, this.cacheTTL * 24); // Cache for 24 hours
      }

      logger.info(`✅ Retrieved ${data.length || 0} izi.TRAVEL cities`);
      return data;
    } catch (error) {
      logger.error('izi.TRAVEL cities error:', error.message);
      throw this.handleError(error);
    }
  }

  /**
   * Get countries with content
   */
  async getCountries(params = {}) {
    try {
      const {
        languages = 'en,ar',
        form = 'compact'
      } = params;

      const cacheKey = `${this.cachePrefix}countries:${languages}`;
      
      if (redisService.isConnected) {
        const cached = await redisService.get(cacheKey);
        if (cached) {
          logger.info('✅ izi.TRAVEL countries cache hit');
          return cached;
        }
      }

      const response = await this.client.get('/countries', {
        params: {
          languages,
          form
        }
      });

      const data = response.data;

      if (redisService.isConnected && data) {
        await redisService.set(cacheKey, data, this.cacheTTL * 24); // Cache for 24 hours
      }

      logger.info(`✅ Retrieved ${data.length || 0} izi.TRAVEL countries`);
      return data;
    } catch (error) {
      logger.error('izi.TRAVEL countries error:', error.message);
      throw this.handleError(error);
    }
  }

  /**
   * Get featured content for mobile apps
   */
  async getFeaturedContent(languages = 'en,ar') {
    try {
      const cacheKey = `${this.cachePrefix}featured:${languages}`;
      
      if (redisService.isConnected) {
        const cached = await redisService.get(cacheKey);
        if (cached) {
          logger.info('✅ izi.TRAVEL featured cache hit');
          return cached;
        }
      }

      const response = await this.client.get('/featured/mobile', {
        params: { languages }
      });

      const data = response.data;

      if (redisService.isConnected && data) {
        await redisService.set(cacheKey, data, this.cacheTTL * 6); // Cache for 6 hours
      }

      logger.info('✅ Retrieved izi.TRAVEL featured content');
      return data;
    } catch (error) {
      logger.error('izi.TRAVEL featured content error:', error.message);
      throw this.handleError(error);
    }
  }

  /**
   * Get reviews for an object
   */
  async getReviews(uuid, params = {}) {
    try {
      const {
        languages = 'en,ar',
        limit = 20,
        offset = 0
      } = params;

      const response = await this.client.get(`/mtgobjects/${uuid}/reviews`, {
        params: {
          languages,
          limit,
          offset
        }
      });

      logger.info(`✅ Retrieved reviews for ${uuid}`);
      return response.data;
    } catch (error) {
      logger.error(`izi.TRAVEL reviews error (${uuid}):`, error.message);
      throw this.handleError(error);
    }
  }

  /**
   * Get children of an object (e.g., exhibits in a museum)
   */
  async getChildren(uuid, params = {}) {
    try {
      const {
        languages = 'en,ar',
        form = 'compact',
        limit = 50,
        offset = 0
      } = params;

      const response = await this.client.get(`/mtgobjects/${uuid}/children`, {
        params: {
          languages,
          form,
          limit,
          offset
        }
      });

      logger.info(`✅ Retrieved children for ${uuid}`);
      return response.data;
    } catch (error) {
      logger.error(`izi.TRAVEL children error (${uuid}):`, error.message);
      throw this.handleError(error);
    }
  }

  /**
   * Search by city
   */
  async searchByCity(cityUuid, params = {}) {
    try {
      const {
        type = 'tour,museum',
        languages = 'en,ar',
        form = 'compact',
        limit = 50
      } = params;

      return this.search({
        city_uuid: cityUuid,
        type,
        languages,
        form,
        limit,
        sort_by: 'popularity'
      });
    } catch (error) {
      logger.error(`izi.TRAVEL city search error (${cityUuid}):`, error.message);
      throw this.handleError(error);
    }
  }

  /**
   * Get supported languages
   */
  async getSupportedLanguages() {
    try {
      const cacheKey = `${this.cachePrefix}languages`;
      
      if (redisService.isConnected) {
        const cached = await redisService.get(cacheKey);
        if (cached) return cached;
      }

      const response = await this.client.get('/languages/supported');
      const data = response.data;

      if (redisService.isConnected && data) {
        await redisService.set(cacheKey, data, this.cacheTTL * 168); // Cache for 1 week
      }

      return data;
    } catch (error) {
      logger.error('izi.TRAVEL languages error:', error.message);
      throw this.handleError(error);
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      // Simple request to check API availability
      await this.client.get('/countries', {
        params: {
          languages: 'en',
          form: 'short',
          limit: 1
        }
      });

      return {
        status: 'healthy',
        service: 'izi.TRAVEL API',
        apiVersion: this.apiVersion,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        service: 'izi.TRAVEL API',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Clear cache
   */
  async clearCache(pattern = '*') {
    if (redisService.isConnected) {
      await redisService.clearCacheByPattern(`${this.cachePrefix}${pattern}`);
      logger.info(`✅ Cleared izi.TRAVEL cache: ${pattern}`);
    }
  }

  /**
   * Handle API errors
   */
  handleError(error) {
    if (error.response) {
      // API returned an error response
      const status = error.response.status;
      const data = error.response.data;

      return {
        error: 'izi.TRAVEL API Error',
        status,
        code: data.code || status,
        message: data.error || error.message,
        details: data
      };
    } else if (error.request) {
      // Request made but no response
      return {
        error: 'izi.TRAVEL Network Error',
        message: 'No response from izi.TRAVEL API',
        details: error.message
      };
    } else {
      // Error in request setup
      return {
        error: 'izi.TRAVEL Request Error',
        message: error.message
      };
    }
  }
}

// Singleton instance
const iziTravelService = new IziTravelService();

module.exports = iziTravelService;

