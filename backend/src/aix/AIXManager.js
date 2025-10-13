/**
 * AIX Manager - إدارة الوكلاء بتنسيق AIX
 * Created by Cursor - AIX Integration Team
 * 
 * يدير تسجيل وتحميل وتشغيل الوكلاء بتنسيق AIX
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { logger } = require('../utils/logger');

// إنشاء logger مخصص للـ AIX
const log = logger.child('AIXManager');

/**
 * AIXManager - مدير الوكلاء الرئيسي
 */
class AIXManager {
  constructor(options = {}) {
    this.agents = new Map();
    this.agentRegistry = new Map();
    this.options = {
      agentsDirectory: options.agentsDirectory || './agents',
      autoLoad: options.autoLoad !== false,
      validateOnLoad: options.validateOnLoad !== false,
      ...options
    };
    
    log.info('AIXManager initialized', { 
      agentsDirectory: this.options.agentsDirectory,
      autoLoad: this.options.autoLoad 
    });
  }

  /**
   * تحميل وكيل من ملف AIX
   * @param {string} agentPath - مسار ملف الوكيل
   * @returns {Promise<AIXAgent>} الوكيل المحمل
   */
  async loadAgent(agentPath) {
    try {
      log.info('Loading AIX agent', { agentPath });
      
      // قراءة ملف AIX
      const content = await fs.readFile(agentPath, 'utf8');
      
      // تحليل تنسيق AIX
      const agentData = this.parseAIXContent(content, agentPath);
      
      // التحقق من صحة البيانات
      if (this.options.validateOnLoad) {
        await this.validateAgent(agentData);
      }
      
      // إنشاء كائن الوكيل
      const agent = new AIXAgent(agentData, agentPath);
      
      // تسجيل الوكيل
      this.registerAgent(agent);
      
      log.success('AIX agent loaded successfully', { 
        agentId: agent.id,
        agentName: agent.name 
      });
      
      return agent;
      
    } catch (error) {
      log.error('Failed to load AIX agent', { 
        agentPath, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * تحليل محتوى ملف AIX
   * @param {string} content - محتوى الملف
   * @param {string} filePath - مسار الملف
   * @returns {Object} بيانات الوكيل
   */
  parseAIXContent(content, filePath) {
    const format = this.detectFormat(content, filePath);
    
    switch (format) {
      case 'json':
        return JSON.parse(content);
      case 'yaml':
        return this.parseYAML(content);
      case 'toml':
        return this.parseTOML(content);
      default:
        throw new Error(`Unsupported AIX format: ${format}`);
    }
  }

  /**
   * كشف تنسيق الملف
   * @param {string} content - محتوى الملف
   * @param {string} filePath - مسار الملف
   * @returns {string} نوع التنسيق
   */
  detectFormat(content, filePath) {
    // فحص امتداد الملف
    if (filePath.endsWith('.json')) return 'json';
    if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) return 'yaml';
    if (filePath.endsWith('.toml')) return 'toml';
    if (filePath.endsWith('.aix')) {
      // فحص المحتوى لملفات .aix
      const trimmed = content.trim();
      if (trimmed.startsWith('{')) return 'json';
      if (trimmed.startsWith('[')) return 'toml';
      return 'yaml'; // افتراضي لملفات .aix
    }
    
    // كشف بناءً على المحتوى
    const trimmed = content.trim();
    if (trimmed.startsWith('{')) return 'json';
    if (/^\[\w+\]/.test(trimmed)) return 'toml';
    if (/^\w+\s*=/.test(trimmed)) return 'toml';
    
    return 'yaml'; // افتراضي
  }

  /**
   * تحليل YAML (تنفيذ مبسط)
   * @param {string} content - محتوى YAML
   * @returns {Object} البيانات المحللة
   */
  parseYAML(content) {
    // تنفيذ مبسط لتحليل YAML
    // في الإنتاج، استخدم مكتبة YAML متخصصة
    const result = {};
    const lines = content.split('\n');
    let currentPath = [];
    let currentObj = result;
    let inMultiline = false;
    let multilineKey = null;
    let multilineContent = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // تخطي التعليقات والخطوط الفارغة
      if (line.trim().startsWith('#') || line.trim() === '') continue;

      const indent = line.search(/\S/);
      if (indent === -1) continue;

      const trimmed = line.trim();

      // معالجة نهاية النص متعدد الأسطر
      if (inMultiline && indent <= (currentPath[currentPath.length - 1]?.indent || 0)) {
        const parent = currentPath[currentPath.length - 1]?.obj || result;
        parent[multilineKey] = multilineContent.join('\n');
        inMultiline = false;
        multilineKey = null;
        multilineContent = [];
      }

      // محتوى النص متعدد الأسطر
      if (inMultiline) {
        multilineContent.push(trimmed);
        continue;
      }

      // عنصر مصفوفة
      if (trimmed.startsWith('- ')) {
        const value = trimmed.substring(2).trim();
        
        // العثور على المصفوفة الأصل
        while (currentPath.length > 0 && currentPath[currentPath.length - 1].indent >= indent) {
          currentPath.pop();
        }
        
        const parent = currentPath.length > 0 ? currentPath[currentPath.length - 1].obj : result;
        const lastKey = currentPath.length > 0 ? currentPath[currentPath.length - 1].key : null;
        
        if (lastKey && !Array.isArray(parent[lastKey])) {
          parent[lastKey] = [];
        }
        
        if (lastKey) {
          if (value.includes(':')) {
            const obj = this.parseYAMLObject(value);
            parent[lastKey].push(obj);
          } else {
            parent[lastKey].push(this.parseYAMLValue(value));
          }
        }
        continue;
      }

      // زوج مفتاح-قيمة
      if (trimmed.includes(':')) {
        const colonIndex = trimmed.indexOf(':');
        const key = trimmed.substring(0, colonIndex).trim();
        let value = trimmed.substring(colonIndex + 1).trim();

        // تعديل الكائن الحالي بناءً على المسافة البادئة
        while (currentPath.length > 0 && currentPath[currentPath.length - 1].indent >= indent) {
          currentPath.pop();
        }
        
        currentObj = currentPath.length > 0 ? currentPath[currentPath.length - 1].obj : result;

        if (value === '' || value === '|' || value === '>') {
          if (value === '|' || value === '>') {
            multilineKey = key;
            multilineContent = [];
            inMultiline = true;
            currentObj[key] = '';
          } else {
            const newObj = {};
            currentObj[key] = newObj;
            currentPath.push({ indent, obj: newObj, key });
          }
        } else {
          currentObj[key] = this.parseYAMLValue(value);
        }
      }
    }

    // معالجة المحتوى متعدد الأسطر المتبقي
    if (inMultiline && multilineKey) {
      const parent = currentPath[currentPath.length - 1]?.obj || result;
      parent[multilineKey] = multilineContent.join('\n');
    }

    return result;
  }

  /**
   * تحليل قيمة YAML
   * @param {string} value - القيمة
   * @returns {any} القيمة المحللة
   */
  parseYAMLValue(value) {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'null') return null;
    if (value.startsWith('[') && value.endsWith(']')) {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    if (value.startsWith('{') && value.endsWith('}')) {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    if (value.startsWith('"') && value.endsWith('"')) {
      return value.slice(1, -1);
    }
    if (value.startsWith("'") && value.endsWith("'")) {
      return value.slice(1, -1);
    }
    if (!isNaN(value) && value !== '') {
      return Number(value);
    }
    return value;
  }

  /**
   * تحليل كائن YAML من نص
   * @param {string} str - النص
   * @returns {Object} الكائن المحلل
   */
  parseYAMLObject(str) {
    const obj = {};
    const parts = str.split(',');
    for (const part of parts) {
      if (part.includes(':')) {
        const [key, value] = part.split(':').map(s => s.trim());
        obj[key] = this.parseYAMLValue(value);
      }
    }
    return obj;
  }

  /**
   * تحليل TOML (تنفيذ مبسط)
   * @param {string} content - محتوى TOML
   * @returns {Object} البيانات المحللة
   */
  parseTOML(content) {
    const result = {};
    const lines = content.split('\n');
    let currentSection = result;
    let currentSectionName = null;

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('#') || trimmed === '') continue;

      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        currentSectionName = trimmed.slice(1, -1);
        currentSection = result[currentSectionName] = {};
        continue;
      }

      if (trimmed.includes('=')) {
        const equalIndex = trimmed.indexOf('=');
        const key = trimmed.substring(0, equalIndex).trim();
        let value = trimmed.substring(equalIndex + 1).trim();

        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.slice(1, -1);
        } else if (value === 'true' || value === 'false') {
          value = value === 'true';
        } else if (!isNaN(value) && value !== '') {
          value = Number(value);
        } else if (value.startsWith('[') && value.endsWith(']')) {
          try {
            value = JSON.parse(value);
          } catch {
            // الاحتفاظ كنص
          }
        }

        currentSection[key] = value;
      }
    }

    return result;
  }

  /**
   * التحقق من صحة الوكيل
   * @param {Object} agentData - بيانات الوكيل
   * @returns {Promise<boolean>} صحة البيانات
   */
  async validateAgent(agentData) {
    const errors = [];
    
    // التحقق من الأقسام المطلوبة
    const requiredSections = ['meta', 'persona', 'security'];
    for (const section of requiredSections) {
      if (!agentData[section]) {
        errors.push(`Missing required section: ${section}`);
      }
    }

    // التحقق من قسم meta
    if (agentData.meta) {
      const requiredMeta = ['version', 'id', 'name', 'created', 'author'];
      for (const field of requiredMeta) {
        if (!agentData.meta[field]) {
          errors.push(`Missing required meta field: ${field}`);
        }
      }
    }

    // التحقق من التوقيع الرقمي
    if (agentData.security?.checksum) {
      const isValid = await this.validateChecksum(agentData);
      if (!isValid) {
        errors.push('Invalid checksum');
      }
    }

    if (errors.length > 0) {
      throw new Error(`Agent validation failed: ${errors.join(', ')}`);
    }

    return true;
  }

  /**
   * التحقق من التوقيع الرقمي
   * @param {Object} agentData - بيانات الوكيل
   * @returns {Promise<boolean>} صحة التوقيع
   */
  async validateChecksum(agentData) {
    if (!agentData.security?.checksum) return true;
    
    const { algorithm, value } = agentData.security.checksum;
    const content = JSON.stringify(agentData, null, 2);
    const calculated = crypto.createHash(algorithm).update(content).digest('hex');
    
    return calculated === value;
  }

  /**
   * تسجيل وكيل
   * @param {AIXAgent} agent - الوكيل
   */
  registerAgent(agent) {
    this.agents.set(agent.id, agent);
    this.agentRegistry.set(agent.name, agent);
    
    log.info('Agent registered', { 
      agentId: agent.id,
      agentName: agent.name 
    });
  }

  /**
   * الحصول على وكيل بالمعرف
   * @param {string} agentId - معرف الوكيل
   * @returns {AIXAgent|null} الوكيل
   */
  getAgent(agentId) {
    return this.agents.get(agentId) || null;
  }

  /**
   * الحصول على وكيل بالاسم
   * @param {string} agentName - اسم الوكيل
   * @returns {AIXAgent|null} الوكيل
   */
  getAgentByName(agentName) {
    return this.agentRegistry.get(agentName) || null;
  }

  /**
   * الحصول على جميع الوكلاء
   * @returns {Array<AIXAgent>} قائمة الوكلاء
   */
  getAllAgents() {
    return Array.from(this.agents.values());
  }

  /**
   * تحميل جميع الوكلاء من مجلد
   * @param {string} directory - مسار المجلد
   * @returns {Promise<Array<AIXAgent>>} قائمة الوكلاء المحملة
   */
  async loadAllAgents(directory = this.options.agentsDirectory) {
    try {
      const files = await fs.readdir(directory);
      const aixFiles = files.filter(file => 
        file.endsWith('.aix') || 
        file.endsWith('.yaml') || 
        file.endsWith('.yml') || 
        file.endsWith('.json') || 
        file.endsWith('.toml')
      );

      const agents = [];
      for (const file of aixFiles) {
        try {
          const agentPath = path.join(directory, file);
          const agent = await this.loadAgent(agentPath);
          agents.push(agent);
        } catch (error) {
          log.warn('Failed to load agent file', { file, error: error.message });
        }
      }

      log.success('Loaded all agents', { count: agents.length });
      return agents;
      
    } catch (error) {
      log.error('Failed to load agents from directory', { 
        directory, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * إحصائيات الوكلاء
   * @returns {Object} الإحصائيات
   */
  getStats() {
    return {
      totalAgents: this.agents.size,
      agentNames: Array.from(this.agentRegistry.keys()),
      lastUpdated: new Date().toISOString()
    };
  }
}

/**
 * AIXAgent - كائن الوكيل
 */
class AIXAgent {
  constructor(agentData, filePath) {
    this.data = agentData;
    this.filePath = filePath;
    this.id = agentData.meta?.id;
    this.name = agentData.meta?.name;
    this.version = agentData.meta?.version;
    this.created = agentData.meta?.created;
    this.author = agentData.meta?.author;
    
    // تحضير الوظائف
    this.prepareFunctions();
  }

  /**
   * تحضير وظائف الوكيل
   */
  prepareFunctions() {
    // تحضير وظائف المهارات
    this.skills = this.data.skills || [];
    this.functions = new Map();
    
    for (const skill of this.skills) {
      if (skill.enabled) {
        this.functions.set(skill.name, {
          description: skill.description,
          parameters: skill.parameters || {},
          timeout: skill.timeout || 30,
          priority: skill.priority || 5
        });
      }
    }
  }

  /**
   * تنفيذ وظيفة
   * @param {string} functionName - اسم الوظيفة
   * @param {Object} parameters - المعاملات
   * @returns {Promise<any>} النتيجة
   */
  async executeFunction(functionName, parameters = {}) {
    const func = this.functions.get(functionName);
    if (!func) {
      throw new Error(`Function ${functionName} not found`);
    }

    // تنفيذ الوظيفة (هنا يمكن إضافة منطق التنفيذ الفعلي)
    log.info('Executing agent function', { 
      agentName: this.name,
      functionName,
      parameters 
    });

    // إرجاع نتيجة وهمية للآن
    return {
      success: true,
      result: `Function ${functionName} executed successfully`,
      agent: this.name,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * الحصول على معلومات الوكيل
   * @returns {Object} معلومات الوكيل
   */
  getInfo() {
    return {
      id: this.id,
      name: this.name,
      version: this.version,
      created: this.created,
      author: this.author,
      skills: this.skills.length,
      functions: Array.from(this.functions.keys()),
      filePath: this.filePath
    };
  }
}

module.exports = {
  AIXManager,
  AIXAgent
};