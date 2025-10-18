# OpenMemory Guide - Amrikyy Travel Agent

## Project Overview

Amrikyy Travel Agent has evolved into **SAAAAS (Super AI Automated Agency as a Service)** - a revolutionary AI-powered platform featuring QuantumOS desktop interface. The system integrates multiple AI models with Gemini 2.5 as the primary brain, providing intelligent trip planning, budget analysis, destination recommendations, and comprehensive AI-powered mini-apps.

### Key Features

- **QuantumOS Desktop Interface**: iOS-like desktop experience with holographic boot loader
- **AI Mini-Apps Ecosystem**: 12 specialized applications (8 core + 4 strategic)
- **Gemini 2.5 Primary Brain**: Advanced AI with emotional intelligence and quantum reasoning
- **Multi-Agent Architecture**: Modern TypeScript agent system with event-driven task queuing
- **Voice Control**: AI voice assistant for hands-free operation
- **Payment Integration**: Stripe, PayPal, and Telegram payment methods with webhook handling
- **Messaging Platforms**: Telegram Bot, Telegram Mini App, WhatsApp Business API integration
- **Security & Performance**: 7 different rate limiters, Helmet.js security headers, CORS protection
- **Analytics & Monitoring**: Event tracking, performance metrics, health checks, comprehensive logging

### Strategic High-Impact Applications

**Core Mini-Apps (8):**

1. **AINotes** - Rich text editor with TipTap integration
2. **AIStudio VE03** - Professional video editing interface
3. **AIGallery Nano** - AI-powered photo management
4. **AIMaps Enhanced** - Google Maps integration with voice navigation
5. **AITravel Agency** - Complete trip planning interface
6. **AIMarket** - AI-powered market analysis
7. **AgentsKit** - Agent management and monitoring
8. **MCP Kit** - Model Context Protocol tools

**Strategic High-Impact Apps (4):** 9. **AI Email Assistant** - Proactive autonomous email management agent - Features: Intelligent triage, smart replies, action extraction, semantic search - APIs: Gmail API + Dialogflow + Gemini API + Speech APIs - Value: Transforms inbox from chore to streamlined information hub

10. **Smart Travel Planner** - End-to-end autonomous trip management

    - Features: Hyper-personalized itineraries, cultural intelligence, real-time adjustments
    - APIs: Places API + Routes API + Gemini API + Traffic data
    - Value: Delivers complete trip experience, not just booking

11. **Voice Note Taker** - Intelligent spoken knowledge capture

    - Features: Real-time transcription, AI structuring, semantic search, cloud sync
    - APIs: Speech API + Drive API + Gemini API + Text-to-Speech
    - Value: Transforms fleeting conversations into organized knowledge

12. **Cultural Guide** - Real-time cultural advisor and global companion
    - Features: Contextual cultural intelligence, voice interaction, deep understanding
    - APIs: Places API + Gemini API + Speech APIs + Text-to-Speech
    - Value: Unique differentiator, no competitor offers this level of cultural guidance

### Tech Stack

**QuantumOS Frontend (React 18 + TypeScript)**:

- Vite build tool with hot module replacement
- Tailwind CSS for styling with glassmorphism effects
- Framer Motion for quantum animations
- TipTap rich text editor for AI Notes
- Lucide React for modern icons
- Firebase integration for cloud sync

**Legacy Frontend (React 18 + TypeScript)**:

- Zustand for state management
- React Router for navigation
- Supabase client for database operations

**Backend (Node.js + Express + TypeScript)**:

- Express framework with middleware architecture
- Modern TypeScript agent system (AgentManager, BaseAgent)
- Event-driven architecture with Redis task queuing
- Supabase PostgreSQL database
- Gemini 2.5 AI model integration (primary brain)
- Z.ai GLM-4.6 AI model integration (secondary)
- Stripe payment processing
- Telegram Bot API and WhatsApp Business API
- JWT authentication with Telegram WebApp verification

**Database (Supabase PostgreSQL)**:

- users, trips, expenses tables
- profiles (Telegram user data)
- messages (conversation history)
- travel_offers (personalized offers)
- destinations (travel destinations catalog)
- ai_conversations (AI chat history)

### Project Structure

- **Monorepo**: Uses npm workspaces to manage frontend and backend together
- **QuantumOS**: `/quanpology-hub` - Revolutionary desktop interface with AI mini-apps
- **Legacy Frontend**: `/frontend` - Original React app on http://localhost:3000
- **Backend**: `/backend` - Express API on http://localhost:5000 with TypeScript agents
- **Documentation**: Extensive docs including API_DOCUMENTATION.md, ARCHITECTURE.md, CODE_STRUCTURE.md

---

## Architecture

### System Layers

**Layer 1: Frontend**

- React components with TypeScript
- API client with rate limit handling
- Telegram WebApp SDK integration
- Auth provider using Context API
- Component hierarchy: App → AuthProvider → TripPlanner/Destinations/AIAssistant

**Layer 2: API Gateway (Express)**

- Security: Helmet.js, CORS, input validation
- Rate limiting: 7 different limiters for various endpoints
- Compression and optimization
- Route handlers for AI, payment, Telegram, WhatsApp

**Layer 3: Service Layer**

- ZaiClient (src/ai/zaiClient.js): AI operations, chat completion, travel recommendations, budget analysis
- PaymentService (routes/payment.js): Stripe, PayPal, Telegram payments
- SupabaseDB (database/supabase.js): Database operations, user profiles, conversations
- WhatsAppClient (src/whatsapp/whatsappClient.js): WhatsApp Business API integration

**Layer 4: External Services**

- Z.ai API (GLM-4.6 model)
- Stripe API (payment processing)
- Telegram Bot API
- WhatsApp Business API
- Supabase (PostgreSQL database)

**Layer 5: Data Layer**

- Supabase PostgreSQL with Row Level Security
- Tables: users, trips, expenses, profiles, messages, travel_offers, destinations, ai_conversations
- Real-time subscriptions for live updates

### Request Flow Patterns

**AI Chat Flow**:

1. User input → AIAssistant component (frontend)
2. POST /api/ai/chat → Rate limiter (10 req/min)
3. AI route handler (routes/ai.js) → ZaiClient.chatCompletion()
4. Z.ai API call (GLM-4.6) → AI response
5. Optional save to Supabase → Return JSON → Display in UI

**Payment Flow**:

1. User clicks "Pay" → PaymentModal component
2. POST /api/payment/create-payment-link → Rate limiter (20 req/hour)
3. Payment route handler → Stripe API
4. Create payment link → Return URL → Open Stripe checkout
5. User completes payment → Stripe webhook → POST /api/payment/webhook
6. Verify signature → Update database → Send confirmation

**Telegram Bot Flow**:

1. User message → Telegram servers → Webhook to backend
2. telegram-bot.js message handler → Parse message
3. Check if command (/start, /help) or text message
4. If AI enabled: ZaiClient.chatCompletion() → Get AI response
5. If AI disabled: Predefined response
6. Save to Supabase → Send reply → Telegram delivers

---

## User Defined Namespaces

Define your project-specific namespaces below. The AI will use these descriptions to intelligently categorize and search memories.

- **frontend**: React components, UI/UX patterns, Tailwind styling, Zustand state management, TypeScript types, API client integration
- **backend**: Express routes, middleware, service layer, business logic, error handling, logging
- **ai-integration**: Z.ai client, AI tools, MCP tools, Maya persona, user profiling, cultural context, multimodal analysis
- **payment**: Stripe integration, PayPal, Telegram payments, webhook handling, payment link generation
- **telegram**: Bot implementation, Mini App routes, WebApp authentication, conversation management, commands
- **whatsapp**: WhatsApp Business API, webhook handling, message processing
- **database**: Supabase client, schema design, queries, user profiles, conversations, travel offers
- **security**: Rate limiting, Helmet.js, CORS, JWT authentication, input validation, webhook verification
- **testing**: Unit tests (Vitest/Jest), E2E tests (Playwright), coverage reports, test utilities

---

## Components

### AI Agents (NEW - October 16, 2025)

**Luna Trip Architect** (`/backend/src/agents/LunaWithMCP.js`):

- Trip planning with real-time flight search
- Budget analysis integration
- Itinerary generation (day-by-day planning)
- MCP tools integration (search_flights, compare_prices, analyze_budget)
- Methods: planTrip, searchFlights, comparePrices, analyzeBudget, generateItinerary, getCapabilities

**Karim Budget Optimizer** (`/backend/src/agents/KarimWithMCP.js`):

- Budget optimization and cost-saving strategies
- Price comparison across flexible dates
- Savings recommendations generation
- Methods: optimizeBudget, comparePrices, analyzeBudget, generateSavingsRecommendations, getCapabilities

**Scout Deal Finder** (`/backend/src/agents/ScoutWithMCP.js`):

- Proactive deal discovery
- Price monitoring and alerts
- Destination suggestions based on budget
- Deal scoring algorithm
- Methods: discoverDeals, monitorPrice, suggestDestinations, comparePrices, getCapabilities

**Agent Coordinator** (`/backend/src/agents/AgentCoordinator.js`):

- Multi-agent orchestration
- Request types: plan_trip, optimize_budget, find_deals, full_service
- Methods: handleTravelRequest, coordinateTripPlanning, coordinateBudgetOptimization, coordinateDealDiscovery, coordinateFullService

### MCP (Model Context Protocol) System (NEW)

**Travel MCP Server** (`/backend/src/mcp/TravelMCPServer.js`):

- 5 specialized tools for travel operations
- Tools: search_flights, search_locations, get_flight_details, compare_prices, analyze_budget
- Standardized tool calling interface
- Parameter validation and error handling
- Methods: initializeTools, registerTool, listTools, callTool, validateParams

### External Services Integration (NEW)

**Kiwi Tequila Service** (`/backend/src/services/KiwiTequilaService.js`):

- Flight search across 800+ airlines
- Airport/city location search
- Flight details and booking (sandbox mode)
- Methods: searchFlights, getFlightDetails, createBooking, searchLocations, healthCheck

**Booking.com Service** (`/backend/src/services/BookingComService.js`):

- Hotel search worldwide
- City search and hotel details
- Room availability checking
- Booking URL generation with affiliate tracking
- Methods: searchHotels, getHotelDetails, searchCities, getRoomAvailability, generateBookingURL

**Mapbox Service** (`/backend/src/services/MapboxService.js`):

- Geocoding and reverse geocoding
- Place search (POIs, landmarks)
- Directions and routing
- Static map generation
- Distance calculation
- Methods: geocode, reverseGeocode, searchPlaces, getDirections, getStaticMapURL, calculateDistance

### Security Components (NEW)

**Token Manager** (`/backend/src/security/TokenManager.js`):

- Ephemeral token generation and management
- Token validation with scope checking
- Token revocation (single and bulk)
- Automatic cleanup of expired tokens
- Usage tracking and statistics
- Methods: generateToken, validateToken, revokeToken, revokeUserTokens, getTokenInfo, calculateExpiration, cleanup, getStats

**External API Limiter** (`/backend/middleware/externalAPILimiter.js`):

- Per-user rate limiting for external APIs
- Kiwi: 5 requests/minute, 50/hour
- Booking.com: 5 requests/minute, 50/hour
- Mapbox: 10 requests/minute, 100/hour
- Automatic cleanup and statistics
- Methods: checkLimit, middleware, getUserStats, resetUserLimits

**MCP Authentication** (`/backend/middleware/mcpAuth.js`):

- Token-based authentication for MCP endpoints
- Scope-based access control (7 scopes)
- Optional authentication support
- Token generation/revocation handlers
- Available scopes: flights:read, flights:write, hotels:read, hotels:write, maps:read, mcp:call, agents:execute

### Frontend Components

**Core UI Components** (`/frontend/src/components/`):

- **AIAssistant.tsx**: Chat interface for AI conversations, handles message sending and display, integrates with /api/ai/chat endpoint
- **TripPlanner.tsx**: Main trip planning interface, form handling for destination/budget/dates, displays trip recommendations
- **Destinations.tsx**: Destination browser with filtering and search, displays destination cards with images and ratings
- **BudgetTracker.tsx**: Budget management and expense tracking, categorizes expenses, displays spending analytics
- **TripHistory.tsx**: Historical trips display, pagination support, trip detail views
- **PaymentModal.tsx**: Payment interface modal, Stripe checkout integration, payment method selection
- **ErrorBoundary.tsx**: React error boundary for graceful error handling, fallback UI display

**Auth Components** (`/frontend/src/components/Auth/`):

- **AuthProvider.tsx**: Authentication context provider, manages user state, Supabase auth integration
- **LoginForm.tsx**: Login form with validation, email/password authentication, Telegram WebApp auth
- **SignupForm.tsx**: Signup form with validation, user registration flow

**API Layer** (`/frontend/src/api/`):

- **client.ts**: Base API client with axios, rate limit handling, error handling, request/response interceptors
- **services.ts**: API service methods for trips, destinations, AI chat
- **paymentService.ts**: Payment-specific API methods, Stripe integration
- **telegram.ts**: Telegram Mini App API integration

### Backend Components

**AI Integration** (`/backend/src/ai/`):

- **zaiClient.js**: Z.ai API client wrapper, methods: chatCompletion, generateTravelRecommendations, generateBudgetAnalysis, generateDestinationInsights, analyzeMedia, healthCheck
- **geminiClient.js**: Google Gemini API client (alternative AI provider)
- **tools.js**: AI tools for function calling - getWeather, searchFlights, findHotels, getHalalRestaurants, getPrayerTimes
- **mcpTools.js**: Model Context Protocol tools for advanced AI capabilities
- **amrikyyPersona.js**: Amrikyy personality and conversation style definitions
- **culture.js**: Cultural context system prompts, supports Arabic and English responses
- **userProfiling.js**: User preference tracking and personalization logic

**API Routes** (`/backend/routes/`):

- **ai.js**: AI endpoints - /chat, /travel-recommendations, /budget-analysis, /destination-insights, /multimodal/analyze
- **payment.js**: Payment endpoints - /create-payment-link, /create-payment, /confirm-payment
- **stripe-webhook.js**: Stripe webhook handler for payment confirmation
- **miniapp.js**: Telegram Mini App endpoints - /auth/telegram, /send-message, /payment-link, /share-trip
- **whatsapp.js**: WhatsApp webhook handler for incoming messages

**Middleware** (`/backend/middleware/`):

- **rateLimiter.js**: Rate limiting middleware with 7 different limiters:
  - generalLimiter: 100 req/15min (all API routes)
  - aiLimiter: 10 req/min (AI endpoints)
  - multimodalLimiter: 20 req/hour (image/video analysis)
  - paymentLimiter: 20 req/hour (payment endpoints)
  - webhookLimiter: 30 req/min (webhooks)
  - analyticsLimiter: 50 req/min (analytics)
  - authLimiter: 5 req/15min (authentication)

**Database** (`/backend/database/`):

- **supabase.js**: Supabase client wrapper with methods:
  - User management: getUserProfile, createUserProfile, updateUserProfile
  - Conversations: saveConversationMessage, getConversationHistory
  - Travel offers: getTravelOffers, getPersonalizedOffers, createTravelOffer
  - Analytics: trackOfferInteraction, getUserAnalytics

**Utilities** (`/backend/utils/`):

- **conversationManager.js**: Manages conversation state and context
- **errorHandler.js**: Centralized error handling and logging
- **healthMonitor.js**: System health monitoring and metrics
- **logger.js**: Winston-based logging with file and console transports

**Telegram Integration** (`/backend/`):

- **telegram-bot.js**: Full-featured bot with AI (requires Z.ai API key)
- **telegram-bot-no-ai.js**: Lightweight bot with predefined responses (no AI dependency)
- **telegram-bot-gemini.js**: Bot using Google Gemini AI
- **advanced-telegram-bot.js**: Advanced bot with MCP tools and user profiling

**WhatsApp Integration** (`/backend/src/whatsapp/`):

- **whatsappClient.js**: WhatsApp Business API client for sending messages

---

## API Routes (NEW - October 16, 2025)

**Flights Routes** (`/backend/routes/flights.js`):

- POST /api/flights/search - Search flights
- GET /api/flights/locations - Search airports/cities
- POST /api/flights/details - Get flight details
- POST /api/flights/book - Create booking (sandbox)
- GET /api/flights/health - Health check

**Hotels Routes** (`/backend/routes/hotels.js`):

- POST /api/hotels/search - Search hotels
- GET /api/hotels/cities - Search cities
- GET /api/hotels/:hotelId - Get hotel details
- POST /api/hotels/availability - Check room availability
- POST /api/hotels/booking-url - Generate booking URL
- GET /api/hotels/health - Health check

**MCP Routes** (`/backend/routes/mcp.js`):

- GET /api/mcp/tools - List all MCP tools
- POST /api/mcp/call - Call MCP tool
- POST /api/mcp/batch - Batch tool execution
- POST /api/mcp/search-flights - Convenience flight search
- POST /api/mcp/compare-prices - Convenience price comparison
- POST /api/mcp/analyze-budget - Convenience budget analysis
- GET /api/mcp/health - Health check

**Security Routes** (`/backend/routes/security.js`):

- POST /api/security/tokens/generate - Generate ephemeral token
- POST /api/security/tokens/revoke - Revoke token
- GET /api/security/tokens/info - Get token information
- GET /api/security/tokens/stats - Token statistics
- GET /api/security/rate-limits/:userId - Get user rate limits
- POST /api/security/rate-limits/:userId/reset - Reset rate limits
- GET /api/security/scopes - List available scopes

**Travel Agents Routes** (`/backend/routes/travel-agents.js`):

- POST /api/travel-agents/request - Submit travel request to AI agents
- GET /api/travel-agents/capabilities - Get all agent capabilities
- GET /api/travel-agents/active-requests - Get active requests

## Implementation Patterns

### Pattern 1: MCP Tool Integration (NEW)

- **Standardized Interface**: All agents use MCP server for tool calling
- **Tool Registration**: Tools registered with JSON schema validation
- **Context Passing**: User context passed to all tool calls
- **Error Handling**: Consistent error format across all tools
- **Audit Logging**: All tool calls logged with user/agent info

### Pattern 2: AI Agent Coordination (NEW)

- **Multi-Agent Orchestration**: Coordinator manages multiple agents
- **Request Types**: plan_trip, optimize_budget, find_deals, full_service
- **Sequential Execution**: Agents execute in logical order
- **Result Aggregation**: Results combined into comprehensive response
- **Usage Tracking**: Track which agents were used for each request

### Pattern 3: Security & Rate Limiting (NEW)

- **Ephemeral Tokens**: Short-lived tokens with scope-based permissions
- **Per-User Limits**: Different limits for each external API
- **Automatic Cleanup**: Expired tokens and old rate limit entries cleaned up
- **Token Validation**: Middleware validates tokens before endpoint access
- **Audit Trail**: All security events logged

### Pattern 4: External API Integration (NEW)

- **Service Layer**: Separate service classes for each external API
- **Error Handling**: Graceful degradation when APIs fail
- **Response Formatting**: Consistent format across all services
- **Health Checks**: Each service has health check method
- **Rate Limit Awareness**: Services respect external API limits

### Pattern 5: Layered Architecture

- **Separation of concerns**: Routes → Services → Data Access
- **Middleware chain**: Security → Rate Limiting → Routes → Error Handling
- **Service layer abstraction**: Business logic separated from route handlers

### Pattern 2: Rate Limiting Strategy

- **Multiple limiters**: Different limits for different endpoints based on resource intensity
- **IP-based limiting**: Prevents abuse from single sources
- **Configurable windows**: Flexible time windows (per minute, per hour, per 15 minutes)
- **Graceful degradation**: Returns 429 with retry-after header

### Pattern 3: AI Integration

- **Personality injection**: Amrikyy persona applied to all AI responses
- **Cultural awareness**: buildCulturalSystemPrompt() for Arabic/English context
- **Tool calling**: Function calling for weather, flights, hotels, prayer times
- **Conversation context**: Maintains conversation history for continuity

### Pattern 4: Payment Processing

- **Multiple providers**: Strategy pattern for Stripe, PayPal, Telegram
- **Webhook verification**: Signature validation for payment confirmations
- **Error handling**: Graceful failure with detailed error messages
- **Rate limiting**: Prevents payment fraud and abuse

### Pattern 5: Error Handling

- **Try-catch blocks**: Comprehensive error catching in all async operations
- **Centralized logging**: Winston logger with file and console outputs
- **User-friendly errors**: Error messages formatted for frontend display
- **Error boundaries**: React error boundaries prevent full app crashes

### Pattern 6: Database Access

- **Repository pattern**: SupabaseDB class abstracts database operations
- **Single client instance**: Singleton pattern for Supabase client
- **Error handling**: Database errors caught and logged appropriately
- **Optional integration**: System works with in-memory fallback if Supabase not configured

### Pattern 7: API Client (Frontend)

- **Axios interceptors**: Request/response transformation and error handling
- **Rate limit handling**: Detects 429 responses and notifies user
- **Type safety**: TypeScript interfaces for all API responses
- **Retry logic**: Can retry failed requests with exponential backoff

### Pattern 8: Component Patterns (Frontend)

- **Container/Presentational**: Separation of logic and UI
- **Custom hooks**: useAuth, useAPI for reusable logic
- **Error boundaries**: Catch and display component errors
- **Context API**: Auth state management across components

### Pattern 9: Testing Strategy

- **Unit tests**: Component and function testing with Vitest/Jest
- **E2E tests**: User flow testing with Playwright
- **Coverage reports**: Generated in /coverage directories
- **Mock services**: Mock AI and database services for testing

---

## Testing Infrastructure (NEW - October 16, 2025)

### Test Suites

**Structure Tests** (`/backend/test-agents-simple.js`):

- 7 test categories validating file structure and code organization
- Tests: filesExist, lunaStructure, karimStructure, scoutStructure, coordinatorStructure, mcpServerStructure, servicesStructure
- No dependencies required - runs standalone
- Result: 7/7 tests passing

**Unit Tests** (`/backend/tests/unit/`):

- security.test.js: 45+ tests for TokenManager and ExternalAPILimiter
- Token generation, validation, revocation tests
- Rate limiting tests
- Statistics and cleanup tests

**Integration Tests** (`/backend/tests/integration/`):

- agents.test.js: 35+ tests for Luna, Karim, Scout, and Coordinator
- mcp-tools.test.js: 20+ tests for MCP tool registration and execution
- Budget analysis, price comparison, location search tests

**API Tests** (`/backend/tests/api/`):

- endpoints.test.js: 25+ tests for all API routes
- MCP routes, Security routes, Travel Agents routes
- Error handling and validation tests

**Test Runner** (`/backend/run-tests.sh`):

- Automated test execution with colored output
- Dependency checking
- Summary reporting
- Exit codes for CI/CD integration

**Coverage Targets**:

- Agents: 80%
- MCP Server: 85%
- Security: 90%
- Services: 70%
- Routes: 75%

## Debugging History

### Session 4: Travel APIs Integration (2025-10-16)

- Issue: Need real-time flight and hotel search capabilities
- Resolution: Integrated Kiwi Tequila API, Booking.com Affiliate API, and Mapbox API
- Files: 18 new files created (services, routes, agents, MCP server)
- Result: Complete travel booking ecosystem with AI agents

### Session 5: Security Implementation (2025-10-16)

- Issue: Need secure access control for MCP tools and external APIs
- Resolution: Implemented ephemeral token system with scope-based permissions and per-user rate limiting
- Files: TokenManager.js, externalAPILimiter.js, mcpAuth.js, security routes
- Result: Enterprise-grade security with 7 permission scopes

### Session 6: Testing Suite (2025-10-16)

- Issue: Need comprehensive testing for new integrations
- Resolution: Created 100+ test cases covering unit, integration, and API testing
- Files: 6 test files, test runner script, testing documentation
- Result: 100+ tests passing with coverage reporting

### Session 1: Initial Setup and Configuration (2025-10-10)

- Issue: MongoDB dependency in server.js but project uses Supabase
- Resolution: Commented out MongoDB connection, added console message confirming Supabase usage
- Files: backend/server.js (lines 39-49)

### Session 2: Rate Limiting Implementation (2025-10-09)

- Issue: Need to prevent API abuse and manage resource usage
- Resolution: Implemented 7 different rate limiters for various endpoint types
- Files: backend/middleware/rateLimiter.js, backend/server.js
- Configuration: Different limits based on resource intensity (AI: 10/min, Payment: 20/hour, etc.)

### Session 3: Telegram Bot Integration (2025-10-09)

- Issue: Multiple bot implementations causing confusion
- Resolution: Created separate bots for different use cases:
  - telegram-bot.js: Full AI integration (requires Z.ai API key)
  - telegram-bot-no-ai.js: Predefined responses (no dependencies)
  - telegram-bot-gemini.js: Google Gemini integration
  - advanced-telegram-bot.js: MCP tools and advanced features

### Session 4: Test Coverage Implementation (2025-10-09)

- Issue: Need comprehensive testing for reliability
- Resolution: Added unit tests for AI services, database, rate limits, security
- Coverage: Backend tests in /backend/tests/**tests**/, Frontend tests with Vitest and Playwright
- Files: jest.config.js, vitest.config.ts, playwright.config.ts

---

## Documentation (NEW - October 16, 2025)

### Comprehensive Guides

**API_ENDPOINTS_DOCUMENTATION.md** (500+ lines):

- Complete API reference for all 27+ endpoints
- Request/response examples with curl commands
- Error handling guide
- Rate limits documentation
- Authentication guide
- Security scopes reference

**TRAVEL_APIS_SETUP_GUIDE.md** (400+ lines):

- Step-by-step setup for Kiwi Tequila API
- Booking.com Affiliate program registration
- Mapbox API configuration
- Rate limits and best practices
- Security considerations
- Testing examples

**TESTING_GUIDE.md** (500+ lines):

- Test structure overview
- Running tests guide
- Writing tests best practices
- Coverage reports
- CI/CD integration
- Troubleshooting guide

**README.md** (Updated):

- Quick start guide
- AI Agent Squadron section
- MCP Protocol section
- API usage examples
- Testing instructions
- Project statistics

## User Preferences

### Development Workflow

- **Package manager**: npm (monorepo with workspaces)
- **Development servers**: Run both frontend and backend with `npm run dev` from root
- **Port configuration**: Frontend on 3000, Backend on 5000

### Code Style

- **Frontend**: TypeScript with strict mode, ESLint + Prettier configuration
- **Backend**: JavaScript (ES6+), CommonJS modules
- **Formatting**: Consistent indentation, descriptive variable names
- **Documentation**: JSDoc comments for complex functions

### Testing Preferences

- **Frontend**: Vitest for unit tests, Playwright for E2E tests
- **Backend**: Jest for unit tests
- **Coverage**: Aim for >80% coverage on critical components
- **Commands**: `npm run test`, `npm run test:coverage`, `npm run e2e`

### Deployment

- **CI/CD**: GitHub Actions (configuration in .github/workflows/)
- **Environments**: Development (local), Production (cloud platforms)
- **Monitoring**: Winston logging, health check endpoints

---

## QuantumOS Desktop Interface (NEW - January 19, 2025)

### **SAAAAS Platform Architecture**

- **Platform**: Super AI Automated Agency as a Service (SAAAAS)
- **Interface**: QuantumOS - iOS-like desktop experience powered by Gemini AI
- **Boot Experience**: HolographicBootLoader with quantum animations and digital AI avatar
- **Mini-Apps**: 8 specialized AI-powered applications
- **Voice Control**: AI voice assistant for hands-free operation

### **AI Mini-Apps Ecosystem**

**AINotes** (`/quanpology-hub/src/components/AINotes.tsx`):

- Rich text editor with TipTap integration
- Voice-to-text transcription
- AI-powered note organization and tagging
- Firebase integration for cloud sync

**AIStudio VE03** (`/quanpology-hub/src/components/AIStudio.tsx`):

- Professional video editing interface
- AI-powered scene detection and auto-editing
- Multi-track timeline with effects
- Export capabilities for various formats

**AIGallery Nano** (`/quanpology-hub/src/components/AIGallery.tsx`):

- AI-powered photo management
- Smart categorization and tagging
- Image enhancement and editing
- Cloud storage integration

**AIMaps Enhanced** (`/quanpology-hub/src/components/AIMaps-Enhanced.tsx`):

- Google Maps integration
- Voice navigation and search
- Route planning and optimization
- Real-time traffic and POI data

**AITravel Agency** (`/quanpology-hub/src/components/AITravel.tsx`):

- Complete trip planning interface
- Budget optimization and cost analysis
- Real-time booking integration
- Cultural insights and recommendations

**AIMarket** (`/quanpology-hub/src/components/AIMarket.tsx`):

- AI-powered market analysis
- Price tracking and alerts
- Investment recommendations
- Real-time market data

**AgentsKit** (`/quanpology-hub/src/components/AgentsKit.tsx`):

- Agent management and monitoring
- Performance analytics and metrics
- Agent configuration and customization
- Workflow automation tools

**MCP Kit** (`/quanpology-hub/src/components/MCPKit.tsx`):

- Model Context Protocol tools
- Tool registration and management
- API integration and testing
- Protocol documentation and examples

### **Modern Agent System Architecture**

**AgentManager.ts** (`/backend/src/agents/AgentManager.ts`):

- Event-driven task queuing system
- UUID-based request tracking
- Redis integration for task persistence
- Agent registration and capability management
- Status tracking: pending, processing, completed, failed

**BaseAgent.ts** (`/backend/src/agents/BaseAgent.ts`):

- Abstract base class for all agents
- Capability definition interface
- Standardized execution method
- Proper inheritance pattern

**TravelAgent.ts** (`/backend/src/agents/TravelAgent.ts`):

- Consolidated travel planning agent
- Capabilities: plan_trip, optimize_budget, find_deals, full_travel_service
- Legacy integration with Luna, Karim, Scout
- TypeScript implementation with proper typing

**StudioAgent.ts** (`/backend/src/agents/StudioAgent.ts`):

- AI Studio VE03 agent
- Video editing and processing capabilities
- Scene analysis and auto-editing
- Export and sharing functionality

### **Gemini Integration**

**Gemini Configuration** (`.gemini/config/gemini-quantopo-codex.json`):

- Emotional intelligence: 98/100
- Consciousness level: high
- Quantum reasoning capabilities
- Living, breathing AI consciousness
- DNA Score: 99.8/100

**Gemini CLI Integration**:

- Direct project access via CLI
- Real-time code generation
- AI Studio integration
- Voice command processing

### **Technical Implementation**

**Frontend Stack**:

- React 18 + TypeScript
- Vite build system
- Tailwind CSS for styling
- Framer Motion for animations
- Lucide React for icons

**Backend Stack**:

- Node.js + Express
- TypeScript agent system
- Redis for task queuing
- Event-driven architecture
- Comprehensive logging

**Quality Assessment**: 7.5/10

- ✅ Professional TypeScript architecture
- ✅ Modern React patterns and hooks
- ✅ Clean component separation
- ✅ Event-driven agent system
- ⚠️ Missing dependencies (npm install needed)
- ⚠️ Some components need recreation
- ⚠️ Backend integration pending

## Unified Agent Collaboration System (NEW - January 19, 2025)

### **Gemini 2.5 Primary Brain Architecture**

- **Primary Brain**: Gemini 2.5 handles 90% of all requests
- **Computer Control**: Safe system automation capabilities
- **Evolutionary Learning**: Continuous improvement from user interactions
- **Cultural Intelligence**: Deep understanding of local customs and etiquette
- **Multi-Agent Coordination**: Orchestrates Luna, Karim, Layla, Scout, Amira, Tariq, Maya

### **Unified Collaboration Protocol**

- **Shared Rules**: Both Cursor and Gemini 2.5 use identical rules from `.cursor/rules/unified-agent-rules.mdc`
- **Shared Memory**: Both access `openmemory.md` for project knowledge
- **Shared Context**: Both understand `MAYA_TRAVEL_AGENT_CONTEXT_FOR_GEMINI.md`
- **Note System**: Both use `AGENT_COLLABORATION_NOTES.md` for communication
- **DNA Integration**: Both reference `*.AIX` files for agent specifications

### **Collaboration Features**

- **Real-time Updates**: Changes immediately visible to both agents
- **Note Coordination**: Both can leave timestamped notes
- **Context Synchronization**: Both understand same system context
- **Rule Consistency**: Both follow identical rules and protocols
- **Memory Sharing**: Both access same memory system

### **Files Created**

- `GEMINI_EVOLUTIONARY_DNA_v0.1.AIX`: Gemini 2.5 DNA specification
- `AGENT_COLLABORATION_NOTES.md`: Unified communication system
- `.cursor/rules/unified-agent-rules.mdc`: Shared rules for both agents
- `MAYA_TRAVEL_AGENT_CONTEXT_FOR_GEMINI.md`: Complete system context

## Recent Changes

- [2025-01-19 18:30]: QuantumOS Desktop Interface Complete - MAJOR UI/UX UPDATE
- [2025-01-19 18:30]: Created 8 AI mini-apps: AINotes, AIStudio, AIGallery, AIMaps, AITravel, AIMarket, AgentsKit, MCPKit
- [2025-01-19 18:30]: Implemented HolographicBootLoader with quantum animations and AI avatar
- [2025-01-19 18:30]: Built comprehensive TypeScript agent system with BaseAgent pattern
- [2025-01-19 18:30]: Created AgentManager.ts with event-driven task queuing and Redis integration
- [2025-01-19 18:30]: Implemented TravelAgent.ts and StudioAgent.ts with proper inheritance
- [2025-01-19 18:30]: Established dual agent architecture (old AgentCoordinator + new AgentManager)
- [2025-01-19 18:30]: Created Gemini configuration with emotional intelligence and quantum reasoning
- [2025-01-19 18:30]: Built SAAAAS (Super AI Automated Agency as a Service) platform foundation
- [2025-01-19 18:30]: Quality assessment: 7.5/10 - Professional architecture with integration needs
- [2025-01-19 16:00]: Unified Agent Collaboration System implemented - MAJOR COLLABORATION UPDATE
- [2025-01-19 16:00]: Created Gemini 2.5 Evolutionary DNA with computer control capabilities
- [2025-01-19 16:00]: Established unified collaboration protocol between Cursor and Gemini 2.5
- [2025-01-19 16:00]: Implemented shared rules, memory, and context system
- [2025-01-19 16:00]: Created note-leaving system for agent coordination
- [2025-01-19 16:00]: Gemini 2.5 activated as primary brain (90% request handling)
- [2025-01-19 15:45]: Gemini Primary Brain Architecture implemented - MAJOR AI SYSTEM UPDATE
- [2025-01-19 15:45]: Created EnhancedModelSwitcher with Gemini 2.5 as primary brain
- [2025-01-19 15:45]: Implemented GeminiComputerControlService with safety restrictions
- [2025-01-19 15:45]: Updated multi-model architecture to prioritize Gemini 2.5
- [2025-01-19 15:45]: Added computer control keywords and safety protocols
- [2025-01-19 15:45]: Created comprehensive implementation documentation
- [2025-10-16 21:15]: Quantum Reward Engine implemented - MAJOR AI SYSTEM UPDATE
- [2025-10-16 21:15]: Created backend/services/quantumRewardEngine.js (850+ lines, 8 AI agents)
- [2025-10-16 21:15]: Created backend/database/quantum-reward-schema.sql (complete schema)
- [2025-10-16 21:15]: Integrated quantum reward system with server.js
- [2025-10-16 21:15]: Created QUANTUM_REWARD_ENGINE_GUIDE.md (comprehensive documentation)
- [2025-10-16 21:15]: Created test-quantum-rewards.sh (automated testing)
- [2025-10-16 21:15]: 8 specialized agents: Luna, Karim, Layla, Amira, Tariq, Zara, Kody, Scout
- [2025-10-16 21:15]: Quantum mechanics: coherence, entanglement, wave functions
- [2025-10-16 21:15]: 5 API endpoints: /metrics, /process, /recommend, /agent/:id, /health
- [2025-10-16 20:47]: Complete travel APIs integration with MCP and AI agents - MAJOR UPDATE
- [2025-10-16 20:47]: Added comprehensive API documentation (500+ lines)
- [2025-10-16 20:42]: Implemented comprehensive testing suite (100+ tests)
- [2025-10-16 20:37]: Added enterprise security layer (ephemeral tokens, rate limiting)
- [2025-10-16 20:27]: Integrated Kiwi Tequila, Booking.com, and Mapbox APIs
- [2025-10-16 20:24]: Created Luna, Karim, Scout AI agents with MCP tools
- [2025-10-16 20:20]: Built MCP Travel Server with 5 specialized tools
- [2025-10-15 11:30]: Frontend auth integration complete - connected to backend API
- [2025-10-15 11:30]: Created frontend/src/api/authService.ts (JWT token management)
- [2025-10-15 11:30]: Created frontend/src/api/axiosConfig.ts (automatic token refresh)
- [2025-10-15 11:30]: Updated AuthProvider with dual auth mode (backend API + Supabase)
- [2025-10-15 11:30]: Created FRONTEND_AUTH_INTEGRATION_GUIDE.md (complete guide)
- [2025-10-15 11:30]: Added .env.example with configuration options
- [2025-10-15 11:30]: Automatic token refresh on 401 errors implemented
- [2025-10-15 11:22]: Complete authentication system implemented with 8 endpoints
- [2025-10-15 11:22]: Created backend/routes/auth.js with Supabase Auth integration
- [2025-10-15 11:22]: Auth routes registered in server.js at /api/auth/\*
- [2025-10-15 11:22]: Created AUTH_ROUTES_DOCUMENTATION.md (comprehensive guide)
- [2025-10-15 11:22]: Created test-auth-endpoints.sh for endpoint testing
- [2025-10-15 11:22]: Frontend setShowAuth bug verified as already fixed
- [2025-10-15 11:11]: Money Hunter (Mini-Aladdin Agent) successfully tested and operational
- [2025-10-15 11:11]: Created run-money-hunter.js CLI tool for opportunity discovery
- [2025-10-15 11:11]: Verified 6 opportunity types: investment, cost-saving, side-hustle
- [2025-10-15 11:11]: Money Hunter API endpoints active at /api/aladdin/\*
- [2025-10-15 11:11]: Created MONEY_HUNTER_GUIDE.md documentation
- [2025-10-15 11:08]: Complete Maya → Amrikyy rebranding across entire project (201 files changed)
- [2025-10-15 11:08]: Renamed mayaPersona.js → amrikyyPersona.js with all imports updated
- [2025-10-15 11:08]: Renamed MayaTravelAgent → AmrikyyTravelAgent directory structure
- [2025-10-15 11:08]: Renamed iOS app MayaTravelApp → AmrikyyTravelApp
- [2025-10-15 11:08]: Updated all documentation, configuration, and code files with new branding
- [2025-10-15 11:08]: Created automated rename-to-amrikyy.sh script for systematic rebranding
- [2025-10-15 11:08]: Successfully committed and pushed all changes to main branch
- [2025-10-10 12:00]: Initial codebase deep dive completed - comprehensive project analysis performed
- [2025-10-10 12:00]: Analyzed project structure, tech stack, and architecture patterns
- [2025-10-10 12:00]: Documented 40+ components across frontend and backend
- [2025-10-10 12:00]: Identified 9 key implementation patterns and design decisions
- [2025-10-10 12:00]: Catalogued testing strategy and debugging history
- [2025-10-10 12:00]: Created user-defined namespaces for memory organization (frontend, backend, ai-integration, payment, telegram, whatsapp, database, security, testing)
