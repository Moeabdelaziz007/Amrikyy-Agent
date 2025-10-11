# Quantum System API Documentation

## Overview

The Quantum System is the core intelligence layer of SAAAAS (Super AI Automation Agentik As Service). It provides:

- **Agent DNA Engine**: Calculate DNA scores, generate system prompts
- **Country Agent Network**: Distributed intelligence across Egypt, Saudi Arabia, UAE
- **Deployment Engine**: One-click agent deployment with auto-configuration
- **Admin Dashboard**: Complete monitoring and control center

## Base URL

```
http://localhost:5001/api
```

Production: `https://your-domain.com/api`

---

## 🧬 DNA Engine Endpoints

### Calculate DNA Score

Calculate the quantum DNA score for an agent configuration.

```http
POST /quantum/calculate-dna
```

**Request Body:**
```json
{
  "personality": {
    "analytical": 80,
    "creative": 70,
    "empathetic": 85,
    "logical": 75,
    "intuitive": 80,
    "assertive": 65
  },
  "skills": {
    "coding": 60,
    "communication": 90,
    "problemSolving": 85,
    "leadership": 70,
    "learning": 80,
    "cultural": 95
  },
  "behavior": {
    "decisionSpeed": 60,
    "riskTolerance": 40,
    "workStyle": 70,
    "detailLevel": 80
  },
  "specialization": "travel-expert"
}
```

**Response:**
```json
{
  "success": true,
  "dnaScore": {
    "totalScore": 875,
    "level": "Legendary",
    "tier": 7,
    "emoji": "🔥",
    "breakdown": {
      "personality": 76,
      "skills": 82,
      "behavior": 78,
      "synergy": 35,
      "multiplier": 1.15
    },
    "potential": {
      "score": 85,
      "rating": "High",
      "maxTier": 9,
      "timeToNext": {
        "days": 35,
        "weeks": 5,
        "formatted": "5 weeks"
      }
    },
    "evolution": {
      "currentLevel": "Legendary",
      "nextLevel": "Transcendent",
      "evolutionPath": { /* ... */ },
      "recommendedFocus": [ /* ... */ ],
      "estimatedGrowth": "8 levels in 6 months"
    }
  }
}
```

---

### Generate System Prompt

Generate a complete system prompt from agent DNA.

```http
POST /quantum/generate-prompt
```

**Request Body:**
```json
{
  "name": "Egypt Travel Expert",
  "specialization": "travel-expert",
  "personality": { /* ... */ },
  "skills": { /* ... */ },
  "behavior": { /* ... */ }
}
```

**Response:**
```json
{
  "success": true,
  "systemPrompt": "You are Egypt Travel Expert, a travel-expert.\n\n🧬 DNA Profile\n- DNA Score: 875/1000\n- Level: Legendary 🔥\n- Tier: 7/10\n\n..."
}
```

---

### Get Agent Presets

Retrieve all predefined agent presets.

```http
GET /quantum/presets
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "presets": [
    {
      "key": "egyptExpert",
      "name": "Egypt Travel Expert",
      "type": "country-agent",
      "specialization": "travel-expert",
      "country": "Egypt",
      "icon": "🇪🇬",
      "dnaScore": { /* ... */ }
    },
    {
      "key": "saudiGuide",
      "name": "Saudi Arabia Guide",
      "type": "country-agent",
      "specialization": "cultural-expert",
      "country": "Saudi Arabia",
      "icon": "🇸🇦",
      "dnaScore": { /* ... */ }
    }
    // ... more presets
  ]
}
```

---

### Get Specific Preset

Get details for a specific agent preset.

```http
GET /quantum/presets/:key
```

**Parameters:**
- `key`: Preset identifier (e.g., `egyptExpert`, `saudiGuide`, `uaeLuxury`)

**Response:**
```json
{
  "success": true,
  "preset": {
    "name": "Egypt Travel Expert",
    "type": "country-agent",
    "specialization": "travel-expert",
    "personality": { /* ... */ },
    "skills": { /* ... */ },
    "behavior": { /* ... */ },
    "domainExpertise": [
      "Egyptian history",
      "Pyramids & ancient sites",
      "Nile cruises",
      "Cairo & Alexandria",
      "Red Sea resorts"
    ],
    "dnaScore": { /* ... */ }
  }
}
```

---

## 🌍 Country Agent Network Endpoints

### Initialize Network

Start the Country Agent Network with all agents.

```http
POST /quantum/network/initialize
```

**Response:**
```json
{
  "success": true,
  "message": "Country Agent Network initialized",
  "status": {
    "network": "Country Agent Network",
    "status": "active",
    "agents": 3,
    "totalKnowledge": {
      "attractions": 150,
      "tours": 120
    },
    "agentDetails": [ /* ... */ ]
  }
}
```

---

### Query Network

Send a query to the Country Agent Network.

```http
POST /quantum/network/query
```

**Request Body:**
```json
{
  "query": "Show me attractions in Egypt",
  "context": {
    "country": "Egypt",
    "preferences": {
      "budget": "moderate",
      "interests": ["history", "culture"]
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "agent": "Egypt Travel Expert",
  "country": "Egypt",
  "dnaScore": 875,
  "response": {
    "type": "attractions",
    "count": 50,
    "highlights": [
      {
        "uuid": "...",
        "title": "Great Pyramid of Giza",
        "location": { /* ... */ },
        "rating": 4.8
      }
      // ... more attractions
    ],
    "message": "I found 50 amazing attractions in Egypt! Here are the top ones..."
  },
  "intent": ["attractions"],
  "knowledgeAge": 120
}
```

---

### Get Network Status

Get the status of the entire Country Agent Network.

```http
GET /quantum/network/status
```

**Response:**
```json
{
  "success": true,
  "network": "Country Agent Network",
  "status": "active",
  "agents": 3,
  "totalKnowledge": {
    "attractions": 150,
    "tours": 120
  },
  "agentDetails": [
    {
      "key": "egypt",
      "name": "Egypt Travel Expert",
      "country": "Egypt",
      "countryCode": "EG",
      "dnaScore": { /* ... */ },
      "specialization": "travel-expert",
      "knowledge": {
        "attractions": 50,
        "tours": 40,
        "lastUpdate": "2025-10-11T12:00:00.000Z",
        "ageSeconds": 120
      },
      "autoUpdate": {
        "enabled": true,
        "interval": 900,
        "isUpdating": false
      },
      "performance": {
        "tier": 7,
        "level": "Legendary",
        "emoji": "🔥"
      }
    }
    // ... more agents
  ],
  "timestamp": "2025-10-11T12:02:00.000Z"
}
```

---

### Get Specific Agent Status

Get status for a specific country agent.

```http
GET /quantum/network/agents/:key
```

**Parameters:**
- `key`: Agent key (e.g., `egypt`, `saudi`, `uae`)

**Response:**
```json
{
  "success": true,
  "agent": {
    "name": "Egypt Travel Expert",
    "country": "Egypt",
    "countryCode": "EG",
    "dnaScore": { /* ... */ },
    "knowledge": { /* ... */ },
    "autoUpdate": { /* ... */ },
    "performance": { /* ... */ }
  }
}
```

---

## 🚀 Deployment Engine Endpoints

### Deploy Agent

Deploy a new agent with full configuration.

```http
POST /quantum/deploy
```

**Request Body:**
```json
{
  "name": "Custom Travel Expert",
  "type": "travel-expert",
  "specialization": "luxury-expert",
  "personality": { /* ... */ },
  "skills": { /* ... */ },
  "behavior": { /* ... */ }
}
```

**Response:**
```json
{
  "success": true,
  "deploymentId": "deploy_1728648000000_abc123",
  "agent": {
    "id": "...",
    "name": "Custom Travel Expert",
    "dnaScore": 890,
    "systemPrompt": "..."
  },
  "dnaScore": { /* full DNA breakdown */ },
  "integrations": {
    "iziTravel": { "enabled": true, "status": "active" },
    "stripe": { "enabled": true, "status": "active" },
    "redis": { "enabled": true, "status": "active" },
    "supabase": { "enabled": true, "status": "active" }
  },
  "health": {
    "status": "healthy",
    "checks": { /* ... */ }
  },
  "duration": 1234
}
```

---

### Quick Deploy from Preset

Deploy an agent from a predefined preset.

```http
POST /quantum/deploy/preset/:key
```

**Parameters:**
- `key`: Preset identifier (e.g., `egyptExpert`)

**Request Body (optional customizations):**
```json
{
  "name": "My Egypt Expert"
}
```

**Response:** Same as full deployment

---

### Undeploy Agent

Remove a deployed agent.

```http
DELETE /quantum/deploy/:id
```

**Parameters:**
- `id`: Deployment ID

**Response:**
```json
{
  "success": true,
  "message": "Agent Egypt Travel Expert undeployed"
}
```

---

### Get Deployment Status

Check the status of a specific deployment.

```http
GET /quantum/deploy/:id
```

**Response:**
```json
{
  "success": true,
  "deployment": {
    "id": "deploy_1728648000000_abc123",
    "agent": { /* ... */ },
    "dnaScore": { /* ... */ },
    "integrations": { /* ... */ },
    "health": { /* ... */ },
    "status": "deployed",
    "deployedAt": "2025-10-11T12:00:00.000Z",
    "duration": 1234
  }
}
```

---

### Get All Active Deployments

List all currently active deployments.

```http
GET /quantum/deployments
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "deployments": [ /* ... */ ]
}
```

---

### Get Deployment History

Retrieve deployment history.

```http
GET /quantum/deployments/history?limit=50
```

**Query Parameters:**
- `limit`: Number of records (default: 50)

**Response:**
```json
{
  "success": true,
  "count": 50,
  "history": [
    {
      "id": "deploy_1728648000000_abc123",
      "agentId": "...",
      "agentName": "Egypt Travel Expert",
      "status": "success",
      "duration": 1234,
      "timestamp": "2025-10-11T12:00:00.000Z"
    }
    // ... more history
  ]
}
```

---

### Get Deployment Statistics

Get aggregate deployment statistics.

```http
GET /quantum/deployments/stats
```

**Response:**
```json
{
  "success": true,
  "statistics": {
    "active": 3,
    "totalDeployments": 10,
    "successful": 9,
    "failed": 1,
    "successRate": 90,
    "averageDuration": 1200,
    "deploymentsByType": {
      "country-agent": 3,
      "travel-expert": 5,
      "ai-engineer": 2
    },
    "lastDeployment": "2025-10-11T12:00:00.000Z"
  }
}
```

---

### Batch Deploy

Deploy multiple agents at once.

```http
POST /quantum/deploy/batch
```

**Request Body:**
```json
{
  "agents": [
    {
      "name": "Agent 1",
      "personality": { /* ... */ },
      "skills": { /* ... */ },
      "behavior": { /* ... */ }
    },
    {
      "name": "Agent 2",
      "personality": { /* ... */ },
      "skills": { /* ... */ },
      "behavior": { /* ... */ }
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "total": 2,
  "successful": 2,
  "failed": 0,
  "results": [
    {
      "index": 0,
      "status": "fulfilled",
      "data": { /* deployment result */ },
      "error": null
    },
    {
      "index": 1,
      "status": "fulfilled",
      "data": { /* deployment result */ },
      "error": null
    }
  ]
}
```

---

## 📊 Admin Dashboard Endpoints

### Dashboard Overview

Get complete system overview.

```http
GET /admin/dashboard
```

**Response:**
```json
{
  "success": true,
  "dashboard": {
    "network": {
      "active": true,
      "agents": 3,
      "totalKnowledge": {
        "attractions": 150,
        "tours": 120
      },
      "agentDetails": [ /* ... */ ]
    },
    "deployments": {
      "active": 3,
      "total": 10,
      "successful": 9,
      "failed": 1,
      "successRate": 90,
      "averageDuration": 1200,
      "byType": { /* ... */ },
      "recentDeployments": [ /* ... */ ]
    },
    "agents": {
      "total": 15,
      "byType": {
        "country-agent": 3,
        "travel-expert": 8,
        "ai-engineer": 4
      },
      "byTier": {
        "7": 3,
        "6": 5,
        "5": 7
      },
      "averageDNAScore": 750,
      "topAgents": [ /* ... */ ]
    },
    "health": {
      "overall": "healthy",
      "checks": {
        "dnaEngine": { "status": "healthy" },
        "deploymentEngine": { "status": "healthy" },
        "countryNetwork": { "status": "healthy" },
        "redis": { "status": "healthy" },
        "iziTravel": { "status": "healthy" }
      }
    },
    "activity": {
      "deployments": [ /* recent activity */ ]
    },
    "timestamp": "2025-10-11T12:00:00.000Z"
  }
}
```

---

### Analytics

Get performance analytics.

```http
GET /admin/analytics?range=7d
```

**Query Parameters:**
- `range`: Time range (e.g., `7d`, `30d`, `90d`)

**Response:**
```json
{
  "success": true,
  "analytics": {
    "deployments": {
      "timeline": {
        "2025-10-11": { "successful": 5, "failed": 0 },
        "2025-10-10": { "successful": 3, "failed": 1 }
      },
      "successRate": 90,
      "averageDuration": 1200
    },
    "agents": {
      "growth": {
        "2025-10-11": 2,
        "2025-10-10": 3
      },
      "performance": [ /* ... */ ]
    },
    "network": {
      "knowledgeGrowth": { /* ... */ },
      "queryVolume": { /* ... */ }
    }
  },
  "timeRange": "7d"
}
```

---

### Leaderboard

Get top agents by DNA score.

```http
GET /admin/leaderboard
```

**Response:**
```json
{
  "success": true,
  "count": 20,
  "leaderboard": [
    {
      "rank": 1,
      "id": "...",
      "name": "Quantum Travel Master",
      "type": "travel-expert",
      "specialization": "luxury-expert",
      "dnaScore": 950,
      "tier": 9,
      "level": "Quantum Master",
      "emoji": "✨",
      "createdAt": "2025-10-01T10:00:00.000Z"
    }
    // ... top 20 agents
  ]
}
```

---

### System Logs

Get system activity logs.

```http
GET /admin/logs?limit=50
```

**Query Parameters:**
- `limit`: Number of log entries (default: 50)

**Response:**
```json
{
  "success": true,
  "count": 50,
  "logs": [ /* deployment history */ ]
}
```

---

### Control Actions

Execute system control commands.

```http
POST /admin/control/:action
```

**Available Actions:**
- `initialize-network`: Initialize Country Agent Network
- `shutdown-network`: Shutdown Country Agent Network
- `clear-cache`: Clear all caches (Redis + izi.TRAVEL)
- `update-knowledge`: Force update knowledge for all agents

**Response:**
```json
{
  "success": true,
  "action": "clear-cache",
  "message": "All caches cleared"
}
```

---

### Health Check

Check system health.

```http
GET /admin/health
```

**Response:**
```json
{
  "success": true,
  "overall": "healthy",
  "checks": { /* ... */ },
  "timestamp": "2025-10-11T12:00:00.000Z"
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

**HTTP Status Codes:**
- `200`: Success
- `400`: Bad Request (invalid parameters)
- `404`: Not Found
- `500`: Internal Server Error
- `503`: Service Unavailable

---

## Rate Limiting

API requests are rate-limited based on IP address:
- **Development**: 100 requests per 15 minutes
- **Production**: 1000 requests per 15 minutes

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1728648900
```

---

## Authentication

Currently, the API is open for development. Production deployment will require:
- API Key authentication
- JWT tokens for user sessions
- Role-based access control (RBAC)

---

## Examples

### Complete Agent Deployment Flow

```javascript
// 1. Get a preset
const preset = await fetch('/api/quantum/presets/egyptExpert');

// 2. Calculate DNA score (optional - to preview)
const dnaScore = await fetch('/api/quantum/calculate-dna', {
  method: 'POST',
  body: JSON.stringify(preset.data.preset)
});

// 3. Deploy the agent
const deployment = await fetch('/api/quantum/deploy/preset/egyptExpert', {
  method: 'POST',
  body: JSON.stringify({ name: 'My Egypt Expert' })
});

// 4. Query the network
const response = await fetch('/api/quantum/network/query', {
  method: 'POST',
  body: JSON.stringify({
    query: 'Show me pyramids',
    context: { country: 'Egypt' }
  })
});
```

---

## Support

For issues or questions:
- GitHub: [github.com/Moeabdelaziz007/maya-travel-agent](https://github.com/Moeabdelaziz007/maya-travel-agent)
- Email: support@amrikyy.com

---

**Last Updated:** October 11, 2025  
**API Version:** 1.0.0  
**Status:** Production Ready

