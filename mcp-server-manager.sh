#!/bin/bash

# MCP Server Manager for Maya Travel Agent
# Helps manage and optimize MCP server performance

echo "=== MCP Server Manager ==="

# Function to check running MCP servers
check_mcp_servers() {
    echo "Checking running MCP servers..."
    ps aux | grep -E "mcp-server|n8n-mcp" | grep -v grep | wc -l
}

# Function to kill excessive MCP servers
cleanup_mcp_servers() {
    echo "Cleaning up excessive MCP servers..."
    # Kill processes older than 1 hour or excessive instances
    ps aux | grep -E "mcp-server|n8n-mcp" | grep -v grep | while read line; do
        PID=$(echo $line | awk '{print $2}')
        # Kill if more than 3 MCP servers running
        MCP_COUNT=$(ps aux | grep -E "mcp-server|n8n-mcp" | grep -v grep | wc -l)
        if [ "$MCP_COUNT" -gt 3 ]; then
            echo "Killing MCP server process $PID"
            kill $PID
        fi
    done
}

# Function to optimize system performance
optimize_performance() {
    echo "Optimizing system performance..."

    # Set process priorities
    ps aux | grep -E "Cursor|node.*mcp" | grep -v grep | while read line; do
        PID=$(echo $line | awk '{print $2}')
        # Lower priority for heavy processes
        renice 10 $PID 2>/dev/null
    done

    echo "Performance optimization complete"
}

# Function to show system status
show_status() {
    echo "=== System Status ==="
    echo "Load Average: $(uptime | awk -F'load average:' '{print $2}')"
    echo "Memory Usage: $(free -h | grep Mem | awk '{print $3 "/" $2}')"
    echo "MCP Servers Running: $(check_mcp_servers)"
    echo "Top CPU Processes:"
    ps aux --sort=-%cpu | head -5 | awk '{print $2, $3"%", $11}'
}

# Main menu
case "${1:-status}" in
    "status")
        show_status
        ;;
    "cleanup")
        cleanup_mcp_servers
        echo "Cleanup complete"
        ;;
    "optimize")
        optimize_performance
        ;;
    "restart")
        cleanup_mcp_servers
        optimize_performance
        echo "Restart and optimization complete"
        ;;
    *)
        echo "Usage: $0 {status|cleanup|optimize|restart}"
        echo "  status   - Show current system status"
        echo "  cleanup  - Remove excessive MCP servers"
        echo "  optimize - Optimize system performance"
        echo "  restart  - Cleanup and optimize"
        ;;
esac

echo "=== MCP Server Manager Complete ==="