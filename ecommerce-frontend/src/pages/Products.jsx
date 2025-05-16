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
  const [showModal, setShowModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching products...');
      const data = await productService.getAllProducts();
      console.log('Products received:', data);
      setProducts(data || []);

      setTimeout(() => {
        if (data && data.length > 0) {
          data.slice(0, 3).forEach(product => {
            prefetchProductOnHover(product.id);
          });
        }
      }, 500);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (productId) => {
    setSelectedProductId(productId);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setTimeout(() => {
      setSelectedProductId(null);
    }, 300);
  };

  const handleProductHover = (productId) => {
    prefetchProductOnHover(productId);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Katalog Menu</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <button className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">Semua Menu</button>
        <button className="px-4 py-2 hover:bg-gray-100 rounded-md">Makanan Utama</button>
        <button className="px-4 py-2 hover:bg-gray-100 rounded-md">Makanan Pembuka</button>
        <button className="px-4 py-2 hover:bg-gray-100 rounded-md">Makanan Penutup</button>
        <button className="px-4 py-2 hover:bg-gray-100 rounded-md">Minuman</button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500 bg-red-50 rounded-lg">
          <p className="font-medium">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              onClick={() => handleShowModal(product.id)}
              onMouseEnter={() => handleProductHover(product.id)}
            >
              <div className="relative h-48 overflow-hidden">
                <ProductImageOptimized
                  imageUrl={product.image_url}
                  productName={product.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {product.category_name && (
                  <span className="absolute top-2 left-2 bg-white px-3 py-1 rounded-full text-sm font-medium shadow-md">
                    {product.category === 'Makanan Utama' ? '🍽️' : 
                     product.category === 'Makanan Pembuka' ? '🥗' :
                     product.category === 'Minuman' ? '🥤' : '🍽️'} {product.category}
                  </span>
                )}
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
                  <button 
                    className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
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
      )}
      
      <ProductModalOptimized
        productId={selectedProductId}
        show={showModal}
        onHide={handleCloseModal}
      />
    </div>
  );
}

export default Products;