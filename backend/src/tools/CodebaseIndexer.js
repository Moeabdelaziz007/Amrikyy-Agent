/**
 * Comprehensive Codebase Indexer Tool
 * أداة فهرسة شاملة للمستودع البرمجي
 */

const fs = require('fs').promises;
const path = require('path');
const { logger } = require('../utils/logger');

class CodebaseIndexer {
  constructor() {
    this.name = 'codebase_indexer';
    this.description = 'فهرسة شاملة للمستودع البرمجي مع تحليل معماري ونمط';
    this.index = new Map();
    this.architecture = new Map();
    this.patterns = new Map();
    this.dependencies = new Map();
    this.metrics = new Map();
  }

  /**
   * فهرسة المشروع بالكامل
   * @param {string} projectPath - مسار المشروع
   * @param {Object} options - خيارات الفهرسة
   * @returns {Promise<Object>} الفهرس الشامل
   */
  async indexProject(projectPath, options = {}) {
    try {
      logger.info(`📚 Starting comprehensive codebase indexing: ${projectPath}`);

      const indexOptions = {
        includeTests: options.includeTests || false,
        includeNodeModules: options.includeNodeModules || false,
        includeDocs: options.includeDocs || true,
        maxDepth: options.maxDepth || 10,
        languages: options.languages || [
          'js',
          'ts',
          'tsx',
          'jsx',
          'json',
          'md',
          'py',
          'java',
          'php',
        ],
        ...options,
      };

      // إعادة تعيين الفهرس
      this.index.clear();
      this.architecture.clear();
      this.patterns.clear();
      this.dependencies.clear();
      this.metrics.clear();

      // فهرسة الملفات
      await this.indexFiles(projectPath, indexOptions);

      // تحليل البنية المعمارية
      await this.analyzeArchitecture();

      // استخراج الأنماط
      await this.extractPatterns();

      // تحليل التبعيات
      await this.analyzeDependencies();

      // حساب المقاييس
      await this.calculateMetrics();

      const comprehensiveIndex = {
        projectPath,
        indexDate: new Date().toISOString(),
        summary: {
          totalFiles: this.index.size,
          totalLines: this.getTotalLines(),
          totalFunctions: this.getTotalFunctions(),
          totalClasses: this.getTotalClasses(),
          architectureLevel: this.getArchitectureLevel(),
          patternCount: this.getPatternCount(),
        },
        files: Object.fromEntries(this.index),
        architecture: Object.fromEntries(this.architecture),
        patterns: Object.fromEntries(this.patterns),
        dependencies: Object.fromEntries(this.dependencies),
        metrics: Object.fromEntries(this.metrics),
        insights: this.generateInsights(),
        recommendations: this.generateRecommendations(),
      };

      logger.info(
        `✅ Codebase indexing completed: ${comprehensiveIndex.summary.totalFiles} files indexed`
      );
      logger.info(`🏗️ Architecture level: ${comprehensiveIndex.summary.architectureLevel}`);
      logger.info(`📊 Patterns discovered: ${comprehensiveIndex.summary.patternCount}`);

      return comprehensiveIndex;
    } catch (error) {
      logger.error('❌ Codebase indexing failed', { error: error.message });
      return {
        success: false,
        error: error.message,
        projectPath,
      };
    }
  }

  /**
   * فهرسة الملفات
   * @param {string} dirPath - مسار المجلد
   * @param {Object} options - خيارات الفهرسة
   */
  async indexFiles(dirPath, options) {
    const extensions = options.languages.map((lang) => `.${lang}`);

    async function traverse(currentPath, depth = 0) {
      if (depth > options.maxDepth) {
        return;
      }

      try {
        const items = await fs.readdir(currentPath);

        for (const item of items) {
          const itemPath = path.join(currentPath, item);
          const stat = await fs.stat(itemPath);

          if (stat.isDirectory()) {
            // تخطي المجلدات غير المرغوبة
            if (item === 'node_modules' && !options.includeNodeModules) {
              continue;
            }
            if (item === '.git') {
              continue;
            }
            if (item.startsWith('.') && item !== '.env') {
              continue;
            }

            await traverse(itemPath, depth + 1);
          } else if (stat.isFile()) {
            const ext = path.extname(item).toLowerCase();
            if (extensions.includes(ext)) {
              // تخطي ملفات الاختبار إذا لم تكن مطلوبة
              if (!options.includeTests && (item.includes('.test.') || item.includes('.spec.'))) {
                continue;
              }

              await this.indexFile(itemPath, options);
            }
          }
        }
      } catch (error) {
        logger.warn(`⚠️ Cannot read directory: ${currentPath}`, { error: error.message });
      }
    }

    await traverse(dirPath);
  }

  /**
   * فهرسة ملف واحد
   * @param {string} filePath - مسار الملف
   * @param {Object} options - خيارات الفهرسة
   */
  async indexFile(filePath, options) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const relativePath = path.relative(process.cwd(), filePath);
      const ext = path.extname(filePath).toLowerCase();

      const fileInfo = {
        path: relativePath,
        absolutePath: filePath,
        extension: ext,
        size: content.length,
        lines: content.split('\n').length,
        language: this.detectLanguage(ext, content),
        type: this.detectFileType(filePath, content),
        lastModified: (await fs.stat(filePath)).mtime.toISOString(),

        // تحليل المحتوى
        functions: this.extractFunctions(content),
        classes: this.extractClasses(content),
        imports: this.extractImports(content),
        exports: this.extractExports(content),

        // تحليل الأنماط
        patterns: this.detectFilePatterns(content, filePath),

        // تحليل التبعيات
        dependencies: this.extractDependencies(content, ext),

        // مقاييس الجودة
        complexity: this.calculateFileComplexity(content),
        maintainability: this.calculateMaintainability(content),

        // تحليل الأمان
        securityIssues: this.detectSecurityIssues(content),

        // تحليل الأداء
        performanceIssues: this.detectPerformanceIssues(content),

        // تحليل التوثيق
        documentation: this.analyzeDocumentation(content),

        // تحليل الاختبارات
        testCoverage: this.analyzeTestCoverage(content, filePath),
      };

      this.index.set(relativePath, fileInfo);
    } catch (error) {
      logger.warn(`⚠️ Cannot index file: ${filePath}`, { error: error.message });
    }
  }

  /**
   * تحليل البنية المعمارية
   */
  async analyzeArchitecture() {
    const files = Array.from(this.index.values());

    // تحليل طبقات النظام
    this.architecture.set('layers', this.analyzeLayers(files));

    // تحليل المكونات
    this.architecture.set('components', this.analyzeComponents(files));

    // تحليل الخدمات
    this.architecture.set('services', this.analyzeServices(files));

    // تحليل النماذج
    this.architecture.set('models', this.analyzeModels(files));

    // تحليل الواجهات
    this.architecture.set('interfaces', this.analyzeInterfaces(files));

    // تحليل التكوين
    this.architecture.set('configuration', this.analyzeConfiguration(files));

    // تحليل الاختبارات
    this.architecture.set('tests', this.analyzeTests(files));

    // تحليل التوثيق
    this.architecture.set('documentation', this.analyzeDocumentationFiles(files));
  }

  /**
   * تحليل طبقات النظام
   * @param {Array} files - الملفات
   * @returns {Object} تحليل الطبقات
   */
  analyzeLayers(files) {
    const layers = {
      presentation: [],
      business: [],
      data: [],
      infrastructure: [],
      utils: [],
    };

    files.forEach((file) => {
      const path = file.path.toLowerCase();

      if (path.includes('component') || path.includes('view') || path.includes('page')) {
        layers.presentation.push(file);
      } else if (
        path.includes('service') ||
        path.includes('controller') ||
        path.includes('handler')
      ) {
        layers.business.push(file);
      } else if (path.includes('model') || path.includes('entity') || path.includes('schema')) {
        layers.data.push(file);
      } else if (path.includes('config') || path.includes('middleware') || path.includes('route')) {
        layers.infrastructure.push(file);
      } else if (path.includes('util') || path.includes('helper') || path.includes('tool')) {
        layers.utils.push(file);
      }
    });

    return layers;
  }

  /**
   * تحليل المكونات
   * @param {Array} files - الملفات
   * @returns {Object} تحليل المكونات
   */
  analyzeComponents(files) {
    const components = {
      react: [],
      angular: [],
      vue: [],
      vanilla: [],
    };

    files.forEach((file) => {
      if (file.extension === '.tsx' || file.extension === '.jsx') {
        components.react.push(file);
      } else if (file.path.includes('angular') || file.extension === '.component.ts') {
        components.angular.push(file);
      } else if (file.extension === '.vue') {
        components.vue.push(file);
      } else if (file.extension === '.html' || file.extension === '.htm') {
        components.vanilla.push(file);
      }
    });

    return components;
  }

  /**
   * تحليل الخدمات
   * @param {Array} files - الملفات
   * @returns {Object} تحليل الخدمات
   */
  analyzeServices(files) {
    const services = {
      api: [],
      database: [],
      external: [],
      internal: [],
    };

    files.forEach((file) => {
      const content = file.path.toLowerCase();

      if (content.includes('api') || content.includes('endpoint')) {
        services.api.push(file);
      } else if (
        content.includes('database') ||
        content.includes('db') ||
        content.includes('model')
      ) {
        services.database.push(file);
      } else if (content.includes('external') || content.includes('third-party')) {
        services.external.push(file);
      } else if (content.includes('service')) {
        services.internal.push(file);
      }
    });

    return services;
  }

  /**
   * تحليل النماذج
   * @param {Array} files - الملفات
   * @returns {Object} تحليل النماذج
   */
  analyzeModels(files) {
    const models = {
      data: [],
      domain: [],
      view: [],
      api: [],
    };

    files.forEach((file) => {
      const path = file.path.toLowerCase();

      if (path.includes('model') || path.includes('entity')) {
        models.data.push(file);
      } else if (path.includes('domain')) {
        models.domain.push(file);
      } else if (path.includes('viewmodel') || path.includes('view-model')) {
        models.view.push(file);
      } else if (path.includes('api-model') || path.includes('dto')) {
        models.api.push(file);
      }
    });

    return models;
  }

  /**
   * تحليل الواجهات
   * @param {Array} files - الملفات
   * @returns {Object} تحليل الواجهات
   */
  analyzeInterfaces(files) {
    const interfaces = {
      api: [],
      service: [],
      data: [],
    };

    files.forEach((file) => {
      const path = file.path.toLowerCase();

      if (path.includes('api') && path.includes('interface')) {
        interfaces.api.push(file);
      } else if (path.includes('service') && path.includes('interface')) {
        interfaces.service.push(file);
      } else if (path.includes('data') && path.includes('interface')) {
        interfaces.data.push(file);
      }
    });

    return interfaces;
  }

  /**
   * تحليل التكوين
   * @param {Array} files - الملفات
   * @returns {Object} تحليل التكوين
   */
  analyzeConfiguration(files) {
    const config = {
      environment: [],
      database: [],
      application: [],
      security: [],
    };

    files.forEach((file) => {
      const path = file.path.toLowerCase();

      if (path.includes('.env') || path.includes('environment')) {
        config.environment.push(file);
      } else if (path.includes('database') && path.includes('config')) {
        config.database.push(file);
      } else if (path.includes('app') && path.includes('config')) {
        config.application.push(file);
      } else if (path.includes('security') && path.includes('config')) {
        config.security.push(file);
      }
    });

    return config;
  }

  /**
   * تحليل الاختبارات
   * @param {Array} files - الملفات
   * @returns {Object} تحليل الاختبارات
   */
  analyzeTests(files) {
    const tests = {
      unit: [],
      integration: [],
      e2e: [],
      performance: [],
    };

    files.forEach((file) => {
      const path = file.path.toLowerCase();

      if (path.includes('.test.') || path.includes('.spec.')) {
        if (path.includes('integration')) {
          tests.integration.push(file);
        } else if (path.includes('e2e') || path.includes('end-to-end')) {
          tests.e2e.push(file);
        } else if (path.includes('performance') || path.includes('benchmark')) {
          tests.performance.push(file);
        } else {
          tests.unit.push(file);
        }
      }
    });

    return tests;
  }

  /**
   * تحليل التوثيق
   * @param {Array} files - الملفات
   * @returns {Object} تحليل التوثيق
   */
  analyzeDocumentationFiles(files) {
    const docs = {
      api: [],
      user: [],
      technical: [],
      readme: [],
    };

    files.forEach((file) => {
      const path = file.path.toLowerCase();

      if (path.includes('api') && path.includes('doc')) {
        docs.api.push(file);
      } else if (path.includes('user') && path.includes('guide')) {
        docs.user.push(file);
      } else if (path.includes('technical') || path.includes('architecture')) {
        docs.technical.push(file);
      } else if (path.includes('readme') || path.includes('.md')) {
        docs.readme.push(file);
      }
    });

    return docs;
  }

  /**
   * استخراج الأنماط
   */
  async extractPatterns() {
    const files = Array.from(this.index.values());

    // أنماط التصميم
    this.patterns.set('design', this.extractDesignPatterns(files));

    // أنماط البرمجة
    this.patterns.set('programming', this.extractProgrammingPatterns(files));

    // أنماط المعمارية
    this.patterns.set('architectural', this.extractArchitecturalPatterns(files));

    // أنماط الاختبار
    this.patterns.set('testing', this.extractTestingPatterns(files));

    // أنماط الأمان
    this.patterns.set('security', this.extractSecurityPatterns(files));
  }

  /**
   * استخراج أنماط التصميم
   * @param {Array} files - الملفات
   * @returns {Object} أنماط التصميم
   */
  extractDesignPatterns(files) {
    const patterns = {
      singleton: [],
      factory: [],
      observer: [],
      strategy: [],
      decorator: [],
      adapter: [],
      facade: [],
      proxy: [],
    };

    files.forEach((file) => {
      const content = file.content || '';

      // Singleton Pattern
      if (/getInstance\s*\(/g.test(content) || /static\s+instance/g.test(content)) {
        patterns.singleton.push(file);
      }

      // Factory Pattern
      if (/create\w+\s*\(/g.test(content) || /Factory/g.test(content)) {
        patterns.factory.push(file);
      }

      // Observer Pattern
      if (/addEventListener|on\(|emit\(|subscribe\(/g.test(content)) {
        patterns.observer.push(file);
      }

      // Strategy Pattern
      if (/strategy|algorithm|execute\s*\(/g.test(content)) {
        patterns.strategy.push(file);
      }

      // Decorator Pattern
      if (/@\w+|decorator|wrapper/g.test(content)) {
        patterns.decorator.push(file);
      }

      // Adapter Pattern
      if (/adapter|adapt\s*\(/g.test(content)) {
        patterns.adapter.push(file);
      }

      // Facade Pattern
      if (/facade|simplify|unified/g.test(content)) {
        patterns.facade.push(file);
      }

      // Proxy Pattern
      if (/proxy|intercept|middleware/g.test(content)) {
        patterns.proxy.push(file);
      }
    });

    return patterns;
  }

  /**
   * استخراج أنماط البرمجة
   * @param {Array} files - الملفات
   * @returns {Object} أنماط البرمجة
   */
  extractProgrammingPatterns(files) {
    const patterns = {
      functional: [],
      objectOriented: [],
      procedural: [],
      reactive: [],
    };

    files.forEach((file) => {
      const content = file.content || '';

      // Functional Programming
      if (/map\s*\(|filter\s*\(|reduce\s*\(|forEach\s*\(/g.test(content)) {
        patterns.functional.push(file);
      }

      // Object-Oriented Programming
      if (/class\s+\w+|extends\s+\w+|implements\s+\w+/g.test(content)) {
        patterns.objectOriented.push(file);
      }

      // Procedural Programming
      if (/function\s+\w+|procedure\s+\w+/g.test(content)) {
        patterns.procedural.push(file);
      }

      // Reactive Programming
      if (/observable|subscribe|stream|rx/g.test(content)) {
        patterns.reactive.push(file);
      }
    });

    return patterns;
  }

  /**
   * استخراج الأنماط المعمارية
   * @param {Array} files - الملفات
   * @returns {Object} الأنماط المعمارية
   */
  extractArchitecturalPatterns(files) {
    const patterns = {
      mvc: [],
      microservices: [],
      layered: [],
      eventDriven: [],
    };

    files.forEach((file) => {
      const content = file.content || '';

      // MVC Pattern
      if (/model|view|controller/g.test(content.toLowerCase())) {
        patterns.mvc.push(file);
      }

      // Microservices
      if (/microservice|service\s+discovery|api\s+gateway/g.test(content.toLowerCase())) {
        patterns.microservices.push(file);
      }

      // Layered Architecture
      if (/layer|tier|presentation|business|data/g.test(content.toLowerCase())) {
        patterns.layered.push(file);
      }

      // Event-Driven
      if (/event|emitter|listener|pubsub|message/g.test(content.toLowerCase())) {
        patterns.eventDriven.push(file);
      }
    });

    return patterns;
  }

  /**
   * استخراج أنماط الاختبار
   * @param {Array} files - الملفات
   * @returns {Object} أنماط الاختبار
   */
  extractTestingPatterns(files) {
    const patterns = {
      tdd: [],
      bdd: [],
      unit: [],
      integration: [],
    };

    files.forEach((file) => {
      const content = file.content || '';

      // TDD Pattern
      if (/test\s+first|red\s+green\s+refactor/g.test(content.toLowerCase())) {
        patterns.tdd.push(file);
      }

      // BDD Pattern
      if (/describe|it\s*\(|given|when|then/g.test(content.toLowerCase())) {
        patterns.bdd.push(file);
      }

      // Unit Testing
      if (/mock|stub|spy|isolate/g.test(content.toLowerCase())) {
        patterns.unit.push(file);
      }

      // Integration Testing
      if (/integration|end\s+to\s+end|e2e/g.test(content.toLowerCase())) {
        patterns.integration.push(file);
      }
    });

    return patterns;
  }

  /**
   * استخراج أنماط الأمان
   * @param {Array} files - الملفات
   * @returns {Object} أنماط الأمان
   */
  extractSecurityPatterns(files) {
    const patterns = {
      authentication: [],
      authorization: [],
      encryption: [],
      validation: [],
    };

    files.forEach((file) => {
      const content = file.content || '';

      // Authentication
      if (/auth|login|password|token|jwt/g.test(content.toLowerCase())) {
        patterns.authentication.push(file);
      }

      // Authorization
      if (/permission|role|access|control|rbac/g.test(content.toLowerCase())) {
        patterns.authorization.push(file);
      }

      // Encryption
      if (/encrypt|decrypt|hash|cipher|secure/g.test(content.toLowerCase())) {
        patterns.encryption.push(file);
      }

      // Validation
      if (/validate|sanitize|escape|filter/g.test(content.toLowerCase())) {
        patterns.validation.push(file);
      }
    });

    return patterns;
  }

  /**
   * تحليل التبعيات
   */
  async analyzeDependencies() {
    const files = Array.from(this.index.values());

    // تحليل التبعيات الخارجية
    this.dependencies.set('external', this.analyzeExternalDependencies(files));

    // تحليل التبعيات الداخلية
    this.dependencies.set('internal', this.analyzeInternalDependencies(files));

    // تحليل التبعيات المتبادلة
    this.dependencies.set('circular', this.analyzeCircularDependencies(files));
  }

  /**
   * تحليل التبعيات الخارجية
   * @param {Array} files - الملفات
   * @returns {Object} التبعيات الخارجية
   */
  analyzeExternalDependencies(files) {
    const external = {
      npm: [],
      cdn: [],
      system: [],
    };

    files.forEach((file) => {
      const imports = file.imports || [];

      imports.forEach((imp) => {
        if (!imp.startsWith('./') && !imp.startsWith('../')) {
          if (imp.startsWith('http://') || imp.startsWith('https://')) {
            external.cdn.push({ file: file.path, import: imp });
          } else if (imp.startsWith('node:') || imp.startsWith('fs') || imp.startsWith('path')) {
            external.system.push({ file: file.path, import: imp });
          } else {
            external.npm.push({ file: file.path, import: imp });
          }
        }
      });
    });

    return external;
  }

  /**
   * تحليل التبعيات الداخلية
   * @param {Array} files - الملفات
   * @returns {Object} التبعيات الداخلية
   */
  analyzeInternalDependencies(files) {
    const internal = {
      components: [],
      services: [],
      utils: [],
    };

    files.forEach((file) => {
      const imports = file.imports || [];

      imports.forEach((imp) => {
        if (imp.startsWith('./') || imp.startsWith('../')) {
          const type = this.categorizeInternalDependency(imp);
          internal[type].push({ file: file.path, import: imp });
        }
      });
    });

    return internal;
  }

  /**
   * تحليل التبعيات المتبادلة
   * @param {Array} files - الملفات
   * @returns {Array} التبعيات المتبادلة
   */
  analyzeCircularDependencies(files) {
    const circular = [];

    // تحليل بسيط للتبعيات المتبادلة
    files.forEach((file) => {
      const imports = file.imports || [];

      imports.forEach((imp) => {
        if (imp.startsWith('./') || imp.startsWith('../')) {
          const targetFile = this.resolveImportPath(file.path, imp);
          const targetFileData = this.index.get(targetFile);

          if (targetFileData && targetFileData.imports) {
            const backImport = targetFileData.imports.find(
              (backImp) => this.resolveImportPath(targetFile, backImp) === file.path
            );

            if (backImport) {
              circular.push({
                file1: file.path,
                file2: targetFile,
                import1: imp,
                import2: backImport,
              });
            }
          }
        }
      });
    });

    return circular;
  }

  /**
   * تصنيف التبعية الداخلية
   * @param {string} importPath - مسار الاستيراد
   * @returns {string} نوع التبعية
   */
  categorizeInternalDependency(importPath) {
    const path = importPath.toLowerCase();

    if (path.includes('component')) {
      return 'components';
    }
    if (path.includes('service')) {
      return 'services';
    }
    if (path.includes('util') || path.includes('helper')) {
      return 'utils';
    }

    return 'components'; // افتراضي
  }

  /**
   * حل مسار الاستيراد
   * @param {string} fromFile - الملف المصدر
   * @param {string} importPath - مسار الاستيراد
   * @returns {string} المسار المحلول
   */
  resolveImportPath(fromFile, importPath) {
    // تنفيذ بسيط لحل المسارات
    if (importPath.startsWith('./')) {
      return path.join(path.dirname(fromFile), importPath.substring(2));
    } else if (importPath.startsWith('../')) {
      return path.join(path.dirname(fromFile), importPath);
    }

    return importPath;
  }

  /**
   * حساب المقاييس
   */
  async calculateMetrics() {
    const files = Array.from(this.index.values());

    // مقاييس الحجم
    this.metrics.set('size', this.calculateSizeMetrics(files));

    // مقاييس التعقيد
    this.metrics.set('complexity', this.calculateComplexityMetrics(files));

    // مقاييس الجودة
    this.metrics.set('quality', this.calculateQualityMetrics(files));

    // مقاييس الأداء
    this.metrics.set('performance', this.calculatePerformanceMetrics(files));

    // مقاييس الأمان
    this.metrics.set('security', this.calculateSecurityMetrics(files));
  }

  /**
   * حساب مقاييس الحجم
   * @param {Array} files - الملفات
   * @returns {Object} مقاييس الحجم
   */
  calculateSizeMetrics(files) {
    const totalLines = files.reduce((sum, file) => sum + (file.lines || 0), 0);
    const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
    const totalFunctions = files.reduce((sum, file) => sum + (file.functions?.length || 0), 0);
    const totalClasses = files.reduce((sum, file) => sum + (file.classes?.length || 0), 0);

    return {
      totalFiles: files.length,
      totalLines,
      totalSize,
      totalFunctions,
      totalClasses,
      averageLinesPerFile: totalLines / files.length,
      averageSizePerFile: totalSize / files.length,
    };
  }

  /**
   * حساب مقاييس التعقيد
   * @param {Array} files - الملفات
   * @returns {Object} مقاييس التعقيد
   */
  calculateComplexityMetrics(files) {
    const complexities = files.map((file) => file.complexity || 0);
    const avgComplexity = complexities.reduce((sum, comp) => sum + comp, 0) / complexities.length;
    const maxComplexity = Math.max(...complexities);
    const highComplexityFiles = files.filter((file) => (file.complexity || 0) > 10).length;

    return {
      averageComplexity: avgComplexity,
      maxComplexity,
      highComplexityFiles,
      complexityDistribution: {
        low: files.filter((f) => (f.complexity || 0) <= 5).length,
        medium: files.filter((f) => (f.complexity || 0) > 5 && (f.complexity || 0) <= 10).length,
        high: files.filter((f) => (f.complexity || 0) > 10).length,
      },
    };
  }

  /**
   * حساب مقاييس الجودة
   * @param {Array} files - الملفات
   * @returns {Object} مقاييس الجودة
   */
  calculateQualityMetrics(files) {
    const maintainabilities = files.map((file) => file.maintainability || 0);
    const avgMaintainability =
      maintainabilities.reduce((sum, maint) => sum + maint, 0) / maintainabilities.length;
    const lowMaintainabilityFiles = files.filter((file) => (file.maintainability || 0) < 50).length;

    return {
      averageMaintainability: avgMaintainability,
      lowMaintainabilityFiles,
      maintainabilityDistribution: {
        excellent: files.filter((f) => (f.maintainability || 0) >= 80).length,
        good: files.filter((f) => (f.maintainability || 0) >= 60 && (f.maintainability || 0) < 80)
          .length,
        fair: files.filter((f) => (f.maintainability || 0) >= 40 && (f.maintainability || 0) < 60)
          .length,
        poor: files.filter((f) => (f.maintainability || 0) < 40).length,
      },
    };
  }

  /**
   * حساب مقاييس الأداء
   * @param {Array} files - الملفات
   * @returns {Object} مقاييس الأداء
   */
  calculatePerformanceMetrics(files) {
    const performanceIssues = files.reduce(
      (sum, file) => sum + (file.performanceIssues?.length || 0),
      0
    );
    const filesWithPerformanceIssues = files.filter(
      (file) => (file.performanceIssues?.length || 0) > 0
    ).length;

    return {
      totalPerformanceIssues: performanceIssues,
      filesWithPerformanceIssues,
      performanceScore: Math.max(0, 100 - performanceIssues * 5),
    };
  }

  /**
   * حساب مقاييس الأمان
   * @param {Array} files - الملفات
   * @returns {Object} مقاييس الأمان
   */
  calculateSecurityMetrics(files) {
    const securityIssues = files.reduce((sum, file) => sum + (file.securityIssues?.length || 0), 0);
    const criticalSecurityIssues = files.reduce(
      (sum, file) =>
        sum + (file.securityIssues?.filter((issue) => issue.severity === 'critical').length || 0),
      0
    );

    return {
      totalSecurityIssues: securityIssues,
      criticalSecurityIssues,
      securityScore: Math.max(0, 100 - criticalSecurityIssues * 20 - securityIssues * 5),
    };
  }

  // ==================== Helper Methods ====================

  /**
   * اكتشاف لغة البرمجة
   * @param {string} extension - امتداد الملف
   * @param {string} content - المحتوى
   * @returns {string} اللغة
   */
  detectLanguage(extension, content) {
    const languageMap = {
      '.js': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.jsx': 'javascript',
      '.py': 'python',
      '.java': 'java',
      '.php': 'php',
      '.json': 'json',
      '.md': 'markdown',
      '.html': 'html',
      '.css': 'css',
      '.scss': 'scss',
      '.sql': 'sql',
    };

    return languageMap[extension] || 'unknown';
  }

  /**
   * اكتشاف نوع الملف
   * @param {string} filePath - مسار الملف
   * @param {string} content - المحتوى
   * @returns {string} نوع الملف
   */
  detectFileType(filePath, content) {
    const path = filePath.toLowerCase();

    if (path.includes('test') || path.includes('spec')) {
      return 'test';
    }
    if (path.includes('config')) {
      return 'config';
    }
    if (path.includes('component')) {
      return 'component';
    }
    if (path.includes('service')) {
      return 'service';
    }
    if (path.includes('model')) {
      return 'model';
    }
    if (path.includes('controller')) {
      return 'controller';
    }
    if (path.includes('middleware')) {
      return 'middleware';
    }
    if (path.includes('route')) {
      return 'route';
    }
    if (path.includes('util') || path.includes('helper')) {
      return 'utility';
    }
    if (path.includes('api')) {
      return 'api';
    }
    if (path.includes('schema')) {
      return 'schema';
    }
    if (path.includes('migration')) {
      return 'migration';
    }

    return 'source';
  }

  /**
   * استخراج الدوال
   * @param {string} content - المحتوى
   * @returns {Array} الدوال
   */
  extractFunctions(content) {
    const functions = [];
    const lines = content.split('\n');

    const functionPatterns = [
      /function\s+(\w+)\s*\(/g,
      /const\s+(\w+)\s*=\s*\(/g,
      /let\s+(\w+)\s*=\s*\(/g,
      /var\s+(\w+)\s*=\s*\(/g,
      /(\w+)\s*:\s*function/g,
      /(\w+)\s*\(/g,
    ];

    functionPatterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const functionName = match[1];
        const lineNumber = content.substring(0, match.index).split('\n').length;

        functions.push({
          name: functionName,
          line: lineNumber,
          type: 'function',
        });
      }
    });

    return functions;
  }

  /**
   * استخراج الفئات
   * @param {string} content - المحتوى
   * @returns {Array} الفئات
   */
  extractClasses(content) {
    const classes = [];
    const lines = content.split('\n');

    const classPattern = /class\s+(\w+)/g;
    let match;

    while ((match = classPattern.exec(content)) !== null) {
      const className = match[1];
      const lineNumber = content.substring(0, match.index).split('\n').length;

      classes.push({
        name: className,
        line: lineNumber,
        type: 'class',
      });
    }

    return classes;
  }

  /**
   * استخراج الاستيرادات
   * @param {string} content - المحتوى
   * @returns {Array} الاستيرادات
   */
  extractImports(content) {
    const imports = [];
    const lines = content.split('\n');

    const importPatterns = [
      /import\s+.*\s+from\s+['"`]([^'"`]+)['"`]/g,
      /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
      /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
    ];

    importPatterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const importPath = match[1];
        const lineNumber = content.substring(0, match.index).split('\n').length;

        imports.push({
          path: importPath,
          line: lineNumber,
          type: 'import',
        });
      }
    });

    return imports;
  }

  /**
   * استخراج التصديرات
   * @param {string} content - المحتوى
   * @returns {Array} التصديرات
   */
  extractExports(content) {
    const exports = [];
    const lines = content.split('\n');

    const exportPatterns = [
      /export\s+(?:default\s+)?(?:function|class|const|let|var)\s+(\w+)/g,
      /export\s+{\s*([^}]+)\s*}/g,
      /module\.exports\s*=\s*(\w+)/g,
    ];

    exportPatterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const exportName = match[1];
        const lineNumber = content.substring(0, match.index).split('\n').length;

        exports.push({
          name: exportName,
          line: lineNumber,
          type: 'export',
        });
      }
    });

    return exports;
  }

  /**
   * اكتشاف أنماط الملف
   * @param {string} content - المحتوى
   * @param {string} filePath - مسار الملف
   * @returns {Array} الأنماط
   */
  detectFilePatterns(content, filePath) {
    const patterns = [];

    // أنماط React
    if (/import\s+React/g.test(content) || /useState|useEffect/g.test(content)) {
      patterns.push('react');
    }

    // أنماط Node.js
    if (/require\s*\(/g.test(content) || /module\.exports/g.test(content)) {
      patterns.push('nodejs');
    }

    // أنماط Express
    if (/express\s*\(/g.test(content) || /app\.get|app\.post/g.test(content)) {
      patterns.push('express');
    }

    // أنماط TypeScript
    if (/interface\s+\w+|type\s+\w+\s*=/g.test(content)) {
      patterns.push('typescript');
    }

    // أنماط الاختبار
    if (/describe\s*\(|it\s*\(|test\s*\(/g.test(content)) {
      patterns.push('testing');
    }

    return patterns;
  }

  /**
   * استخراج التبعيات
   * @param {string} content - المحتوى
   * @param {string} extension - امتداد الملف
   * @returns {Array} التبعيات
   */
  extractDependencies(content, extension) {
    const dependencies = [];

    if (extension === '.json') {
      // تحليل package.json
      try {
        const pkg = JSON.parse(content);
        if (pkg.dependencies) {
          Object.keys(pkg.dependencies).forEach((dep) => {
            dependencies.push(dep);
          });
        }
        if (pkg.devDependencies) {
          Object.keys(pkg.devDependencies).forEach((dep) => {
            dependencies.push(dep);
          });
        }
      } catch (error) {
        // تجاهل أخطاء JSON
      }
    } else {
      // استخراج من الكود
      const importPatterns = [
        /import\s+.*\s+from\s+['"`]([^'"`]+)['"`]/g,
        /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
      ];

      importPatterns.forEach((pattern) => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          dependencies.push(match[1]);
        }
      });
    }

    return dependencies;
  }

  /**
   * حساب تعقيد الملف
   * @param {string} content - المحتوى
   * @returns {number} التعقيد
   */
  calculateFileComplexity(content) {
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
      /\?/g,
    ];

    let complexity = 1;
    complexityIndicators.forEach((pattern) => {
      const matches = content.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    });

    return complexity;
  }

  /**
   * حساب قابلية الصيانة
   * @param {string} content - المحتوى
   * @returns {number} قابلية الصيانة
   */
  calculateMaintainability(content) {
    const lines = content.split('\n');
    const functions = this.extractFunctions(content);
    const complexity = this.calculateFileComplexity(content);

    let score = 1.0;

    // تقليل النقاط للتعقيد العالي
    if (complexity > 20) {
      score -= 0.3;
    } else if (complexity > 10) {
      score -= 0.2;
    } else if (complexity > 5) {
      score -= 0.1;
    }

    // تقليل النقاط للدوال الطويلة
    const avgFunctionLength = lines.length / Math.max(functions.length, 1);
    if (avgFunctionLength > 50) {
      score -= 0.2;
    } else if (avgFunctionLength > 30) {
      score -= 0.1;
    }

    // تقليل النقاط لعدم وجود تعليقات
    const commentRatio = (content.match(/\/\/|\/\*|\*\/|\#/g) || []).length / lines.length;
    if (commentRatio < 0.05) {
      score -= 0.2;
    } else if (commentRatio < 0.1) {
      score -= 0.1;
    }

    return Math.max(0, score);
  }

  /**
   * اكتشاف مشاكل الأمان
   * @param {string} content - المحتوى
   * @returns {Array} مشاكل الأمان
   */
  detectSecurityIssues(content) {
    const issues = [];

    // SQL Injection
    if (/\$\{[^}]*\}/g.test(content) || /query\s*\(\s*[^)]*\+/g.test(content)) {
      issues.push('sql_injection');
    }

    // XSS
    if (/innerHTML\s*=/g.test(content) || /document\.write/g.test(content)) {
      issues.push('xss');
    }

    // Hardcoded Secrets
    if (/password\s*=\s*['"][^'"]*['"]/g.test(content)) {
      issues.push('hardcoded_secret');
    }

    return issues;
  }

  /**
   * اكتشاف مشاكل الأداء
   * @param {string} content - المحتوى
   * @returns {Array} مشاكل الأداء
   */
  detectPerformanceIssues(content) {
    const issues = [];

    // Inefficient Loops
    if (/for\s*\(\s*.*\s*in\s*.*\)/g.test(content)) {
      issues.push('inefficient_loop');
    }

    // DOM Queries in Loops
    if (/\.forEach\s*\(/g.test(content) && /document\.getElementById/g.test(content)) {
      issues.push('dom_query_in_loop');
    }

    // Memory Leaks
    if (/addEventListener\s*\(/g.test(content) && !/removeEventListener/g.test(content)) {
      issues.push('potential_memory_leak');
    }

    return issues;
  }

  /**
   * تحليل التوثيق
   * @param {string} content - المحتوى
   * @returns {Object} تحليل التوثيق
   */
  analyzeDocumentation(content) {
    const lines = content.split('\n');
    const comments = (content.match(/\/\/|\/\*|\*\/|\#/g) || []).length;
    const commentRatio = comments / lines.length;

    let score = 0.5;
    if (commentRatio > 0.2) {
      score = 1.0;
    } else if (commentRatio > 0.1) {
      score = 0.8;
    } else if (commentRatio > 0.05) {
      score = 0.6;
    }

    return {
      commentRatio,
      score,
      hasJSDoc: /\/\*\*/g.test(content),
      hasInlineComments: /\/\//g.test(content),
    };
  }

  /**
   * تحليل تغطية الاختبارات
   * @param {string} content - المحتوى
   * @param {string} filePath - مسار الملف
   * @returns {Object} تحليل الاختبارات
   */
  analyzeTestCoverage(content, filePath) {
    const isTestFile = filePath.includes('.test.') || filePath.includes('.spec.');

    return {
      isTestFile,
      testFunctions: (content.match(/it\s*\(|test\s*\(|describe\s*\(/g) || []).length,
      hasAssertions: /expect\s*\(|assert\s*\(/g.test(content),
      coverage: isTestFile ? 1.0 : 0.0,
    };
  }

  /**
   * توليد الرؤى
   * @returns {Array} الرؤى
   */
  generateInsights() {
    const insights = [];
    const files = Array.from(this.index.values());

    // رؤى الحجم
    const totalLines = files.reduce((sum, file) => sum + file.lines, 0);
    if (totalLines > 10000) {
      insights.push({
        type: 'size',
        message: 'Large codebase detected',
        recommendation: 'Consider modularization and code splitting',
      });
    }

    // رؤى التعقيد
    const avgComplexity = files.reduce((sum, file) => sum + file.complexity, 0) / files.length;
    if (avgComplexity > 10) {
      insights.push({
        type: 'complexity',
        message: 'High complexity detected',
        recommendation: 'Refactor complex functions and reduce nesting',
      });
    }

    // رؤى الأمان
    const filesWithSecurityIssues = files.filter((file) => file.securityIssues.length > 0);
    if (filesWithSecurityIssues.length > 0) {
      insights.push({
        type: 'security',
        message: `${filesWithSecurityIssues.length} files have security issues`,
        recommendation: 'Review and fix security vulnerabilities',
      });
    }

    return insights;
  }

  /**
   * توليد التوصيات
   * @returns {Array} التوصيات
   */
  generateRecommendations() {
    const recommendations = [];
    const files = Array.from(this.index.values());

    // توصيات التوثيق
    const filesWithoutComments = files.filter((file) => file.documentation.commentRatio === 0);
    if (filesWithoutComments.length > files.length * 0.3) {
      recommendations.push({
        priority: 'medium',
        category: 'documentation',
        message: 'Add more documentation and comments',
        action: 'Improve code documentation for better maintainability',
      });
    }

    // توصيات الاختبارات
    const testFiles = files.filter((file) => file.testCoverage.isTestFile);
    if (testFiles.length < files.length * 0.2) {
      recommendations.push({
        priority: 'high',
        category: 'testing',
        message: 'Increase test coverage',
        action: 'Add more unit tests and integration tests',
      });
    }

    // توصيات الأمان
    const securityIssues = files.filter((file) => file.securityIssues.length > 0);
    if (securityIssues.length > 0) {
      recommendations.push({
        priority: 'critical',
        category: 'security',
        message: 'Address security vulnerabilities',
        action: 'Review and fix all security issues',
      });
    }

    return recommendations;
  }

  // ==================== Getter Methods ====================

  getTotalLines() {
    return Array.from(this.index.values()).reduce((sum, file) => sum + file.lines, 0);
  }

  getTotalFunctions() {
    return Array.from(this.index.values()).reduce((sum, file) => sum + file.functions.length, 0);
  }

  getTotalClasses() {
    return Array.from(this.index.values()).reduce((sum, file) => sum + file.classes.length, 0);
  }

  getArchitectureLevel() {
    const layers = this.architecture.get('layers');
    const layerCount = Object.values(layers).filter((layer) => layer.length > 0).length;

    if (layerCount >= 4) {
      return 'enterprise';
    }
    if (layerCount >= 3) {
      return 'advanced';
    }
    if (layerCount >= 2) {
      return 'intermediate';
    }
    return 'basic';
  }

  getPatternCount() {
    return Array.from(this.patterns.values()).reduce((sum, patterns) => {
      return sum + Object.values(patterns).reduce((count, pattern) => count + pattern.length, 0);
    }, 0);
  }

  /**
   * فحص صحة النظام
   */
  async healthCheck() {
    try {
      return {
        success: true,
        status: 'healthy',
        indexedFiles: this.index.size,
        architectureComponents: this.architecture.size,
        patternsDiscovered: this.patterns.size,
        dependenciesAnalyzed: this.dependencies.size,
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

module.exports = new CodebaseIndexer();
