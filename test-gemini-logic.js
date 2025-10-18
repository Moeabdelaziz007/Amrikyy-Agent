
const { EnhancedModelSwitcher } = require('./backend/src/ai/EnhancedModelSwitcher.js');
const { GeminiComputerControlService } = require('./backend/src/services/GeminiComputerControlService.js');

async function runTests() {
  console.log('🧪 Running Gemini 2.5 Feature Tests...');
  console.log('========================================');

  // Test 1: Model Switcher
  console.log('1️⃣  Testing EnhancedModelSwitcher...');
  const switcher = new EnhancedModelSwitcher();
  let passed = 0;
  let failed = 0;
  let skipped = 0;

  // Test case 1.1: General question -> should select gemini-2.5
  let model = await switcher.selectOptimalModel('What is the capital of France?');
  if (model === 'gemini-2.5') {
    console.log('  ✅ Test 1.1 PASSED: General question selected gemini-2.5');
    passed++;
  } else {
    console.log(`  ❌ Test 1.1 FAILED: Expected gemini-2.5, but got ${model}`);
    failed++;
  }

  // Test case 1.2: Computer control task -> should select gemini-2.5
  model = await switcher.selectOptimalModel('list all files in the current directory');
  if (model === 'gemini-2.5') {
    console.log('  ✅ Test 1.2 PASSED: Computer control task selected gemini-2.5');
    passed++;
  } else {
    console.log(`  ❌ Test 1.2 FAILED: Expected gemini-2.5, but got ${model}`);
    failed++;
  }

  // Test case 1.3: Arabic question -> should select zai-glm-4.6
  model = await switcher.selectOptimalModel('ما هي عاصمة مصر؟');
  if (model === 'zai-glm-4.6') {
    console.log('  ✅ Test 1.3 PASSED: Arabic question selected zai-glm-4.6');
    passed++;
  } else {
    console.log(`  ❌ Test 1.3 FAILED: Expected zai-glm-4.6, but got ${model}`);
    failed++;
  }
  console.log('----------------------------------------');


  // Test 2: Computer Control Service
  console.log('2️⃣  Testing GeminiComputerControlService...');
  const computerControl = new GeminiComputerControlService();

  // Test case 2.1: Safe, read-only command
  // This test depends on having a GEMINI_API_KEY in the environment.
  if (computerControl.enabled) {
    console.log('  (Note: This test makes a real API call to Gemini)');
    const result = await computerControl.executeCommand('list files in the root directory');
    if (result.success && result.result.operation === 'list') {
        console.log('  ✅ Test 2.1 PASSED: Safe command executed successfully.');
        passed++;
    } else {
        console.log('  ❌ Test 2.1 FAILED: Safe command execution failed.', result.error || '');
        failed++;
    }
  } else {
    console.log('  ⚠️ Test 2.1 SKIPPED: GEMINI_API_KEY not set.');
    skipped++;
  }


  // Test case 2.2: Dangerous command blocking
  const dangerousResult = await computerControl.executeCommand('rm -rf /');
  if (dangerousResult.success === false && dangerousResult.blocked === true) {
    console.log('  ✅ Test 2.2 PASSED: Dangerous command was blocked.');
    passed++;
  } else {
    console.log('  ❌ Test 2.2 FAILED: Dangerous command was not blocked.');
    failed++;
  }
  console.log('========================================');

  // Summary
  console.log('📊 Test Summary:');
  console.log(`  Total tests: ${passed + failed + skipped}`);
  console.log(`  Passed: ${passed}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Skipped: ${skipped}`);

  if (failed > 0) {
    console.log('\n❌ Some tests failed.');
    process.exit(1);
  } else {
    console.log('\n✅ All Gemini feature tests passed!');
    process.exit(0);
  }
}

runTests();
