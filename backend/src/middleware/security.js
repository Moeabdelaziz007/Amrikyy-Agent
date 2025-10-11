/**
 * Security middleware for Amrikyy Travel Agent
 */

const helmet = require('helmet');

// Security headers configuration
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ['self'],
      styleSrc: [
        'self',
        'unsafe-inline',
        'https://fonts.googleapis.com',
        'https://cdn.jsdelivr.net'
      ],
      fontSrc: ['self', 'https://fonts.gstatic.com'],
      scriptSrc: ['self', 'unsafe-inline', 'https://cdn.jsdelivr.net'],
      imgSrc: ['self', 'data:', 'https:', 'blob:'],
      connectSrc: [
        'self',
        'https://api.z.ai',
        'https://*.supabase.co',
        'https://api.stripe.com'
      ],
      frameSrc: ['self', 'https://js.stripe.com', 'https://hooks.stripe.com'],
      objectSrc: ['none'],
      upgradeInsecureRequests: []
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
});

// CORS configuration
function configureCORS(app) {
  const cors = require('cors');

  const corsOptions = {
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://amrikyy-travel-agent.vercel.app',
        'https://amrikyy-travel-agent.com',
        'https://www.amrikyy-travel-agent.com',
        /^https:\/\/amrikyy-travel-agent-.*\.vercel\.app$/ // Vercel preview deployments
      ];

      // Check if origin matches allowed patterns
      const isAllowed = allowedOrigins.some((allowed) => {
        if (typeof allowed === 'string') {
          return allowed === origin;
        } else if (allowed instanceof RegExp) {
          return allowed.test(origin);
        }
        return false;
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers',
      'Stripe-Signature'
    ],
    exposedHeaders: ['X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    maxAge: 86400 // 24 hours
  };

  app.use(cors(corsOptions));
}

// Rate limiting configuration with Redis support
function configureRateLimiting(app) {
  try {
    // Try to use Redis-based rate limiting
    const { configureRedisRateLimiting } = require('./redis-rate-limit');

    if (process.env.REDIS_HOST || process.env.REDIS_URL) {
      console.log('🔴 Using Redis-based rate limiting...');
      configureRedisRateLimiting(app);
      return;
    }
  } catch (error) {
    console.warn('⚠️  Redis rate limiting not available, falling back to memory store:', error.message);
  }

  // Fallback to memory-based rate limiting
  console.log('💾 Using memory-based rate limiting (Redis not configured)...');
  const rateLimit = require('express-rate-limit');

  // General rate limiter - more permissive for production
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 500 : 1000, // Higher limit for production
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/api/health' || req.path === '/health' || req.path === '/api/public/ping';
    }
  });

  // API rate limiter - stricter for API endpoints
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 200 : 500, // Stricter for API routes
    message: {
      error: 'Too many API requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/api/health' || req.path === '/health' || req.path === '/api/public/ping';
    }
  });

  // Apply general rate limiting to all routes
  app.use(generalLimiter);

  // Apply stricter rate limiting to API routes
  app.use('/api/', apiLimiter);
}

module.exports = {
  securityHeaders,
  configureCORS,
  configureRateLimiting
};
