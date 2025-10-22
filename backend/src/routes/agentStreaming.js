/**
 * Example Express routes for streaming agent responses
 * Shows how to integrate AgentStreaming with API endpoints
 *
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-22
 */

/* eslint-disable no-undef */
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const AgentStreaming = require('../utils/AgentStreaming');
const TravelAgencyAgent = require('../agents/TravelAgencyAgent');
const ContentCreatorAgent = require('../agents/ContentCreatorAgent');

// Initialize agents with streaming
const travelAgent = new TravelAgencyAgent();
const contentAgent = new ContentCreatorAgent();

// Initialize streaming managers
const travelStreaming = new AgentStreaming('TravelAgent');
const contentStreaming = new AgentStreaming('ContentAgent');

/**
 * Example 1: Stream blog post generation
 * GET /api/agents/content/stream/blog
 */
router.get('/content/stream/blog', async (req, res) => {
  const streamId = uuidv4();
  const { topic, tone, length } = req.query;

  try {
    // Initialize SSE stream
    contentStreaming.initializeStream(res, streamId);

    // Generate blog post with streaming
    const prompt = `Write a ${length || 'medium'} blog post about "${topic}" in a ${tone || 'professional'} tone.`;

    const result = await contentStreaming.streamGeminiResponse(
      streamId,
      contentAgent.model,
      prompt
    );

    if (!result.success) {
      throw new Error(result.error);
    }
  } catch (error) {
    contentStreaming.sendError(streamId, error, false);
  }
});

/**
 * Example 2: Stream itinerary generation with progress
 * GET /api/agents/travel/stream/itinerary
 */
router.get('/travel/stream/itinerary', async (req, res) => {
  const streamId = uuidv4();
  const { destination, days, budget } = req.query;

  try {
    // Initialize SSE stream
    travelStreaming.initializeStream(res, streamId);

    // Generate itinerary with progress tracking
    await travelStreaming.streamWithProgress(
      streamId,
      async () => {
        // Send status updates during generation
        travelStreaming.sendStatus(streamId, 'researching', {
          message: `Researching ${destination}...`,
        });

        travelStreaming.sendProgress(streamId, 25);

        // Generate itinerary
        const itinerary = await travelAgent.generateItinerary({
          destination,
          duration: parseInt(days),
          budget: parseFloat(budget),
        });

        travelStreaming.sendProgress(streamId, 75);

        return itinerary;
      },
      async (streamId, result) => {
        // Send the result in chunks
        travelStreaming.sendEvent(streamId, 'result', {
          itinerary: result,
        });
      }
    );
  } catch (error) {
    travelStreaming.sendError(streamId, error, false);
  }
});

/**
 * Example 3: Stream JSON data (structured output)
 * GET /api/agents/travel/stream/recommendations
 */
router.get('/travel/stream/recommendations', async (req, res) => {
  const streamId = uuidv4();
  const { interests, budget } = req.query;

  try {
    // Initialize SSE stream
    travelStreaming.initializeStream(res, streamId);

    // Generate recommendations as JSON with incremental updates
    const prompt = `Generate destination recommendations in JSON format:
{
  "destinations": [
    {
      "name": "string",
      "country": "string",
      "bestFor": "string",
      "estimatedCost": number,
      "highlights": ["string"]
    }
  ]
}

User interests: ${interests}
Budget: $${budget}

Return 5 recommendations.`;

    const expectedFields = ['destinations'];

    await travelStreaming.streamJSONGeneration(streamId, travelAgent.model, prompt, expectedFields);
  } catch (error) {
    travelStreaming.sendError(streamId, error, false);
  }
});

/**
 * Example 4: Manual control - step by step
 * GET /api/agents/content/stream/social
 */
router.get('/content/stream/social', async (req, res) => {
  const streamId = uuidv4();
  const { topic, platforms } = req.query;

  try {
    // Initialize SSE stream
    contentStreaming.initializeStream(res, streamId);

    // Step 1: Research
    contentStreaming.sendStatus(streamId, 'researching', {
      message: 'Researching topic...',
    });
    contentStreaming.sendProgress(streamId, 10);

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Step 2: Generate content
    contentStreaming.sendStatus(streamId, 'generating', {
      message: 'Creating social media posts...',
    });
    contentStreaming.sendProgress(streamId, 40);

    const posts = await contentAgent.generateSocialPosts({
      topic,
      platforms: platforms.split(','),
    });

    // Step 3: Send results one by one
    contentStreaming.sendProgress(streamId, 70);

    for (let i = 0; i < posts.length; i++) {
      contentStreaming.sendEvent(streamId, 'post', {
        platform: posts[i].platform,
        content: posts[i].content,
        index: i,
      });

      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    // Complete
    contentStreaming.sendProgress(streamId, 100);
    contentStreaming.sendComplete(streamId, {
      totalPosts: posts.length,
      platforms: posts.map((p) => p.platform),
    });
  } catch (error) {
    contentStreaming.sendError(streamId, error, false);
  }
});

/**
 * Get streaming statistics
 * GET /api/agents/stream/stats/:agent
 */
router.get('/stream/stats/:agent', (req, res) => {
  const { agent } = req.params;

  let stats;
  if (agent === 'travel') {
    stats = travelStreaming.getStats();
  } else if (agent === 'content') {
    stats = contentStreaming.getStats();
  } else {
    return res.status(404).json({ error: 'Agent not found' });
  }

  res.json({
    agent,
    stats,
    activeStreams:
      agent === 'travel' ? travelStreaming.getActiveStreams() : contentStreaming.getActiveStreams(),
  });
});

/**
 * Cleanup inactive streams
 * POST /api/agents/stream/cleanup
 */
router.post('/stream/cleanup', (req, res) => {
  const travelCleaned = travelStreaming.cleanupStreams();
  const contentCleaned = contentStreaming.cleanupStreams();

  res.json({
    success: true,
    cleaned: {
      travel: travelCleaned,
      content: contentCleaned,
      total: travelCleaned + contentCleaned,
    },
  });
});

// Cleanup streams every 5 minutes
setInterval(() => {
  travelStreaming.cleanupStreams();
  contentStreaming.cleanupStreams();
}, 300000);

module.exports = router;
