import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-dark text-white py-5 mt-5">
            <Container>                <Row className="mb-4">
                    <Col lg={4} md={6} className="mb-4 mb-md-0">
                        <h5 className="text-uppercase mb-4">TobaHome | SICATE</h5>
                        <p>
                            Platform catering online yang menyediakan berbagai pilihan menu untuk acara Anda.
                            Kami berkomitmen untuk memberikan layanan terbaik dengan menu berkualitas.
                        </p>
                        <div className="mt-3">
                            <Link to="#" className="text-white me-3"><i className="bi bi-facebook fs-5"></i></Link>
                            <Link to="#" className="text-white me-3"><i className="bi bi-instagram fs-5"></i></Link>
                            <Link to="#" className="text-white me-3"><i className="bi bi-twitter fs-5"></i></Link>
                            <Link to="#" className="text-white me-3"><i className="bi bi-youtube fs-5"></i></Link>
                        </div>
                    </Col>
                    <Col lg={3} md={6} className="mb-4 mb-md-0">
                        <h5 className="text-uppercase mb-4">Kontak</h5>
                        <ul className="list-unstyled mb-0">
                            <li className="mb-2">
                                <i className="bi bi-geo-alt me-2"></i> Jl. Pahlawan Nusantara No. 123, Jakarta
                            </li>                            <li className="mb-2">
                                <i className="bi bi-envelope me-2"></i> info@tobahome.com
                            </li>
                            <li className="mb-2">
                                <i className="bi bi-telephone me-2"></i> (021) 1234-5678
                            </li>
                        </ul>
                    </Col>
                    <Col lg={2} md={6} className="mb-4 mb-md-0">
                        <h5 className="text-uppercase mb-4">Navigasi</h5>
                        <ul className="list-unstyled">
                            <li className="mb-2"><Link to="/" className="text-white text-decoration-none">Beranda</Link></li>
                            <li className="mb-2"><Link to="/products" className="text-white text-decoration-none">Menu</Link></li>
                            <li className="mb-2"><Link to="/about" className="text-white text-decoration-none">Tentang Kami</Link></li>
                            <li className="mb-2"><Link to="/register" className="text-white text-decoration-none">Daftar</Link></li>
                        </ul>
                    </Col>
                    <Col lg={3} md={6} className="mb-4 mb-md-0">
                        <h5 className="text-uppercase mb-4">Jam Operasional</h5>
                        <ul className="list-unstyled">
                            <li className="mb-2">Senin - Jumat: 08:00 - 20:00</li>
                            <li className="mb-2">Sabtu: 09:00 - 17:00</li>
                            <li className="mb-2">Minggu: 09:00 - 15:00</li>
                        </ul>
                    </Col>
                </Row>                <hr className="my-4" />                <div className="text-center">
                    <p className="mb-0">
                        © {new Date().getFullYear()} TobaHome | SICATE. All rights reserved.
                    </p>
                    <p className="small mt-2">
                        <span className="text-muted">Developed with <i className="bi bi-heart-fill text-danger"></i> by Team A8</span>
                    </p>
                </div>
            </Container>
        </footer>
    );
};

export default Footer; 