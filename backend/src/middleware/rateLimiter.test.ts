import { Request, Response, NextFunction } from 'express';

// Use jest.resetModules() to ensure the rate limiter is re-initialized for each test
beforeEach(() => {
  jest.resetModules();
});

describe('API Rate Limiter Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      ip: '127.0.0.1',
      headers: {},
      get: jest.fn((name: string) => mockRequest.headers![name.toLowerCase()]),
      // Add a mock `app` object that express-rate-limit checks for `trust proxy` settings
      app: {
        get: jest.fn().mockReturnValue(false), // Emulate `app.get('trust proxy')` returning false
        enabled: jest.fn().mockReturnValue(false),
      },
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  it('should call next() for requests under the limit', async () => {
    process.env.RATE_LIMIT_MAX_REQUESTS = '5';
    const { apiRateLimiter } = require('./rateLimiter');

    await apiRateLimiter(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should block requests that exceed the limit', async () => {
    const maxRequests = 3;
    process.env.RATE_LIMIT_MAX_REQUESTS = `${maxRequests}`;
    const { apiRateLimiter } = require('./rateLimiter');

    for (let i = 0; i < maxRequests; i++) {
      await apiRateLimiter(mockRequest as Request, mockResponse as Response, nextFunction);
    }
    expect(nextFunction).toHaveBeenCalledTimes(maxRequests);

    await apiRateLimiter(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(429);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      error: 'Too many requests, please slow down.',
    }));
    expect(nextFunction).toHaveBeenCalledTimes(maxRequests);
  });

  it('should allow requests again after the time window expires', async () => {
    jest.useFakeTimers();

    const windowMs = 60 * 1000;
    const maxRequests = 2;
    process.env.RATE_LIMIT_WINDOW_MS = `${windowMs}`;
    process.env.RATE_LIMIT_MAX_REQUESTS = `${maxRequests}`;
    const { apiRateLimiter } = require('./rateLimiter');

    for (let i = 0; i < maxRequests; i++) {
      await apiRateLimiter(mockRequest as Request, mockResponse as Response, nextFunction);
    }
    await apiRateLimiter(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.status).toHaveBeenCalledWith(429);
    expect(nextFunction).toHaveBeenCalledTimes(maxRequests);

    jest.advanceTimersByTime(windowMs);

    await apiRateLimiter(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalledTimes(maxRequests + 1);

    jest.useRealTimers();
  });
});
