<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminRole = Role::where('name', 'admin')->first();
        $makerRole = Role::where('name', 'quiz_maker')->first();

        User::create([
            'name' => 'Admin',
            'email' => 'admin@test.com',
            'password' => Hash::make('12345678'),
            'role_id' => $adminRole->id
        ]);

        User::create([
            'name' => 'Quiz Maker',
            'email' => 'maker@test.com',
            'password' => Hash::make('12345678'),
            'role_id' => $makerRole->id
        ]);
    }
}
