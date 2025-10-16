#!/bin/bash

# Rollback Script for Amrikyy AI Services
# Automated rollback procedures for failed deployments

set -e

# Configuration
SERVICE_NAME=${1:-"nlp-service"}
ENVIRONMENT=${2:-"production"}
NAMESPACE=${3:-"amrikyy-production"}
ROLLBACK_REASON=${4:-"Manual rollback"}
FORCE=${5:-"false"}

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
        error "Usage: $0 <service-name> <environment> [namespace] [rollback-reason] [force]"
    fi
    
    log "Validating rollback configuration..."
    log "Service: $SERVICE_NAME"
    log "Environment: $ENVIRONMENT"
    log "Namespace: $NAMESPACE"
    log "Reason: $ROLLBACK_REASON"
    log "Force: $FORCE"
}

# Get current active color
get_current_color() {
    local current_color=$(kubectl get service $SERVICE_NAME -n $NAMESPACE -o jsonpath='{.spec.selector.color}' 2>/dev/null || echo "")
    
    if [[ -z "$current_color" ]]; then
        error "Service $SERVICE_NAME not found or has no color selector"
    fi
    
    echo "$current_color"
}

# Get available colors
get_available_colors() {
    local deployments=$(kubectl get deployments -n $NAMESPACE -l app=$SERVICE_NAME -o jsonpath='{.items[*].metadata.name}' 2>/dev/null)
    local colors=()
    
    for deployment in $deployments; do
        if [[ "$deployment" =~ ${SERVICE_NAME}-(blue|green) ]]; then
            colors+=("${BASH_REMATCH[1]}")
        fi
    done
    
    echo "${colors[@]}"
}

# Check deployment health
check_deployment_health() {
    local deployment_name=$1
    local timeout=${2:-60}
    
    log "Checking health of deployment: $deployment_name"
    
    # Check if deployment exists
    if ! kubectl get deployment $deployment_name -n $NAMESPACE &>/dev/null; then
        error "Deployment $deployment_name not found"
    fi
    
    # Check pod status
    local ready_pods=$(kubectl get deployment $deployment_name -n $NAMESPACE -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
    local desired_pods=$(kubectl get deployment $deployment_name -n $NAMESPACE -o jsonpath='{.spec.replicas}' 2>/dev/null || echo "1")
    
    if [[ "$ready_pods" != "$desired_pods" ]]; then
        warning "Deployment $deployment_name has $ready_pods/$desired_pods pods ready"
        return 1
    fi
    
    # Check pod conditions
    local unhealthy_pods=$(kubectl get pods -n $NAMESPACE -l app=$SERVICE_NAME,version=${deployment_name##*-} -o jsonpath='{range .items[*]}{.status.conditions[?(@.type=="Ready")].status}{"\n"}{end}' | grep -c "False" || echo "0")
    
    if [[ "$unhealthy_pods" -gt 0 ]]; then
        warning "Deployment $deployment_name has $unhealthy_pods unhealthy pods"
        return 1
    fi
    
    success "Deployment $deployment_name is healthy"
    return 0
}

# Scale deployment
scale_deployment() {
    local deployment_name=$1
    local replicas=$2
    
    log "Scaling deployment $deployment_name to $replicas replicas"
    
    kubectl scale deployment $deployment_name --replicas=$replicas -n $NAMESPACE
    
    # Wait for scaling to complete
    kubectl rollout status deployment/$deployment_name -n $NAMESPACE --timeout=120s
    
    if [[ $? -ne 0 ]]; then
        error "Failed to scale deployment $deployment_name"
    fi
    
    success "Deployment $deployment_name scaled to $replicas replicas"
}

# Switch traffic
switch_traffic() {
    local target_color=$1
    
    log "Switching traffic to $target_color environment..."
    
    # Update service selector
    kubectl patch service $SERVICE_NAME -n $NAMESPACE -p "{\"spec\":{\"selector\":{\"color\":\"$target_color\"}}}"
    
    # Verify traffic switch
    local current_selector=$(kubectl get service $SERVICE_NAME -n $NAMESPACE -o jsonpath='{.spec.selector.color}')
    
    if [[ "$current_selector" != "$target_color" ]]; then
        error "Failed to switch traffic to $target_color environment"
    fi
    
    success "Traffic successfully switched to $target_color environment"
}

# Test rollback
test_rollback() {
    local target_color=$1
    
    log "Testing rollback to $target_color environment..."
    
    # Get service URL
    local service_url=$(kubectl get service $SERVICE_NAME -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)
    
    if [[ -n "$service_url" ]]; then
        log "Testing service endpoint: http://$service_url/health"
        
        # Health check endpoint test
        local health_status=$(curl -s -o /dev/null -w "%{http_code}" http://$service_url/health || echo "000")
        
        if [[ "$health_status" != "200" ]]; then
            error "Health check failed after rollback: status $health_status"
        fi
        
        success "Health check passed after rollback"
    else
        warning "No external IP found, skipping endpoint test"
    fi
}

# Log rollback event
log_rollback_event() {
    local from_color=$1
    local to_color=$2
    
    log "Logging rollback event..."
    
    # Create log entry
    local log_entry="{
        \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
        \"service\": \"$SERVICE_NAME\",
        \"environment\": \"$ENVIRONMENT\",
        \"namespace\": \"$NAMESPACE\",
        \"event_type\": \"rollback\",
        \"from_color\": \"$from_color\",
        \"to_color\": \"$to_color\",
        \"reason\": \"$ROLLBACK_REASON\",
        \"force\": \"$FORCE\"
    }"
    
    # Send to logging system (example: Cloud Logging)
    echo "$log_entry" >> /var/log/amrikyy-rollbacks.log
    
    # Send notification (if configured)
    if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
        curl -X POST "$SLACK_WEBHOOK_URL" \
            -H 'Content-type: application/json' \
            --data "{\"text\":\"🚨 Rollback Alert: $SERVICE_NAME rolled back from $from_color to $to_color\\nReason: $ROLLBACK_REASON\"}"
    fi
    
    success "Rollback event logged"
}

# Main rollback function
rollback() {
    local current_color=$(get_current_color)
    local available_colors=($(get_available_colors))
    local target_color=""
    
    log "Starting rollback for $SERVICE_NAME..."
    log "Current active color: $current_color"
    log "Available colors: ${available_colors[*]}"
    
    # Find target color (different from current)
    for color in "${available_colors[@]}"; do
        if [[ "$color" != "$current_color" ]]; then
            target_color="$color"
            break
        fi
    done
    
    if [[ -z "$target_color" ]]; then
        error "No alternative deployment found for rollback"
    fi
    
    log "Target rollback color: $target_color"
    
    # Check if target deployment is healthy
    local target_deployment="${SERVICE_NAME}-${target_color}"
    
    if ! check_deployment_health $target_deployment; then
        if [[ "$FORCE" == "true" ]]; then
            warning "Target deployment unhealthy, but proceeding with force rollback"
        else
            error "Target deployment $target_deployment is not healthy. Use --force to override."
        fi
    fi
    
    # Scale up target deployment if needed
    local current_replicas=$(kubectl get deployment $target_deployment -n $NAMESPACE -o jsonpath='{.spec.replicas}' 2>/dev/null || echo "0")
    
    if [[ "$current_replicas" -eq 0 ]]; then
        scale_deployment $target_deployment 1
    fi
    
    # Switch traffic
    switch_traffic $target_color
    
    # Test rollback
    test_rollback $target_color
    
    # Scale down previous deployment
    local previous_deployment="${SERVICE_NAME}-${current_color}"
    scale_deployment $previous_deployment 0
    
    # Log rollback event
    log_rollback_event $current_color $target_color
    
    success "Rollback completed successfully!"
    log "Service $SERVICE_NAME rolled back from $current_color to $target_color"
    log "Reason: $ROLLBACK_REASON"
}

# Emergency rollback to previous working version
emergency_rollback() {
    log "Performing emergency rollback..."
    
    # Get last known good deployment from annotations or labels
    local last_good_color=$(kubectl get service $SERVICE_NAME -n $NAMESPACE -o jsonpath='{.metadata.annotations.amrikyy\.io/last-good-color}' 2>/dev/null || echo "")
    
    if [[ -z "$last_good_color" ]]; then
        error "No last known good deployment found"
    fi
    
    log "Emergency rollback to last known good: $last_good_color"
    
    # Force rollback to last known good
    ROLLBACK_REASON="Emergency rollback to last known good"
    FORCE="true"
    
    # Override current color detection
    local current_color=$(get_current_color)
    
    # Scale up last good deployment
    local last_good_deployment="${SERVICE_NAME}-${last_good_color}"
    scale_deployment $last_good_deployment 1
    
    # Switch traffic immediately
    switch_traffic $last_good_color
    
    # Scale down current deployment
    local current_deployment="${SERVICE_NAME}-${current_color}"
    scale_deployment $current_deployment 0
    
    success "Emergency rollback completed!"
}

# Show rollback history
show_history() {
    log "Rollback history for $SERVICE_NAME:"
    
    if [[ -f "/var/log/amrikyy-rollbacks.log" ]]; then
        grep "\"service\":\"$SERVICE_NAME\"" /var/log/amrikyy-rollbacks.log | \
        jq -r '.timestamp + " " + .event_type + " from " + .from_color + " to " + .to_color + " (Reason: " + .reason + ")"' | \
        tail -10
    else
        log "No rollback history found"
    fi
}

# Main execution
main() {
    validate_inputs
    
    case "${6:-}" in
        "emergency")
            emergency_rollback
            ;;
        "history")
            show_history
            ;;
        *)
            rollback
            ;;
    esac
}

# Handle script interruption
trap 'error "Rollback interrupted"' INT TERM

# Run main function
main "$@"