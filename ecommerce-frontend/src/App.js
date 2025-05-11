import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Home from './pages/Home';
import About from './pages/About';
import ImageDebugger from './pages/ImageDebugger';
import ProductList from './components/products/ProductList';
import ProductDetail from './components/products/ProductDetail';
import CartList from './components/cart/CartList';
import OrderList from './components/orders/OrderList';
import OrderDetail from './components/orders/OrderDetail';
import { authService } from './services/authService';
// Removed unused imports: Link, Navbar, Container, Nav
import AdminRoute from './components/routes/AdminRoute';
import ProtectedRoute from './components/routes/ProtectedRoute';

// Import halaman pembayaran baru
import PaymentPage from './pages/PaymentPage';

// Import komponen admin secara langsung untuk menghindari masalah dengan lazy loading
import AdminDashboard from './components/admin/AdminDashboard';
import ProductManagement from './components/admin/ProductManagement';
import ProductForm from './components/admin/ProductForm';
import AdminLayout from './components/layout/AdminLayout';
import CatalogManagement from './components/admin/CatalogManagement';
import UserManagement from './components/admin/UserManagement';
import OrderManagement from './components/admin/OrderManagement';
import AdminOrderDetail from './components/admin/AdminOrderDetail';
import AdminFeedbackPage from './pages/admin/AdminFeedbackPage'; // Import AdminFeedbackPage

const AppContent = () => {
    // Using states but suppressing ESLint warnings since these are used internally
    // eslint-disable-next-line no-unused-vars
    const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
    // eslint-disable-next-line no-unused-vars
    const [user, setUser] = useState(authService.getUser());
    const location = useLocation();
    const navigate = useNavigate();
    
    useEffect(() => {
        // Periksa status autentikasi saat komponen dimuat
        const authenticated = authService.isAuthenticated();
        const currentUser = authService.getUser();
        setIsAuthenticated(authenticated);
        setUser(currentUser);

        // Redirect jika admin login dan berada di halaman utama
        if (authenticated && currentUser?.role === 'admin' && location.pathname === '/') {
            console.log('Initial load: Admin detected on root path, redirecting to /admin');
            navigate('/admin', { replace: true }); // Gunakan replace agar tidak menambah history
        }
        // Tambahkan dependensi location.pathname agar efek ini bisa berjalan
        // jika user navigasi ke '/' setelah login (meskipun redirect login sudah ada)
    }, [location.pathname, navigate]); // Tambahkan navigate ke dependency array
    
    const handleLoginSuccess = (loggedInUser) => {
        setIsAuthenticated(true);
        setUser(loggedInUser);
        // Pengalihan setelah login sudah ditangani di komponen Login
    };    // eslint-disable-next-line no-unused-vars
    const handleLogout = () => {
        authService.logout();
        setIsAuthenticated(false);
        setUser(null);
        // Redirect ke /login ditangani oleh authService atau halaman yang memerlukan auth
    };

    return (
        <Routes>            {/* Public Routes */}
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/about" element={<Layout><About /></Layout>} />
            <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/products" element={<Layout><ProductList /></Layout>} />
            <Route path="/products/:id" element={<Layout><ProductDetail /></Layout>} />
            <Route path="/debug-images" element={<Layout><ImageDebugger /></Layout>} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
                <Route path="/cart" element={<Layout><CartList /></Layout>} />
                <Route path="/orders" element={<Layout><OrderList /></Layout>} />
                <Route path="/orders/:id" element={<Layout><OrderDetail /></Layout>} />
                <Route path="/payment" element={<Layout><PaymentPage /></Layout>} /> {/* Rute baru untuk pembayaran */}
            </Route>            {/* Admin Routes */}
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
                    <Route path="/admin/feedback" element={<AdminFeedbackPage />} /> {/* Add this line */}
                </Route>
            </Route>

            {/* Rute fallback atau halaman 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

const App = () => (
    <Router>
        <AppContent />
    </Router>
);

export default App;