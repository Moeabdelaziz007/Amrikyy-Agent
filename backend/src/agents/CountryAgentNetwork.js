/**
 * Country Agent Network
 * Manages all country agents and routes queries intelligently
 * Part of SAAAAS distributed intelligence system
 */

const CountryAgent = require('./CountryAgent');
const logger = require('../utils/logger');

class CountryAgentNetwork {
  constructor() {
    this.agents = new Map();
    this.isInitialized = false;
  }

  /**
   * Initialize network with country agents
   */
  async initialize() {
    if (this.isInitialized) {
      logger.warn('Country Agent Network already initialized');
      return;
    }

    logger.info('🌍 Initializing Country Agent Network...');

    // Create country agents
    this.createAgent('egypt', {
      country: 'Egypt',
      countryCode: 'EG',
      presetKey: 'egyptExpert',
      location: {
        latitude: 30.0444,
        longitude: 31.2357,
      },
    });

    this.createAgent('saudi', {
      country: 'Saudi Arabia',
      countryCode: 'SA',
      presetKey: 'saudiGuide',
      location: {
        latitude: 21.3891,
        longitude: 39.8579, // Mecca
      },
    });

    this.createAgent('uae', {
      country: 'UAE',
      countryCode: 'AE',
      presetKey: 'uaeLuxury',
      location: {
        latitude: 25.2048,
        longitude: 55.2708, // Dubai
      },
    });

    // Start auto-updates for all agents
    this.agents.forEach((agent) => {
      agent.startAutoUpdates();
    });

    this.isInitialized = true;
    logger.info(
      `✅ Country Agent Network initialized with ${this.agents.size} agents`
    );
  }

  /**
   * Create and register a country agent
   */
  createAgent(key, config) {
    try {
      const agent = new CountryAgent(config);
      this.agents.set(key, agent);
      logger.info(`✅ Created ${key} agent: ${agent.name}`);
      return agent;
    } catch (error) {
      logger.error(`❌ Failed to create ${key} agent:`, error.message);
      return null;
    }
  }

  /**
   * Get agent by key
   */
  getAgent(key) {
    return this.agents.get(key);
  }

  /**
   * Get all agents
   */
  getAllAgents() {
    return Array.from(this.agents.values());
  }

  /**
   * Route query to appropriate agent(s)
   */
  async routeQuery(query, context = {}) {
    // Detect country from context or query
    const detectedCountry = this.detectCountry(query, context);

    if (detectedCountry) {
      // Route to specific country agent
      const agent = this.agents.get(detectedCountry);
      if (agent) {
        logger.info(`🎯 Routing to ${agent.name}`);
        return agent.processQuery(query, context);
      }
    }

    // If no specific country, query all agents and synthesize
    logger.info('🌍 Broadcasting query to all agents...');
    const responses = await Promise.all(
      Array.from(this.agents.values()).map((agent) =>
        agent.processQuery(query, context)
      )
    );

    return this.synthesizeResponses(responses, query);
  }

  /**
   * Detect country from query or context
   */
  detectCountry(query, context) {
    const lowerQuery = query.toLowerCase();

    // Check context first
    if (context.country) {
      const normalized = context.country.toLowerCase();
      if (normalized.includes('egypt')) return 'egypt';
      if (normalized.includes('saudi')) return 'saudi';
      if (normalized.includes('uae') || normalized.includes('dubai'))
        return 'uae';
    }

    // Check query
    if (
      lowerQuery.includes('egypt') ||
      lowerQuery.includes('cairo') ||
      lowerQuery.includes('pyramid')
    )
      return 'egypt';

    if (
      lowerQuery.includes('saudi') ||
      lowerQuery.includes('mecca') ||
      lowerQuery.includes('medina') ||
      lowerQuery.includes('hajj') ||
      lowerQuery.includes('umrah')
    )
      return 'saudi';

    if (
      lowerQuery.includes('uae') ||
      lowerQuery.includes('dubai') ||
      lowerQuery.includes('abu dhabi')
    )
      return 'uae';

    return null;
  }

  /**
   * Synthesize responses from multiple agents
   */
  synthesizeResponses(responses, query) {
    const successful = responses.filter((r) => r.success);

    if (successful.length === 0) {
      return {
        success: false,
        message: 'No agents could process your query',
      };
    }

    // Combine all attractions/tours
    const allAttractions = [];
    const allTours = [];

    successful.forEach((response) => {
      if (
        response.response.type === 'attractions' &&
        response.response.highlights
      ) {
        allAttractions.push(...response.response.highlights);
      }
      if (response.response.type === 'tours' && response.response.highlights) {
        allTours.push(...response.response.highlights);
      }
    });

    return {
      success: true,
      multi_agent: true,
      agents: successful.map((r) => ({
        name: r.agent,
        country: r.country,
        dnaScore: r.dnaScore,
      })),
      attractions: allAttractions,
      tours: allTours,
      message: `I found amazing options across ${successful.length} countries!`,
    };
  }

  /**
   * Get network status
   */
  getNetworkStatus() {
    const agentStatuses = Array.from(this.agents.entries()).map(
      ([key, agent]) => ({
        key,
        ...agent.getStatus(),
      })
    );

    const totalAttractions = agentStatuses.reduce(
      (sum, a) => sum + a.knowledge.attractions,
      0
    );
    const totalTours = agentStatuses.reduce(
      (sum, a) => sum + a.knowledge.tours,
      0
    );

    return {
      network: 'Country Agent Network',
      status: this.isInitialized ? 'active' : 'inactive',
      agents: agentStatuses.length,
      totalKnowledge: {
        attractions: totalAttractions,
        tours: totalTours,
      },
      agentDetails: agentStatuses,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Shutdown all agents
   */
  shutdown() {
    logger.info('🛑 Shutting down Country Agent Network...');

    this.agents.forEach((agent, key) => {
      agent.destroy();
      logger.info(`✅ Shutdown ${key} agent`);
    });

    this.agents.clear();
    this.isInitialized = false;

    logger.info('✅ Country Agent Network shutdown complete');
  }
}

// Export singleton instance
const countryAgentNetwork = new CountryAgentNetwork();
module.exports = countryAgentNetwork;
