import api from '../utils/axios'; // Gunakan instance axios terpusat
import { authService } from './authService'; // Untuk header

const getAuthHeaders = () => { // Helper untuk header otentikasi
    const token = authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const getAllUsers = async () => {
    try {
        const headers = getAuthHeaders();
        const response = await api.get('/users', { headers }); // Endpoint GET /api/users
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Gagal mengambil daftar pengguna');
    }
};

const getUserById = async (id) => {
    try {
        const headers = getAuthHeaders();
        const response = await api.get(`/users/${id}`, { headers });
        return response.data;
    } catch (error) {
        console.error(`Error fetching user ${id}:`, error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Gagal mengambil detail pengguna');
    }
};

const deleteUser = async (id) => {
    try {
        const headers = getAuthHeaders();
        const response = await api.delete(`/users/${id}`, { headers });
        return response.data; // Biasanya { message: ... }
    } catch (error) {
        console.error(`Error deleting user ${id}:`, error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Gagal menghapus pengguna');
    }
};

// Fungsi update role jika diperlukan nanti
/*
const updateUserRole = async (id, role) => {
    try {
        const headers = getAuthHeaders();
        const response = await api.put(`/users/${id}/role`, { role }, { headers });
        return response.data;
    } catch (error) {
        console.error(`Error updating user role ${id}:`, error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Gagal memperbarui peran pengguna');
    }
};
*/

export const userService = {
    getAllUsers,
    getUserById,
    deleteUser,
    // updateUserRole,
}; 