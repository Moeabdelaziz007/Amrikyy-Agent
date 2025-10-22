/**
 * AI Operating System API Routes
 */

const express = require('express');
const router = express.Router();
const AIOperatingSystem = require('../src/os/AIOperatingSystem');

// Create OS instance
const aiOS = new AIOperatingSystem();

/**
 * GET /api/os/status
 * Get OS status
 */
router.get('/status', async (req, res) => {
  try {
    const status = aiOS.getStatus();
    res.json({
      success: true,
      status: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/os/test
 * Test AI interaction
 */
router.post('/test', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    const result = await aiOS.testAI(prompt);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
