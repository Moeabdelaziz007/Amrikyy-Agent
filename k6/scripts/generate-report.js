#!/usr/bin/env node

/**
 * Load Test Report Generator
 * 
 * Generates HTML summary reports from k6 JSON output
 * 
 * Usage: node generate-report.js <input.json> <output.html>
 */

const fs = require('fs');
const path = require('path');

if (process.argv.length < 4) {
  console.error('Usage: node generate-report.js <input.json> <output.html>');
  process.exit(1);
}

const inputFile = process.argv[2];
const outputFile = process.argv[3];

// Read k6 JSON output
const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

// Extract metrics
const metrics = data.metrics || {};
const state = data.state || {};

function formatDuration(ms) {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  return `${(ms / 60000).toFixed(2)}min`;
}

function formatNumber(num) {
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

function getMetricValue(metric, key) {
  return metric && metric.values && metric.values[key] !== undefined
    ? metric.values[key]
    : 0;
}

// Generate HTML report
const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Amadeus Flight API Load Test Report</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      color: #333;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    
    .header h1 {
      font-size: 32px;
      margin-bottom: 10px;
    }
    
    .header p {
      opacity: 0.9;
      font-size: 16px;
    }
    
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      padding: 30px;
      background: #f8f9fa;
    }
    
    .metric-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      text-align: center;
    }
    
    .metric-card .label {
      font-size: 12px;
      text-transform: uppercase;
      color: #6c757d;
      margin-bottom: 8px;
      font-weight: 600;
    }
    
    .metric-card .value {
      font-size: 28px;
      font-weight: bold;
      color: #667eea;
    }
    
    .metric-card .subvalue {
      font-size: 14px;
      color: #6c757d;
      margin-top: 4px;
    }
    
    .metric-card.success { border-left: 4px solid #28a745; }
    .metric-card.warning { border-left: 4px solid #ffc107; }
    .metric-card.danger { border-left: 4px solid #dc3545; }
    .metric-card.info { border-left: 4px solid #17a2b8; }
    
    .section {
      padding: 30px;
      border-top: 1px solid #e9ecef;
    }
    
    .section h2 {
      font-size: 24px;
      margin-bottom: 20px;
      color: #495057;
    }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }
    
    .metric-group {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
    }
    
    .metric-group h3 {
      font-size: 16px;
      margin-bottom: 15px;
      color: #495057;
    }
    
    .metric-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #dee2e6;
    }
    
    .metric-row:last-child {
      border-bottom: none;
    }
    
    .metric-row .name {
      color: #6c757d;
      font-size: 14px;
    }
    
    .metric-row .val {
      font-weight: 600;
      color: #495057;
      font-size: 14px;
    }
    
    .threshold {
      background: white;
      padding: 15px;
      border-radius: 8px;
      margin-top: 10px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .threshold.pass {
      border-left: 4px solid #28a745;
    }
    
    .threshold.fail {
      border-left: 4px solid #dc3545;
    }
    
    .threshold .icon {
      font-size: 20px;
    }
    
    .threshold .text {
      flex: 1;
      font-size: 14px;
    }
    
    .footer {
      background: #f8f9fa;
      padding: 20px 30px;
      text-align: center;
      color: #6c757d;
      font-size: 14px;
    }
    
    .chart-placeholder {
      background: #e9ecef;
      height: 200px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6c757d;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 Amadeus Flight API Load Test Report</h1>
      <p>Generated on ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="summary">
      <div class="metric-card info">
        <div class="label">Test Duration</div>
        <div class="value">${formatDuration(state.testRunDurationMs || 0)}</div>
      </div>
      
      <div class="metric-card info">
        <div class="label">Total Requests</div>
        <div class="value">${formatNumber(getMetricValue(metrics.http_reqs, 'count'))}</div>
        <div class="subvalue">${formatNumber(getMetricValue(metrics.http_reqs, 'rate'))}/s</div>
      </div>
      
      <div class="metric-card ${getMetricValue(metrics.http_req_failed, 'rate') < 0.05 ? 'success' : 'danger'}">
        <div class="label">Error Rate</div>
        <div class="value">${(getMetricValue(metrics.http_req_failed, 'rate') * 100).toFixed(2)}%</div>
      </div>
      
      <div class="metric-card ${getMetricValue(metrics.success_rate, 'rate') > 0.9 ? 'success' : 'warning'}">
        <div class="label">Success Rate</div>
        <div class="value">${(getMetricValue(metrics.success_rate, 'rate') * 100).toFixed(2)}%</div>
      </div>
      
      <div class="metric-card info">
        <div class="label">Avg Response Time</div>
        <div class="value">${formatDuration(getMetricValue(metrics.http_req_duration, 'avg'))}</div>
      </div>
      
      <div class="metric-card ${getMetricValue(metrics.http_req_duration, 'p(95)') < 8000 ? 'success' : 'warning'}">
        <div class="label">P95 Response Time</div>
        <div class="value">${formatDuration(getMetricValue(metrics.http_req_duration, 'p(95)'))}</div>
      </div>
    </div>
    
    <div class="section">
      <h2>📊 Detailed Metrics</h2>
      
      <div class="metrics-grid">
        <div class="metric-group">
          <h3>HTTP Requests</h3>
          <div class="metric-row">
            <span class="name">Total Count</span>
            <span class="val">${formatNumber(getMetricValue(metrics.http_reqs, 'count'))}</span>
          </div>
          <div class="metric-row">
            <span class="name">Request Rate</span>
            <span class="val">${formatNumber(getMetricValue(metrics.http_reqs, 'rate'))}/s</span>
          </div>
          <div class="metric-row">
            <span class="name">Failed Requests</span>
            <span class="val">${(getMetricValue(metrics.http_req_failed, 'rate') * 100).toFixed(2)}%</span>
          </div>
        </div>
        
        <div class="metric-group">
          <h3>Response Times</h3>
          <div class="metric-row">
            <span class="name">Average</span>
            <span class="val">${formatDuration(getMetricValue(metrics.http_req_duration, 'avg'))}</span>
          </div>
          <div class="metric-row">
            <span class="name">Median (p50)</span>
            <span class="val">${formatDuration(getMetricValue(metrics.http_req_duration, 'p(50)'))}</span>
          </div>
          <div class="metric-row">
            <span class="name">p90</span>
            <span class="val">${formatDuration(getMetricValue(metrics.http_req_duration, 'p(90)'))}</span>
          </div>
          <div class="metric-row">
            <span class="name">p95</span>
            <span class="val">${formatDuration(getMetricValue(metrics.http_req_duration, 'p(95)'))}</span>
          </div>
          <div class="metric-row">
            <span class="name">p99</span>
            <span class="val">${formatDuration(getMetricValue(metrics.http_req_duration, 'p(99)'))}</span>
          </div>
          <div class="metric-row">
            <span class="name">Max</span>
            <span class="val">${formatDuration(getMetricValue(metrics.http_req_duration, 'max'))}</span>
          </div>
        </div>
        
        <div class="metric-group">
          <h3>Amadeus Flight Search</h3>
          <div class="metric-row">
            <span class="name">Total Searches</span>
            <span class="val">${formatNumber(getMetricValue(metrics.flight_search_requests, 'count'))}</span>
          </div>
          <div class="metric-row">
            <span class="name">Avg Duration</span>
            <span class="val">${formatDuration(getMetricValue(metrics.amadeus_flight_search_duration, 'avg'))}</span>
          </div>
          <div class="metric-row">
            <span class="name">p95 Duration</span>
            <span class="val">${formatDuration(getMetricValue(metrics.amadeus_flight_search_duration, 'p(95)'))}</span>
          </div>
        </div>
        
        <div class="metric-group">
          <h3>Rate Limiting</h3>
          <div class="metric-row">
            <span class="name">Rate Limit Hits</span>
            <span class="val">${formatNumber(getMetricValue(metrics.rate_limit_hits, 'count'))}</span>
          </div>
          <div class="metric-row">
            <span class="name">API Errors</span>
            <span class="val">${formatNumber(getMetricValue(metrics.api_errors, 'count'))}</span>
          </div>
          <div class="metric-row">
            <span class="name">Timeout Errors</span>
            <span class="val">${formatNumber(getMetricValue(metrics.timeout_errors, 'count'))}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="section">
      <h2>✓ Threshold Results</h2>
      ${Object.entries(metrics)
        .filter(([_, metric]) => metric.thresholds)
        .map(([name, metric]) => 
          Object.entries(metric.thresholds || {})
            .map(([threshold, result]) => `
              <div class="threshold ${result.ok ? 'pass' : 'fail'}">
                <span class="icon">${result.ok ? '✓' : '✗'}</span>
                <span class="text"><strong>${name}</strong>: ${threshold}</span>
              </div>
            `).join('')
        ).join('')}
    </div>
    
    <div class="footer">
      <p>Report generated by Amadeus Load Test Runner</p>
      <p>Amrikyy AI Automation Platform - Travel Services</p>
    </div>
  </div>
</body>
</html>
`;

// Write HTML report
fs.writeFileSync(outputFile, html, 'utf8');

console.log(`✓ Report generated: ${outputFile}`);

