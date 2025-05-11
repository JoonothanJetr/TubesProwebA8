import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout.js';
import AdminDashboardPage from './pages/admin/AdminDashboard.js';
import AdminFeedbackPage from './pages/admin/AdminFeedbackPage.js';
import { authService } from './services/authService';
import HomeOptimized from './pages/HomeOptimized.js'; // Ditambahkan

// A simple component for a login page, replace with your actual login page
const LoginPagePlaceholder = () => <div><h2>Login Page</h2><p>Please log in to continue.</p></div>;

// Dummy auth check function - replace with your actual authentication logic
const isAuthenticated = () => {
  return !!localStorage.getItem('token'); // Example: checks if a token exists
};

// ProtectedRoute component to handle routes that require authentication
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const user = authService.getUser();
    console.log(`App.js useEffect triggered. Path: ${location.pathname}, User from authService:`, user);

    if (user && user.token) {
      console.log(`App.js useEffect: User IS authenticated. Role: ${user.role}`);
      if (user.role === 'admin') {
        const isAdminOnNonAdminPath = location.pathname === '/' || location.pathname === '/login' || location.pathname.startsWith('/user');
        console.log(`App.js useEffect (Admin Check): isAdminOnNonAdminPath for path "${location.pathname}" is ${isAdminOnNonAdminPath}`);
        if (isAdminOnNonAdminPath) {
          console.log("App.js useEffect (Admin Redirect): Admin on non-admin path. Redirecting to /admin.");
          navigate('/admin', { replace: true });
        }
      } else if (user.role === 'customer') {
        const isCustomerOnNonCustomerPath = location.pathname === '/' || location.pathname === '/login' || location.pathname.startsWith('/admin');
        console.log(`App.js useEffect (Customer Check): isCustomerOnNonCustomerPath for path "${location.pathname}" is ${isCustomerOnNonCustomerPath}`);
        if (isCustomerOnNonCustomerPath) {
          console.log("App.js useEffect (Customer Redirect): Customer on non-customer path. Redirecting to /user/dashboard.");
          navigate('/user/dashboard', { replace: true });
        }
      }
    } else {
      console.log(`App.js useEffect: User is NOT authenticated (or no token). Path: ${location.pathname}`);
      if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/user')) {
        if (location.pathname !== '/login' && location.pathname !== '/register') {
          console.log(`App.js useEffect (Unauth Redirect): No user, but trying to access protected path ${location.pathname}. Redirecting to /login.`);
          navigate('/login', { replace: true });
        }
      }
    }
  }, [navigate, location.pathname]);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomeOptimized />} /> {/* Diubah */}
        <Route path="/login" element={<LoginPagePlaceholder />} />

        {/* Admin Routes - Protected and within AdminLayout */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="feedback" element={<AdminFeedbackPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
