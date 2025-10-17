#!/usr/bin/env node

/**
 * LOG ANALYZER - Advanced JSON Log Analysis with jq Integration
 * Professional log analysis system with pattern detection and real-time streaming
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { createReadStream } from 'fs';
import readline from 'readline';

const execAsync = promisify(exec);

class LogAnalyzer {
    constructor() {
        this.name = "Log Analyzer";
        this.version = "1.0.0";
        this.patterns = {
            errors: [],
            warnings: [],
            performance: [],
            security: [],
            custom: []
        };
        this.stats = {
            totalLogs: 0,
            errorCount: 0,
            warningCount: 0,
            infoCount: 0,
            debugCount: 0
        };
        this.realTimeStreams = new Map();
    }

    /**
     * Test jq installation and functionality
     */
    async testJqInstallation() {
        try {
            const { stdout } = await execAsync('jq --version');
            console.log(`✅ jq installed: ${stdout.trim()}`);
            
            // Test JSON parsing
            const testJson = '{"level":"info","message":"Test message","timestamp":"2025-01-13T10:00:00Z"}';
            const { stdout: parsed } = await execAsync(`echo '${testJson}' | jq .`);
            console.log('✅ jq JSON parsing test passed');
            
            return true;
        } catch (error) {
            console.error('❌ jq test failed:', error.message);
            return false;
        }
    }

    /**
     * Parse JSON log file using jq
     */
    async parseLogFile(filePath, filters = {}) {
        try {
            let jqCommand = `jq -r '.' "${filePath}"`;
            
            // Apply filters
            if (filters.level) {
                jqCommand = `jq -r 'select(.level == "${filters.level}")' "${filePath}"`;
            }
            
            if (filters.timeRange) {
                const { start, end } = filters.timeRange;
                jqCommand = `jq -r 'select(.timestamp >= "${start}" and .timestamp <= "${end}")' "${filePath}"`;
            }
            
            if (filters.message) {
                jqCommand = `jq -r 'select(.message | contains("${filters.message}"))' "${filePath}"`;
            }
            
            const { stdout } = await execAsync(jqCommand);
            const lines = stdout.trim().split('\n').filter(line => line);
            
            return lines.map(line => {
                try {
                    return JSON.parse(line);
                } catch (e) {
                    return { raw: line, parseError: true };
                }
            });
        } catch (error) {
            console.error('Error parsing log file:', error.message);
            return [];
        }
    }

    /**
     * Detect error patterns in logs
     */
    detectErrorPatterns(logs) {
        const patterns = {
            databaseErrors: [],
            networkErrors: [],
            authenticationErrors: [],
            validationErrors: [],
            systemErrors: []
        };

        logs.forEach(log => {
            if (log.level === 'error' || log.level === 'ERROR') {
                const message = log.message?.toLowerCase() || '';
                
                // Database error patterns
                if (message.includes('database') || message.includes('sql') || message.includes('connection')) {
                    patterns.databaseErrors.push(log);
                }
                
                // Network error patterns
                if (message.includes('network') || message.includes('timeout') || message.includes('connection refused')) {
                    patterns.networkErrors.push(log);
                }
                
                // Authentication error patterns
                if (message.includes('auth') || message.includes('unauthorized') || message.includes('forbidden')) {
                    patterns.authenticationErrors.push(log);
                }
                
                // Validation error patterns
                if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
                    patterns.validationErrors.push(log);
                }
                
                // System error patterns
                if (message.includes('memory') || message.includes('cpu') || message.includes('disk')) {
                    patterns.systemErrors.push(log);
                }
            }
        });

        return patterns;
    }

    /**
     * Analyze log statistics
     */
    analyzeLogStats(logs) {
        const stats = {
            total: logs.length,
            byLevel: {},
            byHour: {},
            byDay: {},
            errorRate: 0,
            warningRate: 0
        };

        logs.forEach(log => {
            // Count by level
            const level = log.level?.toLowerCase() || 'unknown';
            stats.byLevel[level] = (stats.byLevel[level] || 0) + 1;
            
            // Count by hour
            if (log.timestamp) {
                const hour = new Date(log.timestamp).getHours();
                stats.byHour[hour] = (stats.byHour[hour] || 0) + 1;
                
                const day = new Date(log.timestamp).toDateString();
                stats.byDay[day] = (stats.byDay[day] || 0) + 1;
            }
        });

        // Calculate rates
        stats.errorRate = (stats.byLevel.error || 0) / stats.total * 100;
        stats.warningRate = (stats.byLevel.warn || 0) / stats.total * 100;

        return stats;
    }

    /**
     * Start real-time log streaming
     */
    async startRealTimeStreaming(filePath, callback) {
        try {
            // Check if file exists
            await fs.access(filePath);
            
            const streamId = `stream_${Date.now()}`;
            const rl = readline.createInterface({
                input: createReadStream(filePath),
                crlfDelay: Infinity
            });

            let lastPosition = 0;
            
            // Get initial file size
            const stats = await fs.stat(filePath);
            lastPosition = stats.size;

            // Watch for file changes
            const watcher = fs.watch(filePath, async (eventType) => {
                if (eventType === 'change') {
                    const newStats = await fs.stat(filePath);
                    if (newStats.size > lastPosition) {
                        // Read new content
                        const buffer = Buffer.alloc(newStats.size - lastPosition);
                        const fd = await fs.open(filePath, 'r');
                        await fd.read(buffer, 0, buffer.length, lastPosition);
                        await fd.close();
                        
                        const newContent = buffer.toString();
                        const newLines = newContent.split('\n').filter(line => line.trim());
                        
                        for (const line of newLines) {
                            try {
                                const logEntry = JSON.parse(line);
                                const formatted = await this.formatLogEntry(logEntry);
                                callback(formatted, logEntry);
                            } catch (e) {
                                // Handle non-JSON lines
                                callback(line, { raw: line, parseError: true });
                            }
                        }
                        
                        lastPosition = newStats.size;
                    }
                }
            });

            this.realTimeStreams.set(streamId, { rl, watcher });
            console.log(`✅ Real-time streaming started for ${filePath} (ID: ${streamId})`);
            
            return streamId;
        } catch (error) {
            console.error('Error starting real-time streaming:', error.message);
            return null;
        }
    }

    /**
     * Stop real-time streaming
     */
    stopRealTimeStreaming(streamId) {
        const stream = this.realTimeStreams.get(streamId);
        if (stream) {
            stream.rl.close();
            stream.watcher.close();
            this.realTimeStreams.delete(streamId);
            console.log(`✅ Real-time streaming stopped (ID: ${streamId})`);
        }
    }

    /**
     * Format log entry using jq
     */
    async formatLogEntry(logEntry) {
        try {
            const jsonString = JSON.stringify(logEntry);
            const { stdout } = await execAsync(`echo '${jsonString}' | jq -r '"[\(.timestamp // "N/A")] \(.level // "INFO" | ascii_upcase) - \(.message // "No message")"'`);
            return stdout.trim();
        } catch (error) {
            return `[${logEntry.timestamp || 'N/A'}] ${(logEntry.level || 'INFO').toUpperCase()} - ${logEntry.message || 'No message'}`;
        }
    }

    /**
     * Search logs using jq
     */
    async searchLogs(filePath, query) {
        try {
            const jqCommand = `jq -r 'select(.message | contains("${query}") or .level | contains("${query}") or .timestamp | contains("${query}"))' "${filePath}"`;
            const { stdout } = await execAsync(jqCommand);
            
            const results = stdout.trim().split('\n').filter(line => line);
            return results.map(line => JSON.parse(line));
        } catch (error) {
            console.error('Error searching logs:', error.message);
            return [];
        }
    }

    /**
     * Generate log report
     */
    async generateLogReport(filePath, options = {}) {
        try {
            const logs = await this.parseLogFile(filePath, options.filters);
            const patterns = this.detectErrorPatterns(logs);
            const stats = this.analyzeLogStats(logs);
            
            const report = {
                timestamp: new Date().toISOString(),
                filePath,
                summary: {
                    totalLogs: stats.total,
                    errorCount: stats.byLevel.error || 0,
                    warningCount: stats.byLevel.warn || 0,
                    infoCount: stats.byLevel.info || 0,
                    errorRate: stats.errorRate.toFixed(2) + '%',
                    warningRate: stats.warningRate.toFixed(2) + '%'
                },
                patterns: {
                    databaseErrors: patterns.databaseErrors.length,
                    networkErrors: patterns.networkErrors.length,
                    authenticationErrors: patterns.authenticationErrors.length,
                    validationErrors: patterns.validationErrors.length,
                    systemErrors: patterns.systemErrors.length
                },
                distribution: {
                    byLevel: stats.byLevel,
                    byHour: stats.byHour,
                    byDay: stats.byDay
                },
                recommendations: this.generateRecommendations(patterns, stats)
            };
            
            return report;
        } catch (error) {
            console.error('Error generating log report:', error.message);
            return null;
        }
    }

    /**
     * Generate recommendations based on log analysis
     */
    generateRecommendations(patterns, stats) {
        const recommendations = [];
        
        if (stats.errorRate > 5) {
            recommendations.push({
                type: 'error_rate_high',
                message: `High error rate detected: ${stats.errorRate.toFixed(2)}%`,
                action: 'Investigate error patterns and implement fixes'
            });
        }
        
        if (patterns.databaseErrors.length > 0) {
            recommendations.push({
                type: 'database_errors',
                message: `${patterns.databaseErrors.length} database errors found`,
                action: 'Check database connections and query performance'
            });
        }
        
        if (patterns.networkErrors.length > 0) {
            recommendations.push({
                type: 'network_errors',
                message: `${patterns.networkErrors.length} network errors found`,
                action: 'Check network connectivity and timeout settings'
            });
        }
        
        if (patterns.authenticationErrors.length > 0) {
            recommendations.push({
                type: 'auth_errors',
                message: `${patterns.authenticationErrors.length} authentication errors found`,
                action: 'Review authentication logic and token validation'
            });
        }
        
        return recommendations;
    }

    /**
     * Export logs to different formats
     */
    async exportLogs(filePath, format = 'json', outputPath) {
        try {
            const logs = await this.parseLogFile(filePath);
            
            switch (format) {
                case 'json':
                    await fs.writeFile(outputPath, JSON.stringify(logs, null, 2));
                    break;
                case 'csv':
                    const csv = this.convertToCSV(logs);
                    await fs.writeFile(outputPath, csv);
                    break;
                case 'txt':
                    const txt = logs.map(log => 
                        `[${log.timestamp || 'N/A'}] ${(log.level || 'INFO').toUpperCase()} - ${log.message || 'No message'}`
                    ).join('\n');
                    await fs.writeFile(outputPath, txt);
                    break;
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }
            
            console.log(`✅ Logs exported to ${outputPath} in ${format} format`);
        } catch (error) {
            console.error('Error exporting logs:', error.message);
        }
    }

    /**
     * Convert logs to CSV format
     */
    convertToCSV(logs) {
        if (logs.length === 0) return '';
        
        const headers = ['timestamp', 'level', 'message', 'source', 'userId', 'requestId'];
        const csvRows = [headers.join(',')];
        
        logs.forEach(log => {
            const row = headers.map(header => {
                const value = log[header] || '';
                return `"${value.toString().replace(/"/g, '""')}"`;
            });
            csvRows.push(row.join(','));
        });
        
        return csvRows.join('\n');
    }

    /**
     * Clean up old logs
     */
    async cleanupOldLogs(directory, maxAge = 30) {
        try {
            const files = await fs.readdir(directory);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - maxAge);
            
            let cleanedCount = 0;
            
            for (const file of files) {
                if (file.endsWith('.log')) {
                    const filePath = path.join(directory, file);
                    const stats = await fs.stat(filePath);
                    
                    if (stats.mtime < cutoffDate) {
                        await fs.unlink(filePath);
                        cleanedCount++;
                        console.log(`🗑️ Deleted old log file: ${file}`);
                    }
                }
            }
            
            console.log(`✅ Cleaned up ${cleanedCount} old log files`);
        } catch (error) {
            console.error('Error cleaning up logs:', error.message);
        }
    }

    /**
     * CLI interface
     */
    async runCommand(command, args = []) {
        switch (command) {
            case 'test':
                await this.testJqInstallation();
                break;
                
            case 'parse':
                if (args.length < 1) {
                    console.error('❌ Please provide log file path');
                    return;
                }
                const logs = await this.parseLogFile(args[0]);
                console.log(`📊 Parsed ${logs.length} log entries`);
                break;
                
            case 'search':
                if (args.length < 2) {
                    console.error('❌ Please provide log file path and search query');
                    return;
                }
                const results = await this.searchLogs(args[0], args[1]);
                console.log(`🔍 Found ${results.length} matching entries`);
                results.forEach(log => console.log(JSON.stringify(log, null, 2)));
                break;
                
            case 'report':
                if (args.length < 1) {
                    console.error('❌ Please provide log file path');
                    return;
                }
                const report = await this.generateLogReport(args[0]);
                console.log('📋 Log Analysis Report:');
                console.log(JSON.stringify(report, null, 2));
                break;
                
            case 'stream':
                if (args.length < 1) {
                    console.error('❌ Please provide log file path');
                    return;
                }
                const streamId = await this.startRealTimeStreaming(args[0], (formatted, raw) => {
                    console.log(formatted);
                });
                console.log(`🔄 Real-time streaming started (ID: ${streamId})`);
                console.log('Press Ctrl+C to stop');
                break;
                
            case 'export':
                if (args.length < 3) {
                    console.error('❌ Please provide: filePath format outputPath');
                    return;
                }
                await this.exportLogs(args[0], args[1], args[2]);
                break;
                
            case 'cleanup':
                if (args.length < 1) {
                    console.error('❌ Please provide log directory path');
                    return;
                }
                const maxAge = args[1] ? parseInt(args[1]) : 30;
                await this.cleanupOldLogs(args[0], maxAge);
                break;
                
            default:
                console.log(`
Log Analyzer v${this.version}

Usage: node log-analyzer.js <command> [args]

Commands:
  test                           - Test jq installation
  parse <file>                   - Parse log file
  search <file> <query>          - Search logs
  report <file>                  - Generate analysis report
  stream <file>                  - Start real-time streaming
  export <file> <format> <out>   - Export logs (json/csv/txt)
  cleanup <dir> [maxAge]         - Clean up old logs

Examples:
  node log-analyzer.js test
  node log-analyzer.js parse backend/logs/app.log
  node log-analyzer.js search backend/logs/app.log "error"
  node log-analyzer.js report backend/logs/app.log
  node log-analyzer.js stream backend/logs/app.log
  node log-analyzer.js export backend/logs/app.log json logs_export.json
  node log-analyzer.js cleanup backend/logs 30
                `);
        }
    }
}

// CLI Interface
async function main() {
    const analyzer = new LogAnalyzer();
    const args = process.argv.slice(2);
    const command = args[0];
    const commandArgs = args.slice(1);
    
    if (command) {
        await analyzer.runCommand(command, commandArgs);
    } else {
        console.log('🔍 Log Analyzer - Advanced JSON Log Analysis');
        console.log('Use --help for usage information');
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export default LogAnalyzer;

