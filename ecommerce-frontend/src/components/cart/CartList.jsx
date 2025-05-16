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
    const [desiredCompletionDate, setDesiredCompletionDate] = useState('');
    const [deliveryOption, setDeliveryOption] = useState('pickup');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [phoneNumber, setPhoneNumber] = useState(''); // State untuk nomor telepon
    
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
        setDesiredCompletionDate('');
        setDeliveryOption('pickup');
        setDeliveryAddress('');
        setPhoneNumber(''); // Reset nomor telepon
    };

    const handlePaymentMethodChange = (e) => {
        setSelectedPaymentMethod(e.target.value);
    };

    const handleDeliveryOptionChange = (e) => {
        setDeliveryOption(e.target.value);
        if (e.target.value === 'pickup') {
            setDeliveryAddress('');
        }
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

        if (!desiredCompletionDate) {
            Swal.fire({
                icon: 'error',
                title: 'Tanggal Penyelesaian Dibutuhkan',
                text: 'Silakan pilih tanggal kapan pesanan Anda ingin diselesaikan',
                confirmButtonColor: '#ffc107'
            });
            return;
        }

        if (deliveryOption === 'delivery') {
            if (!phoneNumber) {
                Swal.fire({
                    icon: 'error',
                    title: 'Nomor Telepon Dibutuhkan',
                    text: 'Silakan masukkan nomor telepon/WhatsApp yang dapat dihubungi',
                    confirmButtonColor: '#ffc107'
                });
                return;
            }
            if (!deliveryAddress) {
                Swal.fire({
                    icon: 'error',
                    title: 'Alamat Pengiriman Dibutuhkan',
                    text: 'Silakan masukkan alamat pengiriman yang lengkap',
                    confirmButtonColor: '#ffc107'
                });
                return;
            }
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
            desiredCompletionDate: desiredCompletionDate,
            deliveryOption: deliveryOption,
            deliveryAddress: deliveryAddress,
            phoneNumber: phoneNumber // Tambahkan nomor telepon ke data checkout
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
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-8">Keranjang Belanja</h1>
            
            {cartItems.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                    <h2 className="text-xl text-gray-500 mb-4">Keranjang Anda kosong</h2>
                    <button 
                        onClick={() => navigate('/products')}
                        className="px-6 py-2 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 transition-colors"
                    >
                        Mulai Belanja
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Daftar Item */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="p-6">
                                <h2 className="text-lg font-semibold mb-4">Item dalam Keranjang</h2>
                                <div className="divide-y divide-gray-200">
                                    {cartItems.map((item) => (
                                        <div key={item.product_id} className="py-4 first:pt-0 last:pb-0">
                                            <div className="flex gap-4">
                                                <div className="w-24 h-24 flex-shrink-0">
                                                    <ProductImageOptimized
                                                        imageUrl={item.image_url}
                                                        productName={item.name}
                                                        className="w-full h-full object-cover rounded-lg"
                                                    />
                                                </div>
                                                <div className="flex-grow">
                                                    <h3 className="font-medium text-gray-900 mb-1">{item.name}</h3>
                                                    <p className="text-yellow-500 font-semibold mb-2">
                                                        Rp {item.price?.toLocaleString('id-ID')}
                                                    </p>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center border rounded-lg bg-gray-50">
                                                            <button
                                                                onClick={() => handleQuantityChange(item.product_id, Math.max(1, item.quantity - 1))}
                                                                className="px-3 py-1 text-gray-600 hover:bg-gray-200 rounded-l-lg transition-colors"
                                                            >
                                                                -
                                                            </button>
                                                            <span className="px-3 py-1 border-x bg-white">{item.quantity}</span>
                                                            <button
                                                                onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                                                                className="px-3 py-1 text-gray-600 hover:bg-gray-200 rounded-r-lg transition-colors"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleShowProductModal(item.product_id)}
                                                                className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                                            >
                                                                <i className="bi bi-eye-fill mr-1.5"></i>
                                                                Detail
                                                            </button>
                                                            <button
                                                                onClick={() => handleRemoveItem(item.product_id)}
                                                                className="inline-flex items-center px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                            >
                                                                <i className="bi bi-trash-fill mr-1.5"></i>
                                                                Hapus
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold">
                                                        Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ringkasan Pesanan */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
                            <h2 className="text-lg font-semibold mb-4">Ringkasan Pesanan</h2>
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>Rp {total.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Pengiriman</span>
                                    <span className="text-green-600">Gratis</span>
                                </div>
                                <div className="border-t pt-3">
                                    <div className="flex justify-between font-semibold text-lg">
                                        <span>Total</span>
                                        <span>Rp {total.toLocaleString('id-ID')}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleOpenCheckoutModal}
                                className="w-full py-3 bg-yellow-400 text-gray-900 rounded-lg font-medium hover:bg-yellow-500 transition-colors"
                            >
                                Checkout
                            </button>
                            <p className="mt-4 text-sm text-gray-500 text-center">
                                Semua transaksi dilindungi dan dienkripsi untuk keamanan Anda
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Checkout */}
            <Modal show={showCheckoutModal} onHide={handleCloseCheckoutModal} centered>
                <div className="bg-white rounded-lg shadow-xl">
                    <div className="p-6">
                        <h3 className="text-xl font-semibold mb-4">Checkout</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-700 mb-2">Opsi Pengiriman</label>
                                <select
                                    value={deliveryOption}
                                    onChange={handleDeliveryOptionChange}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"
                                >
                                    <option value="pickup">Ambil di Toko</option>
                                    <option value="delivery">Kirim ke Alamat</option>
                                </select>
                            </div>

                            {deliveryOption === 'delivery' && (
                                <>
                                    <div>
                                        <label className="block text-gray-700 mb-2">Nomor Telepon/WhatsApp</label>
                                        <input
                                            type="tel"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"
                                            placeholder="Contoh: 08123456789"
                                        />
                                        <p className="mt-1 text-sm text-gray-500">
                                            Nomor ini akan digunakan untuk konfirmasi pengiriman
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 mb-2">Alamat Pengiriman</label>
                                        <textarea
                                            value={deliveryAddress}
                                            onChange={(e) => setDeliveryAddress(e.target.value)}
                                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"
                                            rows="3"
                                            placeholder="Masukkan alamat lengkap untuk pengiriman"
                                        ></textarea>
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="block text-gray-700 mb-2">Metode Pembayaran</label>
                                <select
                                    value={selectedPaymentMethod}
                                    onChange={handlePaymentMethodChange}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"
                                >
                                    {paymentMethods.map((method) => (
                                        <option key={method.value} value={method.value}>
                                            {method.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">Tanggal Penyelesaian</label>
                                <input
                                    type="date"
                                    value={desiredCompletionDate}
                                    onChange={(e) => setDesiredCompletionDate(e.target.value)}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                                <div className="font-semibold text-gray-900 mb-2">Total Pembayaran</div>
                                <div className="text-2xl font-bold text-yellow-600">
                                    Rp {total.toLocaleString('id-ID')}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={handleCloseCheckoutModal}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleConfirmPayment}
                                disabled={processing}
                                className="flex-1 px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50"
                            >
                                {processing ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-900 mr-2"></div>
                                        Memproses...
                                    </div>
                                ) : (
                                    'Konfirmasi Pembayaran'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>

            <ProductModalOptimized
                productId={selectedProductId}
                show={showProductModal}
                onHide={handleCloseProductModal}
            />
        </div>
    );
};

export default CartList;