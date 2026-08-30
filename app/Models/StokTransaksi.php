<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StokTransaksi extends Model
{
    protected $table = 'stok_transaksi';

    protected $fillable = [
        'produk_id',
        'tipe',
        'jumlah',
        'stok_sebelum',
        'stok_sesudah',
        'catatan',
        'tanggal',
        'user_id',
    ];

    protected $casts = [
        'tanggal' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function produk()
    {
        return $this->belongsTo(Produk::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}