<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StokTransaksi extends Model
{
    protected $table = 'stok_transaksi';

    protected $fillable = [
        'produk_id',
        'batch_id',
        'tipe',
        'scan_mode',
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

    public function batch()
    {
        return $this->belongsTo(Batch::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scopeScanMode($query, $mode)
    {
        return $query->where('scan_mode', $mode);
    }

    public function scopeBatch($query, $batchId)
    {
        return $query->where('batch_id', $batchId);
    }
}