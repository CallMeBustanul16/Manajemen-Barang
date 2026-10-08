-- Database Dump for Manajemen Barang
-- Exported on: 2026-10-08 10:11:50
-- Compatible with SQLite and MySQL / MariaDB (XAMPP)

-- --------------------------------------------------------
-- Struktur tabel: users
-- --------------------------------------------------------
DROP TABLE IF EXISTS users;
CREATE TABLE "users" ("id" integer primary key autoincrement not null, "name" varchar not null, "email" varchar not null, "email_verified_at" datetime, "password" varchar not null, "remember_token" varchar, "created_at" datetime, "updated_at" datetime, "role" varchar check ("role" in ('admin', 'staff', 'manager')) not null default 'staff');

-- Data tabel: users (1 baris)
INSERT INTO users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at, role) VALUES ('1', 'Admin User', 'admin@admin.com', NULL, '$2y$12$S70r4QWAldjblaMIj5nraOZtfuPPyrWnaj6JA/acXo3XqWYm8NZWq', NULL, '2026-09-14 13:15:15', '2026-10-07 12:09:33', 'admin');

-- --------------------------------------------------------
-- Struktur tabel: kategori
-- --------------------------------------------------------
DROP TABLE IF EXISTS kategori;
CREATE TABLE "kategori" ("id" integer primary key autoincrement not null, "nama_kategori" varchar not null, "deskripsi" varchar, "slug" varchar not null, "created_at" datetime, "updated_at" datetime);

-- Data tabel: kategori (5 baris)
INSERT INTO kategori (id, nama_kategori, deskripsi, slug, created_at, updated_at) VALUES ('1', 'Elektronik', 'Kategori untuk produk elektronik seperti smartphone, laptop, dan perangkat elektronik lainnya.', 'elektronik', '2026-09-14 13:05:59', '2026-09-14 13:05:59');
INSERT INTO kategori (id, nama_kategori, deskripsi, slug, created_at, updated_at) VALUES ('2', 'Pakaian', 'Kategori untuk produk pakaian seperti baju, celana, dan aksesoris fashion.', 'pakaian', '2026-09-14 13:05:59', '2026-09-14 13:05:59');
INSERT INTO kategori (id, nama_kategori, deskripsi, slug, created_at, updated_at) VALUES ('3', 'Makanan & Minuman', 'Kategori untuk produk makanan dan minuman, termasuk makanan ringan dan minuman segar.', 'makanan-minuman', '2026-09-14 13:05:59', '2026-09-14 13:05:59');
INSERT INTO kategori (id, nama_kategori, deskripsi, slug, created_at, updated_at) VALUES ('4', 'Kecantikan & Perawatan Diri', 'Kategori untuk produk kecantikan dan perawatan diri seperti kosmetik, skincare, dan parfum.', 'kecantikan-perawatan-diri', '2026-09-14 13:05:59', '2026-09-14 13:05:59');
INSERT INTO kategori (id, nama_kategori, deskripsi, slug, created_at, updated_at) VALUES ('5', 'Buku & Alat Tulis', 'Kategori untuk produk buku dan alat tulis seperti buku pelajaran, pensil, dan buku gambar.', 'buku-alat-tulis', '2026-09-14 13:05:59', '2026-09-14 13:05:59');

-- --------------------------------------------------------
-- Struktur tabel: pemasok
-- --------------------------------------------------------
DROP TABLE IF EXISTS pemasok;
CREATE TABLE "pemasok" ("id" integer primary key autoincrement not null, "nama_pemasok" varchar not null, "alamat" varchar not null, "email" varchar not null, "telepon" varchar not null, "created_at" datetime, "updated_at" datetime);

-- Data tabel: pemasok (3 baris)
INSERT INTO pemasok (id, nama_pemasok, alamat, email, telepon, created_at, updated_at) VALUES ('1', 'PT. Elektronik Sejahtera', 'Jl. Elektronik No. 123, Jakarta', 'info@elektroniksejahtera.com', '081234567890', '2026-09-14 13:05:59', '2026-09-14 13:05:59');
INSERT INTO pemasok (id, nama_pemasok, alamat, email, telepon, created_at, updated_at) VALUES ('2', 'CV. Fashion Terbaru', 'Jl. Fashion No. 456, Bandung', 'info@fashionterbaru.com', '082345678901', '2026-09-14 13:06:00', '2026-09-14 13:06:00');
INSERT INTO pemasok (id, nama_pemasok, alamat, email, telepon, created_at, updated_at) VALUES ('3', 'PT. Makanan & Minuman Nusantara', 'Jl. Makanan No. 789, Surabaya', 'info@makananminumannusantara.com', '083456789012', '2026-09-14 13:06:00', '2026-09-14 13:06:00');

-- --------------------------------------------------------
-- Struktur tabel: produk
-- --------------------------------------------------------
DROP TABLE IF EXISTS produk;
CREATE TABLE "produk" ("id" integer primary key autoincrement not null, "nama_produk" varchar not null, "deskripsi" varchar, "sku" varchar not null, "stok" integer not null default '0', "stok_minimal" integer not null default '2', "created_at" datetime, "updated_at" datetime, "kategori_id" integer not null, "pemasok_id" integer not null, "qr_code" varchar, foreign key("kategori_id") references "kategori"("id") on delete cascade, foreign key("pemasok_id") references "pemasok"("id") on delete cascade);

-- Data tabel: produk (20 baris)
INSERT INTO produk (id, nama_produk, deskripsi, sku, stok, stok_minimal, created_at, updated_at, kategori_id, pemasok_id, qr_code) VALUES ('1', 'Smartphone XYZ', 'Smartphone terbaru dengan fitur canggih.', 'XYZ123', '50', '5', '2026-09-14 13:06:00', '2026-09-19 07:58:17', '1', '1', 'PRODUK-1-LfNL9HTb');
INSERT INTO produk (id, nama_produk, deskripsi, sku, stok, stok_minimal, created_at, updated_at, kategori_id, pemasok_id, qr_code) VALUES ('2', 'Baju Kemeja Pria', 'Kemeja pria dengan bahan berkualitas.', 'KEMEJA001', '100', '10', '2026-09-14 13:06:00', '2026-09-19 08:09:49', '2', '2', 'PRODUK-2-KBgneiqC');
INSERT INTO produk (id, nama_produk, deskripsi, sku, stok, stok_minimal, created_at, updated_at, kategori_id, pemasok_id, qr_code) VALUES ('3', 'Cokelat Premium', 'Cokelat premium dengan rasa lezat.', 'COKELAT001', '200', '20', '2026-09-14 13:06:00', '2026-09-19 10:30:11', '3', '3', 'PRODUK-3-r90odD4K');
INSERT INTO produk (id, nama_produk, deskripsi, sku, stok, stok_minimal, created_at, updated_at, kategori_id, pemasok_id, qr_code) VALUES ('4', 'Lipstik Matte', 'Lipstik matte dengan warna tahan lama.', 'LIPSTIK001', '150', '15', '2026-09-14 13:06:00', '2026-09-19 10:30:11', '4', '2', 'PRODUK-4-SKvmVoc0');
INSERT INTO produk (id, nama_produk, deskripsi, sku, stok, stok_minimal, created_at, updated_at, kategori_id, pemasok_id, qr_code) VALUES ('5', 'Buku Pelajaran Matematika', 'Buku pelajaran matematika untuk tingkat sekolah menengah.', 'BUKU001', '80', '8', '2026-09-14 13:06:00', '2026-09-19 10:30:11', '5', '3', 'PRODUK-5-XP7S5pNM');
INSERT INTO produk (id, nama_produk, deskripsi, sku, stok, stok_minimal, created_at, updated_at, kategori_id, pemasok_id, qr_code) VALUES ('6', 'Smartphone XYZ', 'Smartphone flagship terbaru dengan prosesor kencang.', 'ELK-SMART-001', '48', '10', '2026-10-05 05:47:00', '2026-10-05 05:47:00', '1', '1', NULL);
INSERT INTO produk (id, nama_produk, deskripsi, sku, stok, stok_minimal, created_at, updated_at, kategori_id, pemasok_id, qr_code) VALUES ('7', 'Mouse Wireless', 'Mouse wireless ergonomis 2.4GHz.', 'ELK-MOUSE-002', '4', '10', '2026-10-05 05:47:00', '2026-10-05 05:47:00', '1', '1', NULL);
INSERT INTO produk (id, nama_produk, deskripsi, sku, stok, stok_minimal, created_at, updated_at, kategori_id, pemasok_id, qr_code) VALUES ('8', 'Keyboard Logitech', 'Mechanical keyboard silent switch.', 'ELK-KEYB-003', '7', '15', '2026-10-05 05:47:00', '2026-10-05 05:47:00', '1', '1', NULL);
INSERT INTO produk (id, nama_produk, deskripsi, sku, stok, stok_minimal, created_at, updated_at, kategori_id, pemasok_id, qr_code) VALUES ('9', 'Kabel HDMI', 'Kabel HDMI 2.1 Ultra High Speed 4K 120Hz.', 'ELK-HDMI-004', '2', '10', '2026-10-05 05:47:00', '2026-10-05 05:47:00', '1', '1', NULL);
INSERT INTO produk (id, nama_produk, deskripsi, sku, stok, stok_minimal, created_at, updated_at, kategori_id, pemasok_id, qr_code) VALUES ('10', 'Power Bank', 'Power bank 20.000 mAh fast charging 22.5W.', 'ELK-PB-005', '8', '20', '2026-10-05 05:47:00', '2026-10-05 05:47:00', '1', '1', NULL);
INSERT INTO produk (id, nama_produk, deskripsi, sku, stok, stok_minimal, created_at, updated_at, kategori_id, pemasok_id, qr_code) VALUES ('11', 'Baterai AA Alkaline', 'Baterai ukuran AA tahan bocor.', 'ELK-BAT-006', '0', '10', '2026-10-05 05:47:00', '2026-10-05 05:47:00', '1', '1', NULL);
INSERT INTO produk (id, nama_produk, deskripsi, sku, stok, stok_minimal, created_at, updated_at, kategori_id, pemasok_id, qr_code) VALUES ('12', 'Baju Kemeja Pria', 'Kemeja katun pria lengan panjang casual & formal.', 'PKN-KMJ-001', '102', '15', '2026-10-05 05:47:00', '2026-10-05 05:47:00', '2', '2', NULL);
INSERT INTO produk (id, nama_produk, deskripsi, sku, stok, stok_minimal, created_at, updated_at, kategori_id, pemasok_id, qr_code) VALUES ('13', 'Celana Chino Slim Fit', 'Celana panjang katun twill stretch.', 'PKN-CHN-002', '45', '10', '2026-10-05 05:47:00', '2026-10-05 05:47:00', '2', '2', NULL);
INSERT INTO produk (id, nama_produk, deskripsi, sku, stok, stok_minimal, created_at, updated_at, kategori_id, pemasok_id, qr_code) VALUES ('14', 'Cokelat Premium', 'Dark chocolate artisan 70% kakao murni.', 'MKN-CKL-001', '187', '25', '2026-10-05 05:47:00', '2026-10-05 05:47:00', '3', '3', NULL);
INSERT INTO produk (id, nama_produk, deskripsi, sku, stok, stok_minimal, created_at, updated_at, kategori_id, pemasok_id, qr_code) VALUES ('15', 'Kopi Arabika Gayo', 'Biji kopi sangrai specialty Aceh Gayo 250gr.', 'MKN-KOP-002', '65', '15', '2026-10-05 05:47:00', '2026-10-05 05:47:00', '3', '3', NULL);
INSERT INTO produk (id, nama_produk, deskripsi, sku, stok, stok_minimal, created_at, updated_at, kategori_id, pemasok_id, qr_code) VALUES ('16', 'Lipstik Matte', 'Lipstik velvet matte tahan hingga 12 jam.', 'KCT-LIP-001', '134', '20', '2026-10-05 05:47:01', '2026-10-05 05:47:01', '4', '2', NULL);
INSERT INTO produk (id, nama_produk, deskripsi, sku, stok, stok_minimal, created_at, updated_at, kategori_id, pemasok_id, qr_code) VALUES ('17', 'Serum Wajah Hydrating', 'Serum hyaluronic acid 2% mencerahkan dan melembabkan.', 'KCT-SRM-002', '50', '15', '2026-10-05 05:47:01', '2026-10-05 05:47:01', '4', '2', NULL);
INSERT INTO produk (id, nama_produk, deskripsi, sku, stok, stok_minimal, created_at, updated_at, kategori_id, pemasok_id, qr_code) VALUES ('18', 'Buku Pelajaran Matematika', 'Buku kurikulum merdeka edisi revisi terbaru.', 'BAT-MAT-001', '76', '15', '2026-10-05 05:47:01', '2026-10-05 05:47:01', '5', '3', NULL);
INSERT INTO produk (id, nama_produk, deskripsi, sku, stok, stok_minimal, created_at, updated_at, kategori_id, pemasok_id, qr_code) VALUES ('19', 'Toner Printer', 'Cartridge toner laserjet monokrom hitam pekat.', 'BAT-TNR-002', '5', '10', '2026-10-05 05:47:01', '2026-10-05 05:47:01', '5', '3', NULL);
INSERT INTO produk (id, nama_produk, deskripsi, sku, stok, stok_minimal, created_at, updated_at, kategori_id, pemasok_id, qr_code) VALUES ('20', 'Kertas HVS A4 80gr', 'Kertas fotocopy putih premium isi 500 lembar.', 'BAT-HVS-003', '0', '5', '2026-10-05 05:47:01', '2026-10-05 05:47:01', '5', '3', NULL);

-- --------------------------------------------------------
-- Struktur tabel: batch
-- --------------------------------------------------------
DROP TABLE IF EXISTS batch;
CREATE TABLE "batch" ("id" integer primary key autoincrement not null, "produk_id" integer not null, "qr_code" varchar not null, "jumlah_awal" integer not null default '0', "stok_saat_ini" integer not null default '0', "tanggal_masuk" date not null, "tanggal_kadaluarsa" date, "lokasi_rak" varchar, "created_at" datetime, "updated_at" datetime, foreign key("produk_id") references "produk"("id") on delete cascade);

-- --------------------------------------------------------
-- Struktur tabel: stok_transaksi
-- --------------------------------------------------------
DROP TABLE IF EXISTS stok_transaksi;
CREATE TABLE "stok_transaksi" ("id" integer primary key autoincrement not null, "produk_id" integer not null, "tipe" varchar not null, "jumlah" integer not null, "stok_sebelum" integer not null, "stok_sesudah" integer not null, "catatan" text, "tanggal" datetime not null, "user_id" integer not null, "created_at" datetime, "updated_at" datetime, "scan_mode" varchar check ("scan_mode" in ('batch', 'produk')), "batch_id" integer, foreign key("user_id") references users("id") on delete cascade on update no action, foreign key("produk_id") references produk("id") on delete cascade on update no action, foreign key("batch_id") references "batch"("id") on delete set null);

-- Data tabel: stok_transaksi (16 baris)
INSERT INTO stok_transaksi (id, produk_id, tipe, jumlah, stok_sebelum, stok_sesudah, catatan, tanggal, user_id, created_at, updated_at, scan_mode, batch_id) VALUES ('1', '1', 'masuk', '24', '50', '74', 'Barang masuk persediaan', '2026-09-29 08:30:00', '1', '2026-09-29 08:30:00', '2026-09-29 08:30:00', NULL, NULL);
INSERT INTO stok_transaksi (id, produk_id, tipe, jumlah, stok_sebelum, stok_sesudah, catatan, tanggal, user_id, created_at, updated_at, scan_mode, batch_id) VALUES ('2', '2', 'keluar', '12', '100', '88', 'Pengeluaran barang', '2026-09-29 14:15:00', '1', '2026-09-29 14:15:00', '2026-09-29 14:15:00', NULL, NULL);
INSERT INTO stok_transaksi (id, produk_id, tipe, jumlah, stok_sebelum, stok_sesudah, catatan, tanggal, user_id, created_at, updated_at, scan_mode, batch_id) VALUES ('3', '3', 'masuk', '28', '200', '228', 'Barang masuk persediaan', '2026-09-30 09:10:00', '1', '2026-09-30 09:10:00', '2026-09-30 09:10:00', NULL, NULL);
INSERT INTO stok_transaksi (id, produk_id, tipe, jumlah, stok_sebelum, stok_sesudah, catatan, tanggal, user_id, created_at, updated_at, scan_mode, batch_id) VALUES ('4', '4', 'keluar', '16', '150', '134', 'Pengeluaran barang', '2026-09-30 13:40:00', '1', '2026-09-30 13:40:00', '2026-09-30 13:40:00', NULL, NULL);
INSERT INTO stok_transaksi (id, produk_id, tipe, jumlah, stok_sebelum, stok_sesudah, catatan, tanggal, user_id, created_at, updated_at, scan_mode, batch_id) VALUES ('5', '5', 'masuk', '26', '80', '106', 'Barang masuk persediaan', '2026-10-01 10:00:00', '1', '2026-10-01 10:00:00', '2026-10-01 10:00:00', NULL, NULL);
INSERT INTO stok_transaksi (id, produk_id, tipe, jumlah, stok_sebelum, stok_sesudah, catatan, tanggal, user_id, created_at, updated_at, scan_mode, batch_id) VALUES ('6', '1', 'keluar', '14', '50', '36', 'Pengeluaran barang', '2026-10-01 16:20:00', '1', '2026-10-01 16:20:00', '2026-10-01 16:20:00', NULL, NULL);
INSERT INTO stok_transaksi (id, produk_id, tipe, jumlah, stok_sebelum, stok_sesudah, catatan, tanggal, user_id, created_at, updated_at, scan_mode, batch_id) VALUES ('7', '2', 'masuk', '32', '100', '132', 'Barang masuk persediaan', '2026-10-02 09:45:00', '1', '2026-10-02 09:45:00', '2026-10-02 09:45:00', NULL, NULL);
INSERT INTO stok_transaksi (id, produk_id, tipe, jumlah, stok_sebelum, stok_sesudah, catatan, tanggal, user_id, created_at, updated_at, scan_mode, batch_id) VALUES ('8', '3', 'keluar', '18', '200', '182', 'Pengeluaran barang', '2026-10-02 15:10:00', '1', '2026-10-02 15:10:00', '2026-10-02 15:10:00', NULL, NULL);
INSERT INTO stok_transaksi (id, produk_id, tipe, jumlah, stok_sebelum, stok_sesudah, catatan, tanggal, user_id, created_at, updated_at, scan_mode, batch_id) VALUES ('9', '4', 'masuk', '36', '150', '186', 'Barang masuk persediaan', '2026-10-03 08:15:00', '1', '2026-10-03 08:15:00', '2026-10-03 08:15:00', NULL, NULL);
INSERT INTO stok_transaksi (id, produk_id, tipe, jumlah, stok_sebelum, stok_sesudah, catatan, tanggal, user_id, created_at, updated_at, scan_mode, batch_id) VALUES ('10', '5', 'keluar', '15', '80', '65', 'Pengeluaran barang', '2026-10-03 11:50:00', '1', '2026-10-03 11:50:00', '2026-10-03 11:50:00', NULL, NULL);
INSERT INTO stok_transaksi (id, produk_id, tipe, jumlah, stok_sebelum, stok_sesudah, catatan, tanggal, user_id, created_at, updated_at, scan_mode, batch_id) VALUES ('11', '1', 'masuk', '30', '50', '80', 'Barang masuk persediaan', '2026-10-04 08:50:00', '1', '2026-10-04 08:50:00', '2026-10-04 08:50:00', NULL, NULL);
INSERT INTO stok_transaksi (id, produk_id, tipe, jumlah, stok_sebelum, stok_sesudah, catatan, tanggal, user_id, created_at, updated_at, scan_mode, batch_id) VALUES ('12', '2', 'keluar', '12', '100', '88', 'Pengeluaran barang', '2026-10-04 14:20:00', '1', '2026-10-04 14:20:00', '2026-10-04 14:20:00', NULL, NULL);
INSERT INTO stok_transaksi (id, produk_id, tipe, jumlah, stok_sebelum, stok_sesudah, catatan, tanggal, user_id, created_at, updated_at, scan_mode, batch_id) VALUES ('13', '7', 'masuk', '20', '4', '24', 'Restock reguler supplier', '2026-10-05 08:17:00', '1', '2026-10-05 08:17:00', '2026-10-05 08:17:00', NULL, NULL);
INSERT INTO stok_transaksi (id, produk_id, tipe, jumlah, stok_sebelum, stok_sesudah, catatan, tanggal, user_id, created_at, updated_at, scan_mode, batch_id) VALUES ('14', '8', 'masuk', '15', '7', '22', 'Pengiriman supplier tahap 2', '2026-10-05 09:00:00', '1', '2026-10-05 09:00:00', '2026-10-05 09:00:00', NULL, NULL);
INSERT INTO stok_transaksi (id, produk_id, tipe, jumlah, stok_sebelum, stok_sesudah, catatan, tanggal, user_id, created_at, updated_at, scan_mode, batch_id) VALUES ('15', '9', 'keluar', '5', '2', '0', 'Pesanan divisi IT kantor', '2026-10-05 06:23:00', '1', '2026-10-05 06:23:00', '2026-10-05 06:23:00', NULL, NULL);
INSERT INTO stok_transaksi (id, produk_id, tipe, jumlah, stok_sebelum, stok_sesudah, catatan, tanggal, user_id, created_at, updated_at, scan_mode, batch_id) VALUES ('16', '3', 'keluar', '13', '200', '187', 'Pengiriman cabang barat', '2026-10-05 11:15:00', '1', '2026-10-05 11:15:00', '2026-10-05 11:15:00', NULL, NULL);

-- --------------------------------------------------------
-- Struktur tabel: sisa_stok
-- --------------------------------------------------------
DROP TABLE IF EXISTS sisa_stok;
CREATE TABLE "sisa_stok" ("id" integer primary key autoincrement not null, "type" varchar check ("type" in ('in', 'out')) not null, "quantity" integer not null, "date" datetime not null, "note" text, "created_at" datetime, "updated_at" datetime, "produk_id" integer not null, foreign key("produk_id") references "produk"("id") on delete cascade);

-- --------------------------------------------------------
-- Struktur tabel: personal_access_tokens
-- --------------------------------------------------------
DROP TABLE IF EXISTS personal_access_tokens;
CREATE TABLE "personal_access_tokens" ("id" integer primary key autoincrement not null, "tokenable_type" varchar not null, "tokenable_id" integer not null, "name" text not null, "token" varchar not null, "abilities" text, "last_used_at" datetime, "expires_at" datetime, "created_at" datetime, "updated_at" datetime);

-- Data tabel: personal_access_tokens (2 baris)
INSERT INTO personal_access_tokens (id, tokenable_type, tokenable_id, name, token, abilities, last_used_at, expires_at, created_at, updated_at) VALUES ('3', 'App\Models\User', '1', 'auth_token', 'd17198d4828e12280a98de35008dcbb1e47407a64e639cff244f9d6219eeb5e5', '["*"]', NULL, NULL, '2026-09-20 04:55:07', '2026-09-20 04:55:07');
INSERT INTO personal_access_tokens (id, tokenable_type, tokenable_id, name, token, abilities, last_used_at, expires_at, created_at, updated_at) VALUES ('5', 'App\Models\User', '1', 'auth_token', '2b2842aa430286a98b9e522835d58b1a704f71cc32cf762777c9e73b57af4999', '["*"]', '2026-10-08 09:15:09', NULL, '2026-10-05 08:54:48', '2026-10-08 09:15:09');

-- --------------------------------------------------------
-- Struktur tabel: sessions
-- --------------------------------------------------------
DROP TABLE IF EXISTS sessions;
CREATE TABLE "sessions" ("id" varchar not null, "user_id" integer, "ip_address" varchar, "user_agent" text, "payload" text not null, "last_activity" integer not null, primary key ("id"));

-- Data tabel: sessions (1 baris)
INSERT INTO sessions (id, user_id, ip_address, user_agent, payload, last_activity) VALUES ('rQYp2exjBkooMdjvo8Epp93B80x9pUSny1OltrZT', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'eyJfdG9rZW4iOiJSTjBRYUpKc2VtOEJDbm9aVnA1STc1YUNST29SUnBhbjVQdW12WURJIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwXC9hcGlcL2Rhc2hib2FyZFwvcmVjZW50LWFjdGl2aXRpZXMiLCJyb3V0ZSI6bnVsbH0sIl9mbGFzaCI6eyJvbGQiOltdLCJuZXciOltdfX0=', '1791454225');

-- --------------------------------------------------------
-- Struktur tabel: cache
-- --------------------------------------------------------
DROP TABLE IF EXISTS cache;
CREATE TABLE "cache" ("key" varchar not null, "value" text not null, "expiration" integer not null, primary key ("key"));

-- Data tabel: cache (1 baris)
INSERT INTO cache (key, value, expiration) VALUES ('laravel-cache-app_settings', 'a:11:{s:5:"theme";s:5:"light";s:8:"language";s:2:"id";s:12:"auto_refresh";b:1;s:10:"show_stock";b:1;s:11:"app_version";s:5:"2.4.0";s:15:"notif_low_stock";b:1;s:18:"notif_transactions";b:1;s:11:"notif_sound";b:1;s:15:"session_timeout";s:3:"120";s:10:"two_factor";b:0;s:11:"system_time";s:35:"Thursday, 08 October 2026 06:04 WIB";}', '2106799850');

