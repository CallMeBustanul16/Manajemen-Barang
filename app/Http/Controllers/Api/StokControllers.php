<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Produk;
use App\Models\StokTransaksi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StokControllers extends Controller
{
    /**
     * Tambah stok (Stok Masuk)
     */
    public function masuk(Request $request)
    {
        $request->validate([
            'produk_id' => 'required|exists:produk,id',
            'jumlah' => 'required|integer|min:1',
            'catatan' => 'nullable|string',
            'tanggal' => 'required|date',
        ]);

        $produk = Produk::findOrFail($request->produk_id);
        $user = Auth::user();

        // Mulai transaksi database
        DB::beginTransaction();

        try {
            $stokSebelum = $produk->stok;
            $stokSesudah = $stokSebelum + $request->jumlah;

            // Update stok produk
            $produk->stok = $stokSesudah;
            $produk->save();

            // Catat transaksi
            $transaksi = StokTransaksi::create([
                'produk_id' => $produk->id,
                'tipe' => 'masuk',
                'jumlah' => $request->jumlah,
                'stok_sebelum' => $stokSebelum,
                'stok_sesudah' => $stokSesudah,
                'catatan' => $request->catatan,
                'tanggal' => now(),
                'user_id' => $user->id,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Stok berhasil ditambahkan',
                'data' => [
                    'produk' => $produk->fresh(['kategori']),
                    'transaksi' => $transaksi,
                    'stok_baru' => $stokSesudah,
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
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
            'jumlah' => 'required|integer|min:1',
            'catatan' => 'nullable|string',
            'tanggal' => 'required|date',
        ]);

        $produk = Produk::findOrFail($request->produk_id);

        // Cek stok mencukupi
        if ($produk->stok < $request->jumlah) {
            throw ValidationException::withMessages([
                'jumlah' => ['Stok tidak mencukupi! Stok saat ini: ' . $produk->stok]
            ]);
        }

        $user = Auth::user();

        DB::beginTransaction();

        try {
            $stokSebelum = $produk->stok;
            $stokSesudah = $stokSebelum - $request->jumlah;

            // Update stok produk
            $produk->stok = $stokSesudah;
            $produk->save();

            // Catat transaksi
            $transaksi = StokTransaksi::create([
                'produk_id' => $produk->id,
                'tipe' => 'keluar',
                'jumlah' => $request->jumlah,
                'stok_sebelum' => $stokSebelum,
                'stok_sesudah' => $stokSesudah,
                'catatan' => $request->catatan,
                'tanggal' => now(),
                'user_id' => $user->id,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Stok berhasil dikurangi',
                'data' => [
                    'produk' => $produk->fresh(['kategori']),
                    'transaksi' => $transaksi,
                    'stok_baru' => $stokSesudah,
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
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
            'tipe' => 'nullable|in:masuk,keluar',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $query = StokTransaksi::with(['produk', 'user']);

        // Filter produk
        if ($request->produk_id) {
            $query->where('produk_id', $request->produk_id);
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