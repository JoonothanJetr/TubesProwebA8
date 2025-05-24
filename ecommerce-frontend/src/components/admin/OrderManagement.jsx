import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import AnimatedPage from '../common/AnimatedPage';

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        paymentStatus: '',
        orderStatus: '',
        customerId: '',
        dateRange: {
            start: '',
            end: ''
        }
    });
    const [sortOption, setSortOption] = useState('order_date-desc');

    const paymentStatusOptions = ['', 'menunggu pembayaran', 'pembayaran sudah dilakukan', 'pembayaran dibatalkan'];
    const orderStatusOptions = ['', 'diproses', 'selesai', 'dibatalkan'];

    const fetchAllOrders = useCallback(async (currentFilters) => {
        setLoading(true);
        setError('');
        try {
            const data = await orderService.getAllOrdersAdmin(currentFilters);
            setOrders(data || []);
        } catch (err) {
            setError('Gagal memuat data pesanan.');
            toast.error('Gagal memuat data pesanan: ' + (err?.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllOrders(filters);
    }, [fetchAllOrders]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFilters(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFilters(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSortChange = (e) => {
        setSortOption(e.target.value);
    };

    const applyFiltersAndSort = () => {
        fetchAllOrders(filters);
    };

    const resetFiltersAndSort = () => {
        const initialFilters = {
            paymentStatus: '',
            orderStatus: '',
            customerId: '',
            dateRange: {
                start: '',
                end: ''
            }
        };
        setFilters(initialFilters);
        setSortOption('order_date-desc');
        fetchAllOrders(initialFilters);
    };

    const handleDeleteHistoryClick = async () => {
        const { isConfirmed } = await Swal.fire({
            title: 'Konfirmasi Penghapusan',
            text: 'Apakah Anda yakin ingin menghapus semua riwayat pesanan dengan filter yang dipilih? Tindakan ini tidak dapat dibatalkan.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
            showLoaderOnConfirm: true,
            preConfirm: async () => {
                try {
                    await orderService.deleteOrderHistory(filters);
                    return { success: true };
                } catch (error) {
                    Swal.showValidationMessage(
                        `Gagal menghapus: ${error.message}`
                    );
                }
            }
        });

        if (isConfirmed) {
            await fetchAllOrders(filters);
            toast.success('Riwayat pesanan berhasil dihapus');
        }
    };

    const processedOrders = useMemo(() => {
        let filteredOrders = [...orders];

        // Apply filters
        if (filters.paymentStatus) {
            filteredOrders = filteredOrders.filter(order => 
                order.payment_status?.toLowerCase() === filters.paymentStatus.toLowerCase()
            );
        }

        if (filters.orderStatus) {
            filteredOrders = filteredOrders.filter(order => 
                order.order_status?.toLowerCase() === filters.orderStatus.toLowerCase()
            );
        }

        // Date range filter
        if (filters.dateRange.start) {
            const startDate = new Date(filters.dateRange.start);
            filteredOrders = filteredOrders.filter(order =>
                new Date(order.order_date || order.created_at) >= startDate
            );
        }
        if (filters.dateRange.end) {
            const endDate = new Date(filters.dateRange.end);
            endDate.setHours(23, 59, 59, 999); // End of the day
            filteredOrders = filteredOrders.filter(order =>
                new Date(order.order_date || order.created_at) <= endDate
            );
        }

        // Apply sorting
        filteredOrders.sort((a, b) => {
            switch (sortOption) {
                case 'order_date-asc':
                    return new Date(a.order_date || a.created_at) - new Date(b.order_date || b.created_at);
                case 'completion_date-asc':
                    const dateA = a.desired_completion_date ? new Date(a.desired_completion_date) : null;
                    const dateB = b.desired_completion_date ? new Date(b.desired_completion_date) : null;
                    if (dateA === null && dateB === null) return 0;
                    if (dateA === null) return 1;
                    if (dateB === null) return -1;
                    return dateA - dateB;
                case 'total-desc':
                    return Number(b.total_amount) - Number(a.total_amount);
                case 'total-asc':
                    return Number(a.total_amount) - Number(b.total_amount);
                case 'order_date-desc':
                default:
                    return new Date(b.order_date || b.created_at) - new Date(a.order_date || a.created_at);
            }
        });
        return filteredOrders;
    }, [orders, sortOption, filters]);

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

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="text-center">
                <svg className="animate-spin h-10 w-10 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-2 text-lg font-medium text-gray-700">Loading pesanan...</p>
            </div>
        </div>
    );
    if (error) return <div className="text-center py-10 text-red-600 bg-red-50 p-4 rounded-md shadow-md">Error: {error}</div>;

    return (
        <AnimatedPage>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="sm:flex sm:items-center sm:justify-between mb-6 pb-4 border-b border-gray-200">
                    <h1 className="text-3xl font-bold leading-tight text-gray-900">Manajemen Pesanan</h1>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6">Filter & Urutkan Pesanan</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Status Filters */}
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700 mb-1">Status Pembayaran</label>
                                <select
                                    id="paymentStatus"
                                    name="paymentStatus"
                                    value={filters.paymentStatus}
                                    onChange={handleFilterChange}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
                                >
                                    <option value="">Semua Status</option>
                                    {paymentStatusOptions.filter(s => s).map(status => (
                                        <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="orderStatus" className="block text-sm font-medium text-gray-700 mb-1">Status Pesanan</label>
                                <select
                                    id="orderStatus"
                                    name="orderStatus"
                                    value={filters.orderStatus}
                                    onChange={handleFilterChange}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
                                >
                                    <option value="">Semua Status</option>
                                    {orderStatusOptions.filter(s => s).map(status => (
                                        <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Date Range Filters */}
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Dari Tanggal</label>
                                <input
                                    type="date"
                                    id="startDate"
                                    name="dateRange.start"
                                    value={filters.dateRange.start}
                                    onChange={handleFilterChange}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
                                <input
                                    type="date"
                                    id="endDate"
                                    name="dateRange.end"
                                    value={filters.dateRange.end}
                                    onChange={handleFilterChange}
                                    min={filters.dateRange.start}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
                                />
                            </div>
                        </div>
                        
                        {/* Sorting */}
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="sortOption" className="block text-sm font-medium text-gray-700 mb-1">Urutkan Berdasarkan</label>
                                <select
                                    id="sortOption"
                                    name="sortOption"
                                    value={sortOption}
                                    onChange={handleSortChange}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
                                >
                                    <option value="order_date-desc">Tanggal Pesan (Terbaru)</option>
                                    <option value="order_date-asc">Tanggal Pesan (Terlama)</option>
                                    <option value="completion_date-desc">Tanggal Jadi (Terjauh)</option>
                                    <option value="completion_date-asc">Tanggal Jadi (Terdekat)</option>
                                    <option value="total-desc">Total (Tertinggi)</option>
                                    <option value="total-asc">Total (Terendah)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 border-t pt-6 flex items-center justify-between">
                        <button 
                            onClick={handleDeleteHistoryClick}
                            className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Hapus Riwayat Pesanan
                        </button>
                        <div className="flex space-x-3">
                            <button 
                                onClick={resetFiltersAndSort}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Reset
                            </button>
                            <button 
                                onClick={applyFiltersAndSort}
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Terapkan
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table container with horizontal scroll functionality */}
                <div className="shadow-lg border-b border-gray-200 sm:rounded-lg overflow-hidden">
                    <div className="relative bg-white overflow-hidden">
                        {/* Table wrapper with hover effects */}
                        <div className="overflow-x-auto relative group">
                            {/* Shadow indicators for scrollable content */}
                            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 z-10"></div>
                            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 z-10"></div>
                            
                            {/* Table with minimum width to prevent layout breaking */}
                            <table className="min-w-[900px] w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Pelanggan</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tgl. Pesan</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tgl. Jadi</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status Pesanan</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status Bayar</th>
                                        <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {processedOrders.length === 0 && !loading && (
                                        <tr>
                                            <td colSpan="8" className="px-6 py-10 text-center text-gray-500 text-lg">
                                                Tidak ada pesanan ditemukan{Object.values(filters).some(f => typeof f === 'string' ? f : Object.values(f).some(v => v)) ? ' dengan filter ini' : ''}.
                                            </td>
                                        </tr>
                                    )}
                                    {processedOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">#{order.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.username || order.user_id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(order.order_date || order.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {order.desired_completion_date ? 
                                                 new Date(order.desired_completion_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }) : 
                                                 <span className="text-gray-400 italic">N/A</span>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">
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
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                <Link 
                                                    to={`/admin/orders/${order.id}`} 
                                                    className="text-indigo-600 hover:text-indigo-900 inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-indigo-50 hover:bg-indigo-100 border border-indigo-300 shadow-sm"
                                                    title="Kelola Pesanan"
                                                >
                                                    Kelola
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default OrderManagement;
