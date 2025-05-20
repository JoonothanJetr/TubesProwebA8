// filepath: c:\Users\Jetro\Documents\GitHub\TubesProwebA8\ecommerce-frontend\src\pages\HomeOptimized.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { productService } from '../services/productService';
import ProductModalOptimized from '../components/products/ProductModalOptimized';
import { prefetchProductOnHover } from '../utils/prefetchHelper';
import ProductImageOptimized from '../components/common/ProductImageOptimized';
import Swal from 'sweetalert2';
import { FaUtensils, FaCog, FaTruck, FaCreditCard, FaHeart, FaPlus, FaEye } from 'react-icons/fa';
import { BiDrink } from 'react-icons/bi';
import '../styles/animations.css';
import '../styles/carousel.css';  // Import carousel styles
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

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
    className="w-full p-4 text-center sm:w-1/2 md:w-1/4 max-w-xs transform transition-all duration-300 ease-in-out hover:scale-105"
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    <div className={`
      mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full
      bg-gradient-to-br from-yellow-100 to-yellow-300
      text-yellow-700
      transition-all duration-300 ease-in-out
      ${isHovered ? 'shadow-xl ring-2 ring-yellow-300 scale-110' : 'shadow-md'}
    `}>
      <Icon className="text-4xl" />
    </div>
    <h5 className="mt-4 text-xl font-semibold text-gray-800">{title}</h5>
    <p className="text-md text-gray-600 mt-1">{description}</p>
  </div>
);

const Testimonial = ({ image, name, location, text, rating }) => (
  <div className="mb-6 w-full px-3 md:w-1/2 lg:w-1/2">
    <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-lg transition-transform duration-300 ease-in-out hover:-translate-y-1.5 h-full flex flex-col">
      <div className="mb-4 flex items-center">
        <img
          src={image}
          alt={name}
          className="mr-4 h-16 w-16 rounded-full border-2 border-yellow-400 object-cover"
          loading="lazy"
        />
        <div>
          <h5 className="mb-0 text-xl font-semibold text-gray-800">{name}</h5>
          <small className="text-sm text-gray-500">{location}</small>
        </div>
      </div>
      <blockquote className="mb-4 text-gray-700 flex-grow italic relative">
        <span className="absolute -left-3 -top-2 text-5xl text-yellow-300 opacity-80">“</span>
        {text}
        <span className="absolute -right-0 -bottom-3 text-5xl text-yellow-300 opacity-80 transform rotate-180">“</span>
      </blockquote>
      <div className="text-yellow-400 text-lg">
        {Array.from({ length: 5 }).map((_, i) => (
          <i key={i} className={`bi bi-star${i < Math.floor(rating) ? '-fill' : (i < rating + 0.5 ? '-half' : '')} mr-1`}></i>
        ))}
      </div>
    </div>
  </div>
);

const HomeOptimized = () => {
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState({ name: '', email: '', message: '' });
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [hoveredProductId, setHoveredProductId] = useState(null);
  const [hoveredStep, setHoveredStep] = useState(null);

  useEffect(() => {
    const fetchPopularProducts = async () => {
      try {
        setLoading(true);
        const products = await productService.getFeaturedProducts(8);
        setPopularProducts(products || []);
        if (products && products.length > 0) {
          setTimeout(() => {
            const idsToPreFetch = products.slice(0, 3).map(p => p.id);
            productService.prefetchMultipleProducts(idsToPreFetch);
          }, 1000);
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

  const testimonials = useMemo(() => [
    { image: 'https://randomuser.me/api/portraits/women/65.jpg', name: 'Siska Dewi', location: 'Jakarta', text: 'Saya sangat senang dengan kualitas makanan dan pelayanan mereka. Makanan selalu datang tepat waktu dan rasanya lezat!', rating: 5 },
    { image: 'https://randomuser.me/api/portraits/men/32.jpg', name: 'Joko Prabowo', location: 'Bandung', text: 'Sebagai pecinta makanan tradisional, saya menemukan surga kuliner di sini. Semua menu memiliki cita rasa autentik.', rating: 4.5 }
  ], []);

  return (
    <div className="home-page bg-gray-50 text-gray-800">
      {/* Hero Section */}
      <div className="relative min-h-screen bg-gradient-animation pt-12 pb-10 md:pt-20 md:pb-16 overflow-hidden">
        {/* Ulos Pattern Overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url('https://i.pinimg.com/originals/8b/44/51/8b4451265b6d6cd9117b4c869e69bdf6.png')`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px'
        }}></div>
        
        <div className="container mx-auto px-4 relative">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2 text-center md:text-left">
              <div className="space-y-6">
                {/* Ornamental Border using Ulos-inspired colors */}
                <div className="inline-block relative">
                  <div className="absolute -left-4 top-0 w-2 h-full bg-gradient-to-b from-yellow-500 via-yellow-400 to-yellow-600"></div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                    Nikmati Kelezatan Masakan <span className="text-yellow-600">Batak Toba</span>
                  </h1>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-800">
                  Toba <span className="text-yellow-500">&</span> Nusantara Di Meja Anda
                </h2>
                <p className="text-lg text-gray-700 max-w-xl">
                  Rasakan cita rasa autentik dari dapur kami, disiapkan dengan resep turun-temurun dan bumbu rempah pilihan khas Tanah Batak.
                </p>
                <div className="mt-8 space-x-4">
                  <Link
                    to="/products"
                    className="bg-yellow-500 text-white font-bold py-3 px-10 text-lg rounded-lg shadow-md transition-all duration-300 ease-in-out hover:bg-yellow-600 hover:-translate-y-0.5 hover:shadow-lg inline-block border-2 border-yellow-400"
                  >
                    Pesan Sekarang <i className="bi bi-arrow-right-short ml-1"></i>
                  </Link>
                  <Link
                    to="/about"
                    className="bg-transparent text-gray-800 font-bold py-3 px-10 text-lg rounded-lg transition-all duration-300 ease-in-out hover:bg-yellow-50 inline-block border-2 border-yellow-400 hover:border-yellow-500"
                  >
                    Tentang Kami
                  </Link>
                </div>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="relative rounded-xl shadow-2xl overflow-hidden">
                {/* Traditional Pattern Border */}
                <div className="absolute inset-0 border-8 border-opacity-30 rounded-xl z-10 pointer-events-none"
                     style={{
                       borderImage: 'linear-gradient(45deg, #FFD700, #FFA500, #FFB800) 1'
                     }}>
                </div>
                
                <Slider
                  dots={true}
                  infinite={true}
                  speed={1000}
                  slidesToShow={1}
                  slidesToScroll={1}
                  autoplay={true}
                  autoplaySpeed={3000}
                  fade={true}
                  pauseOnHover={true}
                  className="food-carousel"
                >
                  {foodImages.map((image, index) => (
                    <div key={index} className="carousel-slide">
                      <img
                        src={image.url}
                        alt={image.title}
                        className="carousel-image w-full object-cover"
                        style={{ height: '500px' }}
                        loading={index === 0 ? 'eager' : 'lazy'}
                      />                      <div className="carousel-overlay bg-gradient-to-t from-yellow-900/90 via-yellow-800/70 to-transparent">
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-center md:text-left">
                          <h3 className="carousel-title text-2xl md:text-3xl font-bold text-white mb-2">
                            {image.title}
                          </h3>
                          <p className="text-white/90 text-sm md:text-base mb-3 max-w-md">
                            {image.description}
                          </p>
                          <div className="w-20 h-1 bg-yellow-400 mx-auto md:mx-0"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </Slider>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16 bg-yellow-50">
        <div className="container mx-auto px-4">
          <SectionTitle>Bagaimana Cara Memesan?</SectionTitle>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-10">
            {howItWorksSteps.map((step, index) => (
              <HowItWorksStep
                key={index}
                icon={step.icon}
                title={step.title}
                description={step.description}
                isHovered={hoveredStep === index}
                onMouseEnter={() => setHoveredStep(index)}
                onMouseLeave={() => setHoveredStep(null)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Popular Food Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <SimpleSectionTitle>Popular Food</SimpleSectionTitle>
          {useMemo(() => {
            if (loading) return <div className="text-center py-10"><div className="spinner-border animate-spin inline-block w-10 h-10 border-4 rounded-full text-yellow-500" role="status"><span className="visually-hidden">Loading...</span></div><p className="mt-3 text-gray-600">Memuat produk populer...</p></div>;
            if (error) return <p className="text-center text-red-600 py-10 text-lg">{error}</p>;
            if (!popularProducts.length) return <p className="text-center text-gray-600 py-10 text-lg">Belum ada produk populer.</p>;
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
                {popularProducts.map(product => (                  <div
                    key={product.id}
                    className="bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 ease-in-out cursor-pointer flex flex-col group hover:shadow-xl"
                    onClick={() => handleShowModal(product.id)}
                    onMouseEnter={() => { handleProductHover(product.id); setHoveredProductId(product.id); }}
                    onMouseLeave={() => setHoveredProductId(null)}
                  >                    <div 
                      className={`h-52 overflow-hidden relative bg-gray-100 rounded-t-xl wave-bg transition-all duration-300 ease-out ${hoveredProductId === product.id ? 'transform scale-[1.02]' : ''}`}
                  >
                    <ProductImageOptimized
                      imageUrl={product.image_url}
                      productName={product.name}
                      className="object-cover h-full w-full transition-all duration-500 ease-in-out group-hover:scale-105 rounded-t-xl shadow-md"
                      loading="lazy"
                    />
                    {product.category_name && (
                      <span className="absolute top-3 left-3 bg-yellow-400 bg-opacity-90 text-gray-800 py-1.5 px-4 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 backdrop-blur-sm transition-transform duration-300 hover:scale-105">
                        {product.category_name.toLowerCase().includes('minuman') ? <BiDrink className="text-base" /> : <FaUtensils className="text-base" />}
                        {product.category_name}
                      </span>
                    )}
                  </div>

                  <div className="p-6 flex flex-col flex-grow bg-white rounded-b-xl">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate group-hover:text-yellow-600 transition-colors duration-300" 
                        title={product.name}>{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 min-h-[40px] flex-grow line-clamp-2">
                      {product.description?.substring(0, 60) || 'Deskripsi tidak tersedia'}...
                    </p>
                    <div className="flex justify-between items-center mt-auto pt-2">
                      <span className="text-xl font-bold text-yellow-500 transition-all duration-300 group-hover:scale-105">
                        Rp {product.price?.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>
                ))}
              </div>
            );
          }, [popularProducts, loading, error, handleShowModal, handleProductHover, hoveredProductId])}
        </div>
      </div>

      {/* Our Kitchen Space Section */}
      <div className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="md:w-1/2">
              <SimpleSectionTitle>Our Kitchen Space</SimpleSectionTitle>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                Kami Menjaga Kebersihan Dan Kualitas Rasa Di Setiap Masakan
              </h3>
              <p className="text-gray-600 mb-3 leading-relaxed">
                Komitmen kami adalah menyajikan hidangan yang tidak hanya lezat tetapi juga higienis. Setiap masakan disiapkan dengan bahan-bahan segar berkualitas tinggi di dapur modern kami yang terjaga kebersihannya.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Dari pemilihan bahan hingga proses memasak, kami menerapkan standar tertinggi untuk memastikan Anda mendapatkan pengalaman kuliner terbaik.
              </p>
            </div>
            <div className="md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1556911220-e48504827519?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                alt="Our Kitchen Space" 
                className="rounded-lg shadow-xl object-cover w-full"
                style={{ aspectRatio: '16/10' }}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-16 bg-yellow-50">
        <div className="container mx-auto px-4">
          <SimpleSectionTitle>Testimoni Pelanggan</SimpleSectionTitle>
          <div className="flex flex-wrap justify-center -mx-3">
            {testimonials.map((testimonial, index) => (
              <Testimonial key={index} {...testimonial} />
            ))}
          </div>
        </div>
      </div>

      {/* Customer Service / Feedback Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <SimpleSectionTitle>Customer Service</SimpleSectionTitle>
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-xl p-8 md:p-10">
              <h3 className="text-2xl mb-6 text-center text-gray-800 font-semibold">Berikan Feedback Anda</h3>
              <form onSubmit={handleSubmitFeedback} className="space-y-6">
                <div>
                  <label htmlFor="feedbackName" className="block text-gray-700 text-sm font-medium mb-1.5">Nama</label>
                  <input
                    type="text" id="feedbackName" name="name" value={feedback.name} onChange={handleFeedbackChange} required
                    className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                    placeholder="Nama Lengkap Anda"
                  />
                </div>
                <div>
                  <label htmlFor="feedbackEmail" className="block text-gray-700 text-sm font-medium mb-1.5">Email</label>
                  <input
                    type="email" id="feedbackEmail" name="email" value={feedback.email} onChange={handleFeedbackChange} required
                    className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                    placeholder="Alamat Email Aktif"
                  />
                </div>
                <div>
                  <label htmlFor="feedbackMessage" className="block text-gray-700 text-sm font-medium mb-1.5">Pesan</label>
                  <textarea
                    id="feedbackMessage" rows={4} name="message" value={feedback.message} onChange={handleFeedbackChange} required
                    className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                    placeholder="Tuliskan pesan, kritik, atau saran Anda..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-yellow-500 border-none text-white font-bold py-3.5 text-lg rounded-lg transition-all duration-300 ease-in-out hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
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
          </div>
        </div>
      </div>      <ProductModalOptimized 
        productId={selectedProductId} 
        show={showModal} 
        onHide={handleCloseModal}
      />
    </div>
  );
};

export default HomeOptimized;
