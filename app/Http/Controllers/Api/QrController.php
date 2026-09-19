<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Batch;
use App\Models\Produk;
use App\Services\QrCodeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class QrController extends Controller
{
    protected $qrService;

    public function __construct(QrCodeService $qrService)
    {
        $this->qrService = $qrService;
    }

    /**
     * Generate QR Code untuk Produk
     */
    public function generateProdukQr($produkId)
    {
        $produk = Produk::findOrFail($produkId);

        $filename = 'produk-' . $produk->id . '.png';
        $path = storage_path('app/public/qrcodes/' . $filename);

        if (!$produk->qr_code) {
            $produk->qr_code = $this->qrService->generateProdukQr($produk->id);
            $produk->save();
        }

        if (!file_exists($path)) {
            $this->qrService->saveQrImage($produk->qr_code, $path);
        }

        return response()->json([
            'success' => true,
            'message' => 'QR Code produk tersedia',
            'data' => [
                'qr_code' => $produk->qr_code,
                'url' => $this->qrService->getQrUrl($filename),
            ]
        ]);
    }

    /**
     * Download QR Code Produk
     */
    public function downloadProdukQr($produkId)
    {
        $produk = Produk::findOrFail($produkId);

        if (!$produk->qr_code) {
            $produk->qr_code = $this->qrService->generateProdukQr($produk->id);
            $produk->save();
        }

        $filename = 'produk-' . $produk->id . '.png';
        $path = storage_path('app/public/qrcodes/' . $filename);

        if (!file_exists($path)) {
            $this->qrService->saveQrImage($produk->qr_code, $path);
        }

        return response()->download($path, $filename);
    }

    /**
     * Generate QR Code untuk Batch
     */
    public function generateBatchQr($batchId)
    {
        $batch = Batch::findOrFail($batchId);
        $filename = 'batch-' . $batch->id . '.png';
        $path = storage_path('app/public/qrcodes/' . $filename);

        if (!$batch->qr_code) {
            $batch->qr_code = $this->qrService->generateAndSaveBatchQr($batch);
            $batch->save();
        } elseif (!file_exists($path)) {
            $this->qrService->saveQrImage($batch->qr_code, $path);
        }

        return response()->json([
            'success' => true,
            'message' => 'QR Code batch tersedia',
            'data' => [
                'qr_code' => $batch->qr_code,
                'url' => $this->qrService->getQrUrl($filename),
            ]
        ]);
    }

    /**
     * Download QR Code Batch
     */
    public function downloadBatchQr($batchId)
    {
        $batch = Batch::findOrFail($batchId);

        if (!$batch->qr_code) {
            $batch->qr_code = $this->qrService->generateAndSaveBatchQr($batch);
            $batch->save();
        }

        $filename = 'batch-' . $batch->id . '.png';
        $path = storage_path('app/public/qrcodes/' . $filename);

        if (!file_exists($path)) {
            $this->qrService->saveQrImage($batch->qr_code, $path);
        }

        return response()->download($path, $filename);
    }

    /**
     * Hapus QR Code Produk
     */
    public function deleteProdukQr($produkId)
    {
        $produk = Produk::findOrFail($produkId);
        
        if (!$produk->qr_code) {
            return response()->json([
                'success' => false,
                'message' => 'Produk tidak memiliki QR Code'
            ], 404);
        }
        
        // Hapus file
        $filename = 'produk-' . $produk->id . '.png';
        $this->qrService->deleteQrImage($filename);
        
        // Update produk
        $produk->qr_code = null;
        $produk->save();
        
        return response()->json([
            'success' => true,
            'message' => 'QR Code produk berhasil dihapus'
        ]);
    }
}