<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Produk extends Model
{
    protected $table = 'produk';
    protected $fillable = [
        'nama_produk',
        'deskripsi',
        'sku',
        'qr_code',
        'stok',
        'stok_minimal',
        'kategori_id',
        'pemasok_id'
    ];
    protected $casts = [
        'stok' => 'integer',
        'stok_minimal' => 'integer',
    ];

    public function kategori()
    {
        return $this->belongsTo(Kategori::class);
    }

    public function pemasok()
    {
        return $this->belongsTo(Pemasok::class);
    }

    public function batch()
    {
        return $this->hasMany(Batch::class);
    }

    public function stokTransaksi()
    {
        return $this->hasMany(StokTransaksi::class);
    }

    public function totalStokDariBatch()
    {
        return $this->batch()->sum('stok_saat_ini');
    }

    public function hasQrCode(): bool
    {
        return !is_null($this->qr_code);
    }
}
