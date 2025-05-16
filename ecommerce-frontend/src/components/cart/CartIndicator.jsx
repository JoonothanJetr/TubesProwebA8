import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cartService } from '../../services/cartService';

const CartIndicator = () => {
    const [cartCount, setCartCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCartCount();

        // Set up interval to periodically check cart status
        const interval = setInterval(fetchCartCount, 30000); // Check every 30 seconds
        
        return () => clearInterval(interval);
    }, []);

    const fetchCartCount = async () => {
        try {
            // Only fetch if user is logged in
            if (localStorage.getItem('token')) {
                setLoading(true);
                const cart = await cartService.getCart();
                const count = cart.reduce((sum, item) => sum + item.quantity, 0);
                setCartCount(count);
            } else {
                setCartCount(0);
            }
        } catch (error) {
            console.error("Error fetching cart count:", error);
            setCartCount(0);
        } finally {
            setLoading(false);
        }
    };

    // Don't show if not logged in or no items
    if (!localStorage.getItem('token') || (cartCount === 0 && !loading)) {
        return null;
    }

    return (
        <Link 
            to="/cart"
            className="cart-indicator"
            style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                backgroundColor: '#ffc107',
                color: '#212529',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                textDecoration: 'none',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                zIndex: 1000,
                transition: 'transform 0.2s ease'
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
            }}
        >
            <div className="position-relative">
                <i className="bi bi-cart-fill fs-4"></i>
                {cartCount > 0 && (
                    <span 
                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                        style={{ fontSize: '0.6rem' }}
                    >
                        {cartCount}
                    </span>
                )}
            </div>
        </Link>
    );
};

export default CartIndicator;
