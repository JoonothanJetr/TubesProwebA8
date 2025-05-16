import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaBars } from 'react-icons/fa';
import { cartService } from '../services/cartService';

// Props: isAuthenticated, handleLogout
function Navbar({ isAuthenticated, handleLogout }) {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Function to fetch cart count
    const fetchCartCount = async () => {
      try {
        const count = await cartService.getCartItemCount();
        setCartCount(count);
      } catch (error) {
        console.error('Error fetching cart count:', error);
      }
    };

    // Fetch initially
    if (isAuthenticated) {
      fetchCartCount();
    }

    // Subscribe to cart updates
    window.addEventListener('cart-updated', fetchCartCount);

    // Cleanup subscription
    return () => {
      window.removeEventListener('cart-updated', fetchCartCount);
    };
  }, [isAuthenticated]);

  const onLogoutClick = () => {
    if (handleLogout) {
      handleLogout();
      setCartCount(0);
    }
    navigate('/login'); // Redirect to login after logout
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-7">
            <div>
              {/* Logo */}
              <Link to="/" className="flex items-center py-4 px-2">
                <span className="font-bold text-2xl text-yellow-500">TobaHome</span>
                <span className="font-semibold text-gray-600 text-lg ml-2">| SICATE</span>
              </Link>
            </div>
            {/* Primary Navbar items */}
            <div className="hidden md:flex items-center space-x-2">
              <Link to="/" className="py-2 px-3 text-gray-700 hover:text-yellow-500 transition duration-300">Beranda</Link>
              <Link to="/products" className="py-2 px-3 text-gray-700 hover:text-yellow-500 transition duration-300">Menu</Link>
              <Link to="/about" className="py-2 px-3 text-gray-700 hover:text-yellow-500 transition duration-300">Tentang Kami</Link>
              {isAuthenticated && (
                <Link to="/orders" className="py-2 px-3 text-gray-700 hover:text-yellow-500 transition duration-300">Pesanan Saya</Link>
              )}
            </div>
          </div>

          {/* Secondary Navbar items */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <Link to="/cart" className="relative py-2 px-3 text-gray-700 hover:text-yellow-500 transition duration-300">
                  <div className="relative inline-block">
                    <FaShoppingCart className="text-2xl" />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center bg-yellow-400 text-gray-900 text-xs font-bold rounded-full border-2 border-white shadow-sm">
                        {cartCount}
                      </span>
                    )}
                  </div>
                </Link>
                <button 
                  onClick={onLogoutClick} 
                  className="py-2 px-4 font-medium text-gray-700 rounded hover:bg-yellow-400 hover:text-white transition duration-300 border border-yellow-400"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="py-2 px-4 font-medium text-gray-700 rounded hover:bg-gray-100 hover:text-yellow-500 transition duration-300">
                  Masuk
                </Link>
                <Link to="/register" className="py-2 px-4 font-medium text-white bg-yellow-500 rounded hover:bg-yellow-600 transition duration-300">
                  Daftar
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            {isAuthenticated && (
              <Link to="/cart" className="relative py-2 px-3 text-gray-700 hover:text-yellow-500 transition duration-300 mr-2">
                <div className="relative inline-block">
                  <FaShoppingCart className="text-2xl" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center bg-yellow-400 text-gray-900 text-xs font-bold rounded-full border-2 border-white shadow-sm">
                      {cartCount}
                    </span>
                  )}
                </div>
              </Link>
            )}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="outline-none"
            >
              <FaBars className="w-6 h-6 text-gray-500 hover:text-yellow-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <ul className="bg-white border-t">
          <li><Link to="/" className="block text-sm px-4 py-3 text-gray-700 hover:bg-yellow-50 hover:text-yellow-500">Beranda</Link></li>
          <li><Link to="/products" className="block text-sm px-4 py-3 text-gray-700 hover:bg-yellow-50 hover:text-yellow-500">Menu</Link></li>
          <li><Link to="/about" className="block text-sm px-4 py-3 text-gray-700 hover:bg-yellow-50 hover:text-yellow-500">Tentang Kami</Link></li>
          {isAuthenticated ? (
            <>
              <li><Link to="/orders" className="block text-sm px-4 py-3 text-gray-700 hover:bg-yellow-50 hover:text-yellow-500">Pesanan Saya</Link></li>
              <li><button onClick={onLogoutClick} className="block w-full text-left text-sm px-4 py-3 text-gray-700 hover:bg-yellow-50 hover:text-yellow-500">Logout</button></li>
            </>
          ) : (
            <>
              <li><Link to="/login" className="block text-sm px-4 py-3 text-gray-700 hover:bg-yellow-50 hover:text-yellow-500">Masuk</Link></li>
              <li><Link to="/register" className="block text-sm px-4 py-3 text-gray-700 hover:bg-yellow-50 hover:text-yellow-500">Daftar</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;