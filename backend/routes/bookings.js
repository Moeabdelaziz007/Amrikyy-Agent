const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/auth');

// Create a new booking
router.post('/', authMiddleware, bookingController.createBooking);

// Update a booking
router.put('/:id', authMiddleware, bookingController.updateBooking);

// Delete a booking
router.delete('/:id', authMiddleware, bookingController.deleteBooking);

// Get detailed itinerary for a booking
router.get('/:id/itinerary', authMiddleware, bookingController.getItinerary);

// Book flights/hotels for a booking
router.post('/:id/book', authMiddleware, bookingController.bookTrip);

module.exports = router;
