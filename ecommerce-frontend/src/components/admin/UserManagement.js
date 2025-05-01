import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Spinner, Alert, Button, Badge } from 'react-bootstrap'; // Tambahkan Button, Badge
import { userService } from '../../services/userService';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await userService.getAllUsers();
            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching users:", err);
            setError(err.message || "Gagal memuat data pengguna.");
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeleteUser = async (userId, userEmail) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus pengguna ${userEmail}? Operasi ini tidak dapat dibatalkan.`)) {
            setLoading(true);
            setError(null);
            try {
                await userService.deleteUser(userId);
                alert(`Pengguna ${userEmail} berhasil dihapus.`);
                // Refresh daftar pengguna setelah berhasil menghapus
                setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
            } catch (err) {
                console.error("Error deleting user:", err);
                setError(err.message || 'Gagal menghapus pengguna.');
            } finally {
                 // Set loading false setelah operasi selesai (baik sukses maupun error)
                setLoading(false);
            }
        }
    };

    // Helper untuk warna badge peran
    const getRoleBadgeVariant = (role) => {
        switch (role) {
            case 'admin': return 'danger';
            case 'customer': return 'info';
            default: return 'secondary';
        }
    };

    return (
        <Container className="mt-4">
            <Row className="mb-3">
                <Col>
                    <h2>Manajemen Pengguna</h2>
                </Col>
                {/* Tambahkan tombol "Tambah Pengguna" jika diperlukan, 
                    tapi biasanya admin tidak menambah pengguna secara manual,
                    mereka mendaftar sendiri. */}
            </Row>
            <Row>
                <Col>
                    <Card>
                        <Card.Body>
                            {loading && <div className="text-center"><Spinner animation="border" /> Memuat...</div>}
                            {error && <Alert variant="danger">{error}</Alert>}
                            {!loading && !error && (
                                <Table striped bordered hover responsive>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Username</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Tanggal Daftar</th>
                                            <th>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.length > 0 ? (
                                            users.map(user => (
                                                <tr key={user.id}>
                                                    <td>{user.id}</td>
                                                    <td>{user.username}</td>
                                                    <td>{user.email}</td>
                                                    <td>
                                                        <Badge bg={getRoleBadgeVariant(user.role)}>
                                                            {user.role}
                                                        </Badge>
                                                    </td>
                                                    <td>{user.created_at ? new Date(user.created_at).toLocaleDateString('id-ID') : 'N/A'}</td>
                                                    <td>
                                                        {/* Tambahkan tombol Edit Role jika fitur diaktifkan */}
                                                        {/* 
                                                        <Button variant="outline-secondary" size="sm" className="me-2" disabled={loading}>
                                                            Edit Role
                                                        </Button> 
                                                        */}
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => handleDeleteUser(user.id, user.email)}
                                                            disabled={loading} // Disable tombol saat loading
                                                        >
                                                            Hapus
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="text-center">Tidak ada pengguna ditemukan.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default UserManagement; 