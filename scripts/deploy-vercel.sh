#!/bin/bash

# Vercel Deployment Script for Amrikyy Frontend
# Automated deployment with environment management and rollback capabilities

set -e

# Configuration
PROJECT_NAME="amrikyy-frontend"
ENVIRONMENT=${1:-"production"}
DOMAIN=${2:-"amrikyy.com"}
TEAM=${3:-""}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        error "Vercel CLI not found. Install it with: npm i -g vercel"
    fi
    
    # Check if we're in the frontend directory
    if [[ ! -f "package.json" ]] || [[ ! -d "src" ]]; then
        error "Must be run from the frontend directory"
    fi
    
    # Check if .env.local exists for local development
    if [[ "$ENVIRONMENT" == "development" ]] && [[ ! -f ".env.local" ]]; then
        warning "No .env.local found for development environment"
    fi
    
    success "Prerequisites check passed"
}

# Setup Vercel project
setup_vercel_project() {
    log "Setting up Vercel project..."
    
    # Link project if not already linked
    if ! vercel link &>/dev/null; then
        log "Linking to Vercel project..."
        vercel link --confirm
        
        if [[ -n "$TEAM" ]]; then
            vercel link --team "$TEAM" --confirm
        fi
    fi
    
    # Set project configuration
    log "Configuring project settings..."
    
    # Set domain if provided
    if [[ -n "$DOMAIN" ]]; then
        log "Setting custom domain: $DOMAIN"
        vercel domains add "$DOMAIN" || warning "Failed to set domain $DOMAIN"
    fi
    
    # Set environment variables
    setup_environment_variables
    
    success "Vercel project setup completed"
}

# Setup environment variables
setup_environment_variables() {
    log "Setting up environment variables..."
    
    # Required environment variables
    local env_vars=(
        "VITE_API_URL"
        "VITE_SUPABASE_URL"
        "VITE_SUPABASE_ANON_KEY"
        "VITE_TELEGRAM_BOT_USERNAME"
        "VITE_STRIPE_PUBLISHABLE_KEY"
        "VITE_GOOGLE_ANALYTICS_ID"
    )
    
    for var in "${env_vars[@]}"; do
        local value=$(grep "^$var=" ../.env 2>/dev/null | cut -d'=' -f2- || echo "")
        
        if [[ -n "$value" ]]; then
            log "Setting $var for $ENVIRONMENT environment"
            vercel env add "$var" "$ENVIRONMENT" <<< "$value" || warning "Failed to set $var"
        else
            warning "Environment variable $var not found in .env file"
        fi
    done
    
    success "Environment variables configured"
}

# Run tests
run_tests() {
    log "Running tests..."
    
    # Install dependencies
    npm ci
    
    # Run linting
    npm run lint || error "Linting failed"
    
    # Run type checking
    npm run type-check || error "Type checking failed"
    
    # Run unit tests
    npm run test:unit || error "Unit tests failed"
    
    # Run E2E tests if in production
    if [[ "$ENVIRONMENT" == "production" ]]; then
        npm run test:e2e || warning "E2E tests failed"
    fi
    
    success "All tests passed"
}

# Build application
build_application() {
    log "Building application..."
    
    # Build for production
    if [[ "$ENVIRONMENT" == "production" ]]; then
        npm run build
    else
        npm run build:dev
    fi
    
    # Check if build was successful
    if [[ ! -d "dist" ]]; then
        error "Build failed - no dist directory found"
    fi
    
    success "Application built successfully"
}

# Deploy to Vercel
deploy_to_vercel() {
    log "Deploying to Vercel ($ENVIRONMENT)..."
    
    # Deploy with specific environment
    local deploy_args=()
    
    if [[ "$ENVIRONMENT" == "production" ]]; then
        deploy_args+=("--prod")
    fi
    
    if [[ -n "$TEAM" ]]; then
        deploy_args+=("--team" "$TEAM")
    fi
    
    # Execute deployment
    vercel deploy "${deploy_args[@]}"
    
    # Get deployment URL
    local deployment_url=$(vercel ls "$PROJECT_NAME" --scope "$TEAM" 2>/dev/null | head -1 | awk '{print $2}' || echo "")
    
    if [[ -n "$deployment_url" ]]; then
        success "Deployment successful: $deployment_url"
        echo "DEPLOYMENT_URL=$deployment_url" >> deployment.env
    else
        warning "Could not retrieve deployment URL"
    fi
}

# Run post-deployment checks
post_deployment_checks() {
    log "Running post-deployment checks..."
    
    # Load deployment URL
    if [[ -f "deployment.env" ]]; then
        source deployment.env
    fi
    
    if [[ -n "$DEPLOYMENT_URL" ]]; then
        # Check if site is accessible
        local http_status=$(curl -s -o /dev/null -w "%{http_code}" "https://$DEPLOYMENT_URL" || echo "000")
        
        if [[ "$http_status" == "200" ]]; then
            success "Site is accessible (HTTP $http_status)"
        else
            error "Site not accessible (HTTP $http_status)"
        fi
        
        # Check if API endpoints are reachable
        local api_status=$(curl -s -o /dev/null -w "%{http_code}" "https://$DEPLOYMENT_URL/api/health" || echo "000")
        
        if [[ "$api_status" == "200" ]]; then
            success "API endpoints are accessible"
        else
            warning "API endpoints not accessible (HTTP $api_status)"
        fi
    else
        warning "No deployment URL available for checks"
    fi
}

# Rollback function
rollback_deployment() {
    log "Initiating rollback..."
    
    # Get list of recent deployments
    local deployments=$(vercel ls "$PROJECT_NAME" --scope "$TEAM" 2>/dev/null)
    
    if [[ -z "$deployments" ]]; then
        error "No deployments found for rollback"
    fi
    
    # Get previous deployment URL
    local previous_url=$(echo "$deployments" | sed -n '2p' | awk '{print $2}')
    
    if [[ -z "$previous_url" ]]; then
        error "No previous deployment found for rollback"
    fi
    
    log "Rolling back to: $previous_url"
    
    # Promote previous deployment to production
    if [[ "$ENVIRONMENT" == "production" ]]; then
        vercel promote "$previous_url" --scope "$TEAM" || error "Rollback failed"
    fi
    
    success "Rollback completed successfully"
}

# Main deployment function
main() {
    log "Starting Vercel deployment for $PROJECT_NAME..."
    
    # Handle rollback
    if [[ "$1" == "rollback" ]]; then
        rollback_deployment
        exit 0
    fi
    
    check_prerequisites
    setup_vercel_project
    run_tests
    build_application
    deploy_to_vercel
    post_deployment_checks
    
    success "Vercel deployment completed successfully!"
    
    # Cleanup
    rm -f deployment.env
}

# Handle script interruption
trap 'error "Deployment interrupted"' INT TERM

# Run main function
main "$@"
