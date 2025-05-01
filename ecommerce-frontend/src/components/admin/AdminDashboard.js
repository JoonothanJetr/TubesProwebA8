import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, ListGroup } from 'react-bootstrap';
import { orderService } from '../../services/orderService'; // Import the entire orderService object
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setLoading(true);
        const response = await orderService.getSalesData(); // Call getSalesData via the imported object
        
        // Ensure data is in the format expected by Chart.js
        const formattedData = {
          labels: response.labels || [],
          datasets: response.datasets || [{
            label: 'Sales',
            data: response.data || [],
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            tension: 0.1
          }]
        };
        
        setSalesData(formattedData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch sales data:", err);
        setError('Failed to load sales data. Please try again later.');
        setSalesData(null); // Clear data on error
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Daily Sales Trend',
      },
    },
    scales: {
        y: {
            beginAtZero: true
        }
    }
  };

    return (
        <Container className="mt-4">
            <Row>
                <Col>
                    <Card>
                        <Card.Header as="h2">Admin Dashboard</Card.Header>
                        <Card.Body>
                            <Card.Text>Selamat datang di Panel Admin. Pilih salah satu opsi di bawah untuk mengelola toko.</Card.Text>
                            <ListGroup variant="flush">
                                <ListGroup.Item action as={Link} to="/admin/catalogs">
                                    Manajemen Katalog
                                </ListGroup.Item>
                                <ListGroup.Item action as={Link} to="/admin/products">
                                    Manajemen Produk
                                </ListGroup.Item>
                                <ListGroup.Item action as={Link} to="/admin/users">
                                    Manajemen Pengguna (Pelanggan)
                                </ListGroup.Item>
                                <ListGroup.Item action as={Link} to="/admin/orders">
                                    Manajemen Pesanan
                                </ListGroup.Item>
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>            <Row>
                <Col>
                  <Card className="mt-4">
                    <Card.Header as="h3">Ringkasan Penjualan</Card.Header>
                    <Card.Body>
                      {loading && <p>Memuat data penjualan...</p>}
                      {error && <p className="text-danger">{error}</p>}
                      
                      {!loading && !error && salesData && salesData.labels && salesData.datasets && (
                        <div>
                          {/* Chart visualization */}
                          <Line options={chartOptions} data={salesData} />
                          
                          {/* Fallback if chart doesn't render properly */}
                          <div className="mt-4 small">
                            <h5>Detail Data Penjualan:</h5>
                            <ul>
                              {salesData.labels.map((date, index) => (
                                <li key={index}>
                                  {date}: Rp {salesData.datasets[0]?.data[index]?.toLocaleString('id-ID') || 0}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                      
                      {!loading && !error && (!salesData || !salesData.labels || salesData.labels.length === 0) && (
                        <p>Belum ada data penjualan untuk ditampilkan.</p>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AdminDashboard;