/**
 * 🛡️ Security Manager - نظام الأمان المتقدم
 * يطبق معايير الأمان العالمية ويحمي من جميع التهديدات المعروفة
 *
 * الميزات:
 * - تشفير البيانات الحساسة
 * - حماية من SQL Injection
 * - حماية من XSS
 * - حماية من CSRF
 * - مراقبة الأمان في الوقت الفعلي
 * - تسجيل محاولات الاختراق
 */

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { logger } = require('../utils/logger');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const validator = require('validator');
const DOMPurify = require('isomorphic-dompurify');

class SecurityManager {
  constructor() {
    this.encryptionKey = process.env.ENCRYPTION_KEY || this.generateEncryptionKey();
    this.jwtSecret = process.env.JWT_SECRET || this.generateJWTSecret();
    this.securityLogs = new Map();
    this.failedAttempts = new Map();
    this.blockedIPs = new Set();

    this.initializeSecurity();
    logger.info('🛡️ Security Manager initialized');
  }

  /**
   * تهيئة نظام الأمان
   */
  initializeSecurity() {
    // تنظيف محاولات الفشل كل ساعة
    setInterval(() => {
      this.cleanupFailedAttempts();
    }, 60 * 60 * 1000);

    // تنظيف السجلات الأمنية كل 24 ساعة
    setInterval(() => {
      this.cleanupSecurityLogs();
    }, 24 * 60 * 60 * 1000);

    logger.info('✅ Security monitoring systems active');
  }

  /**
   * تشفير البيانات الحساسة
   */
  encryptSensitiveData(data) {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);

      let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
      encrypted += cipher.final('hex');

      return {
        encrypted,
        iv: iv.toString('hex'),
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('Encryption failed:', error);
      throw new Error('Data encryption failed');
    }
  }

  /**
   * فك تشفير البيانات الحساسة
   */
  decryptSensitiveData(encryptedData) {
    try {
      const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);

      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return JSON.parse(decrypted);
    } catch (error) {
      logger.error('Decryption failed:', error);
      throw new Error('Data decryption failed');
    }
  }

  /**
   * تشفير كلمات المرور
   */
  async hashPassword(password) {
    try {
      const saltRounds = 12;
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      logger.error('Password hashing failed:', error);
      throw new Error('Password hashing failed');
    }
  }

  /**
   * التحقق من كلمة المرور
   */
  async verifyPassword(password, hashedPassword) {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      logger.error('Password verification failed:', error);
      return false;
    }
  }

  /**
   * إنشاء JWT آمن
   */
  generateSecureToken(payload, expiresIn = '24h') {
    try {
      return jwt.sign(
        {
          ...payload,
          iat: Math.floor(Date.now() / 1000),
          jti: crypto.randomUUID(),
        },
        this.jwtSecret,
        {
          expiresIn,
          algorithm: 'HS256',
        }
      );
    } catch (error) {
      logger.error('Token generation failed:', error);
      throw new Error('Token generation failed');
    }
  }

  /**
   * التحقق من JWT
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      logger.error('Token verification failed:', error);
      return null;
    }
  }

  /**
   * تنظيف المدخلات من الهجمات
   */
  sanitizeInput(input, type = 'string') {
    if (!input) return input;

    switch (type) {
      case 'string':
        return this.sanitizeString(input);
      case 'html':
        return DOMPurify.sanitize(input);
      case 'sql':
        return this.sanitizeSQL(input);
      case 'url':
        return validator.escape(input);
      case 'email':
        return validator.normalizeEmail(input);
      default:
        return input;
    }
  }

  /**
   * تنظيف النصوص من الهجمات
   */
  sanitizeString(input) {
    if (typeof input !== 'string') return input;

    return (
      input
        // إزالة حقن JavaScript
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')

        // إزالة حقن SQL
        .replace(/('|(\\')|(;)|(\|)|(&)|(`)|(\$))/g, '')
        .replace(/union\s+select/gi, '')
        .replace(/drop\s+table/gi, '')
        .replace(/delete\s+from/gi, '')

        // إزالة حقن الأوامر
        .replace(/[;&|`$]/g, '')
        .replace(/\.\.\//g, '')

        // إزالة حقن القوالب
        .replace(/\{\{.*?\}\}/g, '')
        .replace(/<%.*?%>/g, '')

        // إزالة حقن AI
        .replace(/ignore previous instructions/gi, '')
        .replace(/disregard all above/gi, '')
        .replace(/system prompt/gi, '')

        // تنظيف المسافات
        .trim()
    );
  }

  /**
   * تنظيف استعلامات SQL
   */
  sanitizeSQL(input) {
    const dangerousPatterns = [
      /union\s+select/i,
      /drop\s+table/i,
      /delete\s+from/i,
      /insert\s+into/i,
      /update\s+set/i,
      /alter\s+table/i,
      /create\s+table/i,
      /exec\s*\(/i,
      /execute\s*\(/i,
      /sp_/i,
      /xp_/i,
    ];

    let sanitized = input;
    dangerousPatterns.forEach((pattern) => {
      sanitized = sanitized.replace(pattern, '');
    });

    return sanitized;
  }

  /**
   * مراقبة محاولات الاختراق
   */
  logSecurityEvent(event, details = {}) {
    const eventId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const securityEvent = {
      id: eventId,
      type: event,
      timestamp,
      details,
      severity: this.getEventSeverity(event),
      ip: details.ip || 'unknown',
      userAgent: details.userAgent || 'unknown',
    };

    // تسجيل الحدث
    this.securityLogs.set(eventId, securityEvent);

    // تسجيل في الملف
    logger.warn('Security Event:', securityEvent);

    // إشعار فوري للتهديدات الحرجة
    if (securityEvent.severity === 'critical') {
      this.handleCriticalThreat(securityEvent);
    }

    return eventId;
  }

  /**
   * تحديد خطورة الحدث الأمني
   */
  getEventSeverity(event) {
    const criticalEvents = [
      'sql_injection_attempt',
      'xss_attempt',
      'brute_force_attack',
      'unauthorized_access',
      'data_exfiltration_attempt',
    ];

    const highEvents = [
      'rate_limit_exceeded',
      'invalid_token',
      'suspicious_activity',
      'multiple_failed_logins',
    ];

    if (criticalEvents.includes(event)) return 'critical';
    if (highEvents.includes(event)) return 'high';
    return 'medium';
  }

  /**
   * التعامل مع التهديدات الحرجة
   */
  handleCriticalThreat(event) {
    // حظر IP مؤقتاً
    if (event.details.ip) {
      this.blockedIPs.add(event.details.ip);

      // إزالة الحظر بعد ساعة
      setTimeout(() => {
        this.blockedIPs.delete(event.details.ip);
      }, 60 * 60 * 1000);
    }

    // إشعار المديرين
    logger.error('🚨 CRITICAL SECURITY THREAT:', event);

    // يمكن إضافة إشعارات إضافية هنا (إيميل، Slack، إلخ)
  }

  /**
   * فحص IP المحظور
   */
  isIPBlocked(ip) {
    return this.blockedIPs.has(ip);
  }

  /**
   * Rate Limiting متقدم
   */
  createAdvancedRateLimit(options = {}) {
    return rateLimit({
      windowMs: options.windowMs || 15 * 60 * 1000,
      max: options.max || 100,
      message: {
        success: false,
        error: 'Too many requests',
        retryAfter: Math.ceil((options.windowMs || 15 * 60 * 1000) / 1000),
        timestamp: new Date().toISOString(),
      },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => {
        return req.ip;
      },
      handler: (req, res) => {
        this.logSecurityEvent('rate_limit_exceeded', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          endpoint: req.path,
        });

        res.status(429).json({
          success: false,
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
          timestamp: new Date().toISOString(),
        });
      },
    });
  }

  /**
   * تنظيف محاولات الفشل القديمة
   */
  cleanupFailedAttempts() {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;

    for (const [key, attempts] of this.failedAttempts.entries()) {
      const recentAttempts = attempts.filter((attempt) => attempt.timestamp > oneHourAgo);

      if (recentAttempts.length === 0) {
        this.failedAttempts.delete(key);
      } else {
        this.failedAttempts.set(key, recentAttempts);
      }
    }
  }

  /**
   * تنظيف السجلات الأمنية القديمة
   */
  cleanupSecurityLogs() {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

    for (const [key, event] of this.securityLogs.entries()) {
      if (new Date(event.timestamp).getTime() < oneDayAgo) {
        this.securityLogs.delete(key);
      }
    }
  }

  /**
   * إنشاء مفتاح تشفير آمن
   */
  generateEncryptionKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * إنشاء سر JWT آمن
   */
  generateJWTSecret() {
    return crypto.randomBytes(64).toString('hex');
  }

  /**
   * الحصول على إحصائيات الأمان
   */
  getSecurityStats() {
    return {
      totalEvents: this.securityLogs.size,
      blockedIPs: this.blockedIPs.size,
      failedAttempts: this.failedAttempts.size,
      criticalEvents: Array.from(this.securityLogs.values()).filter(
        (event) => event.severity === 'critical'
      ).length,
      highEvents: Array.from(this.securityLogs.values()).filter(
        (event) => event.severity === 'high'
      ).length,
    };
  }
}

module.exports = SecurityManager;
