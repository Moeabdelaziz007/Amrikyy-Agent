/**
 * Country Agent - Intelligent country-specific travel assistant
 * Auto-updates every 15 minutes with latest data
 * Part of the distributed Country Agent Network
 */

const agentDNAEngine = require('../quantum/AgentDNAEngine');
const iziTravelService = require('../services/izi-travel/IziTravelService');
const redisService = require('../services/redis-service');
const logger = require('../utils/logger');

class CountryAgent {
  constructor(countryConfig) {
    this.country = countryConfig.country;
    this.countryCode = countryConfig.countryCode;
    this.config = countryConfig;

    // Load DNA from preset or custom config
    if (countryConfig.presetKey) {
      const preset = agentDNAEngine.getPreset(countryConfig.presetKey);
      if (preset) {
        Object.assign(this, preset);
      }
    } else {
      Object.assign(this, countryConfig);
    }

    // Calculate DNA Score
    this.dnaScore = agentDNAEngine.calculateDNAScore(this);

    // Generate system prompt
    this.systemPrompt = agentDNAEngine.generateSystemPrompt(this);

    // Knowledge base
    this.knowledge = {
      attractions: [],
      tours: [],
      weather: {},
      events: [],
      safety: {},
      culture: {},
      prices: {},
      lastUpdate: null,
    };

    // Auto-update scheduler
    this.updateInterval = 15 * 60 * 1000; // 15 minutes
    this.updateTimer = null;
    this.isUpdating = false;

    logger.info(
      `✅ ${this.name} initialized (DNA Score: ${this.dnaScore.totalScore})`
    );
  }

  /**
   * Start auto-update system
   */
  startAutoUpdates() {
    if (this.updateTimer) {
      logger.warn(`Auto-updates already running for ${this.name}`);
      return;
    }

    logger.info(`🔄 Starting auto-updates for ${this.name} (every 15 minutes)`);

    // Initial update
    this.updateKnowledge();

    // Schedule recurring updates
    this.updateTimer = setInterval(() => {
      this.updateKnowledge();
    }, this.updateInterval);
  }

  /**
   * Stop auto-update system
   */
  stopAutoUpdates() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
      logger.info(`⏹️ Stopped auto-updates for ${this.name}`);
    }
  }

  /**
   * Update knowledge base with latest data
   */
  async updateKnowledge() {
    if (this.isUpdating) {
      logger.info(`⏳ ${this.name} already updating...`);
      return;
    }

    this.isUpdating = true;
    logger.info(`🔄 Updating knowledge for ${this.name}...`);

    try {
      const startTime = Date.now();

      // Parallel data fetching
      const [attractions, tours, featured] = await Promise.all([
        this.updateAttractions(),
        this.updateTours(),
        this.updateFeaturedContent(),
      ]);

      this.knowledge.attractions = attractions;
      this.knowledge.tours = tours;
      this.knowledge.featured = featured;
      this.knowledge.lastUpdate = new Date().toISOString();

      const duration = Date.now() - startTime;
      logger.info(
        `✅ ${this.name} knowledge updated in ${duration}ms (${attractions.length} attractions, ${tours.length} tours)`
      );

      // Cache the knowledge
      await this.cacheKnowledge();
    } catch (error) {
      logger.error(
        `❌ Failed to update ${this.name} knowledge:`,
        error.message
      );
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * Update attractions data
   */
  async updateAttractions() {
    try {
      if (!this.config.location) {
        return [];
      }

      const attractions = await iziTravelService.getAttractionsNearby(
        this.config.location.latitude,
        this.config.location.longitude,
        {
          radius: 100000, // 100km radius
          languages: 'en,ar',
          limit: 50,
        }
      );

      return attractions;
    } catch (error) {
      logger.error(
        `Failed to fetch attractions for ${this.country}:`,
        error.message
      );
      return [];
    }
  }

  /**
   * Update tours data
   */
  async updateTours() {
    try {
      if (!this.config.location) {
        return [];
      }

      const tours = await iziTravelService.getToursNearby(
        this.config.location.latitude,
        this.config.location.longitude,
        {
          radius: 100000, // 100km radius
          languages: 'en,ar',
          limit: 50,
        }
      );

      return tours;
    } catch (error) {
      logger.error(`Failed to fetch tours for ${this.country}:`, error.message);
      return [];
    }
  }

  /**
   * Update featured content
   */
  async updateFeaturedContent() {
    try {
      const featured = await iziTravelService.getFeaturedContent('en,ar');
      return featured;
    } catch (error) {
      logger.error(`Failed to fetch featured content:`, error.message);
      return null;
    }
  }

  /**
   * Cache knowledge in Redis
   */
  async cacheKnowledge() {
    if (redisService.isConnected) {
      const cacheKey = `country-agent:${this.countryCode}:knowledge`;
      await redisService.set(cacheKey, this.knowledge, 900); // 15 minutes
      logger.info(`💾 Cached knowledge for ${this.name}`);
    }
  }

  /**
   * Load cached knowledge from Redis
   */
  async loadCachedKnowledge() {
    if (redisService.isConnected) {
      const cacheKey = `country-agent:${this.countryCode}:knowledge`;
      const cached = await redisService.get(cacheKey);

      if (cached) {
        this.knowledge = cached;
        logger.info(`✅ Loaded cached knowledge for ${this.name}`);
        return true;
      }
    }
    return false;
  }

  /**
   * Process user query
   */
  async processQuery(query, context = {}) {
    logger.info(`🤔 ${this.name} processing query: "${query}"`);

    try {
      // Load cached knowledge if not loaded
      if (!this.knowledge.lastUpdate) {
        const loaded = await this.loadCachedKnowledge();
        if (!loaded) {
          await this.updateKnowledge();
        }
      }

      // Analyze query intent
      const intent = this.analyzeIntent(query);

      // Generate response based on intent
      const response = await this.generateResponse(intent, query, context);

      return {
        success: true,
        agent: this.name,
        country: this.country,
        dnaScore: this.dnaScore.totalScore,
        response,
        intent,
        knowledgeAge: this.knowledge.lastUpdate
          ? Math.round(
              (Date.now() - new Date(this.knowledge.lastUpdate).getTime()) /
                1000
            )
          : null,
      };
    } catch (error) {
      logger.error(`❌ ${this.name} query processing failed:`, error.message);
      return {
        success: false,
        agent: this.name,
        error: error.message,
      };
    }
  }

  /**
   * Analyze query intent
   */
  analyzeIntent(query) {
    const lowerQuery = query.toLowerCase();

    const intents = {
      attractions: [
        'attraction',
        'place',
        'visit',
        'see',
        'landmark',
        'monument',
      ],
      tours: ['tour', 'guide', 'audio', 'walk', 'trip'],
      hotels: ['hotel', 'stay', 'accommodation', 'resort', 'lodge'],
      weather: ['weather', 'temperature', 'climate', 'season'],
      food: ['food', 'restaurant', 'eat', 'cuisine', 'dining'],
      culture: ['culture', 'tradition', 'custom', 'heritage', 'history'],
      safety: ['safe', 'security', 'danger', 'risk'],
      transport: ['transport', 'bus', 'train', 'taxi', 'metro', 'airport'],
      budget: ['cheap', 'budget', 'affordable', 'price', 'cost'],
      luxury: ['luxury', 'premium', 'expensive', 'exclusive', 'vip'],
    };

    const detected = [];
    Object.entries(intents).forEach(([intent, keywords]) => {
      if (keywords.some((keyword) => lowerQuery.includes(keyword))) {
        detected.push(intent);
      }
    });

    return detected.length > 0 ? detected : ['general'];
  }

  /**
   * Generate response based on intent
   */
  async generateResponse(intents, query, context) {
    const primaryIntent = intents[0];

    switch (primaryIntent) {
      case 'attractions':
        return this.getAttractionsResponse();
      case 'tours':
        return this.getToursResponse();
      case 'general':
      default:
        return this.getGeneralResponse(query);
    }
  }

  /**
   * Get attractions response
   */
  getAttractionsResponse() {
    const topAttractions = this.knowledge.attractions.slice(0, 5);

    return {
      type: 'attractions',
      count: this.knowledge.attractions.length,
      highlights: topAttractions.map((a) => ({
        uuid: a.uuid,
        title: a.title,
        location: a.location,
        rating: a.rating,
      })),
      message: `I found ${this.knowledge.attractions.length} amazing attractions in ${this.country}! Here are the top ones...`,
    };
  }

  /**
   * Get tours response
   */
  getToursResponse() {
    const topTours = this.knowledge.tours.slice(0, 5);

    return {
      type: 'tours',
      count: this.knowledge.tours.length,
      highlights: topTours.map((t) => ({
        uuid: t.uuid,
        title: t.title,
        duration: t.audio_duration,
        languages: t.languages,
      })),
      message: `I have ${this.knowledge.tours.length} professional audio tours ready for you in ${this.country}!`,
    };
  }

  /**
   * Get general response
   */
  getGeneralResponse(query) {
    return {
      type: 'general',
      message: `As your ${
        this.country
      } expert, I'm here to help! I have extensive knowledge about ${this.domainExpertise.join(
        ', '
      )}. What would you like to know?`,
      suggestions: [
        'Show me top attractions',
        'What are the best tours?',
        'Tell me about local culture',
        "What's the weather like?",
        'Where should I stay?',
      ],
    };
  }

  /**
   * Get agent status
   */
  getStatus() {
    return {
      name: this.name,
      country: this.country,
      countryCode: this.countryCode,
      dnaScore: this.dnaScore,
      specialization: this.specialization,
      knowledge: {
        attractions: this.knowledge.attractions.length,
        tours: this.knowledge.tours.length,
        lastUpdate: this.knowledge.lastUpdate,
        ageSeconds: this.knowledge.lastUpdate
          ? Math.round(
              (Date.now() - new Date(this.knowledge.lastUpdate).getTime()) /
                1000
            )
          : null,
      },
      autoUpdate: {
        enabled: !!this.updateTimer,
        interval: this.updateInterval / 1000,
        isUpdating: this.isUpdating,
      },
      performance: {
        tier: this.dnaScore.tier,
        level: this.dnaScore.level,
        emoji: this.dnaScore.emoji,
      },
    };
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.stopAutoUpdates();
    logger.info(`🗑️ ${this.name} destroyed`);
  }
}

module.exports = CountryAgent;
