/**
 * Flights API Routes
 * Kiwi Tequila integration for flight search and booking
 */

const express = require('express');
const router = express.Router();
const KiwiTequilaService = require('../src/services/KiwiTequilaService');
const { aiLimiter } = require('../middleware/rateLimiter');
const logger = require('../utils/logger');

/**
 * POST /api/flights/search
 * Search for flights
 */
router.post('/search', aiLimiter, async (req, res) => {
  try {
    const {
      from,
      to,
      departureDate,
      returnDate,
      adults,
      children,
      infants,
      currency,
      maxStopovers,
      limit
    } = req.body;

    // Validate required fields
    if (!from || !to || !departureDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: from, to, departureDate'
      });
    }

    logger.info('🔍 Flight search request', {
      from,
      to,
      departureDate,
      userId: req.user?.id
    });

    const result = await KiwiTequilaService.searchFlights({
      flyFrom: from,
      flyTo: to,
      dateFrom: departureDate,
      dateTo: returnDate || departureDate,
      adults: adults || 1,
      children: children || 0,
      infants: infants || 0,
      curr: currency || 'USD',
      maxStopovers: maxStopovers || 2,
      limit: limit || 10
    });

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      flights: result.data,
      currency: result.currency,
      searchParams: {
        from,
        to,
        departureDate,
        returnDate
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Flight search error', {
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Failed to search flights',
      message: error.message
    });
  }
});

/**
 * GET /api/flights/locations
 * Search for airports and cities
 */
router.get('/locations', async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Missing query parameter'
      });
    }

    logger.info('🌍 Location search', { query });

    const result = await KiwiTequilaService.searchLocations(query);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      locations: result.data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Location search error', {
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: 'Failed to search locations',
      message: error.message
    });
  }
});

/**
 * POST /api/flights/details
 * Get flight details by booking token
 */
router.post('/details', async (req, res) => {
  try {
    const { bookingToken } = req.body;

    if (!bookingToken) {
      return res.status(400).json({
        success: false,
        error: 'Missing bookingToken'
      });
    }

    logger.info('📋 Flight details request', { bookingToken });

    const result = await KiwiTequilaService.getFlightDetails(bookingToken);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      flight: result.data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Flight details error', {
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: 'Failed to get flight details',
      message: error.message
    });
  }
});

/**
 * POST /api/flights/book
 * Create a flight booking (sandbox mode)
 */
router.post('/book', aiLimiter, async (req, res) => {
  try {
    const {
      bookingToken,
      passengers,
      contactEmail,
      contactPhone
    } = req.body;

    // Validate required fields
    if (!bookingToken || !passengers || !contactEmail) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: bookingToken, passengers, contactEmail'
      });
    }

    // Validate passengers array
    if (!Array.isArray(passengers) || passengers.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Passengers must be a non-empty array'
      });
    }

    logger.info('🎫 Flight booking request', {
      bookingToken,
      passengerCount: passengers.length,
      userId: req.user?.id
    });

    const result = await KiwiTequilaService.createBooking({
      bookingToken,
      passengers,
      contactEmail,
      contactPhone
    });

    if (!result.success) {
      return res.status(500).json(result);
    }

    // TODO: Save booking to database
    // TODO: Send confirmation email
    // TODO: Integrate with payment system

    res.json({
      success: true,
      bookingId: result.bookingId,
      pnr: result.pnr,
      message: 'Booking created successfully (sandbox mode)',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Flight booking error', {
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Failed to create booking',
      message: error.message
    });
  }
});

/**
 * GET /api/flights/health
 * Health check for Kiwi service
 */
router.get('/health', async (req, res) => {
  try {
    const isHealthy = await KiwiTequilaService.healthCheck();

    res.json({
      success: true,
      service: 'Kiwi Tequila API',
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      service: 'Kiwi Tequila API',
      status: 'error',
      error: error.message
    });
  }
});

module.exports = router;
