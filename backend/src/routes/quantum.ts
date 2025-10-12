import express, { Request, Response } from 'express';
import { QuantumSystemV3 } from '../quantum/QuantumSystemV3';
import { Registry } from 'prom-client';

const router = express.Router();

// Store active quantum systems (in production, use Redis)
const activeSystems = new Map<
  string,
  {
    system: QuantumSystemV3;
    startTime: number;
    status: string;
  }
>();

// Prometheus registry (shared across all systems)
const promRegistry = new Registry();

/**
 * POST /api/quantum/start
 * Start a new quantum system run
 */
router.post('/start', async (req: Request, res: Response) => {
  try {
    const { config } = req.body;

    // Create new system instance with Prometheus
    const system = new QuantumSystemV3(promRegistry, config);

    // Generate unique run ID
    const runId = `run-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Store system
    activeSystems.set(runId, {
      system,
      startTime: Date.now(),
      status: 'running',
    });

    // Set up event listeners for real-time logging
    system.on('log', (logEntry) => {
      // In production, send to centralized logging (e.g., Winston, Sentry)
      console.log(`[${runId}]`, JSON.stringify(logEntry));
    });

    system.on('metricsUpdate', (metrics) => {
      // In production, send to monitoring service
      console.log(`[${runId}] Metrics:`, metrics);
    });

    res.json({
      success: true,
      runId,
      message: 'Quantum system started successfully',
      startTime: Date.now(),
    });
  } catch (error: any) {
    console.error('Error starting quantum system:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to start quantum system',
    });
  }
});

/**
 * GET /api/quantum/status/:runId
 * Get current status and metrics for a specific run
 */
router.get('/status/:runId', (req: Request, res: Response) => {
  try {
    const { runId } = req.params;
    const run = activeSystems.get(runId);

    if (!run) {
      return res.status(404).json({
        success: false,
        error: 'Quantum system run not found',
      });
    }

    const metrics = run.system.getMetrics();
    const uptime = Date.now() - run.startTime;

    res.json({
      success: true,
      runId,
      status: run.status,
      uptime,
      uptimeFormatted: `${Math.floor(uptime / 1000)}s`,
      metrics,
    });
  } catch (error: any) {
    console.error('Error getting status:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get status',
    });
  }
});

/**
 * POST /api/quantum/process/:runId
 * Process a request through the quantum system
 */
router.post('/process/:runId', async (req: Request, res: Response) => {
  try {
    const { runId } = req.params;
    const { request, scenario } = req.body;

    if (!request || !scenario) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: request and scenario',
      });
    }

    const run = activeSystems.get(runId);

    if (!run) {
      return res.status(404).json({
        success: false,
        error: 'Quantum system run not found',
      });
    }

    // Process the request
    const result = await run.system.processRequest(request, scenario);

    res.json({
      success: true,
      result,
      currentMetrics: run.system.getMetrics(),
    });
  } catch (error: any) {
    console.error('Error processing request:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process request',
    });
  }
});

/**
 * DELETE /api/quantum/:runId
 * Stop and cleanup a quantum system
 */
router.delete('/:runId', (req: Request, res: Response) => {
  try {
    const { runId } = req.params;
    const run = activeSystems.get(runId);

    if (!run) {
      return res.status(404).json({
        success: false,
        error: 'Quantum system run not found',
      });
    }

    // Get final metrics before cleanup
    const finalMetrics = run.system.getMetrics();

    // Cleanup
    run.system.destroy();
    run.status = 'stopped';
    activeSystems.delete(runId);

    res.json({
      success: true,
      message: 'Quantum system stopped successfully',
      finalMetrics,
    });
  } catch (error: any) {
    console.error('Error stopping system:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to stop system',
    });
  }
});

/**
 * GET /api/quantum/metrics
 * Get Prometheus metrics for all active systems
 */
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    res.set('Content-Type', promRegistry.contentType);
    res.end(await promRegistry.metrics());
  } catch (error: any) {
    console.error('Error getting metrics:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get Prometheus metrics',
    });
  }
});

/**
 * GET /api/quantum/list
 * List all active quantum systems
 */
router.get('/list', (req: Request, res: Response) => {
  try {
    const systems = Array.from(activeSystems.entries()).map(([runId, run]) => {
      const uptime = Date.now() - run.startTime;
      return {
        runId,
        status: run.status,
        startTime: run.startTime,
        uptime,
        uptimeFormatted: `${Math.floor(uptime / 1000)}s`,
        metrics: run.system.getMetrics(),
      };
    });

    res.json({
      success: true,
      count: systems.length,
      systems,
    });
  } catch (error: any) {
    console.error('Error listing systems:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to list systems',
    });
  }
});

/**
 * GET /api/quantum/health
 * Health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'healthy',
    activeSystemsCount: activeSystems.size,
    timestamp: Date.now(),
  });
});

// Cleanup job: Remove old/stale systems periodically
const CLEANUP_INTERVAL = parseInt(
  process.env.QUANTUM_CLEANUP_INTERVAL_MS || '300000'
); // 5 minutes
const MAX_ACTIVE_SYSTEMS = parseInt(
  process.env.QUANTUM_MAX_ACTIVE_SYSTEMS || '10'
);
const MAX_SYSTEM_AGE = 3600000; // 1 hour

setInterval(() => {
  const now = Date.now();

  for (const [runId, run] of activeSystems.entries()) {
    const age = now - run.startTime;

    // Remove if too old or if we have too many systems
    if (age > MAX_SYSTEM_AGE || activeSystems.size > MAX_ACTIVE_SYSTEMS) {
      console.log(
        `🧹 Auto-cleanup: Removing quantum system ${runId} (age: ${Math.floor(
          age / 1000
        )}s)`
      );
      run.system.destroy();
      activeSystems.delete(runId);
    }
  }
}, CLEANUP_INTERVAL);

export default router;
