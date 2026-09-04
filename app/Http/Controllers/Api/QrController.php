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
        
        // Cek apakah sudah punya QR Code
        if ($produk->qr_code) {
            return response()->json([
                'success' => false,
                'message' => 'Produk sudah memiliki QR Code',
                'data' => [
                    'qr_code' => $produk->qr_code,
                    'url' => $this->qrService->getQrUrl('produk-' . $produk->id . '.png'),
                ]
            ], 422);
        }
        
        // Generate QR Code
        $qrCode = $this->qrService->generateAndSaveProdukQr($produk);
        
        // Update produk
        $produk->qr_code = $qrCode;
        $produk->save();
        
        return response()->json([
            'success' => true,
            'message' => 'QR Code produk berhasil digenerate',
            'data' => [
                'qr_code' => $qrCode,
                'url' => $this->qrService->getQrUrl('produk-' . $produk->id . '.png'),
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
            return response()->json([
                'success' => false,
                'message' => 'Produk belum memiliki QR Code'
            ], 404);
        }
        
        $filename = 'produk-' . $produk->id . '.png';
        $path = storage_path('app/public/qrcodes/' . $filename);
        
        if (!file_exists($path)) {
            return response()->json([
                'success' => false,
                'message' => 'File QR Code tidak ditemukan'
            ], 404);
        }
        
        return response()->download($path, $filename);
    }

    /**
     * Generate QR Code untuk Batch
     */
    public function generateBatchQr($batchId)
    {
        $batch = Batch::findOrFail($batchId);
        
        // Cek apakah sudah punya QR Code
        if ($batch->qr_code) {
            return response()->json([
                'success' => false,
                'message' => 'Batch sudah memiliki QR Code',
                'data' => [
                    'qr_code' => $batch->qr_code,
                    'url' => $this->qrService->getQrUrl('batch-' . $batch->id . '.png'),
                ]
            ], 422);
        }
        
        // Generate QR Code
        $qrCode = $this->qrService->generateAndSaveBatchQr($batch);
        
        // Update batch
        $batch->qr_code = $qrCode;
        $batch->save();
        
        return response()->json([
            'success' => true,
            'message' => 'QR Code batch berhasil digenerate',
            'data' => [
                'qr_code' => $qrCode,
                'url' => $this->qrService->getQrUrl('batch-' . $batch->id . '.png'),
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
            return response()->json([
                'success' => false,
                'message' => 'Batch belum memiliki QR Code'
            ], 404);
        }
        
        $filename = 'batch-' . $batch->id . '.png';
        $path = storage_path('app/public/qrcodes/' . $filename);
        
        if (!file_exists($path)) {
            return response()->json([
                'success' => false,
                'message' => 'File QR Code tidak ditemukan'
            ], 404);
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