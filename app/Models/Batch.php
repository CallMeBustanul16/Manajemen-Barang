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
        'kapasitas',
        'tanggal_masuk',
        'tanggal_kadaluarsa',
        'lokasi_rak',
    ];

    protected $casts = [
        'tanggal_masuk' => 'date',
        'tanggal_kadaluarsa' => 'date',
        'jumlah_awal' => 'integer',
        'kapasitas' => 'integer',
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

    // Cek apakah batch masih bisa diisi
    public function bisaDiisi(): bool
    {
        return $this->stok_saat_ini < $this->kapasitas;
    }

    // Sisa kapasitas
    public function sisaKapasitas(): int
    {
        return $this->kapasitas - $this->stok_saat_ini;
    }

    public function kosong(): bool
    {
        return $this->stok_saat_ini <= 0;
    }

    /**
     * Cek apakah batch penuh
     */
    public function penuh(): bool
    {
        return $this->stok_saat_ini >= $this->kapasitas;
    }

    /**
     * Tambah isi batch (dengan validasi kapasitas)
     * 
     * @param int $jumlah
     * @return bool
     * @throws \Exception
     */
    public function tambahIsi(int $jumlah): bool
    {
        if ($jumlah <= 0) {
            throw new \Exception('Jumlah harus lebih dari 0');
        }

        if ($this->stok_saat_ini + $jumlah > $this->kapasitas) {
            throw new \Exception(
                'Melebihi kapasitas batch! Sisa kapasitas: ' . $this->sisaKapasitas()
            );
        }

        $this->stok_saat_ini += $jumlah;
        $this->save();

        return true;
    }

    /**
     * Kurangi isi batch (dengan validasi stok)
     * 
     * @param int $jumlah
     * @return bool
     * @throws \Exception
     */
    public function kurangiIsi(int $jumlah): bool
    {
        if ($jumlah <= 0) {
            throw new \Exception('Jumlah harus lebih dari 0');
        }

        if ($this->stok_saat_ini < $jumlah) {
            throw new \Exception(
                'Stok batch tidak mencukupi! Stok saat ini: ' . $this->stok_saat_ini
            );
        }

        $this->stok_saat_ini -= $jumlah;
        $this->save();

        return true;
    }

    /**
     * Format tampilan stok
     */
    public function getStokFormatAttribute(): string
    {
        return $this->stok_saat_ini . '/' . $this->kapasitas;
    }
}