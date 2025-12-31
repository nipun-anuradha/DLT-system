// Authentication Service

import api from '../utils/api';
import { API_ENDPOINTS, STORAGE_KEYS } from '../utils/constants';

export const authService = {
  // Login
  login: async (credentials) => {
    try {
      const response = await api.post(API_ENDPOINTS.LOGIN, credentials);
      
      if (response.token) {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
        if (response.refreshToken) {
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
        }
        if (response.user) {
          localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
        }
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      await api.post(API_ENDPOINTS.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    }
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await api.post(API_ENDPOINTS.FORGOT_PASSWORD, { email });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post(API_ENDPOINTS.RESET_PASSWORD, {
        token,
        newPassword
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default authService;
