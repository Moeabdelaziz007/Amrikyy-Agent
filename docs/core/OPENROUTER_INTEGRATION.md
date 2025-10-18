# OpenRouter API Integration - Amrikyy Travel Agent

## 🔑 **API Configuration**

**API Key:** `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`  
**Base URL:** `https://openrouter.ai/api/v1`  
**Status:** ✅ **ACTIVE & CONFIGURED**

---

## 🤖 **Available Models**

### **Free Tier Models**
- **Llama 3.1 8B (Free)**
  - Model ID: `meta-llama/llama-3.1-8b-instruct:free`
  - Max Tokens: 8,000
  - Context Window: 8,000
  - Cost: $0.00 per 1K tokens
  - Best for: General use, simple queries

- **Phi-3 Mini (Free)**
  - Model ID: `microsoft/phi-3-mini-128k-instruct:free`
  - Max Tokens: 4,000
  - Context Window: 128,000
  - Cost: $0.00 per 1K tokens
  - Best for: Large context, detailed analysis

### **Budget Tier Models**
- **Llama 3.1 70B**
  - Model ID: `meta-llama/llama-3.1-70b-instruct`
  - Max Tokens: 8,000
  - Context Window: 8,000
  - Cost: $0.0009 per 1K tokens
  - Best for: High-quality responses at low cost

- **Gemini Flash 1.5**
  - Model ID: `google/gemini-flash-1.5`
  - Max Tokens: 8,000
  - Context Window: 1,000,000
  - Cost: $0.000075 per 1K tokens
  - Best for: Massive context, complex analysis

### **Premium Tier Models**
- **GPT-4o Mini**
  - Model ID: `openai/gpt-4o-mini`
  - Max Tokens: 16,000
  - Context Window: 128,000
  - Cost: $0.00015 per 1K tokens
  - Best for: Fast, capable responses

- **Claude 3.5 Sonnet**
  - Model ID: `anthropic/claude-3.5-sonnet`
  - Max Tokens: 8,000
  - Context Window: 200,000
  - Cost: $0.003 per 1K tokens
  - Best for: Highest quality, complex reasoning

---

## 🚀 **Integration Details**

### **Files Created/Updated:**
1. `backend/src/ai/openRouterClient.js` - Main OpenRouter client
2. `backend/routes/kelo.js` - Updated to use OpenRouter
3. `backend/routes/revenue.js` - Updated to use OpenRouter
4. `backend/.env.template` - Added OpenRouter configuration

### **API Endpoints:**
- `POST /api/kelo/chat` - Chat completion
- `POST /api/kelo/analyze` - Data analysis
- `POST /api/kelo/recommend` - Recommendations
- `POST /api/kelo/stream` - Streaming responses
- `GET /api/kelo/status` - Health check
- `GET /api/kelo/models` - Available models
- `POST /api/kelo/embeddings` - Generate embeddings

### **Revenue API Endpoints:**
- `GET /api/revenue/opportunities` - Revenue opportunities
- `POST /api/revenue/analyze` - Revenue analysis
- `GET /api/revenue/forecast` - Revenue forecasting
- `GET /api/revenue/health` - Health check

---

## 💰 **Cost Optimization Strategy**

### **Automatic Model Selection:**
- **Free Models:** Simple queries, testing, development
- **Budget Models:** General use, moderate complexity
- **Premium Models:** Complex analysis, large documents

### **Smart Budgeting:**
- Chat responses: Free tier
- Data analysis: Budget tier
- Revenue analysis: Budget tier
- Complex reasoning: Premium tier

---

## 🔧 **Usage Examples**

### **Basic Chat:**
```javascript
const openRouterClient = new OpenRouterClient();
const response = await openRouterClient.chatCompletion([
  { role: 'user', content: 'Hello!' }
], { budget: 'free' });
```

### **Data Analysis:**
```javascript
const analysis = await openRouterClient.analyzeTravelData(data, 'revenue');
```

### **Revenue Insights:**
```javascript
const insights = await openRouterClient.generateRevenueInsights(revenueData);
```

---

## 📊 **Monitoring & Health**

### **Health Check:**
```bash
curl http://localhost:5000/api/kelo/status
```

### **Available Models:**
```bash
curl http://localhost:5000/api/kelo/models
```

---

## 🛡️ **Security Notes**

- API key is stored in environment variables
- Rate limiting applied to all endpoints
- Cost monitoring built into responses
- Automatic fallback to free models if budget exceeded

---

## 🎯 **Future Use Cases**

1. **Multi-Model AI System:** Switch between models based on task complexity
2. **Cost-Effective Scaling:** Use free models for simple tasks, premium for complex ones
3. **A/B Testing:** Compare different models for the same tasks
4. **Load Balancing:** Distribute requests across different providers
5. **Fallback System:** Automatic fallback if primary model fails

---

**Status:** ✅ **READY FOR PRODUCTION**  
**Last Updated:** October 13, 2025  
**Maintained By:** Amrikyy Travel Agent Team
