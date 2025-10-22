const express = require('express');
const router = express.Router();
const supabase = require('../src/utils/supabaseClient');

// GET /api/destinations - List all destinations with filtering, sorting, and search
router.get('/', async (req, res) => {
  try {
    const query = supabase
      .from('destinations')
      .select('*', { count: 'exact' })
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);

    res.json({
      success: true,
      destinations: data,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching destinations:', error.message);
    res.status(500).json({
      success: false,
      error: 'An internal server error occurred while fetching destinations.',
      details: error.message,
    });
  }
});

// GET /api/destinations/search - Search destinations with filters, sorting, and pagination
router.get('/', async (req, res) => {
  try {
    const {
      search,
      region,
      price_range,
      rating,
      sort = 'name',
      order = 'asc',
      page = 1,
      limit = 10,
    } = req.query;

    let query = supabase.from('destinations').select('*', { count: 'exact' });

    // Search by name, description, or location (country)
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,description.ilike.%${search}%,country.ilike.%${search}%`
      );
    }

    // Filtering
    if (region) {
      query = query.eq('region', region);
    }
    if (price_range) {
      query = query.eq('price_range', price_range);
    }
    if (rating) {
      query = query.gte('rating', parseFloat(rating));
    }

    // Sorting
    const validSorts = ['name', 'rating', 'price_range'];
    if (validSorts.includes(sort)) {
      query = query.order(sort, { ascending: order === 'asc' });
    }

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;
    query = query.range(offset, offset + limitNum - 1);

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      destinations: data,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(count / limitNum),
      },
    });
  } catch (error) {
    console.error('Error searching destinations:', error.message);
    res.status(500).json({
      success: false,
      error: 'An internal server error occurred during the search.',
      details: error.message,
    });
  }
});

// GET /api/destinations/popular - Get popular destinations
router.get('/popular', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;

    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .order('review_count', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    res.json({ success: true, destinations: data });
  } catch (error) {
    console.error('Error fetching popular destinations:', error.message);
    res.status(500).json({
      success: false,
      error: 'An internal server error occurred.',
      details: error.message,
    });
  }
});

// GET /api/destinations/:id - Get destination details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('destinations').select('*').eq('id', id).single();

    if (error || !data) {
      return res.status(404).json({ success: false, error: 'Destination not found.' });
    }

    res.json({ success: true, destination: data });
  } catch (error) {
    console.error('Error fetching destination details:', error.message);
    res.status(500).json({
      success: false,
      error: 'An internal server error occurred.',
      details: error.message,
    });
  }
});

module.exports = router;
