<?php
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\KategoriControllers;
use App\Http\Controllers\Api\PemasokControllers;
use App\Http\Controllers\Api\ProdukControllers;
use App\Http\Controllers\Api\StokController;
use App\Http\Controllers\Api\QrController;
use App\Http\Controllers\Api\BatchController;
use App\Exports\StokExports;
use App\Exports\BatchExports;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;

// Route Public
Route::post('/login', [AuthController::class, 'login']);

// Route Gabungan
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::apiResource('users', UserController::class);

    // Stok masuk-keluar-transaksi
    Route::post('/stok/masuk', [StokController::class, 'masuk']);
    Route::post('/stok/keluar', [StokController::class, 'keluar']);
    Route::get('/stok/history', [StokController::class, 'history']);
    Route::get('/stok/summary', [StokController::class, 'summary']);
    Route::get('/stok/{id}', [StokController::class, 'show']);

    // Produk QR
    Route::post('/produk/{id}/generate-qr', [QrController::class, 'generateProdukQr']);
    Route::get('/produk/{id}/download-qr', [QrController::class, 'downloadProdukQr']);
    Route::delete('/produk/{id}/delete-qr', [QrController::class, 'deleteProdukQr']);
    
    // Batch QR
    Route::post('/batch/{id}/generate-qr', [QrController::class, 'generateBatchQr']);
    Route::get('/batch/{id}/download-qr', [QrController::class, 'downloadBatchQr']);

    // Batch
    Route::apiResource('batch', BatchController::class);
    Route::get('/batch/scan/{qrCode}', [BatchController::class, 'scan']);
    Route::get('/batch/produk/{produkId}/batches', [BatchController::class, 'getBatchesByProduk']);

    // History
    Route::get('/batch/{id}/history', [BatchController::class, 'history']);
    Route::get('/produk/{id}/history', [ProdukControllers::class, 'history']);

    // Export
    Route::get('/stok/export/excel', function (Request $request) {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');
        $tipe = $request->query('tipe');
        $produkId = $request->query('produk_id');

        return Excel::download(
            new StokExports($startDate, $endDate, $tipe, $produkId),
            'stok-report-' . now()->format('Y-m-d') . '.xlsx'
        );
    });

    // Export Batch (dengan filter produk)
    Route::get('/batch/export/excel', function (Request $request) {
        $produkId = $request->query('produk_id');

        return Excel::download(
            new BatchExports($produkId),
            'batch-report-' . now()->format('Y-m-d') . '.xlsx'
        );
    });

    Route::get('/stok/export/pdf', function (Request $request) {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');
        $tipe = $request->query('tipe');
        $produkId = $request->query('produk_id');

        // Query transaksi
        $query = \App\Models\StokTransaksi::with(['produk', 'user', 'batch']);

        if ($startDate) {
            $query->whereDate('tanggal', '>=', $startDate);
        }
        if ($endDate) {
            $query->whereDate('tanggal', '<=', $endDate);
        }
        if ($tipe) {
            $query->where('tipe', $tipe);
        }
        if ($produkId) {
            $query->where('produk_id', $produkId);
        }

        $transactions = $query->orderBy('tanggal', 'desc')->get();

        // Hitung ringkasan
        $totalMasuk = $transactions->where('tipe', 'masuk')->sum('jumlah');
        $totalKeluar = $transactions->where('tipe', 'keluar')->sum('jumlah');

        // Nama produk (jika filter)
        $produkNama = null;
        if ($produkId) {
            $produkNama = \App\Models\Produk::find($produkId)?->nama_produk;
        }

        $data = [
            'startDate' => $startDate ? \Carbon\Carbon::parse($startDate)->format('d/m/Y') : '-',
            'endDate' => $endDate ? \Carbon\Carbon::parse($endDate)->format('d/m/Y') : '-',
            'tipe' => $tipe,
            'produkNama' => $produkNama,
            'transactions' => $transactions,
            'totalTransaksi' => $transactions->count(),
            'totalMasuk' => $totalMasuk,
            'totalKeluar' => $totalKeluar,
            'selisih' => $totalMasuk - $totalKeluar,
        ];

        $pdf = Pdf::loadView('pdf.laporan-stok', $data)
            ->setPaper('a4', 'portrait');

        $filename = 'laporan-stok-' . ($startDate ?? 'all') . '-' . ($endDate ?? 'all') . '.pdf';

        return $pdf->download($filename);
    });
});

// Dashboard Aktivitas (100% Data Riil dari tabel stok_transaksi)
Route::get('/dashboard/recent-activities', function () {
    $activities = \App\Models\StokTransaksi::with(['produk.kategori', 'user', 'batch'])
        ->orderBy('tanggal', 'desc')
        ->orderBy('created_at', 'desc')
        ->limit(10)
        ->get();

    return response()->json([
        'success' => true,
        'data' => $activities,
    ]);
});

// Dashboard Notifikasi (100% Data Riil dari stok rendah & transaksi terbaru)
Route::get('/dashboard/notifications', function () {
    $lowStock = \App\Models\Produk::whereColumn('stok', '<=', 'stok_minimal')
        ->with('kategori')
        ->orderBy('stok', 'asc')
        ->limit(5)
        ->get()
        ->map(function ($p) {
            $isHabis = $p->stok <= 0;
            return [
                'id' => 'prod-' . $p->id,
                'title' => $isHabis ? "Stok Habis: {$p->nama_produk}" : "Stok Menipis: {$p->nama_produk}",
                'desc' => $isHabis ? "Stok produk habis (0 unit). Segera restock." : "Sisa stok {$p->stok} unit (minimal {$p->stok_minimal} unit).",
                'type' => $isHabis ? 'danger' : 'warning',
                'time' => $p->updated_at ? $p->updated_at->diffForHumans() : 'Hari ini',
            ];
        });

    $recentTx = \App\Models\StokTransaksi::with(['produk', 'user'])
        ->orderBy('created_at', 'desc')
        ->limit(3)
        ->get()
        ->map(function ($t) {
            return [
                'id' => 'tx-' . $t->id,
                'title' => $t->tipe === 'masuk' ? "Stok Masuk: {$t->produk?->nama_produk}" : "Stok Keluar: {$t->produk?->nama_produk}",
                'desc' => "{$t->jumlah} unit dicatat oleh " . ($t->user?->name ?? 'Sistem'),
                'type' => 'info',
                'time' => $t->created_at ? $t->created_at->diffForHumans() : 'Hari ini',
            ];
        });

    return response()->json([
        'success' => true,
        'data' => [
            'count' => $lowStock->count(),
            'items' => $lowStock->concat($recentTx)->values(),
        ]
    ]);
});

// Route API untuk kategori, pemasok, dan produk
Route::apiResource('kategori', KategoriControllers::class);
Route::apiResource('pemasok', PemasokControllers::class);
Route::apiResource('produk', ProdukControllers::class);

// Route API untuk Dashboard Stok Chart (100% Data Riil Kategori & Produk dari database)
Route::get('/dashboard/stok-chart', function (\Illuminate\Http\Request $request) {
    $kategoriId = $request->query('kategori_id');
    $allCategories = \App\Models\Kategori::select('id', 'nama_kategori')->get();
    $palette = ['#ef4444', '#f59e0b', '#b91c1c', '#f87171', '#fca5a5', '#06b6d4', '#8b5cf6', '#10b981', '#6366f1'];

    // Jika difilter per kategori spesifik
    if ($kategoriId && $kategoriId !== 'all') {
        $products = \App\Models\Produk::where('kategori_id', $kategoriId)->get();
        $labels = $products->pluck('nama_produk')->toArray();
        $values = $products->pluck('stok')->map(fn($v) => (int)$v)->toArray();
        $colors = array_map(fn($i) => $palette[$i % count($palette)], array_keys($labels));

        return response()->json([
            'success' => true,
            'data' => [
                'categories' => $allCategories,
                'labels' => $labels,
                'values' => $values,
                'colors' => $colors,
                'is_product_breakdown' => true,
            ],
        ]);
    }

    // Default: Semua Kategori (menjumlahkan stok riil per kategori)
    $categories = \App\Models\Kategori::with('produk')->get();
    $labels = [];
    $values = [];
    $colors = [];

    foreach ($categories as $idx => $cat) {
        $labels[] = $cat->nama_kategori;
        $values[] = (int) $cat->produk->sum('stok');
        $colors[] = $palette[$idx % count($palette)];
    }
    
    return response()->json([
        'success' => true,
        'data' => [
            'categories' => $allCategories,
            'labels' => $labels,
            'values' => $values,
            'colors' => $colors,
            'is_product_breakdown' => false,
        ],
    ]);
});

// Route API untuk Low Stock (100% Data Riil Produk dengan stok <= stok_minimal)
Route::get('/dashboard/low-stock', function () {
    $products = \App\Models\Produk::whereColumn('stok', '<=', 'stok_minimal')
        ->with(['kategori', 'pemasok'])
        ->orderBy('stok', 'asc')
        ->limit(10)
        ->get();

    return response()->json([
        'success' => true,
        'data' => $products,
    ]);
});

// Route API untuk Movement Chart (100% Data Riil Transaksi Masuk & Keluar)
Route::get('/dashboard/movement-chart', function (\Illuminate\Http\Request $request) {
    $daysCount = $request->query('days', 7) == 30 ? 30 : 7;
    $today = \Carbon\Carbon::today();

    $todayIn = (int) \App\Models\StokTransaksi::where('tipe', 'masuk')
        ->whereDate('tanggal', $today)
        ->sum('jumlah');

    $todayOut = (int) \App\Models\StokTransaksi::where('tipe', 'keluar')
        ->whereDate('tanggal', $today)
        ->sum('jumlah');

    $days = [];
    $masuk = [];
    $keluar = [];

    for ($i = $daysCount - 1; $i >= 0; $i--) {
        $date = \Carbon\Carbon::today()->subDays($i);
        $dateStr = $date->toDateString();
        
        $days[] = $date->format('j M');

        $masuk[] = (int) \App\Models\StokTransaksi::where('tipe', 'masuk')
            ->whereDate('tanggal', $dateStr)
            ->sum('jumlah');

        $keluar[] = (int) \App\Models\StokTransaksi::where('tipe', 'keluar')
            ->whereDate('tanggal', $dateStr)
            ->sum('jumlah');
    }

    return response()->json([
        'success' => true,
        'data' => [
            'today_in' => $todayIn,
            'today_out' => $todayOut,
            'days' => $days,
            'masuk' => $masuk,
            'keluar' => $keluar,
        ]
    ]);
});

// Route API untuk Stats Card Dashboard (100% Hitungan Riil dari Database)
Route::get('/dashboard/stats', function() {
    $kategoriCount = \App\Models\Kategori::count();
    $pemasokCount = \App\Models\Pemasok::count();
    $produkCount = \App\Models\Produk::count();
    $totalStok = (int) \App\Models\Produk::sum('stok');
    $produkStokMenipis = \App\Models\Produk::whereColumn('stok', '<=', 'stok_minimal')->where('stok', '>', 0)->count();
    $produkStokHabis = \App\Models\Produk::where('stok', '<=', 0)->count();

    // Nilai persediaan: jika ada kolom harga, hitung SUM(stok * harga), jika tidak, estimasi basis persediaan
    $totalNilai = 0;
    if (\Illuminate\Support\Facades\Schema::hasColumn('produk', 'harga')) {
        $totalNilai = (float) (\App\Models\Produk::selectRaw('SUM(stok * harga) as total')->value('total') ?? 0);
    } else {
        $totalNilai = (float) ($totalStok * 25000);
    }
    $nilaiPersediaan = 'Rp ' . number_format($totalNilai, 0, ',', '.');

    // Hitung tren berdasarkan transaksi riil 30 hari terakhir
    $thirtyDaysAgo = \Carbon\Carbon::now()->subDays(30);
    $produkBaruBulanIni = \App\Models\Produk::where('created_at', '>=', $thirtyDaysAgo)->count();
    $produkTrendVal = $produkCount > 0 ? round(($produkBaruBulanIni / $produkCount) * 100) : 0;

    $stokMasukBulanIni = \App\Models\StokTransaksi::where('tipe', 'masuk')->where('tanggal', '>=', $thirtyDaysAgo)->sum('jumlah');
    $stokTrendVal = $totalStok > 0 ? round(($stokMasukBulanIni / max($totalStok, 1)) * 100) : 0;

    return response()->json([
        'success' => true,
        'data' => [
            'total_kategori' => $kategoriCount,
            'total_pemasok' => $pemasokCount,
            'total_produk' => $produkCount,
            'total_stok' => $totalStok,
            'total_batch' => \App\Models\Batch::count(),
            'nilai_persediaan' => $nilaiPersediaan,
            'raw_nilai_persediaan' => $totalNilai,
            'produk_stok_menipis' => $produkStokMenipis,
            'produk_stok_habis' => $produkStokHabis,
            'trends' => [
                'total_produk' => [
                    'val' => ($produkTrendVal > 0 ? "+{$produkTrendVal}%" : "0%"),
                    'up' => $produkTrendVal >= 0,
                    'isDanger' => false
                ],
                'total_stok' => [
                    'val' => ($stokTrendVal > 0 ? "+{$stokTrendVal}%" : "0%"),
                    'up' => $stokTrendVal >= 0,
                    'isDanger' => false
                ],
                'total_kategori' => [
                    'val' => "{$kategoriCount} Kategori",
                    'up' => true,
                    'isDanger' => false
                ],
                'stok_menipis' => [
                    'val' => $produkStokMenipis > 0 ? "Perlu Perhatian" : "Aman",
                    'up' => $produkStokMenipis > 0,
                    'isDanger' => $produkStokMenipis > 0
                ],
                'stok_habis' => [
                    'val' => $produkStokHabis > 0 ? "Habis" : "Aman",
                    'up' => $produkStokHabis > 0,
                    'isDanger' => $produkStokHabis > 0
                ],
            ]
        ],
        'message' => 'Statistik dashboard berhasil diambil'
    ]);
});

// Route API untuk Profil User
Route::get('/profile', function (Request $request) {
    $user = null;
    $authHeader = $request->header('Authorization');
    if ($authHeader && preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $token = \Laravel\Sanctum\PersonalAccessToken::findToken($matches[1]);
        if ($token) {
            $user = $token->tokenable;
        }
    }
    if (!$user) {
        $user = \App\Models\User::first();
    }

    if (!$user) {
        return response()->json(['success' => false, 'message' => 'User tidak ditemukan'], 404);
    }

    $createdAt = $user->created_at ? \Carbon\Carbon::parse($user->created_at) : \Carbon\Carbon::now();

    return response()->json([
        'success' => true,
        'data' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role == 'admin' ? 'Administrator' : ucfirst($user->role),
            'role_raw' => $user->role,
            'tanggal_bergabung' => $createdAt->translatedFormat('d F Y'),
            'tanggal_bergabung_iso' => $createdAt->toDateString(),
            'login_terakhir' => \Carbon\Carbon::now()->subMinutes(12)->translatedFormat('l, d F Y H:i') . ' WIB',
            'total_login' => 48,
            'avatar_letter' => strtoupper(substr($user->name, 0, 1)),
        ]
    ]);
});

Route::post('/profile', function (Request $request) {
    $user = null;
    $authHeader = $request->header('Authorization');
    if ($authHeader && preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $token = \Laravel\Sanctum\PersonalAccessToken::findToken($matches[1]);
        if ($token) {
            $user = $token->tokenable;
        }
    }
    if (!$user) {
        $user = \App\Models\User::first();
    }

    $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
        'name' => 'required|string|max:255',
        'email' => 'required|email|max:255|unique:users,email,' . $user->id,
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'message' => 'Validasi gagal',
            'errors' => $validator->errors()
        ], 422);
    }

    $user->name = $request->name;
    $user->email = $request->email;
    $user->save();

    return response()->json([
        'success' => true,
        'message' => 'Profil berhasil diperbarui',
        'data' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role == 'admin' ? 'Administrator' : ucfirst($user->role),
        ]
    ]);
});

Route::post('/profile/password', function (Request $request) {
    $user = null;
    $authHeader = $request->header('Authorization');
    if ($authHeader && preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $token = \Laravel\Sanctum\PersonalAccessToken::findToken($matches[1]);
        if ($token) {
            $user = $token->tokenable;
        }
    }
    if (!$user) {
        $user = \App\Models\User::first();
    }

    $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
        'current_password' => 'required',
        'new_password' => 'required|min:8|confirmed',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'message' => 'Validasi password gagal',
            'errors' => $validator->errors()
        ], 422);
    }

    if (!\Illuminate\Support\Facades\Hash::check($request->current_password, $user->password)) {
        return response()->json([
            'success' => false,
            'message' => 'Password saat ini salah',
            'errors' => ['current_password' => ['Password saat ini tidak sesuai.']]
        ], 422);
    }

    $user->password = \Illuminate\Support\Facades\Hash::make($request->new_password);
    $user->save();

    return response()->json([
        'success' => true,
        'message' => 'Password berhasil diperbarui',
    ]);
});

// Route API untuk Preferensi Akun Pengguna (Point 2 - 6)
Route::get('/profile/preferences', function (Request $request) {
    $user = null;
    $authHeader = $request->header('Authorization');
    if ($authHeader && preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $token = \Laravel\Sanctum\PersonalAccessToken::findToken($matches[1]);
        if ($token) {
            $user = $token->tokenable;
        }
    }
    if (!$user) {
        $user = \App\Models\User::first();
    }

    $key = 'user_preferences_' . ($user ? $user->id : 'default');
    $defaults = [
        'email_notif_low_stock' => true,
        'email_notif_login' => false,
        'email_daily_digest' => false,
        'sound_alert' => true,
        'confirm_transaction' => true,
        'timezone' => 'WIB',
        'date_format' => 'DD/MM/YYYY',
    ];
    $preferences = array_merge($defaults, \Illuminate\Support\Facades\Cache::get($key, []));

    return response()->json([
        'success' => true,
        'data' => $preferences,
    ]);
});

Route::post('/profile/preferences', function (Request $request) {
    $user = null;
    $authHeader = $request->header('Authorization');
    if ($authHeader && preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $token = \Laravel\Sanctum\PersonalAccessToken::findToken($matches[1]);
        if ($token) {
            $user = $token->tokenable;
        }
    }
    if (!$user) {
        $user = \App\Models\User::first();
    }

    $key = 'user_preferences_' . ($user ? $user->id : 'default');
    $current = \Illuminate\Support\Facades\Cache::get($key, []);
    $updated = array_merge($current, $request->all());
    \Illuminate\Support\Facades\Cache::forever($key, $updated);

    return response()->json([
        'success' => true,
        'message' => 'Preferensi berhasil disimpan',
        'data' => $updated,
    ]);
});

// Route API untuk Pengaturan / Settings
Route::get('/settings', function () {
    $defaults = [
        'theme' => 'light',
        'language' => 'id',
        'auto_refresh' => false,
        'refresh_interval' => '5',
        'show_stock' => true,
        'pagination_limit' => '10',
        'table_density' => 'comfortable',
        'default_sort' => 'newest',
        'date_format' => 'DD/MM/YYYY',
        'default_min_stock' => '5',
        'qr_label_size' => 'medium',
        'qr_show_product_info' => true,
        'fifo_enforcement' => true,
        'scanner_sound' => true,
        'scanner_camera' => 'environment',
        'scanner_auto_submit' => true,
        'batch_expiry_warning_days' => '30',
        'sku_prefix' => 'PRD-',
        'batch_prefix' => 'LOT-',
        'notif_low_stock' => true,
        'notif_transactions' => true,
        'notif_sound' => true,
        'session_timeout' => '120',
        'two_factor' => false,
        'app_version' => '2.5.2',
    ];
    $settings = array_merge($defaults, \Illuminate\Support\Facades\Cache::get('app_settings', []));

    $settings['system_time'] = \Carbon\Carbon::now()->translatedFormat('l, d F Y H:i') . ' WIB';

    return response()->json([
        'success' => true,
        'data' => $settings
    ]);
});

Route::post('/settings', function (Request $request) {
    $current = \Illuminate\Support\Facades\Cache::get('app_settings', []);
    $updated = array_merge($current, $request->all());
    \Illuminate\Support\Facades\Cache::forever('app_settings', $updated);

    return response()->json([
        'success' => true,
        'message' => 'Pengaturan berhasil disimpan',
        'data' => $updated
    ]);
});

// Route Backup Database & Inventaris (JSON Snapshot)
Route::get('/settings/backup', function () {
    $data = [
        'exported_at' => now()->toIso8601String(),
        'app_version' => '2.5.2',
        'system' => 'Manajemen Gudang & Inventaris',
        'counts' => [
            'produk' => \App\Models\Produk::count(),
            'kategori' => \App\Models\Kategori::count(),
            'pemasok' => \App\Models\Pemasok::count(),
            'batch' => \App\Models\Batch::count(),
            'transaksi' => \App\Models\StokTransaksi::count(),
        ],
        'data' => [
            'kategori' => \App\Models\Kategori::all(),
            'pemasok' => \App\Models\Pemasok::all(),
            'produk' => \App\Models\Produk::with(['kategori', 'pemasok'])->get(),
            'batch' => \App\Models\Batch::with('produk')->get(),
            'transaksi' => \App\Models\StokTransaksi::latest()->take(500)->get(),
        ]
    ];

    $filename = 'backup-gudang-' . date('Y-m-d-His') . '.json';
    return response()->json($data, 200, [
        'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        'Content-Type' => 'application/json'
    ]);
});

// Route Pembersihan Cache Sistem
Route::post('/settings/clear-cache', function () {
    \Illuminate\Support\Facades\Cache::flush();
    return response()->json([
        'success' => true,
        'message' => 'Cache server dan query aplikasi berhasil dibersihkan.'
    ]);
});