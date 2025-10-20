/**
 * ============================================
 * CREATIVE AGENT API ROUTES
 * Control and monitor GeminiCreativeAgent
 * ============================================
 */

import { Router, Request, Response } from 'express';

const router = Router();

/**
 * Middleware: Ensure creative agent is available
 */
router.use((req: Request, res: Response, next) => {
  if (!req.app.locals.creativeAgent) {
    return res.status(500).json({
      success: false,
      error: 'GeminiCreativeAgent not initialized',
    });
  }
  next();
});

/**
 * GET /api/creative-agent/status
 * Get agent status and statistics
 */
router.get('/status', (req: Request, res: Response) => {
  try {
    const agent = req.app.locals.creativeAgent;
    const status = agent.getStatus();

    res.json({
      success: true,
      status,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/creative-agent/run
 * Trigger manual creative run
 */
router.post('/run', async (req: Request, res: Response) => {
  try {
    const agent = req.app.locals.creativeAgent;

    console.log('🎨 Manual creative run triggered via API');

    const result = await agent.triggerManualRun();

    res.json({
      success: true,
      message: 'Creative run completed',
      data: {
        ideasGenerated: result.ideas.length,
        miniAppsGenerated: result.miniApps.length,
        ideas: result.ideas,
        miniApps: result.miniApps,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Creative run failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/creative-agent/urls
 * Update inspiration URLs
 */
router.post('/urls', (req: Request, res: Response) => {
  try {
    const agent = req.app.locals.creativeAgent;
    const { urls } = req.body;

    if (!Array.isArray(urls)) {
      return res.status(400).json({
        success: false,
        error: 'URLs must be an array',
      });
    }

    agent.setInspirationUrls(urls);

    res.json({
      success: true,
      message: `Updated inspiration URLs (${urls.length} sources)`,
      urls,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/creative-agent/start
 * Start the autonomous agent
 */
router.post('/start', (req: Request, res: Response) => {
  try {
    const agent = req.app.locals.creativeAgent;
    agent.start();

    res.json({
      success: true,
      message: 'GeminiCreativeAgent started',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/creative-agent/stop
 * Stop the autonomous agent
 */
router.post('/stop', (req: Request, res: Response) => {
  try {
    const agent = req.app.locals.creativeAgent;
    agent.stop();

    res.json({
      success: true,
      message: 'GeminiCreativeAgent stopped',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
