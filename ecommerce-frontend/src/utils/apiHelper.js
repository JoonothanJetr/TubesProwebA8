/**
 * API service helper for consistent error handling
 */
import axios from 'axios';
import Swal from 'sweetalert2';

// Constants
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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

  // Return standardized error object
  return {
    message: errorMessage,
    status: error?.response?.status || 500,
    isApiError: true,
    originalError: error
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
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
    ...config,
  });

  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      // Get token from storage
      const token = localStorage.getItem('token');
      
      // Add token to headers if available
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  client.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // Handle 401 Unauthorized errors globally
      if (error.response && error.response.status === 401) {
        // If not on login page
        if (!window.location.pathname.includes('login')) {
          // Clear local storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Show message
          Swal.fire({
            icon: 'warning',
            title: 'Sesi Berakhir',
            text: 'Sesi Anda telah berakhir. Silakan login kembali.',
            confirmButtonColor: '#ffc107'
          }).then(() => {
            // Redirect to login page
            window.location.href = '/login';
          });
        }
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
