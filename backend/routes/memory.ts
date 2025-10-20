/**
 * ============================================
 * MEMORY ROUTES - OpenMemory MCP API
 * Provides endpoints for memory management
 * ============================================
 */

import { Router, Request, Response } from 'express';
import { memoryService, MemoryContext, QueryType, MemoryType } from '../src/memory/MemoryService';

const router = Router();

/**
 * GET /api/memory/stats
 * Get memory service statistics
 */
router.get('/stats', (req: Request, res: Response) => {
  try {
    const stats = memoryService.getStats();
    
    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/memory/usage
 * Get memory usage statistics
 */
router.get('/usage', async (req: Request, res: Response) => {
  try {
    const usage = await memoryService.getMemoryUsage();
    
    res.json({
      success: true,
      usage,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/memory/query
 * Query memory (unified interface)
 */
router.post('/query', async (req: Request, res: Response) => {
  try {
    const { context, query, queryType, options } = req.body;
    
    // Validation
    if (!context || !query || !queryType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters',
        message: 'context, query, and queryType are required'
      });
    }
    
    // Validate queryType
    const validQueryTypes: QueryType[] = ['semantic', 'keyword', 'ephemeral', 'pattern'];
    if (!validQueryTypes.includes(queryType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid queryType',
        message: `queryType must be one of: ${validQueryTypes.join(', ')}`
      });
    }
    
    const results = await memoryService.queryMemory(
      context as MemoryContext,
      query,
      queryType as QueryType,
      options
    );
    
    res.json({
      success: true,
      results,
      count: results.length,
      query: {
        context,
        query,
        queryType,
        options
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Memory query error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/memory/store
 * Store memory (unified interface)
 */
router.post('/store', async (req: Request, res: Response) => {
  try {
    const { context, memoryType, key, content, options } = req.body;
    
    // Validation
    if (!context || !memoryType || !key || !content) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters',
        message: 'context, memoryType, key, and content are required'
      });
    }
    
    // Validate memoryType
    const validMemoryTypes: MemoryType[] = ['ephemeral', 'short_term', 'long_term', 'pattern'];
    if (!validMemoryTypes.includes(memoryType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid memoryType',
        message: `memoryType must be one of: ${validMemoryTypes.join(', ')}`
      });
    }
    
    const result = await memoryService.storeMemory(
      context as MemoryContext,
      memoryType as MemoryType,
      key,
      content,
      options
    );
    
    res.status(201).json({
      success: true,
      message: `Memory stored successfully`,
      memoryType,
      key,
      id: result || undefined,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Memory store error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/memory/patterns
 * Get learned patterns
 */
router.get('/patterns', async (req: Request, res: Response) => {
  try {
    const { agentId, context, minConfidence, limit } = req.query;
    
    if (!agentId) {
      return res.status(400).json({
        success: false,
        error: 'agentId is required'
      });
    }
    
    const memoryContext: MemoryContext = {
      agentId: agentId as string,
      userId: req.query.userId as string,
      projectId: req.query.projectId as string,
      namespace: (req.query.namespace as string) || 'default'
    };
    
    const patterns = await memoryService.getPatterns(
      memoryContext,
      context as string,
      {
        minConfidence: minConfidence ? parseFloat(minConfidence as string) : 0.5,
        limit: limit ? parseInt(limit as string) : 10
      }
    );
    
    res.json({
      success: true,
      patterns,
      count: patterns.length,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Get patterns error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/memory/clear
 * Clear ephemeral memory (use with caution!)
 */
router.delete('/clear', async (req: Request, res: Response) => {
  try {
    const { namespace, agentId } = req.query;
    
    const context: MemoryContext | undefined = namespace && agentId ? {
      namespace: namespace as string,
      agentId: agentId as string
    } : undefined;
    
    await memoryService.clearEphemeral(context);
    
    res.json({
      success: true,
      message: context 
        ? `Ephemeral memory cleared for namespace: ${context.namespace}`
        : 'All ephemeral memory cleared',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Clear memory error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
