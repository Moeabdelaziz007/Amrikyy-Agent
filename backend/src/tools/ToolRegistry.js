/**
 * ToolRegistry - Central registry for managing AIX agent tools
 * Automatically discovers, loads, and manages tool instances
 * 
 * @author Amrikyy AI Solutions
 * @version 1.0.0
 */

const fs = require('fs').promises;
const path = require('path');
class ToolRegistry {
    constructor() {
        this.tools = new Map();
        this.toolDirectory = path.join(__dirname);
        
        // Initialize simple logger
        this.logger = {
            info: (message, meta = {}) => {
                console.log(`[ToolRegistry] INFO:`, message, meta);
            },
            error: (message, meta = {}) => {
                console.error(`[ToolRegistry] ERROR:`, message, meta);
            },
            warn: (message, meta = {}) => {
                console.warn(`[ToolRegistry] WARN:`, message, meta);
            }
        };
    }

    /**
     * Initialize the tool registry by loading all tools
     */
    async initialize() {
        this.logger.info('Initializing ToolRegistry...');
        
        try {
            await this.discoverTools();
            await this.loadTools();
            
            this.logger.info('ToolRegistry initialized successfully', {
                toolCount: this.tools.size,
                tools: Array.from(this.tools.keys())
            });
        } catch (error) {
            this.logger.error('Failed to initialize ToolRegistry', { error: error.message });
            throw error;
        }
    }

    /**
     * Discover all tool files in the tools directory
     */
    async discoverTools() {
        try {
            const files = await fs.readdir(this.toolDirectory);
            const toolFiles = files.filter(file => 
                file.endsWith('.js') && 
                file !== 'BaseTool.js' && 
                file !== 'ToolRegistry.js' &&
                file !== 'index.js'
            );
            
            this.logger.info('Discovered tool files', { 
                count: toolFiles.length,
                files: toolFiles 
            });
            
            return toolFiles;
        } catch (error) {
            this.logger.error('Failed to discover tools', { error: error.message });
            throw error;
        }
    }

    /**
     * Load all discovered tools
     */
    async loadTools() {
        const toolFiles = await this.discoverTools();
        
        for (const file of toolFiles) {
            try {
                await this.loadTool(file);
            } catch (error) {
                this.logger.error('Failed to load tool', { 
                    file, 
                    error: error.message 
                });
            }
        }
    }

    /**
     * Load a single tool from file
     * @param {string} filename - Tool file name
     */
    async loadTool(filename) {
        try {
            const toolPath = path.join(this.toolDirectory, filename);
            const toolModule = require(toolPath);
            
            // Check if the module exports a tool instance
            if (!toolModule || typeof toolModule.execute !== 'function') {
                throw new Error('Tool module does not export a valid tool instance');
            }
            
            // Get tool metadata
            const metadata = toolModule.getMetadata();
            if (!metadata.name) {
                throw new Error('Tool does not have a valid name');
            }
            
            // Register the tool
            this.tools.set(metadata.name, {
                instance: toolModule,
                metadata: metadata,
                loadedAt: new Date().toISOString()
            });
            
            this.logger.info('Tool loaded successfully', { 
                name: metadata.name,
                file: filename 
            });
        } catch (error) {
            this.logger.error('Failed to load tool', { 
                file: filename, 
                error: error.message 
            });
            throw error;
        }
    }

    /**
     * Get a tool by name
     * @param {string} toolName - Name of the tool
     * @returns {Object|null} Tool instance or null if not found
     */
    getTool(toolName) {
        const tool = this.tools.get(toolName);
        return tool ? tool.instance : null;
    }

    /**
     * Get tool metadata by name
     * @param {string} toolName - Name of the tool
     * @returns {Object|null} Tool metadata or null if not found
     */
    getToolMetadata(toolName) {
        const tool = this.tools.get(toolName);
        return tool ? tool.metadata : null;
    }

    /**
     * Execute a tool with given arguments
     * @param {string} toolName - Name of the tool
     * @param {Object} args - Tool arguments
     * @returns {Promise<Object>} Tool execution result
     */
    async executeTool(toolName, args) {
        const tool = this.getTool(toolName);
        
        if (!tool) {
            return {
                success: false,
                error: `Tool '${toolName}' not found`,
                availableTools: Array.from(this.tools.keys())
            };
        }
        
        try {
            this.logger.info('Executing tool', { toolName, args });
            const result = await tool.execute(args);
            
            this.logger.info('Tool execution completed', { 
                toolName, 
                success: result.success 
            });
            
            return result;
        } catch (error) {
            this.logger.error('Tool execution failed', { 
                toolName, 
                error: error.message 
            });
            
            return {
                success: false,
                error: error.message,
                tool: toolName
            };
        }
    }

    /**
     * Get all registered tools
     * @returns {Array} Array of tool names
     */
    getAllTools() {
        return Array.from(this.tools.keys());
    }

    /**
     * Get all tool metadata
     * @returns {Array} Array of tool metadata objects
     */
    getAllToolMetadata() {
        return Array.from(this.tools.values()).map(tool => tool.metadata);
    }

    /**
     * Test all tools
     * @returns {Promise<Array>} Array of test results
     */
    async testAllTools() {
        const results = [];
        
        for (const [toolName, tool] of this.tools) {
            try {
                this.logger.info('Testing tool', { toolName });
                const testResult = await tool.instance.test();
                results.push({
                    tool: toolName,
                    ...testResult
                });
            } catch (error) {
                results.push({
                    tool: toolName,
                    success: false,
                    error: error.message
                });
            }
        }
        
        return results;
    }

    /**
     * Get registry statistics
     * @returns {Object} Registry statistics
     */
    getStats() {
        return {
            totalTools: this.tools.size,
            tools: Array.from(this.tools.keys()),
            loadedAt: new Date().toISOString()
        };
    }

    /**
     * Reload all tools
     */
    async reload() {
        this.logger.info('Reloading all tools...');
        this.tools.clear();
        await this.loadTools();
        this.logger.info('Tools reloaded successfully');
    }
}

module.exports = ToolRegistry;

 * Automatically discovers, loads, and manages tool instances
 * 
 * @author Amrikyy AI Solutions
 * @version 1.0.0
 */

const fs = require('fs').promises;
const path = require('path');
class ToolRegistry {
    constructor() {
        this.tools = new Map();
        this.toolDirectory = path.join(__dirname);
        
        // Initialize simple logger
        this.logger = {
            info: (message, meta = {}) => {
                console.log(`[ToolRegistry] INFO:`, message, meta);
            },
            error: (message, meta = {}) => {
                console.error(`[ToolRegistry] ERROR:`, message, meta);
            },
            warn: (message, meta = {}) => {
                console.warn(`[ToolRegistry] WARN:`, message, meta);
            }
        };
    }

    /**
     * Initialize the tool registry by loading all tools
     */
    async initialize() {
        this.logger.info('Initializing ToolRegistry...');
        
        try {
            await this.discoverTools();
            await this.loadTools();
            
            this.logger.info('ToolRegistry initialized successfully', {
                toolCount: this.tools.size,
                tools: Array.from(this.tools.keys())
            });
        } catch (error) {
            this.logger.error('Failed to initialize ToolRegistry', { error: error.message });
            throw error;
        }
    }

    /**
     * Discover all tool files in the tools directory
     */
    async discoverTools() {
        try {
            const files = await fs.readdir(this.toolDirectory);
            const toolFiles = files.filter(file => 
                file.endsWith('.js') && 
                file !== 'BaseTool.js' && 
                file !== 'ToolRegistry.js' &&
                file !== 'index.js'
            );
            
            this.logger.info('Discovered tool files', { 
                count: toolFiles.length,
                files: toolFiles 
            });
            
            return toolFiles;
        } catch (error) {
            this.logger.error('Failed to discover tools', { error: error.message });
            throw error;
        }
    }

    /**
     * Load all discovered tools
     */
    async loadTools() {
        const toolFiles = await this.discoverTools();
        
        for (const file of toolFiles) {
            try {
                await this.loadTool(file);
            } catch (error) {
                this.logger.error('Failed to load tool', { 
                    file, 
                    error: error.message 
                });
            }
        }
    }

    /**
     * Load a single tool from file
     * @param {string} filename - Tool file name
     */
    async loadTool(filename) {
        try {
            const toolPath = path.join(this.toolDirectory, filename);
            const toolModule = require(toolPath);
            
            // Check if the module exports a tool instance
            if (!toolModule || typeof toolModule.execute !== 'function') {
                throw new Error('Tool module does not export a valid tool instance');
            }
            
            // Get tool metadata
            const metadata = toolModule.getMetadata();
            if (!metadata.name) {
                throw new Error('Tool does not have a valid name');
            }
            
            // Register the tool
            this.tools.set(metadata.name, {
                instance: toolModule,
                metadata: metadata,
                loadedAt: new Date().toISOString()
            });
            
            this.logger.info('Tool loaded successfully', { 
                name: metadata.name,
                file: filename 
            });
        } catch (error) {
            this.logger.error('Failed to load tool', { 
                file: filename, 
                error: error.message 
            });
            throw error;
        }
    }

    /**
     * Get a tool by name
     * @param {string} toolName - Name of the tool
     * @returns {Object|null} Tool instance or null if not found
     */
    getTool(toolName) {
        const tool = this.tools.get(toolName);
        return tool ? tool.instance : null;
    }

    /**
     * Get tool metadata by name
     * @param {string} toolName - Name of the tool
     * @returns {Object|null} Tool metadata or null if not found
     */
    getToolMetadata(toolName) {
        const tool = this.tools.get(toolName);
        return tool ? tool.metadata : null;
    }

    /**
     * Execute a tool with given arguments
     * @param {string} toolName - Name of the tool
     * @param {Object} args - Tool arguments
     * @returns {Promise<Object>} Tool execution result
     */
    async executeTool(toolName, args) {
        const tool = this.getTool(toolName);
        
        if (!tool) {
            return {
                success: false,
                error: `Tool '${toolName}' not found`,
                availableTools: Array.from(this.tools.keys())
            };
        }
        
        try {
            this.logger.info('Executing tool', { toolName, args });
            const result = await tool.execute(args);
            
            this.logger.info('Tool execution completed', { 
                toolName, 
                success: result.success 
            });
            
            return result;
        } catch (error) {
            this.logger.error('Tool execution failed', { 
                toolName, 
                error: error.message 
            });
            
            return {
                success: false,
                error: error.message,
                tool: toolName
            };
        }
    }

    /**
     * Get all registered tools
     * @returns {Array} Array of tool names
     */
    getAllTools() {
        return Array.from(this.tools.keys());
    }

    /**
     * Get all tool metadata
     * @returns {Array} Array of tool metadata objects
     */
    getAllToolMetadata() {
        return Array.from(this.tools.values()).map(tool => tool.metadata);
    }

    /**
     * Test all tools
     * @returns {Promise<Array>} Array of test results
     */
    async testAllTools() {
        const results = [];
        
        for (const [toolName, tool] of this.tools) {
            try {
                this.logger.info('Testing tool', { toolName });
                const testResult = await tool.instance.test();
                results.push({
                    tool: toolName,
                    ...testResult
                });
            } catch (error) {
                results.push({
                    tool: toolName,
                    success: false,
                    error: error.message
                });
            }
        }
        
        return results;
    }

    /**
     * Get registry statistics
     * @returns {Object} Registry statistics
     */
    getStats() {
        return {
            totalTools: this.tools.size,
            tools: Array.from(this.tools.keys()),
            loadedAt: new Date().toISOString()
        };
    }

    /**
     * Reload all tools
     */
    async reload() {
        this.logger.info('Reloading all tools...');
        this.tools.clear();
        await this.loadTools();
        this.logger.info('Tools reloaded successfully');
    }
}

module.exports = ToolRegistry;
