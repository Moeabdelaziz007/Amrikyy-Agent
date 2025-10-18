# 🌌 Quantum Reward Engine Guide

## Overview

The Quantum Reward Engine is an advanced multi-agent reinforcement learning system for Amrikyy Travel Agent. It tracks agent performance, distributes rewards, manages quantum entanglements between agents, and optimizes collaborative behavior.

## Features

- **8 Specialized AI Agents** - Luna, Karim, Layla, Amira, Tariq, Zara, Kody, Scout
- **Quantum State Management** - Coherence, entanglement, wave functions
- **Reward Distribution** - Immediate, long-term, and collaborative rewards
- **Adaptive Learning** - Dynamic learning rate and exploration optimization
- **Experience Replay** - Memory buffer for batch learning
- **Database Integration** - Persistent storage in Supabase

## Architecture

### Agent System

Each agent has:
- **ID**: Unique identifier (luna, karim, etc.)
- **Name**: Display name with role
- **Role**: Specialized function (TRIP_PLANNING, BUDGET_ANALYSIS, etc.)
- **Capabilities**: List of skills
- **Energy**: Performance level (0-100)
- **Rewards**: Accumulated points
- **Coherence**: Quantum state quality (0-100)
- **Entanglements**: Connections with other agents

### Quantum State

Global system state includes:
- **Global Coherence**: Average coherence across all agents
- **Entanglement Strength**: Average connection strength
- **Wave Function**: System stability measure
- **Superposition Active**: Whether system is in optimal state

## API Endpoints

### 1. Get System Metrics

**GET** `/api/rewards/metrics`

Returns comprehensive system metrics including all agents, quantum state, and learning parameters.

**Response:**
```json
{
  "success": true,
  "data": {
    "agents": [
      {
        "id": "luna",
        "name": "Luna - Trip Architect",
        "energy": 100,
        "rewards": 0,
        "coherence": 85,
        "entanglementCount": 0
      }
    ],
    "quantum": {
      "globalCoherence": 88,
      "entanglementStrength": 0.75,
      "waveFunction": 1.0,
      "superpositionActive": true
    },
    "learning": {
      "learningRate": 0.1,
      "explorationRate": 0.2,
      "experienceBufferSize": 0
    },
    "totalRewards": 0,
    "avgEnergy": 100,
    "avgCoherence": 88
  }
}
```

### 2. Process Interaction

**POST** `/api/rewards/process`

Process an agent interaction and distribute rewards.

**Request Body:**
```json
{
  "agentId": "luna",
  "action": {
    "type": "create_itinerary",
    "destination": "Paris",
    "duration": 7
  },
  "result": {
    "accuracy": 0.95,
    "responseTime": 1500,
    "userRating": 5,
    "tokensUsed": 800
  },
  "context": {
    "userId": "user123",
    "sessionId": "session456"
  },
  "collaboratingAgents": ["karim", "layla"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "agentId": "luna",
    "reward": 58,
    "agentState": {
      "id": "luna",
      "name": "Luna - Trip Architect",
      "energy": 105,
      "rewards": 58,
      "coherence": 87
    },
    "quantumState": {
      "globalCoherence": 89,
      "entanglementStrength": 0.78,
      "waveFunction": 0.98,
      "superpositionActive": true
    }
  }
}
```

### 3. Get Agent Recommendations

**POST** `/api/rewards/recommend`

Get recommended agents for a specific task.

**Request Body:**
```json
{
  "taskType": "trip_planning",
  "taskContext": {
    "requiredCapabilities": ["itinerary_creation", "route_optimization"],
    "complexity": "high",
    "urgency": "medium"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "luna",
      "name": "Luna - Trip Architect",
      "role": "TRIP_PLANNING",
      "energy": 105,
      "coherence": 87
    },
    {
      "id": "scout",
      "name": "Scout - Proactive Monitor",
      "role": "MONITORING_ALERTS",
      "energy": 100,
      "coherence": 87
    },
    {
      "id": "layla",
      "name": "Layla - Cultural Guide",
      "role": "CULTURAL_INSIGHTS",
      "energy": 100,
      "coherence": 88
    }
  ]
}
```

### 4. Get Specific Agent

**GET** `/api/rewards/agent/:agentId`

Get detailed state of a specific agent.

**Example:** `GET /api/rewards/agent/luna`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "luna",
    "name": "Luna - Trip Architect",
    "role": "TRIP_PLANNING",
    "capabilities": [
      "itinerary_creation",
      "destination_research",
      "route_optimization"
    ],
    "energy": 105,
    "rewards": 58,
    "coherence": 87,
    "entanglements": [
      {
        "targetAgent": "karim",
        "strength": 0.75,
        "lastUpdate": 1697654321000
      }
    ]
  }
}
```

### 5. System Health Check

**GET** `/api/rewards/health`

Quick health check for the reward system.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "quantumCoherence": 89,
    "entanglementStrength": 0.78,
    "totalAgents": 8,
    "totalRewards": 58,
    "avgEnergy": 101.25,
    "avgCoherence": 88.5,
    "timestamp": "2025-10-16T22:30:00.000Z"
  }
}
```

## Reward Types

### Immediate Rewards

Awarded instantly based on action results:

- **ACCURATE_RESPONSE** (15 points) - Accuracy > 80%
- **FAST_RESPONSE** (10 points) - Response time < 2 seconds
- **USER_SATISFACTION** (25 points) - User rating ≥ 4 stars
- **RESOURCE_EFFICIENCY** (8 points) - Tokens used < 1000

### Long-Term Rewards

Awarded based on trajectory and improvement:

- **TASK_COMPLETION** (50 points) - Successfully completed task
- **LEARNING_IMPROVEMENT** (20 points) - Performance improvement > 10%
- **INNOVATION_BONUS** (30 points) - Novel solution discovered
- **CONSISTENCY_BONUS** (25 points) - Consistency score > 85%

### Collaborative Rewards

Awarded for multi-agent interactions:

- **SUCCESSFUL_COORDINATION** (40 points) - Successful collaboration
- **CONFLICT_RESOLUTION** (30 points per conflict) - Resolved conflicts
- **KNOWLEDGE_SHARING** (25 points) - Shared knowledge with team
- **LEADERSHIP** (35 points) - Led collaborative effort

## Database Schema

### Tables

**agent_states**
- Stores current state of all agents
- Fields: agent_id, name, role, energy, rewards, coherence, entanglements
- Updated on every interaction

**agent_experiences**
- Stores historical experiences for learning
- Fields: agent_id, action, reward, state_before, state_after, context
- Used for reinforcement learning

### Views

**agent_performance_metrics**
- Aggregated performance metrics per agent
- Includes total experiences, average reward, success rate

**recent_agent_activity**
- Last 100 agent experiences
- Useful for monitoring and debugging

### Functions

**get_agent_leaderboard()**
- Returns ranked list of agents by total rewards
- Includes rank, rewards, energy, coherence

**get_entanglement_network()**
- Returns network of quantum entanglements
- Shows connections between agents

## Setup Instructions

### 1. Database Setup

Run the SQL schema in Supabase:

```bash
# Copy schema to clipboard
cat backend/database/quantum-reward-schema.sql

# Paste in Supabase SQL Editor and run
```

### 2. Environment Variables

Add to `.env`:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Server Integration

Already integrated in `backend/server.js`:

```javascript
const { QuantumRewardEngine, createRewardRoutes } = require('./services/quantumRewardEngine');
const rewardEngine = new QuantumRewardEngine(supabaseClient);
createRewardRoutes(app, rewardEngine);
```

### 4. Test the System

```bash
# Start backend server
cd backend
npm start

# Test health endpoint
curl http://localhost:5000/api/rewards/health

# Test metrics endpoint
curl http://localhost:5000/api/rewards/metrics
```

## Usage Examples

### Example 1: Process Trip Planning Interaction

```javascript
const response = await fetch('http://localhost:5000/api/rewards/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    agentId: 'luna',
    action: {
      type: 'create_itinerary',
      destination: 'Tokyo',
      duration: 10
    },
    result: {
      accuracy: 0.92,
      responseTime: 1800,
      userRating: 5,
      tokensUsed: 950
    },
    context: {
      userId: 'user123',
      tripType: 'leisure'
    }
  })
});

const data = await response.json();
console.log('Reward:', data.data.reward);
console.log('Agent Energy:', data.data.agentState.energy);
```

### Example 2: Get Agent Recommendations

```javascript
const response = await fetch('http://localhost:5000/api/rewards/recommend', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    taskType: 'budget_optimization',
    taskContext: {
      requiredCapabilities: ['cost_calculation', 'savings_finder'],
      budget: 5000,
      destination: 'Paris'
    }
  })
});

const data = await response.json();
console.log('Recommended agents:', data.data);
```

### Example 3: Monitor System Health

```javascript
const response = await fetch('http://localhost:5000/api/rewards/health');
const data = await response.json();

if (data.data.quantumCoherence < 70) {
  console.warn('System coherence is low!');
}

if (data.data.avgEnergy < 50) {
  console.warn('Agents need rest!');
}
```

## Integration with Amrikyy Agents

### In Agent Code

```javascript
// After agent completes a task
const rewardResult = await fetch('http://localhost:5000/api/rewards/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    agentId: 'luna',
    action: agentAction,
    result: {
      accuracy: calculateAccuracy(),
      responseTime: Date.now() - startTime,
      userRating: getUserRating(),
      tokensUsed: getTokenCount()
    },
    context: {
      userId: req.user.id,
      sessionId: req.session.id
    },
    collaboratingAgents: getCollaboratingAgents()
  })
});
```

### In Frontend

```typescript
// Display agent leaderboard
const metrics = await fetch('http://localhost:5000/api/rewards/metrics');
const data = await metrics.json();

const leaderboard = data.data.agents
  .sort((a, b) => b.rewards - a.rewards)
  .map((agent, index) => ({
    rank: index + 1,
    name: agent.name,
    rewards: agent.rewards,
    energy: agent.energy
  }));

console.table(leaderboard);
```

## Quantum Mechanics Explained

### Coherence

Represents the quality of an agent's quantum state. Higher coherence means:
- Better performance
- More reliable results
- Stronger entanglements

Coherence increases with positive rewards and decreases with negative outcomes.

### Entanglement

Represents connections between agents. When agents collaborate:
- Entanglement strength increases
- Future collaborations are more effective
- Knowledge sharing improves

### Wave Function

Represents system stability. Calculated from energy variance:
- High wave function = stable system
- Low wave function = unstable, needs rebalancing

### Superposition

System is in superposition when:
- Global coherence > 70%
- Entanglement strength > 0.5

In superposition, the system operates at peak efficiency.

## Monitoring and Analytics

### Key Metrics to Track

1. **Total Rewards** - Overall system performance
2. **Average Energy** - Agent health and capacity
3. **Global Coherence** - System quality
4. **Entanglement Strength** - Collaboration effectiveness
5. **Experience Buffer Size** - Learning capacity

### Warning Signs

- **Low Energy** (< 50) - Agents overworked
- **Low Coherence** (< 70) - Poor performance
- **No Entanglements** - Agents not collaborating
- **Low Wave Function** (< 0.5) - System unstable

## Troubleshooting

### Issue: Agents Not Receiving Rewards

**Solution:**
1. Check if Supabase is connected
2. Verify agent_id matches exactly
3. Check result object has required fields
4. Review server logs for errors

### Issue: Low System Coherence

**Solution:**
1. Increase positive rewards
2. Reduce negative penalties
3. Encourage agent collaboration
4. Allow agents to rest (energy recovery)

### Issue: Database Connection Failed

**Solution:**
1. Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
2. Check Supabase project is active
3. Run database schema if tables don't exist
4. System works in memory-only mode if DB unavailable

## Future Enhancements

- [ ] Real-time dashboard for monitoring
- [ ] Advanced learning algorithms (PPO, A3C)
- [ ] Multi-objective optimization
- [ ] Automated agent rebalancing
- [ ] Predictive analytics
- [ ] Agent personality evolution
- [ ] Cross-session learning
- [ ] Federated learning support

## Support

For issues or questions:
- Check server logs: `backend/logs/`
- Review database queries in Supabase
- Test endpoints with Postman
- Contact: support@amrikyy.com

---

**Status**: ✅ Fully Implemented  
**Version**: 1.0.0  
**Last Updated**: 2025-10-16
