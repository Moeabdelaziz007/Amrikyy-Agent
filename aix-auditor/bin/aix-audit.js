#!/usr/bin/env node

/**
 * AIX Security Auditor
 * Production-grade security auditing tool for AIX agent files
 * 
 * @author Mohamed H Abdelaziz <moe@amrikyy.com>
 * @version 1.0.0
 * @license MIT
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ============================================================================
// ANSI COLOR CODES FOR BEAUTIFUL OUTPUT
// ============================================================================

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m'
};

// ============================================================================
// PARSER - Multi-format AIX File Parser (YAML, JSON, TOML)
// ============================================================================

class AIXParser {
  static parse(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const ext = path.extname(filePath).toLowerCase();

    try {
      if (ext === '.json' || ext === '.aix') {
        return JSON.parse(content);
      } else if (ext === '.yaml' || ext === '.yml') {
        const YAML = require('yaml');
        return YAML.parse(content);
      } else if (ext === '.toml') {
        // Future: Add TOML parser
        throw new Error('TOML support coming soon');
      } else {
        // Try JSON first, then YAML
        try {
          return JSON.parse(content);
        } catch {
          const YAML = require('yaml');
          return YAML.parse(content);
        }
      }
    } catch (error) {
      throw new Error(`Failed to parse ${filePath}: ${error.message}`);
    }
  }

  static stringify(data, format = 'json') {
    if (format === 'yaml' || format === 'yml') {
      const YAML = require('yaml');
      return YAML.stringify(data);
    }
    return JSON.stringify(data, null, 2);
  }
}

// ============================================================================
// RULE ENGINE - Plugin-based Security Rule System
// ============================================================================

class RuleEngine {
  constructor() {
    this.rules = [];
    this.registerDefaultRules();
  }

  registerRule(rule) {
    this.rules.push(rule);
  }

  registerDefaultRules() {
    // SEC-001: Checksum Validation (Critical)
    this.registerRule({
      id: 'SEC-001',
      name: 'Checksum Validation',
      category: 'security',
      severity: 'critical',
      weight: 10,
      description: 'Agent must include SHA-256 checksum for integrity verification',
      check: (agent) => {
        if (!agent.meta || !agent.meta.checksum) {
          return {
            passed: false,
            message: 'Missing checksum in meta.checksum field'
          };
        }
        if (!agent.meta.checksum.match(/^[a-f0-9]{64}$/i)) {
          return {
            passed: false,
            message: 'Invalid checksum format (expected SHA-256 hex)'
          };
        }
        return { passed: true };
      },
      fix: (agent) => {
        if (!agent.meta) agent.meta = {};
        const agentCopy = JSON.parse(JSON.stringify(agent));
        delete agentCopy.meta.checksum;
        const hash = crypto.createHash('sha256')
          .update(JSON.stringify(agentCopy))
          .digest('hex');
        agent.meta.checksum = hash;
        return agent;
      }
    });

    // SEC-003: Digital Signature Presence (Critical)
    this.registerRule({
      id: 'SEC-003',
      name: 'Digital Signature',
      category: 'security',
      severity: 'critical',
      weight: 10,
      description: 'Agent should be digitally signed for authenticity',
      check: (agent) => {
        if (!agent.meta || !agent.meta.signature) {
          return {
            passed: false,
            message: 'Missing digital signature (RSA/Ed25519 recommended)'
          };
        }
        return { passed: true };
      },
      fix: null // Requires private key - manual fix only
    });

    // SEC-006: Encryption Strength (Critical)
    this.registerRule({
      id: 'SEC-006',
      name: 'Encryption Strength',
      category: 'security',
      severity: 'critical',
      weight: 8,
      description: 'Agent must use AES-256-GCM or stronger encryption',
      check: (agent) => {
        if (!agent.security || !agent.security.encryption) {
          return {
            passed: false,
            message: 'Missing security.encryption configuration'
          };
        }
        const algorithm = agent.security.encryption.algorithm;
        const strong = ['AES-256-GCM', 'AES-256-CBC', 'ChaCha20-Poly1305'];
        if (!strong.includes(algorithm)) {
          return {
            passed: false,
            message: `Weak encryption: ${algorithm || 'none'}. Use AES-256-GCM`
          };
        }
        return { passed: true };
      },
      fix: (agent) => {
        if (!agent.security) agent.security = {};
        if (!agent.security.encryption) agent.security.encryption = {};
        agent.security.encryption.algorithm = 'AES-256-GCM';
        agent.security.encryption.key_size = 256;
        return agent;
      }
    });

    // SEC-008: Capability Restrictions (Critical)
    this.registerRule({
      id: 'SEC-008',
      name: 'Capability Restrictions',
      category: 'security',
      severity: 'critical',
      weight: 7,
      description: 'Agent must define explicit capability restrictions (least privilege)',
      check: (agent) => {
        if (!agent.capabilities || !agent.capabilities.restrictions) {
          return {
            passed: false,
            message: 'Missing capabilities.restrictions (least privilege principle)'
          };
        }
        const restrictions = agent.capabilities.restrictions;
        const required = ['allowed_operations', 'denied_operations', 'resource_limits'];
        const missing = required.filter(r => !(r in restrictions));
        if (missing.length > 0) {
          return {
            passed: false,
            message: `Missing restrictions: ${missing.join(', ')}`
          };
        }
        return { passed: true };
      },
      fix: (agent) => {
        if (!agent.capabilities) agent.capabilities = {};
        if (!agent.capabilities.restrictions) {
          agent.capabilities.restrictions = {
            allowed_operations: ['read', 'write', 'execute'],
            denied_operations: ['admin', 'root', 'sudo'],
            resource_limits: {
              max_memory_mb: 512,
              max_cpu_percent: 50,
              max_disk_mb: 1024
            }
          };
        }
        return agent;
      }
    });

    // SEC-014: Rate Limiting (Warning)
    this.registerRule({
      id: 'SEC-014',
      name: 'Rate Limiting',
      category: 'security',
      severity: 'warning',
      weight: 5,
      description: 'Agent should implement rate limiting to prevent abuse',
      check: (agent) => {
        if (!agent.security || !agent.security.rate_limiting) {
          return {
            passed: false,
            message: 'Missing security.rate_limiting configuration'
          };
        }
        const rl = agent.security.rate_limiting;
        if (!rl.requests_per_minute || rl.requests_per_minute > 100) {
          return {
            passed: false,
            message: 'Rate limit too high or missing (recommended: 60 req/min)'
          };
        }
        return { passed: true };
      },
      fix: (agent) => {
        if (!agent.security) agent.security = {};
        if (!agent.security.rate_limiting) {
          agent.security.rate_limiting = {
            enabled: true,
            requests_per_minute: 60,
            burst_size: 10,
            strategy: 'token_bucket'
          };
        }
        return agent;
      }
    });

    // COMP-002: Data Retention Policy (Warning)
    this.registerRule({
      id: 'COMP-002',
      name: 'Data Retention Policy',
      category: 'compliance',
      severity: 'warning',
      weight: 6,
      description: 'GDPR requires explicit data retention policies',
      check: (agent) => {
        if (!agent.compliance || !agent.compliance.data_retention) {
          return {
            passed: false,
            message: 'Missing compliance.data_retention policy (GDPR requirement)'
          };
        }
        const retention = agent.compliance.data_retention;
        if (!retention.retention_period_days || retention.retention_period_days > 365) {
          return {
            passed: false,
            message: 'Retention period missing or too long (GDPR recommends ≤ 90 days)'
          };
        }
        return { passed: true };
      },
      fix: (agent) => {
        if (!agent.compliance) agent.compliance = {};
        if (!agent.compliance.data_retention) {
          agent.compliance.data_retention = {
            retention_period_days: 90,
            auto_delete: true,
            anonymization_enabled: true,
            legal_basis: 'legitimate_interest'
          };
        }
        return agent;
      }
    });

    // RES-005: Timeout Configuration (Warning)
    this.registerRule({
      id: 'RES-005',
      name: 'Timeout Configuration',
      category: 'resilience',
      severity: 'warning',
      weight: 5,
      description: 'Agent must define timeouts to prevent hanging operations',
      check: (agent) => {
        if (!agent.resilience || !agent.resilience.timeouts) {
          return {
            passed: false,
            message: 'Missing resilience.timeouts configuration'
          };
        }
        const timeouts = agent.resilience.timeouts;
        if (!timeouts.default_timeout_seconds || timeouts.default_timeout_seconds > 60) {
          return {
            passed: false,
            message: 'Default timeout missing or too high (recommended: 15s)'
          };
        }
        return { passed: true };
      },
      fix: (agent) => {
        if (!agent.resilience) agent.resilience = {};
        if (!agent.resilience.timeouts) {
          agent.resilience.timeouts = {
            default_timeout_seconds: 15,
            connection_timeout_seconds: 5,
            read_timeout_seconds: 10,
            write_timeout_seconds: 10
          };
        }
        return agent;
      }
    });

    // RES-007: Health Checks (Info)
    this.registerRule({
      id: 'RES-007',
      name: 'Health Checks',
      category: 'resilience',
      severity: 'info',
      weight: 4,
      description: 'Agent should expose health check endpoints',
      check: (agent) => {
        if (!agent.resilience || !agent.resilience.health_checks) {
          return {
            passed: false,
            message: 'Missing resilience.health_checks configuration'
          };
        }
        return { passed: true };
      },
      fix: (agent) => {
        if (!agent.resilience) agent.resilience = {};
        if (!agent.resilience.health_checks) {
          agent.resilience.health_checks = {
            enabled: true,
            endpoint: '/health',
            interval_seconds: 30,
            timeout_seconds: 5,
            healthy_threshold: 2,
            unhealthy_threshold: 3
          };
        }
        return agent;
      }
    });

    // PERF-001: Resource Limits (Warning)
    this.registerRule({
      id: 'PERF-001',
      name: 'Resource Limits',
      category: 'performance',
      severity: 'warning',
      weight: 5,
      description: 'Agent must define resource limits to prevent resource exhaustion',
      check: (agent) => {
        if (!agent.performance || !agent.performance.resource_limits) {
          return {
            passed: false,
            message: 'Missing performance.resource_limits configuration'
          };
        }
        const limits = agent.performance.resource_limits;
        const required = ['max_memory_mb', 'max_cpu_percent', 'max_concurrent_requests'];
        const missing = required.filter(r => !(r in limits));
        if (missing.length > 0) {
          return {
            passed: false,
            message: `Missing limits: ${missing.join(', ')}`
          };
        }
        return { passed: true };
      },
      fix: (agent) => {
        if (!agent.performance) agent.performance = {};
        if (!agent.performance.resource_limits) {
          agent.performance.resource_limits = {
            max_memory_mb: 512,
            max_cpu_percent: 70,
            max_concurrent_requests: 100,
            max_request_size_mb: 10
          };
        }
        return agent;
      }
    });

    // BP-002: Semantic Versioning (Info)
    this.registerRule({
      id: 'BP-002',
      name: 'Semantic Versioning',
      category: 'best_practices',
      severity: 'info',
      weight: 3,
      description: 'Agent version should follow semantic versioning (MAJOR.MINOR.PATCH)',
      check: (agent) => {
        if (!agent.meta || !agent.meta.version) {
          return {
            passed: false,
            message: 'Missing meta.version field'
          };
        }
        if (!agent.meta.version.match(/^\d+\.\d+\.\d+(-[a-z0-9]+)?$/)) {
          return {
            passed: false,
            message: `Invalid semver: ${agent.meta.version}. Use MAJOR.MINOR.PATCH`
          };
        }
        return { passed: true };
      },
      fix: (agent) => {
        if (!agent.meta) agent.meta = {};
        if (!agent.meta.version || !agent.meta.version.match(/^\d+\.\d+\.\d+/)) {
          agent.meta.version = '1.0.0';
        }
        return agent;
      }
    });

    // BP-005: Documentation Completeness (Info)
    this.registerRule({
      id: 'BP-005',
      name: 'Documentation Completeness',
      category: 'best_practices',
      severity: 'info',
      weight: 3,
      description: 'Agent should include comprehensive documentation',
      check: (agent) => {
        if (!agent.meta || !agent.meta.description) {
          return {
            passed: false,
            message: 'Missing meta.description field'
          };
        }
        if (agent.meta.description.length < 50) {
          return {
            passed: false,
            message: 'Description too short (minimum 50 characters)'
          };
        }
        return { passed: true };
      },
      fix: null // Manual fix required
    });
  }

  audit(agent) {
    const results = [];
    for (const rule of this.rules) {
      const result = rule.check(agent);
      results.push({
        rule_id: rule.id,
        rule_name: rule.name,
        category: rule.category,
        severity: rule.severity,
        weight: rule.weight,
        passed: result.passed,
        message: result.message || 'Passed',
        can_auto_fix: rule.fix !== null
      });
    }
    return results;
  }

  autoFix(agent) {
    let fixed = JSON.parse(JSON.stringify(agent));
    let fixCount = 0;
    
    for (const rule of this.rules) {
      const result = rule.check(fixed);
      if (!result.passed && rule.fix) {
        fixed = rule.fix(fixed);
        fixCount++;
      }
    }
    
    return { fixed, fixCount };
  }
}

// ============================================================================
// SCORER - Grading Algorithm with Weighted Categories
// ============================================================================

class Scorer {
  static CATEGORY_WEIGHTS = {
    security: 0.35,      // 35%
    compliance: 0.25,    // 25%
    resilience: 0.20,    // 20%
    performance: 0.10,   // 10%
    best_practices: 0.10 // 10%
  };

  static calculate(results) {
    const categoryScores = {};
    const categoryCounts = {};
    
    // Initialize
    for (const cat in this.CATEGORY_WEIGHTS) {
      categoryScores[cat] = 0;
      categoryCounts[cat] = 0;
    }
    
    // Calculate category scores
    for (const result of results) {
      const cat = result.category;
      if (result.passed) {
        categoryScores[cat] += result.weight;
      }
      categoryCounts[cat] += result.weight;
    }
    
    // Weighted total
    let totalScore = 0;
    const categoryBreakdown = {};
    
    for (const cat in this.CATEGORY_WEIGHTS) {
      const catScore = categoryCounts[cat] > 0
        ? (categoryScores[cat] / categoryCounts[cat]) * 100
        : 0;
      categoryBreakdown[cat] = Math.round(catScore);
      totalScore += catScore * this.CATEGORY_WEIGHTS[cat];
    }
    
    return {
      overall: Math.round(totalScore),
      breakdown: categoryBreakdown,
      grade: this.getGrade(totalScore)
    };
  }

  static getGrade(score) {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'B+';
    if (score >= 80) return 'B';
    if (score >= 75) return 'C+';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }
}

// ============================================================================
// REPORTER - Beautiful Console Output
// ============================================================================

class ConsoleReporter {
  static report(filePath, results, score, options = {}) {
    console.log('\n' + '='.repeat(80));
    console.log(colors.bright + colors.cyan + '🔐 AIX SECURITY AUDIT REPORT' + colors.reset);
    console.log('='.repeat(80) + '\n');
    
    console.log(`${colors.dim}File:${colors.reset} ${filePath}`);
    console.log(`${colors.dim}Audited:${colors.reset} ${new Date().toISOString()}\n`);
    
    // Overall Score
    const scoreColor = score.overall >= 80 ? colors.green : 
                       score.overall >= 60 ? colors.yellow : colors.red;
    console.log(colors.bright + 'OVERALL SCORE: ' + scoreColor + 
                score.overall + '/100 (' + score.grade + ')' + colors.reset + '\n');
    
    // Category Breakdown
    console.log(colors.bright + 'CATEGORY BREAKDOWN:' + colors.reset);
    for (const [cat, catScore] of Object.entries(score.breakdown)) {
      const catColor = catScore >= 80 ? colors.green : 
                       catScore >= 60 ? colors.yellow : colors.red;
      const bar = this.progressBar(catScore, 30);
      console.log(`  ${cat.padEnd(20)} ${catColor}${bar}${colors.reset} ${catColor}${catScore}/100${colors.reset}`);
    }
    console.log('');
    
    // Issues Summary
    const critical = results.filter(r => !r.passed && r.severity === 'critical');
    const warnings = results.filter(r => !r.passed && r.severity === 'warning');
    const info = results.filter(r => !r.passed && r.severity === 'info');
    
    console.log(colors.bright + 'ISSUES FOUND:' + colors.reset);
    console.log(`  ${colors.red}● Critical: ${critical.length}${colors.reset}`);
    console.log(`  ${colors.yellow}▲ Warnings: ${warnings.length}${colors.reset}`);
    console.log(`  ${colors.blue}ℹ Info: ${info.length}${colors.reset}\n`);
    
    // Detailed Issues
    if (critical.length > 0) {
      console.log(colors.bright + colors.red + '🚨 CRITICAL ISSUES:' + colors.reset);
      critical.forEach((issue, i) => {
        console.log(`  ${i + 1}. [${issue.rule_id}] ${issue.rule_name}`);
        console.log(`     ${colors.dim}${issue.message}${colors.reset}`);
        if (issue.can_auto_fix) {
          console.log(`     ${colors.green}✓ Can be auto-fixed with --fix${colors.reset}`);
        }
        console.log('');
      });
    }
    
    if (warnings.length > 0 && !options.onlyCritical) {
      console.log(colors.bright + colors.yellow + '⚠️  WARNINGS:' + colors.reset);
      warnings.forEach((issue, i) => {
        console.log(`  ${i + 1}. [${issue.rule_id}] ${issue.rule_name}`);
        console.log(`     ${colors.dim}${issue.message}${colors.reset}`);
        if (issue.can_auto_fix) {
          console.log(`     ${colors.green}✓ Can be auto-fixed with --fix${colors.reset}`);
        }
        console.log('');
      });
    }
    
    if (info.length > 0 && options.verbose) {
      console.log(colors.bright + colors.blue + 'ℹ️  RECOMMENDATIONS:' + colors.reset);
      info.forEach((issue, i) => {
        console.log(`  ${i + 1}. [${issue.rule_id}] ${issue.rule_name}`);
        console.log(`     ${colors.dim}${issue.message}${colors.reset}`);
        console.log('');
      });
    }
    
    // Auto-fix suggestion
    const fixable = results.filter(r => !r.passed && r.can_auto_fix).length;
    if (fixable > 0 && !options.fix) {
      console.log(colors.bright + colors.green + 
                  `💡 ${fixable} issue(s) can be automatically fixed!` + colors.reset);
      console.log(`   Run: ${colors.cyan}aix-audit ${filePath} --fix${colors.reset}\n`);
    }
    
    console.log('='.repeat(80) + '\n');
  }

  static progressBar(value, length = 30) {
    const filled = Math.round((value / 100) * length);
    const empty = length - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

  static jsonReport(filePath, results, score) {
    return JSON.stringify({
      file: filePath,
      timestamp: new Date().toISOString(),
      score: score,
      issues: results.filter(r => !r.passed),
      passed: results.filter(r => r.passed),
      summary: {
        total_rules: results.length,
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => !r.passed).length,
        critical: results.filter(r => !r.passed && r.severity === 'critical').length,
        warnings: results.filter(r => !r.passed && r.severity === 'warning').length,
        info: results.filter(r => !r.passed && r.severity === 'info').length,
        auto_fixable: results.filter(r => !r.passed && r.can_auto_fix).length
      }
    }, null, 2);
  }
}

// ============================================================================
// CLI ENTRY POINT
// ============================================================================

function printUsage() {
  console.log(`
${colors.bright}${colors.cyan}AIX Security Auditor${colors.reset} v1.0.0

${colors.bright}USAGE:${colors.reset}
  aix-audit <file> [options]

${colors.bright}OPTIONS:${colors.reset}
  --fix              Automatically fix issues where possible
  --json             Output results in JSON format
  --strict           Exit with error code if any issues found
  --verbose, -v      Show all recommendations
  --help, -h         Show this help message

${colors.bright}EXAMPLES:${colors.reset}
  ${colors.dim}# Audit an agent file${colors.reset}
  aix-audit agent.aix

  ${colors.dim}# Audit and auto-fix issues${colors.reset}
  aix-audit agent.aix --fix

  ${colors.dim}# Output JSON for CI/CD integration${colors.reset}
  aix-audit agent.aix --json > report.json

  ${colors.dim}# Strict mode (fail on any issues)${colors.reset}
  aix-audit agent.aix --strict

${colors.bright}SECURITY CATEGORIES:${colors.reset}
  • Security (35%)      - Encryption, signatures, capabilities
  • Compliance (25%)    - GDPR, data retention, privacy
  • Resilience (20%)    - Timeouts, health checks, recovery
  • Performance (10%)   - Resource limits, optimization
  • Best Practices (10%) - Versioning, documentation

${colors.bright}GRADING SCALE:${colors.reset}
  A+ (95-100)  🏆 Perfect security posture
  A  (90-94)   ✅ Excellent security
  B+ (85-89)   👍 Good security
  B  (80-84)   ⚠️  Acceptable security
  C+ (75-79)   ⚠️  Needs improvement
  C  (70-74)   ⚠️  Multiple issues
  D  (60-69)   ⚠️  Serious issues
  F  (<60)     🚨 Critical security gaps

${colors.dim}Documentation: https://github.com/Moeabdelaziz007/maya-travel-agent/tree/pr-7/aix-auditor${colors.reset}
`);
}

async function main() {
  const args = process.argv.slice(2);
  
  // Parse arguments
  if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    printUsage();
    process.exit(0);
  }
  
  const filePath = args[0];
  const options = {
    fix: args.includes('--fix'),
    json: args.includes('--json'),
    strict: args.includes('--strict'),
    verbose: args.includes('--verbose') || args.includes('-v')
  };
  
  // Validate file exists
  if (!fs.existsSync(filePath)) {
    console.error(`${colors.red}Error: File not found: ${filePath}${colors.reset}`);
    process.exit(1);
  }
  
  try {
    // Parse agent file
    let agent = AIXParser.parse(filePath);
    
    // Apply fixes if requested
    if (options.fix) {
      const engine = new RuleEngine();
      const { fixed, fixCount } = engine.autoFix(agent);
      agent = fixed;
      
      // Write fixed file
      const format = path.extname(filePath).substring(1);
      const fixedContent = AIXParser.stringify(agent, format);
      fs.writeFileSync(filePath, fixedContent);
      
      console.log(`${colors.green}✓ Applied ${fixCount} automatic fix(es)${colors.reset}\n`);
    }
    
    // Run audit
    const engine = new RuleEngine();
    const results = engine.audit(agent);
    const score = Scorer.calculate(results);
    
    // Output results
    if (options.json) {
      console.log(ConsoleReporter.jsonReport(filePath, results, score));
    } else {
      ConsoleReporter.report(filePath, results, score, options);
    }
    
    // Exit code
    if (options.strict && results.some(r => !r.passed)) {
      process.exit(1);
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { AIXParser, RuleEngine, Scorer, ConsoleReporter };

