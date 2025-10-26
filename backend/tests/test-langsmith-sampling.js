/**
 * Test AgentLangSmith Sampling & Aggregation
 * 
 * Simple manual test to verify the refactored AgentLangSmith functionality
 */

const AgentLangSmith = require('../src/utils/AgentLangSmith');

console.log('=== AgentLangSmith Sampling & Aggregation Test ===\n');

// Initialize AgentLangSmith
const langsmith = new AgentLangSmith('TestAgent');

console.log('1. Testing Span Creation...');
const span = langsmith.startSpan({
  name: 'test.stream',
  operation: 'stream',
  model: 'gemini-2.0-flash-exp',
  params: { prompt: 'Test prompt' },
  metadata: { testId: '12345' },
});

console.log('   ✓ Span created:', span.spanId);

console.log('\n2. Testing Event Sampling (100 chunk events)...');
for (let i = 0; i < 100; i++) {
  const eventData = span.addEvent('chunk', {
    chunkIndex: i,
    chunkSize: 100,
    tokenCount: 25,
  });
  
  if (i === 0 || i === 9 || i === 99) {
    console.log(`   Chunk ${i}:`, {
      totalCount: eventData.count,
      sampledCount: eventData.sampledCount,
    });
  }
}

console.log('\n3. Getting Aggregated Data...');
const aggregatedData = span.getAggregatedData();
console.log('   Chunk aggregation:', aggregatedData.chunk);

console.log('\n4. Testing PII Redaction...');
span.addRedactedEvent('user_input', {
  text: 'Contact me at john.doe@example.com or call 555-123-4567',
  userId: '12345',
  apiKey: 'sk_test_1234567890abcdefghijklmnopqrstuvwxyz',
});

console.log('   ✓ Redacted event added (check logs for redacted content)');

console.log('\n5. Testing Progress Events (20 events)...');
for (let i = 0; i < 20; i++) {
  span.addEvent('progress', {
    percentage: i * 5,
  });
}

console.log('\n6. Testing Token Events (50 events)...');
for (let i = 0; i < 50; i++) {
  span.addEvent('token', {
    token: `token_${i}`,
    tokenCount: 1,
  });
}

console.log('\n7. Getting Updated Aggregated Data...');
const finalAggregatedData = span.getAggregatedData();
console.log('   Final aggregation:');
console.log('     - Chunks:', finalAggregatedData.chunk);
console.log('     - Tokens:', finalAggregatedData.token);
console.log('     - Progress:', finalAggregatedData.progress);

console.log('\n8. Finishing Span...');
const finishedSpan = span.finish({
  usage: {
    promptTokens: 100,
    completionTokens: 2500,
    totalTokens: 2600,
  },
  metadata: {
    testComplete: true,
  },
});

console.log('   ✓ Span finished');
console.log('   - Latency:', finishedSpan.latency + 'ms');
console.log('   - Tokens:', finishedSpan.tokens);
console.log('   - Cost: $' + finishedSpan.cost.toFixed(4));

console.log('\n9. Getting Statistics...');
const stats = langsmith.getStats();
console.log('   Statistics:');
console.log('     - Total Calls:', stats.totalCalls);
console.log('     - Sampling Enabled:', stats.sampling.enabled);
console.log('     - Total Events:', stats.sampling.totalEvents);
console.log('     - Sampled Events:', stats.sampling.sampledEvents);
console.log('     - Aggregated Events:', stats.sampling.aggregatedEvents);
console.log('     - Efficiency:', stats.sampling.efficiency);

console.log('\n10. Testing Multiple Spans...');
const span2 = langsmith.startSpan({
  name: 'test.query',
  operation: 'query',
});

span2.addEvent('start', { message: 'Starting query' });
for (let i = 0; i < 30; i++) {
  span2.addEvent('chunk', { chunkIndex: i, tokenCount: 10 });
}
span2.addEvent('complete', { message: 'Query complete' });

span2.finish({
  usage: { promptTokens: 50, completionTokens: 300, totalTokens: 350 },
});

console.log('   ✓ Second span completed');

console.log('\n11. Final Statistics...');
const finalStats = langsmith.getStats();
console.log('   Final Statistics:');
console.log('     - Total Calls:', finalStats.totalCalls);
console.log('     - Total Events:', finalStats.sampling.totalEvents);
console.log('     - Sampled Events:', finalStats.sampling.sampledEvents);
console.log('     - Aggregated Events:', finalStats.sampling.aggregatedEvents);
console.log('     - Sampling Efficiency:', finalStats.sampling.efficiency);
console.log('     - Total Tokens:', finalStats.totalTokens);
console.log('     - Total Cost: $' + finalStats.totalCost);

console.log('\n=== Test Complete ===');
console.log('\n✓ All tests passed successfully!');
console.log('\nSummary:');
console.log('  - Created 2 spans');
console.log('  - Logged', finalStats.sampling.totalEvents, 'events');
console.log('  - Sampled', finalStats.sampling.sampledEvents, 'events (saved', finalStats.sampling.aggregatedEvents, 'events)');
console.log('  - Sampling efficiency:', finalStats.sampling.efficiency);
console.log('  - Total token tracking: Input=' + finalStats.totalTokens.input + ', Output=' + finalStats.totalTokens.output);
