<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PemasokSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $pemasok = [
            [
                'nama_pemasok' => 'PT. Elektronik Sejahtera',
                'alamat' => 'Jl. Elektronik No. 123, Jakarta',
                'email' => 'info@elektroniksejahtera.com',
                'telepon' => '081234567890',
            ],
            [
                'nama_pemasok' => 'CV. Fashion Terbaru',
                'alamat' => 'Jl. Fashion No. 456, Bandung',
                'email' => 'info@fashionterbaru.com',
                'telepon' => '082345678901',
            ],
            [
                'nama_pemasok' => 'PT. Makanan & Minuman Nusantara',
                'alamat' => 'Jl. Makanan No. 789, Surabaya',
                'email' => 'info@makananminumannusantara.com',
                'telepon' => '083456789012',
            ],
        ];

        foreach ($pemasok as $data) {
            \App\Models\Pemasok::create($data);
        }
    }
}
