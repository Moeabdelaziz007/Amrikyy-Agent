const request = require('supertest');
const jwt = require('jsonwebtoken');

// Mock the correct authService BEFORE importing the app
jest.mock('../../services/authService');

const app = require('../../server');
const authService = require('../../services/authService');

describe('Profile API Integration Tests', () => {
  const JWT_SECRET = process.env.JWT_SECRET || 'your-test-secret';

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  afterAll((done) => {
    // Close the server if it's running
    if (app && app.close) {
      app.close(done);
    } else {
      done();
    }
  });

  describe('GET /api/auth/me', () => {
    test('returns 401 without token', async () => {
      await request(app)
        .get('/api/auth/me')
        .expect(401);
    });

    test('returns 401 with invalid token format', async () => {
      await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'invalid-token')
        .expect(401);
    });

    test('returns 401 when user not found', async () => {
      const token = jwt.sign({ userId: 'test-123' }, JWT_SECRET, { expiresIn: '1h' });

      // Mock the service to return a failure response
      authService.getCurrentUser.mockResolvedValue({ success: false, error: 'User not found' });

      await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
    });

    test('returns 200 with valid token and user exists', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com'
      };
      const token = jwt.sign({ userId: 'user-123' }, JWT_SECRET, { expiresIn: '1h' });

      // Mock the service to return a successful response with a user
      authService.getCurrentUser.mockResolvedValue({ success: true, user: mockUser });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toEqual(mockUser);
      // Ensure the service method was called with the token
      expect(authService.getCurrentUser).toHaveBeenCalledWith(token);
    });

    test('returns 500 on service error', async () => {
      const token = jwt.sign({ userId: 'test-123' }, JWT_SECRET, { expiresIn: '1h' });

      // Mock the service to throw an error
      authService.getCurrentUser.mockRejectedValue(new Error('Internal Service Error'));

      await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(500);
    });
  });
});
