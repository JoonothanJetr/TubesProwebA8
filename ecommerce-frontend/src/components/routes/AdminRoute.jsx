import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';

const AdminRoute = () => {
    const location = useLocation();
    const user = authService.getUser();
    const isAuthenticated = authService.isAuthenticated(); // Or directly check user && user.token

    if (!isAuthenticated) {
        // User not logged in, redirect to login page
        // Pass the current location so we can redirect back after login
        console.log('AdminRoute: User not authenticated, redirecting to /login');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user && user.role === 'admin') {
        // User is logged in and is an admin, allow access to the admin route
        console.log('AdminRoute: User is admin, allowing access.');
        return <Outlet />;
    }

    // User is logged in but not an admin, redirect to a 'not authorized' page or home page
    // For now, redirecting to home. You might want a specific "Unauthorized" page.
    console.warn("AdminRoute: User is authenticated but not an admin. Redirecting to home.");
    return <Navigate to="/" replace />;
};

export default AdminRoute;