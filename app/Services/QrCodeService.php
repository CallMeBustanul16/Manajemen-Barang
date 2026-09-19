<?php

namespace App\Services;

use Endroid\QrCode\QrCode;                        
use Endroid\QrCode\Writer\PngWriter;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;           
use Endroid\QrCode\RoundBlockSizeMode;             
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class QrCodeService
{
    public function slugifyFilename($nama, $prefix = '')
    {
        $slug = Str::slug($nama, '-');
        
        $slug = substr($slug, 0, 50);
        
        if ($prefix) {
            $slug = $prefix . '-' . $slug;
        }
        
        return $slug;
    }

    public function generateBatchQr($batchId, $produkId): string
    {
        return 'BATCH-' . $produkId . '-' . $batchId . '-' . Str::random(6);
    }

    public function generateProdukQr($produkId): string
    {
        return 'PRODUK-' . $produkId . '-' . Str::random(8);
    }

    public function saveQrImage($data, $path): bool
    {
        try {
            if (!is_dir(dirname($path))) {
                mkdir(dirname($path), 0777, true);
            }

            // Buat object QrCode
            $qrCode = new QrCode(
                data: $data,
                encoding: new Encoding('UTF-8'),
                errorCorrectionLevel: ErrorCorrectionLevel::High,
                size: 300,
                margin: 10,
                roundBlockSizeMode: RoundBlockSizeMode::Margin
            );

            // Tulis QR Code ke PNG
            $writer = new PngWriter();
            $result = $writer->write($qrCode);

            file_put_contents($path, $result->getString());
            return true;
        } catch (\Exception $e) {
            Log::error('QR Code generation failed: ' . $e->getMessage());
            return false;
        }
    }

    public function generateAndSaveBatchQr($batch): string
    {
        $qrCode = $this->generateBatchQr($batch->id, $batch->produk_id);
        
        $namaProduk = $batch->produk->nama_produk ?? 'produk';
        $slug = $this->slugifyFilename($namaProduk, 'batch-' . $batch->id);
        $filename = 'batch-' . $batch->id . '.png';
        $path = storage_path('app/public/qrcodes/' . $filename);

        if (!is_dir(dirname($path))) {
            mkdir(dirname($path), 0777, true);
        }

        $this->saveQrImage($qrCode, $path);
        return $qrCode;
    }

    public function generateAndSaveProdukQr($produk): string
    {
        $qrCode = $this->generateProdukQr($produk->id);

        $slug = $this->slugifyFilename($produk->nama_produk ?? 'produk', 'produk-' . $produk->id);
        $filename = 'produk-' . $produk->id . '.png';
        $path = storage_path('app/public/qrcodes/' . $filename);

        if (!is_dir(dirname($path))) {
            mkdir(dirname($path), 0777, true);
        }

        $this->saveQrImage($qrCode, $path);
        return $qrCode;
    }

    public function deleteQrImage($filename): bool
    {
        $path = storage_path('app/public/qrcodes/' . $filename);
        if (file_exists($path)) {
            return unlink($path);
        }
        return false;
    }

    public function getQrUrl($filename): string
    {
        return asset('storage/qrcodes/' . $filename);
    }
}