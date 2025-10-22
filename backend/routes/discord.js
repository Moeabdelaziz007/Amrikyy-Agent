/**
 * Discord Bot Integration - Maya Travel Agent
 * Provides Discord community building and travel planning
 */

const express = require('express');
const router = express.Router();
const { logger } = require('../utils/logger');
const AIXConnectionManager = require('../src/aix/AIXConnectionManager');

const log = logger.child('DiscordBot');

// Initialize AIX Connection Manager
const connectionManager = new AIXConnectionManager();

// Register Discord transport
connectionManager.registerTransport('discord', async (channelId, message) => {
  // This would integrate with Discord.js to send messages
  log.info(`Sending Discord message to ${channelId}:`, message);
  // Implementation would use Discord.js client to send message
});

/**
 * Discord webhook endpoint
 */
router.post('/webhook', async (req, res) => {
  try {
    const { channel_id, user_id, content, message_id } = req.body;

    log.info('Discord webhook received:', {
      channel_id,
      user_id,
      message_id,
      content_length: content?.length || 0
    });

    // Process message through AIXConnectionManager
    const response = await connectionManager.processMessage({
      from: `discord_${user_id}`,
      to: 'maya-travel-agent',
      content,
      type: 'discord_message',
      metadata: {
        channelId: channel_id,
        userId: user_id,
        messageId: message_id,
        source: 'discord',
        timestamp: Date.now()
      }
    });

    // Send response back to Discord
    await connectionManager.sendMessage({
      from: 'maya-travel-agent',
      to: `discord_${channel_id}`,
      content: response.content || response.message,
      type: 'discord_response'
    });

    res.status(200).json({ success: true });

  } catch (error) {
    log.error('Discord webhook error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process Discord message' 
    });
  }
});

/**
 * Discord slash commands endpoint
 */
router.post('/commands', async (req, res) => {
  try {
    const { command, options, user_id, channel_id } = req.body;

    log.info('Discord slash command received:', {
      command,
      user_id,
      channel_id,
      options
    });

    let response;

    switch (command) {
      case 'plan_trip':
        response = await connectionManager.processMessage({
          from: `discord_${user_id}`,
          to: 'luna-trip-architect',
          content: `Plan a trip with options: ${JSON.stringify(options)}`,
          type: 'discord_command',
          metadata: { command, options, source: 'discord' }
        });
        break;

      case 'find_deals':
        response = await connectionManager.processMessage({
          from: `discord_${user_id}`,
          to: 'scout-deal-hunter',
          content: `Find deals with options: ${JSON.stringify(options)}`,
          type: 'discord_command',
          metadata: { command, options, source: 'discord' }
        });
        break;

      case 'budget_analysis':
        response = await connectionManager.processMessage({
          from: `discord_${user_id}`,
          to: 'karim-budget-optimizer',
          content: `Analyze budget with options: ${JSON.stringify(options)}`,
          type: 'discord_command',
          metadata: { command, options, source: 'discord' }
        });
        break;

      default:
        response = {
          content: 'أهلاً! أنا مايا، مساعدتك للسفر. استخدم الأوامر التالية:\n' +
                  '`/plan_trip` - لتخطيط رحلة\n' +
                  '`/find_deals` - للبحث عن عروض\n' +
                  '`/budget_analysis` - لتحليل الميزانية'
        };
    }

    res.status(200).json({
      type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
      data: {
        content: response.content || response.message,
        embeds: response.embeds || [],
        components: response.components || []
      }
    });

  } catch (error) {
    log.error('Discord command error:', error);
    res.status(500).json({
      type: 4,
      data: {
        content: 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.'
      }
    });
  }
});

/**
 * Discord channel management
 */
router.post('/channels/create', async (req, res) => {
  try {
    const { channel_name, channel_type, guild_id } = req.body;

    log.info('Creating Discord channel:', {
      channel_name,
      channel_type,
      guild_id
    });

    // Create specialized travel channels
    const channelConfig = {
      'deal-alerts': {
        name: '🚨 تنبيهات العروض',
        topic: 'عروض السفر والرحلات الخاصة'
      },
      'destination-ideas': {
        name: '🌍 أفكار الوجهات',
        topic: 'مشاركة وتوصيات الوجهات السياحية'
      },
      'group-trips': {
        name: '👥 رحلات جماعية',
        topic: 'تنظيم الرحلات الجماعية'
      },
      'travel-support': {
        name: '🆘 دعم السفر',
        topic: 'مساعدة في مشاكل السفر'
      }
    };

    const config = channelConfig[channel_type] || {
      name: channel_name,
      topic: 'قناة مايا للسفر'
    };

    // Response would include channel creation details
    res.status(200).json({
      success: true,
      channel: {
        id: `discord_${Date.now()}`,
        name: config.name,
        topic: config.topic,
        type: 'text'
      }
    });

  } catch (error) {
    log.error('Discord channel creation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create Discord channel' 
    });
  }
});

/**
 * Discord bot statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      activeGuilds: 0, // Would be tracked by Discord.js client
      activeChannels: 0,
      totalMessages: 0,
      popularCommands: [
        { command: 'plan_trip', count: 150 },
        { command: 'find_deals', count: 89 },
        { command: 'budget_analysis', count: 67 }
      ],
      topDestinations: [
        { destination: 'Tokyo', count: 45 },
        { destination: 'Paris', count: 38 },
        { destination: 'Dubai', count: 32 }
      ]
    };

    res.status(200).json({ success: true, stats });

  } catch (error) {
    log.error('Discord stats error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get Discord statistics' 
    });
  }
});

module.exports = router;
