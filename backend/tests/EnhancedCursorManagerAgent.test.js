/**
 * Comprehensive Test Suite for Enhanced Cursor Manager Agent
 * Tests all advanced features: Quantum Edge Layer, Prometheus, OpenTelemetry, Voice
 */

const jest = require('jest');
const { EnhancedCursorManagerAgent } = require('../src/agents/EnhancedCursorManagerAgent');
const { QuantumEdgeLayer } = require('../src/agents/QuantumEdgeLayer');
const { PrometheusMetrics } = require('../src/monitoring/PrometheusMetrics');
const { OpenTelemetryTracing } = require('../src/monitoring/OpenTelemetryTracing');

describe('Enhanced Cursor Manager Agent', () => {
  let agent;
  let mockConfig;

  beforeEach(() => {
    mockConfig = {
      maxConcurrentTasks: 5,
      taskTimeout: 15000,
      monitoringInterval: 1000,
      patternLearningEnabled: false,
      autoOptimizationEnabled: false,
      voiceEnabled: false,
      prometheusEnabled: false,
      tracingEnabled: false,
      quantumEdgeEnabled: false
    };

    agent = new EnhancedCursorManagerAgent(mockConfig);
  });

  afterEach(async () => {
    if (agent) {
      try {
        await agent.shutdown();
      } catch (error) {
        // Ignore shutdown errors in tests
      }
    }
  });

  describe('Initialization', () => {
    test('should initialize with default configuration', () => {
      expect(agent.agent_id).toBe('enhanced-cursor-manager');
      expect(agent.version).toBe('2.0.0');
      expect(agent.status).toBe('initializing');
      expect(agent.startTime).toBeDefined();
    });

    test('should initialize all components when enabled', async () => {
      const fullConfig = {
        ...mockConfig,
        quantumEdgeEnabled: true,
        prometheusEnabled: true,
        tracingEnabled: true,
        voiceEnabled: true,
        patternLearningEnabled: true
      };

      const fullAgent = new EnhancedCursorManagerAgent(fullConfig);
      
      try {
        await fullAgent.initialize();
        
        expect(fullAgent.status).toBe('active');
        expect(fullAgent.quantumEdgeLayer).toBeDefined();
        expect(fullAgent.prometheusMetrics).toBeDefined();
        expect(fullAgent.tracing).toBeDefined();
        expect(fullAgent.voiceAgent).toBeDefined();
        
        await fullAgent.shutdown();
      } catch (error) {
        await fullAgent.shutdown();
        throw error;
      }
    });

    test('should handle initialization errors gracefully', async () => {
      // Mock a component to throw an error
      jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const errorAgent = new EnhancedCursorManagerAgent({
        ...mockConfig,
        quantumEdgeEnabled: true
      });

      // Mock QuantumEdgeLayer constructor to throw
      jest.doMock('../src/agents/QuantumEdgeLayer', () => {
        throw new Error('Quantum Edge Layer initialization failed');
      });

      try {
        await errorAgent.initialize();
        expect(errorAgent.status).toBe('error');
      } catch (error) {
        expect(error.message).toContain('Quantum Edge Layer initialization failed');
      } finally {
        console.error.mockRestore();
      }
    });
  });

  describe('Request Processing', () => {
    beforeEach(async () => {
      await agent.initialize();
    });

    test('should process valid requests successfully', async () => {
      const result = await agent.processRequest(
        'Test request message',
        'test-user',
        { priority: 'normal' }
      );

      expect(result.success).toBe(true);
      expect(result.requestId).toBeDefined();
      expect(result.result).toBeDefined();
      expect(result.responseTime).toBeGreaterThan(0);
    });

    test('should validate request input', async () => {
      const result = await agent.processRequest(
        '', // Empty message should fail validation
        'test-user'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Validation failed');
    });

    test('should handle request processing errors', async () => {
      // Mock executeRequestStandard to throw an error
      jest.spyOn(agent, 'executeRequestStandard').mockRejectedValue(
        new Error('Processing failed')
      );

      const result = await agent.processRequest(
        'Test request',
        'test-user'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Processing failed');
      expect(result.responseTime).toBeGreaterThan(0);
    });

    test('should generate correlation IDs when tracing is enabled', async () => {
      const tracingAgent = new EnhancedCursorManagerAgent({
        ...mockConfig,
        tracingEnabled: true
      });

      try {
        await tracingAgent.initialize();
        
        const result = await tracingAgent.processRequest(
          'Test request',
          'test-user'
        );

        expect(result.correlationId).toBeDefined();
        expect(typeof result.correlationId).toBe('string');
        
        await tracingAgent.shutdown();
      } catch (error) {
        await tracingAgent.shutdown();
        throw error;
      }
    });
  });

  describe('Agent Registration', () => {
    beforeEach(async () => {
      await agent.initialize();
    });

    test('should register valid agents', () => {
      const mockAgent = {
        name: 'Test Agent',
        capabilities: ['test_capability'],
        handler: jest.fn(),
        maxConcurrency: 2,
        circuitBreakerThreshold: 3,
        circuitBreakerTimeout: 30000
      };

      expect(() => {
        agent.registerAgent('test-agent', mockAgent);
      }).not.toThrow();

      expect(agent.registeredAgents.has('test-agent')).toBe(true);
    });

    test('should validate agent data', () => {
      const invalidAgent = {
        name: '', // Invalid: empty name
        capabilities: [], // Invalid: empty capabilities
        handler: 'not-a-function' // Invalid: not a function
      };

      expect(() => {
        agent.registerAgent('invalid-agent', invalidAgent);
      }).toThrow('Agent validation failed');
    });

    test('should sanitize agent IDs', () => {
      const mockAgent = {
        name: 'Test Agent',
        capabilities: ['test'],
        handler: jest.fn()
      };

      agent.registerAgent('Test Agent With Spaces!', mockAgent);
      expect(agent.registeredAgents.has('test_agent_with_spaces_')).toBe(true);
    });

    test('should register with Quantum Edge Layer when enabled', () => {
      const quantumAgent = new EnhancedCursorManagerAgent({
        ...mockConfig,
        quantumEdgeEnabled: true
      });

      quantumAgent.initialize().then(async () => {
        const mockAgent = {
          name: 'Quantum Test Agent',
          capabilities: ['quantum_capability'],
          handler: jest.fn()
        };

        const registerSpy = jest.spyOn(quantumAgent.quantumEdgeLayer, 'registerAgent');
        
        quantumAgent.registerAgent('quantum-agent', mockAgent);
        
        expect(registerSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'quantum-agent',
            name: 'Quantum Test Agent',
            capabilities: ['quantum_capability']
          })
        );

        await quantumAgent.shutdown();
      });
    });
  });

  describe('Voice Integration', () => {
    let voiceAgent;

    beforeEach(async () => {
      voiceAgent = new EnhancedCursorManagerAgent({
        ...mockConfig,
        voiceEnabled: true
      });
      await voiceAgent.initialize();
    });

    afterEach(async () => {
      await voiceAgent.shutdown();
    });

    test('should start voice sessions', async () => {
      const result = await voiceAgent.startVoiceSession('test-user', {
        language: 'en',
        voiceQuality: 'high'
      });

      expect(result.success).toBe(true);
      expect(result.sessionId).toBeDefined();
      expect(result.config).toBeDefined();
    });

    test('should validate voice session configuration', async () => {
      const result = await voiceAgent.startVoiceSession('test-user', {
        language: 'invalid-language', // Invalid language
        voiceQuality: 'invalid-quality' // Invalid quality
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('validation failed');
    });

    test('should process voice input', async () => {
      // First start a session
      const sessionResult = await voiceAgent.startVoiceSession('test-user');
      expect(sessionResult.success).toBe(true);

      const sessionId = sessionResult.sessionId;

      // Process voice input
      const voiceResult = await voiceAgent.processVoiceInput(sessionId, {
        audioData: Buffer.from('mock audio data'),
        duration: 5000
      });

      expect(voiceResult.success).toBe(true);
      expect(voiceResult.transcription).toBeDefined();
      expect(voiceResult.cursorResponse).toBeDefined();
    });

    test('should handle voice session errors', async () => {
      const result = await voiceAgent.processVoiceInput('non-existent-session', {
        audioData: Buffer.from('test')
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Voice session not found');
    });
  });

  describe('Metrics and Monitoring', () => {
    let metricsAgent;

    beforeEach(async () => {
      metricsAgent = new EnhancedCursorManagerAgent({
        ...mockConfig,
        prometheusEnabled: true,
        quantumEdgeEnabled: true
      });
      await metricsAgent.initialize();
    });

    afterEach(async () => {
      await metricsAgent.shutdown();
    });

    test('should collect and update metrics', async () => {
      const initialMetrics = metricsAgent.getSystemStatus();
      
      // Process some requests
      await metricsAgent.processRequest('Test request 1', 'user1');
      await metricsAgent.processRequest('Test request 2', 'user2');

      const updatedMetrics = metricsAgent.getSystemStatus();

      expect(updatedMetrics.metrics.requestsProcessed).toBeGreaterThan(
        initialMetrics.metrics.requestsProcessed
      );
      expect(updatedMetrics.metrics.requestsSucceeded).toBeGreaterThan(
        initialMetrics.metrics.requestsSucceeded
      );
    });

    test('should provide comprehensive system status', () => {
      const status = metricsAgent.getSystemStatus();

      expect(status).toHaveProperty('status');
      expect(status).toHaveProperty('uptime');
      expect(status).toHaveProperty('version');
      expect(status).toHaveProperty('metrics');
      expect(status).toHaveProperty('agents');
      expect(status).toHaveProperty('components');
      expect(status.components).toHaveProperty('quantumEdgeLayer');
      expect(status.components).toHaveProperty('prometheusMetrics');
    });

    test('should track agent utilization', () => {
      const mockAgent = {
        name: 'Utilization Test Agent',
        capabilities: ['utilization_test'],
        handler: jest.fn()
      };

      metricsAgent.registerAgent('util-agent', mockAgent);

      const status = metricsAgent.getSystemStatus();
      expect(status.agents.utilization).toHaveProperty('util-agent');
      expect(status.agents.utilization['util-agent']).toHaveProperty('tasksAssigned');
      expect(status.agents.utilization['util-agent']).toHaveProperty('tasksCompleted');
    });
  });

  describe('Error Handling and Resilience', () => {
    beforeEach(async () => {
      await agent.initialize();
    });

    test('should handle component failures gracefully', async () => {
      // Mock a component to fail
      jest.spyOn(agent, 'prometheusMetrics', 'get').mockReturnValue({
        recordRequest: jest.fn().mockImplementation(() => {
          throw new Error('Prometheus metrics failed');
        })
      });

      // Should still process request despite metrics failure
      const result = await agent.processRequest('Test request', 'test-user');
      expect(result.success).toBe(true);
    });

    test('should sanitize file paths to prevent traversal', async () => {
      const maliciousRequestId = '../../../etc/passwd';
      const sanitized = agent.sanitizeRequestId(maliciousRequestId);
      
      expect(sanitized).not.toContain('../');
      expect(sanitized).not.toContain('/');
      expect(sanitized).toMatch(/^[a-zA-Z0-9_-]+$/);
    });

    test('should handle shutdown errors gracefully', async () => {
      // Mock a component to fail during shutdown
      jest.spyOn(agent, 'prometheusMetrics', 'get').mockReturnValue({
        shutdown: jest.fn().mockRejectedValue(new Error('Shutdown failed'))
      });

      // Should still complete shutdown
      await expect(agent.shutdown()).resolves.not.toThrow();
    });
  });

  describe('Performance and Load Testing', () => {
    beforeEach(async () => {
      await agent.initialize();
    });

    test('should handle concurrent requests', async () => {
      const concurrentRequests = Array.from({ length: 10 }, (_, i) =>
        agent.processRequest(`Concurrent request ${i}`, `user-${i}`)
      );

      const results = await Promise.all(concurrentRequests);
      
      results.forEach((result, index) => {
        expect(result.success).toBe(true);
        expect(result.requestId).toBeDefined();
      });

      expect(results).toHaveLength(10);
    });

    test('should maintain performance under load', async () => {
      const startTime = Date.now();
      const requestCount = 50;

      const requests = Array.from({ length: requestCount }, (_, i) =>
        agent.processRequest(`Load test request ${i}`, `user-${i}`)
      );

      await Promise.all(requests);
      
      const totalTime = Date.now() - startTime;
      const averageTime = totalTime / requestCount;

      // Should process requests in reasonable time
      expect(averageTime).toBeLessThan(1000); // Less than 1 second per request
    });

    test('should track response times accurately', async () => {
      const requests = [
        agent.processRequest('Fast request', 'user1'),
        agent.processRequest('Medium request', 'user2'),
        agent.processRequest('Slow request', 'user3')
      ];

      await Promise.all(requests);

      const status = agent.getSystemStatus();
      expect(status.metrics.averageResponseTime).toBeGreaterThan(0);
      expect(status.metrics.requestsProcessed).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Integration Tests', () => {
    test('should work end-to-end with all components enabled', async () => {
      const fullAgent = new EnhancedCursorManagerAgent({
        maxConcurrentTasks: 3,
        taskTimeout: 10000,
        patternLearningEnabled: true,
        voiceEnabled: true,
        prometheusEnabled: true,
        tracingEnabled: true,
        quantumEdgeEnabled: true
      });

      try {
        await fullAgent.initialize();

        // Register a test agent
        fullAgent.registerAgent('integration-test-agent', {
          name: 'Integration Test Agent',
          capabilities: ['integration_test'],
          handler: jest.fn().mockResolvedValue({
            success: true,
            message: 'Integration test completed'
          })
        });

        // Process a request
        const result = await fullAgent.processRequest(
          'Integration test request',
          'integration-user',
          { priority: 'high' }
        );

        expect(result.success).toBe(true);
        expect(result.correlationId).toBeDefined();

        // Check system status
        const status = fullAgent.getSystemStatus();
        expect(status.components.quantumEdgeLayer).toBe('active');
        expect(status.components.prometheusMetrics).toBe('active');
        expect(status.components.tracing).toBeDefined();
        expect(status.components.voiceAgent).toBe('active');

        // Start a voice session
        const voiceResult = await fullAgent.startVoiceSession('integration-user');
        expect(voiceResult.success).toBe(true);

        await fullAgent.shutdown();
      } catch (error) {
        await fullAgent.shutdown();
        throw error;
      }
    });
  });
});

describe('Quantum Edge Layer Integration', () => {
  let quantumLayer;

  beforeEach(() => {
    quantumLayer = new QuantumEdgeLayer({
      maxConcurrent: 2,
      minTime: 100
    });
  });

  afterEach(async () => {
    if (quantumLayer) {
      await quantumLayer.shutdown();
    }
  });

  test('should execute tasks with rate limiting', async () => {
    const mockAgent = {
      name: 'Test Agent',
      capabilities: ['test'],
      handler: jest.fn().mockResolvedValue('Task completed')
    };

    quantumLayer.registerAgent('test-agent', mockAgent);

    const tasks = Array.from({ length: 5 }, (_, i) =>
      quantumLayer.executeTask('test-agent', {
        taskType: 'test',
        payload: `Task ${i}`,
        requestId: `req-${i}`
      })
    );

    const results = await Promise.all(tasks);
    expect(results).toHaveLength(5);
    expect(mockAgent.handler).toHaveBeenCalledTimes(5);
  });

  test('should implement circuit breaker', async () => {
    const failingAgent = {
      name: 'Failing Agent',
      capabilities: ['failing'],
      handler: jest.fn().mockRejectedValue(new Error('Task failed'))
    };

    quantumLayer.registerAgent('failing-agent', failingAgent);

    // Try to execute multiple tasks - should fail
    const tasks = Array.from({ length: 5 }, (_, i) =>
      quantumLayer.executeTask('failing-agent', {
        taskType: 'failing',
        payload: `Failing task ${i}`,
        requestId: `fail-req-${i}`
      }).catch(error => error.message)
    );

    const results = await Promise.all(tasks);
    expect(results.every(result => result.includes('Task failed'))).toBe(true);

    // Check circuit breaker state
    const metrics = quantumLayer.getMetrics();
    expect(metrics.circuitBreakers['failing-agent'].state).toBe('OPEN');
  });

  test('should provide comprehensive metrics', () => {
    const metrics = quantumLayer.getMetrics();
    
    expect(metrics).toHaveProperty('totalRequests');
    expect(metrics).toHaveProperty('successfulRequests');
    expect(metrics).toHaveProperty('failedRequests');
    expect(metrics).toHaveProperty('circuitBreakers');
    expect(metrics).toHaveProperty('limiterStats');
  });
});

describe('Prometheus Metrics', () => {
  let metrics;

  beforeEach(() => {
    metrics = new PrometheusMetrics({
      port: 0, // Use random port for testing
      collectDefaultMetrics: false
    });
  });

  afterEach(async () => {
    if (metrics) {
      await metrics.shutdown();
    }
  });

  test('should record request metrics', () => {
    expect(() => {
      metrics.recordRequest('POST', 'success', 'test-agent', 'normal', 1000);
    }).not.toThrow();
  });

  test('should update agent utilization', () => {
    expect(() => {
      metrics.updateAgentUtilization('test-agent', 'Test Agent', 0.75);
    }).not.toThrow();
  });

  test('should record circuit breaker state', () => {
    expect(() => {
      metrics.updateCircuitBreakerState('test-agent', 'Test Agent', 'OPEN');
    }).not.toThrow();
  });

  test('should provide metrics summary', async () => {
    const summary = await metrics.getMetricsSummary();
    expect(summary).toHaveProperty('totalMetrics');
    expect(summary).toHaveProperty('timestamp');
    expect(summary).toHaveProperty('server');
  });
});

describe('OpenTelemetry Tracing', () => {
  let tracing;

  beforeEach(async () => {
    tracing = new OpenTelemetryTracing({
      serviceName: 'test-service',
      serviceVersion: '1.0.0',
      environment: 'test'
    });
  });

  afterEach(async () => {
    if (tracing) {
      await tracing.shutdown();
    }
  });

  test('should create request spans', () => {
    const span = tracing.createRequestSpan('test-operation', {
      'test.attribute': 'test-value'
    });

    expect(span).toBeDefined();
    expect(typeof span.setAttributes).toBe('function');
    expect(typeof span.setStatus).toBe('function');
    expect(typeof span.end).toBe('function');
  });

  test('should create agent task spans', () => {
    const span = tracing.createAgentTaskSpan('test-agent', 'test-task', {
      'agent.id': 'test-agent'
    });

    expect(span).toBeDefined();
  });

  test('should execute functions with tracing', async () => {
    const mockFunction = jest.fn().mockResolvedValue('Success');
    
    const result = await tracing.traceExecution('test-operation', mockFunction, {
      'test.attribute': 'test-value'
    });

    expect(result).toBe('Success');
    expect(mockFunction).toHaveBeenCalledWith(expect.any(Object));
  });

  test('should handle tracing errors', async () => {
    const failingFunction = jest.fn().mockRejectedValue(new Error('Test error'));
    
    await expect(
      tracing.traceExecution('test-operation', failingFunction)
    ).rejects.toThrow('Test error');
  });

  test('should generate correlation IDs', () => {
    const correlationId = tracing.createCorrelationId();
    
    expect(correlationId).toBeDefined();
    expect(typeof correlationId).toBe('string');
    expect(correlationId).toMatch(/^trace_\d+_[a-z0-9]+$/);
  });
});
