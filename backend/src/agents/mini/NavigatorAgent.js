/**
 * Navigator Agent - Google Maps Integration
 * Specialization: Location intelligence and navigation
 */

const axios = require('axios');
const logger = require('../../utils/logger');

class NavigatorAgent {
  constructor() {
    this.name = 'Navigator';
    this.icon = '🗺️';
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
    this.baseUrl = 'https://maps.googleapis.com/maps/api';
  }

  /**
   * Execute a task
   */
  async executeTask(task) {
    logger.info(`[NavigatorAgent] Executing task: ${task.type}`);
    
    try {
      switch (task.type) {
        case 'GET_DIRECTIONS':
          return await this.getDirections(task.origin, task.destination, task.mode);
        case 'FIND_NEARBY':
          return await this.findNearby(task.location, task.placeType, task.radius);
        case 'GET_PLACE_DETAILS':
          return await this.getPlaceDetails(task.placeId);
        case 'GEOCODE':
          return await this.geocode(task.address);
        case 'REVERSE_GEOCODE':
          return await this.reverseGeocode(task.lat, task.lng);
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }
    } catch (error) {
      logger.error(`[NavigatorAgent] Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get directions between two points
   */
  async getDirections(origin, destination, mode = 'driving') {
    const url = `${this.baseUrl}/directions/json`;
    
    const response = await axios.get(url, {
      params: {
        origin,
        destination,
        mode,
        key: this.apiKey
      }
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Directions API error: ${response.data.status}`);
    }

    const route = response.data.routes[0];
    const leg = route.legs[0];

    return {
      success: true,
      distance: leg.distance.text,
      duration: leg.duration.text,
      steps: leg.steps.map(step => ({
        instruction: step.html_instructions.replace(/<[^>]*>/g, ''),
        distance: step.distance.text,
        duration: step.duration.text
      })),
      polyline: route.overview_polyline.points,
      bounds: route.bounds
    };
  }

  /**
   * Find nearby places
   */
  async findNearby(location, type, radius = 1000) {
    const url = `${this.baseUrl}/place/nearbysearch/json`;
    
    const response = await axios.get(url, {
      params: {
        location: `${location.lat},${location.lng}`,
        type,
        radius,
        key: this.apiKey
      }
    });

    if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
      throw new Error(`Places API error: ${response.data.status}`);
    }

    return {
      success: true,
      places: response.data.results.map(place => ({
        name: place.name,
        address: place.vicinity,
        rating: place.rating || 0,
        userRatingsTotal: place.user_ratings_total || 0,
        location: place.geometry.location,
        placeId: place.place_id,
        types: place.types,
        openNow: place.opening_hours?.open_now,
        photos: place.photos?.map(p => p.photo_reference) || []
      }))
    };
  }

  /**
   * Get place details
   */
  async getPlaceDetails(placeId) {
    const url = `${this.baseUrl}/place/details/json`;
    
    const response = await axios.get(url, {
      params: {
        place_id: placeId,
        fields: 'name,rating,formatted_phone_number,formatted_address,opening_hours,website,reviews',
        key: this.apiKey
      }
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Place Details API error: ${response.data.status}`);
    }

    const place = response.data.result;

    return {
      success: true,
      name: place.name,
      address: place.formatted_address,
      phone: place.formatted_phone_number,
      website: place.website,
      rating: place.rating,
      openingHours: place.opening_hours?.weekday_text || [],
      reviews: place.reviews?.map(r => ({
        author: r.author_name,
        rating: r.rating,
        text: r.text,
        time: r.time
      })) || []
    };
  }

  /**
   * Geocode an address
   */
  async geocode(address) {
    const url = `${this.baseUrl}/geocode/json`;
    
    const response = await axios.get(url, {
      params: {
        address,
        key: this.apiKey
      }
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Geocoding API error: ${response.data.status}`);
    }

    const result = response.data.results[0];

    return {
      success: true,
      location: result.geometry.location,
      formattedAddress: result.formatted_address,
      placeId: result.place_id,
      types: result.types
    };
  }

  /**
   * Reverse geocode coordinates
   */
  async reverseGeocode(lat, lng) {
    const url = `${this.baseUrl}/geocode/json`;
    
    const response = await axios.get(url, {
      params: {
        latlng: `${lat},${lng}`,
        key: this.apiKey
      }
    });

    if (response.data.status !== 'OK') {
      throw new Error(`Reverse Geocoding API error: ${response.data.status}`);
    }

    const result = response.data.results[0];

    return {
      success: true,
      address: result.formatted_address,
      placeId: result.place_id,
      types: result.types
    };
  }

  /**
   * Get agent status
   */
  getStatus() {
    return {
      name: this.name,
      icon: this.icon,
      status: this.apiKey ? 'active' : 'inactive',
      capabilities: [
        'GET_DIRECTIONS',
        'FIND_NEARBY',
        'GET_PLACE_DETAILS',
        'GEOCODE',
        'REVERSE_GEOCODE'
      ]
    };
  }
}

module.exports = NavigatorAgent;
