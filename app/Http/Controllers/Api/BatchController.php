<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Batch;
use App\Models\Produk;
use App\Models\StokTransaksi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class BatchController extends Controller
{
    protected $qrService;

    public function __construct()
    {
        // Resolve by name so this controller remains compatible with projects
        // where the service is not available to the IDE's type indexer.
        $this->qrService = app()->make('App\\Services\\QrCodeService');
    }

    /**
     * GET /api/batch
     * Daftar semua batch
     */
    public function index()
    {
        $batch = Batch::with(['produk'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $batch,
        ]);
    }

    /**
     * POST /api/batch
     * Tambah batch baru (otomatis generate QR)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'produk_id' => 'required|exists:produk,id',
            'jumlah_awal' => 'required|integer|min:1',
            'tanggal_masuk' => 'required|date',
            'lokasi_rak' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $produk = Produk::findOrFail($request->produk_id);
        $user = Auth::user();
        $jumlahAwal = $request->jumlah_awal;

        if ($produk->stok < $jumlahAwal) {
            return response()->json([
                'success' => false,
                'message' => "Stok produk tidak mencukupi! Stok gudang saat ini: {$produk->stok}, dibutuhkan: {$jumlahAwal}"
            ], 422);
        }

        DB::beginTransaction();

        try {
            // Buat batch baru
            $batch = Batch::create([
                'produk_id' => $request->produk_id,
                'jumlah_awal' => $jumlahAwal,
                'kapasitas' => $jumlahAwal,
                'stok_saat_ini' => $jumlahAwal,
                'tanggal_masuk' => $request->tanggal_masuk,
                'lokasi_rak' => $request->lokasi_rak,
                'qr_code' => Str::uuid(),
            ]);

            // Generate QR Code
            $qrCode = $this->qrService->generateAndSaveBatchQr($batch);
            $batch->qr_code = $qrCode;
            $batch->save();

            // Kurangi stok produk
            $stokSebelum = $produk->stok;
            $produk->stok -= $jumlahAwal;
            $produk->save();

            // Stok transaksi
            $transaksi = StokTransaksi::create([
                'batch_id' => $batch->id,
                'produk_id' => $produk->id,
                'tipe' => 'masuk',
                'scan_mode' => 'batch',
                'user_id' => $user->id,
                'jumlah' => -$jumlahAwal,
                'stok_sebelum' => $stokSebelum,
                'stok_sesudah' => $produk->stok,
                'catatan' => 'Batch baru dibuat (QR: ' . $qrCode . ')',
                'tanggal' => now(),
                'user_id' => $user->id,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Batch berhasil dibuat. Stok produk berkurang {$jumlahAwal}, batch terisi {$jumlahAwal}/{$batch->kapasitas}",
                'data' => [
                    'batch' => $batch->load('produk'),
                    'produk' => $produk->fresh(),
                    'transaksi' => $transaksi,
                    'qr_url' => $this->qrService->getQrUrl('batch-' . $batch->id . '.png'),
                    'stok_produk_baru' => $produk->stok,
                ]
            ], 201);
    
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal tambah batch: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambah batch: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/batch/{id}
     * Detail batch
     */
    public function show($id)
    {
        $batch = Batch::with(['produk'])->find($id);

        if (!$batch) {
            return response()->json([
                'success' => false,
                'message' => 'Batch tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $batch,
        ]);
    }

    /**
     * PUT /api/batch/{id}
     * Update batch
     */
    public function update(Request $request, $id)
    {
        $batch = Batch::find($id);

        if (!$batch) {
            return response()->json([
                'success' => false,
                'message' => 'Batch tidak ditemukan'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'lokasi_rak' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $batch->update($request->only(['lokasi_rak']));

        return response()->json([
            'success' => true,
            'message' => 'Batch berhasil diupdate',
            'data' => $batch->load('produk'),
        ]);
    }

    /**
     * DELETE /api/batch/{id}
     * Hapus batch
     */
    public function destroy($id)
    {
        $batch = Batch::find($id);

        if (!$batch) {
            return response()->json([
                'success' => false,
                'message' => 'Batch tidak ditemukan'
            ], 404);
        }

        // Hapus stok produk
        $produk = Produk::find($batch->produk_id);
        if ($produk) {
            $produk->stok -= $batch->stok_saat_ini;
            $produk->save();
        }

        // Hapus file QR
        $this->qrService->deleteQrImage('batch-' . $batch->id . '.png');

        $batch->delete();

        return response()->json([
            'success' => true,
            'message' => 'Batch berhasil dihapus',
        ]);
    }

    /**
     * GET /api/batch/scan/{qrCode}
     * Cari batch berdasarkan QR Code
     */
    public function scan($qrCode)
    {
        // Cari di batch
        $batch = Batch::with(['produk'])->where('qr_code', $qrCode)->first();

        if ($batch) {
            return response()->json([
                'success' => true,
                'mode' => 'batch',
                'data' => $batch,
            ]);
        }

        // Cari di produk
        $produk = Produk::with(['kategori'])->where('qr_code', $qrCode)->first();

        if ($produk) {
            // Ambil semua batch produk ini
            $batches = Batch::where('produk_id', $produk->id)
                ->where('stok_saat_ini', '>', 0)
                ->orderBy('tanggal_masuk', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'mode' => 'produk',
                'data' => [
                    'produk' => $produk,
                    'batches' => $batches,
                    'total_stok' => $produk->stok,
                ],
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'QR Code tidak ditemukan',
        ], 404);
    }

    /**
     * GET /api/batch/produk/{produkId}/batches
     * Ambil daftar batch untuk produk tertentu
     */
    public function getBatchesByProduk($produkId)
    {
        $produk = Produk::find($produkId);

        if (!$produk) {
            return response()->json([
                'success' => false,
                'message' => 'Produk tidak ditemukan'
            ], 404);
        }

        $batches = Batch::where('produk_id', $produkId)
            ->orderBy('tanggal_masuk', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'produk' => $produk,
                'batches' => $batches,
                'total_stok' => $produk->stok,
            ],
        ]);
    }

        /**
     * GET /api/batch/{id}/history
     * Riwayat transaksi untuk batch tertentu
     */
    public function history($id)
    {
        $batch = Batch::with(['produk'])->find($id);

        if (!$batch) {
            return response()->json([
                'success' => false,
                'message' => 'Batch tidak ditemukan'
            ], 404);
        }

        $history = StokTransaksi::with(['user'])
            ->where('batch_id', $id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'batch' => $batch,
                'history' => $history,
            ]
        ]);
    }
}