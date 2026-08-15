<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

# 🏢 Manajemen Inventory

Proyek **Manajemen Inventory** adalah aplikasi web untuk mengelola data barang, stok, supplier, dan laporan. Dibangun dengan **Laravel 11** sebagai backend dan **React** sebagai frontend, dengan dukungan animasi interaktif.

---

## 📁 Struktur Folder Penting

Manajemen-Barang/
├── app/ # Core Laravel (Models, Controllers, Providers)
│ ├── Http/ # Controllers, Middleware, Requests
│ ├── Models/ # Model Eloquent
│ └── Providers/ # Service Providers
├── bootstrap/ # Bootstrapping Laravel
│ ├── cache/ # Cache Konfigurasi & Route
│ ├── app.php # Inisialisasi Aplikasi
│ └── providers.php # Daftar Service Providers
├── config/ # Semua Konfigurasi Laravel
│ ├── app.php # Konfigurasi Aplikasi (timezone, locale, dll)
│ ├── auth.php # Konfigurasi Autentikasi
│ ├── cache.php # Konfigurasi Cache
│ ├── database.php # Konfigurasi Database
│ ├── filesystems.php # Konfigurasi Filesystem
│ ├── logging.php # Konfigurasi Logging
│ ├── mail.php # Konfigurasi Email
│ ├── queue.php # Konfigurasi Queue
│ ├── services.php # Konfigurasi Service Eksternal
│ └── session.php # Konfigurasi Session
├── database/ # Database
│ ├── factories/ # Factory untuk Seeder
│ ├── migrations/ # File Migrasi Database
│ ├── seeders/ # Seeder untuk Data Dummy
│ ├── .gitignore # Ignore database.sqlite
│ └── database.sqlite # File Database SQLite (jika pakai)
├── node_modules/ # Dependency JavaScript (TIDAK di-commit ke Git)
├── public/ # Public Assets (Entry Point Laravel)
│ ├── .htaccess # Konfigurasi Apache
│ ├── favicon.ico # Icon Browser
│ ├── fonts-manifest.dev.json
│ ├── hot # File untuk Vite HMR
│ ├── index.php # Entry Point Laravel
│ └── robots.txt # SEO
├── resources/ # Sumber Daya Frontend
│ ├── css/
│ │ └── app.css # Tailwind CSS v4
│ ├── js/
│ │ ├── app.jsx # 🚀 Entry Point React (SEMUA LIBRARY DI SINI)
│ │ └── app.tsx # (opsional)
│ └── views/
│ ├── app.blade.php # Layout Blade (jika dipakai)
│ └── welcome.blade.php # Halaman Utama (container React)
├── routes/ # Routing Laravel
│ ├── console.php # Command Console
│ └── web.php # Route Web (React di-serve dari sini)
├── storage/ # Storage Laravel (logs, cache, files)
├── tests/ # Unit Test & Feature Test
├── vendor/ # Dependency PHP (TIDAK di-commit ke Git)
├── .editorconfig # Konfigurasi Editor
├── .env # Environment Variables (JANGAN di-commit!)
├── .env.example # Template Environment Variables
├── .gitattributes
├── .gitignore # Daftar file/folder yang di-ignore Git
├── .npmrc
├── artisan # CLI Laravel
├── composer.json # Dependency PHP (Laravel)
├── composer.lock # Lock Dependency PHP
├── package-lock.json # Lock Dependency JavaScript
├── package.json # Dependency JavaScript (React, dll)
├── phpunit.xml # Konfigurasi Testing PHPUnit
├── README.md # File ini
└── vite.config.js # Konfigurasi Vite (Build Tool)

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

In addition, [Laracasts](https://laracasts.com) contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

You can also watch bite-sized lessons with real-world projects on [Laravel Learn](https://laravel.com/learn), where you will be guided through building a Laravel application from scratch while learning PHP fundamentals.

## Agentic Development

Laravel's predictable structure and conventions make it ideal for AI coding agents like Claude Code, Cursor, and GitHub Copilot. Install [Laravel Boost](https://laravel.com/docs/ai) to supercharge your AI workflow:

```bash
composer require laravel/boost --dev

php artisan boost:install
```

Boost provides your agent 15+ tools and skills that help agents build Laravel applications while following best practices.


---

## 📦 Library & Tools yang Digunakan

### Backend (PHP / Laravel)
| Library | Fungsi |
|---------|--------|
| **Laravel 11** | Framework PHP utama |
| **PHPUnit** | Testing Framework (bawaan Laravel) |
| **SQLite / MySQL** | Database (bisa pakai SQLite default) |

### Frontend (JavaScript / React)
| Library | Fungsi | Versi |
|---------|--------|-------|
| **React 18** | UI Library | ^18.2.0 |
| **React DOM** | Render React ke DOM | ^18.2.0 |
| **Tailwind CSS v4** | CSS Framework Utility-first | ^4.0.0 |
| **Vite** | Build Tool & Development Server | ^5.0.0 |
| **GSAP** | Animasi Profesional | ^3.12.5 |
| **@gsap/react** | Hook GSAP untuk React | ^2.0.0 |
| **AnimeJS** | Animasi JavaScript Ringan | ^3.2.1 |
| **AOS** | Animasi Saat Scroll | ^2.3.4 |
| **SweetAlert2** | Popup/Alert Interaktif | ^11.10.0 |

---

## 🚀 Cara Menjalankan Project di Komputer Rekanmu

### Prasyarat
Pastikan sudah terinstall:
- **PHP** ≥ 8.1 → `php -v`
- **Composer** → `composer -v`
- **Node.js** ≥ 18 → `node -v`
- **Git** → `git -v`

### Langkah Instalasi

#### 1. Clone Repository
```bash
- git clone https://github.com/CallMeBustanul16/Manajemen-Barang
- cd Manajemen-Inventory

#### 2. Install Depedency PHP (Laravel)
- composer install

#### 3. Setup Environment (.env)
- cp .env.example .env
- php artisan key:generate
### (Aturan: Jangan commit .env ke Git karena isinya berbeda tiap perangkat.)

#### 4. Install Depedency javaScript
- npm install
### (node_modules akan otomatis terbuat di folder ini.)

#### 5. Jalankan Development Server
- Terminal 1 – Vite (Build Asset)
npm run dev

- Terminal 2 – Laravel Server
php artisan serve

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
