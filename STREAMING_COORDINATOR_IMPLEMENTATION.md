# Streaming and Coordinator API Implementation

**Status**: ✅ Complete  
**Issues**: #104, #105  
**Date**: October 23, 2025

## Overview

This implementation adds comprehensive support for **Server-Sent Events (SSE) streaming** and **Multi-Agent Coordinator workflows** to the Amrikyy Agent Platform, with full **LangSmith tracing** and **Prometheus metrics** integration.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       API Layer                              │
│  ┌────────────────┐           ┌─────────────────┐          │
│  │ /api/stream    │           │ /api/coordinator │          │
│  │ (streamRoutes) │           │ (coordinator)    │          │
│  └────────┬───────┘           └────────┬────────┘          │
└───────────┼──────────────────────────┼──────────────────────┘
            │                          │
            │ Auth + Rate Limiting     │ Auth + Rate Limiting
            │                          │
┌───────────┼──────────────────────────┼──────────────────────┐
│           │      Controller Layer    │                       │
│  ┌────────▼───────┐           ┌─────▼──────────────┐       │
│  │ streamController│           │coordinatorController│       │
│  └────────┬────────┘           └─────┬──────────────┘       │
└───────────┼──────────────────────────┼──────────────────────┘
            │                          │
┌───────────┼──────────────────────────┼──────────────────────┐
│           │       Service Layer      │                       │
│  ┌────────▼────────┐           ┌────▼───────────────┐      │
│  │ streamService   │           │coordinatorService  │       │
│  │ ┌─────────────┐ │           │ ┌────────────────┐ │      │
│  │ │LangSmith    │ │           │ │LangSmith       │ │      │
│  │ │Tracing      │ │           │ │Tracing         │ │      │
│  │ └─────────────┘ │           │ └────────────────┘ │      │
│  │ ┌─────────────┐ │           │ ┌────────────────┐ │      │
│  │ │Metrics      │ │           │ │Metrics         │ │      │
│  │ │Tracking     │ │           │ │Tracking        │ │      │
│  │ └─────────────┘ │           │ └────────────────┘ │      │
│  └─────────────────┘           └────────────────────┘      │
└───────────┼──────────────────────────┼──────────────────────┘
            │                          │
┌───────────┼──────────────────────────┼──────────────────────┐
│           │       Utility Layer      │                       │
│  ┌────────▼────────┐           ┌────▼───────────────┐      │
│  │ AgentStreaming  │           │MultiAgentCoordinator│      │
│  └─────────────────┘           └────────────────────┘      │
└──────────────────────────────────────────────────────────────┘
```

## Files Created

### Services (Core Business Logic)

#### 1. `backend/src/services/streamService.js`
**Purpose**: Manages SSE streaming with LangSmith tracing and metrics

**Key Features**:
- SSE stream initialization and management
- LangSmith tracing via `wrapLLMCall`
- Prometheus metrics tracking
- Client disconnect handling
- Resource cleanup
- Active stream tracking

**Key Methods**:
```javascript
streamWithSSE({ req, res, prompt, model, options, meta })
  // Returns: { cancel: Function }
  
getActiveStreamCount()
getActiveStreams()
cancelAllStreams()
```

#### 2. `backend/src/services/coordinatorService.js`
**Purpose**: Orchestrates multi-agent workflows with tracing and metrics

**Key Features**:
- Sequential, parallel, and hierarchical workflow execution
- LangSmith tracing via `wrapOrchestrator`
- Prometheus metrics for workflow execution
- Agent and workflow registration
- Statistics tracking

**Key Methods**:
```javascript
executeWorkflow(workflowName, inputs, options, meta)
executeSequential(steps, input, transformers, meta)
executeParallel(tasks, input, meta)
executeHierarchical(master, subAgents, input, aggregator, meta)
registerAgent(name, agentInstance)
registerWorkflow(name, config)
getStats()
```

### Controllers (HTTP Handling)

#### 3. `backend/src/controllers/coordinatorController.js`
**Purpose**: HTTP handlers for coordinator API endpoints

**Endpoints Handled**:
- `POST /api/coordinator/workflow` - Execute named workflow
- `POST /api/coordinator/sequential` - Execute sequential workflow
- `POST /api/coordinator/parallel` - Execute parallel workflow
- `POST /api/coordinator/hierarchical` - Execute hierarchical workflow
- `GET /api/coordinator/workflows` - List workflows
- `GET /api/coordinator/agents` - List agents
- `GET /api/coordinator/stats` - Get statistics
- `POST /api/coordinator/stats/reset` - Reset statistics

### Middleware

#### 4. `backend/src/middleware/auth.js`
**Purpose**: Unified authentication and rate limiting interface

**Exports**:
```javascript
authenticate      // JWT token authentication
rateLimiter      // Global rate limiter
requireAdmin     // Admin-only access
requirePremium   // Premium/admin access
```

## Files Modified

### Routes

#### 1. `backend/src/routes/coordinator.js`
**Changes**:
- Updated to use `coordinatorController` instead of inline handlers
- Added authentication middleware to all routes
- Added rate limiting to POST endpoints
- Maintained backward compatibility

### Server Configuration

#### 2. `backend/server.js`
**Changes**:
```javascript
// Added route imports
const streamRoutes = require('./src/routes/streamRoutes');
const coordinatorRoutes = require('./src/routes/coordinator');

// Registered routes
app.use('/api/stream', streamRoutes);
app.use('/api/coordinator', coordinatorRoutes);
```

### Utilities

#### 3. `backend/src/utils/AgentStreaming.js`
**Changes**:
- Added `wrapLLMCall` import for LangSmith tracing
- Now properly traces all Gemini API calls

#### 4. `backend/src/utils/logger.js`
**Changes**:
- Fixed module export to export logger instance directly
- Ensures compatibility with existing code

### Validation

#### 5. `backend/src/middleware/agentValidation.js`
**Changes**:
- Added coordinator workflow validators:
  - `validateSequentialWorkflow`
  - `validateParallelWorkflow`
  - `validateHierarchicalWorkflow`
  - `validateCoordinatorWorkflow`

## API Documentation

### Streaming API

#### Stream Agent Response
```http
GET /api/stream/:agent?prompt=your_prompt
Authorization: Bearer {token}
```

**Response**: Server-Sent Events (SSE) stream

**Events**:
- `connected` - Stream initialized
- `status` - Status updates
- `progress` - Progress updates (0-100)
- `chunk` - Text chunks
- `token` - Individual tokens (optional)
- `complete` - Stream completed
- `error` - Error occurred
- `close` - Stream closed

#### Get Streaming Statistics
```http
GET /api/stream/stats/:agent?
Authorization: Bearer {token}
```

**Response**:
```json
{
  "agent": "travel",
  "totalStreams": 100,
  "activeStreams": 2,
  "completedStreams": 95,
  "failedStreams": 3,
  "successRate": "97.00%",
  "avgDuration": "2500ms"
}
```

### Coordinator API

#### Execute Sequential Workflow
```http
POST /api/coordinator/sequential
Authorization: Bearer {token}
Content-Type: application/json

{
  "steps": [
    {
      "agent": "agentName",
      "method": "methodName",
      "transform": null
    }
  ],
  "input": { "data": "..." }
}
```

#### Execute Parallel Workflow
```http
POST /api/coordinator/parallel
Authorization: Bearer {token}
Content-Type: application/json

{
  "tasks": [
    {
      "agent": "agent1",
      "method": "method1"
    },
    {
      "agent": "agent2",
      "method": "method2"
    }
  ],
  "input": { "data": "..." }
}
```

#### Execute Hierarchical Workflow
```http
POST /api/coordinator/hierarchical
Authorization: Bearer {token}
Content-Type: application/json

{
  "master": {
    "name": "masterAgent",
    "method": "delegate"
  },
  "subAgents": [
    {
      "name": "sub1",
      "method": "execute"
    }
  ],
  "input": { "data": "..." }
}
```

## Integration

### LangSmith Tracing

All API calls are automatically traced in LangSmith:

**Streaming API**:
- Each stream creates a trace with `wrapLLMCall`
- Traces include: model name, prompt, tokens, duration
- Trace name: `{modelName}_llm_call`

**Coordinator API**:
- Each workflow creates a trace with `wrapOrchestrator`
- Traces include: workflow name, strategy, duration, results
- Trace name: `{workflowName}_orchestrator`

### Prometheus Metrics

**Streaming Metrics**:
```
stream_sessions_total{agent, status}
stream_chunks_sent_total{agent}
stream_session_duration_seconds{agent, status}
stream_sessions_active{agent}
```

**Coordinator Metrics**:
```
coordinator_workflows_total{strategy, status}
coordinator_workflow_duration_seconds{strategy, status}
```

**LLM Metrics**:
```
llm_calls_total{model, agent, status}
llm_tokens_used_total{model, agent, type}
llm_cost_dollars_total{model, agent}
llm_call_duration_seconds{model, agent, status}
```

## Security

### Authentication
- All endpoints require JWT authentication
- Token format: `Authorization: Bearer {token}`
- Token contains: `{ id, email, role }`

### Rate Limiting
- Global rate limiter: 100 requests per minute
- Per-agent rate limiting available
- Admin endpoints have higher limits

### Input Validation
- All coordinator endpoints validate input with Joi
- Required fields are enforced
- Data types are validated
- Array lengths are checked

## Testing

### Integration Test
Run the integration test to verify services:

```bash
cd backend
node tests/services-integration.test.js
```

**Expected Output**:
```
=== Testing Service Layer ===

✓ streamService loaded
✓ coordinatorService loaded
✓ Initial state checks
✓ Registered mock agent
✓ Registered test workflow

=== All Tests Passed ===
```

### Manual Testing

#### Test Streaming API (requires JWT token):
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:5000/api/stream/content?prompt=Tell%20me%20about%20Egypt"
```

#### Test Coordinator API:
```bash
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"steps":[{"agent":"mockAgent","method":"executeTask"}],"input":"test"}' \
     http://localhost:5000/api/coordinator/sequential
```

## Known Limitations

1. **Pre-existing Agent Issues**: Some agent files (e.g., `TravelAgencyAgent.js`) have syntax errors that prevent them from loading. This is not part of this implementation and should be addressed separately.

2. **Redis Warning**: The rate limiter logs a warning about Redis not being available. This is expected in development and falls back to memory-based rate limiting.

## Future Enhancements

1. **Long-running Workflows**: Implement async workflow execution with status polling
2. **Workflow Cancellation**: Add ability to cancel running workflows
3. **Streaming Backpressure**: Implement backpressure handling for slow clients
4. **Workflow Persistence**: Store workflow definitions in database
5. **Advanced Metrics**: Add percentile metrics for latency

## Conclusion

This implementation successfully completes Issues #104 and #105 by:

✅ Implementing SSE streaming with LangSmith tracing  
✅ Implementing multi-agent coordination with metrics  
✅ Securing all endpoints with authentication  
✅ Adding comprehensive input validation  
✅ Integrating with existing infrastructure  
✅ Maintaining backward compatibility  
✅ Providing clear documentation

All new code is production-ready and follows best practices for error handling, logging, and monitoring.
