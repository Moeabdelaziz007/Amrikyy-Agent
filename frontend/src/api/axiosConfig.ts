/**
 * Axios Configuration with Token Refresh
 * Automatically refreshes tokens when they expire
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import authAPI from './authService';

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authAPI.getAccessToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return apiClient(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh the token
        const refreshed = await authAPI.refreshAccessToken();

        if (refreshed) {
          // Token refreshed successfully
          processQueue();

          // Retry the original request with new token
          const token = authAPI.getAccessToken();
          if (originalRequest.headers && token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }

          return apiClient(originalRequest);
        } else {
          // Refresh failed, redirect to login
          processQueue(new Error('Token refresh failed'));

          // Clear auth state
          await authAPI.signOut();

          // Redirect to login page
          if (window.location.pathname !== '/') {
            window.location.href = '/';
          }

          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError);

        // Clear auth state
        await authAPI.signOut();

        // Redirect to login page
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
