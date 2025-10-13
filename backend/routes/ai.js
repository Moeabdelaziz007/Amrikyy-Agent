/**
 * AI Routes for Maya Trips
 * Z.ai GLM-4.6 Integration
 */

const express = require('express');
const router = express.Router();
const ZaiClient = require('../src/ai/zaiClient');
const { Tools, getToolSchemas } = require('../src/ai/tools');
const { buildCulturalSystemPrompt } = require('../src/ai/culture');
const { multimodalLimiter } = require('../middleware/rateLimiter');

// ============================================================================
// SECURITY: Input Sanitization for Prompt Injection Protection
// ============================================================================
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  
  return input
    // Remove potential script injections
    .replace(/<script|javascript:|data:/gi, '')
    // Remove template injection attempts
    .replace(/\{\{.*?\}\}/g, '')
    // Remove system prompt override attempts
    .replace(/ignore previous instructions/gi, '')
    .replace(/disregard all above/gi, '')
    // Remove potential command injection
    .replace(/;|\||&|`|\$/g, '')
    // Trim and limit length
    .trim()
    .substring(0, 10000);  // Max 10K characters
};

const validateAndSanitizeMessage = (message) => {
  if (!message) {
    throw new Error('Message is required');
  }
  
  const cleaned = sanitizeInput(message);
  
  if (cleaned.length < 1) {
    throw new Error('Message cannot be empty after sanitization');
  }
  
  if (cleaned.length > 10000) {
    throw new Error('Message too long (max 10,000 characters)');
  }
  
  return cleaned;
};

// Initialize Z.ai client
const zaiClient = new ZaiClient();

// Middleware for API key validation
const validateApiKey = (req, res, next) => {
  if (!process.env.ZAI_API_KEY) {
    return res.status(500).json({
      success: false,
      error: 'Z.ai API key not configured'
    });
  }
  next();
};

// Apply API key validation to all routes
router.use(validateApiKey);

/**
 * POST /api/ai/chat
 * General chat with Maya AI
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, userId, conversationHistory = [], useTools = false, region = 'ar' } = req.body;

    // ✅ SECURITY: Sanitize all user inputs to prevent prompt injection
    const cleanMessage = validateAndSanitizeMessage(message);
    const cleanHistory = conversationHistory.map(msg => ({
      role: msg.role,
      content: sanitizeInput(msg.content || '')
    }));
    const cleanRegion = sanitizeInput(region || 'ar').substring(0, 10);

    console.log(`🤖 Maya AI Chat - User: ${userId}, Message: ${cleanMessage.substring(0, 50)}...`);

    let response;
    if (!useTools) {
      const systemCulture = { role: 'system', content: buildCulturalSystemPrompt(cleanRegion) };
      response = await zaiClient.chatCompletion([
        systemCulture,
        ...cleanHistory,  // ✅ SECURITY: Use sanitized history
        { role: 'user', content: cleanMessage }  // ✅ SECURITY: Use sanitized message
      ], { maxTokens: 900 });
    } else {
      // Basic tool-calling orchestration loop (single step for simplicity)
      const toolSchemas = getToolSchemas();
      const toolListStr = toolSchemas.map(t => `- ${t.name}: ${t.description}`).join('\n');

      const toolAwareHistory = [
        ...cleanHistory,  // ✅ SECURITY: Use sanitized history
        { role: 'system', content: `You can call tools by replying in JSON with {"tool":"name","arguments":{...}}. Available tools:\n${toolListStr}\nIf no tool is needed, answer normally.` }
      ];

      const first = await zaiClient.chatCompletion([
        { role: 'system', content: 'You are Maya, a helpful travel assistant.' },
        { role: 'system', content: buildCulturalSystemPrompt(cleanRegion) },  // ✅ SECURITY: Use sanitized region
        ...toolAwareHistory,
        { role: 'user', content: cleanMessage }  // ✅ SECURITY: Use sanitized message
      ], {
        maxTokens: 500,
        enableKvCacheOffload: true,
        attentionImpl: 'flash-attn-3'
      });

      if (!first.success) {
        response = first;
      } else {
        const content = first.content?.trim() || '';
        let toolCall = null;
        try {
          if (content.startsWith('{') && content.endsWith('}')) {
            toolCall = JSON.parse(content);
          }
        } catch (_e) {}

        if (toolCall && toolCall.tool && typeof Tools[toolCall.tool] === 'function') {
          let toolResult;
          try {
            toolResult = await Tools[toolCall.tool](toolCall.arguments || {});
          } catch (e) {
            toolResult = { error: e.message || 'Tool execution failed' };
          }

          // Feed tool result back to the model for final answer
          const second = await zaiClient.chatCompletion([
            { role: 'system', content: 'You are Maya, a helpful travel assistant.' },
            { role: 'system', content: buildCulturalSystemPrompt(region) },
            ...toolAwareHistory,
            { role: 'user', content: message },
            { role: 'tool', content: JSON.stringify({ tool: toolCall.tool, result: toolResult }) }
          ], {
            maxTokens: 700,
            enableKvCacheOffload: true,
            attentionImpl: 'flash-attn-3'
          });
          response = second;
        } else {
          // No tool call, just return the first content
          response = first;
        }
      }
    }

    if (response.success) {
      res.json({
        success: true,
        reply: response.content,
        timestamp: new Date().toISOString(),
        model: 'glm-4.6'
      });
    } else {
      res.status(500).json({
        success: false,
        error: response.error || 'AI service error',
        reply: response.content
      });
    }

  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /api/ai/travel-recommendations
 * Generate travel recommendations
 */
router.post('/travel-recommendations', async (req, res) => {
  try {
    const { destination, budget, duration, preferences = [] } = req.body;

    if (!destination || !budget || !duration) {
      return res.status(400).json({
        success: false,
        error: 'Destination, budget, and duration are required'
      });
    }

    console.log(`🗺️ Travel Recommendations - ${destination}, Budget: $${budget}, Duration: ${duration} days`);

    const response = await zaiClient.generateTravelRecommendations(
      destination, 
      budget, 
      duration, 
      preferences
    );

    if (response.success) {
      res.json({
        success: true,
        recommendations: response.content,
        destination,
        budget,
        duration,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: response.error || 'Failed to generate recommendations',
        recommendations: response.content
      });
    }

  } catch (error) {
    console.error('Travel Recommendations Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /api/ai/budget-analysis
 * Generate budget analysis
 */
router.post('/budget-analysis', async (req, res) => {
  try {
    const { tripData, totalBudget } = req.body;

    if (!tripData || !totalBudget) {
      return res.status(400).json({
        success: false,
        error: 'Trip data and total budget are required'
      });
    }

    console.log(`💰 Budget Analysis - ${tripData.destination}, Budget: $${totalBudget}`);

    const response = await zaiClient.generateBudgetAnalysis(tripData, totalBudget);

    if (response.success) {
      res.json({
        success: true,
        analysis: response.content,
        tripData,
        totalBudget,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: response.error || 'Failed to generate budget analysis',
        analysis: response.content
      });
    }

  } catch (error) {
    console.error('Budget Analysis Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /api/ai/destination-insights
 * Generate destination insights
 */
router.post('/destination-insights', async (req, res) => {
  try {
    const { destination, travelType = 'leisure' } = req.body;

    if (!destination) {
      return res.status(400).json({
        success: false,
        error: 'Destination is required'
      });
    }

    console.log(`🌍 Destination Insights - ${destination}, Type: ${travelType}`);

    const response = await zaiClient.generateDestinationInsights(destination, travelType);

    if (response.success) {
      res.json({
        success: true,
        insights: response.content,
        destination,
        travelType,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: response.error || 'Failed to generate destination insights',
        insights: response.content
      });
    }

  } catch (error) {
    console.error('Destination Insights Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /api/ai/payment-recommendations
 * Generate payment recommendations
 */
router.post('/payment-recommendations', async (req, res) => {
  try {
    const { tripDetails, paymentMethod = 'credit_card' } = req.body;

    if (!tripDetails) {
      return res.status(400).json({
        success: false,
        error: 'Trip details are required'
      });
    }

    console.log(`💳 Payment Recommendations - ${tripDetails.destination}, Method: ${paymentMethod}`);

    const response = await zaiClient.generatePaymentRecommendations(tripDetails, paymentMethod);

    if (response.success) {
      res.json({
        success: true,
        recommendations: response.content,
        tripDetails,
        paymentMethod,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: response.error || 'Failed to generate payment recommendations',
        recommendations: response.content
      });
    }

  } catch (error) {
    console.error('Payment Recommendations Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /api/ai/multimodal/analyze
 * Analyze images/videos for trip planning insights
 * Rate limited: 20 requests per hour
 */
router.post('/multimodal/analyze', multimodalLimiter, async (req, res) => {
  try {
    const { prompt, imageUrls = [], videoUrl = null, options = {} } = req.body || {};

    if ((!imageUrls || imageUrls.length === 0) && !videoUrl) {
      return res.status(400).json({
        success: false,
        error: 'At least one image URL or a video URL is required'
      });
    }

    // Allow caller to optionally enable KV cache offload and FlashAttention 3
    const analysisOptions = {
      temperature: typeof options.temperature === 'number' ? options.temperature : 0.4,
      maxTokens: typeof options.maxTokens === 'number' ? options.maxTokens : 900,
      enableKvCacheOffload: options.enableKvCacheOffload === true,
      attentionImpl: options.attentionImpl || null
    };

    const response = await zaiClient.analyzeMedia({ prompt, imageUrls, videoUrl }, analysisOptions);

    if (response.success) {
      return res.json({
        success: true,
        analysis: response.content,
        providerData: response.data || null,
        timestamp: new Date().toISOString()
      });
    }

    return res.status(500).json({
      success: false,
      error: response.error || 'Failed to analyze media',
      analysis: response.content
    });
  } catch (error) {
    console.error('Multimodal Analyze Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/ai/health
 * Health check for AI service
 */
router.get('/health', async (req, res) => {
  try {
    console.log('🏥 AI Health Check...');
    
    const healthStatus = await zaiClient.healthCheck();

    res.json({
      success: healthStatus.success,
      status: healthStatus.status,
      service: 'Z.ai GLM-4.6',
      timestamp: new Date().toISOString(),
      error: healthStatus.error || null
    });

  } catch (error) {
    console.error('AI Health Check Error:', error);
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: error.message,
      service: 'Z.ai GLM-4.6'
    });
  }
});

/**
 * GET /api/ai/models
 * Get available models and capabilities
 */
router.get('/models', (req, res) => {
  res.json({
    success: true,
    models: {
      primary: 'glm-4.6',
      capabilities: [
        'text_generation',
        'travel_planning',
        'budget_analysis',
        'destination_insights',
        'payment_recommendations',
        'multilingual_support'
      ],
      languages: ['Arabic', 'English'],
      maxTokens: 2000,
      temperature: 0.7
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
