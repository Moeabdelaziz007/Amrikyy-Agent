/**
 * AI Operating System - Core Module
 * Powered by Google Gemini Pro
 * 
 * Features:
 * - Window management (open, close, focus, minimize, maximize)
 * - Application registry and launcher
 * - Event system for OS operations
 * - State persistence
 * - Natural language OS control
 * - Context-aware assistance
 * 
 * @module AIOperatingSystem
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { EventEmitter } = require('events');
const logger = require('../../utils/logger');

class AIOperatingSystem extends EventEmitter {
  constructor() {
    super();
    
    // Gemini AI initialization
    this.genAI = null;
    this.model = null;
    
    // Window management state
    this.windows = new Map();
    this.windowIdCounter = 0;
    this.focusedWindowId = null;
    this.zIndexCounter = 1000;
    
    // Application registry
    this.applications = new Map();
    this.runningApps = new Set();
    
    // OS state
    this.state = {
      initialized: false,
      theme: 'dark',
      language: 'en',
      voiceEnabled: false,
      notifications: [],
      systemInfo: {
        version: '1.0.0',
        name: 'Amrikyy AI OS',
        platform: 'web',
        aiModel: 'gemini-2.0-flash-exp'
      }
    };
    
    // Context and memory
    this.context = {
      currentUser: null,
      sessionStart: new Date(),
      interactionHistory: [],
      preferences: {}
    };
    
    // Performance metrics
    this.metrics = {
      windowsOpened: 0,
      windowsClosed: 0,
      appsLaunched: 0,
      aiInteractions: 0,
      averageResponseTime: 0
    };
    
    this.initializeGemini();
    this.registerBuiltInApps();
  }

  /**
   * Initialize Gemini Pro AI
   * @private
   */
  async initializeGemini() {
    try {
      if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_AI_API_KEY) {
        logger.warn('⚠️ Gemini API key not found - AI features will be limited');
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
      this.genAI = new GoogleGenerativeAI(apiKey);
      
      this.model = this.genAI.getGenerativeModel({ 
        model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      });

      this.state.initialized = true;
      logger.info('🚀 AI Operating System initialized with Gemini Pro');
      this.emit('initialized', { 
        model: this.state.systemInfo.aiModel,
        timestamp: new Date()
      });

    } catch (error) {
      logger.error('Failed to initialize AI OS:', error);
      this.emit('error', { type: 'initialization', error });
    }
  }

  /**
   * Register built-in applications
   * @private
   */
  registerBuiltInApps() {
    const builtInApps = [
      {
        id: 'maya-travel',
        name: 'Maya Travel Assistant',
        icon: '✈️',
        type: 'travel',
        description: 'AI-powered travel planning and booking',
        component: 'MayaTravelApp',
        permissions: ['ai', 'booking', 'maps']
      },
      {
        id: 'trip-planner',
        name: 'Trip Planner',
        icon: '🗺️',
        type: 'travel',
        description: 'Multi-destination trip planning',
        component: 'TripPlannerApp',
        permissions: ['maps', 'booking']
      },
      {
        id: 'file-manager',
        name: 'File Manager',
        icon: '📁',
        type: 'system',
        description: 'Manage your files and folders',
        component: 'FileManagerApp',
        permissions: ['filesystem']
      },
      {
        id: 'terminal',
        name: 'Terminal',
        icon: '⌨️',
        type: 'system',
        description: 'AI-powered command terminal',
        component: 'TerminalApp',
        permissions: ['terminal', 'ai']
      },
      {
        id: 'knowledge-graph',
        name: 'Knowledge Graph',
        icon: '🧠',
        type: 'ai',
        description: '3D visualization of AI knowledge',
        component: 'KnowledgeGraphApp',
        permissions: ['ai', '3d']
      },
      {
        id: 'settings',
        name: 'Settings',
        icon: '⚙️',
        type: 'system',
        description: 'System settings and preferences',
        component: 'SettingsApp',
        permissions: ['system']
      }
    ];

    builtInApps.forEach(app => this.registerApplication(app));
    logger.info(`✅ Registered ${builtInApps.length} built-in applications`);
  }

  /**
   * Register a new application
   * @param {Object} appConfig - Application configuration
   * @returns {Object} Registered application
   */
  registerApplication(appConfig) {
    const app = {
      id: appConfig.id,
      name: appConfig.name,
      icon: appConfig.icon || '📱',
      type: appConfig.type || 'custom',
      description: appConfig.description || '',
      component: appConfig.component,
      permissions: appConfig.permissions || [],
      version: appConfig.version || '1.0.0',
      registeredAt: new Date()
    };

    this.applications.set(app.id, app);
    this.emit('app:registered', app);
    
    logger.info(`📱 Application registered: ${app.name}`);
    return app;
  }

  /**
   * Get application by ID
   * @param {string} appId - Application ID
   * @returns {Object|null} Application or null
   */
  getApplication(appId) {
    return this.applications.get(appId);
  }

  /**
   * Get all registered applications
   * @returns {Array} List of applications
   */
  getAllApplications() {
    return Array.from(this.applications.values());
  }

  /**
   * Launch an application
   * @param {string} appId - Application ID
   * @param {Object} options - Launch options
   * @returns {Object} Launched application window
   */
  async launchApplication(appId, options = {}) {
    try {
      const app = this.getApplication(appId);
      if (!app) {
        throw new Error(`Application not found: ${appId}`);
      }

      // Create window for the application
      const window = this.openWindow({
        title: app.name,
        appId: app.id,
        icon: app.icon,
        width: options.width || 800,
        height: options.height || 600,
        x: options.x || 100,
        y: options.y || 100,
        resizable: options.resizable !== false,
        minimizable: options.minimizable !== false,
        maximizable: options.maximizable !== false
      });

      this.runningApps.add(appId);
      this.metrics.appsLaunched++;

      logger.info(`🚀 Application launched: ${app.name} (Window ID: ${window.id})`);
      this.emit('app:launched', { app, window });

      return {
        success: true,
        app,
        window
      };

    } catch (error) {
      logger.error(`Failed to launch application ${appId}:`, error);
      this.emit('error', { type: 'app:launch', appId, error });
      throw error;
    }
  }

  /**
   * Open a new window
   * @param {Object} config - Window configuration
   * @returns {Object} Created window
   */
  openWindow(config) {
    const windowId = `window-${++this.windowIdCounter}`;
    
    const window = {
      id: windowId,
      title: config.title || 'Untitled Window',
      appId: config.appId || null,
      icon: config.icon || '📱',
      state: 'normal', // normal, minimized, maximized
      position: {
        x: config.x || 100 + (this.windows.size * 30),
        y: config.y || 100 + (this.windows.size * 30)
      },
      size: {
        width: config.width || 800,
        height: config.height || 600
      },
      zIndex: ++this.zIndexCounter,
      resizable: config.resizable !== false,
      minimizable: config.minimizable !== false,
      maximizable: config.maximizable !== false,
      focused: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.windows.set(windowId, window);
    this.focusWindow(windowId);
    this.metrics.windowsOpened++;

    logger.info(`🪟 Window opened: ${window.title} (${windowId})`);
    this.emit('window:opened', window);

    return window;
  }

  /**
   * Close a window
   * @param {string} windowId - Window ID
   * @returns {boolean} Success status
   */
  closeWindow(windowId) {
    try {
      const window = this.windows.get(windowId);
      if (!window) {
        throw new Error(`Window not found: ${windowId}`);
      }

      // Remove from running apps if it was the last window
      if (window.appId) {
        const appWindows = Array.from(this.windows.values())
          .filter(w => w.appId === window.appId);
        
        if (appWindows.length === 1) {
          this.runningApps.delete(window.appId);
          this.emit('app:closed', { appId: window.appId });
        }
      }

      this.windows.delete(windowId);
      this.metrics.windowsClosed++;

      // Focus another window if this was focused
      if (this.focusedWindowId === windowId) {
        const windows = Array.from(this.windows.values());
        if (windows.length > 0) {
          const lastWindow = windows[windows.length - 1];
          this.focusWindow(lastWindow.id);
        } else {
          this.focusedWindowId = null;
        }
      }

      logger.info(`🗑️ Window closed: ${window.title} (${windowId})`);
      this.emit('window:closed', { windowId, window });

      return true;

    } catch (error) {
      logger.error(`Failed to close window ${windowId}:`, error);
      this.emit('error', { type: 'window:close', windowId, error });
      return false;
    }
  }

  /**
   * Focus a window
   * @param {string} windowId - Window ID
   * @returns {Object} Focused window
   */
  focusWindow(windowId) {
    const window = this.windows.get(windowId);
    if (!window) {
      throw new Error(`Window not found: ${windowId}`);
    }

    // Unfocus all windows
    this.windows.forEach(w => {
      w.focused = false;
    });

    // Focus the target window and bring to front
    window.focused = true;
    window.zIndex = ++this.zIndexCounter;
    window.updatedAt = new Date();
    
    this.focusedWindowId = windowId;

    logger.debug(`🎯 Window focused: ${window.title} (${windowId})`);
    this.emit('window:focused', window);

    return window;
  }

  /**
   * Minimize a window
   * @param {string} windowId - Window ID
   * @returns {Object} Minimized window
   */
  minimizeWindow(windowId) {
    const window = this.windows.get(windowId);
    if (!window) {
      throw new Error(`Window not found: ${windowId}`);
    }

    window.state = 'minimized';
    window.updatedAt = new Date();

    logger.debug(`📉 Window minimized: ${window.title} (${windowId})`);
    this.emit('window:minimized', window);

    return window;
  }

  /**
   * Maximize a window
   * @param {string} windowId - Window ID
   * @returns {Object} Maximized window
   */
  maximizeWindow(windowId) {
    const window = this.windows.get(windowId);
    if (!window) {
      throw new Error(`Window not found: ${windowId}`);
    }

    window.state = 'maximized';
    window.updatedAt = new Date();

    logger.debug(`📈 Window maximized: ${window.title} (${windowId})`);
    this.emit('window:maximized', window);

    return window;
  }

  /**
   * Restore a window to normal state
   * @param {string} windowId - Window ID
   * @returns {Object} Restored window
   */
  restoreWindow(windowId) {
    const window = this.windows.get(windowId);
    if (!window) {
      throw new Error(`Window not found: ${windowId}`);
    }

    window.state = 'normal';
    window.updatedAt = new Date();

    logger.debug(`🔄 Window restored: ${window.title} (${windowId})`);
    this.emit('window:restored', window);

    return window;
  }

  /**
   * Update window position
   * @param {string} windowId - Window ID
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {Object} Updated window
   */
  updateWindowPosition(windowId, x, y) {
    const window = this.windows.get(windowId);
    if (!window) {
      throw new Error(`Window not found: ${windowId}`);
    }

    window.position = { x, y };
    window.updatedAt = new Date();

    this.emit('window:moved', window);
    return window;
  }

  /**
   * Update window size
   * @param {string} windowId - Window ID
   * @param {number} width - Width
   * @param {number} height - Height
   * @returns {Object} Updated window
   */
  updateWindowSize(windowId, width, height) {
    const window = this.windows.get(windowId);
    if (!window) {
      throw new Error(`Window not found: ${windowId}`);
    }

    if (!window.resizable) {
      throw new Error('Window is not resizable');
    }

    window.size = { width, height };
    window.updatedAt = new Date();

    this.emit('window:resized', window);
    return window;
  }

  /**
   * Get a window by ID
   * @param {string} windowId - Window ID
   * @returns {Object|null} Window or null
   */
  getWindow(windowId) {
    return this.windows.get(windowId);
  }

  /**
   * Get all windows
   * @returns {Array} List of windows
   */
  getAllWindows() {
    return Array.from(this.windows.values());
  }

  /**
   * Get windows by application ID
   * @param {string} appId - Application ID
   * @returns {Array} List of windows
   */
  getWindowsByApp(appId) {
    return Array.from(this.windows.values())
      .filter(window => window.appId === appId);
  }

  /**
   * AI-powered natural language command processing
   * @param {string} command - Natural language command
   * @param {Object} context - Additional context
   * @returns {Object} Command result
   */
  async processNaturalLanguageCommand(command, context = {}) {
    try {
      if (!this.model) {
        throw new Error('AI model not initialized');
      }

      const startTime = Date.now();
      this.metrics.aiInteractions++;

      const prompt = `
# AI Operating System - Natural Language Command Processor

## System State:
- Open Windows: ${this.windows.size}
- Running Apps: ${Array.from(this.runningApps).join(', ') || 'None'}
- Available Apps: ${Array.from(this.applications.keys()).join(', ')}

## User Command:
"${command}"

## Context:
${JSON.stringify(context, null, 2)}

## Your Task:
Analyze the user's command and determine the appropriate OS action. Respond in JSON format:

{
  "intent": "launch_app|open_window|close_window|focus_window|minimize_window|maximize_window|system_info|help|unknown",
  "action": {
    "type": "the action type",
    "target": "target app/window ID",
    "parameters": {}
  },
  "response": "Natural language response to the user",
  "confidence": 0.0-1.0
}

Examples:
- "open maya" → intent: "launch_app", target: "maya-travel"
- "close the trip planner" → intent: "close_window", target: window with trip planner
- "minimize all windows" → intent: "minimize_window", target: "all"
- "what's running?" → intent: "system_info"
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const parsedResponse = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        intent: 'unknown',
        response: 'I couldn\'t understand that command.',
        confidence: 0.3
      };

      const duration = Date.now() - startTime;
      this.updateAverageResponseTime(duration);

      logger.info(`🤖 AI Command processed: "${command}" → ${parsedResponse.intent}`);
      this.emit('ai:command', { command, result: parsedResponse, duration });

      return {
        success: true,
        ...parsedResponse,
        processingTime: duration
      };

    } catch (error) {
      logger.error('Failed to process natural language command:', error);
      this.emit('error', { type: 'ai:command', command, error });
      
      return {
        success: false,
        intent: 'error',
        response: 'Sorry, I encountered an error processing your command.',
        error: error.message
      };
    }
  }

  /**
   * Update average response time metric
   * @private
   */
  updateAverageResponseTime(newTime) {
    const count = this.metrics.aiInteractions;
    const currentAvg = this.metrics.averageResponseTime;
    this.metrics.averageResponseTime = 
      (currentAvg * (count - 1) + newTime) / count;
  }

  /**
   * Get OS state
   * @returns {Object} OS state
   */
  getState() {
    return {
      ...this.state,
      windows: this.getAllWindows(),
      applications: this.getAllApplications(),
      runningApps: Array.from(this.runningApps),
      focusedWindowId: this.focusedWindowId,
      metrics: this.metrics
    };
  }

  /**
   * Update OS state
   * @param {Object} updates - State updates
   * @returns {Object} Updated state
   */
  updateState(updates) {
    this.state = {
      ...this.state,
      ...updates
    };

    this.emit('state:updated', this.state);
    logger.debug('📊 OS state updated:', Object.keys(updates));

    return this.state;
  }

  /**
   * Save OS state to storage
   * @returns {Object} Saved state
   */
  async saveState() {
    try {
      const state = this.getState();
      
      // In a real implementation, this would save to database/storage
      // For now, we'll just emit an event
      this.emit('state:saved', state);
      
      logger.info('💾 OS state saved');
      return {
        success: true,
        timestamp: new Date()
      };
      
    } catch (error) {
      logger.error('Failed to save OS state:', error);
      this.emit('error', { type: 'state:save', error });
      throw error;
    }
  }

  /**
   * Load OS state from storage
   * @returns {Object} Loaded state
   */
  async loadState() {
    try {
      // In a real implementation, this would load from database/storage
      // For now, we'll just emit an event
      this.emit('state:loaded', this.state);
      
      logger.info('📂 OS state loaded');
      return {
        success: true,
        state: this.state
      };
      
    } catch (error) {
      logger.error('Failed to load OS state:', error);
      this.emit('error', { type: 'state:load', error });
      throw error;
    }
  }

  /**
   * Get system metrics
   * @returns {Object} System metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      windows: {
        total: this.windows.size,
        opened: this.metrics.windowsOpened,
        closed: this.metrics.windowsClosed,
        active: this.windows.size
      },
      applications: {
        registered: this.applications.size,
        running: this.runningApps.size,
        launched: this.metrics.appsLaunched
      },
      ai: {
        interactions: this.metrics.aiInteractions,
        averageResponseTime: Math.round(this.metrics.averageResponseTime)
      },
      uptime: Date.now() - this.context.sessionStart.getTime()
    };
  }

  /**
   * Shutdown the OS
   * @returns {Object} Shutdown result
   */
  async shutdown() {
    try {
      logger.info('🔌 Shutting down AI Operating System...');

      // Save state before shutdown
      await this.saveState();

      // Close all windows
      const windowIds = Array.from(this.windows.keys());
      windowIds.forEach(id => this.closeWindow(id));

      // Clear running apps
      this.runningApps.clear();

      this.emit('shutdown', { timestamp: new Date() });
      logger.info('✅ AI Operating System shut down successfully');

      return {
        success: true,
        message: 'OS shutdown complete'
      };

    } catch (error) {
      logger.error('Failed to shutdown OS:', error);
      this.emit('error', { type: 'shutdown', error });
      throw error;
    }
  }
}

// Create singleton instance
const aiOS = new AIOperatingSystem();

module.exports = aiOS;
module.exports.AIOperatingSystem = AIOperatingSystem;
