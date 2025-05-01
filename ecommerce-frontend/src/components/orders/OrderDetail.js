import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import toast from 'react-hot-toast';

const OrderDetail = () => {
    const { id: orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    const fetchOrderDetails = useCallback(async () => {
        setError('');
        setSelectedFile(null);
        setLoading(true);
        try {
            const data = await orderService.getOrderById(orderId);
            setOrder(data);
        } catch (err) {
            setError('Gagal memuat detail pesanan: ' + (err?.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        fetchOrderDetails();
    }, [fetchOrderDetails]);

    // eslint-disable-next-line no-unused-vars
    const handleCancelOrder = async () => {
        try {
            await orderService.cancelOrder(orderId);
            fetchOrderDetails();
        } catch (err) {
            alert('Gagal membatalkan pesanan');
        }
    };

    const handleFileChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleTriggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleUploadProof = async () => {
        if (!selectedFile) {
            toast.error('Pilih file bukti pembayaran terlebih dahulu.');
            return;
        }

        const formData = new FormData();
        formData.append('paymentProof', selectedFile);

        const loadingToast = toast.loading('Mengupload bukti pembayaran...');

        try {
            const result = await orderService.uploadPaymentProof(orderId, formData);
            toast.dismiss(loadingToast);
            toast.success(result.message || 'Bukti pembayaran berhasil diupload!');
            fetchOrderDetails();
        } catch (err) {
            toast.dismiss(loadingToast);
            const errorMessage = err?.response?.data?.error || 'Gagal mengupload bukti pembayaran.';
            toast.error(errorMessage);
        }
    };

    if (loading) return <div className="text-center mt-10">Loading...</div>;
    if (error && !order) return <div className="text-center text-red-500 mt-10">{error}</div>;
    if (!order) return <div className="text-center mt-10">Pesanan tidak ditemukan</div>;

    const canUploadProof = order.order_status === 'diproses' && 
                           order.payment_status === 'menunggu pembayaran' && 
                           order.payment_method !== 'cod';

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <button 
                onClick={() => navigate(-1)}
                className="mb-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                 &larr; Kembali
            </button>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Detail Pesanan
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        ID Pesanan: {order.id}
                    </p>
                </div>
                <div className="border-t border-gray-200">
                    <dl>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">
                                Status Pesanan
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {order.order_status?.charAt(0).toUpperCase() + order.order_status?.slice(1)}
                            </dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">
                                Status Pembayaran
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {order.payment_status?.charAt(0).toUpperCase() + order.payment_status?.slice(1)}
                            </dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">
                                Total Pembayaran
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                Rp {Number(order.total_amount).toLocaleString('id-ID')}
                            </dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">
                                Tanggal Pesanan
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {new Date(order.order_date || order.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                            </dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">
                                Metode Pembayaran
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {order.payment_method?.toUpperCase()}
                            </dd>
                        </div>
                        {order.admin_comment && (
                            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">
                                    Catatan Admin
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-wrap">
                                    {order.admin_comment}
                                </dd>
                            </div>
                        )}
                        {order.payment_proof_url && (
                            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500">
                                    Bukti Pembayaran
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    <a href={order.payment_proof_url.startsWith('http') ? order.payment_proof_url : `http://localhost:5000${order.payment_proof_url}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900">
                                        Lihat Bukti Pembayaran
                                    </a>
                                </dd>
                            </div>
                        )}
                    </dl>
                </div>
                <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
                    <h4 className="text-lg font-medium text-gray-900">Item Pesanan</h4>
                    <ul className="mt-4 divide-y divide-gray-200">
                        {order.items.map((item) => (
                            <li key={item.id} className="py-4 flex items-center">
                                <img 
                                    src={`http://localhost:5000${item.image_url}`} 
                                    alt={item.name} 
                                    className="w-16 h-16 rounded-md object-cover mr-4"
                                />
                                <div className="flex-1 flex justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                        <p className="text-sm text-gray-500">{item.quantity} x Rp {Number(item.price).toLocaleString('id-ID')}</p>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">
                                        Rp {(item.quantity * Number(item.price)).toLocaleString('id-ID')}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {canUploadProof && (
                <div className="mt-6 p-4 border border-dashed border-gray-300 rounded-md">
                    <h4 className="text-md font-medium text-gray-700 mb-2">Upload Bukti Pembayaran</h4>
                    <input 
                        type="file" 
                        accept="image/png, image/jpeg, image/jpg" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={handleTriggerFileInput}
                        className="mb-2 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Pilih File Gambar...
                    </button>
                    
                    {selectedFile && (
                        <div className="text-sm text-gray-600 mb-3">
                            File dipilih: {selectedFile.name}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={handleUploadProof}
                        disabled={!selectedFile}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Upload Bukti
                    </button>
                </div>
            )}
        </div>
    );
};

export default OrderDetail; 