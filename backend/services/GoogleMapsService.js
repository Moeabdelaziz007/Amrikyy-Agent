// backend/src/services/GoogleMapsService.js
const { Client } = require('@googlemaps/google-maps-services-js');
const logger = require('../utils/logger');

/**
 * @class GoogleMapsService
 * @description A service class for interacting with the Google Maps API.
 * This class provides methods for getting directions, finding nearby places, and geocoding addresses.
 * It handles the initialization of the Google Maps client and gracefully handles cases where the API key is not provided.
 */
class GoogleMapsService {
  /**
   * @constructor
   * @description Initializes the GoogleMapsService.
   * It sets up the Google Maps client using the API key from the environment variables.
   * If the API key is not found, it logs a warning and disables the client to prevent runtime errors.
   */
  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!this.apiKey) {
      logger.warn('[GoogleMapsService] GOOGLE_MAPS_API_KEY is not set. Real API calls will fail.');
      this.client = null;
    } else {
      this.client = new Client({});
      logger.info('[GoogleMapsService] Initialized successfully.');
    }
  }

  /**
   * @private
   * @method _checkClient
   * @description Checks if the Google Maps client is initialized.
   * Throws an error if the client is not available, preventing API calls from being made without a valid configuration.
   * @throws {Error} If the Google Maps client is not configured.
   */
  _checkClient() {
    if (!this.client) {
      throw new Error('Google Maps Service is not configured. Please provide GOOGLE_MAPS_API_KEY.');
    }
  }

  /**
   * @method getDirections
   * @description Fetches driving, walking, or cycling directions between two locations.
   * @param {string} origin - The starting address or coordinates (e.g., "Toronto, ON").
   * @param {string} destination - The ending address or coordinates (e.g., "Montreal, QC").
   * @param {string} [mode='driving'] - The mode of transport. Can be 'driving', 'walking', 'bicycling', or 'transit'.
   * @returns {Promise<object>} A simplified route object containing summary, distance, and duration.
   * @throws {Error} If the API call fails.
   */
  async getDirections(origin, destination, mode = 'driving') {
    this._checkClient();
    try {
      const response = await this.client.directions({
        params: {
          origin,
          destination,
          mode,
          key: this.apiKey,
        },
      });
      // Return a simplified, frontend-friendly version of the response
      const route = response.data.routes[0];
      if (!route) return { summary: 'No route found.' };
      return {
        summary: route.summary,
        distance: route.legs[0].distance.text,
        duration: route.legs[0].duration.text,
      };
    } catch (error) {
      logger.error('[GoogleMapsService] Error getting directions:', error.response?.data?.error_message || error.message);
      throw new Error('Failed to get directions from Google Maps API.');
    }
  }

  /**
   * @method findNearby
   * @description Finds nearby places of a specific type around a given location.
   * @param {object} location - The latitude and longitude to search from (e.g., {lat: 43.6532, lng: -79.3832}).
   * @param {string} type - The type of place to search for (e.g., "restaurant", "hospital").
   * @param {number} [radius=5000] - The search radius in meters.
   * @returns {Promise<object>} An object containing an array of simplified place results.
   * @throws {Error} If the API call fails.
   */
  async findNearby(location, type, radius = 5000) {
    this._checkClient();
    try {
      const response = await this.client.placesNearby({
        params: {
          location, // Expects {lat: number, lng: number}
          type,
          radius,
          key: this.apiKey,
        },
      });
      // Return simplified results
      const results = response.data.results.map(place => ({
        name: place.name,
        vicinity: place.vicinity,
        rating: place.rating,
        placeId: place.place_id,
      }));
      return { results };
    } catch (error) {
      logger.error('[GoogleMapsService] Error finding nearby places:', error.response?.data?.error_message || error.message);
      throw new Error('Failed to find nearby places from Google Maps API.');
    }
  }

  /**
   * @method geocode
   * @description Converts a human-readable address into geographic coordinates.
   * @param {string} address - The address to geocode (e.g., "1600 Amphitheatre Parkway, Mountain View, CA").
   * @returns {Promise<object>} An object containing the location coordinates and the formatted address.
   * @throws {Error} If the API call fails.
   */
  async geocode(address) {
    this._checkClient();
    try {
      const response = await this.client.geocode({
        params: {
          address,
          key: this.apiKey,
        },
      });
      if (!response.data.results || response.data.results.length === 0) {
        return { location: null, formattedAddress: 'Address not found.' };
      }
      return {
        location: response.data.results[0].geometry.location,
        formattedAddress: response.data.results[0].formatted_address,
      };
    } catch (error) {
      logger.error('[GoogleMapsService] Error geocoding address:', error.response?.data?.error_message || error.message);
      throw new Error('Failed to geocode address with Google Maps API.');
    }
  }
}

module.exports = GoogleMapsService;
