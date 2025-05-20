import React from 'react';
import { Navigate } from 'react-router-dom';
import FeedbackManagement from '../../components/admin/FeedbackManagement';
import { authService } from '../../services/authService';

const AdminFeedbackPage = () => {
  const user = authService.getUser();
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Customer Feedback Management</h1>
      <FeedbackManagement />
    </div>
  );
};

export default AdminFeedbackPage;