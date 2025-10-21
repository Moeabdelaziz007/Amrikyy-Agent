/**
 * Amrikyy Travel Agent - Telegram Bot (Gemini AI Version)
 * Uses Google Gemini API for AI responses
 */

const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

// Enterprise-grade utilities
const logger = require('./utils/logger');
const { errorHandler } = require('./utils/errorHandler');
const conversationManager = require('./utils/conversationManager');
const healthMonitor = require('./utils/healthMonitor');
const GeminiClient = require('./src/ai/geminiClient');

// Initialize Gemini client
const geminiClient = new GeminiClient();

// Initialize Telegram Bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  polling: {
    interval: 300,
    autoStart: true,
    params: {
      timeout: 10,
    },
  },
});

// Bot error handling
bot.on('polling_error', (error) => {
  errorHandler.handle(error, { source: 'telegram_polling' });
});

bot.on('error', (error) => {
  errorHandler.handle(error, { source: 'telegram_bot' });
});

// Wrapper for safe command handling
const safeHandler = (handler) => {
  return async (msg, match) => {
    const startTime = Date.now();
    const chatId = msg.chat.id;
    const userId = msg.from ? msg.from.id : null;

    try {
      logger.userAction(userId, 'command', {
        command: msg.text,
        chat_id: chatId,
      });

      await handler(msg, match);

      const duration = Date.now() - startTime;
      healthMonitor.recordRequest(true, duration);

      logger.performance('command_handler', duration, {
        command: msg.text,
        user_id: userId,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      healthMonitor.recordRequest(false, duration);
      healthMonitor.recordError(error);

      const errorResponse = await errorHandler.handle(error, {
        user_id: userId,
        chat_id: chatId,
        command: msg.text,
      });

      try {
        await bot.sendMessage(chatId, errorResponse.error.message);
      } catch (sendError) {
        logger.error('Failed to send error message', sendError);
      }
    }
  };
};

// /start command
bot.onText(
  /\/start/,
  safeHandler(async (msg) => {
    const chatId = msg.chat.id;
    const chatType = msg.chat.type;
    
    let welcomeMessage = '';
    let keyboard = null;

    if (chatType === 'private') {
      // Private chat welcome
      welcomeMessage = `
🌍 مرحباً بك في Amrikyy Trips!

أنا مساعد السفر الذكي المدعوم بـ Google Gemini AI 🤖

✈️ تخطيط رحلاتك المثالية
💰 إدارة ميزانيتك بذكاء
🗺️ اكتشاف وجهات جديدة
🤖 نصائح سفر شخصية بالذكاء الاصطناعي

🚀 ابدأ الآن:
      `;

      keyboard = {
        inline_keyboard: [
          [
            { text: '🚀 تخطيط رحلة جديدة', callback_data: 'new_trip' },
            { text: '💰 إدارة الميزانية', callback_data: 'budget' },
          ],
          [
            { text: '🎁 العروض المتاحة', callback_data: 'offers' },
            { text: '❓ المساعدة', callback_data: 'help' },
          ],
          [
            { text: '📊 الإحصائيات', callback_data: 'stats' },
            { text: '🏥 حالة النظام', callback_data: 'health' },
          ],
        ],
      };
    } else {
      // Group chat welcome
      const botInfo = await bot.getMe();
      welcomeMessage = `
👋 مرحباً! أنا ${botInfo.first_name}

🤖 مساعد السفر الذكي المدعوم بـ Google Gemini AI

📱 كيف تستخدمني في المجموعة:
• اذكرني: @${botInfo.username} + سؤالك
• رد على رسالتي مباشرة
• مثال: @${botInfo.username} أريد السفر إلى باريس

✈️ يمكنني مساعدتك في:
• تخطيط الرحلات
• إدارة الميزانية
• توصيات الوجهات
• نصائح السفر

💬 جرب الآن: @${botInfo.username} مرحباً
      `;
    }

    await bot.sendMessage(chatId, welcomeMessage, keyboard ? { reply_markup: keyboard } : {});
  })
);

// /help command
bot.onText(
  /\/help/,
  safeHandler(async (msg) => {
    const chatId = msg.chat.id;
    const chatType = msg.chat.type;
    const botInfo = await bot.getMe();
    
    let helpMessage = '';

    if (chatType === 'private') {
      // Private chat help
      helpMessage = `
🆘 مساعدة Amrikyy Trips

الأوامر المتاحة:
/start - بدء المحادثة
/help - عرض هذه المساعدة
/trip - تخطيط رحلة جديدة
/budget - إدارة الميزانية
/stats - عرض إحصائياتك

💬 يمكنك أيضاً:
• كتابة أي سؤال عن السفر
• طلب توصيات للوجهات
• السؤال عن الميزانية
• طلب نصائح السفر

🤖 مدعوم بـ Google Gemini AI

📞 الدعم الفني:
📧 Amrikyy@gmail.com
💬 WhatsApp: +17706160211
      `;
    } else {
      // Group chat help
      helpMessage = `
🆘 مساعدة Amrikyy Trips (المجموعات)

📱 كيف تستخدمني في المجموعة:

1️⃣ **اذكرني في رسالتك:**
   @${botInfo.username} أريد السفر إلى باريس

2️⃣ **رد على رسائلي:**
   اضغط "Reply" على أي رسالة مني واكتب سؤالك

3️⃣ **استخدم الأوامر:**
   /start - معلومات عن البوت
   /help - هذه المساعدة

✈️ أمثلة:
• @${botInfo.username} ما أفضل وقت لزيارة دبي؟
• @${botInfo.username} أحتاج فندق في القاهرة
• @${botInfo.username} ميزانيتي 1000 دولار

🤖 مدعوم بـ Google Gemini AI
      `;
    }

    await bot.sendMessage(chatId, helpMessage);
  })
);

// Handle text messages with Gemini AI
bot.on(
  'text',
  safeHandler(async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text;
    const chatType = msg.chat.type; // 'private', 'group', 'supergroup', 'channel'

    // Skip commands
    if (text.startsWith('/')) return;

    // Get bot info for mention detection
    const botInfo = await bot.getMe();
    const botUsername = botInfo.username;
    const botMention = `@${botUsername}`;

    // In groups/supergroups, only respond if:
    // 1. Bot is mentioned
    // 2. Message is a reply to bot's message
    if (chatType === 'group' || chatType === 'supergroup') {
      const isMentioned = text.includes(botMention);
      const isReplyToBot = msg.reply_to_message && msg.reply_to_message.from.id === botInfo.id;
      
      if (!isMentioned && !isReplyToBot) {
        // Ignore messages in groups where bot is not mentioned
        return;
      }

      // Remove bot mention from text for cleaner processing
      const cleanText = text.replace(botMention, '').trim();
      
      // Log group interaction
      logger.info('Group message received', {
        chat_id: chatId,
        chat_title: msg.chat.title,
        user_id: userId,
        mentioned: isMentioned,
        reply: isReplyToBot
      });
    }

    // Add message to conversation history
    await conversationManager.addMessage(userId, text, true);

    // Get conversation history for context
    const history = await conversationManager.getHistory(userId, 10);
    const conversationHistory = history.slice(0, -1).map((h) => ({
      role: h.is_user ? 'user' : 'assistant',
      content: h.message,
    }));

    // Show typing indicator
    await bot.sendChatAction(chatId, 'typing');

    // Get AI response from Gemini
    const aiResponse = await geminiClient.generateChatResponse(text, conversationHistory);

    let response = '';
    let keyboard = null;

    if (aiResponse.success) {
      response = aiResponse.content;

      // Only add inline keyboard in private chats (not in groups)
      if (chatType === 'private') {
        keyboard = {
          inline_keyboard: [
            [
              { text: '🚀 تخطيط رحلة', callback_data: 'new_trip' },
              { text: '💰 الميزانية', callback_data: 'budget' },
            ],
            [
              { text: '🎁 العروض', callback_data: 'offers' },
              { text: '❓ المساعدة', callback_data: 'help' },
            ],
          ],
        };
      }
    } else {
      response = 'عذراً، حدث خطأ في معالجة طلبك. يرجى المحاولة مرة أخرى.';
    }

    await bot.sendMessage(chatId, response, keyboard ? { reply_markup: keyboard } : {});
    await conversationManager.addMessage(userId, response, false);
  })
);

// Handle new chat members (bot added to group)
bot.on('new_chat_members', safeHandler(async (msg) => {
  const chatId = msg.chat.id;
  const newMembers = msg.new_chat_members;
  const botInfo = await bot.getMe();

  // Check if bot was added
  const botAdded = newMembers.some(member => member.id === botInfo.id);

  if (botAdded) {
    const welcomeMessage = `
👋 شكراً لإضافتي إلى المجموعة!

🤖 أنا ${botInfo.first_name} - مساعد السفر الذكي

📱 كيف تستخدمني:
1️⃣ اذكرني: @${botInfo.username} + سؤالك
2️⃣ رد على رسائلي مباشرة
3️⃣ استخدم الأوامر: /help

✈️ مثال:
@${botInfo.username} أريد السفر إلى دبي في الصيف

🚀 جاهز للمساعدة!
    `;

    await bot.sendMessage(chatId, welcomeMessage);
    
    logger.info('Bot added to group', {
      chat_id: chatId,
      chat_title: msg.chat.title,
      added_by: msg.from.id
    });
  }
}));

// Handle callback queries
bot.on(
  'callback_query',
  safeHandler(async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const userId = callbackQuery.from.id;
    const data = callbackQuery.data;

    let message = '';
    let keyboard = null;

    if (data === 'new_trip') {
      message = '🚀 تخطيط رحلة جديدة\n\nاختر وجهتك المفضلة أو اكتب اسم أي وجهة:';
      keyboard = {
        inline_keyboard: [
          [
            { text: '🇹🇷 تركيا', callback_data: 'dest_turkey' },
            { text: '🇦🇪 دبي', callback_data: 'dest_dubai' },
          ],
          [
            { text: '🇲🇾 ماليزيا', callback_data: 'dest_malaysia' },
            { text: '🇹🇭 تايلاند', callback_data: 'dest_thailand' },
          ],
        ],
      };
    } else if (data.startsWith('dest_')) {
      const destMap = {
        turkey: 'تركيا',
        dubai: 'دبي',
        malaysia: 'ماليزيا',
        thailand: 'تايلاند',
      };
      const dest = destMap[data.replace('dest_', '')];

      await bot.sendChatAction(chatId, 'typing');
      await conversationManager.setState(userId, conversationManager.states.COLLECTING_DATES, {
        destination: dest,
      });

      // Get AI insights about the destination
      const insights = await geminiClient.generateDestinationInsights(dest, 'leisure');

      if (insights.success) {
        message = `✈️ ${dest} - وجهة رائعة!\n\n${insights.content}\n\n📅 متى تخطط للسفر؟`;
      } else {
        message = `✈️ اخترت ${dest}!\n\n📅 متى تخطط للسفر؟`;
      }
    } else if (data === 'budget') {
      await conversationManager.setState(userId, conversationManager.states.COLLECTING_BUDGET);
      message = '💰 إدارة الميزانية\n\nما هي ميزانيتك للسفر؟';
      keyboard = {
        inline_keyboard: [
          [
            { text: '💵 أقل من $500', callback_data: 'budget_low' },
            { text: '💵 $500-1000', callback_data: 'budget_medium' },
          ],
          [
            { text: '💵 $1000-3000', callback_data: 'budget_high' },
            { text: '💵 أكثر من $3000', callback_data: 'budget_premium' },
          ],
        ],
      };
    } else if (data.startsWith('budget_')) {
      const budgetMap = {
        low: { range: 'أقل من $500', amount: 500 },
        medium: { range: '$500-1000', amount: 750 },
        high: { range: '$1000-3000', amount: 2000 },
        premium: { range: 'أكثر من $3000', amount: 5000 },
      };

      const level = data.replace('budget_', '');
      const budgetInfo = budgetMap[level];

      await bot.sendChatAction(chatId, 'typing');
      await conversationManager.setState(
        userId,
        conversationManager.states.COLLECTING_PREFERENCES,
        { budget: budgetInfo.range }
      );

      const context = await conversationManager.getContext(userId);
      if (context.data.destination) {
        const analysis = await geminiClient.generateBudgetAnalysis(
          {
            destination: context.data.destination,
            duration: 7,
            travelers: 1,
          },
          budgetInfo.amount
        );

        if (analysis.success) {
          message = `💰 ميزانيتك: ${budgetInfo.range}\n\n${analysis.content}\n\n🎯 ما هي اهتماماتك؟`;
        } else {
          message = `💰 ميزانيتك: ${budgetInfo.range}\n\n🎯 ما هي اهتماماتك؟`;
        }
      } else {
        message = `💰 ميزانيتك: ${budgetInfo.range}\n\n🎯 ما هي اهتماماتك؟`;
      }
    } else if (data === 'stats') {
      const summary = await conversationManager.getSummary(userId);
      const systemStats = healthMonitor.getMetricsSummary();

      message =
        '📊 إحصائياتك\n\n' +
        `💬 عدد الرسائل: ${summary.messageCount}\n` +
        `⏱️ مدة الجلسة: ${Math.floor(summary.sessionDuration / 60000)} دقيقة\n` +
        `📝 البيانات المجمعة: ${summary.dataCollected} عنصر\n` +
        '\n🤖 حالة النظام:\n' +
        `✅ الحالة: ${systemStats.status === 'healthy' ? 'جيد' : 'يعمل'}\n` +
        `⏰ وقت التشغيل: ${systemStats.uptime}\n` +
        `📈 معدل النجاح: ${systemStats.successRate}`;
    } else if (data === 'health') {
      const health = healthMonitor.getHealth();
      message =
        '🏥 حالة النظام\n\n' +
        `الحالة: ${health.status === 'healthy' ? '✅ جيد' : '⚠️ يعمل'}\n` +
        `وقت التشغيل: ${health.uptime.formatted}\n\n` +
        '📡 الخدمات:\n' +
        `• Telegram: ${health.apis.telegram.status === 'healthy' ? '✅' : '⚠️'}\n` +
        `• Database: ${health.apis.supabase.status === 'healthy' ? '✅' : '⚠️'}\n` +
        '• Gemini AI: ✅ نشط\n\n' +
        '📊 الأداء:\n' +
        `• الطلبات: ${health.requests.total}\n` +
        `• النجاح: ${health.requests.successful}\n` +
        `• متوسط الاستجابة: ${health.performance.avgResponseTime.toFixed(2)}ms`;
    } else {
      message = 'شكراً! كيف يمكنني مساعدتك؟';
    }

    await bot.sendMessage(chatId, message, keyboard ? { reply_markup: keyboard } : {});
    await bot.answerCallbackQuery(callbackQuery.id);
  })
);

// Graceful shutdown
errorHandler.setupGracefulShutdown(async () => {
  logger.info('Stopping Telegram bot...');
  await bot.stopPolling();
  logger.info('Bot stopped successfully');
});

// Perform initial health check
(async () => {
  logger.info('Performing initial health checks...');
  await healthMonitor.checkTelegramHealth(bot);
  await healthMonitor.checkSupabaseHealth();

  // Test Gemini
  const geminiHealth = await geminiClient.healthCheck();
  logger.info('Gemini AI health check', { status: geminiHealth.status });

  const health = healthMonitor.getHealth();
  logger.info('Initial health check complete', {
    status: health.status,
    telegram: health.apis.telegram.status,
    database: health.apis.supabase.status,
    gemini: geminiHealth.status,
  });

  if (geminiHealth.status === 'healthy') {
    logger.info('✅ Gemini AI is ready');
  } else {
    logger.warn('⚠️ Gemini AI health check failed', { error: geminiHealth.error });
  }
})();

// Start bot
logger.info('🤖 Maya Travel Bot started successfully (Gemini AI)!');
logger.info('Bot is listening for messages...');
logger.info('AI Provider: Google Gemini');

module.exports = bot;
