/**
 * Mapbox API Service
 * Maps, geocoding, and places integration
 */

const axios = require('axios');
const logger = require('../utils/logger');

class MapboxService {
  constructor() {
    this.baseURL = 'https://api.mapbox.com';
    this.accessToken = process.env.MAPBOX_ACCESS_TOKEN;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 15000
    });

    logger.info('🗺️ Mapbox service initialized');
  }

  /**
   * Geocode address to coordinates
   * @param {string} address - Address to geocode
   * @returns {Promise<Object>} Coordinates and place info
   */
  async geocode(address) {
    try {
      logger.info('🗺️ Geocoding address', { address });

      const response = await this.client.get(
        `/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`,
        {
          params: {
            access_token: this.accessToken,
            limit: 5
          }
        }
      );

      const features = response.data.features || [];

      return {
        success: true,
        data: features.map(feature => ({
          name: feature.place_name,
          coordinates: {
            longitude: feature.center[0],
            latitude: feature.center[1]
          },
          type: feature.place_type[0],
          relevance: feature.relevance,
          context: this.parseContext(feature.context)
        }))
      };

    } catch (error) {
      logger.error('❌ Geocoding failed', {
        error: error.message,
        address
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Reverse geocode coordinates to address
   * @param {number} longitude - Longitude
   * @param {number} latitude - Latitude
   * @returns {Promise<Object>} Address info
   */
  async reverseGeocode(longitude, latitude) {
    try {
      logger.info('🗺️ Reverse geocoding', { longitude, latitude });

      const response = await this.client.get(
        `/geocoding/v5/mapbox.places/${longitude},${latitude}.json`,
        {
          params: {
            access_token: this.accessToken,
            limit: 1
          }
        }
      );

      const feature = response.data.features[0];

      if (!feature) {
        throw new Error('No address found for these coordinates');
      }

      return {
        success: true,
        data: {
          name: feature.place_name,
          coordinates: {
            longitude: feature.center[0],
            latitude: feature.center[1]
          },
          type: feature.place_type[0],
          context: this.parseContext(feature.context)
        }
      };

    } catch (error) {
      logger.error('❌ Reverse geocoding failed', {
        error: error.message,
        longitude,
        latitude
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Search for places (POIs)
   * @param {Object} params - Search parameters
   * @returns {Promise<Object>} Places results
   */
  async searchPlaces(params) {
    try {
      const {
        query,
        proximity, // [longitude, latitude]
        bbox, // [minLon, minLat, maxLon, maxLat]
        types, // e.g., 'poi', 'address', 'place'
        limit = 10
      } = params;

      logger.info('🗺️ Searching places', { query });

      const searchParams = {
        access_token: this.accessToken,
        limit
      };

      if (proximity) {
        searchParams.proximity = proximity.join(',');
      }

      if (bbox) {
        searchParams.bbox = bbox.join(',');
      }

      if (types) {
        searchParams.types = Array.isArray(types) ? types.join(',') : types;
      }

      const response = await this.client.get(
        `/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`,
        { params: searchParams }
      );

      const features = response.data.features || [];

      return {
        success: true,
        data: features.map(feature => ({
          id: feature.id,
          name: feature.text,
          fullName: feature.place_name,
          coordinates: {
            longitude: feature.center[0],
            latitude: feature.center[1]
          },
          type: feature.place_type[0],
          relevance: feature.relevance,
          properties: feature.properties,
          context: this.parseContext(feature.context)
        }))
      };

    } catch (error) {
      logger.error('❌ Place search failed', {
        error: error.message,
        params
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get directions between two points
   * @param {Object} params - Direction parameters
   * @returns {Promise<Object>} Route information
   */
  async getDirections(params) {
    try {
      const {
        origin, // [longitude, latitude]
        destination, // [longitude, latitude]
        profile = 'driving', // driving, walking, cycling
        alternatives = false,
        steps = true,
        geometries = 'geojson'
      } = params;

      if (!origin || !destination) {
        throw new Error('Origin and destination are required');
      }

      logger.info('🗺️ Getting directions', {
        origin,
        destination,
        profile
      });

      const coordinates = `${origin.join(',')};${destination.join(',')}`;

      const response = await this.client.get(
        `/directions/v5/mapbox/${profile}/${coordinates}`,
        {
          params: {
            access_token: this.accessToken,
            alternatives,
            steps,
            geometries
          }
        }
      );

      const routes = response.data.routes || [];

      return {
        success: true,
        data: routes.map(route => ({
          distance: route.distance, // meters
          duration: route.duration, // seconds
          geometry: route.geometry,
          steps: route.legs[0]?.steps?.map(step => ({
            distance: step.distance,
            duration: step.duration,
            instruction: step.maneuver?.instruction,
            type: step.maneuver?.type
          }))
        }))
      };

    } catch (error) {
      logger.error('❌ Directions failed', {
        error: error.message,
        params
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get static map image URL
   * @param {Object} params - Map parameters
   * @returns {string} Map image URL
   */
  getStaticMapURL(params) {
    const {
      longitude,
      latitude,
      zoom = 14,
      width = 600,
      height = 400,
      markers = [],
      style = 'streets-v11'
    } = params;

    let url = `${this.baseURL}/styles/v1/mapbox/${style}/static`;

    // Add markers
    if (markers.length > 0) {
      const markerString = markers
        .map(m => `pin-s-${m.label || ''}+${m.color || 'ff0000'}(${m.longitude},${m.latitude})`)
        .join(',');
      url += `/${markerString}`;
    }

    // Add center and zoom
    url += `/${longitude},${latitude},${zoom}`;

    // Add dimensions
    url += `/${width}x${height}`;

    // Add access token
    url += `?access_token=${this.accessToken}`;

    return url;
  }

  /**
   * Calculate distance between two points
   * @param {Array} point1 - [longitude, latitude]
   * @param {Array} point2 - [longitude, latitude]
   * @returns {number} Distance in kilometers
   */
  calculateDistance(point1, point2) {
    const [lon1, lat1] = point1;
    const [lon2, lat2] = point2;

    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // Round to 2 decimals
  }

  /**
   * Parse context from Mapbox feature
   * @param {Array} context - Context array
   * @returns {Object} Parsed context
   */
  parseContext(context = []) {
    const parsed = {};

    context.forEach(item => {
      const type = item.id.split('.')[0];
      parsed[type] = item.text;
    });

    return parsed;
  }

  /**
   * Convert degrees to radians
   * @param {number} degrees - Degrees
   * @returns {number} Radians
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Health check
   * @returns {Promise<boolean>} Service status
   */
  async healthCheck() {
    try {
      // Try to geocode a common location
      await this.geocode('New York');
      return true;
    } catch (error) {
      logger.error('❌ Mapbox service health check failed', {
        error: error.message
      });
      return false;
    }
  }
}

module.exports = new MapboxService();
