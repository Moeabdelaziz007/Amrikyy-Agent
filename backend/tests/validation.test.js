/**
 * Unit Tests for Validation Middleware
 * Tests all validators and edge cases
 */

const {
  validateSignup,
  validateLogin,
  validateBooking,
  validatePasswordReset,
  validateTokenRefresh,
  validateAuthHeader,
  validateBookingId,
  validateUserId,
  validatePagination,
  validateRefund,
  isValidEmail,
  isValidPassword
} = require('../middleware/validation');

// Mock logger
jest.mock('../utils/logger', () => ({
  warn: jest.fn()
}));

describe('Validation Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('isValidEmail()', () => {
    it('should validate correct email formats', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.user@domain.co.uk')).toBe(true);
      expect(isValidEmail('name+tag@company.com')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('user @domain.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidPassword()', () => {
    it('should accept passwords with 6+ characters', () => {
      expect(isValidPassword('123456')).toBe(true);
      expect(isValidPassword('password123')).toBe(true);
      expect(isValidPassword('P@ssw0rd!')).toBe(true);
    });

    it('should reject passwords with less than 6 characters', () => {
      expect(isValidPassword('12345')).toBe(false);
      expect(isValidPassword('abc')).toBe(false);
      expect(isValidPassword('')).toBeFalsy();
    });

    it('should handle null and undefined', () => {
      // Password validation returns falsy for null/undefined
      expect(isValidPassword(null)).toBeFalsy();
      expect(isValidPassword(undefined)).toBeFalsy();
    });
  });

  describe('validateSignup()', () => {
    it('should pass with valid signup data', () => {
      req.body = {
        email: 'user@example.com',
        password: 'password123',
        fullName: 'John Doe'
      };

      validateSignup(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should fail when email is missing', () => {
      req.body = {
        password: 'password123'
      };

      validateSignup(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('email')
        })
      );
    });

    it('should fail when password is missing', () => {
      req.body = {
        email: 'user@example.com'
      };

      validateSignup(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with invalid email format', () => {
      req.body = {
        email: 'invalid-email',
        password: 'password123'
      };

      validateSignup(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Invalid email format'
        })
      );
    });

    it('should fail with weak password', () => {
      req.body = {
        email: 'user@example.com',
        password: '12345'
      };

      validateSignup(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('at least 6 characters')
        })
      );
    });
  });

  describe('validateLogin()', () => {
    it('should pass with valid login data', () => {
      req.body = {
        email: 'user@example.com',
        password: 'password123'
      };

      validateLogin(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail when credentials are missing', () => {
      req.body = {};

      validateLogin(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with invalid email', () => {
      req.body = {
        email: 'not-an-email',
        password: 'password123'
      };

      validateLogin(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateBooking()', () => {
    it('should pass with complete booking data', () => {
      req.body = {
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
        totalPrice: 850.00
      };

      validateBooking(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail when flightDetails is missing', () => {
      req.body = {
        travelerInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'user@example.com'
        },
        totalPrice: 850.00
      };

      validateBooking(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail when flight details are incomplete', () => {
      req.body = {
        flightDetails: {
          origin: 'Cairo'
          // missing destination and departureDate
        },
        travelerInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'user@example.com'
        },
        totalPrice: 850.00
      };

      validateBooking(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('origin, destination, and departureDate')
        })
      );
    });

    it('should fail when traveler info is incomplete', () => {
      req.body = {
        flightDetails: {
          origin: 'Cairo',
          destination: 'Dubai',
          departureDate: '2025-11-15'
        },
        travelerInfo: {
          firstName: 'John'
          // missing lastName and email
        },
        totalPrice: 850.00
      };

      validateBooking(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with invalid traveler email', () => {
      req.body = {
        flightDetails: {
          origin: 'Cairo',
          destination: 'Dubai',
          departureDate: '2025-11-15'
        },
        travelerInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'invalid-email'
        },
        totalPrice: 850.00
      };

      validateBooking(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with invalid total price', () => {
      req.body = {
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
        totalPrice: -100
      };

      validateBooking(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('positive number')
        })
      );
    });

    it('should fail with non-numeric price', () => {
      req.body = {
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
        totalPrice: 'not-a-number'
      };

      validateBooking(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validatePasswordReset()', () => {
    it('should pass with valid email', () => {
      req.body = { email: 'user@example.com' };

      validatePasswordReset(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail when email is missing', () => {
      req.body = {};

      validatePasswordReset(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with invalid email', () => {
      req.body = { email: 'invalid' };

      validatePasswordReset(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateAuthHeader()', () => {
    it('should pass with valid Bearer token', () => {
      req.headers.authorization = 'Bearer abc123token';

      validateAuthHeader(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail when authorization header is missing', () => {
      validateAuthHeader(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should fail with invalid format (no Bearer)', () => {
      req.headers.authorization = 'abc123token';

      validateAuthHeader(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Bearer')
        })
      );
    });

    it('should fail when token is missing after Bearer', () => {
      req.headers.authorization = 'Bearer ';

      validateAuthHeader(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('validateBookingId()', () => {
    it('should pass with valid booking ID format', () => {
      req.params.id = 'BK-ABC123-XYZ789';

      validateBookingId(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail when booking ID is missing', () => {
      validateBookingId(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with invalid booking ID format', () => {
      req.params.id = 'invalid-format';

      validateBookingId(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Invalid booking ID format')
        })
      );
    });
  });

  describe('validateUserId()', () => {
    it('should pass with valid UUID format', () => {
      req.params.userId = '123e4567-e89b-12d3-a456-426614174000';

      validateUserId(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail when user ID is missing', () => {
      validateUserId(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with invalid UUID format', () => {
      req.params.userId = 'not-a-uuid';

      validateUserId(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validatePagination()', () => {
    it('should pass with valid pagination params', () => {
      req.query = { limit: '10', offset: '0' };

      validatePagination(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should pass when pagination params are missing', () => {
      req.query = {};

      validatePagination(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail with limit > 100', () => {
      req.query = { limit: '101' };

      validatePagination(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with limit < 1', () => {
      req.query = { limit: '0' };

      validatePagination(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with negative offset', () => {
      req.query = { offset: '-1' };

      validatePagination(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with non-numeric limit', () => {
      req.query = { limit: 'abc' };

      validatePagination(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateRefund()', () => {
    it('should pass with valid refund amount', () => {
      req.body = { amount: 100.50 };

      validateRefund(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should pass when amount is not provided', () => {
      req.body = {};

      validateRefund(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail with negative amount', () => {
      req.body = { amount: -50 };

      validateRefund(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with zero amount', () => {
      req.body = { amount: 0 };

      validateRefund(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with non-numeric amount', () => {
      req.body = { amount: 'not-a-number' };

      validateRefund(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
