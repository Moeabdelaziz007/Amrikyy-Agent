/**
 * Booking Service
 * Handles flight bookings, payment processing, and email notifications
 * Orchestrates the complete booking workflow
 */

const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');
const stripeService = require('./stripeService');
const emailService = require('./emailService');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

class BookingService {
  /**
   * Create a new booking with payment intent
   * This is the main orchestrator for the booking workflow
   */
  async createBooking({ userId, flightDetails, travelerInfo, totalPrice, currency = 'usd' }) {
    try {
      logger.info('Creating new booking', { userId, totalPrice });

      // Validate required fields
      if (!userId || !flightDetails || !travelerInfo || !totalPrice) {
        return {
          success: false,
          error: 'Missing required booking information'
        };
      }

      // Generate unique booking ID
      const bookingId = this.generateBookingId();

      // Create booking record with 'pending' status
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          id: bookingId,
          user_id: userId,
          flight_details: flightDetails,
          traveler_info: travelerInfo,
          total_price: totalPrice,
          currency: currency,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (bookingError) {
        logger.error('Failed to create booking record', { error: bookingError.message });
        return {
          success: false,
          error: 'Failed to create booking'
        };
      }

      logger.info('Booking record created', { bookingId });

      // Create Stripe payment intent
      const paymentResult = await stripeService.createPaymentIntent({
        amount: totalPrice,
        currency: currency,
        metadata: {
          bookingId: bookingId,
          userId: userId,
          type: 'flight_booking'
        }
      });

      if (!paymentResult.success) {
        // Rollback: Delete the booking if payment intent creation fails
        await this.cancelBooking(bookingId);
        
        logger.error('Failed to create payment intent', { bookingId });
        return {
          success: false,
          error: 'Failed to initialize payment'
        };
      }

      // Update booking with payment intent ID
      await supabase
        .from('bookings')
        .update({
          payment_intent_id: paymentResult.paymentIntent.id
        })
        .eq('id', bookingId);

      logger.info('Booking created successfully', {
        bookingId,
        paymentIntentId: paymentResult.paymentIntent.id
      });

      return {
        success: true,
        booking: {
          id: bookingId,
          status: 'pending',
          flightDetails: flightDetails,
          travelerInfo: travelerInfo,
          totalPrice: totalPrice,
          currency: currency
        },
        payment: {
          clientSecret: paymentResult.paymentIntent.clientSecret,
          paymentIntentId: paymentResult.paymentIntent.id
        }
      };

    } catch (error) {
      logger.error('Booking creation error', { error: error.message });
      return {
        success: false,
        error: 'Failed to create booking'
      };
    }
  }

  /**
   * Confirm booking after successful payment
   * Called by Stripe webhook
   */
  async confirmBooking(paymentIntentId) {
    try {
      logger.info('Confirming booking', { paymentIntentId });

      // Get booking by payment intent ID
      const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select('*')
        .eq('payment_intent_id', paymentIntentId)
        .single();

      if (fetchError || !booking) {
        logger.error('Booking not found', { paymentIntentId });
        return {
          success: false,
          error: 'Booking not found'
        };
      }

      // Update booking status to 'confirmed'
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          status: 'confirmed',
          confirmed_at: new Date().toISOString()
        })
        .eq('id', booking.id);

      if (updateError) {
        logger.error('Failed to update booking status', { error: updateError.message });
        return {
          success: false,
          error: 'Failed to confirm booking'
        };
      }

      logger.info('Booking confirmed successfully', { bookingId: booking.id });

      // Send booking confirmation email
      try {
        await emailService.sendBookingConfirmation({
          email: booking.traveler_info.email,
          bookingId: booking.id,
          flightDetails: booking.flight_details,
          travelerInfo: booking.traveler_info,
          totalPrice: `${booking.currency.toUpperCase()} ${booking.total_price}`,
          bookingDate: booking.created_at
        });
        logger.info('Booking confirmation email sent', { bookingId: booking.id });
      } catch (emailError) {
        logger.warn('Failed to send booking confirmation email', { error: emailError.message });
      }

      // Send payment receipt email
      try {
        await emailService.sendPaymentReceipt({
          email: booking.traveler_info.email,
          bookingId: booking.id,
          amount: booking.total_price,
          currency: booking.currency,
          paymentIntentId: paymentIntentId,
          paymentDate: new Date().toLocaleDateString()
        });
        logger.info('Payment receipt email sent', { bookingId: booking.id });
      } catch (emailError) {
        logger.warn('Failed to send payment receipt email', { error: emailError.message });
      }

      return {
        success: true,
        booking: {
          id: booking.id,
          status: 'confirmed'
        }
      };

    } catch (error) {
      logger.error('Booking confirmation error', { error: error.message });
      return {
        success: false,
        error: 'Failed to confirm booking'
      };
    }
  }

  /**
   * Mark booking as failed
   * Called by Stripe webhook when payment fails
   */
  async failBooking(paymentIntentId) {
    try {
      logger.info('Marking booking as failed', { paymentIntentId });

      const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select('*')
        .eq('payment_intent_id', paymentIntentId)
        .single();

      if (fetchError || !booking) {
        logger.error('Booking not found', { paymentIntentId });
        return {
          success: false,
          error: 'Booking not found'
        };
      }

      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          status: 'failed',
          failed_at: new Date().toISOString()
        })
        .eq('id', booking.id);

      if (updateError) {
        logger.error('Failed to update booking status', { error: updateError.message });
        return {
          success: false,
          error: 'Failed to update booking'
        };
      }

      logger.info('Booking marked as failed', { bookingId: booking.id });

      return {
        success: true,
        booking: {
          id: booking.id,
          status: 'failed'
        }
      };

    } catch (error) {
      logger.error('Booking failure error', { error: error.message });
      return {
        success: false,
        error: 'Failed to update booking'
      };
    }
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(bookingId) {
    try {
      logger.info('Canceling booking', { bookingId });

      const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (fetchError || !booking) {
        return {
          success: false,
          error: 'Booking not found'
        };
      }

      // Cancel payment intent if exists
      if (booking.payment_intent_id) {
        await stripeService.cancelPaymentIntent(booking.payment_intent_id);
      }

      // Update booking status
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (updateError) {
        logger.error('Failed to cancel booking', { error: updateError.message });
        return {
          success: false,
          error: 'Failed to cancel booking'
        };
      }

      logger.info('Booking cancelled successfully', { bookingId });

      return {
        success: true,
        booking: {
          id: bookingId,
          status: 'cancelled'
        }
      };

    } catch (error) {
      logger.error('Booking cancellation error', { error: error.message });
      return {
        success: false,
        error: 'Failed to cancel booking'
      };
    }
  }

  /**
   * Get booking by ID
   */
  async getBooking(bookingId) {
    try {
      const { data: booking, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (error || !booking) {
        return {
          success: false,
          error: 'Booking not found'
        };
      }

      return {
        success: true,
        booking: booking
      };

    } catch (error) {
      logger.error('Get booking error', { error: error.message });
      return {
        success: false,
        error: 'Failed to retrieve booking'
      };
    }
  }

  /**
   * Get user bookings
   */
  async getUserBookings(userId, { status = null, limit = 10, offset = 0 } = {}) {
    try {
      let query = supabase
        .from('bookings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (status) {
        query = query.eq('status', status);
      }

      const { data: bookings, error } = await query;

      if (error) {
        logger.error('Failed to fetch user bookings', { error: error.message });
        return {
          success: false,
          error: 'Failed to retrieve bookings'
        };
      }

      return {
        success: true,
        bookings: bookings,
        count: bookings.length
      };

    } catch (error) {
      logger.error('Get user bookings error', { error: error.message });
      return {
        success: false,
        error: 'Failed to retrieve bookings'
      };
    }
  }

  /**
   * Generate unique booking ID
   */
  generateBookingId() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `BK-${timestamp}-${random}`;
  }

  /**
   * Request refund for a booking
   */
  async requestRefund(bookingId, amount = null) {
    try {
      logger.info('Requesting refund', { bookingId, amount });

      const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (fetchError || !booking) {
        return {
          success: false,
          error: 'Booking not found'
        };
      }

      if (booking.status !== 'confirmed') {
        return {
          success: false,
          error: 'Only confirmed bookings can be refunded'
        };
      }

      if (!booking.payment_intent_id) {
        return {
          success: false,
          error: 'No payment found for this booking'
        };
      }

      // Create refund via Stripe
      const refundResult = await stripeService.createRefund(
        booking.payment_intent_id,
        amount
      );

      if (!refundResult.success) {
        return {
          success: false,
          error: 'Failed to process refund'
        };
      }

      // Update booking status
      await supabase
        .from('bookings')
        .update({
          status: 'refunded',
          refunded_at: new Date().toISOString(),
          refund_amount: refundResult.refund.amount
        })
        .eq('id', bookingId);

      logger.info('Refund processed successfully', {
        bookingId,
        refundId: refundResult.refund.id
      });

      return {
        success: true,
        refund: refundResult.refund
      };

    } catch (error) {
      logger.error('Refund request error', { error: error.message });
      return {
        success: false,
        error: 'Failed to process refund'
      };
    }
  }
}

// Export singleton instance
const bookingService = new BookingService();
module.exports = bookingService;
