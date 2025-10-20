/**
 * ⏱️ Rate Limiting Middleware
 * Protects against abuse and DDoS attacks
 * Part of Amrikyy-Agent Phase 1: Unified Backend
 */

import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * General API rate limiter
 * Applies to all /api/* routes
 */
export const apiRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 100 requests per window
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: 'Too many requests, please slow down.',
      retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000')) / 60000) + ' minutes',
    });
  },
});

/**
 * Strict rate limiter for authentication endpoints
 * Prevents brute force attacks
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  skipSuccessfulRequests: true, // Don't count successful requests
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for AI endpoints
 * More restrictive to prevent API cost overruns
 */
export const aiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: {
    success: false,
    error: 'AI API rate limit exceeded. Please wait before making more requests.',
    retryAfter: '1 minute',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for payment endpoints
 * Very strict to prevent payment abuse
 */
export const paymentRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 payment attempts per hour
  message: {
    success: false,
    error: 'Payment rate limit exceeded. Please contact support if you need to make more transactions.',
    retryAfter: '1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Default export for general use
 */
export default apiRateLimiter;
