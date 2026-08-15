<p align="center">
  <a href="https://laravel.com" target="_blank">
    <img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo">
  </a>
</p>

<p align="center">
  <a href="https://github.com/laravel/framework/actions">
    <img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status">
  </a>
  <a href="https://packagist.org/packages/laravel/framework">
    <img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads">
  </a>
  <a href="https://packagist.org/packages/laravel/framework">
    <img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version">
  </a>
  <a href="https://packagist.org/packages/laravel/framework">
    <img src="https://img.shields.io/packagist/l/laravel/framework" alt="License">
  </a>
</p>

# 🏢 Manajemen Inventory

**Manajemen Inventory** adalah aplikasi web untuk mengelola data barang, stok, supplier, dan laporan secara terpusat.

Project ini dibangun menggunakan **Laravel 11** sebagai backend dan **React** sebagai frontend, dengan dukungan berbagai library untuk membuat antarmuka yang interaktif dan responsif.

---

## ✨ Fitur Utama

* 📦 Manajemen data barang
* 📊 Manajemen stok inventory
* 🚚 Manajemen supplier
* 📋 Laporan inventory
* ⚛️ React sebagai frontend
* 🎨 Tailwind CSS untuk styling
* ✨ Animasi menggunakan GSAP, AnimeJS, dan AOS
* 🔔 Notifikasi interaktif menggunakan SweetAlert2
* 🗄️ Dukungan database SQLite dan MySQL

---

## 🛠️ Teknologi yang Digunakan

### Backend

| Teknologi          | Fungsi              |
| ------------------ | ------------------- |
| **Laravel 11**     | Framework PHP utama |
| **PHPUnit**        | Testing framework   |
| **SQLite / MySQL** | Database            |

### Frontend

| Library          | Fungsi                          | Versi      |
| ---------------- | ------------------------------- | ---------- |
| **React**        | UI Library                      | `^18.2.0`  |
| **React DOM**    | Render React ke DOM             | `^18.2.0`  |
| **Tailwind CSS** | Utility-first CSS framework     | `^4.0.0`   |
| **Vite**         | Build tool & development server | `^5.0.0`   |
| **GSAP**         | Animasi profesional             | `^3.12.5`  |
| **@gsap/react**  | Integrasi GSAP dengan React     | `^2.0.0`   |
| **AnimeJS**      | Library animasi JavaScript      | `^3.2.1`   |
| **AOS**          | Animasi ketika melakukan scroll | `^2.3.4`   |
| **SweetAlert2**  | Popup dan alert interaktif      | `^11.10.0` |

---

# 📁 Struktur Folder

Berikut struktur folder utama project:

```text
Manajemen-Inventory/
│
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   ├── Middleware/
│   │   └── Requests/
│   ├── Models/
│   └── Providers/
│
├── bootstrap/
│   ├── cache/
│   ├── app.php
│   └── providers.php
│
├── config/
│   ├── app.php
│   ├── auth.php
│   ├── cache.php
│   ├── database.php
│   ├── filesystems.php
│   ├── logging.php
│   ├── mail.php
│   ├── services.php
│   └── session.php
│
├── database/
│   ├── factories/
│   ├── migrations/
│   ├── seeders/
│   ├── .gitignore
│   └── database.sqlite
│
├── public/
│   ├── .htaccess
│   ├── favicon.ico
│   ├── fonts-manifest.dev.json
│   ├── hot
│   ├── index.php
│   └── robots.txt
│
├── resources/
│   ├── css/
│   │   └── app.css
│   ├── js/
│   │   ├── components/
│   │   │   ├── includes/
│   │   │   ├── pages/
│   │   │   └── ui/
│   │   ├── layouts/
│   │   ├── hooks/
│   │   ├── app.jsx
│   │   └── app.tsx
│   └── views/
│       ├── app.blade.php
│       └── welcome.blade.php
│
├── routes/
│   ├── console.php
│   └── web.php
│
├── storage/
├── tests/
├── vendor/
│
├── .editorconfig
├── .env
├── .env.example
├── .gitattributes
├── .gitignore
├── .npmrc
├── artisan
├── composer.json
├── composer.lock
├── package.json
├── package-lock.json
├── phpunit.xml
├── README.md
└── vite.config.js
```

> **Catatan:** `node_modules/` dan `vendor/` tidak perlu di-commit ke repository karena keduanya dapat dibuat kembali menggunakan `npm install` dan `composer install`.

---

# 🚀 Instalasi Project

## 📋 Prasyarat

Pastikan perangkat sudah memiliki software berikut:

* **PHP** ≥ 8.1
* **Composer**
* **Node.js** ≥ 18
* **NPM**
* **Git**

Untuk memastikan semuanya sudah terinstall:

```bash
php -v
composer -v
node -v
npm -v
git -v
```

---

## 1. 📥 Clone Repository

Clone repository dari GitHub:

```bash
git clone https://github.com/CallMeBustanul16/Manajemen-Barang.git
```

Masuk ke folder project:

```bash
cd Manajemen-Barang
```

> Pastikan nama folder yang digunakan sesuai dengan hasil proses `git clone`.

---

## 2. 📦 Install Dependency PHP

Install seluruh dependency Laravel menggunakan Composer:

```bash
composer install
```

---

## 3. ⚙️ Konfigurasi Environment

Salin file `.env.example` menjadi `.env`.

### Windows CMD

```cmd
copy .env.example .env
```

### Linux / macOS / Git Bash

```bash
cp .env.example .env
```

Kemudian generate application key:

```bash
php artisan key:generate
```

> ⚠️ **Jangan commit file `.env` ke Git.**
>
> File `.env` berisi konfigurasi yang bersifat lokal seperti database, API key, dan credential lainnya.

---

## 4. 🗄️ Konfigurasi Database

Sesuaikan konfigurasi database pada file `.env`.

### Contoh menggunakan SQLite

```env
DB_CONNECTION=sqlite
```

Pastikan file database tersedia di:

```text
database/database.sqlite
```

Jika file belum tersedia, buat file kosong bernama:

```text
database.sqlite
```

Kemudian jalankan migration:

```bash
php artisan migrate
```

### Contoh menggunakan MySQL

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=manajemen_inventory
DB_USERNAME=root
DB_PASSWORD=
```

Setelah konfigurasi selesai:

```bash
php artisan migrate
```

Jika project memiliki seeder:

```bash
php artisan db:seed
```

atau:

```bash
php artisan migrate --seed
```

---

## 5. 📦 Install Dependency JavaScript

Install dependency frontend menggunakan NPM:

```bash
npm install
```

Perintah ini akan membaca `package.json` dan membuat folder:

```text
node_modules/
```

> `node_modules/` tidak perlu di-upload atau di-commit ke Git karena ukurannya besar dan dapat dibuat kembali menggunakan `npm install`.

---

# ▶️ Menjalankan Project

Project membutuhkan dua proses ketika menggunakan Vite dalam mode development.

### Terminal 1 — Vite

```bash
npm run dev
```

Vite akan menjalankan development server dan melakukan hot module replacement (HMR).

### Terminal 2 — Laravel

```bash
php artisan serve
```

Laravel biasanya dapat diakses melalui:

```text
http://127.0.0.1:8000
```

Selama development, biarkan kedua terminal tetap berjalan.

---

# 🧪 Testing

Untuk menjalankan seluruh test:

```bash
php artisan test
```

Atau menggunakan PHPUnit secara langsung:

```bash
vendor/bin/phpunit
```

---

# 🤖 Agentic Development
Struktur Laravel yang konsisten membuat project ini cocok digunakan bersama AI coding agents seperti **Claude Code**, **Cursor**, dan **GitHub Copilot**.

Laravel juga menyediakan **Laravel Boost** untuk membantu AI coding agents memahami struktur dan konvensi project Laravel.
Install Laravel Boost:
```bash
composer require laravel/boost --dev
```

Kemudian jalankan:
```bash
php artisan boost:install

```
Informasi lebih lanjut dapat dilihat pada dokumentasi Laravel:
https://laravel.com/docs/ai

---

# 📚 Dokumentasi & Pembelajaran

### Laravel
Dokumentasi resmi Laravel:
https://laravel.com/docs

### Laracasts
Tutorial dan pembelajaran mengenai Laravel, PHP, testing, dan JavaScript:
https://laracasts.com

### Laravel Learn
Pembelajaran Laravel dengan pendekatan berbasis project:
https://laravel.com/learn

---

# 🤝 Contributing
Terima kasih telah mempertimbangkan untuk berkontribusi pada project ini.
Sebelum melakukan perubahan besar, disarankan untuk:
1. Membuat branch baru.
2. Menjelaskan perubahan yang dibuat.
3. Memastikan project dapat dijalankan dengan baik.
4. Menjalankan testing sebelum melakukan pull request.

---

# 🔐 Security
Jika menemukan kerentanan keamanan pada project, harap jangan langsung mempublikasikannya sebagai issue.
Silakan hubungi maintainer project secara langsung agar masalah tersebut dapat ditangani dengan aman.

---

# 📄 License
Project ini menggunakan lisensi **MIT**.
Lihat file `LICENSE` untuk informasi lebih lanjut.
