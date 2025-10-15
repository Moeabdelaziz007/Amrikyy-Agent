/**
 * Simulation Dashboard Example
 * Created by Cursor - Team Lead
 * 
 * Example showing how to use the simulation dashboard
 * with ping patterns and visual display
 */

const SimulationDashboard = require('../src/aix/SimulationDashboard');
const { logger } = require('../src/utils/logger');

// Create logger for example
const log = logger.child('SimulationDashboardExample');

/**
 * Main example function
 */
async function runSimulationExample() {
  log.info('Starting Simulation Dashboard Example');

  // Create simulation dashboard
  const dashboard = new SimulationDashboard();
  const pingSystem = dashboard.getPingSystem();

  try {
    // Register agents
    await pingSystem.registerAgent('cursor', {
      name: 'Cursor',
      role: 'Team Lead'
    }, ['visual', 'audio', 'data', 'quantum']);

    await pingSystem.registerAgent('ona', {
      name: 'ONA',
      role: 'Documentation Specialist'
    }, ['visual', 'data']);

    await pingSystem.registerAgent('gemini', {
      name: 'Gemini 2.5',
      role: 'Performance Expert'
    }, ['visual', 'audio', 'data', 'quantum']);

    // Start dashboard
    dashboard.start();

    // Wait a moment for display to initialize
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Send various ping patterns
    log.info('Sending ping patterns...');

    // Visual wave pattern
    const wavePattern = pingSystem.createVisualPattern('wave', {
      color: '#00ff00',
      intensity: 1,
      duration: 1000
    });
    await pingSystem.sendPingWithPattern('cursor', 'ona', wavePattern, {
      message: 'Wave pattern from Cursor to ONA',
      priority: 'normal'
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Visual pulse pattern
    const pulsePattern = pingSystem.createVisualPattern('pulse', {
      color: '#ff0000',
      intensity: 1,
      duration: 500
    });
    await pingSystem.sendPingWithPattern('cursor', 'gemini', pulsePattern, {
      message: 'Pulse pattern from Cursor to Gemini',
      priority: 'high'
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Audio chime pattern
    const chimePattern = pingSystem.createAudioPattern('chime', {
      frequency: 800,
      duration: 500,
      volume: 0.7
    });
    await pingSystem.sendPingWithPattern('ona', 'gemini', chimePattern, {
      message: 'Chime pattern from ONA to Gemini',
      priority: 'normal'
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Data status pattern
    const statusPattern = pingSystem.createDataPattern('status', {
      status: 'working',
      progress: 75,
      message: 'Documentation in progress'
    });
    await pingSystem.sendPingWithPattern('ona', 'cursor', statusPattern, {
      message: 'Status update from ONA',
      priority: 'normal'
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Quantum entanglement pattern
    const quantumPattern = pingSystem.createQuantumPattern('entangle', {
      particles: 2,
      coherence: 0.95
    });
    await pingSystem.sendPingWithPattern('gemini', 'cursor', quantumPattern, {
      message: 'Quantum entanglement from Gemini',
      priority: 'high'
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Visual spiral pattern
    const spiralPattern = pingSystem.createVisualPattern('spiral', {
      color: '#0000ff',
      intensity: 1,
      duration: 2000
    });
    await pingSystem.sendPingWithPattern('gemini', 'ona', spiralPattern, {
      message: 'Spiral pattern from Gemini to ONA',
      priority: 'normal'
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Data progress pattern
    const progressPattern = pingSystem.createDataPattern('progress', {
      task: 'Parser Optimization',
      progress: 60,
      stage: 'optimizing',
      eta: '2 hours'
    });
    await pingSystem.sendPingWithPattern('gemini', 'cursor', progressPattern, {
      message: 'Progress update from Gemini',
      priority: 'normal'
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Visual grid pattern
    const gridPattern = pingSystem.createVisualPattern('grid', {
      color: '#ffff00',
      intensity: 1,
      duration: 1500
    });
    await pingSystem.sendPingWithPattern('cursor', 'ona', gridPattern, {
      message: 'Grid pattern from Cursor to ONA',
      priority: 'normal'
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Audio melody pattern
    const melodyPattern = pingSystem.createAudioPattern('melody', {
      notes: ['C4', 'E4', 'G4', 'C5'],
      duration: 1000,
      volume: 0.8
    });
    await pingSystem.sendPingWithPattern('ona', 'gemini', melodyPattern, {
      message: 'Melody pattern from ONA to Gemini',
      priority: 'normal'
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Quantum superposition pattern
    const superpositionPattern = pingSystem.createQuantumPattern('superpose', {
      states: ['|0⟩', '|1⟩'],
      probability: 0.5
    });
    await pingSystem.sendPingWithPattern('cursor', 'gemini', superpositionPattern, {
      message: 'Quantum superposition from Cursor',
      priority: 'high'
    });

    // Let the simulation run for a bit
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Show final status
    log.info('Simulation complete. Final status:');
    const agents = pingSystem.getAllAgentsStatus();
    Object.entries(agents).forEach(([id, agent]) => {
      log.info(`Agent ${id}: ${agent.name} - ${agent.status} - ${agent.patternCount} patterns`);
    });

    const patternHistory = pingSystem.getPatternHistory();
    log.info(`Total patterns sent: ${patternHistory.length}`);

  } catch (error) {
    log.error('Simulation failed', { error: error.message });
    throw error;
  } finally {
    // Stop dashboard
    dashboard.stop();
    log.info('Simulation Dashboard Example completed');
  }
}

// Run example if this file is executed directly
if (require.main === module) {
  runSimulationExample().catch(error => {
    console.error('Example failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runSimulationExample
};