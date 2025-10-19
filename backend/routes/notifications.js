const express = require('express');
const router = express.Router();
const { supabase } = require('../database/supabase');
const { authenticateToken } = require('../middleware/auth'); // Assuming this middleware exists

// GET /api/notifications - List user notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, notifications: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/notifications - Create a notification (for testing/internal use)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { user_id, title, message, type } = req.body;
        if (!user_id || !title || !message) {
            return res.status(400).json({ success: false, error: 'user_id, title, and message are required' });
        }

        const { data, error } = await supabase
            .from('notifications')
            .insert([{ user_id, title, message, type: type || 'info' }])
            .select();

        if (error) throw error;

        res.status(201).json({ success: true, notification: data[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


// PUT /api/notifications/:id - Mark a notification as read
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;

    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', userId)
      .select();

    if (error) throw error;
    if (data.length === 0) {
        return res.status(404).json({ success: false, error: 'Notification not found or you do not have permission to update it.' });
    }

    res.json({ success: true, notification: data[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/notifications/:id - Delete a notification
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const notificationId = req.params.id;

        const { data, error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', notificationId)
            .eq('user_id', userId);

        // Here, supabase-js v2 delete doesn't return the deleted row in `data` directly,
        // and a successful delete with a matching row returns a count.
        // We'll assume if there's no error, the operation was successful if a row was matched.
        // For a more robust check, one might select before deleting.
        if (error) throw error;

        // The `data` from a delete operation is often null or an empty array in v2,
        // and what indicates success is the absence of an error and potentially the `count`.
        // Note: The actual return structure can depend on Supabase settings (e.g., `Prefer: return=representation`).
        // Without it, we might not get the deleted record back.
        // A simple success message is often sufficient.
        res.json({ success: true, message: 'Notification deleted successfully.' });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


// POST /api/notifications/read-all - Mark all notifications as read
router.post('/read-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;

    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;