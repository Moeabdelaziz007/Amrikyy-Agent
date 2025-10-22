#!/bin/bash

echo "📊 System Health Dashboard"
echo "========================="

# Get system status
echo "🖥️ System Status:"
echo "CPU Usage: $(top -l 1 | grep 'CPU usage' | awk '{print $3}' | sed 's/%//')%"
echo "Memory Usage: $(ps -A -o %mem | awk '{s+=$1} END {print s "%"}')"
echo "Disk Usage: $(df -h / | awk 'NR==2{print $5}')"
echo ""

# Get process status
echo "🔧 Service Status:"
if pgrep -f "node.*frontend" > /dev/null; then
    echo "Frontend: ✅ Running"
else
    echo "Frontend: ❌ Stopped"
fi

if pgrep -f "node.*backend" > /dev/null; then
    echo "Backend: ✅ Running"
else
    echo "Backend: ❌ Stopped"
fi

if pgrep -f "kody" > /dev/null; then
    echo "Kody Agent: ✅ Running"
else
    echo "Kody Agent: ❌ Stopped"
fi

echo ""

# Get recent alerts
if [ -f health-manager.log ]; then
    echo "🚨 Recent Alerts:"
    tail -5 health-manager.log | grep "🚨" || echo "No recent alerts"
fi
