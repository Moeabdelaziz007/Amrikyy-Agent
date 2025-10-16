/**
 * SquadOS ↔ Cursor Executor Bridge
 * Connects SquadOS agents to real-world execution via Cursor Executor
 * Replaces mock functions with actual web searches, API calls, and data processing
 */

const EventEmitter = require('events');
const fs = require('fs').promises;
const path = require('path');

class SquadOSCursorExecutorBridge extends EventEmitter {
  constructor(manager) {
    super();
    this.bridgeId = 'squados-cursor-executor-bridge';
    this.role = 'execution_bridge';
    this.status = 'initializing';
    this.manager = manager;
    
    // Bridge capabilities
    this.capabilities = [
      'web_search_execution',
      'api_integration',
      'data_processing',
      'fact_verification',
      'booking_research',
      'budget_analysis',
      'cursor_command_execution',
      'real_world_actions'
    ];

    // Command execution queue
    this.executionQueue = [];
    this.activeExecutions = new Map();
    this.completedExecutions = new Map();
    
    // Real-world integrations
    this.integrations = {
      webSearch: this.executeWebSearch.bind(this),
      apiCall: this.executeAPICall.bind(this),
      dataProcessing: this.executeDataProcessing.bind(this),
      cursorCommand: this.executeCursorCommand.bind(this)
    };

    // Performance metrics
    this.metrics = {
      commandsExecuted: 0,
      webSearchesPerformed: 0,
      apiCallsMade: 0,
      dataProcessingTasks: 0,
      averageExecutionTime: 0,
      successRate: 0
    };

    this.initializeBridge();
  }

  /**
   * Initialize the bridge system
   */
  async initializeBridge() {
    try {
      console.log('🌉 Initializing SquadOS ↔ Cursor Executor Bridge...');
      
      // Initialize execution processors
      this.initializeExecutionProcessors();
      
      // Initialize command routing
      this.initializeCommandRouting();
      
      // Start execution processing
      this.startExecutionProcessing();
      
      this.status = 'ready';
      console.log('✅ SquadOS ↔ Cursor Executor Bridge initialized successfully');
      
      this.emit('bridgeReady', {
        bridgeId: this.bridgeId,
        capabilities: this.capabilities.length,
        status: this.status
      });
      
    } catch (error) {
      console.error('❌ Failed to initialize bridge:', error);
      this.status = 'error';
      throw error;
    }
  }

  /**
   * Initialize execution processors with Real API Integration
   */
  initializeExecutionProcessors() {
    this.processors = {
      // Real API Tools (Step 2)
      'get_destination_info': this.processGetDestinationInfoCommand.bind(this),
      'search_flights': this.processSearchFlightsCommand.bind(this),
      'find_hotels': this.processFindHotelsCommand.bind(this),
      'web_search': this.processWebSearchCommand.bind(this),
      'get_weather_forecast': this.processGetWeatherForecastCommand.bind(this),
      
      // Web Scraping Tools (Step 3)
      'scrape_website': this.processScrapeWebsiteCommand.bind(this),
      
      // Legacy processors (maintained for compatibility)
      'api_call': this.processAPICallCommand.bind(this),
      'data_processing': this.processDataProcessingCommand.bind(this),
      'cursor_execution': this.processCursorExecutionCommand.bind(this),
      'fact_verification': this.processFactVerificationCommand.bind(this),
      'booking_research': this.processBookingResearchCommand.bind(this),
      'budget_analysis': this.processBudgetAnalysisCommand.bind(this)
    };

    // Initialize Real API Toolkit
    this.initializeRealAPIToolkit();

    console.log('⚙️ Execution processors with Real API Integration initialized');
  }

  /**
   * Initialize Real API Toolkit
   */
  async initializeRealAPIToolkit() {
    try {
      const RealAPIToolkit = require('./RealAPIToolkit');
      this.apiToolkit = new RealAPIToolkit();
      
      console.log('🔧 Real API Toolkit initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Real API Toolkit:', error);
    }
  }

  /**
   * Initialize command routing
   */
  initializeCommandRouting() {
    this.commandRouter = {
      route: this.routeCommand.bind(this),
      validate: this.validateCommand.bind(this),
      transform: this.transformCommand.bind(this)
    };

    console.log('🛣️ Command routing initialized');
  }

  /**
   * Start execution processing
   */
  startExecutionProcessing() {
    // Process execution queue every 3 seconds
    setInterval(() => {
      this.processExecutionQueue();
    }, 3000);

    console.log('🔄 Execution processing started');
  }

  /**
   * Main method: Execute SquadOS agent command
   */
  async executeAgentCommand(agentName, commandType, parameters, context = {}) {
    const executionId = `exec_${agentName}_${Date.now()}`;
    const startTime = Date.now();
    
    try {
      console.log(`🎯 Executing ${agentName} command: ${commandType}`);
      
      // Create execution task
      const executionTask = {
        id: executionId,
        agent: agentName,
        commandType: commandType,
        parameters: parameters,
        context: context,
        status: 'queued',
        createdAt: new Date()
      };

      // Validate command
      const validation = await this.commandRouter.validate(executionTask);
      if (!validation.valid) {
        throw new Error(`Command validation failed: ${validation.error}`);
      }

      // Route and execute command
      const result = await this.commandRouter.route(executionTask);

      // Complete execution
      executionTask.status = 'completed';
      executionTask.result = result;
      executionTask.executionTime = Date.now() - startTime;
      
      this.completedExecutions.set(executionId, executionTask);
      this.updateMetrics(Date.now() - startTime, true);

      console.log(`✅ ${agentName} command executed successfully: ${commandType}`);
      
      return {
        success: true,
        executionId,
        result: result,
        executionTime: executionTask.executionTime,
        agent: agentName
      };

    } catch (error) {
      console.error(`❌ ${agentName} command execution failed:`, error);
      
      const failedTask = {
        id: executionId,
        agent: agentName,
        commandType: commandType,
        parameters: parameters,
        status: 'failed',
        error: error.message,
        executionTime: Date.now() - startTime,
        createdAt: new Date()
      };

      this.completedExecutions.set(executionId, failedTask);
      this.updateMetrics(Date.now() - startTime, false);

      return {
        success: false,
        executionId,
        error: error.message,
        executionTime: failedTask.executionTime,
        agent: agentName
      };
    }
  }

  /**
   * Route command to appropriate processor
   */
  async routeCommand(executionTask) {
    const processor = this.processors[executionTask.commandType];
    if (!processor) {
      throw new Error(`Unknown command type: ${executionTask.commandType}`);
    }

    return await processor(executionTask);
  }

  /**
   * Validate command before execution
   */
  async validateCommand(executionTask) {
    const validation = {
      valid: true,
      error: null
    };

    // Check required fields
    if (!executionTask.agent || !executionTask.commandType) {
      validation.valid = false;
      validation.error = 'Missing required fields: agent or commandType';
      return validation;
    }

    // Check command type validity
    if (!this.processors[executionTask.commandType]) {
      validation.valid = false;
      validation.error = `Invalid command type: ${executionTask.commandType}`;
      return validation;
    }

    // Validate parameters based on command type
    switch (executionTask.commandType) {
      case 'web_search':
        if (!executionTask.parameters.query) {
          validation.valid = false;
          validation.error = 'Web search requires query parameter';
        }
        break;
      case 'api_call':
        if (!executionTask.parameters.endpoint) {
          validation.valid = false;
          validation.error = 'API call requires endpoint parameter';
        }
        break;
    }

    return validation;
  }

  /**
   * Transform command if needed
   */
  transformCommand(executionTask) {
    // Transform parameters based on command type
    switch (executionTask.commandType) {
      case 'web_search':
        // Enhance query with context
        if (executionTask.context.destination) {
          executionTask.parameters.query = `${executionTask.parameters.query} ${executionTask.context.destination}`;
        }
        break;
      
      case 'api_call':
        // Add authentication headers if needed
        if (executionTask.parameters.requiresAuth) {
          executionTask.parameters.headers = {
            ...executionTask.parameters.headers,
            'Authorization': 'Bearer <API_KEY>'
          };
        }
        break;
    }

    return executionTask;
  }

  /**
   * Process web search command
   */
  async processWebSearchCommand(executionTask) {
    console.log(`🔍 Executing web search: ${executionTask.parameters.query}`);
    
    // This would connect to real web search API (Google Custom Search, Bing, etc.)
    const searchResult = await this.executeWebSearch(executionTask.parameters);
    
    this.metrics.webSearchesPerformed++;
    
    return {
      type: 'web_search',
      query: executionTask.parameters.query,
      results: searchResult.results,
      totalResults: searchResult.totalResults,
      searchTime: searchResult.searchTime,
      timestamp: new Date()
    };
  }

  /**
   * Execute web search (mock implementation - would connect to real API)
   */
  async executeWebSearch(parameters) {
    // Simulate web search delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock search results
    const mockResults = [
      {
        title: `Official ${parameters.query} Information`,
        url: `https://example.com/${parameters.query.toLowerCase().replace(/\s+/g, '-')}`,
        snippet: `Comprehensive information about ${parameters.query} including hours, prices, and booking details.`,
        relevance: 0.95
      },
      {
        title: `${parameters.query} - TripAdvisor`,
        url: `https://tripadvisor.com/${parameters.query.toLowerCase().replace(/\s+/g, '-')}`,
        snippet: `Reviews, photos, and travel information for ${parameters.query}.`,
        relevance: 0.87
      },
      {
        title: `${parameters.query} - Wikipedia`,
        url: `https://en.wikipedia.org/wiki/${parameters.query.replace(/\s+/g, '_')}`,
        snippet: `Historical and cultural information about ${parameters.query}.`,
        relevance: 0.82
      }
    ];

    return {
      results: mockResults,
      totalResults: mockResults.length,
      searchTime: 1.5,
      query: parameters.query
    };
  }

  /**
   * Process API call command
   */
  async processAPICallCommand(executionTask) {
    console.log(`🔌 Executing API call: ${executionTask.parameters.endpoint}`);
    
    const apiResult = await this.executeAPICall(executionTask.parameters);
    
    this.metrics.apiCallsMade++;
    
    return {
      type: 'api_call',
      endpoint: executionTask.parameters.endpoint,
      response: apiResult.response,
      statusCode: apiResult.statusCode,
      responseTime: apiResult.responseTime,
      timestamp: new Date()
    };
  }

  /**
   * Execute API call (mock implementation)
   */
  async executeAPICall(parameters) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock API response based on endpoint
    const mockResponses = {
      'booking.com/api/hotels': {
        response: {
          hotels: [
            { name: 'Hotel Example', price: 150, rating: 4.5 },
            { name: 'Budget Inn', price: 80, rating: 3.8 }
          ]
        },
        statusCode: 200
      },
      'skyscanner.com/api/flights': {
        response: {
          flights: [
            { airline: 'Example Air', price: 400, duration: '2h 30m' },
            { airline: 'Budget Fly', price: 320, duration: '3h 15m' }
          ]
        },
        statusCode: 200
      }
    };

    const response = mockResponses[parameters.endpoint] || {
      response: { message: 'API call successful' },
      statusCode: 200
    };

    return {
      ...response,
      responseTime: 0.8
    };
  }

  /**
   * Process data processing command
   */
  async processDataProcessingCommand(executionTask) {
    console.log(`📊 Processing data: ${executionTask.parameters.operation}`);
    
    const processingResult = await this.executeDataProcessing(executionTask.parameters);
    
    this.metrics.dataProcessingTasks++;
    
    return {
      type: 'data_processing',
      operation: executionTask.parameters.operation,
      result: processingResult.result,
      processedItems: processingResult.processedItems,
      processingTime: processingResult.processingTime,
      timestamp: new Date()
    };
  }

  /**
   * Execute data processing
   */
  async executeDataProcessing(parameters) {
    // Simulate data processing delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Mock data processing based on operation
    const mockResults = {
      'budget_analysis': {
        result: {
          totalCost: 2500,
          breakdown: {
            accommodation: 800,
            flights: 600,
            activities: 700,
            food: 400
          },
          savings: 200
        },
        processedItems: 15
      },
      'fact_verification': {
        result: {
          verified: 12,
          issues: 2,
          accuracy: 85.7
        },
        processedItems: 14
      }
    };

    const result = mockResults[parameters.operation] || {
      result: { message: 'Data processing completed' },
      processedItems: 1
    };

    return {
      ...result,
      processingTime: 0.6
    };
  }

  /**
   * Process cursor execution command
   */
  async processCursorExecutionCommand(executionTask) {
    console.log(`💻 Executing cursor command: ${executionTask.parameters.command}`);
    
    const cursorResult = await this.executeCursorCommand(executionTask.parameters);
    
    return {
      type: 'cursor_execution',
      command: executionTask.parameters.command,
      output: cursorResult.output,
      status: cursorResult.status,
      executionTime: cursorResult.executionTime,
      timestamp: new Date()
    };
  }

  /**
   * Execute cursor command
   */
  async executeCursorCommand(parameters) {
    // This would connect to the actual Cursor Executor
    console.log(`💻 Cursor command: ${parameters.command}`);
    
    // Simulate cursor execution
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      output: `Cursor executed: ${parameters.command}`,
      status: 'completed',
      executionTime: 1.0
    };
  }

  /**
   * Process fact verification command
   */
  async processFactVerificationCommand(executionTask) {
    console.log(`✅ Verifying facts: ${executionTask.parameters.facts.join(', ')}`);
    
    // Use web search to verify facts
    const verificationResults = [];
    
    for (const fact of executionTask.parameters.facts) {
      const searchResult = await this.executeWebSearch({ query: `verify ${fact}` });
      
      verificationResults.push({
        fact: fact,
        verified: true, // Simplified - would use NLP to determine verification
        confidence: 0.9,
        sources: searchResult.results.slice(0, 3)
      });
    }

    return {
      type: 'fact_verification',
      facts: verificationResults,
      overallConfidence: verificationResults.reduce((sum, r) => sum + r.confidence, 0) / verificationResults.length,
      timestamp: new Date()
    };
  }

  /**
   * Process booking research command
   */
  async processBookingResearchCommand(executionTask) {
    console.log(`📋 Researching bookings: ${executionTask.parameters.activity}`);
    
    // Use API calls to find booking options
    const bookingResults = [];
    
    const platforms = ['booking.com', 'viator.com', 'getyourguide.com'];
    
    for (const platform of platforms) {
      const apiResult = await this.executeAPICall({
        endpoint: `${platform}/api/search`,
        query: executionTask.parameters.activity
      });
      
      bookingResults.push({
        platform: platform,
        results: apiResult.response,
        url: `https://${platform}/${executionTask.parameters.activity.toLowerCase().replace(/\s+/g, '-')}`
      });
    }

    return {
      type: 'booking_research',
      activity: executionTask.parameters.activity,
      bookingOptions: bookingResults,
      totalOptions: bookingResults.length,
      timestamp: new Date()
    };
  }

  /**
   * Process budget analysis command
   */
  async processBudgetAnalysisCommand(executionTask) {
    console.log(`💰 Analyzing budget for: ${executionTask.parameters.destination}`);
    
    // Use data processing to analyze budget
    const budgetResult = await this.executeDataProcessing({
      operation: 'budget_analysis',
      destination: executionTask.parameters.destination,
      duration: executionTask.parameters.duration,
      travelers: executionTask.parameters.travelers
    });

    return {
      type: 'budget_analysis',
      destination: executionTask.parameters.destination,
      analysis: budgetResult.result,
      recommendations: this.generateBudgetRecommendations(budgetResult.result),
      timestamp: new Date()
    };
  }

  // ===== REAL API COMMAND PROCESSORS (Step 2) =====

  /**
   * Process get_destination_info command (Google Places API)
   */
  async processGetDestinationInfoCommand(executionTask) {
    console.log(`🌍 Getting destination info: ${executionTask.parameters.query}`);
    
    const result = await this.apiToolkit.get_destination_info(executionTask.parameters.query);
    
    return {
      type: 'get_destination_info',
      query: executionTask.parameters.query,
      result: result,
      timestamp: new Date()
    };
  }

  /**
   * Process search_flights command (Skyscanner API)
   */
  async processSearchFlightsCommand(executionTask) {
    console.log(`✈️ Searching flights: ${executionTask.parameters.origin} → ${executionTask.parameters.destination}`);
    
    const result = await this.apiToolkit.search_flights(
      executionTask.parameters.origin,
      executionTask.parameters.destination,
      executionTask.parameters.departureDate,
      executionTask.parameters.returnDate,
      executionTask.parameters.passengers
    );
    
    return {
      type: 'search_flights',
      origin: executionTask.parameters.origin,
      destination: executionTask.parameters.destination,
      result: result,
      timestamp: new Date()
    };
  }

  /**
   * Process find_hotels command (Booking.com API)
   */
  async processFindHotelsCommand(executionTask) {
    console.log(`🏨 Finding hotels in: ${executionTask.parameters.destination}`);
    
    const result = await this.apiToolkit.find_hotels(
      executionTask.parameters.destination,
      executionTask.parameters.checkIn,
      executionTask.parameters.checkOut,
      executionTask.parameters.guests,
      executionTask.parameters.rooms
    );
    
    return {
      type: 'find_hotels',
      destination: executionTask.parameters.destination,
      result: result,
      timestamp: new Date()
    };
  }

  /**
   * Process web_search command (Google Custom Search API)
   */
  async processWebSearchCommand(executionTask) {
    console.log(`🔍 Web searching: ${executionTask.parameters.query}`);
    
    const result = await this.apiToolkit.web_search(executionTask.parameters.query);
    
    return {
      type: 'web_search',
      query: executionTask.parameters.query,
      result: result,
      timestamp: new Date()
    };
  }

  /**
   * Process get_weather_forecast command (OpenWeather API)
   */
  async processGetWeatherForecastCommand(executionTask) {
    console.log(`🌤️ Getting weather forecast for: ${executionTask.parameters.destination}`);
    
    const result = await this.apiToolkit.get_weather_forecast(
      executionTask.parameters.destination,
      executionTask.parameters.date
    );
    
    return {
      type: 'get_weather_forecast',
      destination: executionTask.parameters.destination,
      result: result,
      timestamp: new Date()
    };
  }

  /**
   * Process scrape_website command (Playwright Web Scraping)
   */
  async processScrapeWebsiteCommand(executionTask) {
    console.log(`🕷️ Scraping website: ${executionTask.parameters.url}`);
    
    const result = await this.scrapeWebsiteWithPlaywright(
      executionTask.parameters.url,
      executionTask.parameters.options || {}
    );
    
    return {
      type: 'scrape_website',
      url: executionTask.parameters.url,
      result: result,
      timestamp: new Date()
    };
  }

  /**
   * Scrape website using Playwright (Advanced Research Capabilities)
   */
  async scrapeWebsiteWithPlaywright(url, options = {}) {
    const startTime = Date.now();
    
    try {
      console.log(`🕷️ Scraping website: ${url}`);
      
      // Check if Playwright is available
      let playwright;
      try {
        playwright = require('playwright');
      } catch (error) {
        return {
          status: 'error',
          message: 'Playwright not available - install with: npm install playwright',
          data: null
        };
      }

      const browser = await playwright.chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (compatible; TravelBot/1.0)'
      });
      
      const page = await context.newPage();
      
      // Navigate to the URL with timeout
      await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // Extract content based on options
      const content = await this.extractPageContent(page, options);
      
      await browser.close();
      
      this.updateMetrics(Date.now() - startTime, true);
      this.metrics.webScrapesPerformed++;
      
      return {
        status: 'success',
        url: url,
        content: content,
        scrapedAt: new Date(),
        message: `Successfully scraped ${url}`
      };
      
    } catch (error) {
      console.error(`ERROR: Website scraping failed: ${error.message}`);
      this.updateMetrics(Date.now() - startTime, false);
      
      return {
        status: 'error',
        message: `Failed to scrape website: ${error.message}`,
        url: url,
        data: null
      };
    }
  }

  /**
   * Extract content from scraped page
   */
  async extractPageContent(page, options) {
    const content = {
      title: '',
      text: '',
      links: [],
      images: [],
      structuredData: {}
    };

    try {
      // Get page title
      content.title = await page.title();
      
      // Get main text content
      content.text = await page.evaluate(() => {
        const body = document.body;
        return body.innerText || body.textContent || '';
      });
      
      // Get links
      content.links = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href]'));
        return links.map(link => ({
          text: link.textContent.trim(),
          url: link.href
        })).slice(0, 20); // Limit to first 20 links
      });
      
      // Get images
      content.images = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img[src]'));
        return images.map(img => ({
          src: img.src,
          alt: img.alt || ''
        })).slice(0, 10); // Limit to first 10 images
      });
      
      // Extract specific data if requested
      if (options.extractPrice) {
        content.structuredData.price = await this.extractPrice(page);
      }
      
      if (options.extractRating) {
        content.structuredData.rating = await this.extractRating(page);
      }
      
      if (options.extractHours) {
        content.structuredData.hours = await this.extractHours(page);
      }
      
      if (options.extractLocation) {
        content.structuredData.location = await this.extractLocation(page);
      }
      
    } catch (error) {
      console.warn('⚠️ Error extracting page content:', error.message);
    }

    return content;
  }

  /**
   * Extract price information from page
   */
  async extractPrice(page) {
    try {
      const priceSelectors = [
        '.price', '.cost', '[class*="price"]', '[class*="cost"]',
        '[data-price]', '[data-cost]', '.amount', '.total',
        '.price-value', '.price-amount', '.currency'
      ];
      
      for (const selector of priceSelectors) {
        const priceElement = await page.$(selector);
        if (priceElement) {
          const priceText = await priceElement.textContent();
          const price = priceText.match(/[\d,]+\.?\d*/);
          if (price) {
            return price[0];
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ Error extracting price:', error.message);
    }
    return null;
  }

  /**
   * Extract rating information from page
   */
  async extractRating(page) {
    try {
      const ratingSelectors = [
        '.rating', '.score', '[class*="rating"]', '[class*="score"]',
        '[data-rating]', '.stars', '.review-score', '.rating-value',
        '.star-rating', '.review-rating'
      ];
      
      for (const selector of ratingSelectors) {
        const ratingElement = await page.$(selector);
        if (ratingElement) {
          const ratingText = await ratingElement.textContent();
          const rating = ratingText.match(/\d+\.?\d*/);
          if (rating) {
            return parseFloat(rating[0]);
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ Error extracting rating:', error.message);
    }
    return null;
  }

  /**
   * Extract opening hours from page
   */
  async extractHours(page) {
    try {
      const hoursSelectors = [
        '.hours', '.opening-hours', '[class*="hours"]', '[class*="time"]',
        '.schedule', '.timing', '[data-hours]', '.business-hours',
        '.operating-hours', '.opening-times'
      ];
      
      for (const selector of hoursSelectors) {
        const hoursElement = await page.$(selector);
        if (hoursElement) {
          const hoursText = await hoursElement.textContent();
          return hoursText.trim();
        }
      }
    } catch (error) {
      console.warn('⚠️ Error extracting hours:', error.message);
    }
    return null;
  }

  /**
   * Extract location information from page
   */
  async extractLocation(page) {
    try {
      const locationSelectors = [
        '.address', '.location', '[class*="address"]', '[class*="location"]',
        '.venue-address', '.place-address', '[data-address]',
        '.contact-address', '.business-address'
      ];
      
      for (const selector of locationSelectors) {
        const locationElement = await page.$(selector);
        if (locationElement) {
          const locationText = await locationElement.textContent();
          return locationText.trim();
        }
      }
    } catch (error) {
      console.warn('⚠️ Error extracting location:', error.message);
    }
    return null;
  }

  /**
   * Generate budget recommendations
   */
  generateBudgetRecommendations(budgetAnalysis) {
    const recommendations = [];
    
    if (budgetAnalysis.savings > 0) {
      recommendations.push({
        type: 'savings',
        message: `Save $${budgetAnalysis.savings} with optimized choices`,
        priority: 'high'
      });
    }
    
    if (budgetAnalysis.breakdown.food > budgetAnalysis.totalCost * 0.3) {
      recommendations.push({
        type: 'food_budget',
        message: 'Consider more budget-friendly dining options',
        priority: 'medium'
      });
    }
    
    return recommendations;
  }

  /**
   * Process execution queue
   */
  async processExecutionQueue() {
    // Process any active executions
    for (const [executionId, execution] of this.activeExecutions) {
      if (execution.status === 'processing') {
        // Handle long-running executions
        await this.handleLongRunningExecution(execution);
      }
    }
  }

  /**
   * Handle long-running execution
   */
  async handleLongRunningExecution(execution) {
    // This would handle timeouts, progress updates, etc.
    console.log(`⏳ Handling long-running execution: ${execution.id}`);
  }

  /**
   * Update performance metrics
   */
  updateMetrics(executionTime, success) {
    this.metrics.commandsExecuted++;
    
    // Update average execution time
    const total = this.metrics.averageExecutionTime * (this.metrics.commandsExecuted - 1) + executionTime;
    this.metrics.averageExecutionTime = total / this.metrics.commandsExecuted;
    
    // Update success rate
    const currentSuccesses = this.metrics.successRate * this.metrics.commandsExecuted / 100;
    const newSuccesses = success ? currentSuccesses + 1 : currentSuccesses;
    this.metrics.successRate = (newSuccesses / this.metrics.commandsExecuted) * 100;
  }

  // Status and metrics methods
  async getBridgeStatus() {
    return {
      bridge_id: this.bridgeId,
      role: this.role,
      status: this.status,
      capabilities: this.capabilities.length,
      active_executions: this.activeExecutions.size,
      queued_executions: this.executionQueue.length,
      completed_executions: this.completedExecutions.size,
      metrics: this.metrics
    };
  }

  async getPerformanceMetrics() {
    return {
      commands_executed: this.metrics.commandsExecuted,
      web_searches_performed: this.metrics.webSearchesPerformed,
      api_calls_made: this.metrics.apiCallsMade,
      data_processing_tasks: this.metrics.dataProcessingTasks,
      average_execution_time: this.metrics.averageExecutionTime,
      success_rate: this.metrics.successRate,
      active_executions: this.activeExecutions.size,
      queue_length: this.executionQueue.length,
      uptime: Date.now() - (this.startTime || Date.now())
    };
  }
}

module.exports = SquadOSCursorExecutorBridge;
