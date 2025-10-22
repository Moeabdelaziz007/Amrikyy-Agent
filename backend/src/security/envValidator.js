/**
 * 🔒 Environment Validator - مدقق البيئة الآمن
 * يتحقق من صحة متغيرات البيئة ويحمي من تسريب البيانات الحساسة
 */

const crypto = require('crypto');
const { logger } = require('../utils/logger');

class EnvironmentValidator {
  constructor() {
    this.requiredVars = new Set();
    this.sensitiveVars = new Set();
    this.validatedVars = new Map();
    
    this.initializeValidation();
  }

  /**
   * تهيئة قواعد التحقق
   */
  initializeValidation() {
    // المتغيرات المطلوبة
    this.requiredVars = new Set([
      'NODE_ENV',
      'PORT',
      'JWT_SECRET',
      'ENCRYPTION_KEY'
    ]);

    // المتغيرات الحساسة
    this.sensitiveVars = new Set([
      'JWT_SECRET',
      'ENCRYPTION_KEY',
      'DATABASE_URL',
      'REDIS_URL',
      'API_KEYS',
      'TELEGRAM_BOT_TOKEN',
      'STRIPE_SECRET_KEY',
      'PAYPAL_CLIENT_SECRET'
    ]);

    logger.info('🔒 Environment Validator initialized');
  }

  /**
   * التحقق من جميع متغيرات البيئة
   */
  validate() {
    const errors = [];
    const warnings = [];

    // التحقق من المتغيرات المطلوبة
    for (const varName of this.requiredVars) {
      if (!process.env[varName]) {
        errors.push(`Required environment variable missing: ${varName}`);
      }
    }

    // التحقق من المتغيرات الحساسة
    for (const varName of this.sensitiveVars) {
      if (process.env[varName]) {
        const validation = this.validateSensitiveVar(varName, process.env[varName]);
        if (validation.error) {
          errors.push(validation.error);
        } else if (validation.warning) {
          warnings.push(validation.warning);
        }
      }
    }

    // التحقق من أمان المتغيرات
    this.checkForExposedSecrets();

    // تسجيل النتائج
    if (errors.length > 0) {
      logger.error('❌ Environment validation failed:', errors);
      throw new Error(`Environment validation failed: ${errors.join(', ')}`);
    }

    if (warnings.length > 0) {
      logger.warn('⚠️ Environment validation warnings:', warnings);
    }

    logger.info('✅ Environment validation passed');
    return { valid: true, warnings };
  }

  /**
   * التحقق من متغير حساس
   */
  validateSensitiveVar(varName, value) {
    const validation = {
      error: null,
      warning: null
    };

    // التحقق من طول المفتاح
    if (varName.includes('SECRET') || varName.includes('KEY')) {
      if (value.length < 32) {
        validation.error = `${varName} is too short (minimum 32 characters)`;
      } else if (value.length < 64) {
        validation.warning = `${varName} should be longer for better security (recommended 64+ characters)`;
      }
    }

    // التحقق من قوة كلمة المرور
    if (varName.includes('PASSWORD')) {
      if (!this.isStrongPassword(value)) {
        validation.error = `${varName} is not strong enough`;
      }
    }

    // التحقق من صحة URL
    if (varName.includes('URL')) {
      if (!this.isValidURL(value)) {
        validation.error = `${varName} is not a valid URL`;
      }
    }

    // التحقق من صحة البريد الإلكتروني
    if (varName.includes('EMAIL')) {
      if (!this.isValidEmail(value)) {
        validation.error = `${varName} is not a valid email`;
      }
    }

    return validation;
  }

  /**
   * فحص تسريب الأسرار
   */
  checkForExposedSecrets() {
    const dangerousPatterns = [
      /password\s*=\s*['"]\w+['"]/gi,
      /secret\s*=\s*['"]\w+['"]/gi,
      /key\s*=\s*['"]\w+['"]/gi,
      /token\s*=\s*['"]\w+['"]/gi,
      /api[_-]?key\s*=\s*['"]\w+['"]/gi
    ];

    // فحص متغيرات البيئة
    for (const [key, value] of Object.entries(process.env)) {
      if (typeof value === 'string') {
        for (const pattern of dangerousPatterns) {
          if (pattern.test(value)) {
            logger.error(`🚨 Potential secret exposure in ${key}`);
            throw new Error(`Secret exposure detected in environment variable: ${key}`);
          }
        }
      }
    }
  }

  /**
   * التحقق من قوة كلمة المرور
   */
  isStrongPassword(password) {
    if (!password || password.length < 8) return false;
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  }

  /**
   * التحقق من صحة URL
   */
  isValidURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * التحقق من صحة البريد الإلكتروني
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * تشفير متغير حساس
   */
  encryptSensitiveValue(value) {
    const algorithm = 'aes-256-cbc';
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(algorithm, key);
    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      encrypted,
      key: key.toString('hex'),
      iv: iv.toString('hex')
    };
  }

  /**
   * إنشاء متغيرات بيئة آمنة
   */
  generateSecureEnvVars() {
    return {
      JWT_SECRET: crypto.randomBytes(64).toString('hex'),
      ENCRYPTION_KEY: crypto.randomBytes(32).toString('hex'),
      SESSION_SECRET: crypto.randomBytes(32).toString('hex'),
      API_KEY: crypto.randomBytes(32).toString('hex')
    };
  }

  /**
   * الحصول على تقرير الأمان
   */
  getSecurityReport() {
    const report = {
      totalVars: Object.keys(process.env).length,
      requiredVars: this.requiredVars.size,
      sensitiveVars: this.sensitiveVars.size,
      missingRequired: [],
      exposedSecrets: [],
      weakSecrets: []
    };

    // فحص المتغيرات المفقودة
    for (const varName of this.requiredVars) {
      if (!process.env[varName]) {
        report.missingRequired.push(varName);
      }
    }

    // فحص الأسرار المكشوفة
    for (const varName of this.sensitiveVars) {
      if (process.env[varName]) {
        const validation = this.validateSensitiveVar(varName, process.env[varName]);
        if (validation.error) {
          report.exposedSecrets.push({ var: varName, issue: validation.error });
        }
        if (validation.warning) {
          report.weakSecrets.push({ var: varName, issue: validation.warning });
        }
      }
    }

    return report;
  }
}

module.exports = { EnvironmentValidator };