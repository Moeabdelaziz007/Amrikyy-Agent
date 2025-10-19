const express = require('express');
const router = express.Router();
const { supabase } = require('../src/utils/supabaseClient');
const authenticateToken = require('../middleware/auth');

// GET /api/profile
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      user: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// PUT /api/profile
router.put('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      user: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// POST /api/profile/avatar
router.post('/avatar', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { avatar_url } = req.body;

    const { data, error } = await supabase
      .from('users')
      .update({ avatar_url })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      avatar_url: data.avatar_url,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
