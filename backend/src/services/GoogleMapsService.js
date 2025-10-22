/**
 * Google Maps Service - Complete Maps Platform Integration
 * 
 * Features:
 * - Places API (New) - Search hotels, restaurants, attractions
 * - Directions API - Route planning and navigation
 * - Distance Matrix API - Travel time calculations
 * - Geocoding API - Address to coordinates conversion
 * - Places Details - Get detailed place information
 * - Places Photos - Get place images
 * 
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-22
 */

const axios = require('axios');
const logger = require('../../utils/logger');

class GoogleMapsService {
  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    // API endpoints
    this.endpoints = {
      placesSearch: 'https://places.googleapis.com/v1/places:searchText',
      placesNearby: 'https://places.googleapis.com/v1/places:searchNearby',
      placeDetails: 'https://places.googleapis.com/v1/places',
      directions: 'https://routes.googleapis.com/directions/v2:computeRoutes',
      distanceMatrix: 'https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix',
      geocode: 'https://maps.googleapis.com/maps/api/geocode/json',
      reverseGeocode: 'https://maps.googleapis.com/maps/api/geocode/json'
    };
    
    // Field masks for Places API (New)
    this.placeFieldMask = [
      'places.id',
      'places.displayName',
      'places.formattedAddress',
      'places.location',
      'places.rating',
      'places.userRatingCount',
      'places.priceLevel',
      'places.googleMapsUri',
      'places.websiteUri',
      'places.internationalPhoneNumber',
      'places.types',
      'places.photos',
      'places.reviews',
      'places.currentOpeningHours',
      'places.primaryType'
    ].join(',');
    
    if (!this.apiKey) {
      logger.warn('⚠️ GOOGLE_MAPS_API_KEY not found. Maps features will be limited.');
    } else {
      logger.info('🗺️ Google Maps Service initialized');
    }
  }

  /**
   * Search places using text query (Places API New)
   * @param {string} query - Search query (e.g., "hotels in Tokyo")
   * @param {object} options - Search options
   * @returns {Promise<Array>} Array of places
   */
  async searchPlaces(query, options = {}) {
    try {
      const {
        location = null,
        radius = 5000,
        maxResults = 20,
        languageCode = 'en',
        regionCode = 'US'
      } = options;

      const requestBody = {
        textQuery: query,
        languageCode,
        regionCode,
        maxResultCount: maxResults
      };

      // Add location bias if provided
      if (location) {
        requestBody.locationBias = {
          circle: {
            center: {
              latitude: location.lat,
              longitude: location.lng
            },
            radius
          }
        };
      }

      const response = await axios.post(
        this.endpoints.placesSearch,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': this.apiKey,
            'X-Goog-FieldMask': this.placeFieldMask
          },
          timeout: 15000
        }
      );

      const places = response.data.places || [];
      
      logger.info(`Found ${places.length} places for query: ${query}`);
      
      return places.map(place => this.formatPlace(place));

    } catch (error) {
      logger.error('Places search error:', error.response?.data || error.message);
      throw new Error(`Failed to search places: ${error.message}`);
    }
  }

  /**
   * Search nearby places (Places API New)
   * @param {object} location - Center location {lat, lng}
   * @param {string} type - Place type (e.g., 'restaurant', 'hotel')
   * @param {object} options - Search options
   * @returns {Promise<Array>} Array of nearby places
   */
  async searchNearby(location, type = null, options = {}) {
    try {
      const {
        radius = 5000,
        maxResults = 20,
        languageCode = 'en'
      } = options;

      const requestBody = {
        locationRestriction: {
          circle: {
            center: {
              latitude: location.lat,
              longitude: location.lng
            },
            radius
          }
        },
        maxResultCount: maxResults,
        languageCode
      };

      // Add type filter if provided
      if (type) {
        requestBody.includedTypes = [type];
      }

      const response = await axios.post(
        this.endpoints.placesNearby,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': this.apiKey,
            'X-Goog-FieldMask': this.placeFieldMask
          },
          timeout: 15000
        }
      );

      const places = response.data.places || [];
      
      logger.info(`Found ${places.length} nearby places of type: ${type || 'all'}`);
      
      return places.map(place => this.formatPlace(place));

    } catch (error) {
      logger.error('Nearby search error:', error.response?.data || error.message);
      throw new Error(`Failed to search nearby: ${error.message}`);
    }
  }

  /**
   * Get place details by ID
   * @param {string} placeId - Google Place ID
   * @returns {Promise<object>} Place details
   */
  async getPlaceDetails(placeId) {
    try {
      const response = await axios.get(
        `${this.endpoints.placeDetails}/${placeId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': this.apiKey,
            'X-Goog-FieldMask': this.placeFieldMask
          },
          timeout: 10000
        }
      );

      return this.formatPlace(response.data);

    } catch (error) {
      logger.error('Place details error:', error.response?.data || error.message);
      throw new Error(`Failed to get place details: ${error.message}`);
    }
  }

  /**
   * Search hotels in a specific area
   * @param {string} area - Area name (e.g., "Tokyo Shinjuku")
   * @param {object} options - Search options
   * @returns {Promise<Array>} Array of hotels
   */
  async searchHotels(area, options = {}) {
    try {
      const query = `hotels in ${area}`;
      const places = await this.searchPlaces(query, options);
      
      // Filter for lodging/hotel types
      const hotels = places.filter(place => {
        const types = place.types || [];
        return types.includes('lodging') || 
               types.includes('hotel') || 
               place.primaryType === 'hotel';
      });

      logger.info(`Found ${hotels.length} hotels in ${area}`);
      
      return hotels;

    } catch (error) {
      logger.error('Hotel search error:', error);
      throw error;
    }
  }

  /**
   * Search restaurants in a specific area
   * @param {string} area - Area name
   * @param {object} options - Search options
   * @returns {Promise<Array>} Array of restaurants
   */
  async searchRestaurants(area, options = {}) {
    try {
      const query = `restaurants in ${area}`;
      const places = await this.searchPlaces(query, options);
      
      const restaurants = places.filter(place => {
        const types = place.types || [];
        return types.includes('restaurant') || 
               types.includes('food') ||
               place.primaryType === 'restaurant';
      });

      logger.info(`Found ${restaurants.length} restaurants in ${area}`);
      
      return restaurants;

    } catch (error) {
      logger.error('Restaurant search error:', error);
      throw error;
    }
  }

  /**
   * Search attractions in a specific area
   * @param {string} area - Area name
   * @param {object} options - Search options
   * @returns {Promise<Array>} Array of attractions
   */
  async searchAttractions(area, options = {}) {
    try {
      const query = `tourist attractions in ${area}`;
      const places = await this.searchPlaces(query, options);
      
      const attractions = places.filter(place => {
        const types = place.types || [];
        return types.includes('tourist_attraction') || 
               types.includes('point_of_interest') ||
               types.includes('museum') ||
               types.includes('park');
      });

      logger.info(`Found ${attractions.length} attractions in ${area}`);
      
      return attractions;

    } catch (error) {
      logger.error('Attractions search error:', error);
      throw error;
    }
  }

  /**
   * Get directions between two points (Routes API)
   * @param {object} origin - Origin location {lat, lng} or address
   * @param {object} destination - Destination location {lat, lng} or address
   * @param {string} travelMode - DRIVE, WALK, BICYCLE, TRANSIT
   * @returns {Promise<object>} Route information
   */
  async getDirections(origin, destination, travelMode = 'DRIVE') {
    try {
      const requestBody = {
        origin: this.formatLocation(origin),
        destination: this.formatLocation(destination),
        travelMode,
        routingPreference: 'TRAFFIC_AWARE',
        computeAlternativeRoutes: true,
        languageCode: 'en',
        units: 'METRIC'
      };

      const response = await axios.post(
        this.endpoints.directions,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': this.apiKey,
            'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline,routes.legs'
          },
          timeout: 15000
        }
      );

      const routes = response.data.routes || [];
      
      if (routes.length === 0) {
        throw new Error('No routes found');
      }

      const primaryRoute = routes[0];
      
      return {
        distance: primaryRoute.distanceMeters,
        distanceText: this.formatDistance(primaryRoute.distanceMeters),
        duration: primaryRoute.duration,
        durationText: this.formatDuration(primaryRoute.duration),
        polyline: primaryRoute.polyline?.encodedPolyline,
        legs: primaryRoute.legs,
        alternativeRoutes: routes.slice(1).map(route => ({
          distance: route.distanceMeters,
          duration: route.duration
        }))
      };

    } catch (error) {
      logger.error('Directions error:', error.response?.data || error.message);
      throw new Error(`Failed to get directions: ${error.message}`);
    }
  }

  /**
   * Calculate travel time between multiple points (Distance Matrix API)
   * @param {Array} origins - Array of origin locations
   * @param {Array} destinations - Array of destination locations
   * @param {string} travelMode - DRIVE, WALK, BICYCLE, TRANSIT
   * @returns {Promise<Array>} Distance matrix
   */
  async calculateDistanceMatrix(origins, destinations, travelMode = 'DRIVE') {
    try {
      const requestBody = {
        origins: origins.map(loc => ({ waypoint: this.formatLocation(loc) })),
        destinations: destinations.map(loc => ({ waypoint: this.formatLocation(loc) })),
        travelMode,
        routingPreference: 'TRAFFIC_AWARE'
      };

      const response = await axios.post(
        this.endpoints.distanceMatrix,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': this.apiKey,
            'X-Goog-FieldMask': 'originIndex,destinationIndex,duration,distanceMeters,status'
          },
          timeout: 15000
        }
      );

      return response.data;

    } catch (error) {
      logger.error('Distance matrix error:', error.response?.data || error.message);
      throw new Error(`Failed to calculate distance matrix: ${error.message}`);
    }
  }

  /**
   * Geocode address to coordinates
   * @param {string} address - Address to geocode
   * @returns {Promise<object>} Location {lat, lng}
   */
  async geocodeAddress(address) {
    try {
      const response = await axios.get(this.endpoints.geocode, {
        params: {
          address,
          key: this.apiKey
        },
        timeout: 10000
      });

      if (response.data.status !== 'OK') {
        throw new Error(`Geocoding failed: ${response.data.status}`);
      }

      const result = response.data.results[0];
      
      return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formattedAddress: result.formatted_address,
        placeId: result.place_id,
        types: result.types
      };

    } catch (error) {
      logger.error('Geocoding error:', error.response?.data || error.message);
      throw new Error(`Failed to geocode address: ${error.message}`);
    }
  }

  /**
   * Reverse geocode coordinates to address
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise<object>} Address information
   */
  async reverseGeocode(lat, lng) {
    try {
      const response = await axios.get(this.endpoints.reverseGeocode, {
        params: {
          latlng: `${lat},${lng}`,
          key: this.apiKey
        },
        timeout: 10000
      });

      if (response.data.status !== 'OK') {
        throw new Error(`Reverse geocoding failed: ${response.data.status}`);
      }

      const result = response.data.results[0];
      
      return {
        formattedAddress: result.formatted_address,
        placeId: result.place_id,
        types: result.types,
        addressComponents: result.address_components
      };

    } catch (error) {
      logger.error('Reverse geocoding error:', error.response?.data || error.message);
      throw new Error(`Failed to reverse geocode: ${error.message}`);
    }
  }

  /**
   * Format location for API requests
   * @param {object|string} location - Location object or address string
   * @returns {object} Formatted location
   */
  formatLocation(location) {
    if (typeof location === 'string') {
      return { address: location };
    }
    
    if (location.lat && location.lng) {
      return {
        location: {
          latLng: {
            latitude: location.lat,
            longitude: location.lng
          }
        }
      };
    }
    
    throw new Error('Invalid location format');
  }

  /**
   * Format place data from API response
   * @param {object} place - Raw place data
   * @returns {object} Formatted place
   */
  formatPlace(place) {
    return {
      id: place.id,
      name: place.displayName?.text || place.name,
      address: place.formattedAddress,
      location: {
        lat: place.location?.latitude,
        lng: place.location?.longitude
      },
      rating: place.rating,
      userRatingsTotal: place.userRatingCount,
      priceLevel: place.priceLevel,
      types: place.types || [],
      primaryType: place.primaryType,
      googleMapsUri: place.googleMapsUri,
      websiteUri: place.websiteUri,
      phoneNumber: place.internationalPhoneNumber,
      photos: place.photos?.map(photo => ({
        name: photo.name,
        widthPx: photo.widthPx,
        heightPx: photo.heightPx
      })),
      openingHours: place.currentOpeningHours,
      reviews: place.reviews?.slice(0, 5) // Top 5 reviews
    };
  }

  /**
   * Format distance in meters to human-readable string
   * @param {number} meters - Distance in meters
   * @returns {string} Formatted distance
   */
  formatDistance(meters) {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  }

  /**
   * Format duration string (e.g., "3600s") to human-readable
   * @param {string} duration - Duration string
   * @returns {string} Formatted duration
   */
  formatDuration(duration) {
    const seconds = parseInt(duration.replace('s', ''), 10);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  /**
   * Get service status
   * @returns {object} Service status
   */
  getStatus() {
    return {
      service: 'GoogleMapsService',
      configured: !!this.apiKey,
      endpoints: Object.keys(this.endpoints),
      features: [
        'Places Search',
        'Nearby Search',
        'Place Details',
        'Directions',
        'Distance Matrix',
        'Geocoding',
        'Reverse Geocoding'
      ]
    };
  }
}

module.exports = new GoogleMapsService();
