import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';

// Layouts
import Layout from './components/layout/Layout.jsx';
import AdminLayout from './components/layout/AdminLayout.jsx';

// Pages & Components
import HomeOptimized from './pages/HomeOptimized.jsx';
import About from './pages/About.jsx';
import PaymentPage from './pages/PaymentPage.jsx';

// Auth Components
import Login from './components/auth/Login.jsx';
import Register from './components/auth/Register.jsx';
import AdminRegister from './components/auth/AdminRegister.jsx';

// Product Components
import ProductList from './components/products/ProductList.jsx';
import ProductDetail from './components/products/ProductDetail.jsx';

// Cart & Order Components
import CartList from './components/cart/CartList.jsx';
import OrderList from './components/orders/OrderList.jsx';
import OrderDetail from './components/orders/OrderDetail.jsx';

// Services
import { authService } from './services/authService';

// Route Protectors
import AdminRoute from './components/routes/AdminRoute.jsx';
import ProtectedRoute from './components/routes/ProtectedRoute.jsx';

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard.jsx';
import ProductManagement from './components/admin/ProductManagement.jsx';
import ProductForm from './components/admin/ProductForm.jsx';
import CatalogManagement from './components/admin/CatalogManagement.jsx';
import UserManagement from './components/admin/UserManagement.jsx';
import OrderManagement from './components/admin/OrderManagement.jsx';
import AdminOrderDetail from './components/admin/AdminOrderDetail.jsx';
import AdminFeedbackPage from './pages/admin/AdminFeedbackPage.jsx';

function App() {
    const [isAuthenticatedState, setIsAuthenticatedState] = useState(authService.isAuthenticated());
    const [userState, setUserState] = useState(authService.getUser());
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const authenticated = authService.isAuthenticated();
        const currentUser = authService.getUser();
        setIsAuthenticatedState(authenticated);
        setUserState(currentUser);

        console.log(`App.jsx useEffect: Path: ${location.pathname}, User:`, currentUser, "Auth:", authenticated);

        if (authenticated && currentUser?.role === 'admin') {
            const isAdminOnNonAdminPath = location.pathname === '/' || location.pathname === '/login' || location.pathname.startsWith('/user');
            if (isAdminOnNonAdminPath) {
                console.log('App.jsx useEffect: Admin on non-admin path, redirecting to /admin');
                navigate('/admin', { replace: true });
            }
        } else if (authenticated && currentUser?.role === 'customer') {
            const isCustomerOnNonCustomerPath = location.pathname === '/login' || location.pathname.startsWith('/admin');
            if (isCustomerOnNonCustomerPath) {
                console.log('App.jsx useEffect: Customer on non-customer path, redirecting to /');
                navigate('/', { replace: true });
            }        } else if (!authenticated) {
            const isProtectedPath = location.pathname.startsWith('/admin') || 
                                    location.pathname.startsWith('/cart') || 
                                    location.pathname.startsWith('/orders') ||
                                    location.pathname.startsWith('/payment') ||
                                    location.pathname.startsWith('/user');
            const isPublicAuthPath = location.pathname === '/login' || 
                                   location.pathname === '/register' ||
                                   location.pathname === '/register/admin';
            if (isProtectedPath && !isPublicAuthPath) {
                console.log(`App.jsx useEffect: Unauthenticated access to ${location.pathname}, redirecting to /login.`);
                navigate('/login', { replace: true });
            }
        }
    }, [location.pathname, navigate]);

    const handleLoginSuccess = (loggedInUser) => {
        setIsAuthenticatedState(true);
        setUserState(loggedInUser);
        if (loggedInUser?.role === 'admin') {
            navigate('/admin', { replace: true });
        } else {
            navigate('/', { replace: true });
        }
    };

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Layout><HomeOptimized /></Layout>} />
            <Route path="/about" element={<Layout><About /></Layout>} />
            <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register/admin" element={<AdminRegister />} />
            <Route path="/products" element={<Layout><ProductList /></Layout>} />
            <Route path="/products/:id" element={<Layout><ProductDetail /></Layout>} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
                <Route path="/cart" element={<Layout><CartList /></Layout>} />
                <Route path="/orders" element={<Layout><OrderList /></Layout>} />
                <Route path="/orders/:id" element={<Layout><OrderDetail /></Layout>} />
                <Route path="/payment" element={<Layout><PaymentPage /></Layout>} />
            </Route>

            {/* Admin Routes */}
            <Route element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/products" element={<ProductManagement />} />
                    <Route path="/admin/products/new" element={<ProductForm />} />
                    <Route path="/admin/products/edit/:productId" element={<ProductForm />} />
                    <Route path="/admin/catalogs" element={<CatalogManagement />} />
                    <Route path="/admin/users" element={<UserManagement />} />
                    <Route path="/admin/orders" element={<OrderManagement />} />
                    <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
                    <Route path="/admin/feedback" element={<AdminFeedbackPage />} />
                </Route>
            </Route>

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
