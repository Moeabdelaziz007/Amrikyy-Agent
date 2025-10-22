/**
 * Mini-Apps API Routes
 * Routes for all AI Agent Mini-Apps
 * 
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-22
 */

const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// Import agents
const TravelAgencyAgent = require('../src/agents/TravelAgencyAgent');
const ContentCreatorAgent = require('../src/agents/ContentCreatorAgent');
const InnovationAgent = require('../src/agents/InnovationAgent');

// Initialize agents
const travelAgent = new TravelAgencyAgent();
const contentAgent = new ContentCreatorAgent();
const innovationAgent = new InnovationAgent();

// ============================================================================
// TRAVEL AGENCY AGENT ROUTES
// ============================================================================

/**
 * @route   POST /api/mini-apps/travel/flights/search
 * @desc    Search for flights
 * @access  Public
 */
router.post('/travel/flights/search', async (req, res) => {
  try {
    const { from, to, date, passengers, class: travelClass } = req.body;
    
    if (!from || !to || !date) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: from, to, date'
      });
    }
    
    const result = await travelAgent.searchFlights({
      from,
      to,
      date,
      passengers: passengers || 1,
      class: travelClass || 'economy'
    });
    
    res.json(result);
    
  } catch (error) {
    logger.error('Flight search error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/mini-apps/travel/hotels/search
 * @desc    Search for hotels
 * @access  Public
 */
router.post('/travel/hotels/search', async (req, res) => {
  try {
    const { destination, checkin, checkout, guests, rooms } = req.body;
    
    if (!destination || !checkin || !checkout) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: destination, checkin, checkout'
      });
    }
    
    const result = await travelAgent.searchHotels({
      destination,
      checkin,
      checkout,
      guests: guests || 1,
      rooms: rooms || 1
    });
    
    res.json(result);
    
  } catch (error) {
    logger.error('Hotel search error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/mini-apps/travel/itinerary/generate
 * @desc    Generate travel itinerary
 * @access  Public
 */
router.post('/travel/itinerary/generate', async (req, res) => {
  try {
    const { destination, duration, interests, budget, travelers } = req.body;
    
    if (!destination || !duration) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: destination, duration'
      });
    }
    
    const result = await travelAgent.generateItinerary({
      destination,
      duration,
      interests: interests || [],
      budget,
      travelers: travelers || 1
    });
    
    res.json(result);
    
  } catch (error) {
    logger.error('Itinerary generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/mini-apps/travel/destinations/recommend
 * @desc    Get destination recommendations
 * @access  Public
 */
router.post('/travel/destinations/recommend', async (req, res) => {
  try {
    const { budget, interests, duration, season, travelers } = req.body;
    
    const result = await travelAgent.getDestinationRecommendations({
      budget,
      interests: interests || [],
      duration,
      season,
      travelers: travelers || 1
    });
    
    res.json(result);
    
  } catch (error) {
    logger.error('Destination recommendations error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/mini-apps/travel/visa/check
 * @desc    Check visa requirements
 * @access  Public
 */
router.post('/travel/visa/check', async (req, res) => {
  try {
    const { destination, nationality, purpose, duration } = req.body;
    
    if (!destination || !nationality) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: destination, nationality'
      });
    }
    
    const result = await travelAgent.getVisaRequirements({
      destination,
      nationality,
      purpose: purpose || 'tourism',
      duration: duration || 7
    });
    
    res.json(result);
    
  } catch (error) {
    logger.error('Visa check error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/mini-apps/travel/package/create
 * @desc    Create complete travel package
 * @access  Public
 */
router.post('/travel/package/create', async (req, res) => {
  try {
    const { destination, from, date, duration, budget, travelers, interests } = req.body;
    
    if (!destination || !from || !date || !duration) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: destination, from, date, duration'
      });
    }
    
    const result = await travelAgent.createCompletePackage({
      destination,
      from,
      date,
      duration,
      budget,
      travelers: travelers || 1,
      interests: interests || []
    });
    
    res.json(result);
    
  } catch (error) {
    logger.error('Package creation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/mini-apps/travel/status
 * @desc    Get travel agent status
 * @access  Public
 */
router.get('/travel/status', (req, res) => {
  try {
    const status = travelAgent.getStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('Status error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// CONTENT CREATOR AGENT ROUTES
// ============================================================================

/**
 * @route   POST /api/mini-apps/content/blog/generate
 * @desc    Generate blog post
 * @access  Public
 */
router.post('/content/blog/generate', async (req, res) => {
  try {
    const { topic, type, tone, length, keywords, targetAudience, includeImages } = req.body;
    
    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: topic'
      });
    }
    
    const result = await contentAgent.generateBlogPost({
      topic,
      type: type || 'how-to',
      tone: tone || 'professional',
      length: length || 1500,
      keywords: keywords || [],
      targetAudience: targetAudience || 'general',
      includeImages: includeImages !== false
    });
    
    res.json(result);
    
  } catch (error) {
    logger.error('Blog generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/mini-apps/content/social/generate
 * @desc    Generate social media posts
 * @access  Public
 */
router.post('/content/social/generate', async (req, res) => {
  try {
    const { topic, platforms, tone, includeHashtags, includeImages, count } = req.body;
    
    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: topic'
      });
    }
    
    const result = await contentAgent.generateSocialPosts({
      topic,
      platforms: platforms || ['twitter', 'instagram', 'linkedin'],
      tone: tone || 'engaging',
      includeHashtags: includeHashtags !== false,
      includeImages: includeImages !== false,
      count: count || 5
    });
    
    res.json(result);
    
  } catch (error) {
    logger.error('Social posts generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/mini-apps/content/video/script
 * @desc    Generate video script
 * @access  Public
 */
router.post('/content/video/script', async (req, res) => {
  try {
    const { topic, duration, style, platform, includeVisuals, generateVideo } = req.body;
    
    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: topic'
      });
    }
    
    const result = await contentAgent.generateVideoScript({
      topic,
      duration: duration || 300,
      style: style || 'educational',
      platform: platform || 'youtube',
      includeVisuals: includeVisuals !== false,
      generateVideo: generateVideo === true
    });
    
    res.json(result);
    
  } catch (error) {
    logger.error('Video script generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/mini-apps/content/research
 * @desc    Research topic using NotebookLM
 * @access  Public
 */
router.post('/content/research', async (req, res) => {
  try {
    const { topic, depth } = req.body;
    
    if (!topic) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: topic'
      });
    }
    
    const result = await contentAgent.researchTopic(topic, depth || 'comprehensive');
    
    res.json(result);
    
  } catch (error) {
    logger.error('Research error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/mini-apps/content/calendar/generate
 * @desc    Generate content calendar
 * @access  Public
 */
router.post('/content/calendar/generate', async (req, res) => {
  try {
    const { duration, platforms, topics, frequency } = req.body;
    
    const result = await contentAgent.generateContentCalendar({
      duration: duration || 30,
      platforms: platforms || ['blog', 'social', 'video'],
      topics: topics || [],
      frequency: frequency || 'daily'
    });
    
    res.json(result);
    
  } catch (error) {
    logger.error('Calendar generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/mini-apps/content/status
 * @desc    Get content creator agent status
 * @access  Public
 */
router.get('/content/status', (req, res) => {
  try {
    const status = contentAgent.getStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('Status error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// INNOVATION AGENT ROUTES
// ============================================================================

/**
 * @route   POST /api/mini-apps/innovation/ideas/generate
 * @desc    Generate business ideas
 * @access  Public
 */
router.post('/innovation/ideas/generate', async (req, res) => {
  try {
    const { industry, problem, target, count, includeAnalysis, budget } = req.body;
    
    const result = await innovationAgent.generateIdeas({
      industry: industry || 'technology',
      problem,
      target: target || 'startups',
      count: count || 10,
      includeAnalysis: includeAnalysis !== false,
      budget: budget || 'low'
    });
    
    res.json(result);
    
  } catch (error) {
    logger.error('Idea generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/mini-apps/innovation/trends/analyze
 * @desc    Analyze market trends
 * @access  Public
 */
router.post('/innovation/trends/analyze', async (req, res) => {
  try {
    const { industry, timeframe, depth, includeForecasts } = req.body;
    
    const result = await innovationAgent.analyzeTrends({
      industry: industry || 'technology',
      timeframe: timeframe || '2025',
      depth: depth || 'comprehensive',
      includeForecasts: includeForecasts !== false
    });
    
    res.json(result);
    
  } catch (error) {
    logger.error('Trend analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/mini-apps/innovation/competitors/analyze
 * @desc    Analyze competitors
 * @access  Public
 */
router.post('/innovation/competitors/analyze', async (req, res) => {
  try {
    const { idea, competitors, depth } = req.body;
    
    if (!idea) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: idea'
      });
    }
    
    const result = await innovationAgent.analyzeCompetitors({
      idea,
      competitors: competitors || [],
      depth: depth || 'detailed'
    });
    
    res.json(result);
    
  } catch (error) {
    logger.error('Competitive analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/mini-apps/innovation/validate
 * @desc    Validate startup idea
 * @access  Public
 */
router.post('/innovation/validate', async (req, res) => {
  try {
    const { idea, targetMarket, budget, timeline } = req.body;
    
    if (!idea) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: idea'
      });
    }
    
    const result = await innovationAgent.validateIdea({
      idea,
      targetMarket,
      budget,
      timeline
    });
    
    res.json(result);
    
  } catch (error) {
    logger.error('Idea validation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/mini-apps/innovation/bmc/create
 * @desc    Create business model canvas
 * @access  Public
 */
router.post('/innovation/bmc/create', async (req, res) => {
  try {
    const { idea, industry } = req.body;
    
    if (!idea) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: idea'
      });
    }
    
    const result = await innovationAgent.createBusinessModelCanvas({
      idea,
      industry: industry || 'technology'
    });
    
    res.json(result);
    
  } catch (error) {
    logger.error('BMC creation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/mini-apps/innovation/status
 * @desc    Get innovation agent status
 * @access  Public
 */
router.get('/innovation/status', (req, res) => {
  try {
    const status = innovationAgent.getStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('Status error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// GENERAL ROUTES
// ============================================================================

/**
 * @route   GET /api/mini-apps/list
 * @desc    List all available mini-apps
 * @access  Public
 */
router.get('/list', (req, res) => {
  res.json({
    success: true,
    data: {
      miniApps: [
        {
          id: 'travel_agency',
          name: 'Travel Agency',
          icon: '✈️',
          description: 'Complete travel automation service',
          routes: [
            '/travel/flights/search',
            '/travel/hotels/search',
            '/travel/itinerary/generate',
            '/travel/destinations/recommend',
            '/travel/visa/check',
            '/travel/package/create'
          ]
        },
        {
          id: 'content_creator',
          name: 'Content Creator',
          icon: '✍️',
          description: 'AI-powered content generation',
          routes: [
            '/content/blog/generate',
            '/content/social/generate',
            '/content/video/script',
            '/content/research',
            '/content/calendar/generate'
          ]
        },
        {
          id: 'innovation',
          name: 'Innovation Generator',
          icon: '💡',
          description: 'Business idea generation & validation',
          routes: [
            '/innovation/ideas/generate',
            '/innovation/trends/analyze',
            '/innovation/competitors/analyze',
            '/innovation/validate',
            '/innovation/bmc/create'
          ]
        }
      ]
    }
  });
});

module.exports = router;
