```markdown
# Admin Dashboard Toko (Node.js & EJS)

Sistem admin page sederhana untuk manajemen inventaris dan pembelian toko. Aplikasi ini dibangun dengan Node.js, Express, dan EJS untuk *templating*, serta menggunakan SQLite sebagai database.

## Fitur

* **Manajemen Stok:** Melihat daftar semua produk dan sisa stok.
* **Input Pembelian:** Menambahkan data pembelian baru. Stok produk akan otomatis berkurang (transaksional).
* **Pembatalan Pembelian:** Membatalkan pembelian yang sudah ada. Stok produk akan otomatis dikembalikan (transaksional).
* **Database Sederhana:** Menggunakan SQLite, tidak perlu instalasi server database.

## Teknologi yang Digunakan

* **Node.js**
* **Express.js**
* **EJS (Embedded JavaScript)**
* **SQLite** (`sqlite3`)

## Persiapan dan Instalasi

Untuk menjalankan proyek ini di komputer lokal Anda, ikuti langkah-langkah berikut:

### 1. Kloning Repositori

```bash
git clone https://github.com/NAMA-ANDA/NAMA-REPO-ANDA.git
cd NAMA-REPO-ANDA
```

### 2. Instalasi Dependensi

```bash
npm install
```

### 3. Inisialisasi Database (Hanya 1x)

Sebelum menjalankan server, Anda harus membuat dan mengisi database. Jalankan file `init-db.js` satu kali:

```bash
node init-db.js
```

Perintah ini akan membuat file `toko.db` dan mengisinya dengan 10 produk awal.

### 4. Jalankan Server

Setelah database siap, jalankan server Express:

```bash
node index.js
```

Buka http://localhost:3000 di browser Anda untuk mengakses dashboard admin.

## Struktur Database

Aplikasi ini menggunakan dua tabel utama:

### 1. Produk

* `id` (INTEGER, Primary Key)
* `nama` (TEXT)
* `stok` (INTEGER)

### 2. Pembelian

* `id` (INTEGER, Primary Key)
* `produk_id` (FOREIGN KEY ke Produk)
* `jumlah_beli` (INTEGER)
* `tanggal` (DATETIME)
* `status` (TEXT) - ('COMPLETED' atau 'CANCELLED')
```
