/**
 * AIX Enhanced Telegram Bot Handler
 * Integrates AIX Enhanced Cursor Manager with Telegram Bot API
 * Provides intelligent agent orchestration for travel planning
 */

const express = require('express');
const router = express.Router();
const winston = require('winston');
const fetch = require('node-fetch');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'aix-telegram-bot' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

/**
 * Telegram Webhook Handler
 * Processes incoming Telegram messages and routes them to appropriate AIX agents
 */
router.post('/webhook', async (req, res) => {
  const startTime = Date.now();
  
  try {
    logger.info('📨 Received Telegram webhook', {
      timestamp: new Date().toISOString(),
      body: req.body
    });

    // Validate webhook data
    if (!req.body || !req.body.message) {
      logger.warn('⚠️ Invalid webhook data received');
      return res.status(400).json({ error: 'Invalid webhook data' });
    }

    const message = req.body.message;
    const chatId = message.chat.id;
    const userId = message.from.id;
    const messageText = message.text || '';
    const messageType = message.photo ? 'photo' : 'text';

    logger.info('📝 Processing message', {
      chatId,
      userId,
      messageType,
      textLength: messageText.length
    });

    // Send instant typing feedback to user
    await sendTelegramChatAction(chatId, 'typing');

    // Check if AIX Manager is available
    if (!global.aixManager) {
      logger.error('❌ AIX Manager not initialized');
      return res.status(503).json({ error: 'AIX Manager not available' });
    }

    // Process message through AIX Manager
    const task = {
      description: messageText,
      parameters: {
        chatId,
        userId,
        messageType,
        platform: 'telegram',
        userInfo: {
          firstName: message.from.first_name,
          lastName: message.from.last_name,
          username: message.from.username,
          languageCode: message.from.language_code
        }
      },
      context: {
        source: 'telegram_webhook',
        priority: 'normal',
        sessionId: `telegram_${chatId}_${Date.now()}`,
        platform: 'telegram'
      }
    };

    logger.info('🎯 Sending task to AIX Manager', { task });

    // Orchestrate task through AIX Manager
    const result = await global.aixManager.orchestrateTask(task);
    
    const processingTime = Date.now() - startTime;
    
    logger.info('✅ Task completed', {
      processingTime,
      selectedAgent: result.analysis?.selectedAgent,
      confidence: result.analysis?.confidence
    });

    // Send intelligent response back to Telegram
    let responseText = 'I apologize, I encountered an issue processing your request.';
    
    if (result.output) {
      responseText = result.output;
    } else if (result.result && result.result.output) {
      responseText = result.result.output;
    } else if (result.results && result.results.length > 0) {
      // Combine results from multiple agents
      responseText = result.results.map(r => r.result || r.output).join('\n\n');
    }
    
    await sendTelegramMessage(chatId, responseText);

    res.json({
      success: true,
      processingTime,
      selectedAgent: result.analysis?.selectedAgent,
      confidence: result.analysis?.confidence
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    logger.error('❌ Webhook processing failed', {
      error: error.message,
      stack: error.stack,
      processingTime
    });

    // Send error message to user
    try {
      const chatId = req.body?.message?.chat?.id;
      if (chatId) {
        await sendTelegramMessage(chatId, 'Sorry, I encountered an error. Please try again.');
      }
    } catch (sendError) {
      logger.error('❌ Failed to send error message', { error: sendError.message });
    }

    res.status(500).json({
      error: 'Internal server error',
      processingTime
    });
  }
});

/**
 * Health Check Endpoint
 */
router.get('/health', (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    aixManager: !!global.aixManager,
    agents: global.aixManager ? global.aixManager.getAvailableAgents().length : 0
  };

  logger.info('🏥 Health check requested', health);
  res.json(health);
});

/**
 * Agent Status Endpoint
 */
router.get('/agents', (req, res) => {
  try {
    if (!global.aixManager) {
      return res.status(503).json({ error: 'AIX Manager not available' });
    }

    const agents = global.aixManager.getAvailableAgents();
    
    logger.info('🤖 Agent status requested', { agentCount: agents.length });
    
    res.json({
      agents,
      total: agents.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Failed to get agent status', { error: error.message });
    res.status(500).json({ error: 'Failed to get agent status' });
  }
});

/**
 * Test Endpoint for Manual Testing
 */
router.post('/test', async (req, res) => {
  try {
    const { message, chatId = 'test_chat', userId = 'test_user' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    logger.info('🧪 Test message received', { message, chatId, userId });

    if (!global.aixManager) {
      return res.status(503).json({ error: 'AIX Manager not available' });
    }

    const task = {
      description: message,
      parameters: {
        chatId,
        userId,
        messageType: 'text',
        platform: 'test',
        userInfo: {
          firstName: 'Test',
          lastName: 'User',
          username: 'testuser'
        }
      },
      context: {
        source: 'test_endpoint',
        priority: 'normal',
        sessionId: `test_${Date.now()}`,
        platform: 'test'
      }
    };

    const result = await global.aixManager.orchestrateTask(task);

    res.json({
      success: true,
      input: message,
      output: result.output,
      selectedAgent: result.analysis?.selectedAgent,
      confidence: result.analysis?.confidence,
      processingTime: result.responseTime
    });

  } catch (error) {
    logger.error('❌ Test failed', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * Send chat action to Telegram (typing, uploading_photo, etc.)
 */
async function sendTelegramChatAction(chatId, action) {
  try {
    const telegramApiUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendChatAction`;
    
    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        action: action
      })
    });

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }

    const result = await response.json();
    logger.debug('📤 Chat action sent to Telegram', { chatId, action, result: result.ok });
    
    return result;

  } catch (error) {
    logger.error('❌ Failed to send Telegram chat action', {
      error: error.message,
      chatId,
      action
    });
    // Don't throw error for chat actions, just log it
  }
}

/**
 * Send message to Telegram
 */
async function sendTelegramMessage(chatId, text) {
  try {
    const telegramApiUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown'
      })
    });

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }

    const result = await response.json();
    logger.info('📤 Message sent to Telegram', { chatId, messageId: result.result?.message_id });
    
    return result;

  } catch (error) {
    logger.error('❌ Failed to send Telegram message', { 
      error: error.message, 
      chatId 
    });
    throw error;
  }
}

module.exports = router;