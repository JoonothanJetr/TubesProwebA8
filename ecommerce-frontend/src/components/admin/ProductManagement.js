import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Table, Spinner, Alert, Image } from 'react-bootstrap';
import { productService } from '../../services/productService'; // Import productService

const ProductManagement = () => {
    console.log('ProductManagement rendering...'); // <-- Tambahkan log render
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fungsi untuk memuat ulang data produk
    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await productService.getAllProductsAdmin();
            // Pastikan data yang diterima adalah array
            setProducts(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching products:", err);
            setError(err.message || "Gagal memuat data produk.");
            setProducts([]); // Set ke array kosong jika error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts(); // Panggil fungsi fetch saat komponen dimuat
    }, []);

    const handleDelete = async (productId) => {
        // Konfirmasi sebelum menghapus
        if (window.confirm('Apakah Anda yakin ingin menghapus produk ini? Operasi ini tidak dapat dibatalkan.')) {
            try {
                await productService.deleteProduct(productId);
                // Refresh daftar produk setelah berhasil menghapus
                setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
                alert('Produk berhasil dihapus.');
            } catch (err) {
                console.error("Error deleting product:", err);
                alert(err.message || 'Gagal menghapus produk.');
            }
        }
    };

    return (
        <Container className="mt-4">
            <Row className="mb-3">
                <Col>
                    <h2>Manajemen Produk</h2>
                </Col>
                <Col className="text-end">
                    <Button as={Link} to="/admin/products/new" variant="primary">
                        Tambah Produk Baru
                    </Button>
                </Col>
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
                                            <th>Gambar</th>
                                            <th>Nama Produk</th>
                                            <th>Harga</th>
                                            <th>Stok</th>
                                            <th>Kategori</th>
                                            <th>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.length > 0 ? (
                                            products.map(product => (
                                                <tr key={product.id}>
                                                    <td>{product.id}</td>
                                                    <td>
                                                        {product.image_url && (
                                                            <Image 
                                                                src={`http://localhost:5000/${product.image_url}`} 
                                                                alt={product.name} 
                                                                thumbnail 
                                                                style={{ maxHeight: '50px', maxWidth: '50px' }} 
                                                                // onError={(e) => { e.target.onerror = null; e.target.src="/placeholder.png"; console.error(`Gagal memuat gambar: ${e.target.src}`) }}
                                                                // Sederhanakan onError untuk debug re-render
                                                                onError={(e) => { console.error(`Gagal memuat gambar asli: ${e.target.src}`) }}
                                                            />
                                                        )}
                                                    </td>
                                                    <td>{product.name}</td>
                                                    {/* Format harga ke Rupiah */}
                                                    <td>Rp {product.price ? product.price.toLocaleString('id-ID') : '0'}</td> 
                                                    <td>{product.stock}</td>
                                                     {/* Tampilkan category_name dari hasil JOIN backend */}
                                                    <td>{product.category_name || 'N/A'}</td>
                                                    <td>
                                                        <Button
                                                            as={Link}
                                                            to={`/admin/products/edit/${product.id}`}
                                                            variant="outline-secondary"
                                                            size="sm"
                                                            className="me-2 mb-1 mb-md-0" // Responsif margin
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleDelete(product.id)}
                                                            variant="outline-danger"
                                                            size="sm"
                                                        >
                                                            Hapus
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="text-center">Belum ada produk.</td>
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

export default ProductManagement; 