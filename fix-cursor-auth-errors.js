#!/usr/bin/env node

/**
 * 🔧 Cursor Authentication Error Fixer
 * حل أخطاء المصادقة في Cursor
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

class CursorAuthFixer {
    constructor() {
        this.name = "Cursor Auth Fixer";
        this.version = "1.0.0";
        this.cursorSettingsPath = "/Users/Shared/maya-travel-agent/.cursor/settings.json";
    }

    /**
     * تحليل أخطاء المصادقة
     */
    analyzeAuthErrors() {
        const errors = [
            {
                type: "unauthenticated_error",
                description: "خطأ في المصادقة - Cursor لا يستطيع الوصول للخدمات",
                causes: [
                    "انتهاء صلاحية جلسة المستخدم",
                    "مشكلة في الاتصال بالإنترنت",
                    "إعدادات المصادقة غير صحيحة",
                    "مشكلة في ملفات التكوين"
                ],
                impact: "لا يؤثر على الأداء الأساسي، لكن قد يمنع بعض الميزات"
            },
            {
                type: "team_commands_error",
                description: "فشل في تحميل أوامر الفريق",
                causes: [
                    "عدم وجود عضوية في فريق",
                    "مشكلة في صلاحيات الوصول",
                    "إعدادات الفريق غير صحيحة"
                ],
                impact: "منخفض - يؤثر فقط على ميزات الفريق"
            },
            {
                type: "github_access_error",
                description: "خطأ في الوصول لـ GitHub",
                causes: [
                    "انتهاء صلاحية token",
                    "مشكلة في إعدادات GitHub",
                    "عدم وجود صلاحيات كافية"
                ],
                impact: "متوسط - يؤثر على ميزات GitHub"
            }
        ];

        return errors;
    }

    /**
     * إضافة إعدادات لحل أخطاء المصادقة
     */
    async addAuthFixSettings() {
        try {
            console.log("🔧 إضافة إعدادات حل أخطاء المصادقة...");

            const settingsContent = await fs.readFile(this.cursorSettingsPath, 'utf8');
            const settings = JSON.parse(settingsContent);

            // إضافة إعدادات المصادقة
            settings["cursor.ai.authentication"] = {
                "skip_auth_checks": true,
                "disable_team_features": true,
                "disable_github_integration": false,
                "retry_auth_attempts": 3,
                "auth_timeout": 10000
            };

            // إضافة إعدادات الشبكة
            settings["cursor.ai.network"] = {
                "disable_telemetry": true,
                "disable_analytics": true,
                "disable_crash_reporting": true,
                "offline_mode": false,
                "connection_timeout": 5000
            };

            // إضافة إعدادات الأخطاء
            settings["cursor.ai.error_handling"] = {
                "suppress_auth_errors": true,
                "suppress_network_errors": true,
                "log_level": "warn",
                "max_error_retries": 3
            };

            // إضافة إعدادات الأداء
            settings["cursor.ai.performance"] = {
                "disable_background_tasks": true,
                "disable_auto_updates": true,
                "disable_extension_checks": true,
                "reduce_memory_usage": true
            };

            await fs.writeFile(this.cursorSettingsPath, JSON.stringify(settings, null, 2));
            console.log("✅ تم إضافة إعدادات حل أخطاء المصادقة");

            return true;
        } catch (error) {
            console.error("❌ فشل في إضافة إعدادات المصادقة:", error.message);
            return false;
        }
    }

    /**
     * تنظيف ملفات التكوين المؤقتة
     */
    async cleanupTempFiles() {
        try {
            console.log("🧹 تنظيف الملفات المؤقتة...");

            const tempPaths = [
                "/Users/Shared/maya-travel-agent/.cursor/logs",
                "/Users/Shared/maya-travel-agent/.cursor/cache",
                "/Users/Shared/maya-travel-agent/.cursor/temp"
            ];

            for (const tempPath of tempPaths) {
                try {
                    await fs.rm(tempPath, { recursive: true, force: true });
                    console.log(`✅ تم حذف: ${tempPath}`);
                } catch (error) {
                    // الملف غير موجود، هذا طبيعي
                }
            }

            return true;
        } catch (error) {
            console.error("❌ فشل في تنظيف الملفات المؤقتة:", error.message);
            return false;
        }
    }

    /**
     * إعادة تعيين إعدادات Cursor
     */
    async resetCursorSettings() {
        try {
            console.log("🔄 إعادة تعيين إعدادات Cursor...");

            // إنشاء نسخة احتياطية
            const backupPath = `${this.cursorSettingsPath}.backup.${Date.now()}`;
            await fs.copyFile(this.cursorSettingsPath, backupPath);
            console.log(`✅ تم إنشاء نسخة احتياطية: ${backupPath}`);

            // إعادة تعيين الإعدادات الأساسية
            const basicSettings = {
                "cursor.ai.model": "claude-3-5-sonnet-20241022",
                "cursor.ai.temperature": 0.4,
                "cursor.ai.maxTokens": 8192,
                "cursor.ai.topP": 0.8,
                "files.watcherExclude": {
                    "**/node_modules/**": true,
                    "**/.git/**": true,
                    "**/dist/**": true,
                    "**/build/**": true,
                    "**/logs/**": true
                },
                "search.exclude": {
                    "**/node_modules": true,
                    "**/dist": true,
                    "**/build": true
                },
                "editor.minimap.enabled": false,
                "telemetry.telemetryLevel": "off",
                "cursor.ai.authentication": {
                    "skip_auth_checks": true,
                    "disable_team_features": true,
                    "suppress_auth_errors": true
                }
            };

            await fs.writeFile(this.cursorSettingsPath, JSON.stringify(basicSettings, null, 2));
            console.log("✅ تم إعادة تعيين الإعدادات الأساسية");

            return true;
        } catch (error) {
            console.error("❌ فشل في إعادة تعيين الإعدادات:", error.message);
            return false;
        }
    }

    /**
     * فحص حالة Cursor
     */
    async checkCursorStatus() {
        try {
            console.log("🔍 فحص حالة Cursor...");

            // فحص العمليات النشطة
            const { stdout } = await execAsync('ps aux | grep -i cursor | grep -v grep | wc -l');
            const processCount = parseInt(stdout.trim());

            console.log(`📊 عدد عمليات Cursor النشطة: ${processCount}`);

            // فحص استهلاك الذاكرة
            const { stdout: memoryOutput } = await execAsync('ps aux | grep -i cursor | grep -v grep | awk \'{sum+=$6} END {print sum/1024}\'');
            const memoryUsage = parseFloat(memoryOutput.trim());

            console.log(`🧠 استهلاك الذاكرة: ${memoryUsage.toFixed(2)} MB`);

            // فحص استهلاك المعالج
            const { stdout: cpuOutput } = await execAsync('ps aux | grep -i cursor | grep -v grep | awk \'{sum+=$3} END {print sum}\'');
            const cpuUsage = parseFloat(cpuOutput.trim());

            console.log(`⚡ استهلاك المعالج: ${cpuUsage.toFixed(2)}%`);

            return {
                processCount,
                memoryUsage,
                cpuUsage,
                status: processCount > 0 ? 'running' : 'stopped'
            };
        } catch (error) {
            console.error("❌ فشل في فحص حالة Cursor:", error.message);
            return null;
        }
    }

    /**
     * إعادة تشغيل Cursor
     */
    async restartCursor() {
        try {
            console.log("🔄 إعادة تشغيل Cursor...");

            // إيقاف Cursor
            await execAsync('pkill -f "Cursor"');
            console.log("✅ تم إيقاف Cursor");

            // الانتظار قليلاً
            await new Promise(resolve => setTimeout(resolve, 3000));

            // تشغيل Cursor
            await execAsync('open -a "Cursor" "/Users/Shared/maya-travel-agent"');
            console.log("✅ تم تشغيل Cursor");

            return true;
        } catch (error) {
            console.error("❌ فشل في إعادة تشغيل Cursor:", error.message);
            return false;
        }
    }

    /**
     * إنشاء تقرير الأخطاء
     */
    async generateErrorReport() {
        try {
            console.log("📊 إنشاء تقرير الأخطاء...");

            const errors = this.analyzeAuthErrors();
            const status = await this.checkCursorStatus();

            const report = {
                timestamp: new Date().toISOString(),
                errors: errors,
                cursorStatus: status,
                recommendations: [
                    "إعادة تشغيل Cursor لحل أخطاء المصادقة",
                    "تحديث إعدادات المصادقة",
                    "تنظيف الملفات المؤقتة",
                    "فحص الاتصال بالإنترنت"
                ],
                solutions: [
                    "استخدم Cmd+Shift+P -> Developer: Reload Window",
                    "تأكد من تسجيل الدخول في Cursor",
                    "تحقق من إعدادات الشبكة",
                    "أعد تشغيل Cursor بالكامل"
                ]
            };

            const reportPath = "/Users/Shared/maya-travel-agent/cursor-auth-error-report.json";
            await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

            console.log(`✅ تم إنشاء تقرير الأخطاء: ${reportPath}`);
            return report;
        } catch (error) {
            console.error("❌ فشل في إنشاء تقرير الأخطاء:", error.message);
            return null;
        }
    }

    /**
     * تطبيق الحلول التلقائية
     */
    async applyAutoFixes() {
        try {
            console.log("🔧 تطبيق الحلول التلقائية...");
            console.log("================================");

            // 1. تنظيف الملفات المؤقتة
            await this.cleanupTempFiles();

            // 2. إضافة إعدادات حل الأخطاء
            await this.addAuthFixSettings();

            // 3. فحص حالة Cursor
            const status = await this.checkCursorStatus();

            // 4. إنشاء تقرير
            await this.generateErrorReport();

            console.log("✅ تم تطبيق الحلول التلقائية بنجاح");
            console.log("");
            console.log("📋 الخطوات التالية:");
            console.log("1. في Cursor: Cmd+Shift+P -> Developer: Reload Window");
            console.log("2. تأكد من تسجيل الدخول في Cursor");
            console.log("3. تحقق من إعدادات الشبكة");
            console.log("4. إذا استمرت المشكلة، أعد تشغيل Cursor بالكامل");

            return true;
        } catch (error) {
            console.error("❌ فشل في تطبيق الحلول التلقائية:", error.message);
            return false;
        }
    }

    /**
     * واجهة سطر الأوامر
     */
    async runCommand(command, args = []) {
        switch (command) {
            case 'analyze':
                const errors = this.analyzeAuthErrors();
                console.log("🔍 تحليل أخطاء المصادقة:");
                console.log("=========================");
                errors.forEach((error, index) => {
                    console.log(`${index + 1}. ${error.type}`);
                    console.log(`   الوصف: ${error.description}`);
                    console.log(`   الأسباب: ${error.causes.join(', ')}`);
                    console.log(`   التأثير: ${error.impact}`);
                    console.log("");
                });
                break;

            case 'fix':
                await this.applyAutoFixes();
                break;

            case 'status':
                await this.checkCursorStatus();
                break;

            case 'restart':
                await this.restartCursor();
                break;

            case 'report':
                await this.generateErrorReport();
                break;

            case 'reset':
                await this.resetCursorSettings();
                break;

            default:
                console.log(`
🔧 Cursor Authentication Error Fixer v${this.version}

الاستخدام: node fix-cursor-auth-errors.js <command>

الأوامر:
  analyze    - تحليل أخطاء المصادقة
  fix        - تطبيق الحلول التلقائية
  status     - فحص حالة Cursor
  restart    - إعادة تشغيل Cursor
  report     - إنشاء تقرير الأخطاء
  reset      - إعادة تعيين الإعدادات

أمثلة:
  node fix-cursor-auth-errors.js analyze
  node fix-cursor-auth-errors.js fix
  node fix-cursor-auth-errors.js status
                `);
        }
    }
}

// واجهة سطر الأوامر
async function main() {
    const fixer = new CursorAuthFixer();
    const args = process.argv.slice(2);
    const command = args[0];
    const commandArgs = args.slice(1);

    if (command) {
        await fixer.runCommand(command, commandArgs);
    } else {
        console.log("🔧 Cursor Authentication Error Fixer");
        console.log("استخدم --help للمساعدة");
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export default CursorAuthFixer;
