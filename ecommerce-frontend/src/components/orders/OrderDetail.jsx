import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { getPaymentProofUrl } from '../../utils/imageHelper';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import ProductImageOptimized from '../common/ProductImageOptimized';
import { normalizeImagePaths } from '../../utils/imageFixer';

const OrderDetail = () => {
    const { id: orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchOrderDetails = useCallback(async () => {
        setError('');
        setLoading(true);
        try {
            const data = await orderService.getOrderById(orderId);
            
            // Fix image paths in order items
            if (data && data.items && Array.isArray(data.items)) {
                data.items = normalizeImagePaths(data.items);
            }
            
            console.log('Order data with fixed image paths:', data);
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

    const canCancelOrder = order?.order_status === 'diproses' && 
                          order?.payment_status === 'menunggu pembayaran';

    // eslint-disable-next-line no-unused-vars
    const handleCancelOrder = async () => {
        const result = await Swal.fire({            title: 'Batalkan Pesanan?',
            text: 'Pesanan yang sudah dibatalkan tidak dapat dikembalikan. Admin akan mencoba menghubungi nomor telepon Anda untuk konfirmasi pembatalan. Lanjutkan?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Ya, Batalkan',
            cancelButtonText: 'Tidak'
        });

        if (!result.isConfirmed) return;

        const loadingToast = toast.loading('Membatalkan pesanan...');

        try {
            await orderService.cancelOrder(orderId);
            toast.dismiss(loadingToast);
            toast.success('Pesanan berhasil dibatalkan');
            fetchOrderDetails();
        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error('Gagal membatalkan pesanan: ' + (err?.response?.data?.error || err.message));
        }
    };    if (loading) return <div className="text-center mt-10">Loading...</div>;
    if (error && !order) return <div className="text-center text-red-500 mt-10">{error}</div>;
    if (!order) return <div className="text-center mt-10">Pesanan tidak ditemukan</div>;

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
                        </div>                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            {order.delivery_address && (
                                <>
                                    <dt className="text-sm font-medium text-gray-500">
                                        Alamat Pengiriman
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        {order.delivery_address}
                                    </dd>
                                </>
                            )}
                        </div>
                        
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            {order.phone_number && (
                                <>
                                    <dt className="text-sm font-medium text-gray-500">
                                        Nomor Telepon
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        {order.phone_number}
                                    </dd>
                                </>
                            )}
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
                                    <a 
                                        href={getPaymentProofUrl(order.payment_proof_url)} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-indigo-600 hover:text-indigo-900 block mb-2"
                                    >
                                        Lihat Bukti Pembayaran (Tautan)
                                    </a>
                                    <img 
                                        src={getPaymentProofUrl(order.payment_proof_url)} 
                                        alt="Bukti Pembayaran" 
                                        className="max-w-xs h-auto rounded-md border border-gray-200 shadow-sm"
                                        onError={(e) => {
                                            console.error('Gagal memuat gambar bukti pembayaran:', e.target.src);
                                            e.target.alt = 'Gagal memuat gambar bukti pembayaran';
                                        }}
                                    />
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
                                <ProductImageOptimized 
                                    imageUrl={item.image_url}
                                    productName={item.name}
                                    className="w-16 h-16 rounded-md object-cover mr-4"
                                    style={{ width: '64px', height: '64px', objectFit: 'cover' }}
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

            {canCancelOrder && (
                <div className="mt-6">
                    <button
                        onClick={handleCancelOrder}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        <svg className="mr-2 -ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Batalkan Pesanan
                    </button>
                </div>
            )}
        </div>
    );
};

export default OrderDetail;