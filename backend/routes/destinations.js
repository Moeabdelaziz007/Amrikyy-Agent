const express = require('express');
const router = express.Router();
const { supabase } = require('../database/supabase');

// GET /api/destinations - Get destinations with filtering, sorting, pagination, and search
router.get('/', async (req, res) => {
  try {
    let query = supabase.from('destinations').select('*', { count: 'exact' });

    // Filtering
    if (req.query.region) {
      query = query.eq('region', req.query.region);
    }
    if (req.query.price_range) {
      const [min, max] = req.query.price_range.split('-').map(Number);
      if (!isNaN(min) && !isNaN(max)) {
        query = query.gte('average_price', min).lte('average_price', max);
      }
    }
    if (req.query.rating) {
      const rating = Number(req.query.rating);
      if(!isNaN(rating)){
        query = query.gte('rating', rating);
      }
    }

    // Searching
    if (req.query.search) {
      query = query.or(`name.ilike.%${req.query.search}%,description.ilike.%${req.query.search}%`);
    }

    // Sorting
    if (req.query.sort) {
      const [field, order] = req.query.sort.split(':');
      if(field && order){
        const ascending = order.toLowerCase() === 'asc';
        query = query.order(field, { ascending });
      }
    } else {
      query = query.order('name', { ascending: true }); // Default sort
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit - 1;

    query = query.range(startIndex, endIndex);

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data,
      pagination: {
        total: count,
        limit,
        page,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;