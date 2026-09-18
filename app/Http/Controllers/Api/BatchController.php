<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Batch;
use App\Models\Produk;
use App\Models\StokTransaksi;
use App\Services\QrCodeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class BatchController extends Controller
{
    protected $qrService;

    public function __construct(QrCodeService $qrService)
    {
        $this->qrService = $qrService;
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

        // Cek produk
        $produk = Produk::find($request->produk_id);
        if (!$produk) {
            return response()->json([
                'success' => false,
                'message' => 'Produk tidak ditemukan'
            ], 404);
        }

        // Buat batch
        $batch = Batch::create([
            'produk_id' => $request->produk_id,
            'jumlah_awal' => $request->jumlah_awal,
            'stok_saat_ini' => $request->jumlah_awal,
            'tanggal_masuk' => $request->tanggal_masuk,
            'lokasi_rak' => $request->lokasi_rak,
            'qr_code' => Str::uuid(),
        ]);

        // Generate QR Code
        $qrCode = $this->qrService->generateAndSaveBatchQr($batch);
        $batch->qr_code = $qrCode;
        $batch->save();

        // Update stok produk (tambah stok dari batch baru)
        $produk->stok += $request->jumlah_awal;
        $produk->save();

        return response()->json([
            'success' => true,
            'message' => 'Batch berhasil ditambahkan',
            'data' => [
                'batch' => $batch,
                'produk' => $produk,
                'qr_code_url' => $this->qrService->getQrUrl('batch-' . $batch->id . '.png')
            ]
        ], 201);
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