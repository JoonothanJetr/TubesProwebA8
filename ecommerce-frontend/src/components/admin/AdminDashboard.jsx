import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../utils/apiHelper';
import toast from 'react-hot-toast';
import RevenueChart from './RevenueChart';
import AnimatedPage from '../common/AnimatedPage';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    revenue: { total_revenue: 0 },
    orders: {
      total_orders: 0,
      pending_orders: 0,
      completed_orders: 0
    },
    products: { total_products: 0 },
    customers: { total_customers: 0 },
    recentOrders: [],
    stockAlerts: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/admin/dashboard');
        setStats(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Gagal memuat data dashboard');
        toast.error('Gagal memuat data dashboard: ' + (err?.response?.data?.error || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="text-center">
          <p className="text-gray-600">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg shadow">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Admin</h1>
          <p className="text-gray-600">Ringkasan statistik dan aktivitas terbaru</p>
        </div>

        {/* Statistik Grid - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {/* Card Total Pendapatan */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 transition-all duration-300 hover:shadow-md">
            <div className="flex flex-col h-full">
              <div className="flex-grow">              <h3 className="text-gray-500 text-sm font-medium">Total Pendapatan</h3>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mt-2 truncate">
                  Rp {stats.revenue.total_revenue.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {/* Tampilkan dalam format yang lebih ringkas jika layar kecil */}
                  {window.innerWidth < 640 ? `Rp ${(stats.revenue.total_revenue/1000000).toFixed(1)}M` : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Card Total Pesanan */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 transition-all duration-300 hover:shadow-md">
            <div className="flex flex-col h-full">
              <div className="flex-grow">
                <h3 className="text-gray-500 text-sm font-medium">Total Pesanan</h3>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-2">{stats.orders.total_orders}</p>
              </div>
              <Link 
                to="/admin/orders" 
                className="mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm inline-flex items-center"
              >
                Kelola Pesanan 
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Card Total Produk */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 transition-all duration-300 hover:shadow-md">
            <div className="flex flex-col h-full">
              <div className="flex-grow">
                <h3 className="text-gray-500 text-sm font-medium">Total Produk</h3>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-2">{stats.products.total_products}</p>
              </div>
              <Link 
                to="/admin/products" 
                className="mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm inline-flex items-center"
              >
                Kelola Produk
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Card Total Pelanggan */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 transition-all duration-300 hover:shadow-md">
            <div className="flex flex-col h-full">
              <div className="flex-grow">
                <h3 className="text-gray-500 text-sm font-medium">Total Pelanggan</h3>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-2">{stats.customers.total_customers}</p>
              </div>
              <Link 
                to="/admin/users" 
                className="mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm inline-flex items-center"
              >
                Lihat Pelanggan
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Grafik Pendapatan</h2>
          <RevenueChart />
        </div>

        {/* Pesanan Terbaru dan Stok Menipis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pesanan Terbaru */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Pesanan Terbaru</h2>
            <div className="space-y-4">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="border-b pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Order #{order.id}</p>
                      <p className="text-sm text-gray-600">{order.username}</p>
                      <p className="text-sm text-gray-500">
                        Rp {order.total_amount.toLocaleString()}
                      </p>
                    </div>
                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Detail &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/admin/orders" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
              Lihat Semua Pesanan &rarr;
            </Link>
          </div>

          {/* Stok Menipis */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Stok Menipis</h2>
            <div className="space-y-4">
              {stats.stockAlerts.map((product) => (
                <div key={product.id} className="border-b pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-red-500">
                        Sisa stok: {product.stock}
                      </p>
                    </div>
                    <Link
                      to={`/admin/products/edit/${product.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Update &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/admin/products" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
              Kelola Semua Produk &rarr;
            </Link>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default AdminDashboard;