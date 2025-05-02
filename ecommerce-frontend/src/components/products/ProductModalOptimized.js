// filepath: c:\Users\Jetro\Documents\GitHub\TubesProwebA8\ecommerce-frontend\src\components\products\ProductModalOptimized.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
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
    
    // Body scroll lock implementation
    document.body.style.overflow = 'hidden';
    
    // Cleanup function to ensure scroll is re-enabled when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
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
  
  // Memoize the product info rendering
  const productInfo = useMemo(() => {
    if (!product) return null;
    
    return (      <div className="row">
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
          <h4 className="mb-3">{product.name}</h4>
          <div className="mb-3">
            <span className="price-tag">
              Rp {(product.price || 0).toLocaleString('id-ID')}
            </span>
            {product.old_price && product.old_price > product.price && (
              <span className="ms-2 text-decoration-line-through text-muted">
                Rp {product.old_price.toLocaleString('id-ID')}
              </span>
            )}
          </div>
          
          {/* Display any product stats if available */}
          {product.stats && (
            <div className="mb-3">
              <div className="d-flex align-items-center">
                <div className="text-warning me-1">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className={`bi bi-star${i < Math.floor(product.stats.rating || 0) ? '-fill' : (i < (product.stats.rating || 0) + 0.5 ? '-half' : '')}`}></i>
                  ))}
                </div>
                <span className="ms-1 small text-muted">
                  ({product.stats.total_reviews || 0} ulasan)
                </span>
              </div>
            </div>
          )}
          
          <p className="mb-3" style={{ maxHeight: '150px', overflowY: 'auto', lineHeight: '1.6' }}>
            {product.description || 'Tidak ada deskripsi'}
          </p>
          <div className="mb-3">
            <Form.Group className="d-flex align-items-center">
              <Form.Label className="me-3 mb-0 fw-medium">Jumlah:</Form.Label>
              <Form.Select 
                value={quantity} 
                onChange={handleQuantityChange}
                style={{ width: '100px' }}
                className="form-select-sm"
              >
                {quantityOptions}
              </Form.Select>
            </Form.Group>
          </div>
          {product.category_name && (
            <div className="mb-3">
              <span className="badge bg-secondary">{product.category_name}</span>
            </div>
          )}
        </div>
      </div>
    );
  }, [product, quantity, handleQuantityChange, quantityOptions]);

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
      <Modal.Body>        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status" style={{ width: '3rem', height: '3rem', opacity: 0.8 }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-4 fs-5 text-muted">
              <span className="placeholder-glow">
                <span className="placeholder col-6"></span>
              </span>
              <br/>Memuat detail produk...
            </p>
          </div>
        ): error ? (
          <div className="alert alert-danger">{error}</div>
        ) : product ? (
          productInfo
        ) : (
          <div className="text-center py-4">Produk tidak ditemukan</div>
        )}
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0">
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
      </Modal.Footer>
    </Modal>
  );
};

// Export a prefetch function that can be used by other components
export const prefetchProductForModal = prefetchProduct;

export default ProductModalOptimized;
