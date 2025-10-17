/**
 * Automation API Routes
 * Endpoints for Intake Analyzer and other automation services
 */

const express = require('express');
const router = express.Router();
const IntakeAnalyzer = require('../services/automation/IntakeAnalyzer');
const GeminiCLI = require('../services/automation/GeminiCLI');
const intakeAnalyzerJob = require('../jobs/intakeAnalyzerJob');
const { authenticateToken } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');
const logger = require('../utils/logger');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

/**
 * POST /api/automation/process-message
 * Process a single message with Intake Analyzer
 */
router.post('/process-message', authenticateToken, aiLimiter, async (req, res) => {
  try {
    const { messageId } = req.body;

    if (!messageId) {
      return res.status(400).json({
        success: false,
        error: 'messageId is required'
      });
    }

    logger.info('Processing message via API', {
      messageId,
      userId: req.user?.id
    });

    // Fetch message
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .single();

    if (fetchError || !message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      });
    }

    // Check if already processed
    if (message.processed) {
      return res.status(400).json({
        success: false,
        error: 'Message already processed',
        leadId: message.lead_id
      });
    }

    // Process message
    const result = await IntakeAnalyzer.processMessage(message);

    res.json(result);

  } catch (error) {
    logger.error('Failed to process message via API', {
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/automation/process-batch
 * Process all unprocessed messages
 */
router.post('/process-batch', authenticateToken, async (req, res) => {
  try {
    const { limit = 10 } = req.body;

    logger.info('Processing batch via API', {
      limit,
      userId: req.user?.id
    });

    const result = await IntakeAnalyzer.processUnprocessedMessages(limit);

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    logger.error('Failed to process batch via API', {
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/automation/statistics
 * Get Intake Analyzer statistics
 */
router.get('/statistics', authenticateToken, async (req, res) => {
  try {
    const stats = await IntakeAnalyzer.getStatistics();
    const jobStats = intakeAnalyzerJob.getStats();

    res.json({
      success: true,
      intake: stats,
      job: jobStats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Failed to get statistics', {
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/automation/run-job
 * Manually trigger the intake analyzer job
 */
router.post('/run-job', authenticateToken, async (req, res) => {
  try {
    logger.info('Manually triggering intake analyzer job', {
      userId: req.user?.id
    });

    const result = await intakeAnalyzerJob.runJob();

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    logger.error('Failed to run job manually', {
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/automation/extract
 * Extract structured data from text (testing endpoint)
 */
router.post('/extract', authenticateToken, aiLimiter, async (req, res) => {
  try {
    const { text, prompt } = req.body;

    if (!text || !prompt) {
      return res.status(400).json({
        success: false,
        error: 'text and prompt are required'
      });
    }

    logger.info('Extracting data via API', {
      textLength: text.length,
      userId: req.user?.id
    });

    const result = await GeminiCLI.extractSDK(text, prompt);

    res.json({
      success: true,
      extraction: result
    });

  } catch (error) {
    logger.error('Failed to extract data', {
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/automation/health
 * Health check for automation services
 */
router.get('/health', async (req, res) => {
  try {
    const geminiHealth = await GeminiCLI.healthCheck();
    const stats = await IntakeAnalyzer.getStatistics();

    res.json({
      success: true,
      services: {
        gemini: geminiHealth,
        intakeAnalyzer: {
          healthy: true,
          stats
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
