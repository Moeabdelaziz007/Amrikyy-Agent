.PHONY: help setup install dev prod staging stop restart logs status clean test lint build deploy health

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m # No Color

help: ## Show this help message
	@echo '$(BLUE)Amrikyy Platform - Workflow Commands$(NC)'
	@echo ''
	@echo 'Usage:'
	@echo '  make $(GREEN)<target>$(NC)'
	@echo ''
	@echo 'Targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

# ============================================
# SETUP & INSTALLATION
# ============================================

setup: ## Complete initial setup (run this first!)
	@echo '$(BLUE)🚀 Setting up Amrikyy Platform...$(NC)'
	@make install
	@make pm2-install
	@make env-setup
	@echo '$(GREEN)✅ Setup complete!$(NC)'
	@echo ''
	@echo 'Next steps:'
	@echo '  1. Fill in environment variables in backend/.env and frontend/.env'
	@echo '  2. Run: make dev'
	@echo '  3. Visit: http://localhost:3002 (frontend) and http://localhost:5002 (backend)'

install: ## Install all dependencies
	@echo '$(BLUE)📦 Installing dependencies...$(NC)'
	cd backend && npm ci
	cd frontend && npm ci
	@echo '$(GREEN)✅ Dependencies installed$(NC)'

pm2-install: ## Install PM2 locally
	@echo '$(BLUE)📦 Installing PM2...$(NC)'
	@if ! npx pm2 --version > /dev/null 2>&1; then \
		npm install pm2 --save-dev; \
		echo '$(GREEN)✅ PM2 installed$(NC)'; \
	else \
		echo '$(GREEN)✅ PM2 already installed$(NC)'; \
	fi

env-setup: ## Setup environment files
	@echo '$(BLUE)⚙️  Setting up environment files...$(NC)'
	@if [ ! -f backend/.env ]; then \
		cp backend/env.example backend/.env 2>/dev/null || cp backend/env.advanced.example backend/.env 2>/dev/null || echo "No env.example found"; \
		echo '$(YELLOW)⚠️  Created backend/.env - please fill in values$(NC)'; \
	fi
	@if [ ! -f frontend/.env ]; then \
		cp frontend/.env.example frontend/.env 2>/dev/null || echo "# Frontend environment variables" > frontend/.env; \
		echo '$(YELLOW)⚠️  Created frontend/.env - please fill in values$(NC)'; \
	fi

# ============================================
# DEVELOPMENT
# ============================================

dev: ## Start development environment
	@echo '$(BLUE)🚀 Starting development environment...$(NC)'
	npx pm2 start ecosystem.config.js --only amrikyy-backend-dev,amrikyy-frontend-dev
	@echo '$(GREEN)✅ Development environment started$(NC)'
	@echo ''
	@echo 'Access:'
	@echo '  Frontend: http://localhost:3002'
	@echo '  Backend:  http://localhost:5002'
	@echo ''
	@echo 'Monitor: make logs'
	@echo 'Stop:    make stop'

dev-backend: ## Start only backend development
	npx pm2 start ecosystem.config.js --only amrikyy-backend-dev

dev-frontend: ## Start only frontend development
	npx pm2 start ecosystem.config.js --only amrikyy-frontend-dev

# ============================================
# PRODUCTION & STAGING
# ============================================

prod: ## Start production environment
	@echo '$(BLUE)🌟 Starting production environment...$(NC)'
	npx pm2 start ecosystem.config.js --only amrikyy-backend-prod,amrikyy-frontend-prod
	@echo '$(GREEN)✅ Production environment started$(NC)'

staging: ## Start staging environment
	@echo '$(BLUE)🚀 Starting staging environment...$(NC)'
	npx pm2 start ecosystem.config.js --only amrikyy-backend-staging,amrikyy-frontend-staging
	@echo '$(GREEN)✅ Staging environment started$(NC)'

start-all: ## Start all environments (dev, staging, prod)
	@echo '$(BLUE)🚀 Starting all environments...$(NC)'
	npx pm2 start ecosystem.config.js
	@echo '$(GREEN)✅ All environments started$(NC)'

# ============================================
# PROCESS MANAGEMENT
# ============================================

stop: ## Stop all PM2 processes
	@echo '$(YELLOW)⏸  Stopping all processes...$(NC)'
	npx pm2 stop all
	@echo '$(GREEN)✅ All processes stopped$(NC)'

restart: ## Restart all PM2 processes
	@echo '$(BLUE)🔄 Restarting all processes...$(NC)'
	npx pm2 restart all
	@echo '$(GREEN)✅ All processes restarted$(NC)'

reload: ## Zero-downtime reload (production)
	@echo '$(BLUE)🔄 Reloading with zero downtime...$(NC)'
	npx pm2 reload all
	@echo '$(GREEN)✅ Reload complete$(NC)'

delete: ## Delete all PM2 processes
	@echo '$(YELLOW)🗑️  Deleting all PM2 processes...$(NC)'
	npx pm2 delete all
	@echo '$(GREEN)✅ All processes deleted$(NC)'

# ============================================
# MONITORING & LOGS
# ============================================

status: ## Show PM2 process status
	@echo '$(BLUE)📊 Process Status:$(NC)'
	npx pm2 status

logs: ## Show real-time logs
	npx pm2 logs

logs-backend: ## Show backend logs only
	npx pm2 logs amrikyy-backend-dev

logs-frontend: ## Show frontend logs only
	npx pm2 logs amrikyy-frontend-dev

monitor: ## Open PM2 monitoring dashboard
	npx pm2 monit

save: ## Save current PM2 configuration
	@echo '$(BLUE)💾 Saving PM2 configuration...$(NC)'
	npx pm2 save
	@echo '$(GREEN)✅ Configuration saved$(NC)'

startup: ## Configure PM2 to start on boot
	@echo '$(BLUE)⚙️  Configuring PM2 startup...$(NC)'
	npx pm2 startup
	@echo ''
	@echo '$(YELLOW)Run the command shown above, then run: make save$(NC)'

# ============================================
# TESTING
# ============================================

test: ## Run all tests
	@echo '$(BLUE)🧪 Running tests...$(NC)'
	cd backend && npm test
	cd frontend && npm test
	@echo '$(GREEN)✅ Tests complete$(NC)'

test-unit: ## Run unit tests only
	cd backend && npm run test:unit
	cd frontend && npm run test:unit

test-load: ## Run load tests (requires backend running)
	@echo '$(BLUE)🚀 Running load tests...$(NC)'
	cd backend && npm run test:load
	@echo '$(GREEN)✅ Load tests complete$(NC)'
	@echo 'View results in: test-outputs/'

test-load-smoke: ## Run quick smoke test
	@echo '$(BLUE)💨 Running smoke test...$(NC)'
	cd backend && npm run test:load:smoke
	@echo '$(GREEN)✅ Smoke test complete$(NC)'

# ============================================
# CODE QUALITY
# ============================================

lint: ## Run linters
	@echo '$(BLUE)🎨 Linting code...$(NC)'
	cd backend && npm run lint
	cd frontend && npm run lint
	@echo '$(GREEN)✅ Linting complete$(NC)'

lint-fix: ## Auto-fix linting issues
	@echo '$(BLUE)🔧 Auto-fixing linting issues...$(NC)'
	cd backend && npm run lint:fix
	cd frontend && npm run lint:fix
	@echo '$(GREEN)✅ Linting fixes applied$(NC)'

format: ## Format code with Prettier
	@echo '$(BLUE)✨ Formatting code...$(NC)'
	cd backend && npx prettier --write "src/**/*.{js,ts}"
	cd frontend && npx prettier --write "src/**/*.{js,jsx,ts,tsx}"
	@echo '$(GREEN)✅ Code formatted$(NC)'

# ============================================
# BUILD & DEPLOY
# ============================================

build: ## Build for production
	@echo '$(BLUE)🏗️  Building for production...$(NC)'
	cd backend && npm run build
	cd frontend && npm run build
	@echo '$(GREEN)✅ Build complete$(NC)'

deploy-staging: ## Deploy to staging
	@echo '$(BLUE)🚀 Deploying to staging...$(NC)'
	git push origin develop
	@echo '$(GREEN)✅ Pushed to staging branch$(NC)'
	@echo 'Check GitHub Actions for deployment status'

deploy-prod: ## Deploy to production
	@echo '$(YELLOW)⚠️  Deploying to PRODUCTION$(NC)'
	@echo 'Are you sure? Press Ctrl+C to cancel, Enter to continue...'
	@read
	git push origin main
	@echo '$(GREEN)✅ Pushed to production branch$(NC)'
	@echo 'Check GitHub Actions for deployment status'

# ============================================
# HEALTH & DIAGNOSTICS
# ============================================

health: ## Run health check and auto-debug
	@echo '$(BLUE)🏥 Running health check...$(NC)'
	./scripts/auto-debug.sh
	@echo '$(GREEN)✅ Health check complete$(NC)'

validate: ## Validate environment setup
	@echo '$(BLUE)🔍 Validating environment...$(NC)'
	node k6/scripts/validate-env.js
	@echo '$(GREEN)✅ Validation complete$(NC)'

info: ## Show system information
	@echo '$(BLUE)📊 System Information:$(NC)'
	@echo ''
	@echo 'Node.js:'
	@node --version
	@echo ''
	@echo 'NPM:'
	@npm --version
	@echo ''
	@echo 'PM2:'
	@pm2 --version 2>/dev/null || echo 'Not installed'
	@echo ''
	@echo 'Git:'
	@git --version
	@echo ''
	@echo 'Disk Usage:'
	@df -h . | tail -1

# ============================================
# CLEANUP
# ============================================

clean: ## Clean build artifacts and logs
	@echo '$(BLUE)🧹 Cleaning up...$(NC)'
	rm -rf backend/dist frontend/dist
	rm -rf backend/coverage frontend/coverage
	rm -rf logs/*.log
	rm -rf test-outputs/*
	rm -rf debug-logs/*
	@echo '$(GREEN)✅ Cleanup complete$(NC)'

clean-all: ## Clean everything including node_modules
	@echo '$(YELLOW)⚠️  This will remove all dependencies$(NC)'
	@echo 'Press Ctrl+C to cancel, Enter to continue...'
	@read
	make clean
	rm -rf backend/node_modules frontend/node_modules node_modules
	@echo '$(GREEN)✅ Deep cleanup complete$(NC)'
	@echo 'Run: make install'

# ============================================
# WORKFLOW AUTOMATION
# ============================================

setup-workflow: ## Complete workflow setup (automated)
	@echo '$(BLUE)🎯 Setting up complete workflow automation...$(NC)'
	@echo ''
	@echo 'Step 1: Installing dependencies...'
	@make install
	@echo ''
	@echo 'Step 2: Installing PM2...'
	@make pm2-install
	@echo ''
	@echo 'Step 3: Setting up environment...'
	@make env-setup
	@echo ''
	@echo 'Step 4: Running health check...'
	@make health
	@echo ''
	@echo 'Step 5: Running smoke test...'
	@make test-load-smoke || true
	@echo ''
	@echo '$(GREEN)✅ Workflow setup complete!$(NC)'
	@echo ''
	@echo 'Next steps:'
	@echo '  1. Review and fill in: backend/.env and frontend/.env'
	@echo '  2. Start development: make dev'
	@echo '  3. View logs: make logs'
	@echo '  4. Check status: make status'

ci: ## Run CI checks (lint, test, build)
	@echo '$(BLUE)🔄 Running CI checks...$(NC)'
	@make lint
	@make test
	@make build
	@echo '$(GREEN)✅ All CI checks passed$(NC)'

# ============================================
# QUICK ACTIONS
# ============================================

quick-start: ## Quick start for daily use
	@echo '$(BLUE)⚡ Quick starting...$(NC)'
	npx pm2 start ecosystem.config.js --only amrikyy-backend-dev,amrikyy-frontend-dev
	@echo '$(GREEN)✅ Ready to code!$(NC)'
	@echo 'Frontend: http://localhost:3002'
	@echo 'Backend:  http://localhost:5002'

quick-stop: ## Quick stop all processes
	npx pm2 stop all

quick-test: ## Quick test (lint + smoke test)
	@make lint-fix
	@make test-load-smoke

# Default target
.DEFAULT_GOAL := help
