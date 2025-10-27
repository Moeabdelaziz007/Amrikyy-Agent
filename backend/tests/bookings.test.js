const request = require('supertest');
const express = require('express');
const bookingsRouter = require('../routes/bookings');
const bookingService = require('../services/bookingService');

// Mock the auth middleware
jest.mock('../middleware/jwtAuth', () => ({
  authenticateUser: (req, res, next) => {
    req.user = { id: 'test-user' };
    next();
  },
}));

// Mock the booking service
jest.mock('../services/bookingService');

const app = express();
app.use(express.json());
app.use('/bookings', bookingsRouter);

describe('Bookings API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new booking', async () => {
    const mockBooking = {
      flightDetails: {
        origin: 'JFK',
        destination: 'LAX',
        departureDate: '2025-12-01',
      },
      travelerInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      },
      totalPrice: 500.00,
      currency: 'USD',
    };

    const mockServiceResponse = {
      success: true,
      booking: {
        id: 'BK-TEST-123',
        ...mockBooking,
      },
      payment: {
        clientSecret: 'test_client_secret',
      },
    };

    bookingService.createBooking.mockResolvedValue(mockServiceResponse);

    const res = await request(app)
      .post('/bookings')
      .send(mockBooking);

    expect(res.statusCode).toEqual(201);
    expect(res.body.data.booking.id).toBe('BK-TEST-123');
    expect(bookingService.createBooking).toHaveBeenCalledWith({
      userId: 'test-user',
      ...mockBooking,
    });
  });
});
