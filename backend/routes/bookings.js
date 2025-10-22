/**
 * Booking Routes
 * Handles flight booking operations with payment integration
 */

const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const bookingService = require('../services/bookingService');
const { authenticateUser } = require('../middleware/jwtAuth');
const {
  validateBooking,
  validateBookingId,
  validateUserId,
  validatePagination,
  validateRefund
} = require('../middleware/validation');
const { asyncHandler, createSuccessResponse } = require('../middleware/errorHandler');

/**
 * @route   POST /api/bookings
 * @desc    Create a new booking with payment intent
 * @access  Private
 * @body    { flightDetails, travelerInfo, totalPrice, currency }
 */
router.post('/', authenticateUser, validateBooking, asyncHandler(async (req, res) => {
  const { flightDetails, travelerInfo, totalPrice, currency } = req.body;
  const userId = req.user.id; // From JWT middleware

  logger.info('Creating booking', { userId, totalPrice });

  const result = await bookingService.createBooking({
    userId,
    flightDetails,
    travelerInfo,
    totalPrice,
    currency: currency || 'usd'
  });

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.status(201).json(createSuccessResponse(result, 'Booking created successfully'));
}));

/**
 * @route   GET /api/bookings/:id
 * @desc    Get booking details by ID
 * @access  Private
 */
router.get('/:id', authenticateUser, validateBookingId, asyncHandler(async (req, res) => {
  const { id } = req.params;

  logger.info('Fetching booking', { bookingId: id });

  const result = await bookingService.getBooking(id);

  if (!result.success) {
    return res.status(404).json(result);
  }

  res.json(createSuccessResponse(result.booking));
}));

/**
 * @route   GET /api/bookings/user/:userId
 * @desc    Get all bookings for a user
 * @access  Private
 */
router.get('/user/:userId', authenticateUser, validateUserId, validatePagination, asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { status, limit = 10, offset = 0 } = req.query;

  logger.info('Fetching user bookings', { userId, status, limit, offset });

  const result = await bookingService.getUserBookings(userId, {
    status,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(createSuccessResponse({
    bookings: result.bookings,
    count: result.count,
    limit: parseInt(limit),
    offset: parseInt(offset)
  }));
}));

/**
 * @route   POST /api/bookings/:id/cancel
 * @desc    Cancel a booking
 * @access  Private
 */
router.post('/:id/cancel', authenticateUser, validateBookingId, asyncHandler(async (req, res) => {
  const { id } = req.params;

  logger.info('Canceling booking', { bookingId: id });

  const result = await bookingService.cancelBooking(id);

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(createSuccessResponse(result.booking, 'Booking cancelled successfully'));
}));

/**
 * @route   POST /api/bookings/:id/refund
 * @desc    Request a refund for a booking
 * @access  Private
 */
router.post('/:id/refund', authenticateUser, validateBookingId, validateRefund, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  logger.info('Requesting refund', { bookingId: id, amount });

  const result = await bookingService.requestRefund(id, amount);

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(createSuccessResponse(result.refund, 'Refund processed successfully'));
}));

/**
 * @route   GET /api/bookings
 * @desc    Get all bookings (admin only - placeholder)
 * @access  Private/Admin
 */
router.get('/', authenticateUser, asyncHandler(async (req, res) => {
  // TODO: Implement admin check
  logger.info('Fetching all bookings (admin)');

  res.json(createSuccessResponse({
    message: 'Admin endpoint - implementation pending',
    bookings: []
  }));
}));

module.exports = router;