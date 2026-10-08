<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\StokTransaksi;
use App\Models\Produk;
use App\Models\User;
use Carbon\Carbon;

class StokTransaksiSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::first() ?? User::factory()->create();
        $products = Produk::all();

        if ($products->isEmpty()) {
            return;
        }

        // Hapus transaksi lama jika ada
        StokTransaksi::truncate();

        // Riwayat transaksi 7 hari terakhir
        $history = [
            // 7 Hari Lalu
            [
                'days_ago' => 6,
                'items' => [
                    ['tipe' => 'masuk', 'jumlah' => 24, 'prod' => 'Smartphone XYZ', 'jam' => '08:30'],
                    ['tipe' => 'keluar', 'jumlah' => 12, 'prod' => 'Baju Kemeja Pria', 'jam' => '14:15'],
                ]
            ],
            // 6 Hari Lalu
            [
                'days_ago' => 5,
                'items' => [
                    ['tipe' => 'masuk', 'jumlah' => 28, 'prod' => 'Cokelat Premium', 'jam' => '09:10'],
                    ['tipe' => 'keluar', 'jumlah' => 16, 'prod' => 'Lipstik Matte', 'jam' => '13:40'],
                ]
            ],
            // 5 Hari Lalu
            [
                'days_ago' => 4,
                'items' => [
                    ['tipe' => 'masuk', 'jumlah' => 26, 'prod' => 'Buku Pelajaran Matematika', 'jam' => '10:00'],
                    ['tipe' => 'keluar', 'jumlah' => 14, 'prod' => 'Smartphone XYZ', 'jam' => '16:20'],
                ]
            ],
            // 4 Hari Lalu
            [
                'days_ago' => 3,
                'items' => [
                    ['tipe' => 'masuk', 'jumlah' => 32, 'prod' => 'Baju Kemeja Pria', 'jam' => '09:45'],
                    ['tipe' => 'keluar', 'jumlah' => 18, 'prod' => 'Cokelat Premium', 'jam' => '15:10'],
                ]
            ],
            // 3 Hari Lalu
            [
                'days_ago' => 2,
                'items' => [
                    ['tipe' => 'masuk', 'jumlah' => 36, 'prod' => 'Lipstik Matte', 'jam' => '08:15'],
                    ['tipe' => 'keluar', 'jumlah' => 15, 'prod' => 'Buku Pelajaran Matematika', 'jam' => '11:50'],
                ]
            ],
            // Kemarin
            [
                'days_ago' => 1,
                'items' => [
                    ['tipe' => 'masuk', 'jumlah' => 30, 'prod' => 'Smartphone XYZ', 'jam' => '08:50'],
                    ['tipe' => 'keluar', 'jumlah' => 12, 'prod' => 'Baju Kemeja Pria', 'jam' => '14:20'],
                ]
            ],
            // Hari Ini
            [
                'days_ago' => 0,
                'items' => [
                    ['tipe' => 'masuk', 'jumlah' => 20, 'prod' => 'Mouse Wireless', 'jam' => '08:17', 'catatan' => 'Restock reguler supplier'],
                    ['tipe' => 'masuk', 'jumlah' => 15, 'prod' => 'Keyboard Logitech', 'jam' => '09:00', 'catatan' => 'Pengiriman supplier tahap 2'],
                    ['tipe' => 'keluar', 'jumlah' => 5, 'prod' => 'Kabel HDMI', 'jam' => '06:23', 'catatan' => 'Pesanan divisi IT kantor'],
                    ['tipe' => 'keluar', 'jumlah' => 13, 'prod' => 'Cokelat Premium', 'jam' => '11:15', 'catatan' => 'Pengiriman cabang barat'],
                ]
            ]
        ];

        foreach ($history as $h) {
            $baseDate = Carbon::today()->subDays($h['days_ago']);

            foreach ($h['items'] as $item) {
                $prod = $products->firstWhere('nama_produk', $item['prod']) ?? $products->first();
                if (!$prod) continue;

                $stokSebelum = $prod->stok;
                $stokSesudah = $item['tipe'] === 'masuk' ? $stokSebelum + $item['jumlah'] : max(0, $stokSebelum - $item['jumlah']);

                $tanggal = Carbon::parse($baseDate->toDateString() . ' ' . $item['jam'] . ':00');

                StokTransaksi::create([
                    'produk_id' => $prod->id,
                    'batch_id' => null,
                    'tipe' => $item['tipe'],
                    'jumlah' => $item['jumlah'],
                    'stok_sebelum' => $stokSebelum,
                    'stok_sesudah' => $stokSesudah,
                    'catatan' => $item['catatan'] ?? ($item['tipe'] === 'masuk' ? 'Barang masuk persediaan' : 'Pengeluaran barang'),
                    'tanggal' => $tanggal,
                    'user_id' => $admin->id,
                    'created_at' => $tanggal,
                    'updated_at' => $tanggal,
                ]);
            }
        }
    }
}
