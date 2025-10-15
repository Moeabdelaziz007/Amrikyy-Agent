# 🏛️ Maya Travel Agent - Architecture Documentation

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Users / Clients                          │
│  (Web Browser, Telegram App, Mobile Devices)                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Frontend Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  React Web   │  │  Telegram    │  │   Mobile     │         │
│  │     App      │  │   Mini App   │  │   WebView    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Rate Limiting │ CORS │ Security │ Compression          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend Services                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │    AI    │  │ Payment  │  │ Telegram │  │ WhatsApp │       │
│  │ Service  │  │ Service  │  │   Bot    │  │ Service  │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   External Services                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Z.ai    │  │  Stripe  │  │ Telegram │  │ WhatsApp │       │
│  │ GLM-4.6  │  │   API    │  │   API    │  │   API    │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Supabase (PostgreSQL)                        │  │
│  │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐      │  │
│  │  │Users │  │Trips │  │Msgs  │  │Offers│  │Logs  │      │  │
│  │  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Interaction Diagram

// End of Selection
```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTP/HTTPS
       ▼
┌─────────────────────────────────────────────────────────┐
│                    Express Server                        │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │           Middleware Stack                      │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐    │    │
│  │  │ Helmet   │→ │   CORS   │→ │  Rate    │    │    │
│  │  │ Security │  │  Policy  │  │ Limiter  │    │    │
│  │  └──────────┘  └──────────┘  └──────────┘    │    │
│  └────────────────────────────────────────────────┘    │
│                         │                               │
│                         ▼                               │
│  ┌────────────────────────────────────────────────┐    │
│  │              Route Handlers                     │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐    │    │
│  │  │   /ai    │  │ /payment │  │/telegram │    │    │
│  │  └──────────┘  └──────────┘  └──────────┘    │    │
│  └────────────────────────────────────────────────┘    │
│                         │                               │
│                         ▼                               │
│  ┌────────────────────────────────────────────────┐    │
│  │           Service Layer                         │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐    │    │
│  │  │ ZaiClient│  │ Payment  │  │ Supabase │    │    │
│  │  │          │  │ Service  │  │    DB    │    │    │
│  │  └──────────┘  └──────────┘  └──────────┘    │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## Request Flow Diagram

### AI Chat Request Flow

```
User Input
    │
    ▼
┌─────────────────┐
│  AIAssistant    │ (Frontend Component)
│  Component      │
└────────┬────────┘
         │ POST /api/ai/chat
         ▼
┌─────────────────┐
│  Rate Limiter   │ (10 req/min)
│  Middleware     │
└────────┬────────┘
         │ ✓ Allowed
         ▼
┌─────────────────┐
│  AI Route       │ (routes/ai.js)
│  Handler        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  ZaiClient      │ (src/ai/zaiClient.js)
│  chatCompletion │
└────────┬────────┘
         │ HTTP Request
         ▼
┌─────────────────┐
│  Z.ai API       │ (External Service)
│  GLM-4.6        │
└────────┬────────┘
         │ AI Response
         ▼
┌─────────────────┐
│  Save to DB     │ (Optional)
│  (Supabase)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Return JSON    │
│  Response       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Display in     │
│  Chat UI        │
└─────────────────┘
```

---

### Payment Flow Diagram

```
User Clicks "Pay"
    │
    ▼
┌─────────────────┐
│  PaymentModal   │ (Frontend)
│  Component      │
└────────┬────────┘
         │ POST /api/payment/create-payment-link
         ▼
┌─────────────────┐
│  Rate Limiter   │ (20 req/hour)
│  Middleware     │
└────────┬────────┘
         │ ✓ Allowed
         ▼
┌─────────────────┐
│  Payment Route  │ (routes/payment.js)
│  Handler        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Stripe API     │ (External)
│  Create Link    │
└────────┬────────┘
         │ Payment URL
         ▼
┌─────────────────┐
│  Return to      │
│  Frontend       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Open Stripe    │
│  Checkout       │
└────────┬────────┘
         │ User Pays
         ▼
┌─────────────────┐
│  Stripe Webhook │
│  Notification   │
└────────┬────────┘
         │ POST /api/payment/webhook
         ▼
┌─────────────────┐
│  Verify         │
│  Signature      │
└────────┬────────┘
         │ ✓ Valid
         ▼
┌─────────────────┐
│  Update DB      │
│  (Supabase)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Send           │
│  Confirmation   │
└─────────────────┘
```

---

### Telegram Bot Flow

```
User → Telegram Message
    │
    ▼
┌─────────────────┐
│  Telegram       │
│  Servers        │
└────────┬────────┘
         │ Webhook
         ▼
┌─────────────────┐
│  telegram-bot.js│ (Backend)
│  Message Handler│
└────────┬────────┘
         │
         ├─→ Command? (/start, /help)
         │       │
         │       ▼
         │   ┌─────────────────┐
         │   │  Handle Command │
         │   └─────────────────┘
         │
         └─→ Text Message?
                 │
                 ▼
         ┌─────────────────┐
         │  AI Enabled?    │
         └────────┬────────┘
                  │
         ┌────────┴────────┐
         │                 │
         ▼                 ▼
    ┌─────────┐      ┌─────────┐
    │ ZaiClient│      │Predefined│
    │ Response │      │Response  │
    └────┬────┘      └────┬─────┘
         │                │
         └────────┬───────┘
                  │
                  ▼
         ┌─────────────────┐
         │  Save to DB     │
         │  (Supabase)     │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │  Send Reply     │
         │  to User        │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │  Telegram       │
         │  Delivers       │
         └─────────────────┘
```

---

## Database Schema

```
┌─────────────────────────────────────────────────────────────┐
│                        Supabase Database                     │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│    users     │         │    trips     │         │  expenses    │
├──────────────┤         ├──────────────┤         ├──────────────┤
│ id (PK)      │◄───┐    │ id (PK)      │◄───┐    │ id (PK)      │
│ email        │    │    │ user_id (FK) │    │    │ trip_id (FK) │
│ full_name    │    └────┤ destination  │    └────┤ user_id (FK) │
│ avatar_url   │         │ start_date   │         │ category     │
│ created_at   │         │ end_date     │         │ amount       │
│ updated_at   │         │ budget       │         │ description  │
└──────────────┘         │ status       │         │ date         │
                         │ image_url    │         │ created_at   │
                         │ created_at   │         └──────────────┘
                         │ updated_at   │
                         └──────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│  profiles    │         │   messages   │         │travel_offers │
├──────────────┤         ├──────────────┤         ├──────────────┤
│ telegram_id  │◄───┐    │ id (PK)      │         │ id (PK)      │
│ username     │    │    │ telegram_id  │─────────┤ title        │
│ avatar_url   │    │    │ content      │         │ destination  │
│ preferences  │    │    │ role         │         │ price        │
│ travel_hist  │    │    │ is_telegram  │         │ discount_%   │
│ created_at   │    │    │ created_at   │         │ category     │
│ updated_at   │    │    └──────────────┘         │ duration_days│
└──────────────┘    │                              │ includes     │
                    │    ┌──────────────┐         │ is_active    │
                    │    │destinations  │         │ priority     │
                    │    ├──────────────┤         │ created_at   │
                    │    │ id (PK)      │         └──────────────┘
                    │    │ name         │
                    │    │ country      │
                    │    │ image_url    │
                    │    │ rating       │
                    │    │ price_range  │
                    │    │ best_time    │
                    │    │ description  │
                    │    │ created_at   │
                    │    └──────────────┘
                    │
                    │    ┌──────────────┐
                    └────│ai_conversations│
                         ├──────────────┤
                         │ id (PK)      │
                         │ user_id (FK) │
                         │ message      │
                         │ response     │
                         │ created_at   │
                         └──────────────┘
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Security Layers                         │
└─────────────────────────────────────────────────────────────┘

Layer 1: Network Security
┌─────────────────────────────────────────────────────────────┐
│  • HTTPS/TLS Encryption                                      │
│  • CORS Policy                                               │
│  • Firewall Rules                                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
Layer 2: Application Security
┌─────────────────────────────────────────────────────────────┐
│  • Helmet.js (Security Headers)                              │
│  • Rate Limiting (DDoS Protection)                           │
│  • Input Validation                                          │
│  • XSS Prevention                                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
Layer 3: Authentication & Authorization
┌─────────────────────────────────────────────────────────────┐
│  • JWT Tokens                                                │
│  • Telegram WebApp Verification                              │
│  • Supabase Auth                                             │
│  • API Key Validation                                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
Layer 4: Data Security
┌─────────────────────────────────────────────────────────────┐
│  • Encrypted Database (Supabase)                             │
│  • Row Level Security (RLS)                                  │
│  • Secure Environment Variables                              │
│  • No Sensitive Data in Logs                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Rate Limiting Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Rate Limiting Strategy                     │
└─────────────────────────────────────────────────────────────┘

Request → Rate Limiter Middleware
              │
              ├─→ General API (100 req/15min)
              │   └─→ All /api/* routes
              │
              ├─→ AI Endpoints (10 req/min)
              │   ├─→ /api/ai/chat
              │   ├─→ /api/ai/travel-recommendations
              │   ├─→ /api/ai/budget-analysis
              │   └─→ /api/ai/destination-insights
              │
              ├─→ Multimodal AI (20 req/hour)
              │   └─→ /api/ai/multimodal/analyze
              │
              ├─→ Payment (20 req/hour)
              │   ├─→ /api/payment/create-payment-link
              │   ├─→ /api/payment/create-payment
              │   └─→ /api/payment/confirm-payment
              │
              ├─→ Webhooks (30 req/min)
              │   ├─→ /api/payment/webhook
              │   ├─→ /api/whatsapp/webhook
              │   └─→ /api/telegram/webhook
              │
              └─→ Analytics (50 req/min)
                  └─→ /api/analytics/events

┌─────────────────────────────────────────────────────────────┐
│  Rate Limit Exceeded (429)                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  {                                                      │ │
│  │    "success": false,                                   │ │
│  │    "error": "Too many requests",                       │ │
│  │    "retryAfter": 900,                                  │ │
│  │    "limit": 10,                                        │ │
│  │    "window": "1 minute"                                │ │
│  │  }                                                      │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Production Environment                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────┐
│   GitHub Repo   │
└────────┬────────┘
         │ git push
         ▼
┌─────────────────┐
│  GitHub Actions │ (CI/CD)
│  ┌───────────┐  │
│  │ Run Tests │  │
│  │ Build     │  │
│  │ Deploy    │  │
│  └───────────┘  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Cloud Platform                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Frontend   │  │   Backend    │  │   Database   │     │
│  │   (Vercel/   │  │   (Railway/  │  │  (Supabase)  │     │
│  │   Netlify)   │  │   Render)    │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         └────────────────────┴────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Monitoring & Logging                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Logs       │  │   Metrics    │  │   Alerts     │     │
│  │   (Winston)  │  │   (Custom)   │  │   (Email)    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## Scalability Considerations

### Horizontal Scaling

```
┌─────────────────┐
│  Load Balancer  │
└────────┬────────┘
         │
    ┌────┴────┬────────┬────────┐
    │         │        │        │
    ▼         ▼        ▼        ▼
┌────────┐┌────────┐┌────────┐┌────────┐
│Server 1││Server 2││Server 3││Server N│
└────────┘└────────┘└────────┘└────────┘
    │         │        │        │
    └────┬────┴────────┴────────┘
         │
         ▼
┌─────────────────┐
│    Database     │
│   (Supabase)    │
└─────────────────┘
```

### Caching Strategy

```
Request
    │
    ▼
┌─────────────────┐
│  Check Cache    │
│  (Redis/Memory) │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
  Hit       Miss
    │         │
    │         ▼
    │    ┌─────────────────┐
    │    │  Fetch from DB  │
    │    └────────┬────────┘
    │             │
    │             ▼
    │    ┌─────────────────┐
    │    │  Store in Cache │
    │    └────────┬────────┘
    │             │
    └─────────────┘
                  │
                  ▼
         ┌─────────────────┐
         │  Return Data    │
         └─────────────────┘
```

---

## Error Handling Flow

```
Request
    │
    ▼
┌─────────────────┐
│  Try Operation  │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
Success    Error
    │         │
    │         ▼
    │    ┌─────────────────┐
    │    │  Catch Error    │
    │    └────────┬────────┘
    │             │
    │             ▼
    │    ┌─────────────────┐
    │    │  Log Error      │
    │    └────────┬────────┘
    │             │
    │             ▼
    │    ┌─────────────────┐
    │    │  Format Error   │
    │    │  Response       │
    │    └────────┬────────┘
    │             │
    └─────────────┘
                  │
                  ▼
         ┌─────────────────┐
         │  Return to      │
         │  Client         │
         └─────────────────┘
```

---

## Monitoring & Observability

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Metrics                       │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Request    │  │   Response   │  │    Error     │
│    Rate      │  │     Time     │  │     Rate     │
└──────────────┘  └──────────────┘  └──────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Memory     │  │     CPU      │  │   Database   │
│    Usage     │  │    Usage     │  │  Connections │
└──────────────┘  └──────────────┘  └──────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Rate Limit  │  │   Payment    │  │   AI API     │
│  Violations  │  │   Success    │  │   Calls      │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

**Last Updated**: 2024-10-09  
**Version**: 1.0.0  
**Maintained by**: Maya Trips Team
