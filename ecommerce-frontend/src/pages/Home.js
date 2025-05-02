import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import { productService } from '../services/productService';
import ProductModalOptimized from '../components/products/ProductModalOptimized';
import ProductImageOptimized from '../components/common/ProductImageOptimized';
import { prefetchProductOnHover, prefetchVisibleProducts } from '../utils/prefetchHelper';
import Swal from 'sweetalert2';

const Home = () => {
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState({
    name: '',
    email: '',
    message: ''
  });
  // Add state for product modal
  const [showModal, setShowModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);  useEffect(() => {
    const fetchPopularProducts = async () => {
      try {
        setLoading(true);
        // Use the new featured products function instead
        const products = await productService.getFeaturedProducts(8);
        console.log("Products received:", products);
        setPopularProducts(products || []);
        
        // Start prefetching the products immediately after loading for faster modal display
        setTimeout(() => {
          if (products && products.length > 0) {
            prefetchVisibleProducts(products, 3);
          }
        }, 500);
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
  
  // Handlers for modal using useCallback for better performance
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
    // Don't clear selectedProductId immediately to avoid flicker when reopening
    setTimeout(() => {
      setSelectedProductId(null);
    }, 300);
  }, []);
  
  // Handler for product hover to prefetch data
  const handleProductHover = useCallback((productId) => {
    prefetchProductOnHover(productId);
  }, []);

  const handleFeedbackChange = (e) => {
    const { name, value } = e.target;
    setFeedback(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitFeedback = (e) => {
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
  };

  // Hero section with background image
  const heroStyle = {
    backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: 'white',
    padding: '80px 0',
    textAlign: 'center',
    marginBottom: '2rem'
  };

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
          <Col sm={6} md={3}>
            <div className="p-3">
              <div className="rounded-circle bg-warning d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '80px', height: '80px' }}>
                <i className="bi bi-search" style={{ fontSize: '2rem' }}></i>
              </div>
              <h5>Pilih Makanan</h5>
              <p className="text-muted">Pilih menu favorit Anda dari berbagai macam pilihan</p>
            </div>
          </Col>
          <Col sm={6} md={3}>
            <div className="p-3">
              <div className="rounded-circle bg-warning d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '80px', height: '80px' }}>
                <i className="bi bi-cart" style={{ fontSize: '2rem' }}></i>
              </div>
              <h5>Konfirmasi Order</h5>
              <p className="text-muted">Periksa keranjang dan konfirmasi pesanan Anda</p>
            </div>
          </Col>
          <Col sm={6} md={3}>
            <div className="p-3">
              <div className="rounded-circle bg-warning d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '80px', height: '80px' }}>
                <i className="bi bi-credit-card" style={{ fontSize: '2rem' }}></i>
              </div>
              <h5>Pembayaran</h5>
              <p className="text-muted">Lakukan pembayaran dengan metode yang tersedia</p>
            </div>
          </Col>
          <Col sm={6} md={3}>
            <div className="p-3">
              <div className="rounded-circle bg-warning d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '80px', height: '80px' }}>
                <i className="bi bi-truck" style={{ fontSize: '2rem' }}></i>
              </div>
              <h5>Pengiriman</h5>
              <p className="text-muted">Tunggu pesanan Anda diantarkan ke lokasi Anda</p>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Popular Food Section */}
      <Container className="mb-5">
        <h2 className="text-center mb-4">Popular Food</h2>
        {loading ? (
          <p className="text-center">Loading...</p>
        ) : error ? (
          <p className="text-center text-danger">{error}</p>
        ) : (
          <Row className="g-4">
            {popularProducts.map(product => (
              <Col key={product.id} xs={12} sm={6} md={3}>                <Card 
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
                    <Card.Title>{product.name}</Card.Title>
                    <Card.Text className="text-muted small">
                      {product.description?.substring(0, 60)}...
                    </Card.Text>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold">Rp {product.price?.toLocaleString('id-ID')}</span>
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
        )}
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
              />
            </Col>
          </Row>
        </Container>
      </Container>

      {/* Testimonials Section */}
      <Container className="mb-5">
        <h2 className="text-center mb-5">Testimoni Pelanggan</h2>
        <Row>
          <Col md={6} className="mb-4">
            <Card className="h-100 shadow-sm p-3">
              <Card.Body>
                <div className="d-flex align-items-center mb-3">
                  <img 
                    src="https://randomuser.me/api/portraits/women/65.jpg" 
                    alt="Customer" 
                    className="rounded-circle me-3"
                    width="60"
                    height="60"
                  />
                  <div>
                    <h5 className="mb-0">Siska Dewi</h5>
                    <small className="text-muted">Jakarta</small>
                  </div>
                </div>
                <Card.Text>
                  "Saya sangat senang dengan kualitas makanan dan pelayanan mereka. Makanan selalu datang tepat waktu dan rasanya lezat. Saya telah memesan beberapa kali dan tidak pernah kecewa!"
                </Card.Text>
                <div className="text-warning">
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="mb-4">
            <Card className="h-100 shadow-sm p-3">
              <Card.Body>
                <div className="d-flex align-items-center mb-3">
                  <img 
                    src="https://randomuser.me/api/portraits/men/32.jpg" 
                    alt="Customer" 
                    className="rounded-circle me-3"
                    width="60"
                    height="60"
                  />
                  <div>
                    <h5 className="mb-0">Joko Prabowo</h5>
                    <small className="text-muted">Bandung</small>
                  </div>
                </div>
                <Card.Text>
                  "Sebagai pecinta makanan tradisional, saya menemukan surga kuliner di sini. Semua menu memiliki cita rasa autentik dan porsi yang memuaskan. Harga juga sangat terjangkau untuk kualitas yang ditawarkan."
                </Card.Text>
                <div className="text-warning">
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-half"></i>
                </div>
              </Card.Body>
            </Card>
          </Col>
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
      </Container>      {/* Product Modal */}
      <ProductModalOptimized 
        productId={selectedProductId}
        show={showModal}
        onHide={handleCloseModal}
      />
    </div>
  );
};

export default Home;
