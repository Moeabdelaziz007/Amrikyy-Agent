// Mock logger first as it has no dependencies on other mocks
jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

// Define the mock Supabase object
const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  single: jest.fn(),
};

// Now, mock the supabase-js module to return our mock object
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabase),
}));

// Finally, require the service which will now use the mocked client
const BookingService = require('./bookingService');

describe('Booking Service', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    // Reset the chainable mock parts
    mockSupabase.from.mockReturnThis();
    mockSupabase.insert.mockReturnThis();
    mockSupabase.select.mockReturnThis();
  });

  describe('createBooking', () => {
    it('should create a booking successfully', async () => {
      const userId = 'user-123';
      const bookingData = {
        flightData: { /* flight details */ },
        origin: 'JFK',
        destination: 'LAX',
        departureDate: '2025-12-01',
        returnDate: '2025-12-10',
        travelers: [{ name: 'John Doe' }],
        totalPrice: 500.00,
        currency: 'USD',
      };
      const expectedBooking = { id: 'booking-456', ...bookingData };

      // Configure the mock to return a successful response
      mockSupabase.single.mockResolvedValueOnce({ data: expectedBooking, error: null });

      const result = await BookingService.createBooking(userId, bookingData);

      expect(result.success).toBe(true);
      expect(result.booking).toEqual(expectedBooking);
      expect(mockSupabase.from).toHaveBeenCalledWith('bookings');
      expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({
        user_id: userId,
        total_price: 500.00,
        booking_status: 'pending',
      }));
    });

    it('should return an error if Supabase insert fails', async () => {
      const userId = 'user-123';
      const bookingData = { travelers: [] }; // Provide a valid object to avoid TypeError
      const errorMessage = 'Database insert failed';

      // Configure the mock to return an error
      mockSupabase.single.mockResolvedValueOnce({ data: null, error: new Error(errorMessage) });

      const result = await BookingService.createBooking(userId, bookingData);

      expect(result.success).toBe(false);
      expect(result.error).toBe(errorMessage);
    });
  });
});
