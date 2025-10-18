const request = require('supertest');
const express = require('express');
const dashboardRouter = require('../routes/dashboard');

// Setup a minimal express app for testing the router
const app = express();
app.use('/api/dashboard', dashboardRouter);

describe('Dashboard API Endpoint', () => {
  describe('GET /api/dashboard/status', () => {
    it('should return a 200 OK status', async () => {
      const response = await request(app).get('/api/dashboard/status');
      expect(response.statusCode).toBe(200);
    });

    it('should return a JSON object with the correct structure', async () => {
      const response = await request(app).get('/api/dashboard/status');
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('deploymentStatus');
      expect(response.body).toHaveProperty('testSummary');
      expect(response.body).toHaveProperty('agentActivity');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should contain valid string data for each key', async () => {
      const response = await request(app).get('/api/dashboard/status');
      expect(typeof response.body.deploymentStatus).toBe('string');
      expect(typeof response.body.testSummary).toBe('string');
      expect(typeof response.body.agentActivity).toBe('string');
    });
  });
});
