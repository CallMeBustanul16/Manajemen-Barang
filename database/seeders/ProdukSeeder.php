<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Produk;

class ProdukSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $produk = [
            // Kategori 1: Elektronik (kategori_id: 1, pemasok_id: 1)
            [
                'nama_produk' => 'Smartphone XYZ',
                'deskripsi' => 'Smartphone flagship terbaru dengan prosesor kencang.',
                'sku' => 'ELK-SMART-001',
                'stok' => 48,
                'stok_minimal' => 10,
                'kategori_id' => 1,
                'pemasok_id' => 1,
            ],
            [
                'nama_produk' => 'Mouse Wireless',
                'deskripsi' => 'Mouse wireless ergonomis 2.4GHz.',
                'sku' => 'ELK-MOUSE-002',
                'stok' => 4,
                'stok_minimal' => 10,
                'kategori_id' => 1,
                'pemasok_id' => 1,
            ],
            [
                'nama_produk' => 'Keyboard Logitech',
                'deskripsi' => 'Mechanical keyboard silent switch.',
                'sku' => 'ELK-KEYB-003',
                'stok' => 7,
                'stok_minimal' => 15,
                'kategori_id' => 1,
                'pemasok_id' => 1,
            ],
            [
                'nama_produk' => 'Kabel HDMI',
                'deskripsi' => 'Kabel HDMI 2.1 Ultra High Speed 4K 120Hz.',
                'sku' => 'ELK-HDMI-004',
                'stok' => 2,
                'stok_minimal' => 10,
                'kategori_id' => 1,
                'pemasok_id' => 1,
            ],
            [
                'nama_produk' => 'Power Bank',
                'deskripsi' => 'Power bank 20.000 mAh fast charging 22.5W.',
                'sku' => 'ELK-PB-005',
                'stok' => 8,
                'stok_minimal' => 20,
                'kategori_id' => 1,
                'pemasok_id' => 1,
            ],
            [
                'nama_produk' => 'Baterai AA Alkaline',
                'deskripsi' => 'Baterai ukuran AA tahan bocor.',
                'sku' => 'ELK-BAT-006',
                'stok' => 0,
                'stok_minimal' => 10,
                'kategori_id' => 1,
                'pemasok_id' => 1,
            ],

            // Kategori 2: Pakaian (kategori_id: 2, pemasok_id: 2)
            [
                'nama_produk' => 'Baju Kemeja Pria',
                'deskripsi' => 'Kemeja katun pria lengan panjang casual & formal.',
                'sku' => 'PKN-KMJ-001',
                'stok' => 102,
                'stok_minimal' => 15,
                'kategori_id' => 2,
                'pemasok_id' => 2,
            ],
            [
                'nama_produk' => 'Celana Chino Slim Fit',
                'deskripsi' => 'Celana panjang katun twill stretch.',
                'sku' => 'PKN-CHN-002',
                'stok' => 45,
                'stok_minimal' => 10,
                'kategori_id' => 2,
                'pemasok_id' => 2,
            ],

            // Kategori 3: Makanan & Minuman (kategori_id: 3, pemasok_id: 3)
            [
                'nama_produk' => 'Cokelat Premium',
                'deskripsi' => 'Dark chocolate artisan 70% kakao murni.',
                'sku' => 'MKN-CKL-001',
                'stok' => 187,
                'stok_minimal' => 25,
                'kategori_id' => 3,
                'pemasok_id' => 3,
            ],
            [
                'nama_produk' => 'Kopi Arabika Gayo',
                'deskripsi' => 'Biji kopi sangrai specialty Aceh Gayo 250gr.',
                'sku' => 'MKN-KOP-002',
                'stok' => 65,
                'stok_minimal' => 15,
                'kategori_id' => 3,
                'pemasok_id' => 3,
            ],

            // Kategori 4: Kecantikan & Perawatan Diri (kategori_id: 4, pemasok_id: 2)
            [
                'nama_produk' => 'Lipstik Matte',
                'deskripsi' => 'Lipstik velvet matte tahan hingga 12 jam.',
                'sku' => 'KCT-LIP-001',
                'stok' => 134,
                'stok_minimal' => 20,
                'kategori_id' => 4,
                'pemasok_id' => 2,
            ],
            [
                'nama_produk' => 'Serum Wajah Hydrating',
                'deskripsi' => 'Serum hyaluronic acid 2% mencerahkan dan melembabkan.',
                'sku' => 'KCT-SRM-002',
                'stok' => 50,
                'stok_minimal' => 15,
                'kategori_id' => 4,
                'pemasok_id' => 2,
            ],

            // Kategori 5: Buku & Alat Tulis (kategori_id: 5, pemasok_id: 3)
            [
                'nama_produk' => 'Buku Pelajaran Matematika',
                'deskripsi' => 'Buku kurikulum merdeka edisi revisi terbaru.',
                'sku' => 'BAT-MAT-001',
                'stok' => 76,
                'stok_minimal' => 15,
                'kategori_id' => 5,
                'pemasok_id' => 3,
            ],
            [
                'nama_produk' => 'Toner Printer',
                'deskripsi' => 'Cartridge toner laserjet monokrom hitam pekat.',
                'sku' => 'BAT-TNR-002',
                'stok' => 5,
                'stok_minimal' => 10,
                'kategori_id' => 5,
                'pemasok_id' => 3,
            ],
            [
                'nama_produk' => 'Kertas HVS A4 80gr',
                'deskripsi' => 'Kertas fotocopy putih premium isi 500 lembar.',
                'sku' => 'BAT-HVS-003',
                'stok' => 0,
                'stok_minimal' => 5,
                'kategori_id' => 5,
                'pemasok_id' => 3,
            ],
        ];

        foreach ($produk as $item) {
            Produk::updateOrCreate(['sku' => $item['sku']], $item);
        }
    }
}
