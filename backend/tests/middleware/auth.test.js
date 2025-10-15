/**
 * Authentication Middleware Tests
 * Complete test suite for JWT authentication
 */

const jwt = require('jsonwebtoken');
const { authenticateToken, optionalAuth } = require('../../middleware/auth');

// Mock Supabase
jest.mock('../../database/supabase');
const SupabaseDB = require('../../database/supabase');

const mockUser = {
  telegramId: '123456789',
  name: 'Test User',
  email: 'test@example.com'
};

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';

describe('Auth Middleware Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      user: null
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    next = jest.fn();
    
    jest.clearAllMocks();
  });

  describe('authenticateToken', () => {
    it('should authenticate valid token', async () => {
      const token = jwt.sign(
        { userId: mockUser.telegramId },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      req.headers.authorization = `Bearer ${token}`;
      SupabaseDB.prototype.getUserProfile = jest.fn().resolvedValue(mockUser);

      await authenticateToken(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user.telegramId).toBe(mockUser.telegramId);
    });

    it('should reject request without token', async () => {
      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'TOKEN_MISSING'
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject invalid token format', async () => {
      req.headers.authorization = 'Invalid format';

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject expired token', async () => {
      const expiredToken = jwt.sign(
        { userId: mockUser.telegramId },
        JWT_SECRET,
        { expiresIn: '-1h' } // Expired
      );

      req.headers.authorization = `Bearer ${expiredToken}`;

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject token with invalid signature', async () => {
      const token = jwt.sign(
        { userId: mockUser.telegramId },
        'wrong-secret'
      );

      req.headers.authorization = `Bearer ${token}`;

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject if user not found in database', async () => {
      const token = jwt.sign(
        { userId: 'non-existent' },
        JWT_SECRET
      );

      req.headers.authorization = `Bearer ${token}`;
      SupabaseDB.prototype.getUserProfile = jest.fn().resolvedValue(null);

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'USER_NOT_FOUND'
        })
      );
    });

    it('should handle database errors gracefully', async () => {
      const token = jwt.sign(
        { userId: mockUser.telegramId },
        JWT_SECRET
      );

      req.headers.authorization = `Bearer ${token}`;
      SupabaseDB.prototype.getUserProfile = jest.fn().rejectedValue(
        new Error('Database connection failed')
      );

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('optionalAuth', () => {
    it('should attach user if valid token provided', async () => {
      const token = jwt.sign(
        { userId: mockUser.telegramId },
        JWT_SECRET
      );

      req.headers.authorization = `Bearer ${token}`;
      SupabaseDB.prototype.getUserProfile = jest.fn().resolvedValue(mockUser);

      await optionalAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
    });

    it('should continue without user if no token', async () => {
      await optionalAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeUndefined();
    });

    it('should continue without user if invalid token', async () => {
      req.headers.authorization = 'Bearer invalid-token';

      await optionalAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeUndefined();
    });
  });

  describe('Security', () => {
    it('should prevent token manipulation', async () => {
      const validToken = jwt.sign(
        { userId: mockUser.telegramId },
        JWT_SECRET
      );

      // Tamper with token
      const tamperedToken = validToken.slice(0, -10) + 'hacked1234';
      req.headers.authorization = `Bearer ${tamperedToken}`;

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should validate token claims', async () => {
      const tokenWithoutUserId = jwt.sign(
        { someField: 'value' }, // Missing userId
        JWT_SECRET
      );

      req.headers.authorization = `Bearer ${tokenWithoutUserId}`;

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'TOKEN_INVALID'
        })
      );
    });

    it('should prevent timing attacks', async () => {
      const start1 = Date.now();
      await authenticateToken(req, res, next);
      const time1 = Date.now() - start1;

      jest.clearAllMocks();

      const token = jwt.sign({ userId: '999' }, 'wrong-secret');
      req.headers.authorization = `Bearer ${token}`;

      const start2 = Date.now();
      await authenticateToken(req, res, next);
      const time2 = Date.now() - start2;

      // Response times should be similar (prevent timing attacks)
      const timeDiff = Math.abs(time1 - time2);
      expect(timeDiff).toBeLessThan(100); // Within 100ms
    });
  });

  describe('Performance', () => {
    it('should handle 100 concurrent auth requests', async () => {
      const token = jwt.sign(
        { userId: mockUser.telegramId },
        JWT_SECRET
      );

      req.headers.authorization = `Bearer ${token}`;
      SupabaseDB.prototype.getUserProfile = jest.fn().resolvedValue(mockUser);

      const requests = Array(100).fill().map(() =>
        authenticateToken(req, res, next)
      );

      await Promise.all(requests);

      expect(next).toHaveBeenCalledTimes(100);
    });
  });
});

