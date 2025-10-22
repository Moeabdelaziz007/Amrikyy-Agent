/**
 * Example: Integrating Agent Management Routes
 * Shows how to register agents and use the management API
 *
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-22
 */

const express = require('express');
const { router: agentManagementRouter, registerAgent } = require('../routes/agentManagement');

// Import utilities
const AgentErrorHandler = require('../utils/AgentErrorHandler');
const AgentCacheManager = require('../utils/AgentCacheManager');
const AgentLangSmith = require('../utils/AgentLangSmith');
const AgentStreaming = require('../utils/AgentStreaming');

// Import agents
const TravelAgencyAgent = require('../agents/TravelAgencyAgent');
const ContentCreatorAgent = require('../agents/ContentCreatorAgent');
const InnovationAgent = require('../agents/InnovationAgent');

/**
 * Setup agent management for the application
 */
function setupAgentManagement(app) {
  // Initialize Travel Agent with all utilities
  const travelAgent = new TravelAgencyAgent();
  const travelErrorHandler = new AgentErrorHandler('TravelAgent');
  const travelCache = new AgentCacheManager('TravelAgent');
  const travelLangSmith = new AgentLangSmith('TravelAgent');
  const travelStreaming = new AgentStreaming('TravelAgent');

  registerAgent('travel', {
    instance: travelAgent,
    errorHandler: travelErrorHandler,
    cacheManager: travelCache,
    langsmith: travelLangSmith,
    streaming: travelStreaming,
    metadata: {
      version: '2.0',
      capabilities: ['flights', 'hotels', 'itineraries', 'visa'],
      model: 'gemini-2.0-flash-exp',
    },
  });

  // Initialize Content Creator Agent with utilities
  const contentAgent = new ContentCreatorAgent();
  const contentErrorHandler = new AgentErrorHandler('ContentAgent');
  const contentCache = new AgentCacheManager('ContentAgent');
  const contentLangSmith = new AgentLangSmith('ContentAgent');
  const contentStreaming = new AgentStreaming('ContentAgent');

  registerAgent('content', {
    instance: contentAgent,
    errorHandler: contentErrorHandler,
    cacheManager: contentCache,
    langsmith: contentLangSmith,
    streaming: contentStreaming,
    metadata: {
      version: '2.0',
      capabilities: ['blog', 'social', 'video-scripts', 'seo'],
      model: 'gemini-2.5-pro',
    },
  });

  // Initialize Innovation Agent with utilities
  const innovationAgent = new InnovationAgent();
  const innovationErrorHandler = new AgentErrorHandler('InnovationAgent');
  const innovationCache = new AgentCacheManager('InnovationAgent');
  const innovationLangSmith = new AgentLangSmith('InnovationAgent');

  registerAgent('innovation', {
    instance: innovationAgent,
    errorHandler: innovationErrorHandler,
    cacheManager: innovationCache,
    langsmith: innovationLangSmith,
    metadata: {
      version: '2.0',
      capabilities: ['ideas', 'trends', 'competitors', 'validation'],
      model: 'gemini-2.5-pro',
    },
  });

  // Mount the management routes
  app.use('/api/agents', agentManagementRouter);

  console.log('✅ Agent Management initialized with 3 agents');
}

/**
 * Example usage of the management API
 */
async function exampleUsage() {
  const baseURL = 'http://localhost:3000';

  // 1. List all agents
  console.log('\n1. Listing all agents...');
  const listResponse = await fetch(`${baseURL}/api/agents/list`);
  const listData = await listResponse.json();
  console.log(
    'Agents:',
    listData.agents.map((a) => a.name)
  );

  // 2. Get overview of all agents
  console.log('\n2. Getting overview...');
  const overviewResponse = await fetch(`${baseURL}/api/agents/overview`);
  const overviewData = await overviewResponse.json();
  console.log('Overview:', overviewData.overview);

  // 3. Check health of specific agent
  console.log('\n3. Checking travel agent health...');
  const healthResponse = await fetch(`${baseURL}/api/agents/travel/health`);
  const healthData = await healthResponse.json();
  console.log('Health:', healthData.health.status);
  console.log('Checks:', healthData.health.checks);

  // 4. Get detailed status
  console.log('\n4. Getting travel agent status...');
  const statusResponse = await fetch(`${baseURL}/api/agents/travel/status`);
  const statusData = await statusResponse.json();
  console.log('Uptime:', statusData.status.uptime, 'ms');
  console.log('Statistics:', statusData.status.statistics);

  // 5. Get performance metrics
  console.log('\n5. Getting metrics...');
  const metricsResponse = await fetch(`${baseURL}/api/agents/travel/metrics`);
  const metricsData = await metricsResponse.json();
  console.log('Metrics:', metricsData.metrics);

  // 6. Get recent traces
  console.log('\n6. Getting recent traces...');
  const tracesResponse = await fetch(`${baseURL}/api/agents/travel/traces?limit=10`);
  const tracesData = await tracesResponse.json();
  console.log('Traces:', tracesData.count, 'traces');

  // 7. Clear cache
  console.log('\n7. Clearing cache...');
  const clearResponse = await fetch(`${baseURL}/api/agents/travel/cache/clear`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const clearData = await clearResponse.json();
  console.log('Cache cleared:', clearData.cleared);

  // 8. Warm cache
  console.log('\n8. Warming cache...');
  const warmResponse = await fetch(`${baseURL}/api/agents/travel/cache/warm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      queries: ['flights from LAX to NRT', 'hotels in Tokyo', 'visa requirements for Japan'],
    }),
  });
  const warmData = await warmResponse.json();
  console.log('Cache warmed:', warmData.warmed);

  // 9. Reset statistics
  console.log('\n9. Resetting statistics...');
  const resetResponse = await fetch(`${baseURL}/api/agents/travel/stats/reset`, {
    method: 'POST',
  });
  const resetData = await resetResponse.json();
  console.log('Stats reset:', resetData.reset.components);
}

/**
 * Health check monitoring example
 */
async function monitorHealth() {
  const baseURL = 'http://localhost:3000';

  setInterval(async () => {
    try {
      const response = await fetch(`${baseURL}/api/agents/overview`);
      const data = await response.json();

      data.overview.forEach((agent) => {
        const status = agent.stats.errors?.circuitBreakerState || 'UNKNOWN';
        const cacheHitRate = agent.stats.cache?.hitRate || '0%';
        const successRate = agent.stats.tracing?.successRate || '0%';

        console.log(
          `[${agent.name}] Status: ${status}, Cache: ${cacheHitRate}, Success: ${successRate}`
        );

        // Alert if circuit breaker is open
        if (status === 'OPEN') {
          console.warn(`⚠️  ALERT: ${agent.name} circuit breaker is OPEN!`);
        }
      });
    } catch (error) {
      console.error('Health monitoring error:', error);
    }
  }, 30000); // Check every 30 seconds
}

/**
 * Cost monitoring example
 */
async function monitorCosts() {
  const baseURL = 'http://localhost:3000';

  setInterval(async () => {
    try {
      const response = await fetch(`${baseURL}/api/agents/overview`);
      const data = await response.json();

      let totalCost = 0;

      data.overview.forEach((agent) => {
        const cost = agent.stats.tracing?.totalCost || 0;
        totalCost += cost;

        console.log(`[${agent.name}] Cost: $${cost.toFixed(4)}`);
      });

      console.log(`Total cost across all agents: $${totalCost.toFixed(4)}`);

      // Alert if cost exceeds threshold
      if (totalCost > 10) {
        console.warn(`⚠️  COST ALERT: Total cost ($${totalCost.toFixed(2)}) exceeds $10!`);
      }
    } catch (error) {
      console.error('Cost monitoring error:', error);
    }
  }, 300000); // Check every 5 minutes
}

/**
 * Performance dashboard data
 */
async function getDashboardData() {
  const baseURL = 'http://localhost:3000';

  try {
    const response = await fetch(`${baseURL}/api/agents/overview`);
    const data = await response.json();

    const dashboard = {
      timestamp: Date.now(),
      agents: data.overview.map((agent) => ({
        name: agent.name,
        uptime: agent.uptime,
        health: {
          status: agent.stats.errors?.circuitBreakerState === 'OPEN' ? 'unhealthy' : 'healthy',
          successRate: agent.stats.errors?.successRate || '100%',
        },
        performance: {
          cacheHitRate: agent.stats.cache?.hitRate || '0%',
          avgLatency: agent.stats.tracing?.avgLatency || 0,
          requestsPerMinute: agent.stats.tracing?.callsPerMinute || 0,
        },
        costs: {
          total: agent.stats.tracing?.totalCost || 0,
          perRequest: agent.stats.tracing?.avgCostPerCall || 0,
        },
        activity: {
          totalRequests: agent.stats.tracing?.totalCalls || 0,
          cacheHits: agent.stats.cache?.hits || 0,
          cacheMisses: agent.stats.cache?.misses || 0,
          errors: agent.stats.errors?.totalErrors || 0,
        },
      })),
    };

    return dashboard;
  } catch (error) {
    console.error('Dashboard data error:', error);
    return null;
  }
}

module.exports = {
  setupAgentManagement,
  exampleUsage,
  monitorHealth,
  monitorCosts,
  getDashboardData,
};
