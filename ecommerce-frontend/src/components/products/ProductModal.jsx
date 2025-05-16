import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { productService } from '../../services/productService';
import { cartService } from '../../services/cartService';
import { authService } from '../../services/authService';
import Swal from 'sweetalert2';
import ProductImageOptimized from '../common/ProductImageOptimized';
import './ProductModal.css';

// Keep track of previously loaded products to avoid reset flicker
const loadedProducts = new Map();

const ProductModal = ({ productId, show, onHide }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  
  // Reset modal state when closed (but keep product data cached)
  useEffect(() => {
    if (!show) {
      return;
    }
    
    // Reset states when the modal is first shown
    setError(null);
    setQuantity(1);
    
    // If we've already loaded this product, use it immediately
    if (loadedProducts.has(productId)) {
      setProduct(loadedProducts.get(productId));
      setLoading(false);
      return;
    }
    
    // Otherwise set loading and reset product
    setLoading(true);
    setProduct(null);
  }, [show]);
  
  // Fetch product data when needed
  useEffect(() => {
    // Don't do anything if modal is not shown
    if (!show || !productId) return;
    
    // If we've already got this product loaded and showing, skip fetching
    if (product && product.id === parseInt(productId)) return;
    
    // Skip if we've already loaded from cache in the other effect
    if (!loading) return;
    
    const fetchProductDetails = async () => {
      if (!productId) {
        setError('Invalid product ID');
        setLoading(false);
        return;
      }
      
      try {
        const data = await productService.getProductById(productId);
        setProduct(data);
        // Store in our local cache
        loadedProducts.set(productId, data);
        setError(null);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Gagal memuat detail produk: ' + (err.message || 'Terjadi kesalahan'));
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId, show, product, loading]);

  // Handle body scroll lock when modal is open
  useEffect(() => {
    if (show) {
      // Disable scroll on body when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Re-enable scroll when modal is closed
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to ensure scroll is re-enabled when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  // Memoize handlers to prevent unnecessary re-renders
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
  
  // Memoize the product info rendering
  const productInfo = useMemo(() => {
    if (!product) return null;
    
    return (
      <div className="row">
        <div className="col-md-6">
          <ProductImageOptimized
            imageUrl={product.image_url}
            productName={product.name}
            className="img-fluid rounded"
            style={{
              maxHeight: '300px', 
              width: '100%',
              objectFit: 'cover',
              backgroundColor: '#f8f9fa',
            }}
          />
        </div>
        <div className="col-md-6">
          <div className="product-info-section">
            <span className="category-badge">
              {product.category}
            </span>
            
            <h2 className="product-title text-2xl font-bold mb-3">
              {product.name}
            </h2>

            <div className="price-section">
              <span className="text-lg font-semibold">Harga:</span>
              <span className="price-tag text-2xl font-bold">
                Rp {new Intl.NumberFormat('id-ID').format(product.price)}
              </span>
            </div>

            <div className="product-description">
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="quantity-section">
              <label htmlFor="quantity" className="quantity-label">
                Jumlah:
              </label>
              <select
                id="quantity"
                className="form-select"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              >
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="light" onClick={onHide}>
                <i className="bi bi-x-lg me-1"></i> Tutup
              </Button>
              <Button 
                variant="warning" 
                onClick={handleAddToCart} 
                disabled={loading || !product}
              >
                <i className="bi bi-cart-plus me-1"></i> Tambah ke Keranjang
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }, [product, quantity, handleQuantityChange]);

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      aria-labelledby="product-modal"
      backdrop="static"
      className="product-detail-modal"
      animation={true}
    >
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title id="product-modal">
          {loading ? 'Memuat Produk...' : product?.name || 'Detail Produk'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-4 fs-5">Memuat detail produk...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : product ? (
          productInfo
        ) : (
          <div className="text-center py-4">Produk tidak ditemukan</div>
        )}
      </Modal.Body>
    </Modal>
  );
};

// Function to prefetch product details for modal
export const prefetchProductForModal = (productId) => {
  if (!productId) return;
  
  // If we've already loaded this product, don't fetch again
  if (loadedProducts.has(productId)) return;
  
  // Otherwise prefetch it
  productService.prefetchProductDetails(productId)
    .catch(err => console.error(`Error prefetching product ${productId} for modal:`, err));
};

export default ProductModal;
