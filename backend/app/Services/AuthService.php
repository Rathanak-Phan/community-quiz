<?php

namespace App\Services;

use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function register(array $data): User
    {
        $requestedRole = $data['role'] ?? 'user';
        
        // If they register as a maker, they start as a user but with pending status
        $isMakerRequest = $requestedRole === 'quiz_maker';
        
        $role = \App\Models\Role::firstWhere('name', 'user');

        if (!$role) {
            throw new \Exception('Default user role not found. Please run RoleSeeder.');
        }

        return User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role_id' => $role->id,
            'maker_status' => $isMakerRequest ? 'pending' : 'none',
        ]);
    }
}
