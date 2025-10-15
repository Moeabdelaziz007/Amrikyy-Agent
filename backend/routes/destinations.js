const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GET /api/destinations - List all destinations
router.get('/', async (req, res) => {
  try {
    const { data: destinations, error } = await supabase
      .from('destinations')
      .select('*');

    if (error) throw error;

    res.json({ success: true, destinations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/destinations/search?q=xxx - Search destinations
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, error: 'Search query \'q\' is required' });
    }

    const { data: destinations, error } = await supabase
      .from('destinations')
      .select('*')
      .ilike('name', `%${q}%`);

    if (error) throw error;

    res.json({ success: true, destinations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/destinations/featured - Get featured destinations
router.get('/featured', async (req, res) => {
  try {
    const { data: destinations, error } = await supabase
      .from('destinations')
      .select('*')
      .eq('featured', true);

    if (error) throw error;

    res.json({ success: true, destinations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/destinations/:id - Get destination details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: destination, error } = await supabase
      .from('destinations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!destination) {
      return res.status(404).json({ success: false, error: 'Destination not found' });
    }

    res.json({ success: true, destination });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/destinations/favorites - Add a destination to favorites
router.post('/favorites', async (req, res) => {
  try {
    const { userId, destinationId } = req.body;
    if (!userId || !destinationId) {
      return res.status(400).json({ success: false, error: 'userId and destinationId are required' });
    }

    const { data, error } = await supabase
      .from('user_favorites')
      .insert([{ user_id: userId, destination_id: destinationId }]);

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/destinations/favorites/:id - Remove a destination from favorites
router.delete('/favorites/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, error: 'userId is required' });
    }

    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('destination_id', id)
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ success: true, message: 'Favorite removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
