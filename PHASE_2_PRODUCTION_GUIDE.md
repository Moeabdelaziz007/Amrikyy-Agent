# Phase 2 Production API - Complete Guide

**Author**: Mohamed Hossameldin Abdelaziz  
**Created**: October 22, 2025  
**Version**: 2.0.0  
**Status**: Production Ready ✅

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Running the Server](#running-the-server)
6. [API Endpoints](#api-endpoints)
7. [Monitoring & Metrics](#monitoring--metrics)
8. [Security](#security)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## Overview

Phase 2 API consolidates all advanced agent features into a production-ready Express application:

### ✅ Features Implemented

- **LangSmith Tracing**: Performance tracking and cost monitoring
- **SSE Streaming**: Real-time token-by-token streaming
- **Multi-Agent Coordination**: Sequential, parallel, and hierarchical workflows
- **Agent Management API**: Health checks, metrics, cache control
- **RBAC Authentication**: JWT + API keys with role-based permissions
- **Redis Rate Limiting**: Distributed rate limiting per agent/operation
- **Prometheus Metrics**: Production-grade observability

### 📁 File Structure

```
backend/
├── server-phase2.js                    # Phase 2 entry point
├── src/
│   ├── app.js                          # Express app configuration
│   ├── routes/
│   │   ├── health.js                   # Health check endpoints
│   │   ├── metrics.js                  # Prometheus metrics
│   │   ├── agentManagement.js          # Agent management API
│   │   ├── agentStreaming.js           # SSE streaming routes
│   │   └── coordinator.js              # Multi-agent workflows
│   ├── middleware/
│   │   ├── agentAuth.js                # JWT + API key auth
│   │   ├── agentRateLimit.js           # Rate limiting
│   │   └── agentValidation.js          # Input validation
│   ├── services/
│   │   └── metricsService.js           # Prometheus metrics service
│   ├── utils/
│   │   ├── AgentLangSmith.js           # Tracing utility
│   │   ├── AgentStreaming.js           # Streaming utility
│   │   └── MultiAgentCoordinator.js    # Coordination utility
│   └── cache/
│       └── RedisCache.js               # Redis cache
```

---

## Architecture

### Request Flow

```
Client Request
    ↓
[Security Headers] (Helmet)
    ↓
[CORS]
    ↓
[Body Parsing]
    ↓
[Request ID]
    ↓
[Authentication] (JWT/API Key)
    ↓
[Rate Limiting] (Redis-backed)
    ↓
[Input Validation] (Joi schemas)
    ↓
[Business Logic]
    ↓
[Metrics Recording] (Prometheus)
    ↓
[Response]
```

### Component Interaction

```
┌─────────────────┐
│   Express App   │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│ Auth  │ │ Rate  │
│ Layer │ │ Limit │
└───┬───┘ └──┬────┘
    │         │
    └────┬────┘
         │
    ┌────▼─────────┐
    │   Routes     │
    └────┬─────────┘
         │
    ┌────▼─────────┐
    │  Utilities   │
    │  - Tracing   │
    │  - Streaming │
    │  - Coord.    │
    └──────────────┘
```

---

## Installation

### Prerequisites

- Node.js 18+
- Redis (optional, falls back to memory cache)
- Supabase account
- Gemini API key

### Install Dependencies

```bash
cd backend
npm install
```

### New Dependencies Added

```json
{
  "joi": "^17.13.3",           // Input validation
  "prom-client": "^15.1.0",    // Prometheus metrics
  "rate-limit-redis": "^4.2.0" // Redis rate limiting
}
```

---

## Configuration

### Environment Variables

Create `.env` file in `backend/` directory:

```bash
# Server
NODE_ENV=production
PHASE2_PORT=3001
HOST=0.0.0.0

# AI - Gemini API
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.0-flash-exp
GEMINI_PRO_MODEL=gemini-2.5-pro

# Database
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Security
JWT_SECRET=your-jwt-secret-min-32-chars
ENCRYPTION_KEY=your-encryption-key-32-chars

# Redis (optional)
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Rate Limiting
RATE_LIMIT_WHITELIST=127.0.0.1,::1
VALID_API_KEYS=key1,key2,key3

# LangSmith (optional)
LANGSMITH_API_KEY=your-langsmith-key
LANGSMITH_PROJECT=amrikyy-agent

# Metrics
METRICS_PUBLIC=false  # Set to true to expose metrics publicly

# CORS
ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com
```

### Generating Secrets

```bash
# Generate JWT secret (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate encryption key (32 characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate API keys
node -e "console.log('api_' + require('crypto').randomBytes(16).toString('hex'))"
```

---

## Running the Server

### Development Mode

```bash
# Run Phase 2 server with auto-reload
npm run dev:phase2
```

### Production Mode

```bash
# Run Phase 2 server
npm run start:phase2

# Run with production optimizations
npm run start:prod
```

### Health Check

```bash
# Check if server is healthy
npm run health-check

# Or manually
curl http://localhost:3001/api/health
```

### Expected Output

```
============================================================
🚀 Amrikyy Agent Phase 2 Server Started
============================================================
Environment: production
Server: http://0.0.0.0:3001
Health: http://0.0.0.0:3001/api/health
Metrics: http://0.0.0.0:3001/api/metrics
Uptime: 0.50s
============================================================
Phase 2 Features:
  ✓ LangSmith Tracing
  ✓ SSE Streaming
  ✓ Multi-Agent Coordination
  ✓ Agent Management API
  ✓ RBAC Authentication
  ✓ Redis Rate Limiting
  ✓ Prometheus Metrics
============================================================
✅ Server ready to accept connections
```

---

## API Endpoints

### 🏥 Health & Status

#### `GET /api/health`
Comprehensive health check of all components.

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-22T10:00:00.000Z",
  "uptime": 3600,
  "components": {
    "redis": {
      "status": "healthy",
      "latency": 5,
      "message": "Redis operational"
    },
    "database": {
      "status": "healthy",
      "latency": 120,
      "message": "Supabase operational"
    },
    "gemini": {
      "status": "healthy",
      "latency": 450,
      "message": "Gemini API operational"
    },
    "agents": {
      "status": "healthy",
      "agents": {
        "travel": { "status": "healthy", "totalCalls": 1523, "errorRate": 2 },
        "content": { "status": "healthy", "totalCalls": 892, "errorRate": 1 },
        "innovation": { "status": "healthy", "totalCalls": 347, "errorRate": 0 }
      },
      "summary": { "total": 3, "healthy": 3, "degraded": 0, "unhealthy": 0 }
    }
  },
  "version": "2.0.0",
  "phase": 2
}
```

#### `GET /api/health/live`
Kubernetes liveness probe.

#### `GET /api/health/ready`
Kubernetes readiness probe.

#### `GET /api/status`
Lightweight status endpoint.

---

### 📊 Metrics

#### `GET /api/metrics`
Prometheus metrics (text format for scraping).

**Example Output**:
```
# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",route="/api/health",status="200"} 4523

# HELP llm_tokens_used_total Total number of tokens used
# TYPE llm_tokens_used_total counter
llm_tokens_used_total{model="gemini-2.0-flash-exp",agent="travel",type="input"} 1523487
llm_tokens_used_total{model="gemini-2.0-flash-exp",agent="travel",type="output"} 892341

# HELP stream_sessions_active Number of currently active streaming sessions
# TYPE stream_sessions_active gauge
stream_sessions_active{agent="content"} 12
```

#### `GET /api/metrics/json`
JSON metrics for dashboards.

#### `POST /api/metrics/reset`
Reset all metrics (admin only).

---

### 🤖 Agent Management

**Base Path**: `/api/agents`

#### `GET /api/agents/list`
List all registered agents.

#### `GET /api/agents/overview`
Overview with statistics.

#### `GET /api/agents/:agent/health`
Agent-specific health check.

#### `GET /api/agents/:agent/status`
Detailed agent status.

#### `GET /api/agents/:agent/metrics`
Agent performance metrics.

#### `GET /api/agents/:agent/traces`
Recent LangSmith traces.

**Query params**: `?limit=100`

#### `POST /api/agents/:agent/cache/clear`
Clear agent cache.

**Body**:
```json
{
  "pattern": "travel:*"
}
```

#### `POST /api/agents/:agent/cache/warm`
Warm agent cache.

**Body**:
```json
{
  "queries": [
    "flights from NYC to LAX",
    "hotels in Paris"
  ]
}
```

---

### 🌊 Streaming

**Base Path**: `/api/stream`

#### `POST /api/stream/blog`
Stream blog post generation (SSE).

**Body**:
```json
{
  "topic": "AI in Travel",
  "tone": "professional",
  "length": "medium"
}
```

**SSE Events**:
```
event: connected
data: {"message":"Stream started"}

event: token
data: {"chunk":"The"}

event: token
data: {"chunk":" future"}

event: progress
data: {"progress":50,"message":"Half done"}

event: complete
data: {"totalTokens":500,"duration":"2.5s"}
```

#### `POST /api/stream/itinerary`
Stream itinerary generation with progress.

#### `POST /api/stream/recommendations`
Stream JSON recommendations.

---

### 🔗 Multi-Agent Coordinator

**Base Path**: `/api/coordinator`

#### `POST /api/coordinator/sequential`
Execute sequential workflow.

**Body**:
```json
{
  "steps": [
    { "agent": "travel", "method": "searchFlights", "params": {...} },
    { "agent": "content", "method": "generateBlogPost", "params": {...} }
  ],
  "input": { "destination": "Paris" }
}
```

#### `POST /api/coordinator/parallel`
Execute parallel workflow.

**Body**:
```json
{
  "tasks": [
    { "agent": "travel", "method": "searchFlights" },
    { "agent": "travel", "method": "searchHotels" },
    { "agent": "content", "method": "generateSocialPosts" }
  ],
  "input": { "destination": "Tokyo" }
}
```

#### `POST /api/coordinator/hierarchical`
Execute hierarchical workflow.

**Body**:
```json
{
  "master": "innovation",
  "subAgents": ["travel", "content"],
  "input": { "campaign": "Summer Travel 2025" },
  "aggregator": "function(results) { return combine(results); }"
}
```

#### `GET /api/coordinator/workflows`
List all registered workflows.

#### `GET /api/coordinator/stats`
Get coordinator statistics.

---

## Monitoring & Metrics

### Prometheus Integration

Add to `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'amrikyy-agent'
    static_configs:
      - targets: ['localhost:3001']
    scrape_interval: 15s
    metrics_path: '/api/metrics'
```

### Key Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `http_requests_total` | Counter | Total HTTP requests |
| `http_request_duration_seconds` | Histogram | Request duration |
| `stream_sessions_total` | Counter | Total streaming sessions |
| `stream_sessions_active` | Gauge | Active streams |
| `llm_calls_total` | Counter | Total LLM API calls |
| `llm_tokens_used_total` | Counter | Total tokens used |
| `llm_cost_dollars_total` | Counter | Total cost in USD |
| `agent_executions_total` | Counter | Total agent executions |
| `cache_operations_total` | Counter | Total cache operations |
| `rate_limit_hits_total` | Counter | Total rate limit hits |

### Grafana Dashboard

Import the included Grafana dashboard:

```bash
# Located at: backend/monitoring/grafana-dashboard.json
```

---

## Security

### Authentication

#### JWT Tokens

```bash
# Generate token
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}

# Use token
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### API Keys

```bash
# Use API key
x-api-key: api_1234567890abcdef
```

### Roles & Permissions

| Role | Permissions |
|------|-------------|
| **USER** | `agent:read`, `agent:execute` |
| **PREMIUM** | USER + `agent:priority`, `agent:streaming` |
| **ADMIN** | PREMIUM + `agent:manage`, `agent:stats`, `cache:manage` |
| **INTERNAL** | All permissions |

### Rate Limits

| Agent/Operation | Rate Limit |
|-----------------|------------|
| Global | 100 req/min |
| Travel (general) | 60 req/min |
| Travel (flights) | 20 req/min |
| Travel (hotels) | 20 req/min |
| Travel (itineraries) | 10 req/min |
| Content (general) | 30 req/min |
| Content (blog) | 5 req/min |
| Content (social) | 10 req/min |
| Innovation (general) | 30 req/min |
| Admin | 10 req/min |

### Bypass Rate Limiting

Add IPs to whitelist:

```bash
RATE_LIMIT_WHITELIST=127.0.0.1,::1,10.0.0.1
```

---

## Deployment

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
```

**Build & Run**:

```bash
docker build -t amrikyy-agent-phase2 .
docker run -p 3001:3001 --env-file .env amrikyy-agent-phase2
```

### PM2

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start server-phase2.js --name "amrikyy-phase2"

# Monitor
pm2 monit

# Logs
pm2 logs amrikyy-phase2

# Restart
pm2 restart amrikyy-phase2

# Stop
pm2 stop amrikyy-phase2
```

**PM2 Ecosystem File** (`ecosystem.config.js`):

```javascript
module.exports = {
  apps: [{
    name: 'amrikyy-phase2',
    script: './server-phase2.js',
    instances: 4,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PHASE2_PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: amrikyy-phase2
spec:
  replicas: 3
  selector:
    matchLabels:
      app: amrikyy-phase2
  template:
    metadata:
      labels:
        app: amrikyy-phase2
    spec:
      containers:
      - name: amrikyy-phase2
        image: amrikyy-agent-phase2:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        livenessProbe:
          httpGet:
            path: /api/health/live
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health/ready
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: amrikyy-phase2
spec:
  selector:
    app: amrikyy-phase2
  ports:
  - port: 3001
    targetPort: 3001
  type: LoadBalancer
```

---

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Check what's using port 3001
lsof -i :3001

# Kill process
kill -9 <PID>

# Or use different port
PHASE2_PORT=3002 npm run start:phase2
```

#### 2. Redis Connection Failed

```bash
# Check Redis status
redis-cli ping

# Start Redis (Mac)
brew services start redis

# Start Redis (Linux)
sudo systemctl start redis

# Server will fallback to memory cache if Redis unavailable
```

#### 3. Authentication Errors

```bash
# Verify JWT_SECRET is set
echo $JWT_SECRET

# Generate new JWT token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

#### 4. High Memory Usage

```bash
# Check memory usage
pm2 monit

# Restart server
pm2 restart amrikyy-phase2

# Reduce streaming concurrency
# Set MAX_CONCURRENT_STREAMS=10 in .env
```

#### 5. Rate Limit Issues

```bash
# Check rate limit hits
curl http://localhost:3001/api/metrics/json | jq '.metrics[] | select(.name == "rate_limit_hits_total")'

# Add IP to whitelist
RATE_LIMIT_WHITELIST=127.0.0.1,<your-ip>

# Or increase limits in agentRateLimit.js
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev:phase2

# Check logs
tail -f backend/logs/combined.log

# PM2 logs
pm2 logs amrikyy-phase2 --lines 100
```

### Performance Issues

```bash
# Check CPU usage
top

# Check agent statistics
curl http://localhost:3001/api/agents/overview

# Check active streams
curl http://localhost:3001/api/metrics/json | jq '.metrics[] | select(.name == "stream_sessions_active")'

# Clear caches
curl -X POST http://localhost:3001/api/agents/travel/cache/clear \
  -H "Authorization: Bearer $TOKEN"
```

---

## Next Steps

### Phase 3 Roadmap

1. **WebSocket Support**: Real-time bidirectional communication
2. **Agent Versioning**: A/B testing and gradual rollouts
3. **Advanced Caching**: Multi-tier caching strategies
4. **Cost Optimization**: Token usage optimization
5. **Multi-Region**: Deploy across multiple regions
6. **Load Balancing**: Horizontal scaling with load balancer

### Integration Tasks

1. Integrate Phase 2 utilities into existing agents:
   - `TravelAgencyAgent.js`
   - `ContentCreatorAgent.js`
   - `InnovationAgent.js`

2. Create integration tests for critical paths

3. Set up CI/CD pipeline

4. Create monitoring dashboards

---

## Support

- **Documentation**: [AGENTS.md](../AGENTS.md)
- **GitHub Issues**: [Report Issues](https://github.com/Moeabdelaziz007/Amrikyy-Agent/issues)
- **Email**: support@amrikyy.com

---

**Version**: 2.0.0  
**Last Updated**: October 22, 2025  
**Status**: Production Ready ✅
