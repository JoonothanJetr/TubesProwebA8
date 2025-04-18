import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { orderService } from '../../services/orderService';

const OrderDetail = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchOrderDetails = useCallback(async () => {
        try {
            const data = await orderService.getOrderById(id);
            setOrder(data);
            setLoading(false);
        } catch (err) {
            setError('Gagal memuat detail pesanan');
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchOrderDetails();
    }, [fetchOrderDetails]);

    const handleCancelOrder = async () => {
        try {
            await orderService.cancelOrder(id);
            fetchOrderDetails();
        } catch (err) {
            alert('Gagal membatalkan pesanan');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!order) return <div>Pesanan tidak ditemukan</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                                {order.status}
                            </dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">
                                Status Pembayaran
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {order.payment_status}
                            </dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">
                                Total Pembayaran
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                Rp {order.total_amount.toLocaleString()}
                            </dd>
                        </div>
                    </dl>
                </div>
                <div className="px-4 py-5 sm:px-6">
                    <h4 className="text-lg font-medium text-gray-900">Item Pesanan</h4>
                    <ul className="mt-4 divide-y divide-gray-200">
                        {order.items.map((item) => (
                            <li key={item.id} className="py-4">
                                <div className="flex justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                                        <p className="text-sm text-gray-500">{item.quantity} x Rp {item.price.toLocaleString()}</p>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">
                                        Rp {(item.quantity * item.price).toLocaleString()}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail; 