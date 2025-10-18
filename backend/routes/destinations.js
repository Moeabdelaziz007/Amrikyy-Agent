const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GET /api/destinations - List all destinations with advanced filtering, sorting, and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'name',
      order = 'asc',
      search,
      country,
      min_rating,
      max_budget,
    } = req.query;

    // Create cache key for this request
    const cacheKey = `destinations:list:${JSON.stringify(req.query)}`;

    // Check cache first
    if (global.cache) {
      const cachedResult = await global.cache.get(cacheKey);
      if (cachedResult) {
        console.log('✅ Cache hit for destinations list');
        const { cacheMetrics } = require('../middleware/performance');
        cacheMetrics.recordHit();
        return res.json({ success: true, data: cachedResult, cached: true });
      } else {
        const { cacheMetrics } = require('../middleware/performance');
        cacheMetrics.recordMiss();
      }
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    let query = supabase.from('destinations').select('*', { count: 'exact' });

    // Search
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    // Filtering
    if (country) {
      query = query.eq('country', country);
    }
    if (min_rating) {
      query = query.gte('average_rating', parseFloat(min_rating));
    }
    if (max_budget) {
      query = query.lte('average_cost', parseFloat(max_budget));
    }

    // Sorting
    query = query.order(sortBy, { ascending: order === 'asc' });

    // Pagination
    query = query.range(offset, offset + limitNum - 1);

    const { data: destinations, error, count } = await query;

    if (error) throw error;

    // Cache the result for 5 minutes
    if (global.cache) {
      await global.cache.set(cacheKey, {
        destinations,
        pagination: {
          total_items: count,
          current_page: pageNum,
          per_page: limitNum,
          total_pages: Math.ceil(count / limitNum),
        },
      }, 300);
    }

    res.json({
      success: true,
      data: {
        destinations,
        pagination: {
          total_items: count,
          current_page: pageNum,
          per_page: limitNum,
          total_pages: Math.ceil(count / limitNum),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/destinations/search?q=xxx - Search destinations
router.get('/search', async (req, res) => {
  try {
    res.status(410).json({ success: false, message: "This endpoint is deprecated. Please use GET /api/destinations?search=... instead." });
  }
});

// GET /api/destinations/featured - Get featured destinations
router.get('/featured', async (req, res) => {
  try {
    // Create cache key for featured destinations
    const cacheKey = 'destinations:featured';

    // Check cache first
    if (global.cache) {
      const cachedResult = await global.cache.get(cacheKey);
      if (cachedResult) {
        console.log('✅ Cache hit for featured destinations');
        const { cacheMetrics } = require('../middleware/performance');
        cacheMetrics.recordHit();
        return res.json({ success: true, destinations: cachedResult, cached: true });
      } else {
        const { cacheMetrics } = require('../middleware/performance');
        cacheMetrics.recordMiss();
      }
    }

    const { data: destinations, error } = await supabase
      .from('destinations')
      .select('*')
      .eq('featured', true);

    if (error) throw error;

    // Cache the result for 10 minutes (featured destinations change less frequently)
    if (global.cache) {
      await global.cache.set(cacheKey, destinations, 600);
    }

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
