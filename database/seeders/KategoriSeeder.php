<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class KategoriSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $kategori = [
            [
                'nama_kategori' => 'Elektronik',
                'deskripsi' => 'Kategori untuk produk elektronik seperti smartphone, laptop, dan perangkat elektronik lainnya.',
                'slug' => 'elektronik',
            ],
            [
                'nama_kategori' => 'Pakaian',
                'deskripsi' => 'Kategori untuk produk pakaian seperti baju, celana, dan aksesoris fashion.',
                'slug' => 'pakaian',
            ],
            [
                'nama_kategori' => 'Makanan & Minuman',
                'deskripsi' => 'Kategori untuk produk makanan dan minuman, termasuk makanan ringan dan minuman segar.',
                'slug' => 'makanan-minuman',
            ],
            [
                'nama_kategori' => 'Kecantikan & Perawatan Diri',
                'deskripsi' => 'Kategori untuk produk kecantikan dan perawatan diri seperti kosmetik, skincare, dan parfum.',
                'slug' => 'kecantikan-perawatan-diri',
            ],
            [
                'nama_kategori' => 'Buku & Alat Tulis',
                'deskripsi' => 'Kategori untuk produk buku dan alat tulis seperti buku pelajaran, pensil, dan buku gambar.',
                'slug' => 'buku-alat-tulis',
            ],
        ];

        foreach ($kategori as $data) {
            \App\Models\Kategori::create($data);
        }
    }
}
