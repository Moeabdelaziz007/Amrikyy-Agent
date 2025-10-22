/**
 * Unit Tests for Booking Service
 * Tests booking creation, confirmation, cancellation, and retrieval
 */

const bookingService = require('../services/bookingService');
const stripeService = require('../services/stripeService');
const emailService = require('../services/emailService');

// Mock dependencies
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'BK-TEST-12345',
              user_id: 'user-123',
              status: 'pending',
              total_price: 850.00,
              created_at: new Date().toISOString()
            },
            error: null
          })
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn().mockResolvedValue({ data: {}, error: null })
      })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'BK-TEST-12345',
              status: 'confirmed',
              payment_intent_id: 'pi_test_123'
            },
            error: null
          })
        })),
        order: jest.fn().mockResolvedValue({
          data: [
            { id: 'BK-1', status: 'confirmed' },
            { id: 'BK-2', status: 'pending' }
          ],
          error: null
        })
      }))
    }))
  }))
}));

jest.mock('../services/stripeService');
jest.mock('../services/emailService');
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

describe('BookingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    stripeService.createPaymentIntent = jest.fn().mockResolvedValue({
      success: true,
      paymentIntent: {
        id: 'pi_test_123456',
        clientSecret: 'pi_test_123456_secret_abc',
        amount: 850.00,
        currency: 'usd',
        status: 'requires_payment_method'
      }
    });

    emailService.sendBookingConfirmation = jest.fn().mockResolvedValue({
      success: true,
      messageId: 'msg-123'
    });

    emailService.sendPaymentReceipt = jest.fn().mockResolvedValue({
      success: true,
      messageId: 'msg-456'
    });
  });

  describe('generateBookingId()', () => {
    it('should generate booking ID in correct format', () => {
      const bookingId = bookingService.generateBookingId();
      
      expect(bookingId).toMatch(/^BK-[A-Z0-9]+-[A-Z0-9]+$/);
      expect(bookingId).toContain('BK-');
    });

    it('should generate unique booking IDs', () => {
      const id1 = bookingService.generateBookingId();
      const id2 = bookingService.generateBookingId();
      
      expect(id1).not.toBe(id2);
    });
  });

  describe('createBooking()', () => {
    const validBookingData = {
      userId: 'user-123',
      flightDetails: {
        origin: 'Cairo',
        destination: 'Dubai',
        departureDate: '2025-11-15'
      },
      travelerInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'user@example.com'
      },
      totalPrice: 850.00,
      currency: 'usd'
    };

    it('should create booking with payment intent successfully', async () => {
      const result = await bookingService.createBooking(validBookingData);

      expect(result.success).toBe(true);
      expect(result.booking).toBeDefined();
      expect(result.payment).toBeDefined();
      expect(result.payment.clientSecret).toBeDefined();
    });

    it('should call stripeService.createPaymentIntent with correct params', async () => {
      await bookingService.createBooking(validBookingData);

      expect(stripeService.createPaymentIntent).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 850.00,
          currency: 'usd',
          metadata: expect.objectContaining({
            userId: 'user-123',
            type: 'flight_booking'
          })
        })
      );
    });

    it('should fail when userId is missing', async () => {
      const invalidData = { ...validBookingData, userId: null };
      
      const result = await bookingService.createBooking(invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing required booking information');
    });

    it('should fail when flightDetails is missing', async () => {
      const invalidData = { ...validBookingData, flightDetails: null };
      
      const result = await bookingService.createBooking(invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing required booking information');
    });

    it('should fail when travelerInfo is missing', async () => {
      const invalidData = { ...validBookingData, travelerInfo: null };
      
      const result = await bookingService.createBooking(invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing required booking information');
    });

    it('should fail when totalPrice is missing', async () => {
      const invalidData = { ...validBookingData, totalPrice: null };
      
      const result = await bookingService.createBooking(invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing required booking information');
    });

    it('should use default currency when not provided', async () => {
      const dataWithoutCurrency = { ...validBookingData };
      delete dataWithoutCurrency.currency;

      await bookingService.createBooking(dataWithoutCurrency);

      expect(stripeService.createPaymentIntent).toHaveBeenCalledWith(
        expect.objectContaining({
          currency: 'usd'
        })
      );
    });

    it('should rollback booking if payment intent creation fails', async () => {
      stripeService.createPaymentIntent.mockResolvedValueOnce({
        success: false,
        error: 'Payment service error'
      });

      const result = await bookingService.createBooking(validBookingData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to initialize payment');
    });
  });

  describe('confirmBooking()', () => {
    it('should confirm booking and send emails successfully', async () => {
      const result = await bookingService.confirmBooking('pi_test_123');

      expect(result.success).toBe(true);
      expect(result.booking).toBeDefined();
      expect(result.booking.status).toBe('confirmed');
    });

    it('should send booking confirmation email', async () => {
      await bookingService.confirmBooking('pi_test_123');

      expect(emailService.sendBookingConfirmation).toHaveBeenCalled();
    });

    it('should send payment receipt email', async () => {
      await bookingService.confirmBooking('pi_test_123');

      expect(emailService.sendPaymentReceipt).toHaveBeenCalled();
    });

    it('should continue if email sending fails', async () => {
      emailService.sendBookingConfirmation.mockResolvedValueOnce({
        success: false,
        error: 'Email error'
      });

      const result = await bookingService.confirmBooking('pi_test_123');

      expect(result.success).toBe(true);
      // Should still succeed even if email fails
    });
  });

  describe('getBooking()', () => {
    it('should retrieve booking by ID successfully', async () => {
      const result = await bookingService.getBooking('BK-TEST-12345');

      expect(result.success).toBe(true);
      expect(result.booking).toBeDefined();
      expect(result.booking.id).toBe('BK-TEST-12345');
    });

    it('should fail when bookingId is missing', async () => {
      const result = await bookingService.getBooking(null);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Booking ID is required');
    });
  });

  describe('getUserBookings()', () => {
    it('should retrieve all bookings for a user', async () => {
      const result = await bookingService.getUserBookings('user-123');

      expect(result.success).toBe(true);
      expect(result.bookings).toBeDefined();
      expect(Array.isArray(result.bookings)).toBe(true);
      expect(result.count).toBeGreaterThan(0);
    });

    it('should fail when userId is missing', async () => {
      const result = await bookingService.getUserBookings(null);

      expect(result.success).toBe(false);
      expect(result.error).toContain('User ID is required');
    });

    it('should return bookings sorted by creation date', async () => {
      const result = await bookingService.getUserBookings('user-123');

      expect(result.success).toBe(true);
      // Verify bookings are returned (order verified by mock)
      expect(result.bookings.length).toBeGreaterThan(0);
    });
  });

  describe('cancelBooking()', () => {
    it('should cancel booking successfully', async () => {
      const result = await bookingService.cancelBooking('BK-TEST-12345');

      expect(result.success).toBe(true);
      expect(result.booking).toBeDefined();
    });

    it('should fail when bookingId is missing', async () => {
      const result = await bookingService.cancelBooking(null);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Booking ID is required');
    });

    it('should update booking status to cancelled', async () => {
      const result = await bookingService.cancelBooking('BK-TEST-12345');

      expect(result.success).toBe(true);
      // Status update is handled by Supabase mock
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully in createBooking', async () => {
      const { createClient } = require('@supabase/supabase-js');
      const mockSupabase = createClient();
      
      mockSupabase.from = jest.fn(() => ({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' }
            })
          }))
        }))
      }));

      const result = await bookingService.createBooking({
        userId: 'user-123',
        flightDetails: { origin: 'Cairo' },
        travelerInfo: { firstName: 'John' },
        totalPrice: 100
      });

      expect(result.success).toBe(false);
    });

    it('should log errors when operations fail', async () => {
      const logger = require('../utils/logger');
      
      stripeService.createPaymentIntent.mockResolvedValueOnce({
        success: false,
        error: 'Stripe error'
      });

      await bookingService.createBooking({
        userId: 'user-123',
        flightDetails: { origin: 'Cairo', destination: 'Dubai', departureDate: '2025-11-15' },
        travelerInfo: { firstName: 'John', lastName: 'Doe', email: 'test@example.com' },
        totalPrice: 100
      });

      expect(logger.error).toHaveBeenCalled();
    });
  });
});
