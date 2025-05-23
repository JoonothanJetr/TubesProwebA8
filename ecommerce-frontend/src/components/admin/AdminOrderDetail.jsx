import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService'; // Sesuaikan path jika perlu
import { getPaymentProofUrl } from '../../utils/imageHelper'; // Only import getPaymentProofUrl
import toast from 'react-hot-toast';
import ProductImageOptimized from '../common/ProductImageOptimized'; // Use optimized image component
import PaymentProofImage from '../common/PaymentProofImage'; // Import PaymentProofImage
import { normalizeImagePaths } from '../../utils/imageFixer'; // Import image path fixer
import { motion, AnimatePresence } from 'framer-motion';

const AdminOrderDetail = () => {
    const { id: orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State untuk form update
    const [selectedOrderStatus, setSelectedOrderStatus] = useState('');
    const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('');
    const [adminComment, setAdminComment] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [showSuccessNotif, setShowSuccessNotif] = useState(false);

    const orderStatusOptions = ['diproses', 'selesai', 'dibatalkan'];
    const paymentStatusOptions = ['menunggu pembayaran', 'pembayaran sudah dilakukan', 'pembayaran dibatalkan'];

    const fetchOrderDetails = useCallback(async () => {
        setError('');
        setLoading(true);
        try {
            const data = await orderService.getOrderById(orderId);
            // Fix image paths in order items
            if (data && data.items && Array.isArray(data.items)) {
                console.log('Order items before normalization:', data.items);
                data.items = normalizeImagePaths(data.items);
                console.log('Order items after normalization:', data.items);
            }
            setOrder(data);
            setSelectedOrderStatus(data.order_status || '');
            setSelectedPaymentStatus(data.payment_status || '');
            setAdminComment(data.admin_comment || '');
        } catch (err) {
            setError('Gagal memuat detail pesanan: ' + (err?.response?.data?.error || err.message));
            toast.error('Gagal memuat detail pesanan.');
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        fetchOrderDetails();
    }, [fetchOrderDetails]);

    const handleSaveChanges = async () => {
        setIsUpdating(true);
        const loadingToast = toast.loading('Menyimpan perubahan...');

        const updateData = {
            order_status: selectedOrderStatus,
            payment_status: selectedPaymentStatus,
            admin_comment: adminComment
        };

        try {
            const result = await orderService.adminUpdateOrder(orderId, updateData);
            
            toast.dismiss(loadingToast);
            toast.success('Perubahan berhasil disimpan!');
            
            // Show success notification
            setShowSuccessNotif(true);
            setTimeout(() => setShowSuccessNotif(false), 3000);

            // Fetch fresh order data to ensure we have all the details
            fetchOrderDetails();
        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error('Gagal menyimpan perubahan: ' + (err?.response?.data?.error || err.message));
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) return <div className="text-center py-10">Loading detail pesanan...</div>;
    if (error) return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="text-center p-8 bg-white shadow-xl rounded-lg">
                <h2 className="text-2xl font-semibold text-red-600 mb-4">Terjadi Kesalahan</h2>
                <p className="text-gray-700">{error}</p>
                <button 
                    onClick={() => navigate("/admin/orders")} 
                    className="mt-6 inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Kembali ke Daftar Pesanan
                </button>
            </div>
        </div>
    );
    if (!order) return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="text-center p-8 bg-white shadow-xl rounded-lg">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Pesanan Tidak Ditemukan</h2>
                <button 
                    onClick={() => navigate("/admin/orders")} 
                    className="mt-6 inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Kembali ke Daftar Pesanan
                </button>
            </div>
        </div>
    );

    // Helper function untuk menampilkan detail pelanggan
    const renderCustomerDetails = () => (
        <div className="bg-white shadow-lg rounded-xl p-6 mb-6 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
                <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Informasi Pelanggan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500 mb-1">ID User</p>
                    <p className="text-gray-900 font-semibold">{order.user_id}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500 mb-1">Username</p>
                    <p className="text-gray-900">{order.username || <span className="italic text-gray-400">N/A</span>}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                    <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                    <p className="text-gray-900">{order.email || <span className="italic text-gray-400">N/A</span>}</p>
                </div>
            </div>
        </div>
    );

    // Helper function untuk menampilkan item pesanan
    const renderOrderItems = () => (
        <div className="bg-white shadow-lg rounded-xl p-6 mb-6 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
                <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Item Pesanan
            </h3>
            <div className="space-y-4">
                {order.items?.map((item) => (
                    <div key={item.id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-150">
                        <div className="flex items-center space-x-4">
                            <ProductImageOptimized 
                                imageUrl={item.image_url} 
                                productName={item.name} 
                                className="w-24 h-24 rounded-lg object-cover shadow-md hover:shadow-lg transition-shadow duration-200"
                            />
                            <div className="flex-1">
                                <h4 className="text-lg font-semibold text-gray-900">{item.name}</h4>
                                <div className="flex items-center space-x-2 mt-2">
                                    <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">
                                        {item.quantity} item
                                    </span>
                                    <span className="text-gray-600">
                                        × Rp {Number(item.price).toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-semibold text-indigo-600">
                                    Rp {(item.quantity * Number(item.price)).toLocaleString('id-ID')}
                                </p>
                            </div>
                        </div>
                    </div>
                )) || (
                    <div className="text-center py-8">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="mt-4 text-gray-500">Tidak ada item dalam pesanan ini</p>
                    </div>
                )}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex flex-col items-end space-y-2">
                    <p className="text-sm text-gray-600">
                        Subtotal: <span className="font-semibold text-gray-800">Rp {Number(order.subtotal_amount || order.total_amount).toLocaleString('id-ID')}</span>
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                        Total Pesanan: <span className="text-indigo-600">Rp {Number(order.total_amount).toLocaleString('id-ID')}</span>
                    </p>
                </div>
            </div>
        </div>
    );

    // Helper function untuk menampilkan bukti pembayaran (dengan kondisi COD)
    const renderPaymentProof = () => {
        if (order.payment_method === 'cod') {
            return <p className="text-gray-600 bg-gray-100 px-3 py-2 rounded-md text-sm">Metode pembayaran Cash on Delivery (COD).</p>;
        } 
        if (!order.payment_proof_url) {
            return <p className="text-gray-500 bg-yellow-50 px-3 py-2 rounded-md text-sm">Pelanggan belum mengupload bukti pembayaran.</p>;
        }
        const proofUrl = getPaymentProofUrl(order.payment_proof_url);
        return (
            <div>
                <a href={proofUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 font-medium">
                    Lihat Bukti Pembayaran
                </a>
                <PaymentProofImage 
                    imageUrl={order.payment_proof_url}
                    orderNumber={order.id}
                    className="mt-3 max-w-sm h-auto rounded-lg border shadow-sm hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                    onClick={() => window.open(proofUrl, '_blank')}
                />
            </div>
        );
    };

    return (
        <div className="relative">
            <AnimatePresence>
                {showSuccessNotif && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg"
                    >
                        <div className="flex items-center space-x-2">
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                            <span>Perubahan berhasil disimpan!</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {loading ? (
                <div className="text-center py-10">Loading detail pesanan...</div>
            ) : error ? (
                <div className="flex justify-center items-center h-screen bg-gray-100">
                    <div className="text-center p-8 bg-white shadow-xl rounded-lg">
                        <h2 className="text-2xl font-semibold text-red-600 mb-4">Terjadi Kesalahan</h2>
                        <p className="text-gray-700">{error}</p>
                        <button 
                            onClick={() => navigate("/admin/orders")} 
                            className="mt-6 inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Kembali ke Daftar Pesanan
                        </button>
                    </div>
                </div>
            ) : !order ? (
                <div className="flex justify-center items-center h-screen bg-gray-100">
                    <div className="text-center p-8 bg-white shadow-xl rounded-lg">
                        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Pesanan Tidak Ditemukan</h2>
                        <button 
                            onClick={() => navigate("/admin/orders")} 
                            className="mt-6 inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Kembali ke Daftar Pesanan
                        </button>
                    </div>
                </div>
            ) : (
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-4 border-b border-gray-300">
                        <h1 className="text-3xl font-extrabold text-gray-800 mb-4 md:mb-0 flex items-center">
                            <span className="text-indigo-600 mr-2">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </span>
                            Kelola Pesanan <span className="text-indigo-600">#{order.id}</span>
                        </h1>
                        <button 
                            onClick={() => navigate("/admin/orders")} 
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-150"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Kembali ke Daftar Pesanan
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            {renderCustomerDetails()}
                            {renderOrderItems()}
                        </div>

                        <div className="lg:col-span-1">
                            <div className="bg-white shadow-lg rounded-xl p-6 sticky top-8">
                                <h3 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    Manajemen & Status
                                </h3>
                                
                                <div className="space-y-4 mb-6">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                       <p className="text-sm font-medium text-gray-500 mb-1">Tanggal Pesan</p>
                                       <p className="text-gray-900 font-medium">{new Date(order.order_date || order.created_at).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}</p>
                                    </div>                                    <div className="bg-gray-50 p-4 rounded-lg">
                                       <p className="text-sm font-medium text-gray-500 mb-1">Tanggal Jadi (Estimasi)</p>
                                       <p className="text-gray-900 font-medium">{order.desired_completion_date ? 
                                        new Date(order.desired_completion_date).toLocaleString('id-ID', { dateStyle: 'full' }) : 
                                        <span className="italic text-gray-400">Belum ditentukan</span>}
                                       </p>
                                    </div>

                                    {order.delivery_address && (
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-sm font-medium text-gray-500 mb-1">Alamat Pengiriman</p>
                                            <p className="text-gray-900">{order.delivery_address}</p>
                                        </div>
                                    )}

                                    {order.phone_number && (
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-sm font-medium text-gray-500 mb-1">Nomor Telepon</p>
                                            <p className="text-gray-900">{order.phone_number}</p>
                                        </div>
                                    )}

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                       <p className="text-sm font-medium text-gray-500 mb-1">Metode Pembayaran</p>
                                       <p className="text-gray-900">
                                            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                                                order.payment_method === 'cod' 
                                                    ? 'bg-green-100 text-green-700' 
                                                    : 'bg-blue-100 text-blue-700'
                                            }`}>
                                                {order.payment_method?.toUpperCase()}
                                            </span>
                                       </p>
                                    </div>
                                </div>

                                <div className="mb-6 pt-4 border-t border-gray-200">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Bukti Pembayaran</label>
                                    {renderPaymentProof()}
                                </div>

                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSaveChanges();
                                }} className="space-y-6">
                                    <div className="space-y-5">
                                        <div>
                                            <label htmlFor="orderStatus" className="block text-sm font-medium text-gray-700 mb-2">Status Pesanan</label>
                                            <select
                                                id="orderStatus"
                                                name="orderStatus"
                                                value={selectedOrderStatus}
                                                onChange={(e) => setSelectedOrderStatus(e.target.value)}
                                                disabled={isUpdating}
                                                className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg shadow-sm transition-all duration-150"
                                            >
                                                {orderStatusOptions.map(status => (
                                                    <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700 mb-2">Status Pembayaran</label>                                            <select
                                                id="paymentStatus"
                                                name="paymentStatus"
                                                value={selectedPaymentStatus}
                                                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                                                disabled={isUpdating}
                                                className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-lg shadow-sm transition-all duration-150"
                                            >
                                                 {paymentStatusOptions.map(status => (
                                                    <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                                                ))}
                                            </select>                                            {order.payment_method === 'cod' && 
                                                <p className="text-xs text-gray-500 mt-2 italic">Status pembayaran dapat diubah untuk pesanan COD.</p>}
                                        </div>

                                        <div>
                                            <label htmlFor="adminComment" className="block text-sm font-medium text-gray-700 mb-2">
                                                Catatan Admin <span className="text-gray-400 font-normal">(Opsional)</span>
                                            </label>
                                            <textarea
                                                id="adminComment"
                                                name="adminComment"
                                                rows={4}
                                                value={adminComment}
                                                onChange={(e) => setAdminComment(e.target.value)}
                                                disabled={isUpdating}
                                                className="mt-1 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-lg p-3 transition-all duration-150 resize-none"
                                                placeholder="Tambahkan catatan untuk pelanggan atau internal..."
                                            />
                                        </div>

                                        <div className="pt-5">
                                             <button
                                                type="submit"
                                                disabled={isUpdating}
                                                className="w-full inline-flex justify-center items-center py-3 px-4 border border-transparent shadow-sm text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150"
                                            >
                                                {isUpdating ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Menyimpan...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Simpan Perubahan
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrderDetail;