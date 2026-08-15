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
        Schema::create('sisa_stok', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['in', 'out']);
            $table->unsignedInteger('quantity');
            $table->dateTime('date');
            $table->text('note')->nullable();
            $table->timestamps();

            // Foreign key constraint
            $table->foreignId('produk_id')->constrained('produk')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sisa_stok');
    }
};
