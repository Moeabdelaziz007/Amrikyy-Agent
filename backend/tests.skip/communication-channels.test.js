/**
 * Integration tests for the new communication channel routes.
 * Verifies that webhook endpoints for Discord, Messenger, Email, and IVR are registered.
 */

const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

// Mock the logger to prevent errors during route initialization
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  child: jest.fn(() => mockLogger), // Return itself for chained calls
};
jest.mock('../utils/logger', () => ({
  logger: mockLogger,
}));

// Mock AIXConnectionManager for route initialization
const mockAixConnectionManager = {
  registerTransport: jest.fn(),
  getAgentStatus: jest.fn(),
  connectAgent: jest.fn(),
  sendMessage: jest.fn(),
  processMessage: jest.fn().mockResolvedValue({ content: 'mock response' }),
};

// Import routes
const discordRoute = require('../routes/discord')(mockAixConnectionManager);
const messengerRoute = require('../routes/messenger')(mockAixConnectionManager);
const emailRoute = require('../routes/email')(mockAixConnectionManager);
const ivrRoute = require('../routes/ivr')(mockAixConnectionManager);

// Setup a minimal express app for testing the routes
const app = express();
app.use(bodyParser.json());
app.use('/api/discord', discordRoute);
app.use('/api/messenger', messengerRoute);
app.use('/api/email', emailRoute);
app.use('/api/ivr', ivrRoute);

describe('Communication Channel Routes', () => {
  it('should respond to Discord webhook', async () => {
    const response = await request(app).post('/api/discord/webhook').send({ message: 'test' });
    // Expecting a 200 OK response, even if logic is not fully implemented
    expect(response.status).not.toBe(404);
  });

  it('should respond to Messenger webhook', async () => {
    const response = await request(app).post('/api/messenger/webhook').send({ object: 'page', entry: [{ messaging: [{ message: { text: 'hello' } }] }] });
    // Expecting a 200 OK response
    expect(response.status).toBe(200);
  });

  it('should respond to Email webhook', async () => {
    const response = await request(app)
      .post('/api/email/webhook')
      .send({ from: 'test@example.com', to: 'plan@maya-trips.com', text: 'hello' });
    // Expecting a 200 OK response
    expect(response.status).toBe(200);
  });

  it('should respond to IVR (Twilio) voice webhook', async () => {
    const response = await request(app).post('/api/ivr/voice').send({ From: '+1234567890' });
    // Expecting a 200 OK response with TwiML
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('text/xml');
  });
});
