<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'name' => 'Admin Master',
                'password' => Hash::make('12345678'),
                'role' => User::ROLE_SUPER_ADMIN,
                'company_id' => null,
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
    }
}