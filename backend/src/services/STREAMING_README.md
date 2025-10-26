# Streaming API Implementation

## Overview

This implementation provides a secure, resilient Server-Sent Events (SSE) API for streaming AI-generated content from Google Gemini models.

## Architecture

```
┌─────────────────┐
│   Client        │
│  (Frontend/CLI) │
└────────┬────────┘
         │ POST /api/stream
         │ + requireAuth
         │ + rateLimiter
         ▼
┌─────────────────────────────────────────────┐
│  streamController.js                        │
│  ┌────────────────────────────────────────┐ │
│  │ • Sets SSE Headers                     │ │
│  │ • Calls streamService.streamWithSSE()  │ │
│  │ • Handles req.on('close') → cancel()   │ │
│  └────────────────────────────────────────┘ │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌───────────────────────────────────────────────────────┐
│  streamService.js                                     │
│  ┌────────────────────────────────────────────────┐   │
│  │ 1. Start LangSmith trace                       │   │
│  │ 2. Increment metrics (stream started)          │   │
│  │ 3. Call Gemini generateContentStream()         │   │
│  │ 4. For each chunk:                             │   │
│  │    • res.write(`data: ${JSON.stringify()}...`) │   │
│  │    • Increment metrics (chunk sent)            │   │
│  │ 5. On completion:                              │   │
│  │    • Send final data with usage info           │   │
│  │    • End LangSmith trace                       │   │
│  │    • Record metrics (completed/failed)         │   │
│  │ 6. Return { cancel() } function                │   │
│  └────────────────────────────────────────────────┘   │
└─────┬──────────────────────┬──────────────────────────┘
      │                      │
      │                      │
      ▼                      ▼
┌─────────────────┐   ┌──────────────────┐
│ AgentLangSmith  │   │ metricsService   │
│ • startTrace    │   │ • recordStreamEvent
│ • endTrace      │   │ • increment      │
│ • Cost tracking │   │ • Prometheus     │
└─────────────────┘   └──────────────────┘
      │
      ▼
┌─────────────────────────┐
│ Google Gemini API       │
│ generateContentStream() │
└─────────────────────────┘
```

## Key Files

### `src/services/streamService.js`
Core streaming logic with SSE, LangSmith tracing, and metrics.

**Key Function:**
```javascript
async function streamWithSSE({ req, res, prompt, model, options, meta })
```

**Features:**
- ✅ LangSmith tracing (startTrace/endTrace)
- ✅ Metrics tracking (stream events, chunks, completions)
- ✅ Cancellation support
- ✅ Error handling with proper cleanup
- ✅ Usage metadata tracking (tokens, cost)

### `src/controllers/streamController.js`
HTTP request handler with SSE headers and disconnect management.

**Key Function:**
```javascript
async function startStream(req, res)
```

**Critical Features:**
- ✅ SSE headers: `Content-Type: text/event-stream`
- ✅ `res.flushHeaders()` for immediate header send
- ✅ `req.on('close')` → calls `stream.cancel()`
- ✅ Error handling for invalid requests

### `src/routes/streamRoutes.js`
Route definition for the streaming API.

**Route:**
```javascript
POST /api/stream
```

**Middleware (applied in server.js):**
- `requireAuth` - API key authentication
- `defaultLimiter` - Rate limiting (100 req/15min)

## Request/Response Format

### Request
```json
POST /api/stream
Headers:
  Content-Type: application/json
  X-API-Key: <your-api-key>

Body:
{
  "prompt": "Write a short poem about AI",
  "model": "gemini-2.0-flash-exp",  // Optional
  "options": {                       // Optional
    "temperature": 0.7,
    "topP": 0.95,
    "maxOutputTokens": 2048
  },
  "agent": "my-agent"                // Optional, for tracking
}
```

### Response (SSE Stream)
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

data: {"chunk":"In ","index":1}

data: {"chunk":"the ","index":2}

data: {"chunk":"realm ","index":3}

...

data: {"complete":true,"totalChunks":50,"fullText":"...","usage":{"promptTokens":10,"completionTokens":100,"totalTokens":110}}

```

## Metrics

The streaming API tracks the following metrics:

- `amrikyy_stream_chunks_sent_total{agent, model}` - Counter
- `amrikyy_stream_sessions_completed_total{agent, model}` - Counter
- `amrikyy_stream_sessions_failed_total{agent, model, error_type}` - Counter
- `amrikyy_stream_sessions_cancelled_total{agent, reason}` - Counter
- `amrikyy_stream_duration_seconds{agent, model, status}` - Histogram
- `amrikyy_active_streams{agent}` - Gauge

View metrics: `GET /api/metrics`

## LangSmith Tracing

Each stream creates a trace with:
- Operation: `api.stream`
- Model: e.g., `gemini-2.0-flash-exp`
- Tokens: input, output, total
- Duration: in milliseconds
- Cost: calculated from token usage
- Status: success/error

## Error Handling

### Client-side errors:
- `400` - Missing prompt
- `401` - Missing API key
- `403` - Invalid API key
- `429` - Rate limit exceeded

### Server-side errors:
- Gemini API errors are caught and sent via SSE
- Stream is properly closed on error
- Metrics are updated (failed count)
- LangSmith trace is ended with error details

## Security Features

1. **Authentication**: `requireAuth` middleware validates API keys
2. **Rate Limiting**: `defaultLimiter` prevents abuse
3. **Resource Cleanup**: Client disconnect triggers cancellation
4. **Input Validation**: Prompt is required, options are validated

## Performance

- **Latency**: First chunk arrives immediately (SSE)
- **Throughput**: Streams multiple tokens per second
- **Concurrency**: Multiple streams can run simultaneously
- **Resource Usage**: Streams are automatically cancelled on disconnect

## Testing

See `STREAMING_API_TEST_GUIDE.md` for detailed testing instructions.

Quick test:
```bash
curl -N -X POST http://localhost:5000/api/stream \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_KEY" \
  -d '{"prompt":"Test","agent":"test"}'
```

## Future Enhancements

Potential improvements:
- [ ] Support for multiple models in parallel
- [ ] Stream resumption (checkpoint/resume)
- [ ] Client-side token counting
- [ ] Stream compression
- [ ] WebSocket alternative
- [ ] Stream buffering configuration
- [ ] Custom event types (status, progress, etc.)

## Dependencies

- `@google/generative-ai` - Gemini API client
- `express` - Web framework
- `express-rate-limit` - Rate limiting
- `prom-client` - Prometheus metrics

## Environment Variables

Required:
- `GEMINI_API_KEY` - Google Gemini API key
- `INTERNAL_API_KEY` - Internal API key for authentication

Optional:
- `LANGSMITH_API_KEY` - For LangSmith export (tracing)

## Troubleshooting

### Stream never starts
- Verify `GEMINI_API_KEY` is set and valid
- Check authentication middleware is working
- Review server logs for errors

### Client disconnect doesn't cancel stream
- Verify `req.on('close')` handler is registered
- Check server logs for cancellation messages
- Ensure `stream.cancel()` is being called

### Metrics not updating
- Verify `metricsService` is imported correctly
- Check `/api/metrics` endpoint
- Review server startup logs

## License

Part of the Amrikyy Agent Platform.
© 2025 Mohamed Hossameldin Abdelaziz
