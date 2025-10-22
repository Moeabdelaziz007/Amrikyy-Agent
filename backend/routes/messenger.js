/**
 * Facebook Messenger Integration - Maya Travel Agent
 * Provides Facebook Messenger bot functionality
 */

const express = require('express');
const router = express.Router();
const { logger } = require('../utils/logger');
const AIXConnectionManager = require('../src/aix/AIXConnectionManager');

const log = logger.child('MessengerBot');

// Initialize AIX Connection Manager
const connectionManager = new AIXConnectionManager();

// Register Messenger transport
connectionManager.registerTransport('messenger', async (recipientId, message) => {
  // This would integrate with Facebook Graph API to send messages
  log.info(`Sending Messenger message to ${recipientId}:`, message);
  // Implementation would use Facebook Graph API to send message
});

/**
 * Messenger webhook verification (GET)
 */
router.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = process.env.MESSENGER_VERIFY_TOKEN;
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    log.info('Messenger webhook verified successfully');
    res.status(200).send(challenge);
  } else {
    log.error('Messenger webhook verification failed');
    res.status(403).send('Forbidden');
  }
});

/**
 * Messenger webhook endpoint (POST)
 */
router.post('/webhook', async (req, res) => {
  try {
    const body = req.body;

    if (body.object === 'page') {
      // Process each entry
      body.entry.forEach(async (entry) => {
        // Process each messaging event
        entry.messaging.forEach(async (event) => {
          if (event.message && !event.message.is_echo) {
            await handleMessage(event);
          } else if (event.postback) {
            await handlePostback(event);
          } else if (event.delivery) {
            log.info('Message delivered:', event.delivery);
          }
        });
      });

      res.status(200).send('EVENT_RECEIVED');
    } else {
      res.status(404).send('Not Found');
    }
  } catch (error) {
    log.error('Messenger webhook error:', error);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * Handle incoming messages
 */
async function handleMessage(event) {
  const senderId = event.sender.id;
  const message = event.message;

  log.info('Processing Messenger message:', {
    senderId,
    messageId: message.mid,
    text: message.text?.substring(0, 100) || 'N/A',
  });

  try {
    // Process message through AIXConnectionManager
    const response = await connectionManager.processMessage({
      from: `messenger_${senderId}`,
      to: 'maya-travel-agent',
      content: message.text || JSON.stringify(message.attachments || {}),
      type: 'messenger_message',
      metadata: {
        senderId,
        messageId: message.mid,
        timestamp: message.timestamp,
        source: 'messenger',
        attachments: message.attachments || [],
      },
    });

    // Send response back to Messenger
    await sendMessage(senderId, {
      text: response.content || response.message,
    });
  } catch (error) {
    log.error('Error processing Messenger message:', error);
    await sendMessage(senderId, {
      text: 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.',
    });
  }
}

/**
 * Handle postback events (button clicks, quick replies)
 */
async function handlePostback(event) {
  const senderId = event.sender.id;
  const payload = event.postback.payload;

  log.info('Processing Messenger postback:', {
    senderId,
    payload,
  });

  try {
    let response;

    switch (payload) {
      case 'GET_STARTED':
        response = {
          content:
            '👋 مرحباً! أنا مايا، مساعدتك الشخصية للتخطيط للسفر.\n\n' +
            'يمكنني مساعدتك في:\n' +
            '🌍 تخطيط الرحلات\n' +
            '💰 تحليل الميزانية\n' +
            '🔍 البحث عن عروض\n' +
            '📱 حجز التذاكر\n\n' +
            'كيف يمكنني مساعدتك اليوم؟',
        };
        break;

      case 'PLAN_TRIP':
        response = await connectionManager.processMessage({
          from: `messenger_${senderId}`,
          to: 'luna-trip-architect',
          content: 'I want to plan a trip',
          type: 'messenger_postback',
          metadata: { payload, source: 'messenger' },
        });
        break;

      case 'FIND_DEALS':
        response = await connectionManager.processMessage({
          from: `messenger_${senderId}`,
          to: 'scout-deal-hunter',
          content: 'Find travel deals',
          type: 'messenger_postback',
          metadata: { payload, source: 'messenger' },
        });
        break;

      case 'BUDGET_ANALYSIS':
        response = await connectionManager.processMessage({
          from: `messenger_${senderId}`,
          to: 'karim-budget-optimizer',
          content: 'Analyze travel budget',
          type: 'messenger_postback',
          metadata: { payload, source: 'messenger' },
        });
        break;

      default:
        response = {
          content: 'شكراً لك! كيف يمكنني مساعدتك أكثر؟',
        };
    }

    await sendMessage(senderId, {
      text: response.content || response.message,
    });
  } catch (error) {
    log.error('Error processing Messenger postback:', error);
    await sendMessage(senderId, {
      text: 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.',
    });
  }
}

/**
 * Send message to Messenger user
 */
async function sendMessage(recipientId, message) {
  try {
    // This would use Facebook Graph API to send the message
    log.info(`Sending message to Messenger user ${recipientId}:`, message.text?.substring(0, 100));

    // Implementation would make HTTP request to Facebook Graph API
    // const response = await fetch(`https://graph.facebook.com/v18.0/me/messages?access_token=${ACCESS_TOKEN}`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     recipient: { id: recipientId },
    //     message: message
    //   })
    // });
  } catch (error) {
    log.error('Error sending Messenger message:', error);
  }
}

/**
 * Send quick reply buttons
 */
async function sendQuickReply(recipientId, text, quickReplies) {
  const message = {
    text,
    quick_replies: quickReplies.map((reply) => ({
      content_type: 'text',
      title: reply.title,
      payload: reply.payload,
    })),
  };

  await sendMessage(recipientId, message);
}

/**
 * Send persistent menu
 */
router.post('/menu', async (req, res) => {
  try {
    const menu = {
      persistent_menu: [
        {
          locale: 'default',
          composer_input_disabled: false,
          call_to_actions: [
            {
              type: 'postback',
              title: '🌍 تخطيط رحلة',
              payload: 'PLAN_TRIP',
            },
            {
              type: 'postback',
              title: '💰 تحليل الميزانية',
              payload: 'BUDGET_ANALYSIS',
            },
            {
              type: 'postback',
              title: '🔍 البحث عن عروض',
              payload: 'FIND_DEALS',
            },
          ],
        },
      ],
    };

    // Implementation would send this to Facebook Graph API
    log.info('Setting up Messenger persistent menu');

    res.status(200).json({ success: true, menu });
  } catch (error) {
    log.error('Error setting up Messenger menu:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to setup Messenger menu',
    });
  }
});

/**
 * Messenger bot statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      activeUsers: 0, // Would be tracked by Facebook Analytics
      totalMessages: 0,
      popularFeatures: [
        { feature: 'Trip Planning', count: 234 },
        { feature: 'Deal Hunting', count: 156 },
        { feature: 'Budget Analysis', count: 98 },
      ],
      userEngagement: {
        dailyActiveUsers: 45,
        weeklyActiveUsers: 234,
        monthlyActiveUsers: 1234,
      },
    };

    res.status(200).json({ success: true, stats });
  } catch (error) {
    log.error('Messenger stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get Messenger statistics',
    });
  }
});

module.exports = router;
