/**
 * Enhanced Cursor Manager with SquadOS Integration
 * Main controller that orchestrates SquadOS Travel Agent Squadron
 * Connects simulation to real-world execution via Cursor Executor
 */

const EventEmitter = require('events');
const fs = require('fs').promises;
const path = require('path');

// Import SquadOS and other components
const TravelAgentSquadOS = require('./TravelAgentSquadOS');
const CursorVoiceAgentBasic = require('./CursorVoiceAgentBasic');

class EnhancedCursorManagerWithSquadOS extends EventEmitter {
  constructor() {
    super();
    this.managerId = 'enhanced-cursor-manager-squados';
    this.role = 'main_orchestrator';
    this.status = 'initializing';
    
    // Core capabilities with SquadOS integration
    this.capabilities = [
      'voice_interface',
      'travel_planning',
      'agent_orchestration',
      'real_world_execution',
      'cursor_integration',
      'multi_agent_coordination',
      'task_delegation',
      'quality_assurance'
    ];

    // Initialize SquadOS
    this.squadOS = null;
    this.voiceAgent = null;
    
    // Task execution system
    this.taskQueue = [];
    this.activeTasks = new Map();
    this.completedTasks = new Map();
    
    // Cursor Executor integration
    this.cursorExecutor = {
      executeCommand: this.executeCursorCommand.bind(this),
      queueTask: this.queueCursorTask.bind(this),
      processQueue: this.processCursorQueue.bind(this)
    };
    
    // Performance metrics
    this.metrics = {
      tasksProcessed: 0,
      squadOSRequests: 0,
      voiceInteractions: 0,
      cursorCommandsExecuted: 0,
      averageResponseTime: 0
    };

    this.initializeEnhancedManager();
  }

  /**
   * Initialize Enhanced Manager with SquadOS
   */
  async initializeEnhancedManager() {
    try {
      console.log('🚀 Initializing Enhanced Cursor Manager with SquadOS...');
      
      // Initialize SquadOS Travel Agent Squadron
      console.log('🌍 Initializing SquadOS...');
      this.squadOS = new TravelAgentSquadOS(this);
      await this.setupSquadOSListeners();
      
      // Initialize Voice Agent
      console.log('🎤 Initializing Voice Agent...');
      this.voiceAgent = new CursorVoiceAgentBasic(this);
      await this.setupVoiceListeners();
      
      // Initialize task processing
      this.initializeTaskProcessing();
      
      // Start background processing
      this.startBackgroundProcessing();
      
      this.status = 'ready';
      console.log('✅ Enhanced Cursor Manager with SquadOS initialized successfully');
      
      this.emit('managerReady', {
        managerId: this.managerId,
        squadOSReady: this.squadOS.status === 'ready',
        voiceReady: this.voiceAgent.status === 'ready',
        capabilities: this.capabilities.length
      });
      
    } catch (error) {
      console.error('❌ Failed to initialize Enhanced Manager:', error);
      this.status = 'error';
      throw error;
    }
  }

  /**
   * Setup SquadOS event listeners
   */
  async setupSquadOSListeners() {
    this.squadOS.on('squadReady', (data) => {
      console.log('✅ SquadOS ready:', data);
    });

    this.squadOS.on('tripPlanComplete', (data) => {
      this.handleTripPlanComplete(data);
    });

    this.squadOS.on('agentMessage', (data) => {
      this.handleSquadOSMessage(data);
    });
  }

  /**
   * Setup Voice Agent event listeners
   */
  async setupVoiceListeners() {
    this.voiceAgent.on('voiceRequest', (data) => {
      this.handleVoiceRequest(data);
    });

    this.voiceAgent.on('voiceResponse', (data) => {
      this.handleVoiceResponse(data);
    });
  }

  /**
   * Initialize task processing system
   */
  initializeTaskProcessing() {
    this.taskProcessors = {
      travelPlanning: this.processTravelPlanningTask.bind(this),
      factChecking: this.processFactCheckingTask.bind(this),
      budgetAnalysis: this.processBudgetAnalysisTask.bind(this),
      webSearch: this.processWebSearchTask.bind(this),
      cursorExecution: this.processCursorExecutionTask.bind(this)
    };

    console.log('⚙️ Task processing system initialized');
  }

  /**
   * Start background processing
   */
  startBackgroundProcessing() {
    // Process task queue every 5 seconds
    setInterval(() => {
      this.processTaskQueue();
    }, 5000);

    // Process cursor command queue every 2 seconds
    setInterval(() => {
      this.cursorExecutor.processQueue();
    }, 2000);

    console.log('🔄 Background processing started');
  }

  /**
   * Main entry point: Process user requests
   */
  async processRequest(message, userId, context = {}) {
    const startTime = Date.now();
    const requestId = `req_${userId}_${Date.now()}`;
    
    try {
      console.log(`🎯 Processing request from ${userId}: "${message}"`);
      
      // Analyze request type
      const requestAnalysis = await this.analyzeRequest(message, context);
      
      // Route to appropriate processor
      let result;
      switch (requestAnalysis.type) {
        case 'travel_planning':
          result = await this.handleTravelPlanningRequest(requestId, message, userId, context);
          break;
        case 'voice_interaction':
          result = await this.handleVoiceInteraction(requestId, message, userId, context);
          break;
        case 'cursor_command':
          result = await this.handleCursorCommand(requestId, message, userId, context);
          break;
        case 'general_query':
          result = await this.handleGeneralQuery(requestId, message, userId, context);
          break;
        default:
          result = await this.handleGeneralQuery(requestId, message, userId, context);
      }

      // Update metrics
      this.updateMetrics(Date.now() - startTime);

      return {
        success: true,
        requestId,
        result,
        processingTime: Date.now() - startTime,
        managerId: this.managerId
      };

    } catch (error) {
      console.error('❌ Request processing failed:', error);
      return {
        success: false,
        requestId,
        error: error.message,
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * Analyze request to determine type and routing
   */
  async analyzeRequest(message, context) {
    const travelKeywords = ['plan trip', 'travel', 'vacation', 'itinerary', 'destination', 'hotel', 'flight'];
    const voiceKeywords = ['voice', 'speak', 'listen', 'audio'];
    const cursorKeywords = ['code', 'debug', 'implement', 'create', 'build'];

    const lowerMessage = message.toLowerCase();

    if (travelKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return { type: 'travel_planning', confidence: 0.9 };
    } else if (voiceKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return { type: 'voice_interaction', confidence: 0.8 };
    } else if (cursorKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return { type: 'cursor_command', confidence: 0.85 };
    } else {
      return { type: 'general_query', confidence: 0.5 };
    }
  }

  /**
   * Handle travel planning requests via SquadOS
   */
  async handleTravelPlanningRequest(requestId, message, userId, context) {
    console.log('🌍 Delegating to SquadOS for travel planning...');
    
    // Extract travel parameters from message
    const travelParams = this.extractTravelParameters(message);
    
    // Create SquadOS request
    const squadOSRequest = {
      destination: travelParams.destination,
      duration: travelParams.duration,
      budget: travelParams.budget,
      travelers: travelParams.travelers,
      interests: travelParams.interests,
      budgetLevel: travelParams.budgetLevel,
      userId: userId,
      requestId: requestId
    };

    // Execute via SquadOS
    const squadOSResult = await this.squadOS.planTrip(squadOSRequest);
    
    // Update metrics
    this.metrics.squadOSRequests++;

    return {
      type: 'travel_planning',
      squadOSResult,
      summary: `Trip to ${travelParams.destination} planned successfully`,
      nextSteps: this.generateTravelNextSteps(squadOSResult)
    };
  }

  /**
   * Handle voice interactions
   */
  async handleVoiceInteraction(requestId, message, userId, context) {
    console.log('🎤 Processing voice interaction...');
    
    // Process via voice agent
    const voiceResult = await this.voiceAgent.processVoiceInput(
      context.sessionId || 'default',
      message,
      0.9
    );

    this.metrics.voiceInteractions++;

    return {
      type: 'voice_interaction',
      voiceResult,
      transcript: message,
      response: voiceResult.response
    };
  }

  /**
   * Handle cursor commands
   */
  async handleCursorCommand(requestId, message, userId, context) {
    console.log('💻 Processing cursor command...');
    
    // Create cursor execution task
    const cursorTask = {
      id: requestId,
      type: 'cursor_execution',
      command: message,
      userId: userId,
      context: context,
      status: 'queued',
      createdAt: new Date()
    };

    // Queue for execution
    await this.cursorExecutor.queueTask(cursorTask);

    return {
      type: 'cursor_command',
      taskId: requestId,
      status: 'queued',
      message: 'Command queued for cursor execution'
    };
  }

  /**
   * Handle general queries
   */
  async handleGeneralQuery(requestId, message, userId, context) {
    console.log('💬 Processing general query...');
    
    // Simple response for general queries
    const responses = [
      'I can help you with travel planning, voice interactions, or cursor commands.',
      'Try asking me to plan a trip, use voice commands, or help with coding tasks.',
      'I have access to Luna (trip planning), Karim (budget optimization), Zara (research), and voice capabilities.'
    ];

    return {
      type: 'general_query',
      response: responses[Math.floor(Math.random() * responses.length)],
      suggestions: [
        'Plan a trip to Tokyo',
        'Use voice commands',
        'Help me debug code'
      ]
    };
  }

  /**
   * Extract travel parameters from user message
   */
  extractTravelParameters(message) {
    const params = {
      destination: 'Tokyo', // Default
      duration: 7,
      budget: 2000,
      travelers: 1,
      interests: [],
      budgetLevel: 'midrange'
    };

    // Simple extraction logic (would be enhanced with NLP)
    const lowerMessage = message.toLowerCase();
    
    // Extract destination
    const destinations = ['tokyo', 'paris', 'london', 'bangkok', 'rome', 'new york'];
    for (const dest of destinations) {
      if (lowerMessage.includes(dest)) {
        params.destination = dest.charAt(0).toUpperCase() + dest.slice(1);
        break;
      }
    }

    // Extract duration
    const durationMatch = lowerMessage.match(/(\d+)\s*days?/);
    if (durationMatch) {
      params.duration = parseInt(durationMatch[1]);
    }

    // Extract budget
    const budgetMatch = lowerMessage.match(/\$(\d+)/);
    if (budgetMatch) {
      params.budget = parseInt(budgetMatch[1]);
    }

    // Extract travelers
    const travelersMatch = lowerMessage.match(/(\d+)\s*(people|travelers|guests)/);
    if (travelersMatch) {
      params.travelers = parseInt(travelersMatch[1]);
    }

    // Extract interests
    const interests = ['culture', 'food', 'adventure', 'relaxation', 'history', 'nature'];
    for (const interest of interests) {
      if (lowerMessage.includes(interest)) {
        params.interests.push(interest);
      }
    }

    return params;
  }

  /**
   * Execute cursor command (connects to real Cursor Executor)
   */
  async executeCursorCommand(command) {
    console.log('💻 Executing cursor command:', command);
    
    try {
      // This is where we would connect to the actual Cursor Executor
      // For now, we'll simulate the execution
      const result = {
        command: command,
        status: 'executed',
        output: `Simulated execution of: ${command}`,
        timestamp: new Date(),
        success: true
      };

      this.metrics.cursorCommandsExecuted++;
      
      return result;
      
    } catch (error) {
      console.error('❌ Cursor command execution failed:', error);
      return {
        command: command,
        status: 'failed',
        error: error.message,
        timestamp: new Date(),
        success: false
      };
    }
  }

  /**
   * Queue cursor task for execution
   */
  async queueCursorTask(task) {
    this.taskQueue.push(task);
    console.log(`📋 Cursor task queued: ${task.id}`);
  }

  /**
   * Process cursor command queue
   */
  async processCursorQueue() {
    if (this.taskQueue.length === 0) return;

    const task = this.taskQueue.shift();
    console.log(`⚡ Processing cursor task: ${task.id}`);

    try {
      task.status = 'processing';
      this.activeTasks.set(task.id, task);

      // Execute the command
      const result = await this.executeCursorCommand(task.command);
      
      task.status = 'completed';
      task.result = result;
      task.completedAt = new Date();
      
      this.activeTasks.delete(task.id);
      this.completedTasks.set(task.id, task);

      console.log(`✅ Cursor task completed: ${task.id}`);

    } catch (error) {
      console.error(`❌ Cursor task failed: ${task.id}`, error);
      task.status = 'failed';
      task.error = error.message;
      this.activeTasks.delete(task.id);
    }
  }

  /**
   * Process task queue
   */
  async processTaskQueue() {
    // Process any pending tasks
    for (const [taskId, task] of this.activeTasks) {
      if (task.type === 'cursor_execution' && task.status === 'processing') {
        // Handle cursor execution tasks
        await this.processCursorExecutionTask(task);
      }
    }
  }

  /**
   * Process cursor execution task
   */
  async processCursorExecutionTask(task) {
    // This would connect to the real Cursor Executor system
    console.log(`💻 Processing cursor execution: ${task.command}`);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mark as completed
    task.status = 'completed';
    task.result = {
      output: `Cursor command executed: ${task.command}`,
      success: true
    };
  }

  /**
   * Handle SquadOS trip plan completion
   */
  handleTripPlanComplete(data) {
    console.log('🎉 SquadOS trip plan completed:', data.projectId);
    
    // Store completed trip plan
    this.storeTripPlan(data);
    
    // Notify any waiting voice sessions
    this.notifyVoiceSessions(data);
  }

  /**
   * Handle SquadOS agent messages
   */
  handleSquadOSMessage(data) {
    console.log('📡 SquadOS message:', data);
    
    // Route messages to appropriate handlers
    if (data.type === 'BUDGET_ANALYSIS_REQUEST') {
      this.handleBudgetAnalysisRequest(data);
    } else if (data.type === 'FACT_CHECK_REQUEST') {
      this.handleFactCheckRequest(data);
    }
  }

  /**
   * Handle budget analysis request from SquadOS
   */
  async handleBudgetAnalysisRequest(data) {
    console.log('💰 Handling budget analysis request...');
    
    // Create cursor task for budget analysis
    const budgetTask = {
      id: `budget_${data.projectId}`,
      type: 'budget_analysis',
      command: `Analyze budget for ${data.destination}`,
      projectId: data.projectId,
      status: 'queued'
    };

    await this.cursorExecutor.queueTask(budgetTask);
  }

  /**
   * Handle fact check request from SquadOS
   */
  async handleFactCheckRequest(data) {
    console.log('🔍 Handling fact check request...');
    
    // Create cursor task for fact checking
    const factCheckTask = {
      id: `factcheck_${data.projectId}`,
      type: 'fact_check',
      command: `Fact check: ${data.query}`,
      projectId: data.projectId,
      status: 'queued'
    };

    await this.cursorExecutor.queueTask(factCheckTask);
  }

  /**
   * Handle voice request
   */
  handleVoiceRequest(data) {
    console.log('🎤 Voice request received:', data.message);
    
    // Route voice requests to appropriate handlers
    this.processRequest(data.message, data.userId, {
      type: 'voice',
      sessionId: data.sessionId
    });
  }

  /**
   * Handle voice response
   */
  handleVoiceResponse(data) {
    console.log('🔊 Voice response generated:', data.response);
    
    // Store voice interaction
    this.storeVoiceInteraction(data);
  }

  // Utility methods
  generateTravelNextSteps(squadOSResult) {
    return [
      'Review the detailed itinerary',
      'Check booking links and make reservations',
      'Download offline maps and apps',
      'Pack according to the packing list',
      'Review cultural tips and local customs'
    ];
  }

  updateMetrics(processingTime) {
    this.metrics.tasksProcessed++;
    const total = this.metrics.averageResponseTime * (this.metrics.tasksProcessed - 1) + processingTime;
    this.metrics.averageResponseTime = total / this.metrics.tasksProcessed;
  }

  // Data persistence methods
  async storeTripPlan(data) {
    try {
      const dataDir = path.join('backend', 'data', 'completed_trips');
      await fs.mkdir(dataDir, { recursive: true });
      
      const filename = `trip_${data.projectId}.json`;
      const filepath = path.join(dataDir, filename);
      
      await fs.writeFile(filepath, JSON.stringify(data, null, 2));
      console.log(`💾 Trip plan stored: ${filename}`);
      
    } catch (error) {
      console.error('❌ Failed to store trip plan:', error);
    }
  }

  async storeVoiceInteraction(data) {
    try {
      const dataDir = path.join('backend', 'data', 'voice_interactions');
      await fs.mkdir(dataDir, { recursive: true });
      
      const filename = `voice_${Date.now()}.json`;
      const filepath = path.join(dataDir, filename);
      
      await fs.writeFile(filepath, JSON.stringify(data, null, 2));
      
    } catch (error) {
      console.error('❌ Failed to store voice interaction:', error);
    }
  }

  // Status and metrics methods
  async getManagerStatus() {
    return {
      manager_id: this.managerId,
      role: this.role,
      status: this.status,
      capabilities: this.capabilities.length,
      squadOS_ready: this.squadOS?.status === 'ready',
      voice_ready: this.voiceAgent?.status === 'ready',
      active_tasks: this.activeTasks.size,
      queued_tasks: this.taskQueue.length,
      completed_tasks: this.completedTasks.size,
      metrics: this.metrics
    };
  }

  async getPerformanceMetrics() {
    return {
      tasks_processed: this.metrics.tasksProcessed,
      squadOS_requests: this.metrics.squadOSRequests,
      voice_interactions: this.metrics.voiceInteractions,
      cursor_commands_executed: this.metrics.cursorCommandsExecuted,
      average_response_time: this.metrics.averageResponseTime,
      active_tasks: this.activeTasks.size,
      queue_length: this.taskQueue.length,
      uptime: Date.now() - (this.startTime || Date.now())
    };
  }
}

module.exports = EnhancedCursorManagerWithSquadOS;
