/**
 * JupyterManager - Manages Jupyter Lab Server Lifecycle
 * Handles starting, stopping, and monitoring Jupyter Lab server instances
 * 
 * @author Maya Travel Agent Team
 * @version 1.0.0
 */

const { spawn, exec } = require('child_process');
const EventEmitter = require('events');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');

class JupyterManager extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // Path to Python venv
            venvPath: config.venvPath || path.join(__dirname, '../../../kody_env'),
            
            // Jupyter Lab configuration
            port: config.port || 8888,
            host: config.host || 'localhost',
            token: config.token || null, // Will be generated automatically
            
            // Lifecycle management
            idleTimeout: config.idleTimeout || 15 * 60 * 1000, // 15 minutes
            startupTimeout: config.startupTimeout || 30 * 1000, // 30 seconds
            
            // Working directory
            workingDir: config.workingDir || path.join(__dirname, '../../../data/kody'),
            
            // Logging
            enableLogging: config.enableLogging !== false,
            
            ...config
        };
        
        // Server state
        this.serverProcess = null;
        this.serverInfo = null;
        this.isStarting = false;
        this.isStopping = false;
        this.lastActivity = null;
        this.idleTimer = null;
        
        // Setup logger
        this.setupLogger();
        
        // Setup graceful shutdown
        this.setupGracefulShutdown();
        
        this.logger.info('JupyterManager initialized', {
            venvPath: this.config.venvPath,
            workingDir: this.config.workingDir,
            port: this.config.port
        });
    }
    
    /**
     * Setup simple logger
     */
    setupLogger() {
        this.logger = {
            info: (message, meta = {}) => {
                if (this.config.enableLogging) {
                    console.log(`[JupyterManager] INFO: ${message}`, meta);
                }
            },
            error: (message, meta = {}) => {
                console.error(`[JupyterManager] ERROR: ${message}`, meta);
            },
            warn: (message, meta = {}) => {
                console.warn(`[JupyterManager] WARN: ${message}`, meta);
            },
            debug: (message, meta = {}) => {
                if (this.config.enableLogging) {
                    console.debug(`[JupyterManager] DEBUG: ${message}`, meta);
                }
            }
        };
    }
    
    /**
     * Setup graceful shutdown handlers
     */
    setupGracefulShutdown() {
        const shutdown = async () => {
            this.logger.info('Graceful shutdown initiated');
            await this.stopServer();
        };
        
        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);
        process.on('exit', shutdown);
    }
    
    /**
     * Check if server is currently running
     */
    isServerRunning() {
        return this.serverProcess && !this.serverProcess.killed && this.serverInfo;
    }
    
    /**
     * Get server information
     */
    getServerInfo() {
        return this.serverInfo ? { ...this.serverInfo } : null;
    }
    
    /**
     * Start Jupyter Lab server
     */
    async startServer() {
        if (this.isServerRunning()) {
            this.logger.info('Server already running', { serverInfo: this.serverInfo });
            this.updateActivity();
            return this.serverInfo;
        }
        
        if (this.isStarting) {
            this.logger.warn('Server start already in progress');
            return null;
        }
        
        try {
            this.isStarting = true;
            this.logger.info('Starting Jupyter Lab server...');
            
            // Check if venv exists
            await this.validateEnvironment();
            
            // Start the server
            await this.launchServer();
            
            // Wait for server to be ready
            await this.waitForServerReady();
            
            this.logger.info('Jupyter Lab server started successfully', {
                url: this.serverInfo.url,
                port: this.serverInfo.port,
                token: this.serverInfo.token ? '***' : 'none'
            });
            
            // Setup idle timeout
            this.setupIdleTimeout();
            
            this.emit('server_started', this.serverInfo);
            return this.serverInfo;
            
        } catch (error) {
            this.logger.error('Failed to start Jupyter Lab server', { error: error.message });
            this.isStarting = false;
            throw error;
        } finally {
            this.isStarting = false;
        }
    }
    
    /**
     * Stop Jupyter Lab server
     */
    async stopServer() {
        if (!this.isServerRunning()) {
            this.logger.info('Server not running');
            return;
        }
        
        if (this.isStopping) {
            this.logger.warn('Server stop already in progress');
            return;
        }
        
        try {
            this.isStopping = true;
            this.logger.info('Stopping Jupyter Lab server...');
            
            // Clear idle timeout
            this.clearIdleTimeout();
            
            // Stop the server process
            await this.terminateServer();
            
            this.logger.info('Jupyter Lab server stopped successfully');
            
            this.emit('server_stopped', { 
                pid: this.serverProcess?.pid,
                uptime: this.serverInfo ? Date.now() - this.serverInfo.startedAt : 0
            });
            
        } catch (error) {
            this.logger.error('Error stopping Jupyter Lab server', { error: error.message });
            throw error;
        } finally {
            this.isStopping = false;
            this.serverProcess = null;
            this.serverInfo = null;
        }
    }
    
    /**
     * Restart the server
     */
    async restartServer() {
        this.logger.info('Restarting Jupyter Lab server...');
        
        if (this.isServerRunning()) {
            await this.stopServer();
        }
        
        // Wait a bit before restarting
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        return await this.startServer();
    }
    
    /**
     * Update last activity timestamp
     */
    updateActivity() {
        this.lastActivity = Date.now();
        this.clearIdleTimeout();
        this.setupIdleTimeout();
    }
    
    /**
     * Setup idle timeout
     */
    setupIdleTimeout() {
        this.clearIdleTimeout();
        
        this.idleTimer = setTimeout(async () => {
            this.logger.info('Server idle timeout reached, stopping server');
            try {
                await this.stopServer();
            } catch (error) {
                this.logger.error('Error stopping server during idle timeout', { error: error.message });
            }
        }, this.config.idleTimeout);
        
        this.logger.debug('Idle timeout set', { timeout: this.config.idleTimeout });
    }
    
    /**
     * Clear idle timeout
     */
    clearIdleTimeout() {
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
            this.idleTimer = null;
        }
    }
    
    /**
     * Validate Python environment
     */
    async validateEnvironment() {
        try {
            // Check if venv directory exists
            await fs.access(this.config.venvPath);
            
            // Check if Python executable exists
            const pythonPath = this.getPythonPath();
            await fs.access(pythonPath);
            
            // Check if Jupyter is installed
            const jupyterPath = this.getJupyterPath();
            await fs.access(jupyterPath);
            
            this.logger.debug('Environment validation passed');
            
        } catch (error) {
            throw new Error(`Environment validation failed: ${error.message}`);
        }
    }
    
    /**
     * Get Python executable path
     */
    getPythonPath() {
        const pythonName = os.platform() === 'win32' ? 'python.exe' : 'python';
        return path.join(this.config.venvPath, 'bin', pythonName);
    }
    
    /**
     * Get Jupyter executable path
     */
    getJupyterPath() {
        const jupyterName = os.platform() === 'win32' ? 'jupyter.exe' : 'jupyter';
        return path.join(this.config.venvPath, 'bin', jupyterName);
    }
    
    /**
     * Launch Jupyter Lab server
     */
    async launchServer() {
        return new Promise((resolve, reject) => {
            const jupyterPath = this.getJupyterPath();
            const args = [
                'lab',
                '--port', this.config.port.toString(),
                '--host', this.config.host,
                '--no-browser',
                '--allow-root',
                '--notebook-dir', this.config.workingDir,
                '--ServerApp.token=""', // Disable token for easier access
                '--ServerApp.password=""', // Disable password
                '--ServerApp.disable_check_xsrf=true' // Disable XSRF for API access
            ];
            
            this.logger.debug('Launching Jupyter Lab', { 
                command: jupyterPath,
                args: args.join(' ')
            });
            
            this.serverProcess = spawn(jupyterPath, args, {
                cwd: this.config.workingDir,
                stdio: ['ignore', 'pipe', 'pipe'],
                env: {
                    ...process.env,
                    PATH: `${path.join(this.config.venvPath, 'bin')}:${process.env.PATH}`
                }
            });
            
            let outputBuffer = '';
            
            // Capture stdout for server info
            this.serverProcess.stdout.on('data', (data) => {
                outputBuffer += data.toString();
                this.logger.debug('Jupyter stdout', { data: data.toString().trim() });
            });
            
            // Capture stderr for errors
            this.serverProcess.stderr.on('data', (data) => {
                this.logger.debug('Jupyter stderr', { data: data.toString().trim() });
            });
            
            // Handle process events
            this.serverProcess.on('error', (error) => {
                this.logger.error('Failed to start Jupyter process', { error: error.message });
                reject(error);
            });
            
            this.serverProcess.on('exit', (code, signal) => {
                if (code !== 0) {
                    this.logger.error('Jupyter process exited with error', { code, signal });
                    reject(new Error(`Jupyter process exited with code ${code}`));
                } else {
                    this.logger.info('Jupyter process exited normally');
                }
            });
            
            // Store server info immediately (will be updated when ready)
            this.serverInfo = {
                pid: this.serverProcess.pid,
                port: this.config.port,
                host: this.config.host,
                url: `http://${this.config.host}:${this.config.port}`,
                token: null,
                startedAt: Date.now(),
                workingDir: this.config.workingDir
            };
            
            resolve();
        });
    }
    
    /**
     * Wait for server to be ready
     */
    async waitForServerReady() {
        const maxAttempts = this.config.startupTimeout / 1000; // Convert to seconds
        let attempts = 0;
        
        this.logger.debug('Waiting for server to be ready...');
        
        while (attempts < maxAttempts) {
            try {
                // Try to connect to the server
                const response = await this.checkServerHealth();
                if (response) {
                    this.logger.debug('Server is ready');
                    return;
                }
            } catch (error) {
                // Server not ready yet, continue waiting
            }
            
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        throw new Error(`Server failed to start within ${this.config.startupTimeout}ms`);
    }
    
    /**
     * Check server health
     */
    async checkServerHealth() {
        const http = require('http');
        
        return new Promise((resolve) => {
            const options = {
                hostname: this.config.host,
                port: this.config.port,
                path: '/api',
                method: 'GET',
                timeout: 5000
            };
            
            const req = http.request(options, (res) => {
                resolve(res.statusCode === 200);
            });
            
            req.on('error', () => {
                resolve(false);
            });
            
            req.on('timeout', () => {
                req.destroy();
                resolve(false);
            });
            
            req.end();
        });
    }
    
    /**
     * Terminate server process
     */
    async terminateServer() {
        if (!this.serverProcess) {
            return;
        }
        
        return new Promise((resolve) => {
            const pid = this.serverProcess.pid;
            
            // Try graceful shutdown first
            this.serverProcess.kill('SIGTERM');
            
            // Force kill after 5 seconds
            const forceKillTimer = setTimeout(() => {
                if (this.serverProcess && !this.serverProcess.killed) {
                    this.logger.warn('Force killing Jupyter process', { pid });
                    this.serverProcess.kill('SIGKILL');
                }
            }, 5000);
            
            this.serverProcess.on('exit', () => {
                clearTimeout(forceKillTimer);
                this.logger.debug('Jupyter process terminated', { pid });
                resolve();
            });
            
            // If process already killed
            if (this.serverProcess.killed) {
                clearTimeout(forceKillTimer);
                resolve();
            }
        });
    }
    
    /**
     * Get server status
     */
    getStatus() {
        return {
            running: this.isServerRunning(),
            starting: this.isStarting,
            stopping: this.isStopping,
            serverInfo: this.getServerInfo(),
            lastActivity: this.lastActivity,
            idleTimeout: this.config.idleTimeout,
            uptime: this.serverInfo ? Date.now() - this.serverInfo.startedAt : 0
        };
    }
    
    /**
     * Cleanup resources
     */
    async cleanup() {
        this.logger.info('Cleaning up JupyterManager...');
        
        this.clearIdleTimeout();
        
        if (this.isServerRunning()) {
            await this.stopServer();
        }
        
        this.removeAllListeners();
    }
}

module.exports = JupyterManager;
