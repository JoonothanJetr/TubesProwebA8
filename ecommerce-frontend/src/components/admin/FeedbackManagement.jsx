import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import id from 'date-fns/locale/id';
import { apiClient } from '../../utils/apiHelper';

const FeedbackManagement = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFeedback, setSelectedFeedback] = useState(null);

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
            const response = await fetch(`http://localhost:5000/api/feedback/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                throw new Error('Failed to update feedback status');
            }

            // Refresh feedbacks after status update
            const updatedFeedback = await response.json();
            setFeedbacks(feedbacks.map(f => 
                f.id === id ? { ...f, status: newStatus } : f
            ));
        } catch (err) {
            setError('Failed to update feedback status');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus feedback ini?')) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5000/api/feedback/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to delete feedback');
                }

                setFeedbacks(feedbacks.filter(f => f.id !== id));
            } catch (err) {
                setError('Gagal menghapus feedback');
            }
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
                <div className="bg-white rounded-lg shadow">                    {loading ? (
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
                                <thead className="bg-gray-50">                                    <tr>
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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                #{feedback.id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{feedback.name}</div>
                                                        <div className="text-sm text-gray-500">{feedback.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-900">
                                                    {feedback.message}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(feedback.status)}`}>
                                                    {feedback.status}
                                                </span>
                                            </td>                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                            {selectedFeedback && (
                                <div 
                                    className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 transition-opacity duration-300 ease-in-out"
                                    onClick={() => setSelectedFeedback(null)}
                                >
                                    <div 
                                        className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white transform transition-all duration-300 ease-in-out"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <div className="mt-3">
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                                Detail Feedback
                                            </h3>
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Pelanggan</p>
                                                    <p className="text-sm text-gray-900">{selectedFeedback.name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Email</p>
                                                    <p className="text-sm text-gray-900">{selectedFeedback.email}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Rating</p>
                                                    <p className="text-sm text-yellow-500">{getRatingStars(selectedFeedback.rating)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Feedback</p>
                                                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedFeedback.message}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Status</p>
                                                    <select 
                                                        value={selectedFeedback.status}
                                                        onChange={(e) => handleUpdateStatus(selectedFeedback.id, e.target.value)}
                                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="in_progress">In Progress</option>
                                                        <option value="resolved">Resolved</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Tanggal</p>
                                                    <p className="text-sm text-gray-900">
                                                        {format(new Date(selectedFeedback.created_at), 'dd MMMM yyyy', { locale: id })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-5 space-y-2">
                                                <button
                                                    onClick={() => setSelectedFeedback(null)}
                                                    className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                >
                                                    Tutup
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        handleDelete(selectedFeedback.id);
                                                        setSelectedFeedback(null);
                                                    }}
                                                    className="w-full inline-flex justify-center rounded-md border border-red-300 shadow-sm px-4 py-2 bg-red-50 text-base font-medium text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                >
                                                    Hapus Feedback
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FeedbackManagement;