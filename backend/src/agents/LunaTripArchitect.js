/**
 * Luna - Trip Architect Agent
 * Specializes in itinerary planning, destination research, and travel design
 * Core competency: Creative travel planning with cultural insights
 */

const EventEmitter = require('events');
const fs = require('fs').promises;
const path = require('path');

class LunaTripArchitect extends EventEmitter {
  constructor(manager) {
    super();
    this.agentId = 'luna-trip-architect';
    this.role = 'trip_architect';
    this.status = 'available';
    this.manager = manager;
    
    // Core capabilities
    this.capabilities = [
      'itinerary_design',
      'destination_research',
      'cultural_insights',
      'travel_planning',
      'route_optimization',
      'experience_curation',
      'timeline_management',
      'local_recommendations'
    ];

    // Specialized knowledge areas
    this.expertise = {
      destinations: new Map(),
      culturalInsights: new Map(),
      seasonalPatterns: new Map(),
      localCustoms: new Map()
    };

    // Active projects
    this.activeProjects = new Map();
    this.completedProjects = new Map();
    
    // Performance metrics
    this.metrics = {
      tripsPlanned: 0,
      destinationsResearched: 0,
      itinerariesCreated: 0,
      averagePlanningTime: 0,
      userSatisfactionScore: 0
    };

    this.initializeLuna();
  }

  /**
   * Initialize Luna's knowledge base and systems
   */
  async initializeLuna() {
    try {
      console.log('🌙 Initializing Luna - Trip Architect Agent...');
      
      // Load destination knowledge
      await this.loadDestinationKnowledge();
      
      // Load cultural insights
      await this.loadCulturalInsights();
      
      // Initialize planning algorithms
      this.initializePlanningAlgorithms();
      
      this.status = 'ready';
      console.log('✅ Luna Trip Architect initialized successfully');
      
      this.emit('agentReady', {
        agentId: this.agentId,
        capabilities: this.capabilities.length,
        status: this.status
      });
      
    } catch (error) {
      console.error('❌ Failed to initialize Luna:', error);
      this.status = 'error';
      throw error;
    }
  }

  /**
   * Load destination knowledge from data sources
   */
  async loadDestinationKnowledge() {
    const destinations = {
      'tokyo': {
        name: 'Tokyo',
        country: 'Japan',
        bestSeasons: ['spring', 'autumn'],
        culturalHighlights: ['temples', 'cherry_blossoms', 'sushi_culture'],
        mustVisit: ['Senso-ji Temple', 'Tsukiji Market', 'Tokyo Skytree'],
        localCustoms: ['bow_when_greeting', 'remove_shoes_indoors', 'quiet_on_trains'],
        budgetRange: { low: 100, medium: 200, high: 400 },
        duration: { min: 3, recommended: 7, max: 14 }
      },
      'paris': {
        name: 'Paris',
        country: 'France',
        bestSeasons: ['spring', 'summer'],
        culturalHighlights: ['art_museums', 'cafes', 'fashion'],
        mustVisit: ['Eiffel Tower', 'Louvre', 'Notre-Dame'],
        localCustoms: ['greet_with_bisous', 'dress_well', 'speak_french_phrases'],
        budgetRange: { low: 120, medium: 250, high: 500 },
        duration: { min: 4, recommended: 7, max: 21 }
      },
      'bangkok': {
        name: 'Bangkok',
        country: 'Thailand',
        bestSeasons: ['winter', 'spring'],
        culturalHighlights: ['buddhist_temples', 'street_food', 'night_markets'],
        mustVisit: ['Grand Palace', 'Wat Pho', 'Chatuchak Market'],
        localCustoms: ['wai_greeting', 'respect_monks', 'remove_hats_in_temples'],
        budgetRange: { low: 50, medium: 100, high: 200 },
        duration: { min: 3, recommended: 5, max: 10 }
      }
    };

    for (const [key, data] of Object.entries(destinations)) {
      this.expertise.destinations.set(key, data);
    }

    console.log(`📚 Loaded ${destinations.length} destinations into knowledge base`);
  }

  /**
   * Load cultural insights and local customs
   */
  async loadCulturalInsights() {
    const insights = {
      'japan': {
        etiquette: ['bow when greeting', 'quiet on public transport', 'remove shoes indoors'],
        foodCulture: ['try local specialties', 'respect dining customs', 'try street food'],
        languageTips: ['learn basic phrases', 'carry translation app', 'be patient with language barriers'],
        transportation: ['JR Pass for trains', 'use IC cards', 'walking is common']
      },
      'france': {
        etiquette: ['greet with bisous', 'dress well', 'be polite'],
        foodCulture: ['enjoy long meals', 'try local wines', 'visit markets'],
        languageTips: ['learn basic French', 'use Bonjour/Greetings', 'be respectful'],
        transportation: ['use Metro', 'walk when possible', 'consider bike rentals']
      },
      'thailand': {
        etiquette: ['use wai greeting', 'respect monks', 'dress modestly'],
        foodCulture: ['try street food', 'spicy food warning', 'fresh fruits'],
        languageTips: ['learn Sawasdee', 'use polite particles', 'smile often'],
        transportation: ['use tuk-tuks', 'BTS for longer distances', 'boats for rivers']
      }
    };

    for (const [country, data] of Object.entries(insights)) {
      this.expertise.culturalInsights.set(country, data);
    }

    console.log(`🌍 Loaded cultural insights for ${Object.keys(insights).length} countries`);
  }

  /**
   * Initialize planning algorithms and optimization strategies
   */
  initializePlanningAlgorithms() {
    this.algorithms = {
      itineraryOptimizer: this.optimizeItinerary.bind(this),
      routePlanner: this.planRoutes.bind(this),
      budgetAllocator: this.allocateBudget.bind(this),
      timelineManager: this.manageTimeline.bind(this)
    };
  }

  /**
   * Main method: Design a complete trip itinerary
   */
  async designTripItinerary(request) {
    const startTime = Date.now();
    const projectId = `trip_${request.destination}_${Date.now()}`;
    
    try {
      console.log(`🌙 Luna designing trip to ${request.destination}...`);
      
      // Create project
      const project = {
        id: projectId,
        destination: request.destination,
        duration: request.duration || 7,
        budget: request.budget || 'medium',
        interests: request.interests || [],
        travelers: request.travelers || 1,
        startDate: request.startDate,
        status: 'planning',
        createdAt: new Date()
      };

      this.activeProjects.set(projectId, project);

      // Phase 0: Query Memory for Existing Knowledge
      console.log('🧠 Phase 0: Querying memory for existing knowledge...');
      const memoryContext = await this.queryMemoryForContext(request);
      
      // Phase 1: Destination Research (enhanced with memory)
      console.log('📚 Phase 1: Researching destination...');
      const destinationData = await this.researchDestination(request.destination, memoryContext);
      
      // Phase 2: Cultural Insights
      console.log('🌍 Phase 2: Gathering cultural insights...');
      const culturalInsights = await this.gatherCulturalInsights(request.destination);
      
      // Phase 3: Itinerary Creation
      console.log('🗺️ Phase 3: Creating detailed itinerary...');
      const itinerary = await this.createDetailedItinerary(project, destinationData, culturalInsights);
      
      // Phase 4: Optimization
      console.log('⚡ Phase 4: Optimizing itinerary...');
      const optimizedItinerary = await this.optimizeItinerary(itinerary);
      
      // Phase 5: Final Review
      console.log('✅ Phase 5: Final review and recommendations...');
      const finalItinerary = await this.finalizeItinerary(optimizedItinerary, project);

      // Complete project
      project.status = 'completed';
      project.itinerary = finalItinerary;
      project.planningTime = Date.now() - startTime;
      
      this.activeProjects.delete(projectId);
      this.completedProjects.set(projectId, project);

      // Update metrics
      this.metrics.tripsPlanned++;
      this.metrics.itinerariesCreated++;
      this.updateAveragePlanningTime(project.planningTime);

      console.log(`🎉 Trip to ${request.destination} designed successfully!`);
      
      return {
        success: true,
        projectId,
        itinerary: finalItinerary,
        planningTime: project.planningTime,
        recommendations: this.generateRecommendations(finalItinerary),
        culturalTips: culturalInsights,
        estimatedCost: this.estimateTripCost(finalItinerary, request.budget)
      };

    } catch (error) {
      console.error('❌ Trip design failed:', error);
      throw new Error(`Failed to design trip: ${error.message}`);
    }
  }

  /**
   * Query memory for existing context and knowledge
   */
  async queryMemoryForContext(request) {
    try {
      if (!this.manager || !this.manager.memoryManager) {
        console.log('⚠️ Memory Manager not available, proceeding without memory context');
        return { memories: [], hasMemory: false };
      }

      const queries = [
        // Query for destination-specific memories
        `destination research ${request.destination}`,
        `cultural insights ${request.destination}`,
        `itinerary planning ${request.destination}`,
        // Query for user-specific memories
        `user preferences ${request.userId || 'anonymous'}`,
        // Query for similar trips
        `${request.duration} day trip ${request.budget} budget`
      ];

      const allMemories = [];
      for (const query of queries) {
        const result = await this.manager.queryMemory(query, {
          type: 'all',
          limit: 3,
          destination: request.destination,
          user_id: request.userId
        });
        
        if (result.success && result.results.length > 0) {
          allMemories.push(...result.results);
        }
      }

      console.log(`🧠 Found ${allMemories.length} relevant memories`);
      
      return {
        memories: allMemories,
        hasMemory: allMemories.length > 0,
        destinationMemories: allMemories.filter(m => m.metadata.destination === request.destination),
        userMemories: allMemories.filter(m => m.metadata.user_id === request.userId),
        culturalMemories: allMemories.filter(m => m.metadata.memory_type === 'cultural_insights'),
        itineraryMemories: allMemories.filter(m => m.metadata.memory_type === 'daily_itinerary')
      };

    } catch (error) {
      console.error('❌ Failed to query memory:', error);
      return { memories: [], hasMemory: false, error: error.message };
    }
  }

  /**
   * Research destination comprehensively (enhanced with memory)
   */
  async researchDestination(destination, memoryContext = {}) {
    const destKey = destination.toLowerCase();
    let baseData = this.expertise.destinations.get(destKey);
    
    // Enhance with memory if available
    if (memoryContext.hasMemory && memoryContext.destinationMemories.length > 0) {
      console.log('🧠 Enhancing destination research with memory...');
      baseData = this.enhanceDestinationWithMemory(baseData, memoryContext.destinationMemories);
    }
    
    if (!baseData) {
      // Simulate research for unknown destinations
      baseData = {
        name: destination,
        country: 'Unknown',
        bestSeasons: ['spring', 'autumn'],
        culturalHighlights: ['local_culture', 'historical_sites', 'local_cuisine'],
        mustVisit: ['City Center', 'Local Market', 'Cultural Site'],
        localCustoms: ['respect_locals', 'learn_basic_phrases', 'dress_appropriately'],
        budgetRange: { low: 80, medium: 150, high: 300 },
        duration: { min: 3, recommended: 5, max: 10 }
      };
    }

    // Enhance with additional research
    return {
      ...baseData,
      weatherPatterns: this.getWeatherPatterns(baseData.name),
      transportation: this.getTransportationOptions(baseData.name),
      accommodations: this.getAccommodationOptions(baseData.name),
      activities: this.getActivityRecommendations(baseData.name),
      restaurants: this.getRestaurantRecommendations(baseData.name),
      memoryEnhanced: memoryContext.hasMemory
    };
  }

  /**
   * Enhance destination data with memory insights
   */
  enhanceDestinationWithMemory(baseData, destinationMemories) {
    const enhanced = { ...baseData };
    
    for (const memory of destinationMemories) {
      const content = memory.content.toLowerCase();
      const metadata = memory.metadata;
      
      // Extract cultural highlights from memory
      if (metadata.memory_type === 'cultural_insights') {
        if (content.includes('etiquette:')) {
          const etiquetteMatch = content.match(/etiquette:\s*([^.]+)/);
          if (etiquetteMatch) {
            enhanced.localCustoms = [
              ...(enhanced.localCustoms || []),
              ...etiquetteMatch[1].split(',').map(s => s.trim())
            ];
          }
        }
      }
      
      // Extract must-visit places from memory
      if (metadata.memory_type === 'destination_research') {
        if (content.includes('must visit:')) {
          const mustVisitMatch = content.match(/must visit:\s*([^.]+)/);
          if (mustVisitMatch) {
            enhanced.mustVisit = [
              ...(enhanced.mustVisit || []),
              ...mustVisitMatch[1].split(',').map(s => s.trim())
            ];
          }
        }
      }
      
      // Extract budget information from memory
      if (metadata.memory_type === 'budget_analysis') {
        if (content.includes('total estimated cost:')) {
          const costMatch = content.match(/total estimated cost:\s*(\d+)/);
          if (costMatch) {
            const cost = parseInt(costMatch[1]);
            enhanced.budgetRange = {
              low: Math.round(cost * 0.7),
              medium: cost,
              high: Math.round(cost * 1.5)
            };
          }
        }
      }
    }
    
    // Remove duplicates
    if (enhanced.localCustoms) {
      enhanced.localCustoms = [...new Set(enhanced.localCustoms)];
    }
    if (enhanced.mustVisit) {
      enhanced.mustVisit = [...new Set(enhanced.mustVisit)];
    }
    
    return enhanced;
  }

  /**
   * Gather cultural insights for destination
   */
  async gatherCulturalInsights(destination) {
    const country = this.getCountryFromDestination(destination);
    const insights = this.expertise.culturalInsights.get(country.toLowerCase());
    
    return insights || {
      etiquette: ['be respectful', 'learn local customs', 'dress appropriately'],
      foodCulture: ['try local cuisine', 'visit local markets', 'respect dining customs'],
      languageTips: ['learn basic phrases', 'use translation apps', 'be patient'],
      transportation: ['use public transport', 'walk when possible', 'ask locals for tips']
    };
  }

  /**
   * Create detailed day-by-day itinerary
   */
  async createDetailedItinerary(project, destinationData, culturalInsights) {
    const itinerary = {
      destination: project.destination,
      duration: project.duration,
      budget: project.budget,
      days: []
    };

    for (let day = 1; day <= project.duration; day++) {
      const dayPlan = await this.createDayPlan(day, project, destinationData, culturalInsights);
      itinerary.days.push(dayPlan);
    }

    return itinerary;
  }

  /**
   * Create detailed plan for a single day
   */
  async createDayPlan(dayNumber, project, destinationData, culturalInsights) {
    const day = {
      day: dayNumber,
      date: this.calculateDate(project.startDate, dayNumber - 1),
      theme: this.getDayTheme(dayNumber, project.duration),
      activities: [],
      meals: [],
      transportation: [],
      budget: this.allocateDayBudget(project.budget, project.duration),
      culturalTips: this.getDayCulturalTips(culturalInsights, dayNumber)
    };

    // Add morning activities
    day.activities.push(...this.getMorningActivities(dayNumber, destinationData));
    
    // Add lunch
    day.meals.push(this.getLunchRecommendation(destinationData));
    
    // Add afternoon activities
    day.activities.push(...this.getAfternoonActivities(dayNumber, destinationData));
    
    // Add dinner
    day.meals.push(this.getDinnerRecommendation(destinationData, project.budget));
    
    // Add evening activities
    day.activities.push(...this.getEveningActivities(dayNumber, destinationData));

    return day;
  }

  /**
   * Optimize itinerary for efficiency and enjoyment
   */
  async optimizeItinerary(itinerary) {
    console.log('⚡ Optimizing itinerary...');
    
    // Optimize routes within each day
    for (const day of itinerary.days) {
      day.activities = this.optimizeActivitySequence(day.activities);
      day.transportation = this.optimizeTransportation(day.activities);
    }

    // Balance activities across days
    this.balanceActivitiesAcrossDays(itinerary.days);

    // Add buffer time and alternatives
    this.addBufferTimeAndAlternatives(itinerary.days);

    return itinerary;
  }

  /**
   * Finalize itinerary with recommendations and tips
   */
  async finalizeItinerary(itinerary, project) {
    const finalizedItinerary = {
      ...itinerary,
      summary: this.generateItinerarySummary(itinerary),
      packingList: this.generatePackingList(itinerary, project),
      emergencyContacts: this.getEmergencyContacts(itinerary.destination),
      travelTips: this.generateTravelTips(itinerary),
      budgetBreakdown: this.generateBudgetBreakdown(itinerary, project.budget),
      alternatives: this.generateAlternatives(itinerary)
    };

    // Store itinerary data
    await this.storeItineraryData(finalizedItinerary, project);

    return finalizedItinerary;
  }

  // Helper methods for itinerary creation
  getDayTheme(dayNumber, totalDays) {
    const themes = [
      'Arrival & Orientation',
      'Cultural Exploration',
      'Local Experiences',
      'Adventure & Activities',
      'Relaxation & Leisure',
      'Hidden Gems',
      'Farewell & Memories'
    ];
    
    if (dayNumber === 1) return themes[0];
    if (dayNumber === totalDays) return themes[6];
    return themes[(dayNumber - 1) % (themes.length - 2) + 1];
  }

  getMorningActivities(dayNumber, destinationData) {
    const activities = [
      { name: 'Breakfast at Local Café', duration: 60, cost: 15, type: 'food' },
      { name: 'Morning Walk in City Center', duration: 90, cost: 0, type: 'sightseeing' },
      { name: 'Visit Local Market', duration: 120, cost: 10, type: 'cultural' }
    ];
    
    return dayNumber === 1 ? activities.slice(0, 2) : activities.slice(0, 1);
  }

  getAfternoonActivities(dayNumber, destinationData) {
    const activities = [
      { name: 'Museum Visit', duration: 180, cost: 20, type: 'cultural' },
      { name: 'Historical Site Tour', duration: 150, cost: 15, type: 'historical' },
      { name: 'Local Neighborhood Exploration', duration: 120, cost: 5, type: 'cultural' }
    ];
    
    return activities.slice(0, 2);
  }

  getEveningActivities(dayNumber, destinationData) {
    const activities = [
      { name: 'Sunset Viewpoint', duration: 60, cost: 0, type: 'sightseeing' },
      { name: 'Local Restaurant Experience', duration: 120, cost: 30, type: 'food' },
      { name: 'Evening Stroll', duration: 90, cost: 0, type: 'leisure' }
    ];
    
    return activities.slice(0, 2);
  }

  // Utility methods
  calculateDate(startDate, dayOffset) {
    if (!startDate) return `Day ${dayOffset + 1}`;
    const date = new Date(startDate);
    date.setDate(date.getDate() + dayOffset);
    return date.toISOString().split('T')[0];
  }

  allocateDayBudget(budgetLevel, totalDays) {
    const budgets = {
      low: 80,
      medium: 150,
      high: 300
    };
    
    return Math.round(budgets[budgetLevel] / totalDays);
  }

  estimateTripCost(itinerary, budgetLevel) {
    let totalCost = 0;
    for (const day of itinerary.days) {
      totalCost += day.budget;
    }
    
    return {
      estimatedTotal: totalCost,
      perDay: Math.round(totalCost / itinerary.days.length),
      budgetLevel,
      breakdown: {
        accommodation: Math.round(totalCost * 0.4),
        food: Math.round(totalCost * 0.3),
        activities: Math.round(totalCost * 0.2),
        transportation: Math.round(totalCost * 0.1)
      }
    };
  }

  generateRecommendations(itinerary) {
    return {
      bestTimeToVisit: 'Spring or Autumn',
      mustTryFood: 'Local specialties and street food',
      culturalEtiquette: 'Be respectful of local customs',
      packingEssentials: 'Comfortable walking shoes, weather-appropriate clothing',
      localTransport: 'Use public transportation and walking',
      moneySaving: 'Eat at local markets, walk instead of taxi'
    };
  }

  // Data persistence methods
  async storeItineraryData(itinerary, project) {
    try {
      const dataDir = path.join('backend', 'data', 'itineraries');
      await fs.mkdir(dataDir, { recursive: true });
      
      const filename = `itinerary_${project.id}.json`;
      const filepath = path.join(dataDir, filename);
      
      await fs.writeFile(filepath, JSON.stringify({ itinerary, project }, null, 2));
      console.log(`💾 Itinerary stored: ${filename}`);
      
    } catch (error) {
      console.error('❌ Failed to store itinerary:', error);
    }
  }

  // Performance tracking
  updateAveragePlanningTime(newTime) {
    const total = this.metrics.averagePlanningTime * (this.metrics.tripsPlanned - 1) + newTime;
    this.metrics.averagePlanningTime = total / this.metrics.tripsPlanned;
  }

  // Agent status and metrics
  async getAgentStatus() {
    return {
      agent_id: this.agentId,
      role: this.role,
      status: this.status,
      capabilities: this.capabilities.length,
      active_projects: this.activeProjects.size,
      completed_projects: this.completedProjects.size,
      metrics: this.metrics,
      expertise_areas: this.expertise.destinations.size
    };
  }

  async getPerformanceMetrics() {
    return {
      trips_planned: this.metrics.tripsPlanned,
      destinations_researched: this.metrics.destinationsResearched,
      itineraries_created: this.metrics.itinerariesCreated,
      average_planning_time: this.metrics.averagePlanningTime,
      user_satisfaction_score: this.metrics.userSatisfactionScore,
      active_projects: this.activeProjects.size,
      uptime: Date.now() - (this.startTime || Date.now())
    };
  }
}

module.exports = LunaTripArchitect;