# Streaming API Testing Guide

## Overview
This guide provides instructions for manually testing the streaming API implementation.

## Prerequisites
- Backend server running (`npm run dev` from backend directory)
- Valid `GEMINI_API_KEY` set in environment
- Valid `INTERNAL_API_KEY` set in environment

## Test 1: Basic Streaming

### Using curl (with SSE support)
```bash
curl -N -X POST http://localhost:5000/api/stream \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_INTERNAL_API_KEY" \
  -d '{
    "prompt": "Write a short poem about AI",
    "model": "gemini-2.0-flash-exp",
    "agent": "test"
  }'
```

Expected behavior:
- Server-sent events stream with chunks of generated text
- Each chunk in format: `data: {"chunk":"..."}`
- Final message with completion: `data: {"complete":true,...}`

## Test 2: Streaming with Custom Options

```bash
curl -N -X POST http://localhost:5000/api/stream \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_INTERNAL_API_KEY" \
  -d '{
    "prompt": "Explain quantum computing in simple terms",
    "model": "gemini-2.0-flash-exp",
    "options": {
      "temperature": 0.5,
      "maxOutputTokens": 500
    },
    "agent": "quantum-explainer"
  }'
```

## Test 3: Client Disconnect (Cancellation)

1. Start a stream request
2. Cancel it mid-stream (Ctrl+C)
3. Check server logs for cancellation message

Expected log:
```
[StreamController] Client disconnected, cancelling stream for agent <name>
[StreamService] Cancellation requested for agent <name>
```

## Test 4: Error Handling

### Missing Prompt
```bash
curl -X POST http://localhost:5000/api/stream \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_INTERNAL_API_KEY" \
  -d '{
    "model": "gemini-2.0-flash-exp"
  }'
```

Expected response:
```json
{"error":"Prompt is required"}
```

### Missing API Key
```bash
curl -X POST http://localhost:5000/api/stream \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Test"
  }'
```

Expected response:
```json
{"error":"Unauthorized: API key is missing."}
```

## Test 5: Metrics Verification

After running several streams, check metrics:
```bash
curl http://localhost:5000/api/metrics
```

Look for:
- `amrikyy_stream_chunks_sent_total` - should be > 0
- `amrikyy_stream_sessions_completed_total` - count of successful streams
- `amrikyy_active_streams` - should be 0 when no streams active

## Test 6: Using a Browser (EventSource)

Create an HTML file:
```html
<!DOCTYPE html>
<html>
<head>
  <title>Stream API Test</title>
</head>
<body>
  <div id="output"></div>
  <script>
    const API_KEY = 'YOUR_INTERNAL_API_KEY';
    
    // Note: EventSource doesn't support POST, so this won't work directly
    // For browser testing, you'll need to use fetch with ReadableStream
    
    async function testStream() {
      const response = await fetch('http://localhost:5000/api/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
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
        const lines = chunk.split('\\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.substring(6));
            console.log('Received:', data);
            document.getElementById('output').innerHTML += data.chunk || '';
          }
        }
      }
    }
    
    testStream();
  </script>
</body>
</html>
```

## Monitoring During Tests

Watch the logs:
```bash
tail -f backend/logs/*.log
```

Or check metrics in real-time:
```bash
watch -n 1 'curl -s http://localhost:5000/api/metrics | grep amrikyy_stream'
```

## Success Criteria

✅ Streams start immediately (SSE headers sent)
✅ Chunks arrive progressively, not all at once
✅ Client disconnect stops the stream
✅ Metrics are updated correctly
✅ LangSmith tracing is logged (check logs)
✅ Error responses are returned for invalid requests
✅ Rate limiting works (hit endpoint >100 times in 15 min)

## Troubleshooting

### Stream never starts
- Check GEMINI_API_KEY is valid
- Verify authentication middleware is working
- Check server logs for errors

### Stream hangs
- Check network/proxy settings
- Verify SSE headers are being sent
- Check if Gemini API is accessible

### No metrics
- Verify metricsService is imported correctly
- Check /api/metrics endpoint is accessible
- Review server startup logs for metrics initialization
