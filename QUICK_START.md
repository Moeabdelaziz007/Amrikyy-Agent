# ⚡ Quick Start Guide - Best Workflow Ever Made

**🎯 Goal**: Get you productive in 15 minutes with world-class automation

---

## 🚀 Fastest Path to Success (15 Minutes)

### Step 1: One Command Setup (5 min)

```bash
cd /Users/Shared/maya-travel-agent
make setup-workflow
```

This automatically:

- ✅ Installs all dependencies
- ✅ Installs PM2 (Docker alternative)
- ✅ Creates environment files
- ✅ Runs health checks
- ✅ Tests the system

### Step 2: Fill Environment Variables (5 min)

Edit these files:

```bash
# Backend
nano backend/.env
# Add: AMADEUS_CLIENT_ID, AMADEUS_CLIENT_SECRET, etc.

# Frontend
nano frontend/.env
# Add: VITE_API_URL, etc.
```

### Step 3: Start Coding! (5 min)

```bash
make dev
```

**Done!** You now have:

- 🟢 Backend running on http://localhost:5002
- 🟢 Frontend running on http://localhost:3002
- 🟢 Auto-restart on crashes
- 🟢 Auto-reload on file changes
- 🟢 Load testing ready
- 🟢 CI/CD automated

---

## 📋 Daily Workflow

### Morning Routine

```bash
# Start everything
make dev

# Check status
make status

# View logs
make logs
```

### During Development

```bash
# Run tests while coding
make test-load-smoke

# Check code quality
make lint-fix

# View real-time logs
make logs
```

### Before Committing

```bash
# Lint and test
make quick-test

# Commit with confidence
git add .
git commit -m "feat: your amazing feature"
git push
```

### End of Day

```bash
# Save PM2 state
make save

# Stop if needed
make stop
```

---

## 🎯 Key Commands

### Most Used

| Command        | What It Does                  |
| -------------- | ----------------------------- |
| `make dev`     | Start development environment |
| `make status`  | Check what's running          |
| `make logs`    | View real-time logs           |
| `make stop`    | Stop everything               |
| `make restart` | Restart everything            |

### Testing

| Command                | What It Does            |
| ---------------------- | ----------------------- |
| `make test-load-smoke` | Quick 4-min smoke test  |
| `make test-load`       | Full load test (12 min) |
| `make test`            | Run all tests           |
| `make lint-fix`        | Auto-fix code style     |

### Deployment

| Command               | What It Does         |
| --------------------- | -------------------- |
| `make build`          | Build for production |
| `make deploy-staging` | Deploy to staging    |
| `make deploy-prod`    | Deploy to production |

### Health & Debugging

| Command         | What It Does          |
| --------------- | --------------------- |
| `make health`   | Run auto-debug system |
| `make validate` | Validate environment  |
| `make clean`    | Clean build artifacts |

---

## 🔥 Power User Shortcuts

### Quick Start Your Day

```bash
make quick-start  # Start dev environment
```

### Quick Test Before PR

```bash
make quick-test  # Lint + smoke test
```

### View Everything

```bash
make monitor  # Interactive dashboard
```

### Zero-Downtime Deployment

```bash
make reload  # Reload without stopping
```

---

## 🎛️ PM2 Process Management

### View Status

```bash
pm2 status
```

Output:

```
┌────┬────────────────────────┬─────────┬─────────┬──────────┐
│ id │ name                   │ mode    │ ↺       │ status   │
├────┼────────────────────────┼─────────┼─────────┼──────────┤
│ 0  │ amrikyy-backend-dev    │ fork    │ 0       │ online   │
│ 1  │ amrikyy-frontend-dev   │ fork    │ 0       │ online   │
└────┴────────────────────────┴─────────┴─────────┴──────────┘
```

### Control Individual Processes

```bash
pm2 restart amrikyy-backend-dev
pm2 stop amrikyy-frontend-dev
pm2 logs amrikyy-backend-dev
```

### Monitor Resources

```bash
pm2 monit
```

---

## 📊 What's Automated For You

### Self-Healing CI/CD

✅ Auto-fixes security vulnerabilities
✅ Auto-fixes linting issues  
✅ Auto-retries failed operations
✅ Auto-rollback on deployment failures
✅ Canary deployments (10% traffic first)

### Load Testing

✅ Automated smoke tests (4 min)
✅ Full load tests (12 min)
✅ Stress tests to find limits
✅ Beautiful HTML reports
✅ Rate limiter validation

### Health Monitoring

✅ Daily health checks at 2 AM
✅ Real-time error tracking (Sentry)
✅ Performance metrics
✅ Auto-diagnosis and fixes
✅ Slack/Discord notifications

---

## 🐛 Troubleshooting

### Backend won't start

```bash
# Check logs
pm2 logs amrikyy-backend-dev

# Run diagnostics
make health

# Check environment
make validate
```

### Load tests failing

```bash
# Ensure backend is running
make status

# Check backend health
curl http://localhost:5002/health

# Review logs
cat test-outputs/latest-results.json
```

### PM2 not found

```bash
# Install PM2
make pm2-install

# Or manually
npm install -g pm2
```

### Port already in use

```bash
# Find what's using the port
lsof -i :5002

# Kill it
kill -9 <PID>

# Or use different ports in ecosystem.config.js
```

---

## 🎯 Next Steps

### Week 1: Master the Basics

- [ ] Run `make dev` daily
- [ ] Get comfortable with `make logs` and `make status`
- [ ] Run `make test-load-smoke` before each commit
- [ ] Review `make help` for all commands

### Week 2: Advanced Features

- [ ] Set up Slack notifications
- [ ] Configure Sentry error tracking
- [ ] Explore `make monitor` dashboard
- [ ] Try `make deploy-staging`

### Week 3: Optimization

- [ ] Review load test results
- [ ] Tune PM2 settings in `ecosystem.config.js`
- [ ] Set up custom alerts
- [ ] Document your team's workflow

---

## 📚 Full Documentation

- **Master Plan**: `WORKFLOW_MASTER_PLAN.md` - Complete roadmap
- **Load Testing**: `k6/README.md` - Comprehensive testing guide
- **Workflows**: `.github/workflows/` - CI/CD configuration
- **Scripts**: `scripts/` - Automation scripts

---

## 🎊 You're Ready!

You now have **the best workflow automation ever made**:

✅ **No Docker needed** - PM2 manages everything  
✅ **Self-healing** - Auto-fixes common issues  
✅ **Load tested** - Know your system's limits  
✅ **CI/CD automated** - Push and relax  
✅ **Monitored** - Know what's happening  
✅ **Documented** - Everything explained

**Start coding**:

```bash
make dev
```

**Need help**?

```bash
make help
```

**Questions**? Check `WORKFLOW_MASTER_PLAN.md`

---

**Happy coding! 🚀**
