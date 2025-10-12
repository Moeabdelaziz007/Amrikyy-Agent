#!/bin/bash

###############################################################################
# Auto-Debug & Health Check Script
# 
# Automatically diagnoses and fixes common issues in the repository
# Can be run manually or triggered by CI/CD
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_DIR="$PROJECT_ROOT/debug-logs"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")

# Create log directory
mkdir -p "$LOG_DIR"

# Log file
LOG_FILE="$LOG_DIR/auto-debug-$TIMESTAMP.log"

# Logging functions
log() {
    echo -e "${2:-$NC}$1${NC}" | tee -a "$LOG_FILE"
}

log_section() {
    echo "" | tee -a "$LOG_FILE"
    log "╔════════════════════════════════════════════════════════════════╗" "$BLUE"
    log "║  $1" "$BLUE"
    log "╚════════════════════════════════════════════════════════════════╝" "$BLUE"
    echo "" | tee -a "$LOG_FILE"
}

log_success() {
    log "✅ $1" "$GREEN"
}

log_warning() {
    log "⚠️  $1" "$YELLOW"
}

log_error() {
    log "❌ $1" "$RED"
}

log_info() {
    log "ℹ️  $1" "$CYAN"
}

# Track issues
ISSUES_FOUND=0
ISSUES_FIXED=0

# ============================================================================
# DIAGNOSTIC CHECKS
# ============================================================================

check_node_version() {
    log_section "Checking Node.js Version"
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
        return 1
    fi
    
    NODE_VERSION=$(node -v)
    log_success "Node.js version: $NODE_VERSION"
    
    # Check if version is >= 18
    MAJOR_VERSION=$(echo "$NODE_VERSION" | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$MAJOR_VERSION" -lt 18 ]; then
        log_warning "Node.js version is older than 18. Consider upgrading."
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
}

check_npm_dependencies() {
    log_section "Checking NPM Dependencies"
    
    # Backend dependencies
    log_info "Checking backend dependencies..."
    cd "$PROJECT_ROOT/backend"
    
    if [ ! -d "node_modules" ]; then
        log_warning "Backend node_modules not found. Installing..."
        npm install
        log_success "Backend dependencies installed"
        ISSUES_FIXED=$((ISSUES_FIXED + 1))
    else
        log_success "Backend dependencies OK"
    fi
    
    # Frontend dependencies
    log_info "Checking frontend dependencies..."
    cd "$PROJECT_ROOT/frontend"
    
    if [ ! -d "node_modules" ]; then
        log_warning "Frontend node_modules not found. Installing..."
        npm install
        log_success "Frontend dependencies installed"
        ISSUES_FIXED=$((ISSUES_FIXED + 1))
    else
        log_success "Frontend dependencies OK"
    fi
    
    cd "$PROJECT_ROOT"
}

check_security_vulnerabilities() {
    log_section "Security Vulnerability Scan"
    
    # Backend security
    log_info "Scanning backend for vulnerabilities..."
    cd "$PROJECT_ROOT/backend"
    
    if ! npm audit --audit-level=high > "$LOG_DIR/security-backend-$TIMESTAMP.log" 2>&1; then
        log_warning "Backend security vulnerabilities found"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
        
        log_info "Attempting to auto-fix..."
        if npm audit fix --force; then
            log_success "Backend vulnerabilities auto-fixed"
            ISSUES_FIXED=$((ISSUES_FIXED + 1))
        else
            log_error "Could not auto-fix all backend vulnerabilities"
        fi
    else
        log_success "Backend security OK"
    fi
    
    # Frontend security
    log_info "Scanning frontend for vulnerabilities..."
    cd "$PROJECT_ROOT/frontend"
    
    if ! npm audit --audit-level=high > "$LOG_DIR/security-frontend-$TIMESTAMP.log" 2>&1; then
        log_warning "Frontend security vulnerabilities found"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
        
        log_info "Attempting to auto-fix..."
        if npm audit fix --force; then
            log_success "Frontend vulnerabilities auto-fixed"
            ISSUES_FIXED=$((ISSUES_FIXED + 1))
        else
            log_error "Could not auto-fix all frontend vulnerabilities"
        fi
    else
        log_success "Frontend security OK"
    fi
    
    cd "$PROJECT_ROOT"
}

check_linting() {
    log_section "Code Quality Check (Linting)"
    
    # Backend linting
    log_info "Checking backend code quality..."
    cd "$PROJECT_ROOT/backend"
    
    if ! npm run lint > "$LOG_DIR/lint-backend-$TIMESTAMP.log" 2>&1; then
        log_warning "Backend linting issues found"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
        
        log_info "Attempting to auto-fix..."
        if npm run lint:fix; then
            log_success "Backend linting issues auto-fixed"
            ISSUES_FIXED=$((ISSUES_FIXED + 1))
        else
            log_error "Could not auto-fix all backend linting issues"
        fi
    else
        log_success "Backend code quality OK"
    fi
    
    # Frontend linting
    log_info "Checking frontend code quality..."
    cd "$PROJECT_ROOT/frontend"
    
    if ! npm run lint > "$LOG_DIR/lint-frontend-$TIMESTAMP.log" 2>&1; then
        log_warning "Frontend linting issues found"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
        
        log_info "Attempting to auto-fix..."
        if npm run lint:fix; then
            log_success "Frontend linting issues auto-fixed"
            ISSUES_FIXED=$((ISSUES_FIXED + 1))
        else
            log_error "Could not auto-fix all frontend linting issues"
        fi
    else
        log_success "Frontend code quality OK"
    fi
    
    cd "$PROJECT_ROOT"
}

check_build() {
    log_section "Build Verification"
    
    # Backend build
    log_info "Testing backend build..."
    cd "$PROJECT_ROOT/backend"
    
    if npm run build > "$LOG_DIR/build-backend-$TIMESTAMP.log" 2>&1; then
        log_success "Backend builds successfully"
    else
        log_error "Backend build failed"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
    
    # Frontend build
    log_info "Testing frontend build..."
    cd "$PROJECT_ROOT/frontend"
    
    if npm run build > "$LOG_DIR/build-frontend-$TIMESTAMP.log" 2>&1; then
        log_success "Frontend builds successfully"
    else
        log_error "Frontend build failed"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
    
    cd "$PROJECT_ROOT"
}

check_environment_files() {
    log_section "Environment Configuration Check"
    
    # Backend .env
    if [ ! -f "$PROJECT_ROOT/backend/.env" ]; then
        log_warning "Backend .env file not found"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
        
        if [ -f "$PROJECT_ROOT/backend/env.example" ]; then
            log_info "Creating .env from env.example..."
            cp "$PROJECT_ROOT/backend/env.example" "$PROJECT_ROOT/backend/.env"
            log_success "Backend .env created. Please fill in the values."
            ISSUES_FIXED=$((ISSUES_FIXED + 1))
        fi
    else
        log_success "Backend .env file exists"
    fi
    
    # Frontend .env
    if [ ! -f "$PROJECT_ROOT/frontend/.env" ]; then
        log_warning "Frontend .env file not found"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
        
        if [ -f "$PROJECT_ROOT/frontend/.env.example" ]; then
            log_info "Creating .env from .env.example..."
            cp "$PROJECT_ROOT/frontend/.env.example" "$PROJECT_ROOT/frontend/.env"
            log_success "Frontend .env created. Please fill in the values."
            ISSUES_FIXED=$((ISSUES_FIXED + 1))
        fi
    else
        log_success "Frontend .env file exists"
    fi
}

check_git_status() {
    log_section "Git Repository Status"
    
    cd "$PROJECT_ROOT"
    
    # Check for uncommitted changes
    if [[ -n $(git status -s) ]]; then
        log_warning "Uncommitted changes detected"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
        
        git status -s | tee -a "$LOG_FILE"
        
        log_info "Run 'git status' to see details"
    else
        log_success "Working directory clean"
    fi
    
    # Check if behind remote
    git fetch > /dev/null 2>&1
    LOCAL=$(git rev-parse @)
    REMOTE=$(git rev-parse @{u} 2>/dev/null || echo "")
    
    if [ -n "$REMOTE" ] && [ "$LOCAL" != "$REMOTE" ]; then
        log_warning "Branch is behind remote. Run 'git pull'"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    else
        log_success "Branch is up to date"
    fi
}

check_disk_space() {
    log_section "Disk Space Check"
    
    DISK_USAGE=$(df -h "$PROJECT_ROOT" | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$DISK_USAGE" -gt 80 ]; then
        log_error "Disk usage is high: ${DISK_USAGE}%"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
        
        log_info "Consider cleaning up:"
        log_info "  - node_modules: rm -rf backend/node_modules frontend/node_modules"
        log_info "  - build artifacts: rm -rf backend/dist frontend/dist"
        log_info "  - test outputs: rm -rf test-outputs"
    elif [ "$DISK_USAGE" -gt 60 ]; then
        log_warning "Disk usage is moderate: ${DISK_USAGE}%"
    else
        log_success "Disk usage OK: ${DISK_USAGE}%"
    fi
}

cleanup_old_files() {
    log_section "Cleanup Old Files"
    
    # Clean old debug logs (keep last 7 days)
    log_info "Cleaning old debug logs..."
    find "$LOG_DIR" -name "*.log" -mtime +7 -delete 2>/dev/null || true
    
    # Clean old test outputs (keep last 30 days)
    log_info "Cleaning old test outputs..."
    find "$PROJECT_ROOT/test-outputs" -name "*.json" -mtime +30 -delete 2>/dev/null || true
    find "$PROJECT_ROOT/test-outputs" -name "*.html" -mtime +30 -delete 2>/dev/null || true
    
    log_success "Cleanup complete"
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

main() {
    log_section "🔍 Auto-Debug & Health Check"
    log_info "Starting at: $(date)"
    log_info "Project: $PROJECT_ROOT"
    echo ""
    
    # Run all checks
    check_node_version
    check_npm_dependencies
    check_environment_files
    check_security_vulnerabilities
    check_linting
    check_build
    check_git_status
    check_disk_space
    cleanup_old_files
    
    # Summary
    log_section "📊 Summary"
    log_info "Issues Found: $ISSUES_FOUND"
    log_info "Issues Fixed: $ISSUES_FIXED"
    log_info "Log File: $LOG_FILE"
    echo ""
    
    if [ $ISSUES_FOUND -eq 0 ]; then
        log_success "Repository is healthy! 🎉"
        exit 0
    elif [ $ISSUES_FIXED -gt 0 ]; then
        log_warning "Some issues were auto-fixed. Review the changes."
        log_info "Run 'git diff' to see what was changed"
        exit 0
    else
        log_error "Issues detected that require manual intervention"
        log_info "Check the log file for details: $LOG_FILE"
        exit 1
    fi
}

# Run main function
main "$@"

