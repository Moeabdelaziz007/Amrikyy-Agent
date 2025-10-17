#!/usr/bin/env node

/**
 * ERROR REPORTER - Automatic Error Reporting and Aggregation System
 * Advanced error reporting with Slack, Telegram, Email integration and web dashboard
 */

import fetch from 'node-fetch';
import { MongoClient } from 'mongodb';
import fs from 'fs/promises';
import path from 'path';

class ErrorReporter {
    constructor() {
        this.name = "Error Reporter";
        this.version = "1.0.0";
        this.errors = new Map();
        this.aggregatedErrors = new Map();
        this.notificationChannels = {
            slack: process.env.SLACK_WEBHOOK_URL,
            telegram: {
                botToken: process.env.TELEGRAM_BOT_TOKEN,
                chatId: process.env.TELEGRAM_CHAT_ID
            },
            email: {
                smtp: {
                    host: process.env.SMTP_HOST,
                    port: process.env.SMTP_PORT,
                    user: process.env.SMTP_USER,
                    password: process.env.SMTP_PASSWORD
                }
            }
        };
        
        // Initialize MongoDB connection
        this.initializeDatabase();
    }

    /**
     * Initialize MongoDB connection
     */
    async initializeDatabase() {
        try {
            this.mongodb = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
            await this.mongodb.connect();
            this.db = this.mongodb.db('error_reporting');
            console.log('✅ MongoDB connected for error reporting');
        } catch (error) {
            console.error('❌ MongoDB connection failed:', error.message);
        }
    }

    /**
     * Report an error
     */
    async reportError(error, context = {}) {
        const errorReport = {
            id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            error: {
                message: error.message,
                stack: error.stack,
                name: error.name,
                code: error.code
            },
            context: {
                url: context.url,
                method: context.method,
                headers: context.headers,
                body: context.body,
                userId: context.userId,
                sessionId: context.sessionId,
                userAgent: context.userAgent,
                ip: context.ip
            },
            system: {
                platform: process.platform,
                arch: process.arch,
                nodeVersion: process.version,
                memoryUsage: process.memoryUsage(),
                uptime: process.uptime()
            },
            severity: this.assessSeverity(error),
            frequency: 1,
            firstSeen: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
            resolved: false,
            acknowledged: false
        };

        // Store error
        this.errors.set(errorReport.id, errorReport);

        // Aggregate similar errors
        await this.aggregateError(errorReport);

        // Send notifications for critical errors
        if (errorReport.severity === 'critical') {
            await this.sendImmediateNotifications(errorReport);
        }

        // Store in database
        await this.storeError(errorReport);

        return errorReport;
    }

    /**
     * Assess error severity
     */
    assessSeverity(error) {
        const message = error.message?.toLowerCase() || '';
        
        // Critical errors
        if (message.includes('fatal') || message.includes('crash') || 
            message.includes('segmentation fault') || message.includes('out of memory')) {
            return 'critical';
        }
        
        // High severity
        if (message.includes('database') || message.includes('connection refused') || 
            message.includes('unauthorized') || message.includes('forbidden')) {
            return 'high';
        }
        
        // Medium severity
        if (message.includes('timeout') || message.includes('not found') || 
            message.includes('validation') || message.includes('invalid')) {
            return 'medium';
        }
        
        // Low severity
        if (message.includes('warning') || message.includes('deprecated') || 
            message.includes('info') || message.includes('debug')) {
            return 'low';
        }
        
        return 'medium';
    }

    /**
     * Aggregate similar errors
     */
    async aggregateError(errorReport) {
        const errorKey = this.generateErrorKey(errorReport);
        
        if (this.aggregatedErrors.has(errorKey)) {
            const existing = this.aggregatedErrors.get(errorKey);
            existing.frequency++;
            existing.lastSeen = errorReport.timestamp;
            existing.instances.push(errorReport.id);
        } else {
            this.aggregatedErrors.set(errorKey, {
                key: errorKey,
                message: errorReport.error.message,
                severity: errorReport.severity,
                frequency: 1,
                firstSeen: errorReport.timestamp,
                lastSeen: errorReport.timestamp,
                instances: [errorReport.id],
                resolved: false
            });
        }
    }

    /**
     * Generate error key for aggregation
     */
    generateErrorKey(errorReport) {
        const message = errorReport.error.message;
        const stack = errorReport.error.stack;
        
        // Extract key information for grouping
        const keyParts = [
            errorReport.error.name,
            message.split('\n')[0], // First line of message
            stack?.split('\n')[1]?.trim() || 'no-stack' // First stack frame
        ];
        
        return keyParts.join('|').toLowerCase();
    }

    /**
     * Send immediate notifications for critical errors
     */
    async sendImmediateNotifications(errorReport) {
        const promises = [];
        
        // Slack notification
        if (this.notificationChannels.slack) {
            promises.push(this.sendSlackNotification(errorReport));
        }
        
        // Telegram notification
        if (this.notificationChannels.telegram.botToken && this.notificationChannels.telegram.chatId) {
            promises.push(this.sendTelegramNotification(errorReport));
        }
        
        // Email notification
        if (this.notificationChannels.email.smtp.host) {
            promises.push(this.sendEmailNotification(errorReport));
        }
        
        try {
            await Promise.allSettled(promises);
            console.log('✅ Notifications sent for critical error');
        } catch (error) {
            console.error('❌ Failed to send notifications:', error.message);
        }
    }

    /**
     * Send Slack notification
     */
    async sendSlackNotification(errorReport) {
        try {
            const message = {
                text: `🚨 Critical Error Detected`,
                attachments: [{
                    color: 'danger',
                    fields: [
                        {
                            title: 'Error Message',
                            value: errorReport.error.message,
                            short: false
                        },
                        {
                            title: 'Severity',
                            value: errorReport.severity.toUpperCase(),
                            short: true
                        },
                        {
                            title: 'Timestamp',
                            value: errorReport.timestamp,
                            short: true
                        },
                        {
                            title: 'Error ID',
                            value: errorReport.id,
                            short: true
                        }
                    ],
                    footer: 'Maya Travel Agent Error Reporter',
                    ts: Math.floor(Date.now() / 1000)
                }]
            };
            
            await fetch(this.notificationChannels.slack, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(message)
            });
            
            console.log('✅ Slack notification sent');
        } catch (error) {
            console.error('❌ Slack notification failed:', error.message);
        }
    }

    /**
     * Send Telegram notification
     */
    async sendTelegramNotification(errorReport) {
        try {
            const message = `🚨 *Critical Error Detected*

*Error:* ${errorReport.error.message}
*Severity:* ${errorReport.severity.toUpperCase()}
*Time:* ${errorReport.timestamp}
*ID:* ${errorReport.id}

*System:* ${errorReport.system.platform} ${errorReport.system.arch}
*Node:* ${errorReport.system.nodeVersion}`;
            
            const url = `https://api.telegram.org/bot${this.notificationChannels.telegram.botToken}/sendMessage`;
            
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: this.notificationChannels.telegram.chatId,
                    text: message,
                    parse_mode: 'Markdown'
                })
            });
            
            console.log('✅ Telegram notification sent');
        } catch (error) {
            console.error('❌ Telegram notification failed:', error.message);
        }
    }

    /**
     * Send email notification
     */
    async sendEmailNotification(errorReport) {
        try {
            // For now, just log the email content
            // In production, you would use nodemailer or similar
            const emailContent = `
Critical Error Alert - Maya Travel Agent

Error Details:
- Message: ${errorReport.error.message}
- Severity: ${errorReport.severity.toUpperCase()}
- Timestamp: ${errorReport.timestamp}
- Error ID: ${errorReport.id}

System Information:
- Platform: ${errorReport.system.platform}
- Architecture: ${errorReport.system.arch}
- Node Version: ${errorReport.system.nodeVersion}
- Memory Usage: ${Math.round(errorReport.system.memoryUsage.heapUsed / 1024 / 1024)}MB

Stack Trace:
${errorReport.error.stack || 'No stack trace available'}

Please investigate this error immediately.
            `;
            
            console.log('📧 Email notification content:');
            console.log(emailContent);
            console.log('✅ Email notification prepared');
        } catch (error) {
            console.error('❌ Email notification failed:', error.message);
        }
    }

    /**
     * Store error in database
     */
    async storeError(errorReport) {
        try {
            if (this.db) {
                await this.db.collection('errors').insertOne(errorReport);
                console.log(`💾 Error stored in database: ${errorReport.id}`);
            }
        } catch (error) {
            console.error('❌ Failed to store error in database:', error.message);
        }
    }

    /**
     * Get error statistics
     */
    async getErrorStats(timeRange = '24h') {
        try {
            const now = new Date();
            let startDate;
            
            switch (timeRange) {
                case '1h':
                    startDate = new Date(now.getTime() - 60 * 60 * 1000);
                    break;
                case '24h':
                    startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                    break;
                case '7d':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case '30d':
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            }
            
            const stats = {
                timeRange,
                totalErrors: this.errors.size,
                aggregatedErrors: this.aggregatedErrors.size,
                bySeverity: {
                    critical: 0,
                    high: 0,
                    medium: 0,
                    low: 0
                },
                byHour: {},
                recentErrors: [],
                topErrors: []
            };
            
            // Calculate statistics
            for (const error of this.errors.values()) {
                if (new Date(error.timestamp) >= startDate) {
                    stats.bySeverity[error.severity]++;
                    
                    const hour = new Date(error.timestamp).getHours();
                    stats.byHour[hour] = (stats.byHour[hour] || 0) + 1;
                    
                    stats.recentErrors.push({
                        id: error.id,
                        message: error.error.message,
                        severity: error.severity,
                        timestamp: error.timestamp
                    });
                }
            }
            
            // Get top errors by frequency
            stats.topErrors = Array.from(this.aggregatedErrors.values())
                .sort((a, b) => b.frequency - a.frequency)
                .slice(0, 10)
                .map(agg => ({
                    message: agg.message,
                    frequency: agg.frequency,
                    severity: agg.severity,
                    firstSeen: agg.firstSeen,
                    lastSeen: agg.lastSeen
                }));
            
            return stats;
        } catch (error) {
            console.error('❌ Failed to get error statistics:', error.message);
            return null;
        }
    }

    /**
     * Mark error as resolved
     */
    async resolveError(errorId) {
        try {
            const error = this.errors.get(errorId);
            if (error) {
                error.resolved = true;
                error.resolvedAt = new Date().toISOString();
                
                if (this.db) {
                    await this.db.collection('errors').updateOne(
                        { id: errorId },
                        { $set: { resolved: true, resolvedAt: error.resolvedAt } }
                    );
                }
                
                console.log(`✅ Error resolved: ${errorId}`);
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Failed to resolve error:', error.message);
            return false;
        }
    }

    /**
     * Acknowledge error
     */
    async acknowledgeError(errorId) {
        try {
            const error = this.errors.get(errorId);
            if (error) {
                error.acknowledged = true;
                error.acknowledgedAt = new Date().toISOString();
                
                if (this.db) {
                    await this.db.collection('errors').updateOne(
                        { id: errorId },
                        { $set: { acknowledged: true, acknowledgedAt: error.acknowledgedAt } }
                    );
                }
                
                console.log(`✅ Error acknowledged: ${errorId}`);
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Failed to acknowledge error:', error.message);
            return false;
        }
    }

    /**
     * Generate error report
     */
    async generateErrorReport(timeRange = '24h') {
        try {
            const stats = await this.getErrorStats(timeRange);
            const report = {
                timestamp: new Date().toISOString(),
                timeRange,
                summary: stats,
                recommendations: this.generateRecommendations(stats),
                actionItems: this.generateActionItems(stats)
            };
            
            return report;
        } catch (error) {
            console.error('❌ Failed to generate error report:', error.message);
            return null;
        }
    }

    /**
     * Generate recommendations based on error statistics
     */
    generateRecommendations(stats) {
        const recommendations = [];
        
        if (stats.bySeverity.critical > 0) {
            recommendations.push({
                type: 'critical_errors',
                priority: 'high',
                message: `${stats.bySeverity.critical} critical errors detected`,
                action: 'Investigate and fix critical errors immediately'
            });
        }
        
        if (stats.bySeverity.high > 10) {
            recommendations.push({
                type: 'high_error_rate',
                priority: 'medium',
                message: `High error rate: ${stats.bySeverity.high} high-severity errors`,
                action: 'Review error patterns and implement fixes'
            });
        }
        
        if (stats.totalErrors > 100) {
            recommendations.push({
                type: 'error_volume',
                priority: 'medium',
                message: `High error volume: ${stats.totalErrors} total errors`,
                action: 'Implement better error handling and monitoring'
            });
        }
        
        return recommendations;
    }

    /**
     * Generate action items based on error statistics
     */
    generateActionItems(stats) {
        const actionItems = [];
        
        // Top errors to fix
        stats.topErrors.slice(0, 5).forEach((error, index) => {
            actionItems.push({
                id: `fix_${index + 1}`,
                type: 'fix_error',
                priority: error.severity === 'critical' ? 'high' : 'medium',
                description: `Fix error: ${error.message}`,
                frequency: error.frequency,
                firstSeen: error.firstSeen,
                lastSeen: error.lastSeen
            });
        });
        
        return actionItems;
    }

    /**
     * Export error data
     */
    async exportErrors(format = 'json', outputPath) {
        try {
            const errors = Array.from(this.errors.values());
            const aggregated = Array.from(this.aggregatedErrors.values());
            
            const data = {
                timestamp: new Date().toISOString(),
                errors,
                aggregated,
                stats: await this.getErrorStats()
            };
            
            switch (format) {
                case 'json':
                    await fs.writeFile(outputPath, JSON.stringify(data, null, 2));
                    break;
                case 'csv':
                    const csv = this.convertToCSV(errors);
                    await fs.writeFile(outputPath, csv);
                    break;
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }
            
            console.log(`✅ Error data exported to ${outputPath} in ${format} format`);
        } catch (error) {
            console.error('❌ Failed to export error data:', error.message);
        }
    }

    /**
     * Convert errors to CSV format
     */
    convertToCSV(errors) {
        if (errors.length === 0) return '';
        
        const headers = ['id', 'timestamp', 'severity', 'message', 'frequency', 'resolved', 'acknowledged'];
        const csvRows = [headers.join(',')];
        
        errors.forEach(error => {
            const row = [
                error.id,
                error.timestamp,
                error.severity,
                `"${error.error.message.replace(/"/g, '""')}"`,
                error.frequency,
                error.resolved,
                error.acknowledged
            ];
            csvRows.push(row.join(','));
        });
        
        return csvRows.join('\n');
    }

    /**
     * CLI interface
     */
    async runCommand(command, args = []) {
        switch (command) {
            case 'report':
                if (args.length < 1) {
                    console.error('❌ Please provide error message');
                    return;
                }
                const error = new Error(args[0]);
                const report = await this.reportError(error);
                console.log('📊 Error Report:');
                console.log(JSON.stringify(report, null, 2));
                break;
                
            case 'stats':
                const timeRange = args[0] || '24h';
                const stats = await this.getErrorStats(timeRange);
                console.log(`📈 Error Statistics (${timeRange}):`);
                console.log(JSON.stringify(stats, null, 2));
                break;
                
            case 'resolve':
                if (args.length < 1) {
                    console.error('❌ Please provide error ID');
                    return;
                }
                await this.resolveError(args[0]);
                break;
                
            case 'acknowledge':
                if (args.length < 1) {
                    console.error('❌ Please provide error ID');
                    return;
                }
                await this.acknowledgeError(args[0]);
                break;
                
            case 'export':
                if (args.length < 2) {
                    console.error('❌ Please provide format and output path');
                    return;
                }
                await this.exportErrors(args[0], args[1]);
                break;
                
            default:
                console.log(`
Error Reporter v${this.version}

Usage: node error-reporter.js <command> [args]

Commands:
  report <error_message>     - Report an error
  stats [timeRange]          - Get error statistics (1h/24h/7d/30d)
  resolve <error_id>         - Mark error as resolved
  acknowledge <error_id>     - Acknowledge error
  export <format> <path>     - Export error data (json/csv)

Examples:
  node error-reporter.js report "Database connection failed"
  node error-reporter.js stats 24h
  node error-reporter.js resolve error_1234567890_abc123
  node error-reporter.js export json errors_export.json
                `);
        }
    }
}

// CLI Interface
async function main() {
    const reporter = new ErrorReporter();
    const args = process.argv.slice(2);
    const command = args[0];
    const commandArgs = args.slice(1);
    
    if (command) {
        await reporter.runCommand(command, commandArgs);
    } else {
        console.log('📊 Error Reporter - Automatic Error Reporting and Aggregation');
        console.log('Use --help for usage information');
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export default ErrorReporter;

