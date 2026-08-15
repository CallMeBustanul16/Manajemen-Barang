<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('produk', function (Blueprint $table) {
            $table->id();
            $table->string('nama_produk');
            $table->string('deskripsi')->nullable();
            $table->decimal('harga', 10, 2);
            $table->string('sku')->unique();
            $table->integer('stok')->default(0);
            $table->integer('stok_minimal')->default(2);
            $table->timestamps();

            // Foreign key constraints
            $table->foreignId('kategori_id')->constrained('kategori')->onDelete('cascade');
            $table->foreignId('pemasok_id')->constrained('pemasok')->onDelete('cascade');

            // Index
            $table->index('kategori_id');
            $table->index('pemasok_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('produk');
    }
};
