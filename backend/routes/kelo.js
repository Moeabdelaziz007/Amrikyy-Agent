/**
 * Kelo AI API Routes
 * Advanced AI-powered endpoints using Kelo Code free/budget models
 * Optimized for cost-effective AI operations
 */

const express = require('express');
const router = express.Router();
const OpenRouterClient = require('../src/ai/openRouterClient');

// Initialize OpenRouter client (access to multiple AI models)
const keloClient = new OpenRouterClient();

/**
 * POST /api/kelo/chat
 * Advanced chat completion using Kelo AI
 */
router.post('/chat', async (req, res) => {
  try {
    const { 
      message, 
      history = [], 
      context = 'travel',
      temperature = 0.7,
      maxTokens = 1000
    } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Build conversation history
    const messages = [
      {
        role: 'system',
        content: getSystemPrompt(context)
      },
      ...history,
      {
        role: 'user',
        content: message
      }
    ];

    const response = await keloClient.chatCompletion(messages, {
      temperature: parseFloat(temperature),
      maxTokens: parseInt(maxTokens),
      budget: 'free' // Use free model for chat
    });

    res.json({
      success: true,
      response,
      context,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Kelo chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Chat completion failed',
      message: error.message
    });
  }
});

/**
 * POST /api/kelo/analyze
 * Advanced data analysis using Kelo AI
 */
router.post('/analyze', async (req, res) => {
  try {
    const { 
      data, 
      analysisType = 'general',
      insights = true,
      recommendations = true
    } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        error: 'Data is required for analysis'
      });
    }

    const analysisPrompt = `
      Perform ${analysisType} analysis on the following data:
      
      Data: ${JSON.stringify(data, null, 2)}
      
      ${insights ? 'Provide detailed insights and patterns.' : ''}
      ${recommendations ? 'Provide actionable recommendations.' : ''}
      
      Format the response as structured JSON with clear sections.
    `;

    const messages = [
      {
        role: 'system',
        content: 'You are an expert data analyst specializing in travel and business intelligence.'
      },
      {
        role: 'user',
        content: analysisPrompt
      }
    ];

    const response = await keloClient.chatCompletion(messages, {
      temperature: 0.2,
      maxTokens: 2000
    });

    res.json({
      success: true,
      analysis: response,
      type: analysisType,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Kelo analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Analysis failed',
      message: error.message
    });
  }
});

/**
 * POST /api/kelo/recommend
 * Generate recommendations using Kelo AI
 */
router.post('/recommend', async (req, res) => {
  try {
    const { 
      type = 'travel',
      preferences = {},
      budget = null,
      duration = null,
      destination = null
    } = req.body;

    const recommendationPrompt = `
      Generate ${type} recommendations based on:
      - Preferences: ${JSON.stringify(preferences)}
      ${budget ? `- Budget: $${budget}` : ''}
      ${duration ? `- Duration: ${duration} days` : ''}
      ${destination ? `- Destination: ${destination}` : ''}
      
      Provide detailed recommendations with:
      1. Specific suggestions
      2. Reasoning for each recommendation
      3. Estimated costs (if applicable)
      4. Implementation steps
      5. Alternative options
      
      Format as structured JSON.
    `;

    const messages = [
      {
        role: 'system',
        content: 'You are a travel and lifestyle recommendation expert with deep knowledge of destinations, activities, and user preferences.'
      },
      {
        role: 'user',
        content: recommendationPrompt
      }
    ];

    const response = await keloClient.chatCompletion(messages, {
      temperature: 0.6,
      maxTokens: 2500
    });

    res.json({
      success: true,
      recommendations: response,
      type,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Kelo recommendations error:', error);
    res.status(500).json({
      success: false,
      error: 'Recommendations failed',
      message: error.message
    });
  }
});

/**
 * POST /api/kelo/stream
 * Real-time streaming chat using Kelo AI
 */
router.post('/stream', async (req, res) => {
  try {
    const { 
      message, 
      history = [],
      context = 'travel'
    } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required for streaming'
      });
    }

    // Set up Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    const messages = [
      {
        role: 'system',
        content: getSystemPrompt(context)
      },
      ...history,
      {
        role: 'user',
        content: message
      }
    ];

    // For now, simulate streaming (Kelo AI streaming would be implemented here)
    const response = await keloClient.chatCompletion(messages, {
      temperature: 0.7,
      maxTokens: 1000
    });

    // Simulate streaming by sending chunks
    const words = response.split(' ');
    for (let i = 0; i < words.length; i++) {
      res.write(`data: ${JSON.stringify({
        type: 'chunk',
        content: words[i] + ' ',
        index: i,
        total: words.length
      })}\n\n`);
      
      // Small delay to simulate streaming
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    res.write(`data: ${JSON.stringify({
      type: 'complete',
      content: response,
      timestamp: new Date().toISOString()
    })}\n\n`);

    res.end();

  } catch (error) {
    console.error('Kelo streaming error:', error);
    res.write(`data: ${JSON.stringify({
      type: 'error',
      error: error.message
    })}\n\n`);
    res.end();
  }
});

/**
 * GET /api/kelo/status
 * Check Kelo AI service status
 */
router.get('/status', async (req, res) => {
  try {
    const healthCheck = await keloClient.healthCheck();
    
    res.json({
      success: true,
      status: 'healthy',
      kelo_ai: healthCheck,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/kelo/models
 * Get available Kelo AI models
 */
router.get('/models', async (req, res) => {
  try {
    // This would typically call Kelo AI's models endpoint
    const models = [
      {
        id: 'kelo-travel-pro',
        name: 'Kelo Travel Pro',
        description: 'Specialized for travel and hospitality',
        maxTokens: 4000,
        contextWindow: 8000
      },
      {
        id: 'kelo-general',
        name: 'Kelo General',
        description: 'General purpose AI model',
        maxTokens: 3000,
        contextWindow: 6000
      },
      {
        id: 'kelo-fast',
        name: 'Kelo Fast',
        description: 'Fast response model for simple queries',
        maxTokens: 1000,
        contextWindow: 2000
      }
    ];

    res.json({
      success: true,
      models,
      default: 'kelo-travel-pro',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch models',
      message: error.message
    });
  }
});

/**
 * POST /api/kelo/embeddings
 * Generate embeddings using Kelo AI
 */
router.post('/embeddings', async (req, res) => {
  try {
    const { text, model = 'kelo-embedding-v1' } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required for embeddings'
      });
    }

    // This would typically call Kelo AI's embeddings endpoint
    // For now, return a mock response
    const embeddings = {
      model,
      embeddings: Array(1536).fill(0).map(() => Math.random()),
      usage: {
        prompt_tokens: text.split(' ').length,
        total_tokens: text.split(' ').length
      }
    };

    res.json({
      success: true,
      embeddings,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Kelo embeddings error:', error);
    res.status(500).json({
      success: false,
      error: 'Embeddings generation failed',
      message: error.message
    });
  }
});

/**
 * Get system prompt based on context
 */
function getSystemPrompt(context) {
  const prompts = {
    travel: 'You are Maya, a professional travel agent specializing in personalized travel experiences. Provide helpful, accurate, and engaging travel advice.',
    business: 'You are a business consultant specializing in travel industry analysis and strategy. Provide professional business insights and recommendations.',
    general: 'You are a helpful AI assistant. Provide accurate, helpful, and engaging responses to user queries.',
    technical: 'You are a technical expert specializing in software development and AI systems. Provide detailed technical guidance and solutions.'
  };

  return prompts[context] || prompts.general;
}

module.exports = router;
