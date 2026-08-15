<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProdukSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $produk = [
            [
                'nama_produk' => 'Smartphone XYZ',
                'deskripsi' => 'Smartphone terbaru dengan fitur canggih.',
                'harga' => 5000000.00,
                'sku' => 'XYZ123',
                'stok' => 50,
                'stok_minimal' => 5,
                'kategori_id' => 1, // Elektronik
                'pemasok_id' => 1, // PT. Elektronik Sejahtera
            ],
            [
                'nama_produk' => 'Baju Kemeja Pria',
                'deskripsi' => 'Kemeja pria dengan bahan berkualitas.',
                'harga' => 200000.00,
                'sku' => 'KEMEJA001',
                'stok' => 100,
                'stok_minimal' => 10,
                'kategori_id' => 2, // Pakaian
                'pemasok_id' => 2, // CV. Fashion Terbaru
            ],
            [
                'nama_produk' => 'Cokelat Premium',
                'deskripsi' => 'Cokelat premium dengan rasa lezat.',
                'harga' => 150000.00,
                'sku' => 'COKELAT001',
                'stok' => 200,
                'stok_minimal' => 20,
                'kategori_id' => 3, // Makanan & Minuman
                'pemasok_id' => 3, // PT. Makanan & Minuman Nusantara
            ],
            [
                'nama_produk' => 'Lipstik Matte',
                'deskripsi' => 'Lipstik matte dengan warna tahan lama.',
                'harga' => 100000.00,
                'sku' => 'LIPSTIK001',
                'stok' => 150,
                'stok_minimal' => 15,
                'kategori_id' => 4, // Kecantikan & Perawatan Diri
                'pemasok_id' => 2, // CV. Fashion Terbaru
            ],
            [
                'nama_produk' => 'Buku Pelajaran Matematika',
                'deskripsi' => 'Buku pelajaran matematika untuk tingkat sekolah menengah.',
                'harga' => 75000.00,
                'sku' => 'BUKU001',
                'stok' => 80,
                'stok_minimal' => 8,
                'kategori_id' => 5, // Buku & Alat Tulis
                'pemasok_id' => 3, // PT. Makanan & Minuman Nusantara
            ],
        ];

        foreach ($produk as $item) {
            \App\Models\Produk::create($item);
        }
    }
}
