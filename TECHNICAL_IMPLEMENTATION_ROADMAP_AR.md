# 🗺️ خارطة طريق التنفيذ الفني - Amrikyy Agent Platform
**التاريخ**: 23 أكتوبر 2025  
**الفرع**: `copilot/implement-streaming-api-route-again`

---

## 🎯 الهدف العام

إكمال تنفيذ **Issue #104** و **Issue #105** لتفعيل:
1. ✅ **Streaming API** - بث الاستجابات في الوقت الفعلي عبر SSE
2. ✅ **Coordinator API** - تنسيق سير عمل الوكلاء المتعددة

---

## 📋 خطة التنفيذ التفصيلية

### المرحلة 1️⃣: Streaming Service Implementation

#### الملف: `backend/src/services/streamService.js`

**الوظيفة الأساسية**:
```javascript
/**
 * Stream responses using Server-Sent Events
 * @param {Object} params - Streaming parameters
 * @param {Request} params.req - Express request
 * @param {Response} params.res - Express response
 * @param {string} params.prompt - User prompt
 * @param {Object} params.model - Gemini model instance
 * @param {Object} params.options - Streaming options
 * @param {Object} params.meta - Metadata (userId, agentName, etc.)
 * @returns {Object} { cancel: Function }
 */
async function streamWithSSE({ req, res, prompt, model, options = {}, meta = {} })
```

**التدفق المطلوب**:
```
1. Start LangSmith Span
   ↓
2. Initialize AgentStreaming
   ↓
3. Stream Gemini Response
   ↓
   ├─→ onChunk: Send chunk via SSE + increment metrics
   ├─→ onProgress: Update progress
   └─→ onDone/onError: Complete stream + update metrics
   ↓
4. Finish Span
   ↓
5. Return cancel function
```

**الكود المطلوب**:
```javascript
const AgentStreaming = require('../utils/AgentStreaming');
const AgentLangSmith = require('../utils/AgentLangSmith');
const metricsService = require('./metricsService');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

class StreamService {
  constructor() {
    this.activeStreams = new Map();
    this.langsmith = new AgentLangSmith('StreamService');
  }

  async streamWithSSE({ req, res, prompt, model, options = {}, meta = {} }) {
    const streamId = uuidv4();
    const agentName = meta.agentName || 'unknown';
    const userId = meta.userId || req.user?.id || 'anonymous';
    const startTime = Date.now();

    // 1. Start LangSmith Span
    const spanId = this.langsmith.startTrace('stream.sse', {
      prompt,
      agentName,
      userId,
      model: model.model || 'gemini-2.0-flash-exp'
    });

    // 2. Initialize SSE streaming
    const streamer = new AgentStreaming(agentName);
    streamer.initializeStream(res, streamId);

    // 3. Track active stream
    this.activeStreams.set(streamId, {
      streamId,
      userId,
      agentName,
      startTime,
      spanId
    });

    // Update metrics
    metricsService.recordStreamStart(agentName);

    // 4. Create cancel function
    let cancelled = false;
    const cancel = () => {
      if (!cancelled) {
        cancelled = true;
        streamer.closeStream(streamId, 'cancelled');
        
        const duration = (Date.now() - startTime) / 1000;
        metricsService.recordStreamFailed(agentName, duration);
        
        this.langsmith.endTrace(spanId, {
          error: 'Stream cancelled by client',
          metadata: { cancelled: true, duration }
        });
        
        this.activeStreams.delete(streamId);
        logger.info(`[StreamService] Stream ${streamId} cancelled`);
      }
    };

    // 5. Handle client disconnect
    req.on('close', () => {
      if (!cancelled) {
        cancel();
      }
    });

    // 6. Stream Gemini response
    try {
      const result = await streamer.streamGeminiResponse(streamId, model, prompt);

      if (result.success) {
        const duration = (Date.now() - startTime) / 1000;
        
        // Update metrics
        metricsService.recordStreamComplete(agentName, duration);
        
        // End trace
        this.langsmith.endTrace(spanId, {
          usage: result.usage,
          metadata: {
            chunks: result.chunks,
            duration,
            success: true
          }
        });
        
        this.activeStreams.delete(streamId);
        
        logger.info(`[StreamService] Stream ${streamId} completed successfully`);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      
      logger.error(`[StreamService] Stream ${streamId} failed:`, error);
      
      // Update metrics
      metricsService.recordStreamFailed(agentName, duration);
      
      // End trace with error
      this.langsmith.endTrace(spanId, {
        error: error.message,
        metadata: { duration, success: false }
      });
      
      this.activeStreams.delete(streamId);
      
      // Send error if stream still active
      if (streamer.isStreamActive(streamId)) {
        streamer.sendError(streamId, error, false);
      }
    }

    return { cancel, streamId };
  }

  /**
   * Get active streams
   */
  getActiveStreams() {
    return Array.from(this.activeStreams.values());
  }

  /**
   * Get stream by ID
   */
  getStream(streamId) {
    return this.activeStreams.get(streamId);
  }

  /**
   * Cancel stream
   */
  cancelStream(streamId) {
    const stream = this.activeStreams.get(streamId);
    if (stream && stream.cancel) {
      stream.cancel();
      return true;
    }
    return false;
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      activeStreams: this.activeStreams.size,
      langsmithStats: this.langsmith.getStats()
    };
  }
}

// Export singleton
module.exports = new StreamService();
```

**الوقت المقدر**: 30-45 دقيقة

---

### المرحلة 2️⃣: Coordinator Service Implementation

#### الملف: `backend/src/services/coordinatorService.js`

**الوظيفة الأساسية**:
```javascript
/**
 * Execute multi-agent workflow
 * @param {string} workflowName - Name of workflow to execute
 * @param {Object} inputs - Workflow inputs
 * @param {Object} options - Execution options
 * @param {Object} meta - Metadata (userId, etc.)
 * @returns {Promise<Object>} Workflow result
 */
async function executeWorkflow(workflowName, inputs, options = {}, meta = {})
```

**التدفق المطلوب**:
```
1. Start LangSmith Span
   ↓
2. Call MultiAgentCoordinator.executeWorkflow()
   ↓
3. Track duration and metrics
   ↓
4. Finish Span with results
   ↓
5. Return workflow result
```

**الكود المطلوب**:
```javascript
const MultiAgentCoordinator = require('../utils/MultiAgentCoordinator');
const AgentLangSmith = require('../utils/AgentLangSmith');
const metricsService = require('./metricsService');
const logger = require('../utils/logger');

class CoordinatorService {
  constructor() {
    this.coordinator = new MultiAgentCoordinator('ProductionCoordinator');
    this.langsmith = new AgentLangSmith('CoordinatorService');
    this.runningWorkflows = new Map();
  }

  async executeWorkflow(workflowName, inputs, options = {}, meta = {}) {
    const userId = meta.userId || 'anonymous';
    const startTime = Date.now();

    // 1. Start LangSmith Span
    const spanId = this.langsmith.startTrace('coordinator.workflow', {
      workflowName,
      userId,
      strategy: options.strategy || 'auto'
    });

    logger.info(`[CoordinatorService] Starting workflow: ${workflowName}`, {
      userId,
      inputs: Object.keys(inputs)
    });

    try {
      // 2. Execute workflow
      const result = await this.coordinator.executeWorkflow(workflowName, inputs);

      const duration = (Date.now() - startTime) / 1000;

      // 3. Update metrics
      const strategy = result.strategy || 'unknown';
      const status = result.success ? 'success' : 'failed';
      
      metricsService.recordCoordinatorWorkflow(strategy, status, duration);

      // 4. End trace
      this.langsmith.endTrace(spanId, {
        usage: {
          promptTokens: 0, // Can be calculated from agent traces
          completionTokens: 0,
          totalTokens: 0
        },
        metadata: {
          workflowName,
          strategy,
          duration,
          success: result.success,
          steps: result.results?.length || 0
        }
      });

      logger.info(`[CoordinatorService] Workflow ${workflowName} completed`, {
        success: result.success,
        duration: `${duration.toFixed(2)}s`
      });

      return {
        success: true,
        workflowName,
        result,
        duration: `${duration.toFixed(2)}s`,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;

      logger.error(`[CoordinatorService] Workflow ${workflowName} failed:`, error);

      // Update metrics
      metricsService.recordCoordinatorWorkflow('unknown', 'failed', duration);

      // End trace with error
      this.langsmith.endTrace(spanId, {
        error: error.message,
        metadata: {
          workflowName,
          duration,
          success: false
        }
      });

      return {
        success: false,
        workflowName,
        error: error.message,
        duration: `${duration.toFixed(2)}s`,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Execute sequential workflow
   */
  async executeSequential(steps, input, meta = {}) {
    const startTime = Date.now();

    const spanId = this.langsmith.startTrace('coordinator.sequential', {
      steps: steps.length,
      userId: meta.userId
    });

    try {
      const result = await this.coordinator.executeSequential(steps, input);
      
      const duration = (Date.now() - startTime) / 1000;
      const status = result.success ? 'success' : 'failed';
      
      metricsService.recordCoordinatorWorkflow('sequential', status, duration);
      
      this.langsmith.endTrace(spanId, {
        metadata: { duration, success: result.success }
      });

      return result;
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      metricsService.recordCoordinatorWorkflow('sequential', 'failed', duration);
      
      this.langsmith.endTrace(spanId, {
        error: error.message,
        metadata: { duration, success: false }
      });
      
      throw error;
    }
  }

  /**
   * Execute parallel workflow
   */
  async executeParallel(tasks, input, meta = {}) {
    const startTime = Date.now();

    const spanId = this.langsmith.startTrace('coordinator.parallel', {
      tasks: tasks.length,
      userId: meta.userId
    });

    try {
      const result = await this.coordinator.executeParallel(tasks, input);
      
      const duration = (Date.now() - startTime) / 1000;
      const status = result.success ? 'success' : 'failed';
      
      metricsService.recordCoordinatorWorkflow('parallel', status, duration);
      
      this.langsmith.endTrace(spanId, {
        metadata: { duration, success: result.success }
      });

      return result;
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      metricsService.recordCoordinatorWorkflow('parallel', 'failed', duration);
      
      this.langsmith.endTrace(spanId, {
        error: error.message,
        metadata: { duration, success: false }
      });
      
      throw error;
    }
  }

  /**
   * Execute hierarchical workflow
   */
  async executeHierarchical(master, subAgents, input, aggregator, meta = {}) {
    const startTime = Date.now();

    const spanId = this.langsmith.startTrace('coordinator.hierarchical', {
      master: master.name,
      subAgents: subAgents.length,
      userId: meta.userId
    });

    try {
      const result = await this.coordinator.executeHierarchical(
        master,
        subAgents,
        input,
        aggregator
      );
      
      const duration = (Date.now() - startTime) / 1000;
      const status = result.success ? 'success' : 'failed';
      
      metricsService.recordCoordinatorWorkflow('hierarchical', status, duration);
      
      this.langsmith.endTrace(spanId, {
        metadata: { duration, success: result.success }
      });

      return result;
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      metricsService.recordCoordinatorWorkflow('hierarchical', 'failed', duration);
      
      this.langsmith.endTrace(spanId, {
        error: error.message,
        metadata: { duration, success: false }
      });
      
      throw error;
    }
  }

  /**
   * Register agent with coordinator
   */
  registerAgent(name, agent) {
    this.coordinator.registerAgent(name, agent);
    logger.info(`[CoordinatorService] Registered agent: ${name}`);
  }

  /**
   * Define workflow
   */
  defineWorkflow(name, config) {
    this.coordinator.defineWorkflow(name, config);
    logger.info(`[CoordinatorService] Defined workflow: ${name}`);
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      coordinator: this.coordinator.getStats(),
      langsmith: this.langsmith.getStats()
    };
  }
}

// Export singleton
module.exports = new CoordinatorService();
```

**الوقت المقدر**: 30-45 دقيقة

---

### المرحلة 3️⃣: Coordinator Controller Implementation

#### الملف: `backend/src/controllers/coordinatorController.js`

**الكود المطلوب**:
```javascript
const coordinatorService = require('../services/coordinatorService');
const logger = require('../utils/logger');

/**
 * Run workflow
 * @route POST /api/coordinator/workflow
 */
async function runWorkflow(req, res) {
  try {
    const { workflowName, inputs, options = {} } = req.body;

    if (!workflowName || !inputs) {
      return res.status(400).json({
        success: false,
        error: 'Workflow name and inputs are required'
      });
    }

    const meta = {
      userId: req.user?.id,
      userRole: req.user?.role
    };

    // Execute workflow
    const result = await coordinatorService.executeWorkflow(
      workflowName,
      inputs,
      options,
      meta
    );

    // Return 200 OK for synchronous execution
    res.json(result);

  } catch (error) {
    logger.error('[CoordinatorController] Workflow execution failed:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Run sequential workflow
 * @route POST /api/coordinator/sequential
 */
async function runSequential(req, res) {
  try {
    const { steps, input } = req.body;

    if (!steps || !Array.isArray(steps)) {
      return res.status(400).json({
        success: false,
        error: 'Steps array is required'
      });
    }

    const meta = {
      userId: req.user?.id
    };

    const result = await coordinatorService.executeSequential(steps, input, meta);

    res.json({
      success: true,
      strategy: 'sequential',
      result
    });

  } catch (error) {
    logger.error('[CoordinatorController] Sequential workflow failed:', error);
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Run parallel workflow
 * @route POST /api/coordinator/parallel
 */
async function runParallel(req, res) {
  try {
    const { tasks, input } = req.body;

    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({
        success: false,
        error: 'Tasks array is required'
      });
    }

    const meta = {
      userId: req.user?.id
    };

    const result = await coordinatorService.executeParallel(tasks, input, meta);

    res.json({
      success: true,
      strategy: 'parallel',
      result
    });

  } catch (error) {
    logger.error('[CoordinatorController] Parallel workflow failed:', error);
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Run hierarchical workflow
 * @route POST /api/coordinator/hierarchical
 */
async function runHierarchical(req, res) {
  try {
    const { master, subAgents, input, aggregator } = req.body;

    if (!master || !subAgents) {
      return res.status(400).json({
        success: false,
        error: 'Master and subAgents are required'
      });
    }

    const meta = {
      userId: req.user?.id
    };

    const result = await coordinatorService.executeHierarchical(
      master,
      subAgents,
      input,
      aggregator,
      meta
    );

    res.json({
      success: true,
      strategy: 'hierarchical',
      result
    });

  } catch (error) {
    logger.error('[CoordinatorController] Hierarchical workflow failed:', error);
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Get coordinator statistics
 * @route GET /api/coordinator/stats
 */
function getStats(req, res) {
  try {
    const stats = coordinatorService.getStats();
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    logger.error('[CoordinatorController] Failed to get stats:', error);
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  runWorkflow,
  runSequential,
  runParallel,
  runHierarchical,
  getStats
};
```

**الوقت المقدر**: 20-30 دقيقة

---

## 🔄 التحديثات المطلوبة

### تحديث `streamController.js`

**التغييرات**:
```javascript
// قبل
const agent = agentInstances[agentName];
const streamer = streamingManagers[agentName];
const result = await streamer.streamGeminiResponse(streamId, agent.model, prompt);

// بعد
const streamService = require('../services/streamService');
const agent = agentInstances[agentName];

const { cancel, streamId: id } = await streamService.streamWithSSE({
  req,
  res,
  prompt,
  model: agent.model,
  options: {},
  meta: {
    agentName,
    userId: req.user?.id
  }
});
```

### تحديث `coordinator.js` routes

**التغييرات**:
```javascript
// إضافة في أعلى الملف
const coordinatorController = require('../controllers/coordinatorController');

// تحديث المسارات
router.post('/workflow', 
  validateCoordinatorWorkflow,
  coordinatorController.runWorkflow
);

router.post('/sequential',
  validateSequentialWorkflow,
  coordinatorController.runSequential
);

router.post('/parallel',
  validateParallelWorkflow,
  coordinatorController.runParallel
);

router.post('/hierarchical',
  validateHierarchicalWorkflow,
  coordinatorController.runHierarchical
);

router.get('/stats',
  coordinatorController.getStats
);
```

---

## ✅ قائمة التحقق النهائية

### Phase 1: Streaming
- [ ] إنشاء `streamService.js`
- [ ] تحديث `streamController.js`
- [ ] اختبار البث اليدوي
- [ ] التحقق من metrics
- [ ] التحقق من LangSmith tracing

### Phase 2: Coordinator
- [ ] إنشاء `coordinatorService.js`
- [ ] إنشاء `coordinatorController.js`
- [ ] تحديث `coordinator.js` routes
- [ ] اختبار workflows
- [ ] التحقق من metrics
- [ ] التحقق من LangSmith tracing

### Phase 3: Integration
- [ ] اختبار التكامل الكامل
- [ ] اختبار معالجة الأخطاء
- [ ] اختبار client disconnect
- [ ] اختبار rate limiting
- [ ] اختبار authentication
- [ ] توثيق API

---

## 📊 المقاييس المتوقعة

### Streaming Metrics
- `stream_sessions_total{agent, status}`
- `stream_chunks_sent_total{agent}`
- `stream_session_duration_seconds{agent, status}`
- `stream_sessions_active{agent}`

### Coordinator Metrics
- `coordinator_workflows_total{strategy, status}`
- `coordinator_workflow_duration_seconds{strategy, status}`

### LangSmith Traces
- `stream.sse` spans
- `coordinator.workflow` spans
- `coordinator.sequential` spans
- `coordinator.parallel` spans
- `coordinator.hierarchical` spans

---

## 🎯 الخلاصة

**إجمالي الملفات المطلوبة**: 3 ملفات جديدة
**إجمالي التحديثات**: 2 ملفات
**الوقت المقدر الكلي**: 2-3 ساعات

**الأولويات**:
1. ⚡ streamService.js (أعلى أولوية)
2. ⚡ coordinatorService.js (أعلى أولوية)
3. 🔸 coordinatorController.js (متوسط)
4. 🔸 تحديث الملفات الموجودة (متوسط)
5. 🟢 الاختبارات (منخفض - يمكن القيام به لاحقاً)

**النتيجة المتوقعة**:
- ✅ بث SSE كامل الوظائف
- ✅ تنسيق workflows متعدد الوكلاء
- ✅ تتبع LangSmith شامل
- ✅ مقاييس Prometheus دقيقة
- ✅ معالجة أخطاء قوية

---

*تم إنشاء هذه الخارطة آلياً بواسطة GitHub Copilot*
*للمزيد من التفاصيل، راجع `CODEBASE_STATUS_REPORT_AR.md`*
