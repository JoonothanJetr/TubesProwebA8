# SICATE API Documentation

## Base URL
API base URL: `/api`

## Authentication
API menggunakan sistem autentikasi JWT (JSON Web Token).

### Headers
Untuk endpoint yang memerlukan autentikasi:
```
Authorization: Bearer {token}
```

## Endpoints

### Authentication

#### Register
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "role": "customer" // optional, default: customer
}
```

**Response:**
```json
{
  "token": "string",
  "user": {
    "id": "integer",
    "username": "string",
    "email": "string",
    "role": "string"
  }
}
```

#### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "token": "string",
  "user": {
    "id": "integer",
    "username": "string",
    "email": "string",
    "role": "string"
  }
}
```

### Products

#### Get All Products
```http
GET /api/products
```

**Response:**
```json
[
  {
    "id": "integer",
    "name": "string",
    "description": "string",
    "price": "number",
    "image_url": "string",
    "category_id": "integer",
    "category_name": "string",
    "stock": "integer",
    "created_at": "string",
    "updated_at": "string"
  }
]
```

#### Get Product Details
```http
GET /api/products/{id}
```

**Response:**
```json
{
  "id": "integer",
  "name": "string",
  "description": "string",
  "price": "number",
  "image_url": "string",
  "category_id": "integer",
  "category_name": "string",
  "stock": "integer",
  "created_at": "string",
  "updated_at": "string"
}
```

#### Create Product (Admin)
```http
POST /api/products
```

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "price": "number",
  "image": "file", // Multipart form data
  "category_id": "integer",
  "stock": "integer"
}
```

#### Update Product (Admin)
```http
PUT /api/products/{id}
```

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "price": "number",
  "image": "file", // Optional, multipart form data
  "category_id": "integer",
  "stock": "integer"
}
```

#### Delete Product (Admin)
```http
DELETE /api/products/{id}
```

**Headers:**
```
Authorization: Bearer {token}
```

### Cart

#### Get Cart
```http
GET /api/cart
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": "integer",
    "product": {
      "id": "integer",
      "name": "string",
      "price": "number",
      "image_url": "string",
      "stock": "integer",
      "category_name": "string"
    },
    "quantity": "integer",
    "created_at": "string",
    "updated_at": "string"
  }
]
```

#### Add to Cart
```http
POST /api/cart
```

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "product_id": "integer",
  "quantity": "integer"
}
```

**Response:**
```json
{
  "message": "Product added to cart successfully",
  "cart_item": {
    "id": "integer",
    "product": {
      "id": "integer",
      "name": "string",
      "price": "number",
      "image_url": "string"
    },
    "quantity": "integer"
  }
}
```

#### Update Cart Item
```http
PUT /api/cart/{id}
```

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "quantity": "integer"
}
```

**Response:**
```json
{
  "message": "Cart item updated successfully",
  "cart_item": {
    "id": "integer",
    "product": {
      "id": "integer",
      "name": "string",
      "price": "number"
    },
    "quantity": "integer"
  }
}
```

#### Remove from Cart
```http
DELETE /api/cart/{id}
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "message": "Item removed from cart"
}
```

#### Clear Cart
```http
DELETE /api/cart/clear-all
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "message": "Cart cleared successfully"
}
```

### Orders

#### Get All Orders
```http
GET /api/orders
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": "integer",
    "total_amount": "number",
    "order_status": "string",
    "payment_status": "string",
    "order_date": "string",
    "desired_completion_date": "string",
    "items": [
      {
        "product_id": "integer",
        "product_name": "string",
        "quantity": "integer",
        "price": "number"
      }
    ]
  }
]
```

#### Get Order Details
```http
GET /api/orders/{id}
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "integer",
  "total_amount": "number",
  "order_status": "string",
  "payment_status": "string",
  "order_date": "string",
  "desired_completion_date": "string",
  "customer": {
    "id": "integer",
    "name": "string",
    "email": "string",
    "phone": "string"
  },
  "items": [
    {
      "product_id": "integer",
      "product_name": "string",
      "quantity": "integer",
      "price": "number",
      "image_url": "string"
    }
  ],
  "payment": {
    "id": "integer",
    "method": "string",
    "status": "string",
    "proof_image": "string",
    "created_at": "string"
  }
}
```

#### Create Order
```http
POST /api/orders
```

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "desired_completion_date": "string", // Format: YYYY-MM-DD
  "payment_method": "string",
  "notes": "string" // Optional
}
```

**Response:**
```json
{
  "id": "integer",
  "total_amount": "number",
  "order_status": "diproses",
  "payment_status": "menunggu pembayaran",
  "order_date": "string",
  "desired_completion_date": "string",
  "message": "Order created successfully"
}
```

#### Update Order Status (Admin)
```http
PUT /api/orders/{id}/status
```

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "order_status": "string" // diproses, selesai, dibatalkan
}
```

**Response:**
```json
{
  "message": "Order status updated successfully",
  "order": {
    "id": "integer",
    "order_status": "string"
  }
}
```

### Payments

#### Get User Payments
```http
GET /api/payments
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": "integer",
    "order_id": "integer",
    "amount": "number",
    "method": "string",
    "status": "string",
    "proof_image": "string",
    "created_at": "string",
    "updated_at": "string"
  }
]
```

#### Get Payment Details
```http
GET /api/payments/{id}
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "integer",
  "order_id": "integer",
  "amount": "number",
  "method": "string",
  "status": "string",
  "proof_image": "string",
  "created_at": "string",
  "updated_at": "string",
  "order": {
    "id": "integer",
    "total_amount": "number",
    "order_status": "string"
  }
}
```

#### Create Payment
```http
POST /api/payments
```

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body (multipart/form-data):**
```
order_id: integer
method: string
proof_image: file
```

**Response:**
```json
{
  "message": "Payment submitted successfully",
  "payment": {
    "id": "integer",
    "order_id": "integer",
    "amount": "number",
    "method": "string",
    "status": "menunggu konfirmasi",
    "proof_image": "string"
  }
}
```

### Catalogs

#### Get All Categories
```http
GET /api/catalogs
```

**Response:**
```json
[
  {
    "id": "integer",
    "name": "string",
    "description": "string",
    "created_at": "string",
    "updated_at": "string"
  }
]
```

#### Get Category Details
```http
GET /api/catalogs/{id}
```

**Response:**
```json
{
  "id": "integer",
  "name": "string",
  "description": "string",
  "created_at": "string",
  "updated_at": "string",
  "products": [
    {
      "id": "integer",
      "name": "string",
      "price": "number",
      "image_url": "string"
    }
  ]
}
```

#### Create Category (Admin)
```http
POST /api/catalogs
```

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "string",
  "description": "string"
}
```

**Response:**
```json
{
  "message": "Category created successfully",
  "category": {
    "id": "integer",
    "name": "string",
    "description": "string"
  }
}
```

### Reviews

#### Create Review
```http
POST /api/reviews
```

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "product_id": "integer",
  "rating": "integer",
  "comment": "string"
}
```

**Response:**
```json
{
  "id": "integer",
  "product_id": "integer",
  "rating": "integer",
  "comment": "string",
  "created_at": "string"
}
```

## Status Codes

- 200: OK
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 422: Unprocessable Entity (Validation Error)
- 500: Internal Server Error

## Error Handling

Ketika terjadi error, API akan mengembalikan response dengan format berikut:

```json
{
  "error": "Error message",
  "details": {} // Optional, detail error untuk validasi
}
```

Contoh error validasi:

```json
{
  "error": "Validation failed",
  "details": {
    "quantity": ["Quantity must be greater than 0"]
  }
}
```

## Notes

- Role yang tersedia: `admin` dan `customer`
- Status pesanan: `diproses`, `selesai`, `dibatalkan`
- Status pembayaran: `menunggu pembayaran`, `pembayaran sudah dilakukan`, `pembayaran dibatalkan`
- Metode pembayaran: `transfer_bank`, `cash_on_delivery`, `e-wallet`
- Rating ulasan: 1-5
- Stok produk: Ketika stok ≤ 5, produk akan ditampilkan dengan indikator stok rendah
