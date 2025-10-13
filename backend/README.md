# Amrikyy Backend API

Enterprise-grade backend API server for the Amrikyy AI Automation Platform, featuring AI-powered travel services, quantum intelligence, and comprehensive automation capabilities.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp env.example .env

# Configure your .env file (see ENV_SETUP.md)

# Start development server
npm run dev

# Server runs on http://localhost:5001
```

## 📋 Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **Database**: Supabase account (or PostgreSQL)
- **Redis**: For session management (optional)
- **API Keys**: Amadeus, Stripe, OpenAI, Z.ai (see ENV_SETUP.md)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Backend API Server                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Express    │  │   Security   │  │  Monitoring  │      │
│  │   Server     │  │   Helmet     │  │   Sentry     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                  API Routes                           │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  • Travel API (Amadeus, Sabre, IZI)                  │   │
│  │  • Quantum Intelligence (DNA Engine, V3)             │   │
│  │  • AI Services (Z.ai, OpenAI)                        │   │
│  │  • Payment Processing (Stripe, Crypto)               │   │
│  │  • Telegram Mini App                                 │   │
│  │  • Admin Dashboard                                   │   │
│  │  • Blockchain & KYC                                  │   │
│  │  • Gamification & Predictions                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Supabase   │  │    Redis     │  │   MongoDB    │      │
│  │  PostgreSQL  │  │   Sessions   │  │   (Legacy)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
backend/
├── server.js                 # Main entry point
├── instrument.js             # Sentry instrumentation
├── routes/                   # API route handlers
│   ├── health.js            # Health check endpoints
│   ├── ai.js                # AI service integration
│   ├── quantum-v3.js        # Quantum Intelligence V3
│   ├── agent-dna.js         # DNA Engine
│   ├── payment.js           # Payment processing
│   ├── crypto-payment.js    # Cryptocurrency payments
│   ├── miniapp.js           # Telegram Mini App
│   ├── admin-dashboard.js   # Admin panel
│   ├── izi-travel.js        # IZI Travel API
│   ├── sabre.js             # Sabre GDS integration
│   ├── blockchain.js        # Blockchain services
│   ├── kyc.js               # KYC verification
│   ├── gamification.js      # Gamification system
│   ├── prediction.js        # Prediction engine
│   ├── workflow.js          # N8N workflow integration
│   ├── monitoring.js        # System monitoring
│   └── ...                  # Additional routes
├── src/                     # Source code
│   ├── services/            # Business logic services
│   ├── middleware/          # Express middleware
│   ├── utils/               # Utility functions
│   └── tests/               # Test suites
├── database/                # Database schemas & migrations
│   ├── production-schema-complete.sql
│   └── SCHEMA_MIGRATION_GUIDE.md
├── contracts/               # Smart contracts (Solidity)
├── smoke-tests/             # Smoke test suite
└── package.json             # Dependencies & scripts
```

## 🔧 Available Scripts

### Development
```bash
npm run dev              # Start with hot reload (nodemon)
npm start                # Start production server
npm run build            # Build (placeholder for future)
```

### Testing
```bash
npm test                 # Run all tests
npm run test:unit        # Unit tests with coverage
npm run test:integration # Integration tests
npm run test:api         # API endpoint tests
npm run smoke-test       # Quick smoke tests
npm run test:simulation  # System simulation tests
npm run test:security    # Security audit
```

### Load Testing (K6)
```bash
npm run test:load        # Default load test
npm run test:load:smoke  # Smoke test (minimal load)
npm run test:load:stress # Stress test (high load)
npm run test:load:spike  # Spike test (sudden traffic)
npm run test:load:soak   # Soak test (sustained load)
```

### Code Quality
```bash
npm run lint             # Check code style
npm run lint:fix         # Auto-fix linting issues
```

## 🌐 API Endpoints

See [API_REFERENCE.md](../API_REFERENCE.md) for complete endpoint documentation.

### Core Endpoints

#### Health & Monitoring
- `GET /api/health` - Health check
- `GET /api/health/detailed` - Detailed system status
- `GET /metrics` - Prometheus metrics

#### Travel Services
- `POST /api/search` - Search flights/hotels
- `POST /api/book` - Book travel
- `GET /api/izi/destinations` - IZI Travel destinations
- `POST /api/sabre/search` - Sabre GDS search

#### AI Services
- `POST /api/ai/chat` - AI chat completion
- `POST /api/ai/analyze` - Analyze travel preferences
- `POST /api/quantum/calculate-dna` - Calculate agent DNA
- `POST /api/quantum/v3/analyze` - Quantum V3 analysis

#### Payment Processing
- `POST /api/payments/create` - Create payment intent
- `POST /api/payments/crypto` - Crypto payment
- `POST /api/stripe/webhook` - Stripe webhook handler

#### Admin Dashboard
- `GET /api/admin/stats` - System statistics
- `GET /api/admin/users` - User management
- `POST /api/admin/config` - Update configuration

#### Telegram Mini App
- `POST /api/miniapp/auth` - Authenticate user
- `GET /api/miniapp/profile` - Get user profile
- `POST /api/miniapp/search` - Search within mini app

## 🔐 Security

### Built-in Security Features
- ✅ **Helmet.js** - Security headers
- ✅ **CORS** - Cross-origin resource sharing
- ✅ **Rate Limiting** - DDoS protection
- ✅ **Input Validation** - Joi/AJV schemas
- ✅ **JWT Authentication** - Secure tokens
- ✅ **Session Management** - Redis-backed sessions
- ✅ **SQL Injection Protection** - Parameterized queries
- ✅ **XSS Protection** - Content sanitization
- ✅ **HTTPS Enforcement** - TLS/SSL required in production

### Environment Variables
**NEVER commit `.env` files!** See [ENV_SETUP.md](../ENV_SETUP.md) for configuration.

### Security Audits
```bash
npm run test:security    # Check for vulnerabilities
npm audit fix            # Auto-fix security issues
```

## 🗄️ Database

### Supabase (Primary)
- PostgreSQL database
- Row Level Security (RLS)
- Real-time subscriptions
- Built-in authentication

### Setup
1. Create Supabase project at https://supabase.com
2. Copy connection string to `.env`
3. Run migrations:
   ```bash
   # Connect to Supabase SQL Editor
   # Copy contents of database/production-schema-complete.sql
   # Execute in SQL Editor
   ```

See [database/SCHEMA_MIGRATION_GUIDE.md](database/SCHEMA_MIGRATION_GUIDE.md) for details.

### MongoDB (Legacy)
Some features still use MongoDB. Configure `MONGODB_URI` in `.env`.

## 🔌 External Integrations

### Required APIs
- **Amadeus** - Flight/hotel search
- **Stripe** - Payment processing
- **OpenAI** - AI completions
- **Z.ai** - GLM-4.6 model
- **Supabase** - Database & auth

### Optional APIs
- **Sabre GDS** - Alternative travel API
- **IZI Travel** - Travel content
- **Sentry** - Error tracking
- **Redis** - Session storage
- **Telegram Bot** - Mini app integration

See [ENV_SETUP.md](../ENV_SETUP.md) for API key setup.

## 📊 Monitoring & Observability

### Sentry Integration
Error tracking and performance monitoring:
```javascript
// Automatic error capture
// Performance tracing
// Release tracking
```

### Prometheus Metrics
Available at `/metrics`:
- Request count
- Response time
- Error rate
- System resources

### Health Checks
```bash
curl http://localhost:5001/api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:00:00Z",
  "uptime": 3600,
  "services": {
    "database": "connected",
    "redis": "connected",
    "ai": "operational"
  }
}
```

## 🧪 Testing

### Unit Tests
```bash
npm run test:unit
```

### Integration Tests
```bash
npm run test:integration
```

### Smoke Tests
Quick validation of critical paths:
```bash
npm run smoke-test
```

### Load Testing
Using K6 for performance testing:
```bash
# Install K6: https://k6.io/docs/getting-started/installation/

# Run load tests
npm run test:load

# View results in k6/results/
```

## 🚀 Deployment

### Railway (Recommended)
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5001
CMD ["node", "server.js"]
```

See [DEPLOYMENT.md](../DEPLOYMENT.md) for detailed deployment guides.

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process on port 5001
lsof -ti:5001 | xargs kill -9
```

#### Database Connection Failed
```bash
# Check Supabase connection string
echo $SUPABASE_URL

# Test connection
curl $SUPABASE_URL/rest/v1/
```

#### Missing Environment Variables
```bash
# Copy example file
cp env.example .env

# Edit with your values
nano .env
```

#### Module Not Found
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

#### Redis Connection Error
Redis is optional. If not using Redis:
```javascript
// In server.js, comment out Redis session store
// Use memory store instead (development only)
```

## 📚 Additional Documentation

- [API Reference](../API_REFERENCE.md) - Complete endpoint documentation
- [Environment Setup](../ENV_SETUP.md) - Configuration guide
- [Deployment Guide](../DEPLOYMENT.md) - Production deployment
- [Testing Guide](../TESTING.md) - Comprehensive testing
- [Contributing](../CONTRIBUTING.md) - How to contribute
- [Security Policy](../SECURITY.md) - Security guidelines

## 🤝 Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.

## 📄 License

MIT License - see [LICENSE](../LICENSE) file for details.

## 🆘 Support

- **Email**: support@amrikyy.ai
- **GitHub Issues**: https://github.com/Moeabdelaziz007/amrikyy-agent/issues
- **Documentation**: https://github.com/Moeabdelaziz007/amrikyy-agent/wiki

## 🎯 Performance Benchmarks

- **Response Time**: < 100ms (p95)
- **Throughput**: 1000+ req/s
- **Uptime**: 99.9%
- **Error Rate**: < 0.1%

## 🔄 Version History

See [CHANGELOG.md](../CHANGELOG.md) for version history.

---

**Built with ❤️ by the Amrikyy Team**
