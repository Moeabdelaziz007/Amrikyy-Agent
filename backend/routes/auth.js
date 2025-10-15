/**
 * Authentication Routes
 * Handles user signup, login, token refresh, and password reset
 * Uses Supabase Auth for secure authentication
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { logger } = require('../utils/logger');

// Create child logger for auth routes
const log = logger.child('AuthRoutes');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 * @body    { email: string, password: string, fullName?: string }
 */
router.post('/signup', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    // Validation
    if (!email || !password) {
      log.warn('Signup attempt with missing credentials');
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    if (password.length < 6) {
      log.warn('Signup attempt with weak password');
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      log.warn('Signup attempt with invalid email', { email });
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    log.info('Creating new user account', { email });

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || null
        }
      }
    });

    if (error) {
      log.error('Signup failed', { error: error.message, email });
      
      // Handle specific errors
      if (error.message.includes('already registered')) {
        return res.status(409).json({
          success: false,
          error: 'Email already registered'
        });
      }
      
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    // Create user profile in database
    if (data.user) {
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            full_name: fullName || null,
            created_at: new Date().toISOString()
          });

        if (profileError) {
          log.warn('Profile creation failed', { error: profileError.message });
        }
      } catch (profileErr) {
        log.warn('Profile creation error', { error: profileErr.message });
      }
    }

    log.success('User account created successfully', { 
      userId: data.user?.id,
      email 
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Please check your email for verification.',
      user: {
        id: data.user?.id,
        email: data.user?.email,
        fullName: fullName || null
      },
      session: data.session
    });

  } catch (error) {
    log.error('Signup error', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to create account. Please try again.'
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return session
 * @access  Public
 * @body    { email: string, password: string }
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      log.warn('Login attempt with missing credentials');
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    log.info('User login attempt', { email });

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      log.warn('Login failed', { error: error.message, email });
      
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Get user profile
    let profile = null;
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      profile = profileData;
    } catch (profileErr) {
      log.warn('Profile fetch failed', { error: profileErr.message });
    }

    log.success('User logged in successfully', { 
      userId: data.user?.id,
      email 
    });

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: data.user?.id,
        email: data.user?.email,
        fullName: profile?.full_name || null,
        avatar: profile?.avatar_url || null
      },
      session: {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        expires_at: data.session?.expires_at,
        expires_in: data.session?.expires_in
      }
    });

  } catch (error) {
    log.error('Login error', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Login failed. Please try again.'
    });
  }
});

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token using refresh token
 * @access  Public
 * @body    { refresh_token: string }
 */
router.post('/refresh-token', async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      log.warn('Token refresh attempt without refresh token');
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required'
      });
    }

    log.info('Refreshing access token');

    // Refresh session with Supabase
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token
    });

    if (error) {
      log.warn('Token refresh failed', { error: error.message });
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired refresh token'
      });
    }

    log.success('Access token refreshed successfully', {
      userId: data.user?.id
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      session: {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        expires_at: data.session?.expires_at,
        expires_in: data.session?.expires_in
      }
    });

  } catch (error) {
    log.error('Token refresh error', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to refresh token'
    });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and invalidate session
 * @access  Private
 * @headers Authorization: Bearer <token>
 */
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    log.info('User logout attempt');

    // Sign out with Supabase
    const { error } = await supabase.auth.signOut();

    if (error) {
      log.warn('Logout failed', { error: error.message });
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    log.success('User logged out successfully');

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    log.error('Logout error', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 * @body    { email: string }
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      log.warn('Password reset attempt without email');
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    log.info('Password reset requested', { email });

    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`
    });

    if (error) {
      log.warn('Password reset email failed', { error: error.message, email });
      // Don't reveal if email exists or not for security
    }

    // Always return success to prevent email enumeration
    log.success('Password reset email sent (if email exists)', { email });

    res.json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link.'
    });

  } catch (error) {
    log.error('Password reset error', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to process password reset request'
    });
  }
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 * @body    { access_token: string, new_password: string }
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { access_token, new_password } = req.body;

    if (!access_token || !new_password) {
      log.warn('Password reset attempt with missing data');
      return res.status(400).json({
        success: false,
        error: 'Access token and new password are required'
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    log.info('Resetting user password');

    // Update password
    const { error } = await supabase.auth.updateUser({
      password: new_password
    });

    if (error) {
      log.warn('Password reset failed', { error: error.message });
      return res.status(400).json({
        success: false,
        error: 'Failed to reset password. Token may be invalid or expired.'
      });
    }

    log.success('Password reset successfully');

    res.json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.'
    });

  } catch (error) {
    log.error('Password reset error', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to reset password'
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 * @headers Authorization: Bearer <token>
 */
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    // Get user from token
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      log.warn('Invalid token', { error: error?.message });
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: profile?.full_name || null,
        avatar: profile?.avatar_url || null,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    log.error('Get user error', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to get user profile'
    });
  }
});

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email with token
 * @access  Public
 * @body    { token: string, type: string }
 */
router.post('/verify-email', async (req, res) => {
  try {
    const { token, type } = req.body;

    if (!token || !type) {
      return res.status(400).json({
        success: false,
        error: 'Token and type are required'
      });
    }

    log.info('Email verification attempt');

    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type
    });

    if (error) {
      log.warn('Email verification failed', { error: error.message });
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification token'
      });
    }

    log.success('Email verified successfully');

    res.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    log.error('Email verification error', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to verify email'
    });
  }
});

module.exports = router;
