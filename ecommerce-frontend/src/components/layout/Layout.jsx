import React, { useState, useEffect } from 'react';
import Footer from './Footer';
import { useLocation, Link } from 'react-router-dom';
import Navbar from '../Navbar'; // Added Tailwind Navbar
import { authService } from '../../services/authService';
import { cartService } from '../../services/cartService';

const Layout = ({ children }) => {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');

    const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        setIsAuthenticated(authService.isAuthenticated());
        
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
    }, [location]);

    const handleLogout = () => {
        authService.logout();
        setIsAuthenticated(false);
        setCartCount(0);
    };

    return (
        <div className="flex flex-col min-h-screen"> {/* Changed to Tailwind classes */}
            {!isAdminRoute && (
                <Navbar 
                    isAuthenticated={isAuthenticated}
                    cartCount={cartCount}
                    handleLogout={handleLogout}
                />
            )}            <main className="flex-grow"> {/* Changed to flex-grow for Tailwind */}
                {children}
            </main>
            {!isAdminRoute && <Footer />}
        </div>
    );
};

export default Layout;