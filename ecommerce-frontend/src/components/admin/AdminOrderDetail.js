import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService'; // Sesuaikan path jika perlu
import toast from 'react-hot-toast';

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
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
    if (!order) return <div className="text-center py-10">Detail pesanan tidak ditemukan.</div>;

    // Helper function untuk menampilkan detail pelanggan
    const renderCustomerDetails = () => (
        <div className="mb-6 p-4 border rounded">
            <h4 className="font-semibold text-lg mb-2">Informasi Pelanggan</h4>
            <p><strong>ID User:</strong> {order.user_id}</p>
            <p><strong>Username:</strong> {order.username || 'N/A'}</p>
            <p><strong>Email:</strong> {order.email || 'N/A'}</p>
        </div>
    );

    // Helper function untuk menampilkan item pesanan
    const renderOrderItems = () => (
        <div className="mb-6 p-4 border rounded">
            <h4 className="font-semibold text-lg mb-2">Item Pesanan</h4>
            <ul className="divide-y">
                {order.items?.map((item) => (
                    <li key={item.id} className="py-3 flex items-center">
                        <img 
                            src={`http://localhost:5000${item.image_url}`} 
                            alt={item.name} 
                            className="w-14 h-14 rounded object-cover mr-4"
                        />
                        <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-600">{item.quantity} x Rp {Number(item.price).toLocaleString('id-ID')}</p>
                        </div>
                        <p className="font-medium">Rp {(item.quantity * Number(item.price)).toLocaleString('id-ID')}</p>
                    </li>
                )) || <li>Tidak ada item ditemukan.</li>}
            </ul>
            <p className="text-right font-bold mt-3">Total: Rp {Number(order.total_amount).toLocaleString('id-ID')}</p>
        </div>
    );

    // Helper function untuk menampilkan bukti pembayaran (dengan kondisi COD)
    const renderPaymentProof = () => {
        // Jangan tampilkan jika metode COD
        if (order.payment_method === 'cod') {
            return <p className="text-gray-500">Metode pembayaran Cash on Delivery (COD).</p>;
        } 
        // Tampilkan pesan jika belum upload
        if (!order.payment_proof_url) {
            return <p className="text-gray-500">Pelanggan belum mengupload bukti pembayaran.</p>;
        }
        // Tampilkan link dan gambar jika sudah upload
        const proofUrl = order.payment_proof_url.startsWith('http') 
                         ? order.payment_proof_url 
                         : `http://localhost:5000${order.payment_proof_url}`;
        return (
            <div>
                <a href={proofUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 font-medium">
                    Lihat Bukti Pembayaran
                </a>
                <img src={proofUrl} alt="Bukti Bayar" className="mt-2 max-w-xs h-auto rounded border"/>
            </div>
        );
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">Kelola Pesanan #{order.id}</h1>
                <button 
                    onClick={() => navigate('/admin/orders')} 
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                     &larr; Kembali ke Daftar Pesanan
                </button>
            </div>

            {renderCustomerDetails()}
            {renderOrderItems()}

            {/* Form Manajemen Status dan Komentar */}
            <div className="p-4 border rounded mt-6">
                <h4 className="font-semibold text-lg mb-4">Manajemen Status & Catatan</h4>
                
                {/* Tambahkan Detail Order Dasar di sini */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 border-b pb-4">
                    <div>
                       <p className="text-sm font-medium text-gray-500">Tanggal Pesan</p>
                       <p>{new Date(order.order_date || order.created_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}</p>
                    </div>
                     <div>
                       <p className="text-sm font-medium text-gray-500">Metode Pembayaran</p>
                       <p className="font-semibold">{order.payment_method?.toUpperCase()}</p>
                    </div>
                </div>

                {/* Tampilkan Bukti Pembayaran di sini */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bukti Pembayaran</label>
                    {renderPaymentProof()}
                </div>

                {/* Update Status Pesanan */}
                <div className="mb-4">
                    <label htmlFor="orderStatus" className="block text-sm font-medium text-gray-700">Status Pesanan</label>
                    <select
                        id="orderStatus"
                        name="orderStatus"
                        value={selectedOrderStatus}
                        onChange={(e) => setSelectedOrderStatus(e.target.value)}
                        disabled={isUpdating}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                        {orderStatusOptions.map(status => (
                            <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                        ))}
                    </select>
                </div>

                {/* Update Status Pembayaran */}
                <div className="mb-4">
                    <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700">Status Pembayaran</label>
                    <select
                        id="paymentStatus"
                        name="paymentStatus"
                        value={selectedPaymentStatus}
                        onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                        disabled={isUpdating}
                        className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md`}
                    >
                         {paymentStatusOptions.map(status => (
                            <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                        ))}
                    </select>
                </div>

                {/* Komentar Admin */}
                <div className="mb-4">
                    <label htmlFor="adminComment" className="block text-sm font-medium text-gray-700">Catatan Admin (Opsional)</label>
                    <textarea
                        id="adminComment"
                        name="adminComment"
                        rows={3}
                        value={adminComment}
                        onChange={(e) => setAdminComment(e.target.value)}
                        disabled={isUpdating}
                        className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                        placeholder="Tambahkan catatan untuk pelanggan atau internal..."
                    />
                </div>

                {/* Tombol Simpan */}
                <div className="text-right">
                     <button
                        type="button"
                        onClick={handleSaveChanges}
                        disabled={isUpdating}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>

            </div>

        </div>
    );
};

export default AdminOrderDetail; 