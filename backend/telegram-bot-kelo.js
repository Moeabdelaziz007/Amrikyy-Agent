/**
 * Amrikyy Travel Agent - Telegram Bot (Kelo AI Version)
 * Uses Kelo AI for advanced AI responses
 * Replaces Gemini 2.5 with enhanced capabilities
 */

const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');
const KeloClient = require('./src/ai/keloClient');

// Initialize Kelo client
const keloClient = new KeloClient();

// Bot configuration
const token = process.env.TELEGRAM_BOT_TOKEN;
const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL;

if (!token) {
  logger.error('TELEGRAM_BOT_TOKEN is required');
  process.exit(1);
}

// Create bot instance
const bot = new TelegramBot(token, { polling: false });

// Express app for webhook
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Store conversation history
const conversationHistory = new Map();

// Bot commands
const commands = [
  { command: 'start', description: 'بدء البوت والحصول على الترحيب' },
  { command: 'help', description: 'عرض جميع الأوامر المتاحة' },
  { command: 'travel', description: 'تخطيط رحلة جديدة' },
  { command: 'budget', description: 'تحليل الميزانية' },
  { command: 'destination', description: 'معلومات عن الوجهات' },
  { command: 'payment', description: 'نصائح الدفع والحجز' },
  { command: 'alerts', description: 'تنبيهات السفر' },
  { command: 'itinerary', description: 'إنشاء خطة رحلة شخصية' },
  { command: 'status', description: 'حالة النظام والخدمات' }
];

// Set bot commands
bot.setMyCommands(commands);

// Welcome message
const welcomeMessage = `
🎉 مرحباً بك في Amrikyy Travel Agent!

أنا مساعد السفر الذكي المدعوم بـ Kelo AI 🤖

✨ **الميزات المتقدمة:**
• تخطيط رحلات ذكي ومتقدم
• تحليل ميزانية ذكي
• معلومات وجهات شاملة
• نصائح دفع وحجز ذكية
• تنبيهات سفر في الوقت الفعلي
• خطط رحلة شخصية
• رؤى ثقافية عميقة
• تحليل مخاطر السلامة

🚀 **ابدأ الآن:**
/help - عرض جميع الأوامر
/travel - تخطيط رحلة جديدة
/destination - استكشاف الوجهات

🤖 مدعوم بـ Kelo AI المتقدم
`;

// Help message
const helpMessage = `
📋 **قائمة الأوامر المتاحة:**

🎯 **الأوامر الأساسية:**
/start - بدء البوت
/help - عرض هذه القائمة
/status - حالة النظام

✈️ **تخطيط السفر:**
/travel - تخطيط رحلة جديدة
/destination - معلومات الوجهات
/itinerary - خطة رحلة شخصية

💰 **المالية:**
/budget - تحليل الميزانية
/payment - نصائح الدفع

🔔 **التنبيهات:**
/alerts - تنبيهات السفر

💬 **المحادثة:**
يمكنك التحدث معي مباشرة! فقط اكتب رسالتك وسأجيبك بذكاء.

🤖 مدعوم بـ Kelo AI المتقدم
`;

// Handle text messages with Kelo AI
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const userId = msg.from.id;

  try {
    // Handle commands
    if (text.startsWith('/')) {
      await handleCommand(chatId, text, msg);
      return;
    }

    // Handle regular messages
    if (text) {
      await handleTextMessage(chatId, text, userId, msg);
    }

  } catch (error) {
    logger.error('Error handling message:', error);
    await bot.sendMessage(chatId, 'عذراً، حدث خطأ في معالجة رسالتك. يرجى المحاولة مرة أخرى.');
  }
});

// Handle commands
async function handleCommand(chatId, command, msg) {
  switch (command) {
    case '/start':
      await bot.sendMessage(chatId, welcomeMessage);
      break;

    case '/help':
      await bot.sendMessage(chatId, helpMessage);
      break;

    case '/travel':
      await handleTravelPlanning(chatId);
      break;

    case '/budget':
      await handleBudgetAnalysis(chatId);
      break;

    case '/destination':
      await handleDestinationInfo(chatId);
      break;

    case '/payment':
      await handlePaymentTips(chatId);
      break;

    case '/alerts':
      await handleTravelAlerts(chatId);
      break;

    case '/itinerary':
      await handlePersonalizedItinerary(chatId);
      break;

    case '/status':
      await handleStatusCheck(chatId);
      break;

    default:
      await bot.sendMessage(chatId, 'أمر غير معروف. استخدم /help لعرض الأوامر المتاحة.');
  }
}

// Handle text messages
async function handleTextMessage(chatId, text, userId, msg) {
  try {
    // Get conversation history
    const history = conversationHistory.get(userId) || [];
    
    // Add user message to history
    history.push({ role: 'user', content: text });

    // Keep only last 10 messages to avoid token limits
    if (history.length > 10) {
      history.splice(0, history.length - 10);
    }

    // Get AI response from Kelo AI
    const aiResponse = await keloClient.generateChatResponse(text, history);

    if (aiResponse.success) {
      // Add AI response to history
      history.push({ role: 'assistant', content: aiResponse.content });
      conversationHistory.set(userId, history);

      // Send response
      await bot.sendMessage(chatId, aiResponse.content);
    } else {
      await bot.sendMessage(chatId, 'عذراً، حدث خطأ في معالجة طلبك. يرجى المحاولة مرة أخرى.');
    }

  } catch (error) {
    logger.error('Error in text message handling:', error);
    await bot.sendMessage(chatId, 'عذراً، حدث خطأ في معالجة رسالتك.');
  }
}

// Travel planning handler
async function handleTravelPlanning(chatId) {
  const message = `✈️ **تخطيط رحلة جديدة**

أخبرني عن رحلتك:
• الوجهة المطلوبة
• المدة (عدد الأيام)
• الميزانية المتاحة
• نوع السفر (عائلي، رومانسي، مغامرة، إلخ)

مثال: "أريد رحلة إلى باريس لمدة 5 أيام بميزانية 2000 دولار للعائلة"`;

  await bot.sendMessage(chatId, message);
}

// Budget analysis handler
async function handleBudgetAnalysis(chatId) {
  const message = `💰 **تحليل الميزانية الذكي**

أخبرني عن تفاصيل رحلتك:
• الوجهة
• المدة
• عدد المسافرين
• الميزانية الإجمالية

مثال: "حلل ميزانية رحلة إلى طوكيو لمدة 7 أيام لشخصين بميزانية 3000 دولار"`;

  await bot.sendMessage(chatId, message);
}

// Destination info handler
async function handleDestinationInfo(chatId) {
  const message = `🌍 **معلومات الوجهات**

أخبرني عن الوجهة التي تريد معرفة المزيد عنها:

مثال: "أخبرني عن دبي" أو "ما هي أفضل الأماكن في إسطنبول؟"`;

  await bot.sendMessage(chatId, message);
}

// Payment tips handler
async function handlePaymentTips(chatId) {
  const message = `💳 **نصائح الدفع والحجز الذكية**

أخبرني عن تفاصيل رحلتك:
• الوجهة
• الميزانية
• المدة
• طريقة الدفع المفضلة

مثال: "نصائح دفع لرحلة إلى لندن بميزانية 1500 دولار لمدة 4 أيام"`;

  await bot.sendMessage(chatId, message);
}

// Travel alerts handler
async function handleTravelAlerts(chatId) {
  const message = `🔔 **تنبيهات السفر في الوقت الفعلي**

أخبرني عن:
• الوجهة
• تواريخ السفر

مثال: "تنبيهات سفر لباريس من 15 إلى 20 ديسمبر"`;

  await bot.sendMessage(chatId, message);
}

// Personalized itinerary handler
async function handlePersonalizedItinerary(chatId) {
  const message = `📅 **إنشاء خطة رحلة شخصية**

أخبرني عن:
• الوجهة
• المدة
• اهتماماتك (ثقافة، طعام، مغامرة، إلخ)
• مستوى النشاط المفضل

مثال: "أنشئ خطة رحلة شخصية لروما لمدة 6 أيام مع اهتمام بالتاريخ والطعام"`;

  await bot.sendMessage(chatId, message);
}

// Status check handler
async function handleStatusCheck(chatId) {
  try {
    // Test Kelo AI
    const keloHealth = await keloClient.healthCheck();
    
    const statusMessage = `
🔍 **حالة النظام:**

• Kelo AI: ${keloHealth.status === 'healthy' ? '✅ نشط' : '❌ غير متاح'}
• النموذج: ${keloHealth.model || 'غير محدد'}
• آخر تحديث: ${keloHealth.timestamp || 'غير محدد'}

${keloHealth.status === 'healthy' ? '🎉 جميع الخدمات تعمل بشكل طبيعي!' : '⚠️ يرجى المحاولة مرة أخرى لاحقاً.'}
`;

    await bot.sendMessage(chatId, statusMessage);

  } catch (error) {
    logger.error('Error in status check:', error);
    await bot.sendMessage(chatId, 'عذراً، حدث خطأ في فحص حالة النظام.');
  }
}

// Webhook endpoint
app.post(`/webhook/${token}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test Kelo AI
    const keloHealth = await keloClient.healthCheck();
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        kelo: keloHealth.status
      }
    });

  } catch (error) {
    logger.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Maya Travel Bot server started on port ${PORT}`);
  logger.info('AI Provider: Kelo AI');
});

// Set webhook if provided
if (webhookUrl) {
  bot.setWebHook(`${webhookUrl}/webhook/${token}`)
    .then(() => {
      logger.info('✅ Webhook set successfully');
    })
    .catch((error) => {
      logger.error('❌ Error setting webhook:', error);
    });
}

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('🛑 Shutting down Maya Travel Bot...');
  bot.stopPolling();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('🛑 Shutting down Maya Travel Bot...');
  bot.stopPolling();
  process.exit(0);
});

logger.info('🤖 Maya Travel Bot started successfully (Kelo AI)!');
logger.info('AI Provider: Kelo AI');
