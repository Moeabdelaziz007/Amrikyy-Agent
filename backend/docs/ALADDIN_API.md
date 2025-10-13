# 🎯 Mini-Aladdin API Documentation

**Version:** 1.0.0  
**Last Updated:** 2025-10-13  
**Base URL:** `http://localhost:5000/api/aladdin`

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Quick Start](#quick-start)
4. [API Endpoints](#api-endpoints)
5. [Data Models](#data-models)
6. [Error Handling](#error-handling)
7. [Code Examples](#code-examples)
8. [Integration Guide](#integration-guide)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## 🌟 Overview

Mini-Aladdin is a **multi-agent orchestration system** inspired by BlackRock's Aladdin platform. It uses specialized AI agents to discover and analyze revenue opportunities across multiple strategies.

### What It Does

- 💰 **Crypto Arbitrage Detection** - Cross-exchange and triangular arbitrage
- 📊 **Market Pattern Recognition** - RSI, Moving Averages, trend analysis
- 🎯 **Risk Assessment** - Portfolio optimization and position sizing
- 🤖 **Automated Analysis** - Monte Carlo simulation with 10,000 scenarios
- 💡 **Affiliate Discovery** - Revenue stream identification

### Key Features

- **4 Specialized Agents** working in parallel
- **Real-time opportunity scanning** across multiple sources
- **Advanced mathematics** (Kelly Criterion, Sharpe Ratio, VaR)
- **Risk management** with automated portfolio optimization
- **Event-driven architecture** for real-time updates

---

## 🏗️ Architecture

### Multi-Agent System

Mini-Aladdin consists of **4 specialized agents** coordinated by a central orchestrator:

#### 1. **MathAgent** - The Genius Mathematician
```javascript
Specialty: Advanced Mathematics & Statistics
Capabilities:
  - Monte Carlo simulation (10,000 scenarios)
  - Kelly Criterion optimal bet sizing
  - Sharpe Ratio calculation
  - Value at Risk (VaR) analysis
  - Correlation coefficient analysis
  - Geometric Brownian Motion modeling
```

#### 2. **MarketAgent** - The Pattern Recognition Expert
```javascript
Specialty: Market Analysis & Pattern Detection
Capabilities:
  - RSI (Relative Strength Index)
  - Moving Average crossovers (Golden/Death Cross)
  - Volatility analysis
  - Cross-exchange arbitrage detection
  - Price pattern recognition
```

#### 3. **RiskAgent** - The Portfolio Guardian
```javascript
Specialty: Risk Assessment & Management
Capabilities:
  - Risk score calculation (0-100)
  - Optimal position sizing
  - Stop-loss calculation
  - Portfolio diversification analysis
  - Herfindahl index measurement
  - Maximum loss calculation
```

#### 4. **DataAgent** - The Information Gatherer
```javascript
Specialty: Data Collection & Integration
Capabilities:
  - Multi-exchange price fetching (5 exchanges)
  - Historical data retrieval
  - Intelligent caching (30s TTL)
  - Affiliate program discovery
  - MCP protocol integration ready
```

### System Flow

```
User Request → Central Orchestrator → Parallel Agent Execution
                                          ↓
                                   [MathAgent, MarketAgent, 
                                    RiskAgent, DataAgent]
                                          ↓
                                   Aggregate Results
                                          ↓
                                   Score & Rank Opportunities
                                          ↓
                                   Generate Execution Plan
                                          ↓
                                   Return to User
```

---

## 🚀 Quick Start

### Installation

```bash
# The agent is already installed as part of the backend
cd backend
npm install
```

### Basic Usage

```bash
# Start the backend server
npm start

# Test the health endpoint
curl http://localhost:5000/api/aladdin/health

# Run a money hunt
curl -X POST http://localhost:5000/api/aladdin/hunt
```

### Minimal Example

```javascript
const axios = require('axios');

async function findOpportunities() {
  const response = await axios.post('http://localhost:5000/api/aladdin/hunt');
  console.log(`Found ${response.data.data.opportunities.length} opportunities!`);
  console.log('Best opportunity:', response.data.data.opportunities[0]);
}

findOpportunities();
```

---

## 📡 API Endpoints

### 1. Health Check

**GET** `/api/aladdin/health`

Check if the Mini-Aladdin agent is running and healthy.

**Request:**
```http
GET /api/aladdin/health HTTP/1.1
Host: localhost:5000
```

**Response:**
```json
{
  "success": true,
  "message": "Aladdin agent is running",
  "status": "healthy",
  "agents": {
    "math": "MathAgent",
    "market": "MarketAgent",
    "risk": "RiskAgent",
    "data": "DataAgent"
  },
  "timestamp": "2025-10-13T08:20:00.000Z"
}
```

**Response Codes:**
- `200` - Agent is healthy
- `500` - Agent initialization failed

---

### 2. Start Money Hunt

**POST** `/api/aladdin/hunt`

Execute a complete money-hunting session. The agent will scan for arbitrage opportunities, analyze market patterns, and discover affiliate programs.

**Request:**
```http
POST /api/aladdin/hunt HTTP/1.1
Host: localhost:5000
Content-Type: application/json
```

**Optional Request Body:**
```json
{
  "config": {
    "initialCapital": 10000,
    "riskTolerance": "medium",
    "strategies": ["arbitrage", "pattern", "affiliate"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "opportunities": [
      {
        "type": "cross_exchange_arbitrage",
        "symbol": "BTC",
        "buyExchange": "binance",
        "sellExchange": "coinbase",
        "buyPrice": 44950,
        "sellPrice": 45100,
        "spreadPercent": 0.33,
        "profit": 143.82,
        "profitPercent": 0.32,
        "risk": {
          "riskScore": 25,
          "riskLevel": "low",
          "approved": true
        },
        "score": 85,
        "priority": "high",
        "confidence": 85,
        "category": "arbitrage"
      }
    ],
    "plan": {
      "immediate": [...],
      "today": [...],
      "thisWeek": [...]
    },
    "portfolio": {
      "cash": 10000,
      "totalValue": 10000,
      "positions": []
    },
    "analytics": {
      "totalOpportunities": 15,
      "highPriorityOpps": 5,
      "estimatedDailyProfit": 250
    },
    "summary": {
      "total": 15,
      "byCategory": {
        "arbitrage": 8,
        "trading": 4,
        "affiliate": 3
      }
    }
  }
}
```

**Response Codes:**
- `200` - Hunt completed successfully
- `500` - Error during hunt execution

---

### 3. Get Opportunities

**GET** `/api/aladdin/opportunities`

Retrieve filtered opportunities from the last hunt.

**Request:**
```http
GET /api/aladdin/opportunities?category=arbitrage&minScore=70 HTTP/1.1
Host: localhost:5000
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `category` | string | No | Filter by category: `arbitrage`, `trading`, `affiliate` |
| `minScore` | number | No | Minimum score (0-100) |
| `minProfit` | number | No | Minimum profit amount |
| `limit` | number | No | Maximum results to return (default: 50) |

**Response:**
```json
{
  "success": true,
  "data": {
    "opportunities": [...],
    "filters": {
      "category": "arbitrage",
      "minScore": 70
    },
    "count": 8,
    "cached": true,
    "lastHunt": "2025-10-13T08:15:30.000Z"
  }
}
```

---

### 4. Analyze Opportunity

**POST** `/api/aladdin/analyze`

Get detailed analysis for a specific opportunity or scenario.

**Request:**
```http
POST /api/aladdin/analyze HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "type": "arbitrage",
  "symbol": "BTC",
  "buyPrice": 45000,
  "sellPrice": 45150,
  "amount": 1000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "profitability": {
      "profit": 143.82,
      "profitPercent": 0.32,
      "roi": 0.32,
      "worthIt": false
    },
    "risk": {
      "riskScore": 25,
      "riskLevel": "low",
      "approved": true,
      "positionSize": 1000,
      "maxLoss": 50
    },
    "recommendation": "REJECT - Profit below 0.5% threshold",
    "analysis": "Spread of 0.32% is below minimum profitable threshold..."
  }
}
```

---

### 5. Get Statistics

**GET** `/api/aladdin/stats`

Retrieve comprehensive statistics from the agent.

**Request:**
```http
GET /api/aladdin/stats HTTP/1.1
Host: localhost:5000
```

**Response:**
```json
{
  "success": true,
  "data": {
    "portfolio": {
      "cash": 10000,
      "totalValue": 10000,
      "totalProfit": 0,
      "positions": []
    },
    "opportunities": {
      "total": 15,
      "byCategory": {
        "arbitrage": 8,
        "trading": 4,
        "affiliate": 3
      },
      "byPriority": {
        "high": 5,
        "medium": 7,
        "low": 3
      }
    },
    "performance": {
      "totalTrades": 0,
      "winRate": 0,
      "estimatedDailyProfit": 250,
      "estimatedMonthlyProfit": 7500
    },
    "lastHunt": "2025-10-13T08:15:30.000Z"
  }
}
```

---

### 6. Execute Trade (Placeholder)

**POST** `/api/aladdin/execute`

Execute a trade based on an opportunity.

**⚠️ Warning:** This endpoint is in **simulation mode**. Real trading requires additional setup and API keys.

**Request:**
```http
POST /api/aladdin/execute HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "opportunityId": "arb-BTC-binance-coinbase",
  "amount": 1000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Trade execution simulated (demo mode)",
  "data": {
    "tradeId": "TRADE-1697000000000-a1b2c3d4",
    "status": "simulated",
    "opportunity": {...},
    "executedAt": "2025-10-13T08:20:00.000Z"
  }
}
```

---

## 📊 Data Models

### Opportunity Object

```typescript
interface Opportunity {
  type: string;                    // 'cross_exchange_arbitrage' | 'pattern_trading' | 'affiliate_program'
  category: string;                // 'arbitrage' | 'trading' | 'affiliate'
  symbol?: string;                 // 'BTC' | 'ETH' | 'SOL' | 'BNB'
  score: number;                   // 0-100 composite score
  priority: string;                // 'high' | 'medium' | 'low'
  confidence: number;              // 0-100 confidence level
  
  // Arbitrage specific
  buyExchange?: string;
  sellExchange?: string;
  buyPrice?: number;
  sellPrice?: number;
  spreadPercent?: number;
  profit?: number;
  profitPercent?: number;
  
  // Trading specific
  currentPrice?: number;
  expectedReturn?: number;
  patterns?: Pattern[];
  simulation?: MonteCarloResult;
  
  // Affiliate specific
  name?: string;
  commission?: string;
  estimatedMonthlyRevenue?: number;
  
  // Risk assessment
  risk?: RiskAssessment;
}
```

### Risk Assessment Object

```typescript
interface RiskAssessment {
  riskScore: number;              // 0-100 (0=safe, 100=dangerous)
  riskLevel: string;              // 'low' | 'medium' | 'high'
  approved: boolean;              // true if risk is acceptable
  positionSize: number;           // Recommended position size (USD)
  stopLoss: number;               // Stop loss percentage
  maxLoss: number;                // Maximum possible loss (USD)
  recommendation: string;         // Human-readable recommendation
}
```

### Monte Carlo Result

```typescript
interface MonteCarloResult {
  expectedReturn: number;         // Expected return percentage
  volatility: number;             // Price volatility
  var95: number;                  // 95% Value at Risk
  var99: number;                  // 99% Value at Risk
  bestCase: number;               // Best case scenario return
  worstCase: number;              // Worst case scenario return
  probabilityOfProfit: number;    // Probability of positive return (0-100)
  expectedPrice: number;          // Expected future price
  priceRange: {
    low: number;                  // 95% confidence interval low
    high: number;                 // 95% confidence interval high
  };
}
```

---

## ❌ Error Handling

### Error Response Format

All endpoints return errors in a consistent format:

```json
{
  "success": false,
  "error": "Error category",
  "message": "Human-readable error description",
  "details": {
    "code": "ERROR_CODE",
    "timestamp": "2025-10-13T08:20:00.000Z"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description | Solution |
|------|-------------|-------------|----------|
| `AGENT_NOT_INITIALIZED` | 500 | Agent failed to initialize | Check server logs, restart server |
| `HUNT_FAILED` | 500 | Error during hunt execution | Check external API connectivity |
| `NO_OPPORTUNITIES` | 404 | No opportunities found in last hunt | Run POST /hunt first |
| `INVALID_CATEGORY` | 400 | Invalid category filter | Use: arbitrage, trading, or affiliate |
| `INVALID_SCORE` | 400 | Score must be 0-100 | Provide valid number |
| `MISSING_OPPORTUNITY` | 404 | Opportunity not found | Check opportunity ID |
| `TRADE_EXECUTION_FAILED` | 500 | Trade failed to execute | Check logs for details |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests | Wait before retrying |

### Error Handling Examples

```javascript
// JavaScript error handling
try {
  const response = await axios.post('/api/aladdin/hunt');
  if (!response.data.success) {
    console.error('Hunt failed:', response.data.error);
  }
} catch (error) {
  if (error.response?.status === 429) {
    console.log('Rate limited - waiting 60 seconds...');
    await sleep(60000);
  } else {
    console.error('API error:', error.response?.data || error.message);
  }
}
```

---

## 💻 Code Examples

### JavaScript / Node.js

```javascript
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/aladdin';

// 1. Check agent health
async function checkHealth() {
  const response = await axios.get(`${BASE_URL}/health`);
  console.log('Agent status:', response.data.status);
  return response.data;
}

// 2. Run money hunt
async function runHunt() {
  const response = await axios.post(`${BASE_URL}/hunt`);
  const { opportunities, plan, analytics } = response.data.data;
  
  console.log(`Found ${opportunities.length} opportunities`);
  console.log(`Estimated daily profit: $${analytics.estimatedDailyProfit}`);
  
  return response.data.data;
}

// 3. Get high-score arbitrage opportunities
async function getArbitrageOpportunities() {
  const response = await axios.get(`${BASE_URL}/opportunities`, {
    params: {
      category: 'arbitrage',
      minScore: 75,
      limit: 10
    }
  });
  
  return response.data.data.opportunities;
}

// 4. Analyze specific opportunity
async function analyzeOpportunity() {
  const response = await axios.post(`${BASE_URL}/analyze`, {
    type: 'arbitrage',
    symbol: 'BTC',
    buyPrice: 45000,
    sellPrice: 45200,
    amount: 1000
  });
  
  const analysis = response.data.data;
  console.log('Profitability:', analysis.profitability);
  console.log('Risk:', analysis.risk);
  console.log('Recommendation:', analysis.recommendation);
  
  return analysis;
}

// 5. Get statistics
async function getStats() {
  const response = await axios.get(`${BASE_URL}/stats`);
  const stats = response.data.data;
  
  console.log('Portfolio value:', stats.portfolio.totalValue);
  console.log('Monthly profit potential:', stats.performance.estimatedMonthlyProfit);
  
  return stats;
}

// Complete workflow
async function completeWorkflow() {
  // Check health
  await checkHealth();
  
  // Run hunt
  const results = await runHunt();
  
  // Filter for high-score opportunities
  const bestOpps = results.opportunities.filter(o => o.score > 80);
  
  // Analyze top opportunity
  if (bestOpps.length > 0) {
    const best = bestOpps[0];
    const analysis = await analyzeOpportunity();
    
    if (analysis.risk.approved && analysis.profitability.worthIt) {
      console.log('✅ Opportunity approved for execution!');
    }
  }
  
  // Get final stats
  await getStats();
}

completeWorkflow();
```

---

### Python

```python
import requests
import json

BASE_URL = "http://localhost:5000/api/aladdin"

def check_health():
    """Check if agent is running"""
    response = requests.get(f"{BASE_URL}/health")
    data = response.json()
    print(f"Agent status: {data['status']}")
    return data

def run_hunt():
    """Run money hunting session"""
    response = requests.post(f"{BASE_URL}/hunt")
    data = response.json()
    
    if data['success']:
        opportunities = data['data']['opportunities']
        print(f"Found {len(opportunities)} opportunities")
        
        # Get high-priority opportunities
        high_priority = [o for o in opportunities if o['priority'] == 'high']
        print(f"High priority: {len(high_priority)}")
        
        return data['data']
    else:
        print(f"Error: {data['error']}")
        return None

def get_arbitrage_opportunities(min_score=70):
    """Get arbitrage opportunities above minimum score"""
    params = {
        'category': 'arbitrage',
        'minScore': min_score,
        'limit': 20
    }
    
    response = requests.get(f"{BASE_URL}/opportunities", params=params)
    data = response.json()
    
    return data['data']['opportunities']

def analyze_opportunity(opp_data):
    """Analyze a specific opportunity"""
    response = requests.post(f"{BASE_URL}/analyze", json=opp_data)
    data = response.json()
    
    if data['success']:
        analysis = data['data']
        print(f"Profit: ${analysis['profitability']['profit']:.2f}")
        print(f"Risk: {analysis['risk']['riskLevel']}")
        print(f"Recommendation: {analysis['recommendation']}")
        
        return analysis
    else:
        print(f"Analysis failed: {data['error']}")
        return None

# Example usage
if __name__ == "__main__":
    # Check health
    check_health()
    
    # Run hunt
    results = run_hunt()
    
    # Get best arbitrage opportunities
    arb_opps = get_arbitrage_opportunities(min_score=75)
    
    # Analyze top opportunity
    if arb_opps:
        best = arb_opps[0]
        analyze_opportunity({
            'type': 'arbitrage',
            'symbol': best.get('symbol'),
            'buyPrice': best.get('buyPrice'),
            'sellPrice': best.get('sellPrice'),
            'amount': 1000
        })
```

---

### cURL

```bash
# 1. Health check
curl -X GET http://localhost:5000/api/aladdin/health

# 2. Run money hunt
curl -X POST http://localhost:5000/api/aladdin/hunt \
  -H "Content-Type: application/json"

# 3. Get arbitrage opportunities with score > 70
curl -X GET "http://localhost:5000/api/aladdin/opportunities?category=arbitrage&minScore=70"

# 4. Analyze opportunity
curl -X POST http://localhost:5000/api/aladdin/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "type": "arbitrage",
    "symbol": "BTC",
    "buyPrice": 45000,
    "sellPrice": 45200,
    "amount": 1000
  }'

# 5. Get statistics
curl -X GET http://localhost:5000/api/aladdin/stats

# 6. Execute trade (simulation)
curl -X POST http://localhost:5000/api/aladdin/execute \
  -H "Content-Type: application/json" \
  -d '{
    "opportunityId": "arb-BTC-binance-coinbase",
    "amount": 1000
  }'
```

---

## 🔗 Integration Guide

### Step 1: Start the Backend

```bash
cd backend
npm install
npm start
```

Server will start on `http://localhost:5000`

### Step 2: Verify Agent is Running

```bash
curl http://localhost:5000/api/aladdin/health

# Expected: "status": "healthy"
```

### Step 3: Run Your First Hunt

```bash
curl -X POST http://localhost:5000/api/aladdin/hunt | jq '.'
```

### Step 4: Filter Opportunities

```javascript
// Get only high-priority arbitrage opportunities
const response = await axios.get('/api/aladdin/opportunities', {
  params: {
    category: 'arbitrage',
    minScore: 80
  }
});

const topOpps = response.data.data.opportunities;
```

### Step 5: Analyze Before Executing

```javascript
// Always analyze before executing
const analysis = await axios.post('/api/aladdin/analyze', opportunity);

if (analysis.data.data.risk.approved && 
    analysis.data.data.profitability.worthIt) {
  // Safe to proceed
  console.log('✅ Opportunity approved!');
} else {
  console.log('❌ Opportunity rejected:', analysis.data.data.recommendation);
}
```

---

## ⚡ Best Practices

### 1. Always Check Health First

```javascript
const health = await axios.get('/api/aladdin/health');
if (health.data.status !== 'healthy') {
  throw new Error('Agent not ready');
}
```

### 2. Cache Hunt Results

```javascript
// Don't call /hunt too frequently (it's expensive)
// Cache results for at least 1 minute

let cachedResults = null;
let lastHunt = 0;

async function getOpportunities() {
  const now = Date.now();
  
  if (!cachedResults || (now - lastHunt) > 60000) {
    const response = await axios.post('/api/aladdin/hunt');
    cachedResults = response.data.data.opportunities;
    lastHunt = now;
  }
  
  return cachedResults;
}
```

### 3. Always Analyze High-Risk Opportunities

```javascript
// Never execute without analysis for scores < 80
if (opp.score < 80) {
  const analysis = await axios.post('/api/aladdin/analyze', opp);
  if (!analysis.data.data.risk.approved) {
    console.log('Skipping - risk too high');
    return;
  }
}
```

### 4. Handle Rate Limits

```javascript
// Add retry logic with exponential backoff
async function apiCallWithRetry(apiCall, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      if (error.response?.status === 429) {
        const waitTime = Math.pow(2, i) * 1000;
        console.log(`Rate limited - waiting ${waitTime}ms...`);
        await sleep(waitTime);
      } else {
        throw error;
      }
    }
  }
}
```

### 5. Monitor Performance

```javascript
// Track response times
const startTime = Date.now();
const response = await axios.post('/api/aladdin/hunt');
const duration = Date.now() - startTime;

console.log(`Hunt completed in ${duration}ms`);

if (duration > 5000) {
  console.warn('⚠️ Slow response - check agent performance');
}
```

---

## 🚨 Troubleshooting

### Agent Returns No Opportunities

**Problem:** `opportunities` array is empty

**Solutions:**
1. Check market volatility (low volatility = fewer arbitrage opportunities)
2. Adjust minimum profit threshold in agent config
3. Check external API connectivity
4. Review agent logs for errors

### High Response Times

**Problem:** `/hunt` endpoint takes > 5 seconds

**Solutions:**
1. Enable caching in DataAgent
2. Reduce Monte Carlo simulation count
3. Filter exchanges to most liquid only
4. Check Redis connection for caching

### Risk Assessments Too Conservative

**Problem:** All opportunities show `approved: false`

**Solutions:**
1. Adjust `maxRiskPercent` in agent config (default: 2%)
2. Increase `riskTolerance` setting
3. Review stop-loss calculations
4. Check if position sizing is too small

### Arbitrage Opportunities Not Profitable

**Problem:** All arbitrage shows `worthIt: false`

**Solutions:**
1. Check if fees are too high (default: 0.1%)
2. Adjust minimum profit threshold (default: 0.5%)
3. Look at different symbol pairs
4. Check exchange spread percentages

---

## 📈 Rate Limits

### Per Endpoint Limits

| Endpoint | Rate Limit | Window |
|----------|-----------|--------|
| `/health` | 60 req/min | 1 minute |
| `/hunt` | 6 req/min | 1 minute |
| `/opportunities` | 30 req/min | 1 minute |
| `/analyze` | 20 req/min | 1 minute |
| `/stats` | 30 req/min | 1 minute |
| `/execute` | 2 req/min | 1 minute |

**Response when rate limited:**
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "message": "Too many requests, please try again later",
  "details": {
    "retryAfter": 60,
    "limit": 6,
    "window": "1 minute"
  }
}
```

---

## 🎯 Common Use Cases

### Use Case 1: Find Quick Arbitrage Opportunities

```javascript
async function findQuickArbitrage() {
  // Run hunt
  const hunt = await axios.post('/api/aladdin/hunt');
  
  // Filter for immediate arbitrage
  const quickOpps = hunt.data.data.plan.immediate;
  
  // Analyze each one
  for (const opp of quickOpps) {
    if (opp.opportunity.category === 'arbitrage') {
      console.log(`Found: ${opp.opportunity.symbol}`);
      console.log(`Profit: $${opp.opportunity.profit.toFixed(2)}`);
      console.log(`Execute in: ${opp.opportunity.timeToExecute}`);
    }
  }
}
```

### Use Case 2: Build Trading Dashboard

```javascript
async function getDashboardData() {
  // Get latest stats
  const stats = await axios.get('/api/aladdin/stats');
  
  // Get high-priority opportunities
  const opps = await axios.get('/api/aladdin/opportunities', {
    params: { minScore: 70, limit: 10 }
  });
  
  return {
    portfolio: stats.data.data.portfolio,
    topOpportunities: opps.data.data.opportunities,
    projectedProfit: stats.data.data.performance.estimatedMonthlyProfit,
    lastUpdate: stats.data.data.lastHunt
  };
}
```

### Use Case 3: Automated Trading Bot

```javascript
async function automatedTrading() {
  // Run hunt every 5 minutes
  setInterval(async () => {
    const results = await axios.post('/api/aladdin/hunt');
    const opportunities = results.data.data.opportunities;
    
    // Find high-confidence arbitrage
    const safeArbitrage = opportunities.filter(o => 
      o.category === 'arbitrage' &&
      o.score > 85 &&
      o.risk.approved &&
      o.profitPercent > 0.5
    );
    
    // Execute if found
    for (const opp of safeArbitrage) {
      console.log(`🚀 Executing arbitrage: ${opp.symbol}`);
      await axios.post('/api/aladdin/execute', {
        opportunityId: opp.id,
        amount: opp.risk.positionSize
      });
    }
  }, 300000); // 5 minutes
}
```

---

## 🔐 Authentication

**Current:** No authentication required (development mode)

**Production:** Will require JWT authentication

```http
Authorization: Bearer <your_jwt_token>
```

---

## 📊 Response Time Expectations

| Endpoint | Typical | Maximum |
|----------|---------|---------|
| `/health` | 10ms | 50ms |
| `/hunt` | 2-4 seconds | 10 seconds |
| `/opportunities` | 50ms | 200ms |
| `/analyze` | 100ms | 500ms |
| `/stats` | 50ms | 200ms |
| `/execute` | 500ms | 2 seconds |

---

## 🚀 Advanced Features

### Real-time Monitoring

```javascript
// Subscribe to agent events (WebSocket - coming soon!)
const socket = io('http://localhost:5000');

socket.on('opportunity_found', (opportunity) => {
  console.log('🚨 New opportunity:', opportunity);
});

socket.on('trade_executed', (trade) => {
  console.log('✅ Trade executed:', trade);
});
```

### Batch Analysis

```javascript
// Analyze multiple opportunities at once
async function batchAnalyze(opportunities) {
  const analyses = await Promise.all(
    opportunities.map(opp => 
      axios.post('/api/aladdin/analyze', opp)
    )
  );
  
  return analyses.map(a => a.data.data);
}
```

---

## 📝 Changelog

### Version 1.0.0 (2025-10-13)
- Initial release
- 4-agent system operational
- 6 API endpoints
- Monte Carlo simulation
- Arbitrage detection
- Pattern recognition
- Risk management

---

## 🤝 Support

**Issues:** Create an issue on GitHub  
**Questions:** Check troubleshooting section first  
**Feature Requests:** Submit via GitHub issues

---

## 📜 License

MIT License - See LICENSE file for details

---

**Mini-Aladdin API - Making money with multi-agent intelligence! 💰🤖**

