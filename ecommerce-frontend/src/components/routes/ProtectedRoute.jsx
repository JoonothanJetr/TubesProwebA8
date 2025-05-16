import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../../services/authService';

const ProtectedRoute = () => {
    const isAuthenticated = authService.isAuthenticated();

    // Periksa apakah pengguna terautentikasi
    if (isAuthenticated) {
        // Jika terautentikasi, render komponen anak (Outlet)
        return <Outlet />;
    } else {
        // Jika tidak terautentikasi, redirect ke halaman login
        return <Navigate to="/login" />;
    }
};

export default ProtectedRoute; 