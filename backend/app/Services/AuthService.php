<?php

namespace App\Services;

use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function register(array $data): User
    {
        $roleName = $data['role'] ?? 'user';
        $role = Role::firstWhere('name', $roleName);

        if (!$role) {
            // Fallback to user if specified role doesn't exist
            $role = Role::firstWhere('name', 'user');
        }

        if (!$role) {
            throw new \Exception('Default role not found. Please run RoleSeeder.');
        }

        return User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role_id' => $role->id,
        ]);
    }
}
