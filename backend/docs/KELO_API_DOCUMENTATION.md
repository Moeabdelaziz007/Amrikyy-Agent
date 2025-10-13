# Kelo AI API Documentation
**Version:** 1.0.0  
**Last Updated:** October 13, 2025  
**Base URL:** `https://api.maya-travel-agent.com/api/kelo`

---

## 🚀 **Overview**

The Kelo AI API provides advanced AI-powered capabilities for the Maya Travel Agent platform. Built with cost optimization and performance in mind, it offers intelligent model selection, context management, and real-time AI interactions.

### **Key Features**
- **Cost-Optimized AI:** Smart model selection based on task complexity
- **Context Management:** Memory Bank system for reduced token usage
- **Real-time Streaming:** Live AI responses via WebSocket
- **Multiple Models:** Access to 6+ AI models via OpenRouter
- **Revenue Analytics:** AI-powered business intelligence

---

## 🔑 **Authentication**

All API requests require authentication via API key:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     https://api.maya-travel-agent.com/api/kelo/chat
```

---

## 📊 **Cost Optimization**

### **Model Tiers**
- **Free Tier:** Llama 3.1 8B, Phi-3 Mini (for simple tasks)
- **Budget Tier:** Llama 3.1 70B, Gemini Flash 1.5 (for analysis)
- **Premium Tier:** GPT-4o Mini, Claude 3.5 Sonnet (for complex tasks)

### **Smart Selection**
The API automatically selects the most cost-effective model based on:
- Task complexity
- Request size
- Previous performance
- Budget constraints

---

## 🛠️ **Endpoints**

### **Chat Completion**

#### `POST /api/kelo/chat`

Generate AI responses for chat interactions.

**Request Body:**
```json
{
  "message": "Hello, I need help planning a trip to Japan",
  "history": [
    {
      "role": "user",
      "content": "Previous message"
    },
    {
      "role": "assistant", 
      "content": "Previous response"
    }
  ],
  "context": "travel",
  "temperature": 0.7,
  "maxTokens": 1000
}
```

**Response:**
```json
{
  "success": true,
  "response": {
    "content": "I'd be happy to help you plan your trip to Japan! What specific aspects are you most interested in?",
    "usage": {
      "total_tokens": 45,
      "prompt_tokens": 30,
      "completion_tokens": 15
    },
    "model": "meta-llama/llama-3.1-8b-instruct:free",
    "cost": 0,
    "provider": "OpenRouter"
  },
  "context": "travel",
  "timestamp": "2025-10-13T18:30:00Z"
}
```

**Parameters:**
- `message` (string, required): The user's message
- `history` (array, optional): Conversation history
- `context` (string, optional): Context type (travel, business, general)
- `temperature` (number, optional): Response creativity (0.0-1.0)
- `maxTokens` (number, optional): Maximum response length

---

### **Data Analysis**

#### `POST /api/kelo/analyze`

Analyze data using AI-powered insights.

**Request Body:**
```json
{
  "data": {
    "revenue": 50000,
    "customers": 250,
    "growth_rate": 0.15
  },
  "analysisType": "revenue",
  "insights": true,
  "recommendations": true
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "insights": [
      "Revenue showing strong 15% growth",
      "Customer acquisition rate is healthy",
      "Profit margins are above industry average"
    ],
    "recommendations": [
      "Focus on high-value customer segments",
      "Consider expanding to new markets",
      "Optimize pricing strategy for premium services"
    ],
    "trends": {
      "revenue_growth": "positive",
      "customer_satisfaction": "high",
      "market_position": "strong"
    }
  },
  "type": "revenue",
  "timestamp": "2025-10-13T18:30:00Z"
}
```

---

### **Recommendations**

#### `POST /api/kelo/recommend`

Generate personalized recommendations.

**Request Body:**
```json
{
  "type": "travel",
  "preferences": {
    "budget": 3000,
    "duration": 10,
    "interests": ["culture", "food", "history"]
  },
  "destination": "Europe",
  "budget": "budget"
}
```

**Response:**
```json
{
  "success": true,
  "recommendations": {
    "destinations": [
      {
        "name": "Paris, France",
        "reason": "Perfect for culture and food lovers",
        "estimated_cost": "$2500",
        "duration": "4-5 days"
      },
      {
        "name": "Rome, Italy", 
        "reason": "Rich history and amazing cuisine",
        "estimated_cost": "$2200",
        "duration": "3-4 days"
      }
    ],
    "activities": [
      "Museum tours",
      "Food and wine tastings",
      "Historical site visits",
      "Local cooking classes"
    ],
    "budget_breakdown": {
      "accommodation": "$1200",
      "food": "$800",
      "activities": "$600",
      "transportation": "$400"
    }
  },
  "type": "travel",
  "timestamp": "2025-10-13T18:30:00Z"
}
```

---

### **Real-time Streaming**

#### `POST /api/kelo/stream`

Get real-time streaming AI responses.

**Request Body:**
```json
{
  "message": "Tell me about the best restaurants in Tokyo",
  "history": [],
  "context": "travel"
}
```

**Response (Server-Sent Events):**
```
data: {"type": "chunk", "content": "Tokyo", "index": 0, "total": 15}

data: {"type": "chunk", "content": " has", "index": 1, "total": 15}

data: {"type": "chunk", "content": " amazing", "index": 2, "total": 15}

...

data: {"type": "complete", "content": "Tokyo has amazing restaurants...", "timestamp": "2025-10-13T18:30:00Z"}
```

---

### **Health Check**

#### `GET /api/kelo/status`

Check API health and model status.

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "kelo_ai": {
    "status": "healthy",
    "model": "meta-llama/llama-3.1-8b-instruct:free",
    "cost": 0,
    "provider": "OpenRouter",
    "message": "OpenRouter API is working correctly"
  },
  "timestamp": "2025-10-13T18:30:00Z"
}
```

---

### **Available Models**

#### `GET /api/kelo/models`

Get list of available AI models.

**Response:**
```json
{
  "success": true,
  "models": [
    {
      "id": "meta-llama/llama-3.1-8b-instruct:free",
      "name": "Llama 3.1 8B (Free)",
      "description": "Fast, free model for general use",
      "maxTokens": 8000,
      "contextWindow": 8000,
      "cost": 0,
      "pricing": "Free"
    },
    {
      "id": "meta-llama/llama-3.1-70b-instruct",
      "name": "Llama 3.1 70B",
      "description": "High-quality model at low cost",
      "maxTokens": 8000,
      "contextWindow": 8000,
      "cost": 0.0009,
      "pricing": "$0.0009 per 1K tokens"
    }
  ],
  "default": "meta-llama/llama-3.1-8b-instruct:free",
  "timestamp": "2025-10-13T18:30:00Z"
}
```

---

## 💰 **Revenue Analytics API**

### **Revenue Opportunities**

#### `GET /api/revenue/opportunities`

Get AI-generated revenue opportunities.

**Query Parameters:**
- `period` (string): Time period (monthly, quarterly, yearly)
- `category` (string): Category filter (all, bookings, subscriptions, premium)
- `limit` (number): Number of opportunities (default: 10)

**Response:**
```json
{
  "success": true,
  "period": "monthly",
  "category": "all",
  "opportunities": [
    {
      "id": "revenue_1",
      "title": "Premium Travel Packages",
      "description": "Create high-value travel packages with exclusive experiences",
      "potential_revenue": "$50,000/month",
      "implementation_steps": [
        "Research premium destinations",
        "Partner with luxury hotels",
        "Create exclusive experiences",
        "Launch marketing campaign"
      ],
      "priority": "high",
      "timeline": "3 months"
    }
  ],
  "total": 1,
  "generated_at": "2025-10-13T18:30:00Z"
}
```

---

### **Revenue Analysis**

#### `POST /api/revenue/analyze`

Analyze revenue data with AI insights.

**Request Body:**
```json
{
  "data": {
    "monthly_revenue": 75000,
    "growth_rate": 0.12,
    "customer_acquisition_cost": 150,
    "lifetime_value": 2500
  },
  "metrics": ["revenue", "conversion", "retention"],
  "timeframe": "30d"
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "insights": [
      "Revenue growing consistently at 12% monthly",
      "Customer acquisition cost is below industry average",
      "High lifetime value indicates strong customer satisfaction"
    ],
    "recommendations": [
      "Increase marketing budget to accelerate growth",
      "Focus on customer retention programs",
      "Consider premium service tiers"
    ],
    "trends": {
      "revenue_growth": "positive",
      "customer_quality": "high",
      "market_opportunity": "significant"
    }
  },
  "metrics": ["revenue", "conversion", "retention"],
  "timeframe": "30d",
  "analyzed_at": "2025-10-13T18:30:00Z"
}
```

---

## 🔧 **Error Handling**

### **Error Response Format**

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2025-10-13T18:30:00Z"
}
```

### **Common Error Codes**

- `400` - Bad Request (missing required parameters)
- `401` - Unauthorized (invalid API key)
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error
- `503` - Service Unavailable

### **Rate Limiting**

- **Free Tier:** 100 requests/hour
- **Budget Tier:** 1000 requests/hour  
- **Premium Tier:** 5000 requests/hour

---

## 📈 **Performance Metrics**

### **Response Times**
- **Free Models:** < 2 seconds
- **Budget Models:** < 3 seconds
- **Premium Models:** < 5 seconds

### **Cost Optimization**
- **Average Cost Reduction:** 83%
- **Context Compression:** 40% token savings
- **Memory Bank Usage:** 200-500 tokens saved per conversation

---

## 🚀 **Getting Started**

### **1. Get API Key**
Contact support to obtain your API key.

### **2. Test Connection**
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://api.maya-travel-agent.com/api/kelo/status
```

### **3. Make Your First Request**
```bash
curl -X POST \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"message": "Hello!"}' \
     https://api.maya-travel-agent.com/api/kelo/chat
```

---

## 📞 **Support**

- **Documentation:** https://docs.maya-travel-agent.com
- **Support Email:** support@maya-travel-agent.com
- **Status Page:** https://status.maya-travel-agent.com

---

**Last Updated:** October 13, 2025  
**API Version:** 1.0.0  
**Maintained By:** Maya Travel Agent Team
