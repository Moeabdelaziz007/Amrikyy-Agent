/**
 * ChecksumVerifier - Proper checksum validation and integrity verification
 * Fixes: Checksum validation bug - only checked format, not actual integrity (CRITICAL)
 * 
 * Features:
 * - Multiple hash algorithms (SHA-256, SHA-512, SHA3-256)
 * - Actual content verification (not just format checking)
 * - Timing-safe comparison (prevents timing attacks)
 * - Batch verification
 * - Checksum generation
 * 
 * @author Claude 4.5 Sonnet
 * @version 2.0.0
 */

const crypto = require('crypto');
const fs = require('fs').promises;

class ChecksumVerifier {
  constructor(options = {}) {
    this.defaultAlgorithm = options.defaultAlgorithm || 'sha256';
    this.supportedAlgorithms = [
      'sha1',      // Legacy (weak, not recommended)
      'sha256',    // Good (recommended)
      'sha512',    // Better
      'sha3-256',  // Best
      'sha3-512',  // Best
      'blake2b512' // Modern
    ];
  }

  /**
   * Calculate checksum of file content
   * @param {string} content - File content (string or Buffer)
   * @param {string} algorithm - Hash algorithm
   * @returns {string} - Hex-encoded checksum
   */
  calculateChecksum(content, algorithm = null) {
    const algo = algorithm || this.defaultAlgorithm;

    if (!this.supportedAlgorithms.includes(algo)) {
      throw new Error(
        `Unsupported algorithm: ${algo}. ` +
        `Supported: ${this.supportedAlgorithms.join(', ')}`
      );
    }

    // Warn about weak algorithms
    if (algo === 'sha1') {
      console.warn(
        '⚠️  Warning: SHA-1 is cryptographically weak. ' +
        'Consider upgrading to SHA-256 or SHA3-256.'
      );
    }

    return crypto
      .createHash(algo)
      .update(content)
      .digest('hex');
  }

  /**
   * Calculate checksum from file path
   * @param {string} filePath - Path to file
   * @param {string} algorithm - Hash algorithm
   * @returns {Promise<string>} - Hex-encoded checksum
   */
  async calculateFileChecksum(filePath, algorithm = null) {
    const content = await fs.readFile(filePath);
    return this.calculateChecksum(content, algorithm);
  }

  /**
   * Verify checksum matches content
   * @param {string} content - File content
   * @param {string} expectedChecksum - Expected checksum value
   * @param {string} algorithm - Hash algorithm (auto-detected if null)
   * @returns {Object} - Verification result
   */
  verifyChecksum(content, expectedChecksum, algorithm = null) {
    if (!expectedChecksum || typeof expectedChecksum !== 'string') {
      return {
        valid: false,
        error: 'Invalid checksum format: must be non-empty string',
      };
    }

    // Auto-detect algorithm from checksum length if not specified
    const detectedAlgo = algorithm || this.detectAlgorithm(expectedChecksum);

    if (!detectedAlgo) {
      return {
        valid: false,
        error: `Cannot detect algorithm from checksum length: ${expectedChecksum.length} characters`,
        expectedChecksum,
      };
    }

    try {
      // Calculate actual checksum
      const actualChecksum = this.calculateChecksum(content, detectedAlgo);

      // Timing-safe comparison (prevents timing attacks)
      const valid = this.timingSafeEqual(
        Buffer.from(actualChecksum, 'hex'),
        Buffer.from(expectedChecksum.toLowerCase(), 'hex')
      );

      return {
        valid,
        algorithm: detectedAlgo,
        expectedChecksum: expectedChecksum.toLowerCase(),
        actualChecksum,
        match: valid,
      };
    } catch (err) {
      return {
        valid: false,
        error: `Verification failed: ${err.message}`,
        algorithm: detectedAlgo,
      };
    }
  }

  /**
   * Verify file checksum
   * @param {string} filePath - Path to file
   * @param {string} expectedChecksum - Expected checksum
   * @param {string} algorithm - Hash algorithm
   * @returns {Promise<Object>} - Verification result
   */
  async verifyFileChecksum(filePath, expectedChecksum, algorithm = null) {
    try {
      const content = await fs.readFile(filePath);
      return this.verifyChecksum(content, expectedChecksum, algorithm);
    } catch (err) {
      return {
        valid: false,
        error: `Failed to read file: ${err.message}`,
        filePath,
      };
    }
  }

  /**
   * Timing-safe equality comparison (prevents timing attacks)
   * @param {Buffer} a - First buffer
   * @param {Buffer} b - Second buffer
   * @returns {boolean} - True if equal
   */
  timingSafeEqual(a, b) {
    if (a.length !== b.length) {
      return false;
    }

    try {
      // Use crypto.timingSafeEqual if available (Node.js 6.6.0+)
      return crypto.timingSafeEqual(a, b);
    } catch (err) {
      // Fallback: constant-time comparison
      let result = 0;
      for (let i = 0; i < a.length; i++) {
        result |= a[i] ^ b[i];
      }
      return result === 0;
    }
  }

  /**
   * Detect hash algorithm from checksum length
   * @param {string} checksum - Checksum string
   * @returns {string|null} - Detected algorithm or null
   */
  detectAlgorithm(checksum) {
    const length = checksum.length;

    // Common checksum lengths (in hex characters)
    const lengthMap = {
      40: 'sha1',      // 160 bits = 40 hex chars
      64: 'sha256',    // 256 bits = 64 hex chars
      128: 'sha512',   // 512 bits = 128 hex chars
    };

    return lengthMap[length] || null;
  }

  /**
   * Validate checksum format (not integrity)
   * @param {string} checksum - Checksum to validate
   * @returns {Object} - Format validation result
   */
  validateFormat(checksum) {
    if (!checksum || typeof checksum !== 'string') {
      return {
        valid: false,
        error: 'Checksum must be a non-empty string',
      };
    }

    // Check if hexadecimal
    const hexPattern = /^[a-f0-9]+$/i;
    if (!hexPattern.test(checksum)) {
      return {
        valid: false,
        error: 'Checksum must be hexadecimal (only 0-9, a-f)',
      };
    }

    // Detect algorithm
    const algorithm = this.detectAlgorithm(checksum);

    if (!algorithm) {
      return {
        valid: false,
        error: `Unknown checksum length: ${checksum.length} characters`,
        hint: 'Expected: 40 (SHA-1), 64 (SHA-256), or 128 (SHA-512)',
      };
    }

    return {
      valid: true,
      algorithm,
      length: checksum.length,
      format: 'hexadecimal',
    };
  }

  /**
   * Generate checksum for AIX agent file
   * @param {Object} agentData - Parsed agent data
   * @param {string} algorithm - Hash algorithm
   * @returns {Object} - Generated checksum info
   */
  generateAgentChecksum(agentData, algorithm = null) {
    const algo = algorithm || this.defaultAlgorithm;

    // Normalize agent data for checksumming
    // Remove existing checksum field to avoid circular reference
    const { checksum, ...dataToHash } = agentData;

    // Serialize deterministically (sorted keys)
    const normalized = JSON.stringify(dataToHash, Object.keys(dataToHash).sort());

    // Calculate checksum
    const checksumValue = this.calculateChecksum(normalized, algo);

    return {
      algorithm: algo,
      checksum: checksumValue,
      data_size: normalized.length,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Verify AIX agent file integrity
   * @param {Object} agentData - Parsed agent data
   * @param {string} expectedChecksum - Expected checksum
   * @param {string} algorithm - Hash algorithm
   * @returns {Object} - Verification result
   */
  verifyAgentIntegrity(agentData, expectedChecksum, algorithm = null) {
    const { checksum: _, ...dataToVerify } = agentData;

    const normalized = JSON.stringify(
      dataToVerify, 
      Object.keys(dataToVerify).sort()
    );

    return this.verifyChecksum(normalized, expectedChecksum, algorithm);
  }

  /**
   * Batch verify multiple files
   * @param {Array} files - Array of {path, checksum, algorithm}
   * @returns {Promise<Object>} - Batch verification result
   */
  async verifyBatch(files) {
    const results = await Promise.all(
      files.map(async (file) => {
        const result = await this.verifyFileChecksum(
          file.path,
          file.checksum,
          file.algorithm
        );
        return {
          path: file.path,
          ...result,
        };
      })
    );

    const valid = results.filter(r => r.valid);
    const invalid = results.filter(r => !r.valid);

    return {
      total: files.length,
      valid: valid.length,
      invalid: invalid.length,
      results,
    };
  }

  /**
   * Get algorithm strength rating
   * @param {string} algorithm - Algorithm name
   * @returns {Object} - Strength rating
   */
  getAlgorithmStrength(algorithm) {
    const ratings = {
      'sha1': {
        strength: 'weak',
        score: 1,
        recommendation: 'Upgrade to SHA-256 or better',
        deprecated: true,
      },
      'sha256': {
        strength: 'good',
        score: 3,
        recommendation: 'Industry standard, recommended',
        deprecated: false,
      },
      'sha512': {
        strength: 'strong',
        score: 4,
        recommendation: 'Excellent choice',
        deprecated: false,
      },
      'sha3-256': {
        strength: 'excellent',
        score: 5,
        recommendation: 'Modern standard, highly secure',
        deprecated: false,
      },
      'sha3-512': {
        strength: 'excellent',
        score: 5,
        recommendation: 'Modern standard, highly secure',
        deprecated: false,
      },
      'blake2b512': {
        strength: 'excellent',
        score: 5,
        recommendation: 'Modern, fast, and secure',
        deprecated: false,
      },
    };

    return ratings[algorithm] || {
      strength: 'unknown',
      score: 0,
      recommendation: 'Use SHA-256 or better',
      deprecated: false,
    };
  }
}

module.exports = ChecksumVerifier;

// Example usage and tests
if (require.main === module) {
  (async () => {
    const verifier = new ChecksumVerifier();

    console.log('🔐 ChecksumVerifier Demo\n');

    // Test 1: Calculate checksum
    console.log('Test 1: Calculate Checksum');
    const content = 'Hello, AIX Security!';
    const checksum = verifier.calculateChecksum(content, 'sha256');
    console.log(`  Content: "${content}"`);
    console.log(`  SHA-256: ${checksum}\n`);

    // Test 2: Verify valid checksum
    console.log('Test 2: Verify Valid Checksum');
    const validResult = verifier.verifyChecksum(content, checksum, 'sha256');
    console.log(`  Valid: ${validResult.valid}`);
    console.log(`  Match: ${validResult.match}\n`);

    // Test 3: Verify invalid checksum
    console.log('Test 3: Verify Invalid Checksum');
    const invalidChecksum = 'a'.repeat(64);
    const invalidResult = verifier.verifyChecksum(content, invalidChecksum, 'sha256');
    console.log(`  Valid: ${invalidResult.valid}`);
    console.log(`  Expected: ${invalidResult.expectedChecksum.substring(0, 16)}...`);
    console.log(`  Actual: ${invalidResult.actualChecksum.substring(0, 16)}...\n`);

    // Test 4: Auto-detect algorithm
    console.log('Test 4: Auto-detect Algorithm');
    const sha1Checksum = verifier.calculateChecksum(content, 'sha1');
    const sha256Checksum = verifier.calculateChecksum(content, 'sha256');
    const sha512Checksum = verifier.calculateChecksum(content, 'sha512');
    
    console.log(`  SHA-1 (40 chars): ${verifier.detectAlgorithm(sha1Checksum)}`);
    console.log(`  SHA-256 (64 chars): ${verifier.detectAlgorithm(sha256Checksum)}`);
    console.log(`  SHA-512 (128 chars): ${verifier.detectAlgorithm(sha512Checksum)}\n`);

    // Test 5: Format validation
    console.log('Test 5: Format Validation');
    const formatTests = [
      sha256Checksum,           // Valid
      'not-a-checksum',         // Invalid (not hex)
      'abc',                    // Invalid (too short)
      'Z'.repeat(64),           // Invalid (not hex)
    ];

    formatTests.forEach((test, i) => {
      const result = verifier.validateFormat(test);
      console.log(`  Test ${i + 1}: ${result.valid ? '✅' : '❌'} ${result.error || result.algorithm}`);
    });
    console.log();

    // Test 6: Algorithm strength
    console.log('Test 6: Algorithm Strength Ratings');
    ['sha1', 'sha256', 'sha512', 'sha3-256'].forEach(algo => {
      const rating = verifier.getAlgorithmStrength(algo);
      console.log(`  ${algo.padEnd(12)}: ${rating.strength.padEnd(10)} (Score: ${rating.score}/5)`);
    });
    console.log();

    // Test 7: AIX Agent checksum
    console.log('Test 7: AIX Agent Integrity');
    const agentData = {
      name: 'test-agent',
      version: '1.0.0',
      security: {
        encryption_algorithm: 'AES-256-GCM'
      },
      checksum: 'old-checksum-to-be-replaced'
    };

    const generated = verifier.generateAgentChecksum(agentData, 'sha256');
    console.log(`  Generated checksum: ${generated.checksum.substring(0, 32)}...`);
    console.log(`  Algorithm: ${generated.algorithm}`);
    console.log(`  Data size: ${generated.data_size} bytes\n`);

    // Verify integrity
    const integrity = verifier.verifyAgentIntegrity(
      agentData,
      generated.checksum,
      'sha256'
    );
    console.log(`  Integrity check: ${integrity.valid ? '✅ VALID' : '❌ INVALID'}\n`);
  })();
}
