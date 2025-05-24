const express = require('express');
const router = express.Router();
const pool = require('../database/db.js'); // Diperbarui untuk menunjuk ke db.js
const auth = require('../middleware/auth');

// Submit customer feedback
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required'
      });
    }
    
    const result = await pool.query(
      'INSERT INTO customer_feedback (name, email, message) VALUES ($1, $2, $3) RETURNING *',
      [name, email, message]
    );
    
    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting feedback: ' + (error.message || 'Internal server error')
    });
  }
});

// Get all feedback (admin only)
router.get('/', auth.isAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM customer_feedback ORDER BY created_at DESC'
    );
    
    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error getting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting feedback: ' + (error.message || 'Internal server error')
    });
  }
});

// Update feedback status (admin only)
router.put('/:id', auth.isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log('Updating feedback status:', { id, status, userId: req.user?.id, userRole: req.user?.role });
    
    // Validate status
    if (!['pending', 'in_progress', 'resolved'].includes(status)) {
      console.log('Invalid status value:', status);
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, in_progress, or resolved'
      });
    }
    
    const result = await pool.query(
      'UPDATE customer_feedback SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );
    
    if (result.rows.length === 0) {
      console.log('Feedback not found:', id);
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }
    
    console.log('Feedback updated successfully:', result.rows[0]);
    res.status(200).json({
      success: true,
      message: 'Feedback status updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating feedback: ' + (error.message || 'Internal server error')
    });
  }
});

// Delete feedback (admin only)
router.delete('/:id', auth.isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Delete feedback request:', { 
      feedbackId: id, 
      userId: req.user?.id, 
      userRole: req.user?.role 
    });

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid feedback ID'
      });
    }
    
    const result = await pool.query(
      'DELETE FROM customer_feedback WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      console.log('Feedback not found:', id);
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }
    
    console.log('Feedback deleted successfully:', result.rows[0]);
    res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
});

// Export the router
module.exports = router;