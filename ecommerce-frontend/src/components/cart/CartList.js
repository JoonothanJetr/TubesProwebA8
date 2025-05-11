import React, { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartService } from '../../services/cartService';
import { Container, Row, Col, Card, Button, Form, Modal, Spinner } from 'react-bootstrap';
import Swal from 'sweetalert2';
import ProductModalOptimized from '../products/ProductModalOptimized';
import ProductImageOptimized from '../common/ProductImageOptimized'; // Import optimized image component
import { normalizeImagePaths } from '../../utils/imageFixer'; // Import image path fixer

const CartList = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
    const [processing, setProcessing] = useState(false);
    const [desiredCompletionDate, setDesiredCompletionDate] = useState(''); // State baru untuk tanggal penyelesaian
    
    // State for product modal
    const [showProductModal, setShowProductModal] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const data = await cartService.getCart();
            // Fix image paths to ensure they load correctly
            const fixedData = normalizeImagePaths(data);
            console.log('Original cart data:', data);
            console.log('Fixed cart data:', fixedData);
            setCartItems(fixedData);
            setError('');
        } catch (err) {
            console.error("Error fetching cart:", err);
            setError('Gagal memuat keranjang. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = async (productId, newQuantity) => {
        try {
            await cartService.updateCartItem(productId, newQuantity);
            fetchCart();
            
            // Show success toast
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Jumlah item berhasil diperbarui',
                showConfirmButton: false,
                timer: 2000
            });
        } catch (err) {
            console.error("Error updating item quantity:", err);
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: 'Gagal mengupdate jumlah item',
                showConfirmButton: false,
                timer: 3000
            });
        }
    };

    const handleRemoveItem = async (productId) => {
        try {
            // Ask for confirmation first
            const result = await Swal.fire({
                title: 'Hapus item?',
                text: "Item akan dihapus dari keranjang belanja Anda",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#dc3545',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Ya, hapus!',
                cancelButtonText: 'Batal'
            });

            if (result.isConfirmed) {
                await cartService.removeFromCart(productId);
                fetchCart();
                
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Item berhasil dihapus dari keranjang',
                    showConfirmButton: false,
                    timer: 2000
                });
            }
        } catch (err) {
            console.error("Error removing item:", err);
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: 'Gagal menghapus item',
                showConfirmButton: false,
                timer: 3000
            });
        }
    };

    const handleOpenCheckoutModal = () => {
        if (cartItems.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Keranjang Kosong',
                text: 'Tambahkan produk ke keranjang sebelum melakukan checkout',
                confirmButtonColor: '#ffc107'
            });
            return;
        }
        setShowCheckoutModal(true);
    };

    const handleCloseCheckoutModal = () => {
        setShowCheckoutModal(false);
        setSelectedPaymentMethod('');
        setDesiredCompletionDate(''); // Reset tanggal saat modal ditutup
    };

    const handlePaymentMethodChange = (e) => {
        setSelectedPaymentMethod(e.target.value);
    };

    const handleConfirmPayment = async () => {
        if (!selectedPaymentMethod) {
            Swal.fire({
                icon: 'error',
                title: 'Metode Pembayaran Dibutuhkan',
                text: 'Silakan pilih metode pembayaran terlebih dahulu',
                confirmButtonColor: '#ffc107'
            });
            return;
        }

        if (!desiredCompletionDate) { // Validasi tanggal penyelesaian
            Swal.fire({
                icon: 'error',
                title: 'Tanggal Penyelesaian Dibutuhkan',
                text: 'Silakan pilih tanggal kapan pesanan Anda ingin diselesaikan',
                confirmButtonColor: '#ffc107'
            });
            return;
        }

        // Data ini akan digunakan untuk membuat "sesi checkout" atau "pra-order"
        // yang akan diselesaikan di halaman pembayaran.
        const checkoutData = {
            paymentMethod: selectedPaymentMethod,
            items: cartItems.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.price,
                name: item.name, // Tambahkan nama produk
                image_url: item.image_url // Tambahkan URL gambar produk
            })),
            totalAmount: calcTotal(),
            desiredCompletionDate: desiredCompletionDate // Tambahkan tanggal penyelesaian
        };

        setProcessing(true);

        try {
            // Simpan data checkout ke localStorage untuk diambil di halaman pembayaran
            localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
            
            // Frontend: Kosongkan keranjang di state dan tutup modal
            setCartItems([]); 
            handleCloseCheckoutModal();
            
            // Arahkan ke halaman pembayaran baru
            navigate('/payment'); 

            // Tidak ada pembuatan order langsung di sini lagi
            // Tidak ada penghapusan item keranjang dari DB di sini

            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'info',
                title: 'Lanjutkan ke Pembayaran',
                text: 'Anda akan diarahkan ke halaman pembayaran.',
                showConfirmButton: false,
                timer: 3000
            });

        } catch (error) {
            console.error("Error preparing for payment:", error);
            Swal.fire({
                icon: 'error',
                title: 'Gagal Memproses',
                text: 'Terjadi kesalahan saat menyiapkan pembayaran. Silakan coba lagi.',
                confirmButtonColor: '#dc3545'
            });
        } finally {
            setProcessing(false);
        }
    };
    
    // Handler for product modal
    const handleShowProductModal = (productId) => {
        setSelectedProductId(productId);
        setShowProductModal(true);
    };

    const handleCloseProductModal = () => {
        setShowProductModal(false);
        setSelectedProductId(null);
    };

    // Calculate total price
    const calcTotal = () => {
        return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const total = calcTotal();

    // Payment method options
    const paymentMethods = [
        { value: '', label: '-- Pilih Metode Pembayaran --' },
        { value: 'cod', label: 'Bayar di Lokasi Pengambilan' },
        { value: 'qris', label: 'QRIS' },
        { value: 'dana', label: 'DANA' },
        { value: 'gopay', label: 'GoPay' },
    ];

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" role="status" variant="warning">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-3">Memuat keranjang belanja...</p>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <h1 className="mb-4 display-5 fw-bold">Keranjang Belanja</h1>
            
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {cartItems.length === 0 && !loading && !error && (
                <div className="text-center py-5">
                    <i className="bi bi-cart-x display-1 text-muted mb-3"></i>
                    <h4>Keranjang belanja Anda kosong</h4>
                    <p className="text-muted">Silakan tambahkan produk ke keranjang terlebih dahulu.</p>
                    <Button variant="warning" onClick={() => navigate('/products')}>
                        Lihat Produk
                    </Button>
                </div>
            )}

            {cartItems.length > 0 && (
                <Row>
                    <Col lg={8} className="mb-4 mb-lg-0">
                        <Card>
                            <Card.Header as="h5">
                                <i className="bi bi-cart4 me-2"></i>
                                Item dalam Keranjang
                            </Card.Header>
                            <Card.Body className="p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Produk</th>
                                                <th>Harga</th>
                                                <th>Jumlah</th>
                                                <th>Total</th>
                                                <th>Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cartItems.map((item) => (
                                                <tr key={item.product_id}>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <ProductImageOptimized 
                                                                imageUrl={item.image_url}
                                                                productName={item.name}
                                                                className="me-3"
                                                                style={{width: '70px', height: '70px', objectFit: 'cover', borderRadius: '4px'}}
                                                            />
                                                            <div>
                                                                <div className="fw-semibold mb-1" style={{cursor: 'pointer'}} onClick={() => handleShowProductModal(item.product_id)}>
                                                                    {item.name}
                                                                </div>
                                                                {item.category_name && (
                                                                    <span className="badge bg-light text-dark">{item.category_name}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>Rp {item.price?.toLocaleString('id-ID')}</td>
                                                    <td>
                                                        <Form.Select 
                                                            size="sm" 
                                                            value={item.quantity} 
                                                            onChange={(e) => handleQuantityChange(item.product_id, parseInt(e.target.value))}
                                                            style={{width: '80px'}}
                                                        >
                                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                                                <option key={num} value={num}>{num}</option>
                                                            ))}
                                                        </Form.Select>
                                                    </td>
                                                    <td className="fw-bold">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</td>
                                                    <td>
                                                        <Button 
                                                            variant="outline-danger" 
                                                            size="sm"
                                                            onClick={() => handleRemoveItem(item.product_id)}
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={4}>
                        <Card className="shadow-sm">
                            <Card.Header as="h5">
                                <i className="bi bi-receipt me-2"></i>
                                Ringkasan Pesanan
                            </Card.Header>
                            <Card.Body>
                                <div className="d-flex justify-content-between mb-3">
                                    <span>Subtotal</span>
                                    <span>Rp {total.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-3">
                                    <span>Pengiriman</span>
                                    <span className="text-success">Gratis</span>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between mb-4">
                                    <span className="fw-bold">Total</span>
                                    <span className="fw-bold fs-5">Rp {total.toLocaleString('id-ID')}</span>
                                </div>
                                <Button 
                                    variant="warning" 
                                    className="w-100 py-2"
                                    onClick={handleOpenCheckoutModal}
                                >
                                    <i className="bi bi-credit-card me-2"></i>
                                    Checkout
                                </Button>
                            </Card.Body>
                        </Card>
                        
                        <Card className="mt-4">
                            <Card.Body>
                                <h6><i className="bi bi-shield-check me-2"></i> Pembayaran Aman</h6>
                                <p className="text-muted small mb-0">
                                    Semua transaksi dilindungi dan dienkripsi untuk keamanan Anda
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}
            
            {/* Checkout Modal */}
            <Modal show={showCheckoutModal} onHide={handleCloseCheckoutModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Konfirmasi Pesanan</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Metode Pembayaran</Form.Label>
                            <Form.Select 
                                value={selectedPaymentMethod} 
                                onChange={handlePaymentMethodChange}
                                aria-label="Pilih metode pembayaran"
                            >
                                {paymentMethods.map(method => (
                                    <option key={method.value} value={method.value}>
                                        {method.label}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        
                        <Form.Group className="mb-3"> 
                            <Form.Label>Tanggal Pesanan Harus Jadi</Form.Label>
                            <Form.Control 
                                type="date" 
                                value={desiredCompletionDate} 
                                onChange={(e) => setDesiredCompletionDate(e.target.value)} 
                                min={new Date().toISOString().split('T')[0]} // Tanggal minimum adalah hari ini
                            />
                        </Form.Group>

                        <div className="mb-3">
                            <h6 className="mb-2">Detail Pesanan</h6>
                            <div className="bg-light p-3 rounded">
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Jumlah Item</span>
                                    <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                                </div>
                                <div className="d-flex justify-content-between fw-bold">
                                    <span>Total</span>
                                    <span>Rp {total.toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        </div>
                        
                        <small className="text-muted d-block mb-3">
                            Setelah konfirmasi pembayaran, Anda dapat mengecek halaman "Pesanan" untuk melihat status pesanan Anda.
                        </small>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="light" onClick={handleCloseCheckoutModal}>
                        Batal
                    </Button>
                    <Button 
                        variant="warning" 
                        onClick={handleConfirmPayment}
                        disabled={!selectedPaymentMethod || processing}
                    >
                        {processing ? (
                            <>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    className="me-2"
                                />
                                Memproses...
                            </>
                        ) : (
                            'Konfirmasi Pembayaran'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
            
            {/* Product Detail Modal */}
            <ProductModalOptimized 
                productId={selectedProductId}
                show={showProductModal}
                onHide={handleCloseProductModal}
            />
        </Container>
    );
};

export default CartList;