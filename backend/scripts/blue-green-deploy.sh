#!/bin/bash

# Blue-Green Deployment Script for Amrikyy AI Services
# Implements zero-downtime deployments with automatic rollback capabilities

set -e

# Configuration
SERVICE_NAME=${1:-"nlp-service"}
ENVIRONMENT=${2:-"production"}
NAMESPACE=${3:-"amrikyy-production"}
REGION=${4:-"us-central1"}
HEALTH_CHECK_TIMEOUT=${5:-300}
CONFIRMATION_DELAY=${6:-300}

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

# Validate inputs
validate_inputs() {
    if [[ -z "$SERVICE_NAME" || -z "$ENVIRONMENT" ]]; then
        error "Usage: $0 <service-name> <environment> [namespace] [region] [health-check-timeout] [confirmation-delay]"
    fi
    
    log "Validating deployment configuration..."
    log "Service: $SERVICE_NAME"
    log "Environment: $ENVIRONMENT"
    log "Namespace: $NAMESPACE"
    log "Region: $REGION"
}

# Get current active color
get_current_color() {
    local current_color=$(kubectl get service $SERVICE_NAME -n $NAMESPACE -o jsonpath='{.spec.selector.color}' 2>/dev/null || echo "")
    
    if [[ -z "$current_color" ]]; then
        # If no selector exists, assume blue is active (initial deployment)
        echo "blue"
    else
        echo "$current_color"
    fi
}

# Get new deployment color
get_new_color() {
    local current_color=$(get_current_color)
    
    if [[ "$current_color" == "blue" ]]; then
        echo "green"
    else
        echo "blue"
    fi
}

# Deploy new version
deploy_new_version() {
    local new_color=$1
    local deployment_name="${SERVICE_NAME}-${new_color}"
    
    log "Deploying new version to $new_color environment..."
    
    # Apply deployment configuration
    envsubst < infrastructure/k8s/${SERVICE_NAME}-deployment.yaml | \
    sed "s/{{COLOR}}/$new_color/g" | \
    sed "s/{{ENVIRONMENT}}/$ENVIRONMENT/g" | \
    kubectl apply -f - -n $NAMESPACE
    
    # Wait for deployment to be ready
    log "Waiting for deployment $deployment_name to be ready..."
    kubectl rollout status deployment/$deployment_name -n $NAMESPACE --timeout=${HEALTH_CHECK_TIMEOUT}s
    
    if [[ $? -ne 0 ]]; then
        error "Deployment $deployment_name failed to become ready within timeout"
    fi
    
    success "Deployment $deployment_name is ready"
}

# Health check
health_check() {
    local color=$1
    local deployment_name="${SERVICE_NAME}-${color}"
    
    log "Running health checks for $deployment_name..."
    
    # Check pod status
    local ready_pods=$(kubectl get deployment $deployment_name -n $NAMESPACE -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
    local desired_pods=$(kubectl get deployment $deployment_name -n $NAMESPACE -o jsonpath='{.spec.replicas}' 2>/dev/null || echo "1")
    
    if [[ "$ready_pods" != "$desired_pods" ]]; then
        error "Health check failed: $ready_pods/$desired_pods pods ready"
    fi
    
    # Check service endpoints
    local service_url=$(kubectl get service $SERVICE_NAME -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)
    
    if [[ -n "$service_url" ]]; then
        log "Testing service endpoint: http://$service_url/health"
        
        # Health check endpoint test
        local health_status=$(curl -s -o /dev/null -w "%{http_code}" http://$service_url/health || echo "000")
        
        if [[ "$health_status" != "200" ]]; then
            error "Health check endpoint returned status: $health_status"
        fi
        
        success "Health check passed"
    else
        warning "No external IP found, skipping endpoint health check"
    fi
}

# Switch traffic
switch_traffic() {
    local new_color=$1
    
    log "Switching traffic to $new_color environment..."
    
    # Update service selector
    kubectl patch service $SERVICE_NAME -n $NAMESPACE -p "{\"spec\":{\"selector\":{\"color\":\"$new_color\"}}}"
    
    # Verify traffic switch
    local current_selector=$(kubectl get service $SERVICE_NAME -n $NAMESPACE -o jsonpath='{.spec.selector.color}')
    
    if [[ "$current_selector" != "$new_color" ]]; then
        error "Failed to switch traffic to $new_color environment"
    fi
    
    success "Traffic successfully switched to $new_color environment"
}

# Wait for user confirmation
wait_for_confirmation() {
    local new_color=$1
    
    log "Waiting ${CONFIRMATION_DELAY}s for confirmation before cleaning up old environment..."
    log "Press Ctrl+C to abort and rollback"
    
    for i in $(seq 1 $CONFIRMATION_DELAY); do
        echo -ne "\r${BLUE}[INFO]${NC} Waiting... ${i}s/${CONFIRMATION_DELAY}s"
        sleep 1
    done
    echo ""
    
    log "Confirmation period completed, proceeding with cleanup"
}

# Cleanup old environment
cleanup_old_environment() {
    local new_color=$1
    local old_color=$2
    local old_deployment="${SERVICE_NAME}-${old_color}"
    
    log "Cleaning up old environment: $old_deployment"
    
    # Scale down old deployment (keep for rollback)
    kubectl scale deployment $old_deployment --replicas=0 -n $NAMESPACE
    
    # Optional: Delete old deployment after confirmation
    read -p "Delete old deployment $old_deployment? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kubectl delete deployment $old_deployment -n $NAMESPACE
        success "Old deployment deleted"
    else
        log "Old deployment kept with 0 replicas for potential rollback"
    fi
}

# Rollback function
rollback() {
    local rollback_color=$1
    local rollback_deployment="${SERVICE_NAME}-${rollback_color}"
    
    log "Initiating rollback to $rollback_color environment..."
    
    # Scale up rollback deployment
    kubectl scale deployment $rollback_deployment --replicas=1 -n $NAMESPACE
    
    # Wait for rollback deployment to be ready
    kubectl rollout status deployment/$rollback_deployment -n $NAMESPACE --timeout=300s
    
    # Switch traffic back
    kubectl patch service $SERVICE_NAME -n $NAMESPACE -p "{\"spec\":{\"selector\":{\"color\":\"$rollback_color\"}}}"
    
    success "Rollback completed to $rollback_color environment"
}

# Main deployment function
main() {
    log "Starting blue-green deployment for $SERVICE_NAME in $ENVIRONMENT environment..."
    
    validate_inputs
    
    local current_color=$(get_current_color)
    local new_color=$(get_new_color)
    
    log "Current active color: $current_color"
    log "New deployment color: $new_color"
    
    # Deploy new version
    deploy_new_version $new_color
    
    # Health check
    health_check $new_color
    
    # Switch traffic
    switch_traffic $new_color
    
    # Wait for confirmation
    wait_for_confirmation $new_color
    
    # Cleanup old environment
    cleanup_old_environment $new_color $current_color
    
    success "Blue-green deployment completed successfully!"
    log "Service $SERVICE_NAME is now running version $new_color"
}

# Handle script interruption
trap 'warning "Deployment interrupted, initiating rollback..."; rollback $(get_current_color); exit 1' INT TERM

# Run main function
main "$@"