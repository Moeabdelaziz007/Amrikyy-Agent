/**
 * Comprehensive Scanner Tool
 * أداة الفحص الشاملة التي تجمع بين فهرسة المحادثات وفحص الكود
 */

const { logger } = require('../utils/logger');
const ChatIndexer = require('./ChatIndexer');
const CodeScanner = require('./CodeScanner');
const CodebaseIndexer = require('./CodebaseIndexer');

class ComprehensiveScanner {
  constructor() {
    this.name = 'comprehensive_scanner';
    this.description = 'فحص شامل يجمع بين فهرسة المحادثات وفحص الكود وفهرسة المستودع';
    this.chatIndexer = ChatIndexer;
    this.codeScanner = CodeScanner;
    this.codebaseIndexer = CodebaseIndexer;
    this.scanHistory = [];
  }

  /**
   * فحص شامل للمشروع
   * @param {string} projectPath - مسار المشروع
   * @param {Object} options - خيارات الفحص
   * @returns {Promise<Object>} النتائج الشاملة
   */
  async scanComprehensive(projectPath, options = {}) {
    try {
      logger.info(`🚀 Starting comprehensive scan: ${projectPath}`);

      const scanOptions = {
        includeChatIndexing: options.includeChatIndexing || true,
        includeCodeScanning: options.includeCodeScanning || true,
        includeCodebaseIndexing: options.includeCodebaseIndexing || true,
        includeEmailReports: options.includeEmailReports || true,
        scanDepth: options.scanDepth || 10,
        languages: options.languages || ['js', 'ts', 'tsx', 'jsx', 'json', 'md'],
        ...options,
      };

      const results = {
        projectPath,
        scanDate: new Date().toISOString(),
        scanId: this.generateScanId(),
        options: scanOptions,

        // نتائج الفحص
        chatIndexing: null,
        codeScanning: null,
        codebaseIndexing: null,

        // التحليل الشامل
        comprehensiveAnalysis: null,

        // التوصيات الشاملة
        recommendations: [],

        // المقاييس الشاملة
        metrics: {},

        // تقرير البريد الإلكتروني
        emailReport: null,

        // حالة الفحص
        status: 'in_progress',
        errors: [],
      };

      // فهرسة المحادثات
      if (scanOptions.includeChatIndexing) {
        try {
          logger.info('📝 Starting chat indexing...');
          results.chatIndexing = await this.performChatIndexing(options);
          logger.info('✅ Chat indexing completed');
        } catch (error) {
          logger.error('❌ Chat indexing failed', { error: error.message });
          results.errors.push({ component: 'chatIndexing', error: error.message });
        }
      }

      // فحص الكود
      if (scanOptions.includeCodeScanning) {
        try {
          logger.info('🔍 Starting code scanning...');
          results.codeScanning = await this.codeScanner.scanProject(projectPath, scanOptions);
          logger.info('✅ Code scanning completed');
        } catch (error) {
          logger.error('❌ Code scanning failed', { error: error.message });
          results.errors.push({ component: 'codeScanning', error: error.message });
        }
      }

      // فهرسة المستودع
      if (scanOptions.includeCodebaseIndexing) {
        try {
          logger.info('📚 Starting codebase indexing...');
          results.codebaseIndexing = await this.codebaseIndexer.indexProject(
            projectPath,
            scanOptions
          );
          logger.info('✅ Codebase indexing completed');
        } catch (error) {
          logger.error('❌ Codebase indexing failed', { error: error.message });
          results.errors.push({ component: 'codebaseIndexing', error: error.message });
        }
      }

      // التحليل الشامل
      results.comprehensiveAnalysis = await this.performComprehensiveAnalysis(results);

      // التوصيات الشاملة
      results.recommendations = this.generateComprehensiveRecommendations(results);

      // المقاييس الشاملة
      results.metrics = this.calculateComprehensiveMetrics(results);

      // تقرير البريد الإلكتروني
      if (scanOptions.includeEmailReports) {
        try {
          results.emailReport = await this.generateComprehensiveEmailReport(results);
          logger.info('✅ Email report generated');
        } catch (error) {
          logger.error('❌ Email report generation failed', { error: error.message });
          results.errors.push({ component: 'emailReport', error: error.message });
        }
      }

      results.status = 'completed';

      // حفظ تاريخ الفحص
      this.scanHistory.push({
        scanId: results.scanId,
        timestamp: results.scanDate,
        projectPath: results.projectPath,
        status: results.status,
      });

      logger.info(`🎉 Comprehensive scan completed: ${results.scanId}`);
      logger.info(`📊 Found ${results.metrics.totalIssues} total issues`);
      logger.info(`📈 Overall quality score: ${results.metrics.overallQualityScore}/100`);

      return results;
    } catch (error) {
      logger.error('❌ Comprehensive scan failed', { error: error.message });
      return {
        success: false,
        error: error.message,
        projectPath,
        scanDate: new Date().toISOString(),
      };
    }
  }

  /**
   * إجراء فهرسة المحادثات
   * @param {Object} options - خيارات الفهرسة
   * @returns {Promise<Object>} نتائج فهرسة المحادثات
   */
  async performChatIndexing(options) {
    // محاكاة فهرسة المحادثات من جلسة العمل الحالية
    const chatMessages = [
      {
        message: 'I need help with building a comprehensive scanning tool for my project',
        response:
          "I'll help you create a comprehensive scanning tool that includes chat indexing, code scanning, and codebase indexing capabilities.",
        context: 'Project development and tool creation',
        topic: 'development',
        metadata: {
          complexity: 0.8,
          intent: 'help_request',
          sentiment: 0.7,
        },
      },
      {
        message:
          'The tool should be able to scan for bugs, security issues, and code quality problems',
        response:
          "I'll implement a multi-layered scanning approach with security vulnerability detection, code quality analysis, and bug detection patterns.",
        context: 'Technical requirements and specifications',
        topic: 'security',
        metadata: {
          complexity: 0.9,
          intent: 'feature_request',
          sentiment: 0.8,
        },
      },
      {
        message: 'Also include Arabic language support and email reporting',
        response:
          "I'll add comprehensive Arabic language support with RTL text handling and automated email reporting with Arabic templates.",
        context: 'Localization and communication features',
        topic: 'localization',
        metadata: {
          complexity: 0.7,
          intent: 'feature_request',
          sentiment: 0.9,
        },
      },
    ];

    const indexingResults = [];

    for (const chatMessage of chatMessages) {
      try {
        const result = await this.chatIndexer.indexChatMessage(chatMessage);
        indexingResults.push(result);
      } catch (error) {
        logger.warn(`⚠️ Failed to index chat message`, { error: error.message });
      }
    }

    return {
      totalMessages: chatMessages.length,
      indexedMessages: indexingResults.length,
      topics: ['development', 'security', 'localization'],
      insights: await this.chatIndexer.getInsights(),
      skillReport: await this.chatIndexer.generateSkillReport(),
      codeQuality: await this.chatIndexer.getCodeQualityMetrics(),
      learnedPatterns: await this.chatIndexer.getLearnedPatterns(),
    };
  }

  /**
   * إجراء التحليل الشامل
   * @param {Object} results - نتائج الفحص
   * @returns {Promise<Object>} التحليل الشامل
   */
  async performComprehensiveAnalysis(results) {
    const analysis = {
      overallHealth: 'unknown',
      riskLevel: 'unknown',
      qualityScore: 0,
      securityScore: 0,
      maintainabilityScore: 0,
      performanceScore: 0,
      documentationScore: 0,

      // تحليل المشاكل
      criticalIssues: [],
      highPriorityIssues: [],
      mediumPriorityIssues: [],
      lowPriorityIssues: [],

      // تحليل الأنماط
      architecturalPatterns: [],
      designPatterns: [],
      codePatterns: [],

      // تحليل التبعيات
      dependencyAnalysis: {
        external: [],
        internal: [],
        circular: [],
        outdated: [],
      },

      // تحليل الأمان
      securityAnalysis: {
        vulnerabilities: [],
        risks: [],
        recommendations: [],
      },

      // تحليل الأداء
      performanceAnalysis: {
        bottlenecks: [],
        optimizations: [],
        recommendations: [],
      },

      // تحليل الجودة
      qualityAnalysis: {
        strengths: [],
        weaknesses: [],
        improvements: [],
      },
    };

    // تحليل فحص الكود
    if (results.codeScanning) {
      analysis.criticalIssues.push(
        ...results.codeScanning.issues.security.filter((issue) => issue.severity === 'critical')
      );
      analysis.highPriorityIssues.push(
        ...results.codeScanning.issues.security.filter((issue) => issue.severity === 'high')
      );

      // حساب نقاط الأمان
      const securityIssues = results.codeScanning.issues.security.length;
      analysis.securityScore = Math.max(0, 100 - securityIssues * 10);

      // تحليل الأداء
      analysis.performanceAnalysis.bottlenecks.push(...results.codeScanning.issues.performance);
    }

    // تحليل فهرسة المستودع
    if (results.codebaseIndexing) {
      analysis.architecturalPatterns = Object.keys(results.codebaseIndexing.architecture);
      analysis.designPatterns = Object.keys(results.codebaseIndexing.patterns.design || {});

      // حساب نقاط الجودة
      analysis.qualityScore =
        results.codebaseIndexing.metrics.quality?.averageMaintainability * 100 || 0;
      analysis.maintainabilityScore = analysis.qualityScore;

      // تحليل التوثيق
      const docScore =
        results.codebaseIndexing.metrics.documentation?.averageDocumentation * 100 || 0;
      analysis.documentationScore = docScore;
    }

    // تحليل فهرسة المحادثات
    if (results.chatIndexing) {
      analysis.codePatterns = Object.keys(results.chatIndexing.learnedPatterns?.patterns || {});
    }

    // حساب النقاط الإجمالية
    analysis.overallHealth = this.calculateOverallHealth(analysis);
    analysis.riskLevel = this.calculateRiskLevel(analysis);

    return analysis;
  }

  /**
   * توليد التوصيات الشاملة
   * @param {Object} results - نتائج الفحص
   * @returns {Array} التوصيات الشاملة
   */
  generateComprehensiveRecommendations(results) {
    const recommendations = [];

    // توصيات الأمان
    if (results.comprehensiveAnalysis?.securityScore < 70) {
      recommendations.push({
        priority: 'critical',
        category: 'security',
        title: 'Address Security Vulnerabilities',
        description: 'Critical security issues detected that require immediate attention',
        actions: [
          'Review and fix all critical security vulnerabilities',
          'Implement proper input validation',
          'Use parameterized queries for database operations',
          'Sanitize user input to prevent XSS attacks',
        ],
        estimatedEffort: '2-4 hours',
        impact: 'high',
      });
    }

    // توصيات الجودة
    if (results.comprehensiveAnalysis?.qualityScore < 70) {
      recommendations.push({
        priority: 'high',
        category: 'quality',
        title: 'Improve Code Quality',
        description: 'Code quality score is below acceptable threshold',
        actions: [
          'Refactor complex functions',
          'Add comprehensive unit tests',
          'Improve code documentation',
          'Reduce code duplication',
        ],
        estimatedEffort: '1-2 days',
        impact: 'medium',
      });
    }

    // توصيات الأداء
    if (results.comprehensiveAnalysis?.performanceAnalysis.bottlenecks.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'performance',
        title: 'Optimize Performance',
        description: 'Performance bottlenecks detected in the codebase',
        actions: [
          'Optimize database queries',
          'Implement caching strategies',
          'Reduce memory leaks',
          'Optimize critical code paths',
        ],
        estimatedEffort: '1 day',
        impact: 'medium',
      });
    }

    // توصيات التوثيق
    if (results.comprehensiveAnalysis?.documentationScore < 60) {
      recommendations.push({
        priority: 'medium',
        category: 'documentation',
        title: 'Improve Documentation',
        description: 'Documentation coverage is insufficient',
        actions: [
          'Add comprehensive code comments',
          'Create API documentation',
          'Write user guides',
          'Add inline documentation',
        ],
        estimatedEffort: '4-6 hours',
        impact: 'low',
      });
    }

    // توصيات الأمان المتقدم
    if (results.codeScanning?.summary.critical > 0) {
      recommendations.push({
        priority: 'critical',
        category: 'security',
        title: 'Implement Security Best Practices',
        description: 'Implement comprehensive security measures',
        actions: [
          'Set up automated security scanning',
          'Implement proper authentication and authorization',
          'Use secure coding practices',
          'Regular security audits',
        ],
        estimatedEffort: '1 week',
        impact: 'high',
      });
    }

    return recommendations;
  }

  /**
   * حساب المقاييس الشاملة
   * @param {Object} results - نتائج الفحص
   * @returns {Object} المقاييس الشاملة
   */
  calculateComprehensiveMetrics(results) {
    const metrics = {
      totalIssues: 0,
      criticalIssues: 0,
      highPriorityIssues: 0,
      mediumPriorityIssues: 0,
      lowPriorityIssues: 0,

      overallQualityScore: 0,
      securityScore: 0,
      maintainabilityScore: 0,
      performanceScore: 0,
      documentationScore: 0,

      codebaseSize: {
        totalFiles: 0,
        totalLines: 0,
        totalFunctions: 0,
        totalClasses: 0,
      },

      patterns: {
        architectural: 0,
        design: 0,
        code: 0,
      },

      coverage: {
        testCoverage: 0,
        documentationCoverage: 0,
        securityCoverage: 0,
      },
    };

    // حساب القضايا
    if (results.codeScanning) {
      metrics.totalIssues +=
        results.codeScanning.summary.critical +
        results.codeScanning.summary.high +
        results.codeScanning.summary.medium +
        results.codeScanning.summary.low;
      metrics.criticalIssues += results.codeScanning.summary.critical;
      metrics.highPriorityIssues += results.codeScanning.summary.high;
      metrics.mediumPriorityIssues += results.codeScanning.summary.medium;
      metrics.lowPriorityIssues += results.codeScanning.summary.low;
    }

    // حساب النقاط
    if (results.comprehensiveAnalysis) {
      metrics.overallQualityScore = results.comprehensiveAnalysis.qualityScore;
      metrics.securityScore = results.comprehensiveAnalysis.securityScore;
      metrics.maintainabilityScore = results.comprehensiveAnalysis.maintainabilityScore;
      metrics.documentationScore = results.comprehensiveAnalysis.documentationScore;
    }

    // حساب حجم المستودع
    if (results.codebaseIndexing) {
      metrics.codebaseSize.totalFiles = results.codebaseIndexing.summary.totalFiles;
      metrics.codebaseSize.totalLines = results.codebaseIndexing.summary.totalLines;
      metrics.codebaseSize.totalFunctions = results.codebaseIndexing.summary.totalFunctions;
      metrics.codebaseSize.totalClasses = results.codebaseIndexing.summary.totalClasses;
    }

    // حساب الأنماط
    if (results.codebaseIndexing?.patterns) {
      metrics.patterns.architectural = Object.keys(
        results.codebaseIndexing.patterns.architectural || {}
      ).length;
      metrics.patterns.design = Object.keys(results.codebaseIndexing.patterns.design || {}).length;
      metrics.patterns.code = Object.keys(
        results.codebaseIndexing.patterns.programming || {}
      ).length;
    }

    return metrics;
  }

  /**
   * توليد تقرير البريد الإلكتروني الشامل
   * @param {Object} results - نتائج الفحص
   * @returns {Promise<Object>} تقرير البريد الإلكتروني
   */
  async generateComprehensiveEmailReport(results) {
    const report = {
      subject: `Comprehensive Scan Report - ${
        results.projectPath
      } - ${new Date().toLocaleDateString()}`,
      html: this.generateHTMLReport(results),
      text: this.generateTextReport(results),
      attachments: [],
    };

    // إرسال التقرير إذا كان متاحاً
    try {
      if (this.chatIndexer.emailTransporter) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: process.env.EMAIL_TO,
          subject: report.subject,
          html: report.html,
          text: report.text,
        };

        await this.chatIndexer.emailTransporter.sendMail(mailOptions);
        logger.info('✅ Comprehensive email report sent successfully');
      }
    } catch (error) {
      logger.error('❌ Failed to send comprehensive email report', { error: error.message });
    }

    return report;
  }

  /**
   * توليد تقرير HTML
   * @param {Object} results - نتائج الفحص
   * @returns {string} تقرير HTML
   */
  generateHTMLReport(results) {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تقرير الفحص الشامل</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
          .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 20px; margin-bottom: 30px; }
          .section { margin-bottom: 30px; }
          .section h2 { color: #34495e; border-right: 4px solid #3498db; padding-right: 10px; }
          .metric { display: inline-block; margin: 10px; padding: 10px; background: #ecf0f1; border-radius: 5px; }
          .score { font-weight: bold; color: #27ae60; }
          .critical { color: #e74c3c; }
          .high { color: #f39c12; }
          .medium { color: #f1c40f; }
          .low { color: #95a5a6; }
          .recommendation { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 5px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #bdc3c7; color: #7f8c8d; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 تقرير الفحص الشامل</h1>
            <p>تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA')}</p>
            <p>المشروع: ${results.projectPath}</p>
            <p>معرف الفحص: ${results.scanId}</p>
          </div>

          <div class="section">
            <h2>🎯 ملخص الفحص</h2>
            <div class="metric">إجمالي الملفات: <span class="score">${
              results.metrics.codebaseSize.totalFiles
            }</span></div>
            <div class="metric">إجمالي الأسطر: <span class="score">${
              results.metrics.codebaseSize.totalLines
            }</span></div>
            <div class="metric">إجمالي القضايا: <span class="score">${
              results.metrics.totalIssues
            }</span></div>
            <div class="metric">نقاط الجودة الإجمالية: <span class="score">${
              results.metrics.overallQualityScore
            }/100</span></div>
          </div>

          <div class="section">
            <h2>🔍 تحليل الأمان</h2>
            <div class="metric">نقاط الأمان: <span class="score">${
              results.metrics.securityScore
            }/100</span></div>
            <div class="metric">القضايا الحرجة: <span class="critical">${
              results.metrics.criticalIssues
            }</span></div>
            <div class="metric">القضايا عالية الأولوية: <span class="high">${
              results.metrics.highPriorityIssues
            }</span></div>
          </div>

          <div class="section">
            <h2>📈 تحليل الجودة</h2>
            <div class="metric">نقاط الجودة: <span class="score">${
              results.metrics.overallQualityScore
            }/100</span></div>
            <div class="metric">قابلية الصيانة: <span class="score">${
              results.metrics.maintainabilityScore
            }/100</span></div>
            <div class="metric">التوثيق: <span class="score">${
              results.metrics.documentationScore
            }/100</span></div>
          </div>

          <div class="section">
            <h2>🏗️ الأنماط المعمارية</h2>
            <div class="metric">الأنماط المعمارية: <span class="score">${
              results.metrics.patterns.architectural
            }</span></div>
            <div class="metric">أنماط التصميم: <span class="score">${
              results.metrics.patterns.design
            }</span></div>
            <div class="metric">أنماط الكود: <span class="score">${
              results.metrics.patterns.code
            }</span></div>
          </div>

          <div class="section">
            <h2>📋 التوصيات</h2>
            ${results.recommendations
              .map(
                (rec) =>
                  `<div class="recommendation">
                <strong>${rec.title}:</strong> ${rec.description}
                <br><small>الأولوية: ${rec.priority} | الجهد المقدر: ${rec.estimatedEffort}</small>
              </div>`
              )
              .join('')}
          </div>

          <div class="footer">
            <p>تم إنشاء هذا التقرير تلقائياً بواسطة نظام الفحص الشامل</p>
            <p>للاستفسارات: ${process.env.EMAIL_USER}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * توليد تقرير نصي
   * @param {Object} results - نتائج الفحص
   * @returns {string} تقرير نصي
   */
  generateTextReport(results) {
    return `
تقرير الفحص الشامل
==================

تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA')}
المشروع: ${results.projectPath}
معرف الفحص: ${results.scanId}

ملخص الفحص:
- إجمالي الملفات: ${results.metrics.codebaseSize.totalFiles}
- إجمالي الأسطر: ${results.metrics.codebaseSize.totalLines}
- إجمالي القضايا: ${results.metrics.totalIssues}
- نقاط الجودة الإجمالية: ${results.metrics.overallQualityScore}/100

تحليل الأمان:
- نقاط الأمان: ${results.metrics.securityScore}/100
- القضايا الحرجة: ${results.metrics.criticalIssues}
- القضايا عالية الأولوية: ${results.metrics.highPriorityIssues}

تحليل الجودة:
- نقاط الجودة: ${results.metrics.overallQualityScore}/100
- قابلية الصيانة: ${results.metrics.maintainabilityScore}/100
- التوثيق: ${results.metrics.documentationScore}/100

الأنماط المعمارية:
- الأنماط المعمارية: ${results.metrics.patterns.architectural}
- أنماط التصميم: ${results.metrics.patterns.design}
- أنماط الكود: ${results.metrics.patterns.code}

التوصيات:
${results.recommendations.map((rec) => `- ${rec.title}: ${rec.description}`).join('\n')}

تم إنشاء هذا التقرير تلقائياً بواسطة نظام الفحص الشامل
    `;
  }

  /**
   * حساب الصحة الإجمالية
   * @param {Object} analysis - التحليل
   * @returns {string} الصحة الإجمالية
   */
  calculateOverallHealth(analysis) {
    const avgScore =
      (analysis.qualityScore +
        analysis.securityScore +
        analysis.maintainabilityScore +
        analysis.documentationScore) /
      4;

    if (avgScore >= 90) return 'excellent';
    if (avgScore >= 80) return 'good';
    if (avgScore >= 70) return 'fair';
    if (avgScore >= 60) return 'poor';
    return 'critical';
  }

  /**
   * حساب مستوى المخاطر
   * @param {Object} analysis - التحليل
   * @returns {string} مستوى المخاطر
   */
  calculateRiskLevel(analysis) {
    const criticalCount = analysis.criticalIssues.length;
    const highCount = analysis.highPriorityIssues.length;

    if (criticalCount > 0) return 'critical';
    if (highCount > 5) return 'high';
    if (highCount > 2) return 'medium';
    if (highCount > 0) return 'low';
    return 'minimal';
  }

  /**
   * توليد معرف فحص فريد
   * @returns {string} معرف الفحص
   */
  generateScanId() {
    return `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * الحصول على تاريخ الفحص
   * @returns {Array} تاريخ الفحص
   */
  getScanHistory() {
    return this.scanHistory;
  }

  /**
   * فحص صحة النظام
   */
  async healthCheck() {
    try {
      const chatHealth = await this.chatIndexer.healthCheck();
      const codeHealth = await this.codeScanner.healthCheck();
      const indexHealth = await this.codebaseIndexer.healthCheck();

      return {
        success: true,
        status: 'healthy',
        components: {
          chatIndexer: chatHealth.success,
          codeScanner: codeHealth.success,
          codebaseIndexer: indexHealth.success,
        },
        scanHistory: this.scanHistory.length,
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

module.exports = new ComprehensiveScanner();
