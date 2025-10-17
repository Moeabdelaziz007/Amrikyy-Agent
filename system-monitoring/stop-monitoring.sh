#!/bin/bash

echo "🛑 Stopping System Health Manager..."

if [ -f health-manager.pid ]; then
    PID=$(cat health-manager.pid)
    kill $PID 2>/dev/null || true
    rm health-manager.pid
    echo "✅ System Health Manager stopped"
else
    echo "⚠️ No running instance found"
fi
