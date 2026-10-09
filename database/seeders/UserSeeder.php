<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Akun Admin Utama
        User::firstOrCreate(
            ['email' => 'admin06@gmail.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('admin123456'),
                'role' => 'admin',
            ]
        );
    }
}