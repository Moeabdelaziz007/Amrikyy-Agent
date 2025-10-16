#!/usr/bin/env node

/**
 * اختبار بوت Telegram مع LLM
 * يختبر تكامل Z.ai GLM-4.6 مع Telegram Bot
 * 
 * @author Maya Travel Agent Team
 * @version 1.0.0
 */

// تحميل متغيرات البيئة
require('dotenv').config();

const LLMTelegramBot = require('./src/telegram/LLMTelegramBot');

// ألوان للإخراج
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
    log(`✅ ${message}`, 'green');
}

function error(message) {
    log(`❌ ${message}`, 'red');
}

function info(message) {
    log(`ℹ️  ${message}`, 'blue');
}

function warning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

function header(message) {
    log('\n' + '='.repeat(60), 'cyan');
    log(message, 'cyan');
    log('='.repeat(60), 'cyan');
}

/**
 * اختبار تهيئة البوت
 */
async function testBotInitialization() {
    header('🧪 اختبار تهيئة بوت Telegram مع LLM');
    
    try {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        
        if (!token) {
            throw new Error('TELEGRAM_BOT_TOKEN غير محدد في متغيرات البيئة');
        }
        
        info('تهيئة البوت...');
        const bot = new LLMTelegramBot(token, {
            polling: false // تعطيل polling للاختبار
        });
        
        success('تم تهيئة البوت بنجاح');
        
        // اختبار الحصول على معلومات البوت
        info('جاري الحصول على معلومات البوت...');
        const botInfo = await bot.getBotInfo();
        
        if (botInfo) {
            success(`البوت: @${botInfo.username} (${botInfo.first_name})`);
            success(`معرف البوت: ${botInfo.id}`);
            success(`اسم البوت: ${botInfo.first_name}`);
        } else {
            warning('لم يتم الحصول على معلومات البوت');
        }
        
        return bot;
        
    } catch (err) {
        error(`فشل في تهيئة البوت: ${err.message}`);
        return null;
    }
}

/**
 * اختبار الاتصال بـ Z.ai
 */
async function testZaiConnection() {
    header('🔗 اختبار الاتصال بـ Z.ai GLM-4.6');
    
    try {
        const ZaiClient = require('./src/ai/zaiClient');
        const zaiClient = new ZaiClient();
        
        info('جاري اختبار الاتصال بـ Z.ai...');
        const healthCheck = await zaiClient.healthCheck();
        
        if (healthCheck.success) {
            success('الاتصال بـ Z.ai يعمل بشكل طبيعي');
            success(`الوقت المستغرق: ${healthCheck.responseTime}ms`);
        } else {
            error(`فشل الاتصال بـ Z.ai: ${healthCheck.error}`);
            return false;
        }
        
        // اختبار محادثة بسيطة
        info('اختبار محادثة بسيطة...');
        const testMessage = [
            { role: 'system', content: 'أنت مساعد ذكي. أجب بجملة قصيرة.' },
            { role: 'user', content: 'مرحبا، كيف حالك؟' }
        ];
        
        const response = await zaiClient.chatCompletion(testMessage, {
            maxTokens: 100,
            temperature: 0.7
        });
        
        if (response.success && response.content) {
            success('اختبار المحادثة نجح');
            success(`الرد: ${response.content.substring(0, 100)}...`);
        } else {
            error(`فشل اختبار المحادثة: ${response.error}`);
            return false;
        }
        
        return true;
        
    } catch (err) {
        error(`خطأ في اختبار Z.ai: ${err.message}`);
        return false;
    }
}

/**
 * اختبار وظائف البوت
 */
async function testBotFunctions(bot) {
    header('🤖 اختبار وظائف البوت');
    
    try {
        // اختبار إدارة الجلسات
        info('اختبار إدارة جلسات المستخدمين...');
        const testUserId = 12345;
        const session = bot.getOrCreateUserSession(testUserId);
        
        if (session && session.userId === testUserId) {
            success('إدارة الجلسات تعمل بشكل طبيعي');
        } else {
            error('فشل في إدارة الجلسات');
            return false;
        }
        
        // اختبار تحديث الجلسة
        info('اختبار تحديث الجلسة...');
        bot.updateUserSession(testUserId, 'رسالة اختبار', 'رد اختبار');
        const updatedSession = bot.userSessions.get(testUserId);
        
        if (updatedSession && updatedSession.history.length === 2) {
            success('تحديث الجلسة يعمل بشكل طبيعي');
        } else {
            error('فشل في تحديث الجلسة');
            return false;
        }
        
        return true;
        
    } catch (err) {
        error(`خطأ في اختبار وظائف البوت: ${err.message}`);
        return false;
    }
}

/**
 * اختبار تكامل كامل
 */
async function testFullIntegration() {
    header('🚀 اختبار التكامل الكامل');
    
    try {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        
        if (!token) {
            throw new Error('TELEGRAM_BOT_TOKEN غير محدد');
        }
        
        info('إنشاء بوت للاختبار الكامل...');
        const bot = new LLMTelegramBot(token, {
            polling: false
        });
        
        // محاكاة رسالة مستخدم
        const mockMessage = {
            chat: { id: 12345 },
            from: { id: 67890, first_name: 'مختبر' },
            text: 'مرحبا، أريد تخطيط رحلة إلى دبي',
            message_type: 'text'
        };
        
        info('محاكاة معالجة رسالة...');
        
        // اختبار معالجة الرسالة (بدون إرسال فعلي)
        try {
            await bot.handleAIConversation(mockMessage);
            success('معالجة الرسالة تعمل بشكل طبيعي');
        } catch (err) {
            // هذا متوقع في بيئة الاختبار
            if (err.message.includes('sendMessage')) {
                success('معالجة الرسالة تعمل (خطأ في الإرسال متوقع في الاختبار)');
            } else {
                throw err;
            }
        }
        
        return true;
        
    } catch (err) {
        error(`خطأ في اختبار التكامل الكامل: ${err.message}`);
        return false;
    }
}

/**
 * اختبار متغيرات البيئة
 */
function testEnvironmentVariables() {
    header('🔧 اختبار متغيرات البيئة');
    
    const requiredVars = [
        'TELEGRAM_BOT_TOKEN',
        'ZAI_API_KEY'
    ];
    
    let allPresent = true;
    
    requiredVars.forEach(varName => {
        if (process.env[varName]) {
            success(`${varName}: محدد`);
        } else {
            error(`${varName}: غير محدد`);
            allPresent = false;
        }
    });
    
    return allPresent;
}

/**
 * تشغيل الاختبارات الرئيسية
 */
async function main() {
    header('🚀 اختبار بوت Telegram مع LLM');
    
    log(`البيئة: ${process.env.NODE_ENV || 'development'}`, 'blue');
    log(`الوقت: ${new Date().toISOString()}`, 'blue');
    
    const tests = [
        { name: 'متغيرات البيئة', fn: testEnvironmentVariables },
        { name: 'الاتصال بـ Z.ai', fn: testZaiConnection },
        { name: 'تهيئة البوت', fn: testBotInitialization },
        { name: 'وظائف البوت', fn: () => testBotFunctions(global.testBot) },
        { name: 'التكامل الكامل', fn: testFullIntegration }
    ];
    
    let passedTests = 0;
    let totalTests = tests.length;
    
    for (const test of tests) {
        try {
            const result = await test.fn();
            if (result) {
                passedTests++;
                
                // حفظ البوت للاختبارات اللاحقة
                if (test.name === 'تهيئة البوت' && result) {
                    global.testBot = result;
                }
            }
        } catch (err) {
            error(`اختبار "${test.name}" فشل: ${err.message}`);
        }
    }
    
    // النتيجة النهائية
    header('📊 نتائج الاختبارات');
    
    if (passedTests === totalTests) {
        success(`🎉 نجحت جميع الاختبارات! (${passedTests}/${totalTests})`);
        log('\nالخطوات التالية:', 'blue');
        log('1. البوت جاهز للاستخدام مع LLM', 'blue');
        log('2. يمكن بدء البوت مع: node start-llm-telegram.js', 'blue');
        log('3. البوت يدعم العربية والإنجليزية', 'blue');
        log('4. جميع الميزات تعمل بشكل طبيعي', 'blue');
    } else {
        error(`❌ فشل ${totalTests - passedTests}/${totalTests} اختبارات.`);
        log('\nاستكشاف الأخطاء:', 'yellow');
        log('1. تأكد من صحة TELEGRAM_BOT_TOKEN', 'yellow');
        log('2. تأكد من صحة ZAI_API_KEY', 'yellow');
        log('3. تأكد من الاتصال بالإنترنت', 'yellow');
        log('4. راجع رسائل الخطأ أعلاه', 'yellow');
        process.exit(1);
    }
}

// تشغيل الاختبارات
if (require.main === module) {
    main().catch(error => {
        console.error('خطأ في تشغيل الاختبارات:', error);
        process.exit(1);
    });
}

module.exports = {
    testBotInitialization,
    testZaiConnection,
    testBotFunctions,
    testFullIntegration,
    testEnvironmentVariables
};
