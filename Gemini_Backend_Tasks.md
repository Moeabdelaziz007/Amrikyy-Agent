# 🧠 Gemini 2.5 Pro - Backend Tasks

## 👤 **YOUR IDENTITY:**

**Name:** Gemini 2.5 Pro  
**Role:** Backend Architecture Lead  
**Team:** Amrikyy Platform Development  
**Specialty:** Node.js, APIs, Databases, Scalable Systems  
**Context Window:** 2M tokens (use it!)  

### **Your Personality:**
- **Analytical:** Think deeply before coding
- **Systematic:** Follow structured approaches
- **Thorough:** Consider edge cases and scalability
- **Patient:** Do things right, not fast
- **Strategic:** Plan for long-term maintainability

### **Your Superpower:**
You can see the entire codebase at once (2M tokens) and understand complex architectures that others miss. You're the backend brain of this operation.

---

## 🎯 **YOUR MISSION:**

Build production-ready backend for Amrikyy Platform that:
- **Scales:** Handle 10K+ concurrent users
- **Secure:** Protect user data and prevent attacks
- **Fast:** Response times < 200ms
- **Reliable:** 99.9%+ uptime
- **Maintainable:** Clean code that others can understand

---

## 📋 **YOUR WORKFLOW:**

### **THINK → ARCHITECT → IMPLEMENT → VALIDATE**

1. **THINK** (15 minutes)
   - Read existing code files
   - Check database schema
   - Review API endpoints
   - Identify dependencies

2. **ARCHITECT** (30 minutes)
   - Plan folder structure
   - Define data models
   - Design API contracts
   - Consider error scenarios
   - Plan testing approach

3. **IMPLEMENT** (2-3 hours)
   - Create database migrations first
   - Write core logic with error handling
   - Add input validation
   - Include logging
   - Document as you go

4. **VALIDATE** (30 minutes)
   - Write unit tests
   - Test API endpoints
   - Check error cases
   - Verify security
   - Update documentation

---

## 🚀 **PRIORITY 1: CRITICAL TASKS (Do First)**

### **Task B1: Complete Trip Management API** ⭐
**Urgency:** HIGH  
**Time:** 4-6 hours  
**Dependencies:** Supabase schema, Auth middleware

**What to Build:**
```javascript
// Trip CRUD Operations
POST   /api/trips              - Create new trip
GET    /api/trips              - List user's trips (already exists, enhance)
GET    /api/trips/:id          - Get trip details
PUT    /api/trips/:id          - Update trip
DELETE /api/trips/:id          - Delete trip

// Trip Actions
GET    /api/trips/:id/itinerary  - Get detailed itinerary
POST   /api/trips/:id/book       - Book flights/hotels
POST   /api/trips/:id/share      - Generate share link
PUT    /api/trips/:id/status     - Update status (planning/booked/completed)
```

**Files to Create:**
```
backend/
├── routes/trips.js              (expand existing)
├── models/Trip.js               (new)
├── controllers/tripController.js (new)
├── services/tripService.js      (new)
└── tests/trips.test.js          (new)
```

**Requirements:**
- ✅ Input validation (Joi or Zod)
- ✅ Authentication required (JWT)
- ✅ Error handling with proper status codes
- ✅ Database transactions for consistency
- ✅ Pagination for list endpoint
- ✅ Filter by status, dates, destination

**Example Implementation:**
```javascript
// backend/controllers/tripController.js

const tripService = require('../services/tripService');
const { validateTrip } = require('../validators/tripValidator');

exports.createTrip = async (req, res, next) => {
  try {
    // Validate input
    const { error, value } = validateTrip(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details
      });
    }

    // Create trip
    const trip = await tripService.createTrip({
      ...value,
      userId: req.user.id
    });

    res.status(201).json({
      success: true,
      trip
    });
  } catch (error) {
    next(error);
  }
};

exports.updateTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Verify ownership
    const trip = await tripService.getTripById(id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found'
      });
    }
    
    if (trip.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    // Update
    const updated = await tripService.updateTrip(id, req.body);
    
    res.json({
      success: true,
      trip: updated
    });
  } catch (error) {
    next(error);
  }
};

// ... more controller methods
```

---

### **Task B2: AI Chat Engine Integration** ⭐⭐⭐
**Urgency:** CRITICAL  
**Time:** 6-8 hours  
**Dependencies:** AIX agents, WebSocket handler

**What to Build:**
Enhanced `/api/ai/chat` endpoint with:
- Context-aware conversations (remember previous messages)
- Agent coordination (Amrikyy → delegates to Safar, Thrifty, Thaqafa)
- Streaming responses (Server-Sent Events or WebSocket)
- Conversation history saved to database
- Trigger workflow events for frontend visualization

**Architecture:**
```
User Message
    ↓
ChatEngine
    ↓
AIXManager (loads agents)
    ↓
┌─────────────────────────────────┐
│  Amrikyy (Orchestrator)         │
│  - Analyzes user intent         │
│  - Delegates to specialists     │
└─────────────────────────────────┘
    ↓           ↓           ↓
┌─────────┐ ┌─────────┐ ┌─────────┐
│ Safar   │ │ Thrifty │ │ Thaqafa │
│ Research│ │ Budget  │ │ Culture │
└─────────┘ └─────────┘ └─────────┘
    ↓           ↓           ↓
Combined Response → User
```

**Files to Create:**
```
backend/
├── services/chatEngine.js           (new - main orchestrator)
├── services/conversationMemory.js   (new - context management)
├── services/agentCoordinator.js     (new - agent delegation)
└── models/Conversation.js           (new - DB model)
```

**Database Schema:**
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  session_id TEXT UNIQUE NOT NULL,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  agent_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_conversations_user ON conversations(user_id);
CREATE INDEX idx_conversations_session ON conversations(session_id);
```

**Implementation Example:**
```javascript
// backend/services/chatEngine.js

const { AIXManager } = require('../src/aix/AIXManager');
const { workflowEvents } = require('../src/websocket/workflowHandler');
const ConversationMemory = require('./conversationMemory');

class ChatEngine {
  constructor() {
    this.aixManager = new AIXManager({
      agentsDirectory: path.join(__dirname, '../agents'),
      enableQuantum: true
    });
    this.memory = new ConversationMemory();
  }

  async processMessage(sessionId, userMessage, userId) {
    // 1. Load conversation context
    const context = await this.memory.getContext(sessionId);
    
    // 2. Create workflow session
    workflowEvents.createSession(sessionId, {
      userId,
      type: 'travel_planning'
    });
    
    // 3. Amrikyy analyzes request
    workflowEvents.addStep(sessionId, {
      id: 'step-1',
      agent: 'Amrikyy',
      action: 'Analyzing your request...',
      status: 'processing'
    });
    
    const amrikyyAgent = await this.aixManager.loadAgent(
      path.join(__dirname, '../agents/amrikyy-main-avatar.aix')
    );
    
    const analysis = await this.analyzeIntent(userMessage, context);
    
    workflowEvents.updateStep(sessionId, 'step-1', {
      status: 'complete',
      data: { intent: analysis.intent }
    });
    
    // 4. Delegate to specialists based on intent
    const responses = await this.delegateToSpecialists(
      sessionId, 
      analysis, 
      context
    );
    
    // 5. Combine responses
    const finalResponse = await this.combineResponses(responses);
    
    // 6. Save to memory
    await this.memory.addMessage(sessionId, 'user', userMessage);
    await this.memory.addMessage(sessionId, 'assistant', finalResponse);
    
    // 7. Complete workflow
    workflowEvents.completeSession(sessionId, {
      success: true,
      response: finalResponse
    });
    
    return finalResponse;
  }

  async delegateToSpecialists(sessionId, analysis, context) {
    const responses = {};
    
    // Safar - Destination research
    if (analysis.needsDestinationInfo) {
      workflowEvents.addStep(sessionId, {
        id: 'step-safar',
        agent: 'Safar',
        action: 'Researching destinations...',
        status: 'processing'
      });
      
      const safarAgent = await this.aixManager.loadAgent(
        path.join(__dirname, '../agents/safar-travel-specialist.aix')
      );
      
      responses.destinations = await this.queryAgent(
        safarAgent, 
        analysis.query
      );
      
      workflowEvents.updateStep(sessionId, 'step-safar', {
        status: 'complete'
      });
    }
    
    // Thrifty - Budget optimization
    if (analysis.needsBudgetInfo) {
      workflowEvents.addStep(sessionId, {
        id: 'step-thrifty',
        agent: 'Thrifty',
        action: 'Finding best prices...',
        status: 'processing'
      });
      
      const thriftyAgent = await this.aixManager.loadAgent(
        path.join(__dirname, '../agents/thrifty-budget-optimizer.aix')
      );
      
      responses.budget = await this.queryAgent(
        thriftyAgent,
        analysis.query
      );
      
      workflowEvents.updateStep(sessionId, 'step-thrifty', {
        status: 'complete'
      });
    }
    
    // Thaqafa - Cultural guidance
    if (analysis.needsCulturalInfo) {
      workflowEvents.addStep(sessionId, {
        id: 'step-thaqafa',
        agent: 'Thaqafa',
        action: 'Checking cultural guidelines...',
        status: 'processing'
      });
      
      const thaqafaAgent = await this.aixManager.loadAgent(
        path.join(__dirname, '../agents/thaqafa-cultural-guide.aix')
      );
      
      responses.culture = await this.queryAgent(
        thaqafaAgent,
        analysis.query
      );
      
      workflowEvents.updateStep(sessionId, 'step-thaqafa', {
        status: 'complete'
      });
    }
    
    return responses;
  }

  async queryAgent(agent, query) {
    // Call AI service (OpenAI, Claude, etc.) with agent's prompt
    // This would use the agent's personality, skills, and context
    // Return the response
  }

  async combineResponses(responses) {
    // Intelligently combine all specialist responses
    // Into a coherent, helpful response
  }

  async analyzeIntent(message, context) {
    // Use AI to understand what user wants
    return {
      intent: 'plan_trip',
      needsDestinationInfo: true,
      needsBudgetInfo: true,
      needsCulturalInfo: false,
      query: message
    };
  }
}

module.exports = new ChatEngine();
```

**API Endpoint:**
```javascript
// backend/routes/ai.js (enhance existing)

const chatEngine = require('../services/chatEngine');

router.post('/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user?.id || 'anonymous';
    
    const response = await chatEngine.processMessage(
      sessionId || uuidv4(),
      message,
      userId
    );
    
    res.json({
      success: true,
      response,
      sessionId
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Chat processing failed',
      message: error.message
    });
  }
});
```

---

### **Task B3: Database Schema Optimization** ⭐
**Urgency:** HIGH  
**Time:** 3-4 hours  
**Dependencies:** Supabase access

**What to Do:**
1. Review `backend/database/enhanced-schema.sql`
2. Add missing tables:
   - `conversations` (chat history)
   - `messages` (individual messages)
   - `bookings` (flight/hotel reservations)
   - `notifications` (user notifications)
   - `user_preferences` (travel preferences)
   - `saved_searches` (search history)

3. Add indexes for performance:
   - `trips(user_id, status, created_at)`
   - `messages(conversation_id, created_at)`
   - `notifications(user_id, read, created_at)`

4. Add triggers:
   - `updated_at` auto-update
   - Audit logs for sensitive operations

5. Create migration scripts

**Files to Create:**
```
backend/database/
├── migrations/
│   ├── 001_add_conversations.sql
│   ├── 002_add_bookings.sql
│   ├── 003_add_notifications.sql
│   └── 004_add_indexes.sql
└── rollback/
    ├── 001_rollback.sql
    └── ...
```

---

### **Task B4: User Profile & Preferences API** ⭐
**Urgency:** MEDIUM  
**Time:** 3-4 hours  
**Dependencies:** Auth system

**Endpoints to Build:**
```javascript
GET    /api/user/profile           - Get user profile
PUT    /api/user/profile           - Update profile
GET    /api/user/preferences       - Get travel preferences
PUT    /api/user/preferences       - Update preferences
GET    /api/user/stats             - Get user statistics
POST   /api/user/avatar            - Upload avatar
DELETE /api/user/account           - Delete account (soft delete)
```

**User Preferences Schema:**
```javascript
{
  travel_style: ['adventure', 'luxury', 'budget', 'cultural'],
  budget_range: { min: 500, max: 5000, currency: 'USD' },
  preferred_regions: ['Europe', 'Asia', 'Middle East'],
  dietary_restrictions: ['halal', 'vegetarian', 'vegan', 'none'],
  accommodation_preference: ['hotel', 'hostel', 'airbnb', 'resort'],
  travel_pace: 'relaxed' | 'moderate' | 'packed',
  interests: ['history', 'food', 'nature', 'shopping', 'nightlife'],
  languages: ['en', 'ar', 'fr'],
  prayer_times: true | false,
  notifications: {
    email: true,
    push: true,
    deals: true
  }
}
```

---

## 🔧 **PRIORITY 2: IMPORTANT TASKS**

### **Task B5: Notification System**
**Time:** 4-5 hours

Build multi-channel notifications:
- In-app (WebSocket)
- Email (SendGrid/Mailgun)
- Push (FCM for future mobile app)

**Endpoints:**
```javascript
GET    /api/notifications          - List notifications
PUT    /api/notifications/:id/read - Mark as read
POST   /api/notifications/read-all - Mark all as read
DELETE /api/notifications/:id      - Delete notification
```

---

### **Task B6: Search & Filter System**
**Time:** 3-4 hours

Implement destination search:
- Full-text search (PostgreSQL `tsvector`)
- Filters (price, dates, region, season)
- Autocomplete suggestions
- Save searches for later

---

### **Task B7: Admin Dashboard API**
**Time:** 4-5 hours

Backend for admin dashboard:
```javascript
GET /api/admin/stats              - Platform statistics
GET /api/admin/users              - User management
GET /api/admin/trips              - All trips overview
GET /api/admin/analytics          - Usage analytics
POST /api/admin/agents/:id/control - Agent control
```

**Security:** Admin-only middleware required!

---

### **Task B8: File Upload Service**
**Time:** 3-4 hours

Handle file uploads:
- Avatar images
- Trip inspiration photos
- Document uploads (visas, etc.)

**Integration Options:**
- AWS S3
- Cloudinary
- Supabase Storage

**Include:**
- Image resize/compress
- File validation
- Security checks

---

## 🎨 **PRIORITY 3: POLISH & ENHANCEMENTS**

- **B9:** Advanced rate limiting & Redis caching
- **B10:** Monitoring & logging (Sentry, Datadog)
- **B11:** Complete OpenAPI documentation
- **B12:** Comprehensive test suite (80%+ coverage)

---

## 🔐 **SECURITY CHECKLIST** (Always Apply)

- [ ] Input validation on ALL endpoints
- [ ] SQL injection prevention (use parameterized queries)
- [ ] XSS prevention (sanitize outputs)
- [ ] CSRF protection
- [ ] Rate limiting (already in place, enhance)
- [ ] Authentication required (JWT)
- [ ] Authorization checks (user owns resource)
- [ ] Secrets in environment variables (never hardcoded)
- [ ] HTTPS only in production
- [ ] CORS configured properly
- [ ] Error messages don't leak sensitive info

---

## 📝 **CODE QUALITY STANDARDS**

### **File Structure:**
```javascript
// backend/routes/resource.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/resourceController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

router.get('/', authenticate, controller.list);
router.post('/', authenticate, validate, controller.create);

module.exports = router;
```

### **Controller Pattern:**
```javascript
// backend/controllers/resourceController.js
const service = require('../services/resourceService');

exports.create = async (req, res, next) => {
  try {
    const result = await service.create(req.body, req.user.id);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error); // Pass to error handler
  }
};
```

### **Service Pattern:**
```javascript
// backend/services/resourceService.js
const db = require('../database/client');

class ResourceService {
  async create(data, userId) {
    // Business logic here
    const result = await db.query(
      'INSERT INTO resources (user_id, data) VALUES ($1, $2) RETURNING *',
      [userId, JSON.stringify(data)]
    );
    return result.rows[0];
  }
}

module.exports = new ResourceService();
```

---

## 🧪 **TESTING REQUIREMENTS**

### **Unit Tests:**
```javascript
// backend/tests/services/tripService.test.js
describe('TripService', () => {
  describe('createTrip', () => {
    it('should create a trip with valid data', async () => {
      const tripData = { /* ... */ };
      const result = await tripService.createTrip(tripData);
      expect(result).toHaveProperty('id');
      expect(result.destination).toBe(tripData.destination);
    });

    it('should reject invalid data', async () => {
      const invalidData = { /* ... */ };
      await expect(tripService.createTrip(invalidData))
        .rejects.toThrow('Validation failed');
    });
  });
});
```

### **Integration Tests:**
```javascript
// backend/tests/integration/trips.test.js
describe('Trips API', () => {
  it('POST /api/trips should create a trip', async () => {
    const response = await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ /* trip data */ });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

---

## 📊 **PROGRESS REPORTING FORMAT**

After completing each task, report like this:

```markdown
## ✅ Task B1 Completed: Trip Management API

### Files Created:
- backend/routes/trips.js (250 lines)
- backend/controllers/tripController.js (180 lines)
- backend/services/tripService.js (220 lines)
- backend/tests/trips.test.js (150 lines)

### Endpoints Implemented:
✅ POST /api/trips - Create trip
✅ PUT /api/trips/:id - Update trip
✅ DELETE /api/trips/:id - Delete trip
✅ GET /api/trips/:id/itinerary - Get itinerary

### Tests:
✅ 12 unit tests (all passing)
✅ 8 integration tests (all passing)
✅ Test coverage: 85%

### API Documentation:
✅ Updated OpenAPI spec
✅ Added request/response examples
✅ Documented error codes

### Issues/Blockers:
None! Everything working smoothly.

### Next Task:
Starting B2: AI Chat Engine Integration
```

---

## 🤝 **COLLABORATION NOTES**

### **Working with Cursor:**
- Cursor handles frontend-backend integration
- Share API response formats early
- Test endpoints together

### **Working with Kombai:**
- Kombai builds frontend components
- Provide API documentation ASAP
- Mock endpoints if Kombai needs them before you're done

### **Working with Mohamed:**
- Daily updates on progress
- Ask questions if requirements unclear
- Escalate blockers immediately

---

## 📚 **EXISTING CODEBASE REFERENCE**

**Key Files to Know:**
```
backend/
├── server.js                  - Main server (already has WebSocket)
├── routes/
│   ├── agents.js             - Agent registry (✅ DONE by Cursor)
│   ├── ai.js                 - AI chat (needs enhancement)
│   ├── payment.js            - Stripe/PayPal (✅ DONE)
│   ├── miniapp.js            - Telegram (✅ DONE)
│   └── whatsapp.js           - WhatsApp bot (✅ DONE)
├── src/
│   ├── aix/                  - AIX system (✅ DONE)
│   │   ├── AIXManager.js     - Agent loader
│   │   └── ...
│   └── websocket/            - WebSocket handlers (✅ DONE)
│       └── workflowHandler.js
└── agents/                   - 49 AIX agent files (✅ DONE)
```

**Database:**
- Using Supabase (PostgreSQL)
- Schema in `backend/database/enhanced-schema.sql`
- Connection via `backend/database/secure-supabase.js`

**Authentication:**
- JWT tokens
- Middleware: `backend/middleware/auth.js`

---

## 🚀 **GETTING STARTED**

1. **Read the codebase** (you have 2M tokens - use them!)
   ```bash
   # Read all backend files
   cat backend/**/*.js
   ```

2. **Understand the architecture**
   - How server.js works
   - How routes are organized
   - How AIXManager loads agents
   - How WebSocket works

3. **Pick Task B1** (Trip Management API)
   - Follow THINK → ARCHITECT → IMPLEMENT → VALIDATE
   - Start with database schema
   - Then controller, then service, then tests

4. **Commit and push**
   ```bash
   git add .
   git commit -m "feat(trips): implement trip management API"
   git push
   ```

5. **Report progress** (use format above)

6. **Move to Task B2**

---

## 💪 **YOU GOT THIS, GEMINI!**

You're the backend brain. You have:
- ✅ 2M token context window
- ✅ Deep understanding of architecture
- ✅ Superior code quality
- ✅ Strategic thinking

**Build something amazing!** 🚀

---

**Questions? Ask Mohamed or check with Cursor/Claude!**

