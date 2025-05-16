import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import { catalogService } from '../../services/catalogService';
import { apiClient } from '../../utils/apiHelper';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    completedOrders: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch products count
        const products = await productService.getAllProductsAdmin();
        
        // Fetch catalogs count
        const catalogs = await catalogService.getAllCatalogs();
        
        // Fetch orders data from the API
        const ordersResponse = await apiClient.get('/orders');
        const orders = ordersResponse.data;
        
        // Fetch completed orders count - Updated endpoint
        const completedOrdersResponse = await apiClient.get('/orders/status/completed');
        const completedOrders = completedOrdersResponse.data.length;
        
        // Fetch users count
        const usersResponse = await apiClient.get('/users');
        const users = usersResponse.data;
        
        setStats({
          totalProducts: Array.isArray(products) ? products.length : 0,
          totalOrders: Array.isArray(orders) ? orders.length : 0,
          totalUsers: Array.isArray(users) ? users.length : 0,
          completedOrders: completedOrders || 0
        });
        
        setError(null);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Gagal memuat data dashboard. Silakan coba lagi nanti.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="bg-blue-100 text-blue-700 p-4 rounded-lg shadow">
          Memuat data dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg shadow">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">Dasbor Admin</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card Total Produk */}
          <div className="bg-white rounded-xl shadow-sm p-6 transition-transform hover:scale-105">
            <div className="flex flex-col h-full">
              <div className="flex-grow">
                <h3 className="text-gray-500 text-sm font-medium">Total Produk</h3>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalProducts}</p>
              </div>
              <Link 
                to="/admin/products" 
                className="mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                Kelola Produk &rarr;
              </Link>
            </div>
          </div>

          {/* Card Total Pesanan */}
          <div className="bg-white rounded-xl shadow-sm p-6 transition-transform hover:scale-105">
            <div className="flex flex-col h-full">
              <div className="flex-grow">
                <h3 className="text-gray-500 text-sm font-medium">Total Pesanan</h3>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalOrders}</p>
              </div>
              <Link 
                to="/admin/orders" 
                className="mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                Kelola Pesanan &rarr;
              </Link>
            </div>
          </div>

          {/* Card Total Pengguna */}
          <div className="bg-white rounded-xl shadow-sm p-6 transition-transform hover:scale-105">
            <div className="flex flex-col h-full">
              <div className="flex-grow">
                <h3 className="text-gray-500 text-sm font-medium">Total Pengguna</h3>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalUsers}</p>
              </div>
              <Link 
                to="/admin/users" 
                className="mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                Kelola Pengguna &rarr;
              </Link>
            </div>
          </div>

          {/* Card Pesanan Selesai */}
          <div className="bg-white rounded-xl shadow-sm p-6 transition-transform hover:scale-105">
            <div className="flex flex-col h-full">
              <div className="flex-grow">
                <h3 className="text-gray-500 text-sm font-medium">Pesanan Selesai</h3>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.completedOrders}</p>
              </div>
              <Link 
                to="/admin/orders" 
                className="mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                Lihat Detail &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Navigasi Cepat */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Navigasi Cepat</h2>
          <div className="flex flex-wrap gap-3">
            <Link to="/admin/products">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Manajemen Produk
              </button>
            </Link>
            <Link to="/admin/orders">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Manajemen Pesanan
              </button>
            </Link>
            <Link to="/admin/catalogs">
              <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors">
                Manajemen Katalog
              </button>
            </Link>
            <Link to="/admin/users">
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                Manajemen Pengguna
              </button>
            </Link>
            <Link to="/admin/feedback">
              <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                Customer Feedback
              </button>
            </Link>
          </div>
        </div>

        {/* Info Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Pesanan Terbaru */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Pesanan Terbaru</h2>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-gray-600">Data pesanan terbaru akan ditampilkan di sini.</p>
            </div>
            <Link to="/admin/orders">
              <button className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                Lihat Semua Pesanan
              </button>
            </Link>
          </div>

          {/* Produk Terlaris */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Produk Terlaris</h2>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-gray-600">Informasi produk terlaris akan ditampilkan di sini.</p>
            </div>
            <Link to="/admin/products">
              <button className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                Lihat Semua Produk
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;