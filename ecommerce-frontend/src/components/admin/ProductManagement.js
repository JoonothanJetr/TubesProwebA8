import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Table, Spinner, Alert } from 'react-bootstrap';
import { productService } from '../../services/productService';
import ProductImage from '../../components/common/ProductImage';

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fungsi untuk memuat ulang data produk
    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await productService.getAllProductsAdmin();
            setProducts(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching products:", err);
            setError(err.message || "Gagal memuat data produk.");
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (productId) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus produk ini? Operasi ini tidak dapat dibatalkan.')) {
            try {
                await productService.deleteProduct(productId);
                setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
                alert('Produk berhasil dihapus.');
            } catch (err) {
                console.error("Error deleting product:", err);
                alert(err.message || 'Gagal menghapus produk.');
            }
        }
    };

    // Style untuk tabel - mencegah perubahan ukuran yang menyebabkan "getar-getar"
    const tableStyles = {
        tableLayout: 'fixed',
        width: '100%'
    };

    // Style untuk kolom tabel yang konsisten
    const columnStyles = {
        id: { width: '50px' },
        image: { width: '80px', height: '80px' },
        name: { width: '25%' },
        price: { width: '15%' },
        stock: { width: '10%' },
        category: { width: '15%' },
        actions: { width: '15%' }
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
                        <Card.Body className="p-0"> {/* Menghilangkan padding untuk konsistensi */}
                            {loading && (
                                <div className="text-center p-5">
                                    <Spinner animation="border" />
                                    <p className="mt-2">Memuat data produk...</p>
                                </div>
                            )}
                            {error && <Alert variant="danger" className="m-3">{error}</Alert>}
                            {!loading && !error && (
                                <div className="table-responsive">
                                    <Table striped bordered hover style={tableStyles}>
                                        <thead>
                                            <tr>
                                                <th style={columnStyles.id}>ID</th>
                                                <th style={columnStyles.image}>Gambar</th>
                                                <th style={columnStyles.name}>Nama Produk</th>
                                                <th style={columnStyles.price}>Harga</th>
                                                <th style={columnStyles.stock}>Stok</th>
                                                <th style={columnStyles.category}>Kategori</th>
                                                <th style={columnStyles.actions}>Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.length > 0 ? (
                                                products.map(product => (
                                                    <tr key={product.id}>
                                                        <td style={columnStyles.id}>{product.id}</td>
                                                        <td style={columnStyles.image} className="text-center p-1">
                                                            <div style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}>
                                                                <ProductImage
                                                                    imageUrl={product.image_url}
                                                                    productName={product.name}
                                                                    style={{ 
                                                                        width: '64px',
                                                                        height: '64px',
                                                                        objectFit: 'cover'
                                                                    }}
                                                                    className="img-thumbnail"
                                                                />
                                                            </div>
                                                        </td>
                                                        <td style={columnStyles.name} className="text-truncate">
                                                            {product.name}
                                                        </td>
                                                        <td style={columnStyles.price}>
                                                            Rp {product.price ? product.price.toLocaleString('id-ID') : '0'}
                                                        </td>
                                                        <td style={columnStyles.stock}>{product.stock}</td>
                                                        <td style={columnStyles.category}>{product.category_name || 'N/A'}</td>
                                                        <td style={columnStyles.actions}>
                                                            <Button
                                                                as={Link}
                                                                to={`/admin/products/edit/${product.id}`}
                                                                variant="warning"
                                                                size="sm"
                                                                className="me-2 mb-1"
                                                            >
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                variant="danger"
                                                                size="sm"
                                                                onClick={() => handleDelete(product.id)}
                                                            >
                                                                Hapus
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="7" className="text-center py-4">
                                                        Tidak ada data produk
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ProductManagement;