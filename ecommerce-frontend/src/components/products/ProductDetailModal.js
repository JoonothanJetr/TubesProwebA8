import React from 'react';
import { Modal, Button, Image, Container, Row, Col, Badge, Spinner } from 'react-bootstrap';
import { getProductImageUrl } from '../../utils/imageHelper';

const ProductDetailModal = ({ show, handleClose, product, onAddToCart, isAdding }) => {
    
    // Tampilkan pesan loading atau fallback jika produk belum ada
    if (!product) {
        return (
            <Modal show={show} onHide={handleClose} centered>
                <Modal.Body>Loading...</Modal.Body>
            </Modal>
        );
    }

    // Format harga
    const formattedPrice = product.price ? product.price.toLocaleString('id-ID') : '0';

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>{product.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Container fluid>
                    <Row>
                        <Col md={6} className="mb-3 mb-md-0">                            <Image 
                                src={getProductImageUrl(product.image_url)} 
                                alt={product.name} 
                                fluid 
                                rounded
                                style={{ maxHeight: '400px', width: '100%', objectFit: 'contain' }}
                                onError={(e) => { 
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/400x300?text=No+Image+Available';
                                    console.error(`Modal - Gagal memuat gambar: ${e.target.src}`);
                                }}
                            />
                        </Col>
                        <Col md={6}>
                            <h4>Deskripsi</h4>
                            <p>{product.description || 'Tidak ada deskripsi.'}</p>
                            <hr />
                            <p><strong>Kategori:</strong> 
                                <Badge bg="secondary" className="ms-2">{product.category_name || 'N/A'}</Badge>
                            </p>
                            <p><strong>Stok:</strong> {product.stock !== null ? product.stock : 'N/A'}</p>
                            <h4 className="text-primary fw-bold mt-3">Rp {formattedPrice}</h4>
                        </Col>
                    </Row>
                </Container>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose} disabled={isAdding}>
                    Tutup
                </Button>
                <Button 
                    variant="primary" 
                    onClick={() => onAddToCart(product.id)} 
                    disabled={product.stock === 0 || isAdding} 
                >
                    {isAdding ? (
                        <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Menambahkan...</>
                    ) : (
                        product.stock === 0 ? 'Stok Habis' : 'Tambah ke Keranjang'
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ProductDetailModal; 