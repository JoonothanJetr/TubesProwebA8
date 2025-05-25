import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { orderService } from '../../services/orderService';
import { FaSort, FaSortUp, FaSortDown, FaFilter } from 'react-icons/fa';
import { FiPackage } from 'react-icons/fi';

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortField, setSortField] = useState('id');
    const [sortDirection, setSortDirection] = useState('desc');
    const [filters, setFilters] = useState({
        status: '',
        paymentStatus: '',
        dateRange: {
            start: '',
            end: ''
        }
    });

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const data = await orderService.getAllOrders();
            setOrders(data);
            setLoading(false);
        } catch (err) {
            setError('Gagal memuat pesanan');
            setLoading(false);
        }
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortedOrders = () => {
        const sortedOrders = [...orders].sort((a, b) => {
            let aValue = a[sortField];
            let bValue = b[sortField];

            if (sortField === 'order_date' || sortField === 'desired_completion_date') {
                aValue = new Date(aValue || '').getTime();
                bValue = new Date(bValue || '').getTime();
            }
            else if (sortField === 'total_amount') {
                aValue = Number(aValue);
                bValue = Number(bValue);
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
        return sortedOrders;
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleDateRangeChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            dateRange: {
                ...prev.dateRange,
                [field]: value
            }
        }));
    };

    const getFilteredOrders = () => {
        let filteredOrders = getSortedOrders();

        if (filters.status) {
            filteredOrders = filteredOrders.filter(order => 
                order.order_status.toLowerCase() === filters.status.toLowerCase()
            );
        }

        if (filters.paymentStatus) {
            filteredOrders = filteredOrders.filter(order => 
                order.payment_status.toLowerCase() === filters.paymentStatus.toLowerCase()
            );
        }

        if (filters.dateRange.start) {
            filteredOrders = filteredOrders.filter(order => 
                new Date(order.order_date) >= new Date(filters.dateRange.start)
            );
        }
        if (filters.dateRange.end) {
            filteredOrders = filteredOrders.filter(order => 
                new Date(order.order_date) <= new Date(filters.dateRange.end)
            );
        }

        return filteredOrders;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'diproses':
                return 'bg-blue-100 text-blue-800';
            case 'selesai':
                return 'bg-green-100 text-green-800';
            case 'dibatalkan':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'menunggu pembayaran':
                return 'bg-yellow-100 text-yellow-800';
            case 'pembayaran sudah dilakukan':
                return 'bg-green-100 text-green-800';
            case 'pembayaran dibatalkan':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getSortIcon = (field) => {
        if (sortField !== field) return <FaSort className="ml-1 inline text-gray-400" />;
        return sortDirection === 'asc' ? 
            <FaSortUp className="ml-1 inline text-yellow-500" /> : 
            <FaSortDown className="ml-1 inline text-yellow-500" />;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500" />
                    <p className="mt-4 text-gray-600">Memuat data pesanan...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r" role="alert">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    const columns = [
        { field: 'id', label: 'ID Pesanan' },
        { field: 'order_date', label: 'Tanggal Pesan' },
        { field: 'desired_completion_date', label: 'Tanggal Jadi' },
        { field: 'total_amount', label: 'Total' },
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Intro Animation with Title */}
            <AnimatePresence>
                <motion.div 
                    className="text-center mb-12"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                >
                    <motion.div
                        className="inline-block p-2 rounded-full bg-yellow-100 mb-4"
                        initial={{ rotate: -10, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                    >
                        <FiPackage className="text-yellow-500 text-4xl" />
                    </motion.div>
                    
                    <motion.h1 
                        className="text-4xl font-bold mb-3 text-gray-800"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                    >
                        Riwayat Pesanan
                    </motion.h1>
                    
                    <motion.p
                        className="text-gray-600 max-w-2xl mx-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                    >
                        Kelola dan pantau status pesanan pelanggan
                    </motion.p>
                </motion.div>
            </AnimatePresence>

            <motion.div 
                className="bg-white rounded-lg shadow-md overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
            >
                <div className="p-4 border-b">
                    <div className="flex items-center">
                        <motion.div
                            initial={{ rotate: -10, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            transition={{ delay: 0.8, duration: 0.3 }}
                        >
                            <FaFilter className="text-gray-500 mr-2" />
                        </motion.div>
                        <motion.h2 
                            className="text-lg font-medium"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.85, duration: 0.4 }}
                        >
                            Filter Pesanan
                        </motion.h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Status Pesanan</label>
                        <select
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 transition-colors"
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <option value="">Semua Status</option>
                            <option value="diproses">Diproses</option>
                            <option value="selesai">Selesai</option>
                            <option value="dibatalkan">Dibatalkan</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Status Pembayaran</label>
                        <select
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 transition-colors"
                            value={filters.paymentStatus}
                            onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                        >
                            <option value="">Semua Status</option>
                            <option value="menunggu pembayaran">Menunggu Pembayaran</option>
                            <option value="pembayaran sudah dilakukan">Pembayaran Sudah Dilakukan</option>
                            <option value="pembayaran dibatalkan">Pembayaran Dibatalkan</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Tanggal Mulai</label>
                        <input
                            type="date"
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 transition-colors"
                            value={filters.dateRange.start}
                            onChange={(e) => handleDateRangeChange('start', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Tanggal Akhir</label>
                        <input
                            type="date"
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 transition-colors"
                            value={filters.dateRange.end}
                            onChange={(e) => handleDateRangeChange('end', e.target.value)}
                        />
                    </div>
                </div>
            </motion.div>

            <motion.div 
                className="mt-8 bg-white shadow-md rounded-lg overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
            >
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <motion.thead 
                            className="bg-gray-50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: 1.3 }}
                        >
                            <tr>
                                {columns.map((column) => (
                                    <th
                                        key={column.field}
                                        scope="col"
                                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group"
                                        onClick={() => handleSort(column.field)}
                                    >
                                        <span className="flex items-center hover:text-gray-700">
                                            {column.label}
                                            {getSortIcon(column.field)}
                                        </span>
                                    </th>
                                ))}
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pembayaran</th>
                                <th scope="col" className="relative px-6 py-4">
                                    <span className="sr-only">Aksi</span>
                                </th>
                            </tr>
                        </motion.thead>
                        <motion.tbody 
                            className="bg-white divide-y divide-gray-200"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 1.4 }}
                        >
                            {getFilteredOrders().map((order, index) => (
                                <motion.tr 
                                    key={order.id} 
                                    className="hover:bg-gray-50"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ 
                                        duration: 0.3, 
                                        delay: 1.5 + (index * 0.05),
                                        ease: "easeOut"
                                    }}
                                    whileHover={{ backgroundColor: "#FAFAFA" }}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">#{order.id}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">
                                            {new Date(order.order_date || order.created_at).toLocaleDateString('id-ID', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">
                                            {order.desired_completion_date ? 
                                                new Date(order.desired_completion_date).toLocaleDateString('id-ID', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                }) : '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            Rp {Number(order.total_amount).toLocaleString('id-ID')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}`}>
                                            {order.order_status?.charAt(0).toUpperCase() + order.order_status?.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                                            {order.payment_status?.charAt(0).toUpperCase() + order.payment_status?.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link 
                                            to={`/orders/${order.id}`}
                                            className="text-yellow-600 hover:text-yellow-900 bg-yellow-50 px-3 py-1 rounded-md transition-colors duration-200"
                                        >
                                            Detail
                                        </Link>
                                    </td>
                                </motion.tr>
                            ))}
                            {getFilteredOrders().length === 0 && (
                                <motion.tr
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 1.5 }}
                                >
                                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                        Tidak ada pesanan yang sesuai dengan filter
                                    </td>
                                </motion.tr>
                            )}
                        </motion.tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};

export default OrderList;
