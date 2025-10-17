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
