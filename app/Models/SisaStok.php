<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SisaStok extends Model
{
    protected $fillable = ['type', 'quantity', 'date', 'note', 'produk_id'];

    public function produk()
    {
        return $this->belongsTo(Produk::class);
    }
}
