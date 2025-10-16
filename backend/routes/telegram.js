/**
 * Telegram Webhook Integration for Maya Travel Agent
 * Integrates with AIXEnhancedCursorManager for intelligent task orchestration
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Import core systems
const logger = require('../utils/logger');
const conversationManager = require('../utils/conversationManager');
const { errorHandler } = require('../utils/errorHandler');

// Import AIX Manager
const AIXEnhancedCursorManager = require('../src/agents/AIXEnhancedCursorManager');

// Initialize AIX Manager
let manager;
(async () => {
  try {
    manager = new AIXEnhancedCursorManager();
    await manager.initialize();
    logger.info('🤖 AIX Enhanced Cursor Manager initialized for Telegram webhook');
  } catch (error) {
    logger.error('❌ Failed to initialize AIX Manager for Telegram webhook:', error);
  }
})();

/**
 * Telegram webhook verification middleware
 */
const verifyTelegramWebhook = (req, res, next) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    logger.warn('⚠️ Telegram bot token not configured');
    return next();
  }

  const secret = crypto.createHash('sha256').update(token).digest();
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(req.body));
  const computedSignature = hmac.digest('hex');

  const signature = req.header('X-Telegram-Signature');
  if (!signature) {
    logger.warn('⚠️ No Telegram signature provided');
    return next();
  }

  if (computedSignature === signature) {
    next();
  } else {
    logger.warn('❌ Invalid Telegram webhook signature');
    res.status(401).json({ error: 'Unauthorized' });
  }
};

/**
 * Main Telegram webhook endpoint
 * Handles incoming messages and orchestrates AI agent responses
 */
router.post('/webhook', verifyTelegramWebhook, async (req, res) => {
  const startTime = Date.now();
  let userId = null;
  let chatId = null;

  try {
    const { message } = req.body;

    // Validate message structure
    if (!message || !message.text) {
      logger.debug('Received non-text message or empty payload');
      return res.sendStatus(200);
    }

    userId = message.from.id.toString();
    chatId = message.chat.id.toString();
    const userText = message.text.trim();

    logger.info(`📨 Telegram message received:`, {
      user_id: userId,
      chat_id: chatId,
      message_length: userText.length,
      message_preview: userText.substring(0, 50)
    });

    // Skip commands (handled by polling bot)
    if (userText.startsWith('/')) {
      logger.debug('Command received, skipping webhook processing');
      return res.sendStatus(200);
    }

    // Initialize AIX Manager if not ready
    if (!manager) {
      logger.warn('AIX Manager not initialized, using fallback response');
      await sendTelegramMessage(chatId, '🤖 النظام يتم تهيئته الآن، يرجى المحاولة مرة أخرى خلال دقيقة.');
      return res.sendStatus(200);
    }

    // Get conversation history for context
    const history = await conversationManager.getHistory(userId, 20);

    // Create task object for AIX orchestration
    const task = {
      description: userText,
      context: {
        userId: userId,
        channel: 'telegram',
        chatId: chatId,
        history: history,
        source: 'telegram_webhook'
      },
      parameters: {
        platform: 'telegram',
        messageType: 'text',
        timestamp: new Date().toISOString()
      }
    };

    // Orchestrate task with AIX agents
    const result = await manager.orchestrateTask(task);

    // Extract response from orchestration result
    let response = 'عذراً، لم أتمكن من معالجة طلبك. يرجى المحاولة مرة أخرى.';

    if (result && result.results && result.results.length > 0) {
      // Get the best response from agents
      const bestResult = result.results.find(r => r.result && r.result.output) ||
                        result.results.find(r => r.result && r.result.response) ||
                        result.results[0];

      if (bestResult && bestResult.result) {
        response = bestResult.result.output || bestResult.result.response || bestResult.result.content || response;
      }
    }

    // Ensure response is not too long for Telegram (4096 chars limit)
    if (response.length > 4000) {
      response = response.substring(0, 3997) + '...';
    }

    // Send response back to user
    await sendTelegramMessage(chatId, response);

    // Save conversation to history
    await conversationManager.addMessage(userId, userText, true);
    await conversationManager.addMessage(userId, response, false);

    // Update metrics
    const processingTime = Date.now() - startTime;
    logger.info(`✅ Telegram webhook processed successfully:`, {
      user_id: userId,
      processing_time_ms: processingTime,
      response_length: response.length,
      agents_used: result?.agentsUsed?.length || 0
    });

    res.sendStatus(200);

  } catch (error) {
    const processingTime = Date.now() - startTime;

    logger.error(`❌ Telegram webhook error:`, {
      error: error.message,
      stack: error.stack,
      user_id: userId,
      chat_id: chatId,
      processing_time_ms: processingTime
    });

    // Send error message to user
    try {
      if (chatId) {
        await sendTelegramMessage(chatId, '❌ عذراً، حدث خطأ في معالجة رسالتك. يرجى المحاولة مرة أخرى.');
      }
    } catch (sendError) {
      logger.error('Failed to send error message to Telegram:', sendError);
    }

    res.sendStatus(200); // Always return 200 to Telegram
  }
});

/**
 * Helper function to send Telegram messages
 */
async function sendTelegramMessage(chatId, text, options = {}) {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN not configured');
  }

  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
    ...options
  };

  const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Telegram API error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Health check endpoint for webhook
 */
router.get('/webhook/health', (req, res) => {
  const health = {
    status: manager ? 'healthy' : 'initializing',
    timestamp: new Date().toISOString(),
    aix_manager: manager ? {
      status: manager.status,
      agents_discovered: manager.metrics?.agentsDiscovered || 0,
      agents_loaded: manager.metrics?.agentsLoaded || 0,
      tasks_orchestrated: manager.metrics?.tasksOrchestrated || 0
    } : null
  };

  res.json(health);
});

/**
 * Webhook setup instructions endpoint
 */
router.get('/webhook/setup', (req, res) => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const webhookUrl = process.env.WEBHOOK_URL || `${req.protocol}://${req.get('host')}/api/telegram/webhook`;

  res.json({
    instructions: {
      step1: 'Set webhook URL in Telegram',
      command: `curl -X POST "https://api.telegram.org/bot${botToken}/setWebhook?url=${webhookUrl}"`,
      step2: 'Verify webhook is set',
      verify_command: `curl -X GET "https://api.telegram.org/bot${botToken}/getWebhookInfo"`,
      current_webhook_url: webhookUrl,
      bot_token_configured: !!botToken
    }
  });
});

module.exports = router;