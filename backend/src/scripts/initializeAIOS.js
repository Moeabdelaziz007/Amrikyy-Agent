/**
 * تهيئة نظام AI OS
 * 
 * يقوم بـ:
 * - تحميل Quantum Gemini Core
 * - الاتصال بخوادم MCP
 * - تفعيل ذاكرة Redis
 * - قراءة خطة التنفيذ
 * - بدء تنفيذ المهام
 * 
 * @author Ona AI
 * @created 2025-01-25
 */

// Load environment variables first
require('dotenv').config();

const fs = require('fs').promises;
const path = require('path');
const QuantumGeminiCore = require('../agents/QuantumGeminiCore');
const mcpServerManager = require('../services/MCPServerManager'); // Singleton instance
const redisCache = require('../cache/RedisCache');

class AIOSInitializer {
  constructor() {
    this.quantumCore = null;
    this.mcpManager = null;
    this.plan = null;
    this.status = {
      quantumCore: 'pending',
      mcpServers: 'pending',
      redisMemory: 'pending',
      planLoaded: 'pending',
      tasksStarted: 'pending'
    };
  }

  /**
   * تهيئة Quantum Gemini Core
   */
  async initializeQuantumCore() {
    console.log('🚀 تهيئة Quantum Gemini Core...');
    
    try {
      this.quantumCore = new QuantumGeminiCore();
      
      // انتظار التهيئة مع timeout أطول
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout: Quantum Core initialization took too long'));
        }, 30000); // 30 ثانية
        
        this.quantumCore.once('initialized', () => {
          clearTimeout(timeout);
          resolve();
        });
        
        this.quantumCore.once('error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });
      
      this.status.quantumCore = 'active';
      console.log('✅ Quantum Gemini Core جاهز');
      
      return true;
    } catch (error) {
      console.error('❌ فشل تهيئة Quantum Core:', error.message);
      this.status.quantumCore = 'failed';
      return false;
    }
  }

  /**
   * الاتصال بخوادم MCP
   */
  async connectMCPServers() {
    console.log('🔌 الاتصال بخوادم MCP...');
    
    try {
      this.mcpManager = mcpServerManager; // Use singleton instance
      await this.mcpManager.initialize();
      
      const servers = this.mcpManager.getAllServers();
      console.log(`✅ متصل بـ ${servers.length} خادم MCP:`);
      servers.forEach(server => {
        console.log(`   - ${server.name}: ${server.status}`);
      });
      
      this.status.mcpServers = 'connected';
      return true;
    } catch (error) {
      console.error('❌ فشل الاتصال بخوادم MCP:', error.message);
      this.status.mcpServers = 'failed';
      return false;
    }
  }

  /**
   * تفعيل ذاكرة Redis
   */
  async enableRedisMemory() {
    console.log('💾 تفعيل ذاكرة Redis...');
    
    try {
      // اختبار الاتصال
      await redisCache.set('aios:test', 'active', 10);
      const test = await redisCache.get('aios:test');
      
      if (test === 'active') {
        console.log('✅ ذاكرة Redis نشطة');
        this.status.redisMemory = 'active';
        return true;
      } else {
        throw new Error('فشل اختبار Redis');
      }
    } catch (error) {
      console.warn('⚠️  Redis غير متاح - استخدام الذاكرة المحلية');
      this.status.redisMemory = 'fallback';
      return false;
    }
  }

  /**
   * تحميل خطة التنفيذ
   */
  async loadImplementationPlan() {
    console.log('📋 تحميل خطة التنفيذ...');
    
    try {
      const planPath = path.join(__dirname, '../../../AMRIKYY_AI_OS_PLAN.md');
      const planContent = await fs.readFile(planPath, 'utf-8');
      
      this.plan = {
        content: planContent,
        phases: this.extractPhases(planContent),
        tasks: this.extractTasks(planContent),
        loadedAt: new Date().toISOString()
      };
      
      console.log('✅ تم تحميل الخطة:');
      console.log(`   - ${this.plan.phases.length} مراحل`);
      console.log(`   - ${this.plan.tasks.length} مهمة`);
      
      this.status.planLoaded = 'loaded';
      return true;
    } catch (error) {
      console.error('❌ فشل تحميل الخطة:', error.message);
      this.status.planLoaded = 'failed';
      return false;
    }
  }

  /**
   * استخراج المراحل من الخطة
   */
  extractPhases(content) {
    const phases = [];
    const phaseRegex = /##\s+Phase\s+(\d+):\s+(.+)/gi;
    let match;
    
    while ((match = phaseRegex.exec(content)) !== null) {
      phases.push({
        number: parseInt(match[1]),
        name: match[2].trim(),
        status: 'pending'
      });
    }
    
    return phases;
  }

  /**
   * استخراج المهام من الخطة
   */
  extractTasks(content) {
    const tasks = [];
    const taskRegex = /[-*]\s+\[([x\s])\]\s+(.+)/gi;
    let match;
    
    while ((match = taskRegex.exec(content)) !== null) {
      tasks.push({
        completed: match[1].toLowerCase() === 'x',
        description: match[2].trim(),
        status: match[1].toLowerCase() === 'x' ? 'done' : 'pending'
      });
    }
    
    return tasks;
  }

  /**
   * بدء تنفيذ المهام
   */
  async startTaskExecution() {
    console.log('⚡ بدء تنفيذ المهام...');
    
    if (!this.plan) {
      console.error('❌ لم يتم تحميل الخطة');
      return false;
    }
    
    try {
      const pendingTasks = this.plan.tasks.filter(t => t.status === 'pending');
      console.log(`📝 المهام المعلقة: ${pendingTasks.length}`);
      
      if (pendingTasks.length > 0) {
        console.log('\n🎯 المهام التالية:');
        pendingTasks.slice(0, 5).forEach((task, i) => {
          console.log(`   ${i + 1}. ${task.description}`);
        });
      }
      
      this.status.tasksStarted = 'ready';
      console.log('\n✅ النظام جاهز لتنفيذ المهام');
      return true;
    } catch (error) {
      console.error('❌ فشل بدء المهام:', error.message);
      this.status.tasksStarted = 'failed';
      return false;
    }
  }

  /**
   * تنفيذ مهمة واحدة باستخدام Quantum Core
   */
  async executeTask(taskDescription) {
    if (!this.quantumCore) {
      throw new Error('Quantum Core غير مهيأ');
    }
    
    console.log(`\n🔄 تنفيذ: ${taskDescription}`);
    
    const prompt = `
أنت Quantum Gemini Core، نظام AI OS متقدم.

المهمة: ${taskDescription}

قم بتحليل المهمة وتقديم:
1. الخطوات المطلوبة للتنفيذ
2. الملفات التي يجب إنشاؤها أو تعديلها
3. الكود المطلوب (إن وجد)
4. التحديات المحتملة
5. معايير النجاح

كن دقيقاً ومحترفاً.
    `.trim();
    
    try {
      const result = await this.quantumCore.generateResponse(prompt);
      console.log('\n📊 النتيجة:');
      console.log(result.response);
      return result;
    } catch (error) {
      console.error('❌ فشل تنفيذ المهمة:', error.message);
      throw error;
    }
  }

  /**
   * الحصول على حالة النظام
   */
  getSystemStatus() {
    return {
      status: this.status,
      plan: this.plan ? {
        phases: this.plan.phases.length,
        tasks: this.plan.tasks.length,
        completed: this.plan.tasks.filter(t => t.status === 'done').length,
        pending: this.plan.tasks.filter(t => t.status === 'pending').length
      } : null,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * تهيئة كاملة للنظام
   */
  async initialize() {
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║   🚀 تهيئة نظام Amrikyy AI OS           ║');
    console.log('╚════════════════════════════════════════════╝\n');
    
    const steps = [
      { name: 'Quantum Core', fn: () => this.initializeQuantumCore() },
      { name: 'MCP Servers', fn: () => this.connectMCPServers() },
      { name: 'Redis Memory', fn: () => this.enableRedisMemory() },
      { name: 'Implementation Plan', fn: () => this.loadImplementationPlan() },
      { name: 'Task Execution', fn: () => this.startTaskExecution() }
    ];
    
    for (const step of steps) {
      const success = await step.fn();
      if (!success && step.name !== 'Redis Memory') {
        console.error(`\n❌ فشلت التهيئة في: ${step.name}`);
        return false;
      }
    }
    
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║   ✅ النظام جاهز بالكامل!                ║');
    console.log('╚════════════════════════════════════════════╝\n');
    
    // عرض الحالة النهائية
    const status = this.getSystemStatus();
    console.log('📊 حالة النظام:');
    console.log(JSON.stringify(status, null, 2));
    
    return true;
  }
}

// تشغيل التهيئة
async function main() {
  const initializer = new AIOSInitializer();
  
  try {
    const success = await initializer.initialize();
    
    if (success) {
      console.log('\n💡 يمكنك الآن:');
      console.log('   1. تنفيذ مهمة: initializer.executeTask("وصف المهمة")');
      console.log('   2. عرض الحالة: initializer.getSystemStatus()');
      console.log('   3. الوصول إلى Quantum Core: initializer.quantumCore');
      
      // حفظ المثيل للاستخدام
      global.aiosInitializer = initializer;
    } else {
      console.error('\n❌ فشلت التهيئة');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ خطأ حرج:', error);
    process.exit(1);
  }
}

// تشغيل إذا تم استدعاؤه مباشرة
if (require.main === module) {
  main();
}

module.exports = AIOSInitializer;
