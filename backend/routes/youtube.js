
const express = require('express');
const router = express.Router();
const YouTubeService = require('../services/YouTubeService');

/**
 * @swagger
 * /api/youtube/process:
 *   post:
 *     summary: Process a YouTube video to generate an enhanced HTML page.
 *     description: Takes a YouTube video URL, downloads it, extracts a transcript and screenshots, analyzes the transcript with AI, and returns a link to a self-contained HTML page with all the information.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               videoUrl:
 *                 type: string
 *                 description: The full URL of the YouTube video to process.
 *                 example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
 *     responses:
 *       200:
 *         description: Success. Returns the path to the generated HTML file.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Successfully processed video.'
 *                 htmlPath:
 *                   type: string
 *                   example: '/youtube-pages/dQw4w9WgXcQ.html'
 *       400:
 *         description: Bad Request. The videoUrl is missing or invalid.
 *       500:
 *         description: Internal Server Error. Something went wrong during processing.
 */
router.post('/process', async (req, res) => {
  const { videoUrl } = req.body;

  if (!videoUrl) {
    return res.status(400).json({ success: false, message: 'videoUrl is required' });
  }

  try {
    console.log(`[Route /youtube/process] Received request for URL: ${videoUrl}`);
    const htmlPath = await YouTubeService.processVideo(videoUrl);

    // Make the path relative to the public directory to be used in a URL
    const relativePath = path.relative(path.join(__dirname, '../.. ', 'public'), htmlPath);

    res.json({
      success: true,
      message: 'Successfully processed video.',
      htmlPath: `/${relativePath.replace(/\\/g, '/')}` // Ensure forward slashes for URL
    });
  } catch (error) {
    console.error(`[Route /youtube/process] Error processing video ${videoUrl}:`, error);
    res.status(500).json({ success: false, message: 'Failed to process video.', error: error.message });
  }
});

module.exports = router;
