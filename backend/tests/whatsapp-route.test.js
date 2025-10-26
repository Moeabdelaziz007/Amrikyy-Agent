/**
 * Integration tests for the WhatsApp Business + MCP Integration Route.
 * It tests the /api/whatsapp/webhook endpoint.
 */

const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

// Mock the logger to prevent errors during route initialization
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  child: jest.fn(() => mockLogger),
};
jest.mock('../src/utils/logger', () => ({
  logger: mockLogger,
}));

const whatsappRoute = require('../routes/whatsapp');

// Mock the AIXConnectionManager
const mockAixConnectionManager = {
  getAgentStatus: jest.fn(),
  connectAgent: jest.fn(),
  sendMessage: jest.fn(),
};

// Setup a minimal express app for testing the route
const app = express();
app.use(bodyParser.json());
app.use('/api/whatsapp', whatsappRoute(mockAixConnectionManager));

describe('WhatsApp Webhook Route (/api/whatsapp/webhook)', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  const createValidWebhookPayload = (from, text) => ({
    entry: [
      {
        changes: [
          {
            value: {
              messages: [
                {
                  from,
                  type: 'text',
                  text: { body: text },
                },
              ],
            },
          },
        ],
      },
    ],
  });

  it('should process a valid text message from a new user', async () => {
    const userPhone = '15551234567';
    const messageText = 'Hello Maya';
    const payload = createValidWebhookPayload(userPhone, messageText);

    // Simulate a new user by having getAgentStatus return an error
    mockAixConnectionManager.getAgentStatus.mockReturnValue({ error: 'Agent not found' });
    mockAixConnectionManager.connectAgent.mockResolvedValue({});
    mockAixConnectionManager.sendMessage.mockResolvedValue({});

    const response = await request(app).post('/api/whatsapp/webhook').send(payload);

    expect(response.status).toBe(200);
    expect(mockAixConnectionManager.getAgentStatus).toHaveBeenCalledWith(userPhone);
    expect(mockAixConnectionManager.connectAgent).toHaveBeenCalledWith(
      userPhone,
      { name: `WhatsApp User ${userPhone}` },
      expect.any(Object)
    );
    expect(mockAixConnectionManager.sendMessage).toHaveBeenCalledWith(
      userPhone,
      'travel_agent_maya',
      expect.objectContaining({ content: messageText })
    );
  });

  it('should process a valid text message from an existing user', async () => {
    const userPhone = '15551234568';
    const messageText = 'I am back';
    const payload = createValidWebhookPayload(userPhone, messageText);

    // Simulate an existing user
    mockAixConnectionManager.getAgentStatus.mockReturnValue({ status: 'connected' });

    const response = await request(app).post('/api/whatsapp/webhook').send(payload);

    expect(response.status).toBe(200);
    expect(mockAixConnectionManager.connectAgent).not.toHaveBeenCalled();
    expect(mockAixConnectionManager.sendMessage).toHaveBeenCalledWith(
      userPhone,
      'travel_agent_maya',
      expect.objectContaining({ content: messageText })
    );
  });

  it('should return 200 for non-text messages or invalid payloads', async () => {
    const payload = { entry: [{ changes: [{ value: { messages: [{ type: 'image' }] } }] }] };

    const response = await request(app).post('/api/whatsapp/webhook').send(payload);

    expect(response.status).toBe(200);
    expect(mockAixConnectionManager.sendMessage).not.toHaveBeenCalled();
  });

  it('should return 500 if the AIX connection manager fails', async () => {
    const payload = createValidWebhookPayload('15550001111', 'This will fail');
    mockAixConnectionManager.getAgentStatus.mockRejectedValue(new Error('Internal AIX Error'));

    const response = await request(app).post('/api/whatsapp/webhook').send(payload);

    expect(response.status).toBe(500);
  });
});
