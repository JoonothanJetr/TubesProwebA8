import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services/productService';
// import ProductModal from './ProductModal';
import ProductModalOptimized from './ProductModalOptimized'; // Using optimized modal
import { Spinner, Row, Col, Card, Button } from 'react-bootstrap';
import { authService } from '../../services/authService';
import { cartService } from '../../services/cartService';
import Swal from 'sweetalert2';
import { getProductImageUrl } from '../../utils/imageHelper';
import ProductImageOptimized from '../common/ProductImageOptimized';
import { prefetchProductOnHover, prefetchVisibleProducts } from '../../utils/prefetchHelper';

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
    };    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        setError(''); // Reset error saat fetch
        try {
            // Pastikan backend mengembalikan category_name atau data kategori lain jika perlu
            const data = await productService.getAllProducts();
            console.log("Fetched products:", data);
            setProducts(data);
            
            // Start prefetching the first few products immediately after loading for faster modal display
            setTimeout(() => {
                if (data && data.length > 0) {
                    prefetchVisibleProducts(data, 3);
                }
            }, 500);
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

    // Memoize for better performance and avoid unnecessary re-renders
    const handleProductHover = useCallback((productId) => {
        // When user hovers over a product, prefetch its details
        prefetchProductOnHover(productId);
    }, []);

    // Handler untuk menampilkan modal
    const handleShowModal = useCallback((productId) => {
        setSelectedProduct(productId);
        setShowModal(true);
    }, []);

    // Handler untuk menutup modal
    const handleCloseModal = useCallback(() => {
        setShowModal(false);
        // Don't set selectedProduct to null immediately to avoid flash of emptiness
        // when closing and reopening modal quickly
        setTimeout(() => {
            setSelectedProduct(null);
        }, 300);
    }, []);

    // Handler untuk Tambah ke Keranjang
    const handleAddToCart = async (productId) => {
        // Cek dulu apakah pengguna sudah login
        if (!authService.isAuthenticated()) {
            Swal.fire({
                icon: 'info',
                title: 'Login Diperlukan',
                text: 'Silakan login terlebih dahulu untuk menambahkan item ke keranjang',
                confirmButtonColor: '#ffc107',
                confirmButtonText: 'OK'
            });
            handleCloseModal();
            return;
        }
        
        console.log("Adding product to cart:", productId);
        setAddingToCart(true); // Set loading
        try {
            // Asumsi quantity = 1 saat pertama kali tambah dari modal
            await cartService.addToCart(productId, 1); 
            
            // Use SweetAlert toast for success message
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.addEventListener('mouseenter', Swal.stopTimer)
                    toast.addEventListener('mouseleave', Swal.resumeTimer)
                }
            });
            
            Toast.fire({
                icon: 'success',
                title: 'Produk berhasil ditambahkan ke keranjang!'
            });
            
            handleCloseModal(); // Tutup modal setelah sukses
        } catch (err) {
            console.error("Error adding to cart:", err);
            Swal.fire({
                icon: 'error',
                title: 'Gagal menambahkan produk',
                text: err.message || 'Terjadi kesalahan saat menambahkan produk ke keranjang. Silakan coba lagi.',
                confirmButtonColor: '#ffc107'
            });
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
                        <Col key={product.id}>                            <Card 
                                className="h-100 shadow-sm product-card"
                                onClick={() => handleShowModal(product.id)}
                                onMouseEnter={() => handleProductHover(product.id)}
                            >                                <div style={{ position: 'relative', overflow: 'hidden', height: '200px' }}>
                                    <ProductImageOptimized 
                                        imageUrl={product.image_url}
                                        productName={product.name}
                                        style={{ 
                                            height: '200px', 
                                            width: '100%',
                                            objectFit: 'cover'
                                        }}
                                        loading="lazy"
                                    />
                                    {product.category_name && (
                                        <span className="category-badge">
                                            {product.category_name}
                                        </span>
                                    )}
                                </div>
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title className="h6 mb-1">{product.name}</Card.Title>
                                    <Card.Text className="small mb-2 text-truncate">
                                        {product.description?.substring(0, 60) || 'Tidak ada deskripsi'}...
                                    </Card.Text>
                                    <Card.Text className="h5 mt-auto mb-0 fw-bold">
                                        Rp {product.price ? product.price.toLocaleString('id-ID') : '0'}
                                    </Card.Text>
                                </Card.Body>
                                <Card.Footer className="bg-white border-top-0 pt-0">
                                    <Button 
                                        variant="outline-warning" 
                                        size="sm" 
                                        className="w-100"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleShowModal(product.id);
                                        }}
                                    >
                                        <i className="bi bi-eye-fill me-1"></i> Detail
                                    </Button>
                                </Card.Footer>
                            </Card>
                        </Col>
                    ))}
                </Row>            )}            {/* Render Modal Detail Produk - using optimized version */}
            <ProductModalOptimized 
                productId={selectedProduct}
                show={showModal} 
                onHide={handleCloseModal}
            />
        </div>
    );
};

export default ProductList;