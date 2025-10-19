/**
 * MCP Server Manager
 * Optimized management of MCP servers with lazy loading and pooling
 *
 * Features:
 * - Lazy loading of MCP servers
 * - Server pooling and reuse
 * - Resource usage monitoring
 * - Automatic cleanup
 * - Performance optimization
 */

const { logger } = require('../utils/logger');
const { spawn } = require('child_process');
const EventEmitter = require('events');

class MCPServerManager extends EventEmitter {
  constructor(config = {}) {
    super();

    this.config = {
      maxServers: config.maxServers || 10,
      serverTimeout: config.serverTimeout || 30000, // 30 seconds
      idleTimeout: config.idleTimeout || 300000, // 5 minutes
      enablePooling: config.enablePooling !== false,
      enableLazyLoading: config.enableLazyLoading !== false,
      ...config,
    };

    this.servers = new Map();
    this.serverPool = new Map();
    this.serverMetrics = new Map();
    this.requiredServers = new Set();
    this.activeConnections = new Map();

    this.setupRequiredServers();
    this.startCleanupInterval();

    logger.info('✅ MCP Server Manager initialized');
  }

  /**
   * Setup required servers based on configuration
   */
  setupRequiredServers() {
    // Define essential servers that should always be available
    const essentialServers = ['filesystem', 'memory', 'sequential-thinking'];

    // Define optional servers that can be loaded on demand
    const optionalServers = ['puppeteer', 'github', 'context7', 'n8n', 'code-assist'];

    this.essentialServers = essentialServers;
    this.optionalServers = optionalServers;

    logger.info(`📋 Essential servers: ${essentialServers.join(', ')}`);
    logger.info(`📋 Optional servers: ${optionalServers.join(', ')}`);
  }

  /**
   * Start cleanup interval for idle servers
   */
  startCleanupInterval() {
    setInterval(() => {
      this.cleanupIdleServers();
    }, 60000); // Check every minute
  }

  /**
   * Get MCP server with lazy loading
   */
  async getServer(serverName, options = {}) {
    const { forceNew = false, priority = 'normal' } = options;

    // Check if server is already running
    if (!forceNew && this.servers.has(serverName)) {
      const server = this.servers.get(serverName);
      if (server && server.process && !server.process.killed) {
        this.updateServerMetrics(serverName, 'reuse');
        return server;
      }
    }

    // Check if server is in pool
    if (this.config.enablePooling && this.serverPool.has(serverName)) {
      const pooledServer = this.serverPool.get(serverName);
      if (pooledServer && pooledServer.process && !pooledServer.process.killed) {
        this.servers.set(serverName, pooledServer);
        this.serverPool.delete(serverName);
        this.updateServerMetrics(serverName, 'pooled');
        return pooledServer;
      }
    }

    // Start new server
    return await this.startServer(serverName, options);
  }

  /**
   * Start a new MCP server
   */
  async startServer(serverName, options = {}) {
    try {
      logger.info(`🚀 Starting MCP server: ${serverName}`);

      const serverConfig = this.getServerConfig(serverName);
      const server = await this.createServerProcess(serverName, serverConfig);

      this.servers.set(serverName, server);
      this.updateServerMetrics(serverName, 'started');

      // Setup server event handlers
      this.setupServerEventHandlers(serverName, server);

      this.emit('server:started', { serverName, pid: server.process.pid });

      return server;
    } catch (error) {
      logger.error(`❌ Failed to start MCP server ${serverName}:`, error);
      this.emit('server:error', { serverName, error });
      throw error;
    }
  }

  /**
   * Get server configuration
   */
  getServerConfig(serverName) {
    const configs = {
      filesystem: {
        command: 'mcp-server-filesystem',
        args: [],
        env: { ...process.env },
      },
      memory: {
        command: 'mcp-server-memory',
        args: [],
        env: { ...process.env },
      },
      'sequential-thinking': {
        command: 'mcp-server-sequential-thinking',
        args: [],
        env: { ...process.env },
      },
      puppeteer: {
        command: 'mcp-server-puppeteer',
        args: [],
        env: { ...process.env },
      },
      github: {
        command: 'mcp-server-github',
        args: [],
        env: { ...process.env },
      },
      context7: {
        command: 'npx',
        args: ['context7-mcp'],
        env: { ...process.env },
      },
      n8n: {
        command: 'npx',
        args: ['n8n-mcp'],
        env: { ...process.env },
      },
      'code-assist': {
        command: 'npx',
        args: ['code-assist-mcp'],
        env: { ...process.env },
      },
    };

    return (
      configs[serverName] || {
        command: serverName,
        args: [],
        env: { ...process.env },
      }
    );
  }

  /**
   * Create server process
   */
  async createServerProcess(serverName, config) {
    return new Promise((resolve, reject) => {
      const process = spawn(config.command, config.args, {
        env: config.env,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      const server = {
        name: serverName,
        process,
        startTime: Date.now(),
        lastActivity: Date.now(),
        connections: 0,
        status: 'starting',
        config,
      };

      // Handle process events
      process.on('spawn', () => {
        server.status = 'running';
        logger.info(`✅ MCP server ${serverName} spawned (PID: ${process.pid})`);
        resolve(server);
      });

      process.on('error', (error) => {
        server.status = 'error';
        logger.error(`❌ MCP server ${serverName} error:`, error);
        reject(error);
      });

      process.on('exit', (code, signal) => {
        server.status = 'exited';
        logger.info(`🛑 MCP server ${serverName} exited (code: ${code}, signal: ${signal})`);
        this.handleServerExit(serverName, code, signal);
      });

      // Handle stdout/stderr
      process.stdout.on('data', (data) => {
        this.handleServerOutput(serverName, 'stdout', data);
      });

      process.stderr.on('data', (data) => {
        this.handleServerOutput(serverName, 'stderr', data);
      });

      // Timeout for server startup
      setTimeout(() => {
        if (server.status === 'starting') {
          logger.warn(`⚠️ MCP server ${serverName} startup timeout`);
          reject(new Error('Server startup timeout'));
        }
      }, this.config.serverTimeout);
    });
  }

  /**
   * Setup server event handlers
   */
  setupServerEventHandlers(serverName, server) {
    server.process.on('message', (message) => {
      server.lastActivity = Date.now();
      this.emit('server:message', { serverName, message });
    });

    // Track connections
    this.activeConnections.set(serverName, new Set());
  }

  /**
   * Handle server output
   */
  handleServerOutput(serverName, type, data) {
    const output = data.toString().trim();

    if (output) {
      logger.debug(`📤 MCP server ${serverName} ${type}: ${output}`);
      this.emit('server:output', { serverName, type, output });
    }
  }

  /**
   * Handle server exit
   */
  handleServerExit(serverName, code, signal) {
    const server = this.servers.get(serverName);
    if (server) {
      server.status = 'exited';
      server.exitCode = code;
      server.exitSignal = signal;

      // Remove from active servers
      this.servers.delete(serverName);

      // Clean up connections
      this.activeConnections.delete(serverName);

      this.emit('server:exited', { serverName, code, signal });
    }
  }

  /**
   * Release server back to pool
   */
  releaseServer(serverName) {
    const server = this.servers.get(serverName);

    if (server && this.config.enablePooling) {
      // Move to pool instead of killing
      this.serverPool.set(serverName, server);
      this.servers.delete(serverName);

      logger.debug(`🔄 Released MCP server ${serverName} to pool`);
      this.emit('server:released', { serverName });
    } else if (server) {
      // Kill server if pooling is disabled
      this.killServer(serverName);
    }
  }

  /**
   * Kill MCP server
   */
  killServer(serverName) {
    const server = this.servers.get(serverName);

    if (server && server.process && !server.process.killed) {
      logger.info(`🛑 Killing MCP server: ${serverName}`);

      server.process.kill('SIGTERM');

      // Force kill after timeout
      setTimeout(() => {
        if (!server.process.killed) {
          server.process.kill('SIGKILL');
        }
      }, 5000);

      this.servers.delete(serverName);
      this.serverPool.delete(serverName);
      this.activeConnections.delete(serverName);

      this.emit('server:killed', { serverName });
    }
  }

  /**
   * Cleanup idle servers
   */
  cleanupIdleServers() {
    const now = Date.now();
    const idleThreshold = this.idleTimeout;

    for (const [serverName, server] of this.servers) {
      const idleTime = now - server.lastActivity;

      if (idleTime > idleThreshold && !this.essentialServers.includes(serverName)) {
        logger.info(`🧹 Cleaning up idle MCP server: ${serverName}`);
        this.releaseServer(serverName);
      }
    }

    // Clean up pooled servers that are too old
    for (const [serverName, server] of this.serverPool) {
      const poolTime = now - server.startTime;

      if (poolTime > this.config.idleTimeout * 2) {
        logger.info(`🧹 Removing old pooled MCP server: ${serverName}`);
        this.serverPool.delete(serverName);

        if (server.process && !server.process.killed) {
          server.process.kill('SIGTERM');
        }
      }
    }
  }

  /**
   * Update server metrics
   */
  updateServerMetrics(serverName, action) {
    if (!this.serverMetrics.has(serverName)) {
      this.serverMetrics.set(serverName, {
        starts: 0,
        reuses: 0,
        pooled: 0,
        kills: 0,
        errors: 0,
        totalUptime: 0,
        lastAction: null,
      });
    }

    const metrics = this.serverMetrics.get(serverName);
    metrics[action] = (metrics[action] || 0) + 1;
    metrics.lastAction = action;
    metrics.lastActionTime = Date.now();
  }

  /**
   * Get server status
   */
  getServerStatus(serverName) {
    const server = this.servers.get(serverName);
    const pooledServer = this.serverPool.get(serverName);
    const metrics = this.serverMetrics.get(serverName);

    if (server) {
      return {
        name: serverName,
        status: server.status,
        pid: server.process.pid,
        uptime: Date.now() - server.startTime,
        connections: server.connections,
        lastActivity: server.lastActivity,
        metrics,
      };
    } else if (pooledServer) {
      return {
        name: serverName,
        status: 'pooled',
        pid: pooledServer.process.pid,
        uptime: Date.now() - pooledServer.startTime,
        connections: 0,
        lastActivity: pooledServer.lastActivity,
        metrics,
      };
    } else {
      return {
        name: serverName,
        status: 'stopped',
        pid: null,
        uptime: 0,
        connections: 0,
        lastActivity: null,
        metrics,
      };
    }
  }

  /**
   * Get all servers status
   */
  getAllServersStatus() {
    const allServers = new Set([
      ...this.servers.keys(),
      ...this.serverPool.keys(),
      ...this.essentialServers,
      ...this.optionalServers,
    ]);

    const status = {};
    for (const serverName of allServers) {
      status[serverName] = this.getServerStatus(serverName);
    }

    return status;
  }

  /**
   * Get server metrics
   */
  getMetrics() {
    return {
      activeServers: this.servers.size,
      pooledServers: this.serverPool.size,
      totalConnections: Array.from(this.activeConnections.values()).reduce(
        (sum, connections) => sum + connections.size,
        0
      ),
      serverMetrics: Object.fromEntries(this.serverMetrics),
      config: this.config,
    };
  }

  /**
   * Shutdown all servers
   */
  async shutdown() {
    logger.info('🛑 Shutting down MCP Server Manager...');

    // Kill all active servers
    for (const serverName of this.servers.keys()) {
      this.killServer(serverName);
    }

    // Kill all pooled servers
    for (const serverName of this.serverPool.keys()) {
      const server = this.serverPool.get(serverName);
      if (server.process && !server.process.killed) {
        server.process.kill('SIGTERM');
      }
    }

    this.servers.clear();
    this.serverPool.clear();
    this.activeConnections.clear();

    logger.info('✅ MCP Server Manager shutdown complete');
  }
}

// Export singleton instance
module.exports = new MCPServerManager();
