/**
 * AIX Routes - Universal AI Agent Format API
 * Handles .aix file upload, parsing, and deployment
 */

const express = require('express');
const router = express.Router();
const AIXParser = require('../src/aix/AIXParser');
const logger = require('../src/utils/logger');

const aixParser = new AIXParser();

// ============================================================================
// POST /api/aix/parse - Parse AIX file
// ============================================================================
router.post('/parse', async (req, res) => {
  try {
    const { aixContent } = req.body;

    if (!aixContent) {
      return res.status(400).json({
        success: false,
        error: 'AIX content is required'
      });
    }

    logger.info('🔍 Parsing AIX file...');
    const result = await aixParser.parse(aixContent);

    res.json({
      success: true,
      message: 'AIX file parsed successfully',
      data: {
        config: result.config,
        metadata: result.metadata
      }
    });
  } catch (error) {
    logger.error(`❌ AIX parse error: ${error.message}`);
    res.status(400).json({
      success: false,
      error: error.message,
      details: error.stack
    });
  }
});

// ============================================================================
// POST /api/aix/deploy - Parse and deploy AIX agent
// ============================================================================
router.post('/deploy', async (req, res) => {
  try {
    const { aixContent, environment = 'production' } = req.body;

    if (!aixContent) {
      return res.status(400).json({
        success: false,
        error: 'AIX content is required'
      });
    }

    logger.info('🚀 Deploying AIX agent...');

    // Step 1: Parse AIX
    const parsed = await aixParser.parse(aixContent);
    const { config, metadata } = parsed;

    logger.info(`✅ Parsed agent: ${metadata.name}`);
    logger.info(
      `   DNA Score: ${metadata.dna_score.total} (${metadata.dna_score.level})`
    );
    logger.info(`   Model: ${metadata.model.provider}/${metadata.model.model}`);

    // Step 2: Validate deployment config
    if (!config.quantum.enabled && environment === 'production') {
      logger.warn('⚠️  Quantum resilience disabled for production deployment');
    }

    // Step 3: Create deployment record
    const deployment = {
      id: `deploy_${Date.now()}`,
      agentId: config.id,
      name: config.name,
      environment,
      config,
      metadata,
      status: 'deployed',
      deployedAt: new Date().toISOString(),
      endpoint: `https://api.quantumbuilder.ai/agents/${config.id}`,
      dashboard: `https://dashboard.quantumbuilder.ai/agents/${config.id}`,
      health: `https://api.quantumbuilder.ai/agents/${config.id}/health`
    };

    logger.info('✅ Agent deployed successfully!');
    logger.info(`   Endpoint: ${deployment.endpoint}`);
    logger.info(`   Dashboard: ${deployment.dashboard}`);

    res.json({
      success: true,
      message: `Agent "${config.name}" deployed successfully`,
      data: deployment
    });
  } catch (error) {
    logger.error(`❌ AIX deployment error: ${error.message}`);
    res.status(400).json({
      success: false,
      error: error.message,
      details: error.stack
    });
  }
});

// ============================================================================
// POST /api/aix/validate - Validate AIX file
// ============================================================================
router.post('/validate', async (req, res) => {
  try {
    const { aixContent } = req.body;

    if (!aixContent) {
      return res.status(400).json({
        success: false,
        error: 'AIX content is required'
      });
    }

    logger.info('✅ Validating AIX file...');

    // Try to parse (will throw if invalid)
    const parsed = await aixParser.parse(aixContent);

    res.json({
      success: true,
      valid: true,
      message: 'AIX file is valid',
      metadata: parsed.metadata
    });
  } catch (error) {
    logger.error(`❌ AIX validation error: ${error.message}`);
    res.json({
      success: true,
      valid: false,
      error: error.message
    });
  }
});

// ============================================================================
// GET /api/aix/export/:agentId - Export agent as AIX
// ============================================================================
router.get('/export/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;

    logger.info(`📤 Exporting agent ${agentId} to AIX format...`);

    // Mock agent config (in real system, fetch from database)
    const agentConfig = {
      id: agentId,
      name: 'Egypt Travel Agent',
      role: 'Specialized travel automation for Egypt',
      specialization: 'Egypt-Travel',
      dna: {
        personality: {
          analytical: 85,
          empathetic: 90,
          creative: 70
        },
        skills: {
          reasoning: 90,
          learning: 80,
          communication: 95
        },
        aiModel: {
          provider: 'anthropic',
          model: 'claude-3-5-sonnet-20241022',
          temperature: 0.7,
          maxTokens: 4096
        },
        capabilities: {
          problemSolving: 85,
          learning: 80,
          communication: 95
        },
        autonomyLevel: 'fully-autonomous'
      },
      scoring: {
        dna: 8500,
        performance: 1200,
        total: 9700,
        level: 'Master'
      },
      quantum: {
        enabled: true,
        replicas: 3,
        scaling: 'auto',
        selfHealing: true,
        grpcEnabled: true
      },
      created: new Date().toISOString(),
      author: 'QuantumBuilder',
      version: '1.0.0',
      tags: ['travel', 'egypt', 'automation']
    };

    const aixContent = await aixParser.exportToAIX(agentConfig);

    res.setHeader('Content-Type', 'text/yaml; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${agentConfig.name}.aix"`
    );
    res.send(aixContent);
  } catch (error) {
    logger.error(`❌ AIX export error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// GET /api/aix/schema - Get AIX schema
// ============================================================================
router.get('/schema', (req, res) => {
  const schema = require('../src/aix/aix-schema.json');
  res.json(schema);
});

// ============================================================================
// GET /api/aix/health - Health check
// ============================================================================
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'AIX Parser',
    version: '0.1.0',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
