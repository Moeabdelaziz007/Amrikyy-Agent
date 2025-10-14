# WORKSPACE SETUP - Amrikyy Platform Development Environment

**Version:** 1.0  
**Last Updated:** October 14, 2025  
**Purpose:** Single unified environment for ALL development

---

## 🎯 Philosophy: ONE Environment for Everything

**No context switching. No separate setups. ONE workspace.**

After this setup:
- ✅ Work on Web, API, iOS, Telegram - all from same place
- ✅ One command starts everything
- ✅ One .env per package (no duplicates)
- ✅ Hot reload for instant feedback
- ✅ All AI tools integrated in Cursor

---

## ✅ Prerequisites

### Required Software (Install These)

**1. Node.js v20+**
```bash
# Check version
node --version
# Should show: v20.x.x or higher

# Install from: https://nodejs.org/
# Choose LTS version
```

**2. npm v10+**
```bash
# Check version
npm --version
# Should show: 10.x.x or higher

# Comes with Node.js
```

**3. Git**
```bash
# Check version
git --version
# Should show: git version 2.x

# Install from: https://git-scm.com/
```

**4. Cursor IDE**
```bash
# Download from: https://cursor.sh/
# The AI-first code editor
```

**Optional (for specific features):**

**5. Docker (if using local database)**
```bash
docker --version
# Get from: https://www.docker.com/
```

**6. Xcode (Mac only, for iOS)**
```bash
# Install from Mac App Store
# Requires macOS
```

---

## 🚀 ONE-TIME SETUP (30 Minutes)

### Step 1: Clone Repository

```bash
# Navigate to projects folder
cd /Users/Shared

# Clone (if not already cloned)
git clone https://github.com/Moeabdelaziz007/maya-travel-agent.git
cd maya-travel-agent

# Or if already cloned, just pull latest
cd /Users/Shared/maya-travel-agent
git pull origin main
```

---

### Step 2: Install ALL Dependencies (One Command)

```bash
# From root directory
npm run install:all

# This installs dependencies for:
# - Root workspace
# - frontend/
# - backend/
# - All packages
```

**If you don't have `install:all` script, create it:**

```bash
# Add to root package.json scripts:
"install:all": "npm install && cd frontend && npm install && cd ../backend && npm install"
```

---

### Step 3: Environment Configuration (ONE .env per package)

**Backend Environment:**

```bash
cd backend
cp env.example .env
```

**Edit `backend/.env`:**

```env
# === SERVER ===
NODE_ENV=development
PORT=5000

# === AI SERVICES ===
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-...

# Optional: Z.ai (if using)
ZAI_API_KEY=...
ZAI_API_BASE_URL=https://api.z.ai/api/paas/v4
ZAI_MODEL=glm-4.6

# === DATABASE ===
# Get from: https://supabase.com/dashboard
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
SUPABASE_ANON_KEY=eyJhbG...

# Optional: Local PostgreSQL
# DATABASE_URL=postgresql://localhost:5432/amrikyy_dev

# === AUTHENTICATION ===
# Generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your-super-secret-key-min-256-chars
JWT_EXPIRES_IN=7d

# === TELEGRAM ===
# Get from: @BotFather on Telegram
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...

# === PAYMENTS ===
# Get from: https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Optional: PayPal
# PAYPAL_CLIENT_ID=...
# PAYPAL_CLIENT_SECRET=...

# === FRONTEND URL (for CORS) ===
FRONTEND_URL=http://localhost:3000
```

**Frontend Environment:**

```bash
cd ../frontend
cp env.example .env
```

**Edit `frontend/.env`:**

```env
# === API ===
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000

# === SUPABASE (for direct client access) ===
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...

# === PAYMENTS ===
VITE_STRIPE_PUBLIC_KEY=pk_test_...

# === ANALYTICS (Optional) ===
# VITE_POSTHOG_KEY=...
# VITE_SENTRY_DSN=...
```

---

### Step 4: Verify Setup

```bash
# From root directory
npm run verify-setup

# This checks:
# ✅ Node.js version
# ✅ Dependencies installed
# ✅ .env files exist
# ✅ Database connection works
# ✅ All required env vars present
```

**If `verify-setup` doesn't exist, create it:**

```javascript
// scripts/verify-setup.js

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Amrikyy Platform setup...\n');

// Check Node.js version
const nodeVersion = process.version;
const major = parseInt(nodeVersion.slice(1).split('.')[0]);
if (major >= 20) {
  console.log('✅ Node.js version:', nodeVersion);
} else {
  console.log('❌ Node.js version too old. Need v20+, have', nodeVersion);
  process.exit(1);
}

// Check .env files
const envFiles = [
  'backend/.env',
  'frontend/.env'
];

envFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log('✅', file, 'exists');
  } else {
    console.log('❌', file, 'missing!');
    console.log('   Run: cp', file + '.example', file);
  }
});

console.log('\n🎉 Setup verification complete!\n');
console.log('Next step: npm run dev');
```

---

## 🏃 DAILY WORKFLOW (Start in 30 Seconds)

### Option A: Everything at Once (Recommended)

```bash
# From root directory
npm run dev

# This starts:
# - Frontend (http://localhost:3000)
# - Backend API (http://localhost:5000)
# - Telegram bot (polling mode)
# - TypeScript watch mode
```

**If you don't have unified `dev` script, add to root `package.json`:**

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:api\" \"npm run dev:web\" \"npm run dev:bot\"",
    "dev:web": "cd frontend && npm run dev",
    "dev:api": "cd backend && npm run dev",
    "dev:bot": "cd backend && node telegram-bot.js"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
```

---

### Option B: Individual Services

```bash
# Terminal 1: Backend API
cd backend
npm run dev
# Starts on http://localhost:5000

# Terminal 2: Frontend
cd frontend  
npm run dev
# Starts on http://localhost:3000

# Terminal 3: Telegram Bot
cd backend
node telegram-bot.js
```

---

### Option C: VS Code Tasks (Power User)

**Create `.vscode/tasks.json`:**

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start All Services",
      "type": "shell",
      "command": "npm run dev",
      "group": {
        "kind": "build",
        "isDefault": true
      },
      "presentation": {
        "reveal": "always",
        "panel": "dedicated"
      }
    }
  ]
}
```

**Usage:**
- Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows)
- Type: "Tasks: Run Task"
- Select: "Start All Services"

---

## 📋 COMMON COMMANDS

### Development Commands

```bash
# Start everything
npm run dev

# Start individual services
npm run dev:web          # Frontend only
npm run dev:api          # Backend only
npm run dev:bot          # Telegram bot only
```

### Testing Commands

```bash
npm test                 # Run all tests
npm run test:web         # Frontend tests only
npm run test:api         # Backend tests only
npm run test:coverage    # Coverage report
npm run test:watch       # Watch mode
```

### Build Commands

```bash
npm run build            # Build all packages
npm run build:web        # Build frontend only
npm run build:api        # Build backend only
```

### Code Quality Commands

```bash
npm run lint             # Lint all code
npm run lint:fix         # Auto-fix linting issues
npm run format           # Format with Prettier
npm run type-check       # TypeScript validation
```

### Database Commands

```bash
npm run db:migrate       # Run migrations
npm run db:seed          # Seed test data
npm run db:reset         # Reset database (DEV ONLY!)
npm run db:backup        # Create backup
```

---

## 🐛 TROUBLESHOOTING

### "Port already in use"

```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9

# Or kill both
lsof -ti:3000,5000 | xargs kill -9
```

### "Module not found"

```bash
# Clean install
rm -rf node_modules package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json
rm -rf backend/node_modules backend/package-lock.json

npm run install:all
```

### "TypeScript errors"

```bash
# Rebuild TypeScript
npm run type-check
npm run build

# Clear cache
rm -rf frontend/.vite
rm -rf backend/dist
```

### "Tests failing"

```bash
# Clear test cache
npm run test -- --clearCache
npm test
```

### "Database connection failed"

```bash
# Check .env file
cat backend/.env | grep SUPABASE

# Test connection
cd backend
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
console.log('Testing connection...');
supabase.from('users').select('count').then(console.log);
"
```

---

## ⚡ PRODUCTIVITY TIPS

### 1. Use Cursor's AI Features

**Cmd+K (Generate Code):**
- Highlight code → Cmd+K → Describe change
- AI rewrites code for you

**Cmd+L (Chat):**
- Ask questions about codebase
- Get explanations
- Debug issues

**Tab (Autocomplete):**
- Copilot suggestions inline
- Accept with Tab

### 2. Split Terminal (In Cursor)

```
Terminal 1: npm run dev:api
Terminal 2: npm run dev:web
Terminal 3: Free for commands
```

### 3. Hot Reload Everywhere

**Frontend:**
- Vite HMR (Hot Module Replacement)
- Change code → Instant update in browser

**Backend:**
- Nodemon watches for changes
- Change code → Server restarts automatically

**No need to restart manually!**

### 4. Quick Testing

```bash
# Create test.http file for API testing
### Health Check
GET http://localhost:5000/health

### Chat with AI  
POST http://localhost:5000/api/ai/chat
Content-Type: application/json

{
  "message": "Plan a trip to Dubai"
}
```

Install VS Code extension: "REST Client"  
Click "Send Request" above each section

---

## 🗂️ FOLDER NAVIGATION

**Quick Access Folders:**

```
maya-travel-agent/
├── frontend/src/          # Frontend development
│   ├── components/        # React components
│   ├── pages/            # Routes
│   └── styles/           # CSS
├── backend/src/           # Backend development
│   ├── routes/           # API endpoints
│   ├── services/         # Business logic
│   └── ai/              # AI integration
├── backend/agents/        # AIX agent files
├── docs/                  # Documentation
└── assets/               # Visual assets
```

**In Cursor:**
- `Cmd+P`: Quick open file
- `Cmd+Shift+F`: Search in all files
- `Cmd+B`: Toggle sidebar

---

## 🔧 RECOMMENDED VS CODE/CURSOR EXTENSIONS

**Auto-install from `.vscode/extensions.json`:**

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "eamodio.gitlens",
    "ms-azuretools.vscode-docker"
  ]
}
```

Cursor will prompt: "Install Recommended Extensions?" → Click **Install All**

---

## 📝 DAILY DEVELOPMENT ROUTINE

### Morning (Start Work)

```bash
# 1. Navigate to project
cd /Users/Shared/maya-travel-agent

# 2. Pull latest changes
git pull origin main

# 3. Start all services
npm run dev

# 4. Open in browser
# - Frontend: http://localhost:3000
# - API Health: http://localhost:5000/health

# 5. Start coding!
```

### During Work

```bash
# Make changes, save file
# → Hot reload happens automatically

# Commit often (every 30-60 min)
git add .
git commit -m "feat(scope): description"
git push origin main
```

### Evening (End Work)

```bash
# Commit final changes
git add .
git commit -m "chore: daily checkpoint - [what you worked on]"
git push origin main

# Stop services: Ctrl+C in terminal
```

---

## 🌐 ENVIRONMENT SWITCHING

### Development (Default)

```bash
# Uses .env.development (or just .env)
npm run dev
```

### Staging (Testing)

```bash
# Uses .env.staging
npm run dev:staging
```

### Production (Deployment)

```bash
# Uses .env.production
npm run build:prod
```

---

## ✅ VERIFICATION CHECKLIST

**After setup, test everything works:**

- [ ] `node --version` shows v20+
- [ ] `npm --version` shows v10+
- [ ] `git --version` shows git 2.x
- [ ] `npm run dev` starts all services
- [ ] Frontend opens at http://localhost:3000
- [ ] API responds at http://localhost:5000/health
- [ ] Can make code changes and see instant reload
- [ ] Tests run: `npm test`
- [ ] Lint works: `npm run lint`
- [ ] TypeScript checks: `npm run type-check`

**If ALL checked:** ✅ Ready to build!

**If ANY fail:** See Troubleshooting section or ask for help.

---

## 💾 BACKUP STRATEGY

**Before major changes:**

```bash
# Create backup branch
git checkout -b backup-before-[feature]
git push origin backup-before-[feature]

# Return to main
git checkout main
```

**Weekly backup:**

```bash
# Every Friday
cd /Users/Shared
cp -r maya-travel-agent maya-backup-$(date +%Y-%m-%d)
```

---

## 🎯 SUCCESS METRICS

**Good setup shows:**
- ✅ Start coding in < 30 seconds (just `npm run dev`)
- ✅ Changes reflect instantly (hot reload)
- ✅ No "Module not found" errors
- ✅ No environment variable issues
- ✅ Tests run smoothly
- ✅ Git commits work without issues

**Bad setup shows:**
- ❌ Constant dependency errors
- ❌ Need to restart servers manually
- ❌ Environment variables missing
- ❌ Port conflicts
- ❌ TypeScript errors everywhere

---

**Last Updated:** October 14, 2025  
**Status:** 🟢 Active Setup Guide

