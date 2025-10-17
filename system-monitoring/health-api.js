import express from 'express';
import SystemHealthManager from '../system-health-manager.js';

const app = express();
const healthManager = new SystemHealthManager();

app.use(express.json());
app.use(express.static('.'));

app.get('/api/health/status', (req, res) => {
    const report = healthManager.generateHealthReport();
    res.json(report);
});

app.get('/api/health/alerts', (req, res) => {
    const alerts = healthManager.alerts.filter(a => !a.resolved);
    res.json(alerts);
});

app.get('/api/health/metrics', (req, res) => {
    res.json(healthManager.metrics);
});

app.post('/api/health/restart/:service', async (req, res) => {
    const { service } = req.params;
    await healthManager.restartServices([service]);
    res.json({ success: true, message: `${service} restarted` });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🏥 Health Manager API running on port ${PORT}`);
});
