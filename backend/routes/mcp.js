/**
 * MCP (Model Context Protocol) API Routes
 * Standardized tool calling interface for AI agents
 */

const express = require('express');
const router = express.Router();
const TravelMCPServer = require('../src/mcp/TravelMCPServer');
const { aiLimiter } = require('../middleware/rateLimiter');
const logger = require('../utils/logger');

/**
 * GET /api/mcp/tools
 * List all available MCP tools
 */
router.get('/tools', async (req, res) => {
  try {
    const tools = TravelMCPServer.listTools();

    res.json({
      success: true,
      tools,
      count: tools.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Failed to list MCP tools', {
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: 'Failed to list tools',
      message: error.message
    });
  }
});

/**
 * POST /api/mcp/call
 * Call an MCP tool
 */
router.post('/call', aiLimiter, async (req, res) => {
  try {
    const { tool, params } = req.body;

    if (!tool) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: tool'
      });
    }

    logger.info('🔧 MCP tool call', {
      tool,
      userId: req.user?.id,
      sessionId: req.sessionID
    });

    // Build execution context
    const context = {
      userId: req.user?.id,
      sessionId: req.sessionID,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    };

    // Call the tool
    const result = await TravelMCPServer.callTool(tool, params || {}, context);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      tool,
      result: result.data || result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ MCP tool call failed', {
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'Tool execution failed',
      message: error.message
    });
  }
});

/**
 * POST /api/mcp/batch
 * Execute multiple MCP tools in sequence
 */
router.post('/batch', aiLimiter, async (req, res) => {
  try {
    const { calls } = req.body;

    if (!Array.isArray(calls) || calls.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'calls must be a non-empty array'
      });
    }

    logger.info('🔧 MCP batch call', {
      callCount: calls.length,
      userId: req.user?.id
    });

    const context = {
      userId: req.user?.id,
      sessionId: req.sessionID,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    };

    const results = [];

    // Execute calls sequentially
    for (const call of calls) {
      const { tool, params } = call;

      if (!tool) {
        results.push({
          success: false,
          error: 'Missing tool name'
        });
        continue;
      }

      const result = await TravelMCPServer.callTool(tool, params || {}, context);
      results.push({
        tool,
        ...result
      });
    }

    res.json({
      success: true,
      results,
      count: results.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ MCP batch call failed', {
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: 'Batch execution failed',
      message: error.message
    });
  }
});

/**
 * POST /api/mcp/search-flights
 * Convenience endpoint for flight search tool
 */
router.post('/search-flights', aiLimiter, async (req, res) => {
  try {
    const params = req.body;

    const context = {
      userId: req.user?.id,
      sessionId: req.sessionID
    };

    const result = await TravelMCPServer.callTool('search_flights', params, context);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      flights: result.data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ MCP flight search failed', {
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: 'Flight search failed',
      message: error.message
    });
  }
});

/**
 * POST /api/mcp/compare-prices
 * Convenience endpoint for price comparison tool
 */
router.post('/compare-prices', aiLimiter, async (req, res) => {
  try {
    const params = req.body;

    const context = {
      userId: req.user?.id,
      sessionId: req.sessionID
    };

    const result = await TravelMCPServer.callTool('compare_prices', params, context);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      comparison: result.data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ MCP price comparison failed', {
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: 'Price comparison failed',
      message: error.message
    });
  }
});

/**
 * POST /api/mcp/analyze-budget
 * Convenience endpoint for budget analysis tool
 */
router.post('/analyze-budget', aiLimiter, async (req, res) => {
  try {
    const params = req.body;

    const context = {
      userId: req.user?.id,
      sessionId: req.sessionID
    };

    const result = await TravelMCPServer.callTool('analyze_budget', params, context);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      analysis: result.data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ MCP budget analysis failed', {
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: 'Budget analysis failed',
      message: error.message
    });
  }
});

/**
 * GET /api/mcp/health
 * Health check for MCP server
 */
router.get('/health', async (req, res) => {
  try {
    const health = await TravelMCPServer.healthCheck();

    res.json({
      success: true,
      service: 'MCP Travel Server',
      ...health,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      service: 'MCP Travel Server',
      status: 'error',
      error: error.message
    });
  }
});

module.exports = router;
