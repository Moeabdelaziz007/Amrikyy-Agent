const express = require('express');
const router = express.Router();
const QdrantService = require('../src/services/qdrantService');

const qdrantService = new QdrantService();

/**
 * @route GET /api/qdrant/health
 * @desc Check Qdrant service health
 */
router.get('/health', async (req, res) => {
  try {
    const health = await qdrantService.healthCheck();
    res.json({
      success: true,
      data: health,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route POST /api/qdrant/search/destinations
 * @desc Search for similar travel destinations
 */
router.post('/search/destinations', async (req, res) => {
  try {
    const { query, limit = 10 } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required',
      });
    }

    const results = await qdrantService.searchDestinations(query, limit);

    res.json({
      success: true,
      data: {
        query,
        results,
        count: results.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route POST /api/qdrant/recommendations
 * @desc Get personalized travel recommendations
 */
router.post('/recommendations', async (req, res) => {
  try {
    const { userId, limit = 10 } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }

    const recommendations = await qdrantService.getRecommendations(userId, limit);

    res.json({
      success: true,
      data: {
        userId,
        recommendations,
        count: recommendations.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route POST /api/qdrant/analyze/reviews
 * @desc Analyze travel reviews for destination
 */
router.post('/analyze/reviews', async (req, res) => {
  try {
    const { destination, limit = 20 } = req.body;

    if (!destination) {
      return res.status(400).json({
        success: false,
        error: 'Destination parameter is required',
      });
    }

    const reviews = await qdrantService.analyzeReviews(destination, limit);

    // Analyze sentiment
    const sentimentAnalysis = analyzeSentiment(reviews);

    res.json({
      success: true,
      data: {
        destination,
        reviews,
        sentimentAnalysis,
        count: reviews.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route POST /api/qdrant/marketing/search
 * @desc Kody marketing content search
 */
router.post('/marketing/search', async (req, res) => {
  try {
    const { query, limit = 10 } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required',
      });
    }

    const content = await qdrantService.searchMarketingContent(query, limit);

    res.json({
      success: true,
      data: {
        query,
        content,
        count: content.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route POST /api/qdrant/destinations
 * @desc Add new travel destination
 */
router.post('/destinations', async (req, res) => {
  try {
    const destination = req.body;

    if (!destination.name || !destination.description) {
      return res.status(400).json({
        success: false,
        error: 'Name and description are required',
      });
    }

    const result = await qdrantService.addDestination(destination);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route POST /api/qdrant/marketing/content
 * @desc Add marketing content for Kody analysis
 */
router.post('/marketing/content', async (req, res) => {
  try {
    const content = req.body;

    if (!content.content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required',
      });
    }

    const result = await qdrantService.addMarketingContent(content);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * @route POST /api/qdrant/initialize
 * @desc Initialize Qdrant collections
 */
router.post('/initialize', async (req, res) => {
  try {
    await qdrantService.initializeCollections();

    res.json({
      success: true,
      message: 'Collections initialized successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Helper function to analyze sentiment from reviews
 */
function analyzeSentiment(reviews) {
  const positiveWords = ['amazing', 'wonderful', 'excellent', 'fantastic', 'beautiful', 'perfect'];
  const negativeWords = ['terrible', 'awful', 'disappointing', 'bad', 'horrible', 'worst'];

  let positiveCount = 0;
  let negativeCount = 0;
  let totalScore = 0;

  reviews.forEach((review) => {
    const text = (review.payload.review_text || '').toLowerCase();
    const rating = review.payload.rating || 0;

    positiveWords.forEach((word) => {
      if (text.includes(word)) positiveCount++;
    });

    negativeWords.forEach((word) => {
      if (text.includes(word)) negativeCount++;
    });

    totalScore += rating;
  });

  const averageRating = reviews.length > 0 ? totalScore / reviews.length : 0;
  const overallSentiment =
    positiveCount > negativeCount
      ? 'positive'
      : negativeCount > positiveCount
      ? 'negative'
      : 'neutral';

  return {
    overallSentiment,
    averageRating,
    positiveCount,
    negativeCount,
    totalReviews: reviews.length,
  };
}

module.exports = router;
