#!/bin/bash

# Amrikyy Travel Agent - Frontend Health Monitor
# This script monitors the health of the deployed frontend

echo "🔍 Amrikyy Frontend Health Monitor"
echo "=================================="

# Configuration
FRONTEND_URL="https://maya-trips-frontend.vercel.app"
EXPECTED_STATUS=200
TIMEOUT=10

# Health check function
check_frontend_health() {
    echo "📡 Checking frontend health at: $FRONTEND_URL"
    
    # Check HTTP status
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$FRONTEND_URL")
    
    if [ "$HTTP_STATUS" -eq "$EXPECTED_STATUS" ]; then
        echo "✅ Frontend is healthy (HTTP $HTTP_STATUS)"
        return 0
    else
        echo "❌ Frontend returned HTTP $HTTP_STATUS"
        return 1
    fi
}

# Performance check function
check_performance() {
    echo "⚡ Checking performance metrics..."
    
    # Check response time
    RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" --max-time $TIMEOUT "$FRONTEND_URL")
    
    if (( $(echo "$RESPONSE_TIME < 2.0" | bc -l) )); then
        echo "✅ Response time: ${RESPONSE_TIME}s (Good)"
    else
        echo "⚠️  Response time: ${RESPONSE_TIME}s (Slow)"
    fi
}

# Security headers check
check_security_headers() {
    echo "🔒 Checking security headers..."
    
    HEADERS=$(curl -s -I --max-time $TIMEOUT "$FRONTEND_URL")
    
    if echo "$HEADERS" | grep -q "X-Content-Type-Options: nosniff"; then
        echo "✅ X-Content-Type-Options header present"
    else
        echo "❌ Missing X-Content-Type-Options header"
    fi
    
    if echo "$HEADERS" | grep -q "X-Frame-Options"; then
        echo "✅ X-Frame-Options header present"
    else
        echo "❌ Missing X-Frame-Options header"
    fi
}

# Main execution
main() {
    echo "Starting health check at $(date)"
    echo ""
    
    # Run all checks
    check_frontend_health
    HEALTH_STATUS=$?
    
    check_performance
    check_security_headers
    
    echo ""
    echo "🏁 Health check completed at $(date)"
    
    if [ $HEALTH_STATUS -eq 0 ]; then
        echo "✅ Overall Status: HEALTHY"
        exit 0
    else
        echo "❌ Overall Status: UNHEALTHY"
        exit 1
    fi
}

# Run the health check
main
