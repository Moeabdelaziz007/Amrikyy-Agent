/**
 * Aladdin Agent Routes - INTEGRATED WITH REAL AGENT
 * Express routes connected to Mini-Aladdin multi-agent system
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { logger } = require('../utils/logger');
const { MiniAladdin } = require('../agents/mini-aladdin');

// Create child logger
const log = logger.child('AladdinRoutes');

// Rate limiters for different endpoints
const huntLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: {
    success: false,
    error: 'Too many hunt requests. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    log.warn('Rate limit exceeded for hunt endpoint', { ip: req.ip });
    res.status(429).json({
      success: false,
      error: 'Too many hunt requests',
      message: 'You have exceeded the rate limit. Please try again in 15 minutes.',
      retryAfter: 900 // seconds
    });
  }
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    error: 'Too many requests. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const analyzeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per window
  message: {
    success: false,
    error: 'Too many analysis requests. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Initialize agent (singleton pattern)
let aladdinAgent = null;

function getAgent() {
  if (!aladdinAgent) {
    aladdinAgent = new MiniAladdin();
    log.info('Mini-Aladdin agent initialized successfully');
  }
  return aladdinAgent;
}

/**
 * @route   GET /api/aladdin/health
 * @desc    Health check for Aladdin agent
 * @access  Public
 * @rateLimit 100 requests per 15 minutes
 */
router.get('/health', generalLimiter, (req, res) => {
  log.info('Health check requested');
  
  const agent = getAgent();
  const isHealthy = agent && agent.agents;
  
  res.json({
    success: true,
    message: 'Aladdin agent is running',
    status: isHealthy ? 'healthy' : 'initializing',
    agents: isHealthy ? {
      math: agent.agents.math.name,
      market: agent.agents.market.name,
      risk: agent.agents.risk.name,
      data: agent.agents.data.name
    } : null,
    timestamp: new Date().toISOString()
  });
});

/**
 * @route   POST /api/aladdin/hunt
 * @desc    Start a money-hunting session with real agent
 * @access  Public
 * @rateLimit 10 requests per 15 minutes
 */
router.post('/hunt', huntLimiter, async (req, res) => {
  try {
    log.info('Starting money hunt with Mini-Aladdin agent');
    
    const agent = getAgent();
    const results = await agent.hunt();
    
    log.success('Money hunt completed', { 
      opportunitiesFound: results.opportunities.length,
      categories: {
        arbitrage: results.opportunities.filter(o => o.category === 'arbitrage').length,
        trading: results.opportunities.filter(o => o.category === 'trading').length,
        affiliate: results.opportunities.filter(o => o.category === 'affiliate').length
      }
    });

    res.json({
      success: true,
      data: {
        opportunities: results.opportunities,
        plan: results.plan,
        portfolio: results.portfolio,
        analytics: results.analytics,
        summary: {
          total: results.opportunities.length,
          byCategory: {
            arbitrage: results.opportunities.filter(o => o.category === 'arbitrage').length,
            trading: results.opportunities.filter(o => o.category === 'trading').length,
            affiliate: results.opportunities.filter(o => o.category === 'affiliate').length
          }
        }
      }
    });

  } catch (error) {
    log.error('Error in money hunt', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      error: 'Failed to complete money hunt',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/aladdin/opportunities
 * @desc    Get filtered opportunities from agent
 * @access  Public
 * @query   { category: string, minScore: number, minProfit: number }
 * @rateLimit 100 requests per 15 minutes
 */
router.get('/opportunities', generalLimiter, async (req, res) => {
  try {
    const { category, minScore, minProfit } = req.query;

    log.info('Fetching opportunities', { category, minScore, minProfit });

    const agent = getAgent();
    
    // Get all opportunities from agent
    let opportunities = agent.opportunities || [];
    
    // If no opportunities cached, run hunt
    if (opportunities.length === 0) {
      log.info('No cached opportunities, running hunt');
      const results = await agent.hunt();
      opportunities = results.opportunities;
    }

    // Apply filters
    let filtered = opportunities;
    
    if (category) {
      filtered = filtered.filter(opp => opp.category === category);
    }
    
    if (minScore) {
      const scoreThreshold = parseFloat(minScore);
      filtered = filtered.filter(opp => (opp.score || 0) >= scoreThreshold);
    }
    
    if (minProfit) {
      const profitThreshold = parseFloat(minProfit);
      filtered = filtered.filter(opp => 
        (opp.profit || opp.estimatedProfit || 0) >= profitThreshold
      );
    }

    log.success('Opportunities fetched', { 
      total: opportunities.length,
      filtered: filtered.length 
    });

    res.json({
      success: true,
      data: {
        opportunities: filtered,
        total: filtered.length,
        filters: { category, minScore, minProfit }
      }
    });

  } catch (error) {
    log.error('Error fetching opportunities', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch opportunities',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/aladdin/analyze
 * @desc    Analyze a specific opportunity using agent's analytics
 * @access  Public
 * @body    { opportunityId: string, depth: string }
 * @rateLimit 50 requests per 15 minutes
 */
router.post('/analyze', analyzeLimiter, async (req, res) => {
  try {
    const { opportunityId, depth = 'standard' } = req.body;

    if (!opportunityId) {
      log.warn('Missing opportunity ID');
      return res.status(400).json({
        success: false,
        error: 'Opportunity ID is required'
      });
    }

    log.info('Analyzing opportunity', { opportunityId, depth });

    const agent = getAgent();
    
    // Find the opportunity
    const opportunity = agent.opportunities?.find(o => o.id === opportunityId);
    
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        error: 'Opportunity not found',
        message: 'Run /hunt first to generate opportunities'
      });
    }

    // Get analytics from agent
    const analytics = agent.getAnalytics();
    
    // Build detailed analysis
    const analysis = {
      opportunityId,
      opportunity,
      analytics: {
        portfolio: analytics.portfolio,
        performance: analytics.performance,
        riskMetrics: analytics.riskMetrics
      },
      recommendation: opportunity.score >= 70 ? 'STRONG BUY' : 
                      opportunity.score >= 50 ? 'BUY' : 
                      opportunity.score >= 30 ? 'HOLD' : 'AVOID',
      confidence: opportunity.score / 100,
      timestamp: new Date().toISOString()
    };

    log.success('Analysis completed', { opportunityId });

    res.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    log.error('Error analyzing opportunity', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to analyze opportunity',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/aladdin/stats
 * @desc    Get agent statistics and performance from real agent
 * @access  Public
 * @rateLimit 100 requests per 15 minutes
 */
router.get('/stats', generalLimiter, (req, res) => {
  try {
    log.info('Stats requested');

    const agent = getAgent();
    const analytics = agent.getAnalytics();
    
    const stats = {
      portfolio: analytics.portfolio,
      performance: analytics.performance,
      riskMetrics: analytics.riskMetrics,
      opportunities: {
        total: agent.opportunities?.length || 0,
        byCategory: {
          arbitrage: agent.opportunities?.filter(o => o.category === 'arbitrage').length || 0,
          trading: agent.opportunities?.filter(o => o.category === 'trading').length || 0,
          affiliate: agent.opportunities?.filter(o => o.category === 'affiliate').length || 0
        }
      },
      agents: {
        math: agent.agents.math.name,
        market: agent.agents.market.name,
        risk: agent.agents.risk.name,
        data: agent.agents.data.name
      },
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    log.error('Error fetching stats', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/aladdin/execute
 * @desc    Execute a trade for an opportunity (future feature)
 * @access  Public
 * @body    { opportunityId: string, amount: number }
 */
router.post('/execute', async (req, res) => {
  try {
    const { opportunityId, amount } = req.body;

    if (!opportunityId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'opportunityId and amount are required'
      });
    }

    log.info('Trade execution requested', { opportunityId, amount });

    // TODO: Implement actual trade execution
    // For now, return placeholder
    res.json({
      success: true,
      message: 'Trade execution feature coming soon',
      data: {
        opportunityId,
        amount,
        status: 'pending_implementation'
      }
    });

  } catch (error) {
    log.error('Error executing trade', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to execute trade',
      message: error.message
    });
  }
});

module.exports = router;
