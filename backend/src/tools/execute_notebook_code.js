/**
 * Execute Notebook Code Tool
 * Executes Python code in a secure Jupyter notebook environment
 * 
 * @author Maya Travel Agent Team
 * @version 1.0.0
 */

const BaseTool = require('./BaseTool');
const JupyterManagerFixed = require('./jupyter/JupyterManagerFixed');
const JupyterClient = require('./jupyter/JupyterClient');
const path = require('path');
const fs = require('fs').promises;

class ExecuteNotebookCodeTool extends BaseTool {
    constructor() {
        super();
        
        this.name = 'execute_notebook_code';
        this.description = 'Execute Python code in a secure Jupyter notebook environment';
        
        // Initialize managers
        this.jupyterManager = null;
        this.jupyterClient = null;
        
        // Configuration
        this.config = {
            workingDir: path.join(__dirname, '../../data/kody'),
            outputDir: path.join(__dirname, '../../data/kody/outputs'),
            tempDir: path.join(__dirname, '../../data/kody/temp'),
            maxExecutionTime: 300000, // 5 minutes
            maxOutputSize: 10 * 1024 * 1024, // 10MB
            allowedLibraries: [
                'pandas', 'numpy', 'matplotlib', 'seaborn', 'scipy',
                'json', 'csv', 'datetime', 'math', 'statistics',
                'requests', 'openpyxl'
            ]
        };
        
        this.logger.info('ExecuteNotebookCodeTool initialized');
    }
    
    /**
     * Get tool metadata
     */
    getMetadata() {
        return {
            name: this.name,
            description: this.description,
            version: '1.0.0',
            parameters: {
                code: {
                    type: 'string',
                    required: true,
                    description: 'Python code to execute'
                },
                notebook_id: {
                    type: 'string',
                    required: false,
                    description: 'Notebook session ID for continuity'
                },
                libraries: {
                    type: 'array',
                    required: false,
                    description: 'Required Python libraries (pandas, numpy, matplotlib, etc.)'
                },
                timeout: {
                    type: 'integer',
                    required: false,
                    description: 'Execution timeout in seconds',
                    default: 300
                },
                save_outputs: {
                    type: 'boolean',
                    required: false,
                    description: 'Whether to save outputs to files',
                    default: true
                }
            },
            returns: {
                type: 'object',
                description: 'Code execution results with output, errors, and generated files'
            }
        };
    }
    
    /**
     * Execute the tool (override performExecution from BaseTool)
     */
    async performExecution(args) {
        const startTime = Date.now();
        
        try {
            this.logger.info('Executing notebook code', { 
                codeLength: args.code?.length || 0,
                timeout: args.timeout || 300
            });
            
            // Validate input
            this.validateInput(args);
            
            // Initialize Jupyter environment if needed
            await this.ensureJupyterEnvironment();
            
            // Execute the code
            const result = await this.executeCode(args);
            
            // Save outputs if requested
            if (args.save_outputs !== false) {
                await this.saveOutputs(result, args);
            }
            
            const executionTime = Date.now() - startTime;
            
            this.logger.info('Notebook code execution completed', {
                executionTime,
                success: result.success,
                outputCount: result.outputs?.length || 0
            });
            
            return {
                success: true,
                result: result,
                executionTime,
                metadata: {
                    tool: this.name,
                    timestamp: new Date().toISOString(),
                    workingDir: this.config.workingDir
                }
            };
            
        } catch (error) {
            const executionTime = Date.now() - startTime;
            
            this.logger.error('Notebook code execution failed', {
                error: error.message,
                executionTime
            });
            
            return {
                success: false,
                error: error.message,
                executionTime,
                metadata: {
                    tool: this.name,
                    timestamp: new Date().toISOString(),
                    errorType: error.constructor.name
                }
            };
        }
    }
    
    /**
     * Validate input parameters
     */
    validateInput(args) {
        if (!args.code || typeof args.code !== 'string') {
            throw new Error('Code parameter is required and must be a string');
        }
        
        if (args.code.length === 0) {
            throw new Error('Code cannot be empty');
        }
        
        if (args.code.length > 100000) { // 100KB limit
            throw new Error('Code is too large (max 100KB)');
        }
        
        // Check for dangerous imports (basic security)
        const dangerousImports = [
            'os', 'subprocess', 'sys', 'shutil', 'glob',
            '__import__', 'exec', 'eval', 'compile'
        ];
        
        for (const dangerous of dangerousImports) {
            if (args.code.includes(`import ${dangerous}`) || 
                args.code.includes(`from ${dangerous} import`)) {
                throw new Error(`Import of '${dangerous}' is not allowed for security reasons`);
            }
        }
        
        // Validate timeout
        if (args.timeout && (args.timeout < 1 || args.timeout > 600)) {
            throw new Error('Timeout must be between 1 and 600 seconds');
        }
    }
    
    /**
     * Ensure Jupyter environment is ready
     */
    async ensureJupyterEnvironment() {
        try {
            // Initialize Jupyter Manager if not already done
            if (!this.jupyterManager) {
                this.jupyterManager = new JupyterManagerFixed({
                    workingDir: this.config.workingDir,
                    enableLogging: true
                });
            }
            
            // Start server if not running
            let serverInfo = this.jupyterManager.getServerInfo();
            if (!serverInfo) {
                this.logger.info('Starting Jupyter server...');
                serverInfo = await this.jupyterManager.startServer();
            }
            
            // Initialize client if not already done
            if (!this.jupyterClient) {
                this.jupyterClient = new JupyterClient({
                    serverUrl: serverInfo.url,
                    workingDir: this.config.workingDir,
                    executionTimeout: this.config.maxExecutionTime,
                    enableLogging: true
                });
            }
            
            // Connect client if not connected
            if (!this.jupyterClient.isConnected) {
                this.logger.info('Connecting to Jupyter kernel...');
                await this.jupyterClient.connect(serverInfo);
            }
            
            // Update activity to prevent idle timeout
            this.jupyterManager.updateActivity();
            
        } catch (error) {
            this.logger.error('Failed to ensure Jupyter environment', { error: error.message });
            throw new Error(`Jupyter environment setup failed: ${error.message}`);
        }
    }
    
    /**
     * Execute Python code
     */
    async executeCode(args) {
        try {
            // Prepare execution context
            const executionOptions = {
                timeout: (args.timeout || 300) * 1000, // Convert to milliseconds
                libraries: args.libraries || []
            };
            
            // Add library imports if specified
            let codeToExecute = args.code;
            if (executionOptions.libraries.length > 0) {
                const importStatements = executionOptions.libraries
                    .filter(lib => this.config.allowedLibraries.includes(lib))
                    .map(lib => `import ${lib}`)
                    .join('\n');
                
                if (importStatements) {
                    codeToExecute = importStatements + '\n\n' + codeToExecute;
                }
            }
            
            // Execute the code
            const result = await this.jupyterClient.executeCell(codeToExecute, executionOptions);
            
            return result;
            
        } catch (error) {
            this.logger.error('Code execution failed', { error: error.message });
            
            // Return structured error result
            return {
                success: false,
                outputs: [],
                errors: [{
                    type: 'execution_error',
                    message: error.message,
                    timestamp: Date.now()
                }],
                executionTime: 0
            };
        }
    }
    
    /**
     * Save execution outputs to files
     */
    async saveOutputs(result, args) {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const outputDir = path.join(this.config.outputDir, `execution-${timestamp}`);
            
            // Create output directory
            await fs.mkdir(outputDir, { recursive: true });
            
            // Save outputs
            const savedFiles = [];
            
            for (let i = 0; i < result.outputs.length; i++) {
                const output = result.outputs[i];
                const filename = await this.saveOutput(output, outputDir, i);
                if (filename) {
                    savedFiles.push(filename);
                }
            }
            
            // Save execution metadata
            const metadata = {
                timestamp: new Date().toISOString(),
                executionTime: result.executionTime,
                success: result.success,
                outputCount: result.outputs.length,
                errorCount: result.errors.length,
                savedFiles,
                codeLength: args.code.length,
                libraries: args.libraries || []
            };
            
            const metadataFile = path.join(outputDir, 'metadata.json');
            await fs.writeFile(metadataFile, JSON.stringify(metadata, null, 2));
            
            this.logger.info('Outputs saved', { 
                outputDir, 
                fileCount: savedFiles.length 
            });
            
            // Add saved files info to result
            result.savedFiles = savedFiles;
            result.outputDir = outputDir;
            
        } catch (error) {
            this.logger.error('Failed to save outputs', { error: error.message });
            // Don't throw - saving outputs is not critical
        }
    }
    
    /**
     * Save individual output to file
     */
    async saveOutput(output, outputDir, index) {
        try {
            const baseFilename = `output-${index}`;
            
            switch (output.type) {
                case 'display':
                case 'result':
                    // Save as JSON for structured data
                    const dataFile = path.join(outputDir, `${baseFilename}.json`);
                    await fs.writeFile(dataFile, JSON.stringify(output, null, 2));
                    return dataFile;
                    
                case 'stream':
                    // Save as text file
                    const textFile = path.join(outputDir, `${baseFilename}.txt`);
                    await fs.writeFile(textFile, output.text || '');
                    return textFile;
                    
                case 'error':
                    // Save error details
                    const errorFile = path.join(outputDir, `${baseFilename}-error.json`);
                    await fs.writeFile(errorFile, JSON.stringify(output, null, 2));
                    return errorFile;
                    
                default:
                    // Save as generic JSON
                    const genericFile = path.join(outputDir, `${baseFilename}-generic.json`);
                    await fs.writeFile(genericFile, JSON.stringify(output, null, 2));
                    return genericFile;
            }
            
        } catch (error) {
            this.logger.warn('Failed to save individual output', { 
                index, 
                type: output.type, 
                error: error.message 
            });
            return null;
        }
    }
    
    /**
     * Test the tool
     */
    async test() {
        try {
            this.logger.info('Testing ExecuteNotebookCodeTool...');
            
            // Test basic Python execution
            const testCode = `
import pandas as pd
import numpy as np

# Create test data
data = {'name': ['Alice', 'Bob', 'Charlie'], 'age': [25, 30, 35]}
df = pd.DataFrame(data)

# Basic operations
print("DataFrame created successfully!")
print(f"Shape: {df.shape}")
print(f"Columns: {list(df.columns)}")

# Return the result
result = {'status': 'success', 'shape': df.shape, 'columns': list(df.columns)}
result
`;
            
            const result = await this.execute({
                code: testCode,
                timeout: 30,
                save_outputs: false
            });
            
            if (result.success) {
                this.logger.info('Tool test passed');
                return {
                    success: true,
                    message: 'ExecuteNotebookCodeTool is working correctly',
                    testResult: result.result
                };
            } else {
                this.logger.error('Tool test failed', { error: result.error });
                return {
                    success: false,
                    message: 'Tool test failed',
                    error: result.error
                };
            }
            
        } catch (error) {
            this.logger.error('Tool test error', { error: error.message });
            return {
                success: false,
                message: 'Tool test encountered an error',
                error: error.message
            };
        }
    }
    
    /**
     * Cleanup resources
     */
    async cleanup() {
        this.logger.info('Cleaning up ExecuteNotebookCodeTool...');
        
        try {
            if (this.jupyterClient) {
                await this.jupyterClient.cleanup();
                this.jupyterClient = null;
            }
            
            if (this.jupyterManager) {
                await this.jupyterManager.cleanup();
                this.jupyterManager = null;
            }
            
        } catch (error) {
            this.logger.error('Error during cleanup', { error: error.message });
        }
    }
}

// Create and export tool instance
const toolInstance = new ExecuteNotebookCodeTool();

// Setup cleanup on process exit
process.on('exit', async () => {
    await toolInstance.cleanup();
});

process.on('SIGINT', async () => {
    await toolInstance.cleanup();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await toolInstance.cleanup();
    process.exit(0);
});

module.exports = toolInstance;
