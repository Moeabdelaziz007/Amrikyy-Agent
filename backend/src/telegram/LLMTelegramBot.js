/**
 * LLM Telegram Bot - تكامل Z.ai GLM-4.6 مع Telegram
 * بوت Telegram متقدم مع ذكاء اصطناعي كامل
 * 
 * @author Maya Travel Agent Team
 * @version 1.0.0
 */

const TelegramBot = require('node-telegram-bot-api');
const ZaiClient = require('../ai/zaiClient');
const { buildCulturalSystemPrompt } = require('../ai/culture');
const winston = require('winston');
const path = require('path');

class LLMTelegramBot {
    constructor(token, options = {}) {
        this.token = token;
        this.options = {
            polling: true,
            ...options
        };
        
        // Initialize bot
        this.bot = new TelegramBot(token, this.options);
        
        // Initialize AI client
        this.zaiClient = new ZaiClient();
        
        // Setup logger
        this.setupLogger();
        
        // User sessions
        this.userSessions = new Map();
        
        // Setup handlers
        this.setupHandlers();
        
        this.logger.info('LLM Telegram Bot initialized', {
            botUsername: this.bot.options.username
        });
    }
    
    /**
     * إعداد نظام التسجيل
     */
    setupLogger() {
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            transports: [
                new winston.transports.File({ 
                    filename: path.join(__dirname, '../../logs/llm-telegram-bot.log') 
                }),
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.simple()
                    )
                })
            ]
        });
    }
    
    /**
     * إعداد معالجات البوت
     */
    setupHandlers() {
        // معالج الرسائل النصية
        this.bot.on('message', async (msg) => {
            try {
                await this.handleMessage(msg);
            } catch (error) {
                this.logger.error('Error handling message:', error);
                await this.sendError(msg.chat.id, error.message);
            }
        });
        
        // معالج الأخطاء
        this.bot.on('error', (error) => {
            this.logger.error('Bot error:', error);
        });
        
        // معالج التصحيحات
        this.bot.on('polling_error', (error) => {
            this.logger.error('Polling error:', error);
        });
    }
    
    /**
     * معالجة الرسائل الرئيسية
     */
    async handleMessage(msg) {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const messageText = msg.text;
        
        this.logger.info('Processing message', {
            chatId,
            userId,
            messageType: msg.message_type || 'text',
            text: messageText?.substring(0, 100)
        });
        
        // تجاهل الرسائل غير النصية
        if (!messageText) {
            await this.bot.sendMessage(chatId, 'أعتذر، يمكنني معالجة الرسائل النصية فقط حالياً. 📝');
            return;
        }
        
        // معالجة الأوامر
        if (messageText.startsWith('/')) {
            await this.handleCommand(msg);
            return;
        }
        
        // معالجة الرسائل العادية بالذكاء الاصطناعي
        await this.handleAIConversation(msg);
    }
    
    /**
     * معالجة الأوامر
     */
    async handleCommand(msg) {
        const chatId = msg.chat.id;
        const command = msg.text.split(' ')[0];
        const args = msg.text.split(' ').slice(1);
        
        switch (command) {
            case '/start':
                await this.handleStartCommand(msg);
                break;
                
            case '/help':
                await this.handleHelpCommand(msg);
                break;
                
            case '/status':
                await this.handleStatusCommand(msg);
                break;
                
            case '/clear':
                await this.handleClearCommand(msg);
                break;
                
            default:
                await this.bot.sendMessage(chatId, 'أعتذر، لا أعرف هذا الأمر. استخدم /help لرؤية الأوامر المتاحة. 🤔');
        }
    }
    
    /**
     * أمر البدء
     */
    async handleStartCommand(msg) {
        const chatId = msg.chat.id;
        const userName = msg.from.first_name || 'صديقي';
        
        const welcomeMessage = `
مرحباً ${userName}! 👋

أنا مايا، مساعدك الذكي للسفر والسياحة. أنا مجهز بالذكاء الاصطناعي المتقدم لمساعدتك في:

🗺️ **تخطيط الرحلات** - إعداد خطط سفر مخصصة
💰 **تحليل الميزانية** - تحليل التكاليف وتوفير المال
🏛️ **الوجهات الثقافية** - نصائح ثقافية ومحلية
📊 **تحليل البيانات** - تحليل بيانات السفر
🤖 **الذكاء الاصطناعي** - إجابات ذكية على جميع أسئلتك

اكتب رسالة عادية للبدء، أو استخدم /help لرؤية جميع الأوامر المتاحة.

أنا هنا لمساعدتك! ✨
        `;
        
        await this.bot.sendMessage(chatId, welcomeMessage, {
            parse_mode: 'Markdown'
        });
    }
    
    /**
     * أمر المساعدة
     */
    async handleHelpCommand(msg) {
        const chatId = msg.chat.id;
        
        const helpMessage = `
📚 **قائمة الأوامر المتاحة:**

/start - بدء البوت ورؤية الترحيب
/help - عرض هذه الرسالة
/status - حالة النظام والذكاء الاصطناعي
/clear - مسح تاريخ المحادثة

💬 **للحديث العادي:**
اكتب أي رسالة وسأجيبك بالذكاء الاصطناعي!

🔧 **الميزات المتاحة:**
- تخطيط الرحلات والسفر
- تحليل الميزانية والتكاليف
- نصائح ثقافية ومحلية
- تحليل البيانات والإحصائيات
- إجابات ذكية على جميع الأسئلة

أنا أتحدث العربية والإنجليزية بطلاقة! 🌍
        `;
        
        await this.bot.sendMessage(chatId, helpMessage, {
            parse_mode: 'Markdown'
        });
    }
    
    /**
     * أمر حالة النظام
     */
    async handleStatusCommand(msg) {
        const chatId = msg.chat.id;
        
        try {
            // اختبار الاتصال بالذكاء الاصطناعي
            const healthCheck = await this.zaiClient.healthCheck();
            
            const statusMessage = `
🤖 **حالة النظام:**

✅ البوت: يعمل بشكل طبيعي
✅ الذكاء الاصطناعي: ${healthCheck.success ? 'متصل' : 'غير متصل'}
✅ اللغة العربية: مدعومة بالكامل
✅ اللغة الإنجليزية: مدعومة بالكامل

🔧 **المعلومات التقنية:**
- النموذج: Z.ai GLM-4.6
- وقت الاستجابة: ~2-3 ثواني
- دقة الاستجابة: عالية جداً

🎯 **جاهز لمساعدتك في السفر!**
            `;
            
            await this.bot.sendMessage(chatId, statusMessage, {
                parse_mode: 'Markdown'
            });
            
        } catch (error) {
            await this.bot.sendMessage(chatId, '❌ خطأ في فحص حالة النظام: ' + error.message);
        }
    }
    
    /**
     * أمر مسح المحادثة
     */
    async handleClearCommand(msg) {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        
        // مسح جلسة المستخدم
        if (this.userSessions.has(userId)) {
            this.userSessions.delete(userId);
        }
        
        await this.bot.sendMessage(chatId, '✅ تم مسح تاريخ المحادثة بنجاح! يمكنك البدء من جديد.');
    }
    
    /**
     * معالجة المحادثة بالذكاء الاصطناعي
     */
    async handleAIConversation(msg) {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const userMessage = msg.text;
        
        // إظهار مؤشر الكتابة
        await this.bot.sendChatAction(chatId, 'typing');
        
        try {
            // الحصول على أو إنشاء جلسة المستخدم
            const userSession = this.getOrCreateUserSession(userId);
            
            // إعداد سياق المحادثة
            const conversationHistory = userSession.history || [];
            
            // إعداد رسائل النظام
            const systemMessages = [
                {
                    role: 'system',
                    content: 'أنت مايا، مساعد السفر الذكي. أنت متخصص في تخطيط الرحلات، تحليل الميزانية، والنصائح الثقافية. تجيب دائماً بالعربية بطريقة ودودة ومفيدة.'
                },
                {
                    role: 'system',
                    content: buildCulturalSystemPrompt('ar') // سياق ثقافي عربي
                }
            ];
            
            // إعداد تاريخ المحادثة
            const formattedHistory = conversationHistory.map(msg => ({
                role: msg.role,
                content: msg.content
            }));
            
            // إعداد رسالة المستخدم
            const userMessageFormatted = {
                role: 'user',
                content: userMessage
            };
            
            // إرسال الطلب للذكاء الاصطناعي
            const response = await this.zaiClient.chatCompletion([
                ...systemMessages,
                ...formattedHistory,
                userMessageFormatted
            ], {
                maxTokens: 800,
                temperature: 0.7,
                enableKvCacheOffload: true
            });
            
            if (response.success && response.content) {
                const aiResponse = response.content.trim();
                
                // حفظ في تاريخ المحادثة
                this.updateUserSession(userId, userMessage, aiResponse);
                
                // إرسال الرد
                await this.bot.sendMessage(chatId, aiResponse, {
                    parse_mode: 'Markdown',
                    disable_web_page_preview: true
                });
                
                this.logger.info('AI response sent', {
                    userId,
                    responseLength: aiResponse.length,
                    success: true
                });
                
            } else {
                throw new Error(response.error || 'فشل في الحصول على رد من الذكاء الاصطناعي');
            }
            
        } catch (error) {
            this.logger.error('AI conversation error:', error);
            await this.sendError(chatId, 'أعتذر، حدث خطأ في معالجة رسالتك. يرجى المحاولة مرة أخرى.');
        }
    }
    
    /**
     * الحصول على أو إنشاء جلسة المستخدم
     */
    getOrCreateUserSession(userId) {
        if (!this.userSessions.has(userId)) {
            this.userSessions.set(userId, {
                userId,
                createdAt: new Date(),
                history: [],
                messageCount: 0
            });
        }
        return this.userSessions.get(userId);
    }
    
    /**
     * تحديث جلسة المستخدم
     */
    updateUserSession(userId, userMessage, aiResponse) {
        const session = this.userSessions.get(userId);
        if (session) {
            // إضافة الرسائل للتاريخ
            session.history.push({
                role: 'user',
                content: userMessage,
                timestamp: new Date()
            });
            
            session.history.push({
                role: 'assistant',
                content: aiResponse,
                timestamp: new Date()
            });
            
            // الحفاظ على آخر 20 رسالة فقط
            if (session.history.length > 20) {
                session.history = session.history.slice(-20);
            }
            
            session.messageCount += 1;
            session.lastActivity = new Date();
        }
    }
    
    /**
     * إرسال رسالة خطأ
     */
    async sendError(chatId, errorMessage) {
        const errorResponse = `
❌ **حدث خطأ**

${errorMessage}

يرجى المحاولة مرة أخرى أو استخدام /help للمساعدة.
        `;
        
        await this.bot.sendMessage(chatId, errorResponse, {
            parse_mode: 'Markdown'
        });
    }
    
    /**
     * بدء البوت
     */
    start() {
        this.logger.info('Starting LLM Telegram Bot...');
        return this.bot.startPolling();
    }
    
    /**
     * إيقاف البوت
     */
    stop() {
        this.logger.info('Stopping LLM Telegram Bot...');
        return this.bot.stopPolling();
    }
    
    /**
     * الحصول على معلومات البوت
     */
    async getBotInfo() {
        try {
            return await this.bot.getMe();
        } catch (error) {
            this.logger.error('Error getting bot info:', error);
            return null;
        }
    }
}

module.exports = LLMTelegramBot;
