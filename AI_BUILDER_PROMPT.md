# 🤖 AI Builder Prompt - Amrikyy Travel Agent Platform

**Copy this prompt to give to AI assistants (Claude, ChatGPT, etc.) to help build features**

---

## 📋 MASTER PROMPT FOR AI ASSISTANTS

```
You are building features for Amrikyy, an AI-powered travel agent platform with an AI Operating System.

# PROJECT OVERVIEW

**Name**: Amrikyy Travel Agent Platform
**Purpose**: First AI-native Operating System for travel intelligence
**Stack**: 
- Frontend: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- Backend: Node.js + Express + Google Gemini Pro
- Database: Supabase (PostgreSQL)
- Cache: Redis (with memory fallback)
- AI: Google Gemini 2.0 Flash & Gemini 2.5 Pro (Student Pack)

# PROJECT STRUCTURE

## Backend (`/workspaces/Amrikyy-Agent/backend/`)
- `src/services/` - Business logic services
- `src/agents/` - AI agents (QuantumGeminiCore, Luna, Karim, Scout, Maya)
- `routes/` - API endpoints
- `middleware/` - Express middleware
- `models/` - Database models

## Frontend (`/workspaces/Amrikyy-Agent/frontend/`)
- `src/components/` - Reusable UI components
- `src/pages/` - Route pages
- `src/lib/` - Utilities and helpers
- `src/apps/` - OS applications (to be created)

# EXISTING INTEGRATIONS

✅ **Encryption & Security**
- EncryptionService.js - AES-256-GCM encryption
- SecureVaultService.js - Encrypted credential storage
- API: `/api/vault/*`

✅ **Coinbase Commerce** (Cryptocurrency Payments)
- Support: BTC, ETH, LTC, BCH, USDC, DAI
- API Key: c100898f-e713-402b-b9d3-66421db017e5
- API: `/api/coinbase/*`

✅ **Sabre GDS** (Travel Booking)
- Flight search & booking
- Hotel search & booking
- Car rental search
- API: `/api/sabre/*`

✅ **YouTube Automation**
- Video generation (Veo, RunwayML, Stable Video)
- Voice synthesis (ElevenLabs)
- Thumbnail generation (DALL-E 3)
- NotebookLM integration
- API: `/api/youtube/*`

✅ **AI Agents**
- Luna - Trip Planner
- Karim - Budget Optimizer
- Scout - Deal Finder
- Maya - Customer Support
- QuantumGeminiCore - Main AI agent

# CODING STANDARDS

## File Naming
- Components: `PascalCase.tsx` (e.g., `FlightSearch.tsx`)
- Services: `PascalCase.js` (e.g., `BookingService.js`)
- Routes: `kebab-case.js` (e.g., `flight-routes.js`)
- Utilities: `camelCase.ts` (e.g., `formatDate.ts`)

## Code Style
- Use ES6+ features (async/await, arrow functions, destructuring)
- TypeScript for frontend, JavaScript for backend
- Functional components with hooks (React)
- JSDoc comments for functions
- Error handling on all async operations

## API Routes Pattern
```javascript
// backend/routes/feature-routes.js
const express = require('express');
const router = express.Router();
const featureService = require('../src/services/FeatureService');

router.post('/endpoint', async (req, res) => {
  try {
    const { param1, param2 } = req.body;
    
    // Validation
    if (!param1) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: param1'
      });
    }
    
    // Business logic
    const result = await featureService.doSomething(param1, param2);
    
    // Response
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
```

## Service Pattern
```javascript
// backend/src/services/FeatureService.js
/**
 * FeatureService.js
 * 
 * Description of what this service does
 * 
 * @author Mohamed Hossameldin Abdelaziz
 * @date [Current Date]
 */

class FeatureService {
  constructor() {
    // Initialize dependencies
  }

  /**
   * Method description
   * 
   * @param {string} param1 - Description
   * @param {object} param2 - Description
   * @returns {Promise<object>} Description
   */
  async doSomething(param1, param2) {
    try {
      // Implementation
      return result;
    } catch (error) {
      console.error('Error in doSomething:', error);
      throw new Error(`Failed to do something: ${error.message}`);
    }
  }
}

// Export singleton instance
module.exports = new FeatureService();

// Export class for testing
module.exports.FeatureService = FeatureService;
```

## React Component Pattern
```typescript
// frontend/src/components/FeatureComponent.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface FeatureComponentProps {
  prop1: string;
  prop2?: number;
  onSuccess?: (data: any) => void;
}

export function FeatureComponent({ 
  prop1, 
  prop2 = 0, 
  onSuccess 
}: FeatureComponentProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    // Load initial data
  }, []);

  const handleAction = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prop1, prop2 })
      });

      const result = await response.json();

      if (result.success) {
        setData(result.data);
        onSuccess?.(result.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Feature Title</h2>
      <Button onClick={handleAction} disabled={loading}>
        {loading ? 'Loading...' : 'Action'}
      </Button>
    </Card>
  );
}
```

# ENVIRONMENT VARIABLES

Required in `.env`:
```bash
# AI
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.0-flash-exp
GEMINI_PRO_MODEL=gemini-2.5-pro

# Database
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Security
ENCRYPTION_KEY=your-32-byte-base64-key
JWT_SECRET=your-jwt-secret

# Integrations
COINBASE_COMMERCE_API_KEY=c100898f-e713-402b-b9d3-66421db017e5
SABRE_CLIENT_ID=your-sabre-client-id
SABRE_CLIENT_SECRET=your-sabre-client-secret

# Server
PORT=3000
NODE_ENV=development
```

# IMPORTANT RULES

1. **Always use existing services** - Check `backend/src/services/` before creating new ones
2. **Follow the pattern** - Use the service and route patterns shown above
3. **Add to server.js** - Register new routes in `backend/server.js`
4. **Use shadcn/ui** - For frontend components, use existing shadcn/ui components
5. **Error handling** - Always wrap async operations in try-catch
6. **Validation** - Validate all inputs before processing
7. **Documentation** - Add JSDoc comments to all functions
8. **Testing** - Create test files for new services
9. **Security** - Never expose API keys or secrets
10. **Consistency** - Match existing code style exactly

# AVAILABLE SERVICES

- `EncryptionService` - Encrypt/decrypt data
- `SecureVaultService` - Store encrypted credentials
- `SabreService` - Flight/hotel/car booking
- `CoinbaseService` - Cryptocurrency payments (if created)
- `YouTubeAutomationService` - Video generation
- `NotebookLMService` - Research content generation
- `QuantumGeminiCore` - Main AI agent
- `EmotionalMemorySystem` - Memory and emotion tracking

# AVAILABLE UI COMPONENTS (shadcn/ui)

- Button, Card, Input, Label, Tabs
- Alert, Badge, Dialog, Dropdown
- Select, Checkbox, Radio, Switch
- Table, Form, Toast, Tooltip
- And more in `frontend/src/components/ui/`

# GEMINI AI USAGE

```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use Flash for speed
const flashModel = genAI.getGenerativeModel({ 
  model: process.env.GEMINI_MODEL // gemini-2.0-flash-exp
});

// Use Pro for quality (Student Pack)
const proModel = genAI.getGenerativeModel({ 
  model: process.env.GEMINI_PRO_MODEL // gemini-2.5-pro
});

const result = await flashModel.generateContent(prompt);
const text = result.response.text();
```

# COMMON TASKS

## Add New API Endpoint
1. Create service in `backend/src/services/FeatureService.js`
2. Create routes in `backend/routes/feature-routes.js`
3. Register in `backend/server.js`: `app.use('/api/feature', featureRoutes);`
4. Test with curl or Postman

## Add New Frontend Component
1. Create component in `frontend/src/components/FeatureComponent.tsx`
2. Use shadcn/ui components
3. Add TypeScript interfaces for props
4. Import and use in pages

## Add New AI Agent
1. Create agent in `backend/src/agents/AgentName.js`
2. Follow existing agent patterns (Luna, Karim, Scout)
3. Use Gemini API for AI capabilities
4. Add to agent routes

## Integrate New API
1. Create service in `backend/src/services/ApiService.js`
2. Store credentials in SecureVault
3. Add routes in `backend/routes/api-routes.js`
4. Document in markdown file

# TESTING

```bash
# Backend tests
cd backend
npm test

# Test specific service
node test-feature.js

# Test API endpoint
curl -X POST http://localhost:3000/api/endpoint \
  -H "Content-Type: application/json" \
  -d '{"key":"value"}'
```

# DOCUMENTATION

Always create documentation for new features:
- `FEATURE_NAME.md` - Complete guide
- `FEATURE_QUICK_START.md` - Quick start guide
- Update `README.md` if needed

# EXAMPLE TASKS

## Task 1: Add Stripe Payment Integration
"Create a Stripe payment service with the following:
1. StripeService.js with payment intent creation
2. stripe-routes.js with payment endpoints
3. StripePayment.tsx component for frontend
4. Store credentials in SecureVault
5. Add webhook handling
6. Create STRIPE_INTEGRATION.md documentation"

## Task 2: Add Flight Price Alerts
"Create a flight price alert system:
1. PriceAlertService.js to monitor prices
2. Store alerts in Supabase
3. Use Sabre API to check prices
4. Send notifications when price drops
5. PriceAlertComponent.tsx for managing alerts
6. Add cron job for periodic checks"

## Task 3: Add AI Trip Recommendations
"Create an AI trip recommendation system:
1. TripRecommendationService.js using Gemini Pro
2. Analyze user preferences and budget
3. Generate personalized itineraries
4. Include flights, hotels, activities
5. TripRecommendations.tsx component
6. Cache recommendations in Redis"

# CURRENT PROJECT STATUS

✅ Encryption & Secure Vault - Complete
✅ Coinbase Integration - Complete
✅ Sabre GDS Integration - Complete
✅ YouTube Automation - Complete
✅ AI Agents (Luna, Karim, Scout, Maya) - Complete
⬜ AI Operating System - In Progress
⬜ Desktop Manager - To Do
⬜ Window Management - To Do
⬜ File Manager - To Do
⬜ Terminal - To Do

# YOUR TASK

[Describe the specific feature or task you want the AI to build]

Example:
"Build a hotel comparison feature that:
1. Searches multiple providers (Sabre, Booking.com API)
2. Compares prices and ratings
3. Shows best deals
4. Allows filtering by amenities
5. Integrates with existing booking flow"

# DELIVERABLES

When you complete the task, provide:
1. ✅ All code files (services, routes, components)
2. ✅ Documentation (markdown file)
3. ✅ Test script or test commands
4. ✅ Environment variables needed
5. ✅ Integration instructions
6. ✅ API endpoint examples (curl commands)

# QUESTIONS TO ASK

Before starting, ask:
1. What external APIs are needed?
2. What credentials are required?
3. Should data be cached?
4. What's the expected response time?
5. Are there rate limits to consider?
6. What error cases should be handled?
7. What's the user flow?

# SUCCESS CRITERIA

Your implementation should:
✅ Follow existing code patterns
✅ Include error handling
✅ Have proper validation
✅ Be well-documented
✅ Include tests
✅ Work with existing integrations
✅ Be production-ready

Now, please help me build: [YOUR SPECIFIC TASK HERE]
```

---

## 🎯 QUICK PROMPTS FOR COMMON TASKS

### **1. Add New Payment Provider**
```
Using the Amrikyy project structure, integrate [PayPal/Square/etc] payment processing:
1. Create PaymentProviderService.js following the existing pattern
2. Add routes in payment-provider-routes.js
3. Store credentials in SecureVault
4. Create frontend component PaymentProviderPayment.tsx
5. Add webhook handling
6. Document in PAYMENT_PROVIDER_INTEGRATION.md

Follow the same pattern as CoinbaseService.js and use the coding standards from AI_BUILDER_PROMPT.md
```

### **2. Add New Travel API**
```
Integrate [Amadeus/Expedia/etc] API into Amrikyy:
1. Create TravelApiService.js with authentication
2. Add flight/hotel search methods
3. Create travel-api-routes.js with endpoints
4. Store credentials securely
5. Add caching with Redis
6. Create documentation

Use SabreService.js as reference and follow the project patterns.
```

### **3. Add AI Feature**
```
Build an AI-powered [feature name] for Amrikyy:
1. Create AiFeatureService.js using Gemini Pro
2. Use gemini-2.5-pro for complex analysis
3. Use gemini-2.0-flash-exp for quick responses
4. Add routes in ai-feature-routes.js
5. Create frontend component AiFeature.tsx
6. Cache AI responses in Redis

Follow the QuantumGeminiCore.js pattern and use the Gemini API properly.
```

### **4. Add Database Feature**
```
Create a [feature] with database storage in Amrikyy:
1. Create Supabase table schema (SQL)
2. Create FeatureService.js with CRUD operations
3. Add routes in feature-routes.js
4. Create frontend component Feature.tsx
5. Add validation and error handling
6. Document the schema and API

Use Supabase client and follow the existing service patterns.
```

### **5. Add UI Component**
```
Create a [component name] component for Amrikyy:
1. Use TypeScript and React hooks
2. Use shadcn/ui components (Button, Card, etc.)
3. Add proper TypeScript interfaces
4. Include loading and error states
5. Make it responsive with Tailwind CSS
6. Add to component library

Follow the SecureKeyManager.tsx pattern and use existing UI components.
```

---

## 📝 EXAMPLE USAGE

### **Example 1: Add Telegram Bot Integration**

**Prompt:**
```
Using the Amrikyy project structure, create a Telegram bot integration:

1. Create TelegramBotService.js with:
   - Bot initialization
   - Message handling
   - Command processing (/start, /search, /book)
   - Integration with existing services (Sabre, Coinbase)

2. Add telegram-bot-routes.js with:
   - Webhook endpoint
   - Bot status endpoint
   - Message sending endpoint

3. Store bot token in SecureVault

4. Create TelegramBotManager.tsx component for:
   - Bot configuration
   - Message monitoring
   - Analytics

5. Document in TELEGRAM_BOT_INTEGRATION.md

Follow the existing patterns in backend/src/services/ and use the coding standards.
```

### **Example 2: Add Price Tracking**

**Prompt:**
```
Build a flight price tracking system for Amrikyy:

1. Create PriceTrackerService.js with:
   - Track flight prices using Sabre API
   - Store price history in Supabase
   - Check prices every 6 hours (cron job)
   - Send alerts when price drops

2. Add price-tracker-routes.js with:
   - POST /api/price-tracker/create - Create alert
   - GET /api/price-tracker/list - List user alerts
   - DELETE /api/price-tracker/:id - Delete alert
   - GET /api/price-tracker/history/:id - Price history

3. Create PriceTracker.tsx component with:
   - Form to create alerts
   - List of active alerts
   - Price history chart
   - Alert settings

4. Use Redis for caching price data

5. Document in PRICE_TRACKER.md

Follow the service pattern and integrate with existing Sabre integration.
```

---

## 🚀 READY TO USE

Copy the **MASTER PROMPT** section and customize the **YOUR TASK** part with your specific requirements.

The AI will understand:
- ✅ Project structure
- ✅ Coding standards
- ✅ Existing integrations
- ✅ File patterns
- ✅ Best practices
- ✅ What to deliver

**Happy building!** 🎉
