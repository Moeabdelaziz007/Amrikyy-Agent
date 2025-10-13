/**
 * PatternCollector - Scans codebase and collects AIX agent patterns
 * The foundation of the Pattern Agent system
 * 
 * Features:
 * - Recursive directory scanning
 * - Multi-format detection (JSON, YAML, TOML)
 * - Parallel processing
 * - Progress reporting
 * - Error recovery
 * 
 * @author Claude 4.5 Sonnet
 * @version 1.0.0
 */

const fs = require('fs').promises;
const path = require('path');
const AsyncAIXParser = require('../core/async-parser');
const FileValidator = require('../core/file-validator');

class PatternCollector {
  constructor(options = {}) {
    this.parser = new AsyncAIXParser({ 
      progress: false,
      strict: false, // Be lenient during collection
    });
    this.validator = new FileValidator({
      maxFileSize: options.maxFileSize || 10 * 1024 * 1024,
    });
    this.maxConcurrent = options.maxConcurrent || 10;
    this.includeInvalid = options.includeInvalid || false;
    this.extensions = options.extensions || ['.aix', '.json', '.yaml', '.yml', '.toml'];
  }

  /**
   * Scan directory recursively for AIX agent files
   * @param {string} rootPath - Root directory to scan
   * @param {Object} options - Scan options
   * @returns {Promise<Object>} - Scan results
   */
  async scanDirectory(rootPath, options = {}) {
    const startTime = Date.now();
    const files = [];
    const errors = [];
    const stats = {
      totalFiles: 0,
      validFiles: 0,
      invalidFiles: 0,
      directories: 0,
    };

    console.log(`🔍 Scanning directory: ${rootPath}`);

    try {
      await this._scanRecursive(rootPath, files, errors, stats, options);
    } catch (err) {
      throw new Error(`Directory scan failed: ${err.message}`);
    }

    const duration = Date.now() - startTime;

    return {
      success: true,
      rootPath,
      files,
      errors,
      stats,
      duration,
      durationSeconds: (duration / 1000).toFixed(2),
    };
  }

  /**
   * Recursive directory scanning helper
   * @private
   */
  async _scanRecursive(dirPath, files, errors, stats, options, depth = 0) {
    const maxDepth = options.maxDepth || 10;
    
    if (depth > maxDepth) {
      return;
    }

    stats.directories++;

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        // Skip hidden files and node_modules
        if (entry.name.startsWith('.') || entry.name === 'node_modules') {
          continue;
        }

        if (entry.isDirectory()) {
          await this._scanRecursive(fullPath, files, errors, stats, options, depth + 1);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          
          if (this.extensions.includes(ext)) {
            stats.totalFiles++;
            
            try {
              const validation = await this.validator.validate(fullPath);
              
              if (validation.valid) {
                files.push({
                  path: fullPath,
                  relativePath: path.relative(options.basePath || dirPath, fullPath),
                  name: entry.name,
                  size: validation.metadata.size,
                  extension: ext,
                });
                stats.validFiles++;
              } else {
                stats.invalidFiles++;
                if (this.includeInvalid) {
                  errors.push({
                    path: fullPath,
                    error: validation.error,
                  });
                }
              }
            } catch (err) {
              stats.invalidFiles++;
              errors.push({
                path: fullPath,
                error: err.message,
              });
            }
          }
        }
      }
    } catch (err) {
      errors.push({
        path: dirPath,
        error: `Failed to read directory: ${err.message}`,
      });
    }
  }

  /**
   * Parse collected files and extract agent data
   * @param {Array} files - Array of file objects from scanDirectory
   * @returns {Promise<Object>} - Parsed agents
   */
  async parseFiles(files) {
    const startTime = Date.now();
    const agents = [];
    const parseErrors = [];

    console.log(`📖 Parsing ${files.length} files...`);

    // Process in batches for better performance
    for (let i = 0; i < files.length; i += this.maxConcurrent) {
      const batch = files.slice(i, i + this.maxConcurrent);
      
      const results = await Promise.allSettled(
        batch.map(file => this.parser.parse(file.path))
      );

      results.forEach((result, index) => {
        const file = batch[index];
        
        if (result.status === 'fulfilled') {
          agents.push({
            ...file,
            data: result.value.data,
            metadata: result.value.metadata,
          });
        } else {
          parseErrors.push({
            path: file.path,
            error: result.reason.message,
          });
        }
      });

      // Progress reporting
      const progress = Math.min(i + this.maxConcurrent, files.length);
      console.log(`  Progress: ${progress}/${files.length} files parsed`);
    }

    const duration = Date.now() - startTime;

    return {
      success: true,
      agents,
      parseErrors,
      stats: {
        total: files.length,
        successful: agents.length,
        failed: parseErrors.length,
      },
      duration,
      durationSeconds: (duration / 1000).toFixed(2),
    };
  }

  /**
   * Collect patterns from parsed agents
   * @param {Array} agents - Array of parsed agent objects
   * @returns {Object} - Extracted patterns
   */
  collectPatterns(agents) {
    console.log(`🔍 Extracting patterns from ${agents.length} agents...`);

    const patterns = {
      // Security patterns
      encryption: {},
      authentication: {},
      rateLimit: {},
      
      // Configuration patterns
      versions: {},
      capabilities: {},
      
      // Structure patterns
      fields: {},
      sections: {},
      
      // Metadata
      totalAgents: agents.length,
      timestamp: new Date().toISOString(),
    };

    agents.forEach(agent => {
      const data = agent.data;

      // Extract encryption patterns
      if (data.security?.encryption_algorithm) {
        const algo = data.security.encryption_algorithm;
        patterns.encryption[algo] = (patterns.encryption[algo] || 0) + 1;
      }

      // Extract authentication patterns
      if (data.security?.authentication?.type) {
        const authType = data.security.authentication.type;
        patterns.authentication[authType] = (patterns.authentication[authType] || 0) + 1;
      }

      // Extract rate limiting patterns
      if (data.security?.rate_limiting?.requests_per_minute) {
        const rate = data.security.rate_limiting.requests_per_minute;
        patterns.rateLimit[rate] = (patterns.rateLimit[rate] || 0) + 1;
      }

      // Extract version patterns
      if (data.version) {
        patterns.versions[data.version] = (patterns.versions[data.version] || 0) + 1;
      }

      // Extract capability patterns
      if (data.capabilities) {
        Object.keys(data.capabilities).forEach(cap => {
          patterns.capabilities[cap] = (patterns.capabilities[cap] || 0) + 1;
        });
      }

      // Extract field patterns
      Object.keys(data).forEach(field => {
        patterns.fields[field] = (patterns.fields[field] || 0) + 1;
      });

      // Extract section patterns
      const sections = ['security', 'compliance', 'resilience', 'performance', 'capabilities'];
      sections.forEach(section => {
        if (data[section]) {
          patterns.sections[section] = (patterns.sections[section] || 0) + 1;
        }
      });
    });

    return patterns;
  }

  /**
   * Complete collection workflow: scan → parse → extract patterns
   * @param {string} rootPath - Root directory to scan
   * @param {Object} options - Collection options
   * @returns {Promise<Object>} - Complete collection results
   */
  async collect(rootPath, options = {}) {
    const startTime = Date.now();

    console.log('🚀 Starting Pattern Collection...\n');

    // Step 1: Scan directory
    const scanResult = await this.scanDirectory(rootPath, options);
    console.log(`✅ Scan complete: ${scanResult.stats.validFiles} valid files found\n`);

    // Step 2: Parse files
    const parseResult = await this.parseFiles(scanResult.files);
    console.log(`✅ Parse complete: ${parseResult.stats.successful} agents parsed\n`);

    // Step 3: Extract patterns
    const patterns = this.collectPatterns(parseResult.agents);
    console.log(`✅ Pattern extraction complete\n`);

    const totalDuration = Date.now() - startTime;

    return {
      success: true,
      rootPath,
      scan: scanResult,
      parse: parseResult,
      patterns,
      agents: parseResult.agents,
      summary: {
        totalFiles: scanResult.stats.totalFiles,
        validFiles: scanResult.stats.validFiles,
        parsedAgents: parseResult.stats.successful,
        patternsFound: Object.keys(patterns.encryption).length + 
                       Object.keys(patterns.authentication).length +
                       Object.keys(patterns.rateLimit).length,
        duration: totalDuration,
        durationSeconds: (totalDuration / 1000).toFixed(2),
      },
    };
  }

  /**
   * Export patterns to JSON file
   * @param {Object} patterns - Patterns to export
   * @param {string} outputPath - Output file path
   * @returns {Promise<void>}
   */
  async exportPatterns(patterns, outputPath) {
    const json = JSON.stringify(patterns, null, 2);
    await fs.writeFile(outputPath, json, 'utf8');
    console.log(`✅ Patterns exported to: ${outputPath}`);
  }
}

module.exports = PatternCollector;

// Example usage
if (require.main === module) {
  (async () => {
    const collector = new PatternCollector({
      maxConcurrent: 5,
      includeInvalid: false,
    });

    try {
      // Collect patterns from examples directory
      const result = await collector.collect('./examples', {
        maxDepth: 5,
        basePath: process.cwd(),
      });

      console.log('\n📊 Collection Summary:');
      console.log(`   Total files scanned: ${result.summary.totalFiles}`);
      console.log(`   Valid AIX files: ${result.summary.validFiles}`);
      console.log(`   Successfully parsed: ${result.summary.parsedAgents}`);
      console.log(`   Patterns found: ${result.summary.patternsFound}`);
      console.log(`   Duration: ${result.summary.durationSeconds}s`);

      console.log('\n🔥 Most Common Patterns:');
      
      // Encryption algorithms
      const encryptionEntries = Object.entries(result.patterns.encryption)
        .sort((a, b) => b[1] - a[1]);
      if (encryptionEntries.length > 0) {
        console.log('\n  Encryption Algorithms:');
        encryptionEntries.forEach(([algo, count]) => {
          const percentage = ((count / result.summary.parsedAgents) * 100).toFixed(1);
          console.log(`    ${algo}: ${count} (${percentage}%)`);
        });
      }

      // Rate limits
      const rateLimitEntries = Object.entries(result.patterns.rateLimit)
        .sort((a, b) => b[1] - a[1]);
      if (rateLimitEntries.length > 0) {
        console.log('\n  Rate Limits:');
        rateLimitEntries.forEach(([rate, count]) => {
          const percentage = ((count / result.summary.parsedAgents) * 100).toFixed(1);
          console.log(`    ${rate} req/min: ${count} (${percentage}%)`);
        });
      }

      // Export patterns
      await collector.exportPatterns(result.patterns, './patterns.json');

    } catch (err) {
      console.error('❌ Collection failed:', err.message);
      process.exit(1);
    }
  })();
}
