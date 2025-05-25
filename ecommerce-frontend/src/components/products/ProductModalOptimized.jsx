// filepath: c:\Users\Jetro\Documents\GitHub\TubesProwebA8\ecommerce-frontend\src\components\products\ProductModalOptimized.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMinus, FiPlus, FiShoppingBag, FiX } from 'react-icons/fi';
import { productService } from '../../services/productService';
import { cartService } from '../../services/cartService';
import { authService } from '../../services/authService';
import { getProductImageUrl } from '../../utils/imageHelper';
import Swal from 'sweetalert2';
import ProductImageOptimized from '../common/ProductImageOptimized';
import './ProductModal.css';

// Inisialisasi cache untuk produk yang telah di-prefetch
const prefetchedProducts = new Map();

// Base64 encoded tiny image placeholder (1x1 px transparent PNG)
const TRANSPARENT_PLACEHOLDER = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const ProductModalOptimized = ({ productId, show, onHide }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState('');
  const [imageError, setImageError] = useState(false);
  const [showStockWarning, setShowStockWarning] = useState(false);
  const [stockWarningMessage, setStockWarningMessage] = useState('');  

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
    
    // Reset image states first
    setIsImageLoaded(false);
    setImageError(false);
    setImageSrc('');
    
    const fetchProductDetails = async () => {
      if (!productId) {
        setError('Invalid product ID');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Check if we already have this product in our prefetch cache
        const cachedProduct = prefetchedProducts.get(productId);
        
        if (cachedProduct) {
          setProduct(cachedProduct);
          
          // Pre-load and set the image
          if (cachedProduct.image_url) {
            const formattedImageUrl = getProductImageUrl(cachedProduct.image_url);
            setImageSrc(formattedImageUrl);
            
            const img = new Image();
            img.src = formattedImageUrl;
            img.onload = () => {
              setIsImageLoaded(true);
              setImageError(false);
            };
            img.onerror = () => {
              setImageError(true);
              setIsImageLoaded(true);
            };
          }
          setLoading(false);
          return;
        }
        
        // If not cached, fetch it
        const data = await productService.getProductById(productId);
        setProduct(data);
        
        // Add to our prefetch cache for future use
        prefetchedProducts.set(productId, data);          // Format and pre-load image
          if (data.image_url) {
            try {
              const formattedImageUrl = getProductImageUrl(data.image_url);
              if (formattedImageUrl) {
                // Set image source and start loading
                setImageSrc(formattedImageUrl);
                const img = new Image();
                img.src = formattedImageUrl;
                
                // Handle image load success or failure
                img.onload = () => {
                  if (data.id === productId) { // Only update if still showing same product
                    setIsImageLoaded(true);
                    setImageError(false);
                  }
                };
                img.onerror = () => {
                  if (data.id === productId) { // Only update if still showing same product
                    setImageError(true);
                    setIsImageLoaded(true);
                  }
                };
              }
          } catch (err) {
            console.error('Error formatting image URL:', err);
            setImageError(true);
            setIsImageLoaded(true);
          }
        } else {
          setImageError(true);
          setIsImageLoaded(true);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Gagal memuat detail produk: ' + (err.message || 'Terjadi kesalahan'));
        setIsImageLoaded(false);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId, show]);

  // Define handleQuantityChange first since other functions depend on it
  const handleQuantityChange = useCallback((value) => {
    // Convert to number and validate
    let newValue = parseInt(value, 10);
    
    // Allow empty input (for typing) or zero
    if (value === '' || value === '0') {
      setQuantity(value);
      return;
    }
    
    // Ensure it's a valid number
    if (isNaN(newValue)) {
      newValue = 0;
    }
    
    // Ensure it's between 0 and 100
    newValue = Math.max(0, Math.min(100, newValue));
    
    // Check if quantity exceeds stock
    if (product && product.stock !== undefined && newValue > product.stock) {
      setShowStockWarning(true);
      setStockWarningMessage(`Stok produk hanya tersisa ${product.stock} item`);
    } else {
      setShowStockWarning(false);
    }
    
    setQuantity(newValue);
  }, [product]);  

  // Then define the dependent functions
  const handleManualInput = useCallback((e) => {
    let value = e.target.value;
    if (value === '') {
      setQuantity('');
      return;
    }
    handleQuantityChange(value);
  }, [handleQuantityChange]);

  const handleIncrement = useCallback(() => {
    handleQuantityChange(quantity + 1);
  }, [quantity, handleQuantityChange]);

  const handleDecrement = useCallback(() => {
    handleQuantityChange(quantity - 1);
  }, [quantity, handleQuantityChange]);

  const handleAddToCart = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      onHide();
      window.location.href = '/login';
      return;
    }

    // Check if quantity is valid
    const quantityNum = parseInt(quantity, 10);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      setShowStockWarning(true);
      setStockWarningMessage('Jumlah produk harus lebih dari 0');
      return;
    }

    // Check if quantity exceeds stock
    if (product && product.stock !== undefined && quantityNum > product.stock) {
      setShowStockWarning(true);
      setStockWarningMessage(`Stok produk hanya tersisa ${product.stock} item`);
      return;
    }

    try {      // Always use addToCart to accumulate quantities
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
        title: 'Produk berhasil diperbarui di keranjang'
      });
      onHide();
    } catch (err) {
      console.error('Error updating cart:', err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal memperbarui produk',
        text: err.response?.data?.error || 'Terjadi kesalahan saat memperbarui produk di keranjang',
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
            className="relative rounded-lg overflow-hidden aspect-square"
          >            <ProductImageOptimized
              imageUrl={imageSrc || product.image_url}
              productName={product.name}
              className={`w-full h-[400px] lg:h-[500px] object-contain bg-gray-50 rounded-lg shadow-md ${
                isImageLoaded ? 'opacity-100' : 'opacity-0'
              } transition-all duration-300`}
              style={{ 
                minHeight: '300px',
                display: imageError ? 'none' : 'block'
              }}
              onLoad={() => setIsImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setIsImageLoaded(true);
              }}
            />
            {(!isImageLoaded || imageError) && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse rounded-lg">
                <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
              </div>
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
            
            <div className="mb-6">
              <h5 className="text-lg font-semibold mb-2">Deskripsi</h5>
              <p className="text-gray-600">{product.description}</p>
            </div>
            
            <div className="mt-auto">
              {product.stock !== undefined && (
                <div className="flex items-center mb-3">
                  <span className="text-gray-700 mr-2">Stok Tersedia:</span>
                  <span className={`font-medium ${product.stock <= 5 ? 'text-red-500' : 'text-green-600'}`}>
                    {product.stock} item
                  </span>
                </div>
              )}
              <div className="flex items-center mb-4">
                <span className="text-gray-700 mr-4">Jumlah:</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const currentVal = parseInt(quantity, 10) || 0;
                      handleQuantityChange(Math.max(0, currentVal - 1));
                    }}
                    className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg"
                  >
                    <FiMinus size={16} />
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    className="w-16 text-center border rounded-lg"
                  />
                  <button
                    onClick={() => {
                      const currentVal = parseInt(quantity, 10) || 0;
                      handleQuantityChange(currentVal + 1);
                    }}
                    className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg"
                  >
                    <FiPlus size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );  }, [product, quantity, isImageLoaded, handleQuantityChange]);  const resetState = useCallback(() => {
    setProduct(null);
    setLoading(false);
    setError(null);
    setQuantity(1);
    setIsImageLoaded(false);
    setImageSrc('');
    setImageError(false);
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
              <div className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur-md p-4">
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
                    className="text-gray-400 hover:text-gray-500 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
                  >
                    <FiX size={20} />
                  </button>
                </div>
              </div>
              
              {/* Modal Content */}
              <div className="overflow-y-auto max-h-[calc(100vh-8rem)]">
                <div className="p-4">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="relative">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-400 border-t-transparent"></div>
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
              </div>

              {/* Stock Warning Animation */}
              <AnimatePresence>
                {showStockWarning && (
                  <motion.div 
                    className="absolute inset-0 flex items-center justify-center bg-black/50 z-30"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowStockWarning(false)}
                  >
                    <motion.div 
                      className="bg-white rounded-xl p-6 m-4 max-w-sm shadow-xl"
                      initial={{ scale: 0.8, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.8, y: 20 }}
                      transition={{ type: "spring", damping: 15 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="text-center">
                        <motion.div 
                          className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-100 text-red-500"
                          initial={{ rotate: -10 }}
                          animate={{ rotate: [0, -5, 5, -5, 5, 0] }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </motion.div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Peringatan Stok</h3>
                        <p className="text-gray-600 mb-4">{stockWarningMessage}</p>
                        <motion.button 
                          className="w-full py-2 px-4 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setShowStockWarning(false)}
                        >
                          Mengerti
                        </motion.button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Modal Footer */}
              <div className="sticky bottom-0 z-20 border-t p-4 bg-white/95 backdrop-blur-md">
                <div className="flex justify-end space-x-3">
                  <button 
                    onClick={onHide}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 flex items-center"
                  >
                    <FiX className="mr-2" /> Tutup
                  </button>
                  <button 
                    onClick={handleAddToCart}
                    disabled={loading || !product}
                    className={`px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 flex items-center ${
                      (loading || !product) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <FiShoppingBag className="mr-2" />
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

export default ProductModalOptimized;
