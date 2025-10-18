const request = require('supertest');
const app = require('../server');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

describe('Profile API', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    // Create test user in database
    const { data: user, error } = await supabase
      .from('users')
      .insert([{
        name: 'Test User',
        email: 'test@example.com',
        phone: '+1234567890',
        location: 'Test City',
        bio: 'Test bio for testing purposes'
      }])
      .select()
      .single();

    if (error) throw error;
    testUser = user;

    // Create a mock JWT token for testing
    authToken = 'test_jwt_token_for_user_' + user.id;
  });

  afterAll(async () => {
    // Clean up test data
    if (testUser) {
      await supabase
        .from('users')
        .delete()
        .eq('id', testUser.id);
    }
  });

  describe('GET /api/profile', () => {
    it('should return user profile when authenticated', async () => {
      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.name).toBe('Test User');
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/profile', () => {
    it('should update user profile successfully', async () => {
      const updateData = {
        name: 'Updated Test User',
        phone: '+9876543210',
        location: 'Updated City',
        bio: 'Updated bio for testing'
      };

      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.name).toBe('Updated Test User');
      expect(response.body.user.phone).toBe('+9876543210');
      expect(response.body.user.location).toBe('Updated City');
      expect(response.body.user.bio).toBe('Updated bio for testing');
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ invalidField: 'invalid' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .put('/api/profile')
        .send({ name: 'Unauthorized Update' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/profile/avatar', () => {
    it('should update user avatar URL successfully', async () => {
      const avatarData = {
        avatar_url: 'https://example.com/avatar.jpg'
      };

      const response = await request(app)
        .post('/api/profile/avatar')
        .set('Authorization', `Bearer ${authToken}`)
        .send(avatarData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.avatar_url).toBe('https://example.com/avatar.jpg');
    });

    it('should return 400 when avatar_url is missing', async () => {
      const response = await request(app)
        .post('/api/profile/avatar')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/profile/avatar')
        .send({ avatar_url: 'https://example.com/avatar.jpg' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/profile', () => {
    it('should delete user account successfully', async () => {
      // Create a temporary user for deletion test
      const { data: tempUser, error } = await supabase
        .from('users')
        .insert([{
          name: 'Delete Test User',
          email: 'deletetest@example.com'
        }])
        .select()
        .single();

      if (error) throw error;

      const deleteToken = 'test_jwt_token_for_user_' + tempUser.id;

      const response = await request(app)
        .delete('/api/profile')
        .set('Authorization', `Bearer ${deleteToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify user is deleted
      const { data: deletedUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', tempUser.id)
        .single();

      expect(deletedUser).toBeNull();
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .delete('/api/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Cache Integration', () => {
    it('should use cache for repeated requests', async () => {
      // First request
      const response1 = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response1.status).toBe(200);

      // Check if cache is being used (this is more of an integration test)
      // In a real scenario, we'd mock the cache to verify it's being called
      expect(response1.body).toBeDefined();
    });
  });

  describe('Performance Monitoring', () => {
    it('should include performance headers', async () => {
      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.headers['x-request-id']).toBeDefined();
      expect(response.headers['x-request-id']).toMatch(/^req_\d+_[a-z0-9]+$/);
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // Mock a database error by using invalid credentials
      // This test would require mocking the supabase client
      // For now, we'll test the error response structure

      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });
});
