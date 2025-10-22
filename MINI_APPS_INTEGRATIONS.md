# 🔌 Mini-Apps API & MCP Integrations

**Project**: Amrikyy AI OS - Mini-Apps Integration Plan  
**Date**: October 22, 2025  
**Status**: Implementation Ready

---

## 🎯 OVERVIEW

Each mini-app agent uses specific APIs and MCP servers to provide specialized services.

---

## ✈️ TRAVEL AGENCY AGENT

### **Google APIs** (Primary)
```javascript
{
  "Google Maps API": {
    "services": [
      "Places API - Search hotels, restaurants, attractions",
      "Directions API - Route planning",
      "Geocoding API - Address to coordinates",
      "Distance Matrix API - Travel time calculations",
      "Places Details API - Detailed location info",
      "Places Photos API - Location images"
    ],
    "cost": "Free tier: $200/month credit",
    "setup": "GOOGLE_MAPS_API_KEY in .env"
  },
  
  "Google Flights API": {
    "services": [
      "Flight search",
      "Price tracking",
      "Flight details"
    ],
    "alternative": "Use Gemini to generate realistic flight data",
    "cost": "Part of Google Cloud"
  },
  
  "Google Hotels API": {
    "services": [
      "Hotel search",
      "Price comparison",
      "Availability check"
    ],
    "alternative": "Use Gemini + Places API",
    "cost": "Part of Google Cloud"
  }
}
```

### **Third-Party APIs** (Optional)
```javascript
{
  "Amadeus API": {
    "services": [
      "Real flight data",
      "Hotel bookings",
      "Airport info"
    ],
    "cost": "Free tier available",
    "url": "https://developers.amadeus.com"
  },
  
  "Skyscanner API": {
    "services": [
      "Flight search",
      "Price alerts"
    ],
    "cost": "Contact for pricing",
    "url": "https://partners.skyscanner.net"
  },
  
  "Booking.com API": {
    "services": [
      "Hotel search",
      "Real-time availability"
    ],
    "cost": "Affiliate program",
    "url": "https://www.booking.com/affiliate"
  },
  
  "OpenWeather API": {
    "services": [
      "Weather forecasts",
      "Historical weather"
    ],
    "cost": "Free tier: 1000 calls/day",
    "url": "https://openweathermap.org/api"
  }
}
```

### **MCP Servers**
```javascript
{
  "filesystem": {
    "use": "Store travel documents, itineraries",
    "operations": ["read", "write", "list"]
  },
  
  "memory": {
    "use": "Remember user preferences, past trips",
    "operations": ["store", "retrieve", "search"]
  },
  
  "sequential-thinking": {
    "use": "Complex itinerary planning",
    "operations": ["plan", "optimize", "validate"]
  },
  
  "puppeteer": {
    "use": "Scrape flight/hotel prices from websites",
    "operations": ["navigate", "extract", "screenshot"]
  }
}
```

### **Environment Variables**
```bash
# Google APIs
GOOGLE_MAPS_API_KEY=your-key
GOOGLE_CLOUD_API_KEY=your-key

# Third-Party APIs (Optional)
AMADEUS_API_KEY=your-key
AMADEUS_API_SECRET=your-secret
SKYSCANNER_API_KEY=your-key
BOOKING_API_KEY=your-key
OPENWEATHER_API_KEY=your-key
```

---

## ✍️ CONTENT CREATOR AGENT

### **Google AI APIs** (Primary)
```javascript
{
  "Gemini Pro 2.5": {
    "services": [
      "Blog writing",
      "Social media posts",
      "Video scripts",
      "SEO optimization"
    ],
    "model": "gemini-2.5-pro",
    "cost": "Student Pack - Free",
    "setup": "GEMINI_API_KEY + GEMINI_PRO_MODEL"
  },
  
  "Imagen 3": {
    "services": [
      "Image generation",
      "Thumbnail creation",
      "Social media graphics",
      "Blog post images"
    ],
    "model": "imagen-3.0-generate-001",
    "cost": "Pay per image",
    "status": "Coming soon - Use placeholder for now"
  },
  
  "Veo 3": {
    "services": [
      "AI video generation",
      "Video editing",
      "Shorts creation"
    ],
    "model": "veo-3",
    "cost": "Pay per video",
    "status": "Coming soon - Use placeholder for now"
  },
  
  "NotebookLM": {
    "services": [
      "Research synthesis",
      "Content research",
      "Source analysis",
      "Knowledge extraction"
    ],
    "url": "https://notebooklm.google.com",
    "cost": "Free",
    "integration": "Use Gemini to simulate NotebookLM capabilities"
  }
}
```

### **YouTube API**
```javascript
{
  "YouTube Data API v3": {
    "services": [
      "Video upload",
      "Channel management",
      "Analytics",
      "Comments management"
    ],
    "cost": "Free tier: 10,000 units/day",
    "auth": "OAuth 2.0 required",
    "setup": "YOUTUBE_API_KEY + OAuth credentials"
  }
}
```

### **Third-Party APIs** (Optional)
```javascript
{
  "Unsplash API": {
    "services": [
      "Stock photos",
      "Free images"
    ],
    "cost": "Free tier: 50 requests/hour",
    "url": "https://unsplash.com/developers"
  },
  
  "Pexels API": {
    "services": [
      "Stock photos",
      "Stock videos"
    ],
    "cost": "Free",
    "url": "https://www.pexels.com/api"
  },
  
  "Grammarly API": {
    "services": [
      "Grammar checking",
      "Style suggestions"
    ],
    "cost": "Premium feature",
    "alternative": "Use Gemini for grammar"
  }
}
```

### **MCP Servers**
```javascript
{
  "filesystem": {
    "use": "Store generated content, drafts",
    "operations": ["write", "read", "organize"]
  },
  
  "memory": {
    "use": "Remember writing style, preferences",
    "operations": ["store", "retrieve", "learn"]
  },
  
  "sequential-thinking": {
    "use": "Content planning, structure",
    "operations": ["outline", "organize", "optimize"]
  },
  
  "puppeteer": {
    "use": "Research, competitor analysis",
    "operations": ["scrape", "analyze", "extract"]
  },
  
  "github": {
    "use": "Version control for content",
    "operations": ["commit", "push", "track"]
  }
}
```

### **Environment Variables**
```bash
# Google AI
GEMINI_API_KEY=your-key
GEMINI_PRO_MODEL=gemini-2.5-pro
GOOGLE_AI_API_KEY=your-key

# YouTube
YOUTUBE_API_KEY=your-key
YOUTUBE_CLIENT_ID=your-client-id
YOUTUBE_CLIENT_SECRET=your-secret

# Optional
UNSPLASH_API_KEY=your-key
PEXELS_API_KEY=your-key
```

---

## 💡 INNOVATION AGENT

### **Google APIs** (Primary)
```javascript
{
  "Gemini Pro 2.5": {
    "services": [
      "Idea generation",
      "Market analysis",
      "Trend forecasting",
      "Business validation"
    ],
    "model": "gemini-2.5-pro",
    "cost": "Student Pack - Free",
    "setup": "GEMINI_API_KEY + GEMINI_PRO_MODEL"
  },
  
  "Google Search API": {
    "services": [
      "Market research",
      "Competitor analysis",
      "Trend data"
    ],
    "cost": "Free tier: 100 queries/day",
    "setup": "GOOGLE_SEARCH_API_KEY + SEARCH_ENGINE_ID"
  },
  
  "Google Trends API": {
    "services": [
      "Trend analysis",
      "Search volume data",
      "Geographic insights"
    ],
    "cost": "Free",
    "url": "https://trends.google.com"
  }
}
```

### **Third-Party APIs** (Optional)
```javascript
{
  "Crunchbase API": {
    "services": [
      "Startup data",
      "Funding information",
      "Company profiles"
    ],
    "cost": "Paid plans from $29/month",
    "url": "https://data.crunchbase.com"
  },
  
  "Product Hunt API": {
    "services": [
      "Product launches",
      "Trending products",
      "Market validation"
    ],
    "cost": "Free",
    "url": "https://api.producthunt.com"
  },
  
  "CB Insights API": {
    "services": [
      "Market intelligence",
      "Industry trends",
      "Competitive analysis"
    ],
    "cost": "Enterprise pricing",
    "url": "https://www.cbinsights.com"
  },
  
  "Statista API": {
    "services": [
      "Market statistics",
      "Industry data",
      "Consumer insights"
    ],
    "cost": "Paid subscription",
    "url": "https://www.statista.com"
  }
}
```

### **MCP Servers**
```javascript
{
  "filesystem": {
    "use": "Store research, business plans",
    "operations": ["write", "organize", "archive"]
  },
  
  "memory": {
    "use": "Remember past ideas, user preferences",
    "operations": ["store", "retrieve", "connect"]
  },
  
  "sequential-thinking": {
    "use": "Complex analysis, validation",
    "operations": ["analyze", "validate", "score"]
  },
  
  "puppeteer": {
    "use": "Web scraping for market research",
    "operations": ["scrape", "extract", "monitor"]
  },
  
  "context7": {
    "use": "Deep context understanding",
    "operations": ["analyze", "synthesize", "connect"]
  }
}
```

### **Environment Variables**
```bash
# Google APIs
GEMINI_API_KEY=your-key
GEMINI_PRO_MODEL=gemini-2.5-pro
GOOGLE_SEARCH_API_KEY=your-key
GOOGLE_SEARCH_ENGINE_ID=your-id

# Optional
CRUNCHBASE_API_KEY=your-key
PRODUCT_HUNT_API_KEY=your-key
```

---

## 🔧 MCP SERVER SETUP

### **Essential MCP Servers** (Already Available)
```bash
# Install MCP servers
npm install @modelcontextprotocol/server-filesystem
npm install @modelcontextprotocol/server-memory
npm install @modelcontextprotocol/server-sequential-thinking
```

### **Optional MCP Servers**
```bash
# Advanced features
npm install @modelcontextprotocol/server-puppeteer
npm install @modelcontextprotocol/server-github
npm install @modelcontextprotocol/server-context7
```

### **MCP Configuration**
```javascript
// backend/src/services/MCPServerManager.js
const MCPServerManager = require('./src/services/MCPServerManager');

const manager = new MCPServerManager();
await manager.initialize();

// Available servers
const servers = {
  filesystem: manager.getServer('filesystem'),
  memory: manager.getServer('memory'),
  sequentialThinking: manager.getServer('sequential-thinking'),
  puppeteer: manager.getServer('puppeteer'), // Optional
  github: manager.getServer('github'), // Optional
  context7: manager.getServer('context7') // Optional
};
```

---

## 📊 COST BREAKDOWN

### **Free Tier (Recommended for MVP)**
```
✅ Gemini Pro 2.5 (Student Pack) - FREE
✅ Google Maps API - $200/month credit (FREE)
✅ Google Search API - 100 queries/day (FREE)
✅ YouTube API - 10,000 units/day (FREE)
✅ OpenWeather API - 1000 calls/day (FREE)
✅ Unsplash API - 50 requests/hour (FREE)
✅ Pexels API - Unlimited (FREE)
✅ Product Hunt API - Unlimited (FREE)

Total: $0/month for MVP
```

### **Paid Tier (For Scale)**
```
💰 Gemini Pro 2.5 - $0.00125/1K chars (after Student Pack)
💰 Google Maps API - $5-$40 per 1000 requests
💰 Amadeus API - Custom pricing
💰 Crunchbase API - $29-$299/month
💰 Imagen 3 - ~$0.02-$0.10 per image
💰 Veo 3 - ~$0.50-$2.00 per video

Estimated: $50-$200/month for production
```

---

## 🚀 IMPLEMENTATION PRIORITY

### **Phase 1: Core (Week 1)**
1. ✅ Gemini Pro 2.5 - Already configured
2. ✅ MCP Filesystem - Already available
3. ✅ MCP Memory - Already available
4. ⏳ Google Maps API - Need API key
5. ⏳ Google Search API - Need API key

### **Phase 2: Enhanced (Week 2)**
6. ⏳ YouTube API - Need OAuth setup
7. ⏳ OpenWeather API - Need API key
8. ⏳ Unsplash/Pexels API - Need API keys
9. ⏳ MCP Puppeteer - Optional
10. ⏳ MCP Sequential Thinking - Already available

### **Phase 3: Advanced (Week 3-4)**
11. ⏳ Imagen 3 - When available
12. ⏳ Veo 3 - When available
13. ⏳ Amadeus API - For real flight data
14. ⏳ Crunchbase API - For startup data
15. ⏳ MCP Context7 - Optional

---

## 📝 SETUP CHECKLIST

### **Required Now**
- [x] Gemini API Key (Already have)
- [ ] Google Maps API Key
- [ ] Google Search API Key + Search Engine ID
- [ ] OpenWeather API Key

### **Recommended Soon**
- [ ] YouTube API Key + OAuth
- [ ] Unsplash API Key
- [ ] Pexels API Key

### **Optional Later**
- [ ] Amadeus API credentials
- [ ] Crunchbase API Key
- [ ] Product Hunt API Key
- [ ] Imagen 3 access
- [ ] Veo 3 access

---

## 🔐 SECURITY NOTES

1. **Never commit API keys** - Use .env files
2. **Rate limiting** - Implement for all APIs
3. **Error handling** - Graceful fallbacks
4. **Caching** - Use Redis to reduce API calls
5. **Monitoring** - Track API usage and costs

---

## 📚 DOCUMENTATION LINKS

### **Google APIs**
- Maps: https://developers.google.com/maps
- Search: https://developers.google.com/custom-search
- YouTube: https://developers.google.com/youtube
- Gemini: https://ai.google.dev/docs

### **MCP Servers**
- Docs: https://modelcontextprotocol.io
- GitHub: https://github.com/modelcontextprotocol

### **Third-Party**
- Amadeus: https://developers.amadeus.com
- OpenWeather: https://openweathermap.org/api
- Unsplash: https://unsplash.com/developers
- Pexels: https://www.pexels.com/api

---

**Ready to implement! Start with Phase 1 APIs.** 🚀
