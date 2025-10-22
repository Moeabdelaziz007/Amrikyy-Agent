# AgentLangSmith Sampling & Aggregation - Usage Guide

## Overview

The refactored `AgentLangSmith` class now includes advanced sampling and aggregation capabilities to reduce trace volume while retaining critical metadata. This is particularly important for high-frequency events like streaming chunks.

## Key Features

### 1. Event Sampling
High-frequency events (chunk, token, progress) are automatically sampled based on configurable rates:
- **Chunk events**: Sample every Nth chunk (default: 10)
- **Token events**: Sample every Nth token (default: 10)  
- **Progress events**: Sample every Nth progress update (default: 5)

### 2. Event Aggregation
Unsampled events are aggregated to track:
- Total event count
- Total token count
- Sampling efficiency

### 3. PII Redaction
Automatically redacts sensitive information before logging:
- Email addresses
- Phone numbers
- SSN
- Credit card numbers
- API keys

## Configuration

Set these environment variables to customize behavior:

```bash
# Enable/disable sampling (default: true)
LANGSMITH_SAMPLING_ENABLED=true

# Sampling rates (default: 10, 10, 5)
LANGSMITH_CHUNK_SAMPLE_RATE=10
LANGSMITH_TOKEN_SAMPLE_RATE=10
LANGSMITH_PROGRESS_SAMPLE_RATE=5

# Enable/disable PII redaction (default: true)
LANGSMITH_REDACT_PII=true

# LangSmith API key (optional)
LANGSMITH_API_KEY=your_api_key_here
```

## Usage Examples

### Basic Span Tracking

```javascript
const AgentLangSmith = require('./utils/AgentLangSmith');

const langsmith = new AgentLangSmith('MyAgent');

// Start a span
const span = langsmith.startSpan({
  name: 'api.generate',
  operation: 'generate',
  model: 'gemini-2.0-flash-exp',
  params: { prompt: 'Generate a travel itinerary' },
  metadata: { userId: '12345' },
});

// ... do work ...

// Finish the span
span.finish({
  usage: {
    promptTokens: 100,
    completionTokens: 500,
    totalTokens: 600,
  },
});
```

### Tracking High-Frequency Events (with Sampling)

```javascript
// Start a span for streaming
const span = langsmith.startSpan({
  name: 'api.stream',
  operation: 'stream',
  model: 'gemini-2.0-flash-exp',
});

// Simulate streaming chunks
for (let i = 0; i < 100; i++) {
  const chunkText = generateChunk();
  
  // Add chunk event - automatically sampled
  span.addEvent('chunk', {
    chunkIndex: i,
    chunkSize: chunkText.length,
    tokenCount: Math.ceil(chunkText.length / 4),
  });
}

// Get aggregated data
const aggregatedData = span.getAggregatedData();
console.log('Aggregated chunks:', aggregatedData.chunk);
// Output: { totalCount: 100, sampledCount: 10, totalTokens: 2500, samplingRate: '10.00%' }

// Finish with aggregated data
span.finish({
  metadata: { aggregatedData },
});
```

### Using PII Redaction

```javascript
const span = langsmith.startSpan({
  name: 'api.user_query',
  operation: 'query',
});

// Add event with PII - will be automatically redacted
span.addRedactedEvent('user_input', {
  text: 'My email is john@example.com and my phone is 555-123-4567',
  userId: '12345',
});

// The logged event will show:
// { text: 'My email is [EMAIL_REDACTED] and my phone is [PHONE_REDACTED]', userId: '12345' }

span.finish();
```

### Integration with streamService

```javascript
const streamService = require('./services/streamService');

// Stream with automatic LangSmith tracking and sampling
const { cancel } = await streamService.streamWithSSE({
  req,
  res,
  prompt: 'Generate a story',
  model: geminiModel,
  agentName: 'StoryAgent',
  meta: { userId: req.user?.id },
});

// The streamService automatically:
// 1. Creates a LangSmith span
// 2. Samples chunk events (every 10th chunk logged)
// 3. Aggregates token counts for all chunks
// 4. Updates metrics
// 5. Handles client disconnect with proper cleanup
```

### Retrieving Statistics

```javascript
// Get comprehensive statistics including sampling info
const stats = langsmith.getStats();

console.log(stats);
// Output:
// {
//   agent: 'MyAgent',
//   totalCalls: 50,
//   totalTokens: { input: 5000, output: 25000 },
//   totalCost: '0.0000',
//   avgLatency: '1250ms',
//   successRate: '96.00%',
//   errors: 2,
//   sampling: {
//     enabled: true,
//     totalEvents: 5000,
//     sampledEvents: 500,
//     aggregatedEvents: 4500,
//     efficiency: '90.00%',
//     rates: { chunk: 10, token: 10, progress: 5 }
//   },
//   byModel: { ... },
//   byOperation: { ... }
// }
```

## Benefits

### Reduced Trace Volume
With a sampling rate of 10 for chunks:
- **Without sampling**: 1000 chunks = 1000 events logged
- **With sampling**: 1000 chunks = 100 events logged (90% reduction)
- **Aggregated data**: Still tracks all 1000 chunks' metadata

### Cost Savings
Fewer events logged to LangSmith = lower API costs and storage requirements.

### Maintained Observability
Critical metadata (total tokens, total chunks, error info) is preserved in aggregated form.

### Enhanced Security
PII is automatically redacted before logging, reducing compliance risks.

## Advanced Usage

### Custom Sampling Logic

You can manually control sampling by checking aggregation data:

```javascript
const span = langsmith.startSpan({ name: 'custom_operation' });

for (let i = 0; i < 1000; i++) {
  const eventData = span.addEvent('custom_event', { index: i });
  
  // Check if this event was sampled
  if (eventData.sampledCount > 0) {
    console.log(`Event ${i} was sampled and logged`);
  }
}

span.finish();
```

### Disabling Sampling for Specific Operations

To disable sampling for a specific span:

```javascript
// Temporarily disable sampling
const originalConfig = langsmith.config.sampling.enabled;
langsmith.config.sampling.enabled = false;

const span = langsmith.startSpan({ name: 'critical_operation' });
// All events will be logged

span.finish();

// Restore sampling
langsmith.config.sampling.enabled = originalConfig;
```

## API Reference

### `startSpan(options)`
Creates a new span for tracking an operation.

**Parameters:**
- `options.name` (string): Span name
- `options.operation` (string): Operation type
- `options.model` (string): Model name
- `options.params` (object): Additional parameters
- `options.metadata` (object): Additional metadata

**Returns:** Object with methods:
- `addEvent(eventName, payload)`: Add event with sampling
- `addRedactedEvent(eventName, payload)`: Add redacted event
- `finish(result)`: Finish the span
- `getAggregatedData()`: Get aggregated event data

### `addEvent(span, eventName, payload)`
Adds an event to a span with automatic sampling for high-frequency events.

**Parameters:**
- `span` (object): The span object
- `eventName` (string): Event name ('chunk', 'token', 'progress', etc.)
- `payload` (object): Event data

**Returns:** Aggregation data for the event type

### `addRedactedEvent(span, eventName, payload)`
Adds an event after redacting sensitive information.

**Parameters:** Same as `addEvent`

### `getAggregatedData(spanId)`
Retrieves aggregated event statistics for a span.

**Returns:** Object with chunk, token, and progress aggregation data

### `getStats()`
Returns comprehensive statistics including sampling information.

## Troubleshooting

### Events Not Being Sampled
Check that sampling is enabled:
```javascript
console.log(langsmith.config.sampling.enabled); // Should be true
```

### High Memory Usage
If you have many active spans, consider:
- Finishing spans promptly after operations complete
- Reducing `maxTraces` config value
- Increasing sampling rates to reduce event storage

### Missing Aggregated Data
Ensure you call `span.finish()` to capture final aggregated data:
```javascript
const span = langsmith.startSpan({ name: 'test' });
// ... add events ...
const finalData = span.finish(); // Don't forget this!
console.log(finalData.metadata.aggregatedEvents);
```

## Best Practices

1. **Always finish spans**: Call `span.finish()` to ensure data is recorded
2. **Use appropriate sampling rates**: Balance observability needs with cost
3. **Enable PII redaction**: Protect user data in production
4. **Monitor sampling efficiency**: Check `stats.sampling.efficiency` regularly
5. **Use meaningful span names**: Makes debugging easier
6. **Include relevant metadata**: Helps with filtering and analysis

## Integration with streamService

The `streamService` automatically integrates with `AgentLangSmith`:

```javascript
// In your controller
const result = await streamService.streamWithSSE({
  req,
  res,
  prompt: userPrompt,
  model: agent.model,
  agentName: 'TravelAgent',
  meta: { userId: req.user.id },
});

// Automatically handles:
// - Span creation and tracking
// - Event sampling for chunks
// - Token aggregation
// - Client disconnect cleanup
// - Metrics updates
```

## Migration Guide

### From Old AgentLangSmith

```javascript
// Old approach
const traceId = langsmith.startTrace('generate', { prompt }, 'gemini-2.0-flash-exp');
// ... do work ...
langsmith.endTrace(traceId, { usage });

// New approach (backwards compatible)
const span = langsmith.startSpan({
  name: 'generate',
  operation: 'generate',
  model: 'gemini-2.0-flash-exp',
  params: { prompt },
});
// ... do work with span.addEvent() ...
span.finish({ usage });
```

The old `startTrace`/`endTrace` methods are still supported for backwards compatibility.
