/**
 * OpenTelemetry Tracing for Cursor Manager Agent
 * Comprehensive request tracing across all components and agents
 */

const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { trace, context, SpanStatusCode, SpanKind } = require('@opentelemetry/api');

class OpenTelemetryTracing {
  constructor(config = {}) {
    this.config = {
      serviceName: config.serviceName || 'cursor-manager-agent',
      serviceVersion: config.serviceVersion || '1.0.0',
      environment: config.environment || 'development',
      endpoint: config.endpoint || 'http://localhost:4317',
      ...config
    };

    this.tracer = null;
    this.sdk = null;
    this.isInitialized = false;

    this.logger = require('winston').createLogger({
      level: 'info',
      format: require('winston').format.combine(
        require('winston').format.timestamp(),
        require('winston').format.json()
      ),
      transports: [
        new require('winston').transports.File({ filename: 'backend/logs/opentelemetry.log' }),
        new require('winston').transports.Console()
      ]
    });

    this.logger.info('🔍 OpenTelemetry Tracing initialized', { config: this.config });
  }

  /**
   * Initialize OpenTelemetry SDK
   */
  async initialize() {
    try {
      // Create resource
      const resource = new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: this.config.serviceName,
        [SemanticResourceAttributes.SERVICE_VERSION]: this.config.serviceVersion,
        [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: this.config.environment,
      });

      // Initialize SDK
      this.sdk = new NodeSDK({
        resource,
        instrumentations: [
          getNodeAutoInstrumentations({
            // Disable some instrumentations that might cause issues
            '@opentelemetry/instrumentation-fs': {
              enabled: false,
            },
            '@opentelemetry/instrumentation-net': {
              enabled: false,
            }
          })
        ],
      });

      // Start the SDK
      this.sdk.start();

      // Get tracer
      this.tracer = trace.getTracer(this.config.serviceName, this.config.serviceVersion);

      this.isInitialized = true;
      this.logger.info('✅ OpenTelemetry SDK started successfully');

    } catch (error) {
      this.logger.error('❌ Failed to initialize OpenTelemetry:', error);
      throw error;
    }
  }

  /**
   * Create a span for request processing
   */
  createRequestSpan(operationName, attributes = {}) {
    if (!this.isInitialized) {
      this.logger.warn('OpenTelemetry not initialized, creating no-op span');
      return {
        setAttributes: () => {},
        setStatus: () => {},
        end: () => {},
        addEvent: () => {},
        recordException: () => {}
      };
    }

    return this.tracer.startSpan(operationName, {
      kind: SpanKind.SERVER,
      attributes: {
        'service.name': this.config.serviceName,
        'service.version': this.config.serviceVersion,
        'environment': this.config.environment,
        ...attributes
      }
    });
  }

  /**
   * Create a span for agent task execution
   */
  createAgentTaskSpan(agentId, taskType, attributes = {}) {
    if (!this.isInitialized) {
      return this.createRequestSpan('agent-task-noop');
    }

    return this.tracer.startSpan(`agent.${agentId}.${taskType}`, {
      kind: SpanKind.CLIENT,
      attributes: {
        'agent.id': agentId,
        'task.type': taskType,
        'service.name': this.config.serviceName,
        ...attributes
      }
    });
  }

  /**
   * Create a span for voice processing
   */
  createVoiceSpan(operation, sessionId, attributes = {}) {
    if (!this.isInitialized) {
      return this.createRequestSpan('voice-processing-noop');
    }

    return this.tracer.startSpan(`voice.${operation}`, {
      kind: SpanKind.INTERNAL,
      attributes: {
        'voice.session_id': sessionId,
        'voice.operation': operation,
        'service.name': this.config.serviceName,
        ...attributes
      }
    });
  }

  /**
   * Create a span for pattern learning
   */
  createPatternLearningSpan(operation, attributes = {}) {
    if (!this.isInitialized) {
      return this.createRequestSpan('pattern-learning-noop');
    }

    return this.tracer.startSpan(`pattern-learning.${operation}`, {
      kind: SpanKind.INTERNAL,
      attributes: {
        'pattern.operation': operation,
        'service.name': this.config.serviceName,
        ...attributes
      }
    });
  }

  /**
   * Create a span for database operations
   */
  createDatabaseSpan(operation, table, attributes = {}) {
    if (!this.isInitialized) {
      return this.createRequestSpan('database-noop');
    }

    return this.tracer.startSpan(`db.${operation}`, {
      kind: SpanKind.CLIENT,
      attributes: {
        'db.operation': operation,
        'db.table': table,
        'service.name': this.config.serviceName,
        ...attributes
      }
    });
  }

  /**
   * Create a span for MCP operations
   */
  createMCPSpan(mcpServer, operation, attributes = {}) {
    if (!this.isInitialized) {
      return this.createRequestSpan('mcp-noop');
    }

    return this.tracer.startSpan(`mcp.${mcpServer}.${operation}`, {
      kind: SpanKind.CLIENT,
      attributes: {
        'mcp.server': mcpServer,
        'mcp.operation': operation,
        'service.name': this.config.serviceName,
        ...attributes
      }
    });
  }

  /**
   * Execute function with tracing
   */
  async traceExecution(spanName, fn, attributes = {}) {
    const span = this.createRequestSpan(spanName, attributes);
    
    try {
      const result = await fn(span);
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({ 
        code: SpanStatusCode.ERROR, 
        message: error.message 
      });
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  }

  /**
   * Execute agent task with tracing
   */
  async traceAgentTask(agentId, taskType, taskFn, attributes = {}) {
    const span = this.createAgentTaskSpan(agentId, taskType, attributes);
    
    try {
      span.addEvent('task.started', {
        'agent.id': agentId,
        'task.type': taskType,
        'timestamp': Date.now()
      });

      const result = await taskFn(span);
      
      span.addEvent('task.completed', {
        'agent.id': agentId,
        'task.type': taskType,
        'timestamp': Date.now()
      });

      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.addEvent('task.failed', {
        'agent.id': agentId,
        'task.type': taskType,
        'error.message': error.message,
        'timestamp': Date.now()
      });

      span.setStatus({ 
        code: SpanStatusCode.ERROR, 
        message: error.message 
      });
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  }

  /**
   * Execute voice processing with tracing
   */
  async traceVoiceProcessing(operation, sessionId, processFn, attributes = {}) {
    const span = this.createVoiceSpan(operation, sessionId, attributes);
    
    try {
      span.addEvent('voice.processing.started', {
        'operation': operation,
        'session.id': sessionId,
        'timestamp': Date.now()
      });

      const result = await processFn(span);
      
      span.addEvent('voice.processing.completed', {
        'operation': operation,
        'session.id': sessionId,
        'timestamp': Date.now()
      });

      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.addEvent('voice.processing.failed', {
        'operation': operation,
        'session.id': sessionId,
        'error.message': error.message,
        'timestamp': Date.now()
      });

      span.setStatus({ 
        code: SpanStatusCode.ERROR, 
        message: error.message 
      });
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  }

  /**
   * Add baggage to current context
   */
  setBaggage(key, value) {
    if (!this.isInitialized) return;

    const activeContext = context.active();
    const baggage = context.getBaggage(activeContext) || {};
    baggage.setEntry(key, { value });
    return context.withBaggage(baggage, activeContext);
  }

  /**
   * Get baggage from current context
   */
  getBaggage(key) {
    if (!this.isInitialized) return null;

    const activeContext = context.active();
    const baggage = context.getBaggage(activeContext);
    return baggage ? baggage.getEntry(key)?.value : null;
  }

  /**
   * Create child span in current context
   */
  createChildSpan(operationName, attributes = {}) {
    if (!this.isInitialized) {
      return this.createRequestSpan('child-span-noop');
    }

    const parentSpan = trace.getActiveSpan();
    if (!parentSpan) {
      return this.createRequestSpan(operationName, attributes);
    }

    return this.tracer.startSpan(operationName, {
      kind: SpanKind.INTERNAL,
      attributes: {
        'service.name': this.config.serviceName,
        ...attributes
      }
    }, trace.setSpan(context.active(), parentSpan));
  }

  /**
   * Record custom metrics as span attributes
   */
  recordMetrics(span, metrics) {
    if (!span || !this.isInitialized) return;

    Object.entries(metrics).forEach(([key, value]) => {
      span.setAttributes({
        [`metric.${key}`]: value
      });
    });
  }

  /**
   * Get current trace ID
   */
  getCurrentTraceId() {
    if (!this.isInitialized) return null;

    const span = trace.getActiveSpan();
    return span ? span.spanContext().traceId : null;
  }

  /**
   * Get current span ID
   */
  getCurrentSpanId() {
    if (!this.isInitialized) return null;

    const span = trace.getActiveSpan();
    return span ? span.spanContext().spanId : null;
  }

  /**
   * Create correlation ID for request tracking
   */
  createCorrelationId() {
    return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Add correlation ID to span attributes
   */
  addCorrelationId(span, correlationId) {
    if (span) {
      span.setAttributes({
        'correlation.id': correlationId
      });
    }
  }

  /**
   * Get tracing status
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      serviceName: this.config.serviceName,
      serviceVersion: this.config.serviceVersion,
      environment: this.config.environment,
      currentTraceId: this.getCurrentTraceId(),
      currentSpanId: this.getCurrentSpanId()
    };
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    this.logger.info('🛑 Shutting down OpenTelemetry...');
    
    try {
      if (this.sdk) {
        await this.sdk.shutdown();
      }
      
      this.isInitialized = false;
      this.logger.info('✅ OpenTelemetry shut down successfully');
    } catch (error) {
      this.logger.error('❌ Error during shutdown:', error);
      throw error;
    }
  }
}

module.exports = OpenTelemetryTracing;
