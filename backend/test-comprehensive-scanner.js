/**
 * Test Comprehensive Scanner
 * اختبار نظام الفحص الشامل
 */

const path = require('path');
const ComprehensiveScanner = require('./src/tools/ComprehensiveScanner');
const ChatIndexer = require('./src/tools/ChatIndexer');
const CodeScanner = require('./src/tools/CodeScanner');
const CodebaseIndexer = require('./src/tools/CodebaseIndexer');

async function testComprehensiveScanner() {
  console.log('🚀 Starting Comprehensive Scanner Test...\n');

  try {
    // Test 1: Chat Indexing
    console.log('📝 Testing Chat Indexing...');
    const chatResult = await ChatIndexer.indexChatMessage({
      message: 'I need help building a comprehensive scanning tool for my project',
      response:
        "I'll help you create a comprehensive scanning tool that includes chat indexing, code scanning, and codebase indexing capabilities with Arabic language support.",
      context: 'Project development and tool creation',
      topic: 'development',
      metadata: {
        complexity: 0.8,
        intent: 'help_request',
        sentiment: 0.7,
      },
    });
    console.log('✅ Chat Indexing Result:', JSON.stringify(chatResult, null, 2));

    // Test 2: Code Scanning
    console.log('\n🔍 Testing Code Scanning...');
    const codeResult = await CodeScanner.scanProject(process.cwd(), {
      includeTests: false,
      includeNodeModules: false,
      scanDepth: 3,
      languages: ['js', 'ts', 'json'],
    });
    console.log('✅ Code Scanning Result:', {
      totalFiles: codeResult.totalFiles,
      scannedFiles: codeResult.scannedFiles,
      criticalIssues: codeResult.summary.critical,
      highIssues: codeResult.summary.high,
      qualityScore: codeResult.metrics.codeQualityScore,
    });

    // Test 3: Codebase Indexing
    console.log('\n📚 Testing Codebase Indexing...');
    const indexResult = await CodebaseIndexer.indexProject(process.cwd(), {
      includeTests: false,
      includeNodeModules: false,
      maxDepth: 3,
      languages: ['js', 'ts', 'json', 'md'],
    });
    console.log('✅ Codebase Indexing Result:', {
      totalFiles: indexResult.summary.totalFiles,
      totalLines: indexResult.summary.totalLines,
      architectureLevel: indexResult.summary.architectureLevel,
      patternCount: indexResult.summary.patternCount,
    });

    // Test 4: Comprehensive Scanner
    console.log('\n🎯 Testing Comprehensive Scanner...');
    const comprehensiveResult = await ComprehensiveScanner.scanComprehensive(process.cwd(), {
      includeChatIndexing: true,
      includeCodeScanning: true,
      includeCodebaseIndexing: true,
      includeEmailReports: false,
      scanDepth: 3,
      languages: ['js', 'ts', 'json', 'md'],
    });
    console.log('✅ Comprehensive Scanner Result:', {
      scanId: comprehensiveResult.scanId,
      status: comprehensiveResult.status,
      totalIssues: comprehensiveResult.metrics.totalIssues,
      overallQualityScore: comprehensiveResult.metrics.overallQualityScore,
      securityScore: comprehensiveResult.metrics.securityScore,
      recommendations: comprehensiveResult.recommendations.length,
    });

    // Test 5: Health Checks
    console.log('\n🏥 Testing Health Checks...');
    const chatHealth = await ChatIndexer.healthCheck();
    const codeHealth = await CodeScanner.healthCheck();
    const indexHealth = await CodebaseIndexer.healthCheck();
    const comprehensiveHealth = await ComprehensiveScanner.healthCheck();

    console.log('✅ Health Check Results:');
    console.log('- Chat Indexer:', chatHealth.success ? '✅ Healthy' : '❌ Unhealthy');
    console.log('- Code Scanner:', codeHealth.success ? '✅ Healthy' : '❌ Unhealthy');
    console.log('- Codebase Indexer:', indexHealth.success ? '✅ Healthy' : '❌ Unhealthy');
    console.log(
      '- Comprehensive Scanner:',
      comprehensiveHealth.success ? '✅ Healthy' : '❌ Unhealthy'
    );

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Chat Messages Indexed: ${chatResult.success ? '1' : '0'}`);
    console.log(`- Files Scanned: ${codeResult.scannedFiles}/${codeResult.totalFiles}`);
    console.log(`- Codebase Files Indexed: ${indexResult.summary.totalFiles}`);
    console.log(`- Overall Quality Score: ${comprehensiveResult.metrics.overallQualityScore}/100`);
    console.log(`- Security Score: ${comprehensiveResult.metrics.securityScore}/100`);
    console.log(`- Recommendations Generated: ${comprehensiveResult.recommendations.length}`);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
if (require.main === module) {
  testComprehensiveScanner();
}

module.exports = { testComprehensiveScanner };
