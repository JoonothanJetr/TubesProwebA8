import React, { useState, useEffect } from 'react';
import { catalogService } from '../../services/catalogService';

const CatalogManagement = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    
    // State untuk mode edit inline
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [editCategoryName, setEditCategoryName] = useState('');
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    const fetchCategories = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await catalogService.getAllCatalogs();
            setCategories(data || []);
        } catch (err) {
            console.error("Error fetching categories:", err);
            setError(err.message || "Gagal memuat daftar kategori.");
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) {
            setError('Nama kategori tidak boleh kosong.');
            return;
        }
        setIsAdding(true);
        setError(null);
        try {
            await catalogService.createCatalog({ name: newCategoryName });
            setNewCategoryName(''); // Kosongkan input setelah berhasil
            await fetchCategories(); // Muat ulang daftar kategori
        } catch (err) {
            console.error("Error adding category:", err);
            setError(err.message || "Gagal menambah kategori.");
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeleteCategory = async (id) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus kategori ini? Produk yang menggunakan kategori ini akan kehilangan kategorinya (atau gagal dihapus jika ada batasan).`)) {
            // Set loading spesifik untuk item (opsional, bisa juga global loading)
            setLoading(true); 
            setError(null);
            try {
                await catalogService.deleteCatalog(id);
                await fetchCategories(); // Muat ulang daftar
            } catch (err) {
                console.error(`Error deleting category ${id}:`, err);
                setError(err.message || "Gagal menghapus kategori.");
                // Set loading false di sini jika error, agar tidak stuck loading
                setLoading(false); 
            } 
            // setLoading(false) akan dijalankan oleh fetchCategories jika sukses
        }
    };

    // Fungsi untuk memulai mode edit
    const handleEditClick = (category) => {
        setEditingCategoryId(category.id);
        setEditCategoryName(category.name);
        setError(null); // Hapus error sebelumnya
    };

    // Fungsi untuk membatalkan edit
    const handleCancelEdit = () => {
        setEditingCategoryId(null);
        setEditCategoryName('');
    };

    // Fungsi untuk menyimpan perubahan edit
    const handleSaveEdit = async (id) => {
        if (!editCategoryName.trim()) {
            setError('Nama kategori tidak boleh kosong.');
            return;
        }
        setIsSavingEdit(true);
        setError(null);
        try {
            await catalogService.updateCatalog(id, { name: editCategoryName });
            setEditingCategoryId(null); // Keluar dari mode edit
            setEditCategoryName('');
            await fetchCategories(); // Muat ulang daftar
        } catch (err) {
            console.error(`Error updating category ${id}:`, err);
            setError(err.message || "Gagal memperbarui kategori.");
        } finally {
            setIsSavingEdit(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Manajemen Kategori Produk
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Kelola kategori produk untuk mengorganisir menu yang tersedia
                    </p>
                </div>

                {/* Form Tambah Kategori */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
                    <div className="p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">
                            Tambah Kategori Baru
                        </h2>
                        <form onSubmit={handleAddCategory} className="flex gap-3">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Masukkan nama kategori baru"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    disabled={isAdding}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-50"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isAdding}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isAdding ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Menambahkan...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Tambah Kategori
                                    </>
                                )}
                            </button>
                        </form>
                        {error && (
                            <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                                <p className="text-sm">{error}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Daftar Kategori */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">
                            Daftar Kategori
                        </h2>
                        
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                <span className="ml-3 text-sm text-gray-500">Memuat data...</span>
                            </div>
                        ) : categories.length === 0 ? (
                            <div className="text-center py-8">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <p className="mt-2 text-sm text-gray-500">Belum ada kategori tersedia</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {categories.map((category) => (
                                    <div key={category.id} className="py-4 first:pt-0 last:pb-0">
                                        {editingCategoryId === category.id ? (
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="text"
                                                    value={editCategoryName}
                                                    onChange={(e) => setEditCategoryName(e.target.value)}
                                                    disabled={isSavingEdit}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={() => handleSaveEdit(category.id)}
                                                    disabled={isSavingEdit}
                                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
                                                >
                                                    {isSavingEdit ? (
                                                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                    ) : (
                                                        'Simpan'
                                                    )}
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    disabled={isSavingEdit}
                                                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                                >
                                                    Batal
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-900">{category.name}</span>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEditClick(category)}
                                                        disabled={loading || editingCategoryId !== null}
                                                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                                                    >
                                                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCategory(category.id)}
                                                        disabled={loading || editingCategoryId !== null}
                                                        className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-lg text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
                                                    >
                                                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        Hapus
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CatalogManagement;