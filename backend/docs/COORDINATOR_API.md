# Coordinator API Documentation

## Overview
The Coordinator API enables execution of multi-agent workflows with full tracing, metrics, and authentication.

## Endpoints

### POST /api/coordinator
Execute a workflow (requires authentication)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "workflowName": "string (required)",
  "inputs": "object (required)",
  "options": "object (optional)",
  "async": "boolean (optional, default: false)"
}
```

**Response (200 OK - Sync Mode):**
```json
{
  "success": true,
  "workflowId": "uuid",
  "workflowName": "workflow-name",
  "strategy": "sequential|parallel|hierarchical",
  "result": { ... },
  "duration": 1.23,
  "timestamp": "2025-10-22T21:00:00.000Z"
}
```

**Response (202 Accepted - Async Mode):**
```json
{
  "success": true,
  "message": "Workflow started",
  "workflowName": "workflow-name",
  "async": true,
  "statusEndpoint": "/api/coordinator/status"
}
```

**Error Response (500):**
```json
{
  "success": false,
  "error": "Error message",
  "workflowId": "uuid",
  "workflowName": "workflow-name"
}
```

### GET /api/coordinator/status/:workflowId
Get the status of an async workflow

**Response (200 OK):**
```json
{
  "success": true,
  "workflowId": "uuid",
  "status": "running",
  "startTime": 1234567890,
  "duration": 1234
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "workflowId": "uuid",
  "status": "not_found",
  "message": "Workflow not found or already completed"
}
```

## Features

### 1. LangSmith Tracing
All workflow executions are traced with:
- Operation name: `api.workflow`
- Workflow metadata (name, ID, inputs)
- Duration tracking
- Success/failure status

### 2. Metrics Collection
Metrics are automatically collected via `metricsService`:
- Workflow execution count (by strategy)
- Success/failure rates
- Execution duration histograms

### 3. Authentication & Rate Limiting
- **Authentication**: JWT token required (via `authenticateToken` middleware)
- **Rate Limiting**: AI rate limiter (10 requests/minute per IP)

### 4. Sync vs Async Execution

**Synchronous (default):**
- Client waits for workflow completion
- Full result returned in response
- Best for quick workflows (<30 seconds)

**Asynchronous:**
- Workflow runs in background
- Immediate response with workflow ID
- Use status endpoint to check progress
- Best for long-running workflows

## Example Usage

### Example 1: Sync Workflow Execution
```bash
curl -X POST http://localhost:5000/api/coordinator \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "workflowName": "travel-planning",
    "inputs": {
      "destination": "Paris",
      "duration": 7,
      "budget": 5000
    }
  }'
```

### Example 2: Async Workflow Execution
```bash
# Start workflow
curl -X POST http://localhost:5000/api/coordinator \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "workflowName": "complex-analysis",
    "inputs": { "data": "..." },
    "async": true
  }'

# Check status (note: workflowId would be returned if implemented in service)
curl -X GET http://localhost:5000/api/coordinator/status/WORKFLOW_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Architecture

```
Client Request
    ↓
Express (server.js)
    ↓
[authenticateToken] → [aiLimiter]
    ↓
coordinator.js (Route)
    ↓
coordinatorController.js (HTTP Handler)
    ↓
coordinatorService.js (Business Logic)
    ↓
MultiAgentCoordinator (Workflow Execution)
    ↓
[LangSmith Tracing] + [Metrics Collection]
    ↓
Response
```

## Error Handling

The API implements comprehensive error handling:

1. **Validation Errors (400)**: Invalid request body
2. **Authentication Errors (401/403)**: Missing or invalid token
3. **Rate Limit Errors (429)**: Too many requests
4. **Workflow Errors (500)**: Execution failures

All errors include:
- `success: false`
- Descriptive error message
- Context (workflowId, workflowName where applicable)

## Integration with Existing Routes

The new API extends the existing coordinator routes:
- `/api/coordinator/sequential` - Execute sequential workflows
- `/api/coordinator/parallel` - Execute parallel workflows
- `/api/coordinator/hierarchical` - Execute hierarchical workflows
- `/api/coordinator/workflows` - List available workflows
- `/api/coordinator/agents` - List registered agents
- `/api/coordinator/stats` - Get statistics

The main `/api/coordinator` endpoint provides a unified interface with enhanced service layer architecture.
