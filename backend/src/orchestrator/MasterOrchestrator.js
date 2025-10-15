/**
 * Master Orchestrator - Cursor Agent Configuration
 * Coordinates all specialized agents and manages conversation flow
 */

const EventEmitter = require('events');
const winston = require('winston');

class MasterOrchestrator extends EventEmitter {
  constructor() {
    super();

    this.agent_id = "cursor_master_orchestrator";
    this.version = "3.0.0";
    this.role = "master_coordinator";

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/master-orchestrator.log' }),
        new winston.transports.Console()
      ]
    });

    // Initialize specialized agents
    this.agents = new Map();
    this.activeConversations = new Map();
    this.conversationContext = new Map();

    // Intent classification patterns
    this.intentPatterns = {
      trip_planning: {
        keywords: ["plan", "itinerary", "schedule", "activities", "visit", "travel", "trip"],
        route_to: "luna",
        context_required: ["destination", "duration", "preferences"],
        confidence_threshold: 0.7
      },
      
      budget_discussion: {
        keywords: ["cost", "price", "budget", "expensive", "cheap", "afford", "money"],
        route_to: "karim",
        context_required: ["total_budget", "priorities"],
        confidence_threshold: 0.7
      },
      
      cultural_inquiry: {
        keywords: ["culture", "customs", "traditions", "language", "etiquette", "local"],
        route_to: "layla",
        context_required: ["destination"],
        confidence_threshold: 0.6
      },
      
      problem_resolution: {
        keywords: ["help", "issue", "problem", "wrong", "complaint", "fix", "error"],
        route_to: "amira",
        priority: "high",
        confidence_threshold: 0.8
      },
      
      payment_processing: {
        keywords: ["pay", "payment", "transaction", "card", "checkout", "buy", "purchase"],
        route_to: "tariq",
        security_level: "maximum",
        confidence_threshold: 0.8
      },
      
      research_request: {
        keywords: ["find", "search", "compare", "options", "best", "recommend", "suggest"],
        route_to: "zara",
        context_required: ["search_criteria"],
        confidence_threshold: 0.6
      }
    };

    // Multi-agent coordination patterns
    this.coordinationPatterns = {
      complex_trip_planning: {
        sequence: [
          {
            agent: "luna",
            task: "create_initial_itinerary",
            output: "proposed_itinerary"
          },
          {
            agent: "karim",
            task: "budget_analysis_and_optimization",
            input: "proposed_itinerary",
            output: "budget_breakdown"
          },
          {
            agent: "zara",
            task: "research_accommodations_and_bookings",
            input: ["proposed_itinerary", "budget_breakdown"],
            output: "booking_options"
          },
          {
            agent: "layla",
            task: "add_cultural_insights",
            input: "proposed_itinerary",
            output: "cultural_tips"
          }
        ],
        synthesis: "combine_all_outputs_into_comprehensive_plan"
      }
    };

    this.initializeSystem();
  }

  async initializeSystem() {
    this.logger.info('Initializing Master Orchestrator...');
    
    try {
      // Initialize all specialized agents
      await this.initializeAgents();
      
      // Set up event listeners
      this.setupEventListeners();
      
      this.logger.info('Master Orchestrator initialized successfully');
      this.emit('orchestrator_initialized');
    } catch (error) {
      this.logger.error('Failed to initialize Master Orchestrator', { error: error.message });
      throw error;
    }
  }

  async initializeAgents() {
    // Import and initialize all agents
    const { LunaTripArchitect, KarimBudgetOptimizer } = require('../agents/MayaVoiceAgents');
    
    const luna = new LunaTripArchitect();
    const karim = new KarimBudgetOptimizer();
    
    // Initialize agents
    await luna.initialize();
    await karim.initialize();
    
    // Store agents
    this.agents.set('luna', luna);
    this.agents.set('karim', karim);
    
    this.logger.info('All agents initialized', { 
      agentCount: this.agents.size,
      agentIds: Array.from(this.agents.keys())
    });
  }

  setupEventListeners() {
    // Listen to agent events
    this.agents.forEach((agent, agentId) => {
      agent.on('task_started', (data) => {
        this.logger.info('Agent task started', { agentId, task: data.task.type });
        this.emit('agent_task_started', { agentId, ...data });
      });

      agent.on('task_completed', (data) => {
        this.logger.info('Agent task completed', { agentId, task: data.task.type });
        this.emit('agent_task_completed', { agentId, ...data });
      });

      agent.on('agent_initialized', (agentId) => {
        this.logger.info('Agent initialized', { agentId });
        this.emit('agent_ready', { agentId });
      });
    });
  }

  /**
   * Process incoming user message and route to appropriate agent(s)
   */
  async processMessage(message, userId, conversationId) {
    this.logger.info('Processing user message', { 
      userId, 
      conversationId, 
      messageLength: message.length 
    });

    try {
      // Classify user intent
      const intent = await this.classifyIntent(message);
      
      // Get or create conversation context
      const context = this.getConversationContext(conversationId);
      
      // Determine if single or multi-agent coordination is needed
      if (intent.requires_coordination) {
        return await this.coordinateMultiAgent(message, intent, context, userId, conversationId);
      } else {
        return await this.routeToSingleAgent(message, intent, context, userId, conversationId);
      }
    } catch (error) {
      this.logger.error('Error processing message', { error: error.message });
      return {
        success: false,
        error: "I apologize, but I'm having trouble processing your request right now. Please try again.",
        fallback: true
      };
    }
  }

  async classifyIntent(message) {
    const lowerMessage = message.toLowerCase();
    const scores = {};

    // Score each intent pattern
    for (const [intentName, pattern] of Object.entries(this.intentPatterns)) {
      let score = 0;
      let matches = 0;

      for (const keyword of pattern.keywords) {
        if (lowerMessage.includes(keyword)) {
          score += 1;
          matches++;
        }
      }

      // Normalize score
      if (pattern.keywords.length > 0) {
        score = score / pattern.keywords.length;
      }

      scores[intentName] = {
        score,
        matches,
        pattern,
        confidence: score >= pattern.confidence_threshold
      };
    }

    // Find best matching intent
    const sortedIntents = Object.entries(scores)
      .sort(([,a], [,b]) => b.score - a.score);

    const [bestIntent, bestScore] = sortedIntents[0];

    this.logger.info('Intent classified', { 
      message: message.substring(0, 100),
      bestIntent,
      confidence: bestScore.score,
      allScores: scores
    });

    return {
      intent: bestIntent,
      confidence: bestScore.score,
      pattern: bestScore.pattern,
      requires_coordination: this.requiresCoordination(message),
      all_scores: scores
    };
  }

  requiresCoordination(message) {
    const coordinationTriggers = [
      "plan a trip",
      "organize travel",
      "book everything",
      "complete package",
      "full service"
    ];

    const lowerMessage = message.toLowerCase();
    return coordinationTriggers.some(trigger => lowerMessage.includes(trigger));
  }

  async routeToSingleAgent(message, intent, context, userId, conversationId) {
    const agentId = intent.pattern.route_to;
    const agent = this.agents.get(agentId);

    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    this.logger.info('Routing to single agent', { 
      agentId, 
      intent: intent.intent,
      userId,
      conversationId
    });

    // Create task for agent
    const task = {
      type: this.mapIntentToTaskType(intent.intent),
      payload: {
        message,
        context,
        userId,
        conversationId,
        intent: intent.intent
      },
      priority: intent.pattern.priority || 'normal',
      security_level: intent.pattern.security_level || 'standard'
    };

    // Execute task
    const result = await agent.performTask(task);

    // Update conversation context
    this.updateConversationContext(conversationId, {
      last_intent: intent.intent,
      last_agent: agentId,
      last_task: task.type,
      timestamp: new Date().toISOString()
    });

    return {
      success: result.success,
      agent: agentId,
      response: result.success ? result.result : result.error,
      conversation_id: conversationId,
      processing_time: Date.now()
    };
  }

  async coordinateMultiAgent(message, intent, context, userId, conversationId) {
    this.logger.info('Coordinating multi-agent response', { 
      intent: intent.intent,
      userId,
      conversationId
    });

    // Determine coordination pattern
    const coordinationPattern = this.getCoordinationPattern(message, intent);
    
    if (!coordinationPattern) {
      // Fallback to single agent
      return await this.routeToSingleAgent(message, intent, context, userId, conversationId);
    }

    // Execute coordination sequence
    const results = {};
    const sequence = coordinationPattern.sequence;

    for (const step of sequence) {
      const agent = this.agents.get(step.agent);
      if (!agent) {
        this.logger.error(`Agent not found in coordination: ${step.agent}`);
        continue;
      }

      // Prepare input for this step
      const stepInput = this.prepareStepInput(step.input, results, context);

      const task = {
        type: step.task,
        payload: {
          ...stepInput,
          message,
          context,
          userId,
          conversationId,
          coordination_step: true,
          previous_results: results
        }
      };

      try {
        const stepResult = await agent.performTask(task);
        results[step.output] = stepResult.success ? stepResult.result : stepResult.error;
        
        this.logger.info('Coordination step completed', {
          step: step.task,
          agent: step.agent,
          success: stepResult.success
        });
      } catch (error) {
        this.logger.error('Coordination step failed', {
          step: step.task,
          agent: step.agent,
          error: error.message
        });
        results[step.output] = { error: error.message };
      }
    }

    // Synthesize final response
    const synthesizedResponse = await this.synthesizeMultiAgentResponse(
      results, 
      coordinationPattern.synthesis,
      message,
      context
    );

    // Update conversation context
    this.updateConversationContext(conversationId, {
      last_intent: intent.intent,
      coordination_used: true,
      agents_involved: sequence.map(s => s.agent),
      results_summary: Object.keys(results),
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      agents: sequence.map(s => s.agent),
      coordination: true,
      response: synthesizedResponse,
      conversation_id: conversationId,
      processing_time: Date.now()
    };
  }

  getCoordinationPattern(message, intent) {
    // Simple pattern matching - in production, use more sophisticated logic
    if (message.toLowerCase().includes('plan') && message.toLowerCase().includes('trip')) {
      return this.coordinationPatterns.complex_trip_planning;
    }
    return null;
  }

  prepareStepInput(inputKeys, previousResults, context) {
    const input = {};
    
    if (Array.isArray(inputKeys)) {
      inputKeys.forEach(key => {
        if (previousResults[key]) {
          input[key] = previousResults[key];
        }
      });
    } else if (inputKeys && previousResults[inputKeys]) {
      input[inputKeys] = previousResults[inputKeys];
    }

    // Add context
    input.context = context;
    
    return input;
  }

  async synthesizeMultiAgentResponse(results, synthesisType, originalMessage, context) {
    this.logger.info('Synthesizing multi-agent response', { 
      synthesisType,
      resultKeys: Object.keys(results)
    });

    // Simple synthesis - in production, use LLM for sophisticated synthesis
    let synthesized = {
      type: 'comprehensive_response',
      original_message: originalMessage,
      components: results,
      summary: 'Your travel plan has been created with input from multiple specialists.',
      recommendations: []
    };

    // Add specific recommendations based on results
    if (results.proposed_itinerary) {
      synthesized.recommendations.push('✓ Itinerary designed by Luna');
    }
    if (results.budget_breakdown) {
      synthesized.recommendations.push('✓ Budget optimized by Karim');
    }
    if (results.booking_options) {
      synthesized.recommendations.push('✓ Options researched by Zara');
    }
    if (results.cultural_tips) {
      synthesized.recommendations.push('✓ Cultural insights from Layla');
    }

    return synthesized;
  }

  mapIntentToTaskType(intent) {
    const mapping = {
      'trip_planning': 'create_itinerary',
      'budget_discussion': 'analyze_budget',
      'cultural_inquiry': 'provide_cultural_insights',
      'problem_resolution': 'resolve_issue',
      'payment_processing': 'process_payment',
      'research_request': 'conduct_research'
    };

    return mapping[intent] || 'general_response';
  }

  getConversationContext(conversationId) {
    if (!this.conversationContext.has(conversationId)) {
      this.conversationContext.set(conversationId, {
        created_at: new Date().toISOString(),
        message_count: 0,
        user_preferences: {},
        trip_state: {},
        budget_state: {},
        last_activity: new Date().toISOString()
      });
    }

    return this.conversationContext.get(conversationId);
  }

  updateConversationContext(conversationId, updates) {
    const context = this.getConversationContext(conversationId);
    Object.assign(context, updates);
    context.last_activity = new Date().toISOString();
    this.conversationContext.set(conversationId, context);
  }

  /**
   * Get system health and agent status
   */
  getSystemHealth() {
    const agentStatus = {};
    
    this.agents.forEach((agent, agentId) => {
      agentStatus[agentId] = {
        ...agent.getMetrics(),
        health: agent.status === 'active' ? 'healthy' : 'degraded'
      };
    });

    return {
      orchestrator_health: 'healthy',
      active_conversations: this.activeConversations.size,
      agent_status: agentStatus,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get agent by ID
   */
  getAgent(agentId) {
    return this.agents.get(agentId);
  }

  /**
   * List all available agents
   */
  listAgents() {
    return Array.from(this.agents.entries()).map(([id, agent]) => ({
      id,
      name: agent.identity.name,
      title: agent.identity.title,
      avatar: agent.identity.avatar,
      status: agent.status,
      role: agent.role,
      metrics: agent.getMetrics()
    }));
  }
}

module.exports = MasterOrchestrator;

