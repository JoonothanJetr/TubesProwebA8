import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProductList from './components/products/ProductList';
import ProductDetail from './components/products/ProductDetail';
import CartList from './components/cart/CartList';
import OrderList from './components/orders/OrderList';
import OrderDetail from './components/orders/OrderDetail';
import { authService } from './services/authService';
import { Link } from 'react-router-dom';
import { Navbar, Container, Nav } from 'react-bootstrap';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
    const isAuthenticated = authService.isAuthenticated();
    const isAdmin = authService.getUser()?.role === 'admin';
    
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }
    
    if (adminOnly && !isAdmin) {
        return <Navigate to="/" />;
    }
    
    return children;
};

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
    const [user, setUser] = useState(authService.getUser());
    
    useEffect(() => {
        // Periksa status autentikasi saat komponen dimuat
        setIsAuthenticated(authService.isAuthenticated());
        setUser(authService.getUser());
    }, []);
    
    const handleLogout = () => {
        authService.logout();
        setIsAuthenticated(false);
        setUser(null);
    };

    return (
        <Router>
            <Layout>
                <Navbar bg="light" expand="lg" className="border-bottom">
                    <Container>
                        <Navbar.Brand as={Link} to="/" className="text-primary">SICATE</Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="me-auto">
                                <Nav.Link as={Link} to="/">Produk</Nav.Link>
                                <Nav.Link as={Link} to="/cart">Keranjang</Nav.Link>
                                <Nav.Link as={Link} to="/orders">Pesanan</Nav.Link>
                            </Nav>
                            <Nav>
                                {isAuthenticated ? (
                                    <>
                                        <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
                                        <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
                                    </>
                                ) : (
                                    <>
                                        <Nav.Link as={Link} to="/login">Login</Nav.Link>
                                        <Nav.Link as={Link} to="/register" className="btn btn-primary text-white ms-2">Daftar</Nav.Link>
                                    </>
                                )}
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<ProductList />} />
                    <Route path="/login" element={<Login onLoginSuccess={() => setIsAuthenticated(true)} />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/products" element={<ProductList />} />
                    <Route path="/products/:id" element={<ProductDetail />} />

                    {/* Protected Routes */}
                    <Route
                        path="/cart"
                        element={
                            <ProtectedRoute>
                                <CartList />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/orders"
                        element={
                            <ProtectedRoute>
                                <OrderList />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/orders/:id"
                        element={
                            <ProtectedRoute>
                                <OrderDetail />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </Layout>
        </Router>
    );
};

export default App; 