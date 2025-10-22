#!/bin/bash

echo "🔄 Rotating system logs..."

# Rotate health manager logs
if [ -f health-manager.log ]; then
    mv health-manager.log "health-manager-$(date +%Y%m%d).log"
fi

# Clean old logs (keep last 7 days)
find . -name "health-manager-*.log" -mtime +7 -delete

echo "✅ Log rotation completed"
