# Dokumentasi API Catering E-commerce

## Daftar Isi
- [Autentikasi](#autentikasi)
- [Produk](#produk)
- [Keranjang](#keranjang)
- [Pesanan](#pesanan)
- [Ulasan](#ulasan)

## Autentikasi

### Registrasi
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "role": "customer" // opsional, default: customer
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

### Login
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

## Produk

### Mendapatkan Semua Produk
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
    "category": "string",
    "stock": "integer"
  }
]
```

### Mendapatkan Detail Produk
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
  "category": "string",
  "stock": "integer"
}
```

### Membuat Produk Baru (Admin)
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
  "image_url": "string",
  "category": "string",
  "stock": "integer"
}
```

## Keranjang

### Mendapatkan Keranjang
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
      "image_url": "string"
    },
    "quantity": "integer"
  }
]
```

### Menambah Item ke Keranjang
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

## Pesanan

### Mendapatkan Semua Pesanan
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
    "status": "string",
    "payment_status": "string",
    "created_at": "string"
  }
]
```

### Membuat Pesanan Baru
```http
POST /api/orders
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
  "status": "pending",
  "payment_status": "unpaid",
  "created_at": "string"
}
```

## Ulasan

### Membuat Ulasan Baru
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

## Kode Status

- 200: OK
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Catatan

- Semua endpoint yang memerlukan autentikasi harus menyertakan token JWT di header `Authorization`
- Format token: `Bearer {token}`
- Role yang tersedia: `admin` dan `customer`
- Status pesanan: `pending`, `processing`, `completed`, `cancelled`
- Status pembayaran: `unpaid`, `paid`
- Rating ulasan: 1-5 