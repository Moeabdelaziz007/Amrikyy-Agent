/**
 * Stripe Webhook Routes
 * Handles Stripe webhook events for payment processing
 * Automatically confirms/fails bookings and sends email notifications
 */

const express = require('express');
const logger = require('../utils/logger');
const stripeService = require('../services/stripeService');
const bookingService = require('../services/bookingService');

const router = express.Router();

/**
 * @route   POST /api/stripe/webhook
 * @desc    Handle Stripe webhook events
 * @access  Public (but verified with signature)
 * @note    This endpoint must receive raw body (configured in server.js)
 */
router.post('/webhook', async (req, res) => {
  const signature = req.headers['stripe-signature'];

  if (!signature) {
    logger.warn('Webhook received without signature');
    return res.status(400).json({
      success: false,
      error: 'Missing stripe-signature header'
    });
  }

  let event;

  try {
    // Verify webhook signature
    event = stripeService.verifyWebhookSignature(req.body, signature);
    
    logger.info('Webhook received and verified', {
      type: event.type,
      id: event.id
    });

  } catch (err) {
    logger.error('Webhook signature verification failed', {
      error: err.message
    });
    return res.status(400).json({
      success: false,
      error: `Webhook Error: ${err.message}`
    });
  }

  // Handle the webhook event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;

      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event.data.object);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object);
        break;

      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'checkout.session.async_payment_failed':
        await handleCheckoutSessionFailed(event.data.object);
        break;

      default:
        logger.info('Unhandled webhook event type', { type: event.type });
    }

    // Always return 200 to acknowledge receipt
    return res.json({
      success: true,
      received: true,
      eventType: event.type
    });

  } catch (error) {
    logger.error('Webhook handler error', {
      error: error.message,
      eventType: event.type
    });

    // Still return 200 to prevent Stripe from retrying
    return res.json({
      success: false,
      received: true,
      error: error.message
    });
  }
});

/**
 * Handle successful payment intent
 * Confirms the booking and sends confirmation emails
 */
async function handlePaymentIntentSucceeded(paymentIntent) {
  logger.info('Processing payment_intent.succeeded', {
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency
  });

  try {
    // Confirm the booking
    const result = await bookingService.confirmBooking(paymentIntent.id);

    if (result.success) {
      logger.info('Booking confirmed successfully', {
        bookingId: result.booking.id,
        paymentIntentId: paymentIntent.id
      });
    } else {
      logger.error('Failed to confirm booking', {
        error: result.error,
        paymentIntentId: paymentIntent.id
      });
    }

  } catch (error) {
    logger.error('Error handling payment_intent.succeeded', {
      error: error.message,
      paymentIntentId: paymentIntent.id
    });
  }
}

/**
 * Handle failed payment intent
 * Marks the booking as failed
 */
async function handlePaymentIntentFailed(paymentIntent) {
  logger.info('Processing payment_intent.payment_failed', {
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount / 100,
    currency: paymentIntent.currency
  });

  try {
    // Mark booking as failed
    const result = await bookingService.failBooking(paymentIntent.id);

    if (result.success) {
      logger.info('Booking marked as failed', {
        bookingId: result.booking.id,
        paymentIntentId: paymentIntent.id
      });
    } else {
      logger.error('Failed to mark booking as failed', {
        error: result.error,
        paymentIntentId: paymentIntent.id
      });
    }

  } catch (error) {
    logger.error('Error handling payment_intent.payment_failed', {
      error: error.message,
      paymentIntentId: paymentIntent.id
    });
  }
}

/**
 * Handle canceled payment intent
 * Marks the booking as cancelled
 */
async function handlePaymentIntentCanceled(paymentIntent) {
  logger.info('Processing payment_intent.canceled', {
    paymentIntentId: paymentIntent.id
  });

  try {
    const result = await bookingService.failBooking(paymentIntent.id);

    if (result.success) {
      logger.info('Booking cancelled due to payment cancellation', {
        bookingId: result.booking.id,
        paymentIntentId: paymentIntent.id
      });
    }

  } catch (error) {
    logger.error('Error handling payment_intent.canceled', {
      error: error.message,
      paymentIntentId: paymentIntent.id
    });
  }
}

/**
 * Handle refunded charge
 * Updates booking status to refunded
 */
async function handleChargeRefunded(charge) {
  logger.info('Processing charge.refunded', {
    chargeId: charge.id,
    amount: charge.amount_refunded / 100,
    paymentIntentId: charge.payment_intent
  });

  // The refund is already handled by bookingService.requestRefund()
  // This webhook is just for logging and confirmation
  logger.info('Refund processed successfully', {
    chargeId: charge.id,
    paymentIntentId: charge.payment_intent
  });
}

/**
 * Handle completed checkout session
 * For Stripe Checkout flow (alternative to Payment Intents)
 */
async function handleCheckoutSessionCompleted(session) {
  logger.info('Processing checkout.session.completed', {
    sessionId: session.id,
    paymentIntentId: session.payment_intent
  });

  if (session.payment_intent) {
    // If using payment intents, confirm the booking
    const result = await bookingService.confirmBooking(session.payment_intent);

    if (result.success) {
      logger.info('Booking confirmed from checkout session', {
        bookingId: result.booking.id,
        sessionId: session.id
      });
    }
  }
}

/**
 * Handle failed checkout session
 * For Stripe Checkout flow
 */
async function handleCheckoutSessionFailed(session) {
  logger.info('Processing checkout.session.async_payment_failed', {
    sessionId: session.id,
    paymentIntentId: session.payment_intent
  });

  if (session.payment_intent) {
    const result = await bookingService.failBooking(session.payment_intent);

    if (result.success) {
      logger.info('Booking marked as failed from checkout session', {
        bookingId: result.booking.id,
        sessionId: session.id
      });
    }
  }
}

module.exports = router;
