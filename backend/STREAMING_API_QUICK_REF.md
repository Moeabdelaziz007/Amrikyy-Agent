# Streaming API Quick Reference

## Endpoint
```
POST /api/stream
```

## Headers
```
Content-Type: application/json
X-API-Key: <your-internal-api-key>
```

## Request Body
```json
{
  "prompt": "Your prompt here",              // Required
  "model": "gemini-2.0-flash-exp",          // Optional (default shown)
  "options": {                               // Optional
    "temperature": 0.7,
    "topP": 0.95,
    "topK": 40,
    "maxOutputTokens": 2048
  },
  "agent": "my-agent"                        // Optional (for metrics tracking)
}
```

## Response Format (SSE)
```
Content-Type: text/event-stream

data: {"chunk":"text","index":1}

data: {"chunk":"more text","index":2}

...

data: {"complete":true,"totalChunks":N,"fullText":"...","usage":{...}}
```

## Example Usage

### cURL
```bash
curl -N -X POST http://localhost:5000/api/stream \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_KEY" \
  -d '{
    "prompt": "Write a haiku about AI",
    "agent": "poet"
  }'
```

### JavaScript (Fetch API)
```javascript
const response = await fetch('http://localhost:5000/api/stream', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_KEY'
  },
  body: JSON.stringify({
    prompt: 'Tell me a story',
    agent: 'storyteller'
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const {done, value} = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.substring(6));
      if (data.chunk) {
        console.log(data.chunk);
      }
    }
  }
}
```

### Python
```python
import requests
import json

response = requests.post(
    'http://localhost:5000/api/stream',
    headers={
        'Content-Type': 'application/json',
        'X-API-Key': 'YOUR_KEY'
    },
    json={
        'prompt': 'Explain quantum computing',
        'agent': 'explainer'
    },
    stream=True
)

for line in response.iter_lines():
    if line.startswith(b'data: '):
        data = json.loads(line[6:])
        if 'chunk' in data:
            print(data['chunk'], end='', flush=True)
```

## Error Responses

### 400 Bad Request
```json
{"error": "Prompt is required"}
```

### 401 Unauthorized
```json
{"error": "Unauthorized: API key is missing."}
```

### 403 Forbidden
```json
{"error": "Forbidden: Invalid API key."}
```

### 429 Too Many Requests
```json
{
  "error": "Too Many Requests",
  "message": "You have exceeded the request limit. Please try again later."
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to start stream",
  "message": "Error details..."
}
```

## SSE Event Format

### Chunk Event
```
data: {
  "chunk": "piece of text",
  "index": 1
}
```

### Completion Event
```
data: {
  "complete": true,
  "totalChunks": 50,
  "fullText": "complete generated text...",
  "usage": {
    "promptTokens": 10,
    "completionTokens": 100,
    "totalTokens": 110
  }
}
```

### Error Event
```
data: {
  "error": "Error message",
  "recoverable": false
}
```

## Metrics to Monitor

Check `/api/metrics` for:
- `amrikyy_stream_chunks_sent_total`
- `amrikyy_stream_sessions_completed_total`
- `amrikyy_stream_sessions_failed_total`
- `amrikyy_stream_sessions_cancelled_total`
- `amrikyy_active_streams`
- `amrikyy_stream_duration_seconds`

## Common Issues

**Stream never starts**
- Verify GEMINI_API_KEY is set
- Check API key is valid
- Review server logs

**Client disconnect doesn't stop stream**
- Verify req.on('close') is working
- Check server logs for cancellation messages

**Rate limit hit**
- Default: 100 requests per 15 minutes
- Admin users: 1000 requests per 15 minutes

## Files Reference

- Service: `backend/src/services/streamService.js`
- Controller: `backend/src/controllers/streamController.js`
- Routes: `backend/src/routes/streamRoutes.js`
- Documentation: `backend/src/services/STREAMING_README.md`
- Testing Guide: `backend/STREAMING_API_TEST_GUIDE.md`
