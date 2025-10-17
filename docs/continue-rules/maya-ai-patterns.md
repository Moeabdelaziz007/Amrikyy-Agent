---
description: Maya Travel Agent AI & Agent Patterns
---

# AIX v3.0 Agent Development Rules

## Agent Configuration Format

When creating AIX agents, follow this YAML structure:

```yaml
semantic_identity:
  name: agent-name
  version: 1.0.0
  role: "Clear description of agent purpose"
  
capabilities:
  skills:
    - skill_name:
        description: "What this skill does"
        input: "Expected input format"
        output: "Expected output format"
        
coordination_architecture:
  type: "swarm" # or hierarchical
  communication_protocol: "semantic_vectors"
  
tools:
  - name: tool_name
    endpoint: "/api/endpoint"
    method: POST
```

## Multi-Agent Coordination

### Event-Driven Communication
```javascript
// ✅ GOOD - Emit events for cross-agent communication
class TravelAgent extends EventEmitter {
  async bookTrip(tripData) {
    const booking = await this.createBooking(tripData);
    this.emit('booking:completed', booking); // Other agents can listen
    return booking;
  }
}

// IntelligenceHub listens
hub.on('booking:completed', this.handleBookingCompleted.bind(this));
```

### Semantic Routing
- Use semantic vectors for agent discovery
- Route requests based on capability match
- Enable autonomous agent coordination

## AI Integration Patterns

### Model Switching
```javascript
// Use appropriate model for task
const response = await modelSwitcher.route({
  task: 'destination_search',
  complexity: 'high',
  context: userPreferences
});
// Auto-selects: Gemini for search, Claude for reasoning, etc.
```

### Error Recovery
- Always have fallback model configured
- Implement retry logic with exponential backoff
- Log AI failures for analysis
