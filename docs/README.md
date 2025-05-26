# SICATE Documentation

## Overview
SICATE (Sistem Informasi Catering) adalah aplikasi web e-commerce modern untuk Toba Home Catering yang menyediakan solusi digital untuk operasi bisnis katering. Aplikasi ini dibangun menggunakan React, Node.js, dan Express untuk memberikan pengalaman yang mulus baik bagi pelanggan maupun admin. Dengan fokus pada pengalaman pengguna yang interaktif dan animasi yang responsif, SICATE menawarkan antarmuka yang intuitif dan menarik.

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
- Framer Motion untuk animasi dan transisi
- React Router untuk navigasi
- Axios untuk komunikasi API
- Chart.js untuk visualisasi data
- React Context API untuk state management

### Backend
- Node.js dengan Express
- MongoDB untuk database
- JWT untuk autentikasi
- Multer untuk upload file
- Express Validator untuk validasi data

## Key Features

### Customer Features
1. **User Interface**
   - Modern dan responsif dengan animasi interaktif
   - Filter produk berdasarkan kategori dengan efek spring
   - Detail produk dalam modal popup dengan animasi transisi
   - Sistem keranjang belanja dengan validasi stok
   - Indikator stok rendah (badge merah) untuk produk dengan stok ≤ 5
   - Animasi peringatan stok saat mencoba menambahkan lebih dari stok tersedia

2. **Account Management**
   - Registrasi dan login dengan validasi
   - Manajemen profil dengan foto pengguna
   - Riwayat pesanan dengan animasi staggered
   - Sistem ulasan dengan rating bintang

3. **Order Management**
   - Keranjang belanja dengan update real-time
   - Checkout process dengan animasi step-by-step
   - Status tracking dengan indikator visual
   - Multiple payment methods dengan upload bukti pembayaran

### Admin Features
1. **Dashboard**
   - Statistik penjualan dengan grafik interaktif
   - Visualisasi data real-time
   - Overview operasional dengan indikator performa
   - Notifikasi pesanan baru dengan animasi

2. **Management Tools**
   - CRUD produk dengan upload gambar
   - Manajemen stok produk dengan peringatan stok rendah
   - Manajemen pesanan dengan update status
   - Manajemen pengguna dengan level akses
   - Manajemen kategori dengan drag-and-drop

3. **Analytics**
   - Laporan penjualan dengan filter periode
   - Statistik customer dengan segmentasi
   - Performance tracking dengan metrik KPI
   - Export data ke format Excel/PDF

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

1. **UI/UX Enhancements with Animations**
   - Implementasi animasi pada halaman produk dan pesanan menggunakan Framer Motion
   - Animasi intro dengan judul "Menu Produk TobaHome" dan ikon shopping bag
   - Animasi intro dengan judul "Riwayat Pesanan" dan ikon paket dengan efek spring
   - Animasi bertahap (staggered) untuk kartu produk dan baris tabel pesanan
   - Efek hover interaktif untuk kartu produk dan baris pesanan

2. **Stock Management System**
   - Indikator stok rendah pada kartu produk dengan badge merah untuk item dengan stok ≤ 5
   - Animasi peringatan stok dalam modal produk saat mencoba menambahkan lebih dari stok tersedia
   - Validasi input kuantitas untuk mencegah penambahan 0 item ke keranjang
   - Sistem update stok real-time setelah pembelian

3. **Performance Optimizations**
   - Lazy loading untuk komponen dan gambar
   - Implementasi staggered animations untuk mengurangi beban rendering
   - Prefetching data produk untuk meningkatkan kecepatan navigasi
   - Optimasi ukuran gambar dan aset

## Team

- Andini Permata Sari (10231015) - Frontend Developer
- Chelsy Olivia (10231025) - UI/UX Designer
- Jonathan Cristopher Jetro (10231047) - Full-stack Developer
- Nicholas Christian Samuel Manurung (10231069) - QA/DevOps
