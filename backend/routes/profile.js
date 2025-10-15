/**
 * Profile API Routes for Amrikyy Travel Agent
 * Handles user profile management, avatar uploads, and user statistics
 *
 * Endpoints:
 * - GET /api/profile              - Fetch user profile
 * - PUT /api/profile              - Update profile (name, email, bio)
 * - POST /api/profile/avatar      - Upload avatar image
 * - GET /api/profile/stats        - User statistics
 * - DELETE /api/profile           - Delete account
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Import database and auth middleware
const SupabaseDB = require('../database/supabase');
const { authenticateToken } = require('../middleware/auth');

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/avatars');
    // Ensure directory exists
    fs.mkdir(uploadDir, { recursive: true }).catch(console.error);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, 'avatar-' + req.user.telegramId + '-' + uniqueSuffix + extension);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check file type
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

/**
 * GET /api/profile
 * Fetch current user's profile information
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const db = new SupabaseDB();
    const profile = await db.getUserProfile(req.user.telegramId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found',
        code: 'PROFILE_NOT_FOUND'
      });
    }

    // Remove sensitive information
    const { preferences, travel_history, ...safeProfile } = profile;

    res.json({
      success: true,
      profile: safeProfile,
      preferences: preferences || {},
      travel_history_count: travel_history ? travel_history.length : 0
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile',
      code: 'FETCH_ERROR'
    });
  }
});

/**
 * PUT /api/profile
 * Update user profile information
 */
router.put('/', authenticateToken, async (req, res) => {
  try {
    const { name, email, bio, preferences, phone, date_of_birth, nationality } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
        code: 'INVALID_EMAIL'
      });
    }

    // Prepare update data
    const updateData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      bio: bio ? bio.trim() : null,
      phone: phone ? phone.trim() : null,
      date_of_birth: date_of_birth || null,
      nationality: nationality ? nationality.trim() : null,
      preferences: preferences || {},
      updated_at: new Date().toISOString()
    };

    const db = new SupabaseDB();
    const updatedProfile = await db.updateUserProfile(req.user.telegramId, updateData);

    if (!updatedProfile) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update profile',
        code: 'UPDATE_FAILED'
      });
    }

    // Remove sensitive information from response
    const { preferences: updatedPrefs, travel_history, ...safeProfile } = updatedProfile;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: safeProfile,
      preferences: updatedPrefs || {}
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile',
      code: 'UPDATE_ERROR'
    });
  }
});

/**
 * POST /api/profile/avatar
 * Upload user avatar image
 */
router.post('/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided',
        code: 'NO_FILE_UPLOADED'
      });
    }

    // Generate avatar URL (assuming static file serving)
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    const db = new SupabaseDB();
    const updatedProfile = await db.updateUserProfile(req.user.telegramId, {
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString()
    });

    if (!updatedProfile) {
      // Clean up uploaded file if database update fails
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }

      return res.status(500).json({
        success: false,
        error: 'Failed to save avatar URL',
        code: 'AVATAR_SAVE_FAILED'
      });
    }

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatar_url: avatarUrl,
      profile: {
        telegram_id: updatedProfile.telegram_id,
        avatar_url: updatedProfile.avatar_url,
        updated_at: updatedProfile.updated_at
      }
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);

    // Clean up uploaded file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      error: 'Failed to upload avatar',
      code: 'AVATAR_UPLOAD_ERROR'
    });
  }
});

/**
 * GET /api/profile/stats
 * Get user statistics and analytics
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const db = new SupabaseDB();

    // Get user profile with full data
    const profile = await db.getUserProfile(req.user.telegramId);
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found',
        code: 'PROFILE_NOT_FOUND'
      });
    }

    // Get conversation history count
    const conversations = await db.getConversationHistory(req.user.telegramId, 1000);

    // Get travel history stats
    const travelHistory = profile.travel_history || [];
    const totalTrips = travelHistory.length;
    const destinationsVisited = new Set(travelHistory.map(trip => trip.destination)).size;

    // Calculate total spent (if available)
    const totalSpent = travelHistory.reduce((sum, trip) => {
      return sum + (trip.price || 0);
    }, 0);

    // Get preferences summary
    const preferences = profile.preferences || {};

    // Calculate account age
    const createdAt = new Date(profile.created_at);
    const now = new Date();
    const accountAgeDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));

    const stats = {
      account: {
        member_since: profile.created_at,
        account_age_days: accountAgeDays,
        last_updated: profile.updated_at
      },
      travel: {
        total_trips: totalTrips,
        destinations_visited: destinationsVisited,
        total_spent: totalSpent,
        favorite_destination: this.getFavoriteDestination(travelHistory)
      },
      activity: {
        total_conversations: conversations.length,
        last_activity: conversations.length > 0 ? conversations[conversations.length - 1].timestamp : null
      },
      preferences: {
        travel_style: preferences.travel_style || 'Not specified',
        budget_preference: preferences.budget_max || 'Not specified',
        preferred_destinations: preferences.destinations || []
      }
    };

    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user statistics',
      code: 'STATS_ERROR'
    });
  }
});

/**
 * DELETE /api/profile
 * Delete user account and all associated data
 */
router.delete('/', authenticateToken, async (req, res) => {
  try {
    const { confirmDeletion } = req.body;

    if (!confirmDeletion || confirmDeletion !== req.user.telegramId) {
      return res.status(400).json({
        success: false,
        error: 'Confirmation required: provide telegram_id to confirm deletion',
        code: 'CONFIRMATION_REQUIRED'
      });
    }

    const db = new SupabaseDB();

    // Note: In a real application, you might want to soft delete instead
    // For now, we'll implement a soft delete by marking as inactive

    const updatedProfile = await db.updateUserProfile(req.user.telegramId, {
      is_active: false,
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    if (!updatedProfile) {
      return res.status(500).json({
        success: false,
        error: 'Failed to delete account',
        code: 'DELETE_FAILED'
      });
    }

    res.json({
      success: true,
      message: 'Account marked for deletion. All personal data has been deactivated.',
      deleted_at: updatedProfile.deleted_at
    });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete account',
      code: 'DELETE_ERROR'
    });
  }
});

/**
 * Helper function to determine favorite destination
 */
function getFavoriteDestination(travelHistory) {
  if (!travelHistory || travelHistory.length === 0) {
    return null;
  }

  const destinationCounts = travelHistory.reduce((acc, trip) => {
    const dest = trip.destination;
    acc[dest] = (acc[dest] || 0) + 1;
    return acc;
  }, {});

  const favorite = Object.keys(destinationCounts).reduce((a, b) =>
    destinationCounts[a] > destinationCounts[b] ? a : b
  );

  return favorite;
}

module.exports = router;