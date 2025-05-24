import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import id from 'date-fns/locale/id';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '../../utils/apiHelper';
import Swal from 'sweetalert2';

const FeedbackManagement = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {                const token = localStorage.getItem('token');
                // Remove 'Bearer ' prefix if it exists in the stored token
                const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
                const response = await fetch('http://localhost:5000/api/feedback', {
                    headers: {
                        'Authorization': `Bearer ${cleanToken}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Failed to fetch feedback data');
                }                const data = await response.json();
                // Handle both array and object with data property formats
                setFeedbacks(Array.isArray(data) ? data : (data.data || []));
                setLoading(false);
            } catch (err) {
                setError('Gagal memuat data feedback');
                setLoading(false);
            }
        };

        fetchFeedbacks();
    }, []);

    const handleView = (feedback) => {
        setSelectedFeedback(feedback);    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found - please login again');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
                return;
            }

            // Remove 'Bearer ' prefix if it exists in the stored token
            const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;

            const response = await fetch(`http://localhost:5000/api/feedback/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${cleanToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.status === 401 || response.status === 403) {
                setError('You are not authorized to perform this action. Please login again.');
                setTimeout(() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                }, 2000);
                return;
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `Failed to update feedback status (${response.status})`);
            }

            // Refresh feedbacks after status update
            const updatedFeedback = await response.json();
            console.log('Feedback updated successfully:', updatedFeedback);
            
            setFeedbacks(feedbacks.map(f => 
                f.id === id ? { ...f, status: newStatus } : f
            ));
        } catch (err) {
            console.error('Error updating feedback status:', err);
            setError(err.message || 'Failed to update feedback status');
        }
    };    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Konfirmasi Penghapusan',
            text: "Apakah Anda yakin ingin menghapus feedback ini?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
            showLoaderOnConfirm: true,
            preConfirm: async () => {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) {
                        throw new Error('No authentication token found');
                    }

                    // Remove 'Bearer ' prefix if it exists in the stored token
                    const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;

                    const response = await fetch(`http://localhost:5000/api/feedback/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${cleanToken}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.status === 401 || response.status === 403) {
                        throw new Error('You are not authorized to perform this action');
                    }

                    if (!response.ok) {                        const errorData = await response.json().catch(() => null);
                        throw new Error(errorData?.message || 'Failed to delete feedback');
                    }

                    const data = await response.json();
                    return { success: true, data };
                } catch (error) {
                    console.error('Error deleting feedback:', error);
                    Swal.showValidationMessage(
                        error.message || 'Failed to delete feedback'
                    );
                }
            },
            allowOutsideClick: () => !Swal.isLoading()
        });

        if (result.isConfirmed) {
            setFeedbacks(feedbacks.filter(f => f.id !== id));
            await Swal.fire({
                icon: 'success',
                title: 'Terhapus!',
                text: 'Feedback berhasil dihapus.',
                timer: 1500,
                showConfirmButton: false
            });
        }
    };    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'in_progress': return 'bg-blue-100 text-blue-800';
            case 'resolved': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getRatingStars = (rating) => {
        return '⭐'.repeat(rating);
    };

    const modalVariants = {
        hidden: { 
            opacity: 0,
            scale: 0.8,
            y: 20
        },
        visible: { 
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 25,
                stiffness: 300
            }
        },
        exit: { 
            opacity: 0,
            scale: 0.8,
            y: -20,
            transition: {
                duration: 0.2
            }
        }
    };

    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 }
    };

    const handleSaveStatus = async (feedback) => {
        setIsSaving(true);
        try {
            await handleUpdateStatus(feedback.id, feedback.status);
            setSelectedFeedback(null);
            
            await Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'Status feedback berhasil diperbarui',
                showConfirmButton: false,
                timer: 1500
            });
        } catch (err) {
            await Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Gagal memperbarui status feedback'
            });
            console.error('Error saving status:', err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Customer Feedback Management</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Kelola dan pantau feedback dari pelanggan
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 p-3 bg-blue-100 rounded-lg">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h2 className="text-lg font-semibold text-gray-900">Total Feedback</h2>
                                <p className="text-2xl font-bold text-blue-600">{feedbacks.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 p-3 bg-yellow-100 rounded-lg">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h2 className="text-lg font-semibold text-gray-900">Pending</h2>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {feedbacks.filter(f => f.status.toLowerCase() === 'pending').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 p-3 bg-green-100 rounded-lg">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <h2 className="text-lg font-semibold text-gray-900">Resolved</h2>
                                <p className="text-2xl font-bold text-green-600">
                                    {feedbacks.filter(f => f.status.toLowerCase() === 'resolved').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-lg shadow">
                    {loading ? (
                        <div className="flex items-center justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            <span className="ml-2 text-gray-600">Memuat data...</span>
                        </div>
                    ) : error ? (
                        <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
                            {error}
                        </div>
                    ) : feedbacks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8">
                            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <p className="mt-4 text-lg font-medium text-gray-600">Belum ada feedback</p>
                            <p className="mt-1 text-sm text-gray-500">Feedback dari pelanggan akan muncul di sini</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pelanggan</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedback</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {feedbacks.map((feedback) => (
                                        <tr key={feedback.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{feedback.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{feedback.name}</div>
                                                        <div className="text-sm text-gray-500">{feedback.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-900">{feedback.message}</p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(feedback.status)}`}>
                                                    {feedback.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {format(new Date(feedback.created_at || feedback.date), 'dd MMMM yyyy', { locale: id })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <button 
                                                    onClick={() => handleView(feedback)} 
                                                    className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded-md transition-colors"
                                                >
                                                    Lihat
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(feedback.id)} 
                                                    className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-md transition-colors"
                                                >
                                                    Hapus
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Detail Modal */}
                            <AnimatePresence>
                                {selectedFeedback && (
                                    <>
                                        <motion.div 
                                            className="fixed inset-0 bg-black bg-opacity-50 z-40"
                                            variants={overlayVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            onClick={() => setSelectedFeedback(null)}
                                        />
                                        <div className="fixed inset-0 z-50 overflow-y-auto">
                                            <div className="flex min-h-full items-center justify-center p-4">
                                                <motion.div 
                                                    className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6"
                                                    variants={modalVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit="exit"
                                                    onClick={e => e.stopPropagation()}
                                                >
                                                    {/* Modal Header */}
                                                    <div className="border-b pb-4 mb-4">
                                                        <h3 className="text-xl font-semibold text-gray-900">
                                                            Detail Feedback
                                                        </h3>
                                                    </div>

                                                    {/* Modal Content */}
                                                    <div className="space-y-4">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-500">Pelanggan</p>
                                                            <p className="text-base text-gray-900 mt-1">{selectedFeedback.name}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-500">Email</p>
                                                            <p className="text-base text-gray-900 mt-1">{selectedFeedback.email}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-500">Pesan</p>
                                                            <p className="text-base text-gray-900 mt-1 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                                                                {selectedFeedback.message}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                                                            <select 
                                                                value={selectedFeedback.status}
                                                                onChange={(e) => setSelectedFeedback({
                                                                    ...selectedFeedback,
                                                                    status: e.target.value
                                                                })}
                                                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                            >
                                                                <option value="pending">Pending</option>
                                                                <option value="in_progress">In Progress</option>
                                                                <option value="resolved">Resolved</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-500">Tanggal</p>
                                                            <p className="text-base text-gray-900 mt-1">
                                                                {format(new Date(selectedFeedback.created_at), 'dd MMMM yyyy', { locale: id })}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Modal Footer */}
                                                    <div className="mt-6 flex justify-end space-x-3">
                                                        <button
                                                            onClick={() => setSelectedFeedback(null)}
                                                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                        >
                                                            Tutup
                                                        </button>
                                                        <motion.button
                                                            onClick={() => handleSaveStatus(selectedFeedback)}
                                                            disabled={isSaving}
                                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                        >
                                                            {isSaving ? (
                                                                <span className="flex items-center">
                                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                    </svg>
                                                                    Menyimpan...
                                                                </span>
                                                            ) : 'Simpan Perubahan'}
                                                        </motion.button>
                                                    </div>
                                                </motion.div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FeedbackManagement;