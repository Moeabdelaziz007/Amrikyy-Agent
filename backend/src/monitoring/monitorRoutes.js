/**
 * Monitoring Dashboard API Routes
 * REST endpoints for agent monitoring and system health
 */

const express = require('express');
const router = express.Router();

class MonitorRoutes {
  constructor(liveAgentMonitor, clineAutomation, orchestrator) {
    this.liveAgentMonitor = liveAgentMonitor;
    this.clineAutomation = clineAutomation;
    this.orchestrator = orchestrator;
    
    this.setupRoutes();
  }

  setupRoutes() {
    // Get all agent metrics
    router.get('/agents', (req, res) => {
      try {
        const agents = this.liveAgentMonitor.getAllAgentMetrics();
        res.json({
          success: true,
          data: agents,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Get specific agent details
    router.get('/agents/:agentId', (req, res) => {
      try {
        const { agentId } = req.params;
        const agentMetrics = this.liveAgentMonitor.getAllAgentMetrics()
          .find(agent => agent.id === agentId);
        
        if (!agentMetrics) {
          return res.status(404).json({
            success: false,
            error: 'Agent not found'
          });
        }

        res.json({
          success: true,
          data: agentMetrics,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Get system health
    router.get('/system/health', (req, res) => {
      try {
        const dashboardData = this.liveAgentMonitor.getDashboardData();
        res.json({
          success: true,
          data: {
            system: dashboardData.system,
            overall_health: dashboardData.system.systemHealth,
            active_agents: dashboardData.agents.filter(a => a.status === 'processing').length,
            total_agents: dashboardData.agents.length,
            webSocket_connections: dashboardData.connections
          },
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Get performance metrics
    router.get('/performance', (req, res) => {
      try {
        const { timeRange = '1h' } = req.query;
        const dashboardData = this.liveAgentMonitor.getDashboardData();
        
        res.json({
          success: true,
          data: {
            current: {
              avgResponseTime: dashboardData.performance.responseTimes[dashboardData.performance.responseTimes.length - 1]?.value || 0,
              avgSuccessRate: dashboardData.performance.successRates[dashboardData.performance.successRates.length - 1]?.value || 0,
              avgLoad: dashboardData.performance.loadMetrics[dashboardData.performance.loadMetrics.length - 1]?.value || 0
            },
            history: dashboardData.performance,
            timeRange: timeRange
          },
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Get automation status
    router.get('/automation', (req, res) => {
      try {
        const automationStatus = this.clineAutomation.getAutomationStatus();
        res.json({
          success: true,
          data: automationStatus,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Get workflow status
    router.get('/workflows', (req, res) => {
      try {
        const automationStatus = this.clineAutomation.getAutomationStatus();
        const workflows = Array.from(this.clineAutomation.workflows.values()).map(workflow => ({
          id: workflow.id,
          name: workflow.name,
          schedule: workflow.schedule,
          enabled: workflow.enabled,
          taskCount: workflow.tasks.length,
          lastExecution: 'N/A' // In production, get from database
        }));

        res.json({
          success: true,
          data: {
            workflows,
            total: workflows.length,
            enabled: workflows.filter(w => w.enabled).length,
            disabled: workflows.filter(w => !w.enabled).length
          },
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Execute workflow on demand
    router.post('/workflows/:workflowId/execute', async (req, res) => {
      try {
        const { workflowId } = req.params;
        const result = await this.clineAutomation.executeWorkflowOnDemand(workflowId);
        
        res.json({
          success: true,
          data: result,
          message: 'Workflow executed successfully',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Toggle workflow
    router.put('/workflows/:workflowId/toggle', (req, res) => {
      try {
        const { workflowId } = req.params;
        const { enabled } = req.body;
        
        const workflow = this.clineAutomation.toggleWorkflow(workflowId, enabled);
        
        res.json({
          success: true,
          data: {
            id: workflow.id,
            name: workflow.name,
            enabled: workflow.enabled
          },
          message: `Workflow ${enabled ? 'enabled' : 'disabled'} successfully`,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Get conversation statistics
    router.get('/conversations', (req, res) => {
      try {
        const dashboardData = this.liveAgentMonitor.getDashboardData();
        
        // Mock conversation data - in production, get from database
        const conversations = {
          active: dashboardData.system.activeConversations,
          total_today: 156,
          completed_today: 142,
          abandoned_today: 14,
          avg_duration: 420, // seconds
          satisfaction_rate: 94.2,
          top_agents: [
            { agent: 'luna', count: 45, percentage: 28.8 },
            { agent: 'karim', count: 32, percentage: 20.5 },
            { agent: 'layla', count: 28, percentage: 17.9 },
            { agent: 'amira', count: 25, percentage: 16.0 },
            { agent: 'zara', count: 26, percentage: 16.7 }
          ]
        };

        res.json({
          success: true,
          data: conversations,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Get system alerts
    router.get('/alerts', (req, res) => {
      try {
        const dashboardData = this.liveAgentMonitor.getDashboardData();
        
        // Collect all alerts from agents
        const alerts = [];
        dashboardData.agents.forEach(agent => {
          agent.alerts.forEach(alert => {
            alerts.push({
              id: `${agent.id}_${Date.now()}`,
              agent: agent.name,
              type: alert.type,
              message: alert.message,
              timestamp: alert.timestamp,
              severity: this.getAlertSeverity(alert.type, agent.health)
            });
          });
        });

        // Sort by timestamp (newest first)
        alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.json({
          success: true,
          data: {
            alerts: alerts.slice(0, 50), // Last 50 alerts
            total: alerts.length,
            critical: alerts.filter(a => a.severity === 'critical').length,
            warning: alerts.filter(a => a.severity === 'warning').length,
            info: alerts.filter(a => a.severity === 'info').length
          },
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Get real-time dashboard data (all-in-one endpoint)
    router.get('/dashboard', (req, res) => {
      try {
        const dashboardData = this.liveAgentMonitor.getDashboardData();
        const automationStatus = this.clineAutomation.getAutomationStatus();
        
        const comprehensiveData = {
          agents: dashboardData.agents,
          system: dashboardData.system,
          performance: dashboardData.performance,
          automation: automationStatus,
          websocket_connections: dashboardData.connections,
          last_update: new Date().toISOString()
        };

        res.json({
          success: true,
          data: comprehensiveData,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Health check endpoint
    router.get('/health', (req, res) => {
      try {
        const dashboardData = this.liveAgentMonitor.getDashboardData();
        const automationStatus = this.clineAutomation.getAutomationStatus();
        
        const healthCheck = {
          status: 'ok',
          timestamp: new Date().toISOString(),
          services: {
            monitoring: 'healthy',
            automation: automationStatus.status === 'active' ? 'healthy' : 'degraded',
            orchestrator: 'healthy',
            websocket: dashboardData.connections > 0 ? 'active' : 'inactive'
          },
          metrics: {
            agents_healthy: dashboardData.agents.filter(a => a.health === 'healthy').length,
            agents_total: dashboardData.agents.length,
            system_health: dashboardData.system.systemHealth,
            active_connections: dashboardData.connections
          }
        };

        res.json(healthCheck);
      } catch (error) {
        res.status(500).json({
          status: 'error',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  /**
   * Get alert severity based on type and agent health
   */
  getAlertSeverity(alertType, agentHealth) {
    if (alertType === 'error' || agentHealth === 'critical') {
      return 'critical';
    }
    if (alertType === 'warning' || agentHealth === 'warning') {
      return 'warning';
    }
    return 'info';
  }

  /**
   * Get router instance
   */
  getRouter() {
    return router;
  }
}

module.exports = MonitorRoutes;
