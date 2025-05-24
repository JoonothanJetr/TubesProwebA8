import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { cartService } from '../services/cartService';
import Swal from 'sweetalert2';
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
            }            const formData = new FormData();
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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
                <p className="mt-4 text-gray-600">Memuat halaman pembayaran...</p>
            </div>
        );
    }

    if (error && !checkoutData) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
                <button 
                    onClick={() => navigate('/cart')}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-300"
                >
                    Kembali ke Keranjang
                </button>
            </div>
        );
    }

    if (!checkoutData) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <div className="bg-blue-100 border-t border-b border-blue-500 text-blue-700 px-4 py-3" role="alert">
                    <p className="text-sm">Tidak ada data checkout untuk ditampilkan.</p>
                </div>
                <button 
                    onClick={() => navigate('/cart')}
                    className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded transition duration-300"
                >
                    Kembali ke Keranjang
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Detail Pembayaran</h2>
                
                {/* Detail Produk */}
                <div className="mb-6">
                    {checkoutData.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                            <ProductImageOptimized
                                imageUrl={item.image_url}
                                productName={item.name}
                                className="w-20 h-20 object-cover rounded-lg"
                            />
                            <div className="flex-grow">
                                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                                <p className="text-gray-600">Jumlah: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-gray-800">
                                    Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Rincian Pembayaran */}
                <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                    <h3 className="font-semibold text-gray-800 mb-2">Total Pembayaran</h3>
                    <p className="text-xl font-bold text-yellow-600">
                        Rp {checkoutData.totalAmount.toLocaleString('id-ID')}
                    </p>
                </div>

                {/* Informasi Pembayaran */}
                <div className="mb-6">
                    <p className="text-gray-700 mb-2">
                        <span className="font-semibold">Metode Pembayaran:</span> {checkoutData.paymentMethod.toUpperCase()}
                    </p>
                    <p className="text-gray-700 mb-2">
                        <span className="font-semibold">Tanggal Pesanan Harus Jadi:</span> {checkoutData.desiredCompletionDate}
                    </p>
                    {checkoutData.deliveryOption === 'delivery' && (
                        <>
                            <p className="text-gray-700 mb-2">
                                <span className="font-semibold">Alamat Pengiriman:</span> {checkoutData.deliveryAddress}
                            </p>
                            <p className="text-gray-700 mb-2">
                                <span className="font-semibold">Nomor Telepon:</span> {checkoutData.phoneNumber}
                            </p>
                        </>
                    )}
                </div>

                {/* Upload Bukti Pembayaran - Hanya tampilkan jika bukan COD */}
                {checkoutData.paymentMethod !== 'cod' && (
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-800 mb-4">Unggah Bukti Pembayaran</h3>
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
                    </div>
                )}

                {/* Info untuk COD */}
                {checkoutData.paymentMethod === 'cod' && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <p className="text-blue-700">
                            Untuk pembayaran COD (Cash on Delivery), Anda dapat melakukan pembayaran saat mengambil pesanan di lokasi.
                        </p>
                    </div>
                )}

                {/* Tombol Konfirmasi */}
                <button
                    onClick={handleSubmitPayment}
                    disabled={processing || (checkoutData.paymentMethod !== 'cod' && !paymentProof)}
                    className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-300
                        ${processing 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-green-500 hover:bg-green-600'}`}
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
                </button>
            </div>
        </div>
    );
};

export default PaymentPage;
