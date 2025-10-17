#!/usr/bin/env node

/**
 * 📊 MONEY HUNTER REAL-TIME MONITOR
 * WebSocket-based real-time monitoring dashboard
 */

const WebSocket = require('ws');
const http = require('http');

class MoneyHunterMonitor {
  constructor(orchestrator, port = 8080) {
    this.orchestrator = orchestrator;
    this.port = port;
    this.clients = new Set();
    this.eventLog = [];
    this.maxLogSize = 100;
  }

  /**
   * Start monitoring server
   */
  async start() {
    // Create HTTP server
    this.server = http.createServer((req, res) => {
      if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(this.getMonitorHTML());
      } else if (req.url === '/status') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(this.orchestrator.getSystemStatus()));
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });

    // Create WebSocket server
    this.wss = new WebSocket.Server({ server: this.server });

    // Handle WebSocket connections
    this.wss.on('connection', (ws) => {
      console.log('📊 New monitor client connected');
      this.clients.add(ws);

      // Send current status
      ws.send(JSON.stringify({
        type: 'initial-status',
        data: this.orchestrator.getSystemStatus()
      }));

      // Send event log
      ws.send(JSON.stringify({
        type: 'event-log',
        data: this.eventLog
      }));

      ws.on('close', () => {
        console.log('📊 Monitor client disconnected');
        this.clients.delete(ws);
      });
    });

    // Setup orchestrator event listeners
    this.setupEventListeners();

    // Start HTTP server
    this.server.listen(this.port, () => {
      console.log(`📊 Money Hunter Monitor running on http://localhost:${this.port}`);
      console.log(`📊 Open your browser to watch the system in action!`);
    });
  }

  /**
   * Setup event listeners for orchestrator
   */
  setupEventListeners() {
    const events = [
      'system-started', 'system-stopped',
      'scan-started', 'scan-completed',
      'opportunity-discovered', 'opportunity-validated',
      'opportunity-approved', 'opportunity-rejected',
      'execution-started', 'execution-completed',
      'analytics-update'
    ];

    events.forEach(event => {
      this.orchestrator.on(event, (data) => {
        this.handleEvent(event, data);
      });
    });
  }

  /**
   * Handle events and broadcast to clients
   */
  handleEvent(type, data) {
    const event = {
      type,
      data,
      timestamp: new Date().toISOString()
    };

    // Add to log
    this.eventLog.unshift(event);
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog.pop();
    }

    // Broadcast to all clients
    this.broadcast(event);
  }

  /**
   * Broadcast message to all connected clients
   */
  broadcast(message) {
    const data = JSON.stringify(message);
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  /**
   * Get monitoring dashboard HTML
   */
  getMonitorHTML() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>💰 Money Hunter - Real-Time Monitor</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #333;
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    header {
      background: white;
      border-radius: 15px;
      padding: 30px;
      margin-bottom: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
    h1 {
      font-size: 2.5em;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 10px;
    }
    .subtitle {
      color: #666;
      font-size: 1.1em;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }
    .stat-card {
      background: white;
      border-radius: 15px;
      padding: 25px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.1);
      transition: transform 0.3s, box-shadow 0.3s;
    }
    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
    .stat-label {
      font-size: 0.9em;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
    }
    .stat-value {
      font-size: 2.5em;
      font-weight: bold;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .stat-change {
      font-size: 0.9em;
      color: #10b981;
      margin-top: 5px;
    }
    .main-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 20px;
    }
    .card {
      background: white;
      border-radius: 15px;
      padding: 25px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.1);
    }
    .card-title {
      font-size: 1.3em;
      font-weight: 600;
      margin-bottom: 20px;
      color: #333;
    }
    .event-log {
      max-height: 600px;
      overflow-y: auto;
    }
    .event-item {
      padding: 15px;
      margin-bottom: 10px;
      border-radius: 10px;
      border-left: 4px solid #667eea;
      background: #f7fafc;
      animation: slideIn 0.3s ease-out;
    }
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    .event-type {
      font-weight: 600;
      color: #667eea;
      margin-bottom: 5px;
    }
    .event-time {
      font-size: 0.85em;
      color: #999;
    }
    .event-data {
      font-size: 0.95em;
      color: #555;
      margin-top: 8px;
      line-height: 1.5;
    }
    .status-indicator {
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-right: 8px;
      animation: pulse 2s infinite;
    }
    .status-active { background: #10b981; }
    .status-scanning { background: #f59e0b; }
    .status-executing { background: #3b82f6; }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .opportunities-list {
      max-height: 600px;
      overflow-y: auto;
    }
    .opportunity-item {
      padding: 15px;
      margin-bottom: 10px;
      border-radius: 10px;
      background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
      border-left: 4px solid #10b981;
    }
    .opp-title {
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
    }
    .opp-value {
      font-size: 1.2em;
      font-weight: bold;
      color: #10b981;
      margin: 8px 0;
    }
    .opp-status {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.85em;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .status-pending { background: #fef3c7; color: #92400e; }
    .status-validated { background: #dbeafe; color: #1e40af; }
    .status-approved { background: #d1fae5; color: #065f46; }
    .status-executing { background: #e0e7ff; color: #3730a3; }
    .status-completed { background: #10b981; color: white; }
    .pulse-animation {
      animation: colorPulse 2s infinite;
    }
    @keyframes colorPulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>💰 Money Hunter System</h1>
      <p class="subtitle">Real-Time Autonomous Revenue Detection & Execution</p>
    </header>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">System Status</div>
        <div class="stat-value" id="system-status">
          <span class="status-indicator status-active"></span>Active
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Opportunities</div>
        <div class="stat-value" id="total-opportunities">0</div>
        <div class="stat-change">+0 this hour</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Validated</div>
        <div class="stat-value" id="validated-opportunities">0</div>
        <div class="stat-change" id="validation-rate">0% approval rate</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Revenue</div>
        <div class="stat-value" id="total-revenue">$0</div>
        <div class="stat-change" id="revenue-change">+$0 today</div>
      </div>
    </div>

    <div class="main-content">
      <div class="card">
        <div class="card-title">📊 Live Event Stream</div>
        <div class="event-log" id="event-log"></div>
      </div>

      <div class="card">
        <div class="card-title">🎯 Active Opportunities</div>
        <div class="opportunities-list" id="opportunities-list"></div>
      </div>
    </div>
  </div>

  <script>
    let ws;
    let reconnectInterval = 3000;

    function connect() {
      ws = new WebSocket('ws://' + location.host);

      ws.onopen = () => {
        console.log('📊 Connected to Money Hunter Monitor');
        addEvent('system', 'Connected to monitoring server', new Date().toISOString());
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        handleMessage(message);
      };

      ws.onclose = () => {
        console.log('📊 Disconnected from monitor');
        addEvent('system', 'Disconnected - Reconnecting...', new Date().toISOString());
        setTimeout(connect, reconnectInterval);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    }

    function handleMessage(message) {
      if (message.type === 'initial-status') {
        updateStats(message.data);
        updateOpportunities(message.data.activeOpportunities || []);
      } else if (message.type === 'event-log') {
        message.data.forEach(event => {
          addEvent(event.type, formatEventData(event.data), event.timestamp);
        });
      } else {
        addEvent(message.type, formatEventData(message.data), message.timestamp);
        
        // Update stats periodically
        if (message.type.includes('opportunity') || message.type.includes('execution')) {
          fetchStatus();
        }
      }
    }

    function updateStats(status) {
      document.getElementById('system-status').innerHTML = 
        '<span class="status-indicator status-' + status.status + '"></span>' + 
        status.status.charAt(0).toUpperCase() + status.status.slice(1);
      
      document.getElementById('total-opportunities').textContent = status.stats.totalOpportunities || 0;
      document.getElementById('validated-opportunities').textContent = status.stats.validatedOpportunities || 0;
      document.getElementById('total-revenue').textContent = '$' + (status.stats.totalRevenue || 0).toFixed(0);
      
      const validationRate = status.stats.totalOpportunities > 0 ? 
        ((status.stats.validatedOpportunities / status.stats.totalOpportunities) * 100).toFixed(0) : 0;
      document.getElementById('validation-rate').textContent = validationRate + '% approval rate';
    }

    function updateOpportunities(opportunities) {
      const list = document.getElementById('opportunities-list');
      
      if (opportunities.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No active opportunities</p>';
        return;
      }

      list.innerHTML = opportunities.map(opp => \`
        <div class="opportunity-item pulse-animation">
          <div class="opp-title">\${opp.title}</div>
          <div class="opp-value">$\${opp.estimatedValue || 0}</div>
          <div class="opp-status status-\${opp.status}">\${opp.status}</div>
          <div style="font-size: 0.85em; color: #666; margin-top: 8px;">
            Source: \${opp.source}
          </div>
        </div>
      \`).join('');
    }

    function addEvent(type, data, timestamp) {
      const log = document.getElementById('event-log');
      const event = document.createElement('div');
      event.className = 'event-item';
      
      const time = new Date(timestamp).toLocaleTimeString();
      
      event.innerHTML = \`
        <div class="event-type">\${formatEventType(type)}</div>
        <div class="event-time">\${time}</div>
        <div class="event-data">\${data}</div>
      \`;
      
      log.insertBefore(event, log.firstChild);
      
      // Keep only last 50 events
      while (log.children.length > 50) {
        log.removeChild(log.lastChild);
      }
    }

    function formatEventType(type) {
      const emoji = {
        'system-started': '🚀',
        'scan-started': '🔍',
        'scan-completed': '✅',
        'opportunity-discovered': '💰',
        'opportunity-validated': '🎯',
        'opportunity-approved': '👍',
        'opportunity-rejected': '❌',
        'execution-started': '⚡',
        'execution-completed': '✅',
        'analytics-update': '📊'
      }[type] || '📝';
      
      return emoji + ' ' + type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    function formatEventData(data) {
      if (!data) return 'No data';
      
      if (data.title) {
        return data.title + (data.estimatedValue ? ' ($' + data.estimatedValue + ')' : '');
      }
      
      if (data.opportunitiesFound !== undefined) {
        return 'Found ' + data.opportunitiesFound + ' new opportunities';
      }
      
      if (typeof data === 'object') {
        return JSON.stringify(data, null, 2).substring(0, 200);
      }
      
      return String(data);
    }

    async function fetchStatus() {
      try {
        const response = await fetch('/status');
        const status = await response.json();
        updateStats(status);
        updateOpportunities(status.activeOpportunities || []);
      } catch (error) {
        console.error('Failed to fetch status:', error);
      }
    }

    // Connect on load
    connect();

    // Refresh stats every 5 seconds
    setInterval(fetchStatus, 5000);
  </script>
</body>
</html>
    `;
  }

  /**
   * Stop monitoring server
   */
  async stop() {
    if (this.wss) {
      this.wss.close();
    }
    if (this.server) {
      this.server.close();
    }
    console.log('📊 Monitor stopped');
  }
}

module.exports = { MoneyHunterMonitor };
