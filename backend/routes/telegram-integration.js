/**
 * Telegram Integration Routes
 * Handles Telegram-iOS connection and cross-platform auth
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const SupabaseDB = require('../database/supabase');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

/**
 * POST /api/telegram/exchange
 * Exchange Telegram init_data for JWT token
 * Used by both Web App and iOS app
 */
router.post('/exchange', async (req, res) => {
  try {
    const { telegram_id, init_data, platform, first_name, last_name, username, photo_url } = req.body;
    
    if (!telegram_id || !init_data) {
      return res.status(400).json({
        error: 'telegram_id and init_data are required'
      });
    }
    
    // Validate Telegram init_data
    const isValid = validateTelegramInitData(init_data);
    if (!isValid) {
      return res.status(401).json({
        error: 'Invalid Telegram data',
        code: 'INVALID_TELEGRAM_DATA'
      });
    }
    
    // Get or create user
    const db = new SupabaseDB();
    let user = await db.getUserByTelegramId(telegram_id);
    
    if (!user) {
      // Create new user from Telegram data
      user = await db.createUser({
        telegram_id,
        name: `${first_name} ${last_name || ''}`.trim(),
        username: username || null,
        avatar: photo_url || null,
        platform: platform || 'telegram'
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.telegram_id,
        platform: platform || 'telegram'
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    // Generate deep link for iOS
    const deepLink = platform === 'ios' 
      ? `mayatravel://auth?token=${token}`
      : null;
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        telegram_id: user.telegram_id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      },
      deep_link: deepLink,
      web_url: `${process.env.FRONTEND_URL}?token=${token}`
    });
    
  } catch (error) {
    console.error('❌ Token exchange error:', error);
    res.status(500).json({
      error: 'Failed to exchange token',
      message: error.message
    });
  }
});

/**
 * POST /api/telegram/link
 * Link Telegram account to existing user
 */
router.post('/link', authenticateToken, async (req, res) => {
  try {
    const { telegram_id, init_data, first_name, last_name, username, photo_url } = req.body;
    
    if (!telegram_id || !init_data) {
      return res.status(400).json({
        error: 'telegram_id and init_data are required'
      });
    }
    
    // Validate Telegram init_data
    const isValid = validateTelegramInitData(init_data);
    if (!isValid) {
      return res.status(401).json({
        error: 'Invalid Telegram data',
        code: 'INVALID_TELEGRAM_DATA'
      });
    }
    
    // Update user profile with Telegram info
    const db = new SupabaseDB();
    const updated = await db.updateUserProfile(req.user.telegramId, {
      telegram_linked: true,
      telegram_username: username,
      telegram_photo: photo_url
    });
    
    res.json({
      success: true,
      message: 'Telegram account linked successfully',
      user: updated
    });
    
  } catch (error) {
    console.error('❌ Telegram link error:', error);
    res.status(500).json({
      error: 'Failed to link Telegram account',
      message: error.message
    });
  }
});

/**
 * POST /api/telegram/unlink
 * Unlink Telegram account from user
 */
router.post('/unlink', authenticateToken, async (req, res) => {
  try {
    const db = new SupabaseDB();
    const updated = await db.updateUserProfile(req.user.telegramId, {
      telegram_linked: false,
      telegram_username: null,
      telegram_photo: null
    });
    
    res.json({
      success: true,
      message: 'Telegram account unlinked',
      user: updated
    });
    
  } catch (error) {
    console.error('❌ Telegram unlink error:', error);
    res.status(500).json({
      error: 'Failed to unlink Telegram',
      message: error.message
    });
  }
});

/**
 * GET /api/telegram/link-status
 * Check if Telegram is linked to current user
 */
router.get('/link-status', authenticateToken, async (req, res) => {
  try {
    const db = new SupabaseDB();
    const user = await db.getUserProfile(req.user.telegramId);
    
    res.json({
      success: true,
      data: {
        is_linked: user.telegram_linked || false,
        telegram_user: user.telegram_linked ? {
          id: user.telegram_id,
          username: user.telegram_username,
          photo_url: user.telegram_photo
        } : null
      }
    });
    
  } catch (error) {
    console.error('❌ Link status check error:', error);
    res.status(500).json({
      error: 'Failed to check link status',
      message: error.message
    });
  }
});

/**
 * POST /api/telegram/notify
 * Send notification to user's Telegram account
 */
router.post('/notify', authenticateToken, async (req, res) => {
  try {
    const { message, type } = req.body;
    
    if (!message) {
      return res.status(400).json({
        error: 'message is required'
      });
    }
    
    const db = new SupabaseDB();
    const user = await db.getUserProfile(req.user.telegramId);
    
    if (!user.telegram_linked || !user.telegram_id) {
      return res.status(400).json({
        error: 'Telegram not linked',
        code: 'TELEGRAM_NOT_LINKED'
      });
    }
    
    // Send via Telegram bot
    const bot = require('../telegram-bot');
    await bot.sendMessage(user.telegram_id, message);
    
    res.json({
      success: true,
      message: 'Notification sent to Telegram'
    });
    
  } catch (error) {
    console.error('❌ Telegram notify error:', error);
    res.status(500).json({
      error: 'Failed to send Telegram notification',
      message: error.message
    });
  }
});

/**
 * Validate Telegram init_data
 * Ensures data comes from authentic Telegram WebApp
 */
function validateTelegramInitData(initData) {
  try {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    if (!BOT_TOKEN) {
      console.warn('⚠️ TELEGRAM_BOT_TOKEN not set, skipping validation');
      return true; // Allow in development
    }
    
    // Parse init_data
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');
    
    // Sort parameters
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    // Create secret key
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(BOT_TOKEN)
      .digest();
    
    // Calculate hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
    
    // Compare hashes
    const isValid = calculatedHash === hash;
    
    if (!isValid) {
      console.warn('⚠️ Telegram init_data validation failed');
    }
    
    return isValid;
    
  } catch (error) {
    console.error('❌ Telegram validation error:', error);
    return false;
  }
}

module.exports = router;

