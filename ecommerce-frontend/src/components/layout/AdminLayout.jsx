import React, { useState } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

const AdminLayout = () => {
    const user = authService.getUser();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: '📊' },
        { path: '/admin/products', label: 'Manajemen Produk', icon: '🍽️' },
        { path: '/admin/catalogs', label: 'Manajemen Katalog', icon: '📑' },
        { path: '/admin/users', label: 'Manajemen Pengguna', icon: '👥' },
        { path: '/admin/orders', label: 'Manajemen Pesanan', icon: '📦' },
        { path: '/admin/feedback', label: 'Customer Feedback', icon: '💬' }
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 transition-transform duration-300 transform 
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                bg-gradient-to-b from-blue-800 to-blue-600 text-white shadow-xl`}>
                
                {/* Logo & Toggle Button */}
                <div className="flex items-center justify-between p-4">
                    <Link to="/admin" className="flex items-center space-x-2">
                        <span className="text-2xl font-bold">SICATE</span>
                        <span className="text-sm font-light">Admin Panel</span>
                    </Link>
                    <button 
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden text-white hover:text-gray-200"
                    >
                        ✕
                    </button>
                </div>

                {/* Navigation Menu */}
                <nav className="mt-8 px-4">
                    <div className="space-y-2">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === '/admin'}
                                className={({ isActive }) =>
                                    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200
                                    ${isActive 
                                        ? 'bg-white bg-opacity-10 text-white'
                                        : 'text-blue-100 hover:bg-white hover:bg-opacity-10'
                                    }`
                                }
                            >
                                <span>{item.icon}</span>
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </div>
                </nav>

                {/* User Profile & Logout */}
                <div className="absolute bottom-0 w-full p-4 border-t border-blue-500">
                    {user && (
                        <div className="mb-4 text-center">
                            <p className="text-sm text-blue-200">Logged in as:</p>
                            <p className="text-sm font-medium truncate">{user.email}</p>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200"
                    >
                        Logout
                    </button>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
                {/* Mobile Header */}
                <div className="sticky top-0 z-30 lg:hidden bg-white shadow-sm px-4 py-2">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 rounded-md hover:bg-gray-100"
                    >
                        ☰
                    </button>
                </div>

                {/* Content Area */}
                <div className="container mx-auto px-4 py-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;