/**
 * Admin Dashboard API Routes
 * Complete monitoring and control center for SAAAAS ecosystem
 */

const express = require('express');
const router = express.Router();
const agentDNAEngine = require('../src/quantum/AgentDNAEngine');
const countryAgentNetwork = require('../src/agents/CountryAgentNetwork');
const deploymentEngine = require('../src/quantum/DeploymentEngine');
const agentDNAService = require('../src/dna/AgentDNAService');
const redisService = require('../src/services/redis-service');
const iziTravelService = require('../src/services/izi-travel/IziTravelService');
const logger = require('../src/utils/logger');

/**
 * Get complete dashboard overview
 * GET /api/admin/dashboard
 */
router.get('/dashboard', async (req, res) => {
  try {
    // Gather all system metrics
    const [
      networkStatus,
      deploymentStats,
      agentStats,
      systemHealth,
      recentActivity,
    ] = await Promise.all([
      getNetworkMetrics(),
      getDeploymentMetrics(),
      getAgentMetrics(),
      getSystemHealth(),
      getRecentActivity(),
    ]);

    res.json({
      success: true,
      dashboard: {
        network: networkStatus,
        deployments: deploymentStats,
        agents: agentStats,
        health: systemHealth,
        activity: recentActivity,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Dashboard overview error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Get network metrics
 */
async function getNetworkMetrics() {
  const status = countryAgentNetwork.getNetworkStatus();
  
  return {
    active: status.status === 'active',
    agents: status.agents,
    totalKnowledge: status.totalKnowledge,
    agentDetails: status.agentDetails.map(a => ({
      name: a.name,
      country: a.country,
      dnaScore: a.dnaScore.totalScore,
      tier: a.performance.tier,
      attractions: a.knowledge.attractions,
      tours: a.knowledge.tours,
      lastUpdate: a.knowledge.lastUpdate,
    })),
  };
}

/**
 * Get deployment metrics
 */
async function getDeploymentMetrics() {
  const stats = deploymentEngine.getStatistics();
  const active = deploymentEngine.getActiveDeployments();
  
  return {
    active: stats.active,
    total: stats.totalDeployments,
    successful: stats.successful,
    failed: stats.failed,
    successRate: stats.successRate,
    averageDuration: stats.averageDuration,
    byType: stats.deploymentsByType,
    recentDeployments: active.slice(0, 5).map(d => ({
      id: d.id,
      name: d.agent.name,
      type: d.agent.type,
      dnaScore: d.dnaScore.totalScore,
      status: d.status,
      deployedAt: d.deployedAt,
    })),
  };
}

/**
 * Get agent metrics
 */
async function getAgentMetrics() {
  try {
    const allAgents = await agentDNAService.getAllAgents();
    
    const byType = {};
    const byTier = {};
    let totalDNAScore = 0;

    allAgents.forEach(agent => {
      byType[agent.type] = (byType[agent.type] || 0) + 1;
      
      const tier = agentDNAEngine.getDNALevel(agent.dnaScore || 0).tier;
      byTier[tier] = (byTier[tier] || 0) + 1;
      
      totalDNAScore += agent.dnaScore || 0;
    });

    return {
      total: allAgents.length,
      byType,
      byTier,
      averageDNAScore: allAgents.length > 0 ? Math.round(totalDNAScore / allAgents.length) : 0,
      topAgents: allAgents
        .sort((a, b) => (b.dnaScore || 0) - (a.dnaScore || 0))
        .slice(0, 5)
        .map(a => ({
          id: a._id,
          name: a.name,
          type: a.type,
          dnaScore: a.dnaScore,
          specialization: a.specialization,
        })),
    };
  } catch (error) {
    logger.error('Agent metrics error:', error);
    return {
      total: 0,
      byType: {},
      byTier: {},
      averageDNAScore: 0,
      topAgents: [],
    };
  }
}

/**
 * Get system health
 */
async function getSystemHealth() {
  const checks = {
    dnaEngine: {
      status: 'healthy',
      message: 'Agent DNA Engine operational',
    },
    deploymentEngine: {
      status: 'healthy',
      message: 'Deployment Engine operational',
    },
    countryNetwork: {
      status: countryAgentNetwork.isInitialized ? 'healthy' : 'inactive',
      message: countryAgentNetwork.isInitialized ? 'Network active' : 'Network not initialized',
    },
    redis: {
      status: redisService.isConnected ? 'healthy' : 'unhealthy',
      message: redisService.isConnected ? 'Redis connected' : 'Redis disconnected',
    },
    iziTravel: {
      status: 'pending',
      message: 'Checking...',
    },
  };

  // Check izi.TRAVEL
  try {
    const iziHealth = await iziTravelService.healthCheck();
    checks.iziTravel = {
      status: iziHealth.status === 'healthy' ? 'healthy' : 'unhealthy',
      message: iziHealth.message,
    };
  } catch (error) {
    checks.iziTravel = {
      status: 'unhealthy',
      message: error.message,
    };
  }

  const allHealthy = Object.values(checks).every(c => c.status === 'healthy');

  return {
    overall: allHealthy ? 'healthy' : 'degraded',
    checks,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get recent activity
 */
async function getRecentActivity() {
  const history = deploymentEngine.getDeploymentHistory(10);
  
  return {
    deployments: history.map(h => ({
      id: h.id,
      agentName: h.agentName,
      status: h.status,
      timestamp: h.timestamp,
    })),
  };
}

/**
 * Get performance analytics
 * GET /api/admin/analytics
 */
router.get('/analytics', async (req, res) => {
  try {
    const timeRange = req.query.range || '7d'; // 7 days default
    
    const analytics = {
      deployments: {
        timeline: getDeploymentTimeline(timeRange),
        successRate: deploymentEngine.getStatistics().successRate,
        averageDuration: deploymentEngine.getStatistics().averageDuration,
      },
      agents: {
        growth: await getAgentGrowth(timeRange),
        performance: await getAgentPerformance(),
      },
      network: {
        knowledgeGrowth: await getKnowledgeGrowth(timeRange),
        queryVolume: await getQueryVolume(timeRange),
      },
    };

    res.json({
      success: true,
      analytics,
      timeRange,
    });
  } catch (error) {
    logger.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Get deployment timeline
 */
function getDeploymentTimeline(range) {
  const history = deploymentEngine.getDeploymentHistory(100);
  
  // Group by date
  const timeline = {};
  history.forEach(deployment => {
    const date = deployment.timestamp.split('T')[0];
    if (!timeline[date]) {
      timeline[date] = { successful: 0, failed: 0 };
    }
    if (deployment.status === 'success') {
      timeline[date].successful++;
    } else if (deployment.status === 'failed') {
      timeline[date].failed++;
    }
  });

  return timeline;
}

/**
 * Get agent growth
 */
async function getAgentGrowth(range) {
  try {
    const agents = await agentDNAService.getAllAgents();
    
    // Group by creation date
    const growth = {};
    agents.forEach(agent => {
      const date = agent.createdAt.split('T')[0];
      growth[date] = (growth[date] || 0) + 1;
    });

    return growth;
  } catch (error) {
    return {};
  }
}

/**
 * Get agent performance
 */
async function getAgentPerformance() {
  try {
    const agents = await agentDNAService.getAllAgents();
    
    return agents.map(agent => ({
      id: agent._id,
      name: agent.name,
      type: agent.type,
      dnaScore: agent.dnaScore,
      performance: agent.performanceMetrics || {},
    }));
  } catch (error) {
    return [];
  }
}

/**
 * Get knowledge growth
 */
async function getKnowledgeGrowth(range) {
  const status = countryAgentNetwork.getNetworkStatus();
  
  return {
    current: status.totalKnowledge,
    // TODO: Track historical data in Redis
    history: [],
  };
}

/**
 * Get query volume
 */
async function getQueryVolume(range) {
  // TODO: Track query metrics in Redis
  return {
    total: 0,
    byCountry: {},
  };
}

/**
 * Get agent leaderboard
 * GET /api/admin/leaderboard
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const agents = await agentDNAService.getAllAgents();
    
    const leaderboard = agents
      .sort((a, b) => (b.dnaScore || 0) - (a.dnaScore || 0))
      .slice(0, 20)
      .map((agent, index) => {
        const dnaInfo = agentDNAEngine.getDNALevel(agent.dnaScore || 0);
        
        return {
          rank: index + 1,
          id: agent._id,
          name: agent.name,
          type: agent.type,
          specialization: agent.specialization,
          dnaScore: agent.dnaScore,
          tier: dnaInfo.tier,
          level: dnaInfo.name,
          emoji: dnaInfo.emoji,
          createdAt: agent.createdAt,
        };
      });

    res.json({
      success: true,
      count: leaderboard.length,
      leaderboard,
    });
  } catch (error) {
    logger.error('Leaderboard error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Get system logs
 * GET /api/admin/logs
 */
router.get('/logs', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;
    const history = deploymentEngine.getDeploymentHistory(limit);

    res.json({
      success: true,
      count: history.length,
      logs: history,
    });
  } catch (error) {
    logger.error('Logs error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Control panel actions
 * POST /api/admin/control/:action
 */
router.post('/control/:action', async (req, res) => {
  try {
    const { action } = req.params;

    let result;

    switch (action) {
      case 'initialize-network':
        await countryAgentNetwork.initialize();
        result = { message: 'Country Agent Network initialized' };
        break;

      case 'shutdown-network':
        countryAgentNetwork.shutdown();
        result = { message: 'Country Agent Network shut down' };
        break;

      case 'clear-cache':
        if (redisService.isConnected) {
          // Clear all caches
          await Promise.all([
            iziTravelService.clearCache(),
            // Add more cache clearing as needed
          ]);
          result = { message: 'All caches cleared' };
        } else {
          throw new Error('Redis not connected');
        }
        break;

      case 'update-knowledge':
        if (!countryAgentNetwork.isInitialized) {
          throw new Error('Network not initialized');
        }
        const agents = countryAgentNetwork.getAllAgents();
        await Promise.all(agents.map(agent => agent.updateKnowledge()));
        result = { message: `Updated knowledge for ${agents.length} agents` };
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    res.json({
      success: true,
      action,
      ...result,
    });
  } catch (error) {
    logger.error('Control action error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Health check
 * GET /api/admin/health
 */
router.get('/health', async (req, res) => {
  try {
    const health = await getSystemHealth();

    res.json({
      success: true,
      ...health,
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: error.message,
    });
  }
});

module.exports = router;

