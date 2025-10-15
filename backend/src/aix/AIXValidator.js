/**
 * AIX Validator - محقق صحة ملفات AIX
 * Created by Cursor - AIX Integration Team
 * 
 * يتحقق من صحة وبنية ملفات AIX
 */

const crypto = require('crypto');
const { logger } = require('../utils/logger');

// إنشاء logger مخصص للـ Validator
const log = logger.child('AIXValidator');

/**
 * AIXValidator - محقق صحة ملفات AIX
 */
class AIXValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.schema = this.getDefaultSchema();
  }

  /**
   * التحقق من صحة ملف AIX
   * @param {Object} agentData - بيانات الوكيل
   * @param {string} content - المحتوى الأصلي
   * @returns {Object} نتيجة التحقق
   */
  validate(agentData, content = null) {
    this.errors = [];
    this.warnings = [];

    log.info('Starting AIX validation', {
      agentName: agentData.meta?.name,
      agentId: agentData.meta?.id
    });

    // التحقق من البنية الأساسية
    this.validateStructure(agentData);

    // التحقق من الأقسام المطلوبة
    this.validateRequiredSections(agentData);

    // التحقق من صحة البيانات
    this.validateDataIntegrity(agentData);

    // التحقق من الأمان
    if (content) {
      this.validateSecurity(agentData, content);
    }

    // التحقق من التوافق
    this.validateCompatibility(agentData);

    const result = {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      score: this.calculateScore()
    };

    log.info('AIX validation completed', {
      valid: result.valid,
      errorCount: this.errors.length,
      warningCount: this.warnings.length,
      score: result.score
    });

    return result;
  }

  /**
   * التحقق من البنية الأساسية
   * @param {Object} agentData - بيانات الوكيل
   */
  validateStructure(agentData) {
    if (!agentData || typeof agentData !== 'object') {
      this.addError('INVALID_STRUCTURE', 'Agent data must be a valid object');
      return;
    }

    // التحقق من وجود المفاتيح الأساسية
    const requiredKeys = ['meta', 'persona'];
    for (const key of requiredKeys) {
      if (!agentData[key]) {
        this.addError('MISSING_SECTION', `Required section '${key}' is missing`);
      }
    }
  }

  /**
   * التحقق من الأقسام المطلوبة
   * @param {Object} agentData - بيانات الوكيل
   */
  validateRequiredSections(agentData) {
    // التحقق من قسم meta
    if (agentData.meta) {
      this.validateMetaSection(agentData.meta);
    }

    // التحقق من قسم persona
    if (agentData.persona) {
      this.validatePersonaSection(agentData.persona);
    }

    // التحقق من قسم security
    if (agentData.security) {
      this.validateSecuritySection(agentData.security);
    }

    // التحقق من قسم skills
    if (agentData.skills) {
      this.validateSkillsSection(agentData.skills);
    }

    // التحقق من قسم APIs
    if (agentData.apis) {
      this.validateAPIsSection(agentData.apis);
    }

    // التحقق من قسم memory
    if (agentData.memory) {
      this.validateMemorySection(agentData.memory);
    }
  }

  /**
   * التحقق من قسم meta
   * @param {Object} meta - بيانات meta
   */
  validateMetaSection(meta) {
    const requiredFields = ['version', 'id', 'name', 'created', 'author'];
    
    for (const field of requiredFields) {
      if (!meta[field]) {
        this.addError('MISSING_FIELD', `meta.${field} is required`);
      }
    }

    // التحقق من تنسيق UUID
    if (meta.id && !this.isValidUUID(meta.id)) {
      this.addError('INVALID_UUID', 'meta.id must be a valid UUID');
    }

    // التحقق من تنسيق التاريخ
    if (meta.created && !this.isValidISO8601(meta.created)) {
      this.addError('INVALID_DATE', 'meta.created must be a valid ISO 8601 date');
    }

    // التحقق من تنسيق الإصدار
    if (meta.version && !this.isValidSemver(meta.version)) {
      this.addError('INVALID_VERSION', 'meta.version must be a valid semantic version');
    }

    // التحقق من طول الاسم
    if (meta.name && meta.name.length > 100) {
      this.addWarning('NAME_TOO_LONG', 'meta.name is longer than recommended (100 chars)');
    }
  }

  /**
   * التحقق من قسم persona
   * @param {Object} persona - بيانات persona
   */
  validatePersonaSection(persona) {
    const requiredFields = ['role', 'instructions'];
    
    for (const field of requiredFields) {
      if (!persona[field]) {
        this.addError('MISSING_FIELD', `persona.${field} is required`);
      }
    }

    // التحقق من درجة الحرارة
    if (persona.temperature !== undefined) {
      if (typeof persona.temperature !== 'number' || 
          persona.temperature < 0 || persona.temperature > 2) {
        this.addError('INVALID_TEMPERATURE', 'persona.temperature must be between 0.0 and 2.0');
      }
    }

    // التحقق من طول التعليمات
    if (persona.instructions && persona.instructions.length > 2000) {
      this.addWarning('INSTRUCTIONS_TOO_LONG', 'persona.instructions is longer than recommended (2000 chars)');
    }

    // التحقق من القيود
    if (persona.constraints && !Array.isArray(persona.constraints)) {
      this.addError('INVALID_CONSTRAINTS', 'persona.constraints must be an array');
    }
  }

  /**
   * التحقق من قسم security
   * @param {Object} security - بيانات security
   */
  validateSecuritySection(security) {
    // التحقق من التوقيع الرقمي
    if (security.checksum) {
      this.validateChecksum(security.checksum);
    }

    // التحقق من التوقيع
    if (security.signature) {
      this.validateSignature(security.signature);
    }

    // التحقق من الصلاحيات
    if (security.capabilities) {
      this.validateCapabilities(security.capabilities);
    }
  }

  /**
   * التحقق من التوقيع الرقمي
   * @param {Object} checksum - بيانات التوقيع
   */
  validateChecksum(checksum) {
    if (!checksum.algorithm) {
      this.addError('MISSING_CHECKSUM_ALGORITHM', 'security.checksum.algorithm is required');
    } else if (!['sha256', 'sha512', 'blake3'].includes(checksum.algorithm)) {
      this.addError('INVALID_CHECKSUM_ALGORITHM', 'security.checksum.algorithm must be sha256, sha512, or blake3');
    }

    if (!checksum.value) {
      this.addError('MISSING_CHECKSUM_VALUE', 'security.checksum.value is required');
    } else if (!this.isValidHex(checksum.value)) {
      this.addError('INVALID_CHECKSUM_VALUE', 'security.checksum.value must be a valid hex string');
    }
  }

  /**
   * التحقق من التوقيع
   * @param {Object} signature - بيانات التوقيع
   */
  validateSignature(signature) {
    const requiredFields = ['algorithm', 'value', 'public_key', 'signer'];
    
    for (const field of requiredFields) {
      if (!signature[field]) {
        this.addError('MISSING_FIELD', `security.signature.${field} is required`);
      }
    }

    if (signature.algorithm && !['RSA-SHA256', 'Ed25519'].includes(signature.algorithm)) {
      this.addError('INVALID_SIGNATURE_ALGORITHM', 'security.signature.algorithm must be RSA-SHA256 or Ed25519');
    }
  }

  /**
   * التحقق من الصلاحيات
   * @param {Object} capabilities - بيانات الصلاحيات
   */
  validateCapabilities(capabilities) {
    if (capabilities.max_api_calls_per_minute && 
        (typeof capabilities.max_api_calls_per_minute !== 'number' || 
         capabilities.max_api_calls_per_minute < 0)) {
      this.addError('INVALID_API_LIMIT', 'security.capabilities.max_api_calls_per_minute must be a positive number');
    }

    if (capabilities.max_memory_mb && 
        (typeof capabilities.max_memory_mb !== 'number' || 
         capabilities.max_memory_mb < 0)) {
      this.addError('INVALID_MEMORY_LIMIT', 'security.capabilities.max_memory_mb must be a positive number');
    }
  }

  /**
   * التحقق من قسم skills
   * @param {Array} skills - قائمة المهارات
   */
  validateSkillsSection(skills) {
    if (!Array.isArray(skills)) {
      this.addError('INVALID_SKILLS', 'skills must be an array');
      return;
    }

    const skillNames = new Set();
    
    for (let i = 0; i < skills.length; i++) {
      const skill = skills[i];
      
      if (!skill.name) {
        this.addError('MISSING_SKILL_NAME', `skills[${i}].name is required`);
      } else if (skillNames.has(skill.name)) {
        this.addError('DUPLICATE_SKILL_NAME', `Duplicate skill name: ${skill.name}`);
      } else {
        skillNames.add(skill.name);
      }

      if (!skill.description) {
        this.addError('MISSING_SKILL_DESCRIPTION', `skills[${i}].description is required`);
      }

      if (skill.timeout && (typeof skill.timeout !== 'number' || skill.timeout < 0)) {
        this.addError('INVALID_SKILL_TIMEOUT', `skills[${i}].timeout must be a positive number`);
      }

      if (skill.priority && (typeof skill.priority !== 'number' || skill.priority < 1 || skill.priority > 10)) {
        this.addError('INVALID_SKILL_PRIORITY', `skills[${i}].priority must be between 1 and 10`);
      }
    }
  }

  /**
   * التحقق من قسم APIs
   * @param {Array} apis - قائمة APIs
   */
  validateAPIsSection(apis) {
    if (!Array.isArray(apis)) {
      this.addError('INVALID_APIS', 'apis must be an array');
      return;
    }

    for (let i = 0; i < apis.length; i++) {
      const api = apis[i];
      
      if (!api.name) {
        this.addError('MISSING_API_NAME', `apis[${i}].name is required`);
      }

      if (!api.base_url) {
        this.addError('MISSING_API_URL', `apis[${i}].base_url is required`);
      } else if (!this.isValidURL(api.base_url)) {
        this.addError('INVALID_API_URL', `apis[${i}].base_url must be a valid URL`);
      }

      if (api.rate_limit && (typeof api.rate_limit !== 'number' || api.rate_limit < 0)) {
        this.addError('INVALID_API_RATE_LIMIT', `apis[${i}].rate_limit must be a positive number`);
      }
    }
  }

  /**
   * التحقق من قسم memory
   * @param {Object} memory - بيانات memory
   */
  validateMemorySection(memory) {
    if (memory.episodic) {
      this.validateEpisodicMemory(memory.episodic);
    }

    if (memory.semantic) {
      this.validateSemanticMemory(memory.semantic);
    }

    if (memory.procedural) {
      this.validateProceduralMemory(memory.procedural);
    }
  }

  /**
   * التحقق من الذاكرة العرضية
   * @param {Object} episodic - بيانات الذاكرة العرضية
   */
  validateEpisodicMemory(episodic) {
    if (episodic.max_messages && (typeof episodic.max_messages !== 'number' || episodic.max_messages < 0)) {
      this.addError('INVALID_MAX_MESSAGES', 'memory.episodic.max_messages must be a positive number');
    }

    if (episodic.retention_days && (typeof episodic.retention_days !== 'number' || episodic.retention_days < 0)) {
      this.addError('INVALID_RETENTION_DAYS', 'memory.episodic.retention_days must be a positive number');
    }
  }

  /**
   * التحقق من الذاكرة الدلالية
   * @param {Object} semantic - بيانات الذاكرة الدلالية
   */
  validateSemanticMemory(semantic) {
    if (semantic.similarity_threshold && 
        (typeof semantic.similarity_threshold !== 'number' || 
         semantic.similarity_threshold < 0 || semantic.similarity_threshold > 1)) {
      this.addError('INVALID_SIMILARITY_THRESHOLD', 'memory.semantic.similarity_threshold must be between 0.0 and 1.0');
    }

    if (semantic.max_results && (typeof semantic.max_results !== 'number' || semantic.max_results < 0)) {
      this.addError('INVALID_MAX_RESULTS', 'memory.semantic.max_results must be a positive number');
    }
  }

  /**
   * التحقق من الذاكرة الإجرائية
   * @param {Object} procedural - بيانات الذاكرة الإجرائية
   */
  validateProceduralMemory(procedural) {
    if (procedural.max_workflows && (typeof procedural.max_workflows !== 'number' || procedural.max_workflows < 0)) {
      this.addError('INVALID_MAX_WORKFLOWS', 'memory.procedural.max_workflows must be a positive number');
    }

    if (procedural.workflows && !Array.isArray(procedural.workflows)) {
      this.addError('INVALID_WORKFLOWS', 'memory.procedural.workflows must be an array');
    }
  }

  /**
   * التحقق من صحة البيانات
   * @param {Object} agentData - بيانات الوكيل
   */
  validateDataIntegrity(agentData) {
    // التحقق من عدم وجود حلقات مرجعية
    try {
      JSON.stringify(agentData);
    } catch (error) {
      this.addError('CIRCULAR_REFERENCE', 'Agent data contains circular references');
    }

    // التحقق من حجم البيانات
    const dataSize = JSON.stringify(agentData).length;
    if (dataSize > 1024 * 1024) { // 1MB
      this.addWarning('LARGE_DATA_SIZE', 'Agent data is larger than recommended (1MB)');
    }
  }

  /**
   * التحقق من الأمان
   * @param {Object} agentData - بيانات الوكيل
   * @param {string} content - المحتوى الأصلي
   */
  validateSecurity(agentData, content) {
    if (agentData.security?.checksum) {
      const isValid = this.verifyChecksum(agentData, content);
      if (!isValid) {
        this.addError('CHECKSUM_MISMATCH', 'Checksum verification failed');
      }
    }
  }

  /**
   * التحقق من التوافق
   * @param {Object} agentData - بيانات الوكيل
   */
  validateCompatibility(agentData) {
    const version = agentData.meta?.version;
    if (version) {
      const majorVersion = parseInt(version.split('.')[0]);
      if (majorVersion > 1) {
        this.addWarning('UNSUPPORTED_VERSION', `Version ${version} may not be fully supported`);
      }
    }
  }

  /**
   * التحقق من التوقيع الرقمي
   * @param {Object} agentData - بيانات الوكيل
   * @param {string} content - المحتوى الأصلي
   * @returns {boolean} صحة التوقيع
   */
  verifyChecksum(agentData, content) {
    const { algorithm, value } = agentData.security.checksum;
    const calculated = crypto.createHash(algorithm).update(content).digest('hex');
    return calculated === value;
  }

  /**
   * حساب نقاط الصحة
   * @returns {number} النقاط
   */
  calculateScore() {
    const totalChecks = 20; // عدد الفحوصات الأساسية
    const errorPenalty = this.errors.length * 5;
    const warningPenalty = this.warnings.length * 1;
    
    const score = Math.max(0, 100 - errorPenalty - warningPenalty);
    return Math.round(score);
  }

  /**
   * إضافة خطأ
   * @param {string} code - كود الخطأ
   * @param {string} message - رسالة الخطأ
   */
  addError(code, message) {
    this.errors.push({ code, message, timestamp: new Date().toISOString() });
  }

  /**
   * إضافة تحذير
   * @param {string} code - كود التحذير
   * @param {string} message - رسالة التحذير
   */
  addWarning(code, message) {
    this.warnings.push({ code, message, timestamp: new Date().toISOString() });
  }

  /**
   * الحصول على المخطط الافتراضي
   * @returns {Object} المخطط
   */
  getDefaultSchema() {
    return {
      version: '1.0',
      required: ['meta', 'persona'],
      properties: {
        meta: {
          required: ['version', 'id', 'name', 'created', 'author']
        },
        persona: {
          required: ['role', 'instructions']
        }
      }
    };
  }

  // دوال مساعدة للتحقق من صحة البيانات
  isValidUUID(uuid) {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return regex.test(uuid);
  }

  isValidISO8601(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    if (!regex.test(dateString)) return false;
    
    try {
      const date = new Date(dateString);
      return !isNaN(date.getTime());
    } catch {
      return false;
    }
  }

  isValidSemver(version) {
    const regex = /^\d+\.\d+(\.\d+)?(-[a-z0-9.]+)?(\+[a-z0-9.]+)?$/i;
    return regex.test(version);
  }

  isValidURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  isValidHex(hex) {
    const regex = /^[0-9a-f]+$/i;
    return regex.test(hex);
  }
}

module.exports = AIXValidator;