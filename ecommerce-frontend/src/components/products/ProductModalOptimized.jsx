// filepath: c:\Users\Jetro\Documents\GitHub\TubesProwebA8\ecommerce-frontend\src\components\products\ProductModalOptimized.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { productService } from '../../services/productService';
import { cartService } from '../../services/cartService';
import { authService } from '../../services/authService';
import Swal from 'sweetalert2';
import ProductImageOptimized from '../common/ProductImageOptimized';
import './ProductModal.css';

// Base64 encoded tiny image placeholder (1x1 px transparent PNG)
const TRANSPARENT_PLACEHOLDER = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

// Function to prefetch products for better performance
const prefetchedProducts = new Map();
const prefetchProduct = async (id) => {
  if (!id || prefetchedProducts.has(id)) return;
  
  try {
    const data = await productService.getProductById(id);
    prefetchedProducts.set(id, data);
    
    // Also prefetch the product image
    if (data && data.image_url) {
      const img = new Image();
      img.src = data.image_url;
    }
  } catch (err) {
    console.error(`Failed to prefetch product ${id}:`, err);
  }
};

const ProductModalOptimized = ({ productId, show, onHide }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  
  // Handle body scroll lock when modal is open
  useEffect(() => {
    if (show) {
      document.body.classList.add('modal-open');
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      document.body.classList.remove('modal-open');
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.classList.remove('modal-open');
      document.body.style.paddingRight = '';
    };
  }, [show]);

  // Reset modal state when closed
  useEffect(() => {
    if (!show) {
      return;
    }
    
    // Reset state when modal opens
    setError(null);
    setQuantity(1);
  }, [show]);
  
  // Load product data when needed
  useEffect(() => {
    // Don't do anything if modal is not shown
    if (!show || !productId) return;
    
    const fetchProductDetails = async () => {
      if (!productId) {
        setError('Invalid product ID');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Check if we already have this product in our prefetch cache
        if (prefetchedProducts.has(productId)) {
          setProduct(prefetchedProducts.get(productId));
          setLoading(false);
          return;
        }
        
        // If not cached, fetch it
        const data = await productService.getProductById(productId);
        setProduct(data);
        
        // Add to our prefetch cache for future use
        prefetchedProducts.set(productId, data);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Gagal memuat detail produk: ' + (err.message || 'Terjadi kesalahan'));
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId, show]);

  const handleQuantityChange = useCallback((e) => {
    setQuantity(parseInt(e.target.value, 10));
  }, []);

  const handleAddToCart = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      onHide();
      window.location.href = '/login';
      return;
    }

    try {
      await cartService.addToCart(productId, quantity);
      
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
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
        title: 'Produk berhasil ditambahkan ke keranjang'
      });
      onHide();
    } catch (err) {
      console.error('Error adding to cart:', err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal menambahkan produk',
        text: err.message || 'Terjadi kesalahan saat menambahkan produk ke keranjang',
        confirmButtonColor: '#ffc107'
      });
    }
  }, [productId, quantity, onHide]);

  // Memoize the quantity options to avoid unnecessary re-renders
  const quantityOptions = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => (
      <option key={i + 1} value={i + 1}>{i + 1}</option>
    ));
  }, []);
  const productInfo = useMemo(() => {
    if (!product) return null;
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col md:flex-row"
      >
        <div className="w-full md:w-1/2 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="relative overflow-hidden rounded-lg"
          >
            <ProductImageOptimized
              imageUrl={product.image_url}
              productName={product.name}
              className={`w-full h-[300px] object-cover rounded-lg shadow-md ${
                isImageLoaded ? 'opacity-100' : 'opacity-0'
              } transition-opacity duration-300`}
              style={{ backgroundColor: '#f8f9fa' }}
              onLoad={() => setIsImageLoaded(true)}
            />
            {!isImageLoaded && (
              <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-lg" />
            )}
          </motion.div>
        </div>
        <div className="w-full md:w-1/2 p-4">
          <div className="flex flex-col h-full">
            <h4 className="text-2xl font-bold text-gray-800 mb-4">{product.name}</h4>
            <div className="mb-4">
              <span className="text-3xl font-bold text-yellow-600">
                Rp {(product.price || 0).toLocaleString('id-ID')}
              </span>
              {product.old_price && product.old_price > product.price && (
                <span className="ml-2 text-gray-500 line-through">
                  Rp {product.old_price.toLocaleString('id-ID')}
                </span>
              )}
            </div>
            
            {/* Display any product stats if available */}
            {product.stats && (
              <div className="mb-4">
                <div className="flex items-center">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className={`bi bi-star${i < Math.floor(product.stats.rating || 0) ? '-fill' : (i < (product.stats.rating || 0) + 0.5 ? '-half' : '')}`}></i>
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-500">
                    ({product.stats.total_reviews || 0} ulasan)
                  </span>
                </div>
              </div>
            )}
            
            <div className="mb-6">
              <h5 className="text-lg font-semibold text-gray-700 mb-2">Deskripsi</h5>
              <p className="text-gray-600">
                {product.description || 'Tidak ada deskripsi'}
              </p>
            </div>
            
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <label className="text-gray-700 font-medium mr-4">Jumlah:</label>
                <select 
                  value={quantity} 
                  onChange={handleQuantityChange}
                  className="form-select w-20 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                >
                  {quantityOptions}
                </select>
              </div>
            </div>
            
            {product.category_name && (
              <div className="mt-auto">
                <span className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                  <i className="bi bi-tag-fill mr-2"></i>
                  {product.category_name}
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );  }, [product, quantity, handleQuantityChange, quantityOptions, isImageLoaded]);
  const resetState = useCallback(() => {
    setProduct(null);
    setLoading(false);
    setError(null);
    setQuantity(1);
    setIsImageLoaded(false);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto"
          aria-labelledby="product-modal"
          role="dialog"
          aria-modal="true"
        >
          <div className="min-h-screen px-4 flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
              onClick={onHide}
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
              className="relative w-full max-w-4xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="border-b p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                    {loading ? (
                      <span className="flex items-center">
                        <i className="bi bi-box-seam mr-2"></i>
                        Memuat Produk...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <i className="bi bi-bag-heart mr-2"></i>
                        {product?.name || 'Detail Produk'}
                      </span>
                    )}
                  </h3>
                  <button 
                    onClick={onHide}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <i className="bi bi-x text-xl"></i>
                  </button>
                </div>
              </div>
              
              {/* Modal Content */}
              <div className="p-4">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-400 border-t-transparent"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <i className="bi bi-bag-heart text-yellow-400 text-xl"></i>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <div className="inline-block px-4 py-2 bg-gray-100 rounded-full animate-pulse">
                        <span className="invisible">Loading...</span>
                      </div>
                      <p className="text-gray-500 mt-2">Memuat detail produk...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="alert alert-danger">{error}</div>
                ) : product ? (
                  productInfo
                ) : (
                  <div className="text-center py-4">Produk tidak ditemukan</div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="border-t p-4 bg-gray-50">
                <div className="flex justify-end space-x-3">
                  <button 
                    onClick={onHide}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 flex items-center"
                  >
                    <i className="bi bi-x-lg mr-2"></i>
                    Tutup
                  </button>
                  <button 
                    onClick={handleAddToCart}
                    disabled={loading || !product}
                    className={`px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 flex items-center ${
                      (loading || !product) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <i className="bi bi-cart-plus mr-2"></i>
                    {loading ? 'Menambahkan...' : 'Tambah ke Keranjang'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Export a prefetch function that can be used by other components
export const prefetchProductForModal = prefetchProduct;

export default ProductModalOptimized;
