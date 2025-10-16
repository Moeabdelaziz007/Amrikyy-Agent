# 🧠 Agent Cortex Memory System

## Overview

The Agent Cortex is the long-term memory system for the Amrikyy Travel Agent squadron. It transforms the agents from reactive tools into proactive, learning systems that remember, learn, and improve over time.

## 🎯 Key Benefits

### Efficiency & Cost Reduction
- **Reduced API Calls**: Why should Karim call Skyscanner API for "flights to Tokyo in October" a dozen times? The first time he does it, results are stored in memory.
- **Faster Response Times**: Agents check memory first before making expensive API calls.
- **Smart Caching**: Frequently accessed data is readily available.

### Deep Personalization
- **User Preferences**: When a user loves "boutique hotels" Zara found, that preference is stored and used in future trips.
- **Travel History**: Luna remembers past trip patterns and suggests similar experiences.
- **Budget Patterns**: Karim learns user spending habits and optimizes accordingly.

### Street Smarts Storage
- **Unstructured Knowledge**: Zara might discover that a popular museum has a "secret" free admission day - this invaluable insight is captured and stored.
- **Local Insights**: Cultural tips, hidden gems, and local knowledge accumulate over time.
- **Verified Facts**: Research findings are stored and reused, reducing redundant verification.

## 🏗️ Architecture

### Core Components

#### 1. MemoryManager Service
- **Location**: `backend/src/agents/MemoryManager.js`
- **Purpose**: Central service managing all memory operations
- **Features**:
  - ChromaDB integration for vector storage
  - Intelligent chunking for large memories
  - Rich metadata schema
  - Query optimization and ranking
  - Statistics and monitoring

#### 2. Enhanced Cursor Manager Integration
- **Location**: `backend/src/agents/EnhancedCursorManagerAgent.js`
- **Purpose**: Orchestrates memory operations across all agents
- **Features**:
  - `memorizeTrip()` - Stores complete trip data
  - `queryMemory()` - Retrieves relevant memories
  - Memory-enhanced request processing
  - Automatic memory cleanup

#### 3. Agent Memory Integration
- **Luna Trip Architect**: Queries memory for destination insights and user preferences
- **Karim Budget Optimizer**: Uses historical pricing and budget data
- **Zara Research Specialist**: Leverages verified facts and research findings

### Memory Collections

The system organizes memories into specialized collections:

- **`trips`**: Complete trip itineraries and planning data
- **`destinations`**: Destination research and insights
- **`userPreferences`**: User preferences and personalization data
- **`researchData`**: Research data from Zara and other agents
- **`culturalInsights`**: Cultural insights and local knowledge
- **`budgetData`**: Budget analysis and pricing data
- **`agentInsights`**: Agent-generated insights and learnings

## 🔄 Memory Workflow

### Write Path (Memorization)

1. **Trip Completion**: When squadOS successfully completes a trip plan
2. **Memory Extraction**: Enhanced Cursor Manager extracts memories from trip data
3. **Chunking**: Large memories are intelligently chunked for better storage
4. **Storage**: Memories are stored in ChromaDB with rich metadata
5. **Indexing**: Vector embeddings enable semantic search

### Read Path (Recall)

1. **Agent Request**: Agent needs information for current task
2. **Memory Query**: Agent queries memory for relevant knowledge
3. **Context Enhancement**: Memory results enhance agent's context
4. **Informed Decision**: Agent makes decisions based on memory + fresh data
5. **Learning**: New insights are stored for future use

## 📊 Memory Schema

### Memory Structure
```javascript
{
  id: "unique_memory_id",
  type: "trip|destination|user_preference|research|cultural|budget|agent_insight",
  content: "The actual memory content as text",
  metadata: {
    agent_source: "luna_trip_architect|karim_budget_optimizer|zara_research_specialist",
    timestamp: "2024-01-01T00:00:00.000Z",
    destination: "Tokyo",
    user_id: "user_123",
    trip_id: "trip_456",
    memory_type: "trip_overview|daily_itinerary|destination_research|cultural_insights|budget_analysis|user_preferences",
    version: "1.0.0"
  }
}
```

### Query Structure
```javascript
{
  text: "search query text",
  type: "all|trip|destination|user_preference|research|cultural|budget|agent_insight",
  limit: 5,
  filters: {
    destination: "Tokyo",
    user_id: "user_123",
    agent_source: "luna_trip_architect"
  }
}
```

## 🚀 Usage Examples

### Basic Memory Operations

```javascript
// Initialize Enhanced Cursor Manager with memory
const cursorManager = new EnhancedCursorManagerAgent({
  memoryEnabled: true
});
await cursorManager.initialize();

// Memorize a trip
const tripData = {
  id: 'trip_001',
  destination: 'Tokyo',
  duration: 7,
  budget: 'medium',
  userId: 'user_123',
  itinerary: { /* trip details */ },
  destinationData: { /* research data */ },
  culturalInsights: { /* cultural tips */ }
};

const result = await cursorManager.memorizeTrip(tripData);
console.log(`Memorized ${result.memoriesCreated} memory chunks`);

// Query memory
const queryResult = await cursorManager.queryMemory('Tokyo cultural trip', {
  type: 'all',
  limit: 5,
  destination: 'Tokyo',
  user_id: 'user_123'
});

console.log(`Found ${queryResult.results.length} relevant memories`);
```

### Agent Memory Integration

```javascript
// Luna queries memory for destination context
const luna = new LunaTripArchitect(cursorManager);
const memoryContext = await luna.queryMemoryForContext({
  destination: 'Tokyo',
  duration: 7,
  userId: 'user_123'
});

if (memoryContext.hasMemory) {
  console.log(`Found ${memoryContext.destinationMemories.length} destination memories`);
  // Luna uses memory to enhance trip planning
}

// Karim queries memory for budget context
const karim = new KarimBudgetOptimizer(cursorManager);
const budgetContext = await karim.queryMemoryForBudgetContext({
  destination: 'Tokyo',
  budgetLevel: 'medium',
  userId: 'user_123'
});

// Zara queries memory for research context
const zara = new ZaraResearchSpecialist(cursorManager);
const researchContext = await zara.queryMemoryForResearchContext({
  itinerary: { destination: 'Tokyo' },
  userId: 'user_123'
});
```

## 🧪 Testing

### Run Tests
```bash
# Run memory system tests
npm test -- MemoryManager.test.js

# Run demonstration
node backend/examples/memory-system-demo.js
```

### Test Coverage
- MemoryManager core functionality
- Enhanced Cursor Manager integration
- Agent memory integration
- Performance and scalability
- Error handling and edge cases
- End-to-end workflows

## 📈 Performance Metrics

### Memory Statistics
- **Total Memories**: Count of all stored memories
- **Memories by Type**: Breakdown by memory type
- **Memories by Agent**: Which agents contributed most
- **Memories by Destination**: Popular destinations
- **Query Performance**: Average query time and success rate

### Optimization Features
- **Intelligent Chunking**: Large memories are split for better retrieval
- **Vector Embeddings**: Semantic search capabilities
- **Query Caching**: Frequently accessed memories are cached
- **Automatic Cleanup**: Old memories are cleaned up based on retention policy

## 🔧 Configuration

### Environment Variables
```bash
# ChromaDB Configuration
CHROMA_HOST=localhost
CHROMA_PORT=8000

# Memory System Configuration
MEMORY_ENABLED=true
MEMORY_RETENTION_DAYS=365
MEMORY_MAX_CHUNK_SIZE=1000
MEMORY_MAX_RESULTS=10
```

### Memory Manager Configuration
```javascript
const memoryManager = new MemoryManager({
  chromaHost: 'localhost',
  chromaPort: 8000,
  collectionName: 'amrikyy_knowledge_base',
  embeddingModel: 'all-MiniLM-L6-v2',
  maxChunkSize: 1000,
  maxResults: 10,
  memoryRetentionDays: 365
});
```

## 🎯 Future Enhancements

### Planned Features
- **Semantic Search**: Advanced vector similarity search
- **Memory Clustering**: Group related memories for better organization
- **Predictive Memory**: Anticipate user needs based on patterns
- **Cross-Agent Learning**: Agents learn from each other's experiences
- **Memory Visualization**: Dashboard for memory system insights

### Integration Opportunities
- **Real-time Updates**: Live memory updates from external sources
- **Multi-modal Memory**: Store images, videos, and documents
- **Federated Learning**: Share memories across multiple instances
- **Memory Compression**: Advanced compression for large-scale deployment

## 🛠️ Troubleshooting

### Common Issues

#### Memory Manager Not Initializing
```bash
# Check ChromaDB is running
docker ps | grep chroma

# Check environment variables
echo $CHROMA_HOST
echo $CHROMA_PORT
```

#### Slow Query Performance
- Check memory statistics for large collections
- Consider increasing `maxResults` limit
- Review chunking strategy for large memories

#### Memory Not Found
- Verify memory was stored successfully
- Check query parameters and filters
- Review memory type and metadata

### Debug Mode
```javascript
// Enable debug logging
const memoryManager = new MemoryManager({
  debug: true,
  logLevel: 'debug'
});
```

## 📚 Additional Resources

- **ChromaDB Documentation**: https://docs.trychroma.com/
- **Vector Embeddings Guide**: Understanding semantic search
- **Memory System Architecture**: Detailed technical documentation
- **Agent Integration Guide**: How to add memory to new agents

---

## 🎉 Conclusion

The Agent Cortex Memory System transforms the Amrikyy Travel Agent squadron from reactive tools into intelligent, learning systems. By remembering past experiences, the agents become more efficient, personalized, and valuable over time.

**Key Achievements:**
- ✅ Persistent long-term memory using ChromaDB
- ✅ Intelligent memory chunking and retrieval
- ✅ Agent-specific memory integration
- ✅ Rich metadata schema for precise queries
- ✅ Comprehensive testing and documentation
- ✅ Performance optimization and monitoring

The system is now ready to learn, remember, and continuously improve the travel planning experience for every user.
