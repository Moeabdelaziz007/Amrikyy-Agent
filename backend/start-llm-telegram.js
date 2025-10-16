#!/usr/bin/env node

/**
 * تشغيل بوت Telegram مع LLM
 * يبدأ بوت Telegram مع تكامل Z.ai GLM-4.6
 * 
 * @author Maya Travel Agent Team
 * @version 1.0.0
 */

// تحميل متغيرات البيئة
require('dotenv').config();

const LLMTelegramBot = require('./src/telegram/LLMTelegramBot');
const path = require('path');
const fs = require('fs');

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
 * التحقق من متغيرات البيئة
 */
function checkEnvironment() {
    header('🔧 فحص متغيرات البيئة');
    
    const requiredVars = [
        'TELEGRAM_BOT_TOKEN',
        'ZAI_API_KEY'
    ];
    
    let allPresent = true;
    
    requiredVars.forEach(varName => {
        if (process.env[varName]) {
            success(`${varName}: محدد`);
        } else {
            error(`${varName}: غير محدد - مطلوب لتشغيل البوت`);
            allPresent = false;
        }
    });
    
    if (!allPresent) {
        error('يرجى تعيين جميع متغيرات البيئة المطلوبة في ملف .env');
        process.exit(1);
    }
    
    return true;
}

/**
 * إنشاء مجلدات مطلوبة
 */
function createDirectories() {
    header('📁 إنشاء المجلدات المطلوبة');
    
    const directories = [
        path.join(__dirname, 'logs'),
        path.join(__dirname, 'data'),
        path.join(__dirname, 'data/telegram')
    ];
    
    directories.forEach(dir => {
        try {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                success(`تم إنشاء: ${dir}`);
            } else {
                info(`موجود بالفعل: ${dir}`);
            }
        } catch (err) {
            error(`فشل في إنشاء ${dir}: ${err.message}`);
        }
    });
}

/**
 * اختبار الاتصال بـ Z.ai
 */
async function testZaiConnection() {
    header('🔗 اختبار الاتصال بـ Z.ai');
    
    try {
        const ZaiClient = require('./src/ai/zaiClient');
        const zaiClient = new ZaiClient();
        
        info('جاري اختبار الاتصال...');
        const healthCheck = await zaiClient.healthCheck();
        
        if (healthCheck.success) {
            success('الاتصال بـ Z.ai يعمل بشكل طبيعي');
            success(`الوقت المستغرق: ${healthCheck.responseTime}ms`);
            return true;
        } else {
            error(`فشل الاتصال بـ Z.ai: ${healthCheck.error}`);
            return false;
        }
        
    } catch (err) {
        error(`خطأ في اختبار Z.ai: ${err.message}`);
        return false;
    }
}

/**
 * بدء البوت
 */
async function startBot() {
    header('🤖 بدء بوت Telegram مع LLM');
    
    try {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        
        info('تهيئة البوت...');
        const bot = new LLMTelegramBot(token, {
            polling: true
        });
        
        // الحصول على معلومات البوت
        const botInfo = await bot.getBotInfo();
        if (botInfo) {
            success(`البوت: @${botInfo.username} (${botInfo.first_name})`);
            success(`معرف البوت: ${botInfo.id}`);
        }
        
        // بدء البوت
        info('بدء البوت...');
        await bot.start();
        
        success('🎉 البوت يعمل الآن!');
        log('\nمعلومات البوت:', 'blue');
        log(`- اسم المستخدم: @${botInfo.username}`, 'blue');
        log(`- الاسم: ${botInfo.first_name}`, 'blue');
        log(`- معرف البوت: ${botInfo.id}`, 'blue');
        log('\nالأوامر المتاحة:', 'blue');
        log('/start - بدء البوت', 'blue');
        log('/help - المساعدة', 'blue');
        log('/status - حالة النظام', 'blue');
        log('/clear - مسح المحادثة', 'blue');
        log('\nالميزات:', 'blue');
        log('✅ ذكاء اصطناعي متقدم (Z.ai GLM-4.6)', 'blue');
        log('✅ دعم العربية والإنجليزية', 'blue');
        log('✅ تخطيط الرحلات', 'blue');
        log('✅ تحليل الميزانية', 'blue');
        log('✅ نصائح ثقافية', 'blue');
        log('✅ إدارة المحادثات', 'blue');
        
        // إعداد إيقاف نظيف
        process.on('SIGINT', async () => {
            log('\n🛑 إيقاف البوت...', 'yellow');
            await bot.stop();
            log('✅ تم إيقاف البوت بنجاح', 'green');
            process.exit(0);
        });
        
        process.on('SIGTERM', async () => {
            log('\n🛑 إيقاف البوت...', 'yellow');
            await bot.stop();
            log('✅ تم إيقاف البوت بنجاح', 'green');
            process.exit(0);
        });
        
        // إبقاء العملية نشطة
        log('\nالبوت يعمل الآن. اضغط Ctrl+C للإيقاف.', 'green');
        
    } catch (err) {
        error(`فشل في بدء البوت: ${err.message}`);
        process.exit(1);
    }
}

/**
 * الدالة الرئيسية
 */
async function main() {
    header('🚀 Maya Travel Agent - بوت Telegram مع LLM');
    
    log(`البيئة: ${process.env.NODE_ENV || 'development'}`, 'blue');
    log(`الوقت: ${new Date().toISOString()}`, 'blue');
    
    try {
        // فحص البيئة
        checkEnvironment();
        
        // إنشاء المجلدات
        createDirectories();
        
        // اختبار الاتصال
        const zaiConnected = await testZaiConnection();
        if (!zaiConnected) {
            error('لا يمكن بدء البوت بدون اتصال بـ Z.ai');
            process.exit(1);
        }
        
        // بدء البوت
        await startBot();
        
    } catch (err) {
        error(`خطأ في التطبيق: ${err.message}`);
        process.exit(1);
    }
}

// تشغيل التطبيق
if (require.main === module) {
    main().catch(error => {
        console.error('خطأ في تشغيل التطبيق:', error);
        process.exit(1);
    });
}

module.exports = {
    checkEnvironment,
    createDirectories,
    testZaiConnection,
    startBot
};
