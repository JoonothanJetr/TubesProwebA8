import axios from 'axios';

// Ambil API_URL dari environment variable, sama seperti productService
const API_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:5000/api';

// Konfigurasi base URL untuk axios
const axiosInstance = axios.create({
    baseURL: API_URL, // <-- Gunakan API_URL dari env
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

class AuthService {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user'));
        
        // Set token untuk request jika sudah ada
        if (this.token) {
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
        }
    }
    
    // Fungsi untuk me-refresh token dari localStorage ke axiosInstance
    refreshToken() {
        this.token = localStorage.getItem('token');
        if (this.token) {
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
            return true;
        }
        return false;
    }

    async register(userData) {
        try {
            console.log('Attempting to register:', userData);
            const response = await axiosInstance.post('/auth/register', userData);
            console.log('Register response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Register error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            throw error;
        }
    }

    async login(email, password) {
        try {
            console.log('Attempting to login with:', { email, password });
            const response = await axiosInstance.post('/auth/login', {
                email,
                password
            });
            console.log('Login response:', response.data);

            if (response.data && response.data.token) {
                this.setToken(response.data.token);
                this.setUser(response.data.user);
                return response.data;
            }
            return null;
        } catch (error) {
            console.error('Login error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                headers: error.response?.headers
            });
            throw error;
        }
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.token = null;
        this.user = null;
        // Hapus header Authorization
        delete axiosInstance.defaults.headers.common['Authorization'];
        window.location.href = '/login';
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    setUser(user) {
        this.user = user;
        localStorage.setItem('user', JSON.stringify(user));
    }

    getToken() {
        return this.token;
    }

    getUser() {
        return this.user;
    }

    isAuthenticated() {
        return !!this.token;
    }
}

// Konfigurasi axios interceptors untuk handling error
axiosInstance.interceptors.request.use(
    config => {
        console.log('Request:', {
            url: config.url,
            method: config.method,
            headers: config.headers,
            data: config.data
        });
        return config;
    },
    error => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    response => {
        console.log('Response:', {
            status: response.status,
            data: response.data,
            headers: response.headers
        });
        return response;
    },
    error => {
        console.error('Response Error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authService = new AuthService();