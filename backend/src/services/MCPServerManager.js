/**
 * MCP Server Manager
 * Manages Model Context Protocol servers
 */

const { logger } = require('../utils/logger');

class MCPServerManager {
  constructor() {
    this.servers = new Map();
    this.essentialServers = ['filesystem', 'memory', 'sequential-thinking'];
    this.optionalServers = ['puppeteer', 'github', 'context7', 'n8n', 'code-assist'];
  }

  async initialize() {
    try {
      logger.info('📋 Essential servers: ' + this.essentialServers.join(', '));
      logger.info('📋 Optional servers: ' + this.optionalServers.join(', '));
      
      // Initialize essential servers
      for (const serverName of this.essentialServers) {
        await this.registerServer(serverName, 'essential');
      }

      // Initialize optional servers (if available)
      for (const serverName of this.optionalServers) {
        try {
          await this.registerServer(serverName, 'optional');
        } catch (error) {
          logger.warn(`⚠️ Optional server ${serverName} not available:`, error.message);
        }
      }

      logger.info('✅ MCP Server Manager initialized');
    } catch (error) {
      logger.error('❌ MCP Server Manager initialization failed:', error.message);
      throw error;
    }
  }

  async registerServer(serverName, type = 'optional') {
    try {
      const server = {
        name: serverName,
        type: type,
        status: 'initializing',
        capabilities: [],
        lastSeen: new Date()
      };

      this.servers.set(serverName, server);
      server.status = 'active';
      
      logger.info(`✅ MCP Server ${serverName} (${type}) registered`);
      return server;
    } catch (error) {
      logger.error(`❌ Failed to register MCP server ${serverName}:`, error.message);
      throw error;
    }
  }

  getServer(serverName) {
    return this.servers.get(serverName);
  }

  getAllServers() {
    return Array.from(this.servers.values());
  }

  getServerStatus() {
    const status = {
      total: this.servers.size,
      active: 0,
      essential: 0,
      optional: 0,
      servers: {}
    };

    for (const [name, server] of this.servers) {
      if (server.status === 'active') {
        status.active++;
      }
      if (server.type === 'essential') {
        status.essential++;
      } else {
        status.optional++;
      }
      status.servers[name] = {
        type: server.type,
        status: server.status,
        lastSeen: server.lastSeen
      };
    }

    return status;
  }

  async callServer(serverName, method, params = {}) {
    const server = this.getServer(serverName);
    if (!server) {
      throw new Error(`Server ${serverName} not found`);
    }

    if (server.status !== 'active') {
      throw new Error(`Server ${serverName} is not active`);
    }

    // Mock implementation - in real scenario, this would call the actual MCP server
    logger.info(`📞 Calling ${serverName}.${method} with params:`, params);
    
    return {
      success: true,
      server: serverName,
      method: method,
      result: `Mock result from ${serverName}.${method}`,
      timestamp: new Date()
    };
  }
}

// Singleton instance
const mcpServerManager = new MCPServerManager();

module.exports = mcpServerManager;