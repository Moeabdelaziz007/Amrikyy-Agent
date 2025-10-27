/**
 * Profile API Tests
 * Complete test suite for /api/profile endpoints
 */

const request = require('supertest');
const jwt = require('jsonwebtoken');

// Mock Express app
const express = require('express');
const app = express();
app.use(express.json());

// Import routes
const profileRoutes = require('../../routes/profile');
app.use('/api/profile', profileRoutes);

// Mock database
jest.mock('../../database/supabase');
const SupabaseDB = require('../../database/supabase');

// Test data
const mockUser = {
  telegramId: '123456789',
  name: 'Test User',
  email: 'test@example.com',
  phone: '+1234567890',
  location: 'New York, USA',
  bio: 'Test bio',
  avatar: 'https://example.com/avatar.jpg'
};

const mockToken = jwt.sign(
  { userId: mockUser.telegramId },
  process.env.JWT_SECRET || 'test-secret',
  { expiresIn: '1h' }
);

describe('Profile API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/profile', () => {
    it('should return user profile with valid token', async () => {
      SupabaseDB.prototype.getUserProfile = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.profile).toMatchObject({
        name: mockUser.name,
        email: mockUser.email
      });
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/profile')
        .expect(401);

      expect(response.body.error).toBeDefined();
      expect(response.body.code).toBe('TOKEN_MISSING');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    it('should return 404 if user not found', async () => {
      SupabaseDB.prototype.getUserProfile = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(401);

      expect(response.body.code).toBe('USER_NOT_FOUND');
    });
  });

  describe('PUT /api/profile', () => {
    it('should update profile successfully', async () => {
      const updates = {
        name: 'Updated Name',
        bio: 'Updated bio'
      };

      SupabaseDB.prototype.getUserProfile = jest.fn().mockResolvedValue(mockUser);
      SupabaseDB.prototype.updateUserProfile = jest.fn().mockResolvedValue({ ...mockUser, ...updates });

      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.profile.name).toBe(updates.name);
    });

    it('should validate required fields', async () => {
      SupabaseDB.prototype.getUserProfile = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({})
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.code).toBe('MISSING_REQUIRED_FIELDS');
    });

    it('should validate email format', async () => {
      SupabaseDB.prototype.getUserProfile = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body.error).toContain('email');
    });

    it('should sanitize input to prevent XSS', async () => {
      const maliciousInput = {
        name: '<script>alert("xss")</script>',
        bio: '<img src=x onerror=alert(1)>'
      };

      SupabaseDB.prototype.getUserProfile = jest.fn().mockResolvedValue(mockUser);
      SupabaseDB.prototype.updateUserProfile = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(maliciousInput)
        .expect(200);

      // Should sanitize HTML
      expect(response.body.profile.name).not.toContain('<script>');
    });
  });

  describe('POST /api/profile/avatar', () => {
    it('should upload avatar successfully', async () => {
      SupabaseDB.prototype.getUserProfile = jest.fn().mockResolvedValue(mockUser);
      SupabaseDB.prototype.updateUserProfile = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/profile/avatar')
        .set('Authorization', `Bearer ${mockToken}`)
        .attach('avatar', Buffer.from('fake-image'), 'avatar.jpg')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.avatar_url).toBeDefined();
    });

    it('should reject files larger than 5MB', async () => {
      const largeFile = Buffer.alloc(6 * 1024 * 1024); // 6MB

      const response = await request(app)
        .post('/api/profile/avatar')
        .set('Authorization', `Bearer ${mockToken}`)
        .attach('avatar', largeFile, 'large.jpg')
        .expect(400);

      expect(response.body.error).toContain('File too large');
    });

    it('should reject non-image files', async () => {
      const response = await request(app)
        .post('/api/profile/avatar')
        .set('Authorization', `Bearer ${mockToken}`)
        .attach('avatar', Buffer.from('fake'), 'file.txt')
        .expect(400);

      expect(response.body.error).toContain('file type');
    });
  });

  describe('GET /api/profile/stats', () => {
    it('should return user statistics', async () => {
      const mockStats = {
        total_trips: 5,
        total_spent: 10000,
        countries_visited: 8,
        upcoming_trips: 2
      };

      SupabaseDB.prototype.getUserProfile = jest.fn().mockResolvedValue(mockUser);
      SupabaseDB.prototype.getUserStats = jest.fn().mockResolvedValue(mockStats);

      const response = await request(app)
        .get('/api/profile/stats')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.stats).toMatchObject(mockStats);
    });
  });

  describe('DELETE /api/profile', () => {
    it('should delete account successfully', async () => {
      SupabaseDB.prototype.getUserProfile = jest.fn().mockResolvedValue(mockUser);
      SupabaseDB.prototype.deleteUserAccount = jest.fn().mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/profile')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');
    });

    it('should require confirmation', async () => {
      SupabaseDB.prototype.getUserProfile = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .delete('/api/profile')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ confirm: false })
        .expect(400);

      expect(response.body.error).toContain('confirmation');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      SupabaseDB.prototype.getUserProfile = jest.fn().mockRejectedValue(new Error('DB Error'));

      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(500);

      expect(response.body.error).toBeDefined();
    });

    it('should handle rate limiting', async () => {
      // Make 100 requests rapidly
      const requests = Array(101).fill().map(() =>
        request(app)
          .get('/api/profile')
          .set('Authorization', `Bearer ${mockToken}`)
      );

      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429);

      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });
});

// Export for coverage
module.exports = {};

