const express = require('express');
const router = express.Router();
const { supabase } = require('../utils/supabaseClient');
const authMiddleware = require('../middleware/authMiddleware'); // Assuming auth middleware exists

/**
 * @route   GET /api/notifications
 * @desc    List all notifications for a user
 * @access  Private
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get the count of unread notifications
 * @access  Private
 */
router.get('/unread-count', authMiddleware, async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id)
      .eq('is_read', false);

    if (error) {
      throw error;
    }

    res.json({ unread_count: count });
  } catch (err) {
    console.error('Error fetching unread count:', err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   POST /api/notifications/mark-read
 * @desc    Mark notifications as read
 * @access  Private
 */
router.post('/mark-read', authMiddleware, async (req, res) => {
  // Can mark all as read, or specific ones via req.body.ids
  const { ids } = req.body;

  try {
    const query = supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date() })
      .eq('user_id', req.user.id)
      .eq('is_read', false);

    if (ids && Array.isArray(ids) && ids.length > 0) {
      query.in('id', ids);
    }

    const { error } = await query;

    if (error) {
      throw error;
    }

    res.json({ msg: 'Notifications marked as read' });
  } catch (err) {
    console.error('Error marking notifications as read:', err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a notification
 * @access  Private
 */
router.delete('/:id', authMiddleware, (req, res) => {
  // Placeholder for delete logic
  res.status(501).json({ msg: 'Delete notification not implemented yet.' });
});

module.exports = router;
