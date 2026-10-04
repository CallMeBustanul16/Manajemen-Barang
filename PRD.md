# PRD — Sistem Manajemen Barang (Inventory Management System)

> **Dokumen**: Product Requirements Document (PRD)
> **Versi**: 1.0
> **Terakhir Diperbarui**: Oktober 2026
> **Status**: Live / Production-ready
> **Repository**: [CallMeBustanul16/Manajemen-Barang](https://github.com/CallMeBustanul16/Manajemen-Barang)

---

## 1. Ringkasan Eksekutif

**Manajemen Barang** adalah sistem manajemen inventaris berbasis web yang dirancang untuk membantu bisnis atau gudang dalam mengelola produk, stok, batch/kardus barang, dan transaksi keluar-masuk barang secara real-time. Sistem ini dilengkapi fitur QR Code scanning, laporan ekspor, dan dashboard ringkasan inventaris.

### Problem Statement
Banyak bisnis skala kecil-menengah masih mengelola stok barang secara manual (spreadsheet atau catatan fisik), yang rentan terhadap kesalahan, tidak real-time, dan sulit dilacak riwayatnya. Sistem ini hadir sebagai solusi digital yang efisien dan terpusat.

### Target Pengguna
- **Admin Gudang** — mengelola seluruh data produk, stok, dan batch
- **Operator Stok** — melakukan pencatatan stok masuk dan keluar
- **Manajer** — memantau dashboard, laporan, dan peringatan stok rendah

---

## 2. Tech Stack

### Backend

| Komponen | Teknologi |
|---|---|
| Framework | Laravel 13 (PHP 8.2+) |
| Autentikasi | Laravel Sanctum (Token-based API) |
| Database | SQLite (dev) / MySQL (prod) |
| QR Code | endroid/qr-code v5 |
| Export Excel | maatwebsite/excel v4 |
| Export PDF | barryvdh/laravel-dompdf v3 |
| ORM | Eloquent |

### Frontend

| Komponen | Teknologi |
|---|---|
| Framework | React 19 + Vite 8 |
| Routing | React Router DOM v7 |
| Styling | Tailwind CSS v4 |
| UI Icons | Lucide React |
| Animasi | GSAP, AOS, Anime.js |
| Chart | Chart.js + react-chartjs-2 |
| QR Scanner | html5-qrcode |
| Alert Dialog | SweetAlert2 |
| HTTP Client | Fetch API (native) |

---

## 3. Arsitektur Sistem

```
FRONTEND (React SPA)
  Dashboard | Produk | Batch | Scanner | Stok | Kategori | Pemasok | Laporan
       |
       | REST API (JSON) + Bearer Token (Sanctum)
       |
BACKEND (Laravel API)
  AuthController | ProdukController | StokController | QrController | BatchController
       |
DATABASE (SQLite/MySQL)
  users | produk | batch | kategori | pemasok | stok_transaksi | sisa_stok
```

---

## 4. Model Data (Entity Relationship)

| Entitas | Kolom Kunci | Relasi |
|---|---|---|
| users | id, name, email, password | Punya banyak StokTransaksi |
| produk | id, nama_produk, sku, qr_code, stok, stok_minimal, kategori_id, pemasok_id | Milik Kategori & Pemasok, Punya Batch & Transaksi |
| kategori | id, nama_kategori | Punya banyak Produk |
| pemasok | id, nama_pemasok | Punya banyak Produk |
| batch | id, produk_id, qr_code, jumlah_awal, stok_saat_ini, tanggal_masuk, tanggal_kadaluarsa, lokasi_rak | Milik Produk, Punya Transaksi |
| stok_transaksi | id, produk_id, batch_id, user_id, tipe, jumlah, catatan, tanggal | Log setiap pergerakan stok |
| sisa_stok | id, produk_id | Snapshot stok per produk |

---

## 5. Fitur & Fungsionalitas

### 5.1 Autentikasi
- Login via email & password, token Sanctum disimpan di localStorage
- Logout (revoke token di server)
- Route Guard (PrivateRoute) — redirect ke /login jika tidak terautentikasi
- UI: Card merah-putih minimalis, show/hide password, loading spinner

### 5.2 Dashboard
Memberikan gambaran ringkas kondisi inventaris secara real-time.

**Stat Cards:**
| Kartu | Deskripsi |
|---|---|
| Total Produk | Jumlah item produk terdaftar |
| Total Kategori | Jumlah kategori aktif |
| Total Pemasok | Jumlah pemasok terdaftar |
| Stok Menipis | Produk dengan stok <= stok_minimal (warning amber) |
| Stok Habis | Produk dengan stok = 0 (danger rose) |

**Komponen Tambahan:**
- StokAlert — Banner peringatan produk stok rendah
- StokChart — Diagram distribusi stok per kategori (Chart.js)
- Aksi Cepat — Shortcut ke Tambah Produk, Stok Masuk, Stok Keluar, Kategori
- Log Aktivitas — 10 transaksi stok terakhir
- Refresh Button — Update manual data dashboard + timestamp

### 5.3 Manajemen Produk
CRUD lengkap data produk:
- Nama Produk, SKU (unik), Deskripsi
- Kategori & Pemasok (dropdown relasi)
- Stok Aktual & Stok Minimal
- QR Code (generate & preview)

Fitur Khusus:
- **QR Code Pop-up Modal** — Klik "Generate" atau "Lihat QR" langsung muncul modal preview gambar QR
- **Auto-generate QR** — File PNG dibuat ulang otomatis jika hilang dari server
- **Unduh QR** — Tombol download ada di dalam modal
- **Pencarian** — Filter berdasarkan nama atau SKU (real-time, useMemo)
- **Pagination** — 10 produk per halaman
- **Status Stok** — Badge Aman / Menipis / Habis per produk

### 5.4 Manajemen Kategori
- CRUD kategori produk
- Relasi one-to-many dengan Produk

### 5.5 Manajemen Pemasok
- CRUD data pemasok/supplier
- Relasi one-to-many dengan Produk

### 5.6 Manajemen Batch
Melacak barang berdasarkan batch/kardus/lot dengan QR Code per batch.

Atribut: Produk, Jumlah Awal & Stok Saat Ini, Tanggal Masuk & Kadaluarsa, Lokasi Rak, QR Code

Fitur:
- CRUD Batch, QR Code per Batch (generate & download)
- Scan Batch via QR, Detail & Riwayat Batch
- Export Excel dengan filter produk
- Filter, pencarian, dan pagination

### 5.7 Manajemen Stok
Mencatat setiap pergerakan stok masuk dan keluar.

- Stok Masuk: pilih produk & batch, input jumlah & catatan
- Stok Keluar: pilih produk & batch, validasi stok tidak minus
- Riwayat: log lengkap dengan filter tanggal, tipe, produk
- Export: Excel & PDF dengan ringkasan total masuk/keluar/selisih

### 5.8 Scanner QR Code
- Scan QR Code fisik via kamera (html5-qrcode)
- Identifikasi batch otomatis dari hasil scan
- Modal form pencatatan stok masuk/keluar setelah scan berhasil

### 5.9 Laporan
- Generate laporan stok dengan filter rentang tanggal, tipe, produk
- Export ke Excel (.xlsx) atau PDF (.pdf)

---

## 6. API Endpoints

### Publik
| Method | Endpoint | Fungsi |
|---|---|---|
| POST | /api/login | Login, returns token |

### Terproteksi (Bearer Token)

#### Auth & User
| Method | Endpoint | Fungsi |
|---|---|---|
| POST | /api/logout | Logout |
| GET | /api/user | Info user login |
| CRUD | /api/users | Manajemen user |

#### Produk, Kategori, Pemasok
| Method | Endpoint | Fungsi |
|---|---|---|
| CRUD | /api/produk | Manajemen produk |
| CRUD | /api/kategori | Manajemen kategori |
| CRUD | /api/pemasok | Manajemen pemasok |
| GET | /api/produk/{id}/history | Riwayat transaksi produk |

#### Stok
| Method | Endpoint | Fungsi |
|---|---|---|
| POST | /api/stok/masuk | Catat stok masuk |
| POST | /api/stok/keluar | Catat stok keluar |
| GET | /api/stok/history | Riwayat stok |
| GET | /api/stok/summary | Ringkasan stok |

#### Batch
| Method | Endpoint | Fungsi |
|---|---|---|
| CRUD | /api/batch | Manajemen batch |
| GET | /api/batch/{id}/history | Riwayat batch |
| GET | /api/batch/scan/{qrCode} | Identifikasi batch via QR |

#### QR Code
| Method | Endpoint | Fungsi |
|---|---|---|
| POST | /api/produk/{id}/generate-qr | Generate/pastikan QR produk |
| GET | /api/produk/{id}/download-qr | Download PNG QR produk |
| DELETE | /api/produk/{id}/delete-qr | Hapus QR produk |
| POST | /api/batch/{id}/generate-qr | Generate QR batch |
| GET | /api/batch/{id}/download-qr | Download PNG QR batch |

#### Export
| Method | Endpoint | Fungsi |
|---|---|---|
| GET | /api/stok/export/excel | Export stok ke Excel |
| GET | /api/stok/export/pdf | Export stok ke PDF |
| GET | /api/batch/export/excel | Export batch ke Excel |

#### Dashboard
| Method | Endpoint | Fungsi |
|---|---|---|
| GET | /api/dashboard/stats | Stat cards |
| GET | /api/dashboard/recent-activities | 10 aktivitas terakhir |
| GET | /api/dashboard/stok-chart | Data chart distribusi stok |
| GET | /api/dashboard/low-stock | Produk stok rendah |

---

## 7. Halaman & Routing

| Route | Komponen | Deskripsi |
|---|---|---|
| /login | Auth/login.jsx | Halaman masuk |
| /dashboard | dashboard.jsx | Dashboard utama |
| /produk | Produk/Index.jsx | Daftar produk |
| /produk/create | Produk/Create.jsx | Form tambah produk |
| /produk/edit/:id | Produk/Edit.jsx | Form edit produk |
| /kategori | Kategori/Index.jsx | Daftar kategori |
| /kategori/create | Kategori/Create.jsx | Form tambah kategori |
| /pemasok | Pemasok/Index.jsx | Daftar pemasok |
| /pemasok/create | Pemasok/Create.jsx | Form tambah pemasok |
| /stok | Stok/Index.jsx | Riwayat transaksi stok |
| /stok/masuk | Stok/Masuk.jsx | Form stok masuk |
| /stok/keluar | Stok/Keluar.jsx | Form stok keluar |
| /batch | Batch/Index.jsx | Daftar batch |
| /batch/create | Batch/Create.jsx | Form tambah batch |
| /batch/edit/:id | Batch/Edit.jsx | Form edit batch |
| /batch/detail/:id | Batch/Detail.jsx | Detail batch |
| /batch/history/:id | Batch/History.jsx | Riwayat batch |
| /scan | Scanner/Index.jsx | QR Code scanner |
| /laporan | Laporan/Index.jsx | Export laporan |

---

## 8. Desain & UI/UX

### Prinsip Desain
- Merah & Putih sebagai tema warna utama brand (red-600, white, slate-50)
- Dark Mode didukung penuh melalui DarkModeContext
- Responsive — Mobile-first, layout card untuk mobile & tabel untuk desktop
- Minimalis & Clean — Fokus pada keterbacaan data

### Komponen Utama
- MainLayout — Sidebar navigasi + header top bar
- Sidebar — Menu navigasi utama dengan highlight aktif
- Modal — Dialog konfirmasi, form inline, QR preview
- SweetAlert2 — Notifikasi sukses/error/konfirmasi
- StokChart — Pie/donut chart distribusi stok per kategori
- StokAlert — Banner peringatan stok menipis/habis

---

## 9. Persyaratan Non-Fungsional

| Aspek | Requirement |
|---|---|
| Keamanan | Semua endpoint (kecuali login) dilindungi Sanctum Bearer Token |
| Performa | Data di-cache dengan useMemo; filter & pagination lokal |
| Responsif | Mobile <=768px, Tablet, Desktop >=1024px |
| Offline Storage | Token & data user disimpan di localStorage |
| QR Reliability | File PNG di-auto-generate ulang jika hilang dari disk |
| Error Handling | Semua error API ditangkap dan ditampilkan via SweetAlert2 |

---

## 10. Keterbatasan & Catatan Teknis

- **Single Role**: Semua user login memiliki akses yang sama (belum ada role admin/operator)
- **SQLite Default**: Database default adalah SQLite; perlu migrasi ke MySQL untuk produksi
- **Vercel Incompatible**: Tidak didukung deployment Vercel karena butuh PHP runtime (gunakan Railway, Render, atau VPS)
- **Token Expiry**: Token Sanctum tidak expire otomatis; perlu konfigurasi expiration di Sanctum config
- **No Email Verification**: Tidak ada fitur reset password atau verifikasi email

---

## 11. Roadmap Pengembangan (Usulan)

| Prioritas | Fitur | Estimasi |
|---|---|---|
| High | Role & Permission (Admin, Operator, Viewer) | Sprint 1 |
| High | Reset Password via Email | Sprint 1 |
| Medium | Notifikasi real-time stok rendah (Push/Email) | Sprint 2 |
| Medium | Multi-gudang / Multi-lokasi | Sprint 2 |
| Medium | Barcode support (selain QR) | Sprint 2 |
| Low | PWA / Mobile App Wrapper | Sprint 3 |
| Low | Dashboard analytics lebih detail (grafik tren) | Sprint 3 |
| Low | Integrasi POS / e-commerce | Sprint 4 |

---

## 12. Cara Menjalankan

```bash
# Clone repo
git clone https://github.com/CallMeBustanul16/Manajemen-Barang.git
cd Manajemen-Barang

# Install PHP dependencies
composer install

# Setup environment
cp .env.example .env
php artisan key:generate

# Database setup
php artisan migrate --force
php artisan db:seed

# Storage link untuk QR Code
php artisan storage:link

# Install Node dependencies & build assets
npm install
npm run build

# Jalankan server
php artisan serve
```

**Default Akun Admin:**
- Email: `admin@admin.com`
- Password: `password`

---

*Dokumen ini dibuat berdasarkan analisis kode sumber project Manajemen Barang — Oktober 2026.*
