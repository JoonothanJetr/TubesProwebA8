import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert, Image } from 'react-bootstrap';
import { productService } from '../../services/productService';
import { catalogService } from '../../services/catalogService';

const ProductForm = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(productId);

    const [product, setProduct] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category_id: '',
        image: null,
    });
    const [catalogs, setCatalogs] = useState([]);
    const [loadingCatalogs, setLoadingCatalogs] = useState(true);
    const [currentImageUrl, setCurrentImageUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [loadingProduct, setLoadingProduct] = useState(isEditMode);

    useEffect(() => {
        const fetchCatalogs = async () => {
            try {
                setLoadingCatalogs(true);
                const data = await catalogService.getAllCatalogs();
                setCatalogs(data || []);
                setError(null);
            } catch (err) {
                console.error("Error fetching catalogs:", err);
                setError("Gagal memuat daftar katalog.");
                setCatalogs([]);
            } finally {
                setLoadingCatalogs(false);
            }
        };
        fetchCatalogs();
    }, []);

    useEffect(() => {
        if (isEditMode) {
            const fetchProduct = async () => {
                try {
                    setLoadingProduct(true);
                    const data = await productService.getProductById(productId);
                    setProduct({
                        name: data.name || '',
                        description: data.description || '',
                        price: data.price || '',
                        stock: data.stock || '',
                        category_id: data.category_id || '',
                        image: null,
                    });
                    setCurrentImageUrl(data.image_url || null);
                    setError(null);
                } catch (err) {
                    console.error(`Error fetching product ${productId}:`, err);
                    setError("Gagal memuat data produk untuk diedit.");
                } finally {
                    setLoadingProduct(false);
                }
            };
            fetchProduct();
        }
    }, [productId, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setProduct(prev => ({ ...prev, image: e.target.files[0] }));
        if (e.target.files[0]) {
            setCurrentImageUrl(URL.createObjectURL(e.target.files[0]));
        } else if (isEditMode) {
            const fetchProductAgain = async () => {
                try {
                    const data = await productService.getProductById(productId);
                    setCurrentImageUrl(data.image_url || null);
                } catch (err) { console.error("Failed to refetch image", err) }
            }
            fetchProductAgain();
        } else {
            setCurrentImageUrl(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (!product.name || !product.price || !product.stock || !product.category_id || (!isEditMode && !product.image)) {
             setError("Semua field wajib diisi (termasuk kategori), dan gambar untuk produk baru.");
             setLoading(false);
             return;
         }
         if (isNaN(product.price) || isNaN(product.stock) || product.price <= 0 || product.stock < 0) {
             setError("Harga harus angka positif dan Stok harus angka positif atau nol.");
             setLoading(false);
             return;
         }

        const formData = new FormData();
        formData.append('name', product.name);
        formData.append('description', product.description);
        formData.append('price', product.price);
        formData.append('stock', product.stock);
        formData.append('category_id', product.category_id);
        if (product.image) {
            formData.append('image', product.image);
        }

        try {
            if (isEditMode) {
                await productService.updateProduct(productId, formData);
                alert('Produk berhasil diperbarui!');
            } else {
                await productService.createProduct(formData);
                alert('Produk baru berhasil ditambahkan!');
            }
            navigate('/admin/products');
        } catch (err) {
            console.error("Error saving product:", err);
            setError(err.message || `Gagal ${isEditMode ? 'memperbarui' : 'menyimpan'} produk.`);
        } finally {
            setLoading(false);
        }
    };

    if (loadingProduct || loadingCatalogs) {
        return <div className="text-center mt-5"><Spinner animation="border" /> Memuat...</div>;
    }

    return (
        <Container className="mt-4">
            <Row>
                <Col md={{ span: 8, offset: 2 }}>
                    <Card>
                        <Card.Header as="h2">{isEditMode ? 'Edit Produk' : 'Tambah Produk Baru'}</Card.Header>
                        <Card.Body>
                            {error && <Alert variant="danger">{error}</Alert>}
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3" controlId="productName">
                                    <Form.Label>Nama Produk</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={product.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="productDescription">
                                    <Form.Label>Deskripsi</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="description"
                                        value={product.description}
                                        onChange={handleChange}
                                    />
                                </Form.Group>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="productPrice">
                                            <Form.Label>Harga (Rp)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="price"
                                                value={product.price}
                                                onChange={handleChange}
                                                required
                                                min="1"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="productStock">
                                            <Form.Label>Stok</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="stock"
                                                value={product.stock}
                                                onChange={handleChange}
                                                required
                                                min="0"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3" controlId="productCategory">
                                    <Form.Label>Kategori</Form.Label>
                                    <Form.Select
                                        name="category_id"
                                        value={product.category_id}
                                        onChange={handleChange}
                                        required
                                        disabled={loadingCatalogs}
                                    >
                                        <option value="">{loadingCatalogs ? 'Memuat...' : '-- Pilih Kategori --'}</option>
                                        {catalogs.map(cat => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    {catalogs.length === 0 && !loadingCatalogs && <Form.Text className="text-muted">Tidak ada kategori tersedia. Tambahkan di Manajemen Katalog.</Form.Text>}
                                </Form.Group>

                                <Form.Group controlId="productImage" className="mb-3">
                                    <Form.Label>Gambar Produk</Form.Label>
                                    <Form.Control
                                        type="file"
                                        name="image"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        required={!isEditMode}
                                    />
                                    {currentImageUrl && (
                                        <div className="mt-2">
                                            <Form.Text>Preview:</Form.Text><br/>
                                            <Image src={currentImageUrl.startsWith('blob:') ? currentImageUrl : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/${currentImageUrl}`} alt="Preview Produk" thumbnail style={{ maxHeight: '150px' }} />
                                        </div>
                                    )}
                                    {isEditMode && !product.image && <Form.Text className="text-muted">Kosongkan jika tidak ingin mengubah gambar.</Form.Text>}
                                </Form.Group>

                                <Button variant="primary" type="submit" disabled={loading}>
                                    {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : ''}
                                    {loading ? ' Menyimpan...' : (isEditMode ? 'Update Produk' : 'Tambah Produk')}
                                </Button>
                                <Button variant="secondary" onClick={() => navigate('/admin/products')} className="ms-2" disabled={loading}>
                                    Batal
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ProductForm; 