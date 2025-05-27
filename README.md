# Laporan Progres Mingguan - SI CATE
**Kelompok** : 8

**Mitra** : Toba Home Catering

**Pekan ke -** : 15

**Tanggal** : 24/05/2025

---
## Anggota Kelompok ##

- **Andini Permata Sari dengan NIM 10231015**
- **Chelsy Olivia dengan NIM 10231025**
- **Jonathan Cristopher Jetro dengan NIM 10231047**
- **Nicholas Christian Samuel Manurung dengan NIM 10231069**

---

## Progress Summary
SI CATE adalah aplikasi web full-stack modern untuk Toba Home Catering yang menyediakan solusi digital untuk pemesanan makanan dan pengelolaan operasional catering. Aplikasi ini dirancang untuk memudahkan pelanggan dalam memesan makanan tradisional Batak dan membantu pengelola dalam manajemen pesanan.

## Accomplished Tasks
- Implementasi sistem autentikasi multi-level (pelanggan dan admin)
- Pengembangan dashboard admin dengan statistik dan visualisasi
- Implementasi manajemen produk dan kategori
- Pengembangan sistem keranjang dan checkout
- Integrasi sistem pembayaran
- Implementasi tracking pesanan
- Pengembangan sistem ulasan
- Optimasi performa dan UI/UX

## Challenges & Solutions
- **Challenge 1**: Integrasi sistem pembayaran multi-metode
  - **Solution**: Implementasi abstraction layer untuk payment gateway dan sistem upload bukti transfer
- **Challenge 2**: Real-time tracking pesanan
  - **Solution**: Menggunakan WebSocket untuk update status pesanan secara real-time
- **Challenge 3**: Optimasi performa loading data
  - **Solution**: Implementasi lazy loading dan caching untuk data produk

## Next Week Plan
- Presentasi

## 2. Complete Documentation: README, API docs, user manual

### README
SI CATE adalah aplikasi web full-stack modern untuk Toba Home Catering yang menyediakan solusi digital untuk operasi catering. Aplikasi ini dibangun menggunakan React.js, Node.js, dan Express untuk memberikan pengalaman yang mulus baik bagi pelanggan maupun admin.

#### Fitur Utama
- Sistem pemesanan online yang intuitif
- Manajemen menu dan kategori
- Panel admin yang komprehensif
- Autentikasi multi-level (pelanggan, admin)
- Desain responsif untuk semua perangkat
- Sistem tracking pesanan

#### Teknologi
- **Frontend:** React.js, Vite, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** PostgreSQL
- **Autentikasi:** JWT
- **File Upload:** Multer

### Repository Information
- **Main Repository**: https://github.com/JoonothanJetr/TubesProwebA8.git
- **Branch**: main
- **Latest Release**: v1.0.0
- **Release Date**: 24/05/2025

### Setup Instructions

#### Prerequisites
- Node.js 16 or higher
- PostgreSQL 12 or higher
- npm or yarn

#### Database Setup
1. Install PostgreSQL if you haven't already
2. Run the schema file which will create and setup the database:
   ```bash
   # Navigate to backend directory
   cd ecommerce-backend
   
   # Create and initialize database (as postgres superuser)
   sudo -u postgres psql -f database/schema.sql
   ```

#### Environment Setup
1. Frontend (.env in ecommerce-frontend/):
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

2. Backend (.env in ecommerce-backend/):
   ```
   PORT=5000
   DATABASE_URL=postgresql://username:password@localhost:5432/sicatedb
   JWT_SECRET=your_jwt_secret
   ```

#### Installation
1. Frontend Setup:
   ```bash
   cd ecommerce-frontend
   npm install
   npm run dev
   ```

2. Backend Setup:
   ```bash
   cd ecommerce-backend
   npm install
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

#### Default Admin Credentials
```
Email: admin@example.com
Password: admin123
```

### Repository Structure
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

### Release Notes
- **v1.0.0** (24/05/2025)
  - Initial release
  - Complete catering management system
  - Admin panel implementation
  - Online ordering system
  - Payment integration
  - Documentation and user manuals

### How to Clone and Setup
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
   # In ecommerce-backend directory
   # Make sure PostgreSQL is installed and running
   npm run db:setup
   ```

4. Start development servers:
   ```bash
   # Backend server
   cd ecommerce-backend
   npm run dev

   # Frontend development server
   cd ecommerce-frontend
   npm run dev
   ```

### File Dokumentasi Terpisah
Untuk dokumentasi yang lebih lengkap dan terstruktur, kami menyediakan file-file terpisah berikut:

1. **README.md**
   - Berisi informasi umum tentang proyek
   - Panduan instalasi dan setup
   - Daftar fitur utama
   - Teknologi yang digunakan
   - Kontribusi dan lisensi
   - Lokasi: `/docs/README.md`

2. **API-docs.md**
   - Dokumentasi lengkap API endpoints
   - Format request dan response
   - Contoh penggunaan
   - Autentikasi dan otorisasi
   - Error handling
   - Lokasi: `/docs/API-docs.md`

3. **user-manual.md**
   - Panduan lengkap untuk pengguna
   - Tutorial penggunaan fitur
   - FAQ dan troubleshooting
   - Panduan admin
   - Screenshot dan contoh
   - Lokasi: `/docs/user-manual.md`

Semua file dokumentasi dapat diakses melalui repository GitHub di folder `/docs`.

## Contributions
- **Andini Permata Sari**: 
  - Frontend development (React components)
  - UI implementation
  - Component styling
  - State management

- **Chelsy Olivia**: 
  - UI/UX design
  - Frontend development
  - User flow optimization
  - Design documentation

- **Jonathan Cristopher Jetro**: 
  - Full-stack development
  - API development
  - Database design
  - System architecture

- **Nicholas Christian Samuel Manurung**: 
  - Quality assurance
  - Testing implementation
  - DevOps setup
  - Deployment management
