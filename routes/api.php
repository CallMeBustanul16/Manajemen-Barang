<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\KategoriControllers;
use App\Http\Controllers\Api\PemasokControllers;
use App\Http\Controllers\Api\ProdukControllers;

// Route API untuk kategori, pemasok, dan produk
Route::apiResource('kategori', KategoriControllers::class);
Route::apiResource('pemasok', PemasokControllers::class);
Route::apiResource('produk', ProdukControllers::class);

// Opsional
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