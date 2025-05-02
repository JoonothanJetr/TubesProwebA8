import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/productService';
import ProductImageOptimized from '../components/common/ProductImageOptimized';
import ProductModalOptimized from '../components/products/ProductModalOptimized';
import { prefetchProductOnHover } from '../utils/prefetchHelper';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Add state for product modal
  const [showModal, setShowModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Use productService instead of direct fetch for consistency and caching benefits
      const data = await productService.getAllProducts();
      setProducts(data);
      
      // Start prefetching the first few products for better performance
      setTimeout(() => {
        if (data && data.length > 0) {
          // Prefetch first 3 products (visible in viewport)
          data.slice(0, 3).forEach(product => {
            prefetchProductOnHover(product.id);
          });
        }
      }, 500); // Wait a bit to let the UI render first
    } catch (err) {
      setError(err.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };
  
  // Handler for showing product modal
  const handleShowModal = (productId) => {
    setSelectedProductId(productId);
    setShowModal(true);
  };
  
  // Handler for hiding product modal
  const handleCloseModal = () => {
    setShowModal(false);
    // Don't clear selectedProductId immediately to avoid flicker when reopening
    setTimeout(() => {
      setSelectedProductId(null);
    }, 300);
  };
  
  // Handler for product hover - prefetch data
  const handleProductHover = (productId) => {
    prefetchProductOnHover(productId);
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Our Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div 
            key={product.id} 
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleShowModal(product.id)}
            onMouseEnter={() => handleProductHover(product.id)}
          >
            {/* Use optimized ProductImage */}
            <ProductImageOptimized
              imageUrl={product.image_url}
              productName={product.name}
              className="w-full h-48 object-cover"
              loading="lazy" // Add native lazy loading
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
              <p className="text-gray-600 mb-2">{product.description?.substring(0, 60)}...</p>
              <div className="flex justify-between items-center">
                <p className="text-blue-600 font-bold">Rp {product.price?.toLocaleString('id-ID')}</p>
                <button 
                  className="px-3 py-1 bg-yellow-400 text-sm rounded hover:bg-yellow-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShowModal(product.id);
                  }}
                >
                  Detail
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Add the optimized product modal */}
      <ProductModalOptimized
        productId={selectedProductId}
        show={showModal}
        onHide={handleCloseModal}
      />
    </div>
  );
}

export default Products;