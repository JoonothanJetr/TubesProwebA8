# Laporan Progres Mingguan - SICATE
**Kelompok**: 8

**Nama Anggota Kelompok**: 
1. Andini Permata Sari (10231015)

2. Chelsy Olivia (10231025)

3. Jonathan Cristopher Jetro (10231047)

4. Nicholas Christian Samuel Manurung (10231069)

**Mitra**: Toba Home Catering

**Pekan ke-**: 15

**Tanggal**: 23/05/2025

## Progress Summary
Pada minggu terakhir ini, tim telah menyelesaikan seluruh pengembangan aplikasi SICATE dengan melakukan finalisasi dokumentasi, penyusunan README, dokumentasi API, dan panduan pengguna. Presentasi final telah disiapkan secara lengkap yang mencakup penjelasan tentang SICATE, latar belakang proyek, tujuan pengembangan, sasaran pengguna, teknologi yang digunakan, serta arsitektur sistem.


## Accomplished Tasks
- Menyelesaikan seluruh dokumentasi proyek (README, API docs, user manual)
- Menyiapkan presentasi final yang mencakup penjelasan lengkap tentang SI CATE
- Melakukan final testing dan memastikan semua fitur berjalan dengan baik

## Challenges & Solutions
- **Challenge 1**: Mengoptimalkan performa animasi pada halaman dengan banyak elemen dinamis
  - **Solution**: Implementasi lazy loading dan staggered animations dengan Framer Motion untuk mengurangi beban rendering dan menciptakan pengalaman pengguna yang lebih lancar.
- **Challenge 2**: Menangani kasus edge pada stok produk yang rendah atau habis
  - **Solution**: Merancang sistem peringatan stok yang intuitif dengan animasi visual dan feedback yang jelas kepada pengguna.

## Contributions
- **Chelsy Olivia**: Membuat laporan mingguan, membantu memberi masukan kepada frontend dan backend.
- **Andini Permata Sari**: Membuat dokumentasi (Readme, API Docs, user manual).
- **Jonathan Cristopher Jetro**: 
  - Mengimplementasikan animasi pada halaman produk dan pesanan menggunakan Framer Motion
  - Menambahkan indikator stok rendah pada kartu produk dengan badge merah untuk item dengan stok 5 atau kurang
  - Mengembangkan animasi peringatan stok dalam modal produk yang muncul saat pengguna mencoba menambahkan lebih banyak item daripada yang tersedia
  - Memodifikasi input kuantitas di modal produk untuk memungkinkan nilai mulai dari 0 dan mencegah penambahan 0 item ke keranjang
  - Menambahkan judul "Menu Produk TobaHome" dengan animasi intro ke halaman produk
  - Membuat animasi intro dengan judul "Riwayat Pesanan" dan ikon paket dengan efek spring pada halaman pesanan
  - Mengimplementasikan animasi bertahap untuk baris tabel pesanan dan efek hover
- **Nicholas Christian Samuel Manurung**: Mencari bug dan usability testing dan membantu membuat dokumentasi (Readme, API Docs, user manual).
   
## Screenshots 
### Halaman Produk dengan Animasi dan Indikator Stok
![Halaman Produk](https://example.com/product-page.png)

### Modal Produk dengan Peringatan Stok
![Modal Produk](https://example.com/product-modal.png)

### Halaman Pesanan dengan Animasi
![Halaman Pesanan](https://example.com/orders-page.png)

### Dokumentasi API
![Dokumentasi API](https://example.com/api-docs.png)

## Complete Documentation: README, API docs, user manual

### README
SICATE adalah aplikasi web e-commerce modern untuk Toba Home Catering yang menyediakan solusi digital untuk operasi bisnis katering. Aplikasi ini dibangun menggunakan React, Node.js, dan Express untuk memberikan pengalaman yang mulus baik bagi pelanggan maupun admin.

#### Fitur Utama
- Sistem pemesanan online yang intuitif dengan animasi interaktif
- Manajemen produk dan kategori
- Sistem keranjang belanja dengan validasi stok
- Panel admin yang komprehensif
- Autentikasi multi-level (pelanggan, admin)
- Desain responsif untuk semua perangkat
- Indikator stok rendah dan peringatan stok

#### Teknologi
- **Frontend:** React, Framer Motion, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** postgreSQL
- **State Management:** React Context API

### API Documentation

#### Base URL
`/api`

#### Autentikasi
API menggunakan sistem autentikasi JWT (JSON Web Token).

#### Endpoint

##### Produk
- `GET /products` - Mendapatkan semua produk aktif
- `GET /products/{id}` - Detail produk spesifik
- `POST /products` - Membuat produk baru (Admin)
- `PUT /products/{id}` - Update produk (Admin)
- `DELETE /products/{id}` - Hapus produk (Admin)

##### Kategori
- `GET /catalogs` - Daftar kategori
- `POST /catalogs` - Buat kategori baru (Admin)
- `GET /catalogs/{id}` - Detail kategori
- `PUT /catalogs/{id}` - Update kategori (Admin)
- `DELETE /catalogs/{id}` - Hapus kategori (Admin)

##### Keranjang
- `GET /cart` - Daftar item keranjang user
- `POST /cart` - Tambah item ke keranjang
- `PUT /cart/{id}` - Update item keranjang
- `DELETE /cart/{id}` - Hapus item dari keranjang
- `DELETE /cart/clear-all` - Kosongkan keranjang

##### Pesanan
- `GET /orders` - Daftar pesanan user
- `POST /orders` - Buat pesanan baru
- `GET /orders/{id}` - Detail pesanan
- `PUT /orders/{id}` - Update status pesanan (Admin)

##### Pembayaran
- `GET /payments` - Daftar pembayaran user
- `POST /payments` - Buat pembayaran baru
- `GET /payments/{id}` - Detail pembayaran

### User Manual

#### Panduan Pelanggan

1. **Registrasi dan Login**
   - Klik "Daftar" untuk membuat akun baru
   - Isi formulir dengan data yang valid
   - Verifikasi email (opsional)
   - Login menggunakan email dan password

2. **Penelusuran Produk**
   - Gunakan filter kategori untuk menyaring produk
   - Cari produk spesifik menggunakan fitur pencarian
   - Lihat detail produk dengan mengklik item
   - Perhatikan indikator stok rendah (badge merah) untuk produk dengan stok terbatas

3. **Pemesanan**
   - Tambahkan item ke keranjang
   - Atur jumlah pesanan (perhatikan peringatan jika melebihi stok)
   - Lanjutkan ke checkout
   - Pilih metode pembayaran
   - Konfirmasi pesanan

4. **Manajemen Akun**
   - Update profil
   - Lihat riwayat pesanan
   - Ubah password

#### Panduan Admin

1. **Login Admin**
   - Akses `/admin`
   - Login dengan kredensial admin

2. **Manajemen Produk**
   - Tambah/edit/hapus produk
   - Atur kategori
   - Upload gambar produk
   - Atur stok produk

3. **Manajemen Pesanan**
   - Lihat daftar pesanan
   - Update status pesanan
   - Cetak invoice
   - Kelola pembayaran

4. **Laporan**
   - Laporan penjualan
   - Statistik pengunjung
   - Export data

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

4. **Presentation Final**

Link PPT: https://www.canva.com/design/DAGoP9pSGUo/gX9FxiLSy22UVs_e7znqUQ/edit?utm_content=DAGoP9pSGUo&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton 

Semua file dokumentasi dapat diakses melalui repository GitHub di folder `/docs`.

## Source Code: Repo GitHub dengan tag/release final

### Repository Information
- **Main Repository**: https://github.com/JoonothanJetr/TubesProwebA8.git
- **Branch**: main
- **Latest Release**: v1.0.0
- **Release Date**: 23/05/2025

### Repository Structure
```
TubesProwebA8/
├── docs/
│   ├── README.md
│   ├── API-docs.md
│   └── user-manual.md
│
├── ecommerce-backend/
│   ├── database/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── middleware/
│   ├── uploads/
│   └── public/
│
├── ecommerce-frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   ├── animations/
│   │   │   ├── auth/
│   │   │   ├── cart/
│   │   │   ├── common/
│   │   │   ├── layout/
│   │   │   ├── orders/
│   │   │   ├── products/
│   │   │   └── routes/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   └── utils/
│   └── build/
│
└── laporan-mingguan/
```

### How to Clone and Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/JoonothanJetr/TubesProwebA8.git
   cd TubesProwebA8
   ```

2. Setup Backend:
   ```bash
   cd ecommerce-backend
   npm install
   cp .env.example .env
   # Configure your database settings in .env
   npm run seed
   ```

3. Setup Frontend:
   ```bash
   cd ecommerce-frontend
   npm install
   cp .env.example .env
   # Configure your API URL in .env
   ```

4. Start the development servers:
   ```bash
   # In ecommerce-backend directory
   npm run dev
   
   # In ecommerce-frontend directory
   npm run dev
   ```

### Release Notes
- **v1.0.0** (23/05/2025)
  - Initial release
  - Complete e-commerce system for Toba Home Catering
  - Admin panel implementation
  - Online ordering system with stock validation
  - Animated UI components with Framer Motion
  - Low stock indicators and warnings
  - Payment integration
  - Documentation and user manuals

## Deployed Application
https://sicate-tobahome.web.id