import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '../../services/authService';
import AuthCarousel from './AuthCarousel';

const Login = ({ onLoginSuccess }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            console.log('Submitting login form:', formData);
            const response = await authService.login(formData.email, formData.password);
            console.log('Login response received:', response);
            if (response && response.token && response.user) {
                console.log('Login successful, updating state...');
                if (onLoginSuccess) {
                    onLoginSuccess(response.user);
                }

                const pendingCartAdd = localStorage.getItem('pendingCartAdd');
                
                if (pendingCartAdd) {
                    const { productId, quantity, returnUrl } = JSON.parse(pendingCartAdd);
                    
                    try {
                        await authService.refreshToken();
                        const cartService = require('../../services/cartService').cartService;
                        await cartService.addToCart(productId, quantity);
                        localStorage.removeItem('pendingCartAdd');
                        
                        if (returnUrl) {
                            navigate(returnUrl);
                            return;
                        }
                    } catch (err) {
                        console.error('Error adding pending product to cart:', err);
                    }
                }

                if (response.user.role === 'admin') {
                    console.log('Admin user detected, navigating to /admin');
                    navigate('/admin');
                } else {
                    console.log('Customer user detected, navigating to /');
                    navigate('/');
                }
            } else {
                setError('Login gagal: Respons tidak valid dari server');
            }
        } catch (err) {
            console.error('Login error:', err);
            if (err.response) {
                setError(err.response.data?.message || 'Email atau password salah');
            } else if (err.request) {
                setError('Tidak dapat terhubung ke server. Silakan coba lagi.');
            } else {
                setError('Terjadi kesalahan. Silakan coba lagi.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left side - Carousel */}
            <div className="hidden lg:block lg:w-1/2 h-screen">
                <AuthCarousel />
            </div>

            {/* Right side - Login Form */}
            <motion.div 
                className="w-full lg:w-1/2 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div 
                    className="absolute top-4 left-4 lg:left-[52%]"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <motion.button 
                        onClick={() => navigate('/')} 
                        className="flex items-center px-4 py-2 bg-white rounded-md shadow-md hover:bg-gray-100 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Kembali ke Beranda
                    </motion.button>
                </motion.div>
                <motion.div 
                    className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="text-center">
                        <div className="flex justify-center mb-4">
                            <span className="inline-block text-yellow-600 text-3xl font-bold">TobaHome <span className="text-gray-500">|</span> <span className="text-yellow-500">SICATE</span></span>
                        </div>
                        <motion.div 
                            className="text-center mb-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <motion.h2 
                                className="text-3xl font-extrabold text-gray-900 mb-2"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                            >
                                Login Akun
                            </motion.h2>
                            <motion.p 
                                className="text-xl font-bold text-gray-900"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.6 }}
                            >
                                Masuk ke Akun Anda
                            </motion.p>
                        </motion.div>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="rounded-md bg-red-50 p-4 border border-red-100 mb-6 shadow-sm">
                                <div className="flex items-center">
                                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">
                                            {error}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        )}

                        <motion.div 
                            className="space-y-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.7 }}
                        >
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.8 }}
                            >
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm shadow-sm"
                                    placeholder="Masukkan email anda"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.9 }}
                            >
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm shadow-sm"
                                    placeholder="Masukkan password anda"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </motion.div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 1.0 }}
                        >
                            <motion.button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors shadow-md"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                {loading ? 'Memproses...' : 'Masuk'}
                            </motion.button>
                        </motion.div>

                        <motion.div 
                            className="text-center mt-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 1.1 }}
                        >
                            <p className="text-sm text-gray-600">
                                Belum memiliki akun?{' '}
                                <motion.span
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Link to="/register" className="font-medium text-yellow-600 hover:text-yellow-500 transition-colors">
                                        Daftar disini
                                    </Link>
                                </motion.span>
                            </p>
                        </motion.div>
                    </form>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Login;
