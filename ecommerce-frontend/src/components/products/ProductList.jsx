import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import ProductModalOptimized from './ProductModalOptimized';
import { authService } from '../../services/authService';
import { cartService } from '../../services/cartService';
import Swal from 'sweetalert2';
import { getProductImageUrl } from '../../utils/imageHelper';
import ProductImageOptimized from '../common/ProductImageOptimized';
import { prefetchProductOnHover, prefetchVisibleProducts } from '../../utils/prefetchHelper';
import './ProductList.css';

const ProductList = () => {
    console.log('ProductList rendering...'); // <-- Tambahkan kembali log render
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('semua'); 
    // State untuk modal
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [addingToCart, setAddingToCart] = useState(false); // State untuk loading add to cart

    // Kategori (asumsi tidak berubah drastis, bisa juga diambil dari API jika dinamis)
    const categories = [
        'semua',
        'makanan-utama',
        'makanan-pembuka',
        'makanan-penutup',
        'minuman'
    ];
    const categoryLabels = {
        'semua': 'Semua Menu',
        'makanan-utama': 'Makanan Utama',
        'makanan-pembuka': 'Makanan Pembuka',
        'makanan-penutup': 'Makanan Penutup',
        'minuman': 'Minuman'
    };    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        setError(''); // Reset error saat fetch
        try {
            // Pastikan backend mengembalikan category_name atau data kategori lain jika perlu
            const data = await productService.getAllProducts();
            console.log("Fetched products:", data);
            setProducts(data);
            
            // Start prefetching the first few products immediately after loading for faster modal display
            setTimeout(() => {
                if (data && data.length > 0) {
                    prefetchVisibleProducts(data, 3);
                }
            }, 500);
        } catch (err) {
            console.error("Error fetching products:", err);
            setError('Gagal memuat produk');
        } finally {
            setLoading(false);
        }
    };

    // Filter produk berdasarkan kategori yang dipilih
    const filteredProducts = selectedCategory === 'semua'
        ? products
        : products.filter(product => product.category_name === categoryLabels[selectedCategory]); // Sesuaikan dengan data backend (misal category_name)

    // Memoize for better performance and avoid unnecessary re-renders
    const handleProductHover = useCallback((productId) => {
        // When user hovers over a product, prefetch its details
        prefetchProductOnHover(productId);
    }, []);

    // Handler untuk menampilkan modal
    const handleShowModal = useCallback((productId) => {
        setSelectedProduct(productId);
        setShowModal(true);
    }, []);

    // Handler untuk menutup modal
    const handleCloseModal = useCallback(() => {
        setShowModal(false);
        // Don't set selectedProduct to null immediately to avoid flash of emptiness
        // when closing and reopening modal quickly
        setTimeout(() => {
            setSelectedProduct(null);
        }, 300);
    }, []);

    // Handler untuk Tambah ke Keranjang
    const handleAddToCart = async (productId) => {
        // Cek dulu apakah pengguna sudah login
        if (!authService.isAuthenticated()) {
            Swal.fire({
                icon: 'info',
                title: 'Login Diperlukan',
                text: 'Silakan login terlebih dahulu untuk menambahkan item ke keranjang',
                confirmButtonColor: '#ffc107',
                confirmButtonText: 'OK'
            });
            handleCloseModal();
            return;
        }
        
        console.log("Adding product to cart:", productId);
        setAddingToCart(true); // Set loading
        try {
            // Asumsi quantity = 1 saat pertama kali tambah dari modal
            await cartService.addToCart(productId, 1); 
            
            // Use SweetAlert toast for success message
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.addEventListener('mouseenter', Swal.stopTimer)
                    toast.addEventListener('mouseleave', Swal.resumeTimer)
                }
            });
            
            Toast.fire({
                icon: 'success',
                title: 'Produk berhasil ditambahkan ke keranjang!'
            });
            
            handleCloseModal(); // Tutup modal setelah sukses
        } catch (err) {
            console.error("Error adding to cart:", err);
            Swal.fire({
                icon: 'error',
                title: 'Gagal menambahkan produk',
                text: err.message || 'Terjadi kesalahan saat menambahkan produk ke keranjang. Silakan coba lagi.',
                confirmButtonColor: '#ffc107'
            });
            // Jangan tutup modal jika gagal?
        } finally {
            setAddingToCart(false); // Reset loading
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
    );
    
    if (error) return (
        <div className="text-center text-red-500 p-4">
            {error}
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Katalog Menu</h2>
                <div className="flex flex-wrap gap-2 mb-6">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                selectedCategory === category 
                                ? 'bg-yellow-400 text-gray-900' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {category === 'makanan-utama' && <i className="bi bi-egg-fried mr-1"></i>}
                            {category === 'makanan-pembuka' && <i className="bi bi-cup-hot mr-1"></i>}
                            {category === 'makanan-penutup' && <i className="bi bi-cake2 mr-1"></i>}
                            {category === 'minuman' && <i className="bi bi-cup-straw mr-1"></i>}
                            {categoryLabels[category]}
                        </button>
                    ))}
                </div>
            </div>

            {filteredProducts.length === 0 ? (
                <div className="text-center py-10">
                    <h5 className="text-gray-500">Tidak ada produk dalam kategori ini.</h5>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {filteredProducts.map((product) => (
                        <div key={product.id} className="group">
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full flex flex-col">
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    <ProductImageOptimized 
                                        imageUrl={product.image_url}
                                        productName={product.name}
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                                    <div className="absolute bottom-3 left-3 bg-white px-2.5 py-1.5 rounded-md text-xs font-medium text-gray-700 shadow-sm">
                                        <i className="bi bi-tag-fill mr-1.5"></i>
                                        {product.category_name}
                                    </div>
                                    <button 
                                        onClick={() => handleAddToCart(product.id)}
                                        className="absolute top-3 right-3 p-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-yellow-50 shadow-sm"
                                    >
                                        <i className="bi bi-heart text-gray-600 hover:text-yellow-500"></i>
                                    </button>
                                </div>
                                <div className="p-4 flex-grow flex flex-col">
                                    <h3 className="font-medium text-gray-900 text-lg mb-1 line-clamp-1">
                                        {product.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-grow">
                                        {product.description}
                                    </p>
                                    <div className="flex items-center justify-between mt-auto">
                                        <span className="text-yellow-500 font-bold">
                                            Rp {product.price?.toLocaleString('id-ID')}
                                        </span>
                                        <button 
                                            onClick={() => handleShowModal(product.id)}
                                            className="px-4 py-2 text-sm bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 transition-colors shadow-sm"
                                        >
                                            <i className="bi bi-eye mr-1.5"></i>
                                            Detail
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            <ProductModalOptimized 
                productId={selectedProduct}
                show={showModal} 
                onHide={handleCloseModal}
            />
        </div>
    );
};

export default ProductList;