import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cartService } from '../../services/cartService';
import { Container, Row, Col, Card, Button, Form, Modal, Spinner } from 'react-bootstrap';
import { FiMinus, FiPlus, FiShoppingCart, FiAlertTriangle } from 'react-icons/fi';
import Swal from 'sweetalert2';
import ProductImageOptimized from '../common/ProductImageOptimized';
import { normalizeImagePaths } from '../../utils/imageFixer';

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
    const [phoneNumberError, setPhoneNumberError] = useState(''); // State untuk error nomor telepon
    
    // Add these new state variables
    const [existingQuantities, setExistingQuantities] = useState({});
    const [showStockWarning, setShowStockWarning] = useState(false);
    const [stockWarningMessage, setStockWarningMessage] = useState('');
    const [stockWarningProductId, setStockWarningProductId] = useState(null);

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const data = await cartService.getCart();
            // Fix image paths to ensure they load correctly
            const fixedData = normalizeImagePaths(data);
            
            // Store existing quantities in state
            const quantities = {};
            fixedData.forEach(item => {
                quantities[item.product_id] = item.quantity;
            });
            setExistingQuantities(quantities);
            
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
            if (newQuantity < 1) newQuantity = 1;
            
            // Check if quantity exceeds stock
            const item = cartItems.find(item => item.product_id === productId);
            if (item && item.stock !== undefined && newQuantity > item.stock) {
                setStockWarningProductId(productId);
                setStockWarningMessage(`Stok produk ${item.name} hanya tersisa ${item.stock} item`);
                setShowStockWarning(true);
                return;
            }
            
            // Update optimistic UI first
            const updatedItems = cartItems.map(item => 
                item.product_id === productId 
                    ? { ...item, quantity: newQuantity }
                    : item
            );
            setCartItems(updatedItems);
            
            // Then make the API call
            await cartService.updateCartItem(productId, newQuantity);
            
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
            
            // Restore previous state on error
            fetchCart();
            
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: 'Gagal mengupdate jumlah item',
                text: err.response?.data?.error || 'Terjadi kesalahan saat mengupdate jumlah',
                showConfirmButton: false,
                timer: 3000
            });
        }
    };

    const handleQuantityInputChange = (productId, event, item) => {
        const value = event.target.value;
        
        // Allow empty value for temporary input
        if (value === '') {
            const updatedItems = cartItems.map(cartItem => 
                cartItem.product_id === productId 
                    ? { ...cartItem, quantity: value }
                    : cartItem
            );
            setCartItems(updatedItems);
            return;
        }

        // Convert to number and validate
        const numValue = parseInt(value, 10);
        if (isNaN(numValue) || numValue < 1) return;
        
        // Check if quantity exceeds stock
        if (item && item.stock !== undefined && numValue > item.stock) {
            setStockWarningProductId(productId);
            setStockWarningMessage(`Stok produk ${item.name} hanya tersisa ${item.stock} item`);
            setShowStockWarning(true);
            return;
        }
        
        // Update UI immediately for responsive feel
        const updatedItems = cartItems.map(cartItem => 
            cartItem.product_id === productId 
                ? { ...cartItem, quantity: numValue }
                : cartItem
        );
        setCartItems(updatedItems);
        
        // Debounce the actual API call to avoid too many requests
        const timeoutId = setTimeout(() => {
            handleQuantityChange(productId, numValue);
        }, 500);
        
        return () => clearTimeout(timeoutId);
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
        }        if (!phoneNumber) {
            Swal.fire({
                icon: 'error',
                title: 'Nomor Telepon Dibutuhkan',
                text: 'Silakan masukkan nomor telepon/WhatsApp yang dapat dihubungi',
                confirmButtonColor: '#ffc107'
            });
            return;
        }
        
        if (phoneNumber.length < 11) {
            Swal.fire({
                icon: 'error',
                title: 'Format Nomor Telepon Salah',
                text: 'Nomor telepon harus minimal 11 digit',
                confirmButtonColor: '#ffc107'
            });
            return;
        }

        if (deliveryOption === 'delivery' && !deliveryAddress) {
            Swal.fire({
                icon: 'error',
                title: 'Alamat Pengiriman Dibutuhkan',
                text: 'Silakan masukkan alamat pengiriman yang lengkap',
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
            {/* Stock Warning Animation */}
            <AnimatePresence>
                {showStockWarning && (
                    <motion.div 
                        className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowStockWarning(false)}
                    >
                        <motion.div 
                            className="bg-white rounded-xl p-6 m-4 max-w-sm shadow-xl"
                            initial={{ scale: 0.8, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 20 }}
                            transition={{ type: "spring", damping: 15 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center">
                                <motion.div 
                                    className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-100 text-red-500"
                                    initial={{ rotate: -10 }}
                                    animate={{ rotate: [0, -5, 5, -5, 5, 0] }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                >
                                    <FiAlertTriangle className="h-8 w-8" />
                                </motion.div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Peringatan Stok</h3>
                                <p className="text-gray-600 mb-4">{stockWarningMessage}</p>
                                <motion.button 
                                    className="w-full py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setShowStockWarning(false)}
                                >
                                    Mengerti
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Intro Animation with Title */}
            <AnimatePresence>
                <motion.div 
                    className="text-center mb-12"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                >
                    <motion.div
                        className="inline-block p-2 rounded-full bg-yellow-100 mb-4"
                        initial={{ rotate: -10, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                    >
                        <FiShoppingCart className="text-yellow-500 text-4xl" />
                    </motion.div>
                    
                    <motion.h1 
                        className="text-4xl font-bold mb-3 text-gray-800"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                    >
                        Keranjang Belanja
                    </motion.h1>
                    
                    <motion.p
                        className="text-gray-600 max-w-2xl mx-auto mb-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                    >
                        Kelola item dalam keranjang belanja Anda
                    </motion.p>
                </motion.div>
            </AnimatePresence>

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
                <motion.div 
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                >
                    <motion.div 
                        className="lg:col-span-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                    >
                        <motion.div 
                            className="bg-white rounded-lg shadow-md overflow-hidden mb-6"
                            initial={{ y: 20 }}
                            animate={{ y: 0 }}
                            transition={{ type: "spring", stiffness: 100, delay: 0.9 }}
                        >
                            <div className="p-4 border-b">
                                <motion.h2 
                                    className="text-lg font-medium"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3, delay: 1 }}
                                >
                                    Item dalam Keranjang
                                </motion.h2>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {cartItems.map((item, index) => (
                                <motion.div 
                                    key={item.product_id} 
                                    className="p-4 flex flex-col sm:flex-row gap-4"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ 
                                        duration: 0.4, 
                                        delay: 1.1 + (index * 0.1),
                                        ease: "easeOut"
                                    }}
                                >
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
                                                    <div className="flex items-center">
                                                        <button
                                                            onClick={() => handleQuantityChange(item.product_id, Math.max(1, item.quantity - 1))}
                                                            className="w-8 h-8 flex items-center justify-center bg-yellow-400 text-black rounded-l-lg hover:bg-yellow-500 transition-colors"
                                                        >
                                                            <FiMinus size={16} />
                                                        </button>
                                                        <input
                                                            type="text"
                                                            inputMode="numeric"
                                                            pattern="[0-9]*"
                                                            min="1"
                                                            value={item.quantity}
                                                            onChange={(e) => handleQuantityInputChange(item.product_id, e, item)}
                                                            onBlur={(e) => {
                                                                if (e.target.value === '' || parseInt(e.target.value, 10) < 1) {
                                                                    handleQuantityChange(item.product_id, 1);
                                                                }
                                                            }}
                                                            className="w-16 px-3 py-1 border-y border-gray-300 text-center focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                                        />
                                                        <button
                                                            onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                                                            className="w-8 h-8 flex items-center justify-center bg-yellow-400 text-black rounded-r-lg hover:bg-yellow-500 transition-colors"
                                                        >
                                                            <FiPlus size={16} />
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveItem(item.product_id)}
                                                        className="inline-flex items-center px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                    >
                                                        <i className="bi bi-trash-fill mr-1.5"></i>
                                                        Hapus
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold">
                                                    Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 1.2 }}
                    >
                        <motion.div 
                            className="bg-white rounded-lg shadow-md overflow-hidden sticky top-4"
                            initial={{ y: 20 }}
                            animate={{ y: 0 }}
                            transition={{ type: "spring", stiffness: 100, delay: 1.3 }}
                        >
                            <div className="p-4 border-b">
                                <motion.h2 
                                    className="text-lg font-medium"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3, delay: 1.4 }}
                                >
                                    Ringkasan Pesanan
                                </motion.h2>
                            </div>
                            <div className="space-y-3 mb-6 px-4">
                                <div className="flex justify-between text-gray-600 py-2">
                                    <span className="px-1">Subtotal</span>
                                    <span className="px-1">Rp {total.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 py-2">
                                    <span className="px-1">Pengiriman</span>
                                    <span className="text-green-600 px-1">Gratis</span>
                                </div>
                                <div className="border-t pt-3 mt-2">
                                    <div className="flex justify-between font-semibold text-lg py-2">
                                        <span className="px-1">Total</span>
                                        <span className="px-1">Rp {total.toLocaleString('id-ID')}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4">
                                <motion.button
                                    onClick={handleOpenCheckoutModal}
                                    className="w-full py-2 bg-yellow-400 text-gray-900 rounded-md hover:bg-yellow-500 transition-colors"
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3, delay: 1.5 }}
                                >
                                    Checkout
                                </motion.button>
                                <motion.p 
                                    className="text-xs text-gray-500 mt-2 text-center"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3, delay: 1.6 }}
                                >
                                    Semua transaksi dilindungi dan dienkripsi untuk keamanan Anda
                                </motion.p>
                            </div>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}

            {/* Modal Checkout */}
            <Modal 
                show={showCheckoutModal} 
                onHide={handleCloseCheckoutModal} 
                centered 
                size="lg" 
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                contentClassName="bg-white shadow-lg border-0"
                backdropClassName="bg-black opacity-50"
            >
                <motion.div 
                    className="p-6 bg-white rounded-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="flex justify-between items-center mb-6">
                        <motion.h3 
                            className="text-xl font-semibold"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                        >
                            Checkout
                        </motion.h3>
                        <motion.button 
                            onClick={handleCloseCheckoutModal} 
                            className="text-gray-500 hover:text-gray-700"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            &times;
                        </motion.button>
                    </div>
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
                        <div>
                            <label className="block text-gray-700 mb-2">Nomor Telepon/WhatsApp</label>
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => {
                                    // Hanya menerima input angka
                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                    setPhoneNumber(value);
                                    
                                    // Validasi nomor minimal 11 digit
                                    if (value && value.length < 11) {
                                        setPhoneNumberError('Nomor telepon harus minimal 11 digit');
                                    } else {
                                        setPhoneNumberError('');
                                    }
                                }}
                                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-yellow-400 ${phoneNumberError ? 'border-red-500' : ''}`}
                                placeholder="Contoh: 08123456789"
                            />
                            {phoneNumberError ? (
                                <p className="mt-1 text-sm text-red-500">{phoneNumberError}</p>
                            ) : (
                                <p className="mt-1 text-sm text-gray-500">
                                    {deliveryOption === 'delivery' 
                                        ? 'Nomor ini akan digunakan untuk konfirmasi pengiriman'
                                        : 'Nomor ini akan digunakan untuk konfirmasi pengambilan'}
                                </p>
                            )}
                        </div>

                        {deliveryOption === 'delivery' && (
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

                    <motion.div 
                        className="mt-6 flex gap-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                    >
                        <motion.button
                            onClick={handleCloseCheckoutModal}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            Batal
                        </motion.button>
                        <motion.button
                            onClick={handleConfirmPayment}
                            disabled={processing}
                            className="flex-1 px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            {processing ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-900 mr-2"></div>
                                    Memproses...
                                </div>
                            ) : (
                                'Konfirmasi Pembayaran'
                            )}
                        </motion.button>
                    </motion.div>
                </motion.div>
            </Modal>
        </div>
    );
};

export default CartList;