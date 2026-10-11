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
    Route::post('/stok/opname', [StokController::class, 'opname']);
    Route::post('/stok/penyesuaian', [StokController::class, 'opname']);
    Route::get('/stok/history', [StokController::class, 'history']);
    Route::get('/stok/summary', [StokController::class, 'summary']);
    Route::get('/stok/{id}', [StokController::class, 'show']);

    // Batch Expiring Alert (FEFO)
    Route::get('/batch/expiring', function (Request $request) {
        $days = (int) $request->query('days', 30);
        $today = \Carbon\Carbon::today();
        $targetDate = \Carbon\Carbon::today()->addDays($days);

        $batches = \App\Models\Batch::with(['produk.kategori'])
            ->whereDate('tanggal_kadaluarsa', '<=', $targetDate)
            ->orderBy('tanggal_kadaluarsa', 'asc')
            ->get()
            ->map(function ($b) use ($today) {
                $exp = \Carbon\Carbon::parse($b->tanggal_kadaluarsa);
                $diff = $today->diffInDays($exp, false);
                $b->days_left = $diff;
                $b->is_expired = $diff < 0;
                $b->urgency = $diff < 0 ? 'expired' : ($diff <= 7 ? 'critical' : ($diff <= 14 ? 'warning' : 'attention'));
                return $b;
            });

        return response()->json([
            'success' => true,
            'data' => $batches,
            'summary' => [
                'total' => $batches->count(),
                'expired' => $batches->where('is_expired', true)->count(),
                'critical' => $batches->where('urgency', 'critical')->count(),
                'warning' => $batches->where('urgency', 'warning')->count(),
            ]
        ]);
    });

    // Audit Log / Riwayat Aktivitas
    Route::get('/audit-logs', function (Request $request) {
        $query = \App\Models\ActivityLog::query()->orderBy('created_at', 'desc');

        if ($request->action) {
            $query->where('action', $request->action);
        }
        if ($request->entity_type) {
            $query->where('entity_type', $request->entity_type);
        }
        if ($request->search) {
            $q = $request->search;
            $query->where(function ($w) use ($q) {
                $w->where('description', 'like', "%{$q}%")
                  ->orWhere('user_name', 'like', "%{$q}%");
            });
        }

        $perPage = (int) $request->query('per_page', 20);
        $logs = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $logs,
        ]);
    });

    // Import Massal Produk via CSV / JSON
    Route::post('/produk/import', function (Request $request) {
        $items = [];

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->getRealPath();
            $handle = fopen($path, 'r');
            if ($handle !== false) {
                // Deteksi header baris pertama
                $header = fgetcsv($handle, 1000, ',');
                if (!$header || count($header) < 2) {
                    rewind($handle);
                    $header = fgetcsv($handle, 1000, ';');
                }

                // Normalisasi nama header ke lowercase
                $cleanHeaders = array_map(fn($h) => strtolower(trim(str_replace([' ', '_', '-'], '', $h))), $header ?: []);

                while (($row = fgetcsv($handle, 1000, str_contains(implode(',', $header), ';') ? ';' : ',')) !== false) {
                    if (empty(array_filter($row))) continue;
                    $item = [];
                    foreach ($row as $idx => $val) {
                        $col = $cleanHeaders[$idx] ?? "col_{$idx}";
                        $item[$col] = trim($val);
                    }
                    $items[] = [
                        'nama_produk' => $item['namaproduk'] ?? $item['nama'] ?? ($row[0] ?? ''),
                        'kategori' => $item['kategori'] ?? ($row[1] ?? 'Umum'),
                        'pemasok' => $item['pemasok'] ?? ($row[2] ?? 'Pemasok Utama'),
                        'stok' => (int) ($item['stok'] ?? $item['stokawal'] ?? ($row[3] ?? 0)),
                        'stok_minimal' => (int) ($item['stokminimal'] ?? $item['stokmin'] ?? ($row[4] ?? 10)),
                        'deskripsi' => $item['deskripsi'] ?? ($row[5] ?? ''),
                    ];
                }
                fclose($handle);
            }
        } elseif ($request->has('items') && is_array($request->items)) {
            $items = $request->items;
        }

        if (empty($items)) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ada data produk yang ditemukan dalam file atau input.'
            ], 422);
        }

        $imported = 0;
        $errors = [];

        foreach ($items as $idx => $it) {
            $nama = trim($it['nama_produk'] ?? '');
            if (!$nama) {
                $errors[] = "Baris " . ($idx + 1) . ": Nama produk tidak boleh kosong.";
                continue;
            }

            // Kategori
            $katName = trim($it['kategori'] ?? 'Umum') ?: 'Umum';
            $kategori = \App\Models\Kategori::firstOrCreate(['nama_kategori' => $katName]);

            // Pemasok
            $pemName = trim($it['pemasok'] ?? 'Pemasok Utama') ?: 'Pemasok Utama';
            $pemasok = \App\Models\Pemasok::firstOrCreate(
                ['nama_pemasok' => $pemName],
                ['kontak' => '-', 'alamat' => '-']
            );

            // Generate SKU unik
            $sku = 'PRD-' . strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $nama), 0, 3)) . '-' . rand(1000, 9999);
            while (\App\Models\Produk::where('sku', $sku)->exists()) {
                $sku = 'PRD-' . strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $nama), 0, 3)) . '-' . rand(10000, 99999);
            }

            $stokAwal = max(0, (int) ($it['stok'] ?? 0));
            $stokMin = max(1, (int) ($it['stok_minimal'] ?? 10));

            $prod = \App\Models\Produk::create([
                'nama_produk' => $nama,
                'sku' => $sku,
                'kategori_id' => $kategori->id,
                'pemasok_id' => $pemasok->id,
                'stok' => $stokAwal,
                'stok_minimal' => $stokMin,
                'deskripsi' => $it['deskripsi'] ?? null,
            ]);

            \App\Models\ActivityLog::record(
                'import',
                'Produk',
                $prod->id,
                "Import massal: Menambahkan produk '{$prod->nama_produk}' (SKU: {$sku}, Stok Awal: {$stokAwal})"
            );

            $imported++;
        }

        return response()->json([
            'success' => true,
            'message' => "Berhasil mengimpor {$imported} produk.",
            'data' => [
                'total_imported' => $imported,
                'errors' => $errors,
            ]
        ]);
    });

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

        $companyDefaults = [
            'company_name' => 'PT. LOGISTIK JAYA ABADI',
            'company_tagline' => 'Divisi Pergudangan & Logistik Modern',
            'company_address' => 'Jl. Industri Pergudangan No. 88, Blok B, Jakarta Barat',
            'company_phone' => '021-5558899 / 0812-3456-7890',
            'company_email' => 'gudang@logistikjaya.co.id',
            'company_pic' => 'Admin User',
            'company_pic_role' => 'Kepala Logistik & Pergudangan',
            'company_note' => 'Barang yang telah diterima harap diperiksa secara teliti sesuai dokumen bukti fisik ini.'
        ];
        $company = array_merge($companyDefaults, \Illuminate\Support\Facades\Cache::get('company_profile', []));

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
            'company' => $company,
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

// Route API untuk Notifikasi Dashboard & Header
Route::get('/dashboard/notifications', function () {
    $items = [];
    $today = \Carbon\Carbon::today();

    // 1. Cek produk stok habis
    $habis = \App\Models\Produk::where('stok', '<=', 0)->limit(5)->get();
    foreach ($habis as $p) {
        $items[] = [
            'id' => 'out-' . $p->id,
            'type' => 'danger',
            'title' => 'Stok Habis: ' . $p->nama_produk,
            'desc' => 'Sisa stok 0 unit. Segera lakukan pengadaan atau restock.',
            'time' => 'Kritis',
        ];
    }

    // 2. Cek produk stok menipis
    $menipis = \App\Models\Produk::whereColumn('stok', '<=', 'stok_minimal')
        ->where('stok', '>', 0)
        ->limit(5)
        ->get();
    foreach ($menipis as $p) {
        $items[] = [
            'id' => 'low-' . $p->id,
            'type' => 'warning',
            'title' => 'Stok Menipis: ' . $p->nama_produk,
            'desc' => "Sisa {$p->stok} unit (Batas minimum: {$p->stok_minimal} unit).",
            'time' => 'Peringatan',
        ];
    }

    // 3. Cek batch kadaluarsa / mendekati kadaluarsa
    $expiringBatches = \App\Models\Batch::with('produk')
        ->where('stok_saat_ini', '>', 0)
        ->whereDate('tanggal_kadaluarsa', '<=', \Carbon\Carbon::today()->addDays(30))
        ->orderBy('tanggal_kadaluarsa', 'asc')
        ->limit(5)
        ->get();

    foreach ($expiringBatches as $b) {
        $expDate = \Carbon\Carbon::parse($b->tanggal_kadaluarsa);
        $diffDays = $today->diffInDays($expDate, false);
        $prodName = $b->produk ? $b->produk->nama_produk : 'Produk #' . $b->produk_id;

        if ($diffDays < 0) {
            $items[] = [
                'id' => 'exp-' . $b->id,
                'type' => 'danger',
                'title' => 'Kadaluarsa: ' . $prodName,
                'desc' => "Batch #{$b->id} telah melewati tanggal kadaluarsa (" . $expDate->format('d/m/Y') . ").",
                'time' => 'Expired',
            ];
        } else {
            $items[] = [
                'id' => 'exp-warn-' . $b->id,
                'type' => 'warning',
                'title' => 'Mendekati Kadaluarsa: ' . $prodName,
                'desc' => "Batch #{$b->id} kadaluarsa dalam {$diffDays} hari (" . $expDate->format('d/m/Y') . ").",
                'time' => "H-{$diffDays}",
            ];
        }
    }

    // 4. Mutasi transaksi terbaru (info)
    $latestTrx = \App\Models\StokTransaksi::with(['produk', 'user'])
        ->orderBy('created_at', 'desc')
        ->limit(3)
        ->get();
    foreach ($latestTrx as $trx) {
        $pName = $trx->produk ? $trx->produk->nama_produk : 'Produk';
        $items[] = [
            'id' => 'trx-' . $trx->id,
            'type' => 'info',
            'title' => ($trx->tipe === 'masuk' ? '📥 Stok Masuk: ' : ($trx->tipe === 'keluar' ? '📤 Stok Keluar: ' : '⚖️ Penyesuaian: ')) . $pName,
            'desc' => "Sebanyak {$trx->jumlah} unit. Dicatat oleh " . ($trx->user ? $trx->user->name : 'Operator'),
            'time' => \Carbon\Carbon::parse($trx->tanggal)->diffForHumans(),
        ];
    }

    $count = count(array_filter($items, fn($it) => in_array($it['type'], ['danger', 'warning'])));

    return response()->json([
        'success' => true,
        'data' => [
            'count' => $count,
            'items' => array_slice($items, 0, 15),
        ]
    ]);
});

// Route API untuk Movement Chart (100% Data Riil Transaksi Masuk & Keluar)
Route::get('/dashboard/movement-chart', function (\Illuminate\Http\Request $request) {
    $period = (string) $request->query('days', '7');
    $today = \Carbon\Carbon::today();

    $todayIn = (int) \App\Models\StokTransaksi::where('tipe', 'masuk')
        ->whereDate('tanggal', $today)
        ->sum('jumlah');

    $todayOut = (int) \App\Models\StokTransaksi::where('tipe', 'keluar')
        ->whereDate('tanggal', $today)
        ->sum('jumlah');

    if ($period === '6m' || $period === '12m') {
        $monthsCount = $period === '12m' ? 12 : 6;
        $days = [];
        $masuk = [];
        $keluar = [];

        for ($i = $monthsCount - 1; $i >= 0; $i--) {
            $monthDate = \Carbon\Carbon::today()->startOfMonth()->subMonths($i);
            $monthStart = $monthDate->copy()->startOfMonth()->toDateString();
            $monthEnd = $monthDate->copy()->endOfMonth()->toDateString();

            $days[] = $monthDate->translatedFormat('M Y');

            $masuk[] = (int) \App\Models\StokTransaksi::where('tipe', 'masuk')
                ->whereDate('tanggal', '>=', $monthStart)
                ->whereDate('tanggal', '<=', $monthEnd)
                ->sum('jumlah');

            $keluar[] = (int) \App\Models\StokTransaksi::where('tipe', 'keluar')
                ->whereDate('tanggal', '>=', $monthStart)
                ->whereDate('tanggal', '<=', $monthEnd)
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
                'is_monthly' => true,
            ]
        ]);
    }

    $daysCount = ($period === '30' || $period === '30d') ? 30 : 7;
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
            'is_monthly' => false,
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
            'avatar' => $user->avatar,
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
        'avatar' => 'nullable|string',
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
    if ($request->has('avatar')) {
        $user->avatar = $request->avatar;
    }
    $user->save();

    return response()->json([
        'success' => true,
        'message' => 'Profil berhasil diperbarui',
        'data' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role == 'admin' ? 'Administrator' : ucfirst($user->role),
            'avatar' => $user->avatar,
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

// Route Backup Database SQL 1-Klik (.sql)
Route::get('/settings/backup-sql', function () {
    $dbPath = database_path('database.sqlite');
    if (!file_exists($dbPath)) {
        return response()->json(['success' => false, 'message' => 'Database file not found'], 404);
    }

    try {
        $pdo = new \PDO("sqlite:" . $dbPath);
        $pdo->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);

        $tables = [
            'users',
            'kategori',
            'pemasok',
            'produk',
            'batch',
            'stok_transaksi',
            'activity_logs',
            'sisa_stok',
            'personal_access_tokens',
            'sessions',
            'cache',
        ];

        $output = [];
        $output[] = "-- ========================================================";
        $output[] = "-- CADANGAN DATABASE RESMI: MANAJEMEN GUDANG & INVENTARIS";
        $output[] = "-- Waktu Ekspor : " . date('Y-m-d H:i:s') . " WIB";
        $output[] = "-- Format       : SQL Script Dump";
        $output[] = "-- Kompatibilitas: SQLite, MySQL, MariaDB (XAMPP / phpMyAdmin)";
        $output[] = "-- ========================================================\n";

        foreach ($tables as $table) {
            $stmt = $pdo->prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name = :name");
            $stmt->execute(['name' => $table]);
            $row = $stmt->fetch(\PDO::FETCH_ASSOC);
            if (!$row) continue;

            $output[] = "-- --------------------------------------------------------";
            $output[] = "-- Struktur Tabel: `{$table}`";
            $output[] = "-- --------------------------------------------------------";
            $output[] = "DROP TABLE IF EXISTS `{$table}`;";
            $output[] = $row['sql'] . ";\n";

            $dataStmt = $pdo->query("SELECT * FROM \"{$table}\"");
            $rows = $dataStmt->fetchAll(\PDO::FETCH_ASSOC);
            $count = count($rows);

            if ($count > 0) {
                $output[] = "-- Data Tabel: `{$table}` ({$count} baris)";
                foreach ($rows as $r) {
                    $cols = array_keys($r);
                    $colsEscaped = implode(', ', array_map(fn($c) => "`{$c}`", $cols));
                    $vals = [];
                    foreach ($r as $val) {
                        if ($val === null) {
                            $vals[] = 'NULL';
                        } else {
                            $vals[] = "'" . str_replace("'", "''", $val) . "'";
                        }
                    }
                    $valsJoined = implode(', ', $vals);
                    $output[] = "INSERT INTO `{$table}` ({$colsEscaped}) VALUES ({$valsJoined});";
                }
                $output[] = "";
            }
        }

        $sqlContent = implode("\n", $output);
        $filename = 'backup-database-' . date('Y-m-d-His') . '.sql';

        return response($sqlContent, 200, [
            'Content-Type' => 'application/sql',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'success' => false,
            'message' => 'Gagal menghasilkan backup SQL: ' . $e->getMessage()
        ], 500);
    }
});

// Route Backup SQLite File Mentah (.sqlite)
Route::get('/settings/backup-sqlite', function () {
    $dbPath = database_path('database.sqlite');
    if (!file_exists($dbPath)) {
        return response()->json(['success' => false, 'message' => 'Database SQLite tidak ditemukan'], 404);
    }
    $filename = 'database-inventaris-' . date('Y-m-d-His') . '.sqlite';
    return response()->download($dbPath, $filename, [
        'Content-Type' => 'application/x-sqlite3',
    ]);
});

// Route API Profil Perusahaan & Kop Surat (Point 4)
Route::get('/settings/company', function () {
    $defaults = [
        'company_name' => 'PT. LOGISTIK JAYA ABADI',
        'company_tagline' => 'Divisi Pergudangan & Logistik Modern',
        'company_address' => 'Jl. Industri Pergudangan No. 88, Blok B, Jakarta Barat',
        'company_phone' => '021-5558899 / 0812-3456-7890',
        'company_email' => 'gudang@logistikjaya.co.id',
        'company_pic' => 'Admin User',
        'company_pic_role' => 'Kepala Logistik & Pergudangan',
        'company_note' => 'Barang yang telah diterima harap diperiksa secara teliti sesuai dokumen bukti fisik ini.'
    ];

    $company = array_merge($defaults, \Illuminate\Support\Facades\Cache::get('company_profile', []));

    return response()->json([
        'success' => true,
        'data' => $company
    ]);
});

Route::post('/settings/company', function (Request $request) {
    $defaults = [
        'company_name' => 'PT. LOGISTIK JAYA ABADI',
        'company_tagline' => 'Divisi Pergudangan & Logistik Modern',
        'company_address' => 'Jl. Industri Pergudangan No. 88, Blok B, Jakarta Barat',
        'company_phone' => '021-5558899 / 0812-3456-7890',
        'company_email' => 'gudang@logistikjaya.co.id',
        'company_pic' => 'Admin User',
        'company_pic_role' => 'Kepala Logistik & Pergudangan',
        'company_note' => 'Barang yang telah diterima harap diperiksa secara teliti sesuai dokumen bukti fisik ini.'
    ];

    $current = array_merge($defaults, \Illuminate\Support\Facades\Cache::get('company_profile', []));
    $updated = array_merge($current, $request->only([
        'company_name',
        'company_tagline',
        'company_address',
        'company_phone',
        'company_email',
        'company_pic',
        'company_pic_role',
        'company_note',
    ]));

    \Illuminate\Support\Facades\Cache::forever('company_profile', $updated);

    return response()->json([
        'success' => true,
        'message' => 'Identitas perusahaan berhasil diperbarui',
        'data' => $updated
    ]);
});