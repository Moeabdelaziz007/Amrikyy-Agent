# 🏗️ البنية المعمارية - Amrikyy Agent Platform

## نظرة عامة على البنية

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Frontend Layer (طبقة الواجهة)                 │
│                      React + TypeScript + Vite                      │
│                                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │   OS     │  │   Chat   │  │ Booking  │  │ Profile  │           │
│  │  Apps    │  │Interface │  │  System  │  │ Manager  │           │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘           │
└─────────────────────────────────────────────────────────────────────┘
                               ↕ REST API / SSE
┌─────────────────────────────────────────────────────────────────────┐
│                    Middleware Layer (طبقة الوسيطة)                  │
│                                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │   Auth   │  │   Rate   │  │Validation│  │  Error   │           │
│  │   JWT    │  │ Limiting │  │  & RBAC  │  │ Handler  │           │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘           │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                   Controllers Layer (طبقة التحكم)                   │
│                                                                      │
│  ┌──────────────────────┐  ┌──────────────────────┐               │
│  │  streamController    │  │ coordinatorController │               │
│  │  ├─ startStream()    │  │  ├─ runWorkflow()     │               │
│  │  └─ getStats()       │  │  ├─ runSequential()   │               │
│  └──────────────────────┘  │  ├─ runParallel()     │               │
│                             │  └─ runHierarchical() │               │
│                             └──────────────────────┘               │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    Services Layer (طبقة الخدمات)                    │
│                                                                      │
│  ┌──────────────────────┐  ┌──────────────────────┐               │
│  │   streamService      │  │ coordinatorService   │               │
│  │  ├─ streamWithSSE()  │  │  ├─ executeWorkflow() │               │
│  │  ├─ cancel()         │  │  ├─ executeSequential()│              │
│  │  └─ getStats()       │  │  ├─ executeParallel() │               │
│  └──────────────────────┘  │  └─ executeHierarchical()│            │
│                             └──────────────────────┘               │
│                                                                      │
│  ┌──────────────────────────────────────────────────────┐          │
│  │           Other Services (30+ خدمة)                   │          │
│  │  • metricsService    • authService                   │          │
│  │  • bookingService    • stripeService                 │          │
│  │  • youtubeService    • voiceService                  │          │
│  │  • seoService        • encryptionService             │          │
│  └──────────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                     Utils Layer (طبقة الأدوات)                      │
│                                                                      │
│  ┌──────────────────────┐  ┌──────────────────────┐               │
│  │  AgentStreaming      │  │ MultiAgentCoordinator│               │
│  │  ├─ initializeStream()│  │  ├─ executeSequential()│             │
│  │  ├─ sendChunk()      │  │  ├─ executeParallel() │               │
│  │  ├─ sendComplete()   │  │  ├─ executeHierarchical()│            │
│  │  └─ closeStream()    │  │  └─ registerAgent()   │               │
│  └──────────────────────┘  └──────────────────────┘               │
│                                                                      │
│  ┌──────────────────────┐  ┌──────────────────────┐               │
│  │  AgentLangSmith      │  │  AgentCacheManager   │               │
│  │  ├─ startTrace()     │  │  ├─ get()             │               │
│  │  ├─ endTrace()       │  │  ├─ set()             │               │
│  │  └─ getStats()       │  │  └─ invalidate()      │               │
│  └──────────────────────┘  └──────────────────────┘               │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                     Agents Layer (طبقة الوكلاء)                     │
│                          14 AI Agents                                │
│                                                                      │
│  ┌──────────────────────┐  ┌──────────────────────┐               │
│  │ QuantumGeminiCore    │  │ TravelAgencyAgent    │               │
│  │ (Core Intelligence)  │  │ (Travel & Booking)   │               │
│  └──────────────────────┘  └──────────────────────┘               │
│                                                                      │
│  ┌──────────────────────┐  ┌──────────────────────┐               │
│  │ ContentCreatorAgent  │  │  InnovationAgent     │               │
│  │ (Content Creation)   │  │ (Innovation & Ideas) │               │
│  └──────────────────────┘  └──────────────────────┘               │
│                                                                      │
│  ┌──────────────────────┐  ┌──────────────────────┐               │
│  │  KarimWithMCP        │  │   LunaWithMCP        │               │
│  │ (Budget Optimizer)   │  │  (Trip Planner)      │               │
│  └──────────────────────┘  └──────────────────────┘               │
│                                                                      │
│  ┌──────────────────────┐  ┌──────────────────────┐               │
│  │  ScoutWithMCP        │  │ AIEducationAgent     │               │
│  │  (Deal Finder)       │  │ (Smart Education)    │               │
│  └──────────────────────┘  └──────────────────────┘               │
│                                                                      │
│  + 6 وكلاء إضافيين (EmotionalAnalyzer, mini-aladdin, إلخ.)         │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      MCP Layer (طبقة MCP)                           │
│                   Model Context Protocol                             │
│                                                                      │
│  ┌──────────────────────┐  ┌──────────────────────┐               │
│  │  TravelMCPServer     │  │ EducationMCPServer   │               │
│  │  ├─ searchFlights()  │  │  ├─ getResources()   │               │
│  │  ├─ searchHotels()   │  │  ├─ searchContent()  │               │
│  │  └─ bookTrip()       │  │  └─ generateQuiz()   │               │
│  └──────────────────────┘  └──────────────────────┘               │
│                                                                      │
│  ┌──────────────────────┐                                          │
│  │ ChatHistoryIndexer   │                                          │
│  │  ├─ indexChat()      │                                          │
│  │  └─ searchHistory()  │                                          │
│  └──────────────────────┘                                          │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                External Services (الخدمات الخارجية)                 │
│                                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │ Supabase │  │  Redis   │  │  Gemini  │  │ LangSmith│           │
│  │   (DB)   │  │ (Cache)  │  │   API    │  │(Tracing) │           │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘           │
│                                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │ Booking  │  │  Stripe  │  │ YouTube  │  │ Telegram │           │
│  │   .com   │  │(Payment) │  │   API    │  │   Bot    │           │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 تدفق البيانات للبث (Streaming Flow)

```
المستخدم
  │
  └─→ POST /api/stream/:agent?prompt=...
      │
      ├─→ [Middleware]
      │   ├─ authenticate (JWT/API Key)
      │   └─ rateLimiter (Redis-backed)
      │
      ├─→ [streamController.startStream]
      │   │
      │   └─→ [streamService.streamWithSSE]
      │       │
      │       ├─→ [1] AgentLangSmith.startTrace()
      │       │
      │       ├─→ [2] AgentStreaming.initializeStream()
      │       │   └─→ Set SSE Headers
      │       │       ├─ Content-Type: text/event-stream
      │       │       ├─ Cache-Control: no-cache
      │       │       └─ Connection: keep-alive
      │       │
      │       ├─→ [3] metricsService.recordStreamStart()
      │       │
      │       ├─→ [4] req.on('close', cancel)
      │       │   └─→ Handle client disconnect
      │       │
      │       ├─→ [5] AgentStreaming.streamGeminiResponse()
      │       │   │
      │       │   ├─→ [Gemini API] generateContentStream()
      │       │   │
      │       │   └─→ for await (chunk of stream)
      │       │       ├─→ sendChunk(chunk)
      │       │       │   └─→ res.write("data: {...}\n\n")
      │       │       │
      │       │       ├─→ metricsService.recordStreamChunk()
      │       │       │
      │       │       └─→ sendProgress(progress%)
      │       │
      │       ├─→ [6] metricsService.recordStreamComplete()
      │       │
      │       └─→ [7] AgentLangSmith.endTrace()
      │           └─→ Calculate cost, duration, tokens
      │
      └─→ [Response] SSE Stream → Client
          └─→ event: chunk
              event: progress
              event: complete
              event: close
```

---

## 🔄 تدفق البيانات للمنسق (Coordinator Flow)

```
المستخدم
  │
  └─→ POST /api/coordinator/workflow
      │ body: { workflowName, inputs }
      │
      ├─→ [Middleware]
      │   ├─ authenticate
      │   └─ rateLimiter
      │
      ├─→ [coordinatorController.runWorkflow]
      │   │
      │   └─→ [coordinatorService.executeWorkflow]
      │       │
      │       ├─→ [1] AgentLangSmith.startTrace()
      │       │
      │       ├─→ [2] MultiAgentCoordinator.executeWorkflow()
      │       │   │
      │       │   ├─→ [Strategy: Sequential]
      │       │   │   └─→ Agent A → Agent B → Agent C
      │       │   │
      │       │   ├─→ [Strategy: Parallel]
      │       │   │   └─→ Agent A + Agent B + Agent C
      │       │   │
      │       │   └─→ [Strategy: Hierarchical]
      │       │       └─→ Master → [Sub-Agents]
      │       │
      │       ├─→ [3] metricsService.recordCoordinatorWorkflow()
      │       │
      │       └─→ [4] AgentLangSmith.endTrace()
      │           └─→ Record workflow stats
      │
      └─→ [Response] JSON Result → Client
          └─→ { success, result, duration }
```

---

## 📊 نظام المقاييس (Metrics System)

```
┌─────────────────────────────────────────────────────────────┐
│                   Prometheus Metrics                        │
│                                                             │
│  HTTP Metrics:                                              │
│  • http_requests_total{method, route, status}              │
│  • http_request_duration_seconds{method, route, status}    │
│                                                             │
│  Streaming Metrics:                                         │
│  • stream_sessions_total{agent, status}                    │
│  • stream_chunks_sent_total{agent}                         │
│  • stream_session_duration_seconds{agent, status}          │
│  • stream_sessions_active{agent}                           │
│                                                             │
│  Coordinator Metrics:                                       │
│  • coordinator_workflows_total{strategy, status}           │
│  • coordinator_workflow_duration_seconds{strategy, status} │
│                                                             │
│  LLM Metrics:                                               │
│  • llm_calls_total{model, agent, status}                   │
│  • llm_tokens_used_total{model, agent, type}               │
│  • llm_cost_dollars_total{model, agent}                    │
│  • llm_call_duration_seconds{model, agent, status}         │
│                                                             │
│  Agent Metrics:                                             │
│  • agent_executions_total{agent, operation, status}        │
│  • agent_execution_duration_seconds{agent, operation}      │
│                                                             │
│  Cache Metrics:                                             │
│  • cache_operations_total{operation, status}               │
│  • cache_hit_rate                                          │
│                                                             │
│  Auth Metrics:                                              │
│  • auth_attempts_total{method, status}                     │
│  • rate_limit_hits_total{agent, operation}                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 نظام الأمان (Security System)

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                          │
│                                                             │
│  Layer 1: Authentication                                    │
│  ├─ JWT Token (Bearer)                                      │
│  ├─ API Key (x-api-key header)                              │
│  └─ Cookie-based (optional)                                 │
│                                                             │
│  Layer 2: Authorization (RBAC)                              │
│  ├─ User (basic access)                                     │
│  ├─ Premium (advanced features)                             │
│  ├─ Admin (full access)                                     │
│  └─ Internal (system access)                                │
│                                                             │
│  Layer 3: Rate Limiting                                     │
│  ├─ Global: 100 req/min                                     │
│  ├─ Per-Agent: 30-60 req/min                                │
│  ├─ Per-Operation: 5-20 req/min                             │
│  └─ Redis-backed (distributed)                              │
│                                                             │
│  Layer 4: Input Validation                                  │
│  ├─ Schema validation (Joi)                                 │
│  ├─ Type checking                                           │
│  └─ Sanitization                                            │
│                                                             │
│  Layer 5: Encryption                                        │
│  ├─ Data at rest (AES-256)                                  │
│  ├─ Data in transit (HTTPS/TLS)                             │
│  └─ Secure Vault (credentials)                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 💾 نظام التخزين المؤقت (Caching System)

```
┌─────────────────────────────────────────────────────────────┐
│                     Cache Hierarchy                         │
│                                                             │
│  Level 1: Memory Cache (In-Process)                        │
│  ├─ Ultra-fast (< 1ms)                                      │
│  ├─ Limited capacity                                        │
│  └─ Single instance only                                    │
│                                                             │
│  Level 2: Redis Cache (Distributed)                        │
│  ├─ Fast (1-5ms)                                            │
│  ├─ High capacity                                           │
│  ├─ Shared across instances                                 │
│  └─ Persistence available                                   │
│                                                             │
│  Cache Strategies:                                          │
│  ├─ TTL-based expiration                                    │
│  ├─ LRU eviction                                            │
│  ├─ Cache invalidation on updates                           │
│  └─ Intelligent prefetching                                 │
│                                                             │
│  Cached Data:                                               │
│  ├─ API responses                                           │
│  ├─ Agent results                                           │
│  ├─ User sessions                                           │
│  ├─ MCP tool results                                        │
│  └─ LLM completions                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📈 نظام المراقبة (Monitoring System)

```
┌─────────────────────────────────────────────────────────────┐
│                   Monitoring Stack                          │
│                                                             │
│  LangSmith (AI Performance)                                 │
│  ├─ Trace all LLM calls                                     │
│  ├─ Track costs per agent                                   │
│  ├─ Monitor token usage                                     │
│  └─ Analyze latency                                         │
│                                                             │
│  Prometheus (System Metrics)                                │
│  ├─ HTTP metrics                                            │
│  ├─ Agent metrics                                           │
│  ├─ Resource usage                                          │
│  └─ Custom counters/gauges                                  │
│                                                             │
│  Health Monitoring                                          │
│  ├─ System health checks                                    │
│  ├─ Service availability                                    │
│  ├─ Database connectivity                                   │
│  └─ External API status                                     │
│                                                             │
│  Logging                                                    │
│  ├─ Winston logger                                          │
│  ├─ Structured logs (JSON)                                  │
│  ├─ Log levels (debug, info, warn, error)                   │
│  └─ Request tracing                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 نقاط النهاية الرئيسية (Key Endpoints)

### Streaming API
```
GET  /api/stream/:agent?prompt=...
  → Stream agent responses via SSE
  
GET  /api/stream/stats/:agent?
  → Get streaming statistics
```

### Coordinator API
```
POST /api/coordinator/workflow
  → Execute named workflow
  
POST /api/coordinator/sequential
  → Execute sequential workflow
  
POST /api/coordinator/parallel
  → Execute parallel workflow
  
POST /api/coordinator/hierarchical
  → Execute hierarchical workflow
  
GET  /api/coordinator/workflows
  → List available workflows
  
GET  /api/coordinator/agents
  → List registered agents
  
GET  /api/coordinator/stats
  → Get coordinator statistics
```

### Metrics API
```
GET  /api/metrics
  → Prometheus metrics (all)
  
GET  /api/metrics/json
  → JSON snapshot
```

### Health API
```
GET  /api/health
  → System health check
```

---

## 🔄 سير العمل النموذجي (Typical Workflow)

### مثال 1: تخطيط رحلة باستخدام عدة وكلاء

```
1. User Request
   ↓
2. Authentication & Rate Limiting
   ↓
3. Coordinator Service
   ├─→ Luna (Trip Planning)
   ├─→ Karim (Budget Optimization)
   ├─→ Scout (Deal Finding)
   └─→ Travel Agent (Booking)
   ↓
4. Aggregate Results
   ↓
5. LangSmith Tracing
   ↓
6. Metrics Collection
   ↓
7. Response to User
```

### مثال 2: بث محتوى في الوقت الفعلي

```
1. User connects to SSE endpoint
   ↓
2. Stream Service initialized
   ↓
3. Gemini API streaming
   ↓
4. Chunk-by-chunk transmission
   ├─→ Progress updates
   ├─→ Metrics tracking
   └─→ LangSmith tracing
   ↓
5. Client receives real-time updates
   ↓
6. Stream completion
```

---

## 📚 الموارد الإضافية

- **تقرير الحالة الشامل**: `CODEBASE_STATUS_REPORT_AR.md`
- **خارطة الطريق الفنية**: `TECHNICAL_IMPLEMENTATION_ROADMAP_AR.md`
- **توثيق الوكلاء**: `AGENTS.md`
- **دليل البدء السريع**: `README.md`
- **توثيق API**: `API_DOCUMENTATION.md`

---

*تم إنشاء هذا التوثيق آلياً - آخر تحديث: 23 أكتوبر 2025*
