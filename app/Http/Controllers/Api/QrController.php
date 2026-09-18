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
        $fileExists = file_exists($path);

        if ($fileExists && $produk->qr_code) {
            return response()->json([
                'success' => false,
                'message' => 'QR Code sudah ada dan file tersedia. Silakan download.',
                'data' => [
                    'qr_code' => $produk->qr_code,
                    'url' => $this->qrService->getQrUrl($filename),
                ]
            ], 422);
        }
        
        // Cek apakah sudah punya QR Code
        if (!$fileExists) {

            // Generate QR Code baru
            $qrCode = $this->qrService->generateProdukQr($produk->id);
            $this->qrService->saveQrImage($qrCode, $path);

            // Update produk dengan qr_code baru
            $produk->qr_code = $qrCode;
            $produk->save();

            return response()->json([
                'success' => true,
                'message' => 'QR Code produk berhasil digenerate ulang',
                'data' => [
                    'qr_code' => $qrCode,
                    'url' => $this->qrService->getQrUrl($filename),
                ]
            ]);
        }

        // Jika file tidak ada, tapi qr_code null (produk belum punya QR)
        if (!$produk->qr_code) {
            $qrCode = $this->qrService->generateProdukQr($produk->id);
            $this->qrService->saveQrImage($qrCode, $path);
            $produk->qr_code = $qrCode;
            $produk->save();

            return response()->json([
                'success' => true,
                'message' => 'QR Code produk berhasil digenerate',
                'data' => [
                    'qr_code' => $qrCode,
                    'url' => $this->qrService->getQrUrl($filename),
                ]
            ]);
        }

        // Fallback
        return response()->json([
            'success' => false,
            'message' => 'Terjadi kesalahan tidak terduga',
        ], 500);
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
        
        $slug = $this->qrService->slugifyFilename($produk->nama_produk, 'produk-' . $produk->id);
        $filename = 'produk-' . $produk->id . '.png';
        $path = storage_path('app/public/qrcodes/' . $filename);
        
        if (!file_exists($path)) {
            return response()->json([
                'success' => false,
                'message' => 'File QR Code tidak ditemukan. Silakan generate ulang'
            ], 404);
        }

        $downloadName = $produk->nama_produk . '.png';
        
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
        
        $namaProduk = $batch->produk->nama_produk ?? 'produk';
        $slug = $this->qrService->slugifyFilename($namaProduk, 'batch-' . $batch->id);
        $filename = 'batch-' . $batch->id . '.png';
        $path = storage_path('app/public/qrcodes/' . $filename);
        
        if (!file_exists($path)) {
            return response()->json([
                'success' => false,
                'message' => 'File QR Code tidak ditemukan'
            ], 404);
        }

        $downloadName = $namaProduk . ' - Batch ' . $batch->id . '.png';
        
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