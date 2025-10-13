/**
 * Security Validator
 * Prevents path traversal, validates file types, enforces size limits
 * 
 * @author Ona AI Development Partner
 * @version 2.0.0
 * @license MIT
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

class SecurityValidator {
  constructor(options = {}) {
    this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB default
    this.allowedExtensions = options.allowedExtensions || ['.json', '.yaml', '.yml', '.aix', '.toml'];
    this.allowedDirectory = options.allowedDirectory || process.cwd();
  }

  /**
   * Validate file path for security issues
   * Prevents path traversal attacks
   * 
   * @param {string} filePath - Path to validate
   * @returns {Object} { valid: boolean, error?: string, absolutePath?: string }
   */
  validatePath(filePath) {
    try {
      // 1. Resolve to absolute path
      const absolutePath = path.resolve(filePath);
      
      // 2. Check if path exists
      if (!fsSync.existsSync(absolutePath)) {
        return {
          valid: false,
          error: `File not found: ${filePath}`
        };
      }

      // 3. Validate it's within allowed directory (prevent path traversal)
      const allowedDir = path.resolve(this.allowedDirectory);
      if (!absolutePath.startsWith(allowedDir)) {
        return {
          valid: false,
          error: `Path traversal detected: ${filePath} is outside allowed directory`
        };
      }

      // 4. Validate it's a file (not directory, symlink, etc.)
      const stats = fsSync.statSync(absolutePath);
      if (!stats.isFile()) {
        return {
          valid: false,
          error: `Not a regular file: ${filePath}`
        };
      }

      // 5. Check file size
      if (stats.size > this.maxFileSize) {
        return {
          valid: false,
          error: `File too large: ${this.formatBytes(stats.size)} (max: ${this.formatBytes(this.maxFileSize)})`
        };
      }

      // 6. Validate file extension
      const ext = path.extname(absolutePath).toLowerCase();
      if (!this.allowedExtensions.includes(ext)) {
        return {
          valid: false,
          error: `Invalid file type: ${ext}. Allowed: ${this.allowedExtensions.join(', ')}`
        };
      }

      // All checks passed
      return {
        valid: true,
        absolutePath: absolutePath,
        size: stats.size,
        extension: ext
      };

    } catch (error) {
      return {
        valid: false,
        error: `Validation error: ${error.message}`
      };
    }
  }

  /**
   * Validate file content for malicious patterns
   * 
   * @param {string} content - File content to validate
   * @returns {Object} { valid: boolean, error?: string }
   */
  validateContent(content) {
    // Check for null bytes (common in binary exploits)
    if (content.includes('\0')) {
      return {
        valid: false,
        error: 'File contains null bytes (possible binary exploit)'
      };
    }

    // Check for extremely long lines (possible DoS)
    const lines = content.split('\n');
    const maxLineLength = 10000;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].length > maxLineLength) {
        return {
          valid: false,
          error: `Line ${i + 1} exceeds maximum length (${maxLineLength} chars)`
        };
      }
    }

    // Check for reasonable file structure (not just random data)
    const trimmed = content.trim();
    if (trimmed.length === 0) {
      return {
        valid: false,
        error: 'File is empty'
      };
    }

    // Basic JSON/YAML structure check
    const firstChar = trimmed[0];
    const lastChar = trimmed[trimmed.length - 1];
    
    // JSON should start with { or [
    // YAML can start with various chars
    if (firstChar !== '{' && firstChar !== '[' && !trimmed.match(/^[a-zA-Z_$]/)) {
      return {
        valid: false,
        error: 'File does not appear to be valid JSON or YAML'
      };
    }

    return { valid: true };
  }

  /**
   * Comprehensive file validation (path + content)
   * 
   * @param {string} filePath - Path to validate
   * @returns {Promise<Object>} { valid: boolean, error?: string, absolutePath?: string, content?: string }
   */
  async validateFile(filePath) {
    // Validate path first
    const pathValidation = this.validatePath(filePath);
    if (!pathValidation.valid) {
      return pathValidation;
    }

    try {
      // Read file content
      const content = await fs.readFile(pathValidation.absolutePath, 'utf8');

      // Validate content
      const contentValidation = this.validateContent(content);
      if (!contentValidation.valid) {
        return contentValidation;
      }

      // All validations passed
      return {
        valid: true,
        absolutePath: pathValidation.absolutePath,
        content: content,
        size: pathValidation.size,
        extension: pathValidation.extension
      };

    } catch (error) {
      return {
        valid: false,
        error: `Failed to read file: ${error.message}`
      };
    }
  }

  /**
   * Format bytes to human-readable string
   * 
   * @param {number} bytes - Number of bytes
   * @returns {string} Formatted string (e.g., "1.5 MB")
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Sanitize file path for safe display
   * Prevents information disclosure in error messages
   * 
   * @param {string} filePath - Path to sanitize
   * @returns {string} Sanitized path
   */
  sanitizePath(filePath) {
    const cwd = process.cwd();
    const absolutePath = path.resolve(filePath);
    
    // Show relative path if within CWD, otherwise just filename
    if (absolutePath.startsWith(cwd)) {
      return path.relative(cwd, absolutePath);
    }
    
    return path.basename(absolutePath);
  }
}

module.exports = SecurityValidator;
