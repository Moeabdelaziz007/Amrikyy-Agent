/**
 * Test Suite for Agent Authentication Middleware
 * Tests JWT authentication, API key authentication, and role-based access control
 */

const jwt = require('jsonwebtoken');
const {
  authenticate,
  optionalAuth,
  hasPermission,
  requirePermission,
  requireRole,
  requireAnyRole,
  requireAdmin,
  requirePremium,
  generateToken,
  verifyToken,
  verifyApiKey,
  ROLES,
  PERMISSIONS,
} = require('../src/middleware/agentAuth');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

describe('Agent Authentication Middleware', () => {
  describe('Token Verification', () => {
    it('should verify valid JWT token', () => {
      const payload = { id: 'user123', email: 'test@example.com', role: ROLES.USER };
      const token = jwt.sign(payload, JWT_SECRET);
      
      const result = verifyToken(token);
      
      expect(result.valid).toBe(true);
      expect(result.decoded.id).toBe('user123');
      expect(result.decoded.email).toBe('test@example.com');
    });

    it('should reject invalid JWT token', () => {
      const invalidToken = 'invalid.token.here';
      
      const result = verifyToken(invalidToken);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject expired JWT token', () => {
      const payload = { id: 'user123', email: 'test@example.com' };
      const expiredToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '0s' });
      
      // Wait a moment to ensure token is expired
      setTimeout(() => {
        const result = verifyToken(expiredToken);
        
        expect(result.valid).toBe(false);
        expect(result.error).toContain('expired');
      }, 100);
    });

    it('should verify valid API key', () => {
      process.env.VALID_API_KEYS = 'key1,key2,key3';
      
      const result = verifyApiKey('key2');
      
      expect(result.valid).toBe(true);
    });

    it('should reject invalid API key', () => {
      process.env.VALID_API_KEYS = 'key1,key2,key3';
      
      const result = verifyApiKey('invalid-key');
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid API key');
    });
  });

  describe('Authentication Middleware', () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        headers: {},
        query: {},
        cookies: {},
        ip: '127.0.0.1',
        path: '/test',
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });

    it('should authenticate with valid Bearer token', () => {
      const token = generateToken({ id: 'user123', email: 'test@example.com', role: ROLES.USER });
      req.headers.authorization = `Bearer ${token}`;
      
      authenticate(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user.id).toBe('user123');
      expect(req.user.authMethod).toBe('jwt');
    });

    it('should authenticate with valid API key', () => {
      process.env.VALID_API_KEYS = 'test-api-key';
      req.headers['x-api-key'] = 'test-api-key';
      
      authenticate(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user.authMethod).toBe('api-key');
    });

    it('should reject request without credentials', () => {
      authenticate(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Authentication required',
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject request with invalid token', () => {
      req.headers.authorization = 'Bearer invalid.token.here';
      
      authenticate(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Invalid token',
        })
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Optional Authentication', () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        headers: {},
        query: {},
        cookies: {},
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });

    it('should inject user if valid token provided', () => {
      const token = generateToken({ id: 'user123', role: ROLES.USER });
      req.headers.authorization = `Bearer ${token}`;
      
      optionalAuth(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user.id).toBe('user123');
    });

    it('should continue without user if no token provided', () => {
      optionalAuth(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(req.user).toBeUndefined();
    });
  });

  describe('Permission Checks', () => {
    it('should grant permission for user role', () => {
      const user = { role: ROLES.USER };
      
      expect(hasPermission(user, 'agent:read')).toBe(true);
      expect(hasPermission(user, 'agent:execute')).toBe(true);
    });

    it('should deny permission for insufficient role', () => {
      const user = { role: ROLES.USER };
      
      expect(hasPermission(user, 'agent:manage')).toBe(false);
      expect(hasPermission(user, 'cache:manage')).toBe(false);
    });

    it('should grant all permissions for internal role', () => {
      const user = { role: ROLES.INTERNAL };
      
      expect(hasPermission(user, 'any:permission')).toBe(true);
      expect(hasPermission(user, 'agent:manage')).toBe(true);
    });

    it('should deny permission for invalid user', () => {
      expect(hasPermission(null, 'agent:read')).toBe(false);
      expect(hasPermission({}, 'agent:read')).toBe(false);
    });
  });

  describe('Permission Middleware', () => {
    let req, res, next;

    beforeEach(() => {
      req = { user: null, path: '/test' };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });

    it('should allow request with required permission', () => {
      req.user = { id: 'user123', role: ROLES.ADMIN };
      const middleware = requirePermission('agent:manage');
      
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should deny request without required permission', () => {
      req.user = { id: 'user123', role: ROLES.USER };
      const middleware = requirePermission('agent:manage');
      
      middleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Permission denied',
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should deny unauthenticated request', () => {
      const middleware = requirePermission('agent:read');
      
      middleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Role Middleware', () => {
    let req, res, next;

    beforeEach(() => {
      req = { user: null, path: '/test' };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });

    it('should allow request with required role', () => {
      req.user = { id: 'admin123', role: ROLES.ADMIN };
      const middleware = requireRole(ROLES.ADMIN);
      
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });

    it('should deny request without required role', () => {
      req.user = { id: 'user123', role: ROLES.USER };
      const middleware = requireRole(ROLES.ADMIN);
      
      middleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('should allow request with any of required roles', () => {
      req.user = { id: 'premium123', role: ROLES.PREMIUM };
      const middleware = requireAnyRole(ROLES.PREMIUM, ROLES.ADMIN);
      
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });

    it('should deny request without any of required roles', () => {
      req.user = { id: 'user123', role: ROLES.USER };
      const middleware = requireAnyRole(ROLES.PREMIUM, ROLES.ADMIN);
      
      middleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Predefined Role Middleware', () => {
    let req, res, next;

    beforeEach(() => {
      req = { user: null, path: '/test' };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });

    it('requireAdmin should allow admin users', () => {
      req.user = { role: ROLES.ADMIN };
      
      requireAdmin(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });

    it('requireAdmin should allow internal users', () => {
      req.user = { role: ROLES.INTERNAL };
      
      requireAdmin(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });

    it('requireAdmin should deny regular users', () => {
      req.user = { role: ROLES.USER };
      
      requireAdmin(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('requirePremium should allow premium users', () => {
      req.user = { role: ROLES.PREMIUM };
      
      requirePremium(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });

    it('requirePremium should deny regular users', () => {
      req.user = { role: ROLES.USER };
      
      requirePremium(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Token Generation', () => {
    it('should generate valid JWT token', () => {
      const payload = { id: 'user123', email: 'test@example.com' };
      
      const token = generateToken(payload);
      
      expect(token).toBeDefined();
      const decoded = jwt.verify(token, JWT_SECRET);
      expect(decoded.id).toBe('user123');
      expect(decoded.email).toBe('test@example.com');
    });

    it('should generate token with custom expiration', () => {
      const payload = { id: 'user123' };
      
      const token = generateToken(payload, '1h');
      
      expect(token).toBeDefined();
      const decoded = jwt.verify(token, JWT_SECRET);
      expect(decoded.exp).toBeDefined();
    });
  });
});
