# PRD — Sistem Manajemen Barang (Inventory Management System)

> **Dokumen**: Product Requirements Document (PRD)  
> **Versi**: 2.5.0  
> **Terakhir Diperbarui**: Oktober 2026  
> **Status**: Live / Production-ready  
> **Repository**: [CallMeBustanul16/Manajemen-Barang](https://github.com/CallMeBustanul16/Manajemen-Barang)  

---

## 1. Ringkasan Eksekutif

**Manajemen Barang** adalah platform inventaris gudang berbasis web modern yang dirancang untuk mengotomasi dan menyederhanakan pengelolaan produk, stok, lot/batch kardus, serta alur transaksi keluar-masuk barang secara real-time. Sistem dilengkapi pemindai kamera QR Code, ekspor laporan multi-format (Excel & PDF), antarmuka dwibahasa (Indonesia & Inggris), manajemen profil pengguna, serta dashboard analitik terpadu dengan kemampuan pembaruan data otomatis (*auto-refresh*).

### Problem Statement
Pengelolaan inventaris berbasis manual atau spreadsheet rentan terhadap selisih stok (*stock discrepancy*), keterlambatan pembaruan data antar-shift gudang, risiko kehilangan dokumen fisik, serta lambatnya proses audit. Sistem ini mengintegrasikan seluruh titik operasional ke dalam satu basis data terpusat yang aman, cepat, dan terukur.

### Target Pengguna & Peran (Role)
- **Admin Gudang** — Memiliki akses penuh terhadap seluruh fitur: master data produk, kategori, pemasok, batch, mutasi stok, laporan eksekutif, serta pengaturan sistem dan preferensi pengguna.
- **Operator Stok / Petugas** — Bertugas mencatat mutasi stok masuk/keluar harian, mengoperasikan scanner QR Code fisik, dan memverifikasi isi batch barang di rak penyimpanan.
- **Manajer / Supervisor** — Memantau performa pergudangan melalui grafik analitik dashboard, nilai estimasi persediaan, dan peringatan stok kritis (*low stock alerts*).

---

## 2. Tech Stack

### Backend

| Komponen | Teknologi | Deskripsi |
|---|---|---|
| Framework | Laravel 13 (PHP 8.2+) | RESTful API engine & routing |
| Autentikasi | Laravel Sanctum | Token-based API authentication |
| Database | SQLite (Dev) / MySQL (Prod) | Relational database & migrations |
| Cache & Storage | Laravel Cache & File Storage | Penyimpanan preferensi sistem & media foto/QR |
| QR Code Engine | `endroid/qr-code` v5 | Generator gambar QR Code produk & batch |
| Export Excel | `maatwebsite/excel` v4 | Generator spreadsheet laporan stok |
| Export PDF | `barryvdh/laravel-dompdf` v3 | Generator dokumen PDF resmi berformat cetak |
| ORM | Eloquent ORM | Query builder, relasi model, & soft lifecycle |

### Frontend

| Komponen | Teknologi | Deskripsi |
|---|---|---|
| Framework | React 19 + Vite 8 | Single Page Application (SPA) ultra-cepat |
| Routing | React Router DOM v7 | Client-side routing dengan `PrivateRoute` guard |
| Styling | Tailwind CSS v4 | Utilitas styling modern & responsive |
| Theme System | DarkModeContext | Toggle Mode Terang (Light), Gelap (Dark), & Sistem |
| Multi-Language (i18n) | LanguageContext | Dukungan bahasa Indonesia 🇮🇩 dan English (US) 🇺🇸 |
| UI Icons | Lucide React | Ikonografi vektor yang konsisten dan ringan |
| Animasi & Transisi | GSAP, AOS, Anime.js | Animasi interaksi micro-interaction halus |
| Data Visualization | Chart.js + react-chartjs-2 | Diagram lingkaran stok kategori & grafik garis arus barang |
| QR Scanner | html5-qrcode | Pemindai QR Code langsung melalui kamera perangkat |
| Dialog & Notifikasi | SweetAlert2 | Modal peringatan, konfirmasi aksi, dan toast respon |
| HTTP Client | Fetch API (native) | Permintaan jaringan terproteksi Bearer token |

---

## 3. Arsitektur Sistem

```
+-----------------------------------------------------------------------------------+
|                            FRONTEND (React 19 SPA)                                |
|  Dashboard | Produk | Batch | Scanner QR | Stok Mutasi | Profil | Pengaturan | Lap |
+-----------------------------------------------------------------------------------+
                                       |
                   RESTful API (JSON) + Sanctum Bearer Token
                                       |
+-----------------------------------------------------------------------------------+
|                            BACKEND (Laravel 13 API)                               |
|  AuthController | ProdukController | StokController | BatchController | QrService |
|  ProfileController | SettingsController | KategoriController | PemasokController  |
+-----------------------------------------------------------------------------------+
                                       |
                          Eloquent ORM / DB Engine
                                       |
+-----------------------------------------------------------------------------------+
|                        DATABASE & PERSISTENCE STORAGE                             |
|  users | produk | batch | kategori | pemasok | stok_transaksi | sisa_stok | cache  |
+-----------------------------------------------------------------------------------+
```

---

## 4. Model Data & Skema Database

| Entitas | Kolom Kunci | Keterangan & Relasi |
|---|---|---|
| **users** | `id`, `name`, `email`, `role`, `password`, `created_at` | Pengguna sistem; role: `admin` / `petugas`. Relasi ke transaksi stok. |
| **produk** | `id`, `nama_produk`, `sku`, `qr_code`, `stok`, `stok_minimal`, `kategori_id`, `pemasok_id` | Master barang inventaris; berelasi Many-to-One dengan `kategori` dan `pemasok`. |
| **kategori** | `id`, `nama_kategori`, `created_at` | Klasifikasi barang; berelasi One-to-Many dengan `produk`. |
| **pemasok** | `id`, `nama_pemasok`, `kontak`, `alamat` | Vendor penyedia produk; berelasi One-to-Many dengan `produk`. |
| **batch** | `id`, `produk_id`, `qr_code`, `kapasitas`, `jumlah_awal`, `stok_saat_ini`, `tanggal_masuk`, `tanggal_kadaluarsa`, `lokasi_rak` | Lot/kardus spesifik per produk untuk pelacakan tanggal dan penempatan rak. |
| **stok_transaksi** | `id`, `produk_id`, `batch_id`, `user_id`, `tipe`, `jumlah`, `catatan`, `scan_mode`, `tanggal` | Buku kas mutasi stok (masuk/keluar); mencatat riwayat operator dan mode scan. |
| **sisa_stok** | `id`, `produk_id`, `total_stok`, `updated_at` | Snapshot agregat stok produk untuk integritas data instan. |

---

## 5. Fitur & Fungsionalitas Utama

### 5.1 Autentikasi & Akun Pengguna
- **Login & Sesi Terproteksi**: Masuk menggunakan email dan password, token Sanctum disimpan pada `localStorage`.
- **Route Guard (`PrivateRoute`)**: Memblokir akses halaman internal dan mengarahkan pengguna tanpa token ke `/login`.
- **Header Profile Widget**: Menampilkan foto avatar, nama akun, badge role, tombol cepat notifikasi, dan dropdown menu.
- **Halaman Profil Saya (`/profil`)**:
  - *Tab Informasi Akun*: Nama lengkap, email, peran, tanggal bergabung (terformat otomatis sesuai preferensi akun), total login, dan upload foto avatar pengguna (`/api/profile`).
  - *Tab Ubah Password*: Validasi password saat ini, pembuatan kata sandi baru (min. 8 karakter), dan konfirmasi password (`/api/profile/password`).
  - *Tab Preferensi Pengguna (Points 2 - 6)*:
    1. **Mode Konfirmasi Transaksi Stok (Point 2)**:
       - *Mode Aman (Direkomendasikan)*: Memunculkan pop-up modal SweetAlert konfirmasi sebelum mutasi stok masuk atau keluar dieksekusi ke database untuk meminimalisasi kesalahan input operator.
       - *Mode Cepat (Instan)*: Melewati pop-up konfirmasi dan langsung mengirim transaksi mutasi seketika, meningkatkan efisiensi kerja operator gudang berpengalaman. Terintegrasi langsung pada `Stok/Masuk.jsx` dan `Stok/Keluar.jsx`.
    2. **Format Tampilan Tanggal Akun (Point 3)**:
       - Opsi format: `DD/MM/YYYY` (Standar Indonesia), `YYYY-MM-DD` (Standar ISO), dan `DD MMMM YYYY` (Format Panjang).
       - Dilengkapi kotak *Live Preview* contoh tanggal dan langsung merefleksikan tanggal bergabung akun secara dinamis di kartu profil.
    3. **Email Rekap Ringkasan Harian (Daily Digest) (Point 4)**:
       - Toggle pengaktifan otomatis rangkuman aktivitas mutasi stok masuk dan keluar yang dikirimkan ke email terdaftar di akhir jam kerja gudang.
    4. **Efek Suara Notifikasi Desktop (Point 5)**:
       - Audio chime feedback dua nada harmonis (659.25Hz & 987.77Hz) berbasis Web Audio API tanpa dependensi file eksternal.
       - Berbunyi saat peringatan sistem dipicu atau panel notifikasi lonceng di header dibuka.
       - Dilengkapi tombol interaktif "Uji Suara" untuk pengujian langsung oleh pengguna.
    5. **Penyimpanan Nyata & Auto-Save Realtime (Point 6)**:
       - Menerapkan prinsip modern *Auto-Save on Change (Tersimpan Otomatis Real-time)* tanpa memerlukan tombol simpan manual.
       - Setiap perubahan toggle, pilihan mode transaksi, atau format tanggal langsung disinkronkan seketika ke `localStorage` (`userPreferences`) dan server backend `/api/profile/preferences` (Laravel Cache).
       - Dilengkapi indikator badge status *Auto-Save* hijau (`🟢 Tersimpan otomatis` / `Perubahan tersimpan`) dan memancarkan event `user-preferences-changed` secara real-time ke seluruh komponen aktif.

### 5.2 Dashboard Real-Time & Pembaruan Otomatis
Pusat kendali visual kondisi operasional gudang secara langsung dari database:
- **4 Kartu Statistik Utama (Simetris & 100% Real-Time Database)**:
  1. *Total Produk* — Jumlah seluruh item produk terdaftar.
  2. *Total Stok* — Akumulasi kuantitas unit (mendukung masking `••••••` saat fitur privasi aktif).
  3. *Stok Menipis* — Jumlah produk yang berada di bawah ambang batas minimum (*warning alert*).
  4. *Stok Habis* — Jumlah produk dengan sisa stok 0 unit (*danger alert*).
- **Fitur Refresh Otomatis Dashboard (5 Menit)**:
  - Polling data background otomatis setiap 5 menit (300.000 ms) saat diaktifkan di menu Pengaturan.
  - Berjalan secara *silent* tanpa memunculkan skeleton loader yang mengganggu pandangan pengguna.
  - **Indikator Visual di Header**:
    - 🟢 *Auto-Refresh Aktif (5m)* dengan animasi kedip (*pulsing ping*) dan jam pembaruan terakhir.
    - ⚪ *Auto-Refresh Nonaktif* saat dinonaktifkan.
    - Tombol manual refresh (`RotateCw`) untuk pembaruan paksa secara instan.
- **Stok Kategori Chart**: Visualisasi distribusi kuantitas stok per kategori menggunakan Chart.js.
- **Tabel Stok Menipis**: Menampilkan 5 produk dengan stok terendah lengkap dengan ikon kontekstual per jenis barang dan status badge (*Habis* / *Menipis*).
- **Grafik Pergerakan Stok (Movement Chart)**: Grafik mingguan pembanding volume barang masuk vs barang keluar.
- **Log Aktivitas Terbaru**: Catatan 10 aktivitas mutasi stok terakhir dengan informasi waktu relatif dan operator.
- **Widget Aksi Cepat**: Akses 1-klik untuk tambah produk, input stok masuk, input stok keluar, dan tambah kategori.

### 5.3 Pengaturan Sistem & Preferensi (`/pengaturan`)
Menu kustomisasi lengkap yang menerapkan prinsip modern **Auto-Save on Change (Tersimpan Otomatis Real-time)** tanpa memerlukan tombol simpan manual, dilengkapi indikator status visual halus (*Auto-save badge*):
- **Tampilan & Tema**: Pilihan tema *Terang (Light)*, *Gelap (Dark)*, dan *Sistem* dengan mockup preview visual.
- **Bahasa & Lokalisasi**: Penggantian instan antara Bahasa Indonesia 🇮🇩 dan English (US) 🇺🇸 tanpa reload halaman.
- **Pengaturan Lainnya**:
  - *Refresh otomatis dashboard*: Toggle pengaktifan interval sinkronisasi data 5 menit.
  - *Tampilkan jumlah stok*: Toggle penyembunyian/penampilan kuantitas angka stok untuk privasi presentasi.
- **Preferensi Notifikasi**: Toggle peringatan stok kritis, notifikasi mutasi transaksi, dan suara efek scanner.
- **Keamanan Sistem**: Pemilihan batas waktu sesi (*session timeout* 30m, 60m, 120m, 480m) dan Two-Factor Authentication (2FA).
- **Tentang Sistem**: Informasi versi build (v2.4.0), database driver, frontend/backend framework, dan status API.

### 5.4 Manajemen Produk
- **CRUD Produk**: Nama, SKU unik, deskripsi, pemilihan kategori dan pemasok, stok awal, serta stok minimal.
- **Pop-up Modal QR Code**: Klik "Generate" atau "Lihat QR" langsung menampilkan dialog modal visual gambar QR tanpa wajib unduh terlebih dahulu.
- **Auto-Generate & Unduh QR**: File PNG QR Code dibuat otomatis jika belum tersedia dan dapat diunduh langsung dalam format PNG berkualitas tinggi.
- **Filter & Pencarian Instan**: Pencarian berbasis nama dan SKU secara lokal via `useMemo` tanpa jeda jaringan.

### 5.5 Manajemen Batch & Kardus
- Pelacakan barang spesifik per lot/kardus dengan atribut: Produk, Kapasitas, Jumlah Awal, Stok Saat Ini, Lokasi Rak, Tanggal Masuk, dan Tanggal Kadaluarsa.
- Generate QR Code unik per batch.
- Pencarian dan filter produk batch, serta riwayat mutasi per batch.

### 5.6 Mutasi Stok (Masuk & Keluar)
- **Stok Masuk**: Penambahan stok barang ke batch tertentu dengan catatan penerimaan dari pemasok.
- **Stok Keluar**: Pengurangan stok barang dari batch tertentu dengan validasi proteksi anti-minus.
- **Riwayat Transaksi**: Log pencatatan lengkap dengan filter rentang tanggal, jenis transaksi, dan produk.

### 5.7 Scanner QR Code Fisik
- Pemindaian kode QR langsung melalui kamera laptop/smartphone dengan modul `html5-qrcode`.
- Pengenalan otomatis QR Batch atau QR Produk untuk langsung membuka formulir transaksi masuk/keluar.

### 5.8 Ekspor & Pelaporan Data
- Laporan inventaris berkala berdasarkan filter tanggal, jenis transaksi, dan produk.
- Ekspor tabel ke file Microsoft Excel (`.xlsx`) via `maatwebsite/excel`.
- Ekspor laporan berformat cetak dokumen resmi PDF (`.pdf`) via `barryvdh/laravel-dompdf`.

### 5.9 Pengaturan Lanjutan & Personalisasi Gudang (v2.4.0)
1. **Interval Waktu Auto-Refresh Dinamis**: Pilihan jeda polling otomatis (1, 3, 5, 10 menit) dengan indikator badge waktu real-time di header dashboard.
2. **Konfigurasi Scanner QR & Kamera**: 
   - Efek suara konfirmasi beep (880 Hz) menggunakan Web Audio API tanpa dependensi file eksternal.
   - Pilihan kamera default (kamera belakang / *environment* vs kamera depan / *user*).
   - Opsi pembukaan otomatis pop-up transaksi mutasi saat QR berhasil dipindai.
3. **Ambang Batas Peringatan Kadaluarsa Batch**: Pemantauan usia kedaluwarsa produk batch (7, 14, 30, 60 hari) disertai lencana visual status (*Expired*, *Warning H-X*, *Aman*) pada tabel batch.
4. **Standardisasi Kode & Prefix Gudang**: Prefix otomatis untuk SKU Produk (contoh: `PRD-`) dan Lot Batch (contoh: `LOT-`) pada pembuatan formulir baru dan pembuatan QR code.
5. **Default Baris per Halaman (Paginasi)**: Konfigurasi jumlah baris per halaman (10, 25, 50, 100 baris) yang langsung sinkron secara reaktif ke semua tabel (Produk, Batch, Mutasi Stok, Kategori, Pemasok).
6. **Kerapatan Baris & Urutan Default Data Tabel**:
   - **Kerapatan Baris Tabel (Row Density)**: Pilihan kerapatan baris tabel *Normal / Nyaman (Standar)* vs *Ringkas / Padat (Lebih Banyak Data)* untuk memaksimalkan jumlah baris inventaris yang muat dalam satu layar tanpa scroll berlebih.
   - **Urutan Default Data Tabel (Default Sort Order)**: Pilihan urutan data produk otomatis (*Terbaru Ditambahkan*, *Stok Menipis Dahulu / Prioritas Restock*, *Stok Terbanyak Dahulu*, dan *Nama Produk A-Z*) secara reaktif via `useMemo`.
7. **Penyimpanan Otomatis Real-Time (Auto-Save)**: Pengaturan disimpan seketika ke `localStorage` dan server Cache Laravel saat nilai diubah dengan indikator animasi tersimpan tanpa perlu tombol manual.

---

## 6. Daftar API Endpoints

### 6.1 Publik
| Method | Endpoint | Fungsi |
|---|---|---|
| `POST` | `/api/login` | Autentikasi user & pemberian Sanctum bearer token |

### 6.2 Terproteksi (Bearer Token Sanctum)

#### Profil & Preferensi Pengguna
| Method | Endpoint | Fungsi |
|---|---|---|
| `POST` | `/api/logout` | Revoke token sesi aktif |
| `GET` | `/api/user` | Mendapatkan data akun yang sedang login |
| `GET` | `/api/profile` | Mengambil detail profil pengguna lengkap beserta tanggal bergabung ISO |
| `POST` | `/api/profile` | Memperbarui nama dan email pengguna |
| `POST` | `/api/profile/password` | Memvalidasi dan mengubah password akun |
| `GET` | `/api/profile/preferences` | Mengambil preferensi akun pengguna (konfirmasi stok, format tanggal, daily digest, suara) |
| `POST` | `/api/profile/preferences` | Menyimpan preferensi akun pengguna ke server Cache Laravel |
| `GET, POST, PUT, DELETE` | `/api/users` | Manajemen pengguna oleh admin |

#### Pengaturan Sistem
| Method | Endpoint | Fungsi |
|---|---|---|
| `GET` | `/api/settings` | Mengambil preferensi sistem (tema, bahasa, auto_refresh, dsb.) |
| `POST` | `/api/settings` | Menyimpan preferensi sistem ke server-side cache |

#### Dashboard
| Method | Endpoint | Fungsi |
|---|---|---|
| `GET` | `/api/dashboard/stats` | Agregat 5 kartu statistik dan tren data |
| `GET` | `/api/dashboard/stok-chart` | Distribusi kuantitas stok per kategori |
| `GET` | `/api/dashboard/low-stock` | Daftar produk dengan stok menipis / kritis |
| `GET` | `/api/dashboard/movement-chart` | Data pergerakan stok masuk vs keluar mingguan |
| `GET` | `/api/dashboard/recent-activities` | 10 riwayat transaksi mutasi terakhir |

#### Produk, Kategori, & Pemasok
| Method | Endpoint | Fungsi |
|---|---|---|
| `CRUD` | `/api/produk` | Manajemen data produk |
| `GET` | `/api/produk/{id}/history` | Riwayat mutasi stok per produk |
| `CRUD` | `/api/kategori` | Manajemen kategori barang |
| `CRUD` | `/api/pemasok` | Manajemen pemasok / vendor |

#### Batch & Kardus
| Method | Endpoint | Fungsi |
|---|---|---|
| `CRUD` | `/api/batch` | Manajemen lot/batch barang |
| `GET` | `/api/batch/{id}/history` | Riwayat mutasi pada batch tertentu |
| `GET` | `/api/batch/scan/{qrCode}` | Pencarian dan identifikasi batch via QR Code |
| `GET` | `/api/batch/produk/{id}/batches` | Daftar batch yang dimiliki oleh satu produk |

#### Layanan QR Code
| Method | Endpoint | Fungsi |
|---|---|---|
| `POST` | `/api/produk/{id}/generate-qr` | Generate file QR Code produk |
| `GET` | `/api/produk/{id}/download-qr` | Mengunduh file gambar PNG QR produk |
| `DELETE` | `/api/produk/{id}/delete-qr` | Menghapus file QR produk |
| `POST` | `/api/batch/{id}/generate-qr` | Generate file QR Code batch |
| `GET` | `/api/batch/{id}/download-qr` | Mengunduh file gambar PNG QR batch |

#### Transaksi Stok & Ekspor
| Method | Endpoint | Fungsi |
|---|---|---|
| `POST` | `/api/stok/masuk` | Catat transaksi barang masuk |
| `POST` | `/api/stok/keluar` | Catat transaksi barang keluar |
| `GET` | `/api/stok/history` | Riwayat log mutasi stok |
| `GET` | `/api/stok/summary` | Ringkasan akumulasi mutasi |
| `GET` | `/api/stok/export/excel` | Unduh file Excel laporan stok |
| `GET` | `/api/stok/export/pdf` | Unduh file PDF resmi laporan stok |
| `GET` | `/api/batch/export/excel` | Unduh file Excel laporan batch |

---

## 7. Struktur Halaman & Routing Frontend

| Route URL | Komponen Halaman | Deskripsi Fungsional |
|---|---|---|
| `/login` | `Auth/login.jsx` | Formulir masuk akun |
| `/` & `/dashboard` | `dashboard.jsx` | Dashboard analitik utama gudang |
| `/profil` & `/profile` | `Profile/ProfilePage.jsx` | Halaman kelola akun, avatar, dan kata sandi |
| `/pengaturan` & `/settings` | `Settings/SettingsPage.jsx` | Pengaturan tema, bahasa, auto-refresh, notifikasi |
| `/produk` | `Produk/Index.jsx` | Tabel master produk, pencarian, dan pop-up QR |
| `/produk/Create` | `Produk/Create.jsx` | Formulir registrasi produk baru |
| `/produk/Edit/:id` | `Produk/Edit.jsx` | Formulir pembaruan data produk |
| `/kategori` | `Kategori/Index.jsx` | Daftar kategori barang |
| `/kategori/Create` | `Kategori/Create.jsx` | Tambah kategori baru |
| `/kategori/Edit/:id` | `Kategori/Edit.jsx` | Edit kategori |
| `/pemasok` | `Pemasok/Index.jsx` | Daftar pemasok barang |
| `/pemasok/Create` | `Pemasok/Create.jsx` | Tambah pemasok baru |
| `/pemasok/Edit/:id` | `Pemasok/Edit.jsx` | Edit pemasok |
| `/batch` | `Batch/Index.jsx` | Tabel batch/lot kardus & lokasi rak |
| `/batch/Create` | `Batch/Create.jsx` | Registrasi batch baru |
| `/batch/Edit/:id` | `Batch/Edit.jsx` | Edit data batch |
| `/batch/Detail/:id` | `Batch/Detail.jsx` | Rincian kapasitas & sisa unit batch |
| `/batch/History/:id` | `Batch/History.jsx` | Riwayat alur mutasi pada batch |
| `/stok` | `Stok/Index.jsx` | Riwayat keluar-masuk stok barang |
| `/stok/masuk` | `Stok/Masuk.jsx` | Formulir pencatatan barang masuk |
| `/stok/keluar` | `Stok/Keluar.jsx` | Formulir pencatatan barang keluar |
| `/scan` | `Scanner/Index.jsx` | Antarmuka kamera pemindai QR Code |
| `/laporan` | `Laporan/Index.jsx` | Pusat filter dan unduh ekspor laporan |

---

## 8. Desain, Estetika, & UI/UX

- **Identitas Visual**: Skema warna modern bernuansa *Crimson & Clean Slate* (`red-600` / `red-700` dengan kontras putih bersih dan slate).
- **Full Dark Mode**: Pengaturan tema gelap terintegrasi penuh ke seluruh kartu, formulir, modal, dan tabel.
- **Reaktivitas Tanpa Refresh**: Pergantian bahasa (ID/EN) dan perubahan preferensi visual langsung diterapkan ke seluruh DOM secara instan tanpa reload browser.
- **Silent Background Syncing**: Pembaruan otomatis data dashboard tidak menyebabkan layar berkedip (*no full page flicker*).
- **Aksesibilitas & Feedback**: Menggunakan SweetAlert2 untuk konfirmasi destruktif (hapus data/logout) dan toast notifikasi sukses.

---

## 9. Persyaratan Non-Fungsional

1. **Keamanan**:
   - Seluruh route API operasional diproteksi middleware `auth:sanctum`.
   - Kata sandi dienkripsi menggunakan algoritma `Bcrypt` / `Argon2`.
   - Validasi ketat pada backend untuk mencegah injeksi data dan transaksi stok bernilai minus.
2. **Kinerja & Responsivitas**:
   - Asset frontend di-bundling menggunakan Vite 8 dengan optimasi kompresi gzip.
   - Paginasi data dan *debounce query* untuk kelancaran rendering di perangkat dengan spesifikasi rendah.
3. **Kompatibilitas Lintas Perangkat**:
   - Layout responsif optimal mulai dari layar ponsel (360px), tablet (768px), hingga monitor desktop (1920px+).

---

## 10. Cara Instalasi & Menjalankan Aplikasi

```bash
# 1. Clone repository
git clone https://github.com/CallMeBustanul16/Manajemen-Barang.git
cd Manajemen-Barang

# 2. Instal dependensi PHP (Laravel)
composer install

# 3. Konfigurasi environment
cp .env.example .env
php artisan key:generate

# 4. Migrasi dan seeding database
php artisan migrate --force
php artisan db:seed

# 5. Buat tautan storage untuk aset QR & Avatar
php artisan storage:link

# 6. Instal dependensi Node.js & build frontend
npm install
npm run build

# 7. Jalankan server lokal
php artisan serve
```

**Akun Bawaan (Default):**
- Email: `admin@admin.com` atau `admin@gmail.com`
- Password: `password`

---

*Dokumen ini diperbarui untuk mencerminkan status implementasi fitur Manajemen Barang v2.5.1 — Oktober 2026.*
