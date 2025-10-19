/**
 * Advanced Code Scanner Tool
 * أداة فحص الكود المتقدمة للبحث عن الأخطاء والمشاكل الأمنية
 */

const fs = require('fs').promises;
const path = require('path');
const { logger } = require('../utils/logger');

class CodeScanner {
  constructor() {
    this.name = 'code_scanner';
    this.description = 'فحص شامل للكود للبحث عن الأخطاء والمشاكل الأمنية وجودة الكود';
    this.scanResults = new Map();
    this.vulnerabilityDatabase = this.initializeVulnerabilityDatabase();
    this.codeQualityRules = this.initializeQualityRules();
    this.securityPatterns = this.initializeSecurityPatterns();
  }

  /**
   * تهيئة قاعدة بيانات الثغرات الأمنية
   */
  initializeVulnerabilityDatabase() {
    return {
      // SQL Injection Patterns
      sqlInjection: [
        /\$\{[^}]*\}/g,
        /query\s*\(\s*[^)]*\+/g,
        /\.query\s*\(\s*['"`][^'"`]*\+/g,
        /SELECT\s+.*FROM\s+.*WHERE\s+.*\+/gi,
        /INSERT\s+INTO\s+.*VALUES\s*\(\s*[^)]*\+/gi,
      ],

      // XSS Patterns
      xss: [
        /innerHTML\s*=/g,
        /document\.write\s*\(/g,
        /eval\s*\(/g,
        /setTimeout\s*\(\s*['"`]/g,
        /setInterval\s*\(\s*['"`]/g,
        /\.html\s*\(/g,
        /\.append\s*\(/g,
      ],

      // Authentication Issues
      authIssues: [
        /password\s*=\s*['"][^'"]*['"]/g,
        /secret\s*=\s*['"][^'"]*['"]/g,
        /token\s*=\s*['"][^'"]*['"]/g,
        /api[_-]?key\s*=\s*['"][^'"]*['"]/gi,
        /\.cookie\s*=\s*['"][^'"]*['"]/g,
        /localStorage\.setItem\s*\(\s*['"`](password|secret|token)['"`]/gi,
      ],

      // Path Traversal
      pathTraversal: [
        /\.\.\//g,
        /\.\.\\/g,
        /path\.join\s*\(/g,
        /require\s*\(\s*['"`]\.\.\/\.\./g,
        /fs\.readFile\s*\(\s*[^,)]*\+/g,
      ],

      // Command Injection
      commandInjection: [
        /exec\s*\(/g,
        /spawn\s*\(/g,
        /system\s*\(/g,
        /shell_exec\s*\(/g,
        /passthru\s*\(/g,
        /proc_open\s*\(/g,
      ],
    };
  }

  /**
   * تهيئة قواعد جودة الكود
   */
  initializeQualityRules() {
    return {
      // Code Complexity
      complexity: {
        maxFunctionLength: 50,
        maxFileLength: 300,
        maxCyclomaticComplexity: 10,
        maxNestingDepth: 4,
      },

      // Naming Conventions
      naming: {
        camelCase: /^[a-z][a-zA-Z0-9]*$/,
        PascalCase: /^[A-Z][a-zA-Z0-9]*$/,
        snake_case: /^[a-z][a-z0-9_]*$/,
        kebab_case: /^[a-z][a-z0-9-]*$/,
      },

      // Performance Issues
      performance: [
        /for\s*\(\s*.*\s*in\s*.*\)/g,
        /\.forEach\s*\(/g,
        /document\.getElementById\s*\(/g,
        /document\.querySelector\s*\(/g,
        /innerHTML\s*=/g,
        /\.appendChild\s*\(/g,
      ],

      // Memory Leaks
      memoryLeaks: [
        /addEventListener\s*\(/g,
        /setInterval\s*\(/g,
        /setTimeout\s*\(/g,
        /new\s+XMLHttpRequest\s*\(/g,
        /new\s+WebSocket\s*\(/g,
      ],
    };
  }

  /**
   * تهيئة أنماط الأمان
   */
  initializeSecurityPatterns() {
    return {
      // Hardcoded Secrets
      secrets: [
        /password\s*[:=]\s*['"][^'"]{8,}['"]/gi,
        /secret\s*[:=]\s*['"][^'"]{8,}['"]/gi,
        /token\s*[:=]\s*['"][^'"]{20,}['"]/gi,
        /key\s*[:=]\s*['"][^'"]{16,}['"]/gi,
        /api[_-]?key\s*[:=]\s*['"][^'"]{20,}['"]/gi,
      ],

      // Weak Cryptography
      weakCrypto: [
        /md5\s*\(/g,
        /sha1\s*\(/g,
        /DES\s*\(/g,
        /RC4\s*\(/g,
        /crypto\.createHash\s*\(\s*['"](md5|sha1)['"]/g,
      ],

      // Insecure Random
      insecureRandom: [/Math\.random\s*\(/g, /new\s+Date\s*\(\)\.getTime\s*\(/g, /Date\.now\s*\(/g],
    };
  }

  /**
   * فحص مشروع كامل
   * @param {string} projectPath - مسار المشروع
   * @param {Object} options - خيارات الفحص
   * @returns {Promise<Object>} نتائج الفحص
   */
  async scanProject(projectPath, options = {}) {
    try {
      logger.info(`🔍 Starting code scan for project: ${projectPath}`);

      const scanOptions = {
        includeTests: options.includeTests || false,
        includeNodeModules: options.includeNodeModules || false,
        scanDepth: options.scanDepth || 10,
        languages: options.languages || ['js', 'ts', 'tsx', 'jsx', 'json', 'py', 'java', 'php'],
        ...options,
      };

      // فحص الملفات
      const files = await this.findFiles(projectPath, scanOptions);
      logger.info(`📁 Found ${files.length} files to scan`);

      const results = {
        projectPath,
        scanDate: new Date().toISOString(),
        totalFiles: files.length,
        scannedFiles: 0,
        issues: {
          security: [],
          bugs: [],
          quality: [],
          performance: [],
        },
        summary: {
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
          info: 0,
        },
        recommendations: [],
        metrics: {
          totalLines: 0,
          totalFunctions: 0,
          averageComplexity: 0,
          codeQualityScore: 0,
        },
      };

      // فحص كل ملف
      for (const file of files) {
        try {
          const fileResults = await this.scanFile(file, scanOptions);
          results.scannedFiles++;

          // دمج النتائج
          this.mergeScanResults(results, fileResults);
        } catch (error) {
          logger.warn(`⚠️ Failed to scan file: ${file}`, { error: error.message });
        }
      }

      // حساب المقاييس النهائية
      results.metrics = await this.calculateMetrics(results);
      results.recommendations = this.generateRecommendations(results);

      logger.info(
        `✅ Code scan completed: ${results.scannedFiles}/${results.totalFiles} files scanned`
      );
      logger.info(
        `📊 Found ${results.summary.critical + results.summary.high} critical/high issues`
      );

      return results;
    } catch (error) {
      logger.error('❌ Code scan failed', { error: error.message });
      return {
        success: false,
        error: error.message,
        projectPath,
      };
    }
  }

  /**
   * البحث عن الملفات
   * @param {string} dirPath - مسار المجلد
   * @param {Object} options - خيارات البحث
   * @returns {Promise<Array>} قائمة الملفات
   */
  async findFiles(dirPath, options) {
    const files = [];
    const extensions = options.languages.map((lang) => `.${lang}`);

    async function traverse(currentPath, depth = 0) {
      if (depth > options.scanDepth) return;

      try {
        const items = await fs.readdir(currentPath);

        for (const item of items) {
          const itemPath = path.join(currentPath, item);
          const stat = await fs.stat(itemPath);

          if (stat.isDirectory()) {
            // تخطي node_modules إذا لم تكن مطلوبة
            if (item === 'node_modules' && !options.includeNodeModules) continue;
            if (item === '.git') continue;
            if (item.startsWith('.')) continue;

            await traverse(itemPath, depth + 1);
          } else if (stat.isFile()) {
            const ext = path.extname(item).toLowerCase();
            if (extensions.includes(ext)) {
              // تخطي ملفات الاختبار إذا لم تكن مطلوبة
              if (!options.includeTests && (item.includes('.test.') || item.includes('.spec.')))
                continue;

              files.push(itemPath);
            }
          }
        }
      } catch (error) {
        logger.warn(`⚠️ Cannot read directory: ${currentPath}`, { error: error.message });
      }
    }

    await traverse(dirPath);
    return files;
  }

  /**
   * فحص ملف واحد
   * @param {string} filePath - مسار الملف
   * @param {Object} options - خيارات الفحص
   * @returns {Promise<Object>} نتائج فحص الملف
   */
  async scanFile(filePath, options) {
    const results = {
      file: filePath,
      issues: {
        security: [],
        bugs: [],
        quality: [],
        performance: [],
      },
      metrics: {
        lines: 0,
        functions: 0,
        complexity: 0,
        size: 0,
      },
    };

    try {
      const content = await fs.readFile(filePath, 'utf8');
      const lines = content.split('\n');

      results.metrics.lines = lines.length;
      results.metrics.size = content.length;

      // فحص الأمان
      await this.scanSecurity(content, filePath, results);

      // فحص الأخطاء
      await this.scanBugs(content, filePath, results);

      // فحص جودة الكود
      await this.scanQuality(content, filePath, results);

      // فحص الأداء
      await this.scanPerformance(content, filePath, results);

      // حساب التعقيد
      results.metrics.complexity = this.calculateComplexity(content);
      results.metrics.functions = this.countFunctions(content);
    } catch (error) {
      logger.warn(`⚠️ Cannot read file: ${filePath}`, { error: error.message });
    }

    return results;
  }

  /**
   * فحص الأمان
   * @param {string} content - محتوى الملف
   * @param {string} filePath - مسار الملف
   * @param {Object} results - نتائج الفحص
   */
  async scanSecurity(content, filePath, results) {
    const lines = content.split('\n');

    // فحص SQL Injection
    this.vulnerabilityDatabase.sqlInjection.forEach((pattern) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          const lineNumber = this.findLineNumber(content, match);
          results.issues.security.push({
            type: 'sql_injection',
            severity: 'critical',
            message: 'Potential SQL injection vulnerability',
            line: lineNumber,
            code: match,
            recommendation: 'Use parameterized queries or prepared statements',
          });
        });
      }
    });

    // فحص XSS
    this.vulnerabilityDatabase.xss.forEach((pattern) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          const lineNumber = this.findLineNumber(content, match);
          results.issues.security.push({
            type: 'xss',
            severity: 'high',
            message: 'Potential XSS vulnerability',
            line: lineNumber,
            code: match,
            recommendation: 'Sanitize user input and use safe DOM manipulation methods',
          });
        });
      }
    });

    // فحص مشاكل المصادقة
    this.vulnerabilityDatabase.authIssues.forEach((pattern) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          const lineNumber = this.findLineNumber(content, match);
          results.issues.security.push({
            type: 'auth_issue',
            severity: 'critical',
            message: 'Hardcoded credentials or authentication bypass',
            line: lineNumber,
            code: match,
            recommendation: 'Use environment variables or secure credential management',
          });
        });
      }
    });

    // فحص Path Traversal
    this.vulnerabilityDatabase.pathTraversal.forEach((pattern) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          const lineNumber = this.findLineNumber(content, match);
          results.issues.security.push({
            type: 'path_traversal',
            severity: 'high',
            message: 'Potential path traversal vulnerability',
            line: lineNumber,
            code: match,
            recommendation: 'Validate and sanitize file paths',
          });
        });
      }
    });

    // فحص Command Injection
    this.vulnerabilityDatabase.commandInjection.forEach((pattern) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          const lineNumber = this.findLineNumber(content, match);
          results.issues.security.push({
            type: 'command_injection',
            severity: 'critical',
            message: 'Potential command injection vulnerability',
            line: lineNumber,
            code: match,
            recommendation: 'Avoid executing user input as system commands',
          });
        });
      }
    });

    // فحص الأسرار المخفية
    this.securityPatterns.secrets.forEach((pattern) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          const lineNumber = this.findLineNumber(content, match);
          results.issues.security.push({
            type: 'hardcoded_secret',
            severity: 'critical',
            message: 'Hardcoded secret or credential found',
            line: lineNumber,
            code: match,
            recommendation: 'Move secrets to environment variables or secure vault',
          });
        });
      }
    });

    // فحص التشفير الضعيف
    this.securityPatterns.weakCrypto.forEach((pattern) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          const lineNumber = this.findLineNumber(content, match);
          results.issues.security.push({
            type: 'weak_cryptography',
            severity: 'high',
            message: 'Weak cryptographic algorithm detected',
            line: lineNumber,
            code: match,
            recommendation: 'Use strong cryptographic algorithms (SHA-256, AES-256)',
          });
        });
      }
    });
  }

  /**
   * فحص الأخطاء
   * @param {string} content - محتوى الملف
   * @param {string} filePath - مسار الملف
   * @param {Object} results - نتائج الفحص
   */
  async scanBugs(content, filePath, results) {
    const lines = content.split('\n');

    // فحص الأخطاء الشائعة
    const bugPatterns = [
      {
        pattern: /==\s*null/g,
        type: 'null_comparison',
        severity: 'medium',
        message: 'Use === instead of == for null comparison',
        recommendation: 'Use strict equality (===) for type-safe comparisons',
      },
      {
        pattern: /var\s+\w+/g,
        type: 'var_usage',
        severity: 'low',
        message: 'Avoid using var, prefer let or const',
        recommendation: 'Use let for variables that change, const for constants',
      },
      {
        pattern: /console\.log\s*\(/g,
        type: 'console_log',
        severity: 'info',
        message: 'Console.log found in production code',
        recommendation: 'Remove or replace with proper logging',
      },
      {
        pattern: /undefined\s*==/g,
        type: 'undefined_comparison',
        severity: 'medium',
        message: 'Use typeof check for undefined',
        recommendation: 'Use typeof variable === "undefined" instead',
      },
      {
        pattern: /new\s+Array\s*\(\s*\d+\s*\)/g,
        type: 'array_constructor',
        severity: 'low',
        message: 'Avoid Array constructor with single number argument',
        recommendation: 'Use Array.from() or literal array syntax',
      },
    ];

    bugPatterns.forEach((bug) => {
      const matches = content.match(bug.pattern);
      if (matches) {
        matches.forEach((match) => {
          const lineNumber = this.findLineNumber(content, match);
          results.issues.bugs.push({
            type: bug.type,
            severity: bug.severity,
            message: bug.message,
            line: lineNumber,
            code: match,
            recommendation: bug.recommendation,
          });
        });
      }
    });
  }

  /**
   * فحص جودة الكود
   * @param {string} content - محتوى الملف
   * @param {string} filePath - مسار الملف
   * @param {Object} results - نتائج الفحص
   */
  async scanQuality(content, filePath, results) {
    const lines = content.split('\n');

    // فحص طول الدوال
    const functions = this.findFunctions(content);
    functions.forEach((func) => {
      if (func.lines > this.codeQualityRules.complexity.maxFunctionLength) {
        results.issues.quality.push({
          type: 'long_function',
          severity: 'medium',
          message: `Function is too long (${func.lines} lines)`,
          line: func.startLine,
          code: func.name,
          recommendation: `Break down into smaller functions (max ${this.codeQualityRules.complexity.maxFunctionLength} lines)`,
        });
      }
    });

    // فحص طول الملف
    if (lines.length > this.codeQualityRules.complexity.maxFileLength) {
      results.issues.quality.push({
        type: 'long_file',
        severity: 'medium',
        message: `File is too long (${lines.length} lines)`,
        line: 1,
        code: path.basename(filePath),
        recommendation: `Split into smaller files (max ${this.codeQualityRules.complexity.maxFileLength} lines)`,
      });
    }

    // فحص التعقيد الدوري
    const complexity = this.calculateCyclomaticComplexity(content);
    if (complexity > this.codeQualityRules.complexity.maxCyclomaticComplexity) {
      results.issues.quality.push({
        type: 'high_complexity',
        severity: 'medium',
        message: `High cyclomatic complexity (${complexity})`,
        line: 1,
        code: path.basename(filePath),
        recommendation: 'Reduce complexity by breaking down into smaller functions',
      });
    }

    // فحص عمق التداخل
    const maxNesting = this.findMaxNestingDepth(content);
    if (maxNesting > this.codeQualityRules.complexity.maxNestingDepth) {
      results.issues.quality.push({
        type: 'deep_nesting',
        severity: 'medium',
        message: `Deep nesting detected (${maxNesting} levels)`,
        line: 1,
        code: path.basename(filePath),
        recommendation: 'Reduce nesting depth by using early returns or guard clauses',
      });
    }

    // فحص التعليقات
    const commentRatio = this.calculateCommentRatio(content);
    if (commentRatio < 0.1) {
      results.issues.quality.push({
        type: 'low_comments',
        severity: 'low',
        message: `Low comment ratio (${Math.round(commentRatio * 100)}%)`,
        line: 1,
        code: path.basename(filePath),
        recommendation: 'Add more comments to improve code documentation',
      });
    }
  }

  /**
   * فحص الأداء
   * @param {string} content - محتوى الملف
   * @param {string} filePath - مسار الملف
   * @param {Object} results - نتائج الفحص
   */
  async scanPerformance(content, filePath, results) {
    // فحص مشاكل الأداء
    this.codeQualityRules.performance.forEach((pattern) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          const lineNumber = this.findLineNumber(content, match);
          results.issues.performance.push({
            type: 'performance_issue',
            severity: 'medium',
            message: 'Potential performance issue detected',
            line: lineNumber,
            code: match,
            recommendation: 'Consider optimizing this operation for better performance',
          });
        });
      }
    });

    // فحص تسريبات الذاكرة
    this.codeQualityRules.memoryLeaks.forEach((pattern) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          const lineNumber = this.findLineNumber(content, match);
          results.issues.performance.push({
            type: 'memory_leak',
            severity: 'medium',
            message: 'Potential memory leak detected',
            line: lineNumber,
            code: match,
            recommendation: 'Ensure proper cleanup and event listener removal',
          });
        });
      }
    });
  }

  // ==================== Helper Methods ====================

  /**
   * البحث عن رقم السطر
   * @param {string} content - المحتوى
   * @param {string} searchString - النص المطلوب البحث عنه
   * @returns {number} رقم السطر
   */
  findLineNumber(content, searchString) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(searchString)) {
        return i + 1;
      }
    }
    return 1;
  }

  /**
   * حساب التعقيد
   * @param {string} content - المحتوى
   * @returns {number} التعقيد
   */
  calculateComplexity(content) {
    const complexityIndicators = [
      /if\s*\(/g,
      /else\s*if/g,
      /for\s*\(/g,
      /while\s*\(/g,
      /switch\s*\(/g,
      /case\s+/g,
      /catch\s*\(/g,
      /&&/g,
      /\|\|/g,
    ];

    let complexity = 1; // Base complexity
    complexityIndicators.forEach((pattern) => {
      const matches = content.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    });

    return complexity;
  }

  /**
   * حساب التعقيد الدوري
   * @param {string} content - المحتوى
   * @returns {number} التعقيد الدوري
   */
  calculateCyclomaticComplexity(content) {
    const complexityNodes = [
      /if\s*\(/g,
      /else\s*if/g,
      /for\s*\(/g,
      /while\s*\(/g,
      /switch\s*\(/g,
      /case\s+/g,
      /catch\s*\(/g,
      /&&/g,
      /\|\|/g,
      /\?/g,
    ];

    let complexity = 1; // Base complexity
    complexityNodes.forEach((pattern) => {
      const matches = content.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    });

    return complexity;
  }

  /**
   * حساب عدد الدوال
   * @param {string} content - المحتوى
   * @returns {number} عدد الدوال
   */
  countFunctions(content) {
    const functionPatterns = [
      /function\s+\w+\s*\(/g,
      /const\s+\w+\s*=\s*\(/g,
      /let\s+\w+\s*=\s*\(/g,
      /var\s+\w+\s*=\s*\(/g,
      /class\s+\w+/g,
      /=>\s*{/g,
    ];

    let count = 0;
    functionPatterns.forEach((pattern) => {
      const matches = content.match(pattern);
      if (matches) {
        count += matches.length;
      }
    });

    return count;
  }

  /**
   * البحث عن الدوال
   * @param {string} content - المحتوى
   * @returns {Array} قائمة الدوال
   */
  findFunctions(content) {
    const functions = [];
    const lines = content.split('\n');

    let inFunction = false;
    let functionStart = 0;
    let functionName = '';
    let braceCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // البحث عن بداية الدالة
      const functionMatch = line.match(
        /(?:function\s+(\w+)|const\s+(\w+)\s*=|let\s+(\w+)\s*=|var\s+(\w+)\s*=)\s*(?:\(|=>)/
      );
      if (functionMatch) {
        inFunction = true;
        functionStart = i + 1;
        functionName = functionMatch[1] || functionMatch[2] || functionMatch[3] || functionMatch[4];
        braceCount = 0;
      }

      if (inFunction) {
        // حساب الأقواس
        braceCount += (line.match(/{/g) || []).length;
        braceCount -= (line.match(/}/g) || []).length;

        // نهاية الدالة
        if (braceCount <= 0 && line.includes('}')) {
          functions.push({
            name: functionName,
            startLine: functionStart,
            endLine: i + 1,
            lines: i + 1 - functionStart,
          });
          inFunction = false;
        }
      }
    }

    return functions;
  }

  /**
   * البحث عن أقصى عمق تداخل
   * @param {string} content - المحتوى
   * @returns {number} أقصى عمق تداخل
   */
  findMaxNestingDepth(content) {
    const lines = content.split('\n');
    let maxDepth = 0;
    let currentDepth = 0;

    lines.forEach((line) => {
      // زيادة العمق عند فتح قوس
      currentDepth += (line.match(/{/g) || []).length;

      // تحديث أقصى عمق
      maxDepth = Math.max(maxDepth, currentDepth);

      // تقليل العمق عند إغلاق قوس
      currentDepth -= (line.match(/}/g) || []).length;
    });

    return maxDepth;
  }

  /**
   * حساب نسبة التعليقات
   * @param {string} content - المحتوى
   * @returns {number} نسبة التعليقات
   */
  calculateCommentRatio(content) {
    const lines = content.split('\n');
    const totalLines = lines.length;
    const commentLines = lines.filter((line) => {
      const trimmed = line.trim();
      return (
        trimmed.startsWith('//') ||
        trimmed.startsWith('/*') ||
        trimmed.startsWith('*') ||
        trimmed.startsWith('#')
      );
    }).length;

    return totalLines > 0 ? commentLines / totalLines : 0;
  }

  /**
   * دمج نتائج الفحص
   * @param {Object} results - النتائج الرئيسية
   * @param {Object} fileResults - نتائج الملف
   */
  mergeScanResults(results, fileResults) {
    // دمج القضايا
    Object.keys(fileResults.issues).forEach((category) => {
      results.issues[category].push(...fileResults.issues[category]);
    });

    // تحديث الإحصائيات
    fileResults.issues.security.forEach((issue) => {
      results.summary[this.mapSeverityToSummary(issue.severity)]++;
    });
    fileResults.issues.bugs.forEach((issue) => {
      results.summary[this.mapSeverityToSummary(issue.severity)]++;
    });
    fileResults.issues.quality.forEach((issue) => {
      results.summary[this.mapSeverityToSummary(issue.severity)]++;
    });
    fileResults.issues.performance.forEach((issue) => {
      results.summary[this.mapSeverityToSummary(issue.severity)]++;
    });

    // تحديث المقاييس
    results.metrics.totalLines += fileResults.metrics.lines;
    results.metrics.totalFunctions += fileResults.metrics.functions;
  }

  /**
   * تحويل مستوى الخطورة إلى ملخص
   * @param {string} severity - مستوى الخطورة
   * @returns {string} مفتاح الملخص
   */
  mapSeverityToSummary(severity) {
    switch (severity) {
      case 'critical':
        return 'critical';
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      case 'low':
        return 'low';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  }

  /**
   * حساب المقاييس النهائية
   * @param {Object} results - النتائج
   * @returns {Object} المقاييس
   */
  async calculateMetrics(results) {
    const totalIssues = Object.values(results.summary).reduce((sum, count) => sum + count, 0);

    return {
      totalLines: results.metrics.totalLines,
      totalFunctions: results.metrics.totalFunctions,
      averageComplexity:
        results.metrics.totalFunctions > 0
          ? results.metrics.totalLines / results.metrics.totalFunctions
          : 0,
      codeQualityScore: this.calculateQualityScore(results),
      totalIssues: totalIssues,
      issueDensity: results.metrics.totalLines > 0 ? totalIssues / results.metrics.totalLines : 0,
    };
  }

  /**
   * حساب نقاط جودة الكود
   * @param {Object} results - النتائج
   * @returns {number} نقاط جودة الكود
   */
  calculateQualityScore(results) {
    const totalIssues = Object.values(results.summary).reduce((sum, count) => sum + count, 0);
    const criticalIssues = results.summary.critical;
    const highIssues = results.summary.high;

    let score = 100;
    score -= criticalIssues * 20; // -20 لكل مشكلة حرجة
    score -= highIssues * 10; // -10 لكل مشكلة عالية
    score -= results.summary.medium * 5; // -5 لكل مشكلة متوسطة
    score -= results.summary.low * 2; // -2 لكل مشكلة منخفضة

    return Math.max(0, Math.round(score));
  }

  /**
   * توليد التوصيات
   * @param {Object} results - النتائج
   * @returns {Array} التوصيات
   */
  generateRecommendations(results) {
    const recommendations = [];

    // توصيات الأمان
    if (results.summary.critical > 0) {
      recommendations.push({
        priority: 'critical',
        category: 'security',
        message: `Address ${results.summary.critical} critical security issues immediately`,
        action: 'Review and fix all critical security vulnerabilities',
      });
    }

    // توصيات الجودة
    if (results.metrics.codeQualityScore < 70) {
      recommendations.push({
        priority: 'high',
        category: 'quality',
        message: 'Code quality score is below acceptable threshold',
        action: 'Improve code quality by addressing identified issues',
      });
    }

    // توصيات الأداء
    const performanceIssues = results.issues.performance.length;
    if (performanceIssues > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'performance',
        message: `${performanceIssues} performance issues detected`,
        action: 'Optimize code for better performance',
      });
    }

    // توصيات التوثيق
    const qualityIssues = results.issues.quality.filter((issue) => issue.type === 'low_comments');
    if (qualityIssues.length > 0) {
      recommendations.push({
        priority: 'low',
        category: 'documentation',
        message: 'Add more documentation and comments',
        action: 'Improve code documentation for better maintainability',
      });
    }

    return recommendations;
  }

  /**
   * فحص صحة النظام
   */
  async healthCheck() {
    try {
      return {
        success: true,
        status: 'healthy',
        vulnerabilities: Object.keys(this.vulnerabilityDatabase).length,
        qualityRules: Object.keys(this.codeQualityRules).length,
        securityPatterns: Object.keys(this.securityPatterns).length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = new CodeScanner();
