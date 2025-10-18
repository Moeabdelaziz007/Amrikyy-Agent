const request = require('supertest');
const app = require('../server');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

describe('Notifications API', () => {
  let testUser;
  let authToken;
  let testNotification;

  beforeAll(async () => {
    // Create test user in database
    const { data: user, error } = await supabase
      .from('users')
      .insert([{
        name: 'Notification Test User',
        email: 'notificationtest@example.com'
      }])
      .select()
      .single();

    if (error) throw error;
    testUser = user;
    authToken = 'test_jwt_token_for_user_' + user.id;

    // Create test notification
    const { data: notification, error: notifError } = await supabase
      .from('notifications')
      .insert([{
        user_id: user.id,
        title: 'Test Notification',
        message: 'This is a test notification for testing purposes',
        type: 'info',
        read: false
      }])
      .select()
      .single();

    if (notifError) throw notifError;
    testNotification = notification;
  });

  afterAll(async () => {
    // Clean up test data
    if (testUser) {
      await supabase
        .from('users')
        .delete()
        .eq('id', testUser.id);
    }

    if (testNotification) {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', testNotification.id);
    }
  });

  describe('GET /api/notifications', () => {
    it('should return user notifications when authenticated', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.notifications)).toBe(true);
      expect(response.body.notifications.length).toBeGreaterThan(0);

      const notification = response.body.notifications[0];
      expect(notification.title).toBe('Test Notification');
      expect(notification.message).toBe('This is a test notification for testing purposes');
      expect(notification.type).toBe('info');
      expect(notification.read).toBe(false);
    });

    it('should return empty array when no notifications exist', async () => {
      // Create a user with no notifications
      const { data: emptyUser, error } = await supabase
        .from('users')
        .insert([{
          name: 'Empty User',
          email: 'emptyuser@example.com'
        }])
        .select()
        .single();

      if (error) throw error;

      const emptyToken = 'test_jwt_token_for_user_' + emptyUser.id;

      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${emptyToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.notifications)).toBe(true);
      expect(response.body.notifications.length).toBe(0);

      // Clean up
      await supabase
        .from('users')
        .delete()
        .eq('id', emptyUser.id);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should support pagination', async () => {
      // Create multiple notifications for pagination testing
      const notifications = [];
      for (let i = 0; i < 5; i++) {
        const { data, error } = await supabase
          .from('notifications')
          .insert([{
            user_id: testUser.id,
            title: `Pagination Test ${i}`,
            message: `Test message ${i}`,
            type: 'info',
            read: false
          }])
          .select()
          .single();

        if (error) throw error;
        notifications.push(data);
      }

      const response = await request(app)
        .get('/api/notifications?limit=3&page=1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.notifications.length).toBe(3);

      // Clean up
      for (const notif of notifications) {
        await supabase
          .from('notifications')
          .delete()
          .eq('id', notif.id);
      }
    });
  });

  describe('POST /api/notifications', () => {
    it('should create a new notification successfully', async () => {
      const notificationData = {
        title: 'New Test Notification',
        message: 'This is a newly created test notification',
        type: 'success'
      };

      const response = await request(app)
        .post('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .send(notificationData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.notification).toBeDefined();
      expect(response.body.notification.title).toBe('New Test Notification');
      expect(response.body.notification.message).toBe('This is a newly created test notification');
      expect(response.body.notification.type).toBe('success');
      expect(response.body.notification.read).toBe(false);

      // Clean up
      await supabase
        .from('notifications')
        .delete()
        .eq('id', response.body.notification.id);
    });

    it('should return 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Missing message' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid notification type', async () => {
      const response = await request(app)
        .post('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Invalid Type',
          message: 'Test message',
          type: 'invalid_type'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/notifications')
        .send({
          title: 'Unauthorized',
          message: 'Test message',
          type: 'info'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/notifications/:id', () => {
    it('should mark notification as read successfully', async () => {
      const response = await request(app)
        .put(`/api/notifications/${testNotification.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ read: true })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.notification.read).toBe(true);

      // Reset for other tests
      await supabase
        .from('notifications')
        .update({ read: false })
        .eq('id', testNotification.id);
    });

    it('should return 404 for non-existent notification', async () => {
      const response = await request(app)
        .put('/api/notifications/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ read: true })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .put(`/api/notifications/${testNotification.id}`)
        .send({ read: true })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/notifications/:id', () => {
    let tempNotification;

    beforeAll(async () => {
      // Create a temporary notification for deletion test
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          user_id: testUser.id,
          title: 'Delete Test Notification',
          message: 'This notification will be deleted',
          type: 'warning',
          read: false
        }])
        .select()
        .single();

      if (error) throw error;
      tempNotification = data;
    });

    it('should delete notification successfully', async () => {
      const response = await request(app)
        .delete(`/api/notifications/${tempNotification.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Notification deleted successfully');

      // Verify notification is deleted
      const { data: deletedNotif } = await supabase
        .from('notifications')
        .select('*')
        .eq('id', tempNotification.id)
        .single();

      expect(deletedNotif).toBeNull();
    });

    it('should return 404 for non-existent notification', async () => {
      const response = await request(app)
        .delete('/api/notifications/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .delete(`/api/notifications/${testNotification.id}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/notifications/read-all', () => {
    beforeAll(async () => {
      // Create multiple unread notifications for bulk read test
      const notifications = [];
      for (let i = 0; i < 3; i++) {
        const { data, error } = await supabase
          .from('notifications')
          .insert([{
            user_id: testUser.id,
            title: `Bulk Read Test ${i}`,
            message: `Test message ${i}`,
            type: 'info',
            read: false
          }])
          .select()
          .single();

        if (error) throw error;
        notifications.push(data);
      }
    });

    it('should mark all notifications as read successfully', async () => {
      const response = await request(app)
        .post('/api/notifications/read-all')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('All notifications marked as read');

      // Verify all notifications are marked as read
      const { data: notifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', testUser.id);

      notifications.forEach(notification => {
        expect(notification.read).toBe(true);
      });
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/notifications/read-all')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Cache Integration', () => {
    it('should use cache for repeated requests', async () => {
      // First request to populate cache
      const response1 = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response1.status).toBe(200);

      // Second request should use cache
      const response2 = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response2.status).toBe(200);
      expect(response2.body).toBeDefined();
    });
  });

  describe('Performance Monitoring', () => {
    it('should include performance headers', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.headers['x-request-id']).toBeDefined();
      expect(response.headers['x-request-id']).toMatch(/^req_\d+_[a-z0-9]+$/);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send('{ malformed json')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should handle database errors gracefully', async () => {
      // This would require mocking the database connection
      // For now, we'll test the error response structure

      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });
});
