<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('batch', function (Blueprint $table) {
            $table->id();
            $table->foreignId('produk_id')->constrained('produk')->onDelete('cascade');
            $table->string('qr_code')->unique();
            $table->integer('jumlah_awal')->default(0);
            $table->integer('stok_saat_ini')->default(0);
            $table->date('tanggal_masuk');
            $table->string('lokasi_rak')->nullable();
            $table->timestamps();

            // Index untuk performa query
            $table->index('produk_id');
            $table->index('qr_code');
            $table->index('tanggal_masuk');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('batch');
    }
};