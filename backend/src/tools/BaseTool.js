/**
 * @class BaseTool
 * @description A shared base class for all tools in the Amrikyy system.
 * It ensures a consistent interface for the ToolRegistry and AgentRuntime.
 * Enhanced with LangSmith tracing capabilities.
 */

// Import with fallback
let createTraceableWrapper;
try {
  const helpers = require('../utils/langsmith_helpers');
  createTraceableWrapper = helpers.createTraceableWrapper || ((fn, options) => fn);
} catch (error) {
  console.warn('⚠️ LangSmith helpers not available, using fallback');
  createTraceableWrapper = (fn, options) => fn;
}

class BaseTool {
  constructor(name, description, parameters) {
    if (new.target === BaseTool) {
      throw new TypeError('Cannot construct BaseTool instances directly');
    }
    this.name = name;
    this.description = description;
    this.parameters = parameters;
    this.isTraced = false;
  }

  /**
   * The main execution logic for the tool. This must be implemented by subclasses.
   * @param {object} args - The arguments for the tool, matching the parameters schema.
   * @returns {Promise<object>} A promise that resolves to a standardized response object.
   */
  async execute(args) {
    throw new Error(`Tool "${this.name}" has not implemented the execute method.`);
  }

  /**
   * Apply LangSmith tracing to this tool
   * @param {object} options - Tracing options
   * @returns {BaseTool} - The traced tool instance
   */
  applyTracing(options = {}) {
    if (this.isTraced) {
      return this;
    }

    const { name = this.name, tags = ['tool', 'basetool'], metadata = {} } = options;

    // Create traced version of execute method
    const originalExecute = this.execute.bind(this);
    this.execute = createTraceableWrapper(originalExecute, {
      name: `${name}_tool`,
      tags: [...tags, this.name],
      metadata: {
        ...metadata,
        toolName: this.name,
        toolType: 'basetool',
      },
    });

    this.isTraced = true;
    return this;
  }

  /**
   * Get tool information
   * @returns {object} - Tool metadata
   */
  getInfo() {
    return {
      name: this.name,
      description: this.description,
      parameters: this.parameters,
      isTraced: this.isTraced,
    };
  }

  /**
   * Validate arguments against parameters schema
   * @param {object} args - Arguments to validate
   * @returns {boolean} - Whether arguments are valid
   */
  validateArgs(args) {
    if (!this.parameters || !this.parameters.required) {
      return true;
    }

    for (const requiredParam of this.parameters.required) {
      if (!(requiredParam in args)) {
        throw new Error(`Missing required parameter: ${requiredParam}`);
      }
    }

    return true;
  }
}

module.exports = BaseTool;
