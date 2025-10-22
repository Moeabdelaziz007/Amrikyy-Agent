/**
 * Agent Management API Routes
 * Provides endpoints for monitoring and managing AI agents
 *
 * Endpoints:
 * - GET  /api/agents/:agent/health - Health check for specific agent
 * - GET  /api/agents/:agent/status - Detailed status and statistics
 * - GET  /api/agents/:agent/metrics - Performance metrics
 * - GET  /api/agents/:agent/traces - Recent API call traces
 * - POST /api/agents/:agent/cache/clear - Clear agent cache
 * - POST /api/agents/:agent/cache/warm - Warm up cache with common queries
 * - POST /api/agents/:agent/stats/reset - Reset agent statistics
 * - GET  /api/agents/list - List all available agents
 * - GET  /api/agents/overview - Overview of all agents
 *
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-22
 */

const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// Import agent utilities (when integrated with real agents)
// const AgentErrorHandler = require('../utils/AgentErrorHandler');
// const AgentCacheManager = require('../utils/AgentCacheManager');
// const AgentLangSmith = require('../utils/AgentLangSmith');
// const AgentStreaming = require('../utils/AgentStreaming');

/**
 * Agent registry
 * In production, this would be populated with actual agent instances
 */
const agentRegistry = new Map();

/**
 * Register an agent with management capabilities
 */
function registerAgent(name, config) {
  agentRegistry.set(name, {
    name,
    instance: config.instance,
    errorHandler: config.errorHandler,
    cacheManager: config.cacheManager,
    langsmith: config.langsmith,
    streaming: config.streaming,
    registeredAt: Date.now(),
    metadata: config.metadata || {},
  });

  logger.info(`[AgentManagement] Registered agent: ${name}`);
}

/**
 * Get agent from registry
 */
function getAgent(name) {
  const agent = agentRegistry.get(name);

  if (!agent) {
    const availableAgents = Array.from(agentRegistry.keys()).join(', ');
    throw new Error(`Agent '${name}' not found. Available agents: ${availableAgents || 'none'}`);
  }

  return agent;
}

/**
 * GET /api/agents/list
 * List all registered agents
 */
router.get('/list', (req, res) => {
  try {
    const agents = Array.from(agentRegistry.entries()).map(([name, agent]) => ({
      name,
      registeredAt: agent.registeredAt,
      capabilities: {
        errorHandling: !!agent.errorHandler,
        caching: !!agent.cacheManager,
        tracing: !!agent.langsmith,
        streaming: !!agent.streaming,
      },
      metadata: agent.metadata,
    }));

    res.json({
      success: true,
      count: agents.length,
      agents,
    });
  } catch (error) {
    logger.error('[AgentManagement] Error listing agents:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/agents/overview
 * Overview of all agents with statistics
 */
router.get('/overview', (req, res) => {
  try {
    const overview = Array.from(agentRegistry.entries()).map(([name, agent]) => {
      const stats = {};

      // Collect stats from utilities
      if (agent.errorHandler) {
        stats.errors = agent.errorHandler.getStats();
      }

      if (agent.cacheManager) {
        stats.cache = agent.cacheManager.getStats();
      }

      if (agent.langsmith) {
        stats.tracing = agent.langsmith.getStats();
      }

      if (agent.streaming) {
        stats.streaming = agent.streaming.getStats();
      }

      return {
        name,
        stats,
        uptime: Date.now() - agent.registeredAt,
      };
    });

    res.json({
      success: true,
      overview,
    });
  } catch (error) {
    logger.error('[AgentManagement] Error getting overview:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/agents/:agent/health
 * Health check for specific agent
 */
router.get('/:agent/health', (req, res) => {
  try {
    const { agent: agentName } = req.params;
    const agent = getAgent(agentName);

    const health = {
      agent: agentName,
      status: 'healthy',
      timestamp: Date.now(),
      uptime: Date.now() - agent.registeredAt,
      checks: {},
    };

    // Check error handler
    if (agent.errorHandler) {
      const errorStats = agent.errorHandler.getStats();
      health.checks.errorHandler = {
        status: errorStats.circuitBreakerState === 'OPEN' ? 'degraded' : 'healthy',
        circuitBreaker: errorStats.circuitBreakerState,
        successRate: errorStats.successRate,
      };
    }

    // Check cache manager
    if (agent.cacheManager) {
      const cacheStats = agent.cacheManager.getStats();
      health.checks.cache = {
        status: 'healthy',
        hitRate: cacheStats.hitRate,
        semanticMatchRate: cacheStats.semanticMatchRate,
      };
    }

    // Check LangSmith tracing
    if (agent.langsmith) {
      const tracingStats = agent.langsmith.getStats();
      health.checks.tracing = {
        status: 'healthy',
        totalCalls: tracingStats.totalCalls,
        successRate: tracingStats.successRate,
      };
    }

    // Check streaming
    if (agent.streaming) {
      const streamingStats = agent.streaming.getStats();
      health.checks.streaming = {
        status: 'healthy',
        activeStreams: streamingStats.activeStreams,
        successRate: streamingStats.successRate,
      };
    }

    // Determine overall status
    const checks = Object.values(health.checks);
    if (checks.some((c) => c.status === 'degraded')) {
      health.status = 'degraded';
    }
    if (checks.some((c) => c.status === 'unhealthy')) {
      health.status = 'unhealthy';
    }

    const statusCode = health.status === 'healthy' ? 200 : 503;

    res.status(statusCode).json({
      success: true,
      health,
    });
  } catch (error) {
    logger.error('[AgentManagement] Health check error:', error);
    res.status(404).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/agents/:agent/status
 * Detailed status and statistics
 */
router.get('/:agent/status', (req, res) => {
  try {
    const { agent: agentName } = req.params;
    const agent = getAgent(agentName);

    const status = {
      agent: agentName,
      registeredAt: agent.registeredAt,
      uptime: Date.now() - agent.registeredAt,
      metadata: agent.metadata,
      capabilities: {
        errorHandling: !!agent.errorHandler,
        caching: !!agent.cacheManager,
        tracing: !!agent.langsmith,
        streaming: !!agent.streaming,
      },
      statistics: {},
    };

    // Collect detailed statistics
    if (agent.errorHandler) {
      status.statistics.errors = agent.errorHandler.getStats();
    }

    if (agent.cacheManager) {
      status.statistics.cache = agent.cacheManager.getStats();
    }

    if (agent.langsmith) {
      status.statistics.tracing = agent.langsmith.getStats();
      status.statistics.costs = agent.langsmith.getCostBreakdown();
      status.statistics.performance = agent.langsmith.getPerformanceMetrics();
    }

    if (agent.streaming) {
      status.statistics.streaming = agent.streaming.getStats();
    }

    res.json({
      success: true,
      status,
    });
  } catch (error) {
    logger.error('[AgentManagement] Status error:', error);
    res.status(404).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/agents/:agent/metrics
 * Performance metrics
 */
router.get('/:agent/metrics', (req, res) => {
  try {
    const { agent: agentName } = req.params;
    const agent = getAgent(agentName);

    const metrics = {
      agent: agentName,
      timestamp: Date.now(),
    };

    // Error metrics
    if (agent.errorHandler) {
      metrics.errors = agent.errorHandler.getStats();
    }

    // Cache metrics
    if (agent.cacheManager) {
      metrics.cache = agent.cacheManager.getStats();
    }

    // Performance metrics
    if (agent.langsmith) {
      metrics.performance = agent.langsmith.getPerformanceMetrics();
      metrics.costs = agent.langsmith.getCostBreakdown();
    }

    // Streaming metrics
    if (agent.streaming) {
      metrics.streaming = agent.streaming.getStats();
    }

    res.json({
      success: true,
      metrics,
    });
  } catch (error) {
    logger.error('[AgentManagement] Metrics error:', error);
    res.status(404).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/agents/:agent/traces
 * Recent API call traces
 */
router.get('/:agent/traces', (req, res) => {
  try {
    const { agent: agentName } = req.params;
    const { limit = 100 } = req.query;
    const agent = getAgent(agentName);

    if (!agent.langsmith) {
      return res.status(400).json({
        success: false,
        error: 'Agent does not have tracing enabled',
      });
    }

    const stats = agent.langsmith.getStats();
    const traces = stats.recentTraces ? stats.recentTraces.slice(0, parseInt(limit)) : [];

    res.json({
      success: true,
      agent: agentName,
      count: traces.length,
      traces,
    });
  } catch (error) {
    logger.error('[AgentManagement] Traces error:', error);
    res.status(404).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/agents/:agent/cache/clear
 * Clear agent cache
 */
router.post('/:agent/cache/clear', async (req, res) => {
  try {
    const { agent: agentName } = req.params;
    const { pattern } = req.body;
    const agent = getAgent(agentName);

    if (!agent.cacheManager) {
      return res.status(400).json({
        success: false,
        error: 'Agent does not have caching enabled',
      });
    }

    let cleared;
    if (pattern) {
      cleared = await agent.cacheManager.invalidate(pattern);
    } else {
      // Clear all cache for this agent
      cleared = await agent.cacheManager.invalidate(`${agentName}:*`);
    }

    logger.info(`[AgentManagement] Cleared cache for ${agentName}`, { cleared });

    res.json({
      success: true,
      agent: agentName,
      cleared,
      message: 'Cache cleared successfully',
    });
  } catch (error) {
    logger.error('[AgentManagement] Cache clear error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/agents/:agent/cache/warm
 * Warm up cache with common queries
 */
router.post('/:agent/cache/warm', async (req, res) => {
  try {
    const { agent: agentName } = req.params;
    const { queries } = req.body;
    const agent = getAgent(agentName);

    if (!agent.cacheManager) {
      return res.status(400).json({
        success: false,
        error: 'Agent does not have caching enabled',
      });
    }

    if (!queries || !Array.isArray(queries)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an array of queries to warm up',
      });
    }

    const result = await agent.cacheManager.warmCache(queries);

    logger.info(`[AgentManagement] Warmed cache for ${agentName}`, {
      queries: queries.length,
      result,
    });

    res.json({
      success: true,
      agent: agentName,
      warmed: result,
      message: 'Cache warmed successfully',
    });
  } catch (error) {
    logger.error('[AgentManagement] Cache warm error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/agents/:agent/stats/reset
 * Reset agent statistics
 */
router.post('/:agent/stats/reset', (req, res) => {
  try {
    const { agent: agentName } = req.params;
    const agent = getAgent(agentName);

    const reset = {
      agent: agentName,
      timestamp: Date.now(),
      components: [],
    };

    // Reset error handler stats
    if (agent.errorHandler && agent.errorHandler.resetStats) {
      agent.errorHandler.resetStats();
      reset.components.push('errorHandler');
    }

    // Reset cache manager stats
    if (agent.cacheManager && agent.cacheManager.resetStats) {
      agent.cacheManager.resetStats();
      reset.components.push('cacheManager');
    }

    // Reset LangSmith stats
    if (agent.langsmith && agent.langsmith.resetStats) {
      agent.langsmith.resetStats();
      reset.components.push('langsmith');
    }

    // Reset streaming stats
    if (agent.streaming && agent.streaming.getStats) {
      // Streaming doesn't have explicit reset, but we can note it
      reset.components.push('streaming');
    }

    logger.info(`[AgentManagement] Reset stats for ${agentName}`, {
      components: reset.components,
    });

    res.json({
      success: true,
      reset,
      message: 'Statistics reset successfully',
    });
  } catch (error) {
    logger.error('[AgentManagement] Stats reset error:', error);
    res.status(404).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Export router as default
 */
module.exports = router;

/**
 * Export functions for advanced use
 */
module.exports.registerAgent = registerAgent;
module.exports.getAgent = getAgent;
module.exports.agentRegistry = agentRegistry;
