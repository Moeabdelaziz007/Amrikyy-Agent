/**
 * izi.TRAVEL API Routes
 * Endpoints for accessing izi.TRAVEL tours, museums, and attractions
 */

const express = require('express');
const router = express.Router();
const iziTravelService = require('../src/services/izi-travel/IziTravelService');
const logger = require('../src/utils/logger');

/**
 * Search for content
 * GET /api/izi-travel/search
 */
router.get('/search', async (req, res) => {
  try {
    const results = await iziTravelService.search(req.query);
    res.json({
      success: true,
      count: results.length || 0,
      results,
    });
  } catch (error) {
    logger.error('izi.TRAVEL search error:', error);
    res.status(500).json({
      success: false,
      error: error.error || error.message,
      details: error.details,
    });
  }
});

/**
 * Get object details
 * GET /api/izi-travel/object/:uuid
 */
router.get('/object/:uuid', async (req, res) => {
  try {
    const object = await iziTravelService.getObject(req.params.uuid, req.query);
    res.json({
      success: true,
      object,
    });
  } catch (error) {
    logger.error('izi.TRAVEL object error:', error);
    res.status(500).json({
      success: false,
      error: error.error || error.message,
      details: error.details,
    });
  }
});

/**
 * Get nearby tours
 * GET /api/izi-travel/tours/nearby
 */
router.get('/tours/nearby', async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required',
      });
    }

    const tours = await iziTravelService.getToursNearby(
      parseFloat(lat),
      parseFloat(lon),
      req.query
    );

    res.json({
      success: true,
      count: tours.length || 0,
      tours,
    });
  } catch (error) {
    logger.error('izi.TRAVEL nearby tours error:', error);
    res.status(500).json({
      success: false,
      error: error.error || error.message,
    });
  }
});

/**
 * Get nearby museums
 * GET /api/izi-travel/museums/nearby
 */
router.get('/museums/nearby', async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required',
      });
    }

    const museums = await iziTravelService.getMuseumsNearby(
      parseFloat(lat),
      parseFloat(lon),
      req.query
    );

    res.json({
      success: true,
      count: museums.length || 0,
      museums,
    });
  } catch (error) {
    logger.error('izi.TRAVEL nearby museums error:', error);
    res.status(500).json({
      success: false,
      error: error.error || error.message,
    });
  }
});

/**
 * Get nearby attractions
 * GET /api/izi-travel/attractions/nearby
 */
router.get('/attractions/nearby', async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required',
      });
    }

    const attractions = await iziTravelService.getAttractionsNearby(
      parseFloat(lat),
      parseFloat(lon),
      req.query
    );

    res.json({
      success: true,
      count: attractions.length || 0,
      attractions,
    });
  } catch (error) {
    logger.error('izi.TRAVEL nearby attractions error:', error);
    res.status(500).json({
      success: false,
      error: error.error || error.message,
    });
  }
});

/**
 * Get cities
 * GET /api/izi-travel/cities
 */
router.get('/cities', async (req, res) => {
  try {
    const cities = await iziTravelService.getCities(req.query);
    res.json({
      success: true,
      count: cities.length || 0,
      cities,
    });
  } catch (error) {
    logger.error('izi.TRAVEL cities error:', error);
    res.status(500).json({
      success: false,
      error: error.error || error.message,
    });
  }
});

/**
 * Get countries
 * GET /api/izi-travel/countries
 */
router.get('/countries', async (req, res) => {
  try {
    const countries = await iziTravelService.getCountries(req.query);
    res.json({
      success: true,
      count: countries.length || 0,
      countries,
    });
  } catch (error) {
    logger.error('izi.TRAVEL countries error:', error);
    res.status(500).json({
      success: false,
      error: error.error || error.message,
    });
  }
});

/**
 * Get featured content
 * GET /api/izi-travel/featured
 */
router.get('/featured', async (req, res) => {
  try {
    const featured = await iziTravelService.getFeaturedContent(
      req.query.languages
    );
    res.json({
      success: true,
      featured,
    });
  } catch (error) {
    logger.error('izi.TRAVEL featured content error:', error);
    res.status(500).json({
      success: false,
      error: error.error || error.message,
    });
  }
});

/**
 * Get reviews for an object
 * GET /api/izi-travel/object/:uuid/reviews
 */
router.get('/object/:uuid/reviews', async (req, res) => {
  try {
    const reviews = await iziTravelService.getReviews(
      req.params.uuid,
      req.query
    );
    res.json({
      success: true,
      reviews,
    });
  } catch (error) {
    logger.error('izi.TRAVEL reviews error:', error);
    res.status(500).json({
      success: false,
      error: error.error || error.message,
    });
  }
});

/**
 * Get children of an object
 * GET /api/izi-travel/object/:uuid/children
 */
router.get('/object/:uuid/children', async (req, res) => {
  try {
    const children = await iziTravelService.getChildren(
      req.params.uuid,
      req.query
    );
    res.json({
      success: true,
      children,
    });
  } catch (error) {
    logger.error('izi.TRAVEL children error:', error);
    res.status(500).json({
      success: false,
      error: error.error || error.message,
    });
  }
});

/**
 * Search by city
 * GET /api/izi-travel/city/:uuid/search
 */
router.get('/city/:uuid/search', async (req, res) => {
  try {
    const results = await iziTravelService.searchByCity(
      req.params.uuid,
      req.query
    );
    res.json({
      success: true,
      count: results.length || 0,
      results,
    });
  } catch (error) {
    logger.error('izi.TRAVEL city search error:', error);
    res.status(500).json({
      success: false,
      error: error.error || error.message,
    });
  }
});

/**
 * Get supported languages
 * GET /api/izi-travel/languages
 */
router.get('/languages', async (req, res) => {
  try {
    const languages = await iziTravelService.getSupportedLanguages();
    res.json({
      success: true,
      languages,
    });
  } catch (error) {
    logger.error('izi.TRAVEL languages error:', error);
    res.status(500).json({
      success: false,
      error: error.error || error.message,
    });
  }
});

/**
 * Health check
 * GET /api/izi-travel/health
 */
router.get('/health', async (req, res) => {
  try {
    const health = await iziTravelService.healthCheck();
    res.json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
});

/**
 * Clear cache
 * POST /api/izi-travel/clear-cache
 */
router.post('/clear-cache', async (req, res) => {
  try {
    await iziTravelService.clearCache(req.body.pattern);
    res.json({
      success: true,
      message: 'Cache cleared successfully',
    });
  } catch (error) {
    logger.error('izi.TRAVEL clear cache error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
