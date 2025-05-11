import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import { catalogService } from '../../services/catalogService';
import { apiClient } from '../../utils/apiHelper';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    completedOrders: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch products count
        const products = await productService.getAllProductsAdmin();
        
        // Fetch catalogs count
        const catalogs = await catalogService.getAllCatalogs();
        
        // Fetch orders data from the API
        const ordersResponse = await apiClient.get('/orders');
        const orders = ordersResponse.data;
        
        // Fetch completed orders count - Updated endpoint
        const completedOrdersResponse = await apiClient.get('/orders/status/completed');
        const completedOrders = completedOrdersResponse.data.length;
        
        // Fetch users count
        const usersResponse = await apiClient.get('/users');
        const users = usersResponse.data;
        
        setStats({
          totalProducts: Array.isArray(products) ? products.length : 0,
          totalOrders: Array.isArray(orders) ? orders.length : 0,
          totalUsers: Array.isArray(users) ? users.length : 0,
          completedOrders: completedOrders || 0
        });
        
        setError(null);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Gagal memuat data dashboard. Silakan coba lagi nanti.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Container className="py-5">
        <Alert variant="info">Memuat data dashboard...</Alert>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <h1 className="mb-4 text-center">Dasbor Admin</h1>
      
      <Row className="mb-4">
        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title>Total Produk</Card.Title>
              <h2>{stats.totalProducts}</h2>
            </Card.Body>
            <Card.Footer className="bg-transparent">
              <Link to="/admin/products" className="text-decoration-none">Kelola Produk</Link>
            </Card.Footer>
          </Card>
        </Col>
        
        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title>Total Pesanan</Card.Title>
              <h2>{stats.totalOrders}</h2>
            </Card.Body>
            <Card.Footer className="bg-transparent">
              <Link to="/admin/orders" className="text-decoration-none">Kelola Pesanan</Link>
            </Card.Footer>
          </Card>
        </Col>
        
        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title>Total Pengguna</Card.Title>
              <h2>{stats.totalUsers}</h2>
            </Card.Body>
            <Card.Footer className="bg-transparent">
              <Link to="/admin/users" className="text-decoration-none">Kelola Pengguna</Link>
            </Card.Footer>
          </Card>
        </Col>
        
        <Col md={3} sm={6} className="mb-3">
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <Card.Title>Total Pesanan Selesai</Card.Title>
              <h2>{stats.completedOrders}</h2>
            </Card.Body>
            <Card.Footer className="bg-transparent">
              <Link to="/admin/orders" className="text-decoration-none">Lihat Detail</Link>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Header as="h5">Navigasi Cepat</Card.Header>
            <Card.Body>
              <div className="d-flex flex-wrap justify-content-center gap-2">
                <Link to="/admin/products">
                  <Button variant="primary" className="m-2">Manajemen Produk</Button>
                </Link>
                <Link to="/admin/orders">
                  <Button variant="success" className="m-2">Manajemen Pesanan</Button>
                </Link>
                <Link to="/admin/catalogs">
                  <Button variant="info" className="m-2">Manajemen Katalog</Button>
                </Link>
                <Link to="/admin/users">
                  <Button variant="secondary" className="m-2">Manajemen Pengguna</Button>
                </Link>
                <Link to="/admin/feedback">
                  <Button variant="warning" className="m-2">Customer Feedback</Button>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col md={6} className="mb-3">
          <Card className="shadow-sm h-100">
            <Card.Header as="h5">Pesanan Terbaru</Card.Header>
            <Card.Body>
              <Alert variant="light">
                Data pesanan terbaru akan ditampilkan di sini.
              </Alert>
              <div className="text-center">
                <Link to="/admin/orders">
                  <Button variant="outline-primary">Lihat Semua Pesanan</Button>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} className="mb-3">
          <Card className="shadow-sm h-100">
            <Card.Header as="h5">Produk Terlaris</Card.Header>
            <Card.Body>
              <Alert variant="light">
                Informasi produk terlaris akan ditampilkan di sini.
              </Alert>
              <div className="text-center">
                <Link to="/admin/products">
                  <Button variant="outline-primary">Lihat Semua Produk</Button>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;