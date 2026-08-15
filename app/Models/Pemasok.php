<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pemasok extends Model
{
    protected $fillable = ['nama_pemasok', 'alamat', 'telepon', 'email'];

    public function produk()
    {
        return $this->hasMany(Produk::class);
    }
}
