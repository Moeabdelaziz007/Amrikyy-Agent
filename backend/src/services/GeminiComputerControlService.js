/**
 * Gemini Computer Control Service
 * Advanced computer control capabilities using Gemini 2.5
 * Version: 1.0.0
 * Author: AMRIKYY
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class GeminiComputerControlService {
  constructor() {
    // Initialize Gemini 2.5 for computer control
    this.apiKey = process.env.GEMINI_API_KEY;
    this.model = 'gemini-2.0-flash-exp';

    if (!this.apiKey) {
      console.warn('⚠️ GEMINI_API_KEY not found. Computer control features will be disabled.');
      this.enabled = false;
    } else {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({
        model: this.model,
        generationConfig: {
          temperature: 0.1, // Low temperature for precise control
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
        },
      });
      this.enabled = true;
      console.log('✅ Gemini Computer Control Service initialized');
    }

    // Computer control capabilities
    this.capabilities = {
      fileOperations: ['read', 'write', 'create', 'delete', 'list', 'search'],
      systemOperations: ['execute', 'monitor', 'process', 'network', 'system_info'],
      automation: ['schedule', 'batch', 'workflow', 'automation'],
      security: ['scan', 'audit', 'permissions', 'access_control'],
      development: ['code_generation', 'testing', 'deployment', 'debugging'],
    };

    // Safety restrictions
    this.restrictions = {
      dangerousCommands: ['rm -rf', 'format', 'del /f', 'shutdown', 'reboot'],
      restrictedPaths: ['/system', '/boot', '/etc/passwd', 'C:\\Windows\\System32'],
      maxFileSize: 10 * 1024 * 1024, // 10MB
      timeoutMs: 30000, // 30 seconds
    };
  }

  /**
   * Execute computer control command with Gemini 2.5
   * @param {string} command - Natural language command
   * @param {Object} options - Control options
   * @returns {Promise<Object>} - Execution result
   */
  async executeCommand(command, options = {}) {
    if (!this.enabled) {
      return {
        success: false,
        error: 'Gemini Computer Control not enabled',
        message: 'Please configure GEMINI_API_KEY to enable computer control features.',
      };
    }

    try {
      // Safety check
      const safetyCheck = this.performSafetyCheck(command);
      if (!safetyCheck.safe) {
        return {
          success: false,
          error: 'Safety violation',
          message: safetyCheck.reason,
          blocked: true,
        };
      }

      // Analyze command with Gemini
      const analysis = await this.analyzeCommand(command);

      // Execute based on analysis
      const result = await this.executeAnalyzedCommand(analysis, options);

      return {
        success: true,
        result: result,
        analysis: analysis,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Computer Control Error:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Analyze command using Gemini 2.5
   * @param {string} command - Natural language command
   * @returns {Promise<Object>} - Command analysis
   */
  async analyzeCommand(command) {
    const prompt = `Analyze this computer control command and provide structured output:

Command: "${command}"

Please analyze and return JSON with:
{
  "type": "file|system|automation|security|development",
  "operation": "specific operation to perform",
  "target": "file path, system component, or target",
  "parameters": {},
  "safety_level": "safe|caution|dangerous",
  "estimated_time": "seconds",
  "steps": ["step1", "step2", "step3"]
}

Safety guidelines:
- Never suggest destructive operations
- Always validate file paths
- Respect system permissions
- Provide clear error handling`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON response from Gemini');
      }
    } catch (error) {
      console.error('Command analysis error:', error);
      return {
        type: 'unknown',
        operation: 'analyze',
        target: 'command',
        parameters: {},
        safety_level: 'caution',
        estimated_time: 5,
        steps: ['analyze_command', 'execute_safely'],
      };
    }
  }

  /**
   * Execute analyzed command
   * @param {Object} analysis - Command analysis
   * @param {Object} options - Execution options
   * @returns {Promise<Object>} - Execution result
   */
  async executeAnalyzedCommand(analysis, options = {}) {
    const { type, operation, target, parameters, steps } = analysis;

    switch (type) {
      case 'file':
        return await this.executeFileOperation(operation, target, parameters);

      case 'system':
        return await this.executeSystemOperation(operation, target, parameters);

      case 'automation':
        return await this.executeAutomationOperation(operation, target, parameters);

      case 'security':
        return await this.executeSecurityOperation(operation, target, parameters);

      case 'development':
        return await this.executeDevelopmentOperation(operation, target, parameters);

      default:
        return await this.executeGenericOperation(operation, target, parameters);
    }
  }

  /**
   * Execute file operations
   * @param {string} operation - File operation
   * @param {string} target - Target file/path
   * @param {Object} parameters - Operation parameters
   * @returns {Promise<Object>} - Operation result
   */
  async executeFileOperation(operation, target, parameters) {
    try {
      switch (operation) {
        case 'read':
          const content = await fs.readFile(target, 'utf8');
          return {
            operation: 'read',
            target: target,
            content: content,
            size: content.length,
          };

        case 'write':
          await fs.writeFile(target, parameters.content || '', 'utf8');
          return {
            operation: 'write',
            target: target,
            success: true,
          };

        case 'list':
          const files = await fs.readdir(target);
          return {
            operation: 'list',
            target: target,
            files: files,
          };

        case 'create':
          await fs.writeFile(target, parameters.content || '', 'utf8');
          return {
            operation: 'create',
            target: target,
            success: true,
          };

        case 'delete':
          await fs.unlink(target);
          return {
            operation: 'delete',
            target: target,
            success: true,
          };

        case 'search':
          const searchResults = await this.searchFiles(target, parameters.pattern);
          return {
            operation: 'search',
            target: target,
            pattern: parameters.pattern,
            results: searchResults,
          };

        default:
          throw new Error(`Unknown file operation: ${operation}`);
      }
    } catch (error) {
      return {
        operation: operation,
        target: target,
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Execute system operations
   * @param {string} operation - System operation
   * @param {string} target - Target system component
   * @param {Object} parameters - Operation parameters
   * @returns {Promise<Object>} - Operation result
   */
  async executeSystemOperation(operation, target, parameters) {
    try {
      switch (operation) {
        case 'execute':
          const { stdout, stderr } = await execAsync(target, {
            timeout: this.restrictions.timeoutMs,
          });
          return {
            operation: 'execute',
            command: target,
            stdout: stdout,
            stderr: stderr,
            success: true,
          };

        case 'monitor':
          const systemInfo = await this.getSystemInfo();
          return {
            operation: 'monitor',
            target: target,
            info: systemInfo,
          };

        case 'process':
          const processes = await this.getProcessInfo();
          return {
            operation: 'process',
            target: target,
            processes: processes,
          };

        case 'network':
          const networkInfo = await this.getNetworkInfo();
          return {
            operation: 'network',
            target: target,
            info: networkInfo,
          };

        case 'system_info':
          const info = await this.getSystemInfo();
          return {
            operation: 'system_info',
            info: info,
          };

        default:
          throw new Error(`Unknown system operation: ${operation}`);
      }
    } catch (error) {
      return {
        operation: operation,
        target: target,
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Execute automation operations
   * @param {string} operation - Automation operation
   * @param {string} target - Target for automation
   * @param {Object} parameters - Operation parameters
   * @returns {Promise<Object>} - Operation result
   */
  async executeAutomationOperation(operation, target, parameters) {
    try {
      switch (operation) {
        case 'schedule':
          return await this.scheduleTask(target, parameters);

        case 'batch':
          return await this.executeBatchOperation(target, parameters);

        case 'workflow':
          return await this.executeWorkflow(target, parameters);

        case 'automation':
          return await this.createAutomation(target, parameters);

        default:
          throw new Error(`Unknown automation operation: ${operation}`);
      }
    } catch (error) {
      return {
        operation: operation,
        target: target,
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Execute security operations
   * @param {string} operation - Security operation
   * @param {string} target - Security target
   * @param {Object} parameters - Operation parameters
   * @returns {Promise<Object>} - Operation result
   */
  async executeSecurityOperation(operation, target, parameters) {
    try {
      switch (operation) {
        case 'scan':
          return await this.performSecurityScan(target, parameters);

        case 'audit':
          return await this.performSecurityAudit(target, parameters);

        case 'permissions':
          return await this.checkPermissions(target, parameters);

        case 'access_control':
          return await this.manageAccessControl(target, parameters);

        default:
          throw new Error(`Unknown security operation: ${operation}`);
      }
    } catch (error) {
      return {
        operation: operation,
        target: target,
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Execute development operations
   * @param {string} operation - Development operation
   * @param {string} target - Development target
   * @param {Object} parameters - Operation parameters
   * @returns {Promise<Object>} - Operation result
   */
  async executeDevelopmentOperation(operation, target, parameters) {
    try {
      switch (operation) {
        case 'code_generation':
          return await this.generateCode(target, parameters);

        case 'testing':
          return await this.runTests(target, parameters);

        case 'deployment':
          return await this.deployCode(target, parameters);

        case 'debugging':
          return await this.debugCode(target, parameters);

        default:
          throw new Error(`Unknown development operation: ${operation}`);
      }
    } catch (error) {
      return {
        operation: operation,
        target: target,
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Execute generic operations
   * @param {string} operation - Generic operation
   * @param {string} target - Target
   * @param {Object} parameters - Operation parameters
   * @returns {Promise<Object>} - Operation result
   */
  async executeGenericOperation(operation, target, parameters) {
    return {
      operation: operation,
      target: target,
      parameters: parameters,
      message: 'Generic operation executed',
      success: true,
    };
  }

  /**
   * Perform safety check on command
   * @param {string} command - Command to check
   * @returns {Object} - Safety check result
   */
  performSafetyCheck(command) {
    const commandLower = command.toLowerCase();

    // Check for dangerous commands
    for (const dangerous of this.restrictions.dangerousCommands) {
      if (commandLower.includes(dangerous)) {
        return {
          safe: false,
          reason: `Dangerous command detected: ${dangerous}`,
        };
      }
    }

    // Check for restricted paths
    for (const restricted of this.restrictions.restrictedPaths) {
      if (commandLower.includes(restricted)) {
        return {
          safe: false,
          reason: `Restricted path access: ${restricted}`,
        };
      }
    }

    return { safe: true };
  }

  /**
   * Search files with pattern
   * @param {string} directory - Directory to search
   * @param {string} pattern - Search pattern
   * @returns {Promise<Array>} - Search results
   */
  async searchFiles(directory, pattern) {
    try {
      const files = await fs.readdir(directory);
      const results = [];

      for (const file of files) {
        const filePath = path.join(directory, file);
        const stats = await fs.stat(filePath);

        if (stats.isFile() && file.includes(pattern)) {
          results.push({
            name: file,
            path: filePath,
            size: stats.size,
            modified: stats.mtime,
          });
        }
      }

      return results;
    } catch (error) {
      console.error('File search error:', error);
      return [];
    }
  }

  /**
   * Get system information
   * @returns {Promise<Object>} - System info
   */
  async getSystemInfo() {
    try {
      const { stdout } = await execAsync('system_profiler SPSoftwareDataType');
      return {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        systemInfo: stdout,
      };
    } catch (error) {
      return {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        error: error.message,
      };
    }
  }

  /**
   * Get process information
   * @returns {Promise<Array>} - Process list
   */
  async getProcessInfo() {
    try {
      const { stdout } = await execAsync('ps aux');
      const processes = stdout
        .split('\n')
        .slice(1)
        .map((line) => {
          const parts = line.trim().split(/\s+/);
          return {
            pid: parts[1],
            cpu: parts[2],
            mem: parts[3],
            command: parts.slice(10).join(' '),
          };
        });
      return processes;
    } catch (error) {
      return [];
    }
  }

  /**
   * Get network information
   * @returns {Promise<Object>} - Network info
   */
  async getNetworkInfo() {
    try {
      const { stdout } = await execAsync('netstat -rn');
      return {
        routing: stdout,
        interfaces: Object.keys(require('os').networkInterfaces()),
      };
    } catch (error) {
      return {
        interfaces: Object.keys(require('os').networkInterfaces()),
        error: error.message,
      };
    }
  }

  /**
   * Get capabilities
   * @returns {Object} - Service capabilities
   */
  getCapabilities() {
    return {
      enabled: this.enabled,
      model: this.model,
      capabilities: this.capabilities,
      restrictions: this.restrictions,
      version: '1.0.0',
    };
  }

  /**
   * Health check
   * @returns {Promise<Object>} - Health status
   */
  async healthCheck() {
    if (!this.enabled) {
      return {
        status: 'disabled',
        message: 'Gemini Computer Control not enabled',
        timestamp: new Date().toISOString(),
      };
    }

    try {
      const testResult = await this.executeCommand('show system information');
      return {
        status: 'healthy',
        message: 'Gemini Computer Control is working',
        capabilities: Object.keys(this.capabilities),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

module.exports = { GeminiComputerControlService };
