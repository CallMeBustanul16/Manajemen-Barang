<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Batch extends Model
{
    protected $table = 'batch';

    protected $fillable = [
        'produk_id',
        'qr_code',
        'jumlah_awal',
        'stok_saat_ini',
        'tanggal_masuk',
        'tanggal_kadaluarsa',
        'lokasi_rak',
    ];

    protected $casts = [
        'tanggal_masuk' => 'date',
        'tanggal_kadaluarsa' => 'date',
        'jumlah_awal' => 'integer',
        'stok_saat_ini' => 'integer',
    ];

    public function addStock($amount)
    {
        $this->stok_saat_ini += $amount;
        $this->save();
    }
    
    public function removeStock($amount)
    {
        if ($this->stok_saat_ini < $amount) {
            throw new \Exception('Stok batch tidak mencukupi');
        }
        $this->stok_saat_ini -= $amount;
        $this->save();
    }

    // Relasi ke Produk
    public function produk()
    {
        return $this->belongsTo(Produk::class);
    }

    // Relasi ke StokTransaksi
    public function stokTransaksi()
    {
        return $this->hasMany(StokTransaksi::class);
    }

    // Cek apakah batch masih memiliki stok
    public function hasStock(): bool
    {
        return $this->stok_saat_ini > 0;
    }

    // Ambil stok tersisa
    public function remainingStock(): int
    {
        return $this->stok_saat_ini;
    }
}