<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Akun Admin
        User::create([
            'name' => 'Admin',
            'email' => 'admin06@gmail.com',
            'password' => Hash::make('admin123456'),
            'role' => 'admin',
        ]);

        // Akun Staff
        User::create([
            'name' => 'Staff Gudang',
            'email' => 'staff@gmail.com',
            'password' => Hash::make('staff123'),
            'role' => 'staff',
        ]);

        // Akun Manajer
        User::create([
            'name' => 'Manager',
            'email' => 'manager@gmail.com',
            'password' => Hash::make('manager123'),
            'role' => 'manager',
        ]);
    }
}