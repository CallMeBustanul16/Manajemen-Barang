<?php

namespace App\Services;

use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Writer\PngWriter;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\RoundBlockSizeMode;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class QrCodeService
{
    /**
     * Generate QR Code untuk Batch
     */
    public function generateBatchQr($batchId, $produkId): string
    {
        return 'BATCH-' . $produkId . '-' . $batchId . '-' . Str::random(6);
    }

    /**
     * Generate QR Code untuk Produk
     */
    public function generateProdukQr($produkId): string
    {
        return 'PRODUK-' . $produkId . '-' . Str::random(8);
    }

    /**
     * Buat gambar QR Code dan simpan ke storage
     */
    public function saveQrImage($data, $path): bool
    {
        try {
            $builder = new Builder(
                writer: new PngWriter(),
                data: $data,
                encoding: new Encoding('UTF-8'),
                errorCorrectionLevel: ErrorCorrectionLevel::High,
                size: 300,
                margin: 10,
                roundBlockSizeMode: RoundBlockSizeMode::Margin
            );

            $result = $builder->build();
            file_put_contents($path, $result->getString());
            return true;
        } catch (\Exception $e) {
            Log::error('QR Code generation failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Generate dan simpan QR Code untuk Batch
     */
    public function generateAndSaveBatchQr($batch): string
    {
        $qrCode = $this->generateBatchQr($batch->id, $batch->produk_id);
        $filename = 'batch-' . $batch->id . '.png';
        $path = storage_path('app/public/qrcodes/' . $filename);
        
        if (!is_dir(dirname($path))) {
            mkdir(dirname($path), 0777, true);
        }
        
        $this->saveQrImage($qrCode, $path);
        return $qrCode;
    }

    /**
     * Generate dan simpan QR Code untuk Produk
     */
    public function generateAndSaveProdukQr($produk): string
    {
        $qrCode = $this->generateProdukQr($produk->id);
        $filename = 'produk-' . $produk->id . '.png';
        $path = storage_path('app/public/qrcodes/' . $filename);
        
        if (!is_dir(dirname($path))) {
            mkdir(dirname($path), 0777, true);
        }
        
        $this->saveQrImage($qrCode, $path);
        return $qrCode;
    }

    /**
     * Hapus file QR Code
     */
    public function deleteQrImage($filename): bool
    {
        $path = storage_path('app/public/qrcodes/' . $filename);
        if (file_exists($path)) {
            return unlink($path);
        }
        return false;
    }

    /**
     * Get path QR Code (untuk akses publik)
     */
    public function getQrUrl($filename): string
    {
        return asset('storage/qrcodes/' . $filename);
    }
}