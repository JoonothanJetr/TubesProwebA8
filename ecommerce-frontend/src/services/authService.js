import axios from 'axios';

// Ambil API_URL dari environment variable
const API_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:5000/api';

// Konfigurasi base URL untuk axios
const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

class AuthService {
    constructor() {
        this.token = null;
        this.user = null;
        
        // Load stored auth data
        this.loadStoredAuth();
        
        // Setup axios interceptors
        this.setupInterceptors();
    }

    loadStoredAuth() {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
            try {
                this.token = this.formatToken(storedToken);
                this.user = JSON.parse(storedUser);
                this.setAuthHeader(this.token);
            } catch (error) {
                console.error('Error loading stored auth:', error);
                this.clearAuth();
            }
        }
    }

    clearAuth() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.token = null;
        this.user = null;
        this.setAuthHeader(null);
    }

    formatToken(token) {
        if (!token) return null;
        return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }

    setupInterceptors() {
        // Request interceptor for axiosInstance
        axiosInstance.interceptors.request.use(
            (config) => {
                const token = this.getToken();
                if (token) {
                    config.headers['Authorization'] = token;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor for axiosInstance
        axiosInstance.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401 || error.response?.status === 403) {
                    this.clearAuth();
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        );

        // Set up the same interceptors for the global axios instance
        axios.interceptors.request.use(
            (config) => {
                const token = this.getToken();
                if (token && !config.headers['Authorization']) {
                    config.headers['Authorization'] = token;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401 || error.response?.status === 403) {
                    this.clearAuth();
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        );
    }

    setAuthHeader(token) {
        if (token) {
            axiosInstance.defaults.headers.common['Authorization'] = token;
            axios.defaults.headers.common['Authorization'] = token;
        } else {
            delete axiosInstance.defaults.headers.common['Authorization'];
            delete axios.defaults.headers.common['Authorization'];
        }
    }

    async login(email, password) {
        try {
            const response = await axiosInstance.post('/auth/login', { email, password });
            
            if (response.data && response.data.token) {
                const formattedToken = this.formatToken(response.data.token);
                this.token = formattedToken;
                this.user = response.data.user;
                
                localStorage.setItem('token', formattedToken);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                
                this.setAuthHeader(formattedToken);
                return response.data;
            }
            return null;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async register({ username, email, password }) {
        try {
            const response = await axiosInstance.post('/auth/register', {
                username,
                email,
                password
            });
            return response.data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    async registerAdmin({ username, email, password, registrationKey }) {
        try {
            const response = await axiosInstance.post('/auth/register/admin', {
                username,
                email,
                password,
                registrationKey
            });
            return response.data;
        } catch (error) {
            console.error('Admin registration error:', error);
            throw error;
        }
    }
    
    logout() {
        this.clearAuth();
        window.location.href = '/login';
    }

    getToken() {
        return this.token;
    }

    getUser() {
        return this.user;
    }

    isAuthenticated() {
        if (!this.token || !this.user) return false;

        try {
            // Parse JWT
            const payloadBase64 = this.token.split('.')[1];
            const payload = JSON.parse(atob(payloadBase64));
            
            // Check expiration
            const currentTime = Date.now() / 1000;
            if (payload.exp <= currentTime) {
                this.clearAuth();
                return false;
            }

            return true;
        } catch (error) {
            console.error('Token validation error:', error);
            this.clearAuth();
            return false;
        }
    }
}

export const authService = new AuthService();