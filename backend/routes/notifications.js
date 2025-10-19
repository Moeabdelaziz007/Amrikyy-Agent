const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const authenticateToken = require('../middleware/auth');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// GET /api/notifications - List user notifications with pagination
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      notifications: data,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error.message);
    res.status(500).json({
      success: false,
      error: 'An internal server error occurred while fetching notifications.',
      details: error.message,
    });
  }
});

// POST /api/notifications - Create a notification (for internal system use)
router.post('/', authenticateToken, async (req, res) => {
  try {
    // In a real app, this might be a protected admin/system route.
    const { user_id, title, message, type } = req.body;

    if (!user_id || !title || !message) {
      return res.status(400).json({
        success: false,
        error: 'user_id, title, and message are required.',
      });
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert([{ user_id, title, message, type: type || 'info' }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({ success: true, notification: data });
  } catch (error) {
    console.error('Error creating notification:', error.message);
    res.status(500).json({
      success: false,
      error: 'An internal server error occurred while creating the notification.',
      details: error.message,
    });
  }
});

// PUT /api/notifications/:id - Mark a notification as read
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .eq('user_id', userId) // Ensure user can only update their own notifications
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({ success: true, notification: data });
  } catch (error) {
    console.error('Error updating notification:', error.message);
    res.status(500).json({
      success: false,
      error: 'An internal server error occurred while updating the notification.',
      details: error.message,
    });
  }
});

// DELETE /api/notifications/:id - Delete a notification
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    res.json({ success: true, message: 'Notification deleted successfully.' });
  } catch (error) {
    console.error('Error deleting notification:', error.message);
    res.status(500).json({
      success: false,
      error: 'An internal server error occurred while deleting the notification.',
      details: error.message,
    });
  }
});

// POST /api/notifications/read-all - Mark all as read
router.post('/read-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      throw error;
    }

    res.json({ success: true, message: 'All unread notifications marked as read.' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error.message);
    res.status(500).json({
      success: false,
      error: 'An internal server error occurred.',
      details: error.message,
    });
  }
});

module.exports = router;
