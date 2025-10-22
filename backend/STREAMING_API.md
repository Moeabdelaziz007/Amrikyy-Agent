# Streaming API Documentation

## Overview

The Streaming API provides real-time Server-Sent Events (SSE) streaming for AI agent responses. It includes built-in LangSmith tracing, Prometheus metrics tracking, and automatic resource cleanup on client disconnect.

## Architecture

```
Request → Controller → Service → AgentStreaming → SSE Response
                ↓           ↓
          Validation   LangSmith + Metrics
```

### Components

- **streamController.js**: HTTP request/response handling and validation
- **streamService.js**: Business logic with LangSmith tracing and metrics
- **AgentStreaming**: Low-level SSE streaming utility
- **metricsService**: Prometheus metrics tracking
- **LangSmith**: Distributed tracing for debugging

## API Endpoints

All endpoints require authentication via JWT or API key (configured in app.js).

### 1. Stream Blog Post

**Endpoint:** `POST /api/stream/blog`

**Request Body:**
```json
{
  "topic": "AI in Travel Industry",
  "tone": "professional",     // optional: professional, casual, technical
  "length": "medium"           // optional: short, medium, long
}
```

**SSE Events:**
- `connected`: Initial connection established
- `status`: Status updates (e.g., "generating")
- `progress`: Progress percentage (0-100)
- `chunk`: Text chunks as they're generated
- `complete`: Generation complete with metadata
- `error`: Error occurred
- `close`: Stream closed

**Example Client (JavaScript):**
```javascript
const eventSource = new EventSource('/api/stream/blog', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    topic: 'AI in Travel Industry',
    tone: 'professional',
    length: 'medium'
  })
});

eventSource.addEventListener('chunk', (event) => {
  const data = JSON.parse(event.data);
  console.log('Chunk:', data.chunk);
});

eventSource.addEventListener('complete', (event) => {
  const data = JSON.parse(event.data);
  console.log('Complete!', data);
  eventSource.close();
});

eventSource.addEventListener('error', (event) => {
  const data = JSON.parse(event.data);
  console.error('Error:', data.error);
  eventSource.close();
});
```

### 2. Stream Itinerary

**Endpoint:** `POST /api/stream/itinerary`

**Request Body:**
```json
{
  "destination": "Paris",
  "days": 7,
  "budget": 2000
}
```

**Events:** Same as blog post, plus:
- `result`: Final itinerary object

### 3. Stream Recommendations

**Endpoint:** `POST /api/stream/recommendations`

**Request Body:**
```json
{
  "interests": "beaches, culture, food",
  "budget": 3000
}
```

**Events:**
- `partial`: Partial JSON results as they're generated
- `complete`: Final recommendations array

### 4. Stream Social Media Posts

**Endpoint:** `POST /api/stream/social`

**Request Body:**
```json
{
  "topic": "Summer Travel Tips",
  "platforms": ["twitter", "instagram", "facebook"]
  // or platforms: "twitter,instagram,facebook"
}
```

**Events:**
- `post`: Individual social media post (includes platform, content, index)
- `complete`: All posts generated

### 5. Get Statistics

**Endpoint:** `GET /api/stream/stats/:agent`

**Parameters:**
- `agent`: Either `travel` or `content`

**Response:**
```json
{
  "success": true,
  "agent": "travel",
  "stats": {
    "totalStreams": 156,
    "activeStreams": 3,
    "completedStreams": 145,
    "failedStreams": 8,
    "avgDuration": "2350ms",
    "successRate": "92.95%"
  },
  "activeStreams": ["stream-id-1", "stream-id-2", "stream-id-3"]
}
```

### 6. Cleanup Streams

**Endpoint:** `POST /api/stream/cleanup`

**Response:**
```json
{
  "success": true,
  "cleaned": {
    "travel": 2,
    "content": 1
  },
  "total": 3
}
```

## LangSmith Tracing

All streaming operations are automatically traced with LangSmith for debugging and monitoring:

```javascript
// Each operation is wrapped with traceable
streamBlogPost = traceable(
  async function(streamId, params) { ... },
  {
    name: 'stream_blog_post',
    tags: ['streaming', 'content', 'blog'],
    metadata: { service: 'StreamService' }
  }
);
```

**View traces in LangSmith:**
1. Set `LANGCHAIN_API_KEY` and `LANGCHAIN_PROJECT` in `.env`
2. Visit https://smith.langchain.com
3. Navigate to your project
4. Filter by tags: `streaming`, `content`, `travel`

## Prometheus Metrics

Metrics are automatically tracked and exposed at `/api/metrics`:

### Stream Metrics
- `amrikyy_stream_chunks_sent_total`: Total chunks sent
- `amrikyy_stream_sessions_completed_total`: Completed sessions
- `amrikyy_stream_sessions_failed_total`: Failed sessions
- `amrikyy_stream_sessions_cancelled_total`: Cancelled sessions
- `amrikyy_stream_duration_seconds`: Session duration histogram
- `amrikyy_active_streams`: Current active streams gauge

### LLM Metrics
- `amrikyy_llm_calls_total`: Total LLM API calls
- `amrikyy_llm_call_duration_seconds`: LLM call duration
- `amrikyy_llm_tokens_used_total`: Total tokens used (input/output)
- `amrikyy_llm_cost_usd_total`: Estimated cost in USD

**Query examples (Prometheus/Grafana):**
```promql
# Active streams per agent
amrikyy_active_streams{agent="travel"}

# Success rate
rate(amrikyy_stream_sessions_completed_total[5m]) 
  / rate(amrikyy_stream_sessions_total[5m])

# Average stream duration
rate(amrikyy_stream_duration_seconds_sum[5m])
  / rate(amrikyy_stream_duration_seconds_count[5m])

# Total LLM cost per hour
increase(amrikyy_llm_cost_usd_total[1h])
```

## Resource Cleanup

The service automatically handles resource cleanup in several scenarios:

### Client Disconnect
```javascript
// Automatically triggered when client closes connection
res.on('close', () => {
  streamService.handleClientDisconnect(streamId, agentType);
});
```

**What happens:**
1. Stream removed from active streams map
2. Metrics updated (cancelled event)
3. Duration logged
4. Resources freed

### Automatic Cleanup
Inactive streams are automatically cleaned up every 5 minutes:

```javascript
// In agentStreaming.js
setInterval(() => {
  streamService.cleanupAllStreams();
}, 300000); // 5 minutes
```

### Manual Cleanup
```bash
curl -X POST /api/stream/cleanup \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Error Handling

### Validation Errors (400)
```json
{
  "success": false,
  "error": "Topic is required and must be a non-empty string"
}
```

### Server Errors (500)
```json
{
  "success": false,
  "error": "Internal server error",
  "requestId": "req_1234567890"
}
```

### Stream Errors (via SSE)
```javascript
event: error
data: {
  "error": "Generation failed",
  "recoverable": false,
  "timestamp": 1698765432100
}
```

## Rate Limiting

Streaming endpoints use dynamic rate limiting based on user role:

- **User**: 10 requests/minute
- **Premium**: 30 requests/minute  
- **Admin**: 100 requests/minute

Rate limit exceeded response:
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "retryAfter": 30,
  "requestId": "req_1234567890"
}
```

## Testing

### Unit Tests
```bash
npm test -- tests/unit/streamService.test.js
```

### Integration Tests
```bash
npm test -- tests/integration/streamController.test.js
```

### Manual Testing with curl

**Blog post streaming:**
```bash
curl -X POST http://localhost:3001/api/stream/blog \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "topic": "AI in Travel",
    "tone": "professional",
    "length": "medium"
  }'
```

**Get statistics:**
```bash
curl http://localhost:3001/api/stream/stats/travel \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Best Practices

1. **Always close streams**: Don't leave SSE connections open indefinitely
2. **Handle errors**: Listen to error events and close on error
3. **Use reconnection logic**: Implement exponential backoff for retries
4. **Monitor metrics**: Track stream duration and success rates
5. **Set timeouts**: Don't wait forever for completions
6. **Validate input**: Check all required fields before calling
7. **Use LangSmith**: Debug issues with distributed tracing

## Example: Complete Client Implementation

```javascript
class StreamClient {
  constructor(baseUrl, token) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  async streamBlog(topic, onChunk, onComplete, onError) {
    const response = await fetch(`${this.baseUrl}/api/stream/blog`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify({ topic })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          const eventMatch = line.match(/event: (\w+)/);
          const event = eventMatch ? eventMatch[1] : 'message';

          switch (event) {
            case 'chunk':
              onChunk(data.chunk);
              break;
            case 'complete':
              onComplete(data);
              return;
            case 'error':
              onError(data.error);
              return;
          }
        }
      }
    }
  }
}

// Usage
const client = new StreamClient('http://localhost:3001', 'YOUR_TOKEN');

let fullText = '';
await client.streamBlog(
  'AI in Travel',
  (chunk) => {
    fullText += chunk;
    console.log('Chunk received:', chunk);
  },
  (result) => {
    console.log('Complete!', result);
    console.log('Full text:', fullText);
  },
  (error) => {
    console.error('Error:', error);
  }
);
```

## Troubleshooting

### Streams not starting
- Check authentication token
- Verify request body format
- Check rate limits

### Streams disconnecting early
- Monitor network connectivity
- Check server logs for errors
- Review LangSmith traces

### High latency
- Check LLM API response times in metrics
- Monitor `amrikyy_llm_call_duration_seconds`
- Review resource usage

### Memory leaks
- Ensure streams are being cleaned up
- Check `amrikyy_active_streams` metric
- Run manual cleanup if needed

## Support

For issues or questions:
1. Check LangSmith traces for detailed error information
2. Review Prometheus metrics for performance insights
3. Check application logs in `logs/` directory
4. Open an issue on GitHub with trace ID and request ID
