/**
 * Voice API Routes
 * 
 * Endpoints:
 * - POST /api/voice/tts - Text to speech conversion
 * - POST /api/voice/command - Process voice commands
 * - GET /api/voice/voices - Get available voices
 * - POST /api/voice/record - Handle voice recording
 * 
 * @author CURSERO AI
 * @created 2025-10-22
 */

const express = require('express');
const router = express.Router();
const VoiceService = require('../src/services/VoiceService');
const logger = require('../utils/logger');

// Initialize voice service
const voiceService = new VoiceService();

/**
 * Text to Speech endpoint
 */
router.post('/tts', async (req, res) => {
  try {
    const { text, languageCode, voiceName, speakingRate, pitch } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    const result = await voiceService.textToSpeech({
      text,
      languageCode: languageCode || 'en-US',
      voiceName: voiceName || 'en-US-Neural2-C',
      speakingRate: speakingRate || 1.0,
      pitch: pitch || 0
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('TTS endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate speech',
      details: error.message
    });
  }
});

/**
 * Process voice command endpoint
 */
router.post('/command', async (req, res) => {
  try {
    const { transcript, language } = req.body;

    if (!transcript) {
      return res.status(400).json({
        success: false,
        error: 'Transcript is required'
      });
    }

    const result = await voiceService.processVoiceCommand(
      transcript, 
      language || 'en'
    );

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('Voice command endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process voice command',
      details: error.message
    });
  }
});

/**
 * Get available voices endpoint
 */
router.get('/voices', async (req, res) => {
  try {
    const voices = await voiceService.getAvailableVoices();

    res.json({
      success: true,
      data: voices
    });

  } catch (error) {
    logger.error('Voices endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get voices',
      details: error.message
    });
  }
});

/**
 * Voice recording endpoint (for future use)
 */
router.post('/record', async (req, res) => {
  try {
    // This would handle audio file uploads
    // For now, return a placeholder response
    res.json({
      success: true,
      message: 'Voice recording endpoint - implementation pending',
      data: {
        recordingId: Date.now().toString(),
        status: 'received'
      }
    });

  } catch (error) {
    logger.error('Voice recording endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process voice recording',
      details: error.message
    });
  }
});

/**
 * Voice service status endpoint
 */
router.get('/status', async (req, res) => {
  try {
    const cacheStats = voiceService.getCacheStats();
    
    res.json({
      success: true,
      data: {
        initialized: voiceService.isInitialized,
        cacheStats,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Voice status endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get voice service status',
      details: error.message
    });
  }
});

/**
 * Clear voice cache endpoint
 */
router.post('/cache/clear', async (req, res) => {
  try {
    voiceService.clearCache();
    
    res.json({
      success: true,
      message: 'Voice cache cleared successfully'
    });

  } catch (error) {
    logger.error('Clear cache endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear voice cache',
      details: error.message
    });
  }
});

module.exports = router;