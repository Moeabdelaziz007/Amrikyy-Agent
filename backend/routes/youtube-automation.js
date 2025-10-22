/**
 * YouTube Automation API Routes
 * Complete content creation pipeline
 * 
 * @author Mohamed Hossameldin Abdelaziz
 * @created 2025-10-22
 */

const express = require('express');
const router = express.Router();
const youtubeService = require('../src/services/YouTubeAutomationService');
const logger = require('../utils/logger');

// ============================================================================
// TOPIC IDEATION
// ============================================================================

/**
 * @route   POST /api/youtube/ideas/generate
 * @desc    Generate video topic ideas
 * @access  Public
 */
router.post('/ideas/generate', async (req, res) => {
  try {
    const { niche, count, language, targetAudience, videoType } = req.body;
    
    const ideas = await youtubeService.generateTopicIdeas({
      niche: niche || 'travel',
      count: count || 5,
      language: language || 'en',
      targetAudience,
      videoType: videoType || 'shorts'
    });
    
    res.json({
      success: true,
      data: ideas
    });
  } catch (error) {
    logger.error('Ideas generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// SCRIPT GENERATION
// ============================================================================

/**
 * @route   POST /api/youtube/script/generate
 * @desc    Generate video script
 * @access  Public
 */
router.post('/script/generate', async (req, res) => {
  try {
    const { title, audience, duration, language, tone } = req.body;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }
    
    const script = await youtubeService.generateScript({
      title,
      audience,
      duration: duration || 60,
      language: language || 'en',
      tone
    });
    
    res.json({
      success: true,
      data: script
    });
  } catch (error) {
    logger.error('Script generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// THUMBNAIL GENERATION
// ============================================================================

/**
 * @route   POST /api/youtube/thumbnail/generate
 * @desc    Generate video thumbnail
 * @access  Public
 */
router.post('/thumbnail/generate', async (req, res) => {
  try {
    const { title, style, text, useImagen } = req.body;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }
    
    const thumbnail = await youtubeService.generateThumbnail({
      title,
      style,
      text,
      useImagen: useImagen !== false
    });
    
    res.json({
      success: true,
      data: thumbnail
    });
  } catch (error) {
    logger.error('Thumbnail generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// VOICEOVER GENERATION
// ============================================================================

/**
 * @route   POST /api/youtube/voiceover/generate
 * @desc    Generate voiceover audio
 * @access  Public
 */
router.post('/voiceover/generate', async (req, res) => {
  try {
    const { text, languageCode, voiceName, speakingRate } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }
    
    const voiceover = await youtubeService.generateVoiceover({
      text,
      languageCode,
      voiceName,
      speakingRate
    });
    
    res.json({
      success: true,
      data: voiceover
    });
  } catch (error) {
    logger.error('Voiceover generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// VIDEO GENERATION
// ============================================================================

/**
 * @route   POST /api/youtube/video/generate
 * @desc    Generate video from script
 * @access  Public
 */
router.post('/video/generate', async (req, res) => {
  try {
    const { script, audioPath, useVeo } = req.body;
    
    if (!script || !audioPath) {
      return res.status(400).json({
        success: false,
        error: 'Script and audioPath are required'
      });
    }
    
    const video = await youtubeService.generateVideo({
      script,
      audioPath,
      useVeo: useVeo !== false
    });
    
    res.json({
      success: true,
      data: video
    });
  } catch (error) {
    logger.error('Video generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// YOUTUBE UPLOAD
// ============================================================================

/**
 * @route   POST /api/youtube/upload
 * @desc    Upload video to YouTube
 * @access  Public
 */
router.post('/upload', async (req, res) => {
  try {
    const {
      filepath,
      title,
      description,
      tags,
      privacyStatus,
      thumbnailBase64,
      categoryId,
      madeForKids
    } = req.body;
    
    if (!filepath || !title) {
      return res.status(400).json({
        success: false,
        error: 'Filepath and title are required'
      });
    }
    
    const result = await youtubeService.uploadToYouTube({
      filepath,
      title,
      description,
      tags,
      privacyStatus,
      thumbnailBase64,
      categoryId,
      madeForKids
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('YouTube upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// ANALYTICS
// ============================================================================

/**
 * @route   GET /api/youtube/analytics/:videoId
 * @desc    Get video analytics
 * @access  Public
 */
router.get('/analytics/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    
    const analytics = await youtubeService.getVideoAnalytics(videoId);
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    logger.error('Analytics fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// COMPLETE PIPELINE
// ============================================================================

/**
 * @route   POST /api/youtube/pipeline/run
 * @desc    Run complete automation pipeline
 * @access  Public
 */
router.post('/pipeline/run', async (req, res) => {
  try {
    const { niche, videoType, language, autoUpload } = req.body;
    
    const result = await youtubeService.runCompletePipeline({
      niche: niche || 'travel',
      videoType: videoType || 'shorts',
      language: language || 'en',
      autoUpload: autoUpload === true
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Pipeline error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// STATUS
// ============================================================================

/**
 * @route   GET /api/youtube/status
 * @desc    Get service status
 * @access  Public
 */
router.get('/status', (req, res) => {
  try {
    const status = youtubeService.getStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('Status error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
