#!/bin/bash

# ============================================
# Maya Travel Agent Monitoring Stack
# Logs Viewing Script
# ============================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $*"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $*"
}

show_all_logs() {
    echo "📋 Showing logs for all monitoring services..."
    echo "=============================================="
    docker-compose -f "$COMPOSE_FILE" logs --tail=100 -f
}

show_service_logs() {
    local service="$1"
    local tail="${2:-100}"

    if ! docker-compose -f "$COMPOSE_FILE" ps | grep -q "$service"; then
        log_error "Service '$service' is not found"
        exit 1
    fi

    echo "📋 Showing logs for service: $service"
    echo "======================================"
    docker-compose -f "$COMPOSE_FILE" logs --tail="$tail" -f "$service"
}

show_error_logs() {
    echo "🚨 Showing ERROR and CRITICAL logs only..."
    echo "==========================================="
    docker-compose -f "$COMPOSE_FILE" logs --tail=200 | grep -E "(ERROR|CRITICAL|FATAL|panic)" || echo "No error logs found"
}

main() {
    if [[ $# -eq 0 ]]; then
        echo "📋 Maya Travel Agent Monitoring - Available Services:"
        echo "=================================================="
        docker-compose -f "$COMPOSE_FILE" ps --services | cat
        echo
        echo "Usage: $0 [service_name] [tail_lines]"
        echo "       $0 prometheus 50       # Show last 50 lines of Prometheus logs"
        echo "       $0 grafana             # Follow Grafana logs"
        echo "       $0 all                 # Show all service logs"
        echo "       $0 errors              # Show only error logs"
        echo "       $0 prometheus 100      # Show last 100 lines of Prometheus"
        exit 0
    fi

    local service="$1"
    local tail="${2:-100}"

    case "$service" in
        "all")
            show_all_logs
            ;;
        "errors"|"error")
            show_error_logs
            ;;
        "prometheus"|"grafana"|"alertmanager"|"loki"|"promtail"|"node-exporter"|"cadvisor"|"blackbox-exporter")
            show_service_logs "$service" "$tail"
            ;;
        *)
            log_error "Unknown service: $service"
            echo "Available services:"
            docker-compose -f "$COMPOSE_FILE" ps --services | cat
            exit 1
            ;;
    esac
}

main "$@"