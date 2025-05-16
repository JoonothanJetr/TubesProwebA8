import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Table, Spinner, Alert, Form } from 'react-bootstrap';
import { productService } from '../../services/productService';
import { catalogService } from '../../services/catalogService';
import ProductImage from '../common/ProductImage';

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [catalogs, setCatalogs] = useState([]);
    const [selectedCatalog, setSelectedCatalog] = useState('');
    const [sortOption, setSortOption] = useState('id-asc');

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const productData = await productService.getAllProductsAdmin();
            const catalogData = await catalogService.getAllCatalogs();
            setProducts(Array.isArray(productData) ? productData : []);
            setCatalogs(Array.isArray(catalogData) ? catalogData : []);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError(err.message || "Gagal memuat data.");
            setProducts([]);
            setCatalogs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
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

    const processedProducts = useMemo(() => {
        let filtered = [...products];

        if (selectedCatalog) {
            filtered = filtered.filter(product => product.category_id === parseInt(selectedCatalog));
        }

        switch (sortOption) {
            case 'name-asc':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'price-desc':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'price-asc':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'id-asc':
            default:
                filtered.sort((a, b) => a.id - b.id);
                break;
        }
        return filtered;
    }, [products, selectedCatalog, sortOption]);

    const tableStyles = {
        tableLayout: 'fixed',
        width: '100%'
    };

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
            <Row className="mb-3 align-items-center">
                <Col md={6}>
                    <h2>Manajemen Produk</h2>
                </Col>
                <Col md={6} className="text-end">
                    <Button as={Link} to="/admin/products/new" variant="primary">
                        <i className="bi bi-plus-circle-fill me-2"></i>Tambah Produk Baru
                    </Button>
                </Col>
            </Row>

            <Card className="mb-4">
                <Card.Header>Filter dan Urutkan</Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={6}>
                            <Form.Group controlId="catalogFilter">
                                <Form.Label>Filter Berdasarkan Katalog</Form.Label>
                                <Form.Select 
                                    aria-label="Filter by catalog"
                                    value={selectedCatalog}
                                    onChange={(e) => setSelectedCatalog(e.target.value)}
                                >
                                    <option value="">Semua Katalog</option>
                                    {catalogs.map(catalog => (
                                        <option key={catalog.id} value={catalog.id}>
                                            {catalog.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="sortOption">
                                <Form.Label>Urutkan Berdasarkan</Form.Label>
                                <Form.Select 
                                    aria-label="Sort by option"
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value)}
                                >
                                    <option value="id-asc">ID Produk (Default)</option>
                                    <option value="name-asc">Nama Produk (A-Z)</option>
                                    <option value="price-desc">Harga (Tertinggi)</option>
                                    <option value="price-asc">Harga (Terendah)</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Row>
                <Col>
                    <Card>
                        <Card.Body className="p-0">
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
                                            {processedProducts.length > 0 ? (
                                                processedProducts.map(product => (
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
                                                                    className="img-thumbnail p-0"
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
                                                                variant="outline-warning"
                                                                size="sm"
                                                                className="me-2 mb-1"
                                                                title="Edit Produk"
                                                            >
                                                                <i className="bi bi-pencil-square"></i> Edit
                                                            </Button>
                                                            <Button
                                                                variant="outline-danger"
                                                                size="sm"
                                                                onClick={() => handleDelete(product.id)}
                                                                title="Hapus Produk"
                                                                className="mb-1"
                                                            >
                                                                <i className="bi bi-trash-fill"></i> Hapus
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="7" className="text-center py-4">
                                                        {products.length === 0 && !loading ? "Tidak ada data produk." : "Tidak ada produk yang sesuai dengan filter."}
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