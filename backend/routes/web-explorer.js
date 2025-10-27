const express = require('express');
const router = express.Router();
const WebAnalysisService = require('../services/WebAnalysisService');

/**
 * @swagger
 * /api/explorer/query:
 *   post:
 *     summary: Get a synthesized answer from the web for a given question.
 *     description: Performs a web search, reads the top results, and uses an AI model to generate a direct answer with sources.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *                 description: The question to ask the web.
 *                 example: 'What is Retrieval-Augmented Generation?'
 *     responses:
 *       200:
 *         description: Success. Returns the AI-generated answer as an HTML string.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 answerHtml:
 *                   type: string
 *       400:
 *         description: Bad Request. The question is missing.
 *       500:
 *         description: Internal Server Error.
 */
router.post('/query', async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ success: false, message: "'question' is required" });
  }

  try {
    console.log(`[Route /explorer/query] Received question: "${question}"`);
    const answerHtml = await WebAnalysisService.getAnswerFromWeb(question);
    res.json({ success: true, answerHtml });
  } catch (error) {
    console.error(`[Route /explorer/query] Error processing question "${question}":`, error);
    res.status(500).json({ success: false, message: 'Failed to get answer from web.', error: error.message });
  }
});

/**
 * @swagger
 * /api/explorer/analyze:
 *   post:
 *     summary: Analyze a single web page.
 *     description: Fetches the content of a URL and uses an AI model to provide a summary and analysis.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 description: The URL of the web page to analyze.
 *                 example: 'https://cloud.google.com/what-is-rag'
 *     responses:
 *       200:
 *         description: Success. Returns the AI-generated analysis as an HTML string.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 analysisHtml:
 *                   type: string
 *       400:
 *         description: Bad Request. The url is missing.
 *       500:
 *         description: Internal Server Error.
 */
router.post('/analyze', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ success: false, message: "'url' is required" });
  }

  try {
    console.log(`[Route /explorer/analyze] Received URL: ${url}`);
    const analysisHtml = await WebAnalysisService.analyzeUrl(url);
    res.json({ success: true, analysisHtml });
  } catch (error) {
    console.error(`[Route /explorer/analyze] Error analyzing URL ${url}:`, error);
    res.status(500).json({ success: false, message: 'Failed to analyze URL.', error: error.message });
  }
});

module.exports = router;
