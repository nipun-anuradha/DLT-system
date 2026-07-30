import { API_BASE_URL, STORAGE_KEYS } from './constants';

// API Helper Functions

export const getAuthToken = () => {
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
};

export const getAdminToken = () => {
  return localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
};

export const setAuthToken = (token) => {
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
};

export const removeAuthToken = () => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER_DATA);
};

export const removeAdminToken = () => {
  localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.ADMIN_DATA);
};

const handleAuthError = (endpoint, status) => {
  const isAdmin = isAdminRoute(endpoint);

  if (status === 401 || status === 403) {
    if (isAdmin) {
      removeAdminToken();
      window.location.href = '/admin';
    } else {
      removeAuthToken();
      window.location.href = '/login';
    }
  }
};

// Check if endpoint is an admin route
const isAdminRoute = (endpoint) => {
  return endpoint.startsWith('/admin') || endpoint.includes('/admin/');
};

// Base fetch wrapper
export const apiRequest = async (endpoint, options = {}) => {
  // Use admin token for admin routes, otherwise use regular auth token
  const token = isAdminRoute(endpoint) ? getAdminToken() : getAuthToken();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      handleAuthError(endpoint, response.status);
      const error = await response.json();
      throw new Error(error.message || 'Something went wrong');
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// API Methods
export const api = {
  get: (endpoint, options = {}) => 
    apiRequest(endpoint, { ...options, method: 'GET' }),
  
  post: (endpoint, data, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  put: (endpoint, data, options = {}) =>
    apiRequest(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (endpoint, options = {}) =>
    apiRequest(endpoint, { ...options, method: 'DELETE' }),
};

export default api;
