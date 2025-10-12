/**
 * Sabre API Routes
 * Flight and hotel search + booking endpoints
 */

const express = require('express');
const router = express.Router();
const sabreService = require('../src/services/sabre/SabreService');
const logger = require('../src/utils/logger');

/**
 * Health check
 * GET /api/sabre/health
 */
router.get('/health', async (req, res) => {
  try {
    const health = await sabreService.healthCheck();
    res.json(health);
  } catch (error) {
    logger.error('Sabre health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

/**
 * Search flights
 * POST /api/sabre/flights/search
 */
router.post('/flights/search', async (req, res) => {
  try {
    const { origin, destination, departureDate, returnDate, adults, children, infants, cabinClass } =
      req.body;

    // Validation
    if (!origin || !destination || !departureDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: origin, destination, departureDate'
      });
    }

    const results = await sabreService.searchFlights({
      origin,
      destination,
      departureDate,
      returnDate,
      adults: adults || 1,
      children: children || 0,
      infants: infants || 0,
      cabinClass: cabinClass || 'Y'
    });

    res.json({
      success: true,
      count: results.length,
      flights: results,
      searchParams: {
        origin,
        destination,
        departureDate,
        returnDate,
        tripType: returnDate ? 'roundTrip' : 'oneWay'
      }
    });
  } catch (error) {
    logger.error('Flight search error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Search hotels
 * POST /api/sabre/hotels/search
 */
router.post('/hotels/search', async (req, res) => {
  try {
    const { location, checkIn, checkOut, adults, rooms, maxResults } = req.body;

    // Validation
    if (!location || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: location, checkIn, checkOut'
      });
    }

    const results = await sabreService.searchHotels({
      location,
      checkIn,
      checkOut,
      adults: adults || 1,
      rooms: rooms || 1,
      maxResults: maxResults || 20
    });

    res.json({
      success: true,
      count: results.length,
      hotels: results,
      searchParams: {
        location,
        checkIn,
        checkOut
      }
    });
  } catch (error) {
    logger.error('Hotel search error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Create booking
 * POST /api/sabre/booking
 */
router.post('/booking', async (req, res) => {
  try {
    const { type, travelerInfo, contact, payment, itinerary } = req.body;

    // Validation
    if (!type || !travelerInfo || !contact || !itinerary) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: type, travelerInfo, contact, itinerary'
      });
    }

    const result = await sabreService.createBooking({
      type,
      travelerInfo,
      contact,
      payment,
      itinerary
    });

    res.json(result);
  } catch (error) {
    logger.error('Booking creation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get booking details
 * GET /api/sabre/booking/:pnr
 */
router.get('/booking/:pnr', async (req, res) => {
  try {
    const { pnr } = req.params;

    const booking = await sabreService.getBooking(pnr);

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    logger.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Cancel booking
 * DELETE /api/sabre/booking/:pnr
 */
router.delete('/booking/:pnr', async (req, res) => {
  try {
    const { pnr } = req.params;

    const result = await sabreService.cancelBooking(pnr);

    res.json(result);
  } catch (error) {
    logger.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

