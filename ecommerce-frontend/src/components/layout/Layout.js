import React, { useState, useEffect } from 'react';
import Footer from './Footer';
import { useLocation, Link } from 'react-router-dom';
import { Navbar, Container, Nav } from 'react-bootstrap';
import { authService } from '../../services/authService';

const Layout = ({ children }) => {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');

    const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());

    useEffect(() => {
        setIsAuthenticated(authService.isAuthenticated());
    }, [location]);

    const handleLogout = () => {
        authService.logout();
        setIsAuthenticated(false);
    };

    return (
        <div className="min-h-screen flex flex-col">
            {!isAdminRoute && (
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
            )}
            <main className={`flex-grow ${isAdminRoute ? '' : 'container py-4'}`}>
                {children}
            </main>
            {!isAdminRoute && <Footer />}
        </div>
    );
};

export default Layout; 