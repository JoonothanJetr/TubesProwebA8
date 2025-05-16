import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService'; // Sesuaikan path jika perlu
import { getPaymentProofUrl } from '../../utils/imageHelper'; // Only import getPaymentProofUrl
import toast from 'react-hot-toast';
import ProductImageOptimized from '../../components/common/ProductImageOptimized'; // Use optimized image component
import PaymentProofImage from '../../components/common/PaymentProofImage'; // Import PaymentProofImage
import { normalizeImagePaths } from '../../utils/imageFixer'; // Import image path fixer

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

    const orderStatusOptions = ['diproses', 'selesai', 'dibatalkan'];
    const paymentStatusOptions = ['menunggu pembayaran', 'pembayaran sudah dilakukan', 'pembayaran dibatalkan'];

    const fetchOrderDetails = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await orderService.getOrderById(orderId);
            
            // Fix image paths in order items
            if (data && data.items && Array.isArray(data.items)) {
                data.items = normalizeImagePaths(data.items);
            }
            
            setOrder(data);
            // Inisialisasi state form dengan data dari order
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
            // Panggil service untuk update
            const result = await orderService.adminUpdateOrder(orderId, updateData); 
            toast.dismiss(loadingToast);
            toast.success(result.message || 'Perubahan berhasil disimpan!');
            
            // Panggil fetchOrderDetails() lagi untuk mendapatkan data terbaru yang lengkap
            fetchOrderDetails(); 

        } catch (err) {
            toast.dismiss(loadingToast);
            const errorMessage = err?.response?.data?.error || 'Gagal menyimpan perubahan.';
            toast.error(errorMessage);
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
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Informasi Pelanggan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <p className="text-sm font-medium text-gray-500">ID User</p>
                    <p className="text-gray-900 font-semibold">{order.user_id}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500">Username</p>
                    <p className="text-gray-900">{order.username || <span className="italic text-gray-400">N/A</span>}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-gray-900">{order.email || <span className="italic text-gray-400">N/A</span>}</p>
                </div>
            </div>
        </div>
    );

    // Helper function untuk menampilkan item pesanan
    const renderOrderItems = () => (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Item Pesanan</h3>
            <ul className="divide-y divide-gray-200">
                {order.items?.map((item) => (
                    <li key={item.id} className="py-4 flex items-center space-x-4">
                        <ProductImageOptimized 
                            imageUrl={item.image_url} 
                            productName={item.name} 
                            className="w-20 h-20 rounded-md object-cover shadow-sm"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-lg font-semibold text-gray-900 truncate">{item.name}</p>
                            <p className="text-sm text-gray-600">{item.quantity} x Rp {Number(item.price).toLocaleString('id-ID')}</p>
                        </div>
                        <p className="text-lg font-semibold text-gray-800">Rp {(item.quantity * Number(item.price)).toLocaleString('id-ID')}</p>
                    </li>
                )) || <li className="py-4 text-center text-gray-500">Tidak ada item ditemukan.</li>}
            </ul>
            <div className="mt-6 pt-4 border-t border-gray-200 text-right">
                <p className="text-sm text-gray-600">Subtotal: <span className="font-semibold text-gray-800">Rp {Number(order.subtotal_amount || order.total_amount).toLocaleString('id-ID')}</span></p>
                <p className="text-xl font-bold text-gray-900 mt-1">Total Pesanan: <span className="text-indigo-600">Rp {Number(order.total_amount).toLocaleString('id-ID')}</span></p>
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-4 border-b border-gray-300">
                <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Kelola Pesanan <span className="text-indigo-600">#{order.id}</span></h1>
                <button 
                    onClick={() => navigate("/admin/orders")} 
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
                >
                    Kembali ke Daftar Pesanan
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {renderCustomerDetails()}
                    {renderOrderItems()}
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-3">Manajemen & Status</h3>
                        
                        <div className="space-y-4 mb-6">
                            <div>
                               <p className="text-sm font-medium text-gray-500">Tanggal Pesan</p>
                               <p className="text-gray-900 font-medium">{new Date(order.order_date || order.created_at).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}</p>
                            </div>
                            <div>
                               <p className="text-sm font-medium text-gray-500">Tanggal Jadi (Estimasi)</p>
                               <p className="text-gray-900 font-medium">{order.desired_completion_date ? 
                                new Date(order.desired_completion_date).toLocaleString('id-ID', { dateStyle: 'full' }) : 
                                <span className="italic text-gray-400">Belum ditentukan</span>}
                               </p>
                            </div>
                             <div>
                               <p className="text-sm font-medium text-gray-500">Metode Pembayaran</p>
                               <p className="text-gray-900 font-semibold"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${order.payment_method === 'cod' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{order.payment_method?.toUpperCase()}</span></p>
                            </div>
                        </div>

                        <div className="mb-6 pt-4 border-t border-gray-200">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bukti Pembayaran</label>
                            {renderPaymentProof()}
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); handleSaveChanges(); }}>
                            <div className="space-y-5">
                                <div>
                                    <label htmlFor="orderStatus" className="block text-sm font-medium text-gray-700 mb-1">Status Pesanan</label>
                                    <select
                                        id="orderStatus"
                                        name="orderStatus"
                                        value={selectedOrderStatus}
                                        onChange={(e) => setSelectedOrderStatus(e.target.value)}
                                        disabled={isUpdating}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm transition-colors duration-150"
                                    >
                                        {orderStatusOptions.map(status => (
                                            <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700 mb-1">Status Pembayaran</label>
                                    <select
                                        id="paymentStatus"
                                        name="paymentStatus"
                                        value={selectedPaymentStatus}
                                        onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                                        disabled={isUpdating || (order.payment_method === 'cod' && selectedPaymentStatus === 'pembayaran sudah dilakukan')} // Clarified operator precedence
                                        className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm transition-colors duration-150 ${(order.payment_method === 'cod' && selectedPaymentStatus === 'pembayaran sudah dilakukan') ? 'bg-gray-100 cursor-not-allowed' : ''}`} // Clarified operator precedence
                                    >
                                         {paymentStatusOptions.map(status => (
                                            <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                                        ))}
                                    </select>
                                    {order.payment_method === 'cod' && selectedPaymentStatus === 'pembayaran sudah dilakukan' && 
                                        <p className="text-xs text-gray-500 mt-1">Status pembayaran COD dikelola otomatis.</p>}
                                </div>

                                <div>
                                    <label htmlFor="adminComment" className="block text-sm font-medium text-gray-700 mb-1">Catatan Admin <span className="text-gray-400 font-normal">(Opsional)</span></label>
                                    <textarea
                                        id="adminComment"
                                        name="adminComment"
                                        rows={4}
                                        value={adminComment}
                                        onChange={(e) => setAdminComment(e.target.value)}
                                        disabled={isUpdating}
                                        className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2 transition-colors duration-150"
                                        placeholder="Tambahkan catatan untuk pelanggan atau internal..."
                                    />
                                </div>

                                <div className="pt-5">
                                     <button
                                        type="submit"
                                        disabled={isUpdating}
                                        className="w-full inline-flex justify-center py-2.5 px-4 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity duration-150"
                                    >
                                        {isUpdating ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Menyimpan...
                                            </>
                                        ) : (<>Simpan Perubahan</>)}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOrderDetail;