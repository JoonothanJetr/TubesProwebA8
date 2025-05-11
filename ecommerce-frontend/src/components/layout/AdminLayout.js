import React from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import { Nav, Navbar } from 'react-bootstrap'; // Removed Container
import { authService } from '../../services/authService'; // Untuk logout

const AdminLayout = () => {
    const user = authService.getUser();

    const handleLogout = () => {
        authService.logout();
        // Redirect ke login sudah ditangani di authService.logout()
    };

    // Fungsi NavLink untuk style active
    const getNavLinkClass = ({ isActive }) => {
        return isActive ? "nav-link active fw-bold" : "nav-link";
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <div className="bg-dark text-white p-3" style={{ width: '250px', flexShrink: 0 }}>
                <Navbar.Brand as={Link} to="/admin" className="text-white mb-4 d-block fs-4">
                    SICATE Admin Panel
                </Navbar.Brand>
                <Nav className="flex-column" variant="pills">
                    <Nav.Item>
                        <NavLink to="/admin" end className={getNavLinkClass}>
                            Dashboard
                        </NavLink>
                    </Nav.Item>
                    <Nav.Item>
                        <NavLink to="/admin/products" className={getNavLinkClass}>
                            Manajemen Produk
                        </NavLink>
                    </Nav.Item>
                    <Nav.Item>
                        <NavLink to="/admin/catalogs" className={getNavLinkClass}> 
                            Manajemen Katalog
                        </NavLink>
                    </Nav.Item>
                    <Nav.Item>
                        <NavLink to="/admin/users" className={getNavLinkClass}>
                            Manajemen Pengguna
                        </NavLink>
                    </Nav.Item>
                    <Nav.Item>
                        <NavLink to="/admin/orders" className={getNavLinkClass}>
                            Manajemen Pesanan
                        </NavLink>
                    </Nav.Item>
                    <Nav.Item>
                        <NavLink to="/admin/feedback" className={getNavLinkClass}>
                            Customer Feedback
                        </NavLink>
                    </Nav.Item>
                </Nav>
                <hr className="text-secondary"/>
                <div className="mt-auto">
                     {user && (
                        <div className="text-center mb-3">
                            <small className="d-block text-muted">Logged in as:</small>
                            <span className="text-light">{user.email}</span>
                        </div>
                    )}
                    <button onClick={handleLogout} className="btn btn-outline-danger w-100">
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-grow-1 p-4 bg-light">
                {/* Outlet akan merender komponen rute anak (mis: AdminDashboard, ProductManagement) */}
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;