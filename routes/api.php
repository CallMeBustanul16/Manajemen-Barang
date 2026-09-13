<?php
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\KategoriControllers;
use App\Http\Controllers\Api\PemasokControllers;
use App\Http\Controllers\Api\ProdukControllers;
use App\Http\Controllers\Api\StokController;
use App\Http\Controllers\Api\QrController;
use App\Http\Controllers\Api\BatchController;
use App\Exports\StokExport;
use App\Exports\BatchExports;
use Maatwebsite\Excel\Facades\Excel;

// Route Auth
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);  
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

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
    Route::get('/batch/export/excel', function (Request $request) {
        $produkId = $request->query('produk_id');
        $date = now()->format('Y-m-d');
        $filename = "Laporan-Batch-{$date}.xlsx";
        
        return Excel::download(new BatchExports($produkId), $filename);
    });

    Route::get('/stok/export/excel', function (Request $request) {
        $startDate = $request->start_date;
        $endDate = $request->end_date;

        return Excel::download(new StokExport($startDate, $endDate), 'Laporan-Stok.xlsx');
    });

    // Dashboard Aktivitas
    Route::get('/dashboard/recent-activities', function () {
        $activities = \App\Models\StokTransaksi::with(['produk', 'user', 'batch'])
            ->orderBy('tanggal', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $activities,
        ]);
    });
});

// Route API untuk kategori, pemasok, dan produk
Route::apiResource('kategori', KategoriControllers::class);
Route::apiResource('pemasok', PemasokControllers::class);
Route::apiResource('produk', ProdukControllers::class);

// Route API untuk Stok
Route::get('/dashboard/stok-chart', function () {
    $categories = \App\Models\Kategori::withCount('produk')->get();
    $labels = $categories->pluck('nama_kategori');
    $values = $categories->map(function ($cat) {
        return $cat->produk->sum('stok');
    });
    
    return response()->json([
        'success' => true,
        'data' => [
            'labels' => $labels,
            'values' => $values,
        ],
    ]);
})->middleware('auth:sanctum');

Route::get('/dashboard/low-stock', function () {
    $products = \App\Models\Produk::whereRaw('CAST(stok AS SIGNED) <= CAST(stok_minimal AS SIGNED)')
        ->with('kategori')
        ->orderBy('stok', 'asc')
        ->get();
    return response()->json([
        'success' => true,
        'data' => $products,
    ]);
})->middleware('auth:sanctum');

Route::get('/dashboard/stats', function() {
    $kategoriCount = \App\Models\Kategori::count();
    $pemasokCount = \App\Models\Pemasok::count();
    $produkCount = \App\Models\Produk::count();
    $produkStokMenipis = \App\Models\Produk::whereColumn('stok', '<=', 'stok_minimal')->count();
    $produkStokHabis = \App\Models\Produk::whereColumn('stok', '=', 0)->count();

    return response()->json([
        'success' => true,
        'data' => [
            'total_kategori' => $kategoriCount,
            'total_pemasok' => $pemasokCount,
            'total_produk' => $produkCount,
            'produk_stok_menipis' => $produkStokMenipis,
            'produk_stok_habis' => $produkStokHabis,
        ],
        'message' => 'Statistik dashboard berhasil diambil'
    ]);
});