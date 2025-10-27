// Set the JWT secret *before* requiring the module that uses it
const JWT_SECRET = 'test-secret';
process.env.JWT_SECRET = JWT_SECRET;

const jwt = require('jsonwebtoken');
const { authenticate, ROLES } = require('./agentAuth');

// Mock logger to prevent console noise
jest.mock('../utils/logger', () => ({
  warn: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
}));

describe('Authentication Middleware', () => {
  let mockRequest;
  let mockResponse;
  let nextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      query: {},
      cookies: {},
    };
    mockResponse = {
      status: jest.fn(() => mockResponse),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should return 401 if no credentials are provided', () => {
      authenticate(mockRequest, mockResponse, nextFunction);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Authentication required',
      }));
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next() and attach user for a valid JWT token in Authorization header', () => {
      const userPayload = { id: '123', role: ROLES.USER };
      const token = jwt.sign(userPayload, JWT_SECRET);
      mockRequest.headers.authorization = `Bearer ${token}`;

      authenticate(mockRequest, mockResponse, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.user).toBeDefined();
      expect(mockRequest.user.id).toBe('123');
      expect(mockRequest.user.role).toBe(ROLES.USER);
      expect(mockRequest.user.authMethod).toBe('jwt');
    });

    it('should return 401 for an invalid JWT token', () => {
      mockRequest.headers.authorization = 'Bearer invalidtoken';

      authenticate(mockRequest, mockResponse, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Invalid token',
      }));
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 for an expired JWT token', () => {
        const userPayload = { id: '123', role: ROLES.USER };
        const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '-1s' });
        mockRequest.headers.authorization = `Bearer ${token}`;

        authenticate(mockRequest, mockResponse, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
          error: 'Invalid token',
          message: 'jwt expired',
        }));
        expect(nextFunction).not.toHaveBeenCalled();
      });

    it('should call next() and attach user for a valid API key in header', () => {
        const validApiKey = 'test-api-key';
        process.env.VALID_API_KEYS = validApiKey;
        mockRequest.headers['x-api-key'] = validApiKey;

        authenticate(mockRequest, mockResponse, nextFunction);

        expect(nextFunction).toHaveBeenCalled();
        expect(mockRequest.user).toBeDefined();
        expect(mockRequest.user.id).toBe('api-key-user');
        expect(mockRequest.user.role).toBe(ROLES.USER);
        expect(mockRequest.user.authMethod).toBe('api-key');
      });

      it('should prioritize API key over a valid JWT token', () => {
        const validApiKey = 'test-api-key';
        process.env.VALID_API_KEYS = validApiKey;
        mockRequest.headers['x-api-key'] = validApiKey;

        const userPayload = { id: '123', role: ROLES.PREMIUM };
        const token = jwt.sign(userPayload, JWT_SECRET);
        mockRequest.headers.authorization = `Bearer ${token}`;

        authenticate(mockRequest, mockResponse, nextFunction);

        expect(nextFunction).toHaveBeenCalled();
        expect(mockRequest.user.authMethod).toBe('api-key');
        expect(mockRequest.user.role).toBe(ROLES.USER); // API key role is default USER
      });

      it('should fall back to JWT when API key is invalid', () => {
        process.env.VALID_API_KEYS = 'a-different-key';
        mockRequest.headers['x-api-key'] = 'invalid-key';

        const userPayload = { id: 'jwt-user', role: ROLES.PREMIUM };
        const token = jwt.sign(userPayload, JWT_SECRET);
        mockRequest.headers.authorization = `Bearer ${token}`;

        authenticate(mockRequest, mockResponse, nextFunction);

        expect(nextFunction).toHaveBeenCalled();
        expect(mockRequest.user.authMethod).toBe('jwt');
        expect(mockRequest.user.id).toBe('jwt-user');
      });

      it('should return 401 if only an invalid API key is provided', () => {
        process.env.VALID_API_KEYS = 'a-different-key';
        mockRequest.headers['x-api-key'] = 'invalid-key';

        authenticate(mockRequest, mockResponse, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
          error: 'Authentication required',
        }));
        expect(nextFunction).not.toHaveBeenCalled();
      });
  });
});
