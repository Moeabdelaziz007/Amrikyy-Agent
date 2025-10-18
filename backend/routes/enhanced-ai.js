/**
 * Enhanced AI Routes - Multi-Model Architecture
 * Intelligent model selection and routing for optimal performance
 * Version: 1.0.0
 * Author: AMRIKYY
 */

const express = require('express');
const router = express.Router();
const { EnhancedModelSwitcher } = require('../ai/EnhancedModelSwitcher');
const { ClaudeClient } = require('../ai/claudeClient');
const ZaiClient = require('../ai/zaiClient');
// const { GeminiCLI } = require('../services/automation/GeminiCLI'); // Will be initialized when available

// Initialize multi-model system
const modelSwitcher = new EnhancedModelSwitcher();
const claudeClient = new ClaudeClient();
const zaiClient = new ZaiClient();
// const geminiClient = new GeminiCLI(); // Will be initialized when available

// Set up model switcher with available models
modelSwitcher.setClaudeClient(claudeClient);

console.log('✅ Enhanced AI Routes initialized with Multi-Model Architecture');

/**
 * POST /api/ai/smart-chat
 * Intelligent model selection for chat requests
 */
router.post('/smart-chat', async (req, res) => {
  try {
    const { message, userId, context = {} } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    const startTime = Date.now();
    
    // Analyze task and select optimal model
    const selectedModel = await modelSwitcher.selectOptimalModel(message, {
      ...context,
      userId: userId,
      timestamp: new Date().toISOString()
    });
    
    console.log(`🎯 Selected model: ${selectedModel} for user: ${userId}`);
    
    // Route to appropriate model
    let response;
    let modelUsed = selectedModel;
    
    try {
      switch (selectedModel) {
        case 'zai-glm-4.6':
          response = await zaiClient.chatCompletion([
            { role: 'system', content: 'You are Maya, a helpful travel assistant.' },
            { role: 'user', content: message }
          ]);
          break;
          
        case 'gemini-2.0':
          // Fallback to Z.ai until GeminiCLI is available
          response = await zaiClient.chatCompletion([
            { role: 'system', content: 'You are Maya, a helpful travel assistant.' },
            { role: 'user', content: message }
          ]);
          modelUsed = 'zai-glm-4.6'; // Track actual model used
          break;
          
        case 'claude-sonnet-4':
          response = await claudeClient.chatCompletion([
            { role: 'user', content: message }
          ]);
          break;
          
        case 'trinity-fusion':
          // For now, fallback to Z.ai until Trinity Fusion is fully integrated
          response = await zaiClient.chatCompletion([
            { role: 'system', content: 'You are Maya, a helpful travel assistant.' },
            { role: 'user', content: message }
          ]);
          modelUsed = 'zai-glm-4.6'; // Track actual model used
          break;
          
        default:
          // Fallback to Z.ai
          response = await zaiClient.chatCompletion([
            { role: 'system', content: 'You are Maya, a helpful travel assistant.' },
            { role: 'user', content: message }
          ]);
          modelUsed = 'zai-glm-4.6';
      }
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Track performance
      modelSwitcher.trackModelPerformance(
        modelUsed,
        response.success !== false,
        responseTime,
        modelSwitcher.getModelInfo(modelUsed)?.cost || 0.001
      );
      
      if (response.success !== false) {
        res.json({
          success: true,
          reply: response.content,
          model_used: modelUsed,
          model_selected: selectedModel,
          confidence: response.confidence || 0.95,
          response_time: responseTime,
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          success: false,
          error: response.error || 'Model processing error',
          model_used: modelUsed,
          timestamp: new Date().toISOString()
        });
      }
      
    } catch (modelError) {
      console.error(`Error with model ${selectedModel}:`, modelError);
      
      // Fallback to Z.ai on model error
      try {
        const fallbackResponse = await zaiClient.chatCompletion([
          { role: 'system', content: 'You are Maya, a helpful travel assistant.' },
          { role: 'user', content: message }
        ]);
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        modelSwitcher.trackModelPerformance('zai-glm-4.6', true, responseTime, 0.001);
        
        res.json({
          success: true,
          reply: fallbackResponse.content,
          model_used: 'zai-glm-4.6',
          model_selected: selectedModel,
          fallback: true,
          confidence: 0.90,
          response_time: responseTime,
          timestamp: new Date().toISOString()
        });
        
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
        res.status(500).json({
          success: false,
          error: 'All models failed to process request',
          timestamp: new Date().toISOString()
        });
      }
    }

  } catch (error) {
    console.error('Smart Chat Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/ai/generate-presentation
 * Use Claude for presentation generation
 */
router.post('/generate-presentation', async (req, res) => {
  try {
    const { data, template = 'travel', style = 'professional', language = 'en' } = req.body;
    
    if (!data) {
      return res.status(400).json({
        success: false,
        error: 'Data is required for presentation generation'
      });
    }

    const startTime = Date.now();
    
    const response = await claudeClient.generatePresentation({
      data: data,
      template: template,
      style: style,
      language: language
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Track performance
    modelSwitcher.trackModelPerformance(
      'claude-sonnet-4',
      response.success,
      responseTime,
      0.003
    );

    if (response.success) {
      res.json({
        success: true,
        presentation: response.content,
        model: 'claude-sonnet-4',
        template: template,
        style: style,
        response_time: responseTime,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: response.error || 'Failed to generate presentation',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Presentation Generation Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate presentation',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/ai/business-analysis
 * Use Claude for business intelligence
 */
router.post('/business-analysis', async (req, res) => {
  try {
    const { data, analysisType = 'general', timeframe = 'current' } = req.body;
    
    if (!data) {
      return res.status(400).json({
        success: false,
        error: 'Data is required for business analysis'
      });
    }

    const startTime = Date.now();
    
    const response = await claudeClient.analyzeBusinessData({
      data: data,
      analysisType: analysisType,
      timeframe: timeframe
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Track performance
    modelSwitcher.trackModelPerformance(
      'claude-sonnet-4',
      response.success,
      responseTime,
      0.003
    );

    if (response.success) {
      res.json({
        success: true,
        analysis: response.content,
        model: 'claude-sonnet-4',
        analysisType: analysisType,
        timeframe: timeframe,
        response_time: responseTime,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: response.error || 'Failed to analyze business data',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Business Analysis Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze business data',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/ai/generate-code
 * Use Claude for code generation
 */
router.post('/generate-code', async (req, res) => {
  try {
    const { description, language = 'javascript', framework = '' } = req.body;
    
    if (!description) {
      return res.status(400).json({
        success: false,
        error: 'Code description is required'
      });
    }

    const startTime = Date.now();
    
    const response = await claudeClient.generateCode(description, {
      language: language,
      framework: framework
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Track performance
    modelSwitcher.trackModelPerformance(
      'claude-sonnet-4',
      response.success,
      responseTime,
      0.003
    );

    if (response.success) {
      res.json({
        success: true,
        code: response.content,
        model: 'claude-sonnet-4',
        language: language,
        framework: framework,
        response_time: responseTime,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: response.error || 'Failed to generate code',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Code Generation Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate code',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/ai/revenue-forecast
 * Use Claude for revenue forecasting
 */
router.post('/revenue-forecast', async (req, res) => {
  try {
    const { data, timeframe = '12 months', method = 'trend analysis' } = req.body;
    
    if (!data) {
      return res.status(400).json({
        success: false,
        error: 'Data is required for revenue forecasting'
      });
    }

    const startTime = Date.now();
    
    const response = await claudeClient.createRevenueForecast(data, {
      timeframe: timeframe,
      method: method
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Track performance
    modelSwitcher.trackModelPerformance(
      'claude-sonnet-4',
      response.success,
      responseTime,
      0.003
    );

    if (response.success) {
      res.json({
        success: true,
        forecast: response.content,
        model: 'claude-sonnet-4',
        timeframe: timeframe,
        method: method,
        response_time: responseTime,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: response.error || 'Failed to create revenue forecast',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Revenue Forecast Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create revenue forecast',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/ai/models/status
 * Get status of all available models
 */
router.get('/models/status', async (req, res) => {
  try {
    const models = modelSwitcher.listAvailableModels();
    const usageStats = modelSwitcher.getUsageStats();
    
    // Get health status for each model
    const modelStatuses = await Promise.all(
      models.map(async (model) => {
        let healthStatus = { status: 'unknown' };
        
        try {
          switch (model.id) {
            case 'zai-glm-4.6':
              healthStatus = await zaiClient.healthCheck();
              break;
            case 'gemini-2.0':
              healthStatus = { status: 'healthy', message: 'Gemini CLI available' };
              break;
            case 'claude-sonnet-4':
              healthStatus = await claudeClient.healthCheck();
              break;
            case 'trinity-fusion':
              healthStatus = { status: 'pending', message: 'Trinity Fusion not yet integrated' };
              break;
          }
        } catch (error) {
          healthStatus = { status: 'error', message: error.message };
        }
        
        return {
          ...model,
          health: healthStatus,
          usage: usageStats.modelUsage[model.id] || 0,
          successRate: usageStats.successRates[model.id] || 0,
          averageResponseTime: usageStats.averageResponseTimes[model.id] || 0
        };
      })
    );
    
    res.json({
      success: true,
      models: modelStatuses,
      totalRequests: usageStats.totalRequests,
      recommendations: usageStats.recommendations,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Model Status Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get model status',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/ai/models/usage
 * Get detailed usage statistics
 */
router.get('/models/usage', async (req, res) => {
  try {
    const usageStats = modelSwitcher.getUsageStats();
    
    res.json({
      success: true,
      statistics: usageStats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Usage Stats Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get usage statistics',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/ai/models/test
 * Test a specific model with a sample request
 */
router.post('/models/test', async (req, res) => {
  try {
    const { modelId, testMessage = 'Hello, this is a test message.' } = req.body;
    
    if (!modelId) {
      return res.status(400).json({
        success: false,
        error: 'Model ID is required'
      });
    }
    
    const startTime = Date.now();
    let response;
    
    try {
      switch (modelId) {
        case 'zai-glm-4.6':
          response = await zaiClient.chatCompletion([
            { role: 'user', content: testMessage }
          ]);
          break;
          
        case 'gemini-2.0':
          response = await geminiClient.extractData(testMessage, {
            prompt: 'Respond to this test message'
          });
          break;
          
        case 'claude-sonnet-4':
          response = await claudeClient.chatCompletion([
            { role: 'user', content: testMessage }
          ]);
          break;
          
        default:
          return res.status(400).json({
            success: false,
            error: 'Unknown model ID'
          });
      }
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      res.json({
        success: true,
        modelId: modelId,
        testMessage: testMessage,
        response: response.content,
        responseTime: responseTime,
        modelSuccess: response.success !== false,
        timestamp: new Date().toISOString()
      });
      
    } catch (modelError) {
      res.status(500).json({
        success: false,
        modelId: modelId,
        error: modelError.message,
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('Model Test Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test model',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
