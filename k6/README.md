# Amadeus Flight API Load Testing

Comprehensive load testing suite for the Amadeus Flight Search integration, focusing on rate limiter behavior, API performance, and backend reliability.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Test Profiles](#test-profiles)
- [Configuration](#configuration)
- [Running Tests](#running-tests)
- [Interpreting Results](#interpreting-results)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

This load testing suite uses **k6** to evaluate the Amadeus Flight API integration under various load conditions. It specifically tests:

- **Rate Limiter Behavior**: How the Redis-based rate limiter handles concurrent requests
- **API Response Times**: Performance metrics under different load profiles
- **Error Handling**: How the system responds to timeouts, failures, and edge cases
- **Agent Configuration**: Testing timeout and priority settings
- **Scalability**: Finding the breaking point and optimal configuration

## ✨ Features

### Comprehensive Metrics Collection

- ✅ Response times (avg, p50, p90, p95, p99, max)
- ✅ Error rates and types (API errors, timeouts, validations)
- ✅ Rate limiting events (hits, resets, remaining capacity)
- ✅ Request distribution by type (search, pricing, location)
- ✅ Success rates and completion metrics

### Multiple Test Profiles

- 🔸 **Smoke Test**: Quick validation (5 VUs, 4 minutes)
- 🔸 **Load Test**: Standard load (50 VUs, 12 minutes)
- 🔸 **Stress Test**: Find breaking points (200 VUs, 20 minutes)
- 🔸 **Spike Test**: Sudden traffic surges (20→200→20 VUs)
- 🔸 **Soak Test**: Long-duration stability (50 VUs, 40 minutes)

### Rich Reporting

- 📊 Real-time terminal output with colors
- 📈 HTML dashboards with visual metrics
- 📄 JSON exports for further analysis
- 📝 Threshold validation and pass/fail indicators

## 📦 Prerequisites

### Required

- **k6**: Load testing tool

  ```bash
  # macOS
  brew install k6

  # Linux (Debian/Ubuntu)
  sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
  echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
  sudo apt-get update
  sudo apt-get install k6

  # Windows
  choco install k6
  ```

- **Node.js**: v16+ (for report generation)
- **Backend Running**: Amadeus backend must be accessible

### Optional but Recommended

- **Amadeus API Credentials**: For real API testing
- **Redis**: For rate limiting (backend requirement)

## 🚀 Installation

```bash
# 1. Navigate to project root
cd /Users/Shared/maya-travel-agent

# 2. No additional dependencies needed for k6 scripts
# Report generator uses built-in Node.js modules

# 3. Make scripts executable (if not already)
chmod +x k6/scripts/*.sh
chmod +x k6/scripts/*.js

# 4. Validate environment
node k6/scripts/validate-env.js
```

## ⚡ Quick Start

### 1. Start the Backend

```bash
cd backend
npm run dev
```

Wait until you see:

```
✅ Backend server running on port 5000
✅ Redis connection established
```

### 2. Run a Smoke Test

```bash
# From project root
cd backend
npm run test:load:smoke
```

Or directly:

```bash
./k6/scripts/run-load-test.sh smoke
```

### 3. View Results

Results are saved to `test-outputs/`:

- `amadeus-load-test-smoke-TIMESTAMP.log` - Console output
- `amadeus-load-test-smoke-TIMESTAMP.json` - Raw k6 data
- `amadeus-load-test-smoke-TIMESTAMP.html` - HTML dashboard

Open the HTML file in your browser for visual analysis.

## 📊 Test Profiles

### Smoke Test (Quick Validation)

```bash
npm run test:load:smoke
```

- **Duration**: 4 minutes
- **Load**: 5 concurrent users
- **Purpose**: Quick validation before deployment
- **Use When**: After code changes, before merging PRs

**Stages**:

1. Ramp up to 5 VUs (1 min)
2. Sustain 5 VUs (2 min)
3. Ramp down (1 min)

### Load Test (Standard)

```bash
npm run test:load
```

- **Duration**: 12 minutes
- **Load**: Up to 50 concurrent users
- **Purpose**: Normal traffic simulation
- **Use When**: Regular performance monitoring

**Stages**:

1. Ramp up to 20 VUs (2 min)
2. Ramp up to 50 VUs (5 min)
3. Sustain 50 VUs (3 min)
4. Ramp down (2 min)

### Stress Test (Find Breaking Points)

```bash
npm run test:load:stress
```

- **Duration**: 20 minutes
- **Load**: Up to 200 concurrent users
- **Purpose**: Find system limits
- **Use When**: Capacity planning, infrastructure decisions

**Stages**:

1. 50 VUs (2 min)
2. 100 VUs (5 min)
3. 150 VUs (5 min)
4. 200 VUs (5 min)
5. Ramp down (3 min)

### Spike Test (Traffic Surges)

```bash
npm run test:load:spike
```

- **Duration**: 5.5 minutes
- **Load**: Sudden spike from 20 to 200 VUs
- **Purpose**: Test rate limiter during traffic spikes
- **Use When**: Preparing for product launches, marketing campaigns

**Stages**:

1. 20 VUs baseline (1 min)
2. **SPIKE** to 200 VUs (30 sec)
3. Sustain 200 VUs (2 min)
4. Drop to 20 VUs (1 min)
5. Ramp down (1 min)

### Soak Test (Stability)

```bash
npm run test:load:soak
```

- **Duration**: 40 minutes
- **Load**: 50 concurrent users sustained
- **Purpose**: Find memory leaks, connection issues
- **Use When**: Before major releases, infrastructure changes

**Stages**:

1. Ramp up (5 min)
2. **Sustain 50 VUs for 30 minutes**
3. Ramp down (5 min)

## ⚙️ Configuration

### Environment Variables

Create or update `backend/.env`:

```bash
# Backend Configuration
BASE_URL=http://localhost:5000

# Amadeus API Credentials (Required for real tests)
AMADEUS_CLIENT_ID=your_client_id_here
AMADEUS_CLIENT_SECRET=your_client_secret_here

# Agent Configuration (Optional)
AGENT_TIMEOUT=10000        # Timeout in milliseconds
AGENT_PRIORITY=1           # Priority level (1-10)

# Redis Configuration (Backend requirement)
REDIS_URL=redis://localhost:6379
```

### Validate Configuration

```bash
node k6/scripts/validate-env.js
```

This will:

- ✅ Check all required variables
- ⚠️ Warn about missing optional variables
- 🔍 Test backend connectivity
- 📋 Show current configuration

### Custom Configuration

You can override settings when running tests:

```bash
# Custom backend URL
BASE_URL=https://api-staging.example.com npm run test:load

# Custom agent timeout
AGENT_TIMEOUT=15000 ./k6/scripts/run-load-test.sh stress

# Custom load profile
LOAD_PROFILE=custom k6 run k6/amadeus-flight-load-test.js
```

## 🏃 Running Tests

### From Backend Directory

```bash
cd backend

# Smoke test
npm run test:load:smoke

# Standard load test
npm run test:load

# Stress test
npm run test:load:stress

# Spike test
npm run test:load:spike

# Soak test
npm run test:load:soak
```

### Direct Script Execution

```bash
# Using shell script (recommended)
./k6/scripts/run-load-test.sh [profile]

# Using k6 directly
export LOAD_PROFILE=smoke
export BASE_URL=http://localhost:5000
k6 run k6/amadeus-flight-load-test.js
```

### Custom k6 Options

```bash
# Run with custom VU count
k6 run --vus 100 --duration 5m k6/amadeus-flight-load-test.js

# Run with custom output
k6 run --out influxdb=http://localhost:8086/k6 k6/amadeus-flight-load-test.js

# Run with tags
k6 run --tag environment=staging k6/amadeus-flight-load-test.js
```

## 📈 Interpreting Results

### Console Output

During test execution, you'll see real-time metrics:

```
✓ flight search: status is 200 or 429
✓ flight search: has response body
✓ flight search: response time < 15s

http_req_duration...........: avg=2.3s  min=450ms  med=2.1s  max=8.5s  p(90)=4.2s  p(95)=5.8s
http_req_failed.............: 2.34%  ✓ 23   ✗ 977
success_rate................: 94.12% ✓ 919  ✗ 58
rate_limit_hits.............: 12
```

### Key Metrics Explained

| Metric                | Good | Warning | Critical |
| --------------------- | ---- | ------- | -------- |
| **Success Rate**      | >90% | 75-90%  | <75%     |
| **Error Rate**        | <5%  | 5-15%   | >15%     |
| **P95 Response Time** | <8s  | 8-15s   | >15s     |
| **Rate Limit Hits**   | <50  | 50-200  | >200     |

### HTML Dashboard

Open the generated HTML file to see:

- 📊 Visual metric cards with color coding
- 📈 Percentile distributions
- ✅ Threshold pass/fail indicators
- 📉 Detailed breakdown by request type

### JSON Output

The JSON file contains raw k6 data for:

- Custom analysis and reporting
- Integration with monitoring tools (Grafana, Datadog)
- Historical comparison
- Automated alerting

Example parsing:

```javascript
const data = require('./test-outputs/latest-results.json');

const avgResponseTime = data.metrics.http_req_duration.values.avg;
const errorRate = data.metrics.http_req_failed.values.rate;

console.log(`Avg Response: ${avgResponseTime}ms`);
console.log(`Error Rate: ${(errorRate * 100).toFixed(2)}%`);
```

## 🔄 CI/CD Integration

### GitHub Actions

```yaml
name: Load Tests

on:
  schedule:
    - cron: '0 2 * * *' # Daily at 2 AM
  workflow_dispatch: # Manual trigger

jobs:
  load-test:
    runs-on: ubuntu-latest

    services:
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install k6
        run: |
          sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install k6

      - name: Install dependencies
        run: |
          cd backend && npm ci

      - name: Start backend
        run: |
          cd backend
          npm run dev &
          sleep 10  # Wait for backend to start
        env:
          NODE_ENV: test
          AMADEUS_CLIENT_ID: ${{ secrets.AMADEUS_CLIENT_ID }}
          AMADEUS_CLIENT_SECRET: ${{ secrets.AMADEUS_CLIENT_SECRET }}

      - name: Run load test
        run: |
          cd backend
          npm run test:load:smoke
        env:
          BASE_URL: http://localhost:5000

      - name: Upload results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: load-test-results
          path: test-outputs/
```

### GitLab CI

```yaml
load-test:
  stage: test
  image: grafana/k6:latest
  services:
    - redis:7-alpine
  script:
    - cd backend
    - npm ci
    - npm run dev &
    - sleep 10
    - npm run test:load:smoke
  artifacts:
    when: always
    paths:
      - test-outputs/
    expire_in: 30 days
  only:
    - schedules
    - main
```

## 🐛 Troubleshooting

### Backend Not Reachable

**Error**: `✗ Backend is not reachable at http://localhost:5000`

**Solutions**:

1. Start the backend: `cd backend && npm run dev`
2. Check port: Make sure port 5000 is not in use
3. Check firewall: Ensure localhost connections are allowed
4. Custom URL: Set `BASE_URL=http://your-url:port`

### High Error Rate

**Symptom**: Error rate >15%

**Possible Causes**:

1. **Rate limiting**: Too aggressive limits
   - Check `backend/src/middleware/redis-rate-limit.js`
   - Increase limits for testing
2. **Amadeus API issues**: Check Amadeus status
3. **Resource exhaustion**: Backend out of memory/CPU
4. **Network issues**: Check connectivity

**Debug**:

```bash
# Check backend logs
tail -f backend/backend.log

# Check rate limit status
redis-cli
> KEYS ratelimit:*
> GET ratelimit:api:127.0.0.1
```

### Slow Response Times

**Symptom**: P95 >15s

**Possible Causes**:

1. **Amadeus API latency**: External API is slow
2. **Database queries**: Check Supabase performance
3. **Redis latency**: Check Redis connection
4. **CPU/Memory**: Backend resource constraints

**Debug**:

```bash
# Check system resources
top
htop

# Check backend performance
node --inspect backend/server.js
```

### k6 Installation Issues

**macOS**: Use Homebrew

```bash
brew install k6
```

**Linux**: Follow official guide

```bash
# Add k6 repository
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

**Windows**: Use Chocolatey

```powershell
choco install k6
```

### Missing Amadeus Credentials

**Warning**: `⚠ AMADEUS_CLIENT_ID not set`

**Impact**: Tests will attempt to call Amadeus API but may fail

**Solutions**:

1. **Get credentials**: Sign up at https://developers.amadeus.com
2. **Add to .env**:
   ```bash
   AMADEUS_CLIENT_ID=your_id
   AMADEUS_CLIENT_SECRET=your_secret
   ```
3. **Use mock mode** (if implemented): `USE_MOCK_AMADEUS=true`

## 📚 Additional Resources

### k6 Documentation

- [k6 Docs](https://k6.io/docs/)
- [k6 Examples](https://k6.io/docs/examples/)
- [k6 Metrics](https://k6.io/docs/using-k6/metrics/)

### Best Practices

- Run smoke tests before every deployment
- Schedule daily load tests in CI/CD
- Run stress tests weekly or before major releases
- Use soak tests before infrastructure changes
- Monitor trends over time, not just single runs

### Performance Tuning

- Adjust rate limits based on load test results
- Optimize Amadeus API calls (caching, batching)
- Scale Redis if rate limiting is bottleneck
- Consider CDN for static assets
- Implement request queuing for spikes

## 🤝 Contributing

To add new test scenarios:

1. Create new config file in `k6/config/`
2. Add test profile to `amadeus-flight-load-test.js`
3. Add npm script to `backend/package.json`
4. Update this README

## 📝 License

MIT License - See main project README

---

**Questions?** Open an issue or contact the Amrikyy team.

**Need Help?** Run `node k6/scripts/validate-env.js` for diagnostics.
