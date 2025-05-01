Untuk window pop up dan dropout metode pembayaran checkoutnya sudah bagus, untuk di window apakah anda bisa menambahkan teks "setelah konfirmasi pembayaran, anda dapat mengecek halaman pesanan untuk melihat status pesanan". Tombol konfirmasi pembayaran juga akan menghasilkan pop up animasi checklist berhasil di tengah, dan berhasil memasukkan data pemesanan produk di keranjang ke dalam database pesanan, untuk status pesanan ada 3, yaitu diproses, dibatalkan, selesai. 

Penjelasan status pesanan:
Dibatalkan: pesanan dibatalkan oleh admin
Diproses: Pesanan sedang diproses oleh admin
Selesai: Pesanan bisa di ambil

Pengeditan status pesanan ini akan tampil di halaman admin panel manajemen pesanan, dan di dalam halaman admin panel manajemen pesanan dipisah untuk setiap user, jadi anggap saja admin memilih user ini untuk dibuka riwayat pemesanannya yang diabil dari database orders, lalu diganti statusnya. Apakah memungkinkan untuk menambahkan status pembayaran, dimana status bisa diganti juga oleh admin jika admin sudah melihat bukti pembayaran pelanggan di halaman pesanan dengan mengupload gambar bukti pembayaran (hanya untuk qris, dana. gopay. Untuk pembayaran di lokasi, admin bisa mengganti statusnya langsung). Status pembayaran terdiri dari: Pembayaran sudah Dilakukan, Menunggu Pembayaran, Pembayaran dibatalkan

Penjelasan Status (admin dapat mengedit di admin panel manajemen pesanan):
Pembayaran sudah dilakukan: Pelanggan sudah mengupload bukti pembayaran yang masuk ke dalam database, dan di verifikasi oleh admin
Menunggu Pembayaran: Pelanggan belum mengupload bukti pembayaran dalam kurang lebih 15 menit
Pembayaran dibatalkan: Pelanggan belum mengupload bukti pembayaran lewat dari 15 menit atau pelanggan membatalkan pesanan dari halaman pesanan, ataupun menghapus pesanan dari halaman pesanan (pelanggan crud pesanan di halaman pesanan)

Admin juga dapat memberi komentar terhadap bukti pembayaran pelanggan, yang dapat dikirim langsung ke pelanggan, namun fitur ini seharusnya membuat fitur notifikasi terlebih dahulu, tetapi nanti saja, buat komentar ini dapat dilihat di riwayat pemesanan pelanggan



Untuk data pesanan setiap pelanggan selesai memencet tombol konfirmasi pembayaran dari halaman keranjang, seharusnya status pesanan awalnya "diproses" di halaman pesanan
Untuk pesanan setiap pelanggan selesai memencet tombol konfirmasi pembayaran dari halaman keranjang, seharusnya status pembayaran awalnya "menunggu pembayaran"