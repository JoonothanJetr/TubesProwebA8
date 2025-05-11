import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Container, Nav, Navbar } from 'react-bootstrap';

const AdminLayout = () => {
  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/admin">Admin Panel</Navbar.Brand>
          <Navbar.Toggle aria-controls="admin-navbar-nav" />
          <Navbar.Collapse id="admin-navbar-nav">
            <Nav className="me-auto">
              {/* Add other admin links here as needed */}
              <Nav.Link as={Link} to="/admin/dashboard">Dashboard</Nav.Link> {/* Example Link */}
              <Nav.Link as={Link} to="/admin/feedback">Customer Feedback</Nav.Link>
              {/* Add more links like /admin/products, /admin/orders etc. */}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container fluid className="mt-4">
        <Outlet /> {/* This is where the routed admin page component will be rendered */}
      </Container>
    </>
  );
};

export default AdminLayout;
