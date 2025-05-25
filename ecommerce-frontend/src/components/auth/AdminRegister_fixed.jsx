import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '../../services/authService';
import AuthCarousel from './AuthCarousel';

const AdminRegister = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        registrationKey: '' // Special key required for admin registration
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
        setSuccess('');
    };

    const validateForm = () => {
        if (!formData.username.trim()) {
            setError('Username harus diisi');
            return false;
        }
        if (!formData.email.trim()) {
            setError('Email harus diisi');
            return false;
        }
        if (!formData.email.includes('@')) {
            setError('Email tidak valid');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Password harus minimal 6 karakter');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Password tidak cocok');
            return false;
        }
        if (!formData.registrationKey.trim()) {
            setError('Kunci registrasi admin harus diisi');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const response = await authService.registerAdmin({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                registrationKey: formData.registrationKey
            });

            // Login setelah registrasi berhasil
            const loginResponse = await authService.login(formData.email, formData.password);
            if (loginResponse && loginResponse.token && loginResponse.user) {
                setSuccess('Akun admin berhasil dibuat! Anda akan dialihkan ke dashboard admin...');
                setTimeout(() => {
                    navigate('/admin');
                }, 2000);
            }
        } catch (err) {
            console.error('Admin registration error:', err);
            if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else {
                setError('Terjadi kesalahan pada server. Silakan coba lagi nanti.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-gradient-to-r from-yellow-50 via-white to-gray-100">
            {/* Left side - Carousel */}
            <motion.div 
                className="hidden lg:block lg:w-1/2 h-screen overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7 }}
            >
                <AuthCarousel />
            </motion.div>

            {/* Right side - Register Form */}
            <motion.div 
                className="relative w-full flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 lg:w-1/2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div 
                    className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <motion.button 
                        onClick={() => navigate('/')} 
                        className="flex items-center px-3 py-2 bg-white rounded-lg shadow-md hover:bg-yellow-50 transition-colors border border-gray-200 text-gray-700 font-medium text-sm"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Kembali
                    </motion.button>
                </motion.div>

                <motion.div 
                    className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <motion.div 
                        className="text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <h2 className="text-2xl font-bold mb-2">Registrasi Admin</h2>
                        <p className="text-gray-600 mb-6">Daftar sebagai admin untuk mengelola produk dan pesanan</p>
                        
                        {error && (
                            <div className="rounded-md bg-red-50 p-3 border border-red-200 mb-4">
                                <div className="flex">
                                    <svg className="h-5 w-5 text-red-400 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-red-800">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {success && (
                            <div className="rounded-md bg-green-50 p-3 border border-green-200 mb-4">
                                <div className="flex">
                                    <svg className="h-5 w-5 text-green-400 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-green-800">{success}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    <form onSubmit={handleSubmit}>
                        <motion.div 
                            className="space-y-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.8 }}
                        >
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    className="block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-400 focus:border-yellow-500 text-sm shadow-sm hover:border-yellow-300"
                                    placeholder="Masukkan username anda"
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-400 focus:border-yellow-500 text-sm shadow-sm hover:border-yellow-300"
                                    placeholder="Masukkan email anda"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-400 focus:border-yellow-500 text-sm shadow-sm hover:border-yellow-300"
                                    placeholder="Masukkan password anda"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    className="block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-400 focus:border-yellow-500 text-sm shadow-sm hover:border-yellow-300"
                                    placeholder="Konfirmasi password anda"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="registrationKey" className="block text-sm font-medium text-gray-700 mb-1">Kunci Registrasi Admin</label>
                                <input
                                    id="registrationKey"
                                    name="registrationKey"
                                    type="password"
                                    required
                                    className="block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-1 focus:ring-yellow-400 focus:border-yellow-500 text-sm shadow-sm hover:border-yellow-300"
                                    placeholder="Masukkan kunci registrasi"
                                    value={formData.registrationKey}
                                    onChange={handleChange}
                                />
                            </div>
                        </motion.div>

                        <motion.div 
                            className="mt-5"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 1.0 }}
                        >
                            <motion.button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                {loading ? 'Memproses...' : 'Daftar'}
                            </motion.button>
                        </motion.div>

                        <motion.div 
                            className="text-center mt-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 1.1 }}
                        >
                            <p className="text-xs text-gray-600">
                                Sudah memiliki akun?{' '}
                                <motion.span
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Link to="/login" className="font-medium text-yellow-600 hover:text-yellow-500 transition-colors">
                                        Masuk disini
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

export default AdminRegister;
