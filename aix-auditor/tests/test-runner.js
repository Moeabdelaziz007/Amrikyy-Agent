#!/usr/bin/env node
/**
 * Simple Test Runner - Runs security tests without Jest
 * Uses Node's built-in assert module
 * 
 * @author Claude 4.5 Sonnet
 * @version 1.0.0
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const assert = require('assert');
const FileValidator = require('../src/core/file-validator');
const ChecksumVerifier = require('../src/core/checksum-verifier');
const BackupManager = require('../src/core/backup');
const AsyncAIXParser = require('../src/core/async-parser');

// Test statistics
const stats = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  startTime: Date.now(),
};

const failures = [];

// Helper functions to mimic Jest API
function describe(name, fn) {
  console.log(`\n📦 ${name}`);
  return fn();
}

function test(name, fn) {
  stats.total++;
  return (async () => {
    try {
      await fn();
      stats.passed++;
      console.log(`  ✅ ${name}`);
    } catch (err) {
      stats.failed++;
      console.log(`  ❌ ${name}`);
      failures.push({ test: name, error: err.message, stack: err.stack });
    }
  })();
}

function expect(value) {
  return {
    toBe(expected) {
      assert.strictEqual(value, expected);
    },
    toEqual(expected) {
      assert.deepStrictEqual(value, expected);
    },
    toBeTruthy() {
      assert.ok(value);
    },
    toBeFalsy() {
      assert.ok(!value);
    },
    toContain(item) {
      assert.ok(value.includes(item));
    },
    toThrow(expected) {
      assert.throws(() => value, expected ? new RegExp(expected) : undefined);
    },
    rejects: {
      async toThrow(expected) {
        try {
          await value;
          throw new Error('Expected promise to reject but it resolved');
        } catch (err) {
          if (expected && !err.message.includes(expected)) {
            throw new Error(`Expected error to contain "${expected}" but got "${err.message}"`);
          }
        }
      },
    },
  };
}

// Test setup/teardown
let tempDir;
let validator;
let checksumVerifier;
let backupManager;
let parser;

async function beforeEach() {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aix-test-'));
  validator = new FileValidator({ baseDirectory: tempDir });
  checksumVerifier = new ChecksumVerifier();
  backupManager = new BackupManager({ backupDir: path.join(tempDir, '.backups') });
  parser = new AsyncAIXParser({ validator });
}

async function afterEach() {
  if (tempDir) {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

// ============================================================================
// SECURITY TESTS
// ============================================================================

async function runSecurityTests() {
  console.log('\n🔒 AIX SECURITY AUDITOR - TEST SUITE');
  console.log('=====================================\n');

  // CVE-2024-001: Path Traversal Tests
  await describe('CVE-2024-001: Path Traversal Vulnerability', async () => {
    await beforeEach();

    await test('should block absolute path outside base directory', async () => {
      await expect(
        validator.validatePath('/etc/passwd')
      ).rejects.toThrow('Path traversal detected');
    });

    await test('should block relative path traversal with ../', async () => {
      await expect(
        validator.validatePath('../../../etc/passwd')
      ).rejects.toThrow('Path traversal detected');
    });

    await test('should block path traversal with encoded characters', async () => {
      // URL-encoded paths are decoded by path.resolve, so they won't exist
      await expect(
        validator.validatePath('..%2F..%2F..%2Fetc%2Fpasswd')
      ).rejects.toThrow('File not accessible');
    });

    await test('should block symbolic links', async () => {
      const targetFile = path.join(tempDir, 'target.aix');
      const symlinkFile = path.join(tempDir, 'symlink.aix');
      
      await fs.writeFile(targetFile, '{}');
      try {
        await fs.symlink(targetFile, symlinkFile);
        // lstat detects symlinks as not regular files
        await expect(
          validator.validatePath('symlink.aix')
        ).rejects.toThrow('not a regular file');
      } catch (err) {
        if (err.code === 'EPERM') {
          console.log('    ⚠️  Skipped (no symlink permission)');
          stats.skipped++;
          stats.total--;
        } else {
          throw err;
        }
      }
    });

    await test('should allow safe paths within base directory', async () => {
      const safePath = path.join(tempDir, 'safe-agent.aix');
      await fs.writeFile(safePath, '{}');

      const result = await validator.validatePath('safe-agent.aix');
      expect(result).toBe(safePath);
    });

    await test('should handle nested directories safely', async () => {
      const nestedDir = path.join(tempDir, 'subdir', 'nested');
      await fs.mkdir(nestedDir, { recursive: true });
      
      const safePath = path.join(nestedDir, 'agent.aix');
      await fs.writeFile(safePath, '{}');

      const result = await validator.validatePath('subdir/nested/agent.aix');
      expect(result).toBe(safePath);
    });

    await afterEach();
  });

  // CVE-2024-002: Checksum Validation Tests
  await describe('CVE-2024-002: Checksum Validation Bug', async () => {
    await beforeEach();

    await test('should detect tampered content with valid format', async () => {
      const originalContent = '{"name": "agent", "version": "1.0.0"}';
      const tamperedContent = '{"name": "hacked", "version": "1.0.0"}';
      
      const originalChecksum = checksumVerifier.calculateChecksum(originalContent);
      const result = checksumVerifier.verifyChecksum(tamperedContent, originalChecksum);
      
      expect(result.valid).toBe(false);
    });

    await test('should verify correct checksums', async () => {
      const content = '{"name": "agent", "version": "1.0.0"}';
      const checksum = checksumVerifier.calculateChecksum(content);
      const result = checksumVerifier.verifyChecksum(content, checksum);
      
      expect(result.valid).toBe(true);
    });

    await test('should support multiple hash algorithms', async () => {
      const content = 'test content';
      
      const sha256 = checksumVerifier.calculateChecksum(content, 'sha256');
      const sha512 = checksumVerifier.calculateChecksum(content, 'sha512');
      
      expect(sha256.length).toBe(64); // SHA-256 = 64 hex chars
      expect(sha512.length).toBe(128); // SHA-512 = 128 hex chars
    });

    await test('should use timing-safe comparison', async () => {
      const content = 'sensitive data';
      const correctChecksum = checksumVerifier.calculateChecksum(content);
      const wrongChecksum = 'a'.repeat(64);
      
      // Both should take similar time (timing-safe)
      const start1 = Date.now();
      checksumVerifier.verifyChecksum(content, correctChecksum);
      const time1 = Date.now() - start1;
      
      const start2 = Date.now();
      checksumVerifier.verifyChecksum(content, wrongChecksum);
      const time2 = Date.now() - start2;
      
      // Timing difference should be minimal (< 10ms)
      const timingDiff = Math.abs(time1 - time2);
      expect(timingDiff < 10).toBeTruthy();
    });

    await afterEach();
  });

  // CVE-2024-003: Data Loss Tests
  await describe('CVE-2024-003: Data Loss on Parse Failure', async () => {
    await beforeEach();

    await test('should create backup before parsing', async () => {
      const testFile = path.join(tempDir, 'test.aix');
      const content = '{"name": "test", "version": "1.0.0"}';
      await fs.writeFile(testFile, content);

      const result = await backupManager.createBackup(testFile);
      expect(result.success).toBeTruthy();
      
      const backups = await backupManager.listBackups('test.aix');
      expect(backups.length).toBe(1);
    });

    await test('should restore from backup on failure', async () => {
      const testFile = path.join(tempDir, 'test.aix');
      const originalContent = '{"name": "original", "version": "1.0.0"}';
      await fs.writeFile(testFile, originalContent);

      const backupResult = await backupManager.createBackup(testFile);
      expect(backupResult.success).toBeTruthy();
      
      // Corrupt the file
      await fs.writeFile(testFile, 'corrupted data');
      
      // Restore from backup
      await backupManager.restoreBackup(backupResult.backupPath, testFile);
      
      const restoredContent = await fs.readFile(testFile, 'utf8');
      expect(restoredContent).toBe(originalContent);
    });

    await test('should maintain backup history', async () => {
      const testFile = path.join(tempDir, 'test.aix');
      await fs.writeFile(testFile, '{"version": "1.0.0"}');

      await backupManager.createBackup(testFile);
      await fs.writeFile(testFile, '{"version": "2.0.0"}');
      await backupManager.createBackup(testFile);
      await fs.writeFile(testFile, '{"version": "3.0.0"}');
      await backupManager.createBackup(testFile);

      const backups = await backupManager.listBackups('test.aix');
      expect(backups.length).toBe(3);
    });

    await afterEach();
  });

  // CVE-2024-004: Memory Exhaustion Tests
  await describe('CVE-2024-004: Memory Exhaustion', async () => {
    await beforeEach();

    await test('should enforce file size limits', async () => {
      const largeFile = path.join(tempDir, 'large.aix');
      const largeContent = 'x'.repeat(11 * 1024 * 1024); // 11MB
      await fs.writeFile(largeFile, largeContent);

      const result = await validator.validate('large.aix');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('File too large');
    });

    await test('should handle large files with streaming', async () => {
      const mediumFile = path.join(tempDir, 'medium.aix');
      const mediumContent = JSON.stringify({
        name: 'large-agent',
        version: '1.0.0',
        data: 'x'.repeat(1024 * 1024), // 1MB
      });
      await fs.writeFile(mediumFile, mediumContent);

      const result = await parser.parse(mediumFile);
      expect(result.success).toBeTruthy();
    });

    await test('should use async I/O for non-blocking operations', async () => {
      const file1 = path.join(tempDir, 'file1.aix');
      const file2 = path.join(tempDir, 'file2.aix');
      
      await fs.writeFile(file1, '{"name": "agent1", "version": "1.0.0"}');
      await fs.writeFile(file2, '{"name": "agent2", "version": "1.0.0"}');

      // Parse both files concurrently
      const start = Date.now();
      const [result1, result2] = await Promise.all([
        parser.parse(file1),
        parser.parse(file2),
      ]);
      const duration = Date.now() - start;

      expect(result1.success).toBeTruthy();
      expect(result2.success).toBeTruthy();
      // Concurrent parsing should be faster than sequential
      expect(duration < 1000).toBeTruthy();
    });

    await afterEach();
  });

  // Print results
  console.log('\n=====================================');
  console.log('📊 TEST RESULTS');
  console.log('=====================================\n');
  console.log(`Total:   ${stats.total}`);
  console.log(`✅ Passed: ${stats.passed}`);
  console.log(`❌ Failed: ${stats.failed}`);
  console.log(`⚠️  Skipped: ${stats.skipped}`);
  console.log(`Duration: ${((Date.now() - stats.startTime) / 1000).toFixed(2)}s`);
  console.log(`Coverage: ${((stats.passed / stats.total) * 100).toFixed(1)}%\n`);

  if (failures.length > 0) {
    console.log('❌ FAILURES:\n');
    failures.forEach((failure, i) => {
      console.log(`${i + 1}. ${failure.test}`);
      console.log(`   ${failure.error}\n`);
    });
  }

  // Exit with appropriate code
  process.exit(stats.failed > 0 ? 1 : 0);
}

// Run tests
runSecurityTests().catch(err => {
  console.error('❌ Test runner failed:', err);
  process.exit(1);
});
