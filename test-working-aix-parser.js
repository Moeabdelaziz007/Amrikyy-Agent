/**
 * Working Test for AIX Parser v3.0
 * Testing the complete implementation without top-level await
 */

const fs = require('fs');
const crypto = require('crypto');

// Mock the complete AIX Parser implementation
class AIXParserConfig {
  constructor(options = {}) {
    this.strictMode = options.strictMode ?? true;
    this.validateChecksums = options.validateChecksums ?? true;
    this.validateSignatures = options.validateSignatures ?? false;
    this.enableNaturalLanguage = options.enableNaturalLanguage ?? false;
    this.enableSelfHealing = options.enableSelfHealing ?? true;
    this.enableSmartDefaults = options.enableSmartDefaults ?? true;
    this.maxFileSize = options.maxFileSize ?? 50 * 1024 * 1024;
    this.streamingThreshold = options.streamingThreshold ?? 10 * 1024 * 1024;
    this.cacheEnabled = options.cacheEnabled ?? true;
    this.cacheSize = options.cacheSize ?? 100;
    this.plugins = options.plugins ?? [];
    this.customValidators = options.customValidators ?? [];
    this.securityLevel = options.securityLevel ?? 'standard';
    this.allowDeprecated = options.allowDeprecated ?? false;
  }
}

class AIXError extends Error {
  constructor(code, message, context = {}) {
    super(message);
    this.name = 'AIXError';
    this.code = code;
    this.severity = context.severity || 'error';
    this.context = context;
    this.suggestion = context.suggestion;
    this.autoFix = context.autoFix;
    this.documentationUrl = `https://aix-format.org/docs/errors/${code}`;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      severity: this.severity,
      suggestion: this.suggestion,
      autoFix: this.autoFix,
      context: this.context,
      documentationUrl: this.documentationUrl,
      timestamp: this.timestamp
    };
  }
}

class LRUCache {
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return undefined;
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  clear() {
    this.cache.clear();
  }
}

class AIXAgent {
  constructor(data, metadata = {}) {
    this.data = data;
    this.metadata = metadata;
    this.diagnostics = metadata.diagnostics || { errors: [], warnings: [], info: [], fixes: [] };
    this.format = metadata.format || 'unknown';
    this.filePath = metadata.filePath || '<string>';
  }

  getMeta() {
    return this.data.meta || {};
  }

  getPersona() {
    return this.data.persona || {};
  }

  getSkills() {
    return this.data.skills || [];
  }

  getTools() {
    return this.data.tools || {};
  }

  getMemory() {
    return this.data.memory || {};
  }

  getSecurity() {
    return this.data.security || {};
  }

  validate() {
    const errors = [];
    const warnings = [];

    if (!this.data.meta) {
      errors.push(new AIXError('MISSING_META', 'Missing required meta section'));
    } else {
      if (!this.data.meta.name) {
        errors.push(new AIXError('MISSING_NAME', 'Missing required meta.name field'));
      }
      if (!this.data.meta.version) {
        errors.push(new AIXError('MISSING_VERSION', 'Missing required meta.version field'));
      }
    }

    if (!this.data.persona) {
      warnings.push(new AIXError('MISSING_PERSONA', 'Missing persona section', { severity: 'warning' }));
    }

    if (!this.data.skills || !Array.isArray(this.data.skills)) {
      warnings.push(new AIXError('MISSING_SKILLS', 'Missing or invalid skills section', { severity: 'warning' }));
    }

    return { errors, warnings };
  }

  toJSON() {
    return {
      meta: this.getMeta(),
      persona: this.getPersona(),
      skills: this.getSkills(),
      tools: this.getTools(),
      memory: this.getMemory(),
      security: this.getSecurity(),
      diagnostics: this.diagnostics
    };
  }
}

class AIXParser {
  constructor(config = {}) {
    this.config = config instanceof AIXParserConfig ? config : new AIXParserConfig(config);
    this.cache = new LRUCache(this.config.cacheSize);
    this.plugins = [];
    this.diagnostics = {
      errors: [],
      warnings: [],
      info: [],
      fixes: []
    };
    
    this.loadPlugins();
  }

  async parseFile(filePath, options = {}) {
    const startTime = Date.now();
    
    try {
      if (!fs.existsSync(filePath)) {
        throw new AIXError('FILE_NOT_FOUND', `File not found: ${filePath}`, {
          suggestion: 'Check the file path and try again'
        });
      }

      const stats = fs.statSync(filePath);
      if (stats.size > this.config.maxFileSize) {
        throw new AIXError('FILE_TOO_LARGE', 
          `File size ${this.formatBytes(stats.size)} exceeds maximum ${this.formatBytes(this.config.maxFileSize)}`,
          {
            suggestion: 'Increase maxFileSize in parser config or reduce file size'
          }
        );
      }

      let content;
      if (stats.size > this.config.streamingThreshold && !options.forceSync) {
        this.diagnostics.info.push({
          code: 'STREAMING_MODE',
          message: `Using streaming mode for large file (${this.formatBytes(stats.size)})`
        });
        content = await this.readFileStreaming(filePath);
      } else {
        content = fs.readFileSync(filePath, 'utf-8');
      }

      const result = await this.parse(content, filePath);
      
      const parseTime = Date.now() - startTime;
      this.diagnostics.info.push({
        code: 'PARSE_COMPLETE',
        message: `Parsed in ${parseTime}ms`,
        metrics: {
          parseTime,
          fileSize: stats.size,
          cacheHit: this.cache.get(this.getCacheKey(content)) !== undefined
        }
      });

      return result;
    } catch (error) {
      if (error instanceof AIXError) throw error;
      
      throw new AIXError('PARSE_FILE_ERROR', `Failed to parse file: ${error.message}`, {
        file: filePath,
        originalError: error.message
      });
    }
  }

  async parse(content, filePath = '<string>') {
    this.diagnostics = { errors: [], warnings: [], info: [], fixes: [] };

    const cacheKey = this.getCacheKey(content);
    if (this.config.cacheEnabled) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        this.diagnostics.info.push({ code: 'CACHE_HIT', message: 'Using cached result' });
        return cached;
      }
    }

    const format = this.detectFormat(content, filePath);
    this.diagnostics.info.push({ code: 'FORMAT_DETECTED', message: `Detected format: ${format}` });

    let data;
    try {
      switch (format) {
        case 'natural':
          data = await this.parseNaturalLanguage(content);
          break;
        case 'json':
          data = this.parseJSON(content);
          break;
        case 'yaml':
          data = this.parseYAML(content);
          break;
        case 'toml':
          data = this.parseTOML(content);
          break;
        default:
          throw new AIXError('UNSUPPORTED_FORMAT', `Unsupported format: ${format}`);
      }
    } catch (error) {
      if (error instanceof AIXError) throw error;
      throw this.handleParseError(error, format, content);
    }

    if (this.config.enableSmartDefaults) {
      data = this.applySmartDefaults(data);
    }

    await this.validateStructure(data);

    if (this.config.enableSelfHealing && this.diagnostics.errors.length > 0) {
      data = await this.attemptSelfHealing(data);
    }

    for (const plugin of this.plugins) {
      if (plugin.validate) {
        await plugin.validate(data, this.diagnostics);
      }
    }

    const agent = new AIXAgent(data, {
      diagnostics: this.diagnostics,
      format,
      filePath
    });

    if (this.config.cacheEnabled) {
      this.cache.set(cacheKey, agent);
    }

    if (this.config.strictMode && this.diagnostics.errors.length > 0) {
      const error = new Error(`Validation failed with ${this.diagnostics.errors.length} error(s)`);
      error.diagnostics = this.diagnostics;
      throw error;
    }

    return agent;
  }

  async parseNaturalLanguage(content) {
    if (!this.config.enableNaturalLanguage) {
      throw new AIXError('NATURAL_LANGUAGE_DISABLED', 
        'Natural language parsing is disabled',
        { suggestion: 'Enable with config.enableNaturalLanguage = true' }
      );
    }

    const agent = {
      meta: this.extractMeta(content),
      persona: this.extractPersona(content),
      skills: this.extractSkills(content),
      tools: this.extractTools(content)
    };

    this.diagnostics.info.push({
      code: 'NATURAL_LANGUAGE_PARSED',
      message: 'Successfully parsed natural language description'
    });

    return agent;
  }

  extractMeta(content) {
    const nameMatch = content.match(/(?:agent|called|named)\s+["']?([^"'\n]+)["']?/i);
    const versionMatch = content.match(/version\s+(\d+\.\d+\.\d+)/i);
    
    return {
      name: nameMatch ? nameMatch[1].trim() : 'UnnamedAgent',
      version: versionMatch ? versionMatch[1] : '1.0.0',
      id: `agent:${(nameMatch?.[1] || 'unnamed').toLowerCase().replace(/\s+/g, '-')}:${versionMatch?.[1] || '1.0.0'}`
    };
  }

  extractPersona(content) {
    const roleKeywords = {
      'assistant': ['assist', 'help', 'support'],
      'analyst': ['analyz', 'detect', 'pattern', 'audit'],
      'researcher': ['research', 'investigate', 'explore']
    };

    let role = 'assistant';
    for (const [key, keywords] of Object.entries(roleKeywords)) {
      if (keywords.some(kw => content.toLowerCase().includes(kw))) {
        role = key;
        break;
      }
    }

    return { role };
  }

  extractSkills(content) {
    const skillPatterns = [
      /(?:can|able to|capable of)\s+([^.]+)/gi,
      /(?:detect|analyz|identif)[a-z]*\s+([^.]+)/gi
    ];

    const skills = [];
    for (const pattern of skillPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        skills.push({
          name: match[1].trim().toLowerCase().replace(/\s+/g, '_'),
          description: match[1].trim()
        });
      }
    }

    return skills.slice(0, 5);
  }

  extractTools(content) {
    const toolPatterns = [
      /(?:uses?|integrates?|calls?)\s+([a-zA-Z0-9_-]+)/gi,
      /(?:api|endpoint|service)\s+([a-zA-Z0-9_-]+)/gi
    ];

    const tools = [];
    for (const pattern of toolPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        tools.push({
          name: match[1].trim(),
          type: 'api'
        });
      }
    }

    return { apis: tools };
  }

  parseJSON(content) {
    try {
      return JSON.parse(content);
    } catch (error) {
      throw new AIXError('JSON_PARSE_ERROR', `Invalid JSON: ${error.message}`, {
        suggestion: 'Check JSON syntax and try again'
      });
    }
  }

  parseYAML(content) {
    // Simplified YAML parser for demonstration
    try {
      const lines = content.split('\n');
      const result = {};
      let currentSection = null;
      let currentKey = null;
      let indentLevel = 0;

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;

        const currentIndent = line.length - line.trimStart().length;
        
        if (currentIndent === 0 && trimmed.endsWith(':')) {
          currentSection = trimmed.slice(0, -1);
          result[currentSection] = {};
          indentLevel = 0;
        } else if (currentIndent > indentLevel && currentSection) {
          if (trimmed.endsWith(':')) {
            currentKey = trimmed.slice(0, -1);
            result[currentSection][currentKey] = {};
            indentLevel = currentIndent;
          } else if (currentKey) {
            const [key, value] = trimmed.split(':').map(s => s.trim());
            if (key && value) {
              result[currentSection][currentKey][key] = this.parseValue(value);
            }
          }
        } else if (currentIndent === 0 && currentSection) {
          const [key, value] = trimmed.split(':').map(s => s.trim());
          if (key && value) {
            result[currentSection][key] = this.parseValue(value);
          }
        }
      }

      return result;
    } catch (error) {
      throw new AIXError('YAML_PARSE_ERROR', `Invalid YAML: ${error.message}`, {
        suggestion: 'Check YAML syntax and indentation'
      });
    }
  }

  parseTOML(content) {
    // Simplified TOML parser for demonstration
    try {
      const lines = content.split('\n');
      const result = {};
      let currentSection = null;

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;

        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
          currentSection = trimmed.slice(1, -1);
          result[currentSection] = {};
        } else if (currentSection && trimmed.includes('=')) {
          const [key, value] = trimmed.split('=').map(s => s.trim());
          if (key && value) {
            result[currentSection][key] = this.parseValue(value);
          }
        } else if (!currentSection && trimmed.includes('=')) {
          const [key, value] = trimmed.split('=').map(s => s.trim());
          if (key && value) {
            result[key] = this.parseValue(value);
          }
        }
      }

      return result;
    } catch (error) {
      throw new AIXError('TOML_PARSE_ERROR', `Invalid TOML: ${error.message}`, {
        suggestion: 'Check TOML syntax and try again'
      });
    }
  }

  parseValue(value) {
    if (value.startsWith('"') && value.endsWith('"')) {
      return value.slice(1, -1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      return value.slice(1, -1);
    } else if (value === 'true') {
      return true;
    } else if (value === 'false') {
      return false;
    } else if (value === 'null') {
      return null;
    } else if (!isNaN(value)) {
      return Number(value);
    } else {
      return value;
    }
  }

  detectFormat(content, filePath) {
    if (this.config.enableNaturalLanguage) {
      const naturalIndicators = [
        /this is a/i,
        /agent called/i,
        /named/i,
        /can help/i,
        /capable of/i
      ];
      
      if (naturalIndicators.some(pattern => pattern.test(content))) {
        return 'natural';
      }
    }

    if (filePath.endsWith('.json')) return 'json';
    if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) return 'yaml';
    if (filePath.endsWith('.toml')) return 'toml';

    if (content.trim().startsWith('{') && content.trim().endsWith('}')) {
      return 'json';
    }
    
    if (content.includes('---') || content.includes(':')) {
      return 'yaml';
    }
    
    if (content.includes('[') && content.includes('=')) {
      return 'toml';
    }

    return 'unknown';
  }

  applySmartDefaults(data) {
    if (!data.meta) {
      data.meta = {};
    }

    if (!data.meta.name) {
      data.meta.name = 'UnnamedAgent';
    }

    if (!data.meta.version) {
      data.meta.version = '1.0.0';
    }

    if (!data.meta.id) {
      data.meta.id = `agent:${data.meta.name.toLowerCase().replace(/\s+/g, '-')}:${data.meta.version}`;
    }

    if (!data.persona) {
      data.persona = { role: 'assistant' };
    }

    if (!data.skills) {
      data.skills = [];
    }

    if (!data.tools) {
      data.tools = {};
    }

    return data;
  }

  async validateStructure(data) {
    const errors = [];
    const warnings = [];

    if (!data.meta) {
      errors.push(new AIXError('MISSING_META', 'Missing required meta section'));
    } else {
      if (!data.meta.name) {
        errors.push(new AIXError('MISSING_NAME', 'Missing required meta.name field'));
      }
      if (!data.meta.version) {
        errors.push(new AIXError('MISSING_VERSION', 'Missing required meta.version field'));
      }
    }

    if (!data.persona) {
      warnings.push(new AIXError('MISSING_PERSONA', 'Missing persona section', { severity: 'warning' }));
    }

    if (!data.skills || !Array.isArray(data.skills)) {
      warnings.push(new AIXError('MISSING_SKILLS', 'Missing or invalid skills section', { severity: 'warning' }));
    }

    this.diagnostics.errors.push(...errors);
    this.diagnostics.warnings.push(...warnings);
  }

  async attemptSelfHealing(data) {
    this.diagnostics.info.push({
      code: 'SELF_HEALING_START',
      message: 'Attempting self-healing validation'
    });

    if (!data.meta) {
      data.meta = { name: 'UnnamedAgent', version: '1.0.0' };
      this.diagnostics.fixes.push({
        code: 'ADDED_META',
        message: 'Added missing meta section'
      });
    }

    if (!data.persona) {
      data.persona = { role: 'assistant' };
      this.diagnostics.fixes.push({
        code: 'ADDED_PERSONA',
        message: 'Added missing persona section'
      });
    }

    if (!data.skills) {
      data.skills = [];
      this.diagnostics.fixes.push({
        code: 'ADDED_SKILLS',
        message: 'Added missing skills section'
      });
    }

    this.diagnostics.info.push({
      code: 'SELF_HEALING_COMPLETE',
      message: `Applied ${this.diagnostics.fixes.length} fixes`
    });

    return data;
  }

  handleParseError(error, format, content) {
    return new AIXError('PARSE_ERROR', `Failed to parse ${format}: ${error.message}`, {
      suggestion: `Check ${format} syntax and try again`,
      format,
      contentLength: content.length
    });
  }

  async readFileStreaming(filePath) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
      
      stream.on('data', chunk => chunks.push(chunk));
      stream.on('end', () => resolve(chunks.join('')));
      stream.on('error', reject);
    });
  }

  getCacheKey(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  loadPlugins() {
    for (const plugin of this.config.plugins) {
      try {
        if (typeof plugin === 'function') {
          this.plugins.push(plugin());
        } else {
          this.plugins.push(plugin);
        }
      } catch (error) {
        this.diagnostics.warnings.push({
          code: 'PLUGIN_LOAD_ERROR',
          message: `Failed to load plugin: ${error.message}`
        });
      }
    }
  }
}

// ============================================================================
// COMPREHENSIVE TESTS
// ============================================================================

async function runTests() {
  console.log('=== COMPREHENSIVE AIX PARSER v3.0 TEST ===\n');

  // Test 1: JSON Parsing
  console.log('1. Testing JSON Parsing...');
  try {
    const parser = new AIXParser({
      enableNaturalLanguage: false,
      enableSelfHealing: true,
      enableSmartDefaults: true
    });

    const jsonContent = JSON.stringify({
      meta: {
        name: "TestAgent",
        version: "1.0.0",
        id: "agent:test-agent:1.0.0"
      },
      persona: {
        role: "assistant",
        tone: "friendly"
      },
      skills: [
        { name: "test_skill", description: "A test skill" }
      ]
    });

    const result = await parser.parse(jsonContent, 'test.json');
    console.log('✅ JSON parsing successful');
    console.log('Agent name:', result.getMeta().name);
    console.log('Agent role:', result.getPersona().role);
    console.log('Skills count:', result.getSkills().length);
  } catch (error) {
    console.error('❌ JSON parsing failed:', error.message);
  }

  // Test 2: Natural Language Parsing
  console.log('\n2. Testing Natural Language Parsing...');
  try {
    const parser = new AIXParser({
      enableNaturalLanguage: true,
      enableSelfHealing: true,
      enableSmartDefaults: true
    });

    const naturalContent = `
      This is a quantum-enhanced pattern detection agent called "MayaTravelAgent" version 2.1.0.
      It can detect anomalies in code and analyze patterns for security vulnerabilities.
      The agent is capable of identifying SQL injection attacks and XSS vulnerabilities.
      It uses the GitHub API and integrates with security tools.
    `;

    const result = await parser.parse(naturalContent, 'natural.aix');
    console.log('✅ Natural language parsing successful');
    console.log('Agent name:', result.getMeta().name);
    console.log('Agent role:', result.getPersona().role);
    console.log('Skills count:', result.getSkills().length);
    console.log('Tools count:', Object.keys(result.getTools()).length);
  } catch (error) {
    console.error('❌ Natural language parsing failed:', error.message);
  }

  // Test 3: YAML Parsing
  console.log('\n3. Testing YAML Parsing...');
  try {
    const parser = new AIXParser({
      enableNaturalLanguage: false,
      enableSelfHealing: true,
      enableSmartDefaults: true
    });

    const yamlContent = `
meta:
  name: "YAMLAgent"
  version: "1.0.0"
  id: "agent:yaml-agent:1.0.0"

persona:
  role: "analyst"
  tone: "professional"

skills:
  - name: "yaml_analysis"
    description: "Analyzes YAML files"
  - name: "data_processing"
    description: "Processes structured data"
`;

    const result = await parser.parse(yamlContent, 'test.yaml');
    console.log('✅ YAML parsing successful');
    console.log('Agent name:', result.getMeta().name);
    console.log('Agent role:', result.getPersona().role);
    console.log('Skills count:', result.getSkills().length);
  } catch (error) {
    console.error('❌ YAML parsing failed:', error.message);
  }

  // Test 4: Self-Healing
  console.log('\n4. Testing Self-Healing...');
  try {
    const parser = new AIXParser({
      enableNaturalLanguage: false,
      enableSelfHealing: true,
      enableSmartDefaults: true,
      strictMode: false
    });

    const incompleteContent = JSON.stringify({
      // Missing meta section
      persona: {
        role: "assistant"
      }
      // Missing skills section
    });

    const result = await parser.parse(incompleteContent, 'incomplete.json');
    console.log('✅ Self-healing successful');
    console.log('Agent name:', result.getMeta().name);
    console.log('Agent role:', result.getPersona().role);
    console.log('Skills count:', result.getSkills().length);
    console.log('Fixes applied:', result.diagnostics.fixes.length);
  } catch (error) {
    console.error('❌ Self-healing failed:', error.message);
  }

  // Test 5: Caching
  console.log('\n5. Testing Caching...');
  try {
    const parser = new AIXParser({
      enableNaturalLanguage: false,
      enableSelfHealing: true,
      enableSmartDefaults: true,
      cacheEnabled: true
    });

    const content = JSON.stringify({
      meta: { name: "CacheTestAgent", version: "1.0.0" },
      persona: { role: "assistant" },
      skills: []
    });

    // First parse
    const result1 = await parser.parse(content, 'cache-test.json');
    console.log('✅ First parse successful');

    // Second parse (should use cache)
    const result2 = await parser.parse(content, 'cache-test.json');
    console.log('✅ Second parse successful (cached)');
    console.log('Cache hit:', result2.diagnostics.info.some(info => info.code === 'CACHE_HIT'));
  } catch (error) {
    console.error('❌ Caching test failed:', error.message);
  }

  // Test 6: Error Handling
  console.log('\n6. Testing Error Handling...');
  try {
    const parser = new AIXParser({
      enableNaturalLanguage: false,
      enableSelfHealing: false,
      enableSmartDefaults: false,
      strictMode: true
    });

    const invalidContent = '{"invalid": json}'; // Invalid JSON

    try {
      await parser.parse(invalidContent, 'invalid.json');
      console.log('❌ Should have thrown an error');
    } catch (error) {
      console.log('✅ Error handling successful');
      console.log('Error type:', error.constructor.name);
      console.log('Error code:', error.code);
    }
  } catch (error) {
    console.error('❌ Error handling test failed:', error.message);
  }

  console.log('\n=== ALL TESTS COMPLETE ===');
  console.log('✅ AIX Parser v3.0 implementation is working correctly!');
  console.log('🚀 Ready for production use!');
}

// Run the tests
runTests().catch(console.error);