/**
 * Global Health Check Routes
 * Aggregates health status from all system components
 * 
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-22
 */

const express = require('express');
const router = express.Router();
const redis = require('../cache/RedisCache');
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Health check configuration
 */
const HEALTH_TIMEOUT = 5000; // 5 seconds max for health checks
const HEALTH_CACHE_TTL = 30; // Cache health status for 30 seconds

let cachedHealth = null;
let cacheTimestamp = 0;

/**
 * Check Redis health
 */
async function checkRedis() {
  const start = Date.now();
  try {
    await redis.set('health:check', 'ok', 10);
    const value = await redis.get('health:check');
    const latency = Date.now() - start;
    
    return {
      status: value === 'ok' ? 'healthy' : 'degraded',
      latency,
      message: 'Redis operational'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: Date.now() - start,
      error: error.message
    };
  }
}

/**
 * Check Supabase health
 */
async function checkSupabase() {
  const start = Date.now();
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
    
    // Simple query to check connection
    const { error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    const latency = Date.now() - start;
    
    if (error) {
      return {
        status: 'degraded',
        latency,
        error: error.message
      };
    }
    
    return {
      status: 'healthy',
      latency,
      message: 'Supabase operational'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: Date.now() - start,
      error: error.message
    };
  }
}

/**
 * Check Gemini API health
 */
async function checkGemini() {
  const start = Date.now();
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    // Simple test prompt
    const result = await model.generateContent('ping');
    const latency = Date.now() - start;
    
    return {
      status: result ? 'healthy' : 'degraded',
      latency,
      message: 'Gemini API operational'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: Date.now() - start,
      error: error.message
    };
  }
}

/**
 * Check agent health (from registry)
 */
function checkAgents() {
  try {
    const agentManagement = require('./agentManagement');
    const agents = agentManagement.agentRegistry;
    
    const agentHealth = {};
    let healthyCount = 0;
    let degradedCount = 0;
    let unhealthyCount = 0;
    
    for (const [name, agent] of agents.entries()) {
      const stats = agent.getStats?.() || {};
      const errorRate = stats.totalCalls > 0 
        ? (stats.failedCalls || 0) / stats.totalCalls 
        : 0;
      
      let status = 'healthy';
      if (errorRate > 0.5) status = 'unhealthy';
      else if (errorRate > 0.2) status = 'degraded';
      
      agentHealth[name] = {
        status,
        totalCalls: stats.totalCalls || 0,
        errorRate: Math.round(errorRate * 100)
      };
      
      if (status === 'healthy') healthyCount++;
      else if (status === 'degraded') degradedCount++;
      else unhealthyCount++;
    }
    
    return {
      status: unhealthyCount > 0 ? 'degraded' : 'healthy',
      agents: agentHealth,
      summary: {
        total: agents.size,
        healthy: healthyCount,
        degraded: degradedCount,
        unhealthy: unhealthyCount
      }
    };
  } catch (error) {
    return {
      status: 'unknown',
      error: error.message
    };
  }
}

/**
 * Aggregate overall health
 */
function aggregateHealth(components) {
  const statuses = Object.values(components).map(c => c.status);
  
  if (statuses.some(s => s === 'unhealthy')) {
    return 'unhealthy';
  }
  if (statuses.some(s => s === 'degraded')) {
    return 'degraded';
  }
  return 'healthy';
}

/**
 * GET /api/health
 * Comprehensive health check
 */
router.get('/health', async (req, res) => {
  try {
    // Check cache
    const now = Date.now();
    if (cachedHealth && (now - cacheTimestamp) < HEALTH_CACHE_TTL * 1000) {
      return res.json(cachedHealth);
    }
    
    // Run health checks in parallel with timeout
    const healthPromises = Promise.race([
      Promise.all([
        checkRedis(),
        checkSupabase(),
        checkGemini()
      ]),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Health check timeout')), HEALTH_TIMEOUT)
      )
    ]);
    
    const [redisHealth, supabaseHealth, geminiHealth] = await healthPromises;
    const agentHealth = checkAgents();
    
    const components = {
      redis: redisHealth,
      database: supabaseHealth,
      gemini: geminiHealth,
      agents: agentHealth
    };
    
    const overallStatus = aggregateHealth(components);
    
    const response = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      components,
      version: '2.0.0',
      phase: 2
    };
    
    // Cache result
    cachedHealth = response;
    cacheTimestamp = now;
    
    // Set appropriate status code
    const statusCode = overallStatus === 'healthy' ? 200 : 
                       overallStatus === 'degraded' ? 200 : 503;
    
    res.status(statusCode).json(response);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/health/live
 * Liveness probe (for Kubernetes/Docker)
 */
router.get('/health/live', (req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/health/ready
 * Readiness probe (for Kubernetes/Docker)
 */
router.get('/health/ready', async (req, res) => {
  try {
    // Check critical dependencies
    const redisHealth = await checkRedis();
    
    if (redisHealth.status === 'unhealthy') {
      return res.status(503).json({
        status: 'not_ready',
        reason: 'Redis unavailable',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/status
 * Lightweight status endpoint
 */
router.get('/status', (req, res) => {
  res.json({
    service: 'Amrikyy-Agent',
    version: '2.0.0',
    phase: 2,
    environment: process.env.NODE_ENV || 'development',
    ready: true,
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      unit: 'MB'
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
