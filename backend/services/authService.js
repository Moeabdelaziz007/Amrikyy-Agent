/**
 * Authentication Service
 * Handles user authentication, registration, and password management
 * Integrates with Supabase Auth and Email Service
 */

const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');
const emailService = require('./emailService');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

class AuthService {
  /**
   * Register a new user
   */
  async signup({ email, password, fullName }) {
    try {
      // Validation
      if (!email || !password) {
        return {
          success: false,
          error: 'Email and password are required'
        };
      }

      if (password.length < 6) {
        return {
          success: false,
          error: 'Password must be at least 6 characters long'
        };
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          success: false,
          error: 'Invalid email format'
        };
      }

      logger.info('Creating new user account', { email });

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
        logger.error('Signup failed', { error: error.message, email });
        
        if (error.message.includes('already registered')) {
          return {
            success: false,
            error: 'Email already registered'
          };
        }
        
        return {
          success: false,
          error: error.message
        };
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
            logger.warn('Profile creation failed', { error: profileError.message });
          }
        } catch (profileErr) {
          logger.warn('Profile creation error', { error: profileErr.message });
        }

        // Send welcome email
        try {
          await emailService.sendWelcomeEmail(email, fullName || 'there');
          logger.info('Welcome email sent', { email });
        } catch (emailErr) {
          logger.warn('Failed to send welcome email', { error: emailErr.message });
        }
      }

      logger.info('User account created successfully', { 
        userId: data.user?.id,
        email 
      });

      return {
        success: true,
        message: 'Account created successfully. Please check your email for verification.',
        user: {
          id: data.user?.id,
          email: data.user?.email,
          fullName: fullName || null
        },
        session: data.session
      };

    } catch (error) {
      logger.error('Signup error', { error: error.message });
      return {
        success: false,
        error: 'Failed to create account. Please try again.'
      };
    }
  }

  /**
   * Login user
   */
  async login({ email, password }) {
    try {
      // Validation
      if (!email || !password) {
        return {
          success: false,
          error: 'Email and password are required'
        };
      }

      logger.info('User login attempt', { email });

      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        logger.warn('Login failed', { error: error.message, email });
        return {
          success: false,
          error: 'Invalid email or password'
        };
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
        logger.warn('Profile fetch failed', { error: profileErr.message });
      }

      logger.info('User logged in successfully', { 
        userId: data.user?.id,
        email 
      });

      return {
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
      };

    } catch (error) {
      logger.error('Login error', { error: error.message });
      return {
        success: false,
        error: 'Login failed. Please try again.'
      };
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken) {
    try {
      if (!refreshToken) {
        return {
          success: false,
          error: 'Refresh token is required'
        };
      }

      logger.info('Refreshing access token');

      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken
      });

      if (error) {
        logger.warn('Token refresh failed', { error: error.message });
        return {
          success: false,
          error: 'Invalid or expired refresh token'
        };
      }

      logger.info('Access token refreshed successfully', {
        userId: data.user?.id
      });

      return {
        success: true,
        message: 'Token refreshed successfully',
        session: {
          access_token: data.session?.access_token,
          refresh_token: data.session?.refresh_token,
          expires_at: data.session?.expires_at,
          expires_in: data.session?.expires_in
        }
      };

    } catch (error) {
      logger.error('Token refresh error', { error: error.message });
      return {
        success: false,
        error: 'Failed to refresh token'
      };
    }
  }

  /**
   * Logout user
   */
  async logout(token) {
    try {
      if (!token) {
        return {
          success: false,
          error: 'No token provided'
        };
      }

      logger.info('User logout attempt');

      const { error } = await supabase.auth.signOut();

      if (error) {
        logger.warn('Logout failed', { error: error.message });
        return {
          success: false,
          error: error.message
        };
      }

      logger.info('User logged out successfully');

      return {
        success: true,
        message: 'Logged out successfully'
      };

    } catch (error) {
      logger.error('Logout error', { error: error.message });
      return {
        success: false,
        error: 'Logout failed'
      };
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(email) {
    try {
      if (!email) {
        return {
          success: false,
          error: 'Email is required'
        };
      }

      logger.info('Password reset requested', { email });

      // Generate reset link
      const resetLink = `${process.env.FRONTEND_URL}/reset-password`;

      // Send password reset email via Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: resetLink
      });

      if (error) {
        logger.warn('Password reset email failed', { error: error.message, email });
      }

      // Also send custom email via Gmail
      try {
        await emailService.sendPasswordReset(email, resetLink);
        logger.info('Custom password reset email sent', { email });
      } catch (emailErr) {
        logger.warn('Failed to send custom reset email', { error: emailErr.message });
      }

      // Always return success to prevent email enumeration
      logger.info('Password reset email sent (if email exists)', { email });

      return {
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link.'
      };

    } catch (error) {
      logger.error('Password reset error', { error: error.message });
      return {
        success: false,
        error: 'Failed to process password reset request'
      };
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword({ accessToken, newPassword }) {
    try {
      if (!accessToken || !newPassword) {
        return {
          success: false,
          error: 'Access token and new password are required'
        };
      }

      if (newPassword.length < 6) {
        return {
          success: false,
          error: 'Password must be at least 6 characters long'
        };
      }

      logger.info('Resetting user password');

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        logger.warn('Password reset failed', { error: error.message });
        return {
          success: false,
          error: 'Failed to reset password. Token may be invalid or expired.'
        };
      }

      logger.info('Password reset successfully');

      return {
        success: true,
        message: 'Password reset successfully. You can now login with your new password.'
      };

    } catch (error) {
      logger.error('Password reset error', { error: error.message });
      return {
        success: false,
        error: 'Failed to reset password'
      };
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(token) {
    try {
      if (!token) {
        return {
          success: false,
          error: 'No token provided'
        };
      }

      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        logger.warn('Invalid token', { error: error?.message });
        return {
          success: false,
          error: 'Invalid or expired token'
        };
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          fullName: profile?.full_name || null,
          avatar: profile?.avatar_url || null,
          createdAt: user.created_at
        }
      };

    } catch (error) {
      logger.error('Get user error', { error: error.message });
      return {
        success: false,
        error: 'Failed to get user profile'
      };
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail({ token, type }) {
    try {
      if (!token || !type) {
        return {
          success: false,
          error: 'Token and type are required'
        };
      }

      logger.info('Email verification attempt');

      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: type
      });

      if (error) {
        logger.warn('Email verification failed', { error: error.message });
        return {
          success: false,
          error: 'Invalid or expired verification token'
        };
      }

      logger.info('Email verified successfully');

      return {
        success: true,
        message: 'Email verified successfully'
      };

    } catch (error) {
      logger.error('Email verification error', { error: error.message });
      return {
        success: false,
        error: 'Failed to verify email'
      };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, updates) {
    try {
      if (!userId) {
        return {
          success: false,
          error: 'User ID is required'
        };
      }

      logger.info('Updating user profile', { userId });

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        logger.error('Profile update failed', { error: error.message, userId });
        return {
          success: false,
          error: 'Failed to update profile'
        };
      }

      logger.info('Profile updated successfully', { userId });

      return {
        success: true,
        message: 'Profile updated successfully',
        profile: data
      };

    } catch (error) {
      logger.error('Profile update error', { error: error.message });
      return {
        success: false,
        error: 'Failed to update profile'
      };
    }
  }
}

// Export singleton instance
const authService = new AuthService();
module.exports = authService;
