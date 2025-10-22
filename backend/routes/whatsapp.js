/**
 * WhatsApp Business + MCP Integration Route
 *
 * This route handles incoming webhooks from the WhatsApp Business API,
 * treats each user as a temporary agent, and routes their messages
 * through the AIXConnectionManager to the multi-agent AI system.
 */

const express = require('express');
const router = express.Router();
const { logger } = require('../src/utils/logger');

module.exports = (aixConnectionManager) => {
  if (!aixConnectionManager) {
    throw new Error('AIXConnectionManager is required for WhatsApp route.');
  }

  const log = logger.child({ service: 'whatsapp-mcp-route' });

  /**
   * POST /api/whatsapp/webhook
   * Endpoint to receive messages from WhatsApp Business API.
   */
  router.post('/webhook', async (req, res) => {
    const message = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message || message.type !== 'text') {
      log.info('Received non-text or invalid webhook payload.');
      return res.sendStatus(200); // Acknowledge receipt
    }

    const fromId = message.from; // User's phone number
    const messageText = message.text.body;
    const primaryAIAgent = 'travel_agent_maya'; // The main orchestrator agent

    log.info(`Received WhatsApp message from ${fromId}: "${messageText}"`);

    try {
      // Check if this user is already connected as an agent
      const userAgent = aixConnectionManager.getAgentStatus(fromId);
      if (userAgent.error) {
        log.info(`New user ${fromId}. Connecting as a temporary agent.`);
        // Connect the user as a new agent with 'whatsapp' transport
        await aixConnectionManager.connectAgent(
          fromId,
          { name: `WhatsApp User ${fromId}` },
          {
            transportType: 'whatsapp',
            protocols: ['MCP'], // This user primarily communicates via MCP
            capabilities: ['send_message'],
          }
        );
      }

      // Send the user's message into the AIX system for processing
      const messagePayload = {
        type: 'text_message',
        content: messageText,
        source: 'whatsapp',
        timestamp: new Date().toISOString(),
      };

      await aixConnectionManager.sendMessage(fromId, primaryAIAgent, messagePayload);

      log.info(`Message from ${fromId} successfully routed to ${primaryAIAgent}.`);

      // Acknowledge receipt of the webhook
      res.sendStatus(200);
    } catch (error) {
      log.error('Error processing WhatsApp message via AIX.', {
        error: error.message,
        stack: error.stack,
        from: fromId,
      });
      res.sendStatus(500);
    }
  });

  // Optional: Add webhook verification for WhatsApp
  router.get('/webhook', (req, res) => {
    // Your webhook verification logic here
    // ...
  });

  return router;
};
