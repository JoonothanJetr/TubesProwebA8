# SI CATE Documentation

## Overview
SI CATE (Sistem Informasi Catering) adalah platform e-commerce modern untuk Toba Home Catering yang menyediakan solusi digital untuk pemesanan makanan dan pengelolaan operasional catering. Dibangun menggunakan React.js dan Node.js, aplikasi ini menawarkan antarmuka yang intuitif untuk pelanggan dan panel administrasi yang komprehensif.

## Repository Structure
```
TubesProwebA8/
├── ecommerce-frontend/       # Frontend React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   │
│   └── public/             # Static files
│
├── ecommerce-backend/       # Backend Node.js server
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   └── scripts/        # Utility scripts
│   │
│   └── docs/              # API documentation
│
└── docs/                   # Project documentation
    ├── README.md          # Main documentation
    ├── API-docs.md        # API reference
    └── user-manual.md     # User guides
```

## Technology Stack

### Frontend
- React.js + Vite
- Tailwind CSS untuk UI responsif
- React Router untuk navigasi
- Axios untuk komunikasi API
- Chart.js untuk visualisasi data

### Backend
- Node.js dengan Express
- PostgreSQL untuk database
- JWT untuk autentikasi
- Multer untuk upload file

## Key Features

### Customer Features
1. **User Interface**
   - Modern dan responsif
   - Filter produk berdasarkan kategori
   - Detail produk dalam modal popup
   - Sistem keranjang belanja

2. **Account Management**
   - Registrasi dan login
   - Manajemen profil
   - Riwayat pesanan
   - Sistem ulasan

3. **Order Management**
   - Keranjang belanja
   - Checkout process
   - Status tracking
   - Multiple payment methods

### Admin Features
1. **Dashboard**
   - Statistik penjualan
   - Visualisasi data
   - Overview operasional

2. **Management Tools**
   - CRUD produk
   - Manajemen pesanan
   - Manajemen pengguna
   - Manajemen kategori

3. **Analytics**
   - Laporan penjualan
   - Statistik customer
   - Performance tracking

## Installation

1. Clone repository:
   ```bash
   git clone https://github.com/JoonothanJetr/TubesProwebA8.git
   cd TubesProwebA8
   ```

2. Install dependencies:
   ```bash
   # Install frontend dependencies
   cd ecommerce-frontend
   npm install

   # Install backend dependencies
   cd ../ecommerce-backend
   npm install
   ```

3. Setup database:
   ```bash
   # Di direktori ecommerce-backend
   # Pastikan PostgreSQL sudah terinstall dan berjalan
   npm run db:setup
   ```

4. Run development servers:
   ```bash
   # Backend server
   cd ecommerce-backend
   npm run dev

   # Frontend development server
   cd ecommerce-frontend
   npm run dev
   ```

## Documentation

- [API Documentation](API-docs.md) - Complete API reference
- [User Manual](user-manual.md) - Guides for customers and admins
- [Backend Documentation](../ecommerce-backend/docs/API.md) - Technical backend docs

## Recent Updates

1. **Admin Panel Enhancements**
   - Dashboard dengan visualisasi data
   - Improved order management
   - Enhanced user management
   - Analytics integration

2. **Cart System Improvements**
   - Order date selection
   - Better order confirmation flow
   - Payment process optimization
   - Order status notifications

3. **UI/UX Refinements**
   - Responsive design updates
   - Navigation improvements
   - Loading performance
   - Form validation

## Team

- Andini Permata Sari (10231015) - Frontend Developer
- Chelsy Olivia (10231025) - UI/UX Designer
- Jonathan Cristopher Jetro (10231047) - Full-stack Developer
- Nicholas Christian Samuel Manurung (10231069) - QA/DevOps
