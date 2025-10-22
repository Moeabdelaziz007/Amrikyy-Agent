/**
 * Auth API Service
 * Handles authentication with Amrikyy backend API
 */

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string | null;
  avatar?: string | null;
  createdAt?: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: AuthUser;
  session?: AuthSession;
  error?: string;
}

class AuthAPIService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Load tokens from localStorage on init
    this.loadTokens();
  }

  /**
   * Load tokens from localStorage
   */
  private loadTokens() {
    this.accessToken = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  /**
   * Save tokens to localStorage
   */
  private saveTokens(session: AuthSession) {
    this.accessToken = session.access_token;
    this.refreshToken = session.refresh_token;
    localStorage.setItem('access_token', session.access_token);
    localStorage.setItem('refresh_token', session.refresh_token);
    localStorage.setItem('token_expires_at', session.expires_at.toString());
  }

  /**
   * Clear tokens from localStorage
   */
  private clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expires_at');
    localStorage.removeItem('user');
  }

  /**
   * Make authenticated API request
   */
  private async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add auth token if available
    if (
      this.accessToken &&
      !endpoint.includes('/auth/login') &&
      !endpoint.includes('/auth/signup')
    ) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      // Handle token expiration
      if (response.status === 401 && this.refreshToken) {
        // Try to refresh token
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry original request with new token
          (headers as Record<string, string>)['Authorization'] = `Bearer ${this.accessToken}`;
          const retryResponse = await fetch(url, {
            ...options,
            headers,
          });
          return await retryResponse.json();
        }
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * Sign up new user
   */
  async signUp(
    email: string,
    password: string,
    fullName?: string
  ): Promise<AuthResponse> {
    try {
      const response = await this.makeRequest('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, fullName }),
      });

      if (response.success && response.session) {
        this.saveTokens(response.session);
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      }

      return response;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Signup failed',
      };
    }
  }

  /**
   * Sign in user
   */
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await this.makeRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response.success && response.session) {
        this.saveTokens(response.session);
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      }

      return response;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Login failed',
      };
    }
  }

  /**
   * Sign out user
   */
  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.makeRequest('/api/auth/logout', {
        method: 'POST',
      });

      this.clearTokens();

      return { success: true };
    } catch (error: any) {
      // Clear tokens anyway
      this.clearTokens();
      return {
        success: false,
        error: error.message || 'Logout failed',
      };
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      });

      const data = await response.json();

      if (data.success && data.session) {
        this.saveTokens(data.session);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<{ user: AuthUser | null; error?: string }> {
    try {
      // First try to get from localStorage
      const cachedUser = localStorage.getItem('user');
      if (cachedUser) {
        return { user: JSON.parse(cachedUser) };
      }

      // If not cached, fetch from API
      const response = await this.makeRequest('/api/auth/me', {
        method: 'GET',
      });

      if (response.success && response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
        return { user: response.user };
      }

      return { user: null, error: response.error };
    } catch (error: any) {
      return { user: null, error: error.message };
    }
  }

  /**
   * Forgot password
   */
  async forgotPassword(
    email: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await this.makeRequest('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      return response;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to send reset email',
      };
    }
  }

  /**
   * Reset password
   */
  async resetPassword(
    accessToken: string,
    newPassword: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await this.makeRequest('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          access_token: accessToken,
          new_password: newPassword,
        }),
      });

      return response;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to reset password',
      };
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return this.refreshToken;
  }
}

// Export singleton instance
export const authAPI = new AuthAPIService();
export default authAPI;
