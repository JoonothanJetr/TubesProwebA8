import api from '../utils/axios'; // Gunakan instance axios terpusat
import { authService } from './authService'; // Untuk header di CUD

const getAuthHeaders = () => { // Helper untuk header otentikasi
    const token = authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const getAllCatalogs = async () => {
    try {
        // Endpoint GET /api/catalogs sekarang mengambil dari tabel categories
        const response = await api.get('/catalogs'); 
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Gagal mengambil daftar kategori');
    }
};

const createCatalog = async (catalogData) => {
    try {
        const headers = getAuthHeaders();
        const response = await api.post('/catalogs', catalogData, { headers });
        return response.data;
    } catch (error) {
        console.error('Error creating category:', error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Gagal membuat kategori baru');
    }
};

const updateCatalog = async (id, catalogData) => {
    try {
        const headers = getAuthHeaders();
        const response = await api.put(`/catalogs/${id}`, catalogData, { headers });
        return response.data;
    } catch (error) {
        console.error(`Error updating category ${id}:`, error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Gagal memperbarui kategori');
    }
};

const deleteCatalog = async (id) => {
    try {
        const headers = getAuthHeaders();
        const response = await api.delete(`/catalogs/${id}`, { headers });
        return response.data; // Biasanya { message: ... }
    } catch (error) {
        console.error(`Error deleting category ${id}:`, error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Gagal menghapus kategori');
    }
};

export const catalogService = {
    getAllCatalogs,
    createCatalog,
    updateCatalog,
    deleteCatalog,
}; 