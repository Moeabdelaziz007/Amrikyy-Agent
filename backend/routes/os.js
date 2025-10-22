/**
 * AI Operating System API Routes
 * Handles all OS-level operations
 * 
 * Routes:
 * - GET    /api/os/status - Get OS status
 * - GET    /api/os/windows - Get all windows
 * - POST   /api/os/windows - Open a new window
 * - GET    /api/os/windows/:id - Get window by ID
 * - PUT    /api/os/windows/:id - Update window
 * - DELETE /api/os/windows/:id - Close window
 * - POST   /api/os/windows/:id/focus - Focus window
 * - POST   /api/os/windows/:id/minimize - Minimize window
 * - POST   /api/os/windows/:id/maximize - Maximize window
 * - POST   /api/os/windows/:id/restore - Restore window
 * - GET    /api/os/apps - Get all applications
 * - POST   /api/os/apps/:id/launch - Launch application
 * - POST   /api/os/command - Process natural language command
 * - GET    /api/os/metrics - Get system metrics
 * - POST   /api/os/state/save - Save OS state
 * - POST   /api/os/state/load - Load OS state
 */

const express = require('express');
const router = express.Router();
const aiOS = require('../src/os/AIOperatingSystem');
const { authenticateToken } = require('../middleware/auth');
const { aiLimiter, generalLimiter } = require('../middleware/rateLimiter');
const { 
  asyncHandler, 
  createSuccessResponse, 
  createErrorResponse,
  handleNotFoundError,
  handleValidationError
} = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Validation middleware
 */
const validateWindowConfig = (req, res, next) => {
  const { title, width, height } = req.body;
  const errors = [];

  if (width !== undefined && (typeof width !== 'number' || width < 100 || width > 4000)) {
    errors.push('Width must be a number between 100 and 4000');
  }

  if (height !== undefined && (typeof height !== 'number' || height < 100 || height > 3000)) {
    errors.push('Height must be a number between 100 and 3000');
  }

  if (title !== undefined && (typeof title !== 'string' || title.length > 100)) {
    errors.push('Title must be a string with max 100 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json(createErrorResponse(400, 'Validation failed', errors));
  }

  next();
};

const validateAppLaunch = (req, res, next) => {
  const { appId } = req.params;
  
  if (!appId || typeof appId !== 'string') {
    return res.status(400).json(
      createErrorResponse(400, 'Valid application ID is required')
    );
  }

  next();
};

const validateNLCommand = (req, res, next) => {
  const { command } = req.body;
  
  if (!command || typeof command !== 'string' || command.trim().length === 0) {
    return res.status(400).json(
      createErrorResponse(400, 'Command text is required')
    );
  }

  if (command.length > 500) {
    return res.status(400).json(
      createErrorResponse(400, 'Command text too long (max 500 characters)')
    );
  }

  next();
};

/**
 * GET /api/os/status
 * Get OS status and system information
 */
router.get('/status', 
  generalLimiter,
  asyncHandler(async (req, res) => {
    const state = aiOS.getState();
    
    logger.info('📊 OS status requested', {
      windows: state.windows.length,
      apps: state.runningApps.length,
      ip: req.ip
    });

    res.json(createSuccessResponse({
      status: 'running',
      initialized: state.initialized,
      systemInfo: state.systemInfo,
      windows: state.windows.length,
      runningApps: state.runningApps.length,
      theme: state.theme,
      version: state.systemInfo.version
    }));
  })
);

/**
 * GET /api/os/windows
 * Get all windows
 */
router.get('/windows',
  authenticateToken,
  generalLimiter,
  asyncHandler(async (req, res) => {
    const windows = aiOS.getAllWindows();
    
    logger.debug('🪟 Windows list requested', {
      count: windows.length,
      userId: req.user?.id
    });

    res.json(createSuccessResponse({
      windows,
      count: windows.length,
      focusedWindowId: aiOS.focusedWindowId
    }));
  })
);

/**
 * POST /api/os/windows
 * Open a new window
 */
router.post('/windows',
  authenticateToken,
  generalLimiter,
  validateWindowConfig,
  asyncHandler(async (req, res) => {
    const config = {
      title: req.body.title || 'New Window',
      appId: req.body.appId || null,
      icon: req.body.icon || '📱',
      width: req.body.width || 800,
      height: req.body.height || 600,
      x: req.body.x,
      y: req.body.y,
      resizable: req.body.resizable,
      minimizable: req.body.minimizable,
      maximizable: req.body.maximizable
    };

    const window = aiOS.openWindow(config);
    
    logger.info('🪟 Window opened', {
      windowId: window.id,
      title: window.title,
      userId: req.user?.id
    });

    res.status(201).json(createSuccessResponse(
      { window },
      'Window opened successfully'
    ));
  })
);

/**
 * GET /api/os/windows/:id
 * Get window by ID
 */
router.get('/windows/:id',
  authenticateToken,
  generalLimiter,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const window = aiOS.getWindow(id);

    if (!window) {
      throw handleNotFoundError('Window');
    }

    res.json(createSuccessResponse({ window }));
  })
);

/**
 * PUT /api/os/windows/:id
 * Update window properties
 */
router.put('/windows/:id',
  authenticateToken,
  generalLimiter,
  validateWindowConfig,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const window = aiOS.getWindow(id);

    if (!window) {
      throw handleNotFoundError('Window');
    }

    // Update position if provided
    if (req.body.x !== undefined && req.body.y !== undefined) {
      aiOS.updateWindowPosition(id, req.body.x, req.body.y);
    }

    // Update size if provided
    if (req.body.width !== undefined && req.body.height !== undefined) {
      aiOS.updateWindowSize(id, req.body.width, req.body.height);
    }

    const updatedWindow = aiOS.getWindow(id);
    
    logger.info('🔄 Window updated', {
      windowId: id,
      userId: req.user?.id
    });

    res.json(createSuccessResponse(
      { window: updatedWindow },
      'Window updated successfully'
    ));
  })
);

/**
 * DELETE /api/os/windows/:id
 * Close a window
 */
router.delete('/windows/:id',
  authenticateToken,
  generalLimiter,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const window = aiOS.getWindow(id);

    if (!window) {
      throw handleNotFoundError('Window');
    }

    const success = aiOS.closeWindow(id);
    
    logger.info('🗑️ Window closed', {
      windowId: id,
      title: window.title,
      userId: req.user?.id
    });

    res.json(createSuccessResponse(
      { success, windowId: id },
      'Window closed successfully'
    ));
  })
);

/**
 * POST /api/os/windows/:id/focus
 * Focus a window
 */
router.post('/windows/:id/focus',
  authenticateToken,
  generalLimiter,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const window = aiOS.focusWindow(id);

    logger.debug('🎯 Window focused', {
      windowId: id,
      userId: req.user?.id
    });

    res.json(createSuccessResponse(
      { window },
      'Window focused successfully'
    ));
  })
);

/**
 * POST /api/os/windows/:id/minimize
 * Minimize a window
 */
router.post('/windows/:id/minimize',
  authenticateToken,
  generalLimiter,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const window = aiOS.minimizeWindow(id);

    logger.debug('📉 Window minimized', {
      windowId: id,
      userId: req.user?.id
    });

    res.json(createSuccessResponse(
      { window },
      'Window minimized successfully'
    ));
  })
);

/**
 * POST /api/os/windows/:id/maximize
 * Maximize a window
 */
router.post('/windows/:id/maximize',
  authenticateToken,
  generalLimiter,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const window = aiOS.maximizeWindow(id);

    logger.debug('📈 Window maximized', {
      windowId: id,
      userId: req.user?.id
    });

    res.json(createSuccessResponse(
      { window },
      'Window maximized successfully'
    ));
  })
);

/**
 * POST /api/os/windows/:id/restore
 * Restore a window to normal state
 */
router.post('/windows/:id/restore',
  authenticateToken,
  generalLimiter,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const window = aiOS.restoreWindow(id);

    logger.debug('🔄 Window restored', {
      windowId: id,
      userId: req.user?.id
    });

    res.json(createSuccessResponse(
      { window },
      'Window restored successfully'
    ));
  })
);

/**
 * GET /api/os/apps
 * Get all registered applications
 */
router.get('/apps',
  generalLimiter,
  asyncHandler(async (req, res) => {
    const applications = aiOS.getAllApplications();
    const runningApps = Array.from(aiOS.runningApps);

    logger.debug('📱 Applications list requested', {
      count: applications.length,
      running: runningApps.length
    });

    res.json(createSuccessResponse({
      applications,
      runningApps,
      count: applications.length
    }));
  })
);

/**
 * GET /api/os/apps/:id
 * Get application by ID
 */
router.get('/apps/:id',
  generalLimiter,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const application = aiOS.getApplication(id);

    if (!application) {
      throw handleNotFoundError('Application');
    }

    const isRunning = aiOS.runningApps.has(id);
    const windows = aiOS.getWindowsByApp(id);

    res.json(createSuccessResponse({
      application,
      isRunning,
      windows,
      windowCount: windows.length
    }));
  })
);

/**
 * POST /api/os/apps/:id/launch
 * Launch an application
 */
router.post('/apps/:id/launch',
  authenticateToken,
  generalLimiter,
  validateAppLaunch,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const options = req.body.options || {};

    const result = await aiOS.launchApplication(id, options);
    
    logger.info('🚀 Application launched', {
      appId: id,
      windowId: result.window.id,
      userId: req.user?.id
    });

    res.status(201).json(createSuccessResponse(
      result,
      'Application launched successfully'
    ));
  })
);

/**
 * POST /api/os/command
 * Process natural language command
 */
router.post('/command',
  authenticateToken,
  aiLimiter,
  validateNLCommand,
  asyncHandler(async (req, res) => {
    const { command, context } = req.body;
    
    const result = await aiOS.processNaturalLanguageCommand(
      command,
      {
        ...context,
        userId: req.user?.id,
        timestamp: new Date()
      }
    );

    logger.info('🤖 Natural language command processed', {
      command: command.substring(0, 50),
      intent: result.intent,
      userId: req.user?.id,
      duration: result.processingTime
    });

    res.json(createSuccessResponse(
      result,
      'Command processed successfully'
    ));
  })
);

/**
 * GET /api/os/metrics
 * Get system metrics
 */
router.get('/metrics',
  authenticateToken,
  generalLimiter,
  asyncHandler(async (req, res) => {
    const metrics = aiOS.getMetrics();
    
    logger.debug('📊 Metrics requested', {
      userId: req.user?.id
    });

    res.json(createSuccessResponse({ metrics }));
  })
);

/**
 * POST /api/os/state/save
 * Save OS state
 */
router.post('/state/save',
  authenticateToken,
  generalLimiter,
  asyncHandler(async (req, res) => {
    const result = await aiOS.saveState();
    
    logger.info('💾 OS state saved', {
      userId: req.user?.id
    });

    res.json(createSuccessResponse(
      result,
      'OS state saved successfully'
    ));
  })
);

/**
 * POST /api/os/state/load
 * Load OS state
 */
router.post('/state/load',
  authenticateToken,
  generalLimiter,
  asyncHandler(async (req, res) => {
    const result = await aiOS.loadState();
    
    logger.info('📂 OS state loaded', {
      userId: req.user?.id
    });

    res.json(createSuccessResponse(
      result,
      'OS state loaded successfully'
    ));
  })
);

/**
 * GET /api/os/state
 * Get current OS state
 */
router.get('/state',
  authenticateToken,
  generalLimiter,
  asyncHandler(async (req, res) => {
    const state = aiOS.getState();
    
    logger.debug('📊 OS state requested', {
      userId: req.user?.id
    });

    res.json(createSuccessResponse({ state }));
  })
);

/**
 * POST /api/os/shutdown
 * Shutdown the OS (for testing/maintenance)
 */
router.post('/shutdown',
  authenticateToken,
  generalLimiter,
  asyncHandler(async (req, res) => {
    // Only allow admin users to shutdown
    if (req.user?.role !== 'admin') {
      return res.status(403).json(
        createErrorResponse(403, 'Admin access required')
      );
    }

    const result = await aiOS.shutdown();
    
    logger.warn('🔌 OS shutdown initiated', {
      userId: req.user?.id
    });

    res.json(createSuccessResponse(
      result,
      'OS shutdown initiated'
    ));
  })
);

module.exports = router;
