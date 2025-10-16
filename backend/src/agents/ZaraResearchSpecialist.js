/**
 * Zara - Research Specialist Agent
 * Specializes in fact-checking, information gathering, and booking research
 * Core competency: Real-time verification and actionable booking intelligence
 */

const EventEmitter = require('events');
const fs = require('fs').promises;
const path = require('path');

class ZaraResearchSpecialist extends EventEmitter {
  constructor(manager) {
    super();
    this.agentId = 'zara-research-specialist';
    this.role = 'research_analyst';
    this.status = 'available';
    this.manager = manager;
    
    // Core capabilities
    this.capabilities = [
      'fact_checking',
      'information_gathering',
      'booking_research',
      'logistics_verification',
      'real_time_data',
      'website_scraping',
      'api_integration',
      'data_validation'
    ];

    // Research knowledge base
    this.researchData = {
      verifiedSources: new Map(),
      bookingPlatforms: new Map(),
      factChecks: new Map(),
      logisticsData: new Map()
    };

    // Active research projects
    this.activeProjects = new Map();
    this.completedProjects = new Map();
    
    // Performance metrics
    this.metrics = {
      factsVerified: 0,
      bookingLinksFound: 0,
      logisticsVerified: 0,
      dataSourcesChecked: 0,
      accuracyRate: 0
    };

    this.initializeZara();
  }

  /**
   * Initialize Zara's research systems and data sources
   */
  async initializeZara() {
    try {
      console.log('🔍 Initializing Zara - Research Specialist Agent...');
      
      // Load verified data sources
      await this.loadVerifiedSources();
      
      // Load booking platforms
      await this.loadBookingPlatforms();
      
      // Initialize web scraping capabilities
      this.initializeWebScraping();
      
      // Initialize API integrations
      this.initializeAPIIntegrations();
      
      this.status = 'ready';
      console.log('✅ Zara Research Specialist initialized successfully');
      
      this.emit('agentReady', {
        agentId: this.agentId,
        capabilities: this.capabilities.length,
        status: this.status
      });
      
    } catch (error) {
      console.error('❌ Failed to initialize Zara:', error);
      this.status = 'error';
      throw error;
    }
  }

  /**
   * Load verified data sources for fact-checking
   */
  async loadVerifiedSources() {
    const sources = {
      'museums': {
        'name': 'Museum Information',
        'sources': ['official websites', 'tripadvisor', 'google places'],
        'verification': 'cross-reference multiple sources'
      },
      'restaurants': {
        'name': 'Restaurant Data',
        'sources': ['google places', 'yelp', 'opentable'],
        'verification': 'check operating hours and ratings'
      },
      'transportation': {
        'name': 'Transportation Info',
        'sources': ['official transit sites', 'google maps', 'booking platforms'],
        'verification': 'verify schedules and routes'
      },
      'attractions': {
        'name': 'Tourist Attractions',
        'sources': ['official tourism boards', 'wikipedia', 'travel guides'],
        'verification': 'check opening hours and admission fees'
      }
    };

    for (const [category, data] of Object.entries(sources)) {
      this.researchData.verifiedSources.set(category, data);
    }

    console.log(`📚 Loaded ${Object.keys(sources).length} verified data source categories`);
  }

  /**
   * Load booking platforms for research
   */
  async loadBookingPlatforms() {
    const platforms = {
      'flights': {
        'skyscanner': { url: 'https://www.skyscanner.com', api: 'limited' },
        'google_flights': { url: 'https://flights.google.com', api: 'no' },
        'kayak': { url: 'https://www.kayak.com', api: 'limited' },
        'expedia': { url: 'https://www.expedia.com', api: 'yes' }
      },
      'hotels': {
        'booking_com': { url: 'https://www.booking.com', api: 'yes' },
        'hotels_com': { url: 'https://www.hotels.com', api: 'yes' },
        'airbnb': { url: 'https://www.airbnb.com', api: 'yes' },
        'agoda': { url: 'https://www.agoda.com', api: 'yes' }
      },
      'activities': {
        'viator': { url: 'https://www.viator.com', api: 'yes' },
        'getyourguide': { url: 'https://www.getyourguide.com', api: 'yes' },
        'tripadvisor': { url: 'https://www.tripadvisor.com', api: 'limited' },
        'airbnb_experiences': { url: 'https://www.airbnb.com/experiences', api: 'yes' }
      },
      'transportation': {
        'uber': { url: 'https://www.uber.com', api: 'yes' },
        'lyft': { url: 'https://www.lyft.com', api: 'yes' },
        'trainline': { url: 'https://www.trainline.com', api: 'yes' },
        'rentalcars': { url: 'https://www.rentalcars.com', api: 'yes' }
      }
    };

    for (const [category, platformData] of Object.entries(platforms)) {
      this.researchData.bookingPlatforms.set(category, platformData);
    }

    console.log(`🌐 Loaded ${Object.keys(platforms).length} booking platform categories`);
  }

  /**
   * Initialize web scraping capabilities
   */
  initializeWebScraping() {
    this.scrapingCapabilities = {
      playwright: false, // Would need npm install playwright
      puppeteer: false,  // Would need npm install puppeteer
      cheerio: false,    // Would need npm install cheerio
      axios: true        // Basic HTTP requests
    };

    console.log('🕷️ Web scraping capabilities initialized');
  }

  /**
   * Initialize API integrations
   */
  initializeAPIIntegrations() {
    this.apiIntegrations = {
      googleMaps: {
        enabled: false, // Would need API key
        capabilities: ['places', 'directions', 'geocoding']
      },
      googlePlaces: {
        enabled: false, // Would need API key
        capabilities: ['place_details', 'nearby_search', 'text_search']
      },
      openWeather: {
        enabled: false, // Would need API key
        capabilities: ['current_weather', 'forecast']
      }
    };

    console.log('🔌 API integrations initialized');
  }

  /**
   * Main method: Fact-check and research itinerary
   */
  async factCheckItinerary(request) {
    const startTime = Date.now();
    const projectId = `research_${request.itineraryId}_${Date.now()}`;
    
    try {
      console.log(`🔍 Zara fact-checking itinerary ${request.itineraryId}...`);
      
      // Create research project
      const project = {
        id: projectId,
        itineraryId: request.itineraryId,
        itinerary: request.itinerary,
        status: 'researching',
        findings: {},
        issues: [],
        recommendations: [],
        createdAt: new Date()
      };

      this.activeProjects.set(projectId, project);

      // Phase 0: Query Memory for Research Context
      console.log('🧠 Phase 0: Querying memory for research context...');
      const memoryContext = await this.queryMemoryForResearchContext(request);
      
      // Phase 1: Logistics Verification (enhanced with memory)
      console.log('🚌 Phase 1: Verifying logistics...');
      const logisticsCheck = await this.verifyLogistics(project.itinerary, memoryContext);
      
      // Phase 2: Booking Research
      console.log('📋 Phase 2: Researching booking options...');
      const bookingResearch = await this.researchBookings(project.itinerary);
      
      // Phase 3: Fact Verification
      console.log('✅ Phase 3: Verifying facts...');
      const factVerification = await this.verifyFacts(project.itinerary);
      
      // Phase 4: Issue Analysis
      console.log('⚠️ Phase 4: Analyzing issues...');
      const issueAnalysis = await this.analyzeIssues(logisticsCheck, bookingResearch, factVerification);
      
      // Phase 5: Generate Report
      console.log('📊 Phase 5: Generating research report...');
      const researchReport = await this.generateResearchReport(project, issueAnalysis);

      // Complete project
      project.status = 'completed';
      project.report = researchReport;
      project.researchTime = Date.now() - startTime;
      
      this.activeProjects.delete(projectId);
      this.completedProjects.set(projectId, project);

      // Update metrics
      this.metrics.factsVerified += factVerification.verifiedCount;
      this.metrics.bookingLinksFound += bookingResearch.bookingLinks.length;
      this.metrics.logisticsVerified += logisticsCheck.verifiedCount;
      this.updateAccuracyRate(researchReport);

      console.log(`🎉 Research completed for itinerary ${request.itineraryId}!`);
      
      return {
        success: true,
        projectId,
        report: researchReport,
        researchTime: project.researchTime,
        issuesFound: researchReport.issues.length,
        recommendations: researchReport.recommendations,
        bookingLinks: researchReport.bookingLinks
      };

    } catch (error) {
      console.error('❌ Research failed:', error);
      throw new Error(`Failed to research itinerary: ${error.message}`);
    }
  }

  /**
   * Query memory for research context and verified data
   */
  async queryMemoryForResearchContext(request) {
    try {
      if (!this.manager || !this.manager.memoryManager) {
        console.log('⚠️ Memory Manager not available, proceeding without research memory context');
        return { memories: [], hasMemory: false };
      }

      const destination = request.itinerary?.destination || 'unknown';
      const queries = [
        // Query for destination-specific research data
        `research data ${destination}`,
        `verified facts ${destination}`,
        `booking information ${destination}`,
        `logistics data ${destination}`,
        // Query for activity-specific data
        `activity verification ${destination}`,
        // Query for user-specific research history
        `user research history ${request.userId || 'anonymous'}`
      ];

      const allMemories = [];
      for (const query of queries) {
        const result = await this.manager.queryMemory(query, {
          type: 'research',
          limit: 3,
          destination: destination,
          user_id: request.userId
        });
        
        if (result.success && result.results.length > 0) {
          allMemories.push(...result.results);
        }
      }

      console.log(`🧠 Found ${allMemories.length} relevant research memories`);
      
      return {
        memories: allMemories,
        hasMemory: allMemories.length > 0,
        researchMemories: allMemories.filter(m => m.metadata.memory_type === 'research'),
        verifiedFacts: allMemories.filter(m => m.content.includes('verified') || m.content.includes('fact')),
        bookingMemories: allMemories.filter(m => m.content.includes('booking') || m.content.includes('reservation')),
        logisticsMemories: allMemories.filter(m => m.content.includes('logistics') || m.content.includes('transport'))
      };

    } catch (error) {
      console.error('❌ Failed to query research memory:', error);
      return { memories: [], hasMemory: false, error: error.message };
    }
  }

  /**
   * Verify logistics for itinerary (enhanced with memory)
   */
  async verifyLogistics(itinerary, memoryContext = {}) {
    const verification = {
      verifiedCount: 0,
      issues: [],
      recommendations: []
    };

    for (const day of itinerary.days) {
      for (const activity of day.activities) {
        const activityCheck = await this.verifyActivity(activity);
        
        if (activityCheck.verified) {
          verification.verifiedCount++;
        } else {
          verification.issues.push({
            day: day.day,
            activity: activity.name,
            issue: activityCheck.issue,
            severity: activityCheck.severity
          });
        }

        if (activityCheck.recommendation) {
          verification.recommendations.push(activityCheck.recommendation);
        }
      }
    }

    return verification;
  }

  /**
   * Verify individual activity
   */
  async verifyActivity(activity) {
    // Simulate verification process
    const checks = {
      openingHours: this.checkOpeningHours(activity),
      location: this.checkLocation(activity),
      booking: this.checkBooking(activity),
      cost: this.checkCost(activity)
    };

    const verified = Object.values(checks).every(check => check.verified);
    const issues = Object.values(checks).filter(check => !check.verified);
    const recommendations = Object.values(checks)
      .filter(check => check.recommendation)
      .map(check => check.recommendation);

    return {
      verified,
      issue: issues.length > 0 ? issues[0].issue : null,
      severity: issues.length > 0 ? issues[0].severity : 'low',
      recommendation: recommendations.length > 0 ? recommendations[0] : null
    };
  }

  /**
   * Check opening hours for activity
   */
  checkOpeningHours(activity) {
    // Simulate opening hours check
    const mockHours = {
      'Senso-ji Temple': { open: '06:00', close: '17:00' },
      'Louvre Museum': { open: '09:00', close: '18:00', closed: ['Tuesday'] },
      'Grand Palace': { open: '08:30', close: '15:30' }
    };

    const hours = mockHours[activity.name];
    
    if (!hours) {
      return {
        verified: false,
        issue: 'Opening hours not verified',
        severity: 'medium',
        recommendation: 'Verify opening hours before visiting'
      };
    }

    return {
      verified: true,
      openingHours: hours
    };
  }

  /**
   * Check location for activity
   */
  checkLocation(activity) {
    // Simulate location verification
    if (!activity.location) {
      return {
        verified: false,
        issue: 'Location not specified',
        severity: 'high',
        recommendation: 'Add specific location/address'
      };
    }

    return {
      verified: true,
      location: activity.location
    };
  }

  /**
   * Check booking requirements for activity
   */
  checkBooking(activity) {
    // Simulate booking check
    const requiresBooking = ['Museum Pass', 'Private Guided Tour', 'Cultural Experience'];
    
    if (requiresBooking.includes(activity.name)) {
      return {
        verified: true,
        requiresBooking: true,
        recommendation: 'Book in advance to secure spot'
      };
    }

    return {
      verified: true,
      requiresBooking: false
    };
  }

  /**
   * Check cost for activity
   */
  checkCost(activity) {
    if (!activity.cost || activity.cost === 0) {
      return {
        verified: false,
        issue: 'Cost not specified',
        severity: 'medium',
        recommendation: 'Verify current pricing'
      };
    }

    return {
      verified: true,
      cost: activity.cost
    };
  }

  /**
   * Research booking options for itinerary
   */
  async researchBookings(itinerary) {
    const bookingResearch = {
      bookingLinks: [],
      alternatives: [],
      recommendations: []
    };

    for (const day of itinerary.days) {
      for (const activity of day.activities) {
        const bookingOptions = await this.findBookingOptions(activity);
        bookingResearch.bookingLinks.push(...bookingOptions.links);
        bookingResearch.alternatives.push(...bookingOptions.alternatives);
      }
    }

    return bookingResearch;
  }

  /**
   * Find booking options for specific activity
   */
  async findBookingOptions(activity) {
    const bookingOptions = {
      links: [],
      alternatives: []
    };

    // Simulate booking research
    const mockBookings = {
      'Museum Pass': [
        { platform: 'Official Website', url: 'https://example.com/museum-pass', price: 35 },
        { platform: 'Viator', url: 'https://viator.com/museum-pass', price: 32 }
      ],
      'Private Guided Tour': [
        { platform: 'GetYourGuide', url: 'https://getyourguide.com/tour', price: 120 },
        { platform: 'TripAdvisor', url: 'https://tripadvisor.com/tour', price: 115 }
      ],
      'Cultural Experience': [
        { platform: 'Airbnb Experiences', url: 'https://airbnb.com/experience', price: 65 },
        { platform: 'Viator', url: 'https://viator.com/experience', price: 60 }
      ]
    };

    const bookings = mockBookings[activity.name] || [];
    
    for (const booking of bookings) {
      bookingOptions.links.push({
        activity: activity.name,
        platform: booking.platform,
        url: booking.url,
        price: booking.price,
        verified: true
      });
    }

    return bookingOptions;
  }

  /**
   * Verify facts for itinerary
   */
  async verifyFacts(itinerary) {
    const verification = {
      verifiedCount: 0,
      totalChecks: 0,
      issues: [],
      corrections: []
    };

    // Verify destination facts
    const destinationFacts = await this.verifyDestinationFacts(itinerary.destination);
    verification.verifiedCount += destinationFacts.verified;
    verification.totalChecks += destinationFacts.total;
    verification.issues.push(...destinationFacts.issues);

    // Verify activity facts
    for (const day of itinerary.days) {
      for (const activity of day.activities) {
        const activityFacts = await this.verifyActivityFacts(activity);
        verification.verifiedCount += activityFacts.verified;
        verification.totalChecks += activityFacts.total;
        verification.issues.push(...activityFacts.issues);
      }
    }

    verification.accuracyRate = (verification.verifiedCount / verification.totalChecks) * 100;

    return verification;
  }

  /**
   * Verify destination facts
   */
  async verifyDestinationFacts(destination) {
    // Simulate destination fact verification
    const mockFacts = {
      'Tokyo': {
        country: 'Japan',
        currency: 'JPY',
        timezone: 'JST',
        language: 'Japanese',
        verified: true
      },
      'Paris': {
        country: 'France',
        currency: 'EUR',
        timezone: 'CET',
        language: 'French',
        verified: true
      },
      'Bangkok': {
        country: 'Thailand',
        currency: 'THB',
        timezone: 'ICT',
        language: 'Thai',
        verified: true
      }
    };

    const facts = mockFacts[destination] || { verified: false, issues: ['Destination facts not verified'] };

    return {
      verified: facts.verified ? 1 : 0,
      total: 1,
      issues: facts.verified ? [] : facts.issues || []
    };
  }

  /**
   * Verify activity facts
   */
  async verifyActivityFacts(activity) {
    // Simulate activity fact verification
    const mockActivityFacts = {
      'Senso-ji Temple': { verified: true, type: 'religious_site', admission: 'free' },
      'Louvre Museum': { verified: true, type: 'museum', admission: 'paid' },
      'Grand Palace': { verified: true, type: 'historical_site', admission: 'paid' }
    };

    const facts = mockActivityFacts[activity.name] || { verified: false, issues: ['Activity facts not verified'] };

    return {
      verified: facts.verified ? 1 : 0,
      total: 1,
      issues: facts.verified ? [] : facts.issues || []
    };
  }

  /**
   * Analyze issues found during research
   */
  async analyzeIssues(logisticsCheck, bookingResearch, factVerification) {
    const analysis = {
      criticalIssues: [],
      warnings: [],
      suggestions: [],
      overallRisk: 'low'
    };

    // Analyze logistics issues
    for (const issue of logisticsCheck.issues) {
      if (issue.severity === 'high') {
        analysis.criticalIssues.push(issue);
      } else if (issue.severity === 'medium') {
        analysis.warnings.push(issue);
      }
    }

    // Analyze fact verification issues
    if (factVerification.accuracyRate < 80) {
      analysis.warnings.push({
        type: 'fact_accuracy',
        message: `Fact accuracy rate is ${factVerification.accuracyRate.toFixed(1)}%`,
        recommendation: 'Verify more facts before finalizing itinerary'
      });
    }

    // Determine overall risk
    if (analysis.criticalIssues.length > 0) {
      analysis.overallRisk = 'high';
    } else if (analysis.warnings.length > 2) {
      analysis.overallRisk = 'medium';
    }

    return analysis;
  }

  /**
   * Generate comprehensive research report
   */
  async generateResearchReport(project, issueAnalysis) {
    const report = {
      itineraryId: project.itineraryId,
      researchDate: new Date(),
      summary: this.generateReportSummary(issueAnalysis),
      issues: issueAnalysis.criticalIssues.concat(issueAnalysis.warnings),
      recommendations: this.generateRecommendations(issueAnalysis),
      bookingLinks: await this.compileBookingLinks(project.itinerary),
      logistics: await this.compileLogistics(project.itinerary),
      facts: await this.compileFacts(project.itinerary),
      overallRisk: issueAnalysis.overallRisk,
      confidence: this.calculateConfidence(issueAnalysis)
    };

    // Store report
    await this.storeResearchReport(report, project);

    return report;
  }

  /**
   * Generate report summary
   */
  generateReportSummary(issueAnalysis) {
    const totalIssues = issueAnalysis.criticalIssues.length + issueAnalysis.warnings.length;
    
    if (totalIssues === 0) {
      return 'Itinerary research completed successfully. No critical issues found.';
    } else if (issueAnalysis.criticalIssues.length === 0) {
      return `Itinerary research completed with ${issueAnalysis.warnings.length} minor issues to address.`;
    } else {
      return `Itinerary research completed with ${issueAnalysis.criticalIssues.length} critical issues and ${issueAnalysis.warnings.length} warnings. Review required.`;
    }
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(issueAnalysis) {
    const recommendations = [];

    if (issueAnalysis.criticalIssues.length > 0) {
      recommendations.push('Address critical issues before finalizing itinerary');
    }

    if (issueAnalysis.warnings.length > 0) {
      recommendations.push('Review and address warnings for optimal experience');
    }

    recommendations.push('Verify all booking links before travel');
    recommendations.push('Check opening hours and admission requirements');
    recommendations.push('Have backup plans for weather-dependent activities');

    return recommendations;
  }

  /**
   * Compile booking links
   */
  async compileBookingLinks(itinerary) {
    const bookingLinks = [];

    for (const day of itinerary.days) {
      for (const activity of day.activities) {
        if (activity.requiresBooking) {
          bookingLinks.push({
            day: day.day,
            activity: activity.name,
            bookingUrl: `https://example.com/book/${activity.name.toLowerCase().replace(/\s+/g, '-')}`,
            platform: 'Official Website',
            verified: true
          });
        }
      }
    }

    return bookingLinks;
  }

  /**
   * Compile logistics information
   */
  async compileLogistics(itinerary) {
    return {
      totalDays: itinerary.days.length,
      totalActivities: itinerary.days.reduce((sum, day) => sum + day.activities.length, 0),
      transportation: 'Public transport recommended',
      weatherConsideration: 'Check local weather forecasts',
      timezone: 'Verify local timezone',
      currency: 'Confirm local currency and exchange rates'
    };
  }

  /**
   * Compile facts
   */
  async compileFacts(itinerary) {
    return {
      destination: itinerary.destination,
      verifiedActivities: itinerary.days.reduce((sum, day) => sum + day.activities.length, 0),
      factAccuracy: 95, // Simulated
      lastUpdated: new Date()
    };
  }

  /**
   * Calculate confidence score
   */
  calculateConfidence(issueAnalysis) {
    let confidence = 100;
    
    confidence -= issueAnalysis.criticalIssues.length * 20;
    confidence -= issueAnalysis.warnings.length * 5;
    
    return Math.max(0, confidence);
  }

  /**
   * Update accuracy rate
   */
  updateAccuracyRate(report) {
    const totalChecks = this.metrics.factsVerified + this.metrics.logisticsVerified;
    if (totalChecks > 0) {
      this.metrics.accuracyRate = ((this.metrics.factsVerified + this.metrics.logisticsVerified) / totalChecks) * 100;
    }
  }

  // Data persistence methods
  async storeResearchReport(report, project) {
    try {
      const dataDir = path.join('backend', 'data', 'research_reports');
      await fs.mkdir(dataDir, { recursive: true });
      
      const filename = `research_${project.id}.json`;
      const filepath = path.join(dataDir, filename);
      
      await fs.writeFile(filepath, JSON.stringify({ report, project }, null, 2));
      console.log(`💾 Research report stored: ${filename}`);
      
    } catch (error) {
      console.error('❌ Failed to store research report:', error);
    }
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
      data_sources_loaded: this.researchData.verifiedSources.size
    };
  }

  async getPerformanceMetrics() {
    return {
      facts_verified: this.metrics.factsVerified,
      booking_links_found: this.metrics.bookingLinksFound,
      logistics_verified: this.metrics.logisticsVerified,
      data_sources_checked: this.metrics.dataSourcesChecked,
      accuracy_rate: this.metrics.accuracyRate,
      active_projects: this.activeProjects.size,
      uptime: Date.now() - (this.startTime || Date.now())
    };
  }
}

module.exports = ZaraResearchSpecialist;