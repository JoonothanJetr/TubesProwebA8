import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { cartService } from '../services/cartService'; // Untuk mengosongkan keranjang setelah pembayaran berhasil
import Swal from 'sweetalert2';
import { Container, Row, Col, Card, Button, Form, Spinner, Alert } from 'react-bootstrap';
import ProductImageOptimized from '../components/common/ProductImageOptimized';

const PaymentPage = () => {
    const navigate = useNavigate();
    const [checkoutData, setCheckoutData] = useState(null);
    const [paymentProof, setPaymentProof] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const [previewProof, setPreviewProof] = useState('');

    useEffect(() => {
        const data = localStorage.getItem('checkoutData');
        if (data) {
            try {
                const parsedData = JSON.parse(data);
                // Pastikan items adalah array
                if (parsedData && Array.isArray(parsedData.items)) {
                    setCheckoutData(parsedData);
                } else {
                    setError('Data checkout tidak valid. Item tidak ditemukan atau format salah.');
                    Swal.fire('Error', 'Data checkout tidak valid. Silakan ulangi proses checkout.', 'error');
                    navigate('/cart');
                }
            } catch (e) {
                setError('Gagal memuat data checkout. Format tidak sesuai.');
                Swal.fire('Error', 'Gagal memuat data checkout. Silakan ulangi proses checkout.', 'error');
                navigate('/cart');
            }
        } else {
            setError('Tidak ada data checkout. Silakan kembali ke keranjang.');
            Swal.fire('Informasi', 'Tidak ada data untuk diproses. Anda akan diarahkan ke keranjang.', 'info');
            navigate('/cart');
        }
        setLoading(false);
    }, [navigate]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPaymentProof(file);
            setPreviewProof(URL.createObjectURL(file));
            setError(''); // Reset error jika ada file dipilih
        }
    };

    const handleSubmitPayment = async () => {
        if (!paymentProof) {
            setError('Bukti pembayaran wajib diunggah.');
            Swal.fire('Peringatan', 'Silakan unggah bukti pembayaran Anda.', 'warning');
            return;
        }
        if (!checkoutData) {
            setError('Data checkout tidak ditemukan.');
            Swal.fire('Error', 'Data checkout tidak ditemukan. Proses tidak dapat dilanjutkan.', 'error');
            return;
        }

        setProcessing(true);
        setError('');

        const formData = new FormData();
        formData.append('paymentMethod', checkoutData.paymentMethod);
        formData.append('totalAmount', checkoutData.totalAmount);
        formData.append('desiredCompletionDate', checkoutData.desiredCompletionDate);
        formData.append('items', JSON.stringify(checkoutData.items)); // Kirim items sebagai JSON string
        formData.append('paymentProof', paymentProof);

        try {
            const response = await orderService.createOrderWithProof(formData);
            
            // Setelah order berhasil dibuat di backend (yang juga seharusnya menangani pengosongan keranjang sisi DB)
            // Kita panggil service untuk memastikan keranjang di DB juga bersih (jika backend tidak melakukannya)
            // atau cukup mengandalkan backend. Untuk saat ini, kita asumsikan backend menangani.
            // Jika tidak, kita bisa panggil cartService.clearCart() di sini.
            // Untuk contoh ini, kita akan panggil clearCart dari frontend service,
            // yang idealnya memberi tahu backend untuk membersihkan.
            await cartService.clearCart(); // Pastikan service ini ada dan berfungsi sesuai harapan

            localStorage.removeItem('checkoutData');
            setProcessing(false);

            Swal.fire({
                icon: 'success',
                title: 'Pembayaran Berhasil & Pesanan Dibuat!',
                text: response.message || 'Pesanan Anda telah berhasil dibuat dan bukti pembayaran diterima.',
                confirmButtonColor: '#28a745'
            }).then(() => {
                navigate('/orders');
            });

        } catch (err) {
            setProcessing(false);
            const errorMessage = err.response?.data?.error || err.message || 'Gagal membuat pesanan atau mengunggah bukti.';
            setError(errorMessage);
            Swal.fire('Error', errorMessage, 'error');
        }
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="warning" />
                <p className="mt-2">Memuat halaman pembayaran...</p>
            </Container>
        );
    }

    if (error && !checkoutData) { // Jika error terjadi sebelum checkoutData sempat di-load
        return (
            <Container className="py-5">
                <Alert variant="danger">{error}</Alert>
                <Button variant="secondary" onClick={() => navigate('/cart')}>Kembali ke Keranjang</Button>
            </Container>
        );
    }
    
    if (!checkoutData) { // Jika checkoutData null setelah loading selesai (misal, karena navigasi langsung)
        return (
            <Container className="py-5 text-center">
                <Alert variant="info">Tidak ada data checkout untuk ditampilkan.</Alert>
                <Button variant="warning" onClick={() => navigate('/cart')}>Kembali ke Keranjang</Button>
            </Container>
        );
    }


    return (
        <Container className="py-5 my-5">
            <Row className="justify-content-center">
                <Col md={8} lg={7}>
                    <Card className="shadow-lg">
                        <Card.Header as="h2" className="text-center bg-warning text-white">
                            <i className="bi bi-credit-card-fill me-2"></i>Konfirmasi Pembayaran
                        </Card.Header>
                        <Card.Body className="p-4 p-md-5">
                            {error && !processing && <Alert variant="danger" className="mb-4">{error}</Alert>}
                            
                            <h4 className="mb-3">Detail Pesanan</h4>
                            {checkoutData.items && checkoutData.items.length > 0 ? (
                                <ul className="list-group mb-4">
                                    {checkoutData.items.map(item => (
                                        <li key={item.product_id} className="list-group-item d-flex justify-content-between align-items-center">
                                            <div className="d-flex align-items-center">
                                                <ProductImageOptimized 
                                                    imageUrl={item.image_url || ''} // Pastikan ada fallback jika image_url tidak ada
                                                    productName={item.name}
                                                    className="me-3"
                                                    style={{width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px'}}
                                                />
                                                <span>{item.name} (x{item.quantity})</span>
                                            </div>
                                            <span>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                                        </li>
                                    ))}
                                    <li className="list-group-item d-flex justify-content-between align-items-center fw-bold bg-light">
                                        <span>Total Pembayaran</span>
                                        <span>Rp {checkoutData.totalAmount?.toLocaleString('id-ID')}</span>
                                    </li>
                                </ul>
                            ) : (
                                <p>Tidak ada item dalam pesanan.</p>
                            )}

                            <p><strong>Metode Pembayaran:</strong> {checkoutData.paymentMethod?.toUpperCase()}</p>
                            <p><strong>Tanggal Pesanan Harus Jadi:</strong> {new Date(checkoutData.desiredCompletionDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            
                            <hr className="my-4" />

                            <h4 className="mb-3">Unggah Bukti Pembayaran</h4>
                            <Form.Group controlId="paymentProofUpload" className="mb-3">
                                <Form.Label>Pilih file bukti pembayaran (JPG, PNG, PDF)</Form.Label>
                                <Form.Control 
                                    type="file" 
                                    onChange={handleFileChange} 
                                    accept=".jpg,.jpeg,.png,.pdf"
                                />
                            </Form.Group>

                            {previewProof && (
                                <div className="mb-3 text-center">
                                    <p className="mb-1">Preview Bukti:</p>
                                    {paymentProof && paymentProof.type.startsWith('image/') ? (
                                        <img src={previewProof} alt="Preview Bukti Pembayaran" style={{ maxWidth: '100%', maxHeight: '200px', border: '1px solid #ddd', borderRadius: '4px' }} />
                                    ) : (
                                        <p><i className="bi bi-file-earmark-pdf-fill text-danger me-2"></i>{paymentProof?.name} (PDF)</p>
                                    )}
                                </div>
                            )}

                            <div className="d-grid mt-4">
                                <Button 
                                    variant="success" 
                                    size="lg"
                                    onClick={handleSubmitPayment} 
                                    disabled={processing || !checkoutData || !checkoutData.items || checkoutData.items.length === 0}
                                >
                                    {processing ? (
                                        <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" /> Memproses...</>
                                    ) : (
                                        <><i className="bi bi-check-circle-fill me-2"></i>Konfirmasi & Bayar</>
                                    )}
                                </Button>
                            </div>
                            <div className="text-center mt-3">
                                <Button variant="outline-secondary" onClick={() => navigate('/cart')} disabled={processing}>
                                    <i className="bi bi-arrow-left me-2"></i>Kembali ke Keranjang
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default PaymentPage;
