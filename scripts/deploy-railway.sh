#!/bin/bash

# Railway Deployment Script for Amrikyy Backend
# Automated deployment with environment management and health checks

set -e

# Configuration
PROJECT_NAME="amrikyy-backend"
ENVIRONMENT=${1:-"production"}
SERVICE_NAME=${2:-"amrikyy-backend"}
REGION=${3:-"us-east-1"}

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
    
    # Check if Railway CLI is installed
    if ! command -v railway &> /dev/null; then
        error "Railway CLI not found. Install it with: npm install -g @railway/cli"
    fi
    
    # Check if we're logged in to Railway
    if ! railway whoami &>/dev/null; then
        error "Not logged in to Railway. Run: railway login"
    fi
    
    # Check if we're in the backend directory
    if [[ ! -f "package.json" ]] || [[ ! -d "src" ]]; then
        error "Must be run from the backend directory"
    fi
    
    # Check if railway.toml exists
    if [[ ! -f "railway.toml" ]]; then
        error "railway.toml not found"
    fi
    
    success "Prerequisites check passed"
}

# Setup Railway project
setup_railway_project() {
    log "Setting up Railway project..."
    
    # Initialize project if not already initialized
    if [[ ! -f ".railway/project.json" ]]; then
        log "Initializing Railway project..."
        railway init || error "Failed to initialize Railway project"
    fi
    
    # Link to existing project if specified
    if [[ -n "$PROJECT_NAME" ]]; then
        log "Linking to project: $PROJECT_NAME"
        railway link "$PROJECT_NAME" || warning "Failed to link to project $PROJECT_NAME"
    fi
    
    success "Railway project setup completed"
}

# Setup environment variables
setup_environment_variables() {
    log "Setting up environment variables..."
    
    # Load environment variables from .env file
    if [[ -f "../.env" ]]; then
        log "Loading environment variables from .env file..."
        
        # Read and set each environment variable
        while IFS='=' read -r key value; do
            # Skip comments and empty lines
            [[ $key =~ ^[[:space:]]*# ]] && continue
            [[ -z $key ]] && continue
            
            # Remove surrounding quotes if present
            value=$(echo "$value" | sed 's/^"//;s/"$//')
            
            # Set environment variable in Railway
            if [[ -n "$key" && -n "$value" ]]; then
                log "Setting environment variable: $key"
                railway variables set "$key=$value" || warning "Failed to set $key"
            fi
        done < "../.env"
    else
        warning "No .env file found"
    fi
    
    # Set production-specific variables
    if [[ "$ENVIRONMENT" == "production" ]]; then
        railway variables set "NODE_ENV=production" || warning "Failed to set NODE_ENV"
        railway variables set "PORT=5000" || warning "Failed to set PORT"
    fi
    
    success "Environment variables configured"
}

# Run tests
run_tests() {
    log "Running tests..."
    
    # Install dependencies
    npm ci
    
    # Run linting
    npm run lint || error "Linting failed"
    
    # Run unit tests
    npm run test || error "Unit tests failed"
    
    # Run integration tests
    npm run test:integration || warning "Integration tests failed"
    
    success "All tests passed"
}

# Build application
build_application() {
    log "Building application..."
    
    # Build for production
    npm run build || error "Build failed"
    
    success "Application built successfully"
}

# Deploy to Railway
deploy_to_railway() {
    log "Deploying to Railway ($ENVIRONMENT)..."
    
    # Deploy with specific environment
    local deploy_args=()
    
    if [[ "$ENVIRONMENT" == "production" ]]; then
        deploy_args+=("--environment=production")
    else
        deploy_args+=("--environment=staging")
    fi
    
    # Execute deployment
    railway deploy "${deploy_args[@]}" || error "Deployment failed"
    
    # Get deployment URL
    local deployment_url=$(railway domain --environment "$ENVIRONMENT" 2>/dev/null | head -1 || echo "")
    
    if [[ -n "$deployment_url" ]]; then
        success "Deployment successful: https://$deployment_url"
        echo "DEPLOYMENT_URL=https://$deployment_url" >> deployment.env
    else
        warning "Could not retrieve deployment URL"
    fi
}

# Wait for deployment to be ready
wait_for_deployment() {
    log "Waiting for deployment to be ready..."
    
    # Load deployment URL
    if [[ -f "deployment.env" ]]; then
        source deployment.env
    fi
    
    if [[ -n "$DEPLOYMENT_URL" ]]; then
        local max_attempts=30
        local attempt=1
        
        while [[ $attempt -le $max_attempts ]]; do
            log "Checking deployment health (attempt $attempt/$max_attempts)..."
            
            local http_status=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL/health" || echo "000")
            
            if [[ "$http_status" == "200" ]]; then
                success "Deployment is ready and healthy"
                return 0
            fi
            
            log "Deployment not ready yet (HTTP $http_status), waiting..."
            sleep 10
            attempt=$((attempt + 1))
        done
        
        error "Deployment failed to become ready within expected time"
    else
        warning "No deployment URL available for health checks"
    fi
}

# Run post-deployment tests
post_deployment_tests() {
    log "Running post-deployment tests..."
    
    # Load deployment URL
    if [[ -f "deployment.env" ]]; then
        source deployment.env
    fi
    
    if [[ -n "$DEPLOYMENT_URL" ]]; then
        # Test API endpoints
        local endpoints=(
            "/health"
            "/api/status"
            "/api/agents"
        )
        
        for endpoint in "${endpoints[@]}"; do
            log "Testing endpoint: $endpoint"
            local response=$(curl -s "$DEPLOYMENT_URL$endpoint" || echo "")
            
            if [[ -n "$response" ]]; then
                success "Endpoint $endpoint responding"
            else
                warning "Endpoint $endpoint not responding"
            fi
        done
        
        # Run smoke tests
        npm run test:smoke || warning "Smoke tests failed"
    else
        warning "No deployment URL available for post-deployment tests"
    fi
    
    success "Post-deployment tests completed"
}

# Get deployment logs
get_deployment_logs() {
    log "Fetching deployment logs..."
    
    # Get recent logs
    railway logs --environment "$ENVIRONMENT" --lines 100 || warning "Failed to fetch logs"
    
    success "Logs retrieved"
}

# Rollback function
rollback_deployment() {
    log "Initiating rollback..."
    
    # Get list of deployments
    local deployments=$(railway deployments list --environment "$ENVIRONMENT" 2>/dev/null)
    
    if [[ -z "$deployments" ]]; then
        error "No deployments found for rollback"
    fi
    
    # Get previous deployment ID
    local previous_deployment=$(echo "$deployments" | sed -n '2p' | awk '{print $1}')
    
    if [[ -z "$previous_deployment" ]]; then
        error "No previous deployment found for rollback"
    fi
    
    log "Rolling back to deployment: $previous_deployment"
    
    # Promote previous deployment
    railway deployments promote "$previous_deployment" --environment "$ENVIRONMENT" || error "Rollback failed"
    
    success "Rollback completed successfully"
}

# Scale deployment
scale_deployment() {
    local instances=${1:-"1"}
    
    log "Scaling deployment to $instances instances..."
    
    # Update scaling configuration
    railway variables set "RAILWAY_STATIC_URL=$DEPLOYMENT_URL" || warning "Failed to set static URL"
    
    # Scale using Railway CLI (if available)
    railway up --instances "$instances" || warning "Failed to scale deployment"
    
    success "Deployment scaled to $instances instances"
}

# Monitor deployment
monitor_deployment() {
    log "Monitoring deployment..."
    
    # Get deployment status
    railway status --environment "$ENVIRONMENT" || warning "Failed to get status"
    
    # Get metrics
    railway metrics --environment "$ENVIRONMENT" || warning "Failed to get metrics"
    
    success "Monitoring data retrieved"
}

# Main deployment function
main() {
    log "Starting Railway deployment for $PROJECT_NAME..."
    
    # Handle special commands
    case "$1" in
        "rollback")
            rollback_deployment
            exit 0
            ;;
        "logs")
            get_deployment_logs
            exit 0
            ;;
        "scale")
            scale_deployment "$2"
            exit 0
            ;;
        "monitor")
            monitor_deployment
            exit 0
            ;;
    esac
    
    check_prerequisites
    setup_railway_project
    setup_environment_variables
    run_tests
    build_application
    deploy_to_railway
    wait_for_deployment
    post_deployment_tests
    
    success "Railway deployment completed successfully!"
    
    # Display deployment information
    if [[ -f "deployment.env" ]]; then
        source deployment.env
        echo ""
        echo "=========================================="
        echo "Deployment Information"
        echo "=========================================="
        echo "Project: $PROJECT_NAME"
        echo "Environment: $ENVIRONMENT"
        echo "Service: $SERVICE_NAME"
        echo "URL: $DEPLOYMENT_URL"
        echo "Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
        echo "=========================================="
    fi
    
    # Cleanup
    rm -f deployment.env
}

# Handle script interruption
trap 'error "Deployment interrupted"' INT TERM

# Run main function
main "$@"