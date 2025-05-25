import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Slider from "react-slick";
import { motion } from 'framer-motion';
import AnimatedPage from '../components/common/AnimatedPage';
import AnimatedSection from '../components/animations/AnimatedSection';
import AnimatedItem from '../components/animations/AnimatedItem';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import { FaUtensils, FaCog, FaTruck, FaCreditCard } from 'react-icons/fa';
import { BiDrink } from 'react-icons/bi';
import ProductModalOptimized from '../components/products/ProductModalOptimized';
import ProductImageOptimized from '../components/common/ProductImageOptimized';
import { productService } from '../services/productService';
import { authService } from '../services/authService';
import Swal from 'sweetalert2';
import axios from 'axios';

// Custom CSS untuk carousel
// Add an animation for the floating logo
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
`;
document.head.appendChild(styleSheet);

const API_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:5000/api';

const foodImages = [
  {
    url: "https://images.unsplash.com/photo-1603088549155-6ae9395b928f",
    title: "Saksang Spesial",
    description: "Daging yang dimasak dengan rempah-rempah khas Batak dan daun serai"
  },
  {
    url: "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369",
    title: "Arsik Ikan Mas",
    description: "Ikan mas yang dimasak dengan bumbu kuning dan andaliman"
  },
  {
    url: "https://images.unsplash.com/photo-1617093727343-374698b1b08d",
    title: "Nagget Dengke",
    description: "Olahan modern dari ikan mas khas Batak"
  },
  {
    url: "https://images.unsplash.com/photo-1585937421612-70a008356fbe",
    title: "Sambal Andaliman",
    description: "Sambal dengan rempah khas Batak yang memberikan sensasi getir"
  },
  {
    url: "https://images.unsplash.com/photo-1626509653291-18d9a934b9db",
    title: "Naniura",
    description: "Hidangan ikan mas mentah yang direndam dalam air jeruk nipis"
  }
];

// Section Title Component (with underline)
const SectionTitle = ({ children }) => (
  <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center relative pb-3">
    {children}
    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-yellow-400 rounded-sm"></span>
  </h2>
);

// Simpler Section Title (centered, no underline)
const SimpleSectionTitle = ({ children }) => (
  <h2 className="text-3xl font-semibold text-gray-800 mb-10 text-center">
    {children}
  </h2>
);

const HowItWorksStep = ({ icon: Icon, title, description, isHovered, onMouseEnter, onMouseLeave }) => (
  <div
    className="w-full mb-6 transform transition-all duration-300 ease-in-out"
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    <div className="flex flex-col items-center">
      <div className={`
        mb-2 flex h-16 w-16 items-center justify-center rounded-full
        bg-yellow-100 border-4 border-yellow-200
        text-yellow-700
        transition-all duration-300 ease-in-out
        ${isHovered ? 'shadow-md scale-110' : ''}
      `}>
        <Icon className="text-2xl" />
      </div>
      <h5 className="text-base font-semibold text-gray-800 text-center mb-1">{title}</h5>
      <p className="text-xs text-gray-600 text-center max-w-[180px] mx-auto">{description}</p>
    </div>
  </div>
);

const HomeOptimized = () => {
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState({ name: '', email: '', message: '' });  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [hoveredProductId, setHoveredProductId] = useState(null);
  const [hoveredStep, setHoveredStep] = useState(null);

  // Effect untuk memeriksa status login dan mengisi email otomatis
  useEffect(() => {
    const checkAuthStatus = () => {
      const isLoggedIn = authService.isAuthenticated();
      setIsAuthenticated(isLoggedIn);
      
      if (isLoggedIn) {
        const user = authService.getUser();
        if (user && user.email) {
          setFeedback(prev => ({
            ...prev,
            email: user.email,
            name: user.username || prev.name
          }));
        }
      }
    };
    
    checkAuthStatus();
  }, []);

  useEffect(() => {
    const fetchPopularProducts = async () => {
      try {
        setLoading(true);
        const products = await productService.getFeaturedProducts(8);
        setPopularProducts(products || []);
        
        // Prefetch the first few products
        if (products && products.length > 0) {
          requestAnimationFrame(() => {
            const idsToPreFetch = products.slice(0, 3).map(p => p.id);
            productService.prefetchMultipleProducts(idsToPreFetch)
              .catch(err => console.error('Error prefetching featured products:', err));
          });
        }
      } catch (err) {
        console.error('Error fetching popular products:', err);
        setError('Failed to load popular products');
        setPopularProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularProducts();
  }, []);

  // Cleanup effect for modal
  useEffect(() => {
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  const handleShowModal = useCallback((productId) => {
    if (productId && productId !== 'undefined') {
      setSelectedProductId(productId);
      setShowModal(true);
      document.body.classList.add('modal-open');
    } else {
      console.error("Invalid product ID passed to handleShowModal:", productId);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Terjadi kesalahan saat membuka detail produk',
        confirmButtonColor: '#f59e0b'
      });
    }
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    document.body.classList.remove('modal-open');
    setTimeout(() => {
      setSelectedProductId(null);
    }, 300);
  }, []);

  const handleProductHover = useCallback((productId) => prefetchProductOnHover(productId), []);
  const handleFeedbackChange = useCallback((e) => {
    const { name, value } = e.target;
    setFeedback(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmitFeedback = useCallback(async (e) => {
    e.preventDefault();
    if (!feedback.name || !feedback.email || !feedback.message) {
      Swal.fire({ icon: 'warning', title: 'Oops...', text: 'Nama, Email, dan Pesan tidak boleh kosong!', confirmButtonColor: '#f59e0b' });
      return;
    }
    setIsSubmittingFeedback(true);
    try {
      const response = await axios.post(`${API_URL}/feedback`, feedback);
      if (response.status === 201) {
        Swal.fire({ icon: 'success', title: 'Feedback Terkirim!', text: 'Terima kasih atas feedback Anda.', confirmButtonColor: '#f59e0b' });
        setFeedback({ name: '', email: '', message: '' });
      } else {
        Swal.fire({ icon: 'error', title: 'Gagal Mengirim', text: response.data?.message || 'Terjadi kesalahan.', confirmButtonColor: '#f59e0b' });
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Gagal Mengirim Feedback', text: error.response?.data?.message || 'Tidak dapat terhubung.', confirmButtonColor: '#f59e0b' });
    } finally {
      setIsSubmittingFeedback(false);
    }
  }, [feedback]);

  const howItWorksSteps = useMemo(() => [
    { 
      icon: FaUtensils, 
      title: 'Pilih Makanan', 
      description: 'Pilih menu favorit Anda dari berbagai macam pilihan.' 
    },
    { 
      icon: FaCog, 
      title: 'Kustomisasi Pesanan', 
      description: 'Sesuaikan detail pesanan dengan preferensi Anda.' 
    },
    { 
      icon: FaTruck, 
      title: 'Pilih Pengiriman/Ambil Sendiri', 
      description: 'Pilih dikirim ke alamat Anda atau ambil langsung di tempat kami.' 
    },
    { 
      icon: FaCreditCard, 
      title: 'Pembayaran & Konfirmasi', 
      description: 'Lakukan pembayaran aman dan terima konfirmasi pesanan Anda.' 
    }
  ], []);

  return (
    <div className="home-page bg-gray-50 text-gray-800">
      <AnimatedPage variant="fadeIn" transition="slow">
      {/* Hero Section with Full-Width Background Carousel */}
      <AnimatedSection variant="fadeIn" delay={0.2} className="relative min-h-screen bg-gray-50">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <Slider
            dots={false}
            infinite={true}
            speed={1000}
            slidesToShow={1}
            slidesToScroll={1}
            autoplay={true}
            autoplaySpeed={5000}
            fade={true}
            arrows={false}
            className="h-full"
          >
            {foodImages.map((image, index) => (
              <div key={index} className="relative h-screen">
                <div className="absolute inset-0 bg-black/50"></div> {/* Dark overlay */}
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              </div>
            ))}
          </Slider>
        </div>

        {/* Content */}
        <div className="relative container mx-auto px-4 h-screen flex items-center justify-center">
          <div className="flex justify-center">
            {/* Centered Text Content */}
            <motion.div 
              className="space-y-4 text-center max-w-2xl"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
                    Nikmati Kelezatan Masakan <span className="text-yellow-400">Batak Toba</span>
                  </h1>
                  <h2 className="text-2xl lg:text-3xl font-bold text-white mt-1">
                    Toba <span className="text-yellow-400">&</span> Nusantara Di Meja Anda
                  </h2>
                </div>
                <p className="text-base text-gray-200 mx-auto max-w-xl">
                  Rasakan cita rasa autentik dari dapur kami, disiapkan dengan resep turun-temurun dan bumbu rempah pilihan khas Tanah Batak.
                </p>
                <div className="mt-4 flex justify-center gap-3">
                  <Link
                    to="/products"
                    className="bg-yellow-500 text-white font-bold py-2 px-6 text-base rounded-lg shadow-md transition-all duration-300 ease-in-out hover:bg-yellow-600 hover:-translate-y-0.5 hover:shadow-lg inline-block border-2 border-yellow-400"
                  >
                    Pesan Sekarang <i className="bi bi-arrow-right-short ml-1"></i>
                  </Link>
                  <Link
                    to="/about"
                    className="bg-yellow-500 text-white font-bold py-2 px-6 text-base rounded-lg transition-all duration-300 ease-in-out hover:bg-yellow-600 hover:-translate-y-0.5 hover:shadow-lg inline-block"
                  >
                    Tentang Kami
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </AnimatedSection>

        {/* How It Works Section */}
        <AnimatedSection variant="slideUp" delay={0.2} className="py-12 bg-yellow-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center relative pb-3 inline-block">
              Bagaimana Cara Memesan?
              <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-yellow-400 rounded-sm"></span>
            </h2>
            <div className="max-w-5xl mx-auto px-4">
              <div className="flex flex-wrap justify-center">
                {howItWorksSteps.map((step, index) => (
                  <div key={index} className="w-full sm:w-1/2 md:w-1/4 px-2 mb-6">
                    <HowItWorksStep
                      icon={step.icon}
                      title={step.title}
                      description={step.description}
                      isHovered={hoveredStep === index}
                      onMouseEnter={() => setHoveredStep(index)}
                      onMouseLeave={() => setHoveredStep(null)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Our Kitchen Space Section */}
        <AnimatedSection variant="fadeIn" delay={0.2} className="py-10 bg-gray-100">
          <div className="container mx-auto px-4">
            <motion.div 
              className="flex flex-col md:flex-row items-center gap-6 md:gap-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <motion.div 
                className="md:w-1/2"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h2 className="text-2xl font-semibold text-gray-800 mb-3 text-center md:text-left">Our Kitchen Space</h2>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Kami Menjaga Kebersihan Dan Kualitas Rasa Di Setiap Masakan
                </h3>
                <p className="text-gray-600 mb-2 text-sm leading-relaxed">
                  Komitmen kami adalah menyajikan hidangan yang tidak hanya lezat tetapi juga higienis. Setiap masakan disiapkan dengan bahan-bahan segar berkualitas tinggi di dapur modern kami yang terjaga kebersihannya.
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Dari pemilihan bahan hingga proses memasak, kami menerapkan standar tertinggi untuk memastikan Anda mendapatkan pengalaman kuliner terbaik.
                </p>
              </motion.div>
              <motion.div 
                className="md:w-1/2 grid grid-cols-2 gap-2"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                  alt="Professional Kitchen Setup" 
                  className="rounded-lg shadow-xl object-cover w-full h-36"
                  loading="lazy"
                />              <img 
                  src="https://images.unsplash.com/photo-1576867757603-05b134ebc379?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                  alt="Traditional Indonesian Food"
                  className="rounded-lg shadow-xl object-cover w-full h-36"
                  loading="lazy"
                />
                <img 
                  src="https://images.unsplash.com/photo-1581299894341-367e6517569c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                  alt="Professional Cooking Area"
                  className="rounded-lg shadow-xl object-cover w-full h-36"
                  loading="lazy"
                />
                <img 
                  src="https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                  alt="Food Plating Area"
                  className="rounded-lg shadow-xl object-cover w-full h-36"
                  loading="lazy"
                />
              </motion.div>
            </motion.div>
          </div>
        </AnimatedSection>

        {/* Feedback Form Section */}
        <AnimatedSection variant="fadeIn" delay={0.2} className="py-10 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Feedback Anda</h2>
            
            {isAuthenticated ? (
              <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md p-4 border border-gray-100">
                <form onSubmit={handleSubmitFeedback} className="space-y-3">
                  <div>
                    <label htmlFor="feedbackName" className="block text-gray-700 text-sm font-medium mb-1">Nama</label>
                    <input
                      type="text" id="feedbackName" name="name" value={feedback.name} onChange={handleFeedbackChange} required
                      className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                      placeholder="Nama Lengkap Anda"
                    />
                  </div>
                  <div>
                    <label htmlFor="feedbackEmail" className="block text-gray-700 text-sm font-medium mb-1">Email</label>
                    <input
                      type="email" id="feedbackEmail" name="email" value={feedback.email} onChange={handleFeedbackChange} required
                      className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                      placeholder="Alamat Email Aktif"
                      readOnly={feedback.email !== ''} // Membuat field email readonly jika sudah terisi otomatis
                    />
                  </div>
                  <div>
                    <label htmlFor="feedbackMessage" className="block text-gray-700 text-sm font-medium mb-1">Pesan</label>
                    <textarea
                      id="feedbackMessage" rows={3} name="message" value={feedback.message} onChange={handleFeedbackChange} required
                      className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                      placeholder="Tuliskan pesan, kritik, atau saran Anda..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-yellow-500 border-none text-white font-bold py-2.5 text-base rounded-lg transition-all duration-300 ease-in-out hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
                    disabled={isSubmittingFeedback}
                  >
                    {isSubmittingFeedback ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Mengirim...
                      </>
                    ) : (
                      'Kirim Feedback'
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md p-6 border border-gray-100 text-center">
                <div className="text-gray-600 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-yellow-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p className="text-lg font-medium mb-2">Login Diperlukan</p>
                  <p className="mb-4">Silakan login terlebih dahulu untuk mengirimkan feedback Anda.</p>
                  <Link to="/login" className="inline-block bg-yellow-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-yellow-600 transition-colors">
                    Login Sekarang
                  </Link>
                </div>
              </div>
            )}
          </div>
        </AnimatedSection>

      {/* Product Modal */}
      <ProductModalOptimized 
        productId={selectedProductId} 
        show={showModal} 
        onHide={handleCloseModal}
      />
      </AnimatedPage>
    </div>
  );
};

export default HomeOptimized;
