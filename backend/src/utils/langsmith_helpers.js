/**
 * 🚀 LangSmith Traceable Wrappers Helper
 * 
 * هذا الملف يحتوي على أدوات مساعدة لتطبيق التتبع على النظام
 * باستخدام LangSmith للمراقبة المتقدمة للوكلاء
 */

// LangSmith helpers with fallback for missing dependencies
let traceable;

try {
  const langsmith = require('langsmith');
  traceable = langsmith.traceable || ((fn, options) => fn);
} catch (error) {
  console.warn('⚠️ LangSmith not available, using fallback functions');
  traceable = (fn, options) => fn;
}
const winston = require('winston');

// إعداد logger للتتبع
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/langsmith-tracing.log' }),
    new winston.transports.Console(),
  ],
});

/**
 * 🎯 مغلف قابل للتتبع للدوال الأساسية
 * 
 * @param {Function} originalFunction - الدالة الأصلية
 * @param {Object} options - خيارات التتبع
 * @param {string} options.name - اسم الدالة للتتبع
 * @param {Array} options.tags - علامات التتبع
 * @param {Object} options.metadata - بيانات إضافية
 * @returns {Function} - الدالة الملفوفة القابلة للتتبع
 */
function createTraceableWrapper(originalFunction, options = {}) {
  const {
    name = 'untraced_function',
    tags = ['system'],
    metadata = {},
  } = options;

  return traceable(
    async function tracedFunction(...args) {
      const startTime = Date.now();
      
      try {
        logger.info(`🚀 بدء تنفيذ: ${name}`, {
          function: name,
          args: args.length,
          tags,
          metadata,
          timestamp: new Date().toISOString(),
        });

        // تنفيذ الدالة الأصلية
        const result = await originalFunction.apply(this, args);
        
        const executionTime = Date.now() - startTime;
        
        logger.info(`✅ اكتمل تنفيذ: ${name}`, {
          function: name,
          executionTime: `${executionTime}ms`,
          success: true,
          resultType: typeof result,
        });

        return result;
      } catch (error) {
        const executionTime = Date.now() - startTime;
        
        logger.error(`❌ فشل تنفيذ: ${name}`, {
          function: name,
          executionTime: `${executionTime}ms`,
          error: error.message,
          stack: error.stack,
        });

        throw error;
      }
    },
    {
      name,
      tags,
      metadata: {
        ...metadata,
        system: 'maya-travel-agent',
        version: '1.0.0',
      },
    }
  );
}

/**
 * 🛠️ مغلف خاص للأدوات (Tools)
 * 
 * @param {Object} tool - الأداة الأصلية
 * @param {string} toolName - اسم الأداة
 * @returns {Object} - الأداة الملفوفة القابلة للتتبع
 */
function wrapTool(tool, toolName) {
  if (!tool || typeof tool.execute !== 'function') {
    throw new Error(`الأداة ${toolName} يجب أن تحتوي على دالة execute`);
  }

  const originalExecute = tool.execute;
  
  // إنشاء نسخة قابلة للتتبع من دالة execute
  tool.execute = createTraceableWrapper(originalExecute, {
    name: `${toolName}_tool`,
    tags: ['tool', 'agent_hands', toolName],
    metadata: {
      toolName,
      toolType: 'agent_tool',
    },
  });

  return tool;
}

/**
 * 🧠 مغلف خاص لعقل الوكيل (Agent Brain)
 * 
 * @param {Function} brainFunction - دالة عقل الوكيل
 * @param {string} agentName - اسم الوكيل
 * @returns {Function} - الدالة الملفوفة القابلة للتتبع
 */
function wrapAgentBrain(brainFunction, agentName) {
  return createTraceableWrapper(brainFunction, {
    name: `${agentName}_brain`,
    tags: ['agent', 'brain', agentName],
    metadata: {
      agentName,
      layer: 'agent_brain',
    },
  });
}

/**
 * 🎭 مغلف خاص لطبقة التنسيق (Orchestrator)
 * 
 * @param {Function} orchestratorFunction - دالة التنسيق
 * @param {string} orchestratorName - اسم المنسق
 * @returns {Function} - الدالة الملفوفة القابلة للتتبع
 */
function wrapOrchestrator(orchestratorFunction, orchestratorName) {
  return createTraceableWrapper(orchestratorFunction, {
    name: `${orchestratorName}_orchestrator`,
    tags: ['orchestrator', 'coordination', orchestratorName],
    metadata: {
      orchestratorName,
      layer: 'orchestration',
    },
  });
}

/**
 * 🔍 مغلف خاص لاستدعاءات LLM
 * 
 * @param {Function} llmFunction - دالة استدعاء LLM
 * @param {string} modelName - اسم النموذج
 * @returns {Function} - الدالة الملفوفة القابلة للتتبع
 */
function wrapLLMCall(llmFunction, modelName) {
  return createTraceableWrapper(llmFunction, {
    name: `${modelName}_llm_call`,
    tags: ['llm', 'ai', modelName],
    metadata: {
      modelName,
      layer: 'llm_call',
    },
  });
}

/**
 * 📊 مغلف خاص لعمليات قاعدة البيانات
 * 
 * @param {Function} dbFunction - دالة قاعدة البيانات
 * @param {string} operationName - اسم العملية
 * @returns {Function} - الدالة الملفوفة القابلة للتتبع
 */
function wrapDatabaseOperation(dbFunction, operationName) {
  return createTraceableWrapper(dbFunction, {
    name: `db_${operationName}`,
    tags: ['database', 'storage', operationName],
    metadata: {
      operationName,
      layer: 'database',
    },
  });
}

/**
 * 🔄 مغلف خاص للعمليات غير المتزامنة
 * 
 * @param {Function} asyncFunction - الدالة غير المتزامنة
 * @param {string} operationName - اسم العملية
 * @returns {Function} - الدالة الملفوفة القابلة للتتبع
 */
function wrapAsyncOperation(asyncFunction, operationName) {
  return createTraceableWrapper(asyncFunction, {
    name: `async_${operationName}`,
    tags: ['async', 'operation', operationName],
    metadata: {
      operationName,
      layer: 'async_operation',
    },
  });
}

/**
 * 🎯 دالة مساعدة لتطبيق التتبع على كائن كامل
 * 
 * @param {Object} targetObject - الكائن المستهدف
 * @param {Object} options - خيارات التتبع
 * @returns {Object} - الكائن مع التتبع المطبق
 */
function applyTracingToObject(targetObject, options = {}) {
  const {
    prefix = 'traced',
    excludeMethods = ['constructor', 'toString', 'valueOf'],
    includePrivate = false,
  } = options;

  const tracedObject = {};

  for (const [key, value] of Object.entries(targetObject)) {
    if (typeof value === 'function' && !excludeMethods.includes(key)) {
      // تخطي الطرق الخاصة إذا لم يتم تضمينها
      if (!includePrivate && key.startsWith('_')) {
        tracedObject[key] = value;
        continue;
      }

      tracedObject[key] = createTraceableWrapper(value, {
        name: `${prefix}_${key}`,
        tags: ['method', key],
        metadata: {
          methodName: key,
          objectName: prefix,
        },
      });
    } else {
      tracedObject[key] = value;
    }
  }

  return tracedObject;
}

/**
 * 📈 دالة مساعدة لإنشاء تقرير التتبع
 * 
 * @param {Object} traceData - بيانات التتبع
 * @returns {Object} - تقرير التتبع
 */
function generateTraceReport(traceData) {
  return {
    timestamp: new Date().toISOString(),
    system: 'maya-travel-agent',
    version: '1.0.0',
    traceData,
    summary: {
      totalTraces: traceData.length,
      successRate: traceData.filter(t => t.success).length / traceData.length,
      averageExecutionTime: traceData.reduce((sum, t) => sum + t.executionTime, 0) / traceData.length,
    },
  };
}

/**
 * 🔧 دالة مساعدة لإعداد التتبع التلقائي
 * 
 * @param {Object} config - إعدادات التتبع
 */
function setupAutoTracing(config = {}) {
  const {
    enableConsoleLogging = true,
    enableFileLogging = true,
    logLevel = 'info',
    logFile = 'logs/auto-tracing.log',
  } = config;

  if (enableConsoleLogging) {
    logger.add(new winston.transports.Console({
      level: logLevel,
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }));
  }

  if (enableFileLogging) {
    logger.add(new winston.transports.File({
      filename: logFile,
      level: logLevel,
    }));
  }

  logger.info('🚀 تم إعداد التتبع التلقائي بنجاح', {
    config,
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  createTraceableWrapper,
  wrapTool,
  wrapAgentBrain,
  wrapOrchestrator,
  wrapLLMCall,
  wrapDatabaseOperation,
  wrapAsyncOperation,
  applyTracingToObject,
  generateTraceReport,
  setupAutoTracing,
  logger,
};
