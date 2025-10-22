/**
 * Codebase API Routes
 * 
 * Endpoints:
 * - POST /api/codebase/index - Index the codebase
 * - GET /api/codebase/search - Search with semantic similarity
 * - GET /api/codebase/file/:path - Get file details
 * - GET /api/codebase/similar/:path - Find similar files
 * - GET /api/codebase/suggestions - Get search suggestions
 * - GET /api/codebase/stats - Get index statistics
 * 
 * @author Ona AI
 * @created 2025-01-25
 */

const express = require('express');
const router = express.Router();
const CodebaseIndexer = require('../src/services/CodebaseIndexer');
const SemanticSearch = require('../src/services/SemanticSearch');
const path = require('path');

// Initialize indexer (singleton)
let indexer = null;
let semanticSearch = null;

function getIndexer() {
  if (!indexer) {
    indexer = new CodebaseIndexer({
      rootDir: path.join(__dirname, '../..'), // Project root
      patterns: ['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx'],
      ignorePatterns: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/.git/**',
        '**/coverage/**'
      ]
    });
    semanticSearch = new SemanticSearch(indexer);
  }
  return { indexer, semanticSearch };
}

/**
 * POST /api/codebase/index
 * Index the entire codebase
 */
router.post('/index', async (req, res) => {
  try {
    const { indexer } = getIndexer();
    
    console.log('🚀 Starting codebase indexing...');
    const results = await indexer.indexCodebase();

    res.json({
      success: true,
      message: 'Codebase indexed successfully',
      results,
      stats: indexer.getStats()
    });
  } catch (error) {
    console.error('❌ Indexing error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/codebase/search
 * Search codebase with semantic similarity
 * 
 * Query params:
 * - q: search query (required)
 * - limit: max results (default: 10)
 * - threshold: similarity threshold (default: 0.7)
 * - fileTypes: comma-separated file extensions (e.g., ".js,.ts")
 * - directories: comma-separated directories (e.g., "backend,frontend")
 */
router.get('/search', async (req, res) => {
  try {
    const { semanticSearch } = getIndexer();
    
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required'
      });
    }

    const options = {
      limit: parseInt(req.query.limit) || 10,
      threshold: parseFloat(req.query.threshold) || 0.7,
      fileTypes: req.query.fileTypes ? req.query.fileTypes.split(',') : [],
      directories: req.query.directories ? req.query.directories.split(',') : []
    };

    const results = await semanticSearch.search(query, options);

    res.json({
      success: true,
      query,
      results,
      count: results.length
    });
  } catch (error) {
    console.error('❌ Search error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/codebase/file/:path
 * Get details for a specific file
 */
router.get('/file/*', async (req, res) => {
  try {
    const { indexer } = getIndexer();
    const filePath = req.params[0]; // Get everything after /file/

    const entry = indexer.index.get(filePath);
    if (!entry) {
      return res.status(404).json({
        success: false,
        error: 'File not found in index'
      });
    }

    // Don't send embedding (too large)
    const { embedding, ...fileData } = entry;

    res.json({
      success: true,
      file: fileData
    });
  } catch (error) {
    console.error('❌ File lookup error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/codebase/similar/:path
 * Find files similar to the given file
 */
router.get('/similar/*', async (req, res) => {
  try {
    const { semanticSearch } = getIndexer();
    const filePath = req.params[0];

    const limit = parseInt(req.query.limit) || 5;
    const threshold = parseFloat(req.query.threshold) || 0.8;

    const results = await semanticSearch.findSimilar(filePath, { limit, threshold });

    res.json({
      success: true,
      file: filePath,
      similar: results,
      count: results.length
    });
  } catch (error) {
    console.error('❌ Similar files error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/codebase/suggestions
 * Get search suggestions based on partial query
 * 
 * Query params:
 * - q: partial query (required)
 * - limit: max suggestions (default: 5)
 */
router.get('/suggestions', async (req, res) => {
  try {
    const { semanticSearch } = getIndexer();
    
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required'
      });
    }

    const limit = parseInt(req.query.limit) || 5;
    const suggestions = await semanticSearch.getSuggestions(query, limit);

    res.json({
      success: true,
      query,
      suggestions
    });
  } catch (error) {
    console.error('❌ Suggestions error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/codebase/stats
 * Get index statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const { indexer } = getIndexer();
    
    const stats = indexer.getStats();

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('❌ Stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/codebase/index
 * Clear the index
 */
router.delete('/index', async (req, res) => {
  try {
    const { indexer } = getIndexer();
    
    indexer.index.clear();

    res.json({
      success: true,
      message: 'Index cleared successfully'
    });
  } catch (error) {
    console.error('❌ Clear index error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
