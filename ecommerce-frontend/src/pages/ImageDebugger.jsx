import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import { getProductImageUrl } from '../utils/imageHelper';
import ProductImageOptimized from '../components/common/ProductImageOptimized';
import { productService } from '../services/productService';
import DebugImage from '../components/common/DebugImage';

/**
 * A page to help diagnose and debug image loading issues
 * This page allows testing image URLs and viewing how they are processed
 */
const ImageDebugger = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [processedCustomUrl, setProcessedCustomUrl] = useState('');
  
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const data = await productService.getAllProducts();
        setProducts(data.slice(0, 5)); // Just get the first 5 products
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProducts();
  }, []);
  
  const handleCustomUrlTest = () => {
    try {
      const processedUrl = getProductImageUrl(customImageUrl);
      setProcessedCustomUrl(processedUrl);
    } catch (error) {
      console.error('Error processing URL:', error);
      setProcessedCustomUrl('Error processing URL');
    }
  };
  
  const testImagePaths = [
    'example.jpg',
    '/uploads/products/example.jpg',
    'uploads/products/example.jpg',
    '/images/products/example.jpg',
    'products/example.jpg',
    'https://example.com/image.jpg',
    '1746117241283-Screenshot-2025-03-19-160555.png'
  ];
  
  return (
    <Container className="py-5">
      <h1 className="mb-4">Image Debugger</h1>
      <p className="text-muted">This page helps diagnose image loading issues</p>
      
      <h2 className="mt-5 mb-3">1. Test Custom URL</h2>
      <Row>
        <Col md={8}>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Enter image URL/path to test:</Form.Label>
              <Form.Control
                type="text"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                placeholder="e.g., products/example.jpg"
              />
            </Form.Group>
            <Button variant="primary" onClick={handleCustomUrlTest}>Test URL</Button>
          </Form>
        </Col>
      </Row>
      
      {processedCustomUrl && (
        <Card className="mt-3 p-3">
          <h5>Results:</h5>
          <p><strong>Original:</strong> {customImageUrl}</p>
          <p><strong>Processed:</strong> {processedCustomUrl}</p>
          <div>
            <h6>Image Preview:</h6>
            <img 
              src={processedCustomUrl} 
              alt="Test" 
              style={{ maxHeight: '150px' }} 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/300x200?text=Image+Failed+to+Load';
              }} 
            />
          </div>
        </Card>
      )}
      
      <h2 className="mt-5 mb-3">2. Test Predefined Paths</h2>
      <Row>
        {testImagePaths.map((path, index) => (
          <Col md={6} lg={4} key={index} className="mb-4">
            <Card>
              <Card.Body>
                <Card.Title>Test Path {index + 1}</Card.Title>
                <Card.Text>
                  <strong>Original:</strong> <code>{path}</code>
                </Card.Text>
                <DebugImage imageUrl={path} />
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      
      <h2 className="mt-5 mb-3">3. Test Actual Products</h2>
      {loading ? (
        <p>Loading products...</p>
      ) : (
        <Row>
          {products.map(product => (
            <Col md={6} key={product.id} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>{product.name}</Card.Title>
                  <p><strong>Image Path:</strong> <code>{product.image_url}</code></p>
                  
                  <h6>Using ProductImageOptimized:</h6>
                  <ProductImageOptimized 
                    imageUrl={product.image_url}
                    productName={product.name}
                    style={{ height: '150px', objectFit: 'contain' }}
                  />
                  
                  <h6 className="mt-3">Using Raw URL:</h6>
                  <DebugImage imageUrl={product.image_url} />
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default ImageDebugger;
