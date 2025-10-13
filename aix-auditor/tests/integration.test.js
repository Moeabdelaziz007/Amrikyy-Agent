#!/usr/bin/env node
/**
 * Integration Tests - Full workflow testing
 * Tests complete end-to-end scenarios
 * 
 * @author Claude 4.5 Sonnet
 * @version 1.0.0
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const assert = require('assert');
const AsyncAIXParser = require('../src/core/async-parser');
const FileValidator = require('../src/core/file-validator');
const ChecksumVerifier = require('../src/core/checksum-verifier');
const BackupManager = require('../src/core/backup');
const PatternCollector = require('../src/pattern-agent/pattern-collector');

// Test statistics
const stats = {
  total: 0,
  passed: 0,
  failed: 0,
  startTime: Date.now(),
};

const failures = [];

// Helper functions
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
      failures.push({ test: name, error: err.message });
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
    toContain(item) {
      assert.ok(value.includes(item));
    },
  };
}

// Test fixtures
let tempDir;

async function beforeEach() {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aix-integration-'));
}

async function afterEach() {
  if (tempDir) {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

async function runIntegrationTests() {
  console.log('\n🔗 AIX AUDITOR - INTEGRATION TESTS');
  console.log('===================================\n');

  // Test 1: Full Audit Workflow
  await describe('Full Audit Workflow: Scan → Parse → Validate', async () => {
    await beforeEach();

    await test('should audit valid AIX file end-to-end', async () => {
      // Create test file
      const testFile = path.join(tempDir, 'agent.aix');
      const agentData = {
        name: 'test-agent',
        version: '1.0.0',
        description: 'Test agent',
        security: {
          encryption_algorithm: 'AES-256-GCM',
          authentication: { type: 'oauth2' },
          rate_limiting: { requests_per_minute: 60 },
        },
      };
      await fs.writeFile(testFile, JSON.stringify(agentData, null, 2));

      // Step 1: Validate
      const validator = new FileValidator({ baseDirectory: tempDir });
      const validation = await validator.validate('agent.aix');
      expect(validation.valid).toBeTruthy();

      // Step 2: Parse
      const parser = new AsyncAIXParser({ validator });
      const parseResult = await parser.parse(testFile);
      expect(parseResult.success).toBeTruthy();
      expect(parseResult.data.name).toBe('test-agent');

      // Step 3: Verify checksum
      const checksumVerifier = new ChecksumVerifier();
      const content = await fs.readFile(testFile, 'utf8');
      const checksum = checksumVerifier.calculateChecksum(content);
      const verifyResult = checksumVerifier.verifyChecksum(content, checksum);
      expect(verifyResult.valid).toBeTruthy();
    });

    await test('should handle invalid file gracefully', async () => {
      const invalidFile = path.join(tempDir, 'invalid.aix');
      await fs.writeFile(invalidFile, 'not valid json');

      const parser = new AsyncAIXParser();
      
      try {
        await parser.parse(invalidFile);
        throw new Error('Should have thrown');
      } catch (err) {
        // Parser throws on invalid JSON
        expect(err.message.includes('JSON') || err.message.includes('Parse')).toBeTruthy();
      }
    });

    await afterEach();
  });

  // Test 2: Backup and Restore Workflow
  await describe('Backup and Restore Workflow', async () => {
    await beforeEach();

    await test('should backup, modify, and restore file', async () => {
      const testFile = path.join(tempDir, 'agent.aix');
      const originalData = { name: 'original', version: '1.0.0' };
      await fs.writeFile(testFile, JSON.stringify(originalData));

      const backupManager = new BackupManager({ 
        backupDir: path.join(tempDir, '.backups') 
      });

      // Create backup
      const backupResult = await backupManager.createBackup(testFile);
      expect(backupResult.success).toBeTruthy();

      // Modify file
      const modifiedData = { name: 'modified', version: '2.0.0' };
      await fs.writeFile(testFile, JSON.stringify(modifiedData));

      // Verify modification
      let content = await fs.readFile(testFile, 'utf8');
      expect(content).toContain('modified');

      // Restore from backup
      await backupManager.restoreBackup(backupResult.backupPath, testFile);

      // Verify restoration
      content = await fs.readFile(testFile, 'utf8');
      expect(content).toContain('original');
    });

    await afterEach();
  });

  // Test 3: Pattern Collection Workflow
  await describe('Pattern Collection Workflow', async () => {
    await test('should collect patterns from multiple agents', async () => {
      await beforeEach();
      
      // Create subdirectory for agents
      const agentsDir = path.join(tempDir, 'agents');
      await fs.mkdir(agentsDir);

      // Create multiple test agents
      const agents = [
        {
          name: 'agent1',
          version: '1.0.0',
          security: {
            encryption_algorithm: 'AES-256-GCM',
            rate_limiting: { requests_per_minute: 60 },
          },
        },
        {
          name: 'agent2',
          version: '1.0.0',
          security: {
            encryption_algorithm: 'AES-256-GCM',
            rate_limiting: { requests_per_minute: 120 },
          },
        },
        {
          name: 'agent3',
          version: '2.0.0',
          security: {
            encryption_algorithm: 'ChaCha20-Poly1305',
            rate_limiting: { requests_per_minute: 60 },
          },
        },
      ];

      for (let i = 0; i < agents.length; i++) {
        const filePath = path.join(agentsDir, `agent${i + 1}.json`);
        await fs.writeFile(filePath, JSON.stringify(agents[i], null, 2));
      }

      // Collect patterns
      const collector = new PatternCollector({ includeInvalid: false });
      const result = await collector.collect(agentsDir, { basePath: tempDir });

      expect(result.success).toBeTruthy();
      expect(result.summary.parsedAgents).toBe(3);
      
      // Verify pattern extraction
      expect(result.patterns.encryption['AES-256-GCM']).toBe(2);
      expect(result.patterns.encryption['ChaCha20-Poly1305']).toBe(1);
      expect(result.patterns.rateLimit['60']).toBe(2);
      expect(result.patterns.rateLimit['120']).toBe(1);
      
      await afterEach();
    });

    await test('should handle mixed valid and invalid files', async () => {
      await beforeEach();
      
      const agentsDir = path.join(tempDir, 'agents');
      await fs.mkdir(agentsDir);

      // Create valid file
      await fs.writeFile(
        path.join(agentsDir, 'valid.json'),
        JSON.stringify({ name: 'valid', version: '1.0.0' })
      );

      // Create invalid file
      await fs.writeFile(path.join(agentsDir, 'invalid.json'), 'not json');

      const collector = new PatternCollector({ includeInvalid: false });
      const result = await collector.collect(agentsDir, { basePath: tempDir });

      expect(result.success).toBeTruthy();
      expect(result.summary.parsedAgents).toBe(1);
      expect(result.parse.parseErrors.length).toBe(1);
      
      await afterEach();
    });
  });

  // Test 4: Error Handling and Recovery
  await describe('Error Handling and Recovery', async () => {
    await beforeEach();

    await test('should recover from parse errors with backup', async () => {
      const testFile = path.join(tempDir, 'agent.aix');
      const validData = { name: 'agent', version: '1.0.0' };
      await fs.writeFile(testFile, JSON.stringify(validData));

      const backupManager = new BackupManager({ 
        backupDir: path.join(tempDir, '.backups') 
      });
      const parser = new AsyncAIXParser();

      // Create backup
      const backupResult = await backupManager.createBackup(testFile);
      expect(backupResult.success).toBeTruthy();

      // Corrupt file
      await fs.writeFile(testFile, 'corrupted data');

      // Try to parse (should fail)
      try {
        await parser.parse(testFile);
        throw new Error('Should have thrown');
      } catch (err) {
        // Parser throws on invalid JSON
        expect(err.message.includes('JSON') || err.message.includes('Parse')).toBeTruthy();
      }

      // Restore from backup
      await backupManager.restoreBackup(backupResult.backupPath, testFile);

      // Parse again (should succeed)
      const retryResult = await parser.parse(testFile);
      expect(retryResult.success).toBeTruthy();
      expect(retryResult.data.name).toBe('agent');
    });

    await test('should handle concurrent file operations', async () => {
      const files = [];
      for (let i = 0; i < 5; i++) {
        const filePath = path.join(tempDir, `agent${i}.aix`);
        await fs.writeFile(
          filePath,
          JSON.stringify({ name: `agent${i}`, version: '1.0.0' })
        );
        files.push(filePath);
      }

      const parser = new AsyncAIXParser();

      // Parse all files concurrently
      const results = await Promise.all(
        files.map(file => parser.parse(file))
      );

      // All should succeed
      expect(results.every(r => r.success)).toBeTruthy();
      expect(results.length).toBe(5);
    });

    await afterEach();
  });

  // Test 5: Security Validation Chain
  await describe('Security Validation Chain', async () => {
    await beforeEach();

    await test('should enforce all security checks in sequence', async () => {
      const testFile = path.join(tempDir, 'secure-agent.aix');
      const agentData = {
        name: 'secure-agent',
        version: '1.0.0',
        security: {
          encryption_algorithm: 'AES-256-GCM',
        },
      };
      await fs.writeFile(testFile, JSON.stringify(agentData, null, 2));

      const validator = new FileValidator({ 
        baseDirectory: tempDir,
        maxFileSize: 1024 * 1024, // 1MB
      });
      const checksumVerifier = new ChecksumVerifier();
      const parser = new AsyncAIXParser({ validator });

      // 1. Path validation
      const safePath = await validator.validatePath('secure-agent.aix');
      expect(safePath).toContain('secure-agent.aix');

      // 2. Size validation
      await validator.validateSize(safePath);

      // 3. Extension validation
      validator.validateExtension(safePath);

      // 4. Parse validation
      const parseResult = await parser.parse(testFile);
      expect(parseResult.success).toBeTruthy();

      // 5. Checksum validation
      const content = await fs.readFile(testFile, 'utf8');
      const checksum = checksumVerifier.calculateChecksum(content);
      const verifyResult = checksumVerifier.verifyChecksum(content, checksum);
      expect(verifyResult.valid).toBeTruthy();
    });

    await afterEach();
  });

  // Print results
  console.log('\n===================================');
  console.log('📊 INTEGRATION TEST RESULTS');
  console.log('===================================\n');
  console.log(`Total:   ${stats.total}`);
  console.log(`✅ Passed: ${stats.passed}`);
  console.log(`❌ Failed: ${stats.failed}`);
  console.log(`Duration: ${((Date.now() - stats.startTime) / 1000).toFixed(2)}s`);
  console.log(`Coverage: ${((stats.passed / stats.total) * 100).toFixed(1)}%\n`);

  if (failures.length > 0) {
    console.log('❌ FAILURES:\n');
    failures.forEach((failure, i) => {
      console.log(`${i + 1}. ${failure.test}`);
      console.log(`   ${failure.error}\n`);
    });
  }

  process.exit(stats.failed > 0 ? 1 : 0);
}

// Run tests
runIntegrationTests().catch(err => {
  console.error('❌ Test runner failed:', err);
  process.exit(1);
});
