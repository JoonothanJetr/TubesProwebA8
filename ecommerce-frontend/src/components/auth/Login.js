import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';

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
        // Reset error when user types
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

                // Periksa apakah ada produk yang tertunda untuk ditambahkan ke keranjang
                const pendingCartAdd = localStorage.getItem('pendingCartAdd');
                
                if (pendingCartAdd) {
                    const { productId, quantity, returnUrl } = JSON.parse(pendingCartAdd);
                    
                    try {
                        // Tambahkan produk ke keranjang
                        await authService.refreshToken(); // Memastikan token terbaru
                        const cartService = require('../../services/cartService').cartService;
                        await cartService.addToCart(productId, quantity);
                        
                        // Hapus data pendingCartAdd
                        localStorage.removeItem('pendingCartAdd');
                        
                        // Navigasi kembali ke halaman produk
                        if (returnUrl) {
                            navigate(returnUrl);
                            return;
                        }
                    } catch (err) {
                        console.error('Error adding pending product to cart:', err);
                        // Tetap lanjutkan navigasi normal walaupun error
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
                // Error dari server
                setError(err.response.data?.message || 'Email atau password salah');
            } else if (err.request) {
                // Error koneksi
                setError('Tidak dapat terhubung ke server. Silakan coba lagi.');
            } else {
                // Error lainnya
                setError('Terjadi kesalahan. Silakan coba lagi.');
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
                        Masuk ke Akun Anda
                    </h2>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit}>                    {error && (
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
                    <div className="space-y-4">
                        <div>
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
                        </div>
                        <div>
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
                        </div>
                    </div><div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors shadow-md"
                        >
                            {loading ? 'Memproses...' : 'Masuk'}
                        </button>
                    </div>
                      <div className="text-center mt-6">
                        <p className="text-sm text-gray-600">
                            Belum memiliki akun?{' '}
                            <Link to="/register" className="font-medium text-yellow-600 hover:text-yellow-500 transition-colors">
                                Daftar disini
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login; 