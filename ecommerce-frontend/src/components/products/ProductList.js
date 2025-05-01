import React, { useState, useEffect } from 'react';
// Hapus Link jika klik sekarang membuka modal
// import { Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import ProductDetailModal from './ProductDetailModal'; // <-- Import modal
import { Spinner, Row, Col, Card } from 'react-bootstrap'; // Import Spinner, Row, Col, Card dari react-bootstrap
import { authService } from '../../services/authService';
import { cartService } from '../../services/cartService';

const ProductList = () => {
    console.log('ProductList rendering...'); // <-- Tambahkan kembali log render
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('semua'); 
    // State untuk modal
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [addingToCart, setAddingToCart] = useState(false); // State untuk loading add to cart

    // Kategori (asumsi tidak berubah drastis, bisa juga diambil dari API jika dinamis)
    const categories = [
        'semua',
        'makanan-utama',
        'makanan-pembuka',
        'makanan-penutup',
        'minuman'
    ];
    const categoryLabels = {
        'semua': 'Semua Menu',
        'makanan-utama': 'Makanan Utama',
        'makanan-pembuka': 'Makanan Pembuka',
        'makanan-penutup': 'Makanan Penutup',
        'minuman': 'Minuman'
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        setError(''); // Reset error saat fetch
        try {
            // Pastikan backend mengembalikan category_name atau data kategori lain jika perlu
            const data = await productService.getAllProducts();
            setProducts(data);
        } catch (err) {
            console.error("Error fetching products:", err);
            setError('Gagal memuat produk');
        } finally {
            setLoading(false);
        }
    };

    // Filter produk berdasarkan kategori yang dipilih
    const filteredProducts = selectedCategory === 'semua'
        ? products
        : products.filter(product => product.category_name === categoryLabels[selectedCategory]); // Sesuaikan dengan data backend (misal category_name)

    // Handler untuk menampilkan modal
    const handleShowModal = (product) => {
        setSelectedProduct(product);
        setShowModal(true);
    };

    // Handler untuk menutup modal
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedProduct(null);
    };

    // Handler untuk Tambah ke Keranjang
    const handleAddToCart = async (productId) => {
        // Cek dulu apakah pengguna sudah login
        if (!authService.isAuthenticated()) {
            alert('Silakan login terlebih dahulu untuk menambahkan item ke keranjang.');
            // Arahkan ke login?
            // navigate('/login');
            handleCloseModal();
            return;
        }
        
        console.log("Adding product to cart:", productId);
        setAddingToCart(true); // Set loading
        try {
            // Asumsi quantity = 1 saat pertama kali tambah dari modal
            await cartService.addToCart(productId, 1); 
            alert('Produk berhasil ditambahkan ke keranjang!');
            handleCloseModal(); // Tutup modal setelah sukses
        } catch (err) {
            console.error("Error adding to cart:", err);
            alert(err.message || 'Gagal menambahkan produk ke keranjang. Silakan coba lagi.');
            // Jangan tutup modal jika gagal?
        } finally {
            setAddingToCart(false); // Reset loading
        }
    };

    if (loading) return (
        // Gunakan Spinner dari react-bootstrap agar konsisten
        <div className="d-flex justify-content-center align-items-center min-vh-100">
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </div>
    );
    
    if (error) return (
        <div className="text-center text-danger p-4">
            {error}
        </div>
    );

    return (
        <div className="container py-8">
            {/* Category Filter (gunakan Bootstrap jika ingin konsisten) */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Katalog Menu</h2>
                <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`btn btn-sm ${selectedCategory === category ? 'btn-primary' : 'btn-outline-secondary'}`}
                        >
                            {categoryLabels[category]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                    Tidak ada produk dalam kategori ini.
                </div>
            ) : (
                // Gunakan Row dan Col dari react-bootstrap jika ingin konsisten
                <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                    {filteredProducts.map((product) => (
                        <Col key={product.id}>
                            {/* Hapus Link, tambahkan onClick */}
                            <Card 
                                className="h-100 shadow-sm product-card" 
                                onClick={() => handleShowModal(product)} 
                                style={{ cursor: 'pointer' }}
                            >
                                <Card.Img 
                                    variant="top" 
                                    src={`http://localhost:5000/${product.image_url}`} 
                                    alt={product.name} 
                                    style={{ height: '200px', objectFit: 'cover' }}
                                    onError={(e) => { 
                                        e.target.onerror = null;
                                        e.target.style.display = 'none';
                                        console.error(`Gagal memuat gambar: ${e.target.src}`);
                                    }}
                                />
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title className="h6 mb-1">{product.name}</Card.Title>
                                    {/* Tampilkan nama kategori jika ada */}
                                    <Card.Text className="text-muted small mb-2">{product.category_name || 'Tanpa Kategori'}</Card.Text>
                                    <Card.Text className="h5 mt-auto mb-0 text-end fw-bold">
                                        Rp {product.price ? product.price.toLocaleString('id-ID') : '0'}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            {/* Render Modal Detail Produk */}
            {selectedProduct && (
                <ProductDetailModal 
                    show={showModal} 
                    handleClose={handleCloseModal} 
                    product={selectedProduct} 
                    onAddToCart={handleAddToCart}
                    isAdding={addingToCart} // Kirim state loading ke modal
                />
            )}
        </div>
    );
};

export default ProductList;