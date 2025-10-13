/**
 * AsyncAIXParser - Non-blocking AIX file parser
 * Fixes: Synchronous I/O blocking event loop (CRITICAL)
 * 
 * Features:
 * - Async/await throughout
 * - Stream-based parsing for large files
 * - Multi-format support (JSON, YAML, TOML)
 * - Progress reporting
 * - Error recovery
 * 
 * @author Claude 4.5 Sonnet
 * @version 2.0.0
 */

const fs = require('fs').promises;
const { createReadStream } = require('fs');
const path = require('path');
const FileValidator = require('./file-validator');
const ChecksumVerifier = require('./checksum-verifier');

class AsyncAIXParser {
  constructor(options = {}) {
    this.validator = new FileValidator(options.validator);
    this.checksumVerifier = new ChecksumVerifier(options.checksum);
    this.enableProgressReporting = options.progress || false;
    this.strictMode = options.strict !== false;
  }

  /**
   * Parse AIX file (auto-detect format)
   * @param {string} filePath - Path to AIX file
   * @param {Object} options - Parse options
   * @returns {Promise<Object>} - Parsed agent data with metadata
   */
  async parse(filePath, options = {}) {
    const startTime = Date.now();

    // Step 1: Validate file path and security
    if (this.enableProgressReporting) {
      console.log('📁 Validating file...');
    }

    const validation = await this.validator.validate(filePath);
    
    if (!validation.valid) {
      throw new Error(`File validation failed: ${validation.error}`);
    }

    const safePath = validation.safePath;

    // Step 2: Read file content (async)
    if (this.enableProgressReporting) {
      console.log('📖 Reading file...');
    }

    const content = await fs.readFile(safePath, 'utf8');

    // Step 3: Auto-detect format
    if (this.enableProgressReporting) {
      console.log('🔍 Detecting format...');
    }

    const format = this.detectFormat(safePath, content);

    // Step 4: Parse based on format
    if (this.enableProgressReporting) {
      console.log(`📊 Parsing ${format.toUpperCase()}...`);
    }

    let parsed;
    try {
      parsed = await this.parseByFormat(content, format);
    } catch (err) {
      throw new Error(`Parse error (${format}): ${err.message}`);
    }

    // Step 5: Validate structure
    if (this.enableProgressReporting) {
      console.log('✅ Validating structure...');
    }

    const structureValidation = this.validateStructure(parsed);
    
    if (!structureValidation.valid && this.strictMode) {
      throw new Error(`Invalid AIX structure: ${structureValidation.errors.join(', ')}`);
    }

    // Step 6: Verify checksum (if present)
    let checksumResult = null;
    if (parsed.checksum) {
      if (this.enableProgressReporting) {
        console.log('🔐 Verifying checksum...');
      }

      checksumResult = this.checksumVerifier.verifyAgentIntegrity(
        parsed,
        parsed.checksum,
        parsed.checksum_algorithm
      );
    }

    const parseTime = Date.now() - startTime;

    return {
      success: true,
      data: parsed,
      metadata: {
        filePath: safePath,
        format,
        size: validation.metadata.size,
        parseTime,
        structureValid: structureValidation.valid,
        checksumValid: checksumResult?.valid || null,
        warnings: structureValidation.warnings || [],
      },
    };
  }

  /**
   * Detect file format from extension and content
   * @param {string} filePath - File path
   * @param {string} content - File content
   * @returns {string} - Format (json, yaml, toml)
   */
  detectFormat(filePath, content) {
    const ext = path.extname(filePath).toLowerCase();

    // Try extension first
    if (ext === '.json' || ext === '.aix') return 'json';
    if (ext === '.yaml' || ext === '.yml') return 'yaml';
    if (ext === '.toml') return 'toml';

    // Fallback: detect from content
    const trimmed = content.trim();

    // JSON: starts with { or [
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      return 'json';
    }

    // YAML: contains key: value patterns
    if (/^\w+:\s*.+$/m.test(trimmed)) {
      return 'yaml';
    }

    // TOML: contains [section] or key = value
    if (/^\[.+\]$/m.test(trimmed) || /^\w+\s*=\s*.+$/m.test(trimmed)) {
      return 'toml';
    }

    // Default to JSON
    return 'json';
  }

  /**
   * Parse content by format
   * @param {string} content - File content
   * @param {string} format - Format type
   * @returns {Promise<Object>} - Parsed data
   */
  async parseByFormat(content, format) {
    switch (format) {
      case 'json':
        return JSON.parse(content);

      case 'yaml':
        try {
          const yaml = require('yaml');
          return yaml.parse(content);
        } catch (err) {
          throw new Error('YAML parser not available. Install: npm install yaml');
        }

      case 'toml':
        try {
          const toml = require('@iarna/toml');
          return toml.parse(content);
        } catch (err) {
          throw new Error('TOML parser not available. Install: npm install @iarna/toml');
        }

      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Validate AIX structure
   * @param {Object} data - Parsed data
   * @returns {Object} - Validation result
   */
  validateStructure(data) {
    const errors = [];
    const warnings = [];

    // Required fields
    const requiredFields = ['name', 'version'];
    for (const field of requiredFields) {
      if (!data[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Recommended fields
    const recommendedFields = ['description', 'security', 'capabilities'];
    for (const field of recommendedFields) {
      if (!data[field]) {
        warnings.push(`Missing recommended field: ${field}`);
      }
    }

    // Validate security section
    if (data.security) {
      if (!data.security.encryption_algorithm) {
        warnings.push('Missing encryption_algorithm in security section');
      }
      if (!data.checksum) {
        warnings.push('Missing checksum for integrity verification');
      }
    }

    // Validate version format
    if (data.version) {
      const semverPattern = /^\d+\.\d+\.\d+/;
      if (!semverPattern.test(data.version)) {
        warnings.push(`Version should follow semver format: ${data.version}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Parse multiple files in batch (parallel)
   * @param {string[]} filePaths - Array of file paths
   * @param {Object} options - Parse options
   * @returns {Promise<Object>} - Batch parse result
   */
  async parseBatch(filePaths, options = {}) {
    const maxConcurrent = options.maxConcurrent || 5;
    const results = [];

    // Process in chunks to avoid overwhelming system
    for (let i = 0; i < filePaths.length; i += maxConcurrent) {
      const chunk = filePaths.slice(i, i + maxConcurrent);
      
      const chunkResults = await Promise.allSettled(
        chunk.map(fp => this.parse(fp, options))
      );

      results.push(...chunkResults);

      if (this.enableProgressReporting) {
        const progress = Math.min(i + maxConcurrent, filePaths.length);
        console.log(`📊 Progress: ${progress}/${filePaths.length} files`);
      }
    }

    const successful = results.filter(r => r.status === 'fulfilled');
    const failed = results.filter(r => r.status === 'rejected');

    return {
      total: filePaths.length,
      successful: successful.length,
      failed: failed.length,
      results: results.map((r, i) => ({
        filePath: filePaths[i],
        status: r.status,
        data: r.status === 'fulfilled' ? r.value : null,
        error: r.status === 'rejected' ? r.reason.message : null,
      })),
    };
  }

  /**
   * Stream-based parsing for very large files
   * @param {string} filePath - Path to large file
   * @returns {Promise<Object>} - Parsed data
   */
  async parseStream(filePath) {
    const validation = await this.validator.validate(filePath);
    
    if (!validation.valid) {
      throw new Error(`File validation failed: ${validation.error}`);
    }

    return new Promise((resolve, reject) => {
      const stream = createReadStream(validation.safePath, { encoding: 'utf8' });
      let content = '';

      stream.on('data', (chunk) => {
        content += chunk;
        
        if (this.enableProgressReporting) {
          process.stdout.write('.');
        }
      });

      stream.on('end', async () => {
        if (this.enableProgressReporting) {
          console.log(' Done!');
        }

        try {
          const format = this.detectFormat(validation.safePath, content);
          const parsed = await this.parseByFormat(content, format);
          resolve({
            success: true,
            data: parsed,
            metadata: { format, size: validation.metadata.size },
          });
        } catch (err) {
          reject(err);
        }
      });

      stream.on('error', reject);
    });
  }

  /**
   * Serialize agent data to string
   * @param {Object} data - Agent data
   * @param {string} format - Output format
   * @param {Object} options - Serialization options
   * @returns {string} - Serialized content
   */
  serialize(data, format = 'json', options = {}) {
    const indent = options.indent || 2;

    switch (format) {
      case 'json':
        return JSON.stringify(data, null, indent);

      case 'yaml':
        try {
          const yaml = require('yaml');
          return yaml.stringify(data, { indent });
        } catch (err) {
          throw new Error('YAML library not available');
        }

      case 'toml':
        try {
          const toml = require('@iarna/toml');
          return toml.stringify(data);
        } catch (err) {
          throw new Error('TOML library not available');
        }

      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }
}

module.exports = AsyncAIXParser;

// Example usage
if (require.main === module) {
  (async () => {
    const parser = new AsyncAIXParser({
      progress: true,
      strict: false,
    });

    console.log('🚀 AsyncAIXParser Demo\n');

    // Create test file
    const testFile = './test-agent.aix';
    const testData = {
      name: 'test-agent',
      version: '1.0.0',
      description: 'Test agent for parser demo',
      security: {
        encryption_algorithm: 'AES-256-GCM',
      },
    };

    await fs.writeFile(testFile, JSON.stringify(testData, null, 2));

    // Parse file
    console.log('Parsing test file...\n');
    const result = await parser.parse(testFile);

    console.log('\n✅ Parse Result:');
    console.log(`   Name: ${result.data.name}`);
    console.log(`   Version: ${result.data.version}`);
    console.log(`   Format: ${result.metadata.format}`);
    console.log(`   Parse time: ${result.metadata.parseTime}ms`);
    console.log(`   Warnings: ${result.metadata.warnings.length}`);

    // Cleanup
    await fs.unlink(testFile);
  })();
}
