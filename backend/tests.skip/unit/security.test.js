/**
 * Security Unit Tests
 * Tests TokenManager and rate limiting
 */

const TokenManager = require('../../src/security/TokenManager');
const ExternalAPILimiter = require('../../middleware/externalAPILimiter');

describe('Security - Token Manager', () => {
  describe('Token Generation', () => {
    test('should generate token with default expiration', () => {
      const tokenData = TokenManager.generateToken({
        userId: 'test-user',
        scope: ['flights:read']
      });

      expect(tokenData).toHaveProperty('token');
      expect(tokenData).toHaveProperty('expiresAt');
      expect(tokenData).toHaveProperty('expiresIn');
      expect(tokenData.token).toHaveLength(64); // 32 bytes hex = 64 chars
    });

    test('should generate token with custom expiration', () => {
      const tokenData = TokenManager.generateToken({
        userId: 'test-user',
        scope: ['flights:read'],
        expiresIn: '1h'
      });

      expect(tokenData.expiresIn).toBe('1h');
    });

    test('should generate token with metadata', () => {
      const metadata = { source: 'test', version: '1.0' };
      
      const tokenData = TokenManager.generateToken({
        userId: 'test-user',
        scope: ['flights:read'],
        metadata
      });

      expect(tokenData.token).toBeDefined();
    });

    test('should generate unique tokens', () => {
      const token1 = TokenManager.generateToken({ userId: 'user1' });
      const token2 = TokenManager.generateToken({ userId: 'user1' });

      expect(token1.token).not.toBe(token2.token);
    });
  });

  describe('Token Validation', () => {
    test('should validate valid token', () => {
      const tokenData = TokenManager.generateToken({
        userId: 'test-user',
        scope: ['flights:read']
      });

      const validation = TokenManager.validateToken(tokenData.token);

      expect(validation.valid).toBe(true);
      expect(validation.userId).toBe('test-user');
      expect(validation.scope).toContain('flights:read');
    });

    test('should reject invalid token', () => {
      const validation = TokenManager.validateToken('invalid-token');

      expect(validation.valid).toBe(false);
      expect(validation.error).toBeDefined();
    });

    test('should validate token with required scope', () => {
      const tokenData = TokenManager.generateToken({
        userId: 'test-user',
        scope: ['flights:read', 'hotels:read']
      });

      const validation = TokenManager.validateToken(tokenData.token, 'flights:read');

      expect(validation.valid).toBe(true);
    });

    test('should reject token with insufficient scope', () => {
      const tokenData = TokenManager.generateToken({
        userId: 'test-user',
        scope: ['flights:read']
      });

      const validation = TokenManager.validateToken(tokenData.token, 'hotels:write');

      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('scope');
    });

    test('should track token usage', () => {
      const tokenData = TokenManager.generateToken({
        userId: 'test-user',
        scope: ['flights:read']
      });

      TokenManager.validateToken(tokenData.token);
      TokenManager.validateToken(tokenData.token);

      const info = TokenManager.getTokenInfo(tokenData.token);
      expect(info.usageCount).toBe(2);
    });
  });

  describe('Token Revocation', () => {
    test('should revoke token', () => {
      const tokenData = TokenManager.generateToken({
        userId: 'test-user',
        scope: ['flights:read']
      });

      const revoked = TokenManager.revokeToken(tokenData.token);
      expect(revoked).toBe(true);

      const validation = TokenManager.validateToken(tokenData.token);
      expect(validation.valid).toBe(false);
    });

    test('should return false for non-existent token', () => {
      const revoked = TokenManager.revokeToken('non-existent-token');
      expect(revoked).toBe(false);
    });

    test('should revoke all user tokens', () => {
      TokenManager.generateToken({ userId: 'user1', scope: ['flights:read'] });
      TokenManager.generateToken({ userId: 'user1', scope: ['hotels:read'] });
      TokenManager.generateToken({ userId: 'user2', scope: ['flights:read'] });

      const count = TokenManager.revokeUserTokens('user1');
      expect(count).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Token Info', () => {
    test('should get token info', () => {
      const tokenData = TokenManager.generateToken({
        userId: 'test-user',
        scope: ['flights:read']
      });

      const info = TokenManager.getTokenInfo(tokenData.token);

      expect(info).toBeDefined();
      expect(info.userId).toBe('test-user');
      expect(info.scope).toContain('flights:read');
      expect(info.usageCount).toBe(0);
      expect(info.isExpired).toBe(false);
    });

    test('should return null for non-existent token', () => {
      const info = TokenManager.getTokenInfo('non-existent-token');
      expect(info).toBeNull();
    });
  });

  describe('Expiration Calculation', () => {
    test('should calculate seconds expiration', () => {
      const now = Date.now();
      const expiresAt = TokenManager.calculateExpiration('30s');
      
      expect(expiresAt).toBeGreaterThan(now);
      expect(expiresAt).toBeLessThan(now + 31000);
    });

    test('should calculate minutes expiration', () => {
      const now = Date.now();
      const expiresAt = TokenManager.calculateExpiration('15m');
      
      expect(expiresAt).toBeGreaterThan(now);
      expect(expiresAt).toBeLessThan(now + (16 * 60 * 1000));
    });

    test('should calculate hours expiration', () => {
      const now = Date.now();
      const expiresAt = TokenManager.calculateExpiration('2h');
      
      expect(expiresAt).toBeGreaterThan(now);
      expect(expiresAt).toBeLessThan(now + (3 * 60 * 60 * 1000));
    });

    test('should calculate days expiration', () => {
      const now = Date.now();
      const expiresAt = TokenManager.calculateExpiration('1d');
      
      expect(expiresAt).toBeGreaterThan(now);
      expect(expiresAt).toBeLessThan(now + (2 * 24 * 60 * 60 * 1000));
    });

    test('should throw error for invalid format', () => {
      expect(() => {
        TokenManager.calculateExpiration('invalid');
      }).toThrow();
    });
  });

  describe('Statistics', () => {
    test('should get token statistics', () => {
      const stats = TokenManager.getStats();

      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('active');
      expect(stats).toHaveProperty('expired');
      expect(typeof stats.total).toBe('number');
    });
  });
});

describe('Security - External API Limiter', () => {
  describe('Rate Limit Checking', () => {
    test('should allow request within limits', () => {
      const result = ExternalAPILimiter.checkLimit('test-user-1', 'kiwi');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeDefined();
      expect(result.remaining.minute).toBeDefined();
      expect(result.remaining.hour).toBeDefined();
    });

    test('should track remaining requests', () => {
      const userId = 'test-user-2';
      
      const result1 = ExternalAPILimiter.checkLimit(userId, 'kiwi');
      const result2 = ExternalAPILimiter.checkLimit(userId, 'kiwi');

      expect(result1.remaining.minute).toBeGreaterThan(result2.remaining.minute);
    });

    test('should handle unknown API gracefully', () => {
      const result = ExternalAPILimiter.checkLimit('test-user-3', 'unknown-api');

      expect(result.allowed).toBe(true);
      expect(result.warning).toBeDefined();
    });
  });

  describe('User Statistics', () => {
    test('should get user stats', () => {
      const userId = 'test-user-4';
      
      ExternalAPILimiter.checkLimit(userId, 'kiwi');
      ExternalAPILimiter.checkLimit(userId, 'mapbox');

      const stats = ExternalAPILimiter.getUserStats(userId);

      expect(stats).toHaveProperty('kiwi');
      expect(stats).toHaveProperty('bookingCom');
      expect(stats).toHaveProperty('mapbox');
      
      expect(stats.kiwi.usedMinute).toBeGreaterThan(0);
      expect(stats.mapbox.usedMinute).toBeGreaterThan(0);
    });

    test('should show zero usage for new user', () => {
      const stats = ExternalAPILimiter.getUserStats('new-user');

      expect(stats.kiwi.usedMinute).toBe(0);
      expect(stats.kiwi.usedHour).toBe(0);
    });
  });

  describe('Limit Reset', () => {
    test('should reset specific API limits', () => {
      const userId = 'test-user-5';
      
      ExternalAPILimiter.checkLimit(userId, 'kiwi');
      ExternalAPILimiter.resetUserLimits(userId, 'kiwi');

      const stats = ExternalAPILimiter.getUserStats(userId);
      expect(stats.kiwi.usedMinute).toBe(0);
    });

    test('should reset all API limits', () => {
      const userId = 'test-user-6';
      
      ExternalAPILimiter.checkLimit(userId, 'kiwi');
      ExternalAPILimiter.checkLimit(userId, 'mapbox');
      ExternalAPILimiter.resetUserLimits(userId);

      const stats = ExternalAPILimiter.getUserStats(userId);
      expect(stats.kiwi.usedMinute).toBe(0);
      expect(stats.mapbox.usedMinute).toBe(0);
    });
  });
});
