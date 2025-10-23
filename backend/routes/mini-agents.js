/**
 * Mini Agents API Routes
 * Endpoints for all 8 Mini Agent Services
 */

const express = require('express');
const router = express.Router();
const AgentOrchestrator = require('../src/services/AgentOrchestrator');

// Initialize orchestrator
const orchestrator = new AgentOrchestrator();

/**
 * GET /api/mini-agents/status
 * Get status of all agents
 */
router.get('/status', async (req, res) => {
  try {
    const status = orchestrator.getAllAgentsStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/mini-agents/:agentName/execute
 * Execute a task on specific agent
 */
router.post('/:agentName/execute', async (req, res) => {
  try {
    const { agentName } = req.params;
    const task = req.body;

    const result = await orchestrator.delegateTask(agentName, task);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/mini-agents/workflow/execute
 * Execute a complete workflow
 */
router.post('/workflow/execute', async (req, res) => {
  try {
    const workflow = req.body;
    const result = await orchestrator.executeWorkflow(workflow);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/mini-agents/workflow/templates
 * Get predefined workflow templates
 */
router.get('/workflow/templates', async (req, res) => {
  try {
    const templates = orchestrator.getWorkflowTemplates();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/mini-agents/workflow/history
 * Get workflow execution history
 */
router.get('/workflow/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const history = orchestrator.getWorkflowHistory(limit);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/mini-agents/workflow/:workflowId
 * Get specific workflow details
 */
router.get('/workflow/:workflowId', async (req, res) => {
  try {
    const { workflowId } = req.params;
    const workflow = orchestrator.getWorkflow(workflowId);
    res.json(workflow);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Individual agent endpoints

/**
 * Navigator Agent Endpoints
 */
router.post('/navigator/directions', async (req, res) => {
  try {
    const { origin, destination, mode } = req.body;
    const result = await orchestrator.delegateTask('navigator', {
      type: 'GET_DIRECTIONS',
      origin,
      destination,
      mode
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/navigator/nearby', async (req, res) => {
  try {
    const { location, placeType, radius } = req.body;
    const result = await orchestrator.delegateTask('navigator', {
      type: 'FIND_NEARBY',
      location,
      placeType,
      radius
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Vision Agent Endpoints
 */
router.post('/vision/analyze', async (req, res) => {
  try {
    const { imageUrl, prompt } = req.body;
    const result = await orchestrator.delegateTask('vision', {
      type: 'ANALYZE_IMAGE',
      imageUrl,
      prompt
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/vision/extract-text', async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const result = await orchestrator.delegateTask('vision', {
      type: 'EXTRACT_TEXT',
      imageUrl
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Research Agent Endpoints
 */
router.post('/research/search', async (req, res) => {
  try {
    const { query, options } = req.body;
    const result = await orchestrator.delegateTask('research', {
      type: 'WEB_SEARCH',
      query,
      options
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/research/hotels', async (req, res) => {
  try {
    const { location, filters } = req.body;
    const result = await orchestrator.delegateTask('research', {
      type: 'FIND_HOTELS',
      location,
      filters
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Translator Agent Endpoints
 */
router.post('/translator/translate', async (req, res) => {
  try {
    const { text, targetLang, sourceLang } = req.body;
    const result = await orchestrator.delegateTask('translator', {
      type: 'TRANSLATE_TEXT',
      text,
      targetLang,
      sourceLang
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/translator/detect', async (req, res) => {
  try {
    const { text } = req.body;
    const result = await orchestrator.delegateTask('translator', {
      type: 'DETECT_LANGUAGE',
      text
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Scheduler Agent Endpoints
 */
router.post('/scheduler/events', async (req, res) => {
  try {
    const event = req.body;
    const result = await orchestrator.delegateTask('scheduler', {
      type: 'CREATE_EVENT',
      event
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/scheduler/events', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const result = await orchestrator.delegateTask('scheduler', {
      type: 'GET_EVENTS',
      startDate,
      endDate
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Storage Agent Endpoints
 */
router.post('/storage/documents', async (req, res) => {
  try {
    const { content, filename, metadata } = req.body;
    const result = await orchestrator.delegateTask('storage', {
      type: 'SAVE_DOCUMENT',
      content,
      filename,
      metadata
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/storage/itinerary', async (req, res) => {
  try {
    const tripData = req.body;
    const result = await orchestrator.delegateTask('storage', {
      type: 'CREATE_ITINERARY',
      tripData
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Media Agent Endpoints
 */
router.post('/media/search', async (req, res) => {
  try {
    const { query, maxResults } = req.body;
    const result = await orchestrator.delegateTask('media', {
      type: 'SEARCH_VIDEOS',
      query,
      maxResults
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/media/travel-videos', async (req, res) => {
  try {
    const { destination } = req.body;
    const result = await orchestrator.delegateTask('media', {
      type: 'SEARCH_TRAVEL_VIDEOS',
      destination
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Communicator Agent Endpoints
 */
router.post('/communicator/email', async (req, res) => {
  try {
    const { to, subject, body } = req.body;
    const result = await orchestrator.delegateTask('communicator', {
      type: 'SEND_EMAIL',
      to,
      subject,
      body
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/communicator/notification', async (req, res) => {
  try {
    const { userId, message } = req.body;
    const result = await orchestrator.delegateTask('communicator', {
      type: 'SEND_NOTIFICATION',
      userId,
      message
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Coding Agent Endpoints (Super Coder with 6 Sub-Agents)
 */
router.post('/coding/generate', async (req, res) => {
  try {
    const { prompt, language, framework, complexity } = req.body;
    const result = await orchestrator.delegateTask('coding', {
      type: 'GENERATE_CODE',
      prompt,
      language,
      framework,
      complexity
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/coding/review', async (req, res) => {
  try {
    const { code, language } = req.body;
    const result = await orchestrator.delegateTask('coding', {
      type: 'REVIEW_CODE',
      code,
      language
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/coding/test', async (req, res) => {
  try {
    const { code, language, framework } = req.body;
    const result = await orchestrator.delegateTask('coding', {
      type: 'GENERATE_TESTS',
      code,
      language,
      framework
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/coding/document', async (req, res) => {
  try {
    const { code, language, format } = req.body;
    const result = await orchestrator.delegateTask('coding', {
      type: 'GENERATE_DOCS',
      code,
      language,
      format
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/coding/deploy', async (req, res) => {
  try {
    const { project, platform, config } = req.body;
    const result = await orchestrator.delegateTask('coding', {
      type: 'DEPLOY_PROJECT',
      project,
      platform,
      config
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/coding/full-project', async (req, res) => {
  try {
    const { description, stack, features } = req.body;
    const result = await orchestrator.delegateTask('coding', {
      type: 'FULL_PROJECT',
      description,
      stack,
      features
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
