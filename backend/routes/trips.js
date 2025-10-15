const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// TODO: Implement and enable authentication middleware
// const authenticateUser = (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1];
//   if (!token) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }
//   // Verify JWT and attach user to req.user
//   // For now, we'll use a dummy user for development
//   req.user = { id: '123e4567-e89b-12d3-a456-426614174000' }; // Example UUID
//   next();
// };
// router.use(authenticateUser);

// GET /api/trips - List all trips (for now, not user-specific)
router.get('/', async (req, res) => {
  try {
    // const userId = req.user.id; // Use this when auth is ready
    const { data: trips, error } = await supabase
      .from('trips')
      .select('*')
      // .eq('user_id', userId) // Enable this when auth is ready
      .order('start_date', { ascending: false });
    
    if (error) throw error;
    
    res.json({
      success: true,
      trips
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/trips - Create new trip
router.post('/', async (req, res) => {
  try {
    // const userId = req.user.id; // Use this when auth is ready
    const tripData = {
      ...req.body,
      // user_id: userId, // Enable this when auth is ready
    };
    
    const { data: trip, error } = await supabase
      .from('trips')
      .insert([tripData])
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json({
      success: true,
      trip
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/trips/:id - Get trip details
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data: trip, error } = await supabase
            .from('trips')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        if (!trip) {
            return res.status(404).json({ success: false, error: 'Trip not found' });
        }

        res.json({
            success: true,
            trip
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// PUT /api/trips/:id - Update trip
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        const { data: trip, error } = await supabase
            .from('trips')
            .update(updatedData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json({
            success: true,
            trip
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// DELETE /api/trips/:id - Delete trip
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('trips')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({
            success: true,
            message: 'Trip deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;