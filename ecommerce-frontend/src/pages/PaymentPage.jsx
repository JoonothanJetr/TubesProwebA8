import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { orderService } from '../services/orderService';
import { cartService } from '../services/cartService';
import Swal from 'sweetalert2';
import ProductImageOptimized from '../components/common/ProductImageOptimized';
import AnimatedPage from '../components/common/AnimatedPage';
import AnimatedSection from '../components/animations/AnimatedSection';
import AnimatedItem from '../components/animations/AnimatedItem';

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
                if (parsedData && Array.isArray(parsedData.items)) {
                    setCheckoutData(parsedData);
                } else {
                    setError('Data checkout tidak valid');
                }
            } catch (err) {
                setError('Gagal memuat data checkout');
                console.error('Error parsing checkout data:', err);
            }
        } else {
            setError('Tidak ada data checkout');
        }
        setLoading(false);
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError('Ukuran file terlalu besar (maksimal 5MB)');
                return;
            }
            if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
                setError('Format file tidak didukung (gunakan JPG atau PNG)');
                return;
            }
            setPaymentProof(file);
            setPreviewProof(URL.createObjectURL(file));
            setError('');
        }
    };

    const handleSubmitPayment = async () => {
        try {
            if (!checkoutData) {
                throw new Error('Data checkout tidak ditemukan.');
            }

            // Validasi khusus untuk non-COD
            if (checkoutData.paymentMethod !== 'cod' && !paymentProof) {
                throw new Error('Bukti pembayaran wajib diunggah untuk metode pembayaran non-COD.');
            }

            setProcessing(true);
            setError('');

            // Validate items data
            if (!checkoutData.items || !Array.isArray(checkoutData.items) || checkoutData.items.length === 0) {
                throw new Error('Data item pesanan tidak valid.');
            }
            
            const formData = new FormData();
            formData.append('paymentMethod', checkoutData.paymentMethod);
            formData.append('totalAmount', checkoutData.totalAmount.toString());
            formData.append('desiredCompletionDate', checkoutData.desiredCompletionDate);
            formData.append('items', JSON.stringify(checkoutData.items.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.price
            }))));
            formData.append('deliveryOption', checkoutData.deliveryOption || 'pickup');
            formData.append('phoneNumber', checkoutData.phoneNumber || '');
            
            // Hanya tambahkan alamat jika opsi pengiriman
            if (checkoutData.deliveryOption === 'delivery' && checkoutData.deliveryAddress) {
                formData.append('deliveryAddress', checkoutData.deliveryAddress);
            }
            
            // Hanya tambahkan bukti pembayaran jika bukan COD
            if (checkoutData.paymentMethod !== 'cod' && paymentProof) {
                formData.append('paymentProof', paymentProof);
            }

            // Gunakan service yang sesuai berdasarkan metode pembayaran
            const response = checkoutData.paymentMethod === 'cod' 
                ? await orderService.createOrderCOD(formData)
                : await orderService.createOrderWithProof(formData);
            
            await cartService.clearCart();
            localStorage.removeItem('checkoutData');
            setProcessing(false);

            Swal.fire({
                icon: 'success',
                title: checkoutData.paymentMethod === 'cod' ? 'Pesanan COD Berhasil Dibuat!' : 'Pembayaran Berhasil & Pesanan Dibuat!',
                text: response.message || 'Pesanan Anda telah berhasil dibuat dan akan segera diproses.',
                confirmButtonColor: '#28a745'
            }).then(() => {
                navigate('/orders');
            });

        } catch (err) {
            setProcessing(false);
            const errorMessage = err.response?.data?.error || err.message || 'Gagal membuat pesanan.';
            setError(errorMessage);
            Swal.fire('Error', errorMessage, 'error');
        }
    };

    return loading ? (
        <AnimatedPage variant="fadeIn">
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <motion.div 
                    className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                />
            </div>
        </AnimatedPage>
    ) : error ? (
        <AnimatedPage variant="fadeIn">
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <motion.div 
                    className="max-w-md w-full bg-white p-6 rounded-lg shadow-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.div 
                        className="text-center text-red-600 mb-4"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </motion.div>
                    <motion.h2 
                        className="text-xl font-semibold text-gray-800 mb-4 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        Terjadi Kesalahan
                    </motion.h2>
                    <motion.p 
                        className="text-gray-600 text-center mb-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        {error}
                    </motion.p>
                    <motion.button 
                        onClick={() => navigate('/')}
                        className="w-full py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    >
                        Kembali ke Beranda
                    </motion.button>
                </motion.div>
            </div>
        </AnimatedPage>
    ) : (
        <AnimatedPage variant="fadeIn" transition="slow">
            <div className="min-h-screen bg-gray-50 py-8">
                <motion.div 
                    className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="p-6">
                        <motion.h1 
                            className="text-2xl font-bold text-gray-800 mb-6"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            Konfirmasi Pembayaran
                        </motion.h1>

                        {/* Ringkasan Pesanan */}
                        <AnimatedSection variant="fadeIn" delay={0.2} className="mb-8">
                            <motion.h2 
                                className="text-lg font-semibold text-gray-800 mb-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                Ringkasan Pesanan
                            </motion.h2>

                            <motion.div 
                                className="space-y-4 max-h-96 overflow-y-auto pr-2"
                                variants={{
                                    hidden: { opacity: 0 },
                                    visible: { opacity: 1 }
                                }}
                                initial="hidden"
                                animate="visible"
                                transition={{ staggerChildren: 0.1, delayChildren: 0.3 }}
                            >
                                {checkoutData.items.map((item, index) => (
                                    <AnimatedItem key={index} index={index} className="flex items-center border-b border-gray-200 pb-4">
                                        <div className="w-20 h-20 flex-shrink-0 mr-4">
                                            <ProductImageOptimized
                                                imageUrl={item.image_url}
                                                productName={item.name}
                                                className="w-full h-full object-cover rounded-md"
                                            />
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="font-medium text-gray-800">{item.name}</h3>
                                            <p className="text-sm text-gray-500">Jumlah: {item.quantity}</p>
                                            <p className="text-sm text-gray-500">Harga: Rp {item.price?.toLocaleString('id-ID')}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-800">
                                                Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    </AnimatedItem>
                                ))}
                            </motion.div>

                            <motion.div 
                                className="mt-4 pt-4 border-t border-gray-200"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                            >
                                <div className="flex justify-between font-semibold text-gray-800">
                                    <span>Total Pembayaran:</span>
                                    <span>Rp {checkoutData.totalAmount?.toLocaleString('id-ID')}</span>
                                </div>
                            </motion.div>
                        </AnimatedSection>

                        {/* Informasi Pengiriman */}
                        <AnimatedSection variant="fadeIn" delay={0.3} className="mb-8 p-4 bg-gray-50 rounded-lg">
                            <motion.h3 
                                className="font-semibold text-gray-800 mb-3"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                Informasi Pengiriman
                            </motion.h3>
                            <p className="text-gray-700 mb-2">
                                <span className="font-medium">Metode Pengiriman:</span> {checkoutData.deliveryOption === 'delivery' ? 'Diantar' : 'Ambil Sendiri'}
                            </p>
                            <p className="text-gray-700 mb-2">
                                <span className="font-medium">Metode Pembayaran:</span> {checkoutData.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Transfer Bank'}
                            </p>
                            <p className="text-gray-700 mb-2">
                                <span className="font-medium">Tanggal Pengambilan/Pengiriman:</span> {checkoutData.desiredCompletionDate}
                            </p>
                            {checkoutData.deliveryOption === 'delivery' && (
                                <>
                                    <p className="text-gray-700 mb-2">
                                        <span className="font-medium">Alamat Pengiriman:</span> {checkoutData.deliveryAddress}
                                    </p>
                                    <p className="text-gray-700 mb-2">
                                        <span className="font-medium">Nomor Telepon:</span> {checkoutData.phoneNumber}
                                    </p>
                                </>
                            )}
                        </AnimatedSection>

                        {/* Upload Bukti Pembayaran - Hanya tampilkan jika bukan COD */}
                        {checkoutData.paymentMethod !== 'cod' && (
                            <AnimatedSection variant="fadeIn" delay={0.4} className="mb-6">
                                <motion.h3 
                                    className="font-semibold text-gray-800 mb-4"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    Unggah Bukti Pembayaran
                                </motion.h3>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,application/pdf"
                                        onChange={handleFileChange}
                                        className="w-full"
                                    />
                                    <p className="text-sm text-gray-500 mt-2">
                                        Pilih file bukti pembayaran (JPG, PNG, PDF)
                                    </p>
                                    {previewProof && (
                                        <img 
                                            src={previewProof} 
                                            alt="Preview bukti pembayaran" 
                                            className="mt-4 max-h-40 rounded-lg"
                                        />
                                    )}
                                </div>
                                {error && (
                                    <p className="text-red-500 text-sm mt-2">{error}</p>
                                )}
                            </AnimatedSection>
                        )}

                        {/* Info untuk COD */}
                        {checkoutData.paymentMethod === 'cod' && (
                            <AnimatedSection variant="fadeIn" delay={0.4} className="mb-6 p-4 bg-blue-50 rounded-lg">
                                <motion.p 
                                    className="text-blue-700"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    Untuk pembayaran COD (Cash on Delivery), Anda dapat melakukan pembayaran saat mengambil pesanan di lokasi.
                                </motion.p>
                            </AnimatedSection>
                        )}

                        {/* Tombol Konfirmasi */}
                        <motion.button
                            onClick={handleSubmitPayment}
                            disabled={processing || (checkoutData.paymentMethod !== 'cod' && !paymentProof)}
                            className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-300
                                ${processing 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-green-500 hover:bg-green-600'}`}
                            whileHover={!processing ? { scale: 1.03 } : {}}
                            whileTap={!processing ? { scale: 0.97 } : {}}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                        >
                            {processing ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Memproses...
                                </span>
                            ) : (
                                checkoutData.paymentMethod === 'cod' ? 'Konfirmasi Pesanan' : 'Konfirmasi & Bayar'
                            )}
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </AnimatedPage>
    );
};

export default PaymentPage;
