import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { productService } from '../services/productService';
import ProductImageOptimized from '../components/common/ProductImageOptimized';
import ProductModalOptimized from '../components/products/ProductModalOptimized';
import { prefetchProductOnHover } from '../utils/prefetchHelper';
import AnimatedPage from '../components/common/AnimatedPage';
import AnimatedSection from '../components/animations/AnimatedSection';
import AnimatedItem from '../components/animations/AnimatedItem';
import { FaStar } from 'react-icons/fa';
import { FiShoppingBag } from 'react-icons/fi';

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
    <AnimatedPage variant="fadeIn" transition="default">
      <div className="container mx-auto px-4 py-8">
        {/* Intro Animation */}
        <AnimatePresence>
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <motion.div
              className="inline-block p-2 rounded-full bg-yellow-100 mb-4"
              initial={{ rotate: -10, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <FiShoppingBag className="text-yellow-500 text-4xl" />
            </motion.div>
            
            <motion.h1 
              className="text-4xl font-bold mb-3 text-gray-800"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
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
        
        <motion.h2 
          className="text-2xl font-bold mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          Katalog Menu
        </motion.h2>

        <motion.div 
          className="flex flex-wrap gap-4 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.button 
            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaStar className="mr-1" /> Semua Menu
          </motion.button>
          <motion.button 
            className="px-4 py-2 hover:bg-gray-100 rounded-md flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaStar className="mr-1 text-red-500" /> Makanan Utama
          </motion.button>
          <motion.button 
            className="px-4 py-2 hover:bg-gray-100 rounded-md flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaStar className="mr-1 text-green-500" /> Makanan Pembuka
          </motion.button>
          <motion.button 
            className="px-4 py-2 hover:bg-gray-100 rounded-md flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaStar className="mr-1 text-orange-500" /> Makanan Penutup
          </motion.button>
          <motion.button 
            className="px-4 py-2 hover:bg-gray-100 rounded-md flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaStar className="mr-1 text-blue-500" /> Minuman
          </motion.button>
        </motion.div>

        {loading ? (
          <motion.div 
            className="flex justify-center items-center py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
          </motion.div>
        ) : error ? (
          <motion.div 
            className="text-center py-8 text-red-500 bg-red-50 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="font-medium">{error}</p>
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 }
            }}
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.1, delayChildren: 0.3 }}
          >
            {products.map((product, index) => (
              <AnimatedItem
                key={product.id}
                index={index}
                variant="pop"
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
                    <span className="absolute top-2 left-2 bg-white px-3 py-1 rounded-full text-sm font-medium shadow-md flex items-center">
                      <FaStar className={`mr-1 ${product.category === 'Makanan Utama' ? 'text-red-500' : 
                        product.category === 'Makanan Pembuka' ? 'text-green-500' :
                        product.category === 'Minuman' ? 'text-blue-500' : 'text-yellow-500'}`} />
                      {product.category}
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
              </AnimatedItem>
            ))}
          </motion.div>
        )}
        
        <ProductModalOptimized
          productId={selectedProductId}
          show={showModal}
          onHide={handleCloseModal}
        />
      </div>
    </AnimatedPage>
  );
}

export default Products;