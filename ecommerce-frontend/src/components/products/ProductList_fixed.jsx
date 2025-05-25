import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar } from "react-icons/fa";
import { FiShoppingBag } from "react-icons/fi";
import { productService } from '../../services/productService';
import ProductModalOptimized from './ProductModalOptimized';
import { authService } from '../../services/authService';
import { cartService } from '../../services/cartService';
import Swal from 'sweetalert2';
import { getProductImageUrl } from '../../utils/imageHelper';
import ProductImageOptimized from '../common/ProductImageOptimized';
import { prefetchProductOnHover, prefetchVisibleProducts } from '../../utils/prefetchHelper';
import axios from 'axios';
import './ProductList.css';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [addingToCart, setAddingToCart] = useState(false);

    // Prefetch visible products when they are loaded
    const prefetchInitialProducts = useCallback((productsData) => {
        if (!Array.isArray(productsData) || productsData.length === 0) return;
        
        // Use requestAnimationFrame to delay prefetch until after render
        requestAnimationFrame(() => {
            const firstProducts = productsData.slice(0, 3);
            if (firstProducts.length > 0) {
                productService.prefetchMultipleProducts(firstProducts.map(p => p.id))
                    .catch(err => console.error('Error prefetching initial products:', err));
            }
        });
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                const [categoriesResponse, productsData] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/catalogs`),
                    productService.getAllProducts()
                ]);

                const categoriesData = categoriesResponse.data;
                if (Array.isArray(categoriesData)) {
                    const allCategories = [{ id: 'all', name: 'Semua Menu' }, ...categoriesData];
                    setCategories(allCategories);
                    setSelectedCategory('all');
                } else {
                    console.error('Categories data is not an array:', categoriesData);
                    setCategories([{ id: 'all', name: 'Semua Menu' }]);
                    setSelectedCategory('all');
                }

                if (Array.isArray(productsData)) {
                    setProducts(productsData);
                    prefetchInitialProducts(productsData);
                } else {
                    console.error('Products data is not an array:', productsData);
                    setProducts([]);
                }
            } catch (err) {
                console.error("Error fetching data:", err);
                setError(err.response?.data?.message || 'Gagal memuat data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [prefetchInitialProducts]);

    const filteredProducts = useMemo(() => {
        if (!selectedCategory || selectedCategory === 'all') {
            return products;
        }
        return products.filter(product => 
            product.category_id === parseInt(selectedCategory)
        );
    }, [products, selectedCategory]);

    const handleProductHover = useCallback((productId) => {
        prefetchProductOnHover(productId);
    }, []);

    const handleShowModal = useCallback((productId) => {
        if (!productId) return;
        setSelectedProduct(productId);
        setShowModal(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setShowModal(false);
        requestAnimationFrame(() => {
            setSelectedProduct(null);
        });
    }, []);

    const handleAddToCart = async (productId) => {
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
        
        if (addingToCart) return;
        
        setAddingToCart(true);
        
        try {
            await cartService.addToCart(productId, 1);
            
            const Toast = Swal.mixin({
                toast: true,
                position: 'bottom-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.addEventListener('mouseenter', Swal.stopTimer);
                    toast.addEventListener('mouseleave', Swal.resumeTimer);
                }
            });
            
            Toast.fire({
                icon: 'success',
                title: 'Produk ditambahkan ke keranjang'
            });
            
            handleCloseModal();
        } catch (error) {
            console.error("Error adding to cart:", error);
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: error.response?.data?.message || 'Gagal menambahkan produk ke keranjang',
                confirmButtonColor: '#ffc107'
            });
        } finally {
            setAddingToCart(false);
        }
    };

    const getCategoryIcon = (categoryName) => {
        const name = categoryName.toLowerCase();
        
        if (name.includes('makanan') || name.includes('menu') || name.includes('food')) {
            return <FiShoppingBag className="text-gray-900" />;
        } else if (name.includes('minuman') || name.includes('drink')) {
            return <FiShoppingBag className="text-gray-900" />;
        } else if (name.includes('snack') || name.includes('camilan')) {
            return <FiShoppingBag className="text-gray-900" />;
        } else if (name.includes('semua')) {
            return <FiShoppingBag className="text-gray-900" />;
        } else {
            return <FiShoppingBag className="text-gray-900" />;
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
            {/* Intro Animation with Title */}
            <AnimatePresence>
                <motion.div 
                    className="text-center mb-12"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.div
                        className="inline-block mb-4 bg-yellow-100 p-4 rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ 
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                            delay: 0.1
                        }}
                    >
                        <FiShoppingBag className="text-yellow-600 text-4xl" />
                    </motion.div>
                    
                    <motion.h1 
                        className="text-3xl md:text-4xl font-bold mb-3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        Menu Produk TobaHome
                    </motion.h1>
                    
                    <motion.p
                        className="text-gray-600 max-w-2xl mx-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                    >
                        Pilih dari berbagai menu lezat kami yang tersedia untuk dipesan
                    </motion.p>
                </motion.div>
            </AnimatePresence>
            
            <h2 className="text-2xl font-bold mb-6">Menu Katalog</h2>
            <motion.div 
                className="mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
            >
                <div className="flex flex-wrap gap-2 mb-6">
                    {categories.map((category, index) => (
                        <motion.button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-2 ${
                                selectedCategory === category.id 
                                ? 'bg-yellow-400 text-gray-900' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ 
                                duration: 0.3, 
                                delay: 0.7 + (index * 0.04),
                                type: "spring",
                                stiffness: 200
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {getCategoryIcon(category.name)}
                            {category.name}
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            {filteredProducts.length === 0 ? (
                <div className="text-center py-10">
                    <h5 className="text-gray-500">Tidak ada produk dalam kategori ini.</h5>
                </div>
            ) : (
                <motion.div 
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                >
                    {filteredProducts.map((product, index) => (
                        <motion.div 
                            key={product.id} 
                            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                            onClick={() => handleShowModal(product.id)}
                            onMouseEnter={() => handleProductHover(product.id)}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ 
                                duration: 0.4, 
                                delay: 0.9 + (index * 0.05),
                                ease: "easeOut"
                            }}
                            whileHover={{ 
                                y: -5,
                                transition: { duration: 0.2 }
                            }}
                        >
                            <div className="relative pb-[100%]">
                                <div className="absolute top-4 left-4 z-10">
                                    <div className="bg-yellow-400 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-md">
                                        {getCategoryIcon(product.category_name)}
                                        <span className="text-gray-900">
                                            {product.category_name}
                                        </span>
                                    </div>
                                </div>
                                {product.stock && product.stock <= 5 && (
                                    <div className="absolute top-4 right-4 z-10">
                                        <div className="bg-red-500 px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md">
                                            <span className="text-white text-xs font-medium">
                                                Stok: {product.stock}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                <ProductImageOptimized
                                    imageUrl={product.image_url}
                                    productName={product.name}
                                    className="absolute top-0 left-0 w-full h-full object-cover"
                                    loading="lazy"
                                />
                            </div>
                            <div className="p-4">
                                <h2 className="text-lg font-semibold mb-2">{product.name}</h2>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {product.description || 'Deskripsi...'}
                                </p>
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-yellow-600">
                                        Rp {product.price?.toLocaleString('id-ID')}
                                    </span>
                                    {product.stock !== undefined && (
                                        <span className={`text-sm font-medium ${product.stock <= 5 ? 'text-red-500' : 'text-gray-500'}`}>
                                            {product.stock <= 5 ? `Sisa: ${product.stock}` : `Stok: ${product.stock}`}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
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
