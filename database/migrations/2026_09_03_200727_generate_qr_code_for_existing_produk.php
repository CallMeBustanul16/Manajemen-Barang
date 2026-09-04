<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Produk;
use App\Services\QrCodeService;

return new class extends Migration
{
    public function up(): void
    {
        $qrService = new QrCodeService();
        
        // Ambil produk yang belum punya QR Code
        $produk = Produk::whereNull('qr_code')->get();
        
        foreach ($produk as $item) {
            // Generate QR Code untuk setiap produk
            $qrCode = $qrService->generateProdukQr($item->id);
            
            // Simpan QR Code ke storage
            $filename = 'produk-' . $item->id . '.png';
            $path = storage_path('app/public/qrcodes/' . $filename);
            
            if (!is_dir(dirname($path))) {
                mkdir(dirname($path), 0777, true);
            }
            
            $qrService->saveQrImage($qrCode, $path);
            
            // Update produk dengan qr_code
            $item->qr_code = $qrCode;
            $item->save();
        }
    }

    public function down(): void
    {
        // Tidak perlu rollback
    }
};