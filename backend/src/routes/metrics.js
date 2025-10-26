/**
 * Metrics Routes
 * Exposes Prometheus and JSON metrics
 * 
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-22
 */

const express = require('express');
const router = express.Router();
const metricsService = require('../services/metricsService');

/**
 * GET /api/metrics
 * Prometheus metrics endpoint
 */
router.get('/metrics', async (req, res) => {
  try {
    const metrics = await metricsService.exposePrometheus();
    res.set('Content-Type', metricsService.contentType);
    res.send(metrics);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/metrics/json
 * JSON metrics endpoint (for dashboards)
 */
router.get('/metrics/json', async (req, res) => {
  try {
    const snapshot = await metricsService.snapshot();
    res.json({
      success: true,
      ...snapshot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/metrics/dashboard
 * Simple HTML dashboard for metrics visualization
 */
router.get('/metrics/dashboard', async (req, res) => {
  try {
    const snapshot = await metricsService.snapshot();
    const html = generateDashboardHTML(snapshot);
    res.set('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    res.status(500).send(`<h1>Error loading dashboard</h1><p>${error.message}</p>`);
  }
});

/**
 * POST /api/metrics/reset
 * Reset all metrics (admin only)
 */
router.post('/metrics/reset', (req, res) => {
  try {
    metricsService.reset();
    res.json({
      success: true,
      message: 'All metrics reset'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Generate HTML dashboard
 */
function generateDashboardHTML(snapshot) {
  const metrics = snapshot.metrics || [];
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Amrikyy Agent - Metrics Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #333;
      padding: 20px;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    header {
      background: white;
      padding: 30px;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }
    h1 {
      color: #667eea;
      font-size: 2.5em;
      margin-bottom: 10px;
    }
    .timestamp {
      color: #666;
      font-size: 0.9em;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .card {
      background: white;
      padding: 25px;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      transition: transform 0.3s ease;
    }
    .card:hover {
      transform: translateY(-5px);
    }
    .card h2 {
      color: #667eea;
      font-size: 1.2em;
      margin-bottom: 15px;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
    }
    .metric {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }
    .metric:last-child {
      border-bottom: none;
    }
    .metric-name {
      font-weight: 500;
      color: #555;
    }
    .metric-value {
      font-weight: bold;
      color: #667eea;
    }
    .refresh-btn {
      background: #667eea;
      color: white;
      border: none;
      padding: 12px 30px;
      border-radius: 8px;
      font-size: 1em;
      cursor: pointer;
      transition: background 0.3s ease;
    }
    .refresh-btn:hover {
      background: #764ba2;
    }
    .footer {
      text-align: center;
      color: white;
      margin-top: 30px;
      padding: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🚀 Amrikyy Agent - Metrics Dashboard</h1>
      <p class="timestamp">Last Updated: ${snapshot.timestamp}</p>
      <button class="refresh-btn" onclick="location.reload()">🔄 Refresh</button>
    </header>
    
    <div class="grid">
      ${generateMetricCards(metrics)}
    </div>
    
    <footer class="footer">
      <p>Amrikyy Agent v2.0.0 | Powered by Prometheus</p>
    </footer>
  </div>
  
  <script>
    // Auto-refresh every 30 seconds
    setTimeout(() => location.reload(), 30000);
  </script>
</body>
</html>
  `;
}

/**
 * Generate metric cards HTML
 */
function generateMetricCards(metrics) {
  const grouped = groupMetricsByType(metrics);
  let html = '';
  
  for (const [type, typeMetrics] of Object.entries(grouped)) {
    html += `
      <div class="card">
        <h2>${formatTypeName(type)}</h2>
        ${typeMetrics.map(m => `
          <div class="metric">
            <span class="metric-name">${m.name}</span>
            <span class="metric-value">${formatValue(m)}</span>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  return html || '<div class="card"><p>No metrics available</p></div>';
}

/**
 * Group metrics by type
 */
function groupMetricsByType(metrics) {
  const grouped = {};
  
  for (const metric of metrics) {
    const type = metric.name.split('_')[0] || 'other';
    if (!grouped[type]) {
      grouped[type] = [];
    }
    grouped[type].push(metric);
  }
  
  return grouped;
}

/**
 * Format type name
 */
function formatTypeName(type) {
  return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
}

/**
 * Format metric value
 */
function formatValue(metric) {
  if (metric.type === 'counter') {
    return metric.values?.[0]?.value || 0;
  }
  if (metric.type === 'gauge') {
    return metric.values?.[0]?.value || 0;
  }
  if (metric.type === 'histogram') {
    const sum = metric.values?.find(v => v.labels?.le === '+Inf')?.value || 0;
    return sum.toFixed(2);
  }
  return 'N/A';
}

module.exports = router;
