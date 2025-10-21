/**
 * Booking Service
 * Handles all booking operations
 */

const { createClient } = require('@supabase/supabase-js');
const logger = require('../../utils/logger');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

class BookingService {
  /**
   * Generate unique booking reference
   */
  generateBookingReference() {
    const prefix = 'AMR';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }

  /**
   * Create booking
   */
  async createBooking(userId, bookingData) {
    try {
      const bookingReference = this.generateBookingReference();

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          user_id: userId,
          flight_data: bookingData.flightData,
          origin: bookingData.origin,
          destination: bookingData.destination,
          departure_date: bookingData.departureDate,
          return_date: bookingData.returnDate,
          travelers: bookingData.travelers,
          num_travelers: bookingData.travelers.length,
          total_price: bookingData.totalPrice,
          currency: bookingData.currency || 'USD',
          booking_reference: bookingReference,
          booking_status: 'pending',
          payment_status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      logger.info(`✅ Booking created: ${bookingReference}`);
      return {
        success: true,
        booking: data,
      };
    } catch (error) {
      logger.error('❌ Create booking error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get booking by ID
   */
  async getBooking(bookingId, userId) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      return {
        success: true,
        booking: data,
      };
    } catch (error) {
      logger.error('❌ Get booking error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get booking by reference
   */
  async getBookingByReference(bookingReference, userId) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('booking_reference', bookingReference)
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      return {
        success: true,
        booking: data,
      };
    } catch (error) {
      logger.error('❌ Get booking by reference error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get user bookings
   */
  async getUserBookings(userId, options = {}) {
    try {
      let query = supabase
        .from('bookings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Filter by status if provided
      if (options.status) {
        query = query.eq('booking_status', options.status);
      }

      // Limit results
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        success: true,
        bookings: data,
        count: data.length,
      };
    } catch (error) {
      logger.error('❌ Get user bookings error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(bookingId, status, paymentData = {}) {
    try {
      const updateData = {
        booking_status: status,
        updated_at: new Date().toISOString(),
      };

      if (paymentData.paymentStatus) {
        updateData.payment_status = paymentData.paymentStatus;
      }
      if (paymentData.paymentIntentId) {
        updateData.payment_intent_id = paymentData.paymentIntentId;
      }
      if (paymentData.stripePaymentId) {
        updateData.stripe_payment_id = paymentData.stripePaymentId;
      }

      const { data, error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;

      logger.info(`✅ Booking updated: ${bookingId} - ${status}`);
      return {
        success: true,
        booking: data,
      };
    } catch (error) {
      logger.error('❌ Update booking error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId, userId) {
    try {
      const { data, error} = await supabase
        .from('bookings')
        .update({
          booking_status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      logger.info(`✅ Booking cancelled: ${bookingId}`);
      return {
        success: true,
        booking: data,
      };
    } catch (error) {
      logger.error('❌ Cancel booking error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get booking statistics
   */
  async getBookingStats(userId) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('booking_status, total_price')
        .eq('user_id', userId);

      if (error) throw error;

      const stats = {
        total: data.length,
        pending: data.filter((b) => b.booking_status === 'pending').length,
        confirmed: data.filter((b) => b.booking_status === 'confirmed').length,
        cancelled: data.filter((b) => b.booking_status === 'cancelled').length,
        totalSpent: data
          .filter((b) => b.booking_status === 'confirmed')
          .reduce((sum, b) => sum + parseFloat(b.total_price), 0),
      };

      return {
        success: true,
        stats,
      };
    } catch (error) {
      logger.error('❌ Get booking stats error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = new BookingService();
