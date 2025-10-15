#!/usr/bin/env node

/**
 * AIX 3.0 - Simple Agent Communication
 * Natural language communication between agents
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. NATURAL LANGUAGE COMMUNICATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class AgentMessage {
  /**
   * Parse natural language message
   * @param {string} message - Natural language message
   * @returns {object} Parsed message
   */
  static parse(message) {
    // Extract recipient
    const recipientMatch = message.match(/@(\w+)/);
    const recipient = recipientMatch ? recipientMatch[1] : 'all';
    
    // Extract action
    const actionMatch = message.match(/:(\w+)/);
    const action = actionMatch ? actionMatch[1] : 'inform';
    
    // Extract priority
    const priorityMatch = message.match(/:(critical|high|normal|low)/);
    const priority = priorityMatch ? priorityMatch[1] : 'normal';
    
    // Extract content
    let content = message
      .replace(/@\w+/g, '')
      .replace(/:\w+/g, '')
      .trim()
      .replace(/^["']|["']$/g, '');
    
    return {
      recipient,
      action,
      priority,
      content,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Format message for display
   * @param {object} parsed - Parsed message
   * @returns {string} Formatted message
   */
  static format(parsed) {
    const emoji = {
      request: '📋',
      inform: 'ℹ️',
      propose: '💡',
      query: '❓',
      agree: '✅',
      refuse: '❌',
      complete: '✓'
    };
    
    const priorityEmoji = {
      critical: '🔴',
      high: '🟡',
      normal: '🟢',
      low: '⚪'
    };
    
    return `${emoji[parsed.action] || '💬'} ${priorityEmoji[parsed.priority]} @${parsed.recipient}: ${parsed.content}`;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. AGENT CLASS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class Agent {
  constructor(name, role, capabilities = []) {
    this.name = name;
    this.role = role;
    this.capabilities = capabilities;
    this.load = 0; // 0-100%
    this.status = 'online';
    this.trustScores = {}; // Trust scores for other agents
  }
  
  /**
   * Send message to another agent
   * @param {string} message - Natural language message
   */
  send(message) {
    const parsed = AgentMessage.parse(message);
    const formatted = AgentMessage.format(parsed);
    
    console.log(`\n[${this.name}] → ${formatted}`);
    
    return parsed;
  }
  
  /**
   * Receive and process message
   * @param {object} message - Parsed message
   */
  receive(message) {
    console.log(`\n[${this.name}] ← Received: ${message.content}`);
    
    // Auto-respond based on action
    if (message.action === 'request') {
      return this.handleRequest(message);
    } else if (message.action === 'query') {
      return this.handleQuery(message);
    }
  }
  
  /**
   * Handle request
   * @param {object} message - Request message
   */
  handleRequest(message) {
    // Check if agent can handle the request
    const canHandle = this.load < 80; // Not overloaded
    
    if (canHandle) {
      this.load += 20;
      return this.send(`@${message.sender} :agree "I'll handle it. ETA 15 mins."`);
    } else {
      return this.send(`@${message.sender} :refuse "I'm at ${this.load}% capacity. Can't take more tasks."`);
    }
  }
  
  /**
   * Handle query
   * @param {object} message - Query message
   */
  handleQuery(message) {
    return this.send(`@${message.sender} :inform "My status: ${this.status}, Load: ${this.load}%"`);
  }
  
  /**
   * Update trust score for another agent
   * @param {string} agentName - Agent name
   * @param {number} delta - Change in trust (-1 to +1)
   */
  updateTrust(agentName, delta) {
    if (!this.trustScores[agentName]) {
      this.trustScores[agentName] = 0.5; // Initial trust
    }
    
    this.trustScores[agentName] = Math.max(0, Math.min(1, 
      this.trustScores[agentName] + delta
    ));
    
    console.log(`\n[${this.name}] Trust in ${agentName}: ${(this.trustScores[agentName] * 100).toFixed(0)}%`);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. SWARM COORDINATOR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class Swarm {
  constructor() {
    this.agents = new Map();
    this.sharedState = {
      activeTasks: 0,
      systemHealth: 1.0,
      recentActivity: []
    };
  }
  
  /**
   * Register agent
   * @param {Agent} agent - Agent instance
   */
  register(agent) {
    this.agents.set(agent.name, agent);
    console.log(`\n✅ Agent registered: ${agent.name} (${agent.role})`);
  }
  
  /**
   * Broadcast message to all agents
   * @param {string} message - Message to broadcast
   */
  broadcast(message) {
    console.log(`\n📢 Broadcasting: ${message}`);
    
    this.agents.forEach(agent => {
      const parsed = AgentMessage.parse(message);
      parsed.sender = 'system';
      agent.receive(parsed);
    });
  }
  
  /**
   * Route message between agents
   * @param {string} from - Sender agent name
   * @param {string} message - Message
   */
  route(from, message) {
    const parsed = AgentMessage.parse(message);
    parsed.sender = from;
    
    if (parsed.recipient === 'all') {
      // Broadcast to all
      this.broadcast(message);
    } else {
      // Send to specific agent
      const recipient = this.agents.get(parsed.recipient);
      if (recipient) {
        recipient.receive(parsed);
      } else {
        console.log(`\n❌ Agent not found: ${parsed.recipient}`);
      }
    }
  }
  
  /**
   * Get swarm status
   * @returns {object} Status
   */
  getStatus() {
    const status = {
      totalAgents: this.agents.size,
      onlineAgents: 0,
      averageLoad: 0,
      sharedState: this.sharedState
    };
    
    let totalLoad = 0;
    this.agents.forEach(agent => {
      if (agent.status === 'online') {
        status.onlineAgents++;
        totalLoad += agent.load;
      }
    });
    
    status.averageLoad = status.onlineAgents > 0 
      ? (totalLoad / status.onlineAgents).toFixed(1)
      : 0;
    
    return status;
  }
  
  /**
   * Display swarm status
   */
  displayStatus() {
    const status = this.getStatus();
    
    console.log('\n' + '═'.repeat(60));
    console.log('📊 SWARM STATUS');
    console.log('═'.repeat(60));
    console.log(`Total Agents: ${status.totalAgents}`);
    console.log(`Online: ${status.onlineAgents}`);
    console.log(`Average Load: ${status.averageLoad}%`);
    console.log(`System Health: ${(status.sharedState.systemHealth * 100).toFixed(0)}%`);
    console.log('═'.repeat(60));
    
    console.log('\n👥 AGENT DETAILS:');
    this.agents.forEach(agent => {
      const statusEmoji = agent.status === 'online' ? '🟢' : '🔴';
      const loadBar = '█'.repeat(Math.floor(agent.load / 10)) + '░'.repeat(10 - Math.floor(agent.load / 10));
      console.log(`${statusEmoji} ${agent.name.padEnd(15)} [${loadBar}] ${agent.load}%`);
    });
    console.log('═'.repeat(60) + '\n');
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. DEMO SCENARIOS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function demoScenario1() {
  console.log('\n' + '🎬 SCENARIO 1: Simple Task Assignment'.padEnd(60, '='));
  
  const swarm = new Swarm();
  
  // Create agents
  const maya = new Agent('maya', 'Travel Assistant', ['destination_search', 'budget_planning']);
  const kelo = new Agent('kelo', 'AI Recommender', ['recommendations', 'personalization']);
  const ona = new Agent('ona', 'Orchestrator', ['coordination', 'monitoring']);
  
  // Register agents
  swarm.register(maya);
  swarm.register(kelo);
  swarm.register(ona);
  
  // Scenario
  console.log('\n📝 User asks: "Find me destinations in Egypt"');
  
  ona.send('@maya :request :high "Find destinations in Egypt for summer travel"');
  swarm.route('ona', '@maya :request :high "Find destinations in Egypt for summer travel"');
  
  setTimeout(() => {
    maya.send('@ona :complete "Found 5 destinations: Cairo, Luxor, Aswan, Alexandria, Hurghada"');
    maya.load -= 20;
    ona.updateTrust('maya', 0.05); // Increase trust
  }, 1000);
  
  setTimeout(() => {
    swarm.displayStatus();
  }, 1500);
}

function demoScenario2() {
  console.log('\n' + '🎬 SCENARIO 2: Load Balancing'.padEnd(60, '='));
  
  const swarm = new Swarm();
  
  const agent1 = new Agent('agent1', 'Worker');
  const agent2 = new Agent('agent2', 'Worker');
  const agent3 = new Agent('agent3', 'Worker');
  
  agent1.load = 85; // Overloaded
  agent2.load = 45;
  agent3.load = 30;
  
  swarm.register(agent1);
  swarm.register(agent2);
  swarm.register(agent3);
  
  console.log('\n📝 New task arrives...');
  
  agent1.send('@all :request "Need help, I\'m overloaded"');
  
  setTimeout(() => {
    agent2.send('@agent1 :agree "I can take some tasks"');
    agent1.load -= 30;
    agent2.load += 30;
  }, 500);
  
  setTimeout(() => {
    swarm.displayStatus();
  }, 1000);
}

function demoScenario3() {
  console.log('\n' + '🎬 SCENARIO 3: Emergency Response'.padEnd(60, '='));
  
  const swarm = new Swarm();
  
  const maya = new Agent('maya', 'Travel Assistant');
  const kelo = new Agent('kelo', 'AI Recommender');
  const ona = new Agent('ona', 'Orchestrator');
  
  swarm.register(maya);
  swarm.register(kelo);
  swarm.register(ona);
  
  console.log('\n🔴 CRITICAL: System error detected!');
  
  ona.send('@all :request :critical "Emergency! Database connection lost!"');
  swarm.route('ona', '@all :request :critical "Emergency! Database connection lost!"');
  
  setTimeout(() => {
    maya.send('@ona :inform "Switching to backup database"');
    kelo.send('@ona :inform "Caching recent data"');
  }, 500);
  
  setTimeout(() => {
    ona.send('@all :inform "✓ System recovered. All agents operational"');
    swarm.sharedState.systemHealth = 1.0;
  }, 1000);
  
  setTimeout(() => {
    swarm.displayStatus();
  }, 1500);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. MAIN EXECUTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console.log('\n' + '═'.repeat(60));
console.log('🚀 AIX 3.0 - Simple Agent Communication Demo');
console.log('═'.repeat(60));

// Run scenarios
demoScenario1();

setTimeout(() => {
  demoScenario2();
}, 3000);

setTimeout(() => {
  demoScenario3();
}, 6000);

setTimeout(() => {
  console.log('\n' + '═'.repeat(60));
  console.log('✅ Demo Complete!');
  console.log('═'.repeat(60) + '\n');
}, 9000);
