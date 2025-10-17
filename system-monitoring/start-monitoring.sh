#!/bin/bash

echo "🏥 Starting System Health Manager..."

# Load environment variables
if [ -f .env.monitoring ]; then
    export $(cat .env.monitoring | grep -v '^#' | xargs)
fi

# Start the health manager
node ../system-health-manager.js &

# Store PID
echo $! > health-manager.pid

echo "✅ System Health Manager started (PID: $(cat health-manager.pid))"
echo "📊 Monitoring dashboard: http://localhost:8080"
echo "🔍 Logs: tail -f health-manager.log"
