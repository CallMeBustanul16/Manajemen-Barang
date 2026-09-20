<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Produk;
use App\Models\StokTransaksi;
use App\Models\Batch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StokController extends Controller
{
    /**
     * Tambah stok (Stok Masuk)
     */
    public function masuk(Request $request)
    {
        $request->validate([
            'produk_id' => 'required|exists:produk,id',
            'batch_id' => 'required|exists:batch,id',
            'jumlah' => 'required|integer|min:1',
            'catatan' => 'nullable|string',
            'tanggal' => 'required|date',
        ]);

        $batch = Batch::findOrFail($request->batch_id);
        $produk = Produk::findOrFail($request->produk_id);
        $user = Auth::user();
        $jumlah = $request->jumlah;

         if ($batch->produk_id !== $produk->id) {
            return response()->json([
                'success' => false,
                'message' => 'Batch tidak sesuai dengan produk yang dipilih'
            ], 422);
        }
        
        if ($produk->stok < $jumlah) {
            return response()->json([
                'success' => false,
                'message' => "Stok gudang tidak mencukupi! Stok saat ini: {$produk->stok}"
            ], 422);
        }

        if ($jumlah > $batch->sisaKapasitas()) {
            return response()->json([
                'success' => false,
                'message' => "Melebihi kapasitas batch! Sisa kapasitas: {$batch->sisaKapasitas()} (isi saat ini: {$batch->stok_saat_ini}/{$batch->kapasitas})"
            ], 422);
        }
        

        // Mulai transaksi database
        DB::beginTransaction();

        try {
            $stokBatchSebelum = $batch->stok_saat_ini;
            $batch->stok_saat_ini += $jumlah;
            $batch->save();
            
            $produk->stok -= $jumlah;
            $produk->save();

            // Catat transaksi
            $transaksi = StokTransaksi::create([
                'produk_id' => $produk->id,
                'batch_id' => $batch->id,
                'tipe' => 'masuk',
                'scan_mode' => 'batch',
                'jumlah' => $jumlah,
                'stok_sebelum' => $stokBatchSebelum,
                'stok_sesudah' => $batch->stok_saat_ini,
                'catatan' => $request->catatan . " (Batch #{$batch->id}: {$batch->stok_saat_ini}/{$batch->kapasitas})",
                'tanggal' => $request->tanggal,
                'user_id' => $user->id,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Stok berhasil dipindah ke batch. Stok gudang: {$produk->stok}, Batch: {$batch->stok_saat_ini}/{$batch->kapasitas}",
                'data' => [
                    'produk' => $produk->fresh(),
                    'batch' => $batch->fresh(),
                    'transaksi' => $transaksi,
                    'stok_produk_baru' => $produk->stok,
                    'stok_batch_baru' => $batch->stok_saat_ini,
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal isi batch: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambah stok: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Kurangi stok (Stok Keluar)
     */
    public function keluar(Request $request)
    {
        $request->validate([
            'produk_id' => 'required|exists:produk,id',
            'batch_id' => 'required|exists:batch,id',
            'jumlah' => 'required|integer|min:1',
            'catatan' => 'nullable|string',
            'tanggal' => 'required|date',
        ]);

        $batch = Batch::findOrFail($request->batch_id);
        $produk = Produk::findOrFail($request->produk_id);
        $user = Auth::user();
        $jumlah = $request->jumlah;

        if ($batch->produk_id !== $produk->id) {
            return response()->json([
                'success' => false,
                'message' => 'Batch tidak sesuai dengan produk yang dipilih'
            ], 422);
        }

        // Validasi: stok batch cukup
        if ($batch->stok_saat_ini < $jumlah) {
            return response()->json([
                'success' => false,
                'message' => "Stok batch tidak mencukupi! Stok batch saat ini: {$batch->stok_saat_ini}/{$batch->kapasitas}"
            ], 422);
        }

        DB::beginTransaction();

        try {
            // Kurangi isi batch (barang keluar dari sistem)
            $stokBatchSebelum = $batch->stok_saat_ini;
            $batch->stok_saat_ini -= $jumlah;
            $batch->save();

            // Stok produk TIDAK diubah
            $stokProduk = $produk->stok;

            // Catat transaksi
            $transaksi = StokTransaksi::create([
                'produk_id' => $produk->id,
                'batch_id' => $batch->id,
                'tipe' => 'keluar',
                'scan_mode' => 'batch',
                'jumlah' => $jumlah,
                'stok_sebelum' => $stokBatchSebelum,
                'stok_sesudah' => $batch->stok_saat_ini,
                'catatan' => $request->catatan . " (Batch #{$batch->id}: {$batch->stok_saat_ini}/{$batch->kapasitas})",
                'tanggal' => $request->tanggal,
                'user_id' => $user->id,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Stok keluar dari batch. Batch #{$batch->id}: {$batch->stok_saat_ini}/{$batch->kapasitas}",
                'data' => [
                    'produk' => $produk->fresh(),
                    'batch' => $batch->fresh(),
                    'transaksi' => $transaksi,
                    'stok_batch_baru' => $batch->stok_saat_ini,
                    'stok_produk_tetap' => $stokProduk,
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal keluar dari batch: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengurangi stok: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Riwayat transaksi stok
     */
    public function history(Request $request)
    {
        $request->validate([
            'produk_id' => 'nullable|exists:produk,id',
            'batch_id' => 'nullable|exists:batch,id',
            'tipe' => 'nullable|in:masuk,keluar',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $query = StokTransaksi::with(['produk', 'user', 'batch']);

        // Filter produk
        if ($request->produk_id) {
            $query->where('produk_id', $request->produk_id);
        }

        if ($request->batch_id) {
            $query->where('batch_id', $request->batch_id);
        }

        // Filter tipe
        if ($request->tipe) {
            $query->where('tipe', $request->tipe);
        }

        // Filter tanggal
        if ($request->start_date) {
            $query->where('tanggal', '>=', $request->start_date);
        }
        if ($request->end_date) {
            $query->where('tanggal', '<=', $request->end_date);
        }

        // Urutkan dari yang terbaru
        $query->orderBy('tanggal', 'desc');
        $query->orderBy('created_at', 'desc');

        $perPage = $request->per_page ?? 15;
        $history = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $history,
        ]);
    }

    /**
     * Get detail transaksi by ID
     */
    public function show($id)
    {
        $transaksi = StokTransaksi::with(['produk', 'user'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $transaksi,
        ]);
    }

    /**
     * Get summary stok (untuk dashboard)
     */
    public function summary()
    {
        $totalMasuk = StokTransaksi::where('tipe', 'masuk')->sum('jumlah');
        $totalKeluar = StokTransaksi::where('tipe', 'keluar')->sum('jumlah');

        // Transaksi hari ini
        $today = now()->toDateString();
        $masukHariIni = StokTransaksi::where('tipe', 'masuk')
            ->whereDate('tanggal', $today)
            ->sum('jumlah');
        $keluarHariIni = StokTransaksi::where('tipe', 'keluar')
            ->whereDate('tanggal', $today)
            ->sum('jumlah');

        // Top 5 produk dengan stok menipis
        $stokMenipis = Produk::where('stok', '<=', 'stok_minimal')
            ->with(['kategori'])
            ->orderBy('stok', 'asc')
            ->limit(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total_masuk' => $totalMasuk,
                'total_keluar' => $totalKeluar,
                'masuk_hari_ini' => $masukHariIni,
                'keluar_hari_ini' => $keluarHariIni,
                'stok_menipis' => $stokMenipis,
                'total_transaksi' => StokTransaksi::count(),
            ]
        ]);
    }
}