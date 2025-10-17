#!/bin/bash

# PROFESSIONAL SYSTEM MONITORING SETUP
# Complete enterprise-grade system health management

set -e

echo "🏥 Professional System Health Manager Setup"
echo "==========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check prerequisites
echo "Checking system prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js not found. Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi
print_status "Node.js $(node --version) found"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm not found"
    exit 1
fi
print_status "npm $(npm --version) found"

# Check system tools
print_info "Installing system monitoring tools..."

# Install system monitoring tools
if command -v apt-get &> /dev/null; then
    sudo apt-get update
    sudo apt-get install -y htop iotop nethogs sysstat
elif command -v brew &> /dev/null; then
    brew install htop
fi

print_status "System monitoring tools installed"

# Create monitoring directory
MONITORING_DIR="system-monitoring"
mkdir -p $MONITORING_DIR
cd $MONITORING_DIR

print_info "Creating monitoring configuration..."

# Create system monitoring configuration
cat > monitoring-config.json << 'EOF'
{
  "monitoring": {
    "intervals": {
      "system": 30000,
      "database": 60000,
      "api": 15000,
      "agents": 45000,
      "performance": 300000
    },
    "thresholds": {
      "cpu": 80,
      "memory": 85,
      "disk": 90,
      "responseTime": 2000,
      "errorRate": 5,
      "downtime": 60
    },
    "alerts": {
      "slack": {
        "enabled": true,
        "webhook": "${SLACK_WEBHOOK_URL}"
      },
      "telegram": {
        "enabled": true,
        "botToken": "${TELEGRAM_BOT_TOKEN}",
        "chatId": "${TELEGRAM_CHAT_ID}"
      },
      "email": {
        "enabled": true,
        "smtp": {
          "host": "${SMTP_HOST}",
          "port": 587,
          "user": "${SMTP_USER}",
          "password": "${SMTP_PASSWORD}"
        }
      }
    }
  },
  "services": {
    "frontend": {
      "port": 5173,
      "healthCheck": "/",
      "restartCommand": "cd frontend && npm run dev"
    },
    "backend": {
      "port": 5000,
      "healthCheck": "/api/health",
      "restartCommand": "cd backend && npm start"
    },
    "kody": {
      "port": 3000,
      "healthCheck": "/health",
      "restartCommand": "cd zero-cost-agent && node kody-marketing-agent.js"
    }
  },
  "databases": {
    "supabase": {
      "type": "postgresql",
      "healthCheck": "SELECT 1"
    },
    "mongodb": {
      "type": "mongodb",
      "healthCheck": "ping"
    }
  }
}
EOF

print_status "Monitoring configuration created"

# Create environment template
cat > .env.monitoring << 'EOF'
# System Health Manager Environment Variables

# Database Connections
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
POSTGRES_CONNECTION_STRING=postgresql://user:pass@localhost:5432/db

# Alert Channels
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your/webhook/url
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHAT_ID=your-chat-id

# Email Alerts
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Monitoring Settings
MONITORING_INTERVAL=30000
ALERT_COOLDOWN=300000
MAX_ALERTS_PER_HOUR=10

# System Thresholds
CPU_THRESHOLD=80
MEMORY_THRESHOLD=85
DISK_THRESHOLD=90
RESPONSE_TIME_THRESHOLD=2000
ERROR_RATE_THRESHOLD=5
EOF

print_status "Environment template created"

# Create startup script
cat > start-monitoring.sh << 'EOF'
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
EOF

chmod +x start-monitoring.sh

# Create stop script
cat > stop-monitoring.sh << 'EOF'
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
EOF

chmod +x stop-monitoring.sh

# Create dashboard script
cat > dashboard.sh << 'EOF'
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
EOF

chmod +x dashboard.sh

# Create log rotation script
cat > rotate-logs.sh << 'EOF'
#!/bin/bash

echo "🔄 Rotating system logs..."

# Rotate health manager logs
if [ -f health-manager.log ]; then
    mv health-manager.log "health-manager-$(date +%Y%m%d).log"
fi

# Clean old logs (keep last 7 days)
find . -name "health-manager-*.log" -mtime +7 -delete

echo "✅ Log rotation completed"
EOF

chmod +x rotate-logs.sh

# Create systemd service (Linux)
if command -v systemctl &> /dev/null; then
    print_info "Creating systemd service..."
    
    sudo tee /etc/systemd/system/system-health-manager.service > /dev/null << EOF
[Unit]
Description=System Health Manager
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
ExecStart=/usr/bin/node $(pwd)/../system-health-manager.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    sudo systemctl enable system-health-manager.service
    
    print_status "Systemd service created and enabled"
fi

# Create launchd service (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    print_info "Creating launchd service..."
    
    cat > ~/Library/LaunchAgents/com.amrikyy.system-health-manager.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.amrikyy.system-health-manager</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>$(pwd)/../system-health-manager.js</string>
    </array>
    <key>WorkingDirectory</key>
    <string>$(pwd)</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>$(pwd)/health-manager.log</string>
    <key>StandardErrorPath</key>
    <string>$(pwd)/health-manager.error.log</string>
</dict>
</plist>
EOF

    launchctl load ~/Library/LaunchAgents/com.amrikyy.system-health-manager.plist
    
    print_status "Launchd service created and loaded"
fi

# Create monitoring dashboard
cat > dashboard.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>System Health Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .card { background: white; padding: 20px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .status { padding: 5px 10px; border-radius: 4px; color: white; font-weight: bold; }
        .healthy { background: #28a745; }
        .warning { background: #ffc107; color: #000; }
        .critical { background: #dc3545; }
        .metric { display: inline-block; margin: 10px; padding: 10px; background: #f8f9fa; border-radius: 4px; }
        .alert { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; margin: 5px 0; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏥 System Health Dashboard</h1>
        
        <div class="card">
            <h2>System Status</h2>
            <div id="system-status">Loading...</div>
        </div>
        
        <div class="card">
            <h2>Services</h2>
            <div id="services-status">Loading...</div>
        </div>
        
        <div class="card">
            <h2>Recent Alerts</h2>
            <div id="alerts">Loading...</div>
        </div>
        
        <div class="card">
            <h2>Performance Metrics</h2>
            <div id="metrics">Loading...</div>
        </div>
    </div>
    
    <script>
        async function updateDashboard() {
            try {
                const response = await fetch('/api/health/status');
                const data = await response.json();
                
                // Update system status
                document.getElementById('system-status').innerHTML = `
                    <div class="metric">CPU: ${data.system.cpu}%</div>
                    <div class="metric">Memory: ${data.system.memory}%</div>
                    <div class="metric">Disk: ${data.system.disk}%</div>
                `;
                
                // Update services
                let servicesHtml = '';
                Object.entries(data.services).forEach(([name, status]) => {
                    const statusClass = status.healthy ? 'healthy' : 'critical';
                    servicesHtml += `<div class="status ${statusClass}">${name}: ${status.healthy ? 'Healthy' : 'Down'}</div>`;
                });
                document.getElementById('services-status').innerHTML = servicesHtml;
                
                // Update alerts
                let alertsHtml = '';
                data.alerts.forEach(alert => {
                    alertsHtml += `<div class="alert">[${alert.level}] ${alert.title}: ${alert.message}</div>`;
                });
                document.getElementById('alerts').innerHTML = alertsHtml || 'No active alerts';
                
            } catch (error) {
                console.error('Failed to update dashboard:', error);
            }
        }
        
        // Update every 30 seconds
        setInterval(updateDashboard, 30000);
        updateDashboard();
    </script>
</body>
</html>
EOF

print_status "Dashboard created"

# Create API endpoint for dashboard
cat > health-api.js << 'EOF'
import express from 'express';
import SystemHealthManager from '../system-health-manager.js';

const app = express();
const healthManager = new SystemHealthManager();

app.use(express.json());
app.use(express.static('.'));

app.get('/api/health/status', (req, res) => {
    const report = healthManager.generateHealthReport();
    res.json(report);
});

app.get('/api/health/alerts', (req, res) => {
    const alerts = healthManager.alerts.filter(a => !a.resolved);
    res.json(alerts);
});

app.get('/api/health/metrics', (req, res) => {
    res.json(healthManager.metrics);
});

app.post('/api/health/restart/:service', async (req, res) => {
    const { service } = req.params;
    await healthManager.restartServices([service]);
    res.json({ success: true, message: `${service} restarted` });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🏥 Health Manager API running on port ${PORT}`);
});
EOF

print_status "API endpoint created"

# Create package.json for monitoring
cat > package.json << 'EOF'
{
  "name": "system-health-monitoring",
  "version": "1.0.0",
  "description": "Professional system health monitoring",
  "type": "module",
  "scripts": {
    "start": "node health-api.js",
    "monitor": "node ../system-health-manager.js",
    "dashboard": "open http://localhost:8080",
    "status": "node ../system-health-manager.js status",
    "alerts": "node ../system-health-manager.js alerts"
  },
  "dependencies": {
    "express": "^4.18.2",
    "node-fetch": "^3.3.2"
  }
}
EOF

print_status "Package.json created"

# Install dependencies
print_info "Installing monitoring dependencies..."
npm install

print_status "Dependencies installed"

# Create quick start guide
cat > QUICK_START.md << 'EOF'
# System Health Manager - Quick Start

## 🚀 Quick Setup

1. **Configure Environment Variables**
   ```bash
   cp .env.monitoring .env
   # Edit .env with your actual values
   ```

2. **Start Monitoring**
   ```bash
   ./start-monitoring.sh
   ```

3. **View Dashboard**
   ```bash
   ./dashboard.sh
   # Or open http://localhost:8080
   ```

## 📊 Available Commands

- `./start-monitoring.sh` - Start health monitoring
- `./stop-monitoring.sh` - Stop health monitoring
- `./dashboard.sh` - View system status
- `./rotate-logs.sh` - Rotate log files
- `npm run status` - Get system status
- `npm run alerts` - View active alerts

## 🔧 Configuration

Edit `monitoring-config.json` to customize:
- Monitoring intervals
- Alert thresholds
- Service configurations
- Database connections

## 🚨 Alert Channels

Configure alerts in `.env`:
- Slack webhooks
- Telegram bot
- Email notifications

## 📈 Dashboard

Access the web dashboard at: http://localhost:8080

Features:
- Real-time system metrics
- Service status monitoring
- Active alerts display
- Performance charts
- Manual service controls

## 🛠️ Troubleshooting

1. **Check logs**: `tail -f health-manager.log`
2. **Restart services**: `npm run restart <service>`
3. **View system status**: `./dashboard.sh`
4. **Check configuration**: `cat monitoring-config.json`
EOF

print_status "Quick start guide created"

echo ""
echo "🎉 Professional System Health Manager Setup Complete!"
echo "====================================================="
echo ""
print_status "Monitoring directory: $MONITORING_DIR"
print_status "Configuration: monitoring-config.json"
print_status "Environment: .env.monitoring"
print_status "Dashboard: http://localhost:8080"
print_status "API: http://localhost:8080/api/health"
echo ""
print_info "Next steps:"
echo "1. Configure .env.monitoring with your API keys"
echo "2. Run: ./start-monitoring.sh"
echo "3. Open: http://localhost:8080"
echo "4. Monitor: ./dashboard.sh"
echo ""
print_warning "Remember to configure alert channels for notifications!"
echo ""
print_status "System Health Manager ready! 🏥"

