import axios from 'axios';
import { authService } from '../services/authService';

// Ambil API_URL dari environment variable
const API_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Accept': 'application/json'
    }
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Don't set Content-Type for FormData
        if (!(config.data instanceof FormData)) {
            config.headers['Content-Type'] = 'application/json';
        }
        
        // Get fresh token from authService
        const token = authService.getToken();
        if (token) {
            config.headers['Authorization'] = token;
        }

        return config;
    },
    (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            authService.logout();
            window.location.href = '/login';
            return Promise.reject(new Error('Session expired. Please login again.'));
        }
        
        // Log error detail for debugging
        console.error('API Error Response:', {
            url: error.config?.url,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        
        return Promise.reject(error);
    }
);

export default api;