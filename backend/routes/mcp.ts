/**
 * ============================================
 * MCP REST BRIDGE - Tool Discovery & Execution
 * Exposes MCP tools via REST API (AIX-compliant)
 * ============================================
 * 
 * This bridge allows external clients to:
 * 1. Discover available MCP tools
 * 2. Execute tools via REST
 * 3. Access OpenMemory as MCP tools
 */

import { Router, Request, Response } from 'express';
import { memoryService, MemoryContext, QueryType, MemoryType } from '../src/memory/MemoryService';

const router = Router();

/**
 * Middleware to ensure MCP servers are available
 */
router.use((req: Request, res: Response, next) => {
  if (!req.app.locals.travelMcpServer) {
    return res.status(500).json({
      success: false,
      error: 'MCP servers not initialized',
      message: 'The MCP tool system is currently unavailable'
    });
  }
  next();
});

/**
 * GET /api/mcp/tools
 * List all available MCP tools (including OpenMemory tools)
 */
router.get('/tools', (req: Request, res: Response) => {
  try {
    const travelMcpServer = req.app.locals.travelMcpServer;
    
    // Get tools from TravelMCPServer
    const travelTools = travelMcpServer.listTools();
    
    // Add OpenMemory tools (AIX-compliant)
    const openMemoryTools = [
      {
        name: 'openmemory_query',
        description: 'Query agent memory across ephemeral, short-term, and long-term storage. Supports semantic and keyword search.',
        inputSchema: {
          type: 'object',
          properties: {
            agentId: {
              type: 'string',
              description: 'Agent identifier'
            },
            query: {
              type: 'string',
              description: 'Search query text'
            },
            queryType: {
              type: 'string',
              enum: ['semantic', 'keyword', 'ephemeral', 'pattern'],
              description: 'Type of search to perform'
            },
            userId: {
              type: 'string',
              description: 'User ID for scoped search (optional)'
            },
            projectId: {
              type: 'string',
              description: 'Project ID for scoped search (optional)'
            },
            namespace: {
              type: 'string',
              description: 'Namespace for logical isolation (optional)',
              default: 'default'
            },
            options: {
              type: 'object',
              description: 'Additional query options (limit, minConfidence, etc.)',
              properties: {
                limit: { type: 'number', default: 10 },
                minConfidence: { type: 'number', default: 0.5 }
              }
            }
          },
          required: ['agentId', 'query', 'queryType']
        },
        outputSchema: {
          type: 'array',
          items: { type: 'object' },
          description: 'List of relevant memory items'
        }
      },
      {
        name: 'openmemory_store',
        description: 'Store information in agent memory (ephemeral, short-term, or long-term). Supports pattern learning.',
        inputSchema: {
          type: 'object',
          properties: {
            agentId: {
              type: 'string',
              description: 'Agent identifier'
            },
            memoryType: {
              type: 'string',
              enum: ['ephemeral', 'short_term', 'long_term', 'pattern'],
              description: 'Type of memory to store'
            },
            key: {
              type: 'string',
              description: 'Memory key/identifier'
            },
            content: {
              type: 'object',
              description: 'Content to store'
            },
            userId: {
              type: 'string',
              description: 'User ID for scoped storage (optional)'
            },
            projectId: {
              type: 'string',
              description: 'Project ID for scoped storage (optional)'
            },
            namespace: {
              type: 'string',
              description: 'Namespace for logical isolation (optional)',
              default: 'default'
            },
            options: {
              type: 'object',
              description: 'Additional storage options',
              properties: {
                contentType: { type: 'string', description: 'Content type classification' },
                ttl: { type: 'number', description: 'Time to live in seconds (for ephemeral/short-term)' },
                metadata: { type: 'object', description: 'Additional metadata' }
              }
            }
          },
          required: ['agentId', 'memoryType', 'key', 'content']
        },
        outputSchema: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            id: { type: 'string', description: 'Memory item ID (for long-term storage)' }
          },
          description: 'Storage confirmation'
        }
      }
    ];
    
    // Combine all tools
    const allTools = [...travelTools, ...openMemoryTools];
    
    res.json({
      success: true,
      tools: allTools,
      count: allTools.length,
      categories: {
        travel: travelTools.length,
        memory: openMemoryTools.length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error listing MCP tools:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/mcp/call
 * Execute an MCP tool
 */
router.post('/call', async (req: Request, res: Response) => {
  try {
    const { toolName, params } = req.body;
    
    if (!toolName) {
      return res.status(400).json({
        success: false,
        error: 'toolName is required'
      });
    }
    
    if (!params) {
      return res.status(400).json({
        success: false,
        error: 'params is required'
      });
    }
    
    const travelMcpServer = req.app.locals.travelMcpServer;
    
    console.log(`🔧 MCP Tool Call: ${toolName}`);
    
    // ============================================
    // OPENMEMORY TOOLS HANDLING
    // ============================================
    
    if (toolName === 'openmemory_query') {
      const { agentId, query, queryType, userId, projectId, namespace, options } = params;
      
      // Validate required params
      if (!agentId || !query || !queryType) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters for openmemory_query',
          required: ['agentId', 'query', 'queryType']
        });
      }
      
      // Build memory context
      const context: MemoryContext = {
        agentId,
        userId,
        projectId,
        namespace: namespace || 'default'
      };
      
      // Execute query
      const results = await memoryService.queryMemory(
        context,
        query,
        queryType as QueryType,
        options
      );
      
      return res.json({
        success: true,
        tool: toolName,
        results,
        count: results.length,
        timestamp: new Date().toISOString()
      });
    }
    
    if (toolName === 'openmemory_store') {
      const { agentId, memoryType, key, content, userId, projectId, namespace, options } = params;
      
      // Validate required params
      if (!agentId || !memoryType || !key || !content) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters for openmemory_store',
          required: ['agentId', 'memoryType', 'key', 'content']
        });
      }
      
      // Build memory context
      const context: MemoryContext = {
        agentId,
        userId,
        projectId,
        namespace: namespace || 'default'
      };
      
      // Execute storage
      const result = await memoryService.storeMemory(
        context,
        memoryType as MemoryType,
        key,
        content,
        options
      );
      
      return res.json({
        success: true,
        tool: toolName,
        stored: true,
        id: result || undefined,
        memoryType,
        key,
        timestamp: new Date().toISOString()
      });
    }
    
    // ============================================
    // TRAVEL MCP TOOLS HANDLING
    // ============================================
    
    // Call tool from TravelMCPServer
    const result = await travelMcpServer.callTool(toolName, params);
    
    res.json({
      success: true,
      tool: toolName,
      result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('MCP tool execution error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      tool: req.body.toolName,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/mcp/tools/:toolName
 * Get details about a specific tool
 */
router.get('/tools/:toolName', (req: Request, res: Response) => {
  try {
    const { toolName } = req.params;
    const travelMcpServer = req.app.locals.travelMcpServer;
    
    // Check travel tools
    const travelTools = travelMcpServer.listTools();
    const travelTool = travelTools.find((t: any) => t.name === toolName);
    
    if (travelTool) {
      return res.json({
        success: true,
        tool: travelTool,
        category: 'travel',
        timestamp: new Date().toISOString()
      });
    }
    
    // Check OpenMemory tools
    const openMemoryToolNames = ['openmemory_query', 'openmemory_store'];
    if (openMemoryToolNames.includes(toolName)) {
      // Return OpenMemory tool definition
      // (In production, this would come from a centralized registry)
      return res.json({
        success: true,
        tool: {
          name: toolName,
          category: 'memory',
          description: toolName === 'openmemory_query' 
            ? 'Query agent memory' 
            : 'Store in agent memory'
        },
        category: 'memory',
        timestamp: new Date().toISOString()
      });
    }
    
    // Tool not found
    res.status(404).json({
      success: false,
      error: `Tool ${toolName} not found`,
      availableTools: [...travelTools.map((t: any) => t.name), ...openMemoryToolNames]
    });
    
  } catch (error: any) {
    console.error('Error getting tool details:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/mcp/health
 * Health check for MCP system
 */
router.get('/health', (req: Request, res: Response) => {
  try {
    const travelMcpServer = req.app.locals.travelMcpServer;
    const travelTools = travelMcpServer.listTools();
    const memoryStats = memoryService.getStats();
    
    res.json({
      success: true,
      status: 'healthy',
      services: {
        travelMcp: {
          status: 'up',
          toolsCount: travelTools.length
        },
        openMemory: {
          status: memoryStats.ephemeralHits > 0 || memoryStats.longTermHits > 0 ? 'active' : 'idle',
          stats: memoryStats
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: error.message
    });
  }
});

export default router;
