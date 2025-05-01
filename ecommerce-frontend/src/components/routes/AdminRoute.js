import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../../services/authService';

const AdminRoute = () => {
    const currentUser = authService.getUser();

    // Periksa apakah pengguna ada dan perannya adalah admin
    if (currentUser && currentUser.role === 'admin') {
        // Jika admin, render komponen halaman admin yang sesuai (melalui Outlet)
        return <Outlet />;
    } else {
        // Jika bukan admin atau tidak login, arahkan ke halaman login
        console.warn('Akses ditolak ke rute admin. Pengguna bukan admin atau tidak login.');
        // Gunakan replace agar pengguna tidak bisa kembali ke halaman admin dengan tombol back
        return <Navigate to="/login" replace />;
    }
};

export default AdminRoute; 