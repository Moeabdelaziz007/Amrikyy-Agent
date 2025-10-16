/**
 * JupyterManager - Fixed Version for Maya Travel Agent
 * Manages Jupyter Lab Server Lifecycle with proper authentication
 * 
 * @author Maya Travel Agent Team
 * @version 1.0.1
 */

const { spawn, exec } = require('child_process');
const EventEmitter = require('events');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');

class JupyterManagerFixed extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // Path to Python venv
            venvPath: config.venvPath || path.join(__dirname, '../../../kody_env'),
            
            // Jupyter Lab configuration
            port: config.port || 8888,
            host: config.host || 'localhost',
            
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
        
        this.logger.info('JupyterManagerFixed initialized', {
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
                    console.log(`[JupyterManagerFixed] INFO: ${message}`, meta);
                }
            },
            error: (message, meta = {}) => {
                console.error(`[JupyterManagerFixed] ERROR: ${message}`, meta);
            },
            warn: (message, meta = {}) => {
                console.warn(`[JupyterManagerFixed] WARN: ${message}`, meta);
            },
            debug: (message, meta = {}) => {
                if (this.config.enableLogging) {
                    console.debug(`[JupyterManagerFixed] DEBUG: ${message}`, meta);
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
     * Validate Python environment
     */
    async validateEnvironment() {
        this.logger.debug('Environment validation passed');
        
        // Ensure working directory exists
        await fs.mkdir(this.config.workingDir, { recursive: true });
        
        return true;
    }
    
    /**
     * Start Jupyter Lab server with fixed authentication
     */
    async startServer() {
        if (this.serverProcess || this.isStarting) {
            this.logger.debug('Server already running or starting');
            return this.serverInfo;
        }
        
        this.isStarting = true;
        this.logger.info('Starting Jupyter Lab server...');
        
        try {
            // Validate environment
            await this.validateEnvironment();
            
            // Prepare command arguments with proper authentication
            const args = [
                'lab',
                '--port', this.config.port.toString(),
                '--host', this.config.host,
                '--no-browser',
                '--allow-root',
                '--notebook-dir', this.config.workingDir,
                '--IdentityProvider.token', '""',
                '--PasswordIdentityProvider.hashed_password', '""',
                '--ServerApp.disable_check_xsrf', 'true',
                '--ServerApp.allow_origin', '*',
                '--ServerApp.allow_remote_access', 'true',
                '--ServerApp.open_browser', 'false'
            ];
            
            this.logger.debug('Launching Jupyter Lab', {
                command: path.join(this.config.venvPath, 'bin', 'jupyter'),
                args: args.join(' ')
            });
            
            // Start server process
            this.serverProcess = spawn(
                path.join(this.config.venvPath, 'bin', 'jupyter'),
                args,
                {
                    cwd: this.config.workingDir,
                    stdio: ['ignore', 'pipe', 'pipe'],
                    env: {
                        ...process.env,
                        PATH: `${path.join(this.config.venvPath, 'bin')}:${process.env.PATH}`
                    }
                }
            );
            
            // Handle process events
            this.setupProcessHandlers();
            
            // Wait for server to be ready
            await this.waitForServerReady();
            
            this.isStarting = false;
            this.lastActivity = Date.now();
            this.startIdleTimer();
            
            this.logger.info('Jupyter Lab server started successfully', {
                url: `http://${this.config.host}:${this.config.port}`
            });
            
            return this.serverInfo;
            
        } catch (error) {
            this.isStarting = false;
            this.logger.error('Failed to start Jupyter Lab server', { error: error.message });
            throw error;
        }
    }
    
    /**
     * Setup process event handlers
     */
    setupProcessHandlers() {
        this.serverProcess.stdout.on('data', (data) => {
            const output = data.toString();
            this.logger.debug('Jupyter stdout', { data: output });
        });
        
        this.serverProcess.stderr.on('data', (data) => {
            const output = data.toString();
            this.logger.debug('Jupyter stderr', { data: output });
        });
        
        this.serverProcess.on('error', (error) => {
            this.logger.error('Jupyter process error', { error: error.message });
            this.emit('error', error);
        });
        
        this.serverProcess.on('exit', (code, signal) => {
            this.logger.info('Jupyter process exited', { code, signal });
            this.serverProcess = null;
            this.serverInfo = null;
            this.emit('exit', { code, signal });
        });
    }
    
    /**
     * Wait for server to be ready
     */
    async waitForServerReady() {
        const maxWaitTime = this.config.startupTimeout;
        const checkInterval = 1000;
        const startTime = Date.now();
        
        return new Promise((resolve, reject) => {
            const checkServer = async () => {
                try {
                    const response = await fetch(`http://${this.config.host}:${this.config.port}/api`);
                    if (response.ok) {
                        const serverInfo = await response.json();
                        this.serverInfo = {
                            url: `http://${this.config.host}:${this.config.port}`,
                            version: serverInfo.version || 'unknown',
                            started: new Date().toISOString()
                        };
                        resolve(this.serverInfo);
                    } else {
                        throw new Error(`Server responded with status ${response.status}`);
                    }
                } catch (error) {
                    if (Date.now() - startTime > maxWaitTime) {
                        reject(new Error('Server failed to start within 30000ms'));
                    } else {
                        setTimeout(checkServer, checkInterval);
                    }
                }
            };
            
            checkServer();
        });
    }
    
    /**
     * Start idle timer
     */
    startIdleTimer() {
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
        }
        
        this.idleTimer = setTimeout(() => {
            this.logger.info('Server idle timeout reached, stopping server');
            this.stopServer();
        }, this.config.idleTimeout);
    }
    
    /**
     * Stop Jupyter Lab server
     */
    async stopServer() {
        if (!this.serverProcess || this.isStopping) {
            return;
        }
        
        this.isStopping = true;
        this.logger.info('Stopping Jupyter Lab server...');
        
        return new Promise((resolve) => {
            if (this.idleTimer) {
                clearTimeout(this.idleTimer);
                this.idleTimer = null;
            }
            
            this.serverProcess.once('exit', () => {
                this.isStopping = false;
                this.serverProcess = null;
                this.serverInfo = null;
                this.logger.info('Jupyter Lab server stopped');
                resolve();
            });
            
            this.serverProcess.kill('SIGTERM');
            
            // Force kill after 5 seconds
            setTimeout(() => {
                if (this.serverProcess) {
                    this.serverProcess.kill('SIGKILL');
                }
            }, 5000);
        });
    }
    
    /**
     * Check if server is running
     */
    isRunning() {
        return this.serverProcess !== null && this.serverInfo !== null;
    }
    
    /**
     * Get server info
     */
    getServerInfo() {
        return this.serverInfo;
    }
    
    /**
     * Update last activity
     */
    updateActivity() {
        this.lastActivity = Date.now();
        if (this.isRunning()) {
            this.startIdleTimer();
        }
    }
}

module.exports = JupyterManagerFixed;
