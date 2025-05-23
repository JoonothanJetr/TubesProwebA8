import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Reset error and success when user types
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
            // Mencoba melakukan registrasi
            await authService.register({
                username: formData.username,
                email: formData.email,
                password: formData.password
            });

            // Login otomatis setelah registrasi berhasil
            try {
                await authService.login(formData.email, formData.password);
                
                // Periksa apakah ada produk yang tertunda untuk ditambahkan ke keranjang
                const pendingCartAdd = localStorage.getItem('pendingCartAdd');
                
                if (pendingCartAdd) {
                    const { productId, quantity, returnUrl } = JSON.parse(pendingCartAdd);
                    
                    try {
                        // Tambahkan produk ke keranjang
                        await authService.refreshToken();
                        const cartService = require('../../services/cartService').cartService;
                        await cartService.addToCart(productId, quantity);
                        
                        // Hapus data pendingCartAdd
                        localStorage.removeItem('pendingCartAdd');
                        
                        setSuccess('Akun berhasil dibuat! Produk ditambahkan ke keranjang. Mengalihkan...');
                        
                        // Navigasi kembali ke halaman produk
                        if (returnUrl) {
                            setTimeout(() => {
                                navigate(returnUrl);
                            }, 2000);
                            return;
                        }
                    } catch (cartErr) {
                        console.error('Error adding pending product to cart:', cartErr);
                    }
                }
                
                setSuccess('Akun berhasil dibuat! Anda akan dialihkan ke halaman beranda...');
                setTimeout(() => {
                    navigate('/');
                }, 2000);
            } catch (loginErr) {
                console.error('Error during auto-login:', loginErr);
                setError('Akun berhasil dibuat tetapi gagal login otomatis. Silakan login manual.');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        } catch (err) {
            console.error('Registration error:', err);
            if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else {
                setError('Terjadi kesalahan pada server. Silakan coba lagi nanti.');
            }
        } finally {
            setLoading(false);
        }
    };    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" 
             style={{ 
                backgroundImage: 'linear-gradient(to bottom right, #fde047, #facc15, #eab308)', 
                backgroundSize: 'cover'
             }}>
            <div className="absolute top-4 left-4">
                <button 
                    onClick={() => navigate('/')} 
                    className="flex items-center px-4 py-2 bg-white rounded-md shadow-md hover:bg-gray-100 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Kembali ke Beranda
                </button>
            </div>
              <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-xl">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <span className="inline-block text-yellow-600 text-3xl font-bold">TobaHome <span className="text-gray-500">|</span> <span className="text-yellow-500">SICATE</span></span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-6">
                        Daftar Akun Baru
                    </h2>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{success}</span>
                        </div>
                    )}
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="username" className="sr-only">Username</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Username"
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="sr-only">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="sr-only">Konfirmasi Password</label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Konfirmasi Password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                        </div>
                    </div>                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors shadow-md disabled:bg-yellow-400"
                        >
                            {loading ? 'Mendaftar...' : 'Daftar'}
                        </button>
                    </div>
                      <div className="text-center mt-6">
                        <p className="text-sm text-gray-600">
                            Sudah memiliki akun?{' '}
                            <Link to="/login" className="font-medium text-yellow-600 hover:text-yellow-500 transition-colors">
                                Masuk disini
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;