const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

/**
 * GET /api/dashboard/status
 * Provides a summary of the project's status for the Chrome extension dashboard.
 */
router.get('/status', async (req, res) => {
    try {
        // In the future, this will fetch live data from Vercel/Railway APIs.
        const deploymentStatus = "All systems operational. Last deploy: 2025-01-20 15:30 UTC";

        // Read test summary from the latest report
        const testReportPath = path.join(__dirname, '../../docs/reports/API_TEST_RUN_REPORT.md');
        const testReportContent = await fs.readFile(testReportPath, 'utf8');
        const testMatch = testReportContent.match(/✅ \*\*نجاح كامل \(100% Passed\)\*\*/);
        const testSummary = testMatch ? "API Tests: 100% Passed" : "API Tests: Status Unknown";

        // In the future, this will fetch live agent status from Redis or a database.
        const agentActivity = "All agents idle. Last activity: 15 mins ago.";

        res.json({
            success: true,
            deploymentStatus,
            testSummary,
            agentActivity,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching dashboard status:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch dashboard status' });
    }
});

module.exports = router;