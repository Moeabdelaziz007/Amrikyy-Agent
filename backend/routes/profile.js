/**
 * @fileoverview User Profile API routes for Amrikyy Travel Agent.
 * @module routes/profile
 * @author Gemini Code Assist
 * @date 2025-10-19
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const authenticateToken = require('../middleware/auth'); // Assuming auth middleware exists
const logger = require('../src/utils/logger'); // Assuming logger exists

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

/**
 * GET /api/profile
 * Get the profile of the authenticated user.
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    logger.info(`Fetching profile for user ID: ${userId}`);

    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, avatar_url, bio, created_at')
      .eq('id', userId)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ success: false, error: 'User profile not found.' });
    }

    res.json({
      success: true,
      user: data,
    });
  } catch (error) {
    logger.error(`Error fetching profile: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while fetching the profile.',
    });
  }
});

/**
 * PUT /api/profile
 * Update the profile of the authenticated user.
 */
router.put('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, bio } = req.body;

    // Basic validation
    if (!name && !bio) {
      return res.status(400).json({ success: false, error: 'No update data provided.' });
    }

    const updates = {};
    if (name) updates.name = name;
    if (bio) updates.bio = bio;
    updates.updated_at = new Date().toISOString();

    logger.info(`Updating profile for user ID: ${userId}`);

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select('id, email, name, avatar_url, bio')
      .single();

    if (error) throw error;

    res.json({
      success: true,
      user: data,
    });
  } catch (error) {
    logger.error(`Error updating profile: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while updating the profile.',
    });
  }
});

/**
 * POST /api/profile/avatar
 * Update the user's avatar URL.
 * Note: This endpoint expects a URL, not a file upload, for simplicity.
 * A separate service would handle file uploads and provide the URL.
 */
router.post('/avatar', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { avatar_url } = req.body;

    if (!avatar_url || typeof avatar_url !== 'string') {
      return res.status(400).json({ success: false, error: 'A valid avatar_url is required.' });
    }

    logger.info(`Updating avatar for user ID: ${userId}`);

    const { data, error } = await supabase
      .from('users')
      .update({ avatar_url })
      .eq('id', userId)
      .select('id, avatar_url')
      .single();

    if (error) throw error;

    res.json({
      success: true,
      avatar_url: data.avatar_url,
    });
  } catch (error) {
    logger.error(`Error updating avatar: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while updating the avatar.',
    });
  }
});

/**
 * DELETE /api/profile
 * Delete the authenticated user's account.
 * This is a protected and sensitive operation.
 */
router.delete('/', authenticateToken, async (req, res) => {
  // In a real application, this would require password confirmation
  // and would trigger a series of cleanup jobs.
  try {
    const userId = req.user.id;
    logger.warn(`Initiating account deletion for user ID: ${userId}`);

    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) throw error;

    res.status(200).json({ success: true, message: 'User account deleted successfully.' });
  } catch (error) {
    logger.error(`Error deleting account: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to delete user account.' });
  }
});

module.exports = router;
