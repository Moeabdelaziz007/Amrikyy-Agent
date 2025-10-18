const express = require('express');
const router = express.Router();
const { supabase } = require('../utils/supabaseClient');
const authMiddleware = require('../middleware/authMiddleware'); // Assuming auth middleware exists

/**
 * @route   GET /api/profile
 * @desc    Fetch user profile
 * @access  Private
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116: "single" row not found
      throw error;
    }

    if (!profile) {
      return res.status(404).json({ msg: 'Profile not found' });
    }

    res.json(profile);
  } catch (err) {
    console.error('Error fetching profile:', err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   PUT /api/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/', authMiddleware, async (req, res) => {
  const { full_name, website, avatar_url } = req.body;

  const profileData = {
    id: req.user.id,
    full_name,
    website,
    avatar_url,
    updated_at: new Date(),
  };

  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profileData, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (err) {
    console.error('Error updating profile:', err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   GET /api/profile/stats
 * @desc    Get user statistics (e.g., trips planned, money saved)
 * @access  Private
 */
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    // Placeholder for more complex queries
    const { data: trips, error: tripsError } = await supabase
      .from('trips')
      .select('id', { count: 'exact' })
      .eq('user_id', req.user.id);

    if (tripsError) throw tripsError;

    // Example static data
    const stats = {
      trips_planned: trips.length,
      countries_visited: 5, // Placeholder
      money_saved: 1250.75, // Placeholder
    };

    res.json(stats);
  } catch (err) {
    console.error('Error fetching user stats:', err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   POST /api/profile/avatar
 * @desc    Upload user avatar (placeholder for storage logic)
 * @access  Private
 */
router.post('/avatar', authMiddleware, (req, res) => {
  // This would typically involve multer middleware and Supabase Storage
  // For now, it's a placeholder acknowledging the endpoint.
  res.status(501).json({ msg: 'Avatar upload not implemented yet.' });
});

module.exports = router;
