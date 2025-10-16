#!/bin/bash

# Health Check Script for Amrikyy AI Services
# Comprehensive health monitoring for deployed services

set -e

# Configuration
SERVICE_NAME=${1:-"nlp-service"}
ENVIRONMENT=${2:-"production"}
NAMESPACE=${3:-"amrikyy-production"}
COLOR=${4:-""}
TIMEOUT=${5:-30}
DETAILED=${6:-"false"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Health check results
OVERALL_HEALTH=0
DETAILS=()

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    OVERALL_HEALTH=1
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
        echo "Usage: $0 <service-name> <environment> [namespace] [color] [timeout] [detailed]"
        exit 1
    fi
    
    log "Running health check for $SERVICE_NAME in $ENVIRONMENT environment..."
}

# Check deployment status
check_deployment_status() {
    local deployment_name="${SERVICE_NAME}-${COLOR}"
    
    if [[ -z "$COLOR" ]]; then
        deployment_name=$SERVICE_NAME
    fi
    
    log "Checking deployment status: $deployment_name"
    
    if ! kubectl get deployment $deployment_name -n $NAMESPACE &>/dev/null; then
        error "Deployment $deployment_name not found"
        return 1
    fi
    
    local status=$(kubectl get deployment $deployment_name -n $NAMESPACE -o jsonpath='{.status.conditions[?(@.type=="Progressing")].status}')
    local message=$(kubectl get deployment $deployment_name -n $NAMESPACE -o jsonpath='{.status.conditions[?(@.type=="Progressing")].message}')
    
    if [[ "$status" != "True" ]]; then
        error "Deployment not progressing: $message"
        return 1
    fi
    
    local ready_replicas=$(kubectl get deployment $deployment_name -n $NAMESPACE -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
    local desired_replicas=$(kubectl get deployment $deployment_name -n $NAMESPACE -o jsonpath='{.spec.replicas}' 2>/dev/null || echo "1")
    
    if [[ "$ready_replicas" != "$desired_replicas" ]]; then
        error "Deployment replicas: $ready_replicas/$desired_replicas ready"
        return 1
    fi
    
    success "Deployment status: OK ($ready_replicas/$desired_replicas ready)"
    DETAILS+=("deployment:$ready_replicas/$desired_replicas")
    return 0
}

# Check pod health
check_pod_health() {
    local label_selector="app=$SERVICE_NAME"
    
    if [[ -n "$COLOR" ]]; then
        label_selector="$label_selector,version=$COLOR"
    fi
    
    log "Checking pod health..."
    
    local pods=$(kubectl get pods -n $NAMESPACE -l $label_selector -o jsonpath='{range .items[*]}{.metadata.name}{" "}{.status.phase}{"\n"}{end}' 2>/dev/null)
    
    if [[ -z "$pods" ]]; then
        error "No pods found for selector: $label_selector"
        return 1
    fi
    
    local unhealthy_pods=0
    local total_pods=0
    
    while read -r pod_name pod_status; do
        total_pods=$((total_pods + 1))
        
        if [[ "$pod_status" != "Running" ]]; then
            error "Pod $pod_name status: $pod_status"
            unhealthy_pods=$((unhealthy_pods + 1))
        else
            # Check pod conditions
            local ready=$(kubectl get pod $pod_name -n $NAMESPACE -o jsonpath='{.status.conditions[?(@.type=="Ready")].status}' 2>/dev/null || echo "False")
            
            if [[ "$ready" != "True" ]]; then
                error "Pod $pod_name not ready"
                unhealthy_pods=$((unhealthy_pods + 1))
            fi
        fi
    done <<< "$pods"
    
    if [[ "$unhealthy_pods" -gt 0 ]]; then
        error "Pod health: $unhealthy_pods/$total_pods unhealthy"
        return 1
    fi
    
    success "Pod health: OK ($total_pods pods running)"
    DETAILS+=("pods:$total_pods")
    return 0
}

# Check service status
check_service_status() {
    log "Checking service status..."
    
    if ! kubectl get service $SERVICE_NAME -n $NAMESPACE &>/dev/null; then
        error "Service $SERVICE_NAME not found"
        return 1
    fi
    
    local service_type=$(kubectl get service $SERVICE_NAME -n $NAMESPACE -o jsonpath='{.spec.type}')
    
    if [[ "$service_type" == "LoadBalancer" ]]; then
        local external_ip=$(kubectl get service $SERVICE_NAME -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")
        
        if [[ -z "$external_ip" ]]; then
            warning "LoadBalancer service has no external IP"
            DETAILS+=("service:no-external-ip")
        else
            success "Service status: OK (External IP: $external_ip)"
            DETAILS+=("service:$external_ip")
        fi
    else
        success "Service status: OK ($service_type)"
        DETAILS+=("service:$service_type")
    fi
    
    return 0
}

# Check endpoint health
check_endpoint_health() {
    log "Checking endpoint health..."
    
    local service_url=$(kubectl get service $SERVICE_NAME -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)
    
    if [[ -z "$service_url" ]]; then
        # Try cluster IP for internal testing
        service_url=$(kubectl get service $SERVICE_NAME -n $NAMESPACE -o jsonpath='{.spec.clusterIP}' 2>/dev/null)
        
        if [[ -z "$service_url" ]]; then
            warning "No service URL available for endpoint testing"
            return 0
        fi
    fi
    
    # Test health endpoint
    local health_url="http://$service_url/health"
    local response_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT $health_url || echo "000")
    
    if [[ "$response_code" == "200" ]]; then
        success "Endpoint health: OK ($health_url)"
        DETAILS+=("endpoint:200")
        return 0
    else
        error "Endpoint health: FAILED ($health_url - HTTP $response_code)"
        DETAILS+=("endpoint:$response_code")
        return 1
    fi
}

# Check resource usage
check_resource_usage() {
    if [[ "$DETAILED" != "true" ]]; then
        return 0
    fi
    
    log "Checking resource usage..."
    
    local label_selector="app=$SERVICE_NAME"
    
    if [[ -n "$COLOR" ]]; then
        label_selector="$label_selector,version=$COLOR"
    fi
    
    # Get CPU and memory usage
    local metrics=$(kubectl top pods -n $NAMESPACE -l $label_selector --no-headers 2>/dev/null || echo "")
    
    if [[ -z "$metrics" ]]; then
        warning "Resource metrics not available (metrics server may not be running)"
        return 0
    fi
    
    local high_usage_pods=0
    local total_checked=0
    
    while read -r pod_name cpu_usage memory_usage; do
        total_checked=$((total_checked + 1))
        
        # Extract numeric values (remove 'm' for CPU, 'Mi' for memory)
        local cpu_value=$(echo $cpu_usage | sed 's/m//')
        local memory_value=$(echo $memory_usage | sed 's/Mi//')
        
        # Check thresholds
        if [[ "$cpu_value" -gt 800 ]]; then  # 800m CPU
            warning "Pod $pod_name high CPU usage: ${cpu_usage}"
            high_usage_pods=$((high_usage_pods + 1))
        fi
        
        if [[ "$memory_value" -gt 700 ]]; then  # 700Mi memory
            warning "Pod $pod_name high memory usage: ${memory_usage}"
            high_usage_pods=$((high_usage_pods + 1))
        fi
    done <<< "$metrics"
    
    if [[ "$high_usage_pods" -gt 0 ]]; then
        warning "Resource usage: $high_usage_pods/$total_checked pods with high usage"
        DETAILS+=("resources:high-usage")
    else
        success "Resource usage: OK ($total_checked pods checked)"
        DETAILS+=("resources:normal")
    fi
    
    return 0
}

# Check recent logs for errors
check_log_errors() {
    if [[ "$DETAILED" != "true" ]]; then
        return 0
    fi
    
    log "Checking recent logs for errors..."
    
    local label_selector="app=$SERVICE_NAME"
    
    if [[ -n "$COLOR" ]]; then
        label_selector="$label_selector,version=$COLOR"
    fi
    
    # Get recent logs (last 5 minutes)
    local error_count=$(kubectl logs -n $NAMESPACE -l $label_selector --since=5m --tail=100 2>/dev/null | grep -i -c "error\|exception\|failed" || echo "0")
    
    if [[ "$error_count" -gt 10 ]]; then
        error "Recent errors in logs: $error_count (last 5 minutes)"
        DETAILS+=("logs:$error_count-errors")
        return 1
    elif [[ "$error_count" -gt 0 ]]; then
        warning "Recent errors in logs: $error_count (last 5 minutes)"
        DETAILS+=("logs:$error_count-warnings")
    else
        success "Log check: OK (no recent errors)"
        DETAILS+=("logs:clean")
    fi
    
    return 0
}

# Generate health report
generate_health_report() {
    log "Generating health report..."
    
    local status="HEALTHY"
    if [[ "$OVERALL_HEALTH" -ne 0 ]]; then
        status="UNHEALTHY"
    fi
    
    local report="{
        \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
        \"service\": \"$SERVICE_NAME\",
        \"environment\": \"$ENVIRONMENT\",
        \"namespace\": \"$NAMESPACE\",
        \"color\": \"$COLOR\",
        \"status\": \"$status\",
        \"details\": {"
    
    # Add details
    for i in "${!DETAILS[@]}"; do
        if [[ $i -gt 0 ]]; then
            report+=","
        fi
        
        local detail="${DETAILS[$i]}"
        local key=$(echo $detail | cut -d: -f1)
        local value=$(echo $detail | cut -d: -f2-)
        
        report+="\"$key\":\"$value\""
    done
    
    report+="}
    }"
    
    echo "$report" > /tmp/health-check-$SERVICE_NAME.json
    
    log "Health report saved to /tmp/health-check-$SERVICE_NAME.json"
    
    # Output summary
    echo ""
    echo "=========================================="
    echo "Health Check Summary for $SERVICE_NAME"
    echo "=========================================="
    echo "Status: $status"
    echo "Environment: $ENVIRONMENT"
    echo "Namespace: $NAMESPACE"
    if [[ -n "$COLOR" ]]; then
        echo "Color: $COLOR"
    fi
    echo "Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    echo ""
    
    if [[ "$OVERALL_HEALTH" -eq 0 ]]; then
        success "All health checks passed!"
    else
        error "Some health checks failed!"
    fi
    
    echo "=========================================="
}

# Main health check function
main() {
    validate_inputs
    
    # If no color specified, get current color from service
    if [[ -z "$COLOR" ]]; then
        COLOR=$(kubectl get service $SERVICE_NAME -n $NAMESPACE -o jsonpath='{.spec.selector.color}' 2>/dev/null || echo "")
    fi
    
    # Run health checks
    check_deployment_status
    check_pod_health
    check_service_status
    check_endpoint_health
    check_resource_usage
    check_log_errors
    
    # Generate report
    generate_health_report
    
    exit $OVERALL_HEALTH
}

# Run main function
main "$@"