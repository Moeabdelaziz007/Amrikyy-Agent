/**
 * Agent MCP Integration - Model Context Protocol integration for AI agents
 * Enables agents to use external tools for enhanced capabilities
 * 
 * Features:
 * - Filesystem operations
 * - Memory management
 * - Sequential thinking
 * - Web search
 * - Code execution
 * 
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-23
 */

const logger = require('./logger');

class AgentMCPIntegration {
  constructor(agentName, mcpManager = null) {
    this.agentName = agentName;
    this.mcpManager = mcpManager;
    this.toolCache = new Map();
    
    // Tool usage statistics
    this.stats = {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      byTool: {}
    };
  }

  /**
   * Initialize MCP manager
   */
  async initialize(mcpManager) {
    try {
      this.mcpManager = mcpManager;
      
      if (!this.mcpManager) {
        logger.warn(`${this.agentName}: No MCP manager provided, tool capabilities limited`);
        return false;
      }
      
      // Verify MCP server availability
      const available = await this.checkAvailability();
      
      if (available) {
        logger.info(`${this.agentName}: MCP integration initialized successfully`);
        return true;
      }
      
      logger.warn(`${this.agentName}: MCP servers not available`);
      return false;
      
    } catch (error) {
      logger.error(`${this.agentName}: MCP initialization error:`, error);
      return false;
    }
  }

  /**
   * Check MCP server availability
   */
  async checkAvailability() {
    try {
      if (!this.mcpManager) {
        return false;
      }
      
      // Try to list available tools
      const tools = await this.listTools();
      return tools && tools.length > 0;
      
    } catch (error) {
      return false;
    }
  }

  /**
   * List available MCP tools
   */
  async listTools() {
    try {
      if (!this.mcpManager || !this.mcpManager.listTools) {
        return [];
      }
      
      const tools = await this.mcpManager.listTools();
      return tools || [];
      
    } catch (error) {
      logger.error(`${this.agentName}: Error listing MCP tools:`, error);
      return [];
    }
  }

  /**
   * Call MCP tool
   */
  async callTool(toolName, params = {}) {
    try {
      this.stats.totalCalls++;
      
      if (!this.mcpManager) {
        throw new Error('MCP manager not initialized');
      }
      
      logger.debug(`${this.agentName}: Calling MCP tool "${toolName}"`, params);
      
      const result = await this.mcpManager.callTool(toolName, params);
      
      this.stats.successfulCalls++;
      this.updateToolStats(toolName, true);
      
      // Cache result if appropriate
      if (this.shouldCache(toolName)) {
        this.cacheToolResult(toolName, params, result);
      }
      
      return {
        success: true,
        tool: toolName,
        result
      };
      
    } catch (error) {
      this.stats.failedCalls++;
      this.updateToolStats(toolName, false);
      
      logger.error(`${this.agentName}: MCP tool error for "${toolName}":`, error);
      
      return {
        success: false,
        tool: toolName,
        error: error.message
      };
    }
  }

  /**
   * Read file using filesystem tool
   */
  async readFile(filePath) {
    return this.callTool('filesystem_read_file', { path: filePath });
  }

  /**
   * Write file using filesystem tool
   */
  async writeFile(filePath, content) {
    return this.callTool('filesystem_write_file', { 
      path: filePath,
      content 
    });
  }

  /**
   * List directory using filesystem tool
   */
  async listDirectory(dirPath) {
    return this.callTool('filesystem_list_directory', { path: dirPath });
  }

  /**
   * Store in memory
   */
  async storeMemory(key, value, metadata = {}) {
    return this.callTool('memory_store', {
      key,
      value,
      metadata: {
        agent: this.agentName,
        timestamp: Date.now(),
        ...metadata
      }
    });
  }

  /**
   * Retrieve from memory
   */
  async retrieveMemory(key) {
    return this.callTool('memory_retrieve', { key });
  }

  /**
   * Search memory
   */
  async searchMemory(query, limit = 10) {
    return this.callTool('memory_search', { 
      query,
      limit,
      agent: this.agentName
    });
  }

  /**
   * Sequential thinking for complex reasoning
   */
  async think(problem, steps = 5) {
    return this.callTool('sequential_thinking', {
      problem,
      steps,
      agent: this.agentName
    });
  }

  /**
   * Web search (if available)
   */
  async webSearch(query, maxResults = 5) {
    return this.callTool('web_search', {
      query,
      maxResults,
      agent: this.agentName
    });
  }

  /**
   * Execute code (if available)
   */
  async executeCode(code, language = 'javascript') {
    return this.callTool('code_execution', {
      code,
      language,
      agent: this.agentName
    });
  }

  /**
   * Generate tool-augmented prompt
   */
  generateToolPrompt(originalPrompt, availableTools = []) {
    const toolsList = availableTools.length > 0 
      ? availableTools.join(', ')
      : 'filesystem, memory, sequential thinking';
    
    return `
${originalPrompt}

---

You have access to the following MCP tools:
${toolsList}

Guidelines:
- Use filesystem tools to read/write files when needed
- Use memory tools to store/retrieve important information
- Use sequential thinking for complex multi-step problems
- Use web search for current information
- Combine tools for better results

When you need to use a tool, indicate it clearly in your response.
`;
  }

  /**
   * Parse tool calls from agent response
   */
  parseToolCalls(response) {
    const toolCalls = [];
    
    // Look for tool call patterns like: [TOOL:tool_name|param1=value1|param2=value2]
    const pattern = /\[TOOL:([^|]+)(?:\|([^\]]+))?\]/g;
    let match;
    
    while ((match = pattern.exec(response)) !== null) {
      const toolName = match[1].trim();
      const paramsStr = match[2] || '';
      
      const params = {};
      if (paramsStr) {
        const pairs = paramsStr.split('|');
        for (const pair of pairs) {
          const [key, value] = pair.split('=');
          if (key && value) {
            params[key.trim()] = value.trim();
          }
        }
      }
      
      toolCalls.push({
        tool: toolName,
        params,
        original: match[0]
      });
    }
    
    return toolCalls;
  }

  /**
   * Execute tool calls from response
   */
  async executeToolCalls(response) {
    const toolCalls = this.parseToolCalls(response);
    
    if (toolCalls.length === 0) {
      return { response, toolResults: [] };
    }
    
    logger.debug(`${this.agentName}: Executing ${toolCalls.length} tool calls`);
    
    const toolResults = [];
    let enhancedResponse = response;
    
    for (const call of toolCalls) {
      const result = await this.callTool(call.tool, call.params);
      toolResults.push(result);
      
      // Replace tool call with result in response
      if (result.success) {
        const resultStr = typeof result.result === 'string' 
          ? result.result 
          : JSON.stringify(result.result);
        
        enhancedResponse = enhancedResponse.replace(
          call.original,
          `[TOOL_RESULT:${resultStr}]`
        );
      }
    }
    
    return {
      response: enhancedResponse,
      toolResults,
      toolCallCount: toolCalls.length
    };
  }

  /**
   * Check if tool result should be cached
   */
  shouldCache(toolName) {
    const cacheable = ['web_search', 'filesystem_read_file', 'memory_retrieve'];
    return cacheable.includes(toolName);
  }

  /**
   * Cache tool result
   */
  cacheToolResult(toolName, params, result) {
    const key = `${toolName}:${JSON.stringify(params)}`;
    this.toolCache.set(key, {
      result,
      timestamp: Date.now(),
      ttl: 300000 // 5 minutes
    });
    
    // Limit cache size
    if (this.toolCache.size > 100) {
      const oldest = this.toolCache.keys().next().value;
      this.toolCache.delete(oldest);
    }
  }

  /**
   * Get cached tool result
   */
  getCachedResult(toolName, params) {
    const key = `${toolName}:${JSON.stringify(params)}`;
    const cached = this.toolCache.get(key);
    
    if (cached) {
      const age = Date.now() - cached.timestamp;
      if (age < cached.ttl) {
        return cached.result;
      }
      this.toolCache.delete(key);
    }
    
    return null;
  }

  /**
   * Update tool statistics
   */
  updateToolStats(toolName, success) {
    if (!this.stats.byTool[toolName]) {
      this.stats.byTool[toolName] = {
        total: 0,
        successful: 0,
        failed: 0
      };
    }
    
    this.stats.byTool[toolName].total++;
    if (success) {
      this.stats.byTool[toolName].successful++;
    } else {
      this.stats.byTool[toolName].failed++;
    }
  }

  /**
   * Get MCP integration statistics
   */
  getStats() {
    return {
      ...this.stats,
      cacheSize: this.toolCache.size,
      successRate: this.stats.totalCalls > 0 
        ? ((this.stats.successfulCalls / this.stats.totalCalls) * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      byTool: {}
    };
    
    logger.info(`${this.agentName}: MCP statistics reset`);
  }

  /**
   * Clear tool cache
   */
  clearCache() {
    this.toolCache.clear();
    logger.info(`${this.agentName}: MCP tool cache cleared`);
  }

  /**
   * Get integration health
   */
  async getHealth() {
    try {
      const available = await this.checkAvailability();
      const tools = await this.listTools();
      
      return {
        agent: this.agentName,
        mcpAvailable: available,
        managerPresent: !!this.mcpManager,
        toolCount: tools.length,
        tools: tools.map(t => t.name || t),
        stats: this.getStats()
      };
      
    } catch (error) {
      return {
        agent: this.agentName,
        healthy: false,
        error: error.message
      };
    }
  }
}

module.exports = AgentMCPIntegration;
