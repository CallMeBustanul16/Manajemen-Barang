<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('batch', function (Blueprint $table) {
            $table->integer('kapasitas')->default(0)->after('jumlah_awal');
        });

        \DB::table('batch')->update([
            'kapasitas' => \DB::raw('jumlah_awal')
        ]);
    }

    public function down(): void
    {
        Schema::table('batch', function (Blueprint $table) {
            $table->dropColumn('kapasitas');
        });
    }
};