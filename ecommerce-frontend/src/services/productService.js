import axios from 'axios';
import { authService } from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'; // Pastikan URL API backend benar
// Hapus atau komentari ADMIN_API_URL karena tidak digunakan lagi untuk produk
// const ADMIN_API_URL = `${API_URL}/admin`; // Base URL untuk endpoint admin

const getAuthHeaders = () => {
    const token = authService.getToken();
    if (!token) {
        console.error("No auth token found for admin operation");
        // Mungkin throw error atau handle sesuai kebutuhan aplikasi
    }
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Fungsi untuk mengambil semua produk (mungkin endpoint publik atau perlu auth?)
const getAllProducts = async (catalogId = null) => {
    try {
        const params = catalogId ? { catalogId } : {};
        // Log URL yang akan di-request untuk debugging
        const requestUrl = `${API_URL}/products`;
        console.log('Requesting products from URL:', requestUrl); 
        // Jika endpoint ini butuh auth, tambahkan header: { headers: getAuthHeaders() }
        const response = await axios.get(requestUrl, { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching products:', error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Gagal mengambil data produk');
    }
};

// Fungsi untuk mengambil detail produk (endpoint publik)
const getProductById = async (productId) => {
    try {
        const response = await axios.get(`${API_URL}/products/${productId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching product ${productId}:`, error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Gagal mengambil detail produk');
    }
};

// --- Fungsi Khusus Admin ---

// Mengambil semua produk untuk admin (mungkin data lebih lengkap atau endpoint berbeda)
const getAllProductsAdmin = async () => {
    try {
        const headers = getAuthHeaders();
        // Log URL yang akan di-request untuk debugging
        const requestUrl = `${API_URL}/products`;
        console.log('Requesting admin products from URL:', requestUrl);
        // Gunakan API_URL langsung, endpointnya /api/products
        const response = await axios.get(requestUrl, { headers });
        return response.data;
    } catch (error) {
        console.error('Error fetching admin products:', error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Gagal mengambil data produk admin');
    }
};

// Membuat produk baru (memerlukan FormData karena mungkin ada file gambar)
const createProduct = async (productData) => {
    try {
        const headers = {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data', // Penting untuk upload file
        };
        // productData harus berupa objek FormData
        // Gunakan API_URL langsung
        const response = await axios.post(`${API_URL}/products`, productData, { headers });
        return response.data;
    } catch (error) {
        console.error('Error creating product:', error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Gagal membuat produk baru');
    }
};

// Mengupdate produk (memerlukan FormData)
const updateProduct = async (productId, productData) => {
    try {
        const headers = {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data',
        };
        // productData harus berupa objek FormData
        // Gunakan API_URL langsung
        const response = await axios.put(`${API_URL}/products/${productId}`, productData, { headers });
        return response.data;
    } catch (error) {
        console.error(`Error updating product ${productId}:`, error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Gagal memperbarui produk');
    }
};

// Menghapus produk
const deleteProduct = async (productId) => {
    try {
        const headers = getAuthHeaders();
        // Gunakan API_URL langsung
        const response = await axios.delete(`${API_URL}/products/${productId}`, { headers });
        return response.data; // Biasanya berisi pesan sukses
    } catch (error) {
        console.error(`Error deleting product ${productId}:`, error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Gagal menghapus produk');
    }
};

export const productService = {
    getAllProducts,
    getProductById,
    getAllProductsAdmin, // Fungsi spesifik admin
    createProduct,
    updateProduct,
    deleteProduct,
}; 