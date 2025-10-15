/**
 * MCP Agent Bridge
 * Connects multi-agent system with MCP servers for data collection and tool execution
 * Implements real-time communication and observability
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const EventEmitter = require('events');

class MCPAgentBridge extends EventEmitter {
  constructor() {
    super();
    this.agentConnections = new Map();
    this.toolRegistry = new Map();
    this.observability = new AgentObservability();
    
    this.initializeMCPTools();
  }

  initializeMCPTools() {
    // Register MCP tools available to agents
    this.toolRegistry.set('browser_use', {
      name: 'browser_use',
      description: 'Automate browser interactions for web scraping and testing',
      parameters: {
        url: { type: 'string', description: 'URL to navigate to' },
        actions: { type: 'array', description: 'Browser actions to perform' }
      },
      handler: this.handleBrowserUse.bind(this)
    });

    this.toolRegistry.set('open_file', {
      name: 'open_file',
      description: 'Open and read file contents',
      parameters: {
        path: { type: 'string', description: 'File path to open' }
      },
      handler: this.handleOpenFile.bind(this)
    });

    this.toolRegistry.set('read_file', {
      name: 'read_file',
      description: 'Read file contents with line range support',
      parameters: {
        path: { type: 'string', description: 'File path to read' },
        start_line: { type: 'number', description: 'Start line number' },
        end_line: { type: 'number', description: 'End line number' }
      },
      handler: this.handleReadFile.bind(this)
    });

    this.toolRegistry.set('report_costs', {
      name: 'report_costs',
      description: 'Report operational costs and usage metrics',
      parameters: {
        agent_id: { type: 'string', description: 'Agent identifier' },
        operation: { type: 'string', description: 'Operation performed' },
        cost: { type: 'number', description: 'Cost in USD' }
      },
      handler: this.handleReportCosts.bind(this)
    });

    this.toolRegistry.set('web_search', {
      name: 'web_search',
      description: 'Search the web for real-time information',
      parameters: {
        query: { type: 'string', description: 'Search query' },
        max_results: { type: 'number', description: 'Maximum results to return' }
      },
      handler: this.handleWebSearch.bind(this)
    });

    this.toolRegistry.set('database_ops', {
      name: 'database_ops',
      description: 'Perform database operations',
      parameters: {
        operation: { type: 'string', description: 'Database operation type' },
        query: { type: 'string', description: 'SQL query or operation' },
        data: { type: 'object', description: 'Data for insert/update operations' }
      },
      handler: this.handleDatabaseOps.bind(this)
    });
  }

  // Agent Connection Management
  async connectAgent(agentId, agentType) {
    const connection = {
      agentId: agentId,
      agentType: agentType,
      connected: true,
      connectedAt: new Date().toISOString(),
      tools: this.getToolsForAgentType(agentType),
      metrics: {
        requests: 0,
        errors: 0,
        lastActivity: new Date().toISOString()
      }
    };

    this.agentConnections.set(agentId, connection);
    this.observability.recordAgentConnection(agentId, agentType);
    
    this.emit('agent_connected', connection);
    return connection;
  }

  async disconnectAgent(agentId) {
    const connection = this.agentConnections.get(agentId);
    if (connection) {
      connection.connected = false;
      connection.disconnectedAt = new Date().toISOString();
      
      this.observability.recordAgentDisconnection(agentId);
      this.emit('agent_disconnected', connection);
    }
  }

  getToolsForAgentType(agentType) {
    const toolMappings = {
      'travel-researcher': ['web_search', 'browser_use', 'read_file'],
      'booking-agent': ['database_ops', 'report_costs'],
      'customer-service': ['web_search', 'database_ops'],
      'data-analyst': ['database_ops', 'read_file', 'report_costs']
    };

    return toolMappings[agentType] || [];
  }

  // Tool Execution Handlers
  async handleBrowserUse(params, agentId) {
    this.observability.recordToolUsage(agentId, 'browser_use');
    
    try {
      // Integrate with Playwright for browser automation
      const { chromium } = require('playwright');
      const browser = await chromium.launch();
      const page = await browser.newPage();
      
      await page.goto(params.url);
      
      const results = [];
      if (params.actions) {
        for (const action of params.actions) {
          switch (action.type) {
            case 'click':
              await page.click(action.selector);
              break;
            case 'fill':
              await page.fill(action.selector, action.value);
              break;
            case 'screenshot':
              const screenshot = await page.screenshot();
              results.push({ type: 'screenshot', data: screenshot.toString('base64') });
              break;
            case 'extract':
              const text = await page.textContent(action.selector);
              results.push({ type: 'text', data: text });
              break;
          }
        }
      }
      
      await browser.close();
      
      return {
        success: true,
        results: results,
        url: params.url,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.observability.recordToolError(agentId, 'browser_use', error.message);
      throw error;
    }
  }

  async handleOpenFile(params, agentId) {
    this.observability.recordToolUsage(agentId, 'open_file');
    
    try {
      const fs = require('fs').promises;
      const content = await fs.readFile(params.path, 'utf8');
      
      return {
        success: true,
        content: content,
        path: params.path,
        size: content.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.observability.recordToolError(agentId, 'open_file', error.message);
      throw error;
    }
  }

  async handleReadFile(params, agentId) {
    this.observability.recordToolUsage(agentId, 'read_file');
    
    try {
      const fs = require('fs').promises;
      const content = await fs.readFile(params.path, 'utf8');
      const lines = content.split('\n');
      
      const startLine = params.start_line || 1;
      const endLine = params.end_line || lines.length;
      
      const selectedLines = lines.slice(startLine - 1, endLine);
      
      return {
        success: true,
        content: selectedLines.join('\n'),
        path: params.path,
        start_line: startLine,
        end_line: endLine,
        total_lines: lines.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.observability.recordToolError(agentId, 'read_file', error.message);
      throw error;
    }
  }

  async handleReportCosts(params, agentId) {
    this.observability.recordToolUsage(agentId, 'report_costs');
    
    const costRecord = {
      agent_id: params.agent_id,
      operation: params.operation,
      cost: params.cost,
      timestamp: new Date().toISOString()
    };
    
    this.observability.recordCost(costRecord);
    
    return {
      success: true,
      cost_recorded: costRecord,
      total_costs: this.observability.getTotalCosts(params.agent_id)
    };
  }

  async handleWebSearch(params, agentId) {
    this.observability.recordToolUsage(agentId, 'web_search');
    
    try {
      // Integrate with web search API
      const searchResults = await this.performWebSearch(params.query, params.max_results || 10);
      
      return {
        success: true,
        query: params.query,
        results: searchResults,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.observability.recordToolError(agentId, 'web_search', error.message);
      throw error;
    }
  }

  async handleDatabaseOps(params, agentId) {
    this.observability.recordToolUsage(agentId, 'database_ops');
    
    try {
      // Integrate with Supabase database
      const db = require('../../database/supabase');
      let result;
      
      switch (params.operation) {
        case 'select':
          result = await db.query(params.query);
          break;
        case 'insert':
          result = await db.insert(params.query, params.data);
          break;
        case 'update':
          result = await db.update(params.query, params.data);
          break;
        case 'delete':
          result = await db.delete(params.query);
          break;
        default:
          throw new Error(`Unknown database operation: ${params.operation}`);
      }
      
      return {
        success: true,
        operation: params.operation,
        result: result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.observability.recordToolError(agentId, 'database_ops', error.message);
      throw error;
    }
  }

  async performWebSearch(query, maxResults) {
    // Mock web search implementation
    // In production, integrate with actual search API
    return [
      {
        title: `Search result for: ${query}`,
        url: 'https://example.com',
        snippet: `This is a search result for "${query}"`,
        relevance: 0.9
      }
    ];
  }

  // Tool Execution Interface
  async executeTool(agentId, toolName, params) {
    const connection = this.agentConnections.get(agentId);
    if (!connection || !connection.connected) {
      throw new Error(`Agent ${agentId} is not connected`);
    }

    if (!connection.tools.includes(toolName)) {
      throw new Error(`Tool ${toolName} not available for agent ${agentId}`);
    }

    const tool = this.toolRegistry.get(toolName);
    if (!tool) {
      throw new Error(`Unknown tool: ${toolName}`);
    }

    connection.metrics.requests++;
    connection.metrics.lastActivity = new Date().toISOString();

    try {
      const result = await tool.handler(params, agentId);
      return result;
    } catch (error) {
      connection.metrics.errors++;
      throw error;
    }
  }

  // Observability and Monitoring
  getSystemMetrics() {
    const connections = Array.from(this.agentConnections.values());
    const activeConnections = connections.filter(c => c.connected).length;
    
    return {
      total_connections: connections.length,
      active_connections: activeConnections,
      tool_registry_size: this.toolRegistry.size,
      observability_metrics: this.observability.getMetrics()
    };
  }

  getAgentMetrics(agentId) {
    const connection = this.agentConnections.get(agentId);
    if (!connection) {
      return null;
    }

    return {
      agent_id: agentId,
      connected: connection.connected,
      connected_at: connection.connectedAt,
      tools_available: connection.tools,
      metrics: connection.metrics,
      observability: this.observability.getAgentMetrics(agentId)
    };
  }
}

// Agent Observability System
class AgentObservability {
  constructor() {
    this.agentConnections = new Map();
    this.toolUsage = new Map();
    this.costs = [];
    this.errors = [];
    this.metrics = {
      total_connections: 0,
      total_tool_usage: 0,
      total_costs: 0,
      total_errors: 0
    };
  }

  recordAgentConnection(agentId, agentType) {
    this.agentConnections.set(agentId, {
      agent_id: agentId,
      agent_type: agentType,
      connected_at: new Date().toISOString(),
      status: 'connected'
    });
    
    this.metrics.total_connections++;
  }

  recordAgentDisconnection(agentId) {
    if (this.agentConnections.has(agentId)) {
      const connection = this.agentConnections.get(agentId);
      connection.disconnected_at = new Date().toISOString();
      connection.status = 'disconnected';
    }
  }

  recordToolUsage(agentId, toolName) {
    if (!this.toolUsage.has(agentId)) {
      this.toolUsage.set(agentId, new Map());
    }
    
    const agentTools = this.toolUsage.get(agentId);
    const currentCount = agentTools.get(toolName) || 0;
    agentTools.set(toolName, currentCount + 1);
    
    this.metrics.total_tool_usage++;
  }

  recordToolError(agentId, toolName, errorMessage) {
    this.errors.push({
      agent_id: agentId,
      tool_name: toolName,
      error_message: errorMessage,
      timestamp: new Date().toISOString()
    });
    
    this.metrics.total_errors++;
  }

  recordCost(costRecord) {
    this.costs.push(costRecord);
    this.metrics.total_costs += costRecord.cost;
  }

  getTotalCosts(agentId) {
    return this.costs
      .filter(c => c.agent_id === agentId)
      .reduce((total, cost) => total + cost.cost, 0);
  }

  getMetrics() {
    return {
      ...this.metrics,
      agent_connections: Array.from(this.agentConnections.values()),
      recent_errors: this.errors.slice(-10),
      cost_summary: this.getCostSummary()
    };
  }

  getAgentMetrics(agentId) {
    const connection = this.agentConnections.get(agentId);
    const toolUsage = this.toolUsage.get(agentId) || new Map();
    
    return {
      connection: connection,
      tool_usage: Object.fromEntries(toolUsage),
      total_costs: this.getTotalCosts(agentId),
      error_count: this.errors.filter(e => e.agent_id === agentId).length
    };
  }

  getCostSummary() {
    const summary = {};
    for (const cost of this.costs) {
      if (!summary[cost.agent_id]) {
        summary[cost.agent_id] = { total: 0, operations: 0 };
      }
      summary[cost.agent_id].total += cost.cost;
      summary[cost.agent_id].operations++;
    }
    return summary;
  }
}

module.exports = MCPAgentBridge;

