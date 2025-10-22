#!/bin/bash

# ============================================
# Maya Travel Agent Monitoring Stack
# Deployment Automation Script
# ============================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MONITORING_DIR="$SCRIPT_DIR"
COMPOSE_FILE="$MONITORING_DIR/docker-compose.yml"
ENV_FILE="$MONITORING_DIR/.env"
ENV_EXAMPLE="$MONITORING_DIR/.env.example"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $*"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $*"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $*"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $*"
}

check_dependencies() {
    log_info "Checking dependencies..."

    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed or not in PATH. Please install Docker first."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed or not in PATH. Please install Docker Compose first."
        exit 1
    fi

    log_success "Dependencies check passed"
}

create_env_file() {
    if [[ ! -f "$ENV_FILE" ]]; then
        log_warn "Environment file not found. Creating from template..."
        cp "$ENV_EXAMPLE" "$ENV_FILE"
        log_warn "Please edit $ENV_FILE with your configuration before proceeding"
        log_warn "Run this script again after configuring your environment file"
        exit 0
    else
        log_info "Environment file already exists"
    fi
}

validate_env_file() {
    log_info "Validating environment configuration..."

    local required_vars=(
        "GRAFANA_ADMIN_PASSWORD"
        "SMTP_HOST"
        "SMTP_USERNAME"
        "SMTP_PASSWORD"
    )

    local missing_vars=()

    # Check for required variables
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            missing_vars+=("$var")
        fi
    done

    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        log_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            log_error "  - $var"
        done
        log_warn "Please check your .env file and ensure all required variables are set"
        exit 1
    fi

    # Check for weak passwords
    if [[ "${GRAFANA_ADMIN_PASSWORD:-}" == "admin" ]]; then
        log_warn "Using default Grafana password is not recommended for production"
        log_warn "Please set a strong password in GRAFANA_ADMIN_PASSWORD"
    fi

    log_success "Environment configuration is valid"
}

check_existing_deployment() {
    if docker-compose -f "$COMPOSE_FILE" ps | grep -q "Up"; then
        log_warn "Monitoring stack is already running"
        read -p "Do you want to stop and redeploy? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Deployment cancelled by user"
            exit 0
        fi
        log_info "Stopping existing deployment..."
        docker-compose -f "$COMPOSE_FILE" down --volumes --remove-orphans
    fi
}

backup_existing_data() {
    local backup_dir="$MONITORING_DIR/backups/$(date +%Y%m%d_%H%M%S)"

    if [[ -d "$MONITORING_DIR/grafana_data" ]] || [[ -d "$MONITORING_DIR/prometheus_data" ]]; then
        log_info "Creating backup of existing data..."
        mkdir -p "$backup_dir"

        if [[ -d "$MONITORING_DIR/grafana_data" ]]; then
            cp -r "$MONITORING_DIR/grafana_data" "$backup_dir/"
            log_info "Backed up Grafana data to $backup_dir/grafana_data"
        fi

        if [[ -d "$MONITORING_DIR/prometheus_data" ]]; then
            cp -r "$MONITORING_DIR/prometheus_data" "$backup_dir/"
            log_info "Backed up Prometheus data to $backup_dir/prometheus_data"
        fi

        log_success "Backup completed"
    fi
}

deploy_monitoring_stack() {
    log_info "Deploying monitoring stack..."

    # Create necessary directories
    mkdir -p "$MONITORING_DIR/grafana_data"
    mkdir -p "$MONITORING_DIR/prometheus_data"
    mkdir -p "$MONITORING_DIR/loki_data"
    mkdir -p "$MONITORING_DIR/alertmanager_data"

    # Deploy the stack
    docker-compose -f "$COMPOSE_FILE" up -d

    log_info "Waiting for services to be healthy..."
    sleep 30

    # Check deployment status
    if docker-compose -f "$COMPOSE_FILE" ps | grep -q "Up"; then
        log_success "Monitoring stack deployed successfully!"
    else
        log_error "Some services failed to start"
        log_info "Check logs with: $MONITORING_DIR/logs.sh"
        exit 1
    fi
}

print_post_deployment_info() {
    echo
    log_success "=== Maya Travel Agent Monitoring Stack ==="
    echo
    echo "📊 Services Status:"
    echo "  - Prometheus:  http://localhost:9090"
    echo "  - Grafana:     http://localhost:3000 (admin/admin)"
    echo "  - Alertmanager: http://localhost:9093"
    echo "  - Loki:        http://localhost:3100"
    echo
    echo "📋 Quick Commands:"
    echo "  - View logs:     $MONITORING_DIR/logs.sh"
    echo "  - Stop stack:    $MONITORING_DIR/stop.sh"
    echo "  - Restart:       $MONITORING_DIR/restart.sh"
    echo "  - Update:        $MONITORING_DIR/update.sh"
    echo
    echo "🔧 Configuration:"
    echo "  - Edit settings: $ENV_FILE"
    echo "  - Update monitoring targets by editing docker-compose.yml"
    echo
    echo "📚 Documentation:"
    echo "  - Grafana Dashboards: Configure dashboards and datasources"
    echo "  - Alert Rules: Modify alerting.yml for custom alerts"
    echo "  - Slack Integration: Update SLACK_WEBHOOK_URL in .env"
    echo
    log_warn "⚠️  SECURITY REMINDERS:"
    echo "  - Change default Grafana password immediately"
    echo "  - Configure SSL/TLS for production use"
    echo "  - Set up proper firewall rules"
    echo "  - Enable authentication for Grafana"
}

show_logs() {
    if [[ $# -gt 0 ]]; then
        docker-compose -f "$COMPOSE_FILE" logs -f "$1"
    else
        docker-compose -f "$COMPOSE_FILE" logs --tail=50
    fi
}

main() {
    echo "🚀 Maya Travel Agent Monitoring Stack Deployment"
    echo "==============================================="
    echo

    # Run deployment steps
    check_dependencies
    create_env_file
    validate_env_file
    check_existing_deployment
    backup_existing_data
    deploy_monitoring_stack
    print_post_deployment_info

    echo
    log_success "Deployment completed! 🎉"
}

# Handle script arguments
case "${1:-}" in
    "logs")
        if [[ -f "$COMPOSE_FILE" ]]; then
            show_logs "${2:-}"
        else
            log_error "Docker compose file not found"
            exit 1
        fi
        ;;
    *)
        main
        ;;
esac