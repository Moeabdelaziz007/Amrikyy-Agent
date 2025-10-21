/**
 * Authentication Service
 * Centralized auth logic using Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const logger = require('../../utils/logger');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

class AuthService {
  /**
   * Sign up new user
   */
  async signUp(email, password, fullName) {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (authError) throw authError;

      logger.info(`✅ User signed up: ${email}`);
      return {
        success: true,
        user: authData.user,
        session: authData.session,
      };
    } catch (error) {
      logger.error('❌ Sign up error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Sign in user
   */
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      logger.info(`✅ User signed in: ${email}`);
      return {
        success: true,
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      logger.error('❌ Sign in error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Sign out user
   */
  async signOut(accessToken) {
    try {
      const { error } = await supabase.auth.signOut(accessToken);
      if (error) throw error;

      logger.info('✅ User signed out');
      return { success: true };
    } catch (error) {
      logger.error('❌ Sign out error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get user by token
   */
  async getUserByToken(accessToken) {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(accessToken);

      if (error) throw error;

      return {
        success: true,
        user,
      };
    } catch (error) {
      logger.error('❌ Get user error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Refresh session
   */
  async refreshSession(refreshToken) {
    try {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error) throw error;

      logger.info('✅ Session refreshed');
      return {
        success: true,
        session: data.session,
      };
    } catch (error) {
      logger.error('❌ Refresh session error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
      });

      if (error) throw error;

      logger.info(`✅ Password reset sent to: ${email}`);
      return { success: true };
    } catch (error) {
      logger.error('❌ Reset password error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Update password
   */
  async updatePassword(accessToken, newPassword) {
    try {
      const { data, error } = await supabase.auth.updateUser(accessToken, {
        password: newPassword,
      });

      if (error) throw error;

      logger.info('✅ Password updated');
      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      logger.error('❌ Update password error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(token) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email',
      });

      if (error) throw error;

      logger.info('✅ Email verified');
      return {
        success: true,
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      logger.error('❌ Verify email error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = new AuthService();
