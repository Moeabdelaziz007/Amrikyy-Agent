/**
 * Test Suite for Booking Service
 * Tests booking creation, retrieval, updates, and cancellation
 */

// Mock Supabase before requiring bookingService
const mockSupabaseClient = {
  from: jest.fn()
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient)
}));

const bookingService = require('../src/services/bookingService');

describe('Booking Service', () => {
  let mockInsert, mockSelect, mockUpdate, mockEq, mockSingle, mockOrder, mockLimit;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock chain
    mockSingle = jest.fn();
    mockLimit = jest.fn().mockReturnValue({ data: [], error: null });
    mockOrder = jest.fn().mockReturnThis();
    mockEq = jest.fn().mockReturnThis();
    
    mockSelect = jest.fn().mockReturnThis();
    mockUpdate = jest.fn().mockReturnThis();
    mockInsert = jest.fn().mockReturnThis();
    
    // Configure return values to allow chaining
    mockSelect.mockImplementation(() => ({
      single: mockSingle,
      eq: mockEq,
      order: mockOrder,
      limit: mockLimit,
    }));
    
    mockInsert.mockImplementation(() => ({
      select: mockSelect,
    }));
    
    mockUpdate.mockImplementation(() => ({
      eq: mockEq,
      select: mockSelect,
    }));
    
    mockEq.mockImplementation(() => ({
      single: mockSingle,
      select: mockSelect,
      eq: mockEq,
      order: mockOrder,
    }));
    
    mockOrder.mockImplementation(() => ({
      limit: mockLimit,
      data: [],
      error: null,
    }));
    
    mockSupabaseClient.from.mockReturnValue({
      insert: mockInsert,
      select: mockSelect,
      update: mockUpdate,
    });
  });

  describe('generateBookingReference', () => {
    it('should generate unique booking reference with correct format', () => {
      const ref1 = bookingService.generateBookingReference();
      const ref2 = bookingService.generateBookingReference();

      expect(ref1).toMatch(/^AMR[A-Z0-9]+$/);
      expect(ref2).toMatch(/^AMR[A-Z0-9]+$/);
      expect(ref1).not.toBe(ref2);
    });

    it('should start with AMR prefix', () => {
      const reference = bookingService.generateBookingReference();
      expect(reference.startsWith('AMR')).toBe(true);
    });
  });

  describe('createBooking', () => {
    const userId = 'user123';
    const bookingData = {
      flightData: { flight: 'AA123' },
      origin: 'JFK',
      destination: 'LAX',
      departureDate: '2025-12-01',
      returnDate: '2025-12-10',
      travelers: [
        { name: 'John Doe', age: 30 },
        { name: 'Jane Doe', age: 28 },
      ],
      totalPrice: 500.00,
      currency: 'USD',
    };

    it('should create booking successfully', async () => {
      const mockBooking = {
        id: 'booking123',
        user_id: userId,
        booking_reference: 'AMRTEST123',
        ...bookingData,
      };

      mockSingle.mockResolvedValue({ data: mockBooking, error: null });

      const result = await bookingService.createBooking(userId, bookingData);

      expect(result.success).toBe(true);
      expect(result.booking).toEqual(mockBooking);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('bookings');
    });

    it('should handle database error during creation', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: new Error('Database connection failed'),
      });

      const result = await bookingService.createBooking(userId, bookingData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
    });

    it('should set correct default currency', async () => {
      const bookingDataWithoutCurrency = { ...bookingData };
      delete bookingDataWithoutCurrency.currency;

      mockSingle.mockResolvedValue({ data: {}, error: null });

      await bookingService.createBooking(userId, bookingDataWithoutCurrency);

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          currency: 'USD',
        })
      );
    });
  });

  describe('getBooking', () => {
    it('should retrieve booking by ID', async () => {
      const mockBooking = {
        id: 'booking123',
        user_id: 'user123',
      };

      mockSingle.mockResolvedValue({ data: mockBooking, error: null });

      const result = await bookingService.getBooking('booking123', 'user123');

      expect(result.success).toBe(true);
      expect(result.booking).toEqual(mockBooking);
    });

    it('should handle booking not found', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: new Error('Booking not found'),
      });

      const result = await bookingService.getBooking('invalid', 'user123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Booking not found');
    });
  });

  describe('getBookingByReference', () => {
    it('should retrieve booking by reference', async () => {
      const mockBooking = {
        id: 'booking123',
        booking_reference: 'AMRTEST123',
      };

      mockSingle.mockResolvedValue({ data: mockBooking, error: null });

      const result = await bookingService.getBookingByReference('AMRTEST123', 'user123');

      expect(result.success).toBe(true);
      expect(result.booking).toEqual(mockBooking);
    });
  });

  describe('getUserBookings', () => {
    it('should retrieve all user bookings', async () => {
      const mockBookings = [
        { id: 'booking1' },
        { id: 'booking2' },
      ];

      mockOrder.mockReturnValue({ data: mockBookings, error: null });

      const result = await bookingService.getUserBookings('user123');

      expect(result.success).toBe(true);
      expect(result.bookings).toEqual(mockBookings);
      expect(result.count).toBe(2);
    });

    it('should handle database error', async () => {
      mockOrder.mockReturnValue({
        data: null,
        error: new Error('Query failed'),
      });

      const result = await bookingService.getUserBookings('user123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Query failed');
    });
  });

  describe('updateBookingStatus', () => {
    it('should update booking status successfully', async () => {
      const mockUpdatedBooking = {
        id: 'booking123',
        booking_status: 'confirmed',
      };

      mockSingle.mockResolvedValue({ data: mockUpdatedBooking, error: null });

      const result = await bookingService.updateBookingStatus('booking123', 'confirmed');

      expect(result.success).toBe(true);
      expect(result.booking).toEqual(mockUpdatedBooking);
    });

    it('should handle update error', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: new Error('Update failed'),
      });

      const result = await bookingService.updateBookingStatus('booking123', 'confirmed');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Update failed');
    });
  });

  describe('cancelBooking', () => {
    it('should cancel booking successfully', async () => {
      const mockCancelledBooking = {
        id: 'booking123',
        booking_status: 'cancelled',
      };

      mockSingle.mockResolvedValue({ data: mockCancelledBooking, error: null });

      const result = await bookingService.cancelBooking('booking123', 'user123');

      expect(result.success).toBe(true);
      expect(result.booking.booking_status).toBe('cancelled');
    });

    it('should handle cancellation error', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: new Error('Cancellation failed'),
      });

      const result = await bookingService.cancelBooking('booking123', 'user123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Cancellation failed');
    });
  });

  describe('getBookingStats', () => {
    it('should calculate booking statistics correctly', async () => {
      const mockBookings = [
        { booking_status: 'pending', total_price: '100' },
        { booking_status: 'confirmed', total_price: '200' },
        { booking_status: 'confirmed', total_price: '300' },
        { booking_status: 'cancelled', total_price: '50' },
      ];

      mockEq.mockReturnValue({ data: mockBookings, error: null });

      const result = await bookingService.getBookingStats('user123');

      expect(result.success).toBe(true);
      expect(result.stats.total).toBe(4);
      expect(result.stats.confirmed).toBe(2);
      expect(result.stats.totalSpent).toBe(500);
    });

    it('should handle empty booking list', async () => {
      mockEq.mockReturnValue({ data: [], error: null });

      const result = await bookingService.getBookingStats('user123');

      expect(result.success).toBe(true);
      expect(result.stats.total).toBe(0);
      expect(result.stats.totalSpent).toBe(0);
    });

    it('should only count confirmed bookings in totalSpent', async () => {
      const mockBookings = [
        { booking_status: 'pending', total_price: '100' },
        { booking_status: 'cancelled', total_price: '200' },
      ];

      mockEq.mockReturnValue({ data: mockBookings, error: null });

      const result = await bookingService.getBookingStats('user123');

      expect(result.stats.totalSpent).toBe(0);
    });
  });
});
