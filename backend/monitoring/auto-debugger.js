#!/usr/bin/env node

/**
 * AUTO DEBUGGER - Intelligent Error Detection and Resolution System
 * Advanced debugging system with automatic error detection, analysis, and fix suggestions
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { MongoClient } from 'mongodb';

const execAsync = promisify(exec);

class AutoDebugger {
    constructor() {
        this.name = "Auto Debugger";
        this.version = "1.0.0";
        this.fixDatabase = new Map();
        this.errorPatterns = new Map();
        this.contextCapture = new Map();
        this.retryAttempts = new Map();
        this.maxRetries = 3;
        this.retryDelay = 1000; // Start with 1 second
        
        // Initialize fix database
        this.initializeFixDatabase();
        this.initializeErrorPatterns();
    }

    /**
     * Initialize database of common fixes
     */
    initializeFixDatabase() {
        // Database connection errors
        this.fixDatabase.set('ECONNREFUSED', {
            type: 'database_connection',
            description: 'Database connection refused',
            fixes: [
                'Check if database server is running',
                'Verify database connection string',
                'Check firewall settings',
                'Restart database service'
            ],
            commands: [
                'brew services restart postgresql',
                'sudo systemctl restart mongod',
                'docker restart postgres'
            ],
            autoFix: true
        });

        // Network timeout errors
        this.fixDatabase.set('ETIMEDOUT', {
            type: 'network_timeout',
            description: 'Network request timed out',
            fixes: [
                'Check network connectivity',
                'Increase timeout settings',
                'Retry with exponential backoff',
                'Check server load'
            ],
            commands: [
                'ping google.com',
                'curl -I https://api.example.com'
            ],
            autoFix: true
        });

        // Memory errors
        this.fixDatabase.set('ENOMEM', {
            type: 'memory_error',
            description: 'Out of memory error',
            fixes: [
                'Restart Node.js process',
                'Clear memory cache',
                'Optimize memory usage',
                'Increase available memory'
            ],
            commands: [
                'sudo purge',
                'pkill -f node',
                'npm run restart'
            ],
            autoFix: true
        });

        // File system errors
        this.fixDatabase.set('ENOENT', {
            type: 'file_not_found',
            description: 'File or directory not found',
            fixes: [
                'Check file path',
                'Create missing directory',
                'Verify file permissions',
                'Check file existence'
            ],
            commands: [
                'mkdir -p /path/to/directory',
                'chmod 755 /path/to/file',
                'ls -la /path/to/file'
            ],
            autoFix: false
        });

        // Permission errors
        this.fixDatabase.set('EACCES', {
            type: 'permission_denied',
            description: 'Permission denied',
            fixes: [
                'Check file permissions',
                'Run with sudo if needed',
                'Change file ownership',
                'Modify permissions'
            ],
            commands: [
                'chmod 755 /path/to/file',
                'sudo chown user:group /path/to/file',
                'ls -la /path/to/file'
            ],
            autoFix: false
        });

        // Port already in use
        this.fixDatabase.set('EADDRINUSE', {
            type: 'port_in_use',
            description: 'Port already in use',
            fixes: [
                'Kill process using the port',
                'Use different port',
                'Restart service',
                'Check for zombie processes'
            ],
            commands: [
                'lsof -ti:3000 | xargs kill -9',
                'netstat -tulpn | grep :3000',
                'pkill -f "node.*3000"'
            ],
            autoFix: true
        });
    }

    /**
     * Initialize error pattern recognition
     */
    initializeErrorPatterns() {
        // Stack trace patterns
        this.errorPatterns.set('stack_trace', {
            regex: /at\s+.*\s+\(.*:\d+:\d+\)/g,
            type: 'stack_trace',
            extractor: (error) => {
                const matches = error.match(/at\s+(.*?)\s+\((.*?):(\d+):(\d+)\)/g);
                return matches?.map(match => {
                    const parts = match.match(/at\s+(.*?)\s+\((.*?):(\d+):(\d+)\)/);
                    return {
                        function: parts[1],
                        file: parts[2],
                        line: parseInt(parts[3]),
                        column: parseInt(parts[4])
                    };
                }) || [];
            }
        });

        // Database error patterns
        this.errorPatterns.set('database_error', {
            regex: /(connection|database|sql|query|table|column).*error/gi,
            type: 'database_error',
            extractor: (error) => {
                const dbType = error.match(/(postgresql|mysql|mongodb|sqlite)/i)?.[1]?.toLowerCase();
                const operation = error.match(/(select|insert|update|delete|create|drop)/i)?.[1]?.toLowerCase();
                return { dbType, operation };
            }
        });

        // Network error patterns
        this.errorPatterns.set('network_error', {
            regex: /(network|connection|timeout|dns|http|https).*error/gi,
            type: 'network_error',
            extractor: (error) => {
                const statusCode = error.match(/status\s+code\s+(\d+)/i)?.[1];
                const url = error.match(/https?:\/\/[^\s]+/i)?.[0];
                return { statusCode, url };
            }
        });

        // Authentication error patterns
        this.errorPatterns.set('auth_error', {
            regex: /(unauthorized|forbidden|authentication|authorization|token|jwt).*error/gi,
            type: 'auth_error',
            extractor: (error) => {
                const authType = error.match(/(jwt|oauth|basic|bearer)/i)?.[1]?.toLowerCase();
                const reason = error.match(/(expired|invalid|missing|malformed)/i)?.[1]?.toLowerCase();
                return { authType, reason };
            }
        });
    }

    /**
     * Detect and classify error
     */
    async detectError(errorMessage, context = {}) {
        const error = {
            id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            message: errorMessage,
            context,
            patterns: [],
            classification: 'unknown',
            severity: 'medium',
            suggestedFixes: [],
            autoFixable: false
        };

        // Analyze error patterns
        for (const [patternName, pattern] of this.errorPatterns) {
            if (pattern.regex.test(errorMessage)) {
                const extracted = pattern.extractor(errorMessage);
                error.patterns.push({
                    name: patternName,
                    type: pattern.type,
                    extracted
                });
            }
        }

        // Classify error
        error.classification = this.classifyError(error);
        error.severity = this.assessSeverity(error);
        
        // Get suggested fixes
        const fixes = this.getSuggestedFixes(error);
        error.suggestedFixes = fixes.fixes;
        error.autoFixable = fixes.autoFixable;

        return error;
    }

    /**
     * Classify error based on patterns and content
     */
    classifyError(error) {
        const message = error.message.toLowerCase();
        
        if (message.includes('database') || message.includes('sql') || message.includes('connection')) {
            return 'database';
        }
        
        if (message.includes('network') || message.includes('timeout') || message.includes('connection')) {
            return 'network';
        }
        
        if (message.includes('auth') || message.includes('unauthorized') || message.includes('forbidden')) {
            return 'authentication';
        }
        
        if (message.includes('memory') || message.includes('heap') || message.includes('out of memory')) {
            return 'memory';
        }
        
        if (message.includes('file') || message.includes('directory') || message.includes('path')) {
            return 'filesystem';
        }
        
        if (message.includes('permission') || message.includes('access denied')) {
            return 'permission';
        }
        
        if (message.includes('port') || message.includes('address in use')) {
            return 'port';
        }
        
        return 'general';
    }

    /**
     * Assess error severity
     */
    assessSeverity(error) {
        const message = error.message.toLowerCase();
        
        // Critical errors
        if (message.includes('fatal') || message.includes('crash') || message.includes('segmentation fault')) {
            return 'critical';
        }
        
        // High severity
        if (message.includes('database') || message.includes('connection refused') || message.includes('out of memory')) {
            return 'high';
        }
        
        // Medium severity
        if (message.includes('timeout') || message.includes('unauthorized') || message.includes('not found')) {
            return 'medium';
        }
        
        // Low severity
        if (message.includes('warning') || message.includes('deprecated') || message.includes('info')) {
            return 'low';
        }
        
        return 'medium';
    }

    /**
     * Get suggested fixes for error
     */
    getSuggestedFixes(error) {
        const fixes = [];
        let autoFixable = false;
        
        // Check fix database
        for (const [errorCode, fix] of this.fixDatabase) {
            if (error.message.includes(errorCode)) {
                fixes.push({
                    type: fix.type,
                    description: fix.description,
                    fixes: fix.fixes,
                    commands: fix.commands
                });
                autoFixable = fix.autoFix;
            }
        }
        
        // Pattern-based fixes
        if (error.classification === 'database') {
            fixes.push({
                type: 'database_general',
                description: 'General database error',
                fixes: [
                    'Check database server status',
                    'Verify connection string',
                    'Check database logs',
                    'Test database connectivity'
                ],
                commands: [
                    'brew services list | grep postgres',
                    'psql -h localhost -U postgres -c "SELECT 1"',
                    'mongo --eval "db.runCommand({ping: 1})"'
                ]
            });
        }
        
        if (error.classification === 'network') {
            fixes.push({
                type: 'network_general',
                description: 'General network error',
                fixes: [
                    'Check internet connectivity',
                    'Verify API endpoints',
                    'Check firewall settings',
                    'Test network connectivity'
                ],
                commands: [
                    'ping google.com',
                    'curl -I https://api.example.com',
                    'netstat -rn'
                ]
            });
        }
        
        return { fixes, autoFixable };
    }

    /**
     * Capture context when error occurs
     */
    async captureContext(error, additionalContext = {}) {
        const context = {
            timestamp: new Date().toISOString(),
            errorId: error.id,
            system: {
                platform: process.platform,
                arch: process.arch,
                nodeVersion: process.version,
                memoryUsage: process.memoryUsage(),
                uptime: process.uptime()
            },
            environment: {
                NODE_ENV: process.env.NODE_ENV,
                PORT: process.env.PORT,
                DATABASE_URL: process.env.DATABASE_URL ? '[REDACTED]' : undefined
            },
            stack: error.stack || error.message,
            ...additionalContext
        };

        // Capture file system context
        try {
            const cwd = process.cwd();
            const files = await fs.readdir(cwd);
            context.fileSystem = {
                currentDirectory: cwd,
                files: files.slice(0, 10) // First 10 files
            };
        } catch (e) {
            context.fileSystem = { error: e.message };
        }

        // Capture process context
        try {
            const { stdout } = await execAsync('ps aux | grep node | head -5');
            context.processes = stdout.split('\n').filter(line => line.trim());
        } catch (e) {
            context.processes = { error: e.message };
        }

        this.contextCapture.set(error.id, context);
        return context;
    }

    /**
     * Attempt automatic fix
     */
    async attemptAutoFix(error) {
        if (!error.autoFixable) {
            return { success: false, message: 'Error is not auto-fixable' };
        }

        const fix = error.suggestedFixes[0];
        if (!fix || !fix.commands) {
            return { success: false, message: 'No auto-fix commands available' };
        }

        try {
            for (const command of fix.commands) {
                console.log(`🔧 Attempting auto-fix: ${command}`);
                const { stdout, stderr } = await execAsync(command);
                
                if (stderr && !stderr.includes('warning')) {
                    console.log(`⚠️ Command warning: ${stderr}`);
                }
                
                console.log(`✅ Command executed: ${command}`);
            }
            
            return { success: true, message: 'Auto-fix completed successfully' };
        } catch (fixError) {
            console.error(`❌ Auto-fix failed: ${fixError.message}`);
            return { success: false, message: `Auto-fix failed: ${fixError.message}` };
        }
    }

    /**
     * Implement retry with exponential backoff
     */
    async retryWithBackoff(operation, maxRetries = this.maxRetries, delay = this.retryDelay) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`🔄 Attempt ${attempt}/${maxRetries}`);
                const result = await operation();
                console.log(`✅ Operation succeeded on attempt ${attempt}`);
                return result;
            } catch (error) {
                lastError = error;
                console.log(`❌ Attempt ${attempt} failed: ${error.message}`);
                
                if (attempt < maxRetries) {
                    const backoffDelay = delay * Math.pow(2, attempt - 1);
                    console.log(`⏳ Waiting ${backoffDelay}ms before retry...`);
                    await new Promise(resolve => setTimeout(resolve, backoffDelay));
                }
            }
        }
        
        console.log(`❌ All ${maxRetries} attempts failed`);
        throw lastError;
    }

    /**
     * Analyze stack trace
     */
    analyzeStackTrace(stackTrace) {
        const analysis = {
            frames: [],
            rootCause: null,
            affectedFiles: [],
            errorLocation: null
        };

        if (!stackTrace) return analysis;

        const lines = stackTrace.split('\n');
        const frameRegex = /at\s+(.*?)\s+\((.*?):(\d+):(\d+)\)/;

        lines.forEach(line => {
            const match = line.match(frameRegex);
            if (match) {
                const frame = {
                    function: match[1],
                    file: match[2],
                    line: parseInt(match[3]),
                    column: parseInt(match[4])
                };
                analysis.frames.push(frame);
                analysis.affectedFiles.push(frame.file);
            }
        });

        // Identify root cause (usually the first frame in our code)
        analysis.rootCause = analysis.frames.find(frame => 
            !frame.file.includes('node_modules') && 
            !frame.file.includes('internal')
        ) || analysis.frames[0];

        // Identify error location (last frame in our code)
        analysis.errorLocation = analysis.frames
            .filter(frame => !frame.file.includes('node_modules'))
            .pop() || analysis.frames[analysis.frames.length - 1];

        return analysis;
    }

    /**
     * Generate debugging report
     */
    async generateDebugReport(error, context, stackAnalysis) {
        const report = {
            errorId: error.id,
            timestamp: new Date().toISOString(),
            summary: {
                classification: error.classification,
                severity: error.severity,
                autoFixable: error.autoFixable,
                patterns: error.patterns.length
            },
            error: {
                message: error.message,
                classification: error.classification,
                severity: error.severity,
                patterns: error.patterns
            },
            context: {
                system: context.system,
                environment: context.environment,
                fileSystem: context.fileSystem
            },
            stackAnalysis: {
                frames: stackAnalysis.frames.length,
                rootCause: stackAnalysis.rootCause,
                errorLocation: stackAnalysis.errorLocation,
                affectedFiles: [...new Set(stackAnalysis.affectedFiles)]
            },
            suggestedFixes: error.suggestedFixes,
            recommendations: this.generateRecommendations(error, context, stackAnalysis)
        };

        return report;
    }

    /**
     * Generate recommendations based on analysis
     */
    generateRecommendations(error, context, stackAnalysis) {
        const recommendations = [];

        // Memory-related recommendations
        if (context.system.memoryUsage.heapUsed > 100 * 1024 * 1024) { // 100MB
            recommendations.push({
                type: 'memory_optimization',
                priority: 'high',
                message: 'High memory usage detected',
                action: 'Consider optimizing memory usage or increasing available memory'
            });
        }

        // File system recommendations
        if (error.classification === 'filesystem') {
            recommendations.push({
                type: 'file_system_check',
                priority: 'medium',
                message: 'File system error detected',
                action: 'Check file permissions and disk space'
            });
        }

        // Network recommendations
        if (error.classification === 'network') {
            recommendations.push({
                type: 'network_check',
                priority: 'medium',
                message: 'Network error detected',
                action: 'Check network connectivity and firewall settings'
            });
        }

        // Code quality recommendations
        if (stackAnalysis.frames.length > 10) {
            recommendations.push({
                type: 'code_complexity',
                priority: 'low',
                message: 'Deep stack trace detected',
                action: 'Consider refactoring to reduce complexity'
            });
        }

        return recommendations;
    }

    /**
     * Main debugging workflow
     */
    async debugError(errorMessage, additionalContext = {}) {
        console.log('🔍 Starting auto-debugging process...');
        
        // Step 1: Detect and classify error
        const error = await this.detectError(errorMessage, additionalContext);
        console.log(`📊 Error classified as: ${error.classification} (${error.severity})`);
        
        // Step 2: Capture context
        const context = await this.captureContext(error, additionalContext);
        console.log('📋 Context captured');
        
        // Step 3: Analyze stack trace
        const stackAnalysis = this.analyzeStackTrace(error.stack || error.message);
        console.log(`🔍 Stack trace analyzed: ${stackAnalysis.frames.length} frames`);
        
        // Step 4: Generate report
        const report = await this.generateDebugReport(error, context, stackAnalysis);
        console.log('📄 Debug report generated');
        
        // Step 5: Attempt auto-fix if possible
        if (error.autoFixable) {
            console.log('🔧 Attempting automatic fix...');
            const fixResult = await this.attemptAutoFix(error);
            report.autoFixResult = fixResult;
        }
        
        return report;
    }

    /**
     * CLI interface
     */
    async runCommand(command, args = []) {
        switch (command) {
            case 'debug':
                if (args.length < 1) {
                    console.error('❌ Please provide error message');
                    return;
                }
                const report = await this.debugError(args[0]);
                console.log('🔍 Debug Report:');
                console.log(JSON.stringify(report, null, 2));
                break;
                
            case 'retry':
                if (args.length < 1) {
                    console.error('❌ Please provide operation to retry');
                    return;
                }
                try {
                    const result = await this.retryWithBackoff(async () => {
                        const { stdout } = await execAsync(args[0]);
                        return stdout;
                    });
                    console.log('✅ Retry successful:', result);
                } catch (error) {
                    console.error('❌ Retry failed:', error.message);
                }
                break;
                
            case 'analyze':
                if (args.length < 1) {
                    console.error('❌ Please provide stack trace to analyze');
                    return;
                }
                const analysis = this.analyzeStackTrace(args[0]);
                console.log('🔍 Stack Trace Analysis:');
                console.log(JSON.stringify(analysis, null, 2));
                break;
                
            default:
                console.log(`
Auto Debugger v${this.version}

Usage: node auto-debugger.js <command> [args]

Commands:
  debug <error_message>     - Debug an error message
  retry <command>           - Retry command with exponential backoff
  analyze <stack_trace>     - Analyze stack trace

Examples:
  node auto-debugger.js debug "Connection refused to database"
  node auto-debugger.js retry "npm start"
  node auto-debugger.js analyze "Error: Cannot read property..."
                `);
        }
    }
}

// CLI Interface
async function main() {
    const debugger = new AutoDebugger();
    const args = process.argv.slice(2);
    const command = args[0];
    const commandArgs = args.slice(1);
    
    if (command) {
        await debugger.runCommand(command, commandArgs);
    } else {
        console.log('🔧 Auto Debugger - Intelligent Error Detection and Resolution');
        console.log('Use --help for usage information');
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export default AutoDebugger;

