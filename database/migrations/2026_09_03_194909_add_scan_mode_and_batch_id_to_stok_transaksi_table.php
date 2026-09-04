<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stok_transaksi', function (Blueprint $table) {
            $table->enum('scan_mode', ['batch', 'produk'])->nullable()->after('tipe');
            $table->foreignId('batch_id')->nullable()->constrained('batch')->onDelete('set null')->after('produk_id');
            
            // Index untuk performa query
            $table->index('scan_mode');
            $table->index('batch_id');
        });
    }

    public function down(): void
    {
        Schema::table('stok_transaksi', function (Blueprint $table) {
            $table->dropForeign(['batch_id']);
            $table->dropColumn(['scan_mode', 'batch_id']);
        });
    }
};