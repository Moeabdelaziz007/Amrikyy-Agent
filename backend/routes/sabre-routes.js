/**
 * sabre-routes.js
 * 
 * API routes for Sabre GDS integration
 * 
 * @author Mohamed Hossameldin Abdelaziz
 * @date October 22, 2025
 */

const express = require('express');
const router = express.Router();
const sabreService = require('../src/services/SabreService');

/**
 * POST /api/sabre/flights/search
 * Search for flights
 */
router.post('/flights/search', async (req, res) => {
  try {
    const {
      origin,
      destination,
      departureDate,
      returnDate,
      passengers,
      cabinClass
    } = req.body;

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
      passengers,
      cabinClass
    });

    res.json({
      success: true,
      data: results,
      count: results.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/sabre/fare-rules
 * Get fare rules for a flight
 */
router.post('/fare-rules', async (req, res) => {
  try {
    const { fareReference } = req.body;

    if (!fareReference) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: fareReference'
      });
    }

    const rules = await sabreService.getFareRules(fareReference);

    res.json({
      success: true,
      data: rules
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/sabre/seat-map
 * Get seat map for a flight
 */
router.post('/seat-map', async (req, res) => {
  try {
    const { flightSegment } = req.body;

    if (!flightSegment) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: flightSegment'
      });
    }

    const seatMap = await sabreService.getSeatMap(flightSegment);

    res.json({
      success: true,
      data: seatMap
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/sabre/booking/create
 * Create a new booking
 */
router.post('/booking/create', async (req, res) => {
  try {
    const bookingData = req.body;

    if (!bookingData) {
      return res.status(400).json({
        success: false,
        error: 'Missing booking data'
      });
    }

    const booking = await sabreService.createBooking(bookingData);

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/sabre/booking/:pnr
 * Get booking details
 */
router.get('/booking/:pnr', async (req, res) => {
  try {
    const { pnr } = req.params;

    const booking = await sabreService.getBooking(pnr);

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/sabre/booking/:pnr
 * Cancel a booking
 */
router.delete('/booking/:pnr', async (req, res) => {
  try {
    const { pnr } = req.params;

    const result = await sabreService.cancelBooking(pnr);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/sabre/status
 * Get Sabre service status
 */
router.get('/status', async (req, res) => {
  try {
    const status = await sabreService.getStatus();

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/sabre/hotels/search
 * Search for hotels
 */
router.post('/hotels/search', async (req, res) => {
  try {
    const {
      location,
      checkIn,
      checkOut,
      guests,
      rooms
    } = req.body;

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
      guests,
      rooms
    });

    res.json({
      success: true,
      data: results,
      count: results.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/sabre/fare-rules
 * Get fare rules for a flight
 */
router.post('/fare-rules', async (req, res) => {
  try {
    const { fareReference } = req.body;

    if (!fareReference) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: fareReference'
      });
    }

    const rules = await sabreService.getFareRules(fareReference);

    res.json({
      success: true,
      data: rules
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/sabre/seat-map
 * Get seat map for a flight
 */
router.post('/seat-map', async (req, res) => {
  try {
    const { flightSegment } = req.body;

    if (!flightSegment) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: flightSegment'
      });
    }

    const seatMap = await sabreService.getSeatMap(flightSegment);

    res.json({
      success: true,
      data: seatMap
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/sabre/booking/create
 * Create a new booking
 */
router.post('/booking/create', async (req, res) => {
  try {
    const bookingData = req.body;

    if (!bookingData) {
      return res.status(400).json({
        success: false,
        error: 'Missing booking data'
      });
    }

    const booking = await sabreService.createBooking(bookingData);

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/sabre/booking/:pnr
 * Get booking details
 */
router.get('/booking/:pnr', async (req, res) => {
  try {
    const { pnr } = req.params;

    const booking = await sabreService.getBooking(pnr);

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/sabre/booking/:pnr
 * Cancel a booking
 */
router.delete('/booking/:pnr', async (req, res) => {
  try {
    const { pnr } = req.params;

    const result = await sabreService.cancelBooking(pnr);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/sabre/status
 * Get Sabre service status
 */
router.get('/status', async (req, res) => {
  try {
    const status = await sabreService.getStatus();

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/sabre/cars/search
 * Search for car rentals
 */
router.post('/cars/search', async (req, res) => {
  try {
    const {
      location,
      pickupDate,
      returnDate,
      pickupTime,
      returnTime
    } = req.body;

    if (!location || !pickupDate || !returnDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: location, pickupDate, returnDate'
      });
    }

    const results = await sabreService.searchCars({
      location,
      pickupDate,
      returnDate,
      pickupTime,
      returnTime
    });

    res.json({
      success: true,
      data: results,
      count: results.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/sabre/fare-rules
 * Get fare rules for a flight
 */
router.post('/fare-rules', async (req, res) => {
  try {
    const { fareReference } = req.body;

    if (!fareReference) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: fareReference'
      });
    }

    const rules = await sabreService.getFareRules(fareReference);

    res.json({
      success: true,
      data: rules
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/sabre/seat-map
 * Get seat map for a flight
 */
router.post('/seat-map', async (req, res) => {
  try {
    const { flightSegment } = req.body;

    if (!flightSegment) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: flightSegment'
      });
    }

    const seatMap = await sabreService.getSeatMap(flightSegment);

    res.json({
      success: true,
      data: seatMap
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/sabre/booking/create
 * Create a new booking
 */
router.post('/booking/create', async (req, res) => {
  try {
    const bookingData = req.body;

    if (!bookingData) {
      return res.status(400).json({
        success: false,
        error: 'Missing booking data'
      });
    }

    const booking = await sabreService.createBooking(bookingData);

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/sabre/booking/:pnr
 * Get booking details
 */
router.get('/booking/:pnr', async (req, res) => {
  try {
    const { pnr } = req.params;

    const booking = await sabreService.getBooking(pnr);

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/sabre/booking/:pnr
 * Cancel a booking
 */
router.delete('/booking/:pnr', async (req, res) => {
  try {
    const { pnr } = req.params;

    const result = await sabreService.cancelBooking(pnr);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/sabre/status
 * Get Sabre service status
 */
router.get('/status', async (req, res) => {
  try {
    const status = await sabreService.getStatus();

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;