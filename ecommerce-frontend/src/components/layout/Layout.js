import React, { useState, useEffect } from 'react';
import Footer from './Footer';
import { useLocation, Link } from 'react-router-dom';
import { Navbar, Container, Nav, Badge } from 'react-bootstrap';
import { authService } from '../../services/authService';
import { cartService } from '../../services/cartService';
import CartIndicator from '../cart/CartIndicator';

const Layout = ({ children }) => {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');

    const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
    const [cartCount, setCartCount] = useState(0);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        setIsAuthenticated(authService.isAuthenticated());
        
        // Get cart count if user is authenticated
        if (authService.isAuthenticated()) {
            const fetchCartCount = async () => {
                try {
                    const cart = await cartService.getCart();
                    setCartCount(cart.length || 0);
                } catch (error) {
                    console.error("Error fetching cart:", error);
                }
            };
            fetchCartCount();
        }

        // Add scroll event listener
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [location]);

    const handleLogout = () => {
        authService.logout();
        setIsAuthenticated(false);
        setCartCount(0);
    };

    return (
        <div className="d-flex flex-column min-vh-100">
            {!isAdminRoute && (
                <Navbar 
                    bg={scrolled ? "white" : "transparent"} 
                    expand="lg" 
                    fixed="top"
                    className={scrolled ? "shadow-sm" : ""}
                    style={{ transition: 'all 0.3s ease' }}
                >                    <Container>
                        <Navbar.Brand as={Link} to="/" className="fw-bold">
                            <span className="text-warning">TobaHome</span><span className="text-dark"> | SICATE</span>
                        </Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="mx-auto">
                                <Nav.Link as={Link} to="/" className="mx-2">Beranda</Nav.Link>
                                <Nav.Link as={Link} to="/products" className="mx-2">Menu</Nav.Link>
                                <Nav.Link as={Link} to="/about" className="mx-2">Tentang Kami</Nav.Link>
                                {isAuthenticated && (
                                    <Nav.Link as={Link} to="/orders" className="mx-2">Pesanan Saya</Nav.Link>
                                )}
                            </Nav>
                            <Nav>
                                {isAuthenticated ? (
                                    <>
                                        <Nav.Link as={Link} to="/cart" className="position-relative me-3">
                                            <i className="bi bi-cart3" style={{ fontSize: '1.2rem' }}></i>
                                            {cartCount > 0 && (
                                                <Badge pill bg="warning" text="dark" className="position-absolute top-0 start-100 translate-middle">
                                                    {cartCount}
                                                </Badge>
                                            )}
                                        </Nav.Link>
                                        <Nav.Link onClick={handleLogout} className="btn btn-outline-warning text-dark">Logout</Nav.Link>
                                    </>
                                ) : (
                                    <>
                                        <Nav.Link as={Link} to="/login" className="me-2">Login</Nav.Link>
                                        <Nav.Link as={Link} to="/register" className="btn btn-warning">Daftar</Nav.Link>
                                    </>
                                )}
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            )}
            <div style={{ paddingTop: isAdminRoute ? '0' : '76px' }}></div>
            <main className="flex-grow-1">
                {children}
            </main>
            {!isAdminRoute && (
                <>
                    <Footer />
                    <CartIndicator />
                </>
            )}
        </div>
    );
};

export default Layout;