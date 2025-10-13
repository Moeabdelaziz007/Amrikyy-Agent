/**
 * AIX Communication Hub - Usage Examples
 * Demonstrates how agents can communicate using the hub
 */

const { AIXCommunicationHub, MCPAgentBridge } = require('../AIXCommunicationHub');

async function demonstrateCommunication() {
  console.log('🚀 AIX Communication Hub - Demo\n');

  // Initialize the hub
  const hub = new AIXCommunicationHub({
    workspaceRoot: '/workspaces/maya-travel-agent',
    pollInterval: 3000
  });

  await hub.initialize();

  // Register agents
  console.log('\n📝 Registering agents...');
  await hub.registerAgent('cursor', {
    name: 'Cursor (Team Lead)',
    type: 'coordinator',
    capabilities: ['task_management', 'code_review', 'coordination']
  });

  await hub.registerAgent('ona', {
    name: 'ONA (Documentation)',
    type: 'documentation',
    capabilities: ['documentation', 'examples', 'testing']
  });

  await hub.registerAgent('gemini', {
    name: 'Gemini 2.5 (Performance)',
    type: 'optimization',
    capabilities: ['performance', 'optimization', 'validation']
  });

  // Example 1: Send a task to ONA
  console.log('\n📋 Example 1: Creating a task for ONA...');
  await hub.createTask('ona', {
    title: 'Document AIX Communication Hub',
    description: 'Create comprehensive documentation for the new communication system',
    priority: 'high',
    deadline: Date.now() + 3600000, // 1 hour
    requirements: [
      'API documentation',
      'Usage examples',
      'Integration guide'
    ],
    deliverables: [
      'README.md',
      'API_REFERENCE.md',
      'EXAMPLES.md'
    ],
    createdBy: 'cursor'
  });

  // Example 2: Send a message from Cursor to Gemini
  console.log('\n💬 Example 2: Sending message from Cursor to Gemini...');
  await hub.sendMessage('cursor', 'gemini', {
    type: 'request',
    priority: 'normal',
    content: {
      subject: 'Performance Analysis Request',
      body: 'Please analyze the AIXParser.js performance and provide optimization recommendations.',
      deadline: Date.now() + 7200000 // 2 hours
    }
  });

  // Example 3: Broadcast a message to all agents
  console.log('\n📢 Example 3: Broadcasting team update...');
  await hub.broadcastMessage('cursor', {
    type: 'announcement',
    priority: 'normal',
    content: {
      title: 'Team Standup',
      message: 'Great progress today! Keep up the excellent work.',
      nextMeeting: Date.now() + 86400000 // Tomorrow
    }
  });

  // Example 4: ONA sends progress update
  console.log('\n📊 Example 4: ONA sending progress update...');
  await hub.sendProgressUpdate('ona', {
    taskId: 'task_001',
    progress: 45,
    status: 'in_progress',
    completedItems: [
      'Created documentation structure',
      'Wrote API reference',
      'Added usage examples'
    ],
    nextSteps: [
      'Complete integration guide',
      'Add troubleshooting section',
      'Review and polish'
    ],
    notes: 'Making good progress, should finish on time'
  });

  // Example 5: Gemini requests help
  console.log('\n🆘 Example 5: Gemini requesting help...');
  await hub.requestHelp('gemini', 'cursor', {
    issue: 'Performance profiling showing unexpected results',
    context: 'Running node --prof on AIXParser.js',
    whatTried: [
      'Checked for memory leaks',
      'Analyzed CPU usage',
      'Reviewed algorithm complexity'
    ],
    whatNeeded: 'Second opinion on profiling data interpretation',
    urgent: false
  });

  // Example 6: Receive messages
  console.log('\n📬 Example 6: Checking messages for ONA...');
  const onaMessages = await hub.receiveMessages('ona');
  console.log(`ONA has ${onaMessages.length} message(s):`);
  onaMessages.forEach(msg => {
    console.log(`  - [${msg.type}] from ${msg.from} (priority: ${msg.priority})`);
  });

  // Example 7: Update shared state
  console.log('\n🔄 Example 7: Updating shared state...');
  await hub.updateSharedState('project_phase', 'Phase 1: Documentation', 'cursor');
  await hub.updateSharedState('team_mood', 'Excellent 🚀', 'cursor');
  await hub.updateSharedState('blockers_count', 0, 'cursor');

  console.log('Shared state:', hub.getAllSharedState());

  // Example 8: Check agent status
  console.log('\n👥 Example 8: Checking agent status...');
  const allStatus = hub.getAllAgentsStatus();
  allStatus.forEach(agent => {
    const activeIcon = agent.isActive ? '🟢' : '🔴';
    console.log(`  ${activeIcon} ${agent.name} - ${agent.status} (${agent.messageCount} messages sent)`);
  });

  // Example 9: Report a blocker
  console.log('\n🚨 Example 9: Reporting a blocker...');
  await hub.reportBlocker('gemini', {
    title: 'Missing performance benchmarking tool',
    description: 'Need a proper benchmarking framework for accurate measurements',
    impact: 'Cannot provide reliable performance metrics',
    attemptedSolutions: [
      'Tried using console.time()',
      'Attempted manual timing'
    ],
    helpNeeded: 'Recommendation for Node.js benchmarking library'
  });

  // Example 10: MCP Integration
  console.log('\n📡 Example 10: MCP Integration...');
  const mcpBridge = new MCPAgentBridge(hub);
  
  await mcpBridge.registerMCPServer('filesystem', {
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', '/workspaces/maya-travel-agent'],
    description: 'Filesystem access for agents'
  });

  // Simulate sending a message via MCP
  const mcpMessage = await mcpBridge.sendViaMCP('filesystem', 'fs/readFile', {
    path: 'docs/team-communication/ona-progress.md'
  });
  console.log('MCP message format:', JSON.stringify(mcpMessage, null, 2));

  // Listen to hub events
  console.log('\n🎧 Setting up event listeners...');
  hub.on('message:sent', (msg) => {
    console.log(`  📨 Event: Message sent from ${msg.from} to ${msg.to}`);
  });

  hub.on('state:updated', (data) => {
    console.log(`  🔄 Event: State updated - ${data.key} by ${data.agentId}`);
  });

  hub.on('hub:poll', () => {
    console.log('  🔄 Event: Hub polling for updates...');
  });

  // Wait a bit to see polling events
  console.log('\n⏳ Waiting 10 seconds to demonstrate polling...');
  await new Promise(resolve => setTimeout(resolve, 10000));

  // Cleanup
  console.log('\n🛑 Shutting down hub...');
  await hub.shutdown();

  console.log('\n✅ Demo complete!');
}

// Run the demo
if (require.main === module) {
  demonstrateCommunication().catch(console.error);
}

module.exports = { demonstrateCommunication };
