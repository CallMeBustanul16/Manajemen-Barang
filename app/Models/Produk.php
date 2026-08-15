<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Produk extends Model
{
    protected $fillable = ['nama_produk', 'deskripsi', 'harga', 'sku', 'stok', 'stok_minimal', 'kategori_id', 'pemasok_id'];

    public function kategori()
    {
        return $this->belongsTo(Kategori::class);
    }

    public function pemasok()
    {
        return $this->belongsTo(Pemasok::class);
    }
}
