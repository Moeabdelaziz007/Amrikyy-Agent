/**
 * FileValidator - Secure file validation and path sanitization
 * Fixes: Path traversal vulnerability (CRITICAL)
 * 
 * Security Features:
 * - Path traversal prevention
 * - File size limits (10MB default)
 * - Extension validation
 * - Symbolic link detection
 * - Safe path resolution
 * 
 * @author Claude 4.5 Sonnet
 * @version 2.0.0
 */

const fs = require('fs').promises;
const path = require('path');
const { constants } = require('fs');

class FileValidator {
  constructor(options = {}) {
    this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB default
    this.allowedExtensions = options.allowedExtensions || ['.aix', '.json', '.yaml', '.yml', '.toml'];
    this.baseDirectory = options.baseDirectory || process.cwd();
  }

  /**
   * Validate file path and return safe absolute path
   * @param {string} filePath - User-provided file path
   * @returns {Promise<string>} - Safe absolute path
   * @throws {Error} - If validation fails
   */
  async validatePath(filePath) {
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('Invalid file path: must be a non-empty string');
    }

    // Resolve to absolute path
    const absolutePath = path.resolve(this.baseDirectory, filePath);

    // SECURITY: Prevent path traversal attacks
    // Ensure resolved path is within base directory
    const normalizedBase = path.normalize(this.baseDirectory);
    const normalizedPath = path.normalize(absolutePath);

    if (!normalizedPath.startsWith(normalizedBase)) {
      throw new Error(
        `Security violation: Path traversal detected. ` +
        `File must be within ${normalizedBase}`
      );
    }

    // Check if path exists
    try {
      await fs.access(absolutePath, constants.R_OK);
    } catch (err) {
      throw new Error(`File not accessible: ${filePath} (${err.message})`);
    }

    // Check if it's a regular file (not directory, symlink, etc.)
    const stats = await fs.lstat(absolutePath);
    
    if (!stats.isFile()) {
      throw new Error(`Path is not a regular file: ${filePath}`);
    }

    // SECURITY: Detect symbolic links (potential security risk)
    if (stats.isSymbolicLink()) {
      throw new Error(
        `Security violation: Symbolic links not allowed: ${filePath}`
      );
    }

    return absolutePath;
  }

  /**
   * Validate file extension
   * @param {string} filePath - File path to validate
   * @returns {boolean} - True if extension is allowed
   */
  validateExtension(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    
    if (!this.allowedExtensions.includes(ext)) {
      throw new Error(
        `Invalid file extension: ${ext}. ` +
        `Allowed: ${this.allowedExtensions.join(', ')}`
      );
    }

    return true;
  }

  /**
   * Validate file size
   * @param {string} filePath - File path to check
   * @returns {Promise<boolean>} - True if size is acceptable
   */
  async validateSize(filePath) {
    const stats = await fs.stat(filePath);
    
    if (stats.size > this.maxFileSize) {
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
      const maxMB = (this.maxFileSize / 1024 / 1024).toFixed(2);
      
      throw new Error(
        `File too large: ${sizeMB}MB exceeds limit of ${maxMB}MB`
      );
    }

    return true;
  }

  /**
   * Complete file validation (all checks)
   * @param {string} filePath - File path to validate
   * @returns {Promise<Object>} - Validation result
   */
  async validate(filePath) {
    const startTime = Date.now();

    try {
      // 1. Validate and sanitize path
      const safePath = await this.validatePath(filePath);

      // 2. Validate extension
      this.validateExtension(safePath);

      // 3. Validate file size
      await this.validateSize(safePath);

      // 4. Get file metadata
      const stats = await fs.stat(safePath);

      return {
        valid: true,
        safePath,
        metadata: {
          size: stats.size,
          sizeKB: (stats.size / 1024).toFixed(2),
          created: stats.birthtime,
          modified: stats.mtime,
          extension: path.extname(safePath),
        },
        validationTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
        validationTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Validate multiple files in batch
   * @param {string[]} filePaths - Array of file paths
   * @returns {Promise<Object>} - Batch validation results
   */
  async validateBatch(filePaths) {
    const results = await Promise.all(
      filePaths.map(fp => this.validate(fp))
    );

    const valid = results.filter(r => r.valid);
    const invalid = results.filter(r => !r.valid);

    return {
      total: filePaths.length,
      valid: valid.length,
      invalid: invalid.length,
      results,
      summary: {
        totalSize: valid.reduce((sum, r) => sum + r.metadata.size, 0),
        averageSize: valid.length > 0
          ? valid.reduce((sum, r) => sum + r.metadata.size, 0) / valid.length
          : 0,
      },
    };
  }
}

module.exports = FileValidator;

// Example usage:
if (require.main === module) {
  (async () => {
    const validator = new FileValidator({
      maxFileSize: 5 * 1024 * 1024, // 5MB
      baseDirectory: process.cwd(),
    });

    // Test cases
    const testCases = [
      './agent.aix',              // Valid
      '../../../etc/passwd',      // Path traversal attack
      './nonexistent.aix',        // Non-existent file
      './huge-file.aix',          // Too large
    ];

    console.log('🔒 FileValidator Security Tests\n');

    for (const testPath of testCases) {
      console.log(`Testing: ${testPath}`);
      const result = await validator.validate(testPath);
      
      if (result.valid) {
        console.log(`  ✅ Valid - ${result.metadata.sizeKB}KB`);
      } else {
        console.log(`  ❌ Invalid - ${result.error}`);
      }
      console.log();
    }
  })();
}
