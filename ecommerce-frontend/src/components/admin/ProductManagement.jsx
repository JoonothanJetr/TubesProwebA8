import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import { productService } from '../../services/productService';
import { catalogService } from '../../services/catalogService';
import ProductImage from '../common/ProductImage';

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [catalogs, setCatalogs] = useState([]);
    const [selectedCatalog, setSelectedCatalog] = useState('');
    const [sortOption, setSortOption] = useState('id-asc');

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const productData = await productService.getAllProductsAdmin();
            const catalogData = await catalogService.getAllCatalogs();
            setProducts(Array.isArray(productData) ? productData : []);
            setCatalogs(Array.isArray(catalogData) ? catalogData : []);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError(err.message || "Gagal memuat data.");
            setProducts([]);
            setCatalogs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (productId, productName) => {
        // Show delete confirmation modal with animation
        const result = await Swal.fire({
            title: 'Konfirmasi Penghapusan',
            html: `
                <div class="text-center">
                    <p class="mb-4">Apakah Anda yakin ingin menghapus produk:</p>
                    <p class="font-semibold text-lg mb-4">${productName}</p>
                    <p class="text-red-500">Operasi ini tidak dapat dibatalkan.</p>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
            showClass: {
                popup: 'animate__animated animate__fadeInDown animate__faster'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOutUp animate__faster'
            }
        });

        if (result.isConfirmed) {
            try {
                await productService.deleteProduct(productId);
                setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
                
                // Show success toast
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    didOpen: (toast) => {
                        toast.addEventListener('mouseenter', Swal.stopTimer);
                        toast.addEventListener('mouseleave', Swal.resumeTimer);
                    }
                });

                Toast.fire({
                    icon: 'success',
                    title: 'Produk berhasil dihapus'
                });
            } catch (err) {
                console.error("Error deleting product:", err);
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal menghapus produk',
                    text: err.message || 'Terjadi kesalahan saat menghapus produk.',
                    confirmButtonColor: '#dc2626'
                });
            }
        }
    };

    const processedProducts = useMemo(() => {
        let filtered = [...products];

        if (selectedCatalog) {
            filtered = filtered.filter(product => product.category_id === parseInt(selectedCatalog));
        }

        switch (sortOption) {
            case 'name-asc':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'price-desc':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'price-asc':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'id-asc':
            default:
                filtered.sort((a, b) => a.id - b.id);
                break;
        }
        return filtered;
    }, [products, selectedCatalog, sortOption]);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Manajemen Produk
                    </h1>
                    <Link 
                        to="/admin/products/new" 
                        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Tambah Produk Baru
                    </Link>
                </div>

                {/* Filter Section */}
                <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Filter dan Urutkan</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">                                Filter Berdasarkan Menu Katalog
                            </label>
                            <select
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                value={selectedCatalog}
                                onChange={(e) => setSelectedCatalog(e.target.value)}
                            >
                                <option value="">Semua Menu Katalog</option>
                                {catalogs.map(catalog => (
                                    <option key={catalog.id} value={catalog.id}>
                                        {catalog.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Urutkan Berdasarkan
                            </label>
                            <select
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                            >
                                <option value="id-asc">ID Produk (Default)</option>
                                <option value="name-asc">Nama Produk (A-Z)</option>
                                <option value="price-desc">Harga (Tertinggi)</option>
                                <option value="price-asc">Harga (Terendah)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {loading && (
                        <div className="flex flex-col items-center justify-center p-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                            <p className="mt-4 text-gray-600">Memuat data produk...</p>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                            <p className="font-bold">Error</p>
                            <p>{error}</p>
                        </div>
                    )}

                    {!loading && !error && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gambar</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Produk</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Katalog</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {processedProducts.length > 0 ? (
                                        processedProducts.map(product => (
                                            <tr key={product.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {product.id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center justify-center">
                                                        <ProductImage
                                                            imageUrl={product.image_url}
                                                            productName={product.name}
                                                            className="h-16 w-16 object-cover rounded-lg"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {product.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    Rp {product.price ? product.price.toLocaleString('id-ID') : '0'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {product.stock}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {product.category_name || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">                                                    <Link
                                                        to={`/admin/products/edit/${product.id}`}
                                                        className="inline-flex items-center px-3 py-1.5 border border-yellow-500 text-yellow-500 hover:bg-yellow-50 rounded-md transition-colors"
                                                    >
                                                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(product.id, product.name)}
                                                        className="inline-flex items-center px-3 py-1.5 border border-red-500 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                                    >
                                                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        Hapus
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                                {products.length === 0 && !loading ? "Tidak ada data produk." : "Tidak ada produk yang sesuai dengan filter."}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductManagement;