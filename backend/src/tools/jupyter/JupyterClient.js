/**
 * JupyterClient - Simple client for executing Python code via Jupyter API
 * Uses direct HTTP requests to Jupyter's REST API
 * 
 * @author Maya Travel Agent Team
 * @version 1.0.0
 */

const axios = require('axios');
const EventEmitter = require('events');

class JupyterClient extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            serverUrl: config.serverUrl || 'http://localhost:8888',
            token: config.token || null,
            executionTimeout: config.executionTimeout || 300000, // 5 minutes
            enableLogging: config.enableLogging !== false,
            ...config
        };
        
        // Client state
        this.isConnected = false;
        this.sessionId = null;
        this.kernelId = null;
        
        // Setup logger
        this.setupLogger();
        
        this.logger.info('JupyterClient initialized', {
            serverUrl: this.config.serverUrl
        });
    }
    
    /**
     * Setup simple logger
     */
    setupLogger() {
        this.logger = {
            info: (message, meta = {}) => {
                if (this.config.enableLogging) {
                    console.log(`[JupyterClient] INFO: ${message}`, meta);
                }
            },
            error: (message, meta = {}) => {
                console.error(`[JupyterClient] ERROR: ${message}`, meta);
            },
            warn: (message, meta = {}) => {
                console.warn(`[JupyterClient] WARN: ${message}`, meta);
            },
            debug: (message, meta = {}) => {
                if (this.config.enableLogging) {
                    console.debug(`[JupyterClient] DEBUG: ${message}`, meta);
                }
            }
        };
    }
    
    /**
     * Connect to Jupyter server
     */
    async connect(serverInfo = null) {
        if (this.isConnected) {
            this.logger.info('Already connected to Jupyter server');
            return true;
        }
        
        try {
            this.logger.info('Connecting to Jupyter server...');
            
            // Use provided server info or config
            const serverUrl = serverInfo?.url || this.config.serverUrl;
            const token = serverInfo?.token || this.config.token;
            
            // Test connection
            await this.testConnection(serverUrl, token);
            
            // Create a new session
            await this.createSession(serverUrl, token);
            
            this.isConnected = true;
            
            this.logger.info('Connected to Jupyter server successfully', {
                sessionId: this.sessionId,
                kernelId: this.kernelId
            });
            
            this.emit('connected', {
                sessionId: this.sessionId,
                kernelId: this.kernelId
            });
            
            return true;
            
        } catch (error) {
            this.logger.error('Failed to connect to Jupyter server', { error: error.message });
            throw error;
        }
    }
    
    /**
     * Disconnect from Jupyter server
     */
    async disconnect() {
        if (!this.isConnected) {
            this.logger.info('Not connected to Jupyter server');
            return;
        }
        
        try {
            this.logger.info('Disconnecting from Jupyter server...');
            
            // Delete session
            if (this.sessionId) {
                await this.deleteSession();
            }
            
            this.isConnected = false;
            this.sessionId = null;
            this.kernelId = null;
            
            this.logger.info('Disconnected from Jupyter server successfully');
            
            this.emit('disconnected');
            
        } catch (error) {
            this.logger.error('Error disconnecting from Jupyter server', { error: error.message });
            throw error;
        }
    }
    
    /**
     * Execute Python code
     */
    async executeCell(code, options = {}) {
        if (!this.isConnected) {
            throw new Error('Not connected to Jupyter server. Call connect() first.');
        }
        
        const startTime = Date.now();
        
        try {
            this.logger.debug('Executing code', { 
                codeLength: code.length,
                options 
            });
            
            // Validate code
            this.validateCode(code);
            
            // Execute code
            const result = await this.executeCode(code);
            
            const executionTime = Date.now() - startTime;
            
            this.logger.info('Code execution completed', {
                executionTime,
                outputCount: result.outputs.length
            });
            
            this.emit('execution_completed', {
                result,
                executionTime
            });
            
            return result;
            
        } catch (error) {
            const executionTime = Date.now() - startTime;
            
            this.logger.error('Code execution failed', { 
                error: error.message,
                executionTime
            });
            
            this.emit('execution_failed', {
                error: error.message,
                executionTime
            });
            
            throw error;
        }
    }
    
    /**
     * Test connection to Jupyter server
     */
    async testConnection(serverUrl, token) {
        try {
            const response = await axios.get(`${serverUrl}/api`, {
                timeout: 5000,
                headers: token ? { 'Authorization': `token ${token}` } : {}
            });
            
            this.logger.debug('Connection test successful', { 
                status: response.status,
                version: response.data?.version 
            });
            
        } catch (error) {
            throw new Error(`Cannot connect to Jupyter server: ${error.message}`);
        }
    }
    
    /**
     * Create a new session
     */
    async createSession(serverUrl, token) {
        try {
            const sessionData = {
                kernel: {
                    name: 'python3'
                },
                name: 'kody-session',
                path: 'kody-session.ipynb',
                type: 'notebook'
            };
            
            const response = await axios.post(`${serverUrl}/api/sessions`, sessionData, {
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `token ${token}` } : {})
                }
            });
            
            this.sessionId = response.data.id;
            this.kernelId = response.data.kernel.id;
            
            this.logger.debug('Session created', {
                sessionId: this.sessionId,
                kernelId: this.kernelId
            });
            
        } catch (error) {
            throw new Error(`Failed to create session: ${error.message}`);
        }
    }
    
    /**
     * Delete session
     */
    async deleteSession() {
        if (!this.sessionId) return;
        
        try {
            const serverUrl = this.config.serverUrl;
            const token = this.config.token;
            
            await axios.delete(`${serverUrl}/api/sessions/${this.sessionId}`, {
                timeout: 5000,
                headers: token ? { 'Authorization': `token ${token}` } : {}
            });
            
            this.logger.debug('Session deleted', { sessionId: this.sessionId });
            
        } catch (error) {
            this.logger.warn('Error deleting session', { error: error.message });
        }
    }
    
    /**
     * Execute code via Jupyter API
     */
    async executeCode(code) {
        try {
            const serverUrl = this.config.serverUrl;
            const token = this.config.token;
            
            const executeRequest = {
                code: code.split('\n'),
                silent: false,
                store_history: true,
                user_expressions: {},
                allow_stdin: false,
                stop_on_error: true
            };
            
            const response = await axios.post(
                `${serverUrl}/api/sessions/${this.sessionId}/execute`,
                executeRequest,
                {
                    timeout: this.config.executionTimeout,
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': `token ${token}` } : {})
                    }
                }
            );
            
            return this.processExecutionResponse(response.data);
            
        } catch (error) {
            if (error.response?.data?.error) {
                throw new Error(`Code execution error: ${error.response.data.error}`);
            }
            throw new Error(`Failed to execute code: ${error.message}`);
        }
    }
    
    /**
     * Process execution response
     */
    processExecutionResponse(response) {
        const outputs = [];
        let hasError = false;
        
        // Process results
        if (response.results) {
            for (const result of response.results) {
                const output = this.processOutput(result);
                if (output) {
                    outputs.push(output);
                }
                if (output?.type === 'error') {
                    hasError = true;
                }
            }
        }
        
        // Process output
        if (response.output) {
            for (const output of response.output) {
                const processedOutput = this.processOutput(output);
                if (processedOutput) {
                    outputs.push(processedOutput);
                }
                if (processedOutput?.type === 'error') {
                    hasError = true;
                }
            }
        }
        
        return {
            success: !hasError,
            outputs,
            errors: hasError ? outputs.filter(o => o.type === 'error') : [],
            executionTime: 0 // Will be calculated by caller
        };
    }
    
    /**
     * Process individual output
     */
    processOutput(output) {
        if (!output) return null;
        
        const outputType = output.output_type;
        
        switch (outputType) {
            case 'execute_result':
                return {
                    type: 'result',
                    data: output.data,
                    metadata: output.metadata,
                    executionCount: output.execution_count
                };
                
            case 'display_data':
                return {
                    type: 'display',
                    data: output.data,
                    metadata: output.metadata
                };
                
            case 'stream':
                return {
                    type: 'stream',
                    name: output.name,
                    text: output.text
                };
                
            case 'error':
                return {
                    type: 'error',
                    errorName: output.ename,
                    errorValue: output.evalue,
                    traceback: output.traceback,
                    executionCount: output.execution_count
                };
                
            default:
                return {
                    type: 'unknown',
                    outputType,
                    content: output
                };
        }
    }
    
    /**
     * Validate code before execution
     */
    validateCode(code) {
        if (!code || typeof code !== 'string') {
            throw new Error('Code must be a non-empty string');
        }
        
        if (code.length > 100000) { // 100KB limit
            throw new Error('Code is too large (max 100KB)');
        }
        
        // Basic security checks
        const dangerousImports = [
            'import os',
            'from os import',
            'import subprocess',
            'from subprocess import',
            'import sys',
            'from sys import',
            '__import__',
            'exec(',
            'eval('
        ];
        
        for (const dangerous of dangerousImports) {
            if (code.includes(dangerous)) {
                this.logger.warn('Potentially dangerous code detected', { pattern: dangerous });
                // For now, just warn but allow execution
                // In production, you might want to block these
            }
        }
    }
    
    /**
     * Get connection status
     */
    getStatus() {
        return {
            connected: this.isConnected,
            sessionId: this.sessionId,
            kernelId: this.kernelId,
            serverUrl: this.config.serverUrl
        };
    }
    
    /**
     * Cleanup resources
     */
    async cleanup() {
        this.logger.info('Cleaning up JupyterClient...');
        
        if (this.isConnected) {
            await this.disconnect();
        }
        
        this.removeAllListeners();
    }
}

module.exports = JupyterClient;