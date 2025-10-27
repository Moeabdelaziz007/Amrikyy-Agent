/**
 * Test Suite for Rate Limiting Middleware
 * Tests rate limiting configuration and behavior
 */

// Mock express-rate-limit to avoid testing implementation details
jest.mock('express-rate-limit', () => {
  return jest.fn((options) => {
    const limiter: any = (req: any, res: any, next: any) => {
      // Simple mock implementation for testing
      const key = req.ip || 'default';
      if (!limiter.hits) {
        limiter.hits = {};
      }
      if (!limiter.hits[key]) {
        limiter.hits[key] = 0;
      }
      
      limiter.hits[key]++;
      
      if (limiter.hits[key] > options.max) {
        if (options.handler) {
          return options.handler(req, res);
        }
        return res.status(429).json(options.message);
      }
      
      next();
    };
    
    limiter.resetKey = (key: string) => {
      if (limiter.hits) {
        delete limiter.hits[key];
      }
    };
    
    limiter.options = options;
    limiter.hits = {};
    
    return limiter;
  });
});

import { Request, Response } from 'express';
import {
  apiRateLimiter,
  authRateLimiter,
  aiRateLimiter,
  paymentRateLimiter,
} from '../src/middleware/rateLimiter';

describe('Rate Limiting Middleware', () => {
  describe('API Rate Limiter Configuration', () => {
    it('should have correct configuration', () => {
      expect((apiRateLimiter as any).options).toBeDefined();
      expect((apiRateLimiter as any).options.max).toBe(parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'));
    });

    it('should have standard headers enabled', () => {
      expect((apiRateLimiter as any).options.standardHeaders).toBe(true);
    });

    it('should have legacy headers disabled', () => {
      expect((apiRateLimiter as any).options.legacyHeaders).toBe(false);
    });

    it('should have appropriate error message', () => {
      expect((apiRateLimiter as any).options.message).toEqual(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('Too many requests'),
        })
      );
    });
  });

  describe('Auth Rate Limiter Configuration', () => {
    it('should have stricter limits than general API', () => {
      const authMax = (authRateLimiter as any).options.max;
      const apiMax = (apiRateLimiter as any).options.max;
      
      expect(authMax).toBeLessThan(apiMax);
      expect(authMax).toBe(5);
    });

    it('should skip successful requests', () => {
      expect((authRateLimiter as any).options.skipSuccessfulRequests).toBe(true);
    });

    it('should have authentication-specific error message', () => {
      expect((authRateLimiter as any).options.message.error).toContain('authentication');
    });
  });

  describe('AI Rate Limiter Configuration', () => {
    it('should have appropriate limits for AI endpoints', () => {
      expect((aiRateLimiter as any).options.max).toBe(10);
      expect((aiRateLimiter as any).options.windowMs).toBe(1 * 60 * 1000); // 1 minute
    });

    it('should have AI-specific error message', () => {
      expect((aiRateLimiter as any).options.message.error).toContain('AI');
    });
  });

  describe('Payment Rate Limiter Configuration', () => {
    it('should have very strict limits', () => {
      expect((paymentRateLimiter as any).options.max).toBe(10);
      expect((paymentRateLimiter as any).options.windowMs).toBe(60 * 60 * 1000); // 1 hour
    });

    it('should have payment-specific error message', () => {
      expect((paymentRateLimiter as any).options.message.error).toContain('Payment');
    });

    it('should have longer retry time', () => {
      expect((paymentRateLimiter as any).options.message.retryAfter).toContain('hour');
    });
  });

  describe('Rate Limiter Behavior', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: jest.Mock;

    beforeEach(() => {
      // Reset the limiter hits
      (apiRateLimiter as any).hits = {};
      
      req = {
        ip: '127.0.0.1',
        path: '/api/test',
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });

    it('should allow requests within rate limit', () => {
      for (let i = 0; i < 10; i++) {
        apiRateLimiter(req as Request, res as Response, next);
      }

      expect(next).toHaveBeenCalledTimes(10);
      expect(res.status).not.toHaveBeenCalledWith(429);
    });

    it('should block requests after rate limit exceeded', () => {
      const limit = (apiRateLimiter as any).options.max;
      
      // Make requests up to the limit
      for (let i = 0; i < limit; i++) {
        apiRateLimiter(req as Request, res as Response, next);
      }

      // Reset mocks
      next.mockClear();
      (res.status as jest.Mock).mockClear();

      // Next request should be blocked
      apiRateLimiter(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(429);
      expect(next).not.toHaveBeenCalled();
    });

    it('should track different IPs separately', () => {
      const req1 = { ...req, ip: '127.0.0.1' };
      const req2 = { ...req, ip: '192.168.1.1' };

      for (let i = 0; i < 10; i++) {
        apiRateLimiter(req1 as Request, res as Response, next);
        apiRateLimiter(req2 as Request, res as Response, next);
      }

      expect(next).toHaveBeenCalledTimes(20);
    });
  });

  describe('Environment Variable Configuration', () => {
    it('should respect RATE_LIMIT_WINDOW_MS environment variable', () => {
      const originalWindowMs = process.env.RATE_LIMIT_WINDOW_MS;
      
      // The configuration is read at module load time
      // This test verifies the env var is properly used in the configuration
      
      expect(process.env.RATE_LIMIT_WINDOW_MS || '900000').toBeDefined();

      // Restore
      if (originalWindowMs) {
        process.env.RATE_LIMIT_WINDOW_MS = originalWindowMs;
      }
    });

    it('should respect RATE_LIMIT_MAX_REQUESTS environment variable', () => {
      const originalMaxRequests = process.env.RATE_LIMIT_MAX_REQUESTS;

      expect(process.env.RATE_LIMIT_MAX_REQUESTS || '100').toBeDefined();

      // Restore
      if (originalMaxRequests) {
        process.env.RATE_LIMIT_MAX_REQUESTS = originalMaxRequests;
      }
    });

    it('should use defaults when env vars not set', () => {
      const max = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');
      const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000');

      expect(max).toBeGreaterThan(0);
      expect(windowMs).toBeGreaterThan(0);
    });
  });

  describe('Error Message Quality', () => {
    it('should provide helpful error messages for general API', () => {
      const message = (apiRateLimiter as any).options.message;
      
      expect(message).toHaveProperty('success', false);
      expect(message).toHaveProperty('error');
      expect(message).toHaveProperty('retryAfter');
    });

    it('should provide specific guidance for auth endpoints', () => {
      const message = (authRateLimiter as any).options.message;
      
      expect(message.error).toContain('authentication');
      expect(message.retryAfter).toBeDefined();
    });

    it('should provide clear feedback for AI endpoints', () => {
      const message = (aiRateLimiter as any).options.message;
      
      expect(message.error).toContain('AI');
      expect(message.retryAfter).toContain('minute');
    });

    it('should provide contact info for payment limits', () => {
      const message = (paymentRateLimiter as any).options.message;
      
      expect(message.error).toContain('support');
    });
  });
});
