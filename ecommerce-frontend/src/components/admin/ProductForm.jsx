import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { productService } from '../../services/productService';
import { catalogService } from '../../services/catalogService';
import { authService } from '../../services/authService';
import { getProductImageUrl } from '../../utils/imageHelper';
import { FiCheck, FiX } from 'react-icons/fi';
import AnimatedPage from '../common/AnimatedPage';

const ProductForm = () => {    
    const { productId } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(productId);
    
    const [product, setProduct] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category_id: '',
        image: null
    });
    const [catalogs, setCatalogs] = useState([]);
    const [loadingCatalogs, setLoadingCatalogs] = useState(true);
    const [currentImageUrl, setCurrentImageUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [loadingProduct, setLoadingProduct] = useState(isEditMode);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

    // Effect untuk memuat katalog
    useEffect(() => {
        if (!authService.isAuthenticated()) {
            navigate('/login');
            return;
        }

        const user = authService.getUser();
        if (user?.role !== 'admin') {
            navigate('/');
            return;
        }

        const fetchCatalogs = async () => {
            try {
                setLoadingCatalogs(true);
                const data = await catalogService.getAllCatalogs();
                setCatalogs(data || []);
                setError(null);
            } catch (err) {
                console.error("Error fetching catalogs:", err);
                if (err.response?.status === 401 || err.response?.status === 403) {
                    authService.logout();
                    navigate('/login');
                    return;
                }
                setError("Gagal memuat daftar katalog.");
                setCatalogs([]);
            } finally {
                setLoadingCatalogs(false);
            }
        };
        fetchCatalogs();
    }, [navigate]);

    // Effect untuk memuat data produk jika dalam mode edit
    useEffect(() => {
        if (!isEditMode) {
            setProduct({
                name: '',
                description: '',
                price: '',
                stock: '',
                category_id: '',
                image: null
            });
            setCurrentImageUrl(null);
            setLoadingProduct(false);
            return;
        }

        const fetchProduct = async () => {
            if (!authService.isAuthenticated()) {
                navigate('/login');
                return;
            }

            try {
                setLoadingProduct(true);
                const data = await productService.getProductById(productId);
                if (data) {
                    setProduct({
                        name: data.name || '',
                        description: data.description || '',
                        price: data.price || '',
                        stock: data.stock || '',
                        category_id: data.category_id || '',
                        image: null
                    });
                    setCurrentImageUrl(data.image_url || null);
                    setError(null);
                } else {
                    setError("Produk tidak ditemukan");
                    navigate('/admin/products');
                }
            } catch (err) {
                console.error(`Error fetching product ${productId}:`, err);
                if (err.response?.status === 401 || err.response?.status === 403) {
                    authService.logout();
                    navigate('/login');
                } else {
                    setError("Gagal memuat data produk untuk diedit.");
                    navigate('/admin/products');
                }
            } finally {
                setLoadingProduct(false);
            }
        };

        fetchProduct();
    }, [productId, isEditMode, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validasi tipe file
            if (!file.type.match('image.*')) {
                setError('File harus berupa gambar (JPEG, PNG, GIF)');
                return;
            }
            // Validasi ukuran file (5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('Ukuran file tidak boleh lebih dari 5MB');
                return;
            }
            setProduct(prev => ({ ...prev, image: file }));
            setCurrentImageUrl(URL.createObjectURL(file));
            setError(null);
        }
    };

    const NotificationOverlay = ({ message, type }) => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
        >
            <motion.div
                initial={{ scale: 0.8, y: -20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 20 }}
                className={`bg-white rounded-xl p-6 shadow-xl max-w-sm w-full mx-4 relative ${
                    type === 'success' ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
                }`}
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center justify-center mb-4"
                >
                    {type === 'success' ? (
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                    )}
                </motion.div>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center text-gray-800 text-lg font-medium"
                >
                    {message}
                </motion.p>
            </motion.div>
        </motion.div>
    );

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: 'success' });
            if (type === 'success') {
                navigate('/admin/products');
            }
        }, 2000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (!authService.isAuthenticated()) {
            navigate('/login');
            return;
        }

        const user = authService.getUser();
        if (user?.role !== 'admin') {
            setError("Unauthorized. Admin access required.");
            setLoading(false);
            return;
        }

        // Validasi
        if (!product.name || !product.price || !product.stock || !product.category_id || (!isEditMode && !product.image)) {
            setError("Semua field wajib diisi (termasuk kategori), dan gambar untuk produk baru.");
            setLoading(false);
            return;
        }

        if (isNaN(product.price) || isNaN(product.stock) || product.price <= 0 || product.stock < 0) {
            setError("Harga harus angka positif dan Stok harus angka positif atau nol.");
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('name', product.name);
        formData.append('description', product.description || '');
        formData.append('price', product.price);
        formData.append('stock', product.stock);
        formData.append('category_id', product.category_id);
        if (product.image) {
            formData.append('image', product.image);
        }

        try {
            if (isEditMode) {
                await productService.updateProduct(productId, formData);
                showNotification('Produk berhasil diperbarui!');
            } else {
                await productService.createProduct(formData);
                showNotification('Produk baru berhasil ditambahkan!');
            }
        } catch (err) {
            console.error("Error saving product:", err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                authService.logout();
                navigate('/login');
                return;
            }
            const errorMessage = err.response?.data?.error || err.message || `Gagal ${isEditMode ? 'memperbarui' : 'menyimpan'} produk.`;
            setError(errorMessage);
            showNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loadingProduct || loadingCatalogs) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <p className="mt-4 text-gray-600">Memuat data...</p>
                </div>
            </div>
        );
    }

    return (
        <AnimatedPage>
            <div className="min-h-screen bg-gray-100 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">
                            {isEditMode ? 'Edit Produk' : 'Tambah Produk Baru'}
                        </h1>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/admin/products')}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            ← Kembali ke Daftar
                        </motion.button>
                    </div>

                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="p-8">
                            {error && (
                                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
                                    <p className="font-medium">Error</p>
                                    <p>{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                    <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                                        Nama Produk
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        value={product.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Masukkan nama produk"
                                        className="mt-1 block w-full px-4 py-3 rounded-lg border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                                    />
                                </div>

                                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                    <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
                                        Deskripsi
                                    </label>
                                    <textarea
                                        name="description"
                                        id="description"
                                        rows={4}
                                        value={product.description}
                                        onChange={handleChange}
                                        placeholder="Masukkan deskripsi produk"
                                        className="mt-1 block w-full px-4 py-3 rounded-lg border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                        <label htmlFor="price" className="block text-sm font-semibold text-gray-900 mb-2">
                                            Harga (Rp)
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-gray-500 sm:text-sm">Rp</span>
                                            </div>
                                            <input
                                                type="number"
                                                name="price"
                                                id="price"
                                                value={product.price}
                                                onChange={handleChange}
                                                required
                                                min="1"
                                                placeholder="0"
                                                className="mt-1 block w-full pl-12 pr-4 py-3 rounded-lg border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                        <label htmlFor="stock" className="block text-sm font-semibold text-gray-900 mb-2">
                                            Stok
                                        </label>
                                        <input
                                            type="number"
                                            name="stock"
                                            id="stock"
                                            value={product.stock}
                                            onChange={handleChange}
                                            required
                                            min="0"
                                            placeholder="0"
                                            className="mt-1 block w-full px-4 py-3 rounded-lg border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                                        />
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">                                <label htmlFor="category_id" className="block text-sm font-semibold text-gray-900 mb-2">
                                    Katalog
                                </label>
                                <select
                                    name="category_id"
                                    id="category_id"
                                    value={product.category_id}
                                    onChange={handleChange}
                                    required
                                    disabled={loadingCatalogs}
                                    className="mt-1 block w-full px-4 py-3 rounded-lg border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                                >
                                    <option value="">{loadingCatalogs ? 'Memuat...' : '-- Pilih Katalog --'}</option>
                                    {catalogs.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                                {catalogs.length === 0 && !loadingCatalogs && (
                                    <p className="mt-2 text-sm text-gray-500">
                                        Tidak ada kategori tersedia. Tambahkan di Manajemen Katalog.
                                    </p>
                                )}
                            </div>

                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Gambar Produk
                                </label>
                                <div className="mt-1 flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg bg-white">
                                    <div className="space-y-2 text-center">
                                        {currentImageUrl ? (
                                            <div className="mb-4">
                                                <img
                                                    src={currentImageUrl && getProductImageUrl(currentImageUrl)}
                                                    alt="Preview"
                                                    className="mx-auto h-40 w-40 object-cover rounded-lg shadow-md"
                                                />
                                            </div>
                                        ) : (
                                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                        <div className="flex text-sm text-gray-600 justify-center">
                                            <label htmlFor="image" className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                                <span className="inline-flex items-center px-4 py-2 border border-blue-500 rounded-lg hover:bg-blue-50">
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                                                    </svg>
                                                    Pilih Gambar
                                                </span>
                                                <input
                                                    id="image"
                                                    name="image"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    required={!isEditMode}
                                                    className="sr-only"
                                                />
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            PNG, JPG, GIF sampai 5MB
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => navigate('/admin/products')}
                                    disabled={loading}
                                    className="px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-3 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2 inline-block"></div>
                                            Menyimpan...
                                        </>
                                    ) : (
                                        isEditMode ? 'Update Produk' : 'Tambah Produk'
                                    )}
                                </button>
                            </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            {notification.show && (
                <NotificationOverlay message={notification.message} type={notification.type} />
            )}
        </AnimatedPage>
    );
};

export default ProductForm;