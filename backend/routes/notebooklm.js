/**
 * NotebookLM API Routes
 * 
 * Endpoints for research-based content generation
 * 
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-22
 */

const express = require('express');
const router = express.Router();
const notebookLMService = require('../src/services/NotebookLMService');
const logger = require('../utils/logger');

// ============================================================================
// NOTEBOOK MANAGEMENT
// ============================================================================

/**
 * POST /api/notebooklm/notebooks/create
 * Create a new notebook with sources
 */
router.post('/notebooks/create', async (req, res) => {
  try {
    const { title, description, sources, topic } = req.body;

    if (!title || !topic) {
      return res.status(400).json({
        success: false,
        error: 'Title and topic are required'
      });
    }

    const notebook = await notebookLMService.createNotebook({
      title,
      description,
      sources: sources || [],
      topic
    });

    res.json({
      success: true,
      data: notebook
    });
  } catch (error) {
    logger.error('Failed to create notebook:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/notebooklm/notebooks
 * List all notebooks
 */
router.get('/notebooks', async (req, res) => {
  try {
    const notebooks = notebookLMService.listNotebooks();

    res.json({
      success: true,
      data: {
        notebooks,
        count: notebooks.length
      }
    });
  } catch (error) {
    logger.error('Failed to list notebooks:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/notebooklm/notebooks/:id
 * Get notebook by ID
 */
router.get('/notebooks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const notebook = notebookLMService.getNotebook(id);

    if (!notebook) {
      return res.status(404).json({
        success: false,
        error: 'Notebook not found'
      });
    }

    res.json({
      success: true,
      data: notebook
    });
  } catch (error) {
    logger.error('Failed to get notebook:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/notebooklm/notebooks/:id
 * Delete notebook
 */
router.delete('/notebooks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = notebookLMService.deleteNotebook(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Notebook not found'
      });
    }

    res.json({
      success: true,
      message: 'Notebook deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete notebook:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/notebooklm/notebooks/:id/sources
 * Add source to notebook
 */
router.post('/notebooks/:id/sources', async (req, res) => {
  try {
    const { id } = req.params;
    const source = req.body;

    if (!source.type || !source.content) {
      return res.status(400).json({
        success: false,
        error: 'Source type and content are required'
      });
    }

    const processedSource = await notebookLMService.addSource(id, source);

    res.json({
      success: true,
      data: processedSource
    });
  } catch (error) {
    logger.error('Failed to add source:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// CONTENT GENERATION
// ============================================================================

/**
 * POST /api/notebooklm/generate/script
 * Generate research-based script
 */
router.post('/generate/script', async (req, res) => {
  try {
    const {
      notebookId,
      topic,
      duration,
      tone,
      targetAudience,
      includeCitations
    } = req.body;

    if (!notebookId || !topic) {
      return res.status(400).json({
        success: false,
        error: 'Notebook ID and topic are required'
      });
    }

    const script = await notebookLMService.generateResearchedScript({
      notebookId,
      topic,
      duration: duration || 60,
      tone: tone || 'educational',
      targetAudience: targetAudience || 'general',
      includeCitations: includeCitations !== false
    });

    res.json({
      success: true,
      data: script
    });
  } catch (error) {
    logger.error('Failed to generate script:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/notebooklm/query
 * Query notebook sources
 */
router.post('/query', async (req, res) => {
  try {
    const { notebookId, question } = req.body;

    if (!notebookId || !question) {
      return res.status(400).json({
        success: false,
        error: 'Notebook ID and question are required'
      });
    }

    const answer = await notebookLMService.queryNotebook({
      notebookId,
      question
    });

    res.json({
      success: true,
      data: answer
    });
  } catch (error) {
    logger.error('Failed to query notebook:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// FACT CHECKING
// ============================================================================

/**
 * POST /api/notebooklm/fact-check
 * Fact-check a script
 */
router.post('/fact-check', async (req, res) => {
  try {
    const { notebookId, script } = req.body;

    if (!notebookId || !script) {
      return res.status(400).json({
        success: false,
        error: 'Notebook ID and script are required'
      });
    }

    const factCheck = await notebookLMService.factCheck({
      notebookId,
      script
    });

    res.json({
      success: true,
      data: factCheck
    });
  } catch (error) {
    logger.error('Failed to fact-check:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// SERVICE STATUS
// ============================================================================

/**
 * GET /api/notebooklm/status
 * Get service status
 */
router.get('/status', async (req, res) => {
  try {
    const status = notebookLMService.getStatus();

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('Failed to get status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
