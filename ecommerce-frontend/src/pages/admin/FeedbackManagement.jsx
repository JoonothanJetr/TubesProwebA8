import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:5000/api';

const FeedbackManagement = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/feedback`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Ensure response.data.data is an array before setting it
      if (response.data && Array.isArray(response.data.data)) {
        setFeedback(response.data.data);
      } else {
        // If format is incorrect, set feedback as an empty array or handle error
        setFeedback([]);
        console.error('Unexpected response format from API:', response.data);
        toast.error('Failed to load feedback data: Invalid format');
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast.error('Failed to load feedback data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (feedback) => {
    setSelectedFeedback(feedback);
    setStatus(feedback.status);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedFeedback(null);
  };

  const handleStatusChange = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_URL}/feedback/${selectedFeedback.id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Feedback status updated successfully');
      fetchFeedback();
      handleCloseModal();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/feedback/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        toast.success('Feedback deleted successfully');
        fetchFeedback();
      } catch (error) {
        console.error('Error deleting feedback:', error);
        toast.error('Failed to delete feedback');
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge bg="warning">Pending</Badge>;
      case 'in_progress':
        return <Badge bg="info">In Progress</Badge>;
      case 'resolved':
        return <Badge bg="success">Resolved</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  if (loading) {
    return <div className="text-center my-5">Loading...</div>;
  }

  return (
    <Container className="my-4">
      <h2 className="mb-4">Customer Feedback Management</h2>
      
      {feedback.length === 0 ? (
        <div className="alert alert-info">No feedback submissions found</div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {feedback.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.email}</td>
                <td>{getStatusBadge(item.status)}</td>
                <td>{new Date(item.created_at).toLocaleDateString()}</td>
                <td>
                  <Button 
                    variant="info" 
                    size="sm" 
                    className="me-2"
                    onClick={() => handleViewDetails(item)}
                  >
                    View
                  </Button>
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Details Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Feedback Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedFeedback && (
            <>
              <p><strong>Name:</strong> {selectedFeedback.name}</p>
              <p><strong>Email:</strong> {selectedFeedback.email}</p>
              <p><strong>Date:</strong> {new Date(selectedFeedback.created_at).toLocaleString()}</p>
              <p><strong>Message:</strong></p>
              <div className="p-3 bg-light mb-3">
                {selectedFeedback.message}
              </div>
              
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </Form.Select>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleStatusChange}>
            Update Status
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default FeedbackManagement;