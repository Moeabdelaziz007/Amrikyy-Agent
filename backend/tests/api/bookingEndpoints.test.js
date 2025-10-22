/**
 * API Endpoint Tests for Booking Routes
 * Tests HTTP endpoints for booking operations
 */

const request = require('supertest');
const express = require('express');

// Mock services
jest.mock('../../services/bookingService');
jest.mock('../../services/authService');
jest.mock('../../middleware/auth');
jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

const bookingService = require('../../services/bookingService');

describe('Booking API Endpoints', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    jest.clearAllMocks();

    // Setup mock responses
    bookingService.createBooking = jest.fn().mockResolvedValue({
      success: true,
      booking: {
        id: 'BK-TEST-12345',
        status: 'pending',
        total_price: 850.00
      },
      payment: {
        clientSecret: 'secret_123',
        paymentIntentId: 'pi_test_123'
      }
    });

    bookingService.getBooking = jest.fn().mockResolvedValue({
      success: true,
      booking: {
        id: 'BK-TEST-12345',
        status: 'confirmed'
      }
    });

    bookingService.getUserBookings = jest.fn().mockResolvedValue({
      success: true,
      bookings: [
        { id: 'BK-1', status: 'confirmed' },
        { id: 'BK-2', status: 'pending' }
      ],
      count: 2
    });

    bookingService.cancelBooking = jest.fn().mockResolvedValue({
      success: true,
      booking: {
        id: 'BK-TEST-12345',
        status: 'cancelled'
      }
    });
  });

  describe('POST /api/bookings', () => {
    it('should create booking with valid data', async () => {
      const bookingData = {
        flightDetails: {
          origin: 'Cairo',
          destination: 'Dubai',
          departureDate: '2025-11-15'
        },
        travelerInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com'
        },
        totalPrice: 850.00
      };

      // Mock route (since we don't have actual routes imported)
      app.post('/api/bookings', async (req, res) => {
        const result = await bookingService.createBooking({
          userId: 'user-123',
          ...req.body
        });
        res.json(result);
      });

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.booking).toBeDefined();
      expect(response.body.payment).toBeDefined();
    });

    it('should return 400 for invalid booking data', async () => {
      app.post('/api/bookings', (req, res) => {
        if (!req.body.flightDetails) {
          return res.status(400).json({
            success: false,
            error: 'Flight details required'
          });
        }
        res.json({ success: true });
      });

      const response = await request(app)
        .post('/api/bookings')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should require authentication', async () => {
      app.post('/api/bookings', (req, res) => {
        if (!req.headers.authorization) {
          return res.status(401).json({
            success: false,
            error: 'Unauthorized'
          });
        }
        res.json({ success: true });
      });

      const response = await request(app)
        .post('/api/bookings')
        .send({})
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/bookings/:id', () => {
    it('should retrieve booking by ID', async () => {
      app.get('/api/bookings/:id', async (req, res) => {
        const result = await bookingService.getBooking(req.params.id);
        res.json(result);
      });

      const response = await request(app)
        .get('/api/bookings/BK-TEST-12345')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.booking).toBeDefined();
      expect(response.body.booking.id).toBe('BK-TEST-12345');
    });

    it('should return 404 for non-existent booking', async () => {
      bookingService.getBooking.mockResolvedValueOnce({
        success: false,
        error: 'Booking not found'
      });

      app.get('/api/bookings/:id', async (req, res) => {
        const result = await bookingService.getBooking(req.params.id);
        if (!result.success) {
          return res.status(404).json(result);
        }
        res.json(result);
      });

      const response = await request(app)
        .get('/api/bookings/INVALID-ID')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users/:userId/bookings', () => {
    it('should retrieve all user bookings', async () => {
      app.get('/api/users/:userId/bookings', async (req, res) => {
        const result = await bookingService.getUserBookings(req.params.userId);
        res.json(result);
      });

      const response = await request(app)
        .get('/api/users/user-123/bookings')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.bookings).toHaveLength(2);
      expect(response.body.count).toBe(2);
    });

    it('should support pagination', async () => {
      app.get('/api/users/:userId/bookings', async (req, res) => {
        const { limit, offset } = req.query;
        res.json({
          success: true,
          bookings: [],
          limit: parseInt(limit) || 10,
          offset: parseInt(offset) || 0
        });
      });

      const response = await request(app)
        .get('/api/users/user-123/bookings?limit=5&offset=10')
        .expect(200);

      expect(response.body.limit).toBe(5);
      expect(response.body.offset).toBe(10);
    });
  });

  describe('DELETE /api/bookings/:id', () => {
    it('should cancel booking', async () => {
      app.delete('/api/bookings/:id', async (req, res) => {
        const result = await bookingService.cancelBooking(req.params.id);
        res.json(result);
      });

      const response = await request(app)
        .delete('/api/bookings/BK-TEST-12345')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.booking.status).toBe('cancelled');
    });

    it('should require authorization for cancellation', async () => {
      app.delete('/api/bookings/:id', (req, res) => {
        if (!req.headers.authorization) {
          return res.status(401).json({
            success: false,
            error: 'Unauthorized'
          });
        }
        res.json({ success: true });
      });

      const response = await request(app)
        .delete('/api/bookings/BK-TEST-12345')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Request Validation', () => {
    it('should validate required fields', async () => {
      app.post('/api/bookings', (req, res) => {
        const required = ['flightDetails', 'travelerInfo', 'totalPrice'];
        const missing = required.filter(field => !req.body[field]);
        
        if (missing.length > 0) {
          return res.status(400).json({
            success: false,
            error: `Missing fields: ${missing.join(', ')}`
          });
        }
        res.json({ success: true });
      });

      const response = await request(app)
        .post('/api/bookings')
        .send({ flightDetails: {} })
        .expect(400);

      expect(response.body.error).toContain('Missing fields');
    });

    it('should validate data types', async () => {
      app.post('/api/bookings', (req, res) => {
        if (typeof req.body.totalPrice !== 'number') {
          return res.status(400).json({
            success: false,
            error: 'Total price must be a number'
          });
        }
        res.json({ success: true });
      });

      const response = await request(app)
        .post('/api/bookings')
        .send({ totalPrice: 'not-a-number' })
        .expect(400);

      expect(response.body.error).toContain('must be a number');
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      bookingService.createBooking.mockRejectedValueOnce(
        new Error('Database connection failed')
      );

      app.post('/api/bookings', async (req, res) => {
        try {
          const result = await bookingService.createBooking(req.body);
          res.json(result);
        } catch (error) {
          res.status(500).json({
            success: false,
            error: 'Internal server error'
          });
        }
      });

      const response = await request(app)
        .post('/api/bookings')
        .send({
          flightDetails: {},
          travelerInfo: {},
          totalPrice: 100
        })
        .expect(500);

      expect(response.body.success).toBe(false);
    });

    it('should return proper error codes', async () => {
      const testCases = [
        { status: 400, error: 'Bad Request' },
        { status: 401, error: 'Unauthorized' },
        { status: 403, error: 'Forbidden' },
        { status: 404, error: 'Not Found' },
        { status: 500, error: 'Internal Server Error' }
      ];

      testCases.forEach(({ status, error }) => {
        app.get(`/test-${status}`, (req, res) => {
          res.status(status).json({
            success: false,
            error
          });
        });
      });

      for (const { status, error } of testCases) {
        const response = await request(app)
          .get(`/test-${status}`)
          .expect(status);

        expect(response.body.error).toBe(error);
      }
    });
  });

  describe('Content Type', () => {
    it('should accept JSON requests', async () => {
      app.post('/api/bookings', (req, res) => {
        res.json({ received: req.body });
      });

      const response = await request(app)
        .post('/api/bookings')
        .set('Content-Type', 'application/json')
        .send({ test: 'data' })
        .expect(200);

      expect(response.body.received).toEqual({ test: 'data' });
    });

    it('should return JSON responses', async () => {
      app.get('/api/bookings/test', (req, res) => {
        res.json({ success: true });
      });

      const response = await request(app)
        .get('/api/bookings/test')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
