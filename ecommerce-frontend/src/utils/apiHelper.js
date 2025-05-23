/**
 * API service helper for consistent error handling
 */
import axios from 'axios';
import Swal from 'sweetalert2';
import { authService } from '../services/authService';

// Constants
export const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Generic API error handler
 * @param {Error} error - The error object from axios
 * @param {string} fallbackMessage - Fallback error message if no specific error message found
 * @param {boolean} showAlert - Whether to show an alert for the error
 * @returns {Object} Standardized error object 
 */
export const handleApiError = (error, fallbackMessage = 'Terjadi kesalahan', showAlert = false) => {
  // Extract the most specific error message available
  const errorMessage = 
    error?.response?.data?.error || 
    error?.response?.data?.message || 
    error?.message || 
    fallbackMessage;

  // Log the error for debugging
  console.error(errorMessage, error);

  // Show alert if requested
  if (showAlert) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: errorMessage,
      confirmButtonColor: '#ffc107'
    });
  }

  // If the error is due to auth, redirect to login
  if (error?.response?.status === 401 || error?.response?.status === 403) {
    authService.clearAuth();
  }

  // Return standardized error object
  return {
    error: errorMessage,
    status: error?.response?.status
  };
};

/**
 * Make API request with consistent error handling
 * @param {Function} apiCall - Async function that makes the API call 
 * @param {string} fallbackMessage - Error message if request fails
 * @param {boolean} showAlert - Whether to show error alert
 * @returns {Promise<any>} Response data or throws standardized error
 */
export const makeApiRequest = async (apiCall, fallbackMessage = 'Permintaan gagal', showAlert = false) => {
  try {
    const response = await apiCall();
    return response.data;
  } catch (error) {
    const handledError = handleApiError(error, fallbackMessage, showAlert);
    throw handledError;
  }
};

/**
 * Create axios instance with default configuration
 * @param {Object} config - Axios configuration options
 * @returns {Object} Axios instance
 */
export const createApiClient = (config = {}) => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    ...config,
  });

  // Request interceptor 
  client.interceptors.request.use(
    (config) => {
      // Set default Content-Type if not already set
      if (!config.headers['Content-Type'] && !(config.data instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json';
      }      // Get token and clean any existing Bearer prefix
      const token = authService.getToken();
      if (token) {
        // Remove Bearer prefix if exists and add it once
        const cleanToken = token.replace('Bearer ', '');
        const formattedToken = `Bearer ${cleanToken}`;
        config.headers['Authorization'] = formattedToken;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle 401 Unauthorized and 403 Forbidden errors globally 
      if (error.response?.status === 401 || error.response?.status === 403) {
        authService.clearAuth();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return client;
};

// Create default API client
export const apiClient = createApiClient();

export default {
  handleApiError,
  makeApiRequest,
  createApiClient,
  apiClient,
  API_BASE_URL
};
