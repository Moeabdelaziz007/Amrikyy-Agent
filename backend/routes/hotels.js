/**
 * Hotels API Routes
 * Booking.com integration for hotel search and booking
 */

const express = require('express');
const router = express.Router();
const BookingComService = require('../src/services/BookingComService');
const { aiLimiter } = require('../middleware/rateLimiter');
const { cache } = require('../middleware/cacheMiddleware');
const logger = require('../utils/logger');

/**
 * POST /api/hotels/search
 * Search for hotels
 * Cached for 1 hour (3600 seconds)
 */
router.post('/search', cache(3600), aiLimiter, async (req, res) => {
  try {
    const {
      city,
      cityId,
      checkin,
      checkout,
      adults,
      children,
      rooms,
      currency,
      minPrice,
      maxPrice,
      minStars,
      limit
    } = req.body;

    // Validate required fields
    if (!cityId && !city) {
      return res.status(400).json({
        success: false,
        error: 'Either city or cityId is required'
      });
    }

    if (!checkin || !checkout) {
      return res.status(400).json({
        success: false,
        error: 'Check-in and check-out dates are required'
      });
    }

    logger.info('🏨 Hotel search request', {
      city: city || cityId,
      checkin,
      checkout,
      userId: req.user?.id
    });

    const result = await BookingComService.searchHotels({
      city,
      cityId,
      checkin,
      checkout,
      adults,
      children,
      rooms,
      currency,
      minPrice,
      maxPrice,
      minStars,
      limit
    });

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      hotels: result.data,
      searchParams: result.searchParams,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Hotel search error', {
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Failed to search hotels',
      message: error.message
    });
  }
});

/**
 * GET /api/hotels/cities
 * Search for cities
 * Cached for 24 hours (86400 seconds) - city data rarely changes
 */
router.get('/cities', cache(86400), async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Missing query parameter'
      });
    }

    logger.info('🌍 City search', { query });

    const result = await BookingComService.searchCities(query);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      cities: result.data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ City search error', {
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: 'Failed to search cities',
      message: error.message
    });
  }
});

/**
 * GET /api/hotels/:hotelId
 * Get hotel details
 * Cached for 6 hours (21600 seconds)
 */
router.get('/:hotelId', cache(21600), async (req, res) => {
  try {
    const { hotelId } = req.params;

    logger.info('🏨 Hotel details request', { hotelId });

    const result = await BookingComService.getHotelDetails(hotelId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json({
      success: true,
      hotel: result.data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Hotel details error', {
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: 'Failed to get hotel details',
      message: error.message
    });
  }
});

/**
 * POST /api/hotels/availability
 * Check room availability
 * Cached for 30 minutes (1800 seconds)
 */
router.post('/availability', cache(1800), aiLimiter, async (req, res) => {
  try {
    const {
      hotelId,
      checkin,
      checkout,
      adults,
      children,
      rooms,
      currency
    } = req.body;

    if (!hotelId || !checkin || !checkout) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: hotelId, checkin, checkout'
      });
    }

    logger.info('🏨 Room availability check', {
      hotelId,
      checkin,
      checkout
    });

    const result = await BookingComService.getRoomAvailability({
      hotelId,
      checkin,
      checkout,
      adults,
      children,
      rooms,
      currency
    });

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      rooms: result.data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Room availability error', {
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: 'Failed to check availability',
      message: error.message
    });
  }
});

/**
 * POST /api/hotels/booking-url
 * Generate booking URL
 */
router.post('/booking-url', async (req, res) => {
  try {
    const {
      hotelId,
      checkin,
      checkout,
      adults,
      children,
      rooms,
      language
    } = req.body;

    if (!hotelId || !checkin || !checkout) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: hotelId, checkin, checkout'
      });
    }

    const bookingURL = BookingComService.generateBookingURL({
      hotelId,
      checkin,
      checkout,
      adults,
      children,
      rooms,
      language
    });

    res.json({
      success: true,
      bookingURL,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Booking URL generation error', {
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: 'Failed to generate booking URL',
      message: error.message
    });
  }
});

/**
 * GET /api/hotels/health
 * Health check for Booking.com service
 */
router.get('/health', async (req, res) => {
  try {
    const isHealthy = await BookingComService.healthCheck();

    res.json({
      success: true,
      service: 'Booking.com API',
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      service: 'Booking.com API',
      status: 'error',
      error: error.message
    });
  }
});

module.exports = router;
