/**
 * Authentication Routes
 * Handles user signup, login, token refresh, and password reset
 * Uses Supabase Auth for secure authentication
 * Enhanced with authService and email notifications
 */

const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const authService = require('../services/authService');

// Create child logger for auth routes
const log = logger;

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 * @body    { email: string, password: string, fullName?: string }
 */
router.post('/signup', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    
    const result = await authService.signup({ email, password, fullName });
    
    if (!result.success) {
      const statusCode = result.error.includes('already registered') ? 409 : 400;
      return res.status(statusCode).json(result);
    }

    res.status(201).json(result);

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
    
    const result = await authService.login({ email, password });
    
    if (!result.success) {
      return res.status(401).json(result);
    }

    res.json(result);

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
    
    const result = await authService.refreshToken(refresh_token);
    
    if (!result.success) {
      return res.status(401).json(result);
    }

    res.json(result);

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
    
    const result = await authService.logout(token);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);

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
    
    const result = await authService.forgotPassword(email);
    
    res.json(result);

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
    
    const result = await authService.resetPassword({
      accessToken: access_token,
      newPassword: new_password
    });
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);

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
    
    const result = await authService.getCurrentUser(token);
    
    if (!result.success) {
      return res.status(401).json(result);
    }

    res.json(result);

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
    
    const result = await authService.verifyEmail({ token, type });
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);

  } catch (error) {
    log.error('Email verification error', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to verify email'
    });
  }
});

module.exports = router;
