/**
 * PayPal Payment Routes
 * Handles PayPal payment processing endpoints
 */

const express = require('express');
const router = express.Router();
const paypalService = require('../src/services/paypalService');
const bookingService = require('../src/services/bookingService');
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * @route   POST /api/paypal/create-order
 * @desc    Create PayPal order for booking
 * @access  Private
 */
router.post('/create-order', authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user.id;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        error: 'Booking ID is required'
      });
    }

    // Get booking details
    const booking = await bookingService.getBookingById(bookingId, userId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Check if booking is already paid
    if (booking.payment_status === 'succeeded') {
      return res.status(400).json({
        success: false,
        error: 'Booking is already paid'
      });
    }

    // Create PayPal order
    const orderData = {
      totalPrice: parseFloat(booking.total_price),
      currency: booking.currency || 'USD',
      bookingReference: booking.booking_reference,
      origin: booking.origin,
      destination: booking.destination
    };

    const paypalOrder = await paypalService.createOrder(orderData);

    // Update booking with PayPal order ID
    await bookingService.updateBooking(bookingId, userId, {
      payment_status: 'processing',
      paypal_order_id: paypalOrder.orderId,
      metadata: {
        ...booking.metadata,
        paypal_order_created_at: new Date().toISOString()
      }
    });

    logger.info('PayPal order created for booking', {
      bookingId,
      orderId: paypalOrder.orderId,
      userId
    });

    res.json({
      success: true,
      orderId: paypalOrder.orderId,
      approvalUrl: paypalOrder.approvalUrl,
      links: paypalOrder.links
    });

  } catch (error) {
    logger.error('PayPal order creation failed', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/paypal/capture-order
 * @desc    Capture PayPal order (complete payment)
 * @access  Private
 */
router.post('/capture-order', authenticateToken, async (req, res) => {
  try {
    const { orderId, bookingId } = req.body;
    const userId = req.user.id;

    if (!orderId || !bookingId) {
      return res.status(400).json({
        success: false,
        error: 'Order ID and Booking ID are required'
      });
    }

    // Capture the PayPal order
    const captureResult = await paypalService.captureOrder(orderId);

    if (!captureResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Payment capture failed'
      });
    }

    // Update booking status
    await bookingService.updateBooking(bookingId, userId, {
      payment_status: 'succeeded',
      booking_status: 'confirmed',
      paypal_capture_id: captureResult.captureId,
      metadata: {
        paypal_order_id: orderId,
        paypal_capture_id: captureResult.captureId,
        paypal_payer_email: captureResult.payerEmail,
        paypal_payer_name: captureResult.payerName,
        payment_completed_at: new Date().toISOString()
      }
    });

    logger.info('PayPal payment captured successfully', {
      bookingId,
      orderId,
      captureId: captureResult.captureId,
      userId
    });

    res.json({
      success: true,
      message: 'Payment completed successfully',
      captureId: captureResult.captureId,
      status: captureResult.status
    });

  } catch (error) {
    logger.error('PayPal capture failed', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/paypal/order/:orderId
 * @desc    Get PayPal order details
 * @access  Private
 */
router.get('/order/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;

    const orderDetails = await paypalService.getOrderDetails(orderId);

    res.json({
      success: true,
      order: orderDetails.order
    });

  } catch (error) {
    logger.error('Failed to get PayPal order details', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/paypal/refund
 * @desc    Refund a PayPal payment
 * @access  Private
 */
router.post('/refund', authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user.id;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        error: 'Booking ID is required'
      });
    }

    // Get booking details
    const booking = await bookingService.getBookingById(bookingId, userId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Check if booking can be refunded
    if (booking.payment_status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        error: 'Only paid bookings can be refunded'
      });
    }

    const captureId = booking.metadata?.paypal_capture_id;
    if (!captureId) {
      return res.status(400).json({
        success: false,
        error: 'PayPal capture ID not found'
      });
    }

    // Process refund
    const refundResult = await paypalService.refundPayment(
      captureId,
      parseFloat(booking.total_price),
      booking.currency || 'USD'
    );

    // Update booking status
    await bookingService.updateBooking(bookingId, userId, {
      payment_status: 'refunded',
      booking_status: 'cancelled',
      metadata: {
        ...booking.metadata,
        paypal_refund_id: refundResult.refundId,
        refund_processed_at: new Date().toISOString()
      }
    });

    logger.info('PayPal refund processed', {
      bookingId,
      refundId: refundResult.refundId,
      userId
    });

    res.json({
      success: true,
      message: 'Refund processed successfully',
      refundId: refundResult.refundId,
      status: refundResult.status
    });

  } catch (error) {
    logger.error('PayPal refund failed', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/paypal/webhook
 * @desc    Handle PayPal webhook events
 * @access  Public (verified by PayPal signature)
 */
router.post('/webhook', async (req, res) => {
  try {
    const webhookEvent = req.body;
    const headers = req.headers;

    // Verify webhook signature
    const verification = await paypalService.verifyWebhookSignature(webhookEvent, headers);

    if (!verification.verified) {
      logger.warn('PayPal webhook verification failed');
      return res.status(400).json({
        success: false,
        error: 'Webhook verification failed'
      });
    }

    // Handle different event types
    const eventType = webhookEvent.event_type;

    logger.info('PayPal webhook received', { eventType });

    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        // Payment was captured successfully
        await handlePaymentCaptured(webhookEvent);
        break;

      case 'PAYMENT.CAPTURE.DENIED':
        // Payment was denied
        await handlePaymentDenied(webhookEvent);
        break;

      case 'PAYMENT.CAPTURE.REFUNDED':
        // Payment was refunded
        await handlePaymentRefunded(webhookEvent);
        break;

      default:
        logger.info('Unhandled PayPal webhook event', { eventType });
    }

    res.json({ success: true, received: true });

  } catch (error) {
    logger.error('PayPal webhook processing failed', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Handle payment captured event
 */
async function handlePaymentCaptured(event) {
  try {
    const captureId = event.resource.id;
    const orderId = event.resource.supplementary_data?.related_ids?.order_id;

    logger.info('Payment captured webhook', { captureId, orderId });

    // Update booking status if needed
    // This is a backup in case the frontend capture didn't work

  } catch (error) {
    logger.error('Failed to handle payment captured', { error: error.message });
  }
}

/**
 * Handle payment denied event
 */
async function handlePaymentDenied(event) {
  try {
    const captureId = event.resource.id;
    logger.warn('Payment denied webhook', { captureId });

    // Update booking status to failed
    // Find booking by PayPal capture ID and update

  } catch (error) {
    logger.error('Failed to handle payment denied', { error: error.message });
  }
}

/**
 * Handle payment refunded event
 */
async function handlePaymentRefunded(event) {
  try {
    const refundId = event.resource.id;
    logger.info('Payment refunded webhook', { refundId });

    // Update booking status to refunded
    // Find booking by PayPal refund ID and update

  } catch (error) {
    logger.error('Failed to handle payment refunded', { error: error.message });
  }
}

/**
 * @route   GET /api/paypal/health
 * @desc    Check PayPal service health
 * @access  Public
 */
router.get('/health', async (req, res) => {
  try {
    const health = await paypalService.healthCheck();
    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

module.exports = router;
