const request = require('supertest');
const express = require('express');
const apiRoutes = require('../routes/api'); // Assuming your API routes are in routes/api.js
const TelegramBot = require('node-telegram-bot-api'); // Import the actual TelegramBot

// Mock the node-telegram-bot-api library
jest.mock('node-telegram-bot-api', () => {
  return jest.fn().mockImplementation(() => ({
    sendMessage: jest.fn(),
  }));
});

// Create a dummy Express app to test the routes
const app = express();
app.use(express.json());
app.use('/api', apiRoutes);

describe('Orchestrator API', () => {
  let mockSendMessage;
  const mockTelegramBotToken = 'MOCK_TELEGRAM_BOT_TOKEN'; // Define a mock token
  process.env.TELEGRAM_BOT_TOKEN = mockTelegramBotToken; // Set the environment variable

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Get the mock instance's sendMessage method
    mockSendMessage = new TelegramBot().sendMessage;
  });

  afterAll(() => {
    // Clean up the environment variable
    delete process.env.TELEGRAM_BOT_TOKEN;
  });

  test('POST /api/orchestrator should return a mock workflow for "Plan a 7-day trip to Egypt"', async () => {
    const prompt = 'Plan a 7-day trip to Egypt';
    const response = await request(app)
      .post('/api/orchestrator')
      .send({ prompt, lang: 'en' })
      .expect(200);

    expect(response.body).toBeDefined();
    expect(response.body.workflowName).toBe('Egypt Trip Planner');
    expect(response.body.steps).toBeInstanceOf(Array);
    expect(response.body.steps.length).toBeGreaterThan(0);
    expect(response.body.steps[0]).toHaveProperty('agentId', 'research');
  });

  test('POST /api/orchestrator should return a simple workflow for unknown prompt', async () => {
    const prompt = 'What is the capital of France?';
    const response = await request(app)
      .post('/api/orchestrator')
      .send({ prompt, lang: 'en' })
      .expect(200);

    expect(response.body).toBeDefined();
    expect(response.body.workflowName).toBe('Simple Response');
    expect(response.body.steps).toHaveLength(1);
    expect(response.body.steps[0]).toHaveProperty('agentId', 'research');
  });

  test('POST /api/orchestrator should return 400 if prompt is missing', async () => {
    const response = await request(app)
      .post('/api/orchestrator')
      .send({ lang: 'en' })
      .expect(400);

    expect(response.body).toHaveProperty('error', 'Prompt is required');
  });

  test('POST /api/orchestrator should send a Telegram message for specific prompt', async () => {
    const mockChatId = '12345';
    const mockMessage = 'Hello from Amrikyyy AI OS!';
    const prompt = `Send a Telegram message to ${mockChatId} with content ${mockMessage}`;

    // Mock the sendMessage function to resolve successfully
    mockSendMessage.mockResolvedValueOnce({});

    const response = await request(app)
      .post('/api/orchestrator')
      .send({ prompt, lang: 'en' })
      .expect(200);

    expect(mockSendMessage).toHaveBeenCalledTimes(1);
    expect(mockSendMessage).toHaveBeenCalledWith(mockChatId, mockMessage);

    expect(response.body).toBeDefined();
    expect(response.body.workflowName).toBe('Telegram Notification');
    expect(response.body.steps).toHaveLength(1);
    expect(response.body.steps[0]).toHaveProperty('agentId', 'orchestrator');
    expect(response.body.steps[0]).toHaveProperty('taskType', 'sendTelegramMessage');
    expect(response.body.steps[0].taskInput).toEqual({ chatId: mockChatId, message: mockMessage });
    expect(response.body.steps[0].taskOutput.text).toBe('Telegram notification sent successfully!');
  });

  test('POST /api/orchestrator should handle errors when sending Telegram message', async () => {
    const mockChatId = 'invalid_chat';
    const mockMessage = 'Test error message';
    const prompt = `Send a Telegram message to ${mockChatId} with content ${mockMessage}`;
    const errorMessage = 'Telegram API error: chat not found';

    // Mock the sendMessage function to reject with an error
    mockSendMessage.mockRejectedValue(new Error(errorMessage));

    const response = await request(app)
      .post('/api/orchestrator')
      .send({ prompt, lang: 'en' })
      .expect(500); // Expect a 500 status due to the error

    expect(mockSendMessage).toHaveBeenCalledTimes(1);
    expect(mockSendMessage).toHaveBeenCalledWith(mockChatId, mockMessage);
    expect(response.body).toHaveProperty('error', `Orchestration failed to send Telegram message: ${errorMessage}`);
  });
});