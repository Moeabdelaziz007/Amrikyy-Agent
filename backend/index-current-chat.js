/**
 * Index Current Chat Conversation
 * فهرسة محادثة الدردشة الحالية
 */

const ChatIndexer = require('./src/tools/ChatIndexer');

async function indexCurrentChat() {
  console.log('📝 Indexing current chat conversation...\n');

  try {
    // Index our conversation about building the comprehensive scanning tool
    const conversation = [
      {
        message:
          'now i want you following same research steps but for build a scaning tools looks for bugs or server denger issue or looks for making the codding better quality and indixed wall and easy to understand but first index our chat here',
        response:
          "I'll create a comprehensive scanning tool that indexes our chat and then analyzes the codebase for bugs, security issues, and code quality improvements. Let me start by indexing our conversation and then build the scanning system.",
        context: 'Request for comprehensive scanning tool development',
        topic: 'development',
        metadata: {
          complexity: 0.9,
          intent: 'feature_request',
          sentiment: 0.8,
          language: 'en',
        },
      },
      {
        message:
          'also add to tool report at the end for skilss or code qulity or key work or laerned pattern to the memory and my gmail',
        response:
          "I'll enhance the ChatIndexer tool to include skill reports, code quality analysis, key work tracking, learned patterns, and email notifications. Let me update the tool with comprehensive reporting capabilities.",
        context: 'Enhancement request for reporting and email notifications',
        topic: 'enhancement',
        metadata: {
          complexity: 0.8,
          intent: 'feature_request',
          sentiment: 0.9,
          language: 'en',
        },
      },
    ];

    const results = [];

    for (const chat of conversation) {
      const result = await ChatIndexer.indexChatMessage(chat);
      results.push(result);
      console.log(`✅ Indexed message: "${chat.message.substring(0, 50)}..."`);
    }

    // Get insights and reports
    console.log('\n📊 Generating reports...');

    const insights = await ChatIndexer.getInsights('development');
    const skillReport = await ChatIndexer.generateSkillReport('development');
    const codeQuality = await ChatIndexer.getCodeQualityMetrics('development');
    const learnedPatterns = await ChatIndexer.getLearnedPatterns('development');

    console.log('\n🎯 Chat Indexing Results:');
    console.log(`- Messages Indexed: ${results.length}`);
    console.log(`- Success Rate: ${results.filter((r) => r.success).length}/${results.length}`);

    console.log('\n💡 Insights:');
    console.log(`- Total Messages: ${insights.totalMessages}`);
    console.log(
      `- Top Intents: ${insights.topIntents?.map((i) => `${i[0]} (${i[1]})`).join(', ') || 'None'}`
    );

    console.log('\n🎓 Skill Report:');
    console.log(`- Total Skills: ${skillReport.totalSkills}`);
    console.log(
      `- Top Skills: ${
        skillReport.topSkills
          ?.slice(0, 3)
          .map((s) => `${s.skill} (${s.proficiency})`)
          .join(', ') || 'None'
      }`
    );

    console.log('\n🔍 Code Quality:');
    console.log(`- Overall Score: ${codeQuality.overallScore}`);
    console.log(`- Readability: ${codeQuality.metrics.readability}`);
    console.log(`- Maintainability: ${codeQuality.metrics.maintainability}`);

    console.log('\n🧠 Learned Patterns:');
    console.log(`- Total Patterns: ${learnedPatterns.totalPatterns}`);
    console.log(`- Code Patterns: ${learnedPatterns.patterns.codePatterns?.length || 0}`);
    console.log(`- Problem Patterns: ${learnedPatterns.patterns.problemPatterns?.length || 0}`);

    // Health check
    const health = await ChatIndexer.healthCheck();
    console.log('\n🏥 Health Status:', health.success ? '✅ Healthy' : '❌ Unhealthy');

    console.log('\n🎉 Chat indexing completed successfully!');

    return {
      success: true,
      indexedMessages: results.length,
      insights,
      skillReport,
      codeQuality,
      learnedPatterns,
      health,
    };
  } catch (error) {
    console.error('❌ Chat indexing failed:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Run the indexing
if (require.main === module) {
  indexCurrentChat();
}

module.exports = { indexCurrentChat };
