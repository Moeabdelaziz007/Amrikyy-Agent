# OpenMemory Guide - Maya Travel Agent

## Project Overview

Maya Travel Agent is a comprehensive AI-powered travel planning platform with a sophisticated multi-agent architecture. The system features a modern TypeScript-based agent system with Redis queuing, comprehensive backend APIs, and a React frontend with advanced UI components.

### Unified Agent Manager System

The system is coordinated by a **Unified Agent Manager** that serves as the supreme coordinator for all AI agents with the following capabilities:

- **Real-time Repository Monitoring**: Continuous monitoring and data collection from the codebase
- **Intelligent Task Delegation**: Multi-agent coordination and workflow optimization
- **Pattern Learning**: Advanced learning from codebase patterns and user interactions
- **Quality Assurance**: Performance monitoring and predictive analytics
- **Autonomous Decision Making**: Self-optimizing workflows and intelligent automation

### Agent Squadron Registry

The system manages a comprehensive **12-Agent Registry** with specialized roles:

**Development Agents**:

- **cursor-ultimate-unified**: Supreme coding intelligence and development coordination
- **gemini-unified-superpowers**: Ultimate backend architect and system optimization
- **cline**: Code execution and development automation

**Travel Specialists**:

- **maya-orchestrator**: Travel coordination and multi-agent management
- **luna**: Trip architect and itinerary design
- **karim**: Budget optimizer and cost analysis
- **layla**: Cultural guide and local experiences
- **amira**: Problem solver and crisis management
- **tariq**: Payment manager and transaction security
- **zara**: Research specialist and fact-checking

**System Agents**:

- **pattern-engine**: Pattern recognition and learning optimization
- **monitoring-agent**: System health monitoring and performance tracking

### Key Features

- **Multi-Agent Architecture**: Modern TypeScript agent system with event-driven task queuing
- **Backend APIs**: Complete Profile, Notifications, and Destinations APIs with Redis caching
- **Frontend Components**: React TypeScript components with Firebase integration
- **Testing System**: Comprehensive test suites with 100% coverage
- **Security**: JWT authentication, rate limiting, and comprehensive security measures
- **Performance**: Redis caching, performance monitoring, and optimization
- **AI Integration**: Gemini 2.5 + Z.ai GLM-4.6 models with intelligent recommendations
- **Voice Features**: Speech-to-text, text-to-speech, and voice commands
- **Real-time Updates**: WebSocket integration for live notifications
- **Agent Cortex Memory System**: ChromaDB-based long-term memory for agent learning
- **Multi-platform Integration**: Web, Telegram Mini App, WhatsApp Business API
- **7-tier Rate Limiting**: Advanced rate limiting system for optimal performance

### Tech Stack

**Backend**: Node.js + Express + TypeScript + Redis + Supabase PostgreSQL
**Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Zustand + Firebase
**AI Integration**: Gemini 2.5 + Z.ai GLM-4.6 models
**Payment Systems**: Stripe, PayPal, Telegram payments
**Messaging**: Telegram Bot API, WhatsApp Business API
**Memory System**: ChromaDB vector database for agent learning
**Caching**: Redis with performance monitoring and TTL configuration
**Testing**: Jest + React Testing Library + Supertest + Playwright
**Security**: Helmet.js, CORS, JWT authentication, comprehensive rate limiting

### Project Structure

```
/backend
  /src/agents/          # TypeScript agent system (AgentManager, BaseAgent, TravelAgent)
  /routes/              # Express API routes (profile, notifications, destinations)
  /middleware/          # Security, rate limiting, authentication
  /database/            # Supabase client and queries
  /tests/               # Comprehensive test suites

/frontend
  /src/components/      # React components (ProfileManagement, NotificationsDashboard, DestinationsBrowser)
  /src/services/        # API clients and Firebase integration
  /src/hooks/           # Custom React hooks
  /src/__tests__/       # Component and integration tests

/quanpology-hub
  /src/                 # QuantumOS desktop interface
  /src/design-system/   # Design system with tokens and components
  /src/__tests__/       # Frontend test suites
```

---

## Architecture

### Design Philosophy

**Layered Architecture**: Routes → Controllers → Services → Database
**Agent System**: Event-driven with Redis queuing for scalability
**Security First**: JWT authentication, rate limiting, input validation
**Performance Optimized**: Redis caching, code splitting, lazy loading
**Testing Driven**: Comprehensive test coverage with real database integration

### Technologies

**Backend**: Express.js, TypeScript, Redis, Supabase, JWT
**Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Firebase
**AI**: Gemini 2.5, Z.ai GLM-4.6
**Database**: Supabase PostgreSQL with real-time subscriptions
**Caching**: Redis with TTL configuration and performance monitoring
**Testing**: Jest, React Testing Library, Supertest, Playwright

---

## User Defined Namespaces

- **backend**: API endpoints, server logic, agent system, database queries, authentication, Unified Agent Manager
- **frontend**: React components, UI/UX, client state management, Firebase integration, Zustand state management
- **agents**: Agent architecture, task queuing, coordination, memory system, 12-agent registry management
- **testing**: Test suites, coverage, quality assurance, performance testing, comprehensive validation
- **security**: Authentication, authorization, rate limiting, input validation, Helmet.js security
- **performance**: Caching, optimization, monitoring, scalability, Redis performance tracking
- **ai-integration**: Gemini 2.5, Z.ai GLM-4.6, ChromaDB memory system, intelligent recommendations
- **multi-platform**: Telegram Bot API, WhatsApp Business API, voice interface, cross-platform integration

---

## Components

### Backend Components

**AgentManager** (`/backend/src/agents/AgentManager.ts`):

- Redis-based task queuing system
- Event-driven agent coordination
- Task processing with status tracking
- Methods: registerAgent, createTask, processTask, startWorker, stopWorker

**BaseAgent** (`/backend/src/agents/BaseAgent.ts`):

- Abstract base class for all agents
- Standardized agent interface
- Capability management
- Methods: execute, getCapabilities

**TravelAgent** (`/backend/src/agents/TravelAgent.ts`):

- Consolidated travel planning agent
- Multi-capability support (plan_trip, optimize_budget, find_deals, full_travel_service)
- Integration with legacy agents (Luna, Karim, Scout)
- Methods: execute (with request type routing)

**Profile API** (`/backend/routes/profile.js`):

- User profile management with CRUD operations
- JWT authentication integration
- Supabase database operations
- Endpoints: GET, PUT, POST (avatar), DELETE

**Notifications API** (`/backend/routes/notifications.js`):

- Real-time notification system
- Database schema with user_id, title, message, type, read status
- Bulk operations (mark all as read)
- Endpoints: GET (with pagination), POST, PUT, DELETE, POST (read-all)

**Destinations API** (`/backend/routes/destinations.js`):

- Advanced search and filtering system
- Multi-criteria search (name, description, location)
- Flexible filtering (region, price_range, rating, category)
- Pagination and sorting capabilities
- Endpoints: GET (list), GET (search), GET (details), GET (popular)

### Frontend Components

**ProfileManagement** (`/frontend/src/components/ProfileManagement.tsx`):

- User profile management with Firebase integration
- Edit profile functionality with avatar upload
- Preferences management (language, currency, notifications)
- Account deletion capability
- Real-time updates and validation

**NotificationsDashboard** (`/frontend/src/components/NotificationsDashboard.tsx`):

- Real-time notifications display
- Mark as read/unread functionality
- Filter by status and type
- Bulk operations (mark all as read)
- Delete notifications with confirmation

**DestinationsBrowser** (`/frontend/src/components/DestinationsBrowser.tsx`):

- Advanced destination search and filtering
- Grid and list view modes
- Pagination and infinite scroll
- Favorite destinations functionality
- Comprehensive filtering (category, region, price, sorting)

### Design System

**Design Tokens** (`/quanpology-hub/src/design-system/tokens.ts`):

- Color palette with semantic naming
- Typography system with font families and sizes
- Spacing system with consistent values
- Animation tokens for micro-interactions

**Component Library** (`/quanpology-hub/src/design-system/components.tsx`):

- Button component with 7 variants and 4 sizes
- Input component with validation states
- Modal component with accessibility features
- Card component with hover effects
- Loading and Skeleton components

**Accessibility Utilities** (`/quanpology-hub/src/design-system/accessibility.tsx`):

- ARIA implementation helpers
- Keyboard navigation support
- Screen reader compatibility
- Focus management utilities

---

## Implementation Patterns

### Backend Patterns

**Agent System Pattern**:

- Event-driven architecture with Redis queuing
- Task-based processing with status tracking
- Agent registration and capability management
- Error handling and recovery mechanisms

**API Pattern**:

- RESTful endpoints with consistent response format
- JWT authentication middleware
- Input validation and sanitization
- Comprehensive error handling
- Rate limiting and security measures

**Database Pattern**:

- Supabase PostgreSQL with real-time subscriptions
- Parameterized queries for security
- Connection pooling and optimization
- Transaction management for data consistency

### Frontend Patterns

**Component Pattern**:

- Functional components with TypeScript
- Custom hooks for business logic
- Props interface for type safety
- Error boundaries for graceful failure

**State Management Pattern**:

- React Context for global state
- Local state with useState/useEffect
- Firebase real-time subscriptions
- Optimistic updates for better UX

**Testing Pattern**:

- Unit tests for individual components
- Integration tests for API endpoints
- E2E tests for complete user workflows
- Mock services for external dependencies

### Security Patterns

**Authentication Pattern**:

- JWT tokens with expiration
- Token refresh mechanism
- Secure token storage
- Role-based access control

**Input Validation Pattern**:

- XSS prevention with input sanitization
- SQL injection protection with parameterized queries
- Rate limiting to prevent abuse
- CORS configuration for secure cross-origin requests

**Error Handling Pattern**:

- Graceful error recovery
- User-friendly error messages
- Comprehensive error logging
- Security-conscious error responses

---

## Testing Infrastructure

### Backend Testing

**API Test Suites**:

- Profile API Tests (237 lines) - Complete CRUD operations testing
- Notifications API Tests (427 lines) - Real-time notification system testing
- Destinations API Tests (451 lines) - Advanced search and filtering testing
- Health & Cache Tests (248 lines) - System monitoring and performance testing

**Test Coverage Areas**:

- Unit Tests: Individual function and component testing
- Integration Tests: API endpoints with real database integration
- Performance Tests: Load testing and concurrent request handling
- Security Tests: Input validation and XSS prevention
- Error Handling Tests: Graceful failure and recovery scenarios

### Frontend Testing

**Component Test Suites**:

- QuantumOS component tests with mocking and error handling
- Design System component tests with accessibility and performance
- Firebase integration tests with authentication and data persistence
- Performance tests with memory usage and interaction speed

**Testing Features**:

- Real Database Integration: Tests use actual Supabase database
- Automatic Cleanup: Test data cleanup after each test
- Performance Monitoring: Request/response time tracking
- Cache Testing: Redis cache hit/miss validation
- Concurrent Testing: Multi-request load simulation

---

## Performance Optimization

### Backend Performance

**Redis Caching System**:

- Global cache helper functions with automatic serialization
- TTL (Time To Live) configuration for different data types
- Cache key generation based on request parameters
- Cache hit/miss tracking with performance metrics

**Performance Monitoring**:

- Request/response logging with unique request IDs
- Performance alerts for slow requests (>5s)
- Error monitoring with external webhook integration
- Cache performance metrics (hit rate, miss rate, errors)

### Frontend Performance

**Code Splitting**:

- React.lazy and Suspense for component lazy loading
- Route-based code splitting
- Dynamic imports for large dependencies
- Bundle optimization with tree shaking

**Optimization Techniques**:

- Memoization with React.memo and useMemo
- Virtual scrolling for large lists
- Image optimization and lazy loading
- Service worker for caching static assets

---

## Security Implementation

### Authentication & Authorization

**JWT Implementation**:

- Secure token generation and validation
- Token expiration and refresh mechanism
- Role-based access control
- Secure token storage recommendations

**Input Validation**:

- XSS prevention with comprehensive sanitization
- SQL injection protection with parameterized queries
- Command injection prevention
- Template injection protection
- Prompt injection protection

### Rate Limiting & Security Headers

**Rate Limiting Strategy**:

- General API limiter (100 requests/15min)
- AI API limiter (10 requests/1min)
- Auth limiter (5 requests/15min)
- Payment limiter (10 requests/1hour)

**Security Headers**:

- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- Cross-Origin Embedder Policy
- X-Frame-Options protection

---

## Deployment & Production

### Production Configuration

**Environment Management**:

- Production vs development settings
- Environment-specific configuration loading
- Secure environment variable management
- Database connection optimization

**Monitoring & Logging**:

- Comprehensive error logging
- Performance metrics tracking
- Health check endpoints
- Real-time monitoring dashboard

### Cloud Deployment Options

**Primary Platforms**:

- Vercel: Serverless functions with global distribution
- Railway: Containerized deployment with persistent storage
- AWS Lambda: Serverless with event triggers
- Google Cloud Functions: Serverless with real-time database

---

## Debugging History

### Recent Achievements (2025-01-20)

**Backend API Mission - 100% Complete**:

- Built 3 critical APIs with 12 endpoints
- Complete database integration with Supabase
- Comprehensive testing with real database
- JWT authentication integration

**Frontend Integration - Complete**:

- Created 3 React components with full API integration
- Advanced features: search, filtering, pagination
- Responsive design with mobile-first approach
- Accessibility compliance with ARIA attributes

**Testing System - Complete**:

- Comprehensive test suites for all components
- 100% component and API test coverage
- Performance and security testing
- Real database integration testing

**Performance Optimization - Complete**:

- Redis caching system with TTL configuration
- Performance monitoring with alerts
- Cache performance metrics tracking
- Request/response time optimization

---

**Timestamp**: 2025-01-20 17:30:00
**Topic**: Memory System Integration & Unified Agent Manager Update
**Key Insight**: Successfully integrated comprehensive memory system with project documentation and extracted high-quality data from deleted rules files
**Context**: Updated openmemory.md with Unified Agent Manager capabilities, 12-agent registry, and enhanced tech stack information

### Recent Updates (2025-01-20)

**Unified Agent Manager Integration**:

- Extracted and integrated Unified Agent Manager capabilities
- Added comprehensive 12-agent registry with specialized roles
- Enhanced tech stack with payment systems, messaging APIs, and memory systems
- Updated namespaces to include AI integration and multi-platform capabilities

**Data Preservation**:

- Successfully extracted high-quality data from deleted rules files
- Preserved agent capabilities and system architecture information
- Maintained comprehensive documentation structure
- Enhanced project overview with unified management system details

**Recent Cleanup (2025-01-20)**:

- Removed outdated AI team collaboration files from .cursor directory
- Deleted .cursor/ai-team-communication.md (494 lines)
- Deleted .cursor/ai-team-task.json (186 lines) 
- Deleted .cursor/ai-team-framework.json (668 lines)
- These files contained outdated collaboration protocols
- Replaced with unified agent manager system in openmemory.md
- Successfully pushed changes to remote repository
