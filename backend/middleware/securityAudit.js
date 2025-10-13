/**
 * Security Audit Middleware
 * Comprehensive security monitoring and threat detection
 */

const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

class SecurityAudit {
  constructor() {
    this.threats = [];
    this.blockedIPs = new Set();
    this.suspiciousActivity = new Map();
    this.securityMetrics = {
      totalRequests: 0,
      blockedRequests: 0,
      suspiciousRequests: 0,
      securityAlerts: 0
    };
  }

  /**
   * Main security audit middleware
   */
  auditMiddleware() {
    return (req, res, next) => {
      this.securityMetrics.totalRequests++;
      
      // Check for threats
      const threatLevel = this.assessThreatLevel(req);
      
      if (threatLevel === 'critical') {
        this.blockRequest(req, res, 'Critical threat detected');
        return;
      }
      
      if (threatLevel === 'high') {
        this.logSuspiciousActivity(req, 'High threat level');
        this.addSecurityAlert('High threat detected', req);
      }
      
      // Add security headers
      this.addSecurityHeaders(res);
      
      // Log request
      this.logRequest(req);
      
      next();
    };
  }

  /**
   * Assess threat level of request
   */
  assessThreatLevel(req) {
    let threatScore = 0;
    
    // Check IP reputation
    if (this.isBlockedIP(req.ip)) {
      return 'critical';
    }
    
    // Check for suspicious patterns
    if (this.detectSQLInjection(req)) {
      threatScore += 50;
    }
    
    if (this.detectXSS(req)) {
      threatScore += 40;
    }
    
    if (this.detectPathTraversal(req)) {
      threatScore += 45;
    }
    
    if (this.detectBruteForce(req)) {
      threatScore += 35;
    }
    
    if (this.detectBotTraffic(req)) {
      threatScore += 25;
    }
    
    // Check request frequency
    if (this.isHighFrequency(req)) {
      threatScore += 20;
    }
    
    // Check for suspicious user agent
    if (this.isSuspiciousUserAgent(req)) {
      threatScore += 15;
    }
    
    // Determine threat level
    if (threatScore >= 80) return 'critical';
    if (threatScore >= 60) return 'high';
    if (threatScore >= 40) return 'medium';
    if (threatScore >= 20) return 'low';
    return 'safe';
  }

  /**
   * Detect SQL injection attempts
   */
  detectSQLInjection(req) {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|EXECUTE)\b)/i,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
      /(\b(OR|AND)\s+['"]\s*=\s*['"])/i,
      /(\bUNION\s+SELECT\b)/i,
      /(\bDROP\s+TABLE\b)/i,
      /(\bINSERT\s+INTO\b)/i,
      /(\bDELETE\s+FROM\b)/i
    ];
    
    const searchString = JSON.stringify(req.query) + JSON.stringify(req.body) + req.url;
    
    return sqlPatterns.some(pattern => pattern.test(searchString));
  }

  /**
   * Detect XSS attempts
   */
  detectXSS(req) {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /<object[^>]*>.*?<\/object>/gi,
      /<embed[^>]*>.*?<\/embed>/gi,
      /<link[^>]*>.*?<\/link>/gi,
      /<meta[^>]*>.*?<\/meta>/gi
    ];
    
    const searchString = JSON.stringify(req.query) + JSON.stringify(req.body) + req.url;
    
    return xssPatterns.some(pattern => pattern.test(searchString));
  }

  /**
   * Detect path traversal attempts
   */
  detectPathTraversal(req) {
    const pathPatterns = [
      /\.\.\//g,
      /\.\.\\/g,
      /\.\.%2f/gi,
      /\.\.%5c/gi,
      /\.\.%252f/gi,
      /\.\.%255c/gi
    ];
    
    const searchString = req.url + JSON.stringify(req.query);
    
    return pathPatterns.some(pattern => pattern.test(searchString));
  }

  /**
   * Detect brute force attempts
   */
  detectBruteForce(req) {
    const ip = req.ip;
    const now = Date.now();
    const window = 5 * 60 * 1000; // 5 minutes
    
    if (!this.suspiciousActivity.has(ip)) {
      this.suspiciousActivity.set(ip, []);
    }
    
    const requests = this.suspiciousActivity.get(ip);
    
    // Remove old requests
    const recentRequests = requests.filter(time => now - time < window);
    recentRequests.push(now);
    
    this.suspiciousActivity.set(ip, recentRequests);
    
    // Check if too many requests
    return recentRequests.length > 20; // 20 requests in 5 minutes
  }

  /**
   * Detect bot traffic
   */
  detectBotTraffic(req) {
    const userAgent = req.get('User-Agent') || '';
    const botPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i,
      /java/i,
      /php/i
    ];
    
    return botPatterns.some(pattern => pattern.test(userAgent));
  }

  /**
   * Check if IP is blocked
   */
  isBlockedIP(ip) {
    return this.blockedIPs.has(ip);
  }

  /**
   * Check if request is high frequency
   */
  isHighFrequency(req) {
    const ip = req.ip;
    const now = Date.now();
    const window = 60 * 1000; // 1 minute
    
    if (!this.suspiciousActivity.has(ip)) {
      this.suspiciousActivity.set(ip, []);
    }
    
    const requests = this.suspiciousActivity.get(ip);
    const recentRequests = requests.filter(time => now - time < window);
    
    return recentRequests.length > 100; // 100 requests per minute
  }

  /**
   * Check if user agent is suspicious
   */
  isSuspiciousUserAgent(req) {
    const userAgent = req.get('User-Agent') || '';
    
    // Check for empty or very short user agents
    if (userAgent.length < 10) return true;
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /^$/,
      /^Mozilla\/5\.0$/,
      /^curl/i,
      /^wget/i,
      /^python/i,
      /^java/i
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }

  /**
   * Block request
   */
  blockRequest(req, res, reason) {
    this.securityMetrics.blockedRequests++;
    this.blockedIPs.add(req.ip);
    
    res.status(403).json({
      error: 'Request blocked',
      reason: reason,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log suspicious activity
   */
  logSuspiciousActivity(req, reason) {
    this.securityMetrics.suspiciousRequests++;
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
      reason: reason,
      headers: req.headers
    };
    
    console.warn('Suspicious activity detected:', logEntry);
  }

  /**
   * Add security alert
   */
  addSecurityAlert(message, req) {
    this.securityMetrics.securityAlerts++;
    
    const alert = {
      id: crypto.randomUUID(),
      message,
      severity: 'high',
      timestamp: new Date().toISOString(),
      ip: req.ip,
      url: req.url,
      method: req.method
    };
    
    this.threats.push(alert);
    
    // Keep only last 1000 alerts
    if (this.threats.length > 1000) {
      this.threats = this.threats.slice(-1000);
    }
  }

  /**
   * Add security headers
   */
  addSecurityHeaders(res) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  /**
   * Log request
   */
  logRequest(req) {
    // In production, this would log to a secure logging service
    console.log(`Security audit: ${req.method} ${req.url} from ${req.ip}`);
  }

  /**
   * Get security metrics
   */
  getSecurityMetrics() {
    return {
      ...this.securityMetrics,
      blockedIPs: this.blockedIPs.size,
      activeThreats: this.threats.filter(t => 
        new Date(t.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length,
      threatLevel: this.calculateOverallThreatLevel()
    };
  }

  /**
   * Calculate overall threat level
   */
  calculateOverallThreatLevel() {
    const recentThreats = this.threats.filter(t => 
      new Date(t.timestamp) > new Date(Date.now() - 60 * 60 * 1000) // Last hour
    );
    
    if (recentThreats.length > 10) return 'critical';
    if (recentThreats.length > 5) return 'high';
    if (recentThreats.length > 2) return 'medium';
    if (recentThreats.length > 0) return 'low';
    return 'safe';
  }

  /**
   * Get recent threats
   */
  getRecentThreats(hours = 24) {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.threats.filter(t => new Date(t.timestamp) > cutoff);
  }

  /**
   * Clear old data
   */
  cleanup() {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days
    this.threats = this.threats.filter(t => new Date(t.timestamp) > cutoff);
    
    // Clear old suspicious activity
    for (const [ip, requests] of this.suspiciousActivity.entries()) {
      const recentRequests = requests.filter(time => 
        new Date(time) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      );
      
      if (recentRequests.length === 0) {
        this.suspiciousActivity.delete(ip);
      } else {
        this.suspiciousActivity.set(ip, recentRequests);
      }
    }
  }
}

module.exports = SecurityAudit;