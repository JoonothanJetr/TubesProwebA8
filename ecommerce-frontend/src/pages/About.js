import React from 'react';
import { Container, Row, Col, Card, Image } from 'react-bootstrap';

const About = () => {
  return (
    <Container className="py-5">
      <Row className="mb-5">
        <Col>
          <h1 className="text-center mb-4">Tentang Kami</h1>
          <p className="text-center lead">
            Menyajikan makanan tradisional dan nusantara dengan kualitas terbaik sejak 2015.
          </p>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col md={6} className="mb-4 mb-md-0">
          <Image 
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
            alt="Our Restaurant" 
            fluid 
            className="rounded shadow" 
          />
        </Col>
        <Col md={6}>          <h2 className="mb-4">Perjalanan Kami</h2>
          <p>
            TobaHome | SICATE dimulai dari sebuah dapur kecil dengan impian besar untuk memperkenalkan kekayaan 
            kuliner Indonesia kepada lebih banyak orang. Dengan resep turun temurun dan pengalaman bertahun-tahun
            dalam dunia kuliner, kami berkomitmen untuk selalu menyajikan makanan berkualitas dengan cita rasa otentik.
          </p>
          <p>
            Kini, TobaHome | SICATE telah melayani ribuan pelanggan dengan berbagai kebutuhan katering, 
            mulai dari acara kantor, pesta keluarga, hingga perayaan besar. Kesuksesan kami adalah 
            ketika pelanggan puas dengan layanan dan makanan yang kami sajikan.
          </p>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col>
          <h2 className="text-center mb-4">Nilai-Nilai Kami</h2>
          <Row className="g-4">
            <Col md={4}>
              <Card className="h-100 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="rounded-circle bg-warning d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '80px', height: '80px' }}>
                    <i className="bi bi-heart" style={{ fontSize: '2rem' }}></i>
                  </div>
                  <Card.Title>Kualitas</Card.Title>
                  <Card.Text>
                    Kami hanya menggunakan bahan-bahan terbaik dan segar untuk setiap hidangan yang kami sajikan.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="rounded-circle bg-warning d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '80px', height: '80px' }}>
                    <i className="bi bi-people" style={{ fontSize: '2rem' }}></i>
                  </div>
                  <Card.Title>Kepuasan Pelanggan</Card.Title>
                  <Card.Text>
                    Kepuasan pelanggan adalah prioritas utama kami. Kami selalu berusaha memberikan pelayanan terbaik.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="rounded-circle bg-warning d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '80px', height: '80px' }}>
                    <i className="bi bi-globe" style={{ fontSize: '2rem' }}></i>
                  </div>
                  <Card.Title>Keberlanjutan</Card.Title>
                  <Card.Text>
                    Kami berusaha untuk selalu ramah lingkungan dalam setiap aspek bisnis kami, dari penggunaan kemasan hingga pengolahan limbah.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col>
          <h2 className="text-center mb-4">Tim Kami</h2>
          <Row className="g-4">
            <Col md={4}>
              <Card className="h-100 shadow-sm text-center">
                <div style={{ height: '250px', overflow: 'hidden' }}>
                  <Card.Img 
                    variant="top" 
                    src="https://randomuser.me/api/portraits/men/32.jpg" 
                    alt="Chef" 
                    style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                  />
                </div>
                <Card.Body>
                  <Card.Title>Budi Santoso</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">Head Chef</Card.Subtitle>
                  <Card.Text>
                    Dengan pengalaman lebih dari 15 tahun dalam dunia kuliner Indonesia dan internasional.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 shadow-sm text-center">
                <div style={{ height: '250px', overflow: 'hidden' }}>
                  <Card.Img 
                    variant="top" 
                    src="https://randomuser.me/api/portraits/women/65.jpg" 
                    alt="Manager" 
                    style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                  />
                </div>
                <Card.Body>
                  <Card.Title>Siti Rahayu</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">Operations Manager</Card.Subtitle>
                  <Card.Text>
                    Memastikan setiap pesanan sampai ke pelanggan dengan tepat waktu dan dalam kondisi sempurna.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 shadow-sm text-center">
                <div style={{ height: '250px', overflow: 'hidden' }}>
                  <Card.Img 
                    variant="top" 
                    src="https://randomuser.me/api/portraits/men/45.jpg" 
                    alt="Owner" 
                    style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                  />
                </div>
                <Card.Body>                  <Card.Title>Agus Wijaya</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">Founder</Card.Subtitle>
                  <Card.Text>
                    Pendiri TobaHome | SICATE dengan visi untuk memperkenalkan kekayaan kuliner nusantara.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      <Row>
        <Col className="text-center">
          <h2 className="mb-4">Lokasi Kami</h2>
          <div className="ratio ratio-16x9 mb-4">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.288823049669!2d106.8268872761431!3d-6.2250247610775025!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f3f0d415b1b3%3A0x91d707621bbd776d!2sMonas!5e0!3m2!1sen!2sid!4v1682347576315!5m2!1sen!2sid" 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Location Map"
              className="border-0 rounded shadow"
            ></iframe>          </div>
          <p className="mb-0">Jl. Pahlawan Nusantara No. 123, Jakarta Pusat</p>
          <p className="mb-0">Email: info@tobahome.com</p>
          <p>Telepon: (021) 1234-5678</p>
        </Col>
      </Row>
    </Container>
  );
};

export default About;
