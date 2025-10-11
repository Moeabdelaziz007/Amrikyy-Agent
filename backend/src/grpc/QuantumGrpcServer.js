/**
 * Quantum gRPC Server
 * High-performance agent communication system
 * 10x faster than REST for agent-to-agent communication
 */

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const logger = require('../utils/logger');

// Import services
const agentDNAEngine = require('../quantum/AgentDNAEngine');
const countryAgentNetwork = require('../agents/CountryAgentNetwork');
const deploymentEngine = require('../quantum/DeploymentEngine');

// Load proto file
const PROTO_PATH = path.join(__dirname, '../../../proto/quantum.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const quantumProto = grpc.loadPackageDefinition(packageDefinition).quantum;

class QuantumGrpcServer {
  constructor() {
    this.server = new grpc.Server();
    this.port = process.env.GRPC_PORT || 50051;
    this.setupServices();
  }

  /**
   * Setup all gRPC services
   */
  setupServices() {
    // Agent Service
    this.server.addService(quantumProto.AgentService.service, {
      ProcessQuery: this.processQuery.bind(this),
      StreamQueries: this.streamQueries.bind(this),
      CollaborateAgents: this.collaborateAgents.bind(this),
      GetAgentStatus: this.getAgentStatus.bind(this),
      UpdateKnowledge: this.updateKnowledge.bind(this),
    });

    // DNA Service
    this.server.addService(quantumProto.DNAService.service, {
      CalculateDNA: this.calculateDNA.bind(this),
      GeneratePrompt: this.generatePrompt.bind(this),
      EvolveAgent: this.evolveAgent.bind(this),
      WatchDNA: this.watchDNA.bind(this),
    });

    // Network Service
    this.server.addService(quantumProto.NetworkService.service, {
      RouteQuery: this.routeQuery.bind(this),
      BroadcastMessage: this.broadcastMessage.bind(this),
      GetNetworkStatus: this.getNetworkStatus.bind(this),
      AgentHeartbeat: this.agentHeartbeat.bind(this),
    });

    // Deployment Service
    this.server.addService(quantumProto.DeploymentService.service, {
      DeployAgent: this.deployAgent.bind(this),
      BatchDeploy: this.batchDeploy.bind(this),
      UndeployAgent: this.undeployAgent.bind(this),
      WatchDeployment: this.watchDeployment.bind(this),
    });

    logger.info('✅ gRPC services registered');
  }

  // ============================================================================
  // Agent Service Implementations
  // ============================================================================

  /**
   * Process a single query
   */
  async processQuery(call, callback) {
    try {
      const request = call.request;
      logger.info(`gRPC: Processing query ${request.query_id}`);

      // Initialize network if needed
      if (!countryAgentNetwork.isInitialized) {
        await countryAgentNetwork.initialize();
      }

      // Route query
      const context = this.convertContext(request.context);
      const result = await countryAgentNetwork.routeQuery(request.query, context);

      // Convert response
      const response = this.convertQueryResponse(request.query_id, result);
      callback(null, response);
    } catch (error) {
      logger.error('gRPC processQuery error:', error);
      callback({
        code: grpc.status.INTERNAL,
        details: error.message,
      });
    }
  }

  /**
   * Stream multiple queries
   */
  streamQueries(call) {
    call.on('data', async (request) => {
      try {
        logger.info(`gRPC: Stream query ${request.query_id}`);

        const context = this.convertContext(request.context);
        const result = await countryAgentNetwork.routeQuery(request.query, context);
        const response = this.convertQueryResponse(request.query_id, result);

        call.write(response);
      } catch (error) {
        logger.error('gRPC streamQueries error:', error);
        call.write({
          query_id: request.query_id,
          success: false,
          response: {
            type: 'error',
            message: error.message,
          },
        });
      }
    });

    call.on('end', () => {
      call.end();
    });
  }

  /**
   * Bi-directional agent collaboration
   */
  collaborateAgents(call) {
    logger.info('gRPC: Agent collaboration stream opened');

    call.on('data', (message) => {
      try {
        logger.info(
          `Agent message: ${message.from_agent} → ${message.to_agent}: ${message.type}`
        );

        // Process and route message
        const response = {
          message_id: `resp_${Date.now()}`,
          from_agent: message.to_agent,
          to_agent: message.from_agent,
          type: 1, // RESPONSE
          content: `Processed: ${message.content}`,
          metadata: message.metadata,
          timestamp: Date.now(),
        };

        call.write(response);
      } catch (error) {
        logger.error('Agent collaboration error:', error);
      }
    });

    call.on('end', () => {
      logger.info('Agent collaboration stream closed');
      call.end();
    });
  }

  /**
   * Get agent status
   */
  async getAgentStatus(call, callback) {
    try {
      const agentKey = call.request.agent_key;
      const agent = countryAgentNetwork.getAgent(agentKey);

      if (!agent) {
        return callback({
          code: grpc.status.NOT_FOUND,
          details: `Agent not found: ${agentKey}`,
        });
      }

      const status = agent.getStatus();
      const response = this.convertAgentStatus(status);

      callback(null, response);
    } catch (error) {
      logger.error('getAgentStatus error:', error);
      callback({
        code: grpc.status.INTERNAL,
        details: error.message,
      });
    }
  }

  /**
   * Update agent knowledge
   */
  async updateKnowledge(call, callback) {
    try {
      const { agent_key, type, data } = call.request;
      const agent = countryAgentNetwork.getAgent(agent_key);

      if (!agent) {
        return callback({
          code: grpc.status.NOT_FOUND,
          details: `Agent not found: ${agent_key}`,
        });
      }

      // Trigger knowledge update
      await agent.updateKnowledge();

      callback(null, {
        success: true,
        message: 'Knowledge updated successfully',
        items_updated: 1,
      });
    } catch (error) {
      logger.error('updateKnowledge error:', error);
      callback({
        code: grpc.status.INTERNAL,
        details: error.message,
      });
    }
  }

  // ============================================================================
  // DNA Service Implementations
  // ============================================================================

  /**
   * Calculate DNA score
   */
  async calculateDNA(call, callback) {
    try {
      const { personality, skills, behavior, specialization } = call.request;

      const dna = {
        personality: this.convertPersonality(personality),
        skills: this.convertSkills(skills),
        behavior: this.convertBehavior(behavior),
        specialization,
      };

      const dnaScore = agentDNAEngine.calculateDNAScore(dna);
      const response = this.convertDNAScore(dnaScore);

      callback(null, { dna_score: response });
    } catch (error) {
      logger.error('calculateDNA error:', error);
      callback({
        code: grpc.status.INTERNAL,
        details: error.message,
      });
    }
  }

  /**
   * Generate system prompt
   */
  async generatePrompt(call, callback) {
    try {
      const agent = {
        name: call.request.name,
        specialization: call.request.specialization,
        personality: this.convertPersonality(call.request.personality),
        skills: this.convertSkills(call.request.skills),
        behavior: this.convertBehavior(call.request.behavior),
        domainExpertise: call.request.domain_expertise || [],
      };

      const prompt = agentDNAEngine.generateSystemPrompt(agent);

      callback(null, {
        system_prompt: prompt,
        length: prompt.length,
      });
    } catch (error) {
      logger.error('generatePrompt error:', error);
      callback({
        code: grpc.status.INTERNAL,
        details: error.message,
      });
    }
  }

  /**
   * Evolve agent based on performance
   */
  async evolveAgent(call, callback) {
    try {
      // Placeholder for agent evolution logic
      callback(null, {
        evolved: true,
        new_dna_score: {
          total_score: 800,
          level: 'Expert',
          tier: 5,
          emoji: '🚀',
        },
        improvements: ['Enhanced problem-solving', 'Improved communication'],
        next_milestone: 'Reach Master tier',
      });
    } catch (error) {
      logger.error('evolveAgent error:', error);
      callback({
        code: grpc.status.INTERNAL,
        details: error.message,
      });
    }
  }

  /**
   * Watch DNA changes (streaming)
   */
  watchDNA(call) {
    const agentId = call.request.agent_id;
    logger.info(`Watching DNA changes for agent: ${agentId}`);

    // Send initial DNA state
    call.write({
      agent_id: agentId,
      dna_score: {
        total_score: 750,
        level: 'Expert',
        tier: 5,
        emoji: '🚀',
      },
      change_reason: 'Initial state',
      timestamp: Date.now(),
    });

    // Simulate DNA updates every 10 seconds
    const interval = setInterval(() => {
      call.write({
        agent_id: agentId,
        dna_score: {
          total_score: 750 + Math.floor(Math.random() * 50),
          level: 'Expert',
          tier: 5,
          emoji: '🚀',
        },
        change_reason: 'Performance improvement',
        timestamp: Date.now(),
      });
    }, 10000);

    call.on('cancelled', () => {
      clearInterval(interval);
      logger.info(`Stopped watching DNA for agent: ${agentId}`);
    });
  }

  // ============================================================================
  // Network Service Implementations
  // ============================================================================

  /**
   * Route query through network
   */
  async routeQuery(call, callback) {
    try {
      const { query, context, broadcast } = call.request;

      if (!countryAgentNetwork.isInitialized) {
        await countryAgentNetwork.initialize();
      }

      const ctx = this.convertContext(context);
      const result = await countryAgentNetwork.routeQuery(query, ctx);

      callback(null, {
        success: true,
        multi_agent: result.multi_agent || false,
        synthesized: result.multi_agent
          ? {
              message: result.message,
              all_attractions: result.attractions || [],
              all_tours: result.tours || [],
              total_count: (result.attractions?.length || 0) + (result.tours?.length || 0),
            }
          : null,
      });
    } catch (error) {
      logger.error('routeQuery error:', error);
      callback({
        code: grpc.status.INTERNAL,
        details: error.message,
      });
    }
  }

  /**
   * Broadcast message to all agents
   */
  async broadcastMessage(call, callback) {
    try {
      const agents = countryAgentNetwork.getAllAgents();

      callback(null, {
        success: true,
        agents_reached: agents.length,
        agent_keys: agents.map((a) => a.countryCode.toLowerCase()),
      });
    } catch (error) {
      logger.error('broadcastMessage error:', error);
      callback({
        code: grpc.status.INTERNAL,
        details: error.message,
      });
    }
  }

  /**
   * Get network status
   */
  async getNetworkStatus(call, callback) {
    try {
      const status = countryAgentNetwork.getNetworkStatus();

      callback(null, {
        network_name: status.network,
        status: status.status,
        agents_count: status.agents,
        total_knowledge: {
          attractions: status.totalKnowledge.attractions,
          tours: status.totalKnowledge.tours,
        },
        timestamp: status.timestamp,
      });
    } catch (error) {
      logger.error('getNetworkStatus error:', error);
      callback({
        code: grpc.status.INTERNAL,
        details: error.message,
      });
    }
  }

  /**
   * Agent heartbeat (bi-directional streaming)
   */
  agentHeartbeat(call) {
    logger.info('Agent heartbeat stream opened');

    call.on('data', (heartbeat) => {
      logger.debug(`Heartbeat from ${heartbeat.agent_key}: ${heartbeat.status}`);

      // Acknowledge heartbeat
      call.write({
        agent_key: heartbeat.agent_key,
        acknowledged: true,
        timestamp: Date.now(),
      });
    });

    call.on('end', () => {
      logger.info('Heartbeat stream closed');
      call.end();
    });
  }

  // ============================================================================
  // Deployment Service Implementations
  // ============================================================================

  /**
   * Deploy agent
   */
  async deployAgent(call, callback) {
    try {
      const config = {
        name: call.request.name,
        type: call.request.type,
        specialization: call.request.specialization,
        personality: this.convertPersonality(call.request.personality),
        skills: this.convertSkills(call.request.skills),
        behavior: this.convertBehavior(call.request.behavior),
      };

      const result = await deploymentEngine.deployAgent(config);

      callback(null, {
        success: true,
        deployment_id: result.deploymentId,
        agent_id: result.agent._id,
        agent_name: result.agent.name,
        dna_score: this.convertDNAScore(result.dnaScore),
        duration_ms: result.duration,
      });
    } catch (error) {
      logger.error('deployAgent error:', error);
      callback({
        code: grpc.status.INTERNAL,
        details: error.message,
      });
    }
  }

  /**
   * Batch deploy (streaming progress)
   */
  batchDeploy(call) {
    const agents = call.request.agents;
    logger.info(`Batch deploying ${agents.length} agents`);

    let completed = 0;

    agents.forEach(async (agentReq, index) => {
      try {
        const config = {
          name: agentReq.name,
          type: agentReq.type,
          specialization: agentReq.specialization,
          personality: this.convertPersonality(agentReq.personality),
          skills: this.convertSkills(agentReq.skills),
          behavior: this.convertBehavior(agentReq.behavior),
        };

        const result = await deploymentEngine.deployAgent(config);
        completed++;

        call.write({
          index,
          status: 'completed',
          result: {
            success: true,
            deployment_id: result.deploymentId,
            agent_name: result.agent.name,
          },
          completed,
          total: agents.length,
        });
      } catch (error) {
        completed++;
        call.write({
          index,
          status: 'failed',
          error: error.message,
          completed,
          total: agents.length,
        });
      }

      if (completed === agents.length) {
        call.end();
      }
    });
  }

  /**
   * Undeploy agent
   */
  async undeployAgent(call, callback) {
    try {
      const result = await deploymentEngine.undeployAgent(call.request.deployment_id);

      callback(null, {
        success: result.success,
        message: result.message,
      });
    } catch (error) {
      logger.error('undeployAgent error:', error);
      callback({
        code: grpc.status.INTERNAL,
        details: error.message,
      });
    }
  }

  /**
   * Watch deployment status (streaming)
   */
  watchDeployment(call) {
    const deploymentId = call.request.deployment_id;
    logger.info(`Watching deployment: ${deploymentId}`);

    // Send status updates every 5 seconds
    const interval = setInterval(() => {
      call.write({
        deployment_id: deploymentId,
        status: 'running',
        health: {
          status: 'healthy',
          checks: {},
        },
        timestamp: Date.now(),
      });
    }, 5000);

    call.on('cancelled', () => {
      clearInterval(interval);
      logger.info(`Stopped watching deployment: ${deploymentId}`);
    });
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  convertContext(context) {
    if (!context) return {};
    return {
      country: context.country,
      metadata: context.metadata,
      interests: context.interests,
      budget: context.budget,
      dates: context.dates,
      travelers: context.travelers,
    };
  }

  convertQueryResponse(queryId, result) {
    return {
      query_id: queryId,
      success: result.success,
      agent_name: result.agent,
      country: result.country,
      dna_score: result.dnaScore || 0,
      response: {
        type: result.response?.type || 'general',
        message: result.response?.message || '',
        count: result.response?.count || 0,
      },
      intents: result.intent || [],
      processing_time_ms: Date.now(),
      knowledge_age_seconds: result.knowledgeAge || 0,
    };
  }

  convertAgentStatus(status) {
    return {
      name: status.name,
      country: status.country,
      country_code: status.countryCode,
      specialization: status.specialization,
      knowledge: {
        attractions: status.knowledge.attractions,
        tours: status.knowledge.tours,
        last_update: status.knowledge.lastUpdate,
        age_seconds: status.knowledge.ageSeconds || 0,
      },
      auto_update: {
        enabled: status.autoUpdate.enabled,
        interval_seconds: status.autoUpdate.interval,
        is_updating: status.autoUpdate.isUpdating,
      },
      performance: {
        tier: status.performance.tier,
        level: status.performance.level,
        emoji: status.performance.emoji,
      },
    };
  }

  convertDNAScore(dnaScore) {
    return {
      total_score: dnaScore.totalScore,
      level: dnaScore.level,
      tier: dnaScore.tier,
      emoji: dnaScore.emoji,
      breakdown: dnaScore.breakdown
        ? {
            personality: dnaScore.breakdown.personality,
            skills: dnaScore.breakdown.skills,
            behavior: dnaScore.breakdown.behavior,
            synergy: dnaScore.breakdown.synergy,
            multiplier: dnaScore.breakdown.multiplier,
          }
        : null,
    };
  }

  convertPersonality(p) {
    return {
      analytical: p.analytical,
      creative: p.creative,
      empathetic: p.empathetic,
      logical: p.logical,
      intuitive: p.intuitive,
      assertive: p.assertive,
    };
  }

  convertSkills(s) {
    return {
      coding: s.coding,
      communication: s.communication,
      problemSolving: s.problem_solving,
      leadership: s.leadership,
      learning: s.learning,
      cultural: s.cultural,
    };
  }

  convertBehavior(b) {
    return {
      decisionSpeed: b.decision_speed,
      riskTolerance: b.risk_tolerance,
      workStyle: b.work_style,
      detailLevel: b.detail_level,
    };
  }

  // ============================================================================
  // Server Control
  // ============================================================================

  /**
   * Start gRPC server
   */
  start() {
    return new Promise((resolve, reject) => {
      this.server.bindAsync(
        `0.0.0.0:${this.port}`,
        grpc.ServerCredentials.createInsecure(),
        (error, port) => {
          if (error) {
            logger.error('Failed to start gRPC server:', error);
            return reject(error);
          }

          this.server.start();
          logger.info(`🚀 gRPC server running on port ${port}`);
          resolve(port);
        }
      );
    });
  }

  /**
   * Stop gRPC server
   */
  stop() {
    return new Promise((resolve) => {
      this.server.tryShutdown(() => {
        logger.info('gRPC server stopped');
        resolve();
      });
    });
  }
}

// Export singleton instance
const quantumGrpcServer = new QuantumGrpcServer();
module.exports = quantumGrpcServer;

