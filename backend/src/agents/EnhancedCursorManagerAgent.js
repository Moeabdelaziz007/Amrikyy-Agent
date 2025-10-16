/**
 * Enhanced Cursor Manager Agent with Quantum Edge Layer Integration
 * Combines all advanced features: Bottleneck, Circuit Breakers, Prometheus, OpenTelemetry
 */

const EventEmitter = require('events');
const winston = require('winston');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { z } = require('zod');

// Import all advanced components
const QuantumEdgeLayer = require('./QuantumEdgeLayer');
const PrometheusMetrics = require('../monitoring/PrometheusMetrics');
const OpenTelemetryTracing = require('../monitoring/OpenTelemetryTracing');
const CursorVoiceAgent = require('./CursorVoiceAgent');
const MemoryManager = require('./MemoryManager');
const ProactiveScoutAgent = require('./ProactiveScoutAgent');

// Import existing components
const { EvolveManagerDashboard } = require('./evolve/EvolveManagerDashboard');
const { EnhancedPatternLearningEngineWithJournal } = require('./evolve/EnhancedPatternLearningEngineWithJournal');
const { MayaVoiceAgents } = require('./MayaVoiceAgents');
const { MCPJournalClient } = require('../mcp/MCPJournalClient');
const { PatternJournalAdapter } = require('../mcp/PatternJournalAdapter');
const { JournalDataMonitor } = require('../mcp/JournalDataMonitor');

class EnhancedCursorManagerAgent extends EventEmitter {
  constructor(config = {}) {
    super();

    this.agent_id = "enhanced-cursor-manager";
    this.managed_by = "cursor-master";
    this.role = "advanced_manager";
    this.version = "2.0.0";
    this.status = 'initializing';

    // Enhanced configuration
    this.config = {
      maxConcurrentTasks: config.maxConcurrentTasks || 10,
      taskTimeout: config.taskTimeout || 30000,
      monitoringInterval: config.monitoringInterval || 5000,
      dataRetentionDays: config.dataRetentionDays || 90,
      patternLearningEnabled: config.patternLearningEnabled !== false,
      autoOptimizationEnabled: config.autoOptimizationEnabled !== false,
      voiceEnabled: config.voiceEnabled !== false,
      prometheusEnabled: config.prometheusEnabled !== false,
      tracingEnabled: config.tracingEnabled !== false,
      quantumEdgeEnabled: config.quantumEdgeEnabled !== false,
      memoryEnabled: config.memoryEnabled !== false,
      scoutEnabled: config.scoutEnabled !== false,
      ...config
    };

    // Initialize start time for uptime calculation
    this.startTime = Date.now();
    
    // Store interval IDs for cleanup
    this.monitoringIntervals = new Set();

    // Unify log directory and ensure it exists
    const LOG_DIR = path.join('backend', 'logs');
    if (!fsSync.existsSync(LOG_DIR)) {
      fsSync.mkdirSync(LOG_DIR, { recursive: true });
    }

    // Enhanced logger setup
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: path.join(LOG_DIR, 'enhanced-cursor-manager.log') }),
        new winston.transports.Console()
      ]
    });

    // Initialize advanced components
    this.quantumEdgeLayer = null;
    this.prometheusMetrics = null;
    this.tracing = null;
    this.voiceAgent = null;
    this.memoryManager = null;
    this.scoutAgent = null;

    // Core components
    this.registeredAgents = new Map();
    this.activeTasks = new Map();
    this.taskHistory = [];
    this.patternEngine = null;
    this.dashboard = null;
    this.healthMonitor = null;

    // Enhanced metrics
    this.metrics = {
      requestsProcessed: 0,
      requestsSucceeded: 0,
      requestsFailed: 0,
      averageResponseTime: 0,
      agentUtilization: new Map(),
      lastRequestTime: null,
      uptime: () => Date.now() - this.startTime,
      quantumEdgeMetrics: null,
      prometheusMetrics: null,
      tracingMetrics: null
    };

    // Enhanced validation schemas
    this.setupValidationSchemas();

    this.logger.info('🚀 Enhanced Cursor Manager Agent initialized', { 
      version: this.version,
      config: this.config 
    });
  }

  /**
   * Setup enhanced validation schemas
   */
  setupValidationSchemas() {
    this.requestSchema = z.object({
      message: z.string().min(1).max(10000),
      userId: z.string().min(1).max(100).optional(),
      context: z.object({
        source: z.enum(['voice', 'api', 'cli', 'dashboard']).optional(),
        sessionId: z.string().optional(),
        language: z.string().optional(),
        priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
        timeout: z.number().min(1000).max(300000).default(30000),
        retries: z.number().min(0).max(5).default(3)
      }).optional(),
      correlationId: z.string().uuid().optional()
    });

    this.agentRegistrationSchema = z.object({
      name: z.string().min(1).max(100),
      capabilities: z.array(z.string()).min(1),
      handler: z.function(),
      status: z.enum(['available', 'busy', 'offline']).default('available'),
      maxConcurrency: z.number().min(1).max(10).default(1),
      circuitBreakerThreshold: z.number().min(1).max(10).default(3),
      circuitBreakerTimeout: z.number().min(1000).max(60000).default(30000),
      metadata: z.object({
        version: z.string().optional(),
        description: z.string().optional(),
        author: z.string().optional()
      }).optional()
    });

    this.voiceSessionSchema = z.object({
      userId: z.string().min(1).max(100),
      sessionConfig: z.object({
        language: z.string().default('en'),
        voiceQuality: z.enum(['low', 'medium', 'high']).default('high'),
        echoCancellation: z.boolean().default(true),
        noiseSuppression: z.boolean().default(true),
        maxSessionDuration: z.number().min(30000).max(600000).default(300000)
      }).optional()
    });
  }

  /**
   * Initialize all advanced components
   */
  async initialize() {
    this.logger.info('🚀 Initializing Enhanced Cursor Manager Agent...');
    this.status = 'initializing';

    try {
      // Setup data directories
      await this.setupDataDirectories();

      // Initialize Quantum Edge Layer
      if (this.config.quantumEdgeEnabled) {
        this.quantumEdgeLayer = new QuantumEdgeLayer({
          maxConcurrent: this.config.maxConcurrentTasks,
          minTime: 100,
          highWater: 100
        });
        this.logger.info('✅ Quantum Edge Layer initialized');
      }

      // Initialize Prometheus Metrics
      if (this.config.prometheusEnabled) {
        this.prometheusMetrics = new PrometheusMetrics({
          port: 9090,
          endpoint: '/metrics'
        });
        this.prometheusMetrics.startPeriodicCollection();
        this.logger.info('✅ Prometheus Metrics initialized');
      }

      // Initialize OpenTelemetry Tracing
      if (this.config.tracingEnabled) {
        this.tracing = new OpenTelemetryTracing({
          serviceName: 'enhanced-cursor-manager',
          serviceVersion: this.version,
          environment: process.env.NODE_ENV || 'development'
        });
        await this.tracing.initialize();
        this.logger.info('✅ OpenTelemetry Tracing initialized');
      }

      // Initialize Voice Agent
      if (this.config.voiceEnabled) {
        this.voiceAgent = new CursorVoiceAgent(this);
        this.logger.info('✅ Voice Agent initialized');
      }

      // Initialize Memory Manager
      if (this.config.memoryEnabled) {
        this.memoryManager = new MemoryManager({
          chromaHost: process.env.CHROMA_HOST || 'localhost',
          chromaPort: process.env.CHROMA_PORT || 8000,
          collectionName: 'amrikyy_knowledge_base'
        });
        await this.memoryManager.initialize();
        this.logger.info('✅ Memory Manager initialized');
      }

      // Initialize Proactive Scout Agent
      if (this.config.scoutEnabled) {
        this.scoutAgent = new ProactiveScoutAgent(this);
        await this.scoutAgent.initialize();
        this.logger.info('✅ Proactive Scout Agent initialized');
      }

      // Initialize Pattern Learning Engine
      if (this.config.patternLearningEnabled) {
        this.patternEngine = new EnhancedPatternLearningEngineWithJournal();
        await this.patternEngine.initialize();
        this.logger.info('✅ Pattern Learning Engine initialized');
      }

      // Initialize Dashboard
      this.dashboard = new EvolveManagerDashboard();
      this.dashboard.start();
      this.logger.info('✅ Dashboard started');

      // Initialize Health Monitor
      this.healthMonitor = new CursorHealthMonitor(this);
      this.healthMonitor.start();
      this.logger.info('✅ Health monitor started');

      // Start system monitoring
      this.startSystemMonitoring();

      this.status = 'active';
      this.logger.info('🎉 Enhanced Cursor Manager Agent initialized successfully');
      this.emit('manager_initialized', { 
        agent_id: this.agent_id, 
        version: this.version,
        status: this.status 
      });

    } catch (error) {
      this.logger.error('❌ Failed to initialize Enhanced Cursor Manager Agent', error);
      this.status = 'error';
      this.emit('manager_error', { error: error.message });
      throw error;
    }
  }

  /**
   * Enhanced request processing with all advanced features
   */
  async processRequest(request, userId = 'anonymous', context = {}) {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    const correlationId = this.tracing ? this.tracing.createCorrelationId() : null;
    
    // Validate request
    const { error: validationError, value: validatedRequest } = this.requestSchema.validate({
      message: request,
      userId,
      context: { ...context, correlationId },
      correlationId
    });

    if (validationError) {
      this.logger.error('Request validation failed', { requestId, error: validationError.details });
      this.metrics.requestsFailed++;
      
      if (this.prometheusMetrics) {
        this.prometheusMetrics.recordError('validation_error', 'enhanced-cursor-manager', 'error');
      }
      
      return {
        success: false,
        requestId,
        error: `Validation failed: ${validationError.details[0].message}`
      };
    }

    // Create tracing span
    const span = this.tracing ? this.tracing.createRequestSpan('process-request', {
      'request.id': requestId,
      'user.id': userId,
      'correlation.id': correlationId,
      'request.priority': validatedRequest.context?.priority || 'normal'
    }) : null;

    this.logger.info('Processing enhanced request', { 
      requestId, 
      userId, 
      message: validatedRequest.message.substring(0, 100),
      correlationId 
    });
    
    this.emit('request_received', { requestId, userId, request: validatedRequest.message, context });

    try {
      // Add correlation ID to span
      if (span && correlationId) {
        this.tracing.addCorrelationId(span, correlationId);
      }

      // Process with Quantum Edge Layer if enabled
      let result;
      if (this.quantumEdgeLayer && this.config.quantumEdgeEnabled) {
        result = await this.quantumEdgeLayer.executeTask(
          'enhanced-cursor-manager',
          {
            taskType: 'request_processing',
            payload: {
              message: validatedRequest.message,
              userId: validatedRequest.userId,
              context: validatedRequest.context
            },
            requestId,
            priority: validatedRequest.context?.priority || 'normal',
            timeout: validatedRequest.context?.timeout || this.config.taskTimeout,
            retries: validatedRequest.context?.retries || 3
          }
        );
      } else {
        // Fallback to standard processing
        result = await this.executeRequestStandard(requestId, validatedRequest, userId, context);
      }

      // Update metrics
      const responseTime = Date.now() - startTime;
      this.updateMetrics(true, responseTime);

      // Record Prometheus metrics
      if (this.prometheusMetrics) {
        this.prometheusMetrics.recordRequest(
          'POST',
          'success',
          'enhanced-cursor-manager',
          validatedRequest.context?.priority || 'normal',
          responseTime
        );
      }

      // Store execution data asynchronously
      this.storeExecutionData(requestId, validatedRequest.message, result.analysis, result, validatedRequest.userId, {
        correlationId,
        responseTime,
        quantumEdgeEnabled: this.config.quantumEdgeEnabled
      }).catch(error => {
        this.logger.error('Failed to store execution data', { requestId, error: error.message });
      });

      // Notify Scout Agent of conversation for interest tracking
      this.notifyScoutOfConversation(validatedRequest.userId, validatedRequest.message, {
        source: validatedRequest.context?.source || 'api',
        sessionId: validatedRequest.context?.sessionId,
        correlationId
      }).catch(error => {
        this.logger.error('Failed to notify Scout Agent', { requestId, error: error.message });
      });

      this.logger.info('Enhanced request completed successfully', { 
        requestId, 
        userId, 
        responseTime,
        correlationId 
      });
      
      this.emit('request_completed', { requestId, userId, result, correlationId });

      if (span) {
        span.setStatus({ code: 1 }); // OK
        span.end();
      }

      return {
        success: true,
        requestId,
        result,
        responseTime,
        correlationId
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.updateMetrics(false, responseTime);
      
      this.logger.error('Enhanced request failed', { 
        requestId, 
        userId, 
        error: error.message, 
        responseTime,
        correlationId 
      });
      
      this.emit('request_failed', { requestId, userId, error: error.message, correlationId });

      // Record Prometheus metrics for failure
      if (this.prometheusMetrics) {
        this.prometheusMetrics.recordRequest(
          'POST',
          'error',
          'enhanced-cursor-manager',
          validatedRequest.context?.priority || 'normal',
          responseTime
        );
        this.prometheusMetrics.recordError('request_processing_error', 'enhanced-cursor-manager', 'error');
      }

      if (span) {
        span.setStatus({ code: 2, message: error.message }); // ERROR
        span.recordException(error);
        span.end();
      }

      return {
        success: false,
        requestId,
        error: error.message,
        responseTime,
        correlationId
      };
    }
  }

  /**
   * Enhanced agent registration with Quantum Edge Layer
   */
  registerAgent(id, agent) {
    // Validate agent data
    const { error, value } = this.agentRegistrationSchema.validate(agent);
    if (error) {
      this.logger.error(`Invalid agent data for ${id}:`, error.details);
      throw new Error(`Agent validation failed: ${error.details[0].message}`);
    }

    const sanitizedId = this.sanitizeAgentId(id);
    
    if (this.registeredAgents.has(sanitizedId)) {
      this.logger.warn(`Agent with ID ${sanitizedId} already registered. Overwriting.`);
    }

    // Register with Quantum Edge Layer if enabled
    if (this.quantumEdgeLayer) {
      this.quantumEdgeLayer.registerAgent({
        id: sanitizedId,
        name: value.name,
        capabilities: value.capabilities,
        handler: value.handler,
        maxConcurrency: value.maxConcurrency,
        circuitBreakerThreshold: value.circuitBreakerThreshold,
        circuitBreakerTimeout: value.circuitBreakerTimeout
      });
    }

    // Add performance tracking
    this.metrics.agentUtilization.set(sanitizedId, {
      tasksAssigned: 0,
      tasksCompleted: 0,
      tasksFailed: 0,
      averageExecutionTime: 0,
      lastUsed: null,
      metadata: value.metadata || {}
    });

    this.registeredAgents.set(sanitizedId, value);
    this.logger.info(`Enhanced agent registered: ${sanitizedId}`, { 
      capabilities: value.capabilities,
      maxConcurrency: value.maxConcurrency,
      circuitBreakerThreshold: value.circuitBreakerThreshold
    });
    
    this.emit('agent_registered', { agent_id: sanitizedId, name: value.name });
  }

  /**
   * Voice session management
   */
  async startVoiceSession(userId, sessionConfig = {}) {
    if (!this.voiceAgent) {
      throw new Error('Voice agent not initialized');
    }

    const { error, value } = this.voiceSessionSchema.validate({
      userId,
      sessionConfig
    });

    if (error) {
      throw new Error(`Voice session validation failed: ${error.details[0].message}`);
    }

    return await this.voiceAgent.startVoiceSession(value.userId, value.sessionConfig);
  }

  /**
   * Memory Management - MEMORIZE_TRIP functionality
   */
  async memorizeTrip(tripData) {
    if (!this.memoryManager) {
      this.logger.warn('⚠️ Memory Manager not initialized, skipping trip memorization');
      return { success: false, error: 'Memory Manager not available' };
    }

    try {
      this.logger.info('🧠 Memorizing trip data...', { 
        destination: tripData.destination,
        userId: tripData.userId 
      });

      const memories = await this.extractMemoriesFromTrip(tripData);
      const results = [];

      for (const memory of memories) {
        const result = await this.memoryManager.addMemory(memory);
        results.push(result);
      }

      this.logger.info('✅ Trip memorized successfully', { 
        memoriesCreated: results.length,
        destination: tripData.destination 
      });

      this.emit('trip_memorized', {
        tripId: tripData.id,
        destination: tripData.destination,
        memoriesCreated: results.length
      });

      return {
        success: true,
        memoriesCreated: results.length,
        results
      };

    } catch (error) {
      this.logger.error('❌ Failed to memorize trip:', error);
      throw error;
    }
  }

  /**
   * Extract memories from trip data
   */
  async extractMemoriesFromTrip(tripData) {
    const memories = [];
    const timestamp = new Date().toISOString();

    // Trip overview memory
    memories.push({
      id: `trip_${tripData.id}_overview`,
      type: 'trip',
      content: `Trip to ${tripData.destination} for ${tripData.duration} days with budget ${tripData.budget}. ${tripData.summary || 'No summary provided.'}`,
      metadata: {
        agent_source: 'enhanced_cursor_manager',
        timestamp,
        destination: tripData.destination,
        duration: tripData.duration,
        budget: tripData.budget,
        user_id: tripData.userId,
        trip_id: tripData.id,
        memory_type: 'trip_overview'
      }
    });

    // Itinerary memories
    if (tripData.itinerary && tripData.itinerary.days) {
      for (const day of tripData.itinerary.days) {
        memories.push({
          id: `trip_${tripData.id}_day_${day.day}`,
          type: 'trip',
          content: `Day ${day.day} in ${tripData.destination}: ${day.theme}. Activities: ${day.activities.map(a => a.name).join(', ')}. Meals: ${day.meals.map(m => m.name).join(', ')}.`,
          metadata: {
            agent_source: 'luna_trip_architect',
            timestamp,
            destination: tripData.destination,
            day: day.day,
            theme: day.theme,
            user_id: tripData.userId,
            trip_id: tripData.id,
            memory_type: 'daily_itinerary'
          }
        });
      }
    }

    // Destination research memories
    if (tripData.destinationData) {
      memories.push({
        id: `destination_${tripData.destination}_research`,
        type: 'destination',
        content: `Research for ${tripData.destination}: Best seasons: ${tripData.destinationData.bestSeasons?.join(', ') || 'N/A'}. Cultural highlights: ${tripData.destinationData.culturalHighlights?.join(', ') || 'N/A'}. Must visit: ${tripData.destinationData.mustVisit?.join(', ') || 'N/A'}.`,
        metadata: {
          agent_source: 'luna_trip_architect',
          timestamp,
          destination: tripData.destination,
          user_id: tripData.userId,
          trip_id: tripData.id,
          memory_type: 'destination_research'
        }
      });
    }

    // Cultural insights memories
    if (tripData.culturalInsights) {
      memories.push({
        id: `cultural_${tripData.destination}_insights`,
        type: 'cultural',
        content: `Cultural insights for ${tripData.destination}: Etiquette: ${tripData.culturalInsights.etiquette?.join(', ') || 'N/A'}. Food culture: ${tripData.culturalInsights.foodCulture?.join(', ') || 'N/A'}. Language tips: ${tripData.culturalInsights.languageTips?.join(', ') || 'N/A'}.`,
        metadata: {
          agent_source: 'luna_trip_architect',
          timestamp,
          destination: tripData.destination,
          user_id: tripData.userId,
          trip_id: tripData.id,
          memory_type: 'cultural_insights'
        }
      });
    }

    // Budget analysis memories
    if (tripData.budgetAnalysis) {
      memories.push({
        id: `budget_${tripData.destination}_analysis`,
        type: 'budget',
        content: `Budget analysis for ${tripData.destination}: Total estimated cost: ${tripData.budgetAnalysis.estimatedTotal}. Per day: ${tripData.budgetAnalysis.perDay}. Breakdown: Accommodation ${tripData.budgetAnalysis.breakdown?.accommodation}, Food ${tripData.budgetAnalysis.breakdown?.food}, Activities ${tripData.budgetAnalysis.breakdown?.activities}, Transportation ${tripData.budgetAnalysis.breakdown?.transportation}.`,
        metadata: {
          agent_source: 'karim_budget_optimizer',
          timestamp,
          destination: tripData.destination,
          budget_level: tripData.budget,
          user_id: tripData.userId,
          trip_id: tripData.id,
          memory_type: 'budget_analysis'
        }
      });
    }

    // User preferences memories
    if (tripData.userPreferences) {
      memories.push({
        id: `user_${tripData.userId}_preferences`,
        type: 'user_preference',
        content: `User preferences for ${tripData.userId}: Interests: ${tripData.userPreferences.interests?.join(', ') || 'N/A'}. Travel style: ${tripData.userPreferences.travelStyle || 'N/A'}. Budget preference: ${tripData.userPreferences.budgetPreference || 'N/A'}.`,
        metadata: {
          agent_source: 'enhanced_cursor_manager',
          timestamp,
          destination: tripData.destination,
          user_id: tripData.userId,
          trip_id: tripData.id,
          memory_type: 'user_preferences'
        }
      });
    }

    return memories;
  }

  /**
   * Query memory for relevant information
   */
  async queryMemory(queryText, options = {}) {
    if (!this.memoryManager) {
      this.logger.warn('⚠️ Memory Manager not initialized, cannot query memory');
      return { success: false, error: 'Memory Manager not available', results: [] };
    }

    try {
      const queryData = {
        text: queryText,
        type: options.type || 'all',
        limit: options.limit || 5,
        filters: options.filters || {},
        agent_source: options.agent_source,
        destination: options.destination,
        user_id: options.user_id
      };

      const result = await this.memoryManager.queryMemory(queryData);
      
      this.logger.info('🔍 Memory query completed', {
        query: queryText.substring(0, 100),
        results: result.results.length,
        queryTime: result.queryTime
      });

      return result;

    } catch (error) {
      this.logger.error('❌ Failed to query memory:', error);
      throw error;
    }
  }

  /**
   * Notify Scout Agent of user conversation for interest tracking
   */
  async notifyScoutOfConversation(userId, message, context = {}) {
    if (!this.scoutAgent) {
      this.logger.debug('⚠️ Scout Agent not initialized, skipping conversation notification');
      return;
    }

    try {
      // Create conversation object for scout analysis
      const conversation = {
        user_id: userId,
        message: message,
        timestamp: new Date(),
        context: context,
        source: context.source || 'unknown'
      };

      // Notify scout agent (this would trigger interest analysis)
      this.scoutAgent.emit('conversation_received', conversation);
      
      this.logger.debug('🎯 Conversation notified to Scout Agent', {
        userId,
        messageLength: message.length
      });

    } catch (error) {
      this.logger.error('❌ Failed to notify Scout Agent:', error);
    }
  }

  /**
   * Get user's active offers from Scout Agent
   */
  async getUserOffers(userId) {
    if (!this.scoutAgent) {
      return { success: false, error: 'Scout Agent not available', offers: [] };
    }

    try {
      const userOffers = this.scoutAgent.activeOffers.get(userId) || [];
      
      return {
        success: true,
        offers: userOffers.filter(offer => 
          offer.status === 'active' && 
          new Date(offer.expiresAt) > new Date()
        )
      };

    } catch (error) {
      this.logger.error('❌ Failed to get user offers:', error);
      return { success: false, error: error.message, offers: [] };
    }
  }

  /**
   * Get Scout Agent metrics and status
   */
  getScoutMetrics() {
    if (!this.scoutAgent) {
      return { success: false, error: 'Scout Agent not available' };
    }

    return {
      success: true,
      metrics: this.scoutAgent.getStatus().metrics,
      status: this.scoutAgent.getStatus()
    };
  }

  async processVoiceInput(sessionId, voiceData) {
    if (!this.voiceAgent) {
      throw new Error('Voice agent not initialized');
    }

    return await this.voiceAgent.processVoiceInput(sessionId, voiceData);
  }

  /**
   * Get comprehensive system status with all metrics
   */
  getSystemStatus() {
    const baseStatus = {
      status: this.status,
      uptime: this.metrics.uptime(),
      startTime: this.startTime,
      version: this.version,
      metrics: {
        requestsProcessed: this.metrics.requestsProcessed,
        requestsSucceeded: this.metrics.requestsSucceeded,
        requestsFailed: this.metrics.requestsFailed,
        successRate: this.metrics.requestsProcessed > 0 ? 
          (this.metrics.requestsSucceeded / this.metrics.requestsProcessed) * 100 : 0,
        averageResponseTime: Math.round(this.metrics.averageResponseTime),
        lastRequestTime: this.metrics.lastRequestTime
      },
      agents: {
        total: this.registeredAgents.size,
        available: Array.from(this.registeredAgents.values()).filter(a => a.status === 'available').length,
        busy: Array.from(this.registeredAgents.values()).filter(a => a.status === 'busy').length,
        utilization: Object.fromEntries(this.metrics.agentUtilization)
      },
      components: {
        patternEngine: this.patternEngine ? this.patternEngine.status : 'disabled',
        dashboard: this.dashboard ? this.dashboard.status : 'disabled',
        healthMonitor: this.healthMonitor ? 'active' : 'disabled',
        voiceAgent: this.voiceAgent ? 'active' : 'disabled',
        quantumEdgeLayer: this.quantumEdgeLayer ? 'active' : 'disabled',
        prometheusMetrics: this.prometheusMetrics ? 'active' : 'disabled',
        tracing: this.tracing ? this.tracing.getStatus() : 'disabled',
        memoryManager: this.memoryManager ? this.memoryManager.getStatus() : 'disabled',
        scoutAgent: this.scoutAgent ? this.scoutAgent.getStatus() : 'disabled'
      },
      lastUpdate: new Date().toISOString()
    };

    // Add Quantum Edge Layer metrics if available
    if (this.quantumEdgeLayer) {
      baseStatus.quantumEdgeMetrics = this.quantumEdgeLayer.getMetrics();
    }

    // Add Prometheus metrics if available
    if (this.prometheusMetrics) {
      baseStatus.prometheusMetrics = this.prometheusMetrics.getMetricsSummary();
    }

    return baseStatus;
  }

  /**
   * Standard request execution (fallback)
   */
  async executeRequestStandard(requestId, validatedRequest, userId, context) {
    // Analyze request
    const analysis = await this.analyzeRequest(validatedRequest.message, validatedRequest.context);
    this.logger.debug('Request analysis complete', { requestId, analysis });

    // Execute request
    const executionResult = await this.executeRequest(requestId, validatedRequest.message, analysis, userId, validatedRequest.context);

    return executionResult;
  }

  /**
   * Utility methods (same as before but enhanced)
   */
  setupDataDirectories() {
    const directories = [
      'backend/data/interactions',
      'backend/data/patterns',
      'backend/data/metrics',
      'backend/logs',
      'backend/data/voice-sessions',
      'backend/data/traces'
    ];

    return Promise.all(directories.map(dir => 
      fs.mkdir(dir, { recursive: true }).catch(error => {
        this.logger.error(`Failed to create directory ${dir}:`, error);
      })
    ));
  }

  sanitizeAgentId(id) {
    return id.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  }

  generateRequestId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `req_${timestamp}_${random}`;
  }

  updateMetrics(success, responseTime) {
    this.metrics.requestsProcessed++;
    if (success) {
      this.metrics.requestsSucceeded++;
    } else {
      this.metrics.requestsFailed++;
    }
    
    this.metrics.averageResponseTime = 
      ((this.metrics.averageResponseTime * (this.metrics.requestsProcessed - 1)) + responseTime) 
      / this.metrics.requestsProcessed;
    
    this.metrics.lastRequestTime = new Date();
  }

  async storeExecutionData(requestId, request, analysis, result, userId, metadata = {}) {
    const data = {
      requestId,
      timestamp: new Date().toISOString(),
      userId: this.sanitizeUserId(userId),
      request: this.sanitizeRequest(request),
      analysis,
      result,
      duration: Date.now() - this.startTime,
      systemMetrics: {
        uptime: this.metrics.uptime(),
        activeTasks: this.activeTasks.size,
        registeredAgents: this.registeredAgents.size,
        quantumEdgeEnabled: this.config.quantumEdgeEnabled,
        prometheusEnabled: this.config.prometheusEnabled,
        tracingEnabled: this.config.tracingEnabled
      },
      metadata
    };

    const sanitizedRequestId = this.sanitizeRequestId(requestId);
    const filename = path.join('backend', 'data', 'interactions', `${sanitizedRequestId}.json`);
    
    try {
      await fs.writeFile(filename, JSON.stringify(data, null, 2), { encoding: 'utf8' });
      this.logger.debug('Execution data stored', { requestId: sanitizedRequestId, filename });
    } catch (error) {
      this.logger.error('Failed to store execution data', { requestId: sanitizedRequestId, error: error.message });
    }
  }

  sanitizeUserId(userId) {
    return userId.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  }

  sanitizeRequest(request) {
    if (typeof request === 'string') {
      return request.substring(0, 10000);
    }
    return request;
  }

  sanitizeRequestId(requestId) {
    return requestId.replace(/[^a-zA-Z0-9_-]/g, '_');
  }

  startSystemMonitoring() {
    const intervalId = setInterval(() => {
      const status = this.getSystemStatus();
      this.logger.debug('Enhanced system status', status);
      
      // Update Prometheus metrics
      if (this.prometheusMetrics) {
        this.prometheusMetrics.updateSystemHealth('enhanced-cursor-manager', 'healthy');
        this.prometheusMetrics.updateQueueMetrics(this.activeTasks.size);
      }
      
      // Auto-optimize if enabled
      if (this.config.autoOptimizationEnabled) {
        this.autoOptimize();
      }
    }, this.config.monitoringInterval);

    this.monitoringIntervals.add(intervalId);
    this.logger.info('Enhanced system monitoring started', { interval: this.config.monitoringInterval });
  }

  autoOptimize() {
    // Enhanced auto-optimization logic
    this.logger.debug('Running enhanced auto-optimization...');
  }

  async shutdown() {
    this.logger.info('🛑 Shutting down Enhanced Cursor Manager Agent...');
    this.status = 'shutting_down';

    try {
      // Stop monitoring
      this.monitoringIntervals.forEach(intervalId => clearInterval(intervalId));
      this.monitoringIntervals.clear();

      // Shutdown Quantum Edge Layer
      if (this.quantumEdgeLayer) {
        await this.quantumEdgeLayer.shutdown();
      }

      // Shutdown Prometheus Metrics
      if (this.prometheusMetrics) {
        await this.prometheusMetrics.shutdown();
      }

      // Shutdown OpenTelemetry Tracing
      if (this.tracing) {
        await this.tracing.shutdown();
      }

      // Shutdown Voice Agent
      if (this.voiceAgent) {
        // Voice agent doesn't have shutdown method yet, but we could add it
      }

      // Shutdown Memory Manager
      if (this.memoryManager) {
        await this.memoryManager.shutdown();
      }

      // Shutdown Proactive Scout Agent
      if (this.scoutAgent) {
        await this.scoutAgent.shutdown();
      }

      // Stop other components
      if (this.dashboard) {
        this.dashboard.stop();
      }

      if (this.healthMonitor) {
        this.healthMonitor.stop();
      }

      if (this.patternEngine) {
        await this.patternEngine.shutdown();
      }

      this.status = 'stopped';
      this.logger.info('✅ Enhanced Cursor Manager Agent shut down successfully');
      this.emit('manager_shutdown');

    } catch (error) {
      this.logger.error('Error during shutdown', error);
      this.status = 'error';
      throw error;
    }
  }

  // Placeholder methods for compatibility
  async analyzeRequest(request, context) {
    return {
      type: 'general_request',
      complexity: 5,
      estimatedTime: 30,
      requiredCapabilities: ['general_processing']
    };
  }

  async executeRequest(requestId, request, analysis, userId, context) {
    return {
      success: true,
      message: `Enhanced processing completed for: ${request}`,
      analysis,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = EnhancedCursorManagerAgent;
