import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import toast from 'react-hot-toast';

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State untuk filter
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        paymentStatus: '', // Opsi: 'all', 'menunggu pembayaran', 'pembayaran sudah dilakukan', 'pembayaran dibatalkan'
        orderStatus: ''     // Opsi: 'all', 'diproses', 'selesai', 'dibatalkan'
    });

    // Opsi untuk dropdown filter
    const paymentStatusOptions = ['', 'menunggu pembayaran', 'pembayaran sudah dilakukan', 'pembayaran dibatalkan'];
    const orderStatusOptions = ['', 'diproses', 'selesai', 'dibatalkan'];

    // Menggunakan useCallback agar fetchAllOrders tidak dibuat ulang terus-menerus
    // kecuali jika filternya berubah (nanti kita panggil dengan filter baru)
    const fetchAllOrders = useCallback(async (currentFilters) => {
        setLoading(true);
        setError('');
        try {
            // Kirim filter sebagai query params ke service
            const data = await orderService.getAllOrders(currentFilters);
            setOrders(data);
        } catch (err) {
            setError('Gagal memuat data pesanan.');
            toast.error('Gagal memuat data pesanan: ' + (err?.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    }, []); // Dependency kosong karena kita akan panggil manual dengan filter    // Fetch data awal saat komponen dimuat
    useEffect(() => {
        fetchAllOrders(filters); // Panggil dengan filter awal (kosong)
    }, [fetchAllOrders, filters]); // Tambahkan filters ke dependency

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value
        }));
    };

    const applyFilters = () => {
        console.log("Applying filters:", filters);
        fetchAllOrders(filters); // Panggil fetch dengan filter saat ini
    };

    const resetFilters = () => {
        const initialFilters = {
            startDate: '',
            endDate: '',
            paymentStatus: '',
            orderStatus: ''
        };
        setFilters(initialFilters);
        fetchAllOrders(initialFilters); // Panggil fetch dengan filter kosong
    };

    // Fungsi helper untuk warna status (bisa disamakan dengan OrderList atau dipisah ke util)
    const getStatusColor = (status) => {
         switch (status?.toLowerCase()) {
            case 'diproses': return 'bg-blue-100 text-blue-800';
            case 'selesai': return 'bg-green-100 text-green-800';
            case 'dibatalkan': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentStatusColor = (status) => {
         switch (status?.toLowerCase()) {
            case 'menunggu pembayaran': return 'bg-yellow-100 text-yellow-800';
            case 'pembayaran sudah dilakukan': return 'bg-green-100 text-green-800';
            case 'pembayaran dibatalkan': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return <div className="text-center py-10">Loading pesanan...</div>;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-semibold mb-6">Manajemen Pesanan</h1>

            {/* Filter Section */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6 shadow">
                <h3 className="text-lg font-medium mb-3">Filter Pesanan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Filter Tanggal */}
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Dari Tanggal</label>
                        <input 
                            type="date" 
                            name="startDate" 
                            id="startDate" 
                            value={filters.startDate}
                            onChange={handleFilterChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Sampai Tanggal</label>
                        <input 
                            type="date" 
                            name="endDate" 
                            id="endDate" 
                            value={filters.endDate}
                            onChange={handleFilterChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            min={filters.startDate} // End date tidak bisa sebelum start date
                        />
                    </div>

                    {/* Filter Status Pembayaran */}
                    <div>
                        <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700">Status Pembayaran</label>
                        <select
                            id="paymentStatus"
                            name="paymentStatus"
                            value={filters.paymentStatus}
                            onChange={handleFilterChange}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option value="">Semua</option>
                            {paymentStatusOptions.filter(s => s).map(status => (
                                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                            ))}
                        </select>
                    </div>

                    {/* Filter Status Pesanan */}
                    <div>
                        <label htmlFor="orderStatus" className="block text-sm font-medium text-gray-700">Status Pesanan</label>
                        <select
                            id="orderStatus"
                            name="orderStatus"
                            value={filters.orderStatus}
                            onChange={handleFilterChange}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            <option value="">Semua</option>
                             {orderStatusOptions.filter(s => s).map(status => (
                                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="mt-4 flex justify-end space-x-3">
                    <button 
                        onClick={resetFilters}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Reset Filter
                    </button>
                     <button 
                        onClick={applyFilters}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        Terapkan Filter
                    </button>
                </div>
            </div>

            {/* Tabel Pesanan */}
            {error && <div className="text-center py-4 text-red-500">{error}</div>} {/* Tampilkan error di atas tabel */}
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pelanggan</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Pesanan</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Bayar</th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Aksi</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orders.length === 0 && !loading && (
                            <tr>
                                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">Tidak ada pesanan ditemukan{Object.values(filters).some(f => f) ? ' dengan filter ini' : ''}.</td>
                            </tr>
                        )}
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.username || order.user_id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(order.order_date || order.created_at).toLocaleDateString('id-ID')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    Rp {Number(order.total_amount).toLocaleString('id-ID')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.order_status)}`}>
                                        {order.order_status?.charAt(0).toUpperCase() + order.order_status?.slice(1)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
                                        {order.payment_status?.charAt(0).toUpperCase() + order.payment_status?.slice(1)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link to={`/admin/orders/${order.id}`} className="text-indigo-600 hover:text-indigo-900">
                                        Kelola
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* TODO: Tambahkan pagination jika perlu */}
        </div>
    );
};

export default OrderManagement; 