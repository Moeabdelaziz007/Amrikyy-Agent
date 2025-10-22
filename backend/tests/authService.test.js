/**
 * Unit Tests for Auth Service
 * Tests user signup, login, password reset, and email notifications
 */

const authService = require('../services/authService');
const emailService = require('../services/emailService');

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signUp: jest.fn().mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            email: 'user@example.com',
            created_at: new Date().toISOString()
          },
          session: {
            access_token: 'token-abc123',
            refresh_token: 'refresh-abc123'
          }
        },
        error: null
      }),
      signInWithPassword: jest.fn().mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            email: 'user@example.com'
          },
          session: {
            access_token: 'token-abc123',
            refresh_token: 'refresh-abc123'
          }
        },
        error: null
      }),
      resetPasswordForEmail: jest.fn().mockResolvedValue({
        data: {},
        error: null
      }),
      updateUser: jest.fn().mockResolvedValue({
        data: {
          user: { id: 'user-123' }
        },
        error: null
      }),
      refreshSession: jest.fn().mockResolvedValue({
        data: {
          session: {
            access_token: 'new-token-abc123',
            refresh_token: 'new-refresh-abc123'
          }
        },
        error: null
      }),
      signOut: jest.fn().mockResolvedValue({
        error: null
      })
    },
    from: jest.fn(() => ({
      insert: jest.fn().mockResolvedValue({ data: {}, error: null }),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'user-123',
              email: 'user@example.com',
              full_name: 'John Doe'
            },
            error: null
          })
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn().mockResolvedValue({ data: {}, error: null })
      }))
    }))
  }))
}));

jest.mock('../services/emailService');
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    emailService.sendWelcomeEmail = jest.fn().mockResolvedValue({
      success: true,
      messageId: 'msg-123'
    });

    emailService.sendPasswordReset = jest.fn().mockResolvedValue({
      success: true,
      messageId: 'msg-456'
    });
  });

  describe('signup()', () => {
    it('should create new user successfully', async () => {
      const result = await authService.signup({
        email: 'newuser@example.com',
        password: 'password123',
        fullName: 'New User'
      });

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user.id).toBe('user-123');
      expect(result.session).toBeDefined();
    });

    it('should send welcome email after signup', async () => {
      await authService.signup({
        email: 'newuser@example.com',
        password: 'password123',
        fullName: 'New User'
      });

      expect(emailService.sendWelcomeEmail).toHaveBeenCalledWith(
        'newuser@example.com',
        'New User'
      );
    });

    it('should create user profile in database', async () => {
      const { createClient } = require('@supabase/supabase-js');
      const mockSupabase = createClient();

      await authService.signup({
        email: 'newuser@example.com',
        password: 'password123',
        fullName: 'New User'
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
    });

    it('should fail when email is missing', async () => {
      const result = await authService.signup({
        password: 'password123',
        fullName: 'New User'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Email and password are required');
    });

    it('should fail when password is missing', async () => {
      const result = await authService.signup({
        email: 'newuser@example.com',
        fullName: 'New User'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Email and password are required');
    });

    it('should fail with weak password (less than 6 characters)', async () => {
      const result = await authService.signup({
        email: 'newuser@example.com',
        password: '12345',
        fullName: 'New User'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('at least 6 characters');
    });

    it('should fail with invalid email format', async () => {
      const result = await authService.signup({
        email: 'invalid-email',
        password: 'password123',
        fullName: 'New User'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid email format');
    });

    it('should handle duplicate email error', async () => {
      const { createClient } = require('@supabase/supabase-js');
      const mockSupabase = createClient();
      
      mockSupabase.auth.signUp.mockResolvedValueOnce({
        data: null,
        error: { message: 'User already registered' }
      });

      const result = await authService.signup({
        email: 'existing@example.com',
        password: 'password123'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('already registered');
    });

    it('should continue if welcome email fails', async () => {
      emailService.sendWelcomeEmail.mockResolvedValueOnce({
        success: false,
        error: 'Email service error'
      });

      const result = await authService.signup({
        email: 'newuser@example.com',
        password: 'password123',
        fullName: 'New User'
      });

      expect(result.success).toBe(true);
      // Should succeed even if email fails
    });

    it('should handle fullName being optional', async () => {
      const result = await authService.signup({
        email: 'newuser@example.com',
        password: 'password123'
      });

      expect(result.success).toBe(true);
    });

    it('should include session tokens in response', async () => {
      const result = await authService.signup({
        email: 'newuser@example.com',
        password: 'password123'
      });

      expect(result.session).toBeDefined();
      expect(result.session.access_token).toBe('token-abc123');
      expect(result.session.refresh_token).toBe('refresh-abc123');
    });
  });

  describe('login()', () => {
    it('should login user successfully', async () => {
      const result = await authService.login({
        email: 'user@example.com',
        password: 'password123'
      });

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.session).toBeDefined();
    });

    it('should fail when email is missing', async () => {
      const result = await authService.login({
        password: 'password123'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Email and password are required');
    });

    it('should fail when password is missing', async () => {
      const result = await authService.login({
        email: 'user@example.com'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Email and password are required');
    });

    it('should handle invalid credentials', async () => {
      const { createClient } = require('@supabase/supabase-js');
      const mockSupabase = createClient();
      
      mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: null,
        error: { message: 'Invalid login credentials' }
      });

      const result = await authService.login({
        email: 'user@example.com',
        password: 'wrongpassword'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid login credentials');
    });

    it('should return session tokens on successful login', async () => {
      const result = await authService.login({
        email: 'user@example.com',
        password: 'password123'
      });

      expect(result.session.access_token).toBeDefined();
      expect(result.session.refresh_token).toBeDefined();
    });
  });

  describe('requestPasswordReset()', () => {
    it('should send password reset email successfully', async () => {
      const result = await authService.requestPasswordReset('user@example.com');

      expect(result.success).toBe(true);
      expect(emailService.sendPasswordReset).toHaveBeenCalled();
    });

    it('should fail when email is missing', async () => {
      const result = await authService.requestPasswordReset(null);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Email is required');
    });

    it('should generate reset link with token', async () => {
      await authService.requestPasswordReset('user@example.com');

      expect(emailService.sendPasswordReset).toHaveBeenCalledWith(
        'user@example.com',
        expect.stringContaining('reset-password')
      );
    });

    it('should handle Supabase errors gracefully', async () => {
      const { createClient } = require('@supabase/supabase-js');
      const mockSupabase = createClient();
      
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValueOnce({
        data: null,
        error: { message: 'Email service error' }
      });

      const result = await authService.requestPasswordReset('user@example.com');

      expect(result.success).toBe(false);
    });

    it('should continue if email sending fails', async () => {
      emailService.sendPasswordReset.mockResolvedValueOnce({
        success: false,
        error: 'SMTP error'
      });

      const result = await authService.requestPasswordReset('user@example.com');

      // Should still succeed (Supabase sends email by default)
      expect(result.success).toBe(true);
    });
  });

  describe('resetPassword()', () => {
    it('should reset password successfully', async () => {
      const result = await authService.resetPassword({
        token: 'reset-token-123',
        newPassword: 'newpassword123'
      });

      expect(result.success).toBe(true);
    });

    it('should fail when token is missing', async () => {
      const result = await authService.resetPassword({
        newPassword: 'newpassword123'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Token and new password are required');
    });

    it('should fail when new password is missing', async () => {
      const result = await authService.resetPassword({
        token: 'reset-token-123'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Token and new password are required');
    });

    it('should fail with weak new password', async () => {
      const result = await authService.resetPassword({
        token: 'reset-token-123',
        newPassword: '12345'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('at least 6 characters');
    });
  });

  describe('refreshToken()', () => {
    it('should refresh access token successfully', async () => {
      const result = await authService.refreshToken('refresh-abc123');

      expect(result.success).toBe(true);
      expect(result.session).toBeDefined();
      expect(result.session.access_token).toBe('new-token-abc123');
    });

    it('should fail when refresh token is missing', async () => {
      const result = await authService.refreshToken(null);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Refresh token is required');
    });

    it('should handle invalid refresh token', async () => {
      const { createClient } = require('@supabase/supabase-js');
      const mockSupabase = createClient();
      
      mockSupabase.auth.refreshSession.mockResolvedValueOnce({
        data: null,
        error: { message: 'Invalid refresh token' }
      });

      const result = await authService.refreshToken('invalid-token');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid refresh token');
    });
  });

  describe('logout()', () => {
    it('should logout user successfully', async () => {
      const result = await authService.logout();

      expect(result.success).toBe(true);
    });

    it('should handle logout errors gracefully', async () => {
      const { createClient } = require('@supabase/supabase-js');
      const mockSupabase = createClient();
      
      mockSupabase.auth.signOut.mockResolvedValueOnce({
        error: { message: 'Session not found' }
      });

      const result = await authService.logout();

      expect(result.success).toBe(false);
    });
  });

  describe('getUserProfile()', () => {
    it('should retrieve user profile successfully', async () => {
      const result = await authService.getUserProfile('user-123');

      expect(result.success).toBe(true);
      expect(result.profile).toBeDefined();
      expect(result.profile.id).toBe('user-123');
    });

    it('should fail when user ID is missing', async () => {
      const result = await authService.getUserProfile(null);

      expect(result.success).toBe(false);
      expect(result.error).toContain('User ID is required');
    });

    it('should handle user not found', async () => {
      const { createClient } = require('@supabase/supabase-js');
      const mockSupabase = createClient();
      
      mockSupabase.from = jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'User not found' }
            })
          }))
        }))
      }));

      const result = await authService.getUserProfile('nonexistent-user');

      expect(result.success).toBe(false);
    });
  });

  describe('updateUserProfile()', () => {
    it('should update user profile successfully', async () => {
      const result = await authService.updateUserProfile('user-123', {
        full_name: 'Updated Name',
        phone: '+201234567890'
      });

      expect(result.success).toBe(true);
    });

    it('should fail when user ID is missing', async () => {
      const result = await authService.updateUserProfile(null, {
        full_name: 'Updated Name'
      });

      expect(result.success).toBe(false);
    });

    it('should handle update errors', async () => {
      const { createClient } = require('@supabase/supabase-js');
      const mockSupabase = createClient();
      
      mockSupabase.from = jest.fn(() => ({
        update: jest.fn(() => ({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Update failed' }
          })
        }))
      }));

      const result = await authService.updateUserProfile('user-123', {
        full_name: 'Updated Name'
      });

      expect(result.success).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should log errors when signup fails', async () => {
      const logger = require('../utils/logger');
      const { createClient } = require('@supabase/supabase-js');
      const mockSupabase = createClient();
      
      mockSupabase.auth.signUp.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' }
      });

      await authService.signup({
        email: 'user@example.com',
        password: 'password123'
      });

      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle profile creation failures gracefully', async () => {
      const { createClient } = require('@supabase/supabase-js');
      const mockSupabase = createClient();
      
      mockSupabase.from = jest.fn(() => ({
        insert: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Profile creation failed' }
        })
      }));

      const result = await authService.signup({
        email: 'user@example.com',
        password: 'password123'
      });

      // Should still succeed even if profile creation fails
      expect(result.success).toBe(true);
    });
  });
});
