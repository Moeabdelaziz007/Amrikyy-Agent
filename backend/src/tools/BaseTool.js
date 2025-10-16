/**
 * BaseTool - Abstract base class for all AIX agent tools
 * Provides common functionality and interface for tool implementation
 * 
 * @author Amrikyy AI Solutions
 * @version 1.0.0
 */

class BaseTool {
    constructor() {
        this.name = 'base_tool';
        this.description = 'Base tool class - should not be used directly';
        this.parameters = {
            type: 'object',
            properties: {},
            required: []
        };
        
        // Initialize simple logger for this tool
        this.logger = {
            info: (message, meta = {}) => {
                console.log(`[${this.name}] INFO:`, message, meta);
            },
            error: (message, meta = {}) => {
                console.error(`[${this.name}] ERROR:`, message, meta);
            },
            warn: (message, meta = {}) => {
                console.warn(`[${this.name}] WARN:`, message, meta);
            }
        };
    }

    /**
     * Validate input parameters against the tool's schema
     * @param {Object} args - Input arguments
     * @returns {Object} Validation result
     */
    validateParameters(args) {
        try {
            const { properties, required } = this.parameters;
            
            // Check required parameters
            for (const param of required) {
                if (!(param in args)) {
                    return {
                        valid: false,
                        error: `Missing required parameter: ${param}`
                    };
                }
            }
            
            // Check parameter types
            for (const [param, value] of Object.entries(args)) {
                if (param in properties) {
                    const expectedType = properties[param].type;
                    const actualType = typeof value;
                    
                    if (expectedType === 'array' && !Array.isArray(value)) {
                        return {
                            valid: false,
                            error: `Parameter ${param} must be an array`
                        };
                    }
                    
                    if (expectedType !== 'array' && actualType !== expectedType) {
                        return {
                            valid: false,
                            error: `Parameter ${param} must be of type ${expectedType}, got ${actualType}`
                        };
                    }
                }
            }
            
            return { valid: true };
        } catch (error) {
            return {
                valid: false,
                error: `Validation error: ${error.message}`
            };
        }
    }

    /**
     * Execute the tool with given arguments
     * This method should be overridden by each tool implementation
     * @param {Object} args - Tool arguments
     * @returns {Promise<Object>} Tool execution result
     */
    async execute(args) {
        this.logger.info('Executing tool', { args });
        
        // Validate parameters
        const validation = this.validateParameters(args);
        if (!validation.valid) {
            this.logger.error('Parameter validation failed', { error: validation.error });
            return {
                success: false,
                error: validation.error,
                tool: this.name
            };
        }
        
        try {
            // This should be implemented by each tool
            const result = await this.performExecution(args);
            
            this.logger.info('Tool execution successful', { 
                resultSize: JSON.stringify(result).length 
            });
            
            return {
                success: true,
                data: result,
                tool: this.name,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            this.logger.error('Tool execution failed', { 
                error: error.message,
                stack: error.stack 
            });
            
            return {
                success: false,
                error: error.message,
                tool: this.name,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Abstract method to be implemented by each tool
     * Contains the actual tool logic
     * @param {Object} args - Validated arguments
     * @returns {Promise<Object>} Tool result
     */
    async performExecution(args) {
        throw new Error('performExecution method must be implemented by tool subclass');
    }

    /**
     * Get tool metadata for registration
     * @returns {Object} Tool metadata
     */
    getMetadata() {
        return {
            name: this.name,
            description: this.description,
            parameters: this.parameters
        };
    }

    /**
     * Test tool functionality
     * @returns {Promise<Object>} Test result
     */
    async test() {
        this.logger.info('Testing tool functionality');
        
        try {
            // Create test arguments based on required parameters
            const testArgs = {};
            for (const param of this.parameters.required) {
                const paramDef = this.parameters.properties[param];
                if (paramDef.type === 'string') {
                    testArgs[param] = 'test_value';
                } else if (paramDef.type === 'number') {
                    testArgs[param] = 1;
                } else if (paramDef.type === 'boolean') {
                    testArgs[param] = true;
                } else if (paramDef.type === 'array') {
                    testArgs[param] = ['test_item'];
                }
            }
            
            const result = await this.execute(testArgs);
            return {
                success: result.success,
                message: result.success ? 'Tool test passed' : 'Tool test failed',
                details: result
            };
        } catch (error) {
            return {
                success: false,
                message: 'Tool test failed',
                error: error.message
            };
        }
    }
}

module.exports = BaseTool;
