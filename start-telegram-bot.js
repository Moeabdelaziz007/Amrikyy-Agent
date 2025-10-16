#!/usr/bin/env node

/**
 * تشغيل بوت Telegram مع LLM
 * ملف تشغيل مبسط من المجلد الرئيسي
 */

console.log('🚀 بدء بوت Telegram مع LLM...\n');

// تغيير إلى مجلد backend
process.chdir('./backend');

// تشغيل البوت
require('./start-llm-telegram.js');
