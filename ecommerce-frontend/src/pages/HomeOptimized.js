// filepath: c:\Users\Jetro\Documents\GitHub\TubesProwebA8\ecommerce-frontend\src\pages\HomeOptimized.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import { productService } from '../services/productService';
import ProductModal from '../components/products/ProductModal';
import { prefetchProductOnHover } from '../utils/prefetchHelper';
import ProductImageOptimized from '../components/common/ProductImageOptimized';
import Swal from 'sweetalert2';

// Base64 encoded tiny image placeholder for hero image lazy loading
const PLACEHOLDER_BASE64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==';

// Memoized components and fragments for better performance
const HowItWorksStep = ({ icon, title, description }) => (
  <Col sm={6} md={3}>
    <div className="p-3">
      <div className="rounded-circle bg-warning d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '80px', height: '80px' }}>
        <i className={`bi bi-${icon}`} style={{ fontSize: '2rem' }}></i>
      </div>
      <h5>{title}</h5>
      <p className="text-muted">{description}</p>
    </div>
  </Col>
);

const Testimonial = ({ image, name, location, text, rating }) => (
  <Col md={6} className="mb-4">
    <Card className="h-100 shadow-sm p-3">
      <Card.Body>
        <div className="d-flex align-items-center mb-3">
          <img 
            src={image} 
            alt={name} 
            className="rounded-circle me-3"
            width="60"
            height="60"
            loading="lazy"
          />
          <div>
            <h5 className="mb-0">{name}</h5>
            <small className="text-muted">{location}</small>
          </div>
        </div>
        <Card.Text>{text}</Card.Text>
        <div className="text-warning">
          {Array.from({ length: 5 }).map((_, i) => (
            <i key={i} className={`bi bi-star${i < Math.floor(rating) ? '-fill' : (i < rating + 0.5 ? '-half' : '')}`}></i>
          ))}
        </div>
      </Card.Body>
    </Card>
  </Col>
);

const HomeOptimized = () => {
  // State management
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  // Fetch products only once on component mount
  useEffect(() => {
    const fetchPopularProducts = async () => {
      try {
        setLoading(true);
        
        // Use the improved featured products function 
        const products = await productService.getFeaturedProducts(8);
        setPopularProducts(products || []);
        
        // Start prefetching product details after a short delay
        if (products && products.length > 0) {
          setTimeout(() => {
            // Prefetch the first 3 products for immediate modal opening
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

  // Memoized handlers to prevent unnecessary re-renders
  const handleShowModal = useCallback((productId) => {
    if (productId && productId !== 'undefined') {
      setSelectedProductId(productId);
      setShowModal(true);
    } else {
      console.error("Invalid product ID passed to handleShowModal:", productId);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Terjadi kesalahan saat membuka detail produk',
        confirmButtonColor: '#ffc107'
      });
    }
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    // Don't set selectedProductId to null immediately to avoid flash of emptiness
    // when closing and reopening modal quickly
    setTimeout(() => {
      setSelectedProductId(null);
    }, 300);
  }, []);

  const handleProductHover = useCallback((productId) => {
    // Prefetch product data when user hovers over a product card
    prefetchProductOnHover(productId);
  }, []);

  const handleFeedbackChange = useCallback((e) => {
    const { name, value } = e.target;
    setFeedback(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleSubmitFeedback = useCallback((e) => {
    e.preventDefault();
    // Here you would typically send the feedback to your backend
    console.log('Feedback submitted:', feedback);
    alert('Terima kasih atas feedback Anda!');
    // Reset the form
    setFeedback({
      name: '',
      email: '',
      message: ''
    });
  }, [feedback]);

  // Memoized hero section style to prevent unnecessary recalculations
  const heroStyle = useMemo(() => ({
    backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: 'white',
    padding: '80px 0',
    textAlign: 'center',
    marginBottom: '2rem'
  }), []);

  // Memoized "How it works" steps to prevent re-renders
  const howItWorksSteps = useMemo(() => [
    {
      icon: 'search',
      title: 'Pilih Makanan',
      description: 'Pilih menu favorit Anda dari berbagai macam pilihan'
    },
    {
      icon: 'cart',
      title: 'Konfirmasi Order',
      description: 'Periksa keranjang dan konfirmasi pesanan Anda'
    },
    {
      icon: 'credit-card',
      title: 'Pembayaran',
      description: 'Lakukan pembayaran dengan metode yang tersedia'
    },
    {
      icon: 'truck',
      title: 'Pengiriman',
      description: 'Tunggu pesanan Anda diantarkan ke lokasi Anda'
    }
  ], []);

  // Memoized testimonial data to prevent unnecessary re-renders
  const testimonials = useMemo(() => [
    {
      image: 'https://randomuser.me/api/portraits/women/65.jpg',
      name: 'Siska Dewi',
      location: 'Jakarta',
      text: '"Saya sangat senang dengan kualitas makanan dan pelayanan mereka. Makanan selalu datang tepat waktu dan rasanya lezat. Saya telah memesan beberapa kali dan tidak pernah kecewa!"',
      rating: 5
    },
    {
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
      name: 'Joko Prabowo',
      location: 'Bandung',
      text: '"Sebagai pecinta makanan tradisional, saya menemukan surga kuliner di sini. Semua menu memiliki cita rasa autentik dan porsi yang memuaskan. Harga juga sangat terjangkau untuk kualitas yang ditawarkan."',
      rating: 4.5
    }
  ], []);

  // Memoized product list to avoid unnecessary re-renders
  const productList = useMemo(() => {
    if (loading) {
      return (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading popular products...</p>
        </div>
      );
    }
    
    if (error) {
      return <p className="text-center text-danger">{error}</p>;
    }
    
    if (!popularProducts.length) {
      return <p className="text-center">No products found</p>;
    }
    
    return (
      <Row className="g-4">
        {popularProducts.map(product => (
          <Col key={product.id} xs={12} sm={6} md={3}>
            <Card 
              className="h-100 shadow-sm product-card"
              onClick={() => handleShowModal(product.id)}
              onMouseEnter={() => handleProductHover(product.id)}
            >
              <div style={{ height: '180px', overflow: 'hidden', position: 'relative' }}>
                <ProductImageOptimized 
                  imageUrl={product.image_url}
                  productName={product.name}
                  style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                  loading="lazy"
                />
                {product.category_name && (
                  <span className="category-badge">
                    {product.category_name}
                  </span>
                )}
              </div>
              <Card.Body>
                <Card.Title className="product-title">{product.name}</Card.Title>
                <Card.Text className="text-muted small">
                  {product.description?.substring(0, 60)}...
                </Card.Text>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-bold price">Rp {product.price?.toLocaleString('id-ID')}</span>
                  <Button 
                    variant="outline-warning" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShowModal(product.id);
                    }}
                  >
                    <i className="bi bi-eye-fill me-1"></i> Detail
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    );
  }, [popularProducts, loading, error, handleShowModal, handleProductHover]);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div style={heroStyle}>
        <Container>
          <h1 className="display-4 fw-bold mb-4">Nikmati Kelezatan Masakan Tradisional dan Nusantara</h1>
          <h2 className="h4 mb-5">Di Meja Anda</h2>
          <Button as={Link} to="/products" size="lg" variant="warning" className="px-5 py-3 fw-bold">
            Pesan Sekarang
          </Button>
        </Container>
      </div>

      {/* How It Works Section */}
      <Container className="mb-5">
        <h2 className="text-center mb-5">Bagaimana Cara Memesan?</h2>
        <Row className="g-4 text-center">
          {howItWorksSteps.map((step, index) => (
            <HowItWorksStep
              key={index}
              icon={step.icon}
              title={step.title}
              description={step.description}
            />
          ))}
        </Row>
      </Container>

      {/* Popular Food Section */}
      <Container className="mb-5">
        <h2 className="text-center mb-4">Popular Food</h2>
        {productList}
        <div className="text-center mt-4">
          <Button as={Link} to="/products" variant="outline-dark">
            Lihat Semua Menu
          </Button>
        </div>
      </Container>

      {/* Kitchen Space Section */}
      <Container fluid className="bg-light py-5 mb-5">
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="mb-4 mb-md-0">
              <h2 className="mb-4">Kami Menyajikan Makanan Terbaik dari Dapur Kami</h2>
              <p className="lead mb-4">Dengan bahan-bahan segar dan resep tradisional, kami berkomitmen menyajikan pengalaman kuliner terbaik untuk Anda.</p>
              <Button as={Link} to="/about" variant="warning">Tentang Kami</Button>
            </Col>
            <Col md={6}>
              <img 
                src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                alt="Our Kitchen" 
                className="img-fluid rounded shadow"
                style={{ maxHeight: '400px', objectFit: 'cover', width: '100%' }}
                loading="lazy"
              />
            </Col>
          </Row>
        </Container>
      </Container>

      {/* Testimonials Section */}
      <Container className="mb-5">
        <h2 className="text-center mb-5">Testimoni Pelanggan</h2>
        <Row>
          {testimonials.map((testimonial, index) => (
            <Testimonial
              key={index}
              image={testimonial.image}
              name={testimonial.name}
              location={testimonial.location}
              text={testimonial.text}
              rating={testimonial.rating}
            />
          ))}
        </Row>
      </Container>

      {/* Feedback/Contact Section */}
      <Container className="mb-5">
        <h2 className="text-center mb-5">Customer Service</h2>
        <Row>
          <Col md={6} className="mx-auto">
            <Card className="shadow-sm">
              <Card.Body>
                <h3 className="mb-4">Feedback</h3>
                <Form onSubmit={handleSubmitFeedback}>
                  <Form.Group className="mb-3" controlId="feedbackName">
                    <Form.Label>Nama</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="name" 
                      value={feedback.name} 
                      onChange={handleFeedbackChange} 
                      required 
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="feedbackEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control 
                      type="email" 
                      name="email" 
                      value={feedback.email} 
                      onChange={handleFeedbackChange} 
                      required 
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="feedbackMessage">
                    <Form.Label>Pesan</Form.Label>
                    <Form.Control 
                      as="textarea" 
                      rows={4} 
                      name="message" 
                      value={feedback.message} 
                      onChange={handleFeedbackChange} 
                      required 
                    />
                  </Form.Group>

                  <Button variant="warning" type="submit" className="w-100">
                    Kirim
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Product Modal */}
      <ProductModal 
        productId={selectedProductId}
        show={showModal}
        onHide={handleCloseModal}
      />
    </div>
  );
};

export default HomeOptimized;
