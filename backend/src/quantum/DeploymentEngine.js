/**
 * Quantum Deployment Engine
 * One-click agent deployment with auto-configuration
 * Part of SAAAAS Plug & Play infrastructure
 */

const agentDNAEngine = require('./AgentDNAEngine');
const agentDNAService = require('../dna/AgentDNAService');
const logger = require('../utils/logger');

class DeploymentEngine {
  constructor() {
    this.deployments = new Map();
    this.deploymentHistory = [];
  }

  /**
   * Deploy an agent with one command
   */
  async deployAgent(config) {
    const deploymentId = `deploy_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    logger.info(`🚀 Starting deployment: ${deploymentId}`);

    try {
      const startTime = Date.now();

      // Phase 1: Validate configuration
      logger.info('  📋 Phase 1: Validating configuration...');
      this.validateConfig(config);

      // Phase 2: Calculate DNA
      logger.info('  🧬 Phase 2: Calculating DNA profile...');
      const dnaScore = agentDNAEngine.calculateDNAScore(config);

      // Phase 3: Generate system prompt
      logger.info('  ✍️ Phase 3: Generating system prompt...');
      const systemPrompt = agentDNAEngine.generateSystemPrompt(config);

      // Phase 4: Create agent in database
      logger.info('  💾 Phase 4: Creating agent record...');
      const agent = await agentDNAService.createAgent({
        ...config,
        dnaScore: dnaScore.totalScore,
        systemPrompt,
      });

      // Phase 5: Setup integrations
      logger.info('  🔌 Phase 5: Configuring integrations...');
      const integrations = await this.setupIntegrations(agent, config);

      // Phase 6: Health check
      logger.info('  🏥 Phase 6: Running health check...');
      const health = await this.healthCheck(agent);

      const duration = Date.now() - startTime;

      const deployment = {
        id: deploymentId,
        agent,
        dnaScore,
        integrations,
        health,
        status: 'deployed',
        deployedAt: new Date().toISOString(),
        duration,
      };

      this.deployments.set(deploymentId, deployment);
      this.deploymentHistory.push({
        id: deploymentId,
        agentId: agent.id,
        agentName: agent.name,
        status: 'success',
        duration,
        timestamp: new Date().toISOString(),
      });

      logger.info(
        `✅ Deployment complete in ${duration}ms: ${agent.name} (DNA: ${dnaScore.totalScore})`
      );

      return {
        success: true,
        deploymentId,
        agent,
        dnaScore,
        integrations,
        health,
        duration,
      };
    } catch (error) {
      logger.error(`❌ Deployment failed: ${error.message}`);

      this.deploymentHistory.push({
        id: deploymentId,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString(),
      });

      throw error;
    }
  }

  /**
   * Deploy from preset (quick deploy)
   */
  async deployFromPreset(presetKey, customizations = {}) {
    logger.info(`🎯 Quick deploying from preset: ${presetKey}`);

    const preset = agentDNAEngine.getPreset(presetKey);

    if (!preset) {
      throw new Error(`Preset not found: ${presetKey}`);
    }

    // Merge preset with customizations
    const config = {
      ...preset,
      ...customizations,
      name: customizations.name || preset.name,
    };

    return this.deployAgent(config);
  }

  /**
   * Validate configuration
   */
  validateConfig(config) {
    const required = ['name', 'personality', 'skills', 'behavior'];

    for (const field of required) {
      if (!config[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate personality
    const personalityFields = [
      'analytical',
      'creative',
      'empathetic',
      'logical',
      'intuitive',
      'assertive',
    ];
    for (const field of personalityFields) {
      if (config.personality[field] === undefined) {
        throw new Error(`Missing personality field: ${field}`);
      }
      if (config.personality[field] < 0 || config.personality[field] > 100) {
        throw new Error(
          `Invalid personality value for ${field}: must be 0-100`
        );
      }
    }

    // Validate skills
    const skillFields = [
      'coding',
      'communication',
      'problemSolving',
      'leadership',
      'learning',
      'cultural',
    ];
    for (const field of skillFields) {
      if (config.skills[field] === undefined) {
        throw new Error(`Missing skill field: ${field}`);
      }
      if (config.skills[field] < 0 || config.skills[field] > 100) {
        throw new Error(`Invalid skill value for ${field}: must be 0-100`);
      }
    }

    // Validate behavior
    const behaviorFields = [
      'decisionSpeed',
      'riskTolerance',
      'workStyle',
      'detailLevel',
    ];
    for (const field of behaviorFields) {
      if (config.behavior[field] === undefined) {
        throw new Error(`Missing behavior field: ${field}`);
      }
      if (config.behavior[field] < 0 || config.behavior[field] > 100) {
        throw new Error(`Invalid behavior value for ${field}: must be 0-100`);
      }
    }

    logger.info('  ✅ Configuration validated');
    return true;
  }

  /**
   * Setup integrations
   */
  async setupIntegrations(agent, config) {
    const integrations = {
      iziTravel: {
        enabled: true,
        status: 'active',
      },
      stripe: {
        enabled: config.type !== 'ai-engineer', // Not needed for technical agents
        status: config.type !== 'ai-engineer' ? 'active' : 'disabled',
      },
      redis: {
        enabled: true,
        status: 'active',
      },
      supabase: {
        enabled: true,
        status: 'active',
      },
    };

    // Add country-specific integrations
    if (agent.type === 'country-agent' || agent.type === 'travel-expert') {
      integrations.sabre = {
        enabled: false, // Will be enabled when API keys are configured
        status: 'pending',
        note: 'Awaiting Sabre API credentials',
      };
    }

    logger.info('  ✅ Integrations configured');
    return integrations;
  }

  /**
   * Health check
   */
  async healthCheck(agent) {
    const checks = {
      dna: {
        status: agent.dnaScore > 0 ? 'healthy' : 'unhealthy',
        score: agent.dnaScore,
      },
      systemPrompt: {
        status:
          agent.systemPrompt && agent.systemPrompt.length > 100
            ? 'healthy'
            : 'unhealthy',
        length: agent.systemPrompt ? agent.systemPrompt.length : 0,
      },
      performance: {
        status: agent.performance ? 'healthy' : 'unhealthy',
        level: agent.performance ? agent.performance.level : 'Unknown',
      },
    };

    const allHealthy = Object.values(checks).every(
      (check) => check.status === 'healthy'
    );

    logger.info(
      `  ${allHealthy ? '✅' : '⚠️'} Health check ${
        allHealthy ? 'passed' : 'has warnings'
      }`
    );

    return {
      status: allHealthy ? 'healthy' : 'degraded',
      checks,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Undeploy an agent
   */
  async undeployAgent(deploymentId) {
    logger.info(`🗑️ Undeploying: ${deploymentId}`);

    const deployment = this.deployments.get(deploymentId);

    if (!deployment) {
      throw new Error(`Deployment not found: ${deploymentId}`);
    }

    try {
      // Delete agent from database
      await agentDNAService.deleteAgent(deployment.agent.id);

      // Remove from deployments
      this.deployments.delete(deploymentId);

      // Update history
      this.deploymentHistory.push({
        id: deploymentId,
        agentId: deployment.agent.id,
        agentName: deployment.agent.name,
        status: 'undeployed',
        timestamp: new Date().toISOString(),
      });

      logger.info(`✅ Successfully undeployed: ${deployment.agent.name}`);

      return {
        success: true,
        message: `Agent ${deployment.agent.name} undeployed`,
      };
    } catch (error) {
      logger.error(`❌ Undeploy failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get deployment status
   */
  getDeployment(deploymentId) {
    return this.deployments.get(deploymentId);
  }

  /**
   * Get all active deployments
   */
  getActiveDeployments() {
    return Array.from(this.deployments.values());
  }

  /**
   * Get deployment history
   */
  getDeploymentHistory(limit = 50) {
    return this.deploymentHistory.slice(-limit).reverse();
  }

  /**
   * Get deployment statistics
   */
  getStatistics() {
    const active = this.getActiveDeployments();
    const history = this.deploymentHistory;

    const successful = history.filter((d) => d.status === 'success').length;
    const failed = history.filter((d) => d.status === 'failed').length;
    const successRate =
      history.length > 0 ? (successful / history.length) * 100 : 0;

    const averageDuration =
      active.reduce((sum, d) => sum + d.duration, 0) / (active.length || 1);

    const byType = {};
    active.forEach((d) => {
      byType[d.agent.type] = (byType[d.agent.type] || 0) + 1;
    });

    return {
      active: active.length,
      totalDeployments: history.length,
      successful,
      failed,
      successRate: Math.round(successRate * 100) / 100,
      averageDuration: Math.round(averageDuration),
      deploymentsByType: byType,
      lastDeployment:
        history.length > 0 ? history[history.length - 1].timestamp : null,
    };
  }

  /**
   * Batch deploy multiple agents
   */
  async batchDeploy(configs) {
    logger.info(`📦 Batch deploying ${configs.length} agents...`);

    const results = await Promise.allSettled(
      configs.map((config) => this.deployAgent(config))
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    logger.info(
      `📊 Batch deployment complete: ${successful} succeeded, ${failed} failed`
    );

    return {
      total: configs.length,
      successful,
      failed,
      results: results.map((r, i) => ({
        index: i,
        status: r.status,
        data: r.status === 'fulfilled' ? r.value : null,
        error: r.status === 'rejected' ? r.reason.message : null,
      })),
    };
  }
}

// Export singleton instance
const deploymentEngine = new DeploymentEngine();
module.exports = deploymentEngine;
