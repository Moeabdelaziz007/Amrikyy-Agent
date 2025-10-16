/**
 * Kiwi Tequila API Service
 * Flight search and booking integration
 */

const axios = require('axios');
const logger = require('../utils/logger');

class KiwiTequilaService {
  constructor() {
    this.baseURL = 'https://api.tequila.kiwi.com';
    this.apiKey = process.env.KIWI_API_KEY;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'apikey': this.apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
  }

  /**
   * Search flights
   * @param {Object} params - Search parameters
   * @returns {Promise<Object>} Flight results
   */
  async searchFlights(params) {
    try {
      const {
        flyFrom,
        flyTo,
        dateFrom,
        dateTo,
        adults = 1,
        children = 0,
        infants = 0,
        curr = 'USD',
        locale = 'en',
        maxStopovers = 2,
        limit = 10
      } = params;

      logger.info('🔍 Searching flights', { flyFrom, flyTo, dateFrom });

      const response = await this.client.get('/v2/search', {
        params: {
          fly_from: flyFrom,
          fly_to: flyTo,
          date_from: dateFrom,
          date_to: dateTo,
          adults,
          children,
          infants,
          curr,
          locale,
          max_stopovers: maxStopovers,
          limit,
          sort: 'price'
        }
      });

      const flights = this.formatFlightResults(response.data);
      
      logger.info('✅ Flights found', { count: flights.length });
      
      return {
        success: true,
        data: flights,
        currency: curr,
        searchParams: params
      };

    } catch (error) {
      logger.error('❌ Flight search failed', {
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
   * Get flight details by booking token
   * @param {string} bookingToken - Booking token from search
   * @returns {Promise<Object>} Flight details
   */
  async getFlightDetails(bookingToken) {
    try {
      logger.info('📋 Getting flight details', { bookingToken });

      const response = await this.client.get('/v2/booking/check_flights', {
        params: {
          booking_token: bookingToken,
          bnum: 0,
          pnum: 1
        }
      });

      return {
        success: true,
        data: response.data
      };

    } catch (error) {
      logger.error('❌ Failed to get flight details', {
        error: error.message,
        bookingToken
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create booking (sandbox mode)
   * @param {Object} bookingData - Booking information
   * @returns {Promise<Object>} Booking confirmation
   */
  async createBooking(bookingData) {
    try {
      const {
        bookingToken,
        passengers,
        contactEmail,
        contactPhone
      } = bookingData;

      logger.info('🎫 Creating booking', { bookingToken });

      // In sandbox mode, this returns a test booking
      const response = await this.client.post('/v2/booking/save_booking', {
        booking_token: bookingToken,
        passengers: passengers.map(p => ({
          name: p.firstName,
          surname: p.lastName,
          birthday: p.dateOfBirth,
          nationality: p.nationality,
          cardno: p.passportNumber,
          expiration: p.passportExpiry
        })),
        lang: 'en',
        locale: 'en',
        currency: 'USD',
        bags: 0,
        session_id: this.generateSessionId()
      });

      logger.info('✅ Booking created', { 
        bookingId: response.data.booking_id 
      });

      return {
        success: true,
        bookingId: response.data.booking_id,
        pnr: response.data.pnr,
        data: response.data
      };

    } catch (error) {
      logger.error('❌ Booking creation failed', {
        error: error.message,
        bookingData
      });

      return {
        success: false,
        error: error.message,
        details: error.response?.data
      };
    }
  }

  /**
   * Search locations (airports, cities)
   * @param {string} query - Search query
   * @returns {Promise<Object>} Location results
   */
  async searchLocations(query) {
    try {
      logger.info('🌍 Searching locations', { query });

      const response = await this.client.get('/locations/query', {
        params: {
          term: query,
          locale: 'en-US',
          location_types: 'airport,city',
          limit: 10
        }
      });

      return {
        success: true,
        data: response.data.locations
      };

    } catch (error) {
      logger.error('❌ Location search failed', {
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
   * Format flight results for frontend
   * @param {Object} rawData - Raw API response
   * @returns {Array} Formatted flights
   */
  formatFlightResults(rawData) {
    if (!rawData.data || !Array.isArray(rawData.data)) {
      return [];
    }

    return rawData.data.map(flight => ({
      id: flight.id,
      bookingToken: flight.booking_token,
      price: {
        amount: flight.price,
        currency: rawData.currency
      },
      route: {
        from: {
          city: flight.cityFrom,
          airport: flight.flyFrom,
          country: flight.countryFrom.name
        },
        to: {
          city: flight.cityTo,
          airport: flight.flyTo,
          country: flight.countryTo.name
        }
      },
      departure: {
        local: flight.local_departure,
        utc: flight.utc_departure
      },
      arrival: {
        local: flight.local_arrival,
        utc: flight.utc_arrival
      },
      duration: {
        total: flight.duration.total,
        departure: flight.duration.departure,
        return: flight.duration.return
      },
      airlines: flight.airlines,
      stops: flight.route.length - 1,
      deepLink: flight.deep_link,
      availability: {
        seats: flight.availability?.seats || null
      }
    }));
  }

  /**
   * Generate session ID for booking
   * @returns {string} Session ID
   */
  generateSessionId() {
    return `amrikyy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Health check
   * @returns {Promise<boolean>} Service status
   */
  async healthCheck() {
    try {
      await this.searchLocations('New York');
      return true;
    } catch (error) {
      logger.error('❌ Kiwi service health check failed', {
        error: error.message
      });
      return false;
    }
  }
}

module.exports = new KiwiTequilaService();
