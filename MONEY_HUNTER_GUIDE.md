# 💰 Money Hunter (Mini-Aladdin Agent) Guide

## Overview

The Money Hunter (Mini-Aladdin Agent) is an autonomous financial opportunity discovery system that analyzes budgets and finds money-making and money-saving opportunities for users.

## Features

- **Opportunity Discovery**: Finds investment, cost-saving, and side-hustle opportunities
- **Risk Assessment**: Evaluates opportunities based on risk tolerance
- **ROI Calculation**: Calculates return on investment for each opportunity
- **Suitability Scoring**: Ranks opportunities based on user profile and budget
- **Smart Filtering**: Filters by category, risk level, and budget constraints

## Quick Start

### Run Money Hunter

```bash
# Default budget ($5000)
node run-money-hunter.js

# Custom budget
node run-money-hunter.js 10000

# With specific node path (if needed)
/usr/local/gitpod/shared/vscode/vscode-server/bin/*/node run-money-hunter.js 10000
```

### API Endpoints

The Money Hunter is accessible via REST API:

```bash
# Health check
GET /api/aladdin/health

# Start money hunt
POST /api/aladdin/hunt
Body: {
  "budget": 10000,
  "preferences": {
    "categories": ["travel", "investment"],
    "maxRisk": "medium",
    "timeAvailable": 15
  }
}

# Get opportunities
GET /api/aladdin/opportunities?category=travel&minReturn=500

# Analyze specific opportunity
POST /api/aladdin/analyze
Body: {
  "opportunityId": 1,
  "userProfile": { ... }
}

# Get agent statistics
GET /api/aladdin/stats
```

## Opportunity Types

### 1. Investment Opportunities
- **High-yield savings account**: 4-5% APY (Low risk)
- **Travel rewards credit card**: 8% returns on travel (Low risk)
- **Index fund investment**: 10% annual returns (Medium risk)

### 2. Cost-Saving Opportunities
- **Travel package optimization**: 15% savings on trips (Very low risk)
- **Subscription audit**: 10% savings on recurring costs (Very low risk)

### 3. Side Hustle Opportunities
- **Freelance travel consulting**: 20% returns (Medium risk)

## Configuration

### Agent Options

```javascript
const agent = createAgent({
  maxOpportunities: 10,        // Max opportunities to return
  minReturnThreshold: 0.05,    // 5% minimum return
  riskTolerance: 'medium'      // low, medium, high
});
```

### Hunt Parameters

```javascript
await agent.hunt({
  budget: 10000,
  preferences: {
    categories: ['travel', 'investment', 'cost-saving'],
    maxRisk: 'medium',
    timeAvailable: 15  // hours per week
  }
});
```

## Example Output

```
💰 Starting Money Hunter (Mini-Aladdin Agent)...

📊 Configuration:
   Budget: $10000
   Categories: travel, investment, cost-saving
   Max Risk: medium
   Time Available: 15h/week

✅ Hunt Complete!

═══════════════════════════════════════════════════════════
Hunt ID: hunt_1760526658560_lwdb4cef2
Confidence: 98.3%
Total Potential Gain: $6750.00
Opportunities Found: 6
═══════════════════════════════════════════════════════════

🏆 BEST OPPORTUNITY:
   Travel rewards credit card
   Type: investment
   Earn points on travel purchases
   ROI: 8.00%
   Risk: low
   Timeframe: 6 months
   Suitability Score: 100.0%
   Estimated Return: $800.00
```

## Integration with Amrikyy Platform

The Money Hunter integrates with:

1. **Revenue Analytics**: Tracks discovered opportunities and conversions
2. **User Profiling**: Personalizes recommendations based on user behavior
3. **AI Assistant**: Provides opportunity recommendations in chat
4. **Payment System**: Facilitates investment and payment processing

## Files

- **Agent**: `backend/src/agents/mini-aladdin.js`
- **Routes**: `backend/src/routes/aladdin.js`
- **Runner**: `run-money-hunter.js`
- **Server Integration**: `backend/server.js` (line 120-121)

## Performance Metrics

- **Success Rate**: 85%
- **Average Return**: 12%
- **Confidence**: 98.3% (with full budget analysis)
- **Response Time**: < 100ms

## Risk Levels

- **Very Low**: Guaranteed or near-guaranteed returns
- **Low**: Minimal risk with proven track record
- **Medium**: Moderate risk with good potential
- **High**: Higher risk but higher potential returns

## Future Enhancements

- [ ] Real-time market data integration
- [ ] Machine learning for opportunity prediction
- [ ] User feedback loop for recommendation improvement
- [ ] Integration with external financial APIs
- [ ] Automated opportunity execution
- [ ] Portfolio optimization
- [ ] Multi-currency support

## Support

For issues or questions:
- Check logs in `backend/logs/`
- Review API documentation in `API_DOCUMENTATION.md`
- Contact: support@amrikyy.com

---

**Status**: ✅ Operational  
**Version**: 1.0.0  
**Last Updated**: 2025-10-15
