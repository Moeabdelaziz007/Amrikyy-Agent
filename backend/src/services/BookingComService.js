/**
 * Booking.com Affiliate API Service
 * Hotel search and booking integration
 */

const axios = require('axios');
const logger = require('../utils/logger');

class BookingComService {
  constructor() {
    this.baseURL = 'https://distribution-xml.booking.com/2.7/json';
    this.affiliateId = process.env.BOOKING_COM_AFFILIATE_ID;
    this.apiKey = process.env.BOOKING_COM_API_KEY;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Amrikyy-Travel-Agent/1.0'
      },
      timeout: 30000
    });

    logger.info('🏨 Booking.com service initialized');
  }

  /**
   * Search hotels
   * @param {Object} params - Search parameters
   * @returns {Promise<Object>} Hotel results
   */
  async searchHotels(params) {
    try {
      const {
        city,
        cityId,
        checkin,
        checkout,
        adults = 2,
        children = 0,
        rooms = 1,
        currency = 'USD',
        language = 'en',
        minPrice,
        maxPrice,
        minStars,
        limit = 10
      } = params;

      // Validate required fields
      if (!cityId && !city) {
        throw new Error('Either city or cityId is required');
      }

      if (!checkin || !checkout) {
        throw new Error('Check-in and check-out dates are required');
      }

      logger.info('🏨 Searching hotels', {
        city: city || cityId,
        checkin,
        checkout
      });

      // Build search parameters
      const searchParams = {
        affiliate_id: this.affiliateId,
        city_ids: cityId,
        checkin,
        checkout,
        guest_qty: adults,
        room_qty: rooms,
        currency,
        language,
        rows: limit
      };

      // Add optional filters
      if (minPrice) searchParams.min_price = minPrice;
      if (maxPrice) searchParams.max_price = maxPrice;
      if (minStars) searchParams.min_class = minStars;
      if (children > 0) searchParams.children_qty = children;

      const response = await this.client.get('/hotels', {
        params: searchParams
      });

      const hotels = this.formatHotelResults(response.data);

      logger.info('✅ Hotels found', { count: hotels.length });

      return {
        success: true,
        data: hotels,
        searchParams: {
          city: city || cityId,
          checkin,
          checkout,
          guests: adults + children,
          rooms
        }
      };

    } catch (error) {
      logger.error('❌ Hotel search failed', {
        error: error.message,
        params
      });

      return {
        success: false,
        error: error.message,
        details: error.response?.data
      };
    }
  }

  /**
   * Get hotel details
   * @param {string} hotelId - Hotel ID
   * @returns {Promise<Object>} Hotel details
   */
  async getHotelDetails(hotelId) {
    try {
      logger.info('🏨 Getting hotel details', { hotelId });

      const response = await this.client.get('/hotels', {
        params: {
          affiliate_id: this.affiliateId,
          hotel_ids: hotelId,
          extras: 'hotel_info,hotel_photos,hotel_description,hotel_facilities'
        }
      });

      if (!response.data || !response.data.result || response.data.result.length === 0) {
        throw new Error('Hotel not found');
      }

      const hotel = this.formatHotelDetails(response.data.result[0]);

      return {
        success: true,
        data: hotel
      };

    } catch (error) {
      logger.error('❌ Failed to get hotel details', {
        error: error.message,
        hotelId
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Search cities
   * @param {string} query - City name
   * @returns {Promise<Object>} City results
   */
  async searchCities(query) {
    try {
      logger.info('🌍 Searching cities', { query });

      const response = await this.client.get('/cities', {
        params: {
          affiliate_id: this.affiliateId,
          name: query,
          language: 'en',
          rows: 10
        }
      });

      const cities = response.data.result || [];

      return {
        success: true,
        data: cities.map(city => ({
          id: city.city_id,
          name: city.name,
          country: city.country,
          region: city.region,
          latitude: city.latitude,
          longitude: city.longitude,
          hotelCount: city.nr_hotels
        }))
      };

    } catch (error) {
      logger.error('❌ City search failed', {
        error: error.message,
        query
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get room availability and prices
   * @param {Object} params - Availability parameters
   * @returns {Promise<Object>} Room availability
   */
  async getRoomAvailability(params) {
    try {
      const {
        hotelId,
        checkin,
        checkout,
        adults = 2,
        children = 0,
        rooms = 1,
        currency = 'USD'
      } = params;

      logger.info('🏨 Checking room availability', {
        hotelId,
        checkin,
        checkout
      });

      const response = await this.client.get('/blockavailability', {
        params: {
          affiliate_id: this.affiliateId,
          hotel_ids: hotelId,
          checkin,
          checkout,
          guest_qty: adults,
          room_qty: rooms,
          currency
        }
      });

      const availability = this.formatRoomAvailability(response.data);

      return {
        success: true,
        data: availability
      };

    } catch (error) {
      logger.error('❌ Room availability check failed', {
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
   * Generate booking URL
   * @param {Object} params - Booking parameters
   * @returns {string} Booking URL
   */
  generateBookingURL(params) {
    const {
      hotelId,
      checkin,
      checkout,
      adults = 2,
      children = 0,
      rooms = 1,
      language = 'en'
    } = params;

    const baseURL = 'https://www.booking.com/hotel';
    const queryParams = new URLSearchParams({
      aid: this.affiliateId,
      hotel_id: hotelId,
      checkin,
      checkout,
      group_adults: adults,
      group_children: children,
      no_rooms: rooms,
      selected_currency: 'USD',
      lang: language
    });

    return `${baseURL}?${queryParams.toString()}`;
  }

  /**
   * Format hotel results for frontend
   * @param {Object} rawData - Raw API response
   * @returns {Array} Formatted hotels
   */
  formatHotelResults(rawData) {
    if (!rawData.result || !Array.isArray(rawData.result)) {
      return [];
    }

    return rawData.result.map(hotel => ({
      id: hotel.hotel_id,
      name: hotel.hotel_name,
      address: hotel.address,
      city: hotel.city,
      country: hotel.country_code,
      location: {
        latitude: hotel.latitude,
        longitude: hotel.longitude
      },
      rating: {
        stars: hotel.class,
        review: hotel.review_score,
        reviewCount: hotel.review_nr
      },
      price: {
        amount: hotel.min_total_price,
        currency: hotel.currency_code,
        perNight: hotel.price
      },
      image: hotel.main_photo_url,
      url: hotel.url,
      facilities: hotel.hotel_facilities?.split(',') || [],
      distance: {
        center: hotel.distance,
        unit: 'km'
      }
    }));
  }

  /**
   * Format hotel details
   * @param {Object} hotel - Raw hotel data
   * @returns {Object} Formatted hotel details
   */
  formatHotelDetails(hotel) {
    return {
      id: hotel.hotel_id,
      name: hotel.hotel_name,
      description: hotel.hotel_description,
      address: {
        street: hotel.address,
        city: hotel.city,
        zip: hotel.zip,
        country: hotel.country_code
      },
      location: {
        latitude: hotel.latitude,
        longitude: hotel.longitude
      },
      rating: {
        stars: hotel.class,
        review: hotel.review_score,
        reviewCount: hotel.review_nr,
        reviewScore: hotel.review_score_word
      },
      contact: {
        phone: hotel.phone,
        email: hotel.email
      },
      facilities: hotel.hotel_facilities?.split(',') || [],
      photos: hotel.hotel_photos || [],
      policies: {
        checkin: hotel.checkin_checkout_times?.checkin,
        checkout: hotel.checkin_checkout_times?.checkout
      },
      url: hotel.url
    };
  }

  /**
   * Format room availability
   * @param {Object} rawData - Raw availability data
   * @returns {Array} Formatted rooms
   */
  formatRoomAvailability(rawData) {
    if (!rawData.result || !Array.isArray(rawData.result)) {
      return [];
    }

    return rawData.result.map(room => ({
      id: room.block_id,
      name: room.name,
      description: room.room_description,
      maxOccupancy: room.max_occupancy,
      price: {
        amount: room.min_price,
        currency: room.currency_code,
        total: room.total_price
      },
      availability: room.nr_rooms_left,
      facilities: room.room_facilities?.split(',') || [],
      photos: room.room_photos || [],
      refundable: room.refundable === '1',
      breakfast: room.breakfast_included === '1'
    }));
  }

  /**
   * Health check
   * @returns {Promise<boolean>} Service status
   */
  async healthCheck() {
    try {
      // Try to search for a common city
      await this.searchCities('London');
      return true;
    } catch (error) {
      logger.error('❌ Booking.com service health check failed', {
        error: error.message
      });
      return false;
    }
  }
}

module.exports = new BookingComService();
