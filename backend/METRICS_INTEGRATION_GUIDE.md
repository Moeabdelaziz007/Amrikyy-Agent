# Metrics Integration Guide

**Author**: Mohamed Hossameldin Abdelaziz  
**Date**: October 22, 2025  
**Phase**: 2 - Production APIs

---

## Overview

This guide explains how to integrate the `metricsService` into your existing codebase to track:
- Stream sessions (SSE)
- LLM API calls
- Multi-agent workflows
- API requests
- Cache operations
- Authentication attempts
- Rate limiting

---

## 1. Integration with AgentStreaming

### Location: `backend/src/utils/AgentStreaming.js`

Add metrics tracking to your streaming lifecycle:

```javascript
const metricsService = require('../services/metricsService');

class AgentStreaming {
  constructor(agentName) {
    this.agentName = agentName;
    // ... existing code
  }

  /**
   * Initialize SSE stream - ADD METRICS
   */
  initializeStream(res, streamId) {
    // ... existing code (set headers, create stream object)
    
    // ✅ ADD: Track stream started
    metricsService.recordStreamEvent('started', {
      agent: this.agentName,
      model: 'unknown' // Update when model is known
    });
    
    // ... rest of existing code
    
    return stream;
  }

  /**
   * Send chunk - ADD METRICS
   */
  sendChunk(streamId, chunk) {
    const stream = this.activeStreams.get(streamId);
    
    if (!stream || stream.status !== 'active') {
      return false;
    }
    
    try {
      // ... existing code (send chunk via SSE)
      
      // ✅ ADD: Track each chunk sent
      metricsService.recordStreamEvent('chunk', {
        agent: this.agentName,
        model: stream.model || 'unknown'
      });
      
      return true;
    } catch (error) {
      logger.error(`[Streaming] Error sending chunk:`, error);
      this.closeStream(streamId, 'error');
      return false;
    }
  }

  /**
   * Close stream - ADD METRICS
   */
  closeStream(streamId, reason = 'completed') {
    const stream = this.activeStreams.get(streamId);
    
    if (!stream) {
      return;
    }
    
    const duration = (Date.now() - stream.startTime) / 1000; // seconds
    
    // ✅ ADD: Track stream completion/failure/cancellation
    if (reason === 'completed') {
      metricsService.recordStreamEvent('completed', {
        agent: this.agentName,
        model: stream.model || 'unknown',
        duration
      });
      this.stats.completedStreams++;
    } else if (reason === 'error') {
      metricsService.recordStreamEvent('failed', {
        agent: this.agentName,
        model: stream.model || 'unknown',
        duration,
        error_type: 'stream_error'
      });
      this.stats.failedStreams++;
    } else {
      metricsService.recordStreamEvent('cancelled', {
        agent: this.agentName,
        model: stream.model || 'unknown',
        duration,
        reason: reason
      });
    }
    
    // ... existing cleanup code
    this.activeStreams.delete(streamId);
    this.stats.activeStreams--;
  }
}
```

---

## 2. Integration with LLM Calls (AgentLangSmith or Direct)

### Option A: In AgentLangSmith.js

```javascript
const metricsService = require('../services/metricsService');

class AgentLangSmith {
  async callLLM(model, prompt, options = {}) {
    const startTime = Date.now();
    
    try {
      const result = await this.gemini.generateContent(prompt);
      const duration = (Date.now() - startTime) / 1000;
      
      // ✅ ADD: Track successful LLM call
      metricsService.recordLLMCall({
        model: model || 'gemini-2.0-flash-exp',
        agent: this.agentName,
        status: 'success',
        duration,
        inputTokens: result.usageMetadata?.promptTokenCount || 0,
        outputTokens: result.usageMetadata?.candidatesTokenCount || 0,
        cost: this.calculateCost(result.usageMetadata) // Optional
      });
      
      return result;
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      
      // ✅ ADD: Track failed LLM call
      metricsService.recordLLMCall({
        model: model || 'gemini-2.0-flash-exp',
        agent: this.agentName,
        status: 'failure',
        duration
      });
      
      throw error;
    }
  }
}
```

### Option B: In Agent Classes (TravelAgencyAgent, ContentCreatorAgent, etc.)

```javascript
const metricsService = require('../services/metricsService');

class TravelAgencyAgent {
  async searchFlights(params) {
    const startTime = Date.now();
    
    try {
      // ... existing LLM call code
      const result = await this.gemini.generateContent(prompt);
      const duration = (Date.now() - startTime) / 1000;
      
      // ✅ ADD: Track LLM call
      metricsService.recordLLMCall({
        model: 'gemini-2.0-flash-exp',
        agent: 'TravelAgency',
        status: 'success',
        duration,
        inputTokens: result.usageMetadata?.promptTokenCount || 0,
        outputTokens: result.usageMetadata?.candidatesTokenCount || 0
      });
      
      return this.parseJSON(result.response.text());
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      
      metricsService.recordLLMCall({
        model: 'gemini-2.0-flash-exp',
        agent: 'TravelAgency',
        status: 'failure',
        duration
      });
      
      throw error;
    }
  }
}
```

---

## 3. Integration with MultiAgentCoordinator

### Location: `backend/src/utils/MultiAgentCoordinator.js`

```javascript
const metricsService = require('../services/metricsService');

class MultiAgentCoordinator {
  async executeSequential(steps, initialInput) {
    const startTime = Date.now();
    const workflowId = uuidv4();
    
    // ✅ ADD: Track workflow started
    metricsService.incGauge('active_workflows', { strategy: 'sequential' });
    
    try {
      // ... existing workflow execution code
      
      const duration = (Date.now() - startTime) / 1000;
      
      // ✅ ADD: Track workflow completed
      metricsService.recordCoordinatorWorkflow(
        'sequential',
        'success',
        duration,
        'unnamed' // Or extract workflow name from config
      );
      
      metricsService.decGauge('active_workflows', { strategy: 'sequential' });
      
      return result;
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      
      // ✅ ADD: Track workflow failed
      metricsService.recordCoordinatorWorkflow(
        'sequential',
        'failure',
        duration,
        'unnamed'
      );
      
      metricsService.decGauge('active_workflows', { strategy: 'sequential' });
      
      throw error;
    }
  }
  
  // Repeat for executeParallel, executeHierarchical
}
```

---

## 4. Integration with Cache Service

### Location: `backend/src/services/cacheService.js` or Redis Cache

```javascript
const metricsService = require('./metricsService');

class CacheService {
  async get(key) {
    try {
      const value = await this.redis.get(key);
      
      // ✅ ADD: Track cache hit/miss
      if (value) {
        metricsService.increment('cache_operations_total', {
          operation: 'get',
          status: 'hit'
        });
      } else {
        metricsService.increment('cache_operations_total', {
          operation: 'get',
          status: 'miss'
        });
      }
      
      return value;
    } catch (error) {
      metricsService.increment('cache_operations_total', {
        operation: 'get',
        status: 'error'
      });
      throw error;
    }
  }
  
  async set(key, value, ttl) {
    try {
      await this.redis.set(key, value, 'EX', ttl);
      
      // ✅ ADD: Track cache set
      metricsService.increment('cache_operations_total', {
        operation: 'set',
        status: 'success'
      });
    } catch (error) {
      metricsService.increment('cache_operations_total', {
        operation: 'set',
        status: 'error'
      });
      throw error;
    }
  }
  
  // Implement for delete, clear as well
}
```

---

## 5. Integration with Authentication Middleware

### Location: `backend/src/middleware/agentAuth.js`

```javascript
const metricsService = require('../services/metricsService');

const authenticate = async (req, res, next) => {
  try {
    const token = extractToken(req); // Your token extraction logic
    
    if (!token) {
      // ✅ ADD: Track failed auth
      metricsService.increment('auth_attempts_total', {
        method: 'api_key',
        status: 'failure'
      });
      
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const user = await validateToken(token); // Your validation logic
    
    if (!user) {
      // ✅ ADD: Track failed auth
      metricsService.increment('auth_attempts_total', {
        method: 'api_key',
        status: 'failure'
      });
      
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // ✅ ADD: Track successful auth
    metricsService.increment('auth_attempts_total', {
      method: 'api_key',
      status: 'success'
    });
    
    req.user = user;
    next();
  } catch (error) {
    metricsService.increment('auth_attempts_total', {
      method: 'api_key',
      status: 'error'
    });
    
    next(error);
  }
};
```

---

## 6. Enable HTTP Request Tracking (Global Middleware)

### Location: `backend/src/app.js`

Add this **early** in your middleware stack (after body parsing):

```javascript
const metricsService = require('./services/metricsService');

function createApp() {
  const app = express();
  
  // ... existing middleware (helmet, cors, body parsing)
  
  // ✅ ADD: Metrics middleware (tracks all HTTP requests automatically)
  app.use(metricsService.middleware());
  
  // ... rest of routes
  
  return app;
}
```

This will automatically track:
- `api_requests_total` (by method, route, status code)
- `api_request_duration_seconds` (by method, route, status code)
- `rate_limit_hits_total` (for 429 responses)

---

## 7. Testing Metrics

### Start the server:

```bash
cd backend
node server-phase2.js
```

### Access metrics:

**Prometheus format** (for scraping):
```bash
curl http://localhost:3001/api/metrics
```

**JSON format** (for dashboards):
```bash
curl http://localhost:3001/api/metrics/json
```

### Example Prometheus Output:

```
# HELP amrikyy_stream_chunks_sent_total Total number of stream chunks sent to clients
# TYPE amrikyy_stream_chunks_sent_total counter
amrikyy_stream_chunks_sent_total{agent="ContentCreator",model="gemini-2.5-pro"} 142

# HELP amrikyy_stream_sessions_completed_total Total number of completed stream sessions
# TYPE amrikyy_stream_sessions_completed_total counter
amrikyy_stream_sessions_completed_total{agent="ContentCreator",model="gemini-2.5-pro"} 5

# HELP amrikyy_active_streams Number of currently active stream sessions
# TYPE amrikyy_active_streams gauge
amrikyy_active_streams{agent="ContentCreator"} 2

# HELP amrikyy_llm_calls_total Total number of calls to LLM APIs
# TYPE amrikyy_llm_calls_total counter
amrikyy_llm_calls_total{model="gemini-2.0-flash-exp",status="success",agent="TravelAgency"} 25

# HELP amrikyy_api_requests_total Total number of API requests
# TYPE amrikyy_api_requests_total counter
amrikyy_api_requests_total{method="POST",route="/api/stream",status_code="200"} 12
amrikyy_api_requests_total{method="GET",route="/api/health",status_code="200"} 50
```

---

## 8. Prometheus Scraping Configuration

Add this to your `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'amrikyy-agent'
    scrape_interval: 15s
    static_configs:
      - targets: ['localhost:3001']
    metrics_path: '/api/metrics'
```

---

## 9. Grafana Dashboard (Optional)

Import the provided `grafana-dashboard.json` or create custom panels:

### Key Queries:

**Stream Sessions Over Time:**
```promql
rate(amrikyy_stream_sessions_completed_total[5m])
```

**LLM Call Latency (p95):**
```promql
histogram_quantile(0.95, rate(amrikyy_llm_call_duration_seconds_bucket[5m]))
```

**Active Streams:**
```promql
amrikyy_active_streams
```

**API Request Rate:**
```promql
rate(amrikyy_api_requests_total[1m])
```

**Error Rate:**
```promql
rate(amrikyy_api_requests_total{status_code=~"5.."}[5m])
```

---

## 10. Best Practices

### ✅ DO:
- Use `recordStreamEvent()`, `recordLLMCall()`, `recordCoordinatorWorkflow()` for convenience
- Always include `agent` and `model` labels for better filtering
- Track both successes and failures
- Use histogram buckets appropriate for your latency profile
- Reset gauges properly (inc/dec) to avoid drift

### ❌ DON'T:
- Don't create high-cardinality labels (e.g., user IDs, request IDs)
- Don't track PII in metric labels
- Don't increment counters in tight loops without batching
- Don't forget to decrement gauges when resources are released

---

## 11. Troubleshooting

### Metrics not appearing?

1. Check if `metricsService` is properly imported
2. Verify middleware is added to Express app
3. Check for errors in logs: `grep "MetricsService" logs/combined.log`
4. Test direct access: `curl http://localhost:3001/api/metrics`

### Gauges drifting?

- Ensure every `incGauge()` has a matching `decGauge()`
- Check for uncaught errors that skip gauge decrements
- Use try-finally blocks for gauge management

### High memory usage?

- Reduce histogram bucket count
- Lower scrape interval in Prometheus
- Check for label cardinality explosion

---

## Summary

You now have a comprehensive metrics system integrated with:
- ✅ Streaming (SSE)
- ✅ LLM API calls
- ✅ Multi-agent workflows
- ✅ HTTP requests
- ✅ Cache operations
- ✅ Authentication
- ✅ Rate limiting

Next steps:
1. Apply these patterns to all agent classes
2. Set up Prometheus + Grafana for visualization
3. Create alerts for critical metrics (error rates, latency spikes)
4. Monitor costs using `amrikyy_llm_cost_usd_total`

For questions or issues, refer to the main `AGENTS.md` or `PHASE_2_PRODUCTION_GUIDE.md`.
