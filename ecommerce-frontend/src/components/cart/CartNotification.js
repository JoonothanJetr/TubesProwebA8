import React from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

/**
 * Reusable notification component for cart actions
 * @param {Object} props - Component props
 * @param {boolean} props.show - Whether to show the toast
 * @param {Function} props.onClose - Function to call when toast is closed
 * @param {string} props.message - Message to display
 * @param {string} props.type - Toast type (success, danger, warning)
 */
const CartNotification = ({ show, onClose, message = "Item added to cart", type = "success" }) => {
    return (
        <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1100 }}>
            <Toast 
                show={show} 
                onClose={onClose}
                delay={3000} 
                autohide
                bg={type}
                className="text-white"
            >
                <Toast.Header closeButton>
                    <i className={`bi bi-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2`}></i>
                    <strong className="me-auto">
                        {type === 'success' ? 'Success' : type === 'danger' ? 'Error' : 'Notification'}
                    </strong>
                </Toast.Header>
                <Toast.Body>
                    {message}
                </Toast.Body>
            </Toast>
        </ToastContainer>
    );
};

export default CartNotification;
