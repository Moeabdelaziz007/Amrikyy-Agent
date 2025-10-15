/**
 * MCP (Model Context Protocol) Implementation
 * Created by Cursor - Team Lead
 * 
 * Implementation of Model Context Protocol for AI agent communication
 * Based on Anthropic's MCP specification
 */

const { logger } = require('../utils/logger');

// Create logger for MCP Protocol
const log = logger.child('MCPProtocol');

/**
 * MCP Protocol Implementation
 * Handles Model Context Protocol communication between AI agents
 */
class MCPProtocol {
  constructor() {
    this.servers = new Map();
    this.clients = new Map();
    this.tools = new Map();
    this.resources = new Map();
    
    log.info('MCP Protocol initialized');
  }

  /**
   * Register MCP server
   * @param {string} serverId - Server identifier
   * @param {Object} server - Server instance
   * @param {Array} capabilities - Server capabilities
   */
  registerServer(serverId, server, capabilities = []) {
    const serverInfo = {
      id: serverId,
      instance: server,
      capabilities,
      status: 'active',
      lastSeen: Date.now()
    };

    this.servers.set(serverId, serverInfo);
    this.emit('serverRegistered', serverInfo);
    
    log.info('MCP Server registered', { serverId, capabilities });
  }

  /**
   * Register MCP client
   * @param {string} clientId - Client identifier
   * @param {Object} client - Client instance
   * @param {Array} capabilities - Client capabilities
   */
  registerClient(clientId, client, capabilities = []) {
    const clientInfo = {
      id: clientId,
      instance: client,
      capabilities,
      status: 'active',
      lastSeen: Date.now()
    };

    this.clients.set(clientId, clientInfo);
    this.emit('clientRegistered', clientInfo);
    
    log.info('MCP Client registered', { clientId, capabilities });
  }

  /**
   * Send MCP request
   * @param {string} fromClient - Sender client ID
   * @param {string} toServer - Target server ID
   * @param {Object} request - MCP request
   */
  async sendRequest(fromClient, toServer, request) {
    const requestId = this.generateRequestId();
    const timestamp = new Date().toISOString();
    
    const mcpRequest = {
      jsonrpc: '2.0',
      id: requestId,
      method: request.method,
      params: request.params,
      meta: {
        from: fromClient,
        to: toServer,
        timestamp,
        protocol: 'MCP'
      }
    };

    try {
      const serverInfo = this.servers.get(toServer);
      if (!serverInfo) {
        throw new Error(`Server ${toServer} not found`);
      }

      // Process request
      const response = await this.processRequest(serverInfo, mcpRequest);
      
      log.info('MCP Request processed', { requestId, fromClient, toServer, method: request.method });
      return response;
      
    } catch (error) {
      log.error('MCP Request failed', { error: error.message, requestId, fromClient, toServer });
      throw error;
    }
  }

  /**
   * Process MCP request
   * @param {Object} serverInfo - Server information
   * @param {Object} request - MCP request
   */
  async processRequest(serverInfo, request) {
    const { method, params } = request;
    
    switch (method) {
      case 'initialize':
        return await this.handleInitialize(serverInfo, params);
      
      case 'tools/list':
        return await this.handleToolsList(serverInfo, params);
      
      case 'tools/call':
        return await this.handleToolsCall(serverInfo, params);
      
      case 'resources/list':
        return await this.handleResourcesList(serverInfo, params);
      
      case 'resources/read':
        return await this.handleResourcesRead(serverInfo, params);
      
      case 'prompts/list':
        return await this.handlePromptsList(serverInfo, params);
      
      case 'prompts/get':
        return await this.handlePromptsGet(serverInfo, params);
      
      default:
        throw new Error(`Unknown method: ${method}`);
    }
  }

  /**
   * Handle initialize request
   * @param {Object} serverInfo - Server information
   * @param {Object} params - Request parameters
   */
  async handleInitialize(serverInfo, params) {
    return {
      jsonrpc: '2.0',
      id: params.id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: serverInfo.capabilities,
        serverInfo: {
          name: serverInfo.id,
          version: '1.0.0'
        }
      }
    };
  }

  /**
   * Handle tools/list request
   * @param {Object} serverInfo - Server information
   * @param {Object} params - Request parameters
   */
  async handleToolsList(serverInfo, params) {
    const tools = Array.from(this.tools.values()).filter(tool => 
      tool.serverId === serverInfo.id
    );

    return {
      jsonrpc: '2.0',
      id: params.id,
      result: {
        tools: tools.map(tool => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema
        }))
      }
    };
  }

  /**
   * Handle tools/call request
   * @param {Object} serverInfo - Server information
   * @param {Object} params - Request parameters
   */
  async handleToolsCall(serverInfo, params) {
    const { name, arguments: args } = params;
    const tool = this.tools.get(name);
    
    if (!tool) {
      throw new Error(`Tool ${name} not found`);
    }

    if (tool.serverId !== serverInfo.id) {
      throw new Error(`Tool ${name} not available on server ${serverInfo.id}`);
    }

    // Execute tool
    const result = await tool.execute(args);
    
    return {
      jsonrpc: '2.0',
      id: params.id,
      result: {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result)
          }
        ]
      }
    };
  }

  /**
   * Handle resources/list request
   * @param {Object} serverInfo - Server information
   * @param {Object} params - Request parameters
   */
  async handleResourcesList(serverInfo, params) {
    const resources = Array.from(this.resources.values()).filter(resource => 
      resource.serverId === serverInfo.id
    );

    return {
      jsonrpc: '2.0',
      id: params.id,
      result: {
        resources: resources.map(resource => ({
          uri: resource.uri,
          name: resource.name,
          description: resource.description,
          mimeType: resource.mimeType
        }))
      }
    };
  }

  /**
   * Handle resources/read request
   * @param {Object} serverInfo - Server information
   * @param {Object} params - Request parameters
   */
  async handleResourcesRead(serverInfo, params) {
    const { uri } = params;
    const resource = this.resources.get(uri);
    
    if (!resource) {
      throw new Error(`Resource ${uri} not found`);
    }

    if (resource.serverId !== serverInfo.id) {
      throw new Error(`Resource ${uri} not available on server ${serverInfo.id}`);
    }

    return {
      jsonrpc: '2.0',
      id: params.id,
      result: {
        contents: [
          {
            uri: resource.uri,
            mimeType: resource.mimeType,
            text: resource.content
          }
        ]
      }
    };
  }

  /**
   * Handle prompts/list request
   * @param {Object} serverInfo - Server information
   * @param {Object} params - Request parameters
   */
  async handlePromptsList(serverInfo, params) {
    // Implementation for prompts list
    return {
      jsonrpc: '2.0',
      id: params.id,
      result: {
        prompts: []
      }
    };
  }

  /**
   * Handle prompts/get request
   * @param {Object} serverInfo - Server information
   * @param {Object} params - Request parameters
   */
  async handlePromptsGet(serverInfo, params) {
    // Implementation for prompts get
    return {
      jsonrpc: '2.0',
      id: params.id,
      result: {
        description: 'Prompt description',
        arguments: []
      }
    };
  }

  /**
   * Register MCP tool
   * @param {string} name - Tool name
   * @param {string} serverId - Server ID
   * @param {Object} tool - Tool definition
   */
  registerTool(name, serverId, tool) {
    const toolInfo = {
      name,
      serverId,
      description: tool.description,
      inputSchema: tool.inputSchema,
      execute: tool.execute
    };

    this.tools.set(name, toolInfo);
    log.info('MCP Tool registered', { name, serverId });
  }

  /**
   * Register MCP resource
   * @param {string} uri - Resource URI
   * @param {string} serverId - Server ID
   * @param {Object} resource - Resource definition
   */
  registerResource(uri, serverId, resource) {
    const resourceInfo = {
      uri,
      serverId,
      name: resource.name,
      description: resource.description,
      mimeType: resource.mimeType,
      content: resource.content
    };

    this.resources.set(uri, resourceInfo);
    log.info('MCP Resource registered', { uri, serverId });
  }

  /**
   * Generate unique request ID
   * @returns {string} Request ID
   */
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get server status
   * @param {string} serverId - Server ID
   * @returns {Object} Server status
   */
  getServerStatus(serverId) {
    const serverInfo = this.servers.get(serverId);
    
    if (!serverInfo) {
      return { error: 'Server not found' };
    }

    return {
      id: serverInfo.id,
      status: serverInfo.status,
      capabilities: serverInfo.capabilities,
      lastSeen: new Date(serverInfo.lastSeen).toISOString()
    };
  }

  /**
   * Get client status
   * @param {string} clientId - Client ID
   * @returns {Object} Client status
   */
  getClientStatus(clientId) {
    const clientInfo = this.clients.get(clientId);
    
    if (!clientInfo) {
      return { error: 'Client not found' };
    }

    return {
      id: clientInfo.id,
      status: clientInfo.status,
      capabilities: clientInfo.capabilities,
      lastSeen: new Date(clientInfo.lastSeen).toISOString()
    };
  }
}

module.exports = MCPProtocol;